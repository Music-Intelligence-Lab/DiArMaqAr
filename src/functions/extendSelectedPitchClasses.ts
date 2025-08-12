import PitchClass from "@/models/PitchClass";

/**
 * Extends a selection of pitch classes to include related pitches across octaves.
 * 
 * This function analyzes the selected pitch classes and intelligently extends
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
 * 
 * @example
 * // Extend a selection to include octave equivalents
 * const extended = extendSelectedPitchClasses(allPitches, selectedPitches);
 * // Returns original selection plus related pitches from other octaves
 */
export default function extendSelectedPitchClasses(allPitchClasses: PitchClass[], selectedPitchClasses: PitchClass[]) {
  const extendedPitchClasses = [];

  // Find the cutoff point for octave extension
  // This determines which pitches qualify for octave duplication
  let sliceIndex = 0;
  const lastPitchClass = selectedPitchClasses[selectedPitchClasses.length - 1];

  // Calculate the slice index based on frequency doubling relationship
  // Pitches whose frequency doubled is still within the selection range
  // are candidates for extension
  for (let i = 0; i < selectedPitchClasses.length; i++) {
    const currentFreq = parseFloat(selectedPitchClasses[i].frequency);
    const lastFreq = parseFloat(lastPitchClass.frequency);
    
    // If doubling this frequency keeps it within the last pitch's frequency,
    // it's within the octave extension range
    if (currentFreq * 2 <= lastFreq) {
      sliceIndex = i + 1;
    }
  }

  // Process each pitch class in the complete set
  for (const pitchClass of allPitchClasses) {
    const currentIndex = pitchClass.index;
    
    // Find all selected pitch classes that share the same index
    // (same pitch class, different octaves)
    const filteredPitchClassIndices = selectedPitchClasses.filter((pc) => pc.index === currentIndex);

    if (filteredPitchClassIndices.length > 0) {
      // Check if this exact pitch class (same index and octave) exists in selection
      if (filteredPitchClassIndices.some(pc => pc.octave === pitchClass.octave)) {
        // Direct match - include this pitch class
        extendedPitchClasses.push(pitchClass);
      } else {
        // No direct match - check if any matching index qualifies for extension
        for (const filteredPitchClass of filteredPitchClassIndices) {
          const indexInSelected = selectedPitchClasses.findIndex(pc => 
            pc.index === filteredPitchClass.index && pc.octave === filteredPitchClass.octave
          );
          
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
