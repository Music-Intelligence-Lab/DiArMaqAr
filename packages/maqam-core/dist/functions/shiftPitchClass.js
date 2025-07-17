"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shiftPitchClass;
exports.shiftPitchClassWithoutAllPitchClasses = shiftPitchClassWithoutAllPitchClasses;
const convertPitchClass_1 = require("../functions/convertPitchClass");
const emptyPitchClass = {
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
function shiftPitchClass(allPitchClasses, pitchClass, octaveShift) {
    if (!pitchClass || typeof pitchClass.index !== "number" || typeof pitchClass.octave !== "number") {
        return emptyPitchClass;
    }
    const pitchClassIndex = allPitchClasses.findIndex((c) => c.index === pitchClass.index && c.octave === pitchClass.octave);
    if (pitchClassIndex === -1)
        return emptyPitchClass;
    const numberOfPitchClasses = allPitchClasses.length / 4;
    const newIndex = pitchClassIndex + octaveShift * numberOfPitchClasses;
    if (newIndex < 0 || newIndex >= allPitchClasses.length)
        return shiftPitchClassWithoutAllPitchClasses(pitchClass, octaveShift);
    return { ...allPitchClasses[newIndex], octave: pitchClass.octave + octaveShift };
}
/**
 * Shifts a given PitchClass by a specified number of octaves by adjusting existing pitchClass fields.
 *
 * @param pitchClass - The original PitchClass object to shift.
 * @param octaves - Number of octaves to shift (positive shifts upward, negative shifts downward).
 * @returns A new PitchClass with updated tuning data.
 */
function shiftPitchClassWithoutAllPitchClasses(pitchClass, octaves) {
    const factor = Math.pow(2, octaves);
    // Compute the new original ratio value for fraction
    const newOriginalValue = (0, convertPitchClass_1.shiftPitchClassBaseValue)(pitchClass.originalValue, pitchClass.originalValueType, (octaves + pitchClass.octave - 1));
    const newFractionValue = (0, convertPitchClass_1.shiftPitchClassBaseValue)(pitchClass.fraction, "fraction", (octaves + pitchClass.octave - 1));
    return {
        ...pitchClass,
        noteName: pitchClass.noteName + " shifted by " + octaves + " octaves",
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
//# sourceMappingURL=shiftPitchClass.js.map