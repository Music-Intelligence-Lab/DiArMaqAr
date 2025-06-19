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
  allPitchClasses: PitchClass[];
  possibleAjnas: JinsDetails[];
  possibleAjnasTranspositions: Jins[];
  possibleMaqamat: MaqamDetails[];
  possibleMaqamatTranspositions: Maqam[];
}

export function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName): ExportedTuningSystem {
  const allPitchClasses = getTuningSystemCells(tuningSystem, startingNote);

  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  const possibleAjnas = allAjnas.filter((jins) => jins.getNoteNames().every((noteName) => allPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)));
  const possibleMaqamat = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => allPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => allPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleAjnasTranspositions: Jins[] = [];

  for (const jins of possibleAjnas) {
    for (const jinsTransposition of getJinsTranspositions(allPitchClasses, jins, true)) {
      possibleAjnasTranspositions.push(jinsTransposition);
    }
  }

  const possibleMaqamatTranspositions: Maqam[] = [];

  for (const maqam of possibleMaqamat) {
    for (const maqamTransposition of getMaqamTranspositions(allPitchClasses, allAjnas, maqam, true)) {
      possibleMaqamatTranspositions.push(maqamTransposition);
    }
  }

  return {
    tuningSystem,
    startingNote,
    allPitchClasses,
    possibleAjnas,
    possibleAjnasTranspositions,
    possibleMaqamat,
    possibleMaqamatTranspositions,
  };
}
