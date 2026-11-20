import PitchClass from "@/models/PitchClass";
import { octaveRepeatStartIndex, pitchClassFamilyKey } from "@/functions/octaveLayout";

/**
 * Extends a selection of pitch classes to include related pitches across octaves.
 *
 * This function analyzes the selected pitch classes and accurately extends
 * the selection to include equivalent pitches in other octaves based on
 * frequency relationships. It's used to create comprehensive pitch collections
 * when working with scales that span multiple octaves.
 *
 * The algorithm determines a frequency cutoff point and then includes matching
 * pitch class indices from appropriate octaves, maintaining the harmonic
 * relationships while extending the available pitch range.
 *
 * @param allPitchClasses - Complete array of all available pitch classes
 * @param selectedPitchClasses - Currently selected pitch classes to extend
 * @returns Extended array of pitch classes including related octave equivalents
 */
export default function extendSelectedPitchClasses(allPitchClasses: PitchClass[], selectedPitchClasses: PitchClass[]) {
  const extendedPitchClasses = [];

  // Find the cutoff point for octave extension: pitches whose octave above is
  // still within the selection range qualify for octave duplication
  const sliceIndex = octaveRepeatStartIndex(allPitchClasses, selectedPitchClasses);

  // Process each pitch class in the complete set
  const family = (pc: PitchClass) => pitchClassFamilyKey(allPitchClasses, pc);
  for (const pitchClass of allPitchClasses) {
    const currentFamily = family(pitchClass);

    // Find all selected pitch classes that are this note in some octave
    // (same pitch class, different octaves)
    const filteredPitchClassIndices = selectedPitchClasses.filter((pc) => family(pc) === currentFamily);

    if (filteredPitchClassIndices.length > 0) {
      // Check if this exact pitch class (same pitchClassIndex and octave) exists in selection
      if (filteredPitchClassIndices.some((pc) => pc.octave === pitchClass.octave)) {
        // Direct match - include this pitch class
        extendedPitchClasses.push(pitchClass);
      } else {
        // No direct match - check if any matching pitchClassIndex qualifies for extension
        for (const filteredPitchClass of filteredPitchClassIndices) {
          const indexInSelected = selectedPitchClasses.findIndex((pc) => pc.pitchClassIndex === filteredPitchClass.pitchClassIndex && pc.octave === filteredPitchClass.octave);

          // If the matching pitch class is in the extension range (>= sliceIndex),
          // include this octave equivalent
          if (indexInSelected >= sliceIndex) {
            extendedPitchClasses.push(pitchClass);
            break; // Only need to add once per pitch class
          }
        }
      }
    }
  }

  return extendedPitchClasses;
}
