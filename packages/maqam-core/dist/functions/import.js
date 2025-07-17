"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTuningSystems = getTuningSystems;
exports.getAjnas = getAjnas;
exports.getMaqamat = getMaqamat;
exports.getSources = getSources;
exports.getPatterns = getPatterns;
const tuningSystems_json_1 = __importDefault(require("../data/tuningSystems.json"));
const ajnas_json_1 = __importDefault(require("../data/ajnas.json"));
const maqamat_json_1 = __importDefault(require("../data/maqamat.json"));
const sources_json_1 = __importDefault(require("../data/sources.json"));
const patterns_json_1 = __importDefault(require("../data/patterns.json"));
const TuningSystem_1 = __importDefault(require("../models/TuningSystem"));
const Jins_1 = __importDefault(require("../models/Jins"));
const Maqam_1 = __importDefault(require("../models/Maqam"));
const Book_1 = __importDefault(require("../models/bibliography/Book"));
const Article_1 = __importDefault(require("../models/bibliography/Article"));
const Pattern_1 = __importDefault(require("../models/Pattern"));
function getTuningSystems() {
    return tuningSystems_json_1.default.map((d) => new TuningSystem_1.default(d.titleEnglish, d.titleArabic, d.year, d.sourceEnglish, d.sourceArabic, d.sourcePageReferences, d.creatorEnglish, d.creatorArabic, d.commentsEnglish, d.commentsArabic, d.tuningSystemPitchClasses, d.noteNames, d.abjadNames, Number(d.stringLength), d.referenceFrequencies, Number(d.defaultReferenceFrequency), true));
}
function getAjnas() {
    return ajnas_json_1.default.map((d) => new Jins_1.default(d.id, d.name, d.noteNames, d.commentsEnglish, d.commentsArabic, d.sourcePageReferences));
}
function getMaqamat() {
    return maqamat_json_1.default.map((d) => new Maqam_1.default(d.id, d.name, d.ascendingNoteNames, d.descendingNoteNames, d.suyūr, d.commentsEnglish, d.commentsArabic, d.sourcePageReferences));
}
function getSources() {
    return sources_json_1.default.map((d) => {
        switch (d.sourceType) {
            case "Book":
                return Book_1.default.fromJSON(d);
            case "Article":
                return Article_1.default.fromJSON(d);
            default:
                throw new Error(`Unknown sourceType "${d.sourceType}"`);
        }
    });
}
function getPatterns() {
    return patterns_json_1.default.map((data) => new Pattern_1.default(data.id, data.name, data.notes.map((note) => {
        const base = {
            scaleDegree: note.scaleDegree,
            noteDuration: note.noteDuration,
            isTarget: note.isTarget || false,
        };
        if (typeof note.velocity === "number") {
            return { ...base, velocity: note.velocity };
        }
        return base;
    })));
}
//# sourceMappingURL=import.js.map