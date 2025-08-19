import PitchClass from "@/models/PitchClass";
import { shiftPitchClassBaseValue } from "@/functions/convertPitchClass";

/**
 * Empty pitch class object used as a fallback when shifting operations fail.
 * This provides a safe default that won't cause errors in downstream processing.
 */
const emptyPitchClass: PitchClass = {
  noteName: "",
  fraction: "",
  cents: "",
  decimalRatio: "",
  stringLength: "",
  frequency: "",
  englishName: "",
  originalValue: "",
  originalValueType: "",
  index: -1,
  octave: -1,
  abjadName: "",
  fretDivision: "",
  midiNoteNumber: 0,
  centsDeviation: 0,
};

/**
 * Shifts a pitch class by a specified number of octaves using array lookup.
 * 
 * This is the preferred method for shifting pitch classes as it uses the
 * pre-computed pitch class array for accuracy. It finds the target pitch
 * class in a different octave by calculating the appropriate array index.
 * 
 * @param allPitchClasses - Complete array of all available pitch classes
 * @param pitchClass - The pitch class to shift (can be undefined)
 * @param octaveShift - Number of octaves to shift (positive = up, negative = down)
 * @returns The shifted pitch class, or empty pitch class if operation fails
 * 
 * @example
 * // Shift a pitch class up one octave
 * const shifted = shiftPitchClass(allPitches, originalPitch, 1);
 * 
 * @example
 * // Shift a pitch class down two octaves  
 * const shifted = shiftPitchClass(allPitches, originalPitch, -2);
 */
export default function shiftPitchClass(allPitchClasses: PitchClass[], pitchClass: PitchClass | undefined, octaveShift: number) {
  // Validate input pitch class
  if (!pitchClass || typeof pitchClass.index !== "number" || typeof pitchClass.octave !== "number") {
    return emptyPitchClass;
  }

  // Find the pitch class in the array using index and octave
  const pitchClassIndex = allPitchClasses.findIndex((c) => c.index === pitchClass.index && c.octave === pitchClass.octave);
  if (pitchClassIndex === -1) return emptyPitchClass;

  // Calculate the new array index after octave shift
  // Assumes 4 octaves total, so numberOfPitchClasses = total length / 4
  const numberOfPitchClasses = allPitchClasses.length / 4;
  const newIndex = pitchClassIndex + octaveShift * numberOfPitchClasses;

  // Check if the new index is within bounds
  if (newIndex < 0 || newIndex >= allPitchClasses.length) {
    // Fall back to calculation-based shifting if out of bounds
    return shiftPitchClassWithoutAllPitchClasses(pitchClass, octaveShift);
  }

  // Return the pitch class at the calculated index with updated octave
  return { ...allPitchClasses[newIndex], octave: pitchClass.octave + octaveShift };
}

/**
 * Shifts a given PitchClass by octaves using mathematical calculation.
 * 
 * This function shifts pitch classes by recalculating their tuning data
 * rather than using array lookup. It's used as a fallback when the
 * array-based method isn't available or when the target is out of bounds.
 * 
 * All pitch relationships are maintained:
 * - Frequency multiplied/divided by 2^octaves
 * - String length inversely related to frequency
 * - Cents shifted by 1200 * octaves
 * - MIDI note numbers shifted by 12 * octaves
 * 
 * @param pitchClass - The original PitchClass object to shift
 * @param octaves - Number of octaves to shift (positive shifts upward, negative shifts downward)
 * @returns A new PitchClass with updated tuning data
 * 
 * @example
 * // Calculate a pitch class two octaves higher
 * const higher = shiftPitchClassWithoutAllPitchClasses(originalPitch, 2);
 * // Frequency doubled twice, cents increased by 2400
 */
function shiftPitchClassWithoutAllPitchClasses(pitchClass: PitchClass, octaves: number): PitchClass {
  // Calculate the octave multiplication factor
  // factor = 2^octaves (e.g., 1 octave up = 2x frequency)
  const factor = Math.pow(2, octaves);

  // Shift the original value using the appropriate method for its type
  const newOriginalValue = shiftPitchClassBaseValue(
    pitchClass.originalValue,
    pitchClass.originalValueType as "fraction" | "cents" | "decimalRatio" | "stringLength",
    (octaves + pitchClass.octave - 1) as 0 | 1 | 2 | 3 | 4
  );

  // Shift the fraction representation
  const newFractionValue = shiftPitchClassBaseValue(
    pitchClass.fraction, 
    "fraction", 
    (octaves + pitchClass.octave - 1) as 0 | 1 | 2 | 3 | 4
  );

  return {
    ...pitchClass,
    noteName: "jawāb " + pitchClass.noteName, 
    originalValue: newOriginalValue,
    fraction: newFractionValue,
    octave: pitchClass.octave + octaves,
    
    // Update frequency-related values
    frequency: (parseFloat(pitchClass.frequency) * factor).toString(),
    stringLength: (parseFloat(pitchClass.stringLength) / factor).toString(), // Inverse relationship
    
    // Update ratio and interval values
    decimalRatio: (parseFloat(pitchClass.decimalRatio) * factor).toString(),
    cents: (parseFloat(pitchClass.cents) + octaves * 1200).toString(), // 1200 cents per octave
    midiNoteNumber: pitchClass.midiNoteNumber + octaves * 12, // 12 semitones per octave
  };
}
