"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NoteName_1 = require("./NoteName");
class TuningSystem {
    constructor(titleEnglish, titleArabic, year, sourceEnglish, sourceArabic, SourcePageReferences, creatorEnglish, creatorArabic, commentsEnglish, commentsArabic, notes, setsOfTuningNoteNames, abjadNames, stringLength, referenceFrequencies, defaultReferenceFrequency, saved) {
        this.id = `${creatorEnglish}-(${year})-${titleEnglish}`.replaceAll(" ", "").replaceAll("+", "");
        this.titleEnglish = titleEnglish;
        this.titleArabic = titleArabic;
        this.year = year;
        this.sourceEnglish = sourceEnglish;
        this.sourceArabic = sourceArabic;
        this.sourcePageReferences = SourcePageReferences;
        this.creatorEnglish = creatorEnglish;
        this.creatorArabic = creatorArabic;
        this.commentsEnglish = commentsEnglish;
        this.commentsArabic = commentsArabic;
        this.tuningSystemPitchClasses = notes;
        this.setsOfTuningSystemNoteNames = setsOfTuningNoteNames;
        this.abjadNames = abjadNames;
        this.stringLength = stringLength;
        this.referenceFrequencies = referenceFrequencies;
        this.defaultReferenceFrequency = defaultReferenceFrequency;
        this.saved = saved;
    }
    getId() {
        return this.id;
    }
    getTitleEnglish() {
        return this.titleEnglish;
    }
    getTitleArabic() {
        return this.titleArabic;
    }
    getYear() {
        return this.year;
    }
    getSourceEnglish() {
        return this.sourceEnglish;
    }
    getSourceArabic() {
        return this.sourceArabic;
    }
    getSourcePageReferences() {
        return this.sourcePageReferences;
    }
    getCreatorEnglish() {
        return this.creatorEnglish;
    }
    getCreatorArabic() {
        return this.creatorArabic;
    }
    getCommentsEnglish() {
        return this.commentsEnglish;
    }
    getCommentsArabic() {
        return this.commentsArabic;
    }
    getPitchClasses() {
        return this.tuningSystemPitchClasses;
    }
    getNoteNames() {
        return this.setsOfTuningSystemNoteNames;
    }
    getAbjadNames() {
        return this.abjadNames;
    }
    getStringLength() {
        return this.stringLength;
    }
    getReferenceFrequencies() {
        return this.referenceFrequencies;
    }
    getDefaultReferenceFrequency() {
        return this.defaultReferenceFrequency;
    }
    isSaved() {
        return this.saved;
    }
    stringify() {
        return `${this.getCreatorEnglish()} (${this.getYear() ? this.getYear() : "NA"}) ${this.getTitleEnglish()}`;
    }
    getSetsOfNoteNamesShiftedUpAndDown() {
        const usedNoteNames = [];
        for (const set of this.setsOfTuningSystemNoteNames) {
            usedNoteNames.push([...set.map((noteName) => (0, NoteName_1.shiftNoteName)(noteName, -1)), ...set, ...set.map((noteName) => (0, NoteName_1.shiftNoteName)(noteName, 1))]);
        }
        return usedNoteNames;
    }
    copyWithNewSetOfNoteNames(newNoteNames) {
        return new TuningSystem(this.titleEnglish, this.titleArabic, this.year, this.sourceEnglish, this.sourceArabic, this.sourcePageReferences, this.creatorEnglish, this.creatorArabic, this.commentsEnglish, this.commentsArabic, this.tuningSystemPitchClasses, newNoteNames, this.abjadNames, this.stringLength, this.referenceFrequencies, this.defaultReferenceFrequency, this.saved);
    }
    static createBlankTuningSystem() {
        return new TuningSystem("Untitled", "غير مسمى", "", "Unknown Source", "مصدر غير معروف", [], "Unknown Creator", "مؤلف غير معروف", "", "", [], [], [], 0, {}, 440, false);
    }
}
exports.default = TuningSystem;
//# sourceMappingURL=TuningSystem.js.map