import { AjnasModulations as AjnasModulations } from "../models/Jins";
import { MaqamatModulations as MaqamatModulations } from "../models/Maqam";
type ModulationType = "all" | "ajnas" | "maqamat";
/**
 * Calculates the number of modulations, optionally filtering by type (ajnas or maqamat).
 * @param modulations The modulations object.
 * @param type 'all' (default): count all modulations; 'ajnas': only ajnas; 'maqamat': only maqamat
 */
export default function calculateNumberOfModulations(modulations: MaqamatModulations | AjnasModulations, type?: ModulationType): number;
export {};
//# sourceMappingURL=calculateNumberOfModulations.d.ts.map