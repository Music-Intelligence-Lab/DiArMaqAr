import computeFractionInterval from "@/functions/computeFractionInterval";

/**
 * A Pitch class in oriental musicology is a fundamental abstraction that represents 
 * a musical relation of a musical pitch. Rather than defining absolute properties 
 * with frequencies, it uses relational measurements like cents, string length, 
 * fraction ratio, and decimal ratio. When used within the context of a tuning system, 
 * the pitch class will be linked to a note name and an audible frequency. This 
 * relational approach enables systematic analysis of transpositions and modulations, 
 * as interval relationships between the pitch classes are maintained regardless of 
 * the reference frequency.
 */
export default interface PitchClass {
  /** The name of the note in the current tuning system */
  noteName: string;
  
  /** Frequency ratio expressed as a fraction (e.g., "3/2") */
  fraction: string;
  
  /** Pitch measurement in cents relative to a reference */
  cents: string;
  
  /** Frequency ratio as a decimal number */
  decimalRatio: string;
  
  /** Relative string length for string instruments */
  stringLength: string;
  
  /** Fret position for fretted instruments */
  fretDivision: string;
  
  /** Absolute frequency in Hz */
  frequency: string;
  
  /** MIDI note number representation */
  midiNoteNumber: number;
  
  /** The original input value used to create this pitch class */
  originalValue: string;
  
  /** The type of the original value ("fraction", "cents", "decimalRatio", "stringLength") */
  originalValueType: string;
  
  /** English name of the note */
  englishName: string;
  
  /** Arabic/Abjad name of the note */
  abjadName: string;
  
  /** Position index within the scale or tuning system */
  index: number;
  
  /** Octave number */
  octave: number;
  
  /** Deviation in cents from the nearest equal-tempered pitch */
  centsDeviation: number;
  
  /** Optional reference note name for relative calculations */
  referenceNoteName?: string;
}

/**
 * Represents the interval between two pitch classes, containing the difference 
 * in various measurement systems. This enables comparison and analysis of 
 * musical intervals across different representation formats.
 */
export interface PitchClassInterval {
  /** Interval as a frequency ratio fraction */
  fraction: string;
  
  /** Interval in cents */
  cents: number;
  
  /** Interval as a decimal ratio */
  decimalRatio: number;
  
  /** String length difference */
  stringLength: number;
  
  /** Fret division difference */
  fretDivision: number;
  
  /** Index difference considering octaves */
  index: number;
  
  /** String representation of the interval in its original format */
  originalValue: string;
  
  /** Type of the original value representation */
  originalValueType: string;
}

/**
 * Converts a fraction string to its decimal representation.
 * @param fraction - String representation of a fraction (e.g., "3/2")
 * @returns The decimal equivalent of the fraction
 * @example
 * ```typescript
 * convertFractionToDecimal("3/2") // returns 1.5
 * convertFractionToDecimal("4/3") // returns 1.333...
 * ```
 */
function convertFractionToDecimal(fraction: string): number {
  const [numerator, denominator] = fraction.split("/").map(Number);
  return numerator / denominator;
}

/**
 * Calculates the interval between two pitch classes in all measurement systems.
 * This function computes the difference between two pitch classes across multiple
 * representation formats, enabling comprehensive interval analysis.
 * 
 * @param firstPitchClass - The starting pitch class
 * @param secondPitchClass - The ending pitch class
 * @returns A PitchClassInterval object containing the interval measurements in all supported formats
 */
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

/**
 * Determines if two intervals are equivalent within a specified tolerance.
 * Uses different comparison methods based on the original value type:
 * - For fraction and decimal ratio types: Exact string comparison
 * - For other types: Cents comparison within tolerance
 * 
 * @param firstInterval - First interval to compare
 * @param secondInterval - Second interval to compare
 * @param centsTolerance - Tolerance in cents for comparison (default: 5)
 * @returns true if the intervals match within the specified tolerance, false otherwise
 */
export function matchingIntervals(firstInterval: PitchClassInterval, secondInterval: PitchClassInterval, centsTolerance: number = 5): boolean {
  const originalValueType = firstInterval.originalValueType;

  if (originalValueType === "fraction" || originalValueType === "decimalRatio") return firstInterval.fraction === secondInterval.fraction;
  else return Math.abs(firstInterval.cents - secondInterval.cents) <= centsTolerance;
}


/**
 * Compares two arrays of intervals to determine if they represent the same sequence.
 * This is useful for comparing interval patterns in scales, modes, or melodic sequences.
 * 
 * Requirements:
 * - Arrays must have the same length
 * - Each corresponding pair of intervals must match according to matchingIntervals
 * 
 * @param firstIntervals - Array of intervals to compare
 * @param secondIntervals - Array of intervals to compare against
 * @param centsTolerance - Tolerance in cents for individual interval comparison (default: 5)
 * @returns true if all intervals in both arrays match in sequence, false otherwise
 */
export function matchingListOfIntervals(firstIntervals: PitchClassInterval[], secondIntervals: PitchClassInterval[], centsTolerance: number = 5): boolean {
  if (firstIntervals.length !== secondIntervals.length) return false;

  for (let i = 0; i < firstIntervals.length; i++) {
    if (!matchingIntervals(firstIntervals[i], secondIntervals[i], centsTolerance)) return false;
  }

  return true;
}

