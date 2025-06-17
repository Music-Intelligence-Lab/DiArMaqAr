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
    for (const cells of getJinsTranspositions(allCells, jins)) {
      possibleAjnasTranspositions.push({
        name: jins.getName() + " al-" + cells[0].noteName,
        noteNames: cells.map((cell) => cell.noteName),
      });
    }
  }

  const possibleMaqamatTranspositions: MaqamTransposition[] = [];

  for (const maqam of possibleMaqamat) {
    for (const sequences of getMaqamTranspositions(allCells, maqam)) {
      possibleMaqamatTranspositions.push({
        name: maqam.getName() + " al-" + sequences.ascendingSequence[0].noteName,
        ascendingNoteNames: sequences.ascendingSequence.map((cell) => cell.noteName),
        descendingNoteNames: sequences.descendingSequence.map((cell) => cell.noteName),
      });
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
