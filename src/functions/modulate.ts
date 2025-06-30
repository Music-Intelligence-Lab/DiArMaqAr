import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import shawwaMapping from "@/functions/shawwaMapping";
import PitchClass from "@/models/PitchClass";
import JinsDetails, { Jins, JinsModulations } from "@/models/Jins";
import MaqamDetails, { Maqam, MaqamModulations } from "@/models/Maqam";

export default function modulate(
  allPitchClasses: PitchClass[],
  allAjnas: JinsDetails[],
  allMaqamat: MaqamDetails[],
  sourceMaqamTransposition: Maqam,
  ajnasModulationsMode: boolean,
  centsTolerance: number = 5
): MaqamModulations | JinsModulations {
  type ModulationType = Maqam | Jins;
  const modulationsOnOne: ModulationType[] = [];
  const modulationsOnThree: ModulationType[] = [];
  const modulationsOnThree2p: ModulationType[] = [];
  const modulationsOnFour: ModulationType[] = [];
  const modulationsOnFive: ModulationType[] = [];
  const modulationsOnSixAscending: ModulationType[] = [];
  const modulationsOnSixDescending: ModulationType[] = [];
  const modulationsOnSixNoThird: ModulationType[] = [];

  const sourceAscendingNotes = sourceMaqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
  const sourceDescendingNotes = [...sourceMaqamTransposition.descendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName)].reverse();

  let check2p = false;
  let checkSixthNoThird = false;
  let checkSixAscending = false;
  let checkSixDescending = false;

  const shawwaList = [...octaveOneNoteNames, ...octaveTwoNoteNames].filter((noteName) => shawwaMapping(noteName) !== "/");

  const firstDegreeNoteName = sourceAscendingNotes[0];
  const firstDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === firstDegreeNoteName);

  const secondDegreeNoteName = sourceAscendingNotes[1];
  const secondDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === secondDegreeNoteName);

  const thirdDegreeNoteName = sourceAscendingNotes[2];
  const thirdDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === thirdDegreeNoteName);

  let noteName2p = "";

  const numberOfPitchClasses = allPitchClasses.length / 4;

  const slice = allPitchClasses.slice(numberOfPitchClasses, thirdDegreeCellSIndex + 1).reverse();

  for (const pitchClasses of slice) {
    if (shawwaMapping(pitchClasses.noteName) === "2p") {
      noteName2p = pitchClasses.noteName;
      const first2pBeforeShawwaIndex = shawwaList.findIndex((noteName) => noteName === noteName2p);

      if (first2pBeforeShawwaIndex - firstDegreeShawwaIndex === 6 && first2pBeforeShawwaIndex - secondDegreeShawwaIndex === 2) check2p = true;
      break;
    }
  }

  if (shawwaMapping(sourceAscendingNotes[4]) === "n" && shawwaMapping(sourceAscendingNotes[6]) === "n") checkSixAscending = true;
  if (shawwaMapping(sourceDescendingNotes[4]) === "n" && shawwaMapping(sourceDescendingNotes[6]) === "n") checkSixDescending = true;

  const sixthDegreeNoteName = sourceAscendingNotes[5];
  const sixthDegreeCellSIndex = shawwaList.findIndex((noteName) => noteName === sixthDegreeNoteName);

  if (
    (sixthDegreeCellSIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellSIndex - firstDegreeShawwaIndex === 17) &&
    shawwaMapping(sixthDegreeNoteName) === "n"
  )
    checkSixthNoThird = true;

  for (const maqamOrJins of ajnasModulationsMode ? allAjnas : allMaqamat) {
    let transpositions: (Maqam | Jins)[] = [];

    if (maqamOrJins instanceof JinsDetails) {
      if (!maqamOrJins.isJinsSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

      const currentNotes = maqamOrJins.getNoteNames();

      transpositions = JSON.stringify(currentNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];

      getJinsTranspositions(allPitchClasses, maqamOrJins, true, centsTolerance).forEach((jinsTransposition: Jins) => {
        if (JSON.stringify(currentNotes) === JSON.stringify(jinsTransposition.jinsPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName)))
          return;
        transpositions.push(jinsTransposition);
      });
    } else {
      if (!maqamOrJins.isMaqamSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

      const currentAscendingNotes = maqamOrJins.getAscendingNoteNames();

      transpositions = JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqamOrJins.getTahlil(allPitchClasses)] : [];

      getMaqamTranspositions(allPitchClasses, allAjnas, maqamOrJins, true, centsTolerance).forEach((maqamTransposition: Maqam) => {
        if (
          JSON.stringify(currentAscendingNotes) ===
          JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))
        )
          return;
        transpositions.push(maqamTransposition);
      });
    }

    for (const transposition of transpositions) {
      let currentAscendingNotes: string[] = [];
      
      if ('ascendingPitchClasses' in transposition) {
        currentAscendingNotes = transposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
      } else {
        currentAscendingNotes = transposition.jinsPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
      }

      if (currentAscendingNotes[0] === sourceAscendingNotes[0]) modulationsOnOne.push(transposition);
      if (currentAscendingNotes[0] === sourceAscendingNotes[3] && shawwaMapping(sourceAscendingNotes[3]) !== "/")
        modulationsOnFour.push(transposition);
      if (currentAscendingNotes[0] === sourceAscendingNotes[4] && shawwaMapping(sourceAscendingNotes[4]) !== "/")
        modulationsOnFive.push(transposition);
      if (currentAscendingNotes[0] === sourceAscendingNotes[2] && shawwaMapping(sourceAscendingNotes[2]) !== "/")
        modulationsOnThree.push(transposition);
      else if (check2p && currentAscendingNotes[0] === noteName2p) modulationsOnThree2p.push(transposition);
      else if (checkSixthNoThird && currentAscendingNotes[0] === sourceAscendingNotes[5]) modulationsOnSixNoThird.push(transposition);
      if (checkSixAscending && currentAscendingNotes[0] === sourceAscendingNotes[5]) modulationsOnSixAscending.push(transposition);
      if (checkSixDescending && currentAscendingNotes[0] === sourceDescendingNotes[5]) modulationsOnSixDescending.push(transposition);
    }
  }

  if (ajnasModulationsMode) {
    return {
      modulationsOnOne,
      modulationsOnThree,
      modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
      modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnThree2p : [],
      modulationsOnFour,
      modulationsOnFive,
      modulationsOnSixAscending,
      modulationsOnSixDescending,
      noteName2p,
    } as JinsModulations;
  } else {
    return {
      modulationsOnOne,
      modulationsOnThree,
      modulationsOnThree2p: modulationsOnThree.length === 0 ? modulationsOnThree2p : [],
      modulationsOnSixNoThird: modulationsOnThree.length === 0 && modulationsOnThree2p.length === 0 ? modulationsOnThree2p : [],
      modulationsOnFour,
      modulationsOnFive,
      modulationsOnSixAscending,
      modulationsOnSixDescending,
      noteName2p,
    } as MaqamModulations;
  }
}
