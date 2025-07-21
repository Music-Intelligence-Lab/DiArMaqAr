"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transpose_1 = require("../functions/transpose");
class MaqamTemplate {
    constructor(id, name, ascendingNoteNames, descendingNoteNames, suyūr, commentsEnglish, commentsArabic, sourcePageReferences) {
        this.id = id;
        this.name = name;
        this.ascendingNoteNames = ascendingNoteNames;
        this.descendingNoteNames = descendingNoteNames;
        this.suyūr = suyūr;
        this.commentsEnglish = commentsEnglish;
        this.commentsArabic = commentsArabic;
        this.sourcePageReferences = sourcePageReferences;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getAscendingNoteNames() {
        return this.ascendingNoteNames;
    }
    getDescendingNoteNames() {
        return this.descendingNoteNames;
    }
    getSuyūr() {
        return this.suyūr;
    }
    getCommentsEnglish() {
        return this.commentsEnglish;
    }
    getCommentsArabic() {
        return this.commentsArabic;
    }
    getSourcePageReferences() {
        return this.sourcePageReferences;
    }
    isMaqamSymmetric() {
        if (this.ascendingNoteNames.length !== this.descendingNoteNames.length) {
            return false;
        }
        for (let i = 0; i < this.ascendingNoteNames.length; i++) {
            if (this.ascendingNoteNames[i] !== this.descendingNoteNames[this.descendingNoteNames.length - 1 - i]) {
                return false;
            }
        }
        return true;
    }
    isMaqamSelectable(allNoteNames) {
        return (this.ascendingNoteNames.every((noteName) => allNoteNames.includes(noteName)) &&
            this.descendingNoteNames.every((noteName) => allNoteNames.includes(noteName)));
    }
    getTahlil(allPitchClasses) {
        const ascendingPitchClasses = allPitchClasses.filter((pitchClass) => this.ascendingNoteNames.includes(pitchClass.noteName));
        const ascendingPitchClassIntervals = (0, transpose_1.getPitchClassIntervals)(ascendingPitchClasses);
        const descendingPitchClasses = allPitchClasses.filter((pitchClass) => this.descendingNoteNames.includes(pitchClass.noteName)).reverse();
        const descendingPitchClassIntervals = (0, transpose_1.getPitchClassIntervals)(descendingPitchClasses);
        return {
            maqamId: this.id,
            name: this.name,
            transposition: false,
            ascendingPitchClasses: ascendingPitchClasses,
            ascendingPitchClassIntervals: ascendingPitchClassIntervals,
            descendingPitchClasses: descendingPitchClasses,
            descendingPitchClassIntervals: descendingPitchClassIntervals,
        };
    }
    createMaqamWithNewSuyūr(newSuyūr) {
        return new MaqamTemplate(this.id, this.name, this.ascendingNoteNames, this.descendingNoteNames, newSuyūr, this.commentsEnglish, this.commentsArabic, this.sourcePageReferences);
    }
    createMaqamWithNewSourcePageReferences(newSourcePageReferences) {
        return new MaqamTemplate(this.id, this.name, this.ascendingNoteNames, this.descendingNoteNames, this.suyūr, this.commentsEnglish, this.commentsArabic, newSourcePageReferences);
    }
    convertToObject() {
        return {
            id: this.id,
            name: this.name,
            ascendingNoteNames: this.ascendingNoteNames,
            descendingNoteNames: this.descendingNoteNames,
            suyūr: this.suyūr,
            commentsEnglish: this.commentsEnglish,
            commentsArabic: this.commentsArabic,
            sourcePageReferences: this.sourcePageReferences,
        };
    }
}
exports.default = MaqamTemplate;
//# sourceMappingURL=Maqam.js.map