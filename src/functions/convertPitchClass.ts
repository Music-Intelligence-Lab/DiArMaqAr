import gcd from "./gcd";

/**
 * Converts a decimal number to its closest fractional representation.
 * 
 * This function finds the best fractional approximation of a decimal number
 * by testing denominators up to 99 and selecting the fraction with minimal error.
 * This is crucial for representing pitch ratios in just intonation systems.
 * 
 * @param decimal - The decimal number to convert to a fraction
 * @returns String representation of the simplified fraction
 * 
 * @example
 * decimalToFraction(1.5) // Returns "3/2"
 * decimalToFraction(1.25) // Returns "5/4"
 */
function decimalToFraction(decimal: number) {
  let bestNumerator = 1;
  let bestDenominator = 1;
  let minError = Math.abs(decimal - bestNumerator / bestDenominator);

  // Test denominators from 1 to 99 to find the best approximation
  for (let d = 1; d <= 99; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);
    
    // If this fraction is more accurate, use it
    if (error < minError) {
      minError = error;
      bestNumerator = n;
      bestDenominator = d;
    }
  }

  // Simplify the fraction using GCD
  const gcdValue = gcd(bestNumerator, bestDenominator);
  return `${bestNumerator / gcdValue}/${bestDenominator / gcdValue}`;
}

/**
 * Converts a frequency value to its equivalent MIDI note number.
 * 
 * Uses the standard MIDI tuning where A4 = 440 Hz = MIDI note 69.
 * This conversion is essential for interfacing with MIDI systems and
 * calculating pitch relationships.
 * 
 * @param frequency - The frequency in Hz
 * @returns The equivalent MIDI note number (can be fractional)
 * 
 * @example
 * frequencyToMidiNoteNumber(440) // Returns 69 (A4)
 * frequencyToMidiNoteNumber(523.25) // Returns ~72 (C5)
 */
export function frequencyToMidiNoteNumber(frequency: number): number {
  // MIDI note number formula: 69 + 12 * log2(frequency / 440)
  const midi = 69 + 12 * Math.log2(frequency / 440);
  return midi;
}

/**
 * Converts pitch class values between different representation formats.
 * 
 * This is the core conversion function that enables the system to work with
 * different pitch notations (fractions, cents, decimal ratios, string lengths).
 * It converts any input format to all other formats, enabling seamless
 * interoperability between different musical tuning systems.
 * 
 * @param originalValue - The input value as a string
 * @param inputType - The format of the input value
 * @param stringLength - Reference string length for string length calculations
 * @param referenceFrequency - Reference frequency for frequency calculations
 * @returns Object with all converted formats, or null if conversion fails
 * 
 * @example
 * // Convert a fraction to all formats
 * convertPitchClass("3/2", "fraction", 100, 440)
 * // Returns: { fraction: "3/2", decimal: "1.5", cents: "701.955", ... }
 * 
 * @example
 * // Convert cents to all formats  
 * convertPitchClass("200", "cents", 100, 440)
 * // Returns all equivalent representations of 200 cents
 */
export default function convertPitchClass(originalValue: string, inputType: "fraction" | "cents" | "decimalRatio" | "stringLength", stringLength: number, referenceFrequency: number) {
  // Initialize variables for all representation formats
  let fractionVal = "";
  let decimalVal = 0;
  let centsVal = 0;
  let stringLenVal = 0;
  let freqVal = 0;

  try {
    if (inputType === "fraction") {
      // Parse fraction format (e.g., "3/2")
      const [num, denom] = originalValue.split("/").map(Number);
      if (isNaN(num) || isNaN(denom) || denom === 0) return null;
      
      fractionVal = originalValue;
      const dec = num / denom;
      decimalVal = dec;
      
      // Convert to other formats using mathematical relationships
      centsVal = 1200 * Math.log2(dec);           // Cents = 1200 * log2(ratio)
      stringLenVal = stringLength / dec;          // String length inversely proportional to frequency
      freqVal = referenceFrequency * dec;         // Frequency proportional to ratio
      
    } else if (inputType === "cents") {
      // Parse cents format (e.g., "701.955")
      const c = parseFloat(originalValue);
      centsVal = c;
      
      // Convert cents to ratio, then to other formats
      decimalVal = Math.pow(2, c / 1200);         // Ratio = 2^(cents/1200)
      fractionVal = decimalToFraction(decimalVal);
      stringLenVal = stringLength / decimalVal;
      freqVal = referenceFrequency * decimalVal;
      
    } else if (inputType === "decimalRatio") {
      // Parse decimal ratio format (e.g., "1.5")
      const dec = parseFloat(originalValue);
      decimalVal = dec;
      
      // Convert decimal to other formats
      fractionVal = decimalToFraction(dec);
      centsVal = 1200 * Math.log2(dec);
      stringLenVal = stringLength / dec;
      freqVal = referenceFrequency * dec;
      
    } else if (inputType === "stringLength") {
      // Parse string length format (e.g., "66.67")
      const slVal = parseFloat(originalValue);
      stringLenVal = slVal;
      
      // Calculate frequency ratio from string length ratio
      const ratio = stringLength / slVal;  // Inverse relationship
      decimalVal = ratio;
      
      if (ratio <= 0 || !isFinite(ratio)) return null;
      
      // Convert ratio to other formats
      fractionVal = decimalToFraction(ratio);
      centsVal = 1200 * Math.log2(ratio);
      freqVal = referenceFrequency * ratio;
    }
    
    // Return object with all converted formats
    return {
      fraction: fractionVal,
      decimal: decimalVal.toString(),
      cents: centsVal.toString(),
      stringLength: stringLenVal.toString(),
      frequency: freqVal.toString(),
    };
  } catch {
    // Return null if any conversion fails
    return null;
  }
}

/**
 * Shifts a pitch class base value to a different octave.
 * 
 * This function transposes a pitch class value by octaves, handling the conversion
 * appropriately for different input formats. It's used when generating pitch classes
 * across multiple octaves from a single octave template.
 * 
 * @param baseValue - The original pitch class value as a string
 * @param inputType - The format of the input value
 * @param targetOctave - The target octave (0, 1, 2, 3, or 4)
 * @returns The shifted value in the same format as the input
 * 
 * @example
 * // Shift a fraction up one octave
 * shiftPitchClassBaseValue("3/2", "fraction", 2) // Returns "3/1" (doubled)
 * 
 * @example
 * // Shift cents up one octave
 * shiftPitchClassBaseValue("701.955", "cents", 2) // Returns "1901.955" (+1200 cents)
 */
export function shiftPitchClassBaseValue(baseValue: string, inputType: "fraction" | "decimalRatio" | "cents" | "stringLength", targetOctave: 0 | 1 | 2 | 3 | 4): string {
  // Octave 1 is the reference - no shift needed
  if (targetOctave === 1) return baseValue;

  // Calculate octave steps from the reference octave 1
  // octave 0 => -1 step (-12 semitones)
  // octave 1 => 0 steps (reference)  
  // octave 2 => +1 step (+12 semitones)
  // octave 3 => +2 steps (+24 semitones)
  // octave 4 => +3 steps (+36 semitones)
  const octaveSteps = targetOctave - 1;

  try {
    if (inputType === "fraction") {
      // For fractions: multiply by 2^octaveSteps
      // Going up an octave doubles the frequency ratio
      const [num, den] = baseValue.split(/[:/]/).map(Number);
      if (!den || isNaN(num) || isNaN(den)) return baseValue;

      let newNum = num * Math.pow(2, octaveSteps);
      let newDen = den;

      // Handle negative octave steps (going down) by adjusting denominator instead
      if (octaveSteps < 0) {
        const divisor = Math.pow(2, -octaveSteps);
        newDen = den * divisor;
        newNum = num;
      }

      // Simplify the resulting fraction
      const g = gcd(newNum, newDen);
      return `${newNum / g}/${newDen / g}`;
      
    } else if (inputType === "decimalRatio") {
      // For decimal ratios: multiply by 2^octaveSteps
      const dec = parseFloat(baseValue);
      const shifted = dec * Math.pow(2, octaveSteps);
      return shifted.toString();
      
    } else if (inputType === "cents") {
      // For cents: add 1200 * octaveSteps
      // Each octave = 1200 cents in equal temperament
      const c = parseFloat(baseValue);
      const shifted = c + 1200 * octaveSteps;
      return shifted.toFixed(3);
      
    } else if (inputType === "stringLength") {
      // For string length: divide by 2^octaveSteps
      // Higher frequency (higher octave) = shorter string length
      // Inverse relationship: frequency * 2 = string length / 2
      const slVal = parseFloat(baseValue);
      const multiplier = Math.pow(2, -octaveSteps);
      const shifted = slVal * multiplier;
      return shifted.toString();
    }
  } catch (err) {
    console.error("Error shifting pitch class:", err);
    return baseValue; // Return original value on error
  }

  return baseValue;
}
