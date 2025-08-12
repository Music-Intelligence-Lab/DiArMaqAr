import { AjnasModulations as AjnasModulations } from "@/models/Jins";
import { MaqamatModulations as MaqamatModulations } from "@/models/Maqam";

type ModulationType = "all" | "ajnas" | "maqamat";

/**
 * Calculates the total number of modulations in a modulations object.
 * 
 * This function counts modulations across all scale degrees (1, 3, 4, 5, 6, etc.)
 * and can optionally filter by modulation type (ajnas vs maqamat).
 * 
 * Modulations represent possible transitions from one maqam/jins to another
 * on different scale degrees, which is fundamental to maqam theory and analysis.
 * 
 * @param modulations - The modulations object containing arrays of possible modulations
 * @param type - Filter type: 'all' (default) counts everything, 'ajnas' only counts jins modulations, 'maqamat' only counts maqam modulations
 * @returns The total count of modulations matching the specified type
 * 
 * @example
 * // Count all modulations
 * const total = calculateNumberOfModulations(modulations, "all");
 * 
 * @example
 * // Count only jins modulations
 * const ajnasCount = calculateNumberOfModulations(modulations, "ajnas");
 * 
 * @example
 * // Count only maqam modulations  
 * const maqamatCount = calculateNumberOfModulations(modulations, "maqamat");
 */
export default function calculateNumberOfModulations(modulations: MaqamatModulations | AjnasModulations, type: ModulationType = "all") {
  // Handle null or undefined modulations gracefully
  if (!modulations) return 0;
  
  // Helper function to check if a modulation is a maqam (has ascendingPitchClasses property)
  const isMaqam = (modulation: any) => modulation && "ascendingPitchClasses" in modulation;
  
  // Helper function to check if a modulation is a jins (doesn't have ascendingPitchClasses property)
  const isJins = (modulation: any) => modulation && !("ascendingPitchClasses" in modulation);

  // Collect all modulation arrays from different scale degrees
  // Each array represents modulations possible on a specific scale degree
  const arrays = [
    modulations.modulationsOnOne ?? [],         // Modulations on the first degree (tonic)
    modulations.modulationsOnThree ?? [],       // Modulations on the third degree
    modulations.modulationsOnThree2p ?? [],     // Modulations on the third degree (2-part variant)
    modulations.modulationsOnFour ?? [],        // Modulations on the fourth degree
    modulations.modulationsOnFive ?? [],        // Modulations on the fifth degree
    modulations.modulationsOnSixNoThird ?? [],  // Modulations on the sixth degree without third
    modulations.modulationsOnSixAscending ?? [], // Modulations on the sixth degree (ascending)
    modulations.modulationsOnSixDescending ?? [], // Modulations on the sixth degree (descending)
  ];

  // If counting all modulations, simply sum the lengths of all arrays
  if (type === "all") {
    return arrays.reduce((acc, arr) => acc + arr.length, 0);
  }

  // For filtered counting, examine each modulation individually
  let count = 0;
  for (const arr of arrays) {
    for (const hop of arr) {
      // Count based on the requested type filter
      if (type === "ajnas" && isJins(hop)) count++;
      if (type === "maqamat" && isMaqam(hop)) count++;
    }
  }
  return count;
}
