import computeFractionInterval from "@/functions/computeFractionInterval";

export default interface PitchClass {
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

export interface PitchClassInterval {
  fraction: string;
  cents: number;
  decimalRatio: number;
  stringLength: number;
  fretDivision: number;
  index: number;
  originalValue: string;
  originalValueType: string;
}

function convertFractionToDecimal(fraction: string): number {
  const [numerator, denominator] = fraction.split("/").map(Number);
  return numerator / denominator;
}

export function calculateInterval(firstPitchClass: PitchClass, secondPitchClass: PitchClass): PitchClassInterval {
  const fraction = computeFractionInterval(firstPitchClass.fraction, secondPitchClass.fraction);
  const cents = parseFloat(secondPitchClass.cents) - parseFloat(firstPitchClass.cents);
  const decimalRatio = convertFractionToDecimal(fraction);
  const stringLength = parseFloat(secondPitchClass.stringLength) - parseFloat(firstPitchClass.stringLength);
  const fretDivision = parseFloat(secondPitchClass.fretDivision) - parseFloat(firstPitchClass.fretDivision);
  const index = secondPitchClass.index * secondPitchClass.octave - firstPitchClass.index * firstPitchClass.octave;

  const originalValueType = secondPitchClass.originalValueType;
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

export function matchingIntervals(firstInterval: PitchClassInterval, secondInterval: PitchClassInterval, centsTolerance: number = 5): boolean {
  const originalValueType = firstInterval.originalValueType;

  if (originalValueType === "fraction" || originalValueType === "decimalRatio") return firstInterval.fraction === secondInterval.fraction;
  else return Math.abs(firstInterval.cents - secondInterval.cents) <= centsTolerance;
}


export function matchingListOfIntervals(firstIntervals: PitchClassInterval[], secondIntervals: PitchClassInterval[], centsTolerance: number = 5): boolean {
  if (firstIntervals.length !== secondIntervals.length) return false;

  for (let i = 0; i < firstIntervals.length; i++) {
    if (!matchingIntervals(firstIntervals[i], secondIntervals[i], centsTolerance)) return false;
  }

  return true;
}

