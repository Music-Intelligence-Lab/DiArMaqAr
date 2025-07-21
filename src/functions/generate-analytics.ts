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

function computeAnalyticsForSystem(tuningSystem: TuningSystem, allAjnas: ReturnType<typeof getAjnas>, allMaqamat: ReturnType<typeof getMaqamat>): AnalyticsRow[] {
  const rows: AnalyticsRow[] = [];
  const totalNumberOfAjnas = allAjnas.length;
  const totalNumberOfMaqamat = allMaqamat.length;
  const allNoteNameLists = tuningSystem.getNoteNames();
  for (const noteNames of allNoteNameLists) {
    const starting = noteNames[0];
    const rowId = tuningSystem.getId() + starting;
    const label = `${tuningSystem.stringify()} ${starting}`;
    const allPitchClasses = getTuningSystemCells(tuningSystem, starting);
    const possibleAjnas = [];
    const possibleAjnasTrans = [];
    for (const jinsTemplate of allAjnas) {
      if (jinsTemplate.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
        possibleAjnas.push(jinsTemplate);
        getJinsTranspositions(allPitchClasses, jinsTemplate, false).forEach((tr) => possibleAjnasTrans.push(tr));
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
        getMaqamTranspositions(allPitchClasses, allAjnas, maqamTemplate, false).forEach((transposition) => {
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
