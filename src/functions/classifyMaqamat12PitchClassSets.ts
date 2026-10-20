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

/** The 12 keys in chromatic order */
const CHROMATIC_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

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
 * A pitch in the lowest octave above previousCents, in the spelling given: the
 * maqām's own for a key the maqām uses.
 */
function pitchAbove(spelling: PitchClass, previousCents: number, tuningSystemPitchClasses: PitchClass[]): PitchClass {
  const instance = octavesOf(spelling, tuningSystemPitchClasses).find((pc) => parseFloat(pc.cents) > previousCents);
  if (!instance) {
    throw new Error(`No octave of ${spelling.noteName} lies above ${previousCents} cents in the tuning system`);
  }
  return inOctaveOf(spelling, instance);
}

/**
 * A pitch in the first octave above the starting note (0 to 1200 cents), where
 * every 12-pitch-class set is listed from: a set has no register, and from
 * there all 12 keys lie inside both tuning systems.
 */
function inFirstOctave(spelling: PitchClass, tuningSystemPitchClasses: PitchClass[]): PitchClass {
  const instance = octavesOf(spelling, tuningSystemPitchClasses).find((pc) => {
    const cents = parseFloat(pc.cents);
    return cents > -1e-6 && cents < 1200 - 1e-6;
  });
  if (!instance) throw new Error(`${spelling.noteName} has no octave between 0 and 1200 cents in the tuning system`);
  return inOctaveOf(spelling, instance);
}

/** al-Kindī's pitch on a key, in the lowest octave above previousCents. */
function alKindiPitchAbove(ipnRef: string, previousCents: number, alKindiByIpn: Map<string, PitchClass[]>): PitchClass {
  const instance = (alKindiByIpn.get(ipnRef) ?? [])
    .filter((pc) => parseFloat(pc.cents) > previousCents)
    .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents))[0];
  if (!instance) {
    throw new Error(`al-Kindī has no ${ipnRef} above ${previousCents} cents`);
  }
  return instance;
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
    const instance = i === 0
      ? chooseFirst(instances)
      : instances.find((candidate) => parseFloat(candidate.cents) > previousCents);
    if (!instance) throw new Error(`No octave of ${pc.noteName} lies above ${previousCents} cents`);
    const placed = inOctaveOf(pc, instance);
    pitchClasses.set(key, placed);
    previousCents = parseFloat(placed.cents);
  });

  return { pitchClasses, ipnReferenceNames: pitchClassSet.ipnReferenceNames };
}

/**
 * The same 12 pitches, listed from another tonic: the one the set is named
 * after. The tonic's key comes first, in the first octave (as every set is
 * listed), and the list ascends from it as one made from that tonic would.
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
  // The tonic's key in the first octave, where every set is listed from
  const firstOctave = (instances: PitchClass[]) => {
    const instance = instances.find((pc) => parseFloat(pc.cents) > -1e-6 && parseFloat(pc.cents) < 1200 - 1e-6);
    if (!instance) throw new Error(`No octave of ${instances[0].noteName} lies between 0 and 1200 cents`);
    return instance;
  };
  return listFromKey(pitchClassSet, tonicKey, firstOctave, octaveSources);
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
  const atOrBelowTonic = (instances: PitchClass[]) => {
    const instance = [...instances].reverse().find((pc) => parseFloat(pc.cents) <= tonicCents + 1e-6);
    if (!instance) throw new Error(`No octave of ${instances[0].noteName} lies at or below the tonic (${tonicCents} cents)`);
    return instance;
  };
  return listFromKey(pitchClassSet, "C", atOrBelowTonic, octaveSources);
}

/**
 * Creates a 12-pitch-class set suitable for MIDI keyboard tuning and Scala export.
 *
 * The set is the maqām's own degrees, each on its key, and al-Kindī's (alkindi_874)
 * pitch on every key the maqām leaves empty. The resulting set is ordered
 * chromatically starting from the maqam's tonic.
 *
 * IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
 * correctly and pitch classes can be properly selected from matching octaves to maintain
 * ascending chromatic order.
 *
 * @param maqamTransposition - The maqam transposition to build the set from
 * @param maqamTuningSystem - The tuning system used by the maqam
 * @param maqamStartingNote - Starting note for the maqam's tuning system
 * @param alKindiTuningSystem - al-Kindī tuning system, whose pitches fill the keys the maqām leaves empty
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
  
  // A key the maqām leaves empty takes al-Kindī's pitch on that key: one pitch
  // per key, in every octave
  const alKindiByIpn = new Map<string, PitchClass[]>();
  for (const pc of getTuningSystemPitchClasses(alKindiTuningSystem, alKindiStartingNote)) {
    const ipnRef = getIpnReferenceNoteName(pc);
    alKindiByIpn.set(ipnRef, [...(alKindiByIpn.get(ipnRef) ?? []), pc]);
  }

  // Every octave of the maqām's tuning system, to place a maqām pitch in the
  // octave the chromatic order needs
  const maqamTuningSystemPitchClasses = getTuningSystemPitchClasses(maqamTuningSystem, maqamStartingNote);

  // Find tonic (first pitch class from maqam's ascending sequence), placed in
  // the first octave: a set is listed there whatever the transposition's register
  if (ascendingWithSequentialRefs.length === 0) {
    throw new Error(`${maqamTransposition.name} has no ascending pitch classes to build a 12-pitch-class set from`);
  }
  const tonicPitchClass = inFirstOctave(ascendingWithSequentialRefs[0], maqamTuningSystemPitchClasses);

  const tonicIpnRef = getIpnReferenceNoteName(tonicPitchClass);
  const tonicCents = parseFloat(tonicPitchClass.cents);

  // Reorder chromatic sequence starting from tonic
  const tonicIndex = CHROMATIC_ORDER.indexOf(tonicIpnRef);
  const reorderedChromatic = [...CHROMATIC_ORDER.slice(tonicIndex), ...CHROMATIC_ORDER.slice(0, tonicIndex)];

  // Each key after the tonic takes its pitch in the lowest octave above the key
  // before, so the set ascends from the tonic
  const finalPitchClassMap = new Map<string, PitchClass>([[tonicIpnRef, tonicPitchClass]]);
  let previousCents = tonicCents;

  for (const ipnRef of reorderedChromatic.slice(1)) {
    // A key the maqām uses holds the maqām's pitch, in its spelling, in the
    // octave the order needs (ḥijāz in al-Ṣabbāgh has nīm būselīk only as jawāb
    // nīm būselīk, which the set lists an octave lower)
    const maqamCandidates = maqamIpnMap.get(ipnRef);
    const selectedPitchClass = maqamCandidates
      ? pitchAbove(maqamCandidates[0], previousCents, maqamTuningSystemPitchClasses)
      : alKindiPitchAbove(ipnRef, previousCents, alKindiByIpn);

    finalPitchClassMap.set(ipnRef, selectedPitchClass);
    previousCents = parseFloat(selectedPitchClass.cents);
  }

  return {
    pitchClasses: finalPitchClassMap,
    ipnReferenceNames: [...CHROMATIC_ORDER]
  };
}

/** A pitch's place within one octave, 0 to 1200 cents (negative cents fold up). */
function centsInOctave(cents: number): number {
  return ((cents % 1200) + 1200) % 1200;
}

/**
 * The key of a 12-pitch-class set that holds a pitch, octave ignored, within
 * centsTolerance. Found by pitch, not by the pitch's own key letter: a set can
 * hold a pitch on a neighbouring key (tīk ḥiṣār on G# in one set, on A in
 * another). A member's pitches are always in its set, so a miss throws.
 */
export function keyHoldingPitch(pitchClass: PitchClass, pitchClassSet: PitchClassSet, centsTolerance: number = 5): string {
  const cents = centsInOctave(parseFloat(pitchClass.cents));
  for (const [key, pc] of pitchClassSet.pitchClasses.entries()) {
    const diff = Math.abs(centsInOctave(parseFloat(pc.cents)) - cents);
    if (Math.min(diff, 1200 - diff) <= centsTolerance) return key;
  }
  throw new Error(`The 12-pitch-class set does not hold ${pitchClass.noteName}`);
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

