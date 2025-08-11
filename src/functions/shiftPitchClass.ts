import PitchClass from "@/models/PitchClass";
import { shiftPitchClassBaseValue } from "@/functions/convertPitchClass";

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

export default function shiftPitchClass(allPitchClasses: PitchClass[], pitchClass: PitchClass | undefined, octaveShift: number) {
  if (!pitchClass || typeof pitchClass.index !== "number" || typeof pitchClass.octave !== "number") {
    return emptyPitchClass;
  }

  const pitchClassIndex = allPitchClasses.findIndex((c) => c.index === pitchClass.index && c.octave === pitchClass.octave);
  if (pitchClassIndex === -1) return emptyPitchClass;

  const numberOfPitchClasses = allPitchClasses.length / 4;
  const newIndex = pitchClassIndex + octaveShift * numberOfPitchClasses;

  if (newIndex < 0 || newIndex >= allPitchClasses.length) return shiftPitchClassWithoutAllPitchClasses(pitchClass, octaveShift);

  return { ...allPitchClasses[newIndex], octave: pitchClass.octave + octaveShift };
}

/**
 * Shifts a given PitchClass by a specified number of octaves by adjusting existing pitchClass fields.
 *
 * @param pitchClass - The original PitchClass object to shift.
 * @param octaves - Number of octaves to shift (positive shifts upward, negative shifts downward).
 * @returns A new PitchClass with updated tuning data.
 */
export function shiftPitchClassWithoutAllPitchClasses(pitchClass: PitchClass, octaves: number): PitchClass {
  const factor = Math.pow(2, octaves);

  // Compute the new original ratio value for fraction
  const newOriginalValue = shiftPitchClassBaseValue(
    pitchClass.originalValue,
    pitchClass.originalValueType as "fraction" | "cents" | "decimalRatio" | "stringLength",
    (octaves + pitchClass.octave - 1) as 0 | 1 | 2 | 3 | 4
  );

  const newFractionValue = shiftPitchClassBaseValue(pitchClass.fraction, "fraction", (octaves + pitchClass.octave - 1) as 0 | 1 | 2 | 3 | 4);

  return {
    ...pitchClass,
    noteName: "jawāb " + pitchClass.noteName, 
    originalValue: newOriginalValue,
    fraction: newFractionValue,
    octave: pitchClass.octave + octaves,
    // Adjust frequency and string length by octave factor
    frequency: (parseFloat(pitchClass.frequency) * factor).toString(),
    stringLength: (parseFloat(pitchClass.stringLength) / factor).toString(),
    // Adjust decimal ratio, cents, and MIDI note
    decimalRatio: (parseFloat(pitchClass.decimalRatio) * factor).toString(),
    cents: (parseFloat(pitchClass.cents) + octaves * 1200).toString(),
    midiNoteNumber: pitchClass.midiNoteNumber + octaves * 12,
  };
}
