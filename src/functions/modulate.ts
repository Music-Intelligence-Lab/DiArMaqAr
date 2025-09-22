import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
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
function shawwaMapping(noteName: NoteName): "n" | "1p" | "2p" | "/" {
  // Handle the special "none" case - outside Al-Shawwā's framework
  if (noteName === "none") return "/";
  
  // Get the index of the note within Al-Shawwā's 24-tone note name system
  const index = getNoteNameIndexAndOctave(noteName).index;

  // Al-Shawwā's classification indices based on his 1946 theoretical framework
  
  // "aṣlīya" (original) or "ṭabīʿīya" (natural) notes
  // These form the stable foundation of maqām structures
  const naturalIndices = [0, 6, 11, 16, 21, 26, 30];
  
  // "arbāʿ" (one-fourth notes) - quarter-tone alterations
  // Reflecting whole tone division into four unequal comma segments
  const onePartIndices = [1, 4, 7, 13, 18, 20, 22, 27, 32, 35];
  
  // "anṣāf" (half-notes) - standard half-tone alterations
  const twoPartIndices = [3, 8, 14, 19, 24, 28, 34];

  // Apply Al-Shawwā's classification logic
  if (naturalIndices.includes(index)) {
    return "n";     // Natural (aṣlīya/ṭabīʿīya)
  } else if (onePartIndices.includes(index)) {
    return "1p";    // One-part (arbāʿ) - quarter-tone alteration
  } else if (twoPartIndices.includes(index)) {
    return "2p";    // Two-part (anṣāf) - half-tone alteration
  } else {
    return "/";     // Outside Al-Shawwā's theoretical framework
  }
}

/**
 * Modulation Analysis Using Al-Shawwā's Technique
 *
 * This function implements the modulation algorithm based on Sāmī Al-Shawwā's 1946 work
 * "Al-Qawāʿid al-Fannīya fī al-Mūsīqa al-Sharqīya wa al-Gharbīya" (The Artistic Principles
 * of Eastern and Western Music). Al-Shawwā, a Cairo-born Aleppine violinist, provided unique
 * guidelines for maqām modulation based on scale degree relationships within the
 * Arab-Ottoman-Persian note naming framework.
 *
 * Modulation Rules Implemented:
 *
 * 1. Tonic Correspondence: Modulation between maqāmāt sharing the same tonic (qarār),
 *    provided the tonic is classified as an "original" note (aṣlīya)
 *
 * 2. Third-Degree Modulation: Transition where the third degree of the source maqām
 *    becomes the tonic of the target, valid only when the third degree is classified
 *    as an "original" note
 *
 * 3. Alternative Third-Degree Modulation: If the standard third degree is invalid,
 *    Al-Shawwā permits using a niṣf (half-note)/two-parts (2p) scale degree immediately
 *    below it, provided that:
 *    a) It is the sixth pitch class from the fundamental (qarār) scale degree of the
 *       source maqām according to the 24-tone list
 *    b) It maintains a distance of two pitch classes from the preceding scale degree
 *       within the source maqām
 *
 * 4. Fourth and Fifth-Degree Modulation: Transitions using the fourth or fifth scale
 *    degrees of the source maqām as the tonic of the target
 *
 * 5. Sixth-Degree Modulation (No Third): When both the third degree and its alternative
 *    are invalid, modulation may occur through the sixth scale degree, provided it is
 *    the sixteenth or seventeenth pitch class from the tonic of the source maqām and
 *    remains an "original" scale degree
 *
 * 6. Sixth-Degree Modulation (Between Naturals): The sixth scale degree may also be
 *    used when it lies between two "natural" scale degrees within the source maqām
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
  centsTolerance: number = 5
): MaqamatModulations | AjnasModulations {
  type ModulationType = Maqam | Jins;

  // Initialize modulation arrays for each scale degree according to Al-Shawwā's categories
  const modulationsOnOne: ModulationType[] = []; // Tonic correspondence modulations
  const modulationsOnThree: ModulationType[] = []; // Standard third-degree modulations
  const modulationsOnThree2p: ModulationType[] = []; // Alternative third-degree (2p) modulations
  const modulationsOnFour: ModulationType[] = []; // Fourth-degree modulations
  const modulationsOnFive: ModulationType[] = []; // Fifth-degree modulations
  const modulationsOnSixAscending: ModulationType[] = []; // Sixth-degree ascending modulations (between naturals)
  const modulationsOnSixDescending: ModulationType[] = []; // Sixth-degree descending modulations (between naturals)
  const modulationsOnSixNoThird: ModulationType[] = []; // Sixth-degree modulations when third is invalid

  // Extract note names from source maqam for analysis
  const sourceAscendingNotes = sourceMaqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
  const sourceDescendingNotes = [...sourceMaqamTransposition.descendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName)].reverse();

  // Al-Shawwā rule validation flags
  let check2p = false; // Flag for alternative third-degree modulation validity
  let checkSixthNoThird = false; // Flag for sixth-degree modulation when third is invalid
  let checkSixAscending = false; // Flag for sixth-degree modulation between naturals (ascending)
  let checkSixDescending = false; // Flag for sixth-degree modulation between naturals (descending)

  // Create the Shawwā 24-tone reference list (filtering out invalid notes marked with "/")
  const shawwaList = [...octaveOneNoteNames, ...octaveTwoNoteNames].filter((noteName) => shawwaMapping(noteName) !== "/");

  // RULE VALIDATION: Extract scale degrees and their positions in Al-Shawwā's 24-tone system
  const firstDegreeNoteName = sourceAscendingNotes[0]; // Tonic (qarār)
  const firstDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === firstDegreeNoteName);

  const secondDegreeNoteName = sourceAscendingNotes[1]; // Second degree
  const secondDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === secondDegreeNoteName);

  const thirdDegreeNoteName = sourceAscendingNotes[2]; // Third degree
  const thirdDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === thirdDegreeNoteName);

  let noteName2p = ""; // Store the alternative third-degree note (2p classification)

  // Calculate pitch class segments for 2p note search
  const numberOfPitchClasses = allPitchClasses.length / 4;
  const slice = allPitchClasses.slice(numberOfPitchClasses, thirdDegreeCellSIndex + 1).reverse();

  // ALTERNATIVE THIRD-DEGREE VALIDATION (Al-Shawwā Rule 3)
  // Search for a 2p (half-note) immediately below the third degree
  for (const pitchClasses of slice) {
    if (shawwaMapping(pitchClasses.noteName) === "2p") {
      noteName2p = pitchClasses.noteName;
      const first2pBeforeShawwaIndex = shawwaList.findIndex((noteName) => noteName === noteName2p);

      // Validate Al-Shawwā's specific distance requirements:
      // a) Sixth pitch class from tonic (distance = 6)
      // b) Two pitch classes from second degree (distance = 2)
      if (first2pBeforeShawwaIndex - firstDegreeShawwaIndex === 6 && first2pBeforeShawwaIndex - secondDegreeShawwaIndex === 2) {
        check2p = true;
      }
      break;
    }
  }

  // SIXTH-DEGREE BETWEEN NATURALS VALIDATION (Al-Shawwā Rule 6)
  // Check if sixth degree lies between two "natural" (n) scale degrees
  if (shawwaMapping(sourceAscendingNotes[4]) === "n" && shawwaMapping(sourceAscendingNotes[6]) === "n") {
    checkSixAscending = true;
  }
  if (shawwaMapping(sourceDescendingNotes[4]) === "n" && shawwaMapping(sourceDescendingNotes[6]) === "n") {
    checkSixDescending = true;
  }

  // SIXTH-DEGREE NO-THIRD VALIDATION (Al-Shawwā Rule 5)
  // When both third degree and alternative are invalid, check sixth degree conditions
  const sixthDegreeNoteName = sourceAscendingNotes[5];
  const sixthDegreeCellSIndex = shawwaList.findIndex((noteName) => noteName === sixthDegreeNoteName);

  // Validate Al-Shawwā's specific requirements:
  // - Sixteenth or seventeenth pitch class from tonic
  // - Must be an "original" (natural) scale degree
  if ((sixthDegreeCellSIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellSIndex - firstDegreeShawwaIndex === 17) && shawwaMapping(sixthDegreeNoteName) === "n") {
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

      // Add all valid transpositions of this jins
      getJinsTranspositions(allPitchClasses, maqamOrJins, true, centsTolerance).forEach((jinsTransposition: Jins) => {
        if (JSON.stringify(currentNotes) === JSON.stringify(jinsTransposition.jinsPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))) return;
        transpositions.push(jinsTransposition);
      });
    }
    // Process Maqam modulations
    else {
      // Skip if maqam is not selectable in current tuning system
      if (!maqamOrJins.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

      const currentAscendingNotes = maqamOrJins.getAscendingNoteNames();

      // Add original maqam if different from source
      transpositions = JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];

      // Add all valid transpositions of this maqam
      getMaqamTranspositions(allPitchClasses, allAjnas, maqamOrJins, true, centsTolerance).forEach((maqamTransposition: Maqam) => {
        if (JSON.stringify(currentAscendingNotes) === JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))) return;
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

      // RULE 1: TONIC CORRESPONDENCE - Same tonic modulations
      if (currentAscendingNotes[0] === sourceAscendingNotes[0]) {
        modulationsOnOne.push(transposition);
      }

      // RULE 4: FOURTH-DEGREE MODULATION - Fourth degree becomes tonic
      if (currentAscendingNotes[0] === sourceAscendingNotes[3] && shawwaMapping(sourceAscendingNotes[3]) !== "/") {
        modulationsOnFour.push(transposition);
      }

      // RULE 4: FIFTH-DEGREE MODULATION - Fifth degree becomes tonic
      if (currentAscendingNotes[0] === sourceAscendingNotes[4] && shawwaMapping(sourceAscendingNotes[4]) !== "/") {
        modulationsOnFive.push(transposition);
      }

      // RULE 2: STANDARD THIRD-DEGREE MODULATION - Third degree becomes tonic
      if (currentAscendingNotes[0] === sourceAscendingNotes[2] && shawwaMapping(sourceAscendingNotes[2]) !== "/") {
        modulationsOnThree.push(transposition);
      }
      // RULE 3: ALTERNATIVE THIRD-DEGREE MODULATION - 2p note becomes tonic
      else if (check2p && currentAscendingNotes[0] === noteName2p) {
        modulationsOnThree2p.push(transposition);
      }
      // RULE 5: SIXTH-DEGREE NO-THIRD MODULATION - When third options are invalid
      else if (checkSixthNoThird && currentAscendingNotes[0] === sourceAscendingNotes[5]) {
        modulationsOnSixNoThird.push(transposition);
      }

      // RULE 6: SIXTH-DEGREE BETWEEN NATURALS MODULATIONS
      if (checkSixAscending && currentAscendingNotes[0] === sourceAscendingNotes[5]) {
        modulationsOnSixAscending.push(transposition);
      }
      if (checkSixDescending && currentAscendingNotes[0] === sourceDescendingNotes[5]) {
        modulationsOnSixDescending.push(transposition);
      }
    }
  }

  // RETURN RESULTS ACCORDING TO AL-SHAWWĀ'S HIERARCHY
  // Apply Al-Shawwā's precedence rules: standard third takes priority over alternative,
  // and both third options take priority over sixth-degree no-third modulations
  if (ajnasModulationsMode) {
    return {
      modulationsOnOne,
      modulationsOnThree,
      modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
      modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnSixNoThird : [],
      modulationsOnFour,
      modulationsOnFive,
      modulationsOnSixAscending,
      modulationsOnSixDescending,
      noteName2p,
    } as AjnasModulations;
  } else {
    return {
      modulationsOnOne,
      modulationsOnThree,
      modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
      modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnSixNoThird : [],
      modulationsOnFour,
      modulationsOnFive,
      modulationsOnSixAscending,
      modulationsOnSixDescending,
      noteName2p,
    } as MaqamatModulations;
  }
}
