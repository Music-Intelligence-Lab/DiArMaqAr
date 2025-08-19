import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import TuningSystem from "@/models/TuningSystem";
import fs from "fs";
import path from "path";

interface AnalyticsRow {
  id: string;
  label: string;
  possibleAjnasCount: number;
  possibleAjnasTranspositionsCount: number;
  totalAjnas: number;
  possibleMaqamatCount: number;
  possibleMaqamatTranspositionsCount: number;
  totalMaqamat: number;
  totalSuyur: number;
  totalAjnasModulations: number;
  totalMaqamatModulations: number;
}

/**
 * Computes comprehensive analytics for a specific tuning system.
 *
 * This function analyzes a tuning system to calculate various metrics including
 * the number of possible ajnas, maqamat, their transpositions, modulations, and
 * total suyur. The analysis is performed for each possible
 * starting note in the tuning system.
 *
 * @param tuningSystem - The tuning system to analyze
 * @param allAjnas - Array of all available ajnas (tetrachordal units)
 * @param allMaqamat - Array of all available maqamat (modal structures)
 * @returns Array of analytics rows, one for each starting note in the tuning system
 */
function computeAnalyticsForSystem(tuningSystem: TuningSystem, allAjnas: ReturnType<typeof getAjnas>, allMaqamat: ReturnType<typeof getMaqamat>): AnalyticsRow[] {
  const rows: AnalyticsRow[] = [];
  const totalNumberOfAjnas = allAjnas.length;
  const totalNumberOfMaqamat = allMaqamat.length;
  const allNoteNameLists = tuningSystem.getNoteNameSets();
  for (const noteNames of allNoteNameLists) {
    const starting = noteNames[0];
    const rowId = tuningSystem.getId() + starting;
    const label = `${tuningSystem.stringify()} ${starting}`;
    const allPitchClasses = getTuningSystemCells(tuningSystem, starting);
    const possibleAjnas = [];
    const possibleAjnasTrans = [];
    for (const jinsData of allAjnas) {
      if (jinsData.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
        possibleAjnas.push(jinsData);
        getJinsTranspositions(allPitchClasses, jinsData, false).forEach((tr) => possibleAjnasTrans.push(tr));
      }
    }
    let totalSuyur = 0;
    const possibleMaqamat = [];
    const possibleMaqamatTrans = [];
    let totalAjnasMod = 0;
    let totalMaqamatMod = 0;
    for (const maqamData of allMaqamat) {
      if (maqamData.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
        possibleMaqamat.push(maqamData);
        totalSuyur += maqamData.getSuyūr().length;
        getMaqamTranspositions(allPitchClasses, allAjnas, maqamData, false).forEach((transposition) => {
          possibleMaqamatTrans.push(transposition);
          totalAjnasMod += calculateNumberOfModulations(modulate(allPitchClasses, allAjnas, allMaqamat, transposition, true));
          totalMaqamatMod += calculateNumberOfModulations(modulate(allPitchClasses, allAjnas, allMaqamat, transposition, false));
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

/**
 * Generates comprehensive analytics for all tuning systems and writes the results to a JSON file.
 *
 * This function computes analytics for every available tuning system, combining the results
 * into a single dataset that can be used for comparative analysis. The output is written
 * to 'public/data/analytics.json' for use by the web application.
 *
 * The analytics include metrics such as:
 * - Number of possible ajnas and maqamat per tuning system
 * - Transposition possibilities
 * - Modulation counts
 * - Total number of available suyur (melodic progressions)
 */
export function generateAndWriteAnalytics() {
  const systems = getTuningSystems();
  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();
  const analyticsRows = systems.flatMap((ts) => computeAnalyticsForSystem(ts, allAjnas, allMaqamat));
  const outputDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "analytics.json");
  fs.writeFileSync(outputPath, JSON.stringify(analyticsRows, null, 2), "utf-8");
}

// To run this script from the command line:
// npx ts-node data/generate-analytics.ts
// or add a script to your package.json

if (require.main === module) {
  generateAndWriteAnalytics();
}
