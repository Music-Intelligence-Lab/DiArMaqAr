import PitchClass from "@/models/PitchClass";

export default function extendPitchClasses(allPitchClasses: PitchClass[], selectedPitchClasses: PitchClass[]) {
  const extendedPitchClasses = [];

  let sliceIndex = 0;

  const lastPitchClass = selectedPitchClasses[selectedPitchClasses.length - 1];

  for (let i = 0; i < selectedPitchClasses.length; i++) {
    if (parseFloat(selectedPitchClasses[i].frequency) * 2 <= parseFloat(lastPitchClass.frequency)) {
      sliceIndex = i + 1;
    }
  }

  for (const pitchClass of allPitchClasses) {
    const currentIndex = pitchClass.index;
    const filteredPitchClassIndices = selectedPitchClasses.filter((pc) => pc.index === currentIndex);

    if (filteredPitchClassIndices.length > 0) {
      if (filteredPitchClassIndices.some(pc => pc.octave === pitchClass.octave)) extendedPitchClasses.push(pitchClass);
      else {
        for (const filteredPitchClass of filteredPitchClassIndices) {
          const indexInSelected = selectedPitchClasses.findIndex(pc => pc.index === filteredPitchClass.index && pc.octave === filteredPitchClass.octave);
          if (indexInSelected >= sliceIndex) {
            extendedPitchClasses.push(pitchClass);
            break;
          }
        }
      }
    }
  }

  return extendedPitchClasses;
}
