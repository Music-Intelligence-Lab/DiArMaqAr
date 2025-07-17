"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getTuningSystemCells;
const NoteName_1 = require("../models/NoteName");
const detectPitchClassType_1 = __importDefault(require("../functions/detectPitchClassType"));
const convertPitchClass_1 = __importStar(require("../functions/convertPitchClass"));
const noteNameMappings_1 = require("../functions/noteNameMappings");
function getTuningSystemCells(tuningSystem, startingNote, tuningSystemPitchClasses = [], inputStringLength = 0, inputReferenceFrequencies = {}) {
    const pitchArr = tuningSystemPitchClasses.length ? tuningSystemPitchClasses : tuningSystem.getPitchClasses();
    const nPC = pitchArr.length;
    const allSets = tuningSystem.getNoteNames();
    const noteNames = allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];
    const O1 = NoteName_1.octaveOneNoteNames.length;
    const selectedIndices = noteNames.slice(0, nPC).map((nm) => {
        const i1 = NoteName_1.octaveOneNoteNames.indexOf(nm);
        if (i1 >= 0)
            return i1;
        const i2 = NoteName_1.octaveTwoNoteNames.indexOf(nm);
        if (i2 >= 0)
            return O1 + i2;
        return -1;
    });
    while (selectedIndices.length < nPC)
        selectedIndices.push(-1);
    selectedIndices.length = nPC;
    const type = (0, detectPitchClassType_1.default)(pitchArr);
    if (type === "unknown")
        return [];
    const stringLength = inputStringLength > 0 ? inputStringLength : tuningSystem.getStringLength();
    const actualReferenceFrequency = inputReferenceFrequencies[startingNote] ?? tuningSystem.getReferenceFrequencies()[startingNote] ?? tuningSystem.getDefaultReferenceFrequency();
    const openConv = (0, convertPitchClass_1.default)((0, convertPitchClass_1.shiftPitchClassBaseValue)(pitchArr[0], type, 1), type, stringLength, actualReferenceFrequency);
    const openLen = parseFloat(openConv.stringLength);
    const abjadArr = tuningSystem?.getAbjadNames();
    const pitchClasses = [];
    for (let octave = 0; octave < 4; octave++) {
        for (let idx = 0; idx < nPC; idx++) {
            const basePc = pitchArr[idx];
            const shifted = (0, convertPitchClass_1.shiftPitchClassBaseValue)(basePc, type, octave);
            const conv = (0, convertPitchClass_1.default)(shifted, type, stringLength, actualReferenceFrequency);
            if (!conv)
                continue;
            // noteName
            const ci = selectedIndices[idx];
            let noteName = "none";
            if (ci >= 0) {
                if (ci < O1) {
                    noteName = [NoteName_1.octaveZeroNoteNames, NoteName_1.octaveOneNoteNames, NoteName_1.octaveTwoNoteNames, NoteName_1.octaveThreeNoteNames][octave][ci] ?? "none";
                }
                else {
                    const loc = ci - O1;
                    noteName = [NoteName_1.octaveOneNoteNames, NoteName_1.octaveTwoNoteNames, NoteName_1.octaveThreeNoteNames, NoteName_1.octaveFourNoteNames][octave][loc] ?? "none";
                }
            }
            // abjadName (only for octaves 1 & 2)
            let abjadName = "";
            const offset = octave <= 1 ? 0 : nPC;
            abjadName = abjadArr[offset + idx] || "";
            // fretDivision
            const thisLen = parseFloat(conv.stringLength);
            const fretDivision = (openLen - thisLen).toFixed(3);
            // midi
            const midiNoteNumber = (0, convertPitchClass_1.frequencyToMidiNoteNumber)(parseFloat(conv.frequency));
            pitchClasses.push({
                noteName,
                englishName: (0, noteNameMappings_1.getEnglishNoteName)(noteName),
                fraction: conv.fraction,
                cents: conv.cents,
                decimalRatio: conv.decimal,
                stringLength: conv.stringLength,
                frequency: conv.frequency,
                originalValue: shifted,
                originalValueType: type,
                index: idx,
                octave,
                abjadName,
                fretDivision,
                midiNoteNumber,
            });
        }
    }
    return pitchClasses;
}
//# sourceMappingURL=getTuningSystemCells.js.map