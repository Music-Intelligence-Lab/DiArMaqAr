"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getNoteNamesUsedInTuningSystem;
const NoteName_1 = require("../models/NoteName");
function getNoteNamesUsedInTuningSystem(indicesToSearch = []) {
    const noteNames = [];
    const baseLength = NoteName_1.octaveOneNoteNames.length;
    for (let octave = 0; octave < 4; octave++) {
        for (const index of indicesToSearch) {
            if (index < baseLength) {
                switch (octave) {
                    case 0:
                        noteNames.push(NoteName_1.octaveZeroNoteNames[index] || "none");
                        break;
                    case 1:
                        noteNames.push(NoteName_1.octaveOneNoteNames[index] || "none");
                        break;
                    case 2:
                        noteNames.push(NoteName_1.octaveTwoNoteNames[index] || "none");
                        break;
                    case 3:
                        noteNames.push(NoteName_1.octaveThreeNoteNames[index] || "none");
                        break;
                }
            }
            else {
                const localIndex = index - baseLength;
                switch (octave) {
                    case 0:
                        noteNames.push(NoteName_1.octaveOneNoteNames[localIndex] || "none");
                        break;
                    case 1:
                        noteNames.push(NoteName_1.octaveTwoNoteNames[localIndex] || "none");
                        break;
                    case 2:
                        noteNames.push(NoteName_1.octaveThreeNoteNames[localIndex] || "none");
                        break;
                    case 3:
                        noteNames.push(NoteName_1.octaveFourNoteNames[localIndex] || "none");
                        break;
                }
            }
        }
    }
    return noteNames;
}
//# sourceMappingURL=getNoteNamesUsedInTuningSystem.js.map