"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transpose_1 = require("../functions/transpose");
class JinsTemplate {
    constructor(id, name, noteNames, commentsEnglish, commentsArabic, SourcePageReferences) {
        this.id = id;
        this.name = name;
        this.noteNames = noteNames;
        this.commentsEnglish = commentsEnglish;
        this.commentsArabic = commentsArabic;
        this.SourcePageReferences = SourcePageReferences;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getNoteNames() {
        return this.noteNames;
    }
    getCommentsEnglish() {
        return this.commentsEnglish;
    }
    getCommentsArabic() {
        return this.commentsArabic;
    }
    getSourcePageReferences() {
        return this.SourcePageReferences;
    }
    isJinsSelectable(allNoteNames) {
        return this.noteNames.every((noteName) => allNoteNames.some((allNoteName) => allNoteName === noteName));
    }
    createJinsWithNewSourcePageReferences(newSourcePageReferences) {
        return new JinsTemplate(this.id, this.name, this.noteNames, this.commentsEnglish, this.commentsArabic, newSourcePageReferences);
    }
    getTahlil(allPitchClasses) {
        const pitchClasses = allPitchClasses.filter((pitchClass) => this.noteNames.includes(pitchClass.noteName));
        const pitchClassIntervals = (0, transpose_1.getPitchClassIntervals)(pitchClasses);
        return {
            jinsId: this.id,
            name: this.name,
            transposition: false,
            jinsPitchClasses: pitchClasses,
            jinsPitchClassIntervals: pitchClassIntervals,
        };
    }
    convertToObject() {
        return {
            id: this.id,
            name: this.name,
            noteNames: this.noteNames,
            commentsEnglish: this.commentsEnglish,
            commentsArabic: this.commentsArabic,
            SourcePageReferences: this.SourcePageReferences,
        };
    }
}
exports.default = JinsTemplate;
//# sourceMappingURL=Jins.js.map