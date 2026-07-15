import PitchClass from "@/models/PitchClass";
import NoteName, { getNoteNameIndexAndOctave, getNoteNameFromIndexAndOctave } from "@/models/NoteName";
import { getEnglishNoteName, getSolfegeFromEnglishName } from "@/functions/noteNameMappings";
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

/**
 * Like shiftPitchClassByOctave, but when the target register lies beyond the
 * tuning system's generated pitch-class table (4 octave slots), synthesizes the
 * shifted pitch class mathematically — an octave is an exact factor of 2 — as
 * long as a note name exists for the target register (up to octave 4, e.g.
 * "jawāb jawāb ḥusaynī"/A5).
 *
 * Intended for display octave-completion cells (a noOctaveMaqam transposition
 * whose tonic sits in the top register). Range checks that rely on the empty
 * fallback must keep using shiftPitchClassByOctave.
 */
export function shiftPitchClassByOctaveExtended(allPitchClasses: PitchClass[], pitchClass: PitchClass | undefined, octaveShift: number): PitchClass {
  const found = shiftPitchClassByOctave(allPitchClasses, pitchClass, octaveShift);
  if (found.noteName !== "" || !pitchClass?.noteName) return found;

  const cell = getNoteNameIndexAndOctave(pitchClass.noteName as NoteName);
  if (cell.index === -1) return found;

  const noteName = getNoteNameFromIndexAndOctave({ index: cell.index, octave: cell.octave + octaveShift });
  if (!noteName || noteName === "none") return found;

  const factor = Math.pow(2, octaveShift);
  const frequency = parseFloat(pitchClass.frequency) * factor;
  if (!Number.isFinite(frequency) || frequency <= 0) return found;

  const englishName = getEnglishNoteName(noteName);
  const stringLength = parseFloat(pitchClass.stringLength) / factor;
  // The open string length is recoverable from the source: open = length + fretDivision
  const openStringLength = parseFloat(pitchClass.stringLength) + parseFloat(pitchClass.fretDivision);
  const valueTargetOctave = 1 + octaveShift;
  const canShiftBaseValue = valueTargetOctave >= 0 && valueTargetOctave <= 4;
  // Bump the MIDI note number inside "60 +12.3"-style deviation strings
  const shiftedMidiNoteDeviation = pitchClass.midiNoteDeviation
    ? pitchClass.midiNoteDeviation.replace(/^\d+/, (m) => `${parseInt(m, 10) + 12 * octaveShift}`)
    : pitchClass.midiNoteDeviation;

  return {
    ...pitchClass,
    noteName,
    englishName,
    solfege: getSolfegeFromEnglishName(englishName),
    abjadName: "",
    octave: pitchClass.octave + octaveShift,
    originalValue: canShiftBaseValue
      ? shiftPitchClassBaseValue(pitchClass.originalValue, pitchClass.originalValueType as "fraction" | "fretDivision" | "decimalRatio" | "cents" | "stringLength", valueTargetOctave as 0 | 1 | 2 | 3 | 4)
      : pitchClass.originalValue,
    fraction: canShiftBaseValue && pitchClass.fraction ? shiftPitchClassBaseValue(pitchClass.fraction, "fraction", valueTargetOctave as 0 | 1 | 2 | 3 | 4) : pitchClass.fraction,
    cents: `${parseFloat(pitchClass.cents) + 1200 * octaveShift}`,
    decimalRatio: `${parseFloat(pitchClass.decimalRatio) * factor}`,
    stringLength: Number.isFinite(stringLength) ? `${stringLength}` : pitchClass.stringLength,
    fretDivision: Number.isFinite(openStringLength) && Number.isFinite(stringLength) ? (openStringLength - stringLength).toFixed(3) : pitchClass.fretDivision,
    frequency: `${frequency}`,
    midiNoteDecimal: pitchClass.midiNoteDecimal + 12 * octaveShift,
    midiNoteDeviation: shiftedMidiNoteDeviation,
    referenceNoteName: pitchClass.referenceNoteName ? pitchClass.referenceNoteName.replace(/\d+/, (m) => `${parseInt(m, 10) + octaveShift}`) : pitchClass.referenceNoteName,
  };
}
