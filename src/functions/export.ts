import TransliteratedNoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import Jins, { JinsTransposition } from "@/models/Jins";
import Maqam, { MaqamTransposition } from "@/models/Maqam";
import getTuningSystemCells from "./getTuningSystemCells";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";

interface ExportedTuningSystem {
  tuningSystem: TuningSystem;
  startingNote: TransliteratedNoteName;
  possibleAjnas: Jins[];
  possibleAjnasTranspositions: JinsTransposition[];
  possibleMaqamat: Maqam[];
  possibleMaqamatTranspositions: MaqamTransposition[];
}

export function exportTuningSystem(tuningSystem: TuningSystem, startingNote: TransliteratedNoteName): ExportedTuningSystem {
  const allCells = getTuningSystemCells(tuningSystem, startingNote);

  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  const possibleAjnas = allAjnas.filter((jins) => jins.getNoteNames().every((noteName) => allCells.some((cell) => cell.noteName === noteName)));
  const possibleMaqamat = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => allCells.some((cell) => cell.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => allCells.some((cell) => cell.noteName === noteName))
  );

  const possibleAjnasTranspositions: JinsTransposition[] = [];

  for (const jins of possibleAjnas) {
    for (const jinsTransposition of getJinsTranspositions(allCells, jins, true)) {
      possibleAjnasTranspositions.push(jinsTransposition);
    }
  }

  const possibleMaqamatTranspositions: MaqamTransposition[] = [];

  for (const maqam of possibleMaqamat) {
    for (const maqamTransposition of getMaqamTranspositions(allCells, allAjnas, maqam, true)) {
      possibleMaqamatTranspositions.push(maqamTransposition);
    }
  }

  return {
    tuningSystem,
    startingNote,
    possibleAjnas,
    possibleAjnasTranspositions,
    possibleMaqamat,
    possibleMaqamatTranspositions,
  };
}
