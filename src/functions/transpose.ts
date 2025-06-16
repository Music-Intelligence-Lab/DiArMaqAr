import Cell from "@/models/Cell";

import computeRatio, { convertRatioToNumber } from "./computeRatio";
import Maqam from "@/models/Maqam";
import Jins from "@/models/Jins";

export type Interval = { ratio?: string; diff?: number };

export function getIntervalPattern(cellS: Cell[], useRatio: boolean) {
  return cellS.slice(1).map((det, i) => {
    if (useRatio) {
      return {
        ratio: computeRatio(cellS[i].fraction, det.fraction),
      };
    } else {
      const prevVal = parseFloat(cellS[i].cents);
      const curVal = parseFloat(det.cents);
      return { diff: curVal - prevVal };
    }
  });
}

export function getTranspositions(
  inputCells: Cell[],
  intervalPattern: Interval[],
  ascending: boolean,
  useRatio: boolean,
  centsTolerance: number
) {
  const allCells = ascending ? inputCells : [...inputCells].reverse();

  const sequences: Cell[][] = [];

  function buildSequences(seq: Cell[], cellIndex: number, intervalIndex: number) {
    if (intervalIndex === intervalPattern.length) {
      sequences.push(seq);
      return;
    }
    const lastDet = seq[seq.length - 1];

    for (let i = cellIndex; i < allCells.length; i++) {
      const candidate = allCells[i];

      const pat = intervalPattern[intervalIndex];

      if (useRatio) {
        const computedRatio = computeRatio(lastDet.fraction, candidate.fraction);

        if (computedRatio === pat.ratio) {
          buildSequences([...seq, candidate], i + 1, intervalIndex + 1);
          break;
        } else if (ascending && convertRatioToNumber(computedRatio) > convertRatioToNumber(pat.ratio ?? "")) {
          break;
        } else if (!ascending && convertRatioToNumber(computedRatio) < convertRatioToNumber(pat.ratio ?? "")) {
          break;
        }
      } else {
        const lastVal = parseFloat(lastDet.cents);
        const candVal = parseFloat(candidate.cents);
        const diff = candVal - lastVal;
        if (Math.abs(diff - (pat.diff ?? 0)) <= centsTolerance) {
          buildSequences([...seq, candidate], i + 1, intervalIndex + 1);
          break;
        } else if (Math.abs(pat.diff ?? 0) + centsTolerance < Math.abs(diff)) {
          break;
        }
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

export function getMaqamTranspositions(allCells: Cell[], maqam: Maqam, onlyOctaveOne: boolean = false) {
  if (allCells.length === 0) return [];

  const ascendingNoteNames = maqam.getAscendingNoteNames();
  const descendingNoteNames = maqam.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return [];

  const ascendingMaqamCells = allCells.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCells = allCells.filter((cell) => descendingNoteNames.includes(cell.noteName)).reverse();

  if (ascendingMaqamCells.length === 0 || descendingMaqamCells.length === 0) return [];

  const valueType = ascendingMaqamCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCells, useRatio);

  const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCells, useRatio);

  const ascendingSequences: Cell[][] = getTranspositions(allCells, ascendingIntervalPattern, true, useRatio, 5).filter(
    (sequence) => !onlyOctaveOne || sequence[0].octave === 1
  );

  const descendingSequences: Cell[][] = getTranspositions(allCells, descendingIntervalPattern, false, useRatio, 5);

  const filteredSequences: { ascendingSequence: Cell[]; descendingSequence: Cell[] }[] = mergeTranspositions(
    ascendingSequences,
    descendingSequences
  );

  return filteredSequences;
}

export function getJinsTranspositions(allCells: Cell[], jins: Jins, onlyOctaveOne: boolean = false) {
  if (allCells.length === 0) return [];

  const jinsNoteNames = jins.getNoteNames();

  if (jinsNoteNames.length < 2) return [];

  const jinsCells = allCells.filter((cell) => jinsNoteNames.includes(cell.noteName));

  const valueType = jinsCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  const intervalPattern: Interval[] = getIntervalPattern(jinsCells, useRatio);

  const sequences: Cell[][] = getTranspositions(allCells, intervalPattern, true, useRatio, 5).filter(
    (sequence) => !onlyOctaveOne || sequence[0].octave === 1
  );

  return sequences;
}
