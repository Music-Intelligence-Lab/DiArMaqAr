"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTuningSystem = exportTuningSystem;
exports.exportJins = exportJins;
exports.exportMaqam = exportMaqam;
const getTuningSystemCells_1 = __importDefault(require("./getTuningSystemCells"));
const import_1 = require("./import");
const transpose_1 = require("./transpose");
const modulate_1 = __importDefault(require("./modulate"));
const calculateNumberOfModulations_1 = __importDefault(require("./calculateNumberOfModulations"));
function exportTuningSystem(tuningSystem, startingNote, options, centsTolerance = 5) {
    const result = {};
    // Always calculate basic counts for display
    const allAjnas = (0, import_1.getAjnas)();
    const allMaqamat = (0, import_1.getMaqamat)();
    result.numberOfAjnas = allAjnas.length;
    result.numberOfMaqamat = allMaqamat.length;
    // Include tuning system details if requested
    if (options.includeTuningSystemDetails) {
        result.tuningSystem = tuningSystem;
        result.startingNote = startingNote;
    }
    // Include pitch classes if requested
    const fullRangeTuningSystemPitchClasses = (0, getTuningSystemCells_1.default)(tuningSystem, startingNote);
    if (options.includePitchClasses) {
        result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
    }
    // Filter possible ajnas and maqamat
    const possibleAjnasOverview = allAjnas.filter((jins) => jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)));
    const possibleMaqamatOverview = allMaqamat.filter((maqam) => maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
        maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)));
    // Always include the counts
    result.numberOfPossibleAjnas = possibleAjnasOverview.length;
    result.numberOfPossibleMaqamat = possibleMaqamatOverview.length;
    // Include ajnas details if requested
    if (options.includeAjnasDetails) {
        const possibleAjnas = [];
        for (let i = 0; i < possibleAjnasOverview.length; i++) {
            const jins = possibleAjnasOverview[i];
            let numberOfTranspositions = 0;
            for (const jinsTransposition of (0, transpose_1.getJinsTranspositions)(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
                possibleAjnas.push(jinsTransposition);
                numberOfTranspositions++;
            }
            possibleAjnasOverview[i] = jins.convertToObject();
            possibleAjnasOverview[i].numberOfTranspositions = numberOfTranspositions;
        }
        result.possibleAjnasOverview = possibleAjnasOverview;
        result.possibleAjnas = possibleAjnas;
    }
    // Include maqamat details if requested
    if (options.includeMaqamatDetails) {
        const possibleMaqamat = [];
        for (let i = 0; i < possibleMaqamatOverview.length; i++) {
            const maqam = possibleMaqamatOverview[i];
            let numberOfTranspositions = 0;
            for (const maqamTransposition of (0, transpose_1.getMaqamTranspositions)(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
                // Include modulations if requested
                if (options.includeModulations) {
                    const useAjnasModulations = options.modulationType === 'ajnas';
                    const modulations = (0, modulate_1.default)(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
                    const numberOfHops = (0, calculateNumberOfModulations_1.default)(modulations);
                    maqamTransposition.numberOfHops = numberOfHops;
                }
                possibleMaqamat.push(maqamTransposition);
                numberOfTranspositions++;
            }
            possibleMaqamatOverview[i] = maqam.convertToObject();
            possibleMaqamatOverview[i].numberOfTranspositions = numberOfTranspositions;
        }
        result.possibleMaqamatOverview = possibleMaqamatOverview;
        result.possibleMaqamat = possibleMaqamat;
    }
    return result;
}
function exportJins(jins, tuningSystem, startingNote, options, centsTolerance = 5) {
    const result = {};
    const fullRangeTuningSystemPitchClasses = (0, getTuningSystemCells_1.default)(tuningSystem, startingNote);
    // Include tuning system details if requested
    if (options.includeTuningSystemDetails) {
        result.tuningSystem = tuningSystem;
        result.startingNote = startingNote;
    }
    // Include pitch classes if requested
    if (options.includePitchClasses) {
        result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
    }
    // Include jins details
    result.jinsDetails = jins.convertToObject();
    // Include transpositions if requested
    if (options.includeTranspositions) {
        const transpositions = [];
        let numberOfTranspositions = 0;
        for (const jinsTransposition of (0, transpose_1.getJinsTranspositions)(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
            transpositions.push(jinsTransposition);
            numberOfTranspositions++;
        }
        result.transpositions = transpositions;
        result.numberOfTranspositions = numberOfTranspositions;
        result.jinsDetails.numberOfTranspositions = numberOfTranspositions;
    }
    return result;
}
function exportMaqam(maqam, tuningSystem, startingNote, options, centsTolerance = 5) {
    const result = {};
    const fullRangeTuningSystemPitchClasses = (0, getTuningSystemCells_1.default)(tuningSystem, startingNote);
    // Include tuning system details if requested
    if (options.includeTuningSystemDetails) {
        result.tuningSystem = tuningSystem;
        result.startingNote = startingNote;
    }
    // Include pitch classes if requested
    if (options.includePitchClasses) {
        result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
    }
    // Include maqam details
    result.maqamDetails = maqam.convertToObject();
    // Include modulations if requested (for the base maqam)
    if (options.includeModulations) {
        const allAjnas = (0, import_1.getAjnas)();
        const allMaqamat = (0, import_1.getMaqamat)();
        const useAjnasModulations = options.modulationType === 'ajnas';
        // Use getTahlil to get the base maqam instance
        const baseMaqam = maqam.getTahlil(fullRangeTuningSystemPitchClasses);
        const modulations = (0, modulate_1.default)(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, baseMaqam, useAjnasModulations, centsTolerance);
        const numberOfHops = (0, calculateNumberOfModulations_1.default)(modulations);
        result.modulations = modulations;
        result.numberOfHops = numberOfHops;
    }
    // Include transpositions if requested
    if (options.includeTranspositions) {
        const transpositions = [];
        let numberOfTranspositions = 0;
        const allAjnas = (0, import_1.getAjnas)();
        const allMaqamat = (0, import_1.getMaqamat)();
        for (const maqamTransposition of (0, transpose_1.getMaqamTranspositions)(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
            // Include modulations for each transposition if requested
            if (options.includeModulations) {
                const useAjnasModulations = options.modulationType === 'ajnas';
                const modulations = (0, modulate_1.default)(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
                const numberOfHops = (0, calculateNumberOfModulations_1.default)(modulations);
                maqamTransposition.numberOfHops = numberOfHops;
            }
            transpositions.push(maqamTransposition);
            numberOfTranspositions++;
        }
        result.transpositions = transpositions;
        result.numberOfTranspositions = numberOfTranspositions;
        result.maqamDetails.numberOfTranspositions = numberOfTranspositions;
    }
    return result;
}
//# sourceMappingURL=export.js.map