import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import { getMaqamTranspositions } from "./transpose";
import shawwaMapping from "@/functions/shawwaMapping";
import PitchClass from "@/models/PitchClass";
import JinsDetails from "@/models/Jins";
import MaqamDetails, { Maqam, MaqamModulations } from "@/models/Maqam";

export default function modulate(
  allPitchClasses: PitchClass[],
  allAjnas: JinsDetails[],
  allMaqamat: MaqamDetails[],
  sourceMaqamTransposition: Maqam,
  centsTolerance: number = 5
): MaqamModulations {
  const modulationsOnOne: Maqam[] = [];
  const modulationsOnThree: Maqam[] = [];
  const modulationsOnThree2p: Maqam[] = [];
  const modulationsOnFour: Maqam[] = [];
  const modulationsOnFive: Maqam[] = [];
  const modulationsOnSixAscending: Maqam[] = [];
  const modulationsOnSixDescending: Maqam[] = [];
  const modulationsOnSixNoThird: Maqam[] = [];

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

  for (const maqam of allMaqamat) {
    if (!maqam.isMaqamSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName))) continue;

    const currentAscendingNotes = maqam.getAscendingNoteNames();

    const transpositions = JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqam.getTahlil(allPitchClasses)] : [];

    getMaqamTranspositions(allPitchClasses, allAjnas, maqam, true, centsTolerance).forEach((maqamTransposition: Maqam) => {
      if (
        JSON.stringify(currentAscendingNotes) ===
        JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName))
      )
        return;
      transpositions.push(maqamTransposition);
    });

    for (const transposition of transpositions) {
      const currentAscendingNotes = transposition.ascendingPitchClasses.map((pitchClass: PitchClass) => pitchClass.noteName);
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
  };
}
