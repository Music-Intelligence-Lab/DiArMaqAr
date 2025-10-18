import PitchClass from "@/models/PitchClass";

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
  pitchClassIndex: -1,
  octave: -1,
  abjadName: "",
  fretDivision: "",
  midiNoteDecimal: 0,
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
 * const shifted = shiftPitchClassByOctave(allPitches, originalPitch, 1);
 * 
 * @example
 * // Shift a pitch class down two octaves  
 * const shifted = shiftPitchClassByOctave(allPitches, originalPitch, -2);
 */
export default function shiftPitchClassByOctave(allPitchClasses: PitchClass[], pitchClass: PitchClass | undefined, octaveShift: number) {
  // Validate input pitch class
  if (!pitchClass || typeof pitchClass.pitchClassIndex !== "number" || typeof pitchClass.octave !== "number") {
    return emptyPitchClass;
  }

  // Find the pitch class in the array using pitchClassIndex and octave
  const pitchClassIndex = allPitchClasses.findIndex((c) => c.pitchClassIndex === pitchClass.pitchClassIndex && c.octave === pitchClass.octave);
  if (pitchClassIndex === -1) return emptyPitchClass;

  // Calculate the new array index after octave shift
  // Assumes 4 octaves total, so numberOfPitchClasses = total length / 4
  const numberOfPitchClasses = allPitchClasses.length / 4;
  const newIndex = pitchClassIndex + octaveShift * numberOfPitchClasses;

  // Check if the new index is within bounds
  if (newIndex < 0 || newIndex >= allPitchClasses.length) {
    // Return empty pitch class if out of bounds - octave shift not possible within system
    return emptyPitchClass;
  }

  // Return the pitch class at the calculated index with updated octave
  return { ...allPitchClasses[newIndex], octave: pitchClass.octave + octaveShift };
}
