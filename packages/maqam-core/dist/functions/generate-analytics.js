"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndWriteAnalytics = generateAndWriteAnalytics;
const import_1 = require("../functions/import");
const transpose_1 = require("../functions/transpose");
const modulate_1 = __importDefault(require("../functions/modulate"));
const getTuningSystemCells_1 = __importDefault(require("../functions/getTuningSystemCells"));
const calculateNumberOfModulations_1 = __importDefault(require("../functions/calculateNumberOfModulations"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function computeAnalyticsForSystem(tuningSystem, allAjnas, allMaqamat) {
    const rows = [];
    const totalNumberOfAjnas = allAjnas.length;
    const totalNumberOfMaqamat = allMaqamat.length;
    const allNoteNameLists = tuningSystem.getNoteNames();
    for (const noteNames of allNoteNameLists) {
        const starting = noteNames[0];
        const rowId = tuningSystem.getId() + starting;
        const label = `${tuningSystem.stringify()} ${starting}`;
        const allPitchClasses = (0, getTuningSystemCells_1.default)(tuningSystem, starting);
        const possibleAjnas = [];
        const possibleAjnasTrans = [];
        for (const jinsTemplate of allAjnas) {
            if (jinsTemplate.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                possibleAjnas.push(jinsTemplate);
                (0, transpose_1.getJinsTranspositions)(allPitchClasses, jinsTemplate, false).forEach((tr) => possibleAjnasTrans.push(tr));
            }
        }
        let totalSuyur = 0;
        const possibleMaqamat = [];
        const possibleMaqamatTrans = [];
        let totalAjnasMod = 0;
        let totalMaqamatMod = 0;
        for (const maqamTemplate of allMaqamat) {
            if (maqamTemplate.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                possibleMaqamat.push(maqamTemplate);
                totalSuyur += maqamTemplate.getSuyūr().length;
                (0, transpose_1.getMaqamTranspositions)(allPitchClasses, allAjnas, maqamTemplate, false).forEach((transposition) => {
                    possibleMaqamatTrans.push(transposition);
                    totalAjnasMod += (0, calculateNumberOfModulations_1.default)((0, modulate_1.default)(allPitchClasses, allAjnas, allMaqamat, transposition, true));
                    totalMaqamatMod += (0, calculateNumberOfModulations_1.default)((0, modulate_1.default)(allPitchClasses, allAjnas, allMaqamat, transposition, false));
                });
            }
        }
        rows.push({
            id: rowId,
            label,
            possibleAjnasCount: possibleAjnas.length,
            possibleAjnasTranspositionsCount: possibleAjnasTrans.length,
            totalAjnas: totalNumberOfAjnas,
            possibleMaqamatCount: possibleMaqamat.length,
            possibleMaqamatTranspositionsCount: possibleMaqamatTrans.length,
            totalMaqamat: totalNumberOfMaqamat,
            totalSuyur,
            totalAjnasModulations: totalAjnasMod,
            totalMaqamatModulations: totalMaqamatMod,
        });
    }
    return rows;
}
function generateAndWriteAnalytics() {
    const systems = (0, import_1.getTuningSystems)();
    const allAjnas = (0, import_1.getAjnas)();
    const allMaqamat = (0, import_1.getMaqamat)();
    const analyticsRows = systems.flatMap((ts) => computeAnalyticsForSystem(ts, allAjnas, allMaqamat));
    const outputDir = path_1.default.join(process.cwd(), "public", "data");
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path_1.default.join(outputDir, "analytics.json");
    fs_1.default.writeFileSync(outputPath, JSON.stringify(analyticsRows, null, 2), "utf-8");
}
// To run this script from the command line:
// npx ts-node data/generate-analytics.ts
// or add a script to your package.json
if (require.main === module) {
    generateAndWriteAnalytics();
}
//# sourceMappingURL=generate-analytics.js.map