import PitchClass from "@/models/PitchClass";

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
};

export default function shiftPitchClass(allPitchClasses: PitchClass[], pitchClass: PitchClass, octaveShift: number) {
  const pitchClassIndex = allPitchClasses.findIndex((c) => c.index === pitchClass.index && c.octave === pitchClass.octave);
  if (pitchClassIndex === -1) return emptyPitchClass;

  const numberOfPitchClasses = allPitchClasses.length / 4;

  const newIndex = pitchClassIndex + octaveShift * numberOfPitchClasses;

  if (newIndex < 0 || newIndex >= allPitchClasses.length) return emptyPitchClass;

  return { ...allPitchClasses[newIndex], octave: pitchClass.octave + octaveShift };
}
