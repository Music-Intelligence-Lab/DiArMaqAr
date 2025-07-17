"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = midiNumberToNoteName;
function midiNumberToNoteName(noteNumber) {
    // Accept float, round, and apply special note logic
    if (noteNumber < 0 || noteNumber > 127) {
        throw new RangeError("MIDI note number must be between 0 and 127");
    }
    // Special note sets
    const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123];
    const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116];
    const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118];
    const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);
    // Round to nearest integer
    let rounded = Math.round(noteNumber);
    // Apply special rule for D#, G#, A#
    if (special_notes.has(rounded)) {
        rounded += 1;
    }
    const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteNamesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    const semitone = rounded % 12;
    const octave = Math.floor(rounded / 12) - 1;
    const note = noteNamesSharp[semitone];
    const altName = noteNamesFlat[semitone];
    // only include alt if it's different (i.e. a genuine enharmonic)
    const alt = altName !== note ? altName : undefined;
    return { note, alt, octave };
}
//# sourceMappingURL=midiToNoteNumber.js.map