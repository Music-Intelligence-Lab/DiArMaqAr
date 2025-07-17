"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCALE_DEGREES = exports.DURATION_OPTIONS = void 0;
exports.reversePatternNotes = reversePatternNotes;
class Pattern {
    constructor(id, name, notes) {
        this.id = id;
        this.name = name;
        this.notes = notes;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getNotes() {
        return this.notes;
    }
    convertToJSON() {
        return {
            id: this.id,
            name: this.name,
            notes: this.notes,
        };
    }
}
exports.default = Pattern;
exports.DURATION_OPTIONS = [
    "32n",
    "32d",
    "32t",
    "16n",
    "16d",
    "16t",
    "8n",
    "8d",
    "8t",
    "4n",
    "4d",
    "4t",
    "2n",
    "2d",
    "2t",
    "1n",
    "1d",
    "1t",
];
exports.SCALE_DEGREES = [
    "-I",
    "-II",
    "-III",
    "-IV",
    "-V",
    "-VI",
    "-VII",
    "R",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "+I",
    "+II",
    "+III",
    "+IV",
    "+V",
    "+VI",
    "+VII",
];
function reversePatternNotes(notes) {
    const reversedScaleDegrees = notes.map((note) => note.scaleDegree).reverse();
    return notes.map((note, index) => ({
        scaleDegree: reversedScaleDegrees[index],
        noteDuration: note.noteDuration,
        isTarget: note.isTarget,
        velocity: note.velocity,
    }));
}
//# sourceMappingURL=Pattern.js.map