import Cell, { calculateInterval, CellInterval, matchingListOfIntervals } from "@/models/Cell";
import Maqam, { MaqamTransposition } from "@/models/Maqam";
import Jins, { JinsTransposition } from "@/models/Jins";
import shiftCell from "./shiftCell";

export function getCellIntervals(cells: Cell[]) {
  return cells.slice(1).map((cell, index) => calculateInterval(cells[index], cell));
}

export function getCellTranspositions(
  inputCells: Cell[],
  cellIntervals: CellInterval[],
  ascending: boolean,
  useRatio: boolean,
  centsTolerance: number
) {
  const allCells = ascending ? inputCells : [...inputCells].reverse();

  const sequences: Cell[][] = [];

  function buildSequences(cells: Cell[], cellIndex: number, intervalIndex: number) {
    if (intervalIndex === cellIntervals.length) {
      sequences.push(cells);
      return;
    }
    const lastCell = cells[cells.length - 1];

    for (let i = cellIndex; i < allCells.length; i++) {
      const candidateCell = allCells[i];

      const cellInterval = cellIntervals[intervalIndex];
      const computedInterval = calculateInterval(lastCell, candidateCell);

      if (useRatio) {
        if (computedInterval.decimalRatio === cellInterval.decimalRatio) {
          buildSequences([...cells, candidateCell], i + 1, intervalIndex + 1);
          break;
        } else if (ascending && computedInterval.decimalRatio > cellInterval.decimalRatio) break;
        else if (!ascending && computedInterval.decimalRatio < cellInterval.decimalRatio) break;
      } else {
        if (Math.abs(computedInterval.cents - cellInterval.cents) <= centsTolerance) {
          buildSequences([...cells, candidateCell], i + 1, intervalIndex + 1);
          break;
        } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) break;
      }
    }
  }

  for (let i = 0; i < allCells.length; i++) {
    const startingCell = allCells[i];

    buildSequences([startingCell], i + 1, 0);
  }

  return sequences.filter((sequence) => {
    let oct: number;

    if (ascending) {
      oct = sequence[0].octave;
    } else {
      oct = sequence[sequence.length - 1].octave;
    }

    return oct !== 3;
  });
}

export function mergeTranspositions(ascendingSequences: Cell[][], descendingSequences: Cell[][]) {
  const filteredSequences: { ascendingSequence: Cell[]; descendingSequence: Cell[] }[] = [];

  ascendingSequences.forEach((ascSeq) => {
    const ascNoteName = ascSeq[0].noteName;
    const descSeq = descendingSequences.find((descSeq) => {
      const descNoteName = descSeq[descSeq.length - 1].noteName;
      return ascNoteName === descNoteName;
    });
    if (descSeq) {
      filteredSequences.push({ ascendingSequence: ascSeq, descendingSequence: descSeq });
    }
  });

  return filteredSequences;
}

export function getMaqamTranspositions(
  allCells: Cell[],
  allAjnas: Jins[],
  maqam: Maqam | null,
  withTahlil: boolean,
  centsTolerance: number = 5,
  onlyOctaveOne: boolean = false
): MaqamTransposition[] {
  if (allCells.length === 0 || !maqam) return [];

  const ascendingNoteNames = maqam.getAscendingNoteNames();
  const descendingNoteNames = maqam.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return [];

  const ascendingMaqamCells = allCells.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCells = allCells.filter((cell) => descendingNoteNames.includes(cell.noteName)).reverse();

  if (ascendingMaqamCells.length === 0 || descendingMaqamCells.length === 0) return [];

  const valueType = ascendingMaqamCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const ascendingIntervalPattern: CellInterval[] = getCellIntervals(ascendingMaqamCells);

  const descendingIntervalPattern: CellInterval[] = getCellIntervals(descendingMaqamCells);

  const ascendingSequences: Cell[][] = getCellTranspositions(allCells, ascendingIntervalPattern, true, useRatio, centsTolerance).filter(
    (sequence) => (!onlyOctaveOne || sequence[0].octave === 1)
  );

  const descendingSequences: Cell[][] = getCellTranspositions(allCells, descendingIntervalPattern, false, useRatio, centsTolerance);

  const ascendingAjnasIntervals: { jins: Jins; intervals: CellInterval[] }[] = [];
  const descendingAjnasIntervals: { jins: Jins; intervals: CellInterval[] }[] = [];

  for (const jins of allAjnas) {
    const jinsCells = allCells.filter((cell) => jins.getNoteNames().includes(cell.noteName));
    if (jinsCells.length !== jins.getNoteNames().length) continue;
    const reverseJinsCells = [...jinsCells].reverse();
    const ascendingJinsIntervalPattern = getCellIntervals(jinsCells);
    ascendingAjnasIntervals.push({ jins, intervals: ascendingJinsIntervalPattern });
    const descendingJinsIntervalPattern = getCellIntervals(reverseJinsCells);
    descendingAjnasIntervals.push({ jins, intervals: descendingJinsIntervalPattern });
  }

  const maqamTranspositions: MaqamTransposition[] = mergeTranspositions(ascendingSequences, descendingSequences).map((sequencePair) => {
    const ascendingCells = sequencePair.ascendingSequence;
    const extendedAscendingCells = [...ascendingCells, ...ascendingCells.map(cell => shiftCell(allCells, cell, 1))]
    const ascendingCellIntervals = getCellIntervals(ascendingCells);
    const ascendingJinsTranspositions: (JinsTransposition | null)[] = [];
    const descendingCells = sequencePair.descendingSequence;
    const extendedDescendingCells = [...sequencePair.descendingSequence, ...sequencePair.descendingSequence.map(cell => shiftCell(allCells, cell, -1))];
    const descendingCellIntervals = getCellIntervals(sequencePair.descendingSequence);
    const descendingJinsTranspositions: (JinsTransposition | null)[] = [];

    const extendedAscendingCellIntervals = [...ascendingCellIntervals, ...ascendingCellIntervals.slice(1)];
    const extendedDescendingCellIntervals = [...descendingCellIntervals, ...descendingCellIntervals.slice(1)];

    if (allAjnas.length > 0) {
      for (let i = 0; i < extendedAscendingCellIntervals.length; i++) {
        let found = false;

        for (const ascendingJinsInterval of ascendingAjnasIntervals ) {
          const lengthOfInterval = ascendingJinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedAscendingCellIntervals.slice(i, i + lengthOfInterval), ascendingJinsInterval.intervals, centsTolerance)) {
            const jins = ascendingJinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedAscendingCells[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              tahlil: firstJinsNote === firstCell.noteName,
              cells: extendedAscendingCells.slice(i, i + lengthOfInterval),
              cellIntervals: extendedAscendingCellIntervals.slice(i, i + lengthOfInterval),
            }

            ascendingJinsTranspositions.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) ascendingJinsTranspositions.push(null);
        if (i === ascendingCellIntervals.length) break;
      }

      for (let i = 0; i < extendedDescendingCellIntervals.length; i++) {
        let found = false;

        for (const descendingJinsInterval of descendingAjnasIntervals) {
          const lengthOfInterval = descendingJinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedDescendingCellIntervals.slice(i, i + lengthOfInterval), descendingJinsInterval.intervals, centsTolerance)) {
            const jins = descendingJinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedDescendingCells[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              tahlil: firstJinsNote === firstCell.noteName,
              cells: extendedDescendingCells.slice(i, i + lengthOfInterval),
              cellIntervals: extendedDescendingCellIntervals.slice(i, i + lengthOfInterval),
            }

            descendingJinsTranspositions.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) descendingJinsTranspositions.push(null);
        if (i === descendingCellIntervals.length) break;
      }
    }

    return {
      maqamId: maqam.getId(),
      name: `${maqam.getName()} al-${sequencePair.ascendingSequence[0].noteName}`,
      tahlil: false,
      ascendingCells,
      ascendingCellIntervals,
      ascendingJinsTranspositions,
      descendingCells,
      descendingCellIntervals,
      descendingJinsTranspositions,
    };
  });

  const tahlilTransposition = maqamTranspositions.find((transposition) => transposition.ascendingCells[0].noteName === ascendingNoteNames[0]);
  const maqamTranspositionsWithoutTahlil = maqamTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  if (withTahlil && tahlilTransposition) {
    return [{...tahlilTransposition, tahlil: true}, ... maqamTranspositionsWithoutTahlil];}
  else return  maqamTranspositionsWithoutTahlil;
}

export function getJinsTranspositions(
  allCells: Cell[],
  jins: Jins | null,
  withTahlil: boolean,
  centsTolerance: number = 5,
  onlyOctaveOne: boolean = false
): JinsTransposition[] {
  if (allCells.length === 0 || !jins) return [];

  const jinsNoteNames = jins.getNoteNames();

  if (jinsNoteNames.length < 2) return [];

  const jinsCells = allCells.filter((cell) => jinsNoteNames.includes(cell.noteName));

  const valueType = jinsCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const intervalPattern: CellInterval[] = getCellIntervals(jinsCells);

  const jinsTranspositions: JinsTransposition[] = getCellTranspositions(allCells, intervalPattern, true, useRatio, centsTolerance)
    .filter((sequence) => (!onlyOctaveOne || sequence[0].octave === 1))
    .map((sequence) => {
      return {
        jinsId: jins.getId(),
        name: `${jins.getName()} al-${sequence[0].noteName}`,
        tahlil: false,
        cells: sequence,
        cellIntervals: getCellIntervals(sequence),
      };
    });

  const tahlilTransposition = jinsTranspositions.find((transposition) => transposition.cells[0].noteName === jinsNoteNames[0]);
  const jinsTranspositionsWithoutTahlil = jinsTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  if (withTahlil && tahlilTransposition) return [{...tahlilTransposition, tahlil: true,}, ...jinsTranspositionsWithoutTahlil];
  else return jinsTranspositionsWithoutTahlil;
}
