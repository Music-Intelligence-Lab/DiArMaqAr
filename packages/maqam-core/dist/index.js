"use strict";
// Main entry point for @maqam-network/core package
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuningSystemsData = exports.sourcesData = exports.patternsData = exports.maqamatData = exports.ajnasData = exports.shawwaMapping = exports.getTuningSystemCells = exports.getNoteNamesUsedInTuningSystem = exports.getFirstNoteName = exports.calculateNumberOfModulations = exports.extendPitchClasses = exports.modulate = exports.shiftPitchClass = exports.romanToNumber = exports.midiToNoteNumber = exports.detectPitchClassType = exports.camelCaseToWord = exports.computeFractionInterval = exports.gcd = exports.calculateInterval = void 0;
var PitchClass_1 = require("./models/PitchClass");
Object.defineProperty(exports, "calculateInterval", { enumerable: true, get: function () { return PitchClass_1.calculateInterval; } });
// Export utility functions
var gcd_1 = require("./functions/gcd");
Object.defineProperty(exports, "gcd", { enumerable: true, get: function () { return __importDefault(gcd_1).default; } });
var computeFractionInterval_1 = require("./functions/computeFractionInterval");
Object.defineProperty(exports, "computeFractionInterval", { enumerable: true, get: function () { return __importDefault(computeFractionInterval_1).default; } });
var camelCaseToWord_1 = require("./functions/camelCaseToWord");
Object.defineProperty(exports, "camelCaseToWord", { enumerable: true, get: function () { return __importDefault(camelCaseToWord_1).default; } });
var detectPitchClassType_1 = require("./functions/detectPitchClassType");
Object.defineProperty(exports, "detectPitchClassType", { enumerable: true, get: function () { return __importDefault(detectPitchClassType_1).default; } });
var midiToNoteNumber_1 = require("./functions/midiToNoteNumber");
Object.defineProperty(exports, "midiToNoteNumber", { enumerable: true, get: function () { return __importDefault(midiToNoteNumber_1).default; } });
var romanToNumber_1 = require("./functions/romanToNumber");
Object.defineProperty(exports, "romanToNumber", { enumerable: true, get: function () { return __importDefault(romanToNumber_1).default; } });
// Export core music functions
__exportStar(require("./functions/transpose"), exports);
var shiftPitchClass_1 = require("./functions/shiftPitchClass");
Object.defineProperty(exports, "shiftPitchClass", { enumerable: true, get: function () { return __importDefault(shiftPitchClass_1).default; } });
var modulate_1 = require("./functions/modulate");
Object.defineProperty(exports, "modulate", { enumerable: true, get: function () { return __importDefault(modulate_1).default; } });
__exportStar(require("./functions/convertPitchClass"), exports);
var extendPitchClasses_1 = require("./functions/extendPitchClasses");
Object.defineProperty(exports, "extendPitchClasses", { enumerable: true, get: function () { return __importDefault(extendPitchClasses_1).default; } });
// Export analysis functions
var calculateNumberOfModulations_1 = require("./functions/calculateNumberOfModulations");
Object.defineProperty(exports, "calculateNumberOfModulations", { enumerable: true, get: function () { return __importDefault(calculateNumberOfModulations_1).default; } });
var getFirstNoteName_1 = require("./functions/getFirstNoteName");
Object.defineProperty(exports, "getFirstNoteName", { enumerable: true, get: function () { return __importDefault(getFirstNoteName_1).default; } });
var getNoteNamesUsedInTuningSystem_1 = require("./functions/getNoteNamesUsedInTuningSystem");
Object.defineProperty(exports, "getNoteNamesUsedInTuningSystem", { enumerable: true, get: function () { return __importDefault(getNoteNamesUsedInTuningSystem_1).default; } });
var getTuningSystemCells_1 = require("./functions/getTuningSystemCells");
Object.defineProperty(exports, "getTuningSystemCells", { enumerable: true, get: function () { return __importDefault(getTuningSystemCells_1).default; } });
// Export mappings and lookup functions
__exportStar(require("./functions/noteNameMappings"), exports);
var shawwaMapping_1 = require("./functions/shawwaMapping");
Object.defineProperty(exports, "shawwaMapping", { enumerable: true, get: function () { return __importDefault(shawwaMapping_1).default; } });
// Export I/O functions
__exportStar(require("./functions/import"), exports);
__exportStar(require("./functions/export"), exports);
__exportStar(require("./functions/update"), exports);
// Export data
var ajnas_json_1 = require("./data/ajnas.json");
Object.defineProperty(exports, "ajnasData", { enumerable: true, get: function () { return __importDefault(ajnas_json_1).default; } });
var maqamat_json_1 = require("./data/maqamat.json");
Object.defineProperty(exports, "maqamatData", { enumerable: true, get: function () { return __importDefault(maqamat_json_1).default; } });
var patterns_json_1 = require("./data/patterns.json");
Object.defineProperty(exports, "patternsData", { enumerable: true, get: function () { return __importDefault(patterns_json_1).default; } });
var sources_json_1 = require("./data/sources.json");
Object.defineProperty(exports, "sourcesData", { enumerable: true, get: function () { return __importDefault(sources_json_1).default; } });
var tuningSystems_json_1 = require("./data/tuningSystems.json");
Object.defineProperty(exports, "tuningSystemsData", { enumerable: true, get: function () { return __importDefault(tuningSystems_json_1).default; } });
//# sourceMappingURL=index.js.map