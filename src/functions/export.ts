import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { AjnasModulations, Jins, JinsDetailsInterface } from "@/models/Jins";
import MaqamDetails, { Maqam, MaqamatModulations, MaqamDetailsInterface } from "@/models/Maqam";
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
  possibleAjnasOverview?: JinsDetailsInterface[];
  possibleAjnas?: Jins[];
  numberOfPossibleMaqamat?: number;
  numberOfMaqamat?: number;
  possibleMaqamatOverview?: MaqamDetailsInterface[];
  possibleMaqamat?: Maqam[];
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
  jins?: Jins; // Export the actual Jins instance instead of JinsDetails
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  transpositions?: Jins[];
  numberOfTranspositions?: number;
}

interface ExportedMaqam {
  maqam?: Maqam; // Export the actual Maqam instance instead of MaqamDetails
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  transpositions?: Maqam[];
  numberOfTranspositions?: number;
  modulations?: MaqamatModulations | AjnasModulations;
  numberOfHops?: number;
}

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
  const possibleAjnasOverview: (JinsDetails | JinsDetailsInterface)[] = allAjnas.filter((jins) =>
    jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleMaqamatOverview: (MaqamDetails | MaqamDetailsInterface)[] = allMaqamat.filter(
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
      const jins = possibleAjnasOverview[i] as JinsDetails;

      let numberOfTranspositions = 0;
      for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
        possibleAjnas.push(jinsTransposition);
        numberOfTranspositions++;
      }

      possibleAjnasOverview[i] = jins.convertToObject();
      (possibleAjnasOverview[i] as JinsDetailsInterface).numberOfTranspositions = numberOfTranspositions;
    }

    result.possibleAjnasOverview = possibleAjnasOverview as JinsDetailsInterface[];
    result.possibleAjnas = possibleAjnas;
  }

  // Include maqamat details if requested
  if (options.includeMaqamatDetails) {
    const possibleMaqamat: Maqam[] = [];

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamDetails;

      let numberOfTranspositions = 0;
      for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
        // Include modulations if requested
        if (options.includeModulations) {
          const useAjnasModulations = options.modulationType === 'ajnas';
          const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
          const numberOfHops = calculateNumberOfModulations(modulations as MaqamatModulations | AjnasModulations);
          maqamTransposition.numberOfHops = numberOfHops;
        }
        
        possibleMaqamat.push(maqamTransposition);
        numberOfTranspositions++;
      }

      possibleMaqamatOverview[i] = maqam.convertToObject();
      (possibleMaqamatOverview[i] as MaqamDetailsInterface).numberOfTranspositions = numberOfTranspositions;
    }

    result.possibleMaqamatOverview = possibleMaqamatOverview as MaqamDetailsInterface[];
    result.possibleMaqamat = possibleMaqamat;
  }

  return result;
}

export function exportJins(
  jinsInput: Jins | JinsDetails,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: JinsExportOptions,
  centsTolerance: number = 5
): ExportedJins {
  const result: ExportedJins = {};
  
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  let jinsToExport: Jins;
  let jinsDetails: JinsDetails | undefined;
  
  // Check if input is a Jins instance or JinsDetails
  if ('jinsId' in jinsInput) {
    // It's a Jins instance - export this directly
    jinsToExport = jinsInput;
    
    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allAjnas = getAjnas();
      jinsDetails = allAjnas.find(j => j.getId() === jinsInput.jinsId);
    }
  } else {
    // It's a JinsDetails instance - convert to Jins using getTahlil
    jinsDetails = jinsInput;
    jinsToExport = jinsDetails.getTahlil(fullRangeTuningSystemPitchClasses);
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

  // Include transpositions if requested and we have jinsDetails
  if (options.includeTranspositions && jinsDetails) {
    const transpositions: Jins[] = [];
    let numberOfTranspositions = 0;

    for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jinsDetails, true, centsTolerance)) {
      transpositions.push(jinsTransposition);
      numberOfTranspositions++;
    }

    result.transpositions = transpositions;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  return result;
}

export function exportMaqam(
  maqamInput: Maqam | MaqamDetails,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: MaqamExportOptions,
  centsTolerance: number = 5
): ExportedMaqam {
  const result: ExportedMaqam = {};
  
  const fullRangeTuningSystemPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  let maqamToExport: Maqam;
  let maqamDetails: MaqamDetails | undefined;
  
  // Check if input is a Maqam instance or MaqamDetails
  if ('maqamId' in maqamInput) {
    // It's a Maqam instance - export this directly
    maqamToExport = maqamInput;
    
    // Optionally get the details for transposition generation
    if (options.includeTranspositions) {
      const allMaqamat = getMaqamat();
      maqamDetails = allMaqamat.find(m => m.getId() === maqamInput.maqamId);
    }
  } else {
    // It's a MaqamDetails instance - convert to Maqam using getTahlil
    maqamDetails = maqamInput;
    maqamToExport = maqamDetails.getTahlil(fullRangeTuningSystemPitchClasses);
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

  // Include the actual maqam instance
  result.maqam = maqamToExport;

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

  // Include transpositions if requested and we have maqamDetails
  if (options.includeTranspositions && maqamDetails) {
    const transpositions: Maqam[] = [];
    let numberOfTranspositions = 0;
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqamDetails, true, centsTolerance)) {
      // Include modulations for each transposition if requested
      if (options.includeModulations) {
        const useAjnasModulations = options.modulationType === 'ajnas';
        const modulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, useAjnasModulations, centsTolerance);
        const numberOfHops = calculateNumberOfModulations(modulations as MaqamatModulations | AjnasModulations);
        maqamTransposition.numberOfHops = numberOfHops;
      }
      
      transpositions.push(maqamTransposition);
      numberOfTranspositions++;
    }

    result.transpositions = transpositions;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  return result;
}