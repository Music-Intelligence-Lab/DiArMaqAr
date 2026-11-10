/**
 * Writes the archive statistics to src/generated/statistics.json, which the
 * /statistics page and GET /api/statistics serve.
 *
 * Runs before every `npm run build` (the `prebuild` script), so each deploy
 * publishes statistics computed from the data it ships. The file is not
 * committed. When it already matches the data (same fingerprint) it is left
 * alone, so a rebuild without data changes costs nothing.
 *
 *   npm run generate-statistics             # skip if up to date
 *   npm run generate-statistics -- --force  # always recompute
 */
import fs from "fs";
import path from "path";
import { computeArchiveStatistics, dataFingerprint } from "@/functions/archiveStatistics";

export const STATISTICS_FILE = path.join(process.cwd(), "src", "generated", "statistics.json");

function isUpToDate(): boolean {
  if (!fs.existsSync(STATISTICS_FILE)) return false;
  try {
    return JSON.parse(fs.readFileSync(STATISTICS_FILE, "utf-8")).dataFingerprint === dataFingerprint();
  } catch {
    return false;
  }
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  if (!force && isUpToDate()) {
    console.log("Statistics are up to date with data/*.json");
  } else {
    const started = Date.now();
    const statistics = computeArchiveStatistics((row) =>
      console.log(`  ${row.tuningSystem.id} ${row.startingNote.displayName}`)
    );
    fs.mkdirSync(path.dirname(STATISTICS_FILE), { recursive: true });
    fs.writeFileSync(STATISTICS_FILE, JSON.stringify(statistics, null, 2) + "\n", "utf-8");
    console.log(`Wrote ${statistics.tuningSystems.length} rows to ${path.relative(process.cwd(), STATISTICS_FILE)} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  }
}
