import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { AjnasModulations, Jins, JinsDataInterface } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations, MaqamDataInterface } from "@/models/Maqam";
import getTuningSystemPitchClasses from "./getTuningSystemPitchClasses";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass from "@/models/PitchClass";
import modulate from "./modulate";
import calculateNumberOfModulations from "./calculateNumberOfModulations";

/**
 * Index-based modulations for Maqamat using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamatModulationsWithIndices {
  /** Indices of modulations that occur on the first scale degree */
  modulationsOnOne: number[];
  
  /** Indices of modulations that occur on the third scale degree */
  modulationsOnThree: number[];
  
  /** Indices of modulations that occur on the third scale degree (second pattern) */
  modulationsOnThree2p: number[];
  
  /** Indices of modulations that occur on the fourth scale degree */
  modulationsOnFour: number[];
  
  /** Indices of modulations that occur on the fifth scale degree */
  modulationsOnFive: number[];
  
  /** Indices of ascending modulations that occur on the sixth scale degree */
  modulationsOnSixAscending: number[];
  
  /** Indices of descending modulations that occur on the sixth scale degree */
  modulationsOnSixDescending: number[];
  
  /** Indices of modulations on the sixth scale degree without using the third */
  modulationsOnSixNoThird: number[];
  
  /** The note name of the second degree (plus variations) */
  noteName2p: string;
}

/**
 * Index-based modulations for Ajnas using array indices instead of full objects
 * to reduce JSON export size
 */
export interface AjnasModulationsWithIndices {
  /** Indices of modulations that occur on the first scale degree */
  modulationsOnOne: number[];
  
  /** Indices of modulations that occur on the third scale degree */
  modulationsOnThree: number[];
  
  /** Indices of modulations that occur on the third scale degree (second pattern) */
  modulationsOnThree2p: number[];
  
  /** Indices of modulations that occur on the fourth scale degree */
  modulationsOnFour: number[];
  
  /** Indices of modulations that occur on the fifth scale degree */
  modulationsOnFive: number[];
  
  /** Indices of ascending modulations that occur on the sixth scale degree */
  modulationsOnSixAscending: number[];
  
  /** Indices of descending modulations that occur on the sixth scale degree */
  modulationsOnSixDescending: number[];
  
  /** Indices of modulations on the sixth scale degree without using the third */
  modulationsOnSixNoThird: number[];
  
  /** The note name of the second degree (plus variations) */
  noteName2p: string;
}

interface ExportedTuningSystem {
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  numberOfPossibleAjnas?: number;
  numberOfAjnas?: number;
  possibleAjnasOverview?: JinsDataInterface[];
  possibleAjnas?: Jins[];
  numberOfPossibleMaqamat?: number;
  numberOfMaqamat?: number;
  possibleMaqamatOverview?: MaqamDataInterface[];
  possibleMaqamat?: MaqamWithAjnasAsObjects[];
  // Index-based modulations ONLY for tuning system exports to handle large datasets
  maqamatReference?: MaqamWithAjnasAsObjects[];
  ajnasReference?: Jins[];
}

export interface ExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails: boolean;
  includeMaqamatDetails: boolean;
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
}

export interface JinsExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeTranspositions: boolean;
}

export interface MaqamExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeTranspositions: boolean;
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
}

interface ExportedJins {
  jins?: Jins; // Export the actual Jins instance instead of JinsData
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  transpositions?: Jins[];
  numberOfTranspositions?: number;
}

interface ExportedMaqam {
  maqam?: MaqamWithAjnasAsObjects; // Export modified Maqam with ajnas as objects
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  transpositions?: MaqamWithAjnasAsObjects[];
  numberOfTranspositions?: number;
  maqamatModulations?: MaqamatModulations; // Reverted to original format
  numberOfMaqamModulationHops?: number;
  ajnasModulations?: AjnasModulations; // Reverted to original format
  numberOfJinsModulationHops?: number;
}

interface MaqamWithAjnasAsObjects extends Omit<Maqam, "ascendingMaqamAjnas" | "descendingMaqamAjnas"> {
  ascendingMaqamAjnas?: { [noteName: string]: Jins | null };
  descendingMaqamAjnas?: { [noteName: string]: Jins | null };
}

/**
 * Converts a MaqamatModulations object to index-based format
 * @param modulations - The full modulations object
 * @param allMaqamat - Array of all available maqamat for reference
 * @returns Index-based modulations object
 */
export function convertMaqamatModulationsToIndices(modulations: MaqamatModulations, allMaqamat: Maqam[]): MaqamatModulationsWithIndices {
  const findMaqamIndex = (maqam: Maqam): number => {
    const index = allMaqamat.findIndex(m => m.maqamId === maqam.maqamId);
    return index !== -1 ? index : -1; // Return -1 if not found
  };

  return {
    modulationsOnOne: modulations.modulationsOnOne.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnThree: modulations.modulationsOnThree.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnThree2p: modulations.modulationsOnThree2p.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnFour: modulations.modulationsOnFour.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnFive: modulations.modulationsOnFive.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnSixAscending: modulations.modulationsOnSixAscending.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnSixDescending: modulations.modulationsOnSixDescending.map(findMaqamIndex).filter(i => i !== -1),
    modulationsOnSixNoThird: modulations.modulationsOnSixNoThird.map(findMaqamIndex).filter(i => i !== -1),
    noteName2p: modulations.noteName2p
  };
}

/**
 * Converts an AjnasModulations object to index-based format
 * @param modulations - The full modulations object
 * @param allAjnas - Array of all available ajnas for reference
 * @returns Index-based modulations object
 */
export function convertAjnasModulationsToIndices(modulations: AjnasModulations, allAjnas: Jins[]): AjnasModulationsWithIndices {
  const findJinsIndex = (jins: Jins): number => {
    const index = allAjnas.findIndex(j => j.jinsId === jins.jinsId);
    return index !== -1 ? index : -1; // Return -1 if not found
  };

  return {
    modulationsOnOne: modulations.modulationsOnOne.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnThree: modulations.modulationsOnThree.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnThree2p: modulations.modulationsOnThree2p.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnFour: modulations.modulationsOnFour.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnFive: modulations.modulationsOnFive.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnSixAscending: modulations.modulationsOnSixAscending.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnSixDescending: modulations.modulationsOnSixDescending.map(findJinsIndex).filter(i => i !== -1),
    modulationsOnSixNoThird: modulations.modulationsOnSixNoThird.map(findJinsIndex).filter(i => i !== -1),
    noteName2p: modulations.noteName2p
  };
}

/**
 * Resolves index-based MaqamatModulations back to full objects
 * @param indexModulations - The index-based modulations
 * @param allMaqamat - Array of all available maqamat for reference
 * @returns Full modulations object
 */
export function resolveMaqamatModulationsFromIndices(indexModulations: MaqamatModulationsWithIndices, allMaqamat: Maqam[]): MaqamatModulations {
  const getMaqamByIndex = (index: number): Maqam | null => {
    return index >= 0 && index < allMaqamat.length ? allMaqamat[index] : null;
  };

  return {
    modulationsOnOne: indexModulations.modulationsOnOne.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnThree: indexModulations.modulationsOnThree.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnThree2p: indexModulations.modulationsOnThree2p.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnFour: indexModulations.modulationsOnFour.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnFive: indexModulations.modulationsOnFive.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnSixAscending: indexModulations.modulationsOnSixAscending.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnSixDescending: indexModulations.modulationsOnSixDescending.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    modulationsOnSixNoThird: indexModulations.modulationsOnSixNoThird.map(getMaqamByIndex).filter(m => m !== null) as Maqam[],
    noteName2p: indexModulations.noteName2p
  };
}

/**
 * Resolves index-based AjnasModulations back to full objects
 * @param indexModulations - The index-based modulations
 * @param allAjnas - Array of all available ajnas for reference
 * @returns Full modulations object
 */
export function resolveAjnasModulationsFromIndices(indexModulations: AjnasModulationsWithIndices, allAjnas: Jins[]): AjnasModulations {
  const getJinsByIndex = (index: number): Jins | null => {
    return index >= 0 && index < allAjnas.length ? allAjnas[index] : null;
  };

  return {
    modulationsOnOne: indexModulations.modulationsOnOne.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnThree: indexModulations.modulationsOnThree.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnThree2p: indexModulations.modulationsOnThree2p.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnFour: indexModulations.modulationsOnFour.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnFive: indexModulations.modulationsOnFive.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnSixAscending: indexModulations.modulationsOnSixAscending.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnSixDescending: indexModulations.modulationsOnSixDescending.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    modulationsOnSixNoThird: indexModulations.modulationsOnSixNoThird.map(getJinsByIndex).filter(j => j !== null) as Jins[],
    noteName2p: indexModulations.noteName2p
  };
}

function convertMaqamAjnasToObjects(maqam: Maqam): MaqamWithAjnasAsObjects {
  const { ascendingMaqamAjnas, descendingMaqamAjnas, ...restMaqam } = maqam;
  const convertedMaqam: MaqamWithAjnasAsObjects = restMaqam;

  // Convert ascending ajnas array to object
  if (ascendingMaqamAjnas) {
    const ascendingAjnasObject: { [noteName: string]: Jins | null } = {};
    ascendingMaqamAjnas.forEach((jins, index) => {
      if (index < maqam.ascendingPitchClasses.length) {
        const noteName = maqam.ascendingPitchClasses[index].noteName;
        ascendingAjnasObject[noteName] = jins;
      }
    });
    convertedMaqam.ascendingMaqamAjnas = ascendingAjnasObject;
  }

  // Convert descending ajnas array to object
  if (descendingMaqamAjnas) {
    const descendingAjnasObject: { [noteName: string]: Jins | null } = {};
    descendingMaqamAjnas.forEach((jins, index) => {
      if (index < maqam.descendingPitchClasses.length) {
        const noteName = maqam.descendingPitchClasses[index].noteName;
        descendingAjnasObject[noteName] = jins;
      }
    });
    convertedMaqam.descendingMaqamAjnas = descendingAjnasObject;
  }

  return convertedMaqam;
}

/**
 * Exports comprehensive data for a specific tuning system
 *
 * This function generates a complete export of a tuning system including all
 * possible ajnas, maqamat, their transpositions, and modulation possibilities.
 * The export can be customized through options to include/exclude specific data sets.
 *
 * **Optimization**: This function uses index-based modulations to prevent JSON.stringify
 * failures when exporting large tuning systems with extensive modulation data. Individual
 * maqam/jins exports continue to use the original format for better compatibility.
 *
 * @param tuningSystem - The tuning system to export
 * @param startingNote - The starting note of the tuning system
 * @param options - Export configuration options specifying what data to include
 * @param centsTolerance - Tolerance in cents for matching cents values (default: 5)
 * @returns Comprehensive export object containing all requested tuning system data
 */
export function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName, options: ExportOptions, centsTolerance: number = 5): ExportedTuningSystem {
  const result: ExportedTuningSystem = {};

  // Always calculate basic counts for display
  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();
  result.numberOfAjnas = allAjnas.length;
  result.numberOfMaqamat = allMaqamat.length;

  // Include tuning system details if requested
  if (options.includeTuningSystemDetails) {
    result.tuningSystem = tuningSystem;
    result.startingNote = startingNote;
  }

  // Include pitch classes if requested
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  if (options.includePitchClasses) {
    result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
  }

  // Filter possible ajnas and maqamat
  const possibleAjnasOverview: (JinsData | JinsDataInterface)[] = allAjnas.filter((jins) =>
    jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleMaqamatOverview: (MaqamData | MaqamDataInterface)[] = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  // Always include the counts
  result.numberOfPossibleAjnas = possibleAjnasOverview.length;
  result.numberOfPossibleMaqamat = possibleMaqamatOverview.length;

  // Include ajnas details if requested
  if (options.includeAjnasDetails) {
    const possibleAjnas: Jins[] = [];

    for (let i = 0; i < possibleAjnasOverview.length; i++) {
      const jins = possibleAjnasOverview[i] as JinsData;

      let numberOfTranspositions = 0;
      for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
        possibleAjnas.push(jinsTransposition);
        numberOfTranspositions++;
      }

      possibleAjnasOverview[i] = jins.convertToObject();
      (possibleAjnasOverview[i] as JinsDataInterface).numberOfTranspositions = numberOfTranspositions;
    }

    result.possibleAjnasOverview = possibleAjnasOverview as JinsDataInterface[];
    result.possibleAjnas = possibleAjnas;
  }

  // Include maqamat details if requested
  if (options.includeMaqamatDetails) {
    const possibleMaqamat: MaqamWithAjnasAsObjects[] = [];
    const allMaqamatForModulations: Maqam[] = []; // For modulation reference

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamData;

      let numberOfTranspositions = 0;
      for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
        allMaqamatForModulations.push(maqamTransposition); // Store for reference
        
        // Include modulations if requested
        if (options.includeMaqamatModulations || options.includeAjnasModulations) {
          if (options.includeMaqamatModulations) {
            const maqamatModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, false, centsTolerance) as MaqamatModulations;
            const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);
            // Convert to index-based modulations
            const indexBasedMaqamatModulations = convertMaqamatModulationsToIndices(maqamatModulations, allMaqamatForModulations);
            (maqamTransposition as any).maqamatModulations = indexBasedMaqamatModulations;
            (maqamTransposition as any).numberOfMaqamModulationHops = numberOfMaqamModulationHops;
          }

          if (options.includeAjnasModulations) {
            const ajnasModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, true, centsTolerance) as AjnasModulations;
            const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);
            // Get all possible ajnas for reference
            const allAjnasInstances: Jins[] = [];
            for (const jins of allAjnas) {
              for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
                allAjnasInstances.push(jinsTransposition);
              }
            }
            // Convert to index-based modulations
            const indexBasedAjnasModulations = convertAjnasModulationsToIndices(ajnasModulations, allAjnasInstances);
            (maqamTransposition as any).ajnasModulations = indexBasedAjnasModulations;
            (maqamTransposition as any).numberOfJinsModulationHops = numberOfJinsModulationHops;
          }
        }

        possibleMaqamat.push(convertMaqamAjnasToObjects(maqamTransposition));
        numberOfTranspositions++;
      }

      possibleMaqamatOverview[i] = maqam.convertToObject();
      (possibleMaqamatOverview[i] as MaqamDataInterface).numberOfTranspositions = numberOfTranspositions;
    }

    result.possibleMaqamatOverview = possibleMaqamatOverview as MaqamDataInterface[];
    result.possibleMaqamat = possibleMaqamat;
    
    // Add reference arrays for resolving indices
    if (options.includeMaqamatModulations) {
      result.maqamatReference = allMaqamatForModulations.map(convertMaqamAjnasToObjects);
    }
    if (options.includeAjnasModulations) {
      // Get all possible ajnas for reference
      const allAjnasInstances: Jins[] = [];
      for (const jins of allAjnas) {
        for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
          allAjnasInstances.push(jinsTransposition);
        }
      }
      result.ajnasReference = allAjnasInstances;
    }
  }

  return result;
}

/**
 * Exports comprehensive data for a specific jins.
 *
 * This function generates a detailed export of a jins including its basic properties,
 * all possible transpositions within a given tuning system, and optionally its
 * modulation possibilities. The jins can be provided as either a Jins instance
 * or JinsData object.
 *
 * @param jinsInput - The jins to export (either Jins instance or JinsData)
 * @param tuningSystem - The tuning system context for analysis
 * @param startingNote - The starting note for the tuning system
 * @param options - Export configuration options for jins-specific data
 * @param centsTolerance - Tolerance in cents for matching cents values (default: 5)
 * @returns Comprehensive export object containing all requested jins data
 */
export function exportJins(jinsInput: Jins | JinsData, tuningSystem: TuningSystem, startingNote: NoteName, options: JinsExportOptions, centsTolerance: number = 5): ExportedJins {
  const result: ExportedJins = {};

  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  let jinsToExport: Jins;
  let jinsData: JinsData | undefined;

  // Check if input is a Jins instance or JinsData
  if ("jinsId" in jinsInput) {
    // It's a Jins instance - export this directly
    jinsToExport = jinsInput;

    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allAjnas = getAjnas();
      jinsData = allAjnas.find((j) => j.getId() === jinsInput.jinsId);
    }
  } else {
    // It's a JinsData instance - convert to Jins using getTahlil
    jinsData = jinsInput;
    jinsToExport = jinsData.getTahlil(fullRangeTuningSystemPitchClasses);
  }

  // Include tuning system details if requested
  if (options.includeTuningSystemDetails) {
    result.tuningSystem = tuningSystem;
    result.startingNote = startingNote;
  }

  // Include pitch classes if requested
  if (options.includePitchClasses) {
    result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
  }

  // Include the actual jins instance
  result.jins = jinsToExport;

  // Include transpositions if requested and we have jinsData
  if (options.includeTranspositions && jinsData) {
    const transpositions: Jins[] = [];
    let numberOfTranspositions = 0;

    for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jinsData, true, centsTolerance)) {
      transpositions.push(jinsTransposition);
      numberOfTranspositions++;
    }

    result.transpositions = transpositions;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  return result;
}

/**
 * Exports comprehensive data for a specific maqam.
 *
 * This function generates a detailed export of a maqam including its basic properties,
 * constituent ajnas, all possible transpositions within a given tuning system, and
 * optionally its modulation possibilities and suyur (melodic progressions). The maqam
 * can be provided as either a Maqam instance or MaqamData object.
 *
 * **Note**: This function uses the original modulation format (full objects) for
 * better compatibility with individual maqam analysis. For large-scale exports,
 * use exportTuningSystem() which implements index-based optimization.
 *
 * @param maqamInput - The maqam to export (either Maqam instance or MaqamData)
 * @param tuningSystem - The tuning system context for analysis
 * @param startingNote - The starting note for the tuning system
 * @param options - Export configuration options for maqam-specific data
 * @param centsTolerance - Tolerance in cents for matching cents values (default: 5)
 * @returns Comprehensive export object containing all requested maqam data
 */
export function exportMaqam(maqamInput: Maqam | MaqamData, tuningSystem: TuningSystem, startingNote: NoteName, options: MaqamExportOptions, centsTolerance: number = 5): ExportedMaqam {
  const result: ExportedMaqam = {};

  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  let maqamToExport: Maqam;
  let maqamData: MaqamData | undefined;

  // Check if input is a Maqam instance or MaqamData
  if ("maqamId" in maqamInput) {
    // It's a Maqam instance - export this directly
    maqamToExport = maqamInput;

    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allMaqamat = getMaqamat();
      maqamData = allMaqamat.find((m) => m.getId() === maqamInput.maqamId);
    }
  } else {
    // It's a MaqamData instance - convert to Maqam using getTahlil
    maqamData = maqamInput;
    maqamToExport = maqamData.getTahlil(fullRangeTuningSystemPitchClasses);
  }

  // Include tuning system details if requested
  if (options.includeTuningSystemDetails) {
    result.tuningSystem = tuningSystem;
    result.startingNote = startingNote;
  }

  // Include pitch classes if requested
  if (options.includePitchClasses) {
    result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses;
  }

  // Include the actual maqam instance converted to use objects for ajnas
  result.maqam = convertMaqamAjnasToObjects(maqamToExport);

  // Include modulations if requested
  if (options.includeMaqamatModulations || options.includeAjnasModulations) {
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    // Calculate Maqamat modulations if requested
    if (options.includeMaqamatModulations) {
      const maqamatModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamToExport, false, centsTolerance) as MaqamatModulations;
      const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);

      result.maqamatModulations = maqamatModulations; // Use original format
      result.numberOfMaqamModulationHops = numberOfMaqamModulationHops;
    }

    // Calculate Ajnas modulations if requested
    if (options.includeAjnasModulations) {
      const ajnasModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamToExport, true, centsTolerance) as AjnasModulations;
      const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);

      result.ajnasModulations = ajnasModulations; // Use original format
      result.numberOfJinsModulationHops = numberOfJinsModulationHops;
    }
  }

  // Include transpositions if requested and we have maqamData
  if (options.includeTranspositions && maqamData) {
    const transpositions: MaqamWithAjnasAsObjects[] = [];
    let numberOfTranspositions = 0;
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqamData, true, centsTolerance)) {
      // Include modulations for each transposition if requested
      if (options.includeMaqamatModulations) {
        const maqamatModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, false, centsTolerance) as MaqamatModulations;
        const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);
        (maqamTransposition as any).maqamatModulations = maqamatModulations; // Use original format
        (maqamTransposition as any).numberOfMaqamModulationHops = numberOfMaqamModulationHops;
      }

      if (options.includeAjnasModulations) {
        const ajnasModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, true, centsTolerance) as AjnasModulations;
        const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);
        (maqamTransposition as any).ajnasModulations = ajnasModulations; // Use original format
        (maqamTransposition as any).numberOfJinsModulationHops = numberOfJinsModulationHops;
      }

      transpositions.push(convertMaqamAjnasToObjects(maqamTransposition));
      numberOfTranspositions++;
    }

    result.transpositions = transpositions;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  return result;
}
