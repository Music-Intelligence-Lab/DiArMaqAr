import computeFractionInterval from "@/functions/computeFractionInterval";

export default interface Cell {
  noteName: string;
  fraction: string;
  cents: string;
  decimalRatio: string;
  stringLength: string;
  fretDivision: string;
  frequency: string;
  midiNoteNumber: number;
  originalValue: string;
  originalValueType: string;
  englishName: string;
  abjadName: string;
  index: number;
  octave: number;
}

export interface CellInterval {
  fraction: string;
  cents: number;
  decimalRatio: number;
  stringLength: number;
  fretDivision: number;
  index: number;
  originalValue: string;
  originalValueType: string;
}

export function calculateInterval(firstCell: Cell, secondCell: Cell): CellInterval {
  const fraction = computeFractionInterval(firstCell.fraction, secondCell.fraction);
  const cents = parseFloat(secondCell.cents) - parseFloat(firstCell.cents);
  const decimalRatio = parseFloat(secondCell.decimalRatio) / parseFloat(firstCell.decimalRatio);
  const stringLength = parseFloat(secondCell.stringLength) - parseFloat(firstCell.stringLength);
  const fretDivision = parseFloat(secondCell.fretDivision) - parseFloat(firstCell.fretDivision);
  const index = secondCell.index * secondCell.octave - firstCell.index * firstCell.octave;

  const originalValueType = secondCell.originalValueType;
  let originalValue = "";

  if (originalValueType === "fraction") originalValue = fraction;
  else if (originalValueType === "cents") originalValue = cents.toFixed(2);
  else if (originalValueType === "decimalRatio") originalValue = decimalRatio.toFixed(2);
  else if (originalValueType === "stringLength") originalValue = stringLength.toFixed(2);

  return {
    fraction,
    cents,
    decimalRatio,
    stringLength,
    fretDivision,
    index,
    originalValue,
    originalValueType,
  };
}

export function matchingIntervals(firstInterval: CellInterval, secondInterval: CellInterval, centsTolerance: number = 5): boolean {
  const originalValueType = firstInterval.originalValueType;

  if (originalValueType === "fraction" || originalValueType === "decimalRatio") return firstInterval.fraction === secondInterval.fraction;
  else return Math.abs(firstInterval.cents - secondInterval.cents) <= centsTolerance;
}


export function matchingListOfIntervals(firstIntervals: CellInterval[], secondIntervals: CellInterval[], centsTolerance: number = 5): boolean {
  if (firstIntervals.length !== secondIntervals.length) return false;

  for (let i = 0; i < firstIntervals.length; i++) {
    if (!matchingIntervals(firstIntervals[i], secondIntervals[i], centsTolerance)) return false;
  }

  return true;
}

