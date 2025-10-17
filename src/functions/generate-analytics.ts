import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import { calculateJinsTranspositions, calculateMaqamTranspositions } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
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
 * @param showProgress - Whether to show progress logging
 * @returns Array of analytics rows, one for each starting note in the tuning system
 */
function computeAnalyticsForSystem(tuningSystem: TuningSystem, allAjnas: ReturnType<typeof getAjnas>, allMaqamat: ReturnType<typeof getMaqamat>, showProgress: boolean = false): AnalyticsRow[] {
  const rows: AnalyticsRow[] = [];
  const totalNumberOfAjnas = allAjnas.length;
  const totalNumberOfMaqamat = allMaqamat.length;
  const allNoteNameLists = tuningSystem.getNoteNameSets();
  if (showProgress) {
    console.log(`    Processing ${allNoteNameLists.length} note sets for ${tuningSystem.stringify()}`);
  }
  for (const noteNames of allNoteNameLists) {
    const starting = noteNames[0];
    const rowId = tuningSystem.getId() + starting;
    const label = `${tuningSystem.stringify()} ${starting}`;
    const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, starting);
    const possibleAjnas = [];
    const possibleAjnasTrans = [];
    for (const jinsData of allAjnas) {
      if (jinsData.isJinsPossible(allPitchClasses.map((pc) => pc.noteName))) {
        possibleAjnas.push(jinsData);
        calculateJinsTranspositions(allPitchClasses, jinsData, false).forEach((tr) => possibleAjnasTrans.push(tr));
      }
    }
    let totalSuyur = 0;
    const possibleMaqamat = [];
    const possibleMaqamatTrans = [];
    let totalAjnasMod = 0;
    let totalMaqamatMod = 0;
    for (const maqamData of allMaqamat) {
      if (maqamData.isMaqamPossible(allPitchClasses.map((pc) => pc.noteName))) {
        possibleMaqamat.push(maqamData);
        totalSuyur += maqamData.getSuyūr().length;
        calculateMaqamTranspositions(allPitchClasses, allAjnas, maqamData, false).forEach((transposition) => {
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
 * to 'public/data/analytics-[timestamp].json' for use by the web application.
 *
 * The analytics include metrics such as:
 * - Number of possible ajnas and maqamat per tuning system
 * - Transposition possibilities
 * - Modulation counts
 * - Total number of available suyur (melodic progressions)
 * 
 * @param useTimestamp - Whether to include timestamp in filename (default: true)
 * @param showProgress - Whether to show progress logging (default: true)
 * @returns The path of the created file
 */
export function generateAndWriteAnalytics(useTimestamp: boolean = true, showProgress: boolean = true): string {
  if (showProgress) {
    console.log("🎵 Starting maqam analytics generation...");
    console.time("Total generation time");
  }

  const systems = getTuningSystems();
  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();

  if (showProgress) {
    console.log(`📊 Found ${systems.length} tuning systems, ${allAjnas.length} ajnas, ${allMaqamat.length} maqamat`);
    console.log("🔄 Processing tuning systems...");
  }

  const analyticsRows: AnalyticsRow[] = [];
  
  systems.forEach((ts, index) => {
    if (showProgress) {
      console.log(`  [${index + 1}/${systems.length}] ${ts.stringify()}`);
    }
    const systemRows = computeAnalyticsForSystem(ts, allAjnas, allMaqamat, showProgress);
    analyticsRows.push(...systemRows);
  });

  // Create output directory
  const outputDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with optional timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
  const dateStr = timestamp[0]; // YYYY-MM-DD
  const timeStr = timestamp[1].split('.')[0]; // HH-MM-SS
  const filename = useTimestamp 
    ? `analytics-${dateStr}-${timeStr}.json`
    : "analytics.json";
  
  const outputPath = path.join(outputDir, filename);
  
  if (showProgress) {
    console.log(`💾 Writing ${analyticsRows.length} analytics rows to ${filename}...`);
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(analyticsRows, null, 2), "utf-8");
  
  if (showProgress) {
    console.log(`✅ Analytics file created: ${outputPath}`);
    console.timeEnd("Total generation time");
  }

  return outputPath;
}

// To run this script from the command line:
// npm run generate-analytics
// or with custom options:
// npm run generate-analytics -- --no-timestamp --no-progress

if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const useTimestamp = !args.includes('--no-timestamp');
  const showProgress = !args.includes('--no-progress');
  
  generateAndWriteAnalytics(useTimestamp, showProgress);
}
