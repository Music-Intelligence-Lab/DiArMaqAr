import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { AjnasModulations, Jins, JinsDataInterface } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations, MaqamDataInterface } from "@/models/Maqam";
import getTuningSystemCells from "./getTuningSystemCells";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass from "@/models/PitchClass";
import modulate from "./modulate";
import calculateNumberOfModulations from "./calculateNumberOfModulations";

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
}

export interface ExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails: boolean;
  includeMaqamatDetails: boolean;
  includeModulations: boolean;
  modulationType: 'maqamat' | 'ajnas';
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
  includeModulations: boolean;
  modulationType: 'maqamat' | 'ajnas';
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
  modulations?: MaqamatModulations | AjnasModulations;
  numberOfHops?: number;
}

interface MaqamWithAjnasAsObjects extends Omit<Maqam, 'ascendingMaqamAjnas' | 'descendingMaqamAjnas'> {
  ascendingMaqamAjnas?: { [noteName: string]: Jins | null };
  descendingMaqamAjnas?: { [noteName: string]: Jins | null };
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
 * Exports comprehensive data for a specific tuning system and starting note.
 * 
 * This function generates a complete export of a tuning system including all
 * possible ajnas, maqamat, their transpositions, and modulation possibilities.
 * The export can be customized through options to include/exclude specific data sets.
 * 
 * @param tuningSystem - The tuning system to export
 * @param startingNote - The starting note for the analysis
 * @param options - Export configuration options specifying what data to include
 * @param centsTolerance - Tolerance in cents for matching pitches (default: 5)
 * @returns Comprehensive export object containing all requested tuning system data
 * 
 */
export function exportTuningSystem(
  tuningSystem: TuningSystem, 
  startingNote: NoteName, 
  options: ExportOptions,
  centsTolerance: number = 5
): ExportedTuningSystem {
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
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
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

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamData;

      let numberOfTranspositions = 0;
      for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
        // Include modulations if requested
        if (options.includeModulations) {
          const useAjnasModulations = options.modulationType === 'ajnas';
          const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
          const numberOfHops = calculateNumberOfModulations(modulations as MaqamatModulations | AjnasModulations);
          maqamTransposition.numberOfHops = numberOfHops;
        }
        
        possibleMaqamat.push(convertMaqamAjnasToObjects(maqamTransposition));
        numberOfTranspositions++;
      }

      possibleMaqamatOverview[i] = maqam.convertToObject();
      (possibleMaqamatOverview[i] as MaqamDataInterface).numberOfTranspositions = numberOfTranspositions;
    }

    result.possibleMaqamatOverview = possibleMaqamatOverview as MaqamDataInterface[];
    result.possibleMaqamat = possibleMaqamat;
  }

  return result;
}

/**
 * Exports comprehensive data for a specific jins (tetrachordal unit).
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
 * @param centsTolerance - Tolerance in cents for matching pitches (default: 5)
 * @returns Comprehensive export object containing all requested jins data

 */
export function exportJins(
  jinsInput: Jins | JinsData,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: JinsExportOptions,
  centsTolerance: number = 5
): ExportedJins {
  const result: ExportedJins = {};
  
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  let jinsToExport: Jins;
  let jinsData: JinsData | undefined;
  
  // Check if input is a Jins instance or JinsData
  if ('jinsId' in jinsInput) {
    // It's a Jins instance - export this directly
    jinsToExport = jinsInput;
    
    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allAjnas = getAjnas();
      jinsData = allAjnas.find(j => j.getId() === jinsInput.jinsId);
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
 * Exports comprehensive data for a specific maqam (modal structure).
 * 
 * This function generates a detailed export of a maqam including its basic properties,
 * constituent ajnas, all possible transpositions within a given tuning system, and
 * optionally its modulation possibilities and suyur (melodic progressions). The maqam
 * can be provided as either a Maqam instance or MaqamData object.
 * 
 * @param maqamInput - The maqam to export (either Maqam instance or MaqamData)
 * @param tuningSystem - The tuning system context for analysis
 * @param startingNote - The starting note for the tuning system
 * @param options - Export configuration options for maqam-specific data
 * @param centsTolerance - Tolerance in cents for matching pitches (default: 5)
 * @returns Comprehensive export object containing all requested maqam data
 * 
 */
export function exportMaqam(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: MaqamExportOptions,
  centsTolerance: number = 5
): ExportedMaqam {
  const result: ExportedMaqam = {};
  
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  let maqamToExport: Maqam;
  let maqamData: MaqamData | undefined;
  
  // Check if input is a Maqam instance or MaqamData
  if ('maqamId' in maqamInput) {
    // It's a Maqam instance - export this directly
    maqamToExport = maqamInput;
    
    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allMaqamat = getMaqamat();
      maqamData = allMaqamat.find(m => m.getId() === maqamInput.maqamId);
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
  if (options.includeModulations) {
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();
    const useAjnasModulations = options.modulationType === 'ajnas';
    
    const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamToExport, useAjnasModulations, centsTolerance);
    const numberOfHops = calculateNumberOfModulations(modulations as MaqamatModulations | AjnasModulations);
    
    result.modulations = modulations;
    result.numberOfHops = numberOfHops;
  }

  // Include transpositions if requested and we have maqamData
  if (options.includeTranspositions && maqamData) {
    const transpositions: MaqamWithAjnasAsObjects[] = [];
    let numberOfTranspositions = 0;
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqamData, true, centsTolerance)) {
      // Include modulations for each transposition if requested
      if (options.includeModulations) {
        const useAjnasModulations = options.modulationType === 'ajnas';
        const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
        const numberOfHops = calculateNumberOfModulations(modulations as MaqamatModulations | AjnasModulations);
        maqamTransposition.numberOfHops = numberOfHops;
      }
      
      transpositions.push(convertMaqamAjnasToObjects(maqamTransposition));
      numberOfTranspositions++;
    }

    result.transpositions = transpositions;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  return result;
}