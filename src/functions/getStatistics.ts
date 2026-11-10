import statistics from "@/generated/statistics.json";
import { ArchiveStatistics, dataFingerprint } from "@/functions/archiveStatistics";

let checked: ArchiveStatistics | undefined;

/**
 * The archive statistics written by `npm run generate-statistics`.
 *
 * Throws when they were computed from other data than the app is serving
 * (in development, after editing data/*.json). Old numbers are never shown
 * as current ones.
 */
export function getStatistics(): ArchiveStatistics {
  if (checked) return checked;
  const loaded = statistics as ArchiveStatistics;
  if (loaded.dataFingerprint !== dataFingerprint()) {
    throw new Error("The statistics were computed from different data. Run `npm run generate-statistics`.");
  }
  checked = loaded;
  return checked;
}
