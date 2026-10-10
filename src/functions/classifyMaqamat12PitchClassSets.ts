import TuningSystem from "@/models/TuningSystem";
import MaqamData, { Maqam } from "@/models/Maqam";
import PitchClass from "@/models/PitchClass";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { getIpnReferenceNoteName } from "@/functions/getIpnReferenceNoteName";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";

/**
 * Represents a 12-pitch-class set created from al-Kindi base with replacements
 */
export interface PitchClassSet {
  /** Map of IPN reference note name (C, C#, D, etc.) to pitch class */
  pitchClasses: Map<string, PitchClass>;
  /** The 12 IPN reference note names in order */
  ipnReferenceNames: string[];
}

/**
 * Represents a maqam transposition with its compatibility status
 */
export interface MaqamTranspositionInfo {
  maqam: Maqam;
  maqamData: MaqamData;
  isCompatible: boolean;
}

/**
 * Represents a classification set grouping compatible maqamat
 */
export interface ClassificationSet {
  id: string;
  name: string;
  sourceMaqam: {
    id: string;
    idName: string;
    name: string;
  };
  sourceTransposition: Maqam;
  pitchClassSet: PitchClassSet;
  compatibleMaqamat: MaqamTranspositionInfo[];
}

/**
 * A note in a key clash: its own name and spelling, its cents, and its position
 * above the maqām's tonic once octave is ignored (what a 12-pitch-class set
 * compares).
 */
export interface KeyClashNote {
  noteName: string;
  englishName: string;
  cents: number;
  centsInOctave: number;
}

/**
 * A 12-EDO key that two or more different pitches of a maqām would need.
 */
export interface KeyClash {
  key: string;
  notes: KeyClashNote[];
}

/**
 * A maqām transposition that does not fit a 12-pitch-class set: the keys its
 * pitches would share, and the same in one plain sentence.
 */
export interface IncompatibleMaqam {
  maqam: MaqamData;
  transposition: Maqam | null;
  reason: "shared_key";
  clashes: KeyClash[];
  explanation: string;
}

/**
 * The keys a maqām transposition's pitches would have to share in a
 * 12-pitch-class set (both directions together, octave ignored), after the
 * maqām-context key rule has given every pitch its own key where it can.
 * Empty when the transposition fits.
 */
export function findKeyClashes(transposition: Maqam): KeyClash[] {
  const sequences = { ascending: transposition.ascendingPitchClasses, descending: transposition.descendingPitchClasses };
  const keyed = [
    ...renderPitchClassSpellings(transposition.ascendingPitchClasses, true, sequences),
    ...renderPitchClassSpellings(transposition.descendingPitchClasses, false, sequences),
  ];
  const tonicCents = parseFloat(transposition.ascendingPitchClasses[0].cents);
  // Same pitch identity the set compares: cents within the octave, to 1e-6
  const pitchOf = (cents: number) => {
    const inOctave = Math.round(((((cents - tonicCents) % 1200) + 1200) % 1200) * 1e6) / 1e6;
    return inOctave >= 1200 ? 0 : inOctave;
  };
  const byKey = new Map<string, Map<number, KeyClashNote[]>>();
  for (const pc of keyed) {
    const key = getIpnReferenceNoteName(pc);
    const pitch = pitchOf(parseFloat(pc.cents));
    const pitches = byKey.get(key) ?? byKey.set(key, new Map()).get(key)!;
    const notes = pitches.get(pitch) ?? pitches.set(pitch, []).get(pitch)!;
    if (!notes.some((note) => note.noteName === pc.noteName)) {
      notes.push({
        noteName: pc.noteName,
        englishName: pc.englishName,
        cents: Math.round(parseFloat(pc.cents) * 10) / 10,
        centsInOctave: Math.round(pitch * 10) / 10,
      });
    }
  }
  return [...byKey.entries()]
    .filter(([, pitches]) => pitches.size > 1)
    .map(([key, pitches]) => ({
      key,
      notes: [...pitches.entries()].sort((a, b) => a[0] - b[0]).flatMap(([, notes]) => notes),
    }));
}

/**
 * One plain sentence for a set of key clashes:
 * "jawāb buzurk (E-b5) and jawāb būselīk (E4) both need the E key, and the
 * keys next to it are taken."
 */
export function describeKeyClashes(clashes: KeyClash[]): string {
  const clauses = clashes.map((clash) => {
    // one name per distinct pitch (a note and its octave are one pitch)
    const byPitch = new Map<number, KeyClashNote>();
    for (const note of clash.notes) if (!byPitch.has(note.centsInOctave)) byPitch.set(note.centsInOctave, note);
    const names = [...byPitch.values()].map((note) => `${note.noteName} (${note.englishName})`);
    const list = names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    return `${list} ${names.length <= 2 ? "both" : "all"} need the ${clash.key} key`;
  });
  return `${clauses.join("; ")}, and the keys next to ${clashes.length === 1 ? "it" : "them"} are taken.`;
}

/**
 * Classification result containing all sets and incompatible maqamat
 */
export interface ClassificationResult {
  sets: ClassificationSet[];
  incompatibleMaqamat: IncompatibleMaqam[];
}

/**
 * Checks if a pitch class is chromatic (not microtonal).
 * Chromatic pitch classes have englishName matching pattern: [A-G][#b]?[0-9]+
 * Examples: C3, D#3, Eb2 (chromatic) vs D-#3, E-b3, Bb+2 (microtonal)
 *
 * @param englishName - The English name of the pitch class (IPN notation)
 * @returns true if chromatic, false if microtonal
 */
function isChromatic(englishName: string): boolean {
  // Pattern: Natural letter + optional single sharp/flat + octave number
  return /^[A-G][#b]?\d+$/.test(englishName);
}

/**
 * Extracts the IPN reference from an englishName field.
 * Uses the englishName directly to identify chromatic pitch classes:
 * - Naturals: A, B, C, D, E, F, G (no accidentals)
 * - Full sharps: A#, C#, D#, F#, G# (single # symbol)
 * - Full flats: Ab, Bb, Db, Eb, Gb (single b symbol)
 *
 * Normalizes flat spellings to sharp spellings for standard 12-tone representation.
 *
 * @param englishName - The English name (e.g., "C3", "D#3", "Eb2")
 * @returns The IPN reference (e.g., "C", "D#", "D#") normalized to sharps
 */
function extractIpnFromEnglishName(englishName: string): string {
  // Match letter + optional single sharp/flat (no quarter tone modifiers)
  const match = englishName.match(/^([A-G][#b]?)\d+$/);
  if (!match) return "";

  const ipn = match[1];

  // Normalize flat spellings to sharp spellings for standard 12-tone representation
  const flatToSharp: {[key: string]: string} = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#"
  };

  return flatToSharp[ipn] || ipn;
}

/**
 * Extracts chromatic pitch classes from a tuning system grouped by IPN reference.
 * Filters out microtonal pitch classes (half-sharps, half-flats, etc.)
 * Uses englishName field to identify chromatic pitch classes and extract IPN references.
 *
 * @param tuningSystem - The tuning system to extract from
 * @param startingNote - The starting note for the tuning system
 * @returns Map of IPN reference to array of chromatic pitch classes
 */
function extractChromaticPitchClasses(
  tuningSystem: TuningSystem,
  startingNote: string
): Map<string, PitchClass[]> {
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  const chromaticPitchClassMap = new Map<string, PitchClass[]>();

  for (const pitchClass of allPitchClasses) {
    // Check if this pitch class is chromatic by examining englishName
    if (isChromatic(pitchClass.englishName)) {
      // Extract IPN reference directly from englishName (not from referenceNoteName field)
      const ipnRef = extractIpnFromEnglishName(pitchClass.englishName);

      if (ipnRef) {
        if (!chromaticPitchClassMap.has(ipnRef)) {
          chromaticPitchClassMap.set(ipnRef, []);
        }
        chromaticPitchClassMap.get(ipnRef)!.push(pitchClass);
      }
    }
  }

  return chromaticPitchClassMap;
}

/**
 * Checks if a tuning system has all 12 chromatic pitch classes.
 *
 * @param chromaticPitchClassMap - Map of IPN reference to chromatic pitch classes
 * @returns true if all 12 chromatic IPN references are present
 */
function hasAll12ChromaticPitchClasses(
  chromaticPitchClassMap: Map<string, PitchClass[]>
): boolean {
  const requiredIPNs = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  for (const ipn of requiredIPNs) {
    if (!chromaticPitchClassMap.has(ipn) || chromaticPitchClassMap.get(ipn)!.length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Builds a base 12-pitch-class set from chromatic pitch classes of a tuning system.
 * Similar to getAlKindi12PitchClasses but works with any tuning system's chromatic subset.
 *
 * @param chromaticPitchClassMap - Map of IPN reference to chromatic pitch classes
 * @param preferredOctaveRange - Optional octave range preference
 * @returns PitchClassSet with 12 chromatic pitch classes
 */
function buildBase12FromChromaticPitchClasses(
  chromaticPitchClassMap: Map<string, PitchClass[]>,
  preferredOctaveRange?: { min: number; max: number }
): PitchClassSet {
  const pitchClassMap = new Map<string, PitchClass>();
  const ipnReferenceNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  // For each IPN reference, select the best pitch class
  for (const [ipnRef, pitchClasses] of chromaticPitchClassMap.entries()) {
    let selected: PitchClass;

    if (preferredOctaveRange) {
      // Prefer pitch classes from the preferred octave range
      const inRange = pitchClasses.filter(
        pc => pc.octave >= preferredOctaveRange.min && pc.octave <= preferredOctaveRange.max
      );

      if (inRange.length > 0) {
        // Sort by octave (ascending), then by cents (ascending)
        inRange.sort((a, b) => {
          if (a.octave !== b.octave) return a.octave - b.octave;
          return parseFloat(a.cents) - parseFloat(b.cents);
        });
        selected = inRange[0];
      } else {
        // Fall back to closest octave
        pitchClasses.sort((a, b) => {
          const aDist = Math.abs(a.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          const bDist = Math.abs(b.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          if (Math.abs(aDist - bDist) < 0.1) {
            // If same distance, prefer lower octave, then lower cents
            if (a.octave !== b.octave) return a.octave - b.octave;
            return parseFloat(a.cents) - parseFloat(b.cents);
          }
          return aDist - bDist;
        });
        selected = pitchClasses[0];
      }
    } else {
      // No preference - use first occurrence (lowest octave, then lowest cents)
      pitchClasses.sort((a, b) => {
        if (a.octave !== b.octave) return a.octave - b.octave;
        return parseFloat(a.cents) - parseFloat(b.cents);
      });
      selected = pitchClasses[0];
    }

    pitchClassMap.set(ipnRef, selected);
  }

  return {
    pitchClasses: pitchClassMap,
    ipnReferenceNames
  };
}

/**
 * Gets the 12 pitch classes from alkindi_874 on ushayran
 * and maps them by IPN reference note name, preferring a specific octave range
 */
export function getAlKindi12PitchClasses(
  tuningSystem: TuningSystem,
  startingNote: string,
  preferredOctaveRange?: { min: number; max: number }
): PitchClassSet {
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  
  // Get unique 12 pitch classes by IPN reference (one per chromatic position)
  const pitchClassMap = new Map<string, PitchClass>();
  const ipnReferenceNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  // Group pitch classes by IPN reference
  const ipnRefGroups = new Map<string, PitchClass[]>();
  for (const pitchClass of allPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    if (!ipnRefGroups.has(ipnRef)) {
      ipnRefGroups.set(ipnRef, []);
    }
    ipnRefGroups.get(ipnRef)!.push(pitchClass);
  }
  
  // For each IPN reference, select the best pitch class
  for (const [ipnRef, pitchClasses] of ipnRefGroups.entries()) {
    let selected: PitchClass;
    
    if (preferredOctaveRange) {
      // Prefer pitch classes from the preferred octave range
      const inRange = pitchClasses.filter(
        pc => pc.octave >= preferredOctaveRange.min && pc.octave <= preferredOctaveRange.max
      );
      
      if (inRange.length > 0) {
        // Sort by octave (ascending), then by cents (ascending)
        inRange.sort((a, b) => {
          if (a.octave !== b.octave) return a.octave - b.octave;
          return parseFloat(a.cents) - parseFloat(b.cents);
        });
        selected = inRange[0];
      } else {
        // Fall back to closest octave
        pitchClasses.sort((a, b) => {
          const aDist = Math.abs(a.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          const bDist = Math.abs(b.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          if (Math.abs(aDist - bDist) < 0.1) {
            // If same distance, prefer lower octave, then lower cents
            if (a.octave !== b.octave) return a.octave - b.octave;
            return parseFloat(a.cents) - parseFloat(b.cents);
          }
          return aDist - bDist;
        });
        selected = pitchClasses[0];
      }
    } else {
      // No preference - use first occurrence (lowest octave, then lowest cents)
      pitchClasses.sort((a, b) => {
        if (a.octave !== b.octave) return a.octave - b.octave;
        return parseFloat(a.cents) - parseFloat(b.cents);
      });
      selected = pitchClasses[0];
    }
    
    pitchClassMap.set(ipnRef, selected);
  }
  
  return {
    pitchClasses: pitchClassMap,
    ipnReferenceNames
  };
}

/**
 * Gets all transpositions of a maqam in the specified tuning system
 */
export function getMaqamTranspositions(
  maqamData: MaqamData,
  tuningSystem: TuningSystem,
  startingNote: string,
  ajnas: any[]
): Maqam[] {
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  return calculateMaqamTranspositions(allPitchClasses, ajnas, maqamData, true, 5);
}

/**
 * Creates a 12-pitch-class set suitable for MIDI keyboard tuning and Scala export.
 *
 * Priority order for base pitch classes:
 * 1. Extract chromatic subset from the maqam's own tuning system (if all 12 chromatic pitch classes present)
 * 2. Fall back to alkindi_874 as filler (if maqam's tuning system lacks complete chromatic set)
 *
 * Then merges pitch classes from the maqam transposition with the base set based on matching
 * IPN references. The resulting set is ordered chromatically starting from the maqam's tonic.
 *
 * IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
 * correctly and pitch classes can be properly selected from matching octaves to maintain
 * ascending chromatic order.
 *
 * @param maqamTransposition - The maqam transposition to build the set from
 * @param maqamTuningSystem - The tuning system used by the maqam
 * @param maqamStartingNote - Starting note for the maqam's tuning system
 * @param alKindiTuningSystem - al-Kindi tuning system for fallback filler pitch classes
 * @param alKindiStartingNote - Starting note for al-Kindi (must match maqam's starting note)
 * @returns PitchClassSet with 12 chromatically ordered pitch classes, or null if incompatible
 *
 * Returns null if the maqam has duplicate IPN references (same IPN appearing with different
 * pitch values), which makes it incompatible with 12-tone chromatic tuning.
 */
export function create12PitchClassSet(
  maqamTransposition: Maqam,
  maqamTuningSystem: TuningSystem,
  maqamStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string
): PitchClassSet | null {
  // A 12-pitch-class set holds every pitch of the maqām on its own key, so both
  // directions are keyed together: each note gets one spelling and one key for
  // both calls, and clashes are settled by the maqām-context rule (octave
  // ignored; repeated until settled — see renderPitchClassSpellings).
  const pitchClassSetSequences = {
    ascending: maqamTransposition.ascendingPitchClasses,
    descending: maqamTransposition.descendingPitchClasses,
  };

  const ascendingWithSequentialRefs = renderPitchClassSpellings(
    maqamTransposition.ascendingPitchClasses,
    true,
    pitchClassSetSequences
  );
  const descendingWithSequentialRefs = renderPitchClassSpellings(
    maqamTransposition.descendingPitchClasses,
    false,
    pitchClassSetSequences
  );
  
  // Collect all pitch classes from ascending and descending sequences (now with consistent reference notes)
  const allMaqamPitchClasses = [
    ...ascendingWithSequentialRefs,
    ...descendingWithSequentialRefs
  ];
  
  // Determine the octave range of the maqam's pitch classes
  const maqamOctaves = allMaqamPitchClasses.map(pc => pc.octave);
  const minOctave = Math.min(...maqamOctaves);
  const maxOctave = Math.max(...maqamOctaves);

  // Try to extract chromatic 12-pitch-class set from the maqam's own tuning system first
  let basePitchClassSet: PitchClassSet;
  let baseTuningSystemForOctaveAdjustment: TuningSystem;
  let baseStartingNote: string;
  let usedChromaticExtraction: boolean; // Track whether we used chromatic extraction

  const maqamChromaticPitchClasses = extractChromaticPitchClasses(
    maqamTuningSystem,
    maqamStartingNote
  );

  if (hasAll12ChromaticPitchClasses(maqamChromaticPitchClasses)) {
    // SUCCESS: Maqam's tuning system has all 12 chromatic pitch classes
    // Use it as the base instead of al-Kindi
    basePitchClassSet = buildBase12FromChromaticPitchClasses(
      maqamChromaticPitchClasses,
      { min: minOctave, max: maxOctave }
    );
    baseTuningSystemForOctaveAdjustment = maqamTuningSystem;
    baseStartingNote = maqamStartingNote;
    usedChromaticExtraction = true; // Flag that we're using chromatic extraction
  } else {
    // FALLBACK: Maqam's tuning system lacks complete chromatic set
    // Fall back to alkindi_874 as filler
    basePitchClassSet = getAlKindi12PitchClasses(
      alKindiTuningSystem,
      alKindiStartingNote,
      { min: minOctave, max: maxOctave }
    );
    baseTuningSystemForOctaveAdjustment = alKindiTuningSystem;
    baseStartingNote = alKindiStartingNote;
    usedChromaticExtraction = false; // Using al-Kindi fallback
  }
  
  // Map IPN reference to pitch classes from maqam
  const maqamIpnMap = new Map<string, PitchClass[]>();
  
  for (const pitchClass of allMaqamPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    if (!maqamIpnMap.has(ipnRef)) {
      maqamIpnMap.set(ipnRef, []);
    }
    maqamIpnMap.get(ipnRef)!.push(pitchClass);
  }
  
  // Check for duplicate IPN references with different pitch class values (incompatible)
  // A maqam is incompatible if the same IPN reference appears with different pitch class values
  // (e.g., C at 0 cents in ascending and C at 50 cents in descending)
  for (const pitchClasses of maqamIpnMap.values()) {
    if (pitchClasses.length > 1) {
      // Normalize cents to same octave (modulo 1200) for comparison
      // Handle negative values properly: ((x % 1200) + 1200) % 1200
      const normalizeCents = (cents: number): number => {
        const normalized = ((cents % 1200) + 1200) % 1200;
        // Round to 6 decimal places to handle floating point precision issues
        return Math.round(normalized * 1000000) / 1000000;
      };
      
      const firstCentsNormalized = normalizeCents(parseFloat(pitchClasses[0].cents));
      
      // Check if all pitch classes with this IPN reference have the same normalized cents value
      // Use exact equality after rounding to handle floating point precision
      const allSame = pitchClasses.every(
        (pc) => {
          const pcCentsNormalized = normalizeCents(parseFloat(pc.cents));
          return pcCentsNormalized === firstCentsNormalized;
        }
      );
      
      if (!allSame) {
        // Multiple pitch classes with same IPN reference but different values - incompatible
        return null;
      }
    }
  }
  
  // Create new set by replacing matching IPN references
  const newPitchClassMap = new Map<string, PitchClass>();

  // Start with base pitch class set (from maqam's tuning system or al-Kindi fallback)
  for (const [ipnRef, pitchClass] of basePitchClassSet.pitchClasses.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }

  // Replace with maqam pitch classes where IPN reference matches
  // Use ascending first, then descending for any IPN refs not in ascending
  // Use the pitch classes with sequential reference notes applied
  // IMPORTANT: Only include pitch classes that match the chromatic nature of the base set
  // If base set uses chromatic pitch classes, only include chromatic maqam pitch classes
  const ascendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of ascendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);

    // If base is chromatic, only include chromatic pitch classes from maqam
    const shouldInclude = !usedChromaticExtraction || isChromatic(pitchClass.englishName);

    // Only add if this IPN ref exists in base pitch class set and passes chromatic check
    if (basePitchClassSet.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef) && shouldInclude) {
      ascendingIpnMap.set(ipnRef, pitchClass);
    }
  }

  const descendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of descendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);

    // If base is chromatic, only include chromatic pitch classes from maqam
    const shouldInclude = !usedChromaticExtraction || isChromatic(pitchClass.englishName);

    // Only add if this IPN ref exists in base pitch class set and not already in ascending
    if (basePitchClassSet.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef) && !descendingIpnMap.has(ipnRef) && shouldInclude) {
      descendingIpnMap.set(ipnRef, pitchClass);
    }
  }
  
  // Replace: ascending takes priority, then descending
  for (const [ipnRef, pitchClass] of ascendingIpnMap.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }

  for (const [ipnRef, pitchClass] of descendingIpnMap.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }

  // Adjust octaves to ensure chromatic ascending order from the tuning system
  // Get all pitch classes from base tuning system to have octave options
  const allBasePitchClasses = getTuningSystemPitchClasses(baseTuningSystemForOctaveAdjustment, baseStartingNote);
  const baseByIpn = new Map<string, PitchClass[]>();

  for (const pc of allBasePitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pc);
    if (!baseByIpn.has(ipnRef)) {
      baseByIpn.set(ipnRef, []);
    }
    baseByIpn.get(ipnRef)!.push(pc);
  }

  // Also group maqam pitch classes by IPN for consideration in octave selection
  // IMPORTANT: Only include chromatic pitch classes if base set is chromatic
  const maqamByIpn = new Map<string, PitchClass[]>();

  for (const pc of [...ascendingWithSequentialRefs, ...descendingWithSequentialRefs]) {
    // If base is chromatic, only include chromatic maqam pitch classes
    if (usedChromaticExtraction && !isChromatic(pc.englishName)) {
      continue; // Skip microtonal pitch classes
    }

    const ipnRef = getIpnReferenceNoteName(pc);
    if (!maqamByIpn.has(ipnRef)) {
      maqamByIpn.set(ipnRef, []);
    }
    maqamByIpn.get(ipnRef)!.push(pc);
  }

  // Find tonic (first pitch class from maqam's ascending sequence)
  // Use the actual pitch class with its actual octave and cents (including qarār positions with negative cents)
  const tonicPitchClass = ascendingWithSequentialRefs.length > 0
    ? ascendingWithSequentialRefs[0]
    : null;

  if (!tonicPitchClass) {
    return {
      pitchClasses: newPitchClassMap,
      ipnReferenceNames: basePitchClassSet.ipnReferenceNames
    };
  }

  const tonicIpnRef = getIpnReferenceNoteName(tonicPitchClass);
  const tonicCents = parseFloat(tonicPitchClass.cents);

  // Reorder chromatic sequence starting from tonic
  const chromaticOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const tonicIndex = chromaticOrder.indexOf(tonicIpnRef);
  const reorderedChromatic = [...chromaticOrder.slice(tonicIndex), ...chromaticOrder.slice(0, tonicIndex)];

  // Rebuild map with pitch classes from correct octaves for chromatic ascending order
  // Start with the tonic's actual cents (may be negative for qarār octaves)
  const finalPitchClassMap = new Map<string, PitchClass>();
  let previousCents = tonicCents - 0.01;

  for (let i = 0; i < reorderedChromatic.length; i++) {
    const ipnRef = reorderedChromatic[i];

    // For the first position (tonic), use the actual tonic pitch class from the maqam
    if (i === 0) {
      finalPitchClassMap.set(ipnRef, tonicPitchClass);
      previousCents = tonicCents;
      continue;
    }

    // For subsequent positions, prioritize maqam values over al-Kindi fillers
    // First try maqam candidates that satisfy ascending order requirement
    let selectedPitchClass: PitchClass | null = null;

    // Priority 1: Try maqam pitch classes first (if available)
    if (maqamByIpn.has(ipnRef)) {
      const maqamCandidates = maqamByIpn.get(ipnRef)!;
      const validMaqamCandidates = maqamCandidates
        .filter(pc => parseFloat(pc.cents) > previousCents)
        .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
      
      if (validMaqamCandidates.length > 0) {
        // Use the lowest maqam candidate that maintains ascending order
        selectedPitchClass = validMaqamCandidates[0];
      }
    }

    // Priority 2: Fall back to base tuning system if no maqam candidate satisfies the requirement
    if (!selectedPitchClass && baseByIpn.has(ipnRef)) {
      const baseCandidates = baseByIpn.get(ipnRef)!;
      const validBaseCandidates = baseCandidates
        .filter(pc => parseFloat(pc.cents) > previousCents)
        .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));

      if (validBaseCandidates.length > 0) {
        selectedPitchClass = validBaseCandidates[0];
      } else {
        // Last resort: use lowest base candidate even if it doesn't maintain strict ascending order
        // (shouldn't happen with full tuning system coverage, but handle gracefully)
        const fallback = baseCandidates
          .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents))[0];
        selectedPitchClass = fallback;
      }
    }

    if (selectedPitchClass) {
      finalPitchClassMap.set(ipnRef, selectedPitchClass);
      previousCents = parseFloat(selectedPitchClass.cents);
    }
    // If no candidate found at all, skip this IPN reference (shouldn't happen)
  }

  return {
    pitchClasses: finalPitchClassMap,
    ipnReferenceNames: basePitchClassSet.ipnReferenceNames
  };
}

/**
 * Checks if a maqam transposition can be performed in a 12-pitch-class set
 * by verifying all notes in both ascending and descending sequences match the pitch classes in the set
 * 
 * A maqam is compatible if:
 * 1. All IPN references from the maqam exist in the set
 * 2. The actual pitch class values (cents) match within tolerance
 */
export function checkMaqamCompatibility(
  maqamTransposition: Maqam,
  pitchClassSet: PitchClassSet,
  centsTolerance: number = 5
): boolean {
  
  // Check all pitch classes from ascending sequence
  for (const maqamPitchClass of maqamTransposition.ascendingPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(maqamPitchClass);
    const setPitchClass = pitchClassSet.pitchClasses.get(ipnRef);
    
    if (!setPitchClass) {
      // IPN reference doesn't exist in set
      return false;
    }
    
    // Compare actual pitch class values (cents)
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);
    
    // Normalize to same octave for comparison (cents are relative, so we compare modulo 1200)
    const maqamCentsNormalized = maqamCents % 1200;
    const setCentsNormalized = setCents % 1200;
    
    // Check if they match within tolerance
    const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
    
    if (diffWrapped > centsTolerance) {
      // Pitch class values don't match
      return false;
    }
  }
  
  // Check all pitch classes from descending sequence
  for (const maqamPitchClass of maqamTransposition.descendingPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(maqamPitchClass);
    const setPitchClass = pitchClassSet.pitchClasses.get(ipnRef);
    
    if (!setPitchClass) {
      // IPN reference doesn't exist in set
      return false;
    }
    
    // Compare actual pitch class values (cents)
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);
    
    // Normalize to same octave for comparison (cents are relative, so we compare modulo 1200)
    const maqamCentsNormalized = maqamCents % 1200;
    const setCentsNormalized = setCents % 1200;
    
    // Check if they match within tolerance
    const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
    
    if (diffWrapped > centsTolerance) {
      // Pitch class values don't match
      return false;
    }
  }
  
  return true;
}

/**
 * Main classification function that groups maqamat according to 12-pitch-class sets
 * 
 * The algorithm:
 * 1. Loops through all maqamat and their transpositions
 * 2. For each unprocessed maqam/transposition, creates a 12-pitch-class set
 * 3. Finds all compatible maqamat for that set (only from unprocessed ones)
 * 4. Marks all maqamat in that set as processed
 * 5. Continues to find the next set from remaining unprocessed maqamat
 * 6. Repeats until all maqamat are processed
 */
export function classifyMaqamat(
  maqamat: MaqamData[],
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  ajnas: any[],
  centsTolerance: number = 5
): ClassificationResult {
  const sets: ClassificationSet[] = [];
  const incompatibleMaqamat: IncompatibleMaqam[] = [];
  const processedMaqamat = new Set<string>(); // Track processed maqam/transposition combinations

  // Cache transpositions per maqam. getMaqamTranspositions is deterministic for
  // a fixed (maqamData, tuningSystem, startingNote, ajnas) tuple — the only
  // variable across the nested loops is maqamData — yet it runs thousands of
  // times with identical inputs when many maqamāt survive create12PitchClassSet.
  // Without this cache, the Netlify function hits its timeout.
  const transpositionsCache = new Map<string, Maqam[]>();
  const getCachedTranspositions = (maqamData: MaqamData): Maqam[] => {
    const key = maqamData.getId();
    let cached = transpositionsCache.get(key);
    if (!cached) {
      cached = getMaqamTranspositions(maqamData, cairoTuningSystem, cairoStartingNote, ajnas);
      transpositionsCache.set(key, cached);
    }
    return cached;
  };

  // Continue looping until all maqamat are processed
  let hasUnprocessed = true;
  let iterationCount = 0;
  const maxIterations = 1000; // Safety limit

  while (hasUnprocessed && iterationCount < maxIterations) {
    iterationCount++;
    hasUnprocessed = false;
    let foundNewSet = false;

    // IMPORTANT: Two-pass approach to prioritize tahlil versions globally
    // Pass 1: Process ALL tahlil (non-transposed) versions first
    // Pass 2: Process ALL transposed versions

    for (let pass = 1; pass <= 2; pass++) {
      const processingTahlil = (pass === 1);

      for (const maqamData of maqamat) {
        // Get all transpositions of this maqam (cached)
        const transpositions = getCachedTranspositions(maqamData);

        // Filter based on current pass
        const transpositionsToProcess = processingTahlil
          ? transpositions.filter(t => !t.transposition)  // Pass 1: Only tahlil
          : transpositions.filter(t => t.transposition);   // Pass 2: Only transpositions

        for (const transposition of transpositionsToProcess) {
        // Create unique key for this maqam/transposition combination
        const key = `${maqamData.getId()}_${transposition.name}`;
        
        // Skip if already processed
        if (processedMaqamat.has(key)) {
          continue;
        }
        
        // Found an unprocessed maqam
        hasUnprocessed = true;
        
        // Try to create 12-pitch-class set from this transposition
        const pitchClassSet = create12PitchClassSet(
          transposition,
          cairoTuningSystem,
          cairoStartingNote,
          alKindiTuningSystem,
          alKindiStartingNote
        );
        
        if (!pitchClassSet) {
          // Incompatible: two different pitches would need the same key
          const clashes = findKeyClashes(transposition);
          incompatibleMaqamat.push({
            maqam: maqamData,
            transposition: transposition,
            reason: "shared_key",
            clashes,
            explanation: describeKeyClashes(clashes),
          });
          processedMaqamat.add(key);
          continue;
        }
        
        // Check if this set already exists (compare by pitch class values)
        let existingSet: ClassificationSet | null = null;
        for (const set of sets) {
          if (arePitchClassSetsEqual(pitchClassSet, set.pitchClassSet, centsTolerance)) {
            existingSet = set;
            break;
          }
        }
        
        if (existingSet) {
          // Add this maqam to existing set if it's not already there
          const alreadyInSet = existingSet.compatibleMaqamat.some(
            (info) => info.maqamData.getId() === maqamData.getId() && 
                      info.maqam.name === transposition.name
          );
          
          if (!alreadyInSet) {
            existingSet.compatibleMaqamat.push({
              maqam: transposition,
              maqamData: maqamData,
              isCompatible: true
            });
          }
          processedMaqamat.add(key);
          foundNewSet = true;
        } else {
          // Create new set
          const compatibleMaqamat: MaqamTranspositionInfo[] = [];
          
          // Add source maqam first (it's always compatible since it created the set)
          compatibleMaqamat.push({
            maqam: transposition,
            maqamData: maqamData,
            isCompatible: true
          });
          
          // Check all other maqamat for compatibility with this set
          // Only check unprocessed maqamat to allow for finding multiple distinct sets
          for (const otherMaqamData of maqamat) {
            const otherTranspositions = getCachedTranspositions(otherMaqamData);
            
            for (const otherTransposition of otherTranspositions) {
              const otherKey = `${otherMaqamData.getId()}_${otherTransposition.name}`;
              
              // Skip if already processed or if it's the source maqam
              if (processedMaqamat.has(otherKey) || otherKey === key) {
                continue;
              }
              
              if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
                compatibleMaqamat.push({
                  maqam: otherTransposition,
                  maqamData: otherMaqamData,
                  isCompatible: true
                });
                // Mark as processed when added to this set
                processedMaqamat.add(otherKey);
              }
            }
          }
          
          // Create set name from source maqam transposition
          const setId = `maqam_${maqamData.getIdName()}_set`;
          // Use the transposition name (which may include "maqām" prefix and transposition info)
          const setName = `${transposition.name} set`;
          
          sets.push({
            id: setId,
            name: setName,
            sourceMaqam: {
              id: maqamData.getId(),
              idName: maqamData.getIdName(),
              name: maqamData.getName()
            },
            sourceTransposition: transposition,
            pitchClassSet: pitchClassSet,
            compatibleMaqamat: compatibleMaqamat
          });
          
          // Mark source maqam as processed
          processedMaqamat.add(key);
          foundNewSet = true;
        }
        
        // If we found a new set, break and restart the loop to find the next set
        if (foundNewSet) {
          break;
        }
      }

      // If we found a new set, break from maqamData loop
      if (foundNewSet) {
        break;
      }
    }

    // If we found a new set, break from pass loop and restart iteration
    if (foundNewSet) {
      break;
    }
  }
  }
  
  return {
    sets,
    incompatibleMaqamat
  };
}

/**
 * Whether one maqām transposition fits a 12-pitch-class set, without listing
 * the set's compatible maqāmāt: quick enough to decide whether to offer a
 * 12-pitch-class export. Same transposition rule as fitTwelvePitchClassSet.
 *
 * @param tonicNoteName - Tonic of the transposition to check; null for the maqām's own form
 */
export function checkTwelvePitchClassFit(
  sourceMaqamData: MaqamData,
  tonicNoteName: string | null,
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  ajnas: any[]
):
  | { fits: true; transposition: Maqam; pitchClassSet: PitchClassSet }
  | { fits: false; transposition: Maqam; clashes: KeyClash[]; explanation: string; fittingTonics: string[] } {
  const transpositions = getMaqamTranspositions(sourceMaqamData, cairoTuningSystem, cairoStartingNote, ajnas);
  const transposition =
    tonicNoteName === null
      ? transpositions.find((candidate) => candidate.isBaseForm)
      : transpositions.find((candidate) => candidate.ascendingPitchClasses[0].noteName === tonicNoteName);
  if (!transposition) {
    throw new Error(
      `${sourceMaqamData.getName()} has no transposition on ${tonicNoteName ?? "its own tonic"} in ${cairoTuningSystem.getId()} from ${cairoStartingNote}`
    );
  }

  const setOf = (candidate: Maqam): PitchClassSet | null => {
    const set = create12PitchClassSet(candidate, cairoTuningSystem, cairoStartingNote, alKindiTuningSystem, alKindiStartingNote);
    return set && set.pitchClasses.size === 12 ? set : null;
  };

  const pitchClassSet = setOf(transposition);
  if (pitchClassSet) return { fits: true, transposition, pitchClassSet };

  const clashes = findKeyClashes(transposition);
  const filled = create12PitchClassSet(transposition, cairoTuningSystem, cairoStartingNote, alKindiTuningSystem, alKindiStartingNote);
  return {
    fits: false,
    transposition,
    clashes,
    explanation: clashes.length
      ? describeKeyClashes(clashes)
      : `Only ${filled ? filled.pitchClasses.size : 0} of the 12 keys could be filled.`,
    fittingTonics: transpositions
      .filter((candidate) => candidate !== transposition && setOf(candidate))
      .map((candidate) => candidate.ascendingPitchClasses[0].noteName),
  };
}

/**
 * The result of fitting one maqām transposition to a 12-pitch-class set: the
 * set, or why it does not fit and on which starting notes this maqām does.
 */
export type TwelvePitchClassSetFit =
  | { fits: true; set: ClassificationSet }
  | {
      fits: false;
      transposition: Maqam;
      clashes: KeyClash[];
      explanation: string;
      /** Tonics of this maqām's other transpositions that do fit */
      fittingTonics: string[];
    };

/**
 * Creates the 12-pitch-class set of one maqām transposition: the one asked for,
 * never a substitute. When it does not fit, says why (the keys its pitches
 * would share) and which of the maqām's other transpositions do fit.
 *
 * @param sourceMaqamData - The maqām
 * @param tonicNoteName - Tonic of the transposition to use; null for the maqām's own form
 * @param allMaqamat - All maqāmāt, to list the set's compatible maqāmāt
 * @param cairoTuningSystem - The tuning system for maqāmāt
 * @param cairoStartingNote - The starting note for the tuning system
 * @param alKindiTuningSystem - The al-Kindī tuning system for filler pitches
 * @param alKindiStartingNote - The starting note for al-Kindī (matches cairoStartingNote)
 * @param ajnas - All ajnās data
 * @param centsTolerance - Tolerance for cents comparison (default: 5)
 */
export function fitTwelvePitchClassSet(
  sourceMaqamData: MaqamData,
  tonicNoteName: string | null,
  allMaqamat: MaqamData[],
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  ajnas: any[],
  centsTolerance: number = 5
): TwelvePitchClassSetFit {
  const check = checkTwelvePitchClassFit(
    sourceMaqamData,
    tonicNoteName,
    cairoTuningSystem,
    cairoStartingNote,
    alKindiTuningSystem,
    alKindiStartingNote,
    ajnas
  );
  if (!check.fits) return check;
  const { transposition: sourceMaqam, pitchClassSet } = check;

  // Find all compatible maqāmāt
  const compatibleMaqamat: MaqamTranspositionInfo[] = [];

  // Add source maqam first (it's always compatible since it created the set)
  compatibleMaqamat.push({
    maqam: sourceMaqam,
    maqamData: sourceMaqamData,
    isCompatible: true
  });

  // Check all other maqamat for compatibility with this set
  for (const otherMaqamData of allMaqamat) {
    // Skip the source maqam (already added)
    if (otherMaqamData.getId() === sourceMaqamData.getId()) {
      // But check if other transpositions of the source maqam are compatible
      const otherTranspositions = getMaqamTranspositions(
        otherMaqamData,
        cairoTuningSystem,
        cairoStartingNote,
        ajnas
      );

      for (const otherTransposition of otherTranspositions) {
        // Skip the source transposition itself
        if (otherTransposition.name === sourceMaqam.name) {
          continue;
        }

        if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
          compatibleMaqamat.push({
            maqam: otherTransposition,
            maqamData: otherMaqamData,
            isCompatible: true
          });
        }
      }
    } else {
      // Check all transpositions of other maqamat
      const otherTranspositions = getMaqamTranspositions(
        otherMaqamData,
        cairoTuningSystem,
        cairoStartingNote,
        ajnas
      );

      for (const otherTransposition of otherTranspositions) {
        if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
          compatibleMaqamat.push({
            maqam: otherTransposition,
            maqamData: otherMaqamData,
            isCompatible: true
          });
        }
      }
    }
  }

  // Create set name from source maqam
  const setId = `maqam_${sourceMaqamData.getIdName()}_set`;
  const setName = `${sourceMaqam.name} set`;

  const set: ClassificationSet = {
    id: setId,
    name: setName,
    sourceMaqam: {
      id: sourceMaqamData.getId(),
      idName: sourceMaqamData.getIdName(),
      name: sourceMaqamData.getName()
    },
    sourceTransposition: sourceMaqam,
    pitchClassSet: pitchClassSet,
    compatibleMaqamat: compatibleMaqamat
  };

  return { fits: true, set };
}

/**
 * Compares two pitch class sets for equality
 * Uses the same tolerance as compatibility check to ensure consistency
 */
function arePitchClassSetsEqual(set1: PitchClassSet, set2: PitchClassSet, centsTolerance: number = 5): boolean {
  if (set1.ipnReferenceNames.length !== set2.ipnReferenceNames.length) {
    return false;
  }
  
  for (const ipnRef of set1.ipnReferenceNames) {
    const pc1 = set1.pitchClasses.get(ipnRef);
    const pc2 = set2.pitchClasses.get(ipnRef);
    
    if (!pc1 || !pc2) {
      return false;
    }
    
    // Compare by cents value, normalized to same octave
    const cents1 = parseFloat(pc1.cents) % 1200;
    const cents2 = parseFloat(pc2.cents) % 1200;
    const diff = Math.abs(cents1 - cents2);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
    
    if (diffWrapped > centsTolerance) {
      return false;
    }
  }
  
  return true;
}

