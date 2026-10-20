import TuningSystem from "@/models/TuningSystem";
import MaqamData, { Maqam } from "@/models/Maqam";
import PitchClass from "@/models/PitchClass";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { chooseSetNamesake, maqamFamilyReader, setNamedAfter } from "@/functions/nameClassificationSet";
import { getIpnReferenceNoteName } from "@/functions/getIpnReferenceNoteName";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";

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
  /** The identifier of the member the set is named after, plus "_set" — "maqam_nairuz_set" (see chooseSetNamesake) */
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

/** The same pitch in every octave of a tuning system, lowest first. */
function octavesOf(pitchClass: PitchClass, tuningSystemPitchClasses: PitchClass[]): PitchClass[] {
  const pitch = centsInOctave(parseFloat(pitchClass.cents));
  return tuningSystemPitchClasses
    .filter((pc) => {
      const diff = Math.abs(centsInOctave(parseFloat(pc.cents)) - pitch);
      return Math.min(diff, 1200 - diff) < 1e-6;
    })
    .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
}

/**
 * A pitch class moved to another octave of itself, keeping its spelling: the
 * reference note and deviation stay, and the English name moves by the same
 * number of octaves.
 */
function inOctaveOf(spelling: PitchClass, instance: PitchClass): PitchClass {
  const octaves = Math.round((parseFloat(instance.cents) - parseFloat(spelling.cents)) / 1200);
  if (octaves === 0) return spelling;
  const englishName = spelling.englishName.replace(/-?\d+$/, (octave) => String(parseInt(octave, 10) + octaves));
  const referenceMidiNote = calculateIpnReferenceMidiNote({ ...instance, referenceNoteName: spelling.referenceNoteName });
  const deviation = spelling.centsDeviation ?? 0;
  return {
    ...instance,
    englishName,
    solfege: spelling.solfege,
    referenceNoteName: spelling.referenceNoteName,
    centsDeviation: spelling.centsDeviation,
    midiNoteDeviation: `${referenceMidiNote} ${deviation > 0 ? "+" : ""}${deviation.toFixed(1)}`,
  };
}

/**
 * The maqām's pitch for one key, in the lowest octave above previousCents.
 *
 * candidates are the maqām's own pitch classes on the key, all one pitch once
 * octave is ignored. When none of them lies above previousCents, the same pitch
 * is taken from another octave of the tuning system, in the maqām's spelling.
 */
function maqamPitchAbove(candidates: PitchClass[], previousCents: number, tuningSystemPitchClasses: PitchClass[]): PitchClass {
  const above = candidates
    .filter((pc) => parseFloat(pc.cents) > previousCents)
    .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
  if (above.length > 0) return above[0];

  const instance = octavesOf(candidates[0], tuningSystemPitchClasses).find((pc) => parseFloat(pc.cents) > previousCents);
  // Past the top of the tuning system no octave lies above. The pitch is what
  // the set must hold, so it keeps the maqām's own, out of chromatic order, as
  // a filler would at the same edge.
  if (!instance) return candidates.reduce((a, b) => (parseFloat(b.cents) > parseFloat(a.cents) ? b : a));
  return inOctaveOf(candidates[0], instance);
}

/**
 * The same 12 pitches, listed from one of the set's keys. That key comes first,
 * in the octave chooseFirst picks among its octaves, and each key after it
 * takes its pitch in the lowest octave above the key before, so the list
 * ascends. Each pitch keeps its spelling; only its octave can change.
 *
 * @param pitchClassSet - The set, listed from the tonic it was made from
 * @param startKey - The key to list from
 * @param chooseFirst - Picks the first key's octave from all of its octaves, lowest first
 * @param octaveSources - Every octave of each tuning system the set's pitches come from
 */
function listFromKey(
  pitchClassSet: PitchClassSet,
  startKey: string,
  chooseFirst: (octaves: PitchClass[]) => PitchClass,
  octaveSources: PitchClass[][]
): PitchClassSet {
  // Every octave of a pitch, from the tuning system it came from
  const octaves = (pc: PitchClass) => {
    const source = octaveSources.find((list) =>
      list.some((candidate) => candidate.noteName === pc.noteName && Math.abs(parseFloat(candidate.cents) - parseFloat(pc.cents)) < 1e-6)
    );
    if (!source) throw new Error(`${pc.noteName} is in none of the set's tuning systems`);
    return octavesOf(pc, source);
  };

  const keys = [...pitchClassSet.pitchClasses.keys()];
  const start = keys.indexOf(startKey);
  if (start === -1) throw new Error(`The set has no ${startKey} key`);
  const ordered = [...keys.slice(start), ...keys.slice(0, start)];
  const pitchClasses = new Map<string, PitchClass>();
  let previousCents = -Infinity;
  ordered.forEach((key, i) => {
    const pc = pitchClassSet.pitchClasses.get(key)!;
    const instances = octaves(pc);
    // Past the top of the tuning system no octave lies above: the highest one stays
    const instance = i === 0
      ? chooseFirst(instances)
      : instances.find((candidate) => parseFloat(candidate.cents) > previousCents) ?? instances[instances.length - 1];
    const placed = inOctaveOf(pc, instance);
    pitchClasses.set(key, placed);
    previousCents = parseFloat(placed.cents);
  });

  return { pitchClasses, ipnReferenceNames: pitchClassSet.ipnReferenceNames };
}

/**
 * The same 12 pitches, listed from another tonic: the one the set is named
 * after. The tonic's key comes first, in the tonic's octave, and the list
 * ascends from it as one made from that tonic would.
 *
 * @param tonic - The new tonic's pitch class, which the set holds within centsTolerance
 */
function listFromTonic(
  pitchClassSet: PitchClassSet,
  tonic: PitchClass,
  octaveSources: PitchClass[][],
  centsTolerance: number
): PitchClassSet {
  const tonicCents = parseFloat(tonic.cents);
  const distanceToTonic = (pc: PitchClass) => {
    const diff = Math.abs(centsInOctave(parseFloat(pc.cents)) - centsInOctave(tonicCents));
    return Math.min(diff, 1200 - diff);
  };
  const tonicKey = [...pitchClassSet.pitchClasses.keys()].reduce((a, b) =>
    distanceToTonic(pitchClassSet.pitchClasses.get(b)!) < distanceToTonic(pitchClassSet.pitchClasses.get(a)!) ? b : a
  );
  if (distanceToTonic(pitchClassSet.pitchClasses.get(tonicKey)!) > centsTolerance) {
    throw new Error(`The set does not hold the tonic ${tonic.noteName}`);
  }
  const nearestTonic = (instances: PitchClass[]) =>
    instances.reduce((a, b) => (Math.abs(parseFloat(b.cents) - tonicCents) < Math.abs(parseFloat(a.cents) - tonicCents) ? b : a));
  return listFromKey(pitchClassSet, tonicKey, nearestTonic, octaveSources);
}

/**
 * The same 12 pitches, listed from the C key for Scala (.scl) export, where
 * degree 0 is C. C comes first, in the highest octave at or below the set's
 * first pitch (its tonic), so the tonic and everything above it keep their
 * octave; the list then ascends as listFromKey lays it out.
 *
 * @param pitchClassSet - The set, listed from its tonic
 * @param octaveSources - Every octave of each tuning system the set's pitches come from
 */
export function listTwelvePitchClassSetFromC(pitchClassSet: PitchClassSet, octaveSources: PitchClass[][]): PitchClassSet {
  const tonicCents = parseFloat([...pitchClassSet.pitchClasses.values()][0].cents);
  const atOrBelowTonic = (instances: PitchClass[]) =>
    [...instances].reverse().find((pc) => parseFloat(pc.cents) <= tonicCents + 1e-6) ?? instances[0];
  return listFromKey(pitchClassSet, "C", atOrBelowTonic, octaveSources);
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
  let usedChromaticBase = false; // Whether the base came from the maqām's own tuning system

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
    usedChromaticBase = true;
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
  // Use the pitch classes with sequential reference notes applied.
  // Every pitch of the maqām takes its key, microtonal or not: a chromatic base
  // only fills the keys the maqām leaves empty.
  const ascendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of ascendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);

    // Only add if this IPN ref exists in base pitch class set
    if (basePitchClassSet.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef)) {
      ascendingIpnMap.set(ipnRef, pitchClass);
    }
  }

  const descendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of descendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);

    // Only add if this IPN ref exists in base pitch class set and not already in ascending
    if (basePitchClassSet.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef) && !descendingIpnMap.has(ipnRef)) {
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

  // Every octave of the maqām's tuning system, to place a maqām pitch in the
  // octave the chromatic order needs
  const maqamTuningSystemPitchClasses = usedChromaticBase
    ? allBasePitchClasses
    : getTuningSystemPitchClasses(maqamTuningSystem, maqamStartingNote);

  // Also group maqam pitch classes by IPN for consideration in octave selection.
  // All of them, microtonal ones included: a set that drops one of the maqām's
  // pitches cannot play the maqām (nīm ʿajam lost to ʿajam on A#, for one).
  const maqamByIpn = new Map<string, PitchClass[]>();

  for (const pc of [...ascendingWithSequentialRefs, ...descendingWithSequentialRefs]) {
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

    // Priority 1: a key the maqām uses holds the maqām's pitch, never a filler.
    // The maqām may only have that pitch in another octave (ḥijāz in al-Ṣabbāgh
    // has nīm būselīk only as jawāb nīm būselīk), so take the same pitch in the
    // lowest octave that keeps the order ascending.
    if (maqamByIpn.has(ipnRef)) {
      selectedPitchClass = maqamPitchAbove(maqamByIpn.get(ipnRef)!, previousCents, maqamTuningSystemPitchClasses);
    }

    // Priority 2: a key the maqām leaves empty takes a filler from the base tuning system
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

/** A pitch's place within one octave, 0 to 1200 cents (negative cents fold up). */
function centsInOctave(cents: number): number {
  return ((cents % 1200) + 1200) % 1200;
}

/**
 * Whether a maqām transposition can be played on a 12-pitch-class set: every
 * pitch of its ascending and descending sequences, octave ignored, is within
 * centsTolerance of one of the set's 12 pitches.
 *
 * Only the pitch is compared, never the key it sits on. The set's keys come
 * from the spelling the set was built with, and another maqām can spell the
 * same pitch on a neighbouring key (nīm ʿajam on A in one, on A# in another).
 */
export function checkMaqamCompatibility(
  maqamTransposition: Maqam,
  pitchClassSet: PitchClassSet,
  centsTolerance: number = 5
): boolean {
  const setCents = [...pitchClassSet.pitchClasses.values()].map((pc) => centsInOctave(parseFloat(pc.cents)));

  return [...maqamTransposition.ascendingPitchClasses, ...maqamTransposition.descendingPitchClasses].every((maqamPitchClass) => {
    const maqamCents = centsInOctave(parseFloat(maqamPitchClass.cents));
    return setCents.some((cents) => {
      const diff = Math.abs(maqamCents - cents);
      return Math.min(diff, 1200 - diff) <= centsTolerance;
    });
  });
}

/**
 * Groups maqamat according to 12-pitch-class sets. Each set is named after the
 * transposition that made it; classifyMaqamat then names it after the member
 * chooseSetNamesake picks.
 *
 * The algorithm:
 * 1. Loops through all maqamat and their transpositions
 * 2. For each unprocessed maqam/transposition, creates a 12-pitch-class set
 * 3. Finds all compatible maqamat for that set (only from unprocessed ones)
 * 4. Marks all maqamat in that set as processed
 * 5. Continues to find the next set from remaining unprocessed maqamat
 * 6. Repeats until all maqamat are processed
 */
export function groupMaqamatIn12PitchClassSets(
  maqamat: MaqamData[],
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  ajnas: any[],
  centsTolerance: number = 5
): ClassificationResult & { transpositionsOf: (maqamData: MaqamData) => Maqam[] } {
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
        
        // No existing set can hold this transposition: every set, when it was
        // made, took in every unprocessed transposition that fits it. So it
        // starts a new set, and must fit the set it starts.
        if (!checkMaqamCompatibility(transposition, pitchClassSet, centsTolerance)) {
          throw new Error(`${transposition.name} does not fit the 12-pitch-class set made from it`);
        }

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
        
        // Named after the transposition that made it until every set is made
        sets.push({
          ...setNamedAfter({ maqam: transposition, maqamData }),
          pitchClassSet: pitchClassSet,
          compatibleMaqamat: compatibleMaqamat
        });
        
        // Mark source maqam as processed
        processedMaqamat.add(key);
        foundNewSet = true;
        
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
    incompatibleMaqamat,
    transpositionsOf: getCachedTranspositions
  };
}

/**
 * Main classification function: groups maqamat according to 12-pitch-class sets
 * (groupMaqamatIn12PitchClassSets), then names each set after the member
 * chooseSetNamesake picks and lists its 12 pitches from that member's tonic.
 * Naming changes no set's members or pitches.
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
  const { sets, incompatibleMaqamat, transpositionsOf } = groupMaqamatIn12PitchClassSets(
    maqamat, cairoTuningSystem, cairoStartingNote, alKindiTuningSystem, alKindiStartingNote, ajnas, centsTolerance
  );

  const familyOf = maqamFamilyReader(transpositionsOf);
  const octaveSources = [
    getTuningSystemPitchClasses(cairoTuningSystem, cairoStartingNote),
    getTuningSystemPitchClasses(alKindiTuningSystem, alKindiStartingNote),
  ];
  for (const set of sets) {
    const namesake = chooseSetNamesake(set.compatibleMaqamat, familyOf);
    if (namesake.maqam !== set.sourceTransposition) {
      set.pitchClassSet = listFromTonic(set.pitchClassSet, namesake.maqam.ascendingPitchClasses[0], octaveSources, centsTolerance);
      Object.assign(set, setNamedAfter(namesake));
    }
  }

  return { sets, incompatibleMaqamat };
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
  if (pitchClassSet) {
    // The set made from a transposition holds every one of its pitches, as in classifyMaqamat
    if (!checkMaqamCompatibility(transposition, pitchClassSet)) {
      throw new Error(`${transposition.name} does not fit the 12-pitch-class set made from it`);
    }
    return { fits: true, transposition, pitchClassSet };
  }

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

  // The set asked for is named after the transposition asked for
  const set: ClassificationSet = {
    ...setNamedAfter({ maqam: sourceMaqam, maqamData: sourceMaqamData }),
    pitchClassSet: pitchClassSet,
    compatibleMaqamat: compatibleMaqamat
  };

  return { fits: true, set };
}

