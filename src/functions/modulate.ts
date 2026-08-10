import { calculateJinsTranspositions, calculateMaqamTranspositions } from "./transpose";
import PitchClass from "@/models/PitchClass";
import JinsData, { Jins, AjnasModulations } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations } from "@/models/Maqam";
import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";

/**
 * Al-Shawwā Note Classification Function
 * 
 * This function implements Sāmī Al-Shawwā's 24-tone classification system as described 
 * in his 1946 work.
 * 
 * @param noteName - The note name to classify according to Al-Shawwā's system
 * @returns The Al-Shawwā classification category
 */
// Al-Shawwā's classification indices based on his 1946 theoretical framework. These are
// positions within a single octave of the note-name list, and so hold in every octave

// "aṣlīya" (original) or "ṭabīʿīya" (natural) notes
// These form the stable foundation of maqām structures
const naturalIndices = [0, 6, 11, 16, 21, 26, 30];

// "arbāʿ" (one-fourth notes) - quarter-tone alterations
// Reflecting whole tone division into four unequal comma segments
const rubIndices = [1, 4, 7, 13, 18, 20, 22, 27, 32, 35];

// "anṣāf" (half-notes) - standard half-tone alterations
// Index 9 is ʿajam ʿushayrān (B♭), not nayrūz (index 8, B♭−): PAO row 9 records nayrūz
// as an extended note al-Shawwā adds one comma below ʿajam ʿushayrān (1946:13), so it
// is not one of his twenty-four. Both of his worked examples confirm the slot — ʿajam
// ʿushayrān is the sixth rubʿ from yegāh, and ʿajam is the niṣf between ḥusaynī and awj
const nisfIndices = [3, 9, 14, 19, 24, 28, 34];

// The twenty-four classified positions of one octave, in ascending order. Note names that
// do not appear here are al-Shawwā's extended notes (shūrī, nayrūz, rahāwī, nahāwand and
// ṣabā, each one comma off a classified neighbour) plus the tīk degrees he leaves unnamed
const shawwaOctavePositions = [...naturalIndices, ...rubIndices, ...nisfIndices].sort((a, b) => a - b);

function shawwaMapping(noteName: NoteName): "n" | "q" | "h" | "/" {
  // Handle the special "none" case - outside Al-Shawwā's framework
  if (noteName === "none") return "/";

  // Get the index of the note within Al-Shawwā's 24-tone note name system
  const index = getNoteNameIndexAndOctave(noteName).index;

  // Apply Al-Shawwā's classification logic
  if (naturalIndices.includes(index)) {
    return "n";     // Natural (aṣlīya/ṭabīʿīya)
  } else if (rubIndices.includes(index)) {
    return "q";    // rubʿ (arbāʿ) — quarter-tone alteration
  } else if (nisfIndices.includes(index)) {
    return "h";    // niṣf (anṣāf) — half-tone alteration
  } else {
    return "/";     // Outside Al-Shawwā's theoretical framework
  }
}

/**
 * Position of a note on Al-Shawwā's 24-tone list, counted in rubʿ steps from the bottom
 * of the tuning system's range.
 *
 * Al-Shawwā states his distances as counts along that list ("kurdī is the sixth rubʿ of
 * rāst"), and his rules travel with taṣwīr: a maqām transposed an octave down keeps every
 * one of them. Counting the octave into the position is what makes the distances hold in
 * the qarār and jawāb registers as well as the middle one.
 *
 * @param noteName - The note name to locate
 * @returns Absolute position on the 24-tone list, or -1 for notes outside the framework
 */
function shawwaListIndex(noteName: NoteName): number {
  if (noteName === "none") return -1;
  const { octave, index } = getNoteNameIndexAndOctave(noteName);
  const positionWithinOctave = shawwaOctavePositions.indexOf(index);
  if (octave < 0 || positionWithinOctave < 0) return -1;
  return octave * shawwaOctavePositions.length + positionWithinOctave;
}

/**
 * Modulation Analysis Using Al-Shawwā's Technique
 *
 * This function implements the modulation algorithm based on Sāmī Al-Shawwā's 1946 work
 * "Al-Qawāʿid al-Fannīya fī al-Mūsīqa al-Sharqīya wa al-Gharbīya" (The Artistic Principles
 * of Eastern and Western Music). Al-Shawwā, a Cairo-born Aleppine violinist, provided unique
 * guidelines for maqām modulation based on scale degree relationships within the
 * Persian-Arab-Ottoman note naming framework.
 *
 * Modulation Rules Implemented:
 *
 * 1. Tonic Correspondence: Modulation between maqāmāt sharing the same tonic (qarār).
 *    Al-Shawwā opens by requiring that every maqām rest its qarār "on one of the seven
 *    original «natural» notes, or on a niṣf of the seven anṣāf" — so the tonic must be
 *    classified "n" or "h". A "q" (rubʿ) tonic is outside his framework.
 *
 * 2. Third-Degree Modulation: Transition where the third degree of the source maqām
 *    becomes the tonic of the target, valid only when the third degree is classified
 *    as an "original" note ("n"), "whether large (kabīr) or small (ṣaghīr)"
 *
 * 3. Alternative Third-Degree Modulation: If the standard third degree is invalid,
 *    Al-Shawwā permits using a niṣf (half-note, "h") scale degree immediately
 *    below it, provided that:
 *    a) It is the sixth pitch class from the fundamental (qarār) scale degree of the
 *       source maqām according to the 24-tone list
 *    b) It maintains a distance of two pitch classes from the preceding scale degree
 *       within the source maqām
 *
 * 4. Fourth and Fifth-Degree Modulation: Transitions using the fourth or fifth scale
 *    degrees of the source maqām as the tonic of the target. Al-Shawwā attaches no
 *    condition of their own to these degrees; the only constraint is his opening
 *    principle that every maqām "inevitably (ḥatman) rests its qarār on one of the
 *    seven original notes or on a niṣf of the seven anṣāf". A pivot works by hosting
 *    the target's qarār, so the fourth/fifth must be classified "n" or "h" — a "q"
 *    (rubʿ) degree can host no qarār. (His closing sentence "وهذه القواعد تسرى شروطها
 *    على الصوتين الرابع والخامس" belongs to the taṣwīr note — degrees transpose with
 *    the tonic — and is not a classification condition; Khyam's ruling, 2026-08-10.)
 *
 * 5. Sixth-Degree Modulation (No Third): When both the third degree and its alternative
 *    are invalid, modulation may occur through the sixth scale degree, provided it is
 *    the sixteenth or seventeenth pitch class from the tonic of the source maqām and
 *    remains an "original" scale degree
 *
 * 6. Sixth-Degree Modulation (Between Naturals): The sixth scale degree may also be used
 *    when it is a niṣf ("h") lying between two "natural" scale degrees. Unlike rule 5
 *    this is not a fallback — al-Shawwā's example is ʿajam in maqām al-bayyāt, whose
 *    third degree (chahārgāh) is perfectly valid
 *
 * @param allPitchClasses - Complete array of available pitch classes in the tuning system
 * @param allAjnas - Array of all available ajnas (jins data objects) for modulation analysis
 * @param allMaqamat - Array of all available maqamat (maqam data objects) for modulation analysis
 * @param sourceMaqamTransposition - The source maqam transposition to analyze modulations from
 * @param ajnasModulationsMode - If true, analyze ajnas modulations; if false, analyze maqamat modulations
 * @param centsTolerance - Tolerance in cents for pitch matching (default: 5)
 * @returns Object containing all possible modulations organized by scale degree according to Al-Shawwā's rules
 */
export default function modulate(
  allPitchClasses: PitchClass[],
  allAjnas: JinsData[],
  allMaqamat: MaqamData[],
  sourceMaqamTransposition: Maqam,
  ajnasModulationsMode: boolean,
  centsTolerance: number = 5,
  // Optional precomputed transpositions keyed by maqam id. When a batch caller
  // (e.g. buildModulationGraph) will invoke modulate many times against the
  // same (allPitchClasses, allAjnas, centsTolerance), pass a prebuilt map to
  // skip redundant calculateMaqamTranspositions calls. Only consulted in
  // maqamat mode.
  maqamTranspositionsCache?: Map<string, Maqam[]>,
  // The ajnas-mode equivalent, keyed by jins id. A batch caller that invokes
  // modulate once per maqam recomputes every jins transposition on each call,
  // which dominates the cost once the maqamat cache above is in place.
  jinsTranspositionsCache?: Map<string, Jins[]>
): MaqamatModulations | AjnasModulations {
  type ModulationType = Maqam | Jins;

  // Initialize modulation arrays for each scale degree according to Al-Shawwā's categories
  const modulationsOnFirstDegree: ModulationType[] = []; // Tonic correspondence modulations
  const modulationsOnThirdDegree: ModulationType[] = []; // Standard third-degree modulations
  const modulationsOnAltThirdDegree: ModulationType[] = []; // Alternative third-degree (niṣf) modulations
  const modulationsOnFourthDegree: ModulationType[] = []; // Fourth-degree modulations
  const modulationsOnFifthDegree: ModulationType[] = []; // Fifth-degree modulations
  const modulationsOnSixthDegreeAsc: ModulationType[] = []; // Sixth-degree ascending modulations (between naturals)
  const modulationsOnSixthDegreeDesc: ModulationType[] = []; // Sixth-degree descending modulations (between naturals)
  const modulationsOnSixthDegreeIfNoThird: ModulationType[] = []; // Sixth-degree modulations when third is invalid

  // Extract note names from source maqam for analysis
  const sourceAscendingNotes = sourceMaqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
  const sourceDescendingNotes = [...sourceMaqamTransposition.descendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName)].reverse();

  // Al-Shawwā rule validation flags
  let checkNisfBelowThird = false; // Flag for alternative third-degree modulation validity
  let checkSixthNoThird = false; // Flag for sixth-degree modulation when third is invalid
  let checkSixAscending = false; // Flag for sixth-degree modulation between naturals (ascending)
  let checkSixDescending = false; // Flag for sixth-degree modulation between naturals (descending)

  // RULE VALIDATION: Extract scale degrees and their positions in Al-Shawwā's 24-tone system
  const firstDegreeNoteName = sourceAscendingNotes[0]; // Tonic (qarār)
  const firstDegreeShawwaIndex = shawwaListIndex(firstDegreeNoteName);

  const secondDegreeNoteName = sourceAscendingNotes[1]; // Second degree
  const secondDegreeShawwaIndex = shawwaListIndex(secondDegreeNoteName);

  const thirdDegreeNoteName = sourceAscendingNotes[2]; // Third degree
  const thirdDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === thirdDegreeNoteName);

  // AL-SHAWWĀ'S PRECONDITION ON THE TONIC
  // "Every maqām must rest its qarār on one of the seven original «natural» notes, or on
  // a niṣf of the seven anṣāf" — so an "n" or a "h" tonic, never a "q" (rubʿ)
  const tonicShawwaClass = shawwaMapping(firstDegreeNoteName);
  const tonicIsValid = tonicShawwaClass === "n" || tonicShawwaClass === "h";

  // "The third note must be one of the seven original notes, whether large or small."
  // The fallbacks (rules 3 and 5) are only reachable once this fails — al-Shawwā gates
  // them on the third being "corrupt" (fasada), not on the absence of a target maqām
  const thirdDegreeIsValid = shawwaMapping(thirdDegreeNoteName) === "n";

  let noteName2pBelowThird = ""; // Store the alternative third-degree note (niṣf classification)

  // Search span for the alternative third: from the tonic up to and including the third
  // degree. The niṣf al-Shawwā is after sits six rubʿ above the tonic, so it can never lie
  // below it, and bounding the search by the tonic keeps it correct in every register
  const firstDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === firstDegreeNoteName);
  const slice = allPitchClasses.slice(Math.max(firstDegreeCellSIndex, 0), thirdDegreeCellSIndex + 1).reverse();

  // ALTERNATIVE THIRD-DEGREE VALIDATION (Al-Shawwā Rule 3)
  // Search for a niṣf ("h") immediately below the third degree
  for (const pitchClasses of slice) {
    if (shawwaMapping(pitchClasses.noteName) === "h") {
      const firstNisfBeforeShawwaIndex = shawwaListIndex(pitchClasses.noteName);

      // Validate Al-Shawwā's specific distance requirements:
      // a) Sixth pitch class from tonic (distance = 6)
      // b) Two pitch classes from second degree (distance = 2)
      // The name is only recorded once the rule validates: it labels the alternative
      // third bucket, and naming a note al-Shawwā does not license here would misreport
      // the source maqām in the UI and in exports
      if (
        !thirdDegreeIsValid &&
        firstDegreeShawwaIndex >= 0 &&
        secondDegreeShawwaIndex >= 0 &&
        firstNisfBeforeShawwaIndex - firstDegreeShawwaIndex === 6 &&
        firstNisfBeforeShawwaIndex - secondDegreeShawwaIndex === 2
      ) {
        checkNisfBelowThird = true;
        noteName2pBelowThird = pitchClasses.noteName;
      }
      break;
    }
  }

  // SIXTH-DEGREE BETWEEN NATURALS VALIDATION (Al-Shawwā Rule 6)
  // "The sixth note may also be used if it is a niṣf maqām maḥṣūr, that is, falling
  // between two natural notes" — his example is ʿajam over dūgāh in bayyāt, ṣabā and
  // ḥijāz, "because ʿajam here is a niṣf confined between two natural notes, ḥusaynī and
  // awj". Every "h" (niṣf) is by construction enclosed by a pair of naturals, so the
  // test is simply that the sixth degree itself is a niṣf. Checked separately in each
  // direction because ḥijāz, the third of his examples, carries awj as its sixth degree
  // ascending and ʿajam only descending: an ascending-only test would drop it. Bayyāt and
  // ṣabā carry ʿajam at the sixth in both directions
  if (shawwaMapping(sourceAscendingNotes[5]) === "h") {
    checkSixAscending = true;
  }
  if (shawwaMapping(sourceDescendingNotes[5]) === "h") {
    checkSixDescending = true;
  }

  // SIXTH-DEGREE NO-THIRD VALIDATION (Al-Shawwā Rule 5)
  // When both third degree and alternative are invalid, check sixth degree conditions
  const sixthDegreeNoteName = sourceAscendingNotes[5];
  const sixthDegreeCellSIndex = shawwaListIndex(sixthDegreeNoteName);

  // Validate Al-Shawwā's specific requirements:
  // - Only reachable "when both the third note and the niṣf below it are corrupt"
  // - Sixteenth or seventeenth pitch class from tonic
  // - Must be an "original" (natural) scale degree
  if (
    !thirdDegreeIsValid &&
    !checkNisfBelowThird &&
    firstDegreeShawwaIndex >= 0 &&
    (sixthDegreeCellSIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellSIndex - firstDegreeShawwaIndex === 17) &&
    shawwaMapping(sixthDegreeNoteName) === "n"
  ) {
    checkSixthNoThird = true;
  }

  // MODULATION ANALYSIS: Iterate through all available maqamat/ajnas
  for (const maqamOrJins of ajnasModulationsMode ? allAjnas : allMaqamat) {
    let transpositions: (Maqam | Jins)[] = [];

    // Process Jins (ajnas) modulations
    if (maqamOrJins instanceof JinsData) {
      // Skip if jins is not selectable in current tuning system
      if (!maqamOrJins.isJinsPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

      const currentNotes = maqamOrJins.getNoteNames();

      // Add original jins if different from source
      transpositions = JSON.stringify(currentNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];

      // Add all valid transpositions of this jins (from cache if provided)
      const jinsTranspositions = jinsTranspositionsCache?.get(maqamOrJins.getId())
        ?? calculateJinsTranspositions(allPitchClasses, maqamOrJins, true, centsTolerance);
      jinsTranspositions.forEach((jinsTransposition: Jins) => {
        if (JSON.stringify(currentNotes) === JSON.stringify(jinsTransposition.jinsPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))) return;
        transpositions.push(jinsTransposition);
      });
    }
    // Process Maqam modulations
    else {
      // Skip if maqam is not selectable in current tuning system
      if (!maqamOrJins.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

      const currentAscendingNotes = maqamOrJins.getAscendingNoteNames();

      // The source maqam on its own tonic is never a modulation option: staying
      // put is not an intiqāl, and excluding it avoids the edge case where it
      // would be the only "modulation" offered on the tonic degree
      const isSourceMaqamOnSourceTonic = (transpositionTonic: string | undefined) =>
        maqamOrJins.getId() === sourceMaqamTransposition.maqamId && transpositionTonic === sourceAscendingNotes[0];

      // Add original maqam if different from source
      transpositions =
        JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) && !isSourceMaqamOnSourceTonic(currentAscendingNotes[0])
          ? [maqamOrJins.getTahlil(allPitchClasses)]
          : [];

      // Add all valid transpositions of this maqam (from cache if provided)
      const maqamTranspositions = maqamTranspositionsCache?.get(maqamOrJins.getId())
        ?? calculateMaqamTranspositions(allPitchClasses, allAjnas, maqamOrJins, true, centsTolerance);
      maqamTranspositions.forEach((maqamTransposition: Maqam) => {
        if (JSON.stringify(currentAscendingNotes) === JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))) return;
        if (isSourceMaqamOnSourceTonic(maqamTransposition.ascendingPitchClasses[0]?.noteName)) return;
        transpositions.push(maqamTransposition);
      });
    }

    // APPLY AL-SHAWWĀ'S MODULATION RULES
    for (const transposition of transpositions) {
      let currentAscendingNotes: string[] = [];

      // Extract note names from transposition
      if ("ascendingPitchClasses" in transposition) {
        currentAscendingNotes = transposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
      } else {
        currentAscendingNotes = transposition.jinsPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
      }

      // RULE 1: TONIC CORRESPONDENCE - Same tonic modulations, provided the qarār is
      // itself an aṣl ("n") or a niṣf ("h")
      if (currentAscendingNotes[0] === sourceAscendingNotes[0] && tonicIsValid) {
        modulationsOnFirstDegree.push(transposition);
      }

      // RULE 4: FOURTH-DEGREE MODULATION - Fourth degree becomes tonic. No condition of
      // its own: it need only be able to host the target's qarār, i.e. "n" or "h" —
      // never "q", since no maqām rests on a rubʿ (ḥatman principle, p. 96)
      if (
        currentAscendingNotes[0] === sourceAscendingNotes[3] &&
        (shawwaMapping(sourceAscendingNotes[3]) === "n" || shawwaMapping(sourceAscendingNotes[3]) === "h")
      ) {
        modulationsOnFourthDegree.push(transposition);
      }

      // RULE 4: FIFTH-DEGREE MODULATION - Fifth degree becomes tonic, same qarār-
      // admissibility condition as the fourth
      if (
        currentAscendingNotes[0] === sourceAscendingNotes[4] &&
        (shawwaMapping(sourceAscendingNotes[4]) === "n" || shawwaMapping(sourceAscendingNotes[4]) === "h")
      ) {
        modulationsOnFifthDegree.push(transposition);
      }

      // RULE 2: STANDARD THIRD-DEGREE MODULATION - Third degree becomes tonic
      if (currentAscendingNotes[0] === sourceAscendingNotes[2] && thirdDegreeIsValid) {
        modulationsOnThirdDegree.push(transposition);
      }
      // RULE 3: ALTERNATIVE THIRD-DEGREE MODULATION - niṣf note becomes tonic
      else if (checkNisfBelowThird && currentAscendingNotes[0] === noteName2pBelowThird) {
        modulationsOnAltThirdDegree.push(transposition);
      }
      // RULE 5: SIXTH-DEGREE NO-THIRD MODULATION - When third options are invalid
      else if (checkSixthNoThird && currentAscendingNotes[0] === sourceAscendingNotes[5]) {
        modulationsOnSixthDegreeIfNoThird.push(transposition);
      }

      // RULE 6: SIXTH-DEGREE BETWEEN NATURALS MODULATIONS
      if (checkSixAscending && currentAscendingNotes[0] === sourceAscendingNotes[5]) {
        modulationsOnSixthDegreeAsc.push(transposition);
      }
      if (checkSixDescending && currentAscendingNotes[0] === sourceDescendingNotes[5]) {
        modulationsOnSixthDegreeDesc.push(transposition);
      }
    }
  }

  // RETURN RESULTS ACCORDING TO AL-SHAWWĀ'S HIERARCHY
  // Precedence is already enforced by the validation flags above: the alternative third
  // is only sought once the third itself is corrupt, and the sixth-if-no-third only once
  // both of those fail. Gating here on empty result arrays would instead offer a fallback
  // whenever no target maqām happens to sit on a perfectly valid third
  if (ajnasModulationsMode) {
    return {
      modulationsOnFirstDegree: modulationsOnFirstDegree,
      modulationsOnThirdDegree: modulationsOnThirdDegree,
      modulationsOnAltThirdDegree: modulationsOnAltThirdDegree,
      modulationsOnSixthDegreeIfNoThird: modulationsOnSixthDegreeIfNoThird,
      modulationsOnFourthDegree: modulationsOnFourthDegree,
      modulationsOnFifthDegree: modulationsOnFifthDegree,
      modulationsOnSixthDegreeAsc: modulationsOnSixthDegreeAsc,
      modulationsOnSixthDegreeDesc: modulationsOnSixthDegreeDesc,
      noteName2pBelowThird: noteName2pBelowThird,
    } as AjnasModulations;
  } else {
    return {
      modulationsOnFirstDegree: modulationsOnFirstDegree,
      modulationsOnThirdDegree: modulationsOnThirdDegree,
      modulationsOnAltThirdDegree: modulationsOnAltThirdDegree,
      modulationsOnSixthDegreeIfNoThird: modulationsOnSixthDegreeIfNoThird,
      modulationsOnFourthDegree: modulationsOnFourthDegree,
      modulationsOnFifthDegree: modulationsOnFifthDegree,
      modulationsOnSixthDegreeAsc: modulationsOnSixthDegreeAsc,
      modulationsOnSixthDegreeDesc: modulationsOnSixthDegreeDesc,
      noteName2pBelowThird: noteName2pBelowThird,
    } as MaqamatModulations;
  }
}
