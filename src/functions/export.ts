import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { Jins, JinsDetailsInterface } from "@/models/Jins";
import MaqamDetails, { Maqam, MaqamDetailsInterface } from "@/models/Maqam";
import getTuningSystemCells from "./getTuningSystemCells";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass from "@/models/PitchClass";
import modulate from "./modulate";
import calculateNumberOfHops from "./calculateNumberOfHops";

interface ExportedTuningSystem {
  tuningSystem: TuningSystem;
  startingNote: NoteName;
  fullRangeTuningSystemPitchClasses: PitchClass[];
  possibleAjnasOverview: JinsDetailsInterface[];
  numberOfPossibleAjnas: number;
  numberOfAjnas: number;
  possibleAjnasDetails: Jins[];
  possibleMaqamatOverview: MaqamDetailsInterface[];
  numberOfPossibleMaqamat: number;
  numberOfMaqamat: number;
  possibleMaqamatDetails: Maqam[];
}

export function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName, centsTolerance: number = 5): ExportedTuningSystem {
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);

  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  const possibleAjnasOverview: (JinsDetails | JinsDetailsInterface)[] = allAjnas.filter((jins) =>
    jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleMaqamatOverview: (MaqamDetails | MaqamDetailsInterface)[] = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleAjnasDetails: Jins[] = [];

  for (let i = 0; i < possibleAjnasOverview.length; i++) {
    const jins = possibleAjnasOverview[i] as JinsDetails;

    let numberOfTranspositions = 0;
    for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
      possibleAjnasDetails.push(jinsTransposition);
      numberOfTranspositions++;
    }

    possibleAjnasOverview[i] = jins.convertToObject();
    (possibleAjnasOverview[i] as JinsDetailsInterface).numberOfTranspositions = numberOfTranspositions;
  }

  const possibleMaqamatDetails: Maqam[] = [];

  for (let i = 0; i < possibleMaqamatOverview.length; i++) {
    const maqam = possibleMaqamatOverview[i] as MaqamDetails;

    let numberOfTranspositions = 0;
    for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
      const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, centsTolerance);
      const numberOfHops = calculateNumberOfHops(modulations);
      maqamTransposition.modulations = modulations;
      maqamTransposition.numberOfHops = numberOfHops;
      possibleMaqamatDetails.push(maqamTransposition);
      numberOfTranspositions++;
    }

    possibleMaqamatOverview[i] = maqam.convertToObject();
    (possibleMaqamatOverview[i] as MaqamDetailsInterface).numberOfTranspositions = numberOfTranspositions;
  }

  return {
    tuningSystem,
    startingNote,
    fullRangeTuningSystemPitchClasses,
    possibleAjnasOverview: possibleAjnasOverview as JinsDetailsInterface[],
    numberOfPossibleAjnas: possibleAjnasOverview.length,
    numberOfAjnas: allAjnas.length,
    possibleAjnasDetails,
    possibleMaqamatOverview: possibleMaqamatOverview as MaqamDetailsInterface[],
    numberOfPossibleMaqamat: possibleMaqamatOverview.length,
    numberOfMaqamat: allMaqamat.length,
    possibleMaqamatDetails,
  };
}
