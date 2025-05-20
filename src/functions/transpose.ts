import { CellDetails } from "@/contexts/app-context";
import computeRatio, { convertRatioToNumber } from "./computeRatio";

export type Pattern = { ratio?: string; diff?: number };

export function getIntervalPattern(cellDetails: CellDetails[], useRatio: boolean) {
  return cellDetails.slice(1).map((det, i) => {
    if (useRatio) {
      return {
        ratio: computeRatio(cellDetails[i].fraction, det.fraction),
      };
    } else {
      const prevVal = parseFloat(cellDetails[i].originalValue);
      const curVal = parseFloat(det.originalValue);
      return { diff: curVal - prevVal };
    }
  });
}

export function getTranspositions(
  inputCellDetails: CellDetails[],
  intervalPattern: Pattern[],
  ascending: boolean,
  useRatio: boolean,
  centsTolerance: number
) {
  const allCellDetails = ascending ? inputCellDetails : [...inputCellDetails].reverse();

  const sequences: CellDetails[][] = [];

  function buildSequences(seq: CellDetails[], cellIndex: number, intervalIndex: number) {
    if (intervalIndex === intervalPattern.length) {
      sequences.push(seq);
      return;
    }
    const lastDet = seq[seq.length - 1];

    for (let i = cellIndex; i < allCellDetails.length; i++) {
      const candidate = allCellDetails[i];

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
        const lastVal = parseFloat(lastDet.originalValue);
        const candVal = parseFloat(candidate.originalValue);
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

  for (let i = 0; i < allCellDetails.length; i++) {
    const startingCell = allCellDetails[i];

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

export function mergeTranspositions(ascendingSequences: CellDetails[][], descendingSequences: CellDetails[][]) {
  const filteredSequences: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = [];

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
