import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { Jins } from "@/models/Jins";
import MaqamDetails, { Maqam } from "@/models/Maqam";
import getTuningSystemCells from "./getTuningSystemCells";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass from "@/models/PitchClass";

interface ExportedTuningSystem {
  tuningSystem: TuningSystem;
  startingNote: NoteName;
  fullRangeTuningSystemPitchClasses: PitchClass[];
  possibleAjnasOverview: JinsDetails[];
  possibleAjnasDetails: Jins[];
  possibleMaqamatOverview: MaqamDetails[];
  possibleMaqamatDetails: Maqam[];
}

export function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName): ExportedTuningSystem {
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);

  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  const possibleAjnasOverview = allAjnas.filter((jins) => jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)));
  const possibleMaqamatOverview = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleAjnasDetails: Jins[] = [];

  for (const jins of possibleAjnasOverview) {
    for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true)) {
      possibleAjnasDetails.push(jinsTransposition);
    }
  }

  const possibleMaqamatDetails: Maqam[] = [];

  for (const maqam of possibleMaqamatOverview) {
    for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true)) {
      possibleMaqamatDetails.push(maqamTransposition);
    }
  }

  return {
    tuningSystem,
    startingNote,
    fullRangeTuningSystemPitchClasses,
    possibleAjnasOverview,
    possibleAjnasDetails,
    possibleMaqamatOverview,
    possibleMaqamatDetails,
  };
}
