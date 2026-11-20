import TuningSystem from "@/models/TuningSystem";
import validateStoredOctaves from "@/functions/validateStoredOctaves";
import validateSourceOud from "@/functions/validateSourceOud";

/**
 * Every check a tuning system must pass to be loaded or saved: its stored
 * octaves, then the ʿūd its source describes. Each throws, naming the problem.
 */
export default function validateTuningSystem(tuningSystem: TuningSystem): void {
  validateStoredOctaves(tuningSystem);
  validateSourceOud(tuningSystem);
}
