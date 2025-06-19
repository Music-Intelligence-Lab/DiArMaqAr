import TransliteratedNoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { Jins } from "@/models/Jins";
import MaqamDetails, { Maqam } from "@/models/Maqam";
import getTuningSystemCells from "./getTuningSystemCells";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import Cell from "@/models/Cell";

interface ExportedTuningSystem {
  tuningSystem: TuningSystem;
  startingNote: TransliteratedNoteName;
  allCells: Cell[];
  possibleAjnas: JinsDetails[];
  possibleAjnasTranspositions: Jins[];
  possibleMaqamat: MaqamDetails[];
  possibleMaqamatTranspositions: Maqam[];
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

  const possibleAjnasTranspositions: Jins[] = [];

  for (const jins of possibleAjnas) {
    for (const jinsTransposition of getJinsTranspositions(allCells, jins, true)) {
      possibleAjnasTranspositions.push(jinsTransposition);
    }
  }

  const possibleMaqamatTranspositions: Maqam[] = [];

  for (const maqam of possibleMaqamat) {
    for (const maqamTransposition of getMaqamTranspositions(allCells, allAjnas, maqam, true)) {
      possibleMaqamatTranspositions.push(maqamTransposition);
    }
  }

  return {
    tuningSystem,
    startingNote,
    allCells,
    possibleAjnas,
    possibleAjnasTranspositions,
    possibleMaqamat,
    possibleMaqamatTranspositions,
  };
}
