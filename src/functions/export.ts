import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { AjnasModulations, Jins, JinsDataInterface } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations, MaqamDataInterface } from "@/models/Maqam";
import getTuningSystemPitchClasses from "./getTuningSystemPitchClasses";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass, { PitchClassInterval } from "@/models/PitchClass";
import modulate from "./modulate";
import calculateNumberOfModulations from "./calculateNumberOfModulations";

/**
 * Converts a string with diacritics to their natural letters and replaces spaces with underscores
 * @param text The input string to convert
 * @returns The converted string with diacritics removed and spaces replaced with underscores
 */
export function englishify(text: string): string {
  return (
    text
      // Normalize to decompose combined characters
      .normalize("NFD")
      // Remove diacritics (combining marks)
      .replace(/[\u0300-\u036f]/g, "")
      // Remove apostrophes
      .replace(/'/g, "")
      // Replace spaces with underscores
      .replace(/\s+/g, "_")
  );
}

export interface MergedJins {
  jinsId: string;
  name: string;
  jinsPitchClasses: string[];
  jinsPitchClassIntervals: PitchClassInterval[];
  transposition: boolean;
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: any[];
}

export interface MergedMaqam {
  maqamId: string;
  name: string;
  ascendingPitchClasses: string[];
  descendingPitchClasses: string[];
  descendingPitchClassIntervals: PitchClassInterval[];
  ascendingPitchClassIntervals: PitchClassInterval[];
  ascendingMaqamAjnas?: { [noteName: string]: string | null };
  descendingMaqamAjnas?: { [noteName: string]: string | null };
  transposition: boolean;
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: any[];
}

/**
 * Index-based modulations for Maqamat using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamatModulationsWithKeys{
  /** Indices of modulations that occur on the first scale degree */
  modulationsOnOne: string[];

  /** Indices of modulations that occur on the third scale degree */
  modulationsOnThree: string[];

  /** Indices of modulations that occur on the third scale degree (second pattern) */
  modulationsOnThree2p: string[];

  /** Indices of modulations that occur on the fourth scale degree */
  modulationsOnFour: string[];

  /** Indices of modulations that occur on the fifth scale degree */
  modulationsOnFive: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree */
  modulationsOnSixAscending: string[];

  /** Indices of descending modulations that occur on the sixth scale degree */
  modulationsOnSixDescending: string[];

  /** Indices of modulations on the sixth scale degree without using the third */
  modulationsOnSixNoThird: string[];

  /** The note name of the second degree (plus variations) */
  noteName2p: string;
}

/**
 * Index-based modulations for Ajnas using array indices instead of full objects
 * to reduce JSON export size
 */
export interface AjnasModulationsWithKeys {
  /** Indices of modulations that occur on the first scale degree */
  modulationsOnOne: string[];

  /** Indices of modulations that occur on the third scale degree */
  modulationsOnThree: string[];

  /** Indices of modulations that occur on the third scale degree (second pattern) */
  modulationsOnThree2p: string[];

  /** Indices of modulations that occur on the fourth scale degree */
  modulationsOnFour: string[];

  /** Indices of modulations that occur on the fifth scale degree */
  modulationsOnFive: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree */
  modulationsOnSixAscending: string[];

  /** Indices of descending modulations that occur on the sixth scale degree */
  modulationsOnSixDescending: string[];

  /** Indices of modulations on the sixth scale degree without using the third */
  modulationsOnSixNoThird: string[];

  /** The note name of the second degree (plus variations) */
  noteName2p: string;
}

interface ExportedTuningSystem {
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  pitchClassReference?: { [noteName: string]: PitchClass };
  maqamReference?: { [maqamName: string]: MergedMaqam };
  jinsReference?: { [ajnasName: string]: MergedJins };
  fullRangeTuningSystemPitchClasses?: PitchClass[];
  numberOfPossibleAjnas?: number;
  numberOfAjnas?: number;
  possibleAjnas?: string[];
  numberOfPossibleMaqamat?: number;
  numberOfMaqamat?: number;
  possibleMaqamat?: string[];
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
  jins?: MergedJins; // Export as MergedJins for consistent pitch class referencing
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  pitchClassReference?: { [noteName: string]: PitchClass };
  jinsReference?: { [ajnasName: string]: MergedJins };
  fullRangeTuningSystemPitchClasses?: string[];
  transpositions?: string[];
  numberOfTranspositions?: number;
}

interface ExportedMaqam {
  maqam?: MergedMaqam; // Export as MergedMaqam for consistent pitch class referencing
  tuningSystem?: TuningSystem;
  startingNote?: NoteName;
  pitchClassReference?: { [noteName: string]: PitchClass };
  jinsReference?: { [ajnasName: string]: MergedJins };
  maqamReference?: { [maqamName: string]: MergedMaqam };
  fullRangeTuningSystemPitchClasses?: string[];
  transpositions?: string[];
  numberOfTranspositions?: number;
  maqamatModulations?: MaqamatModulationsWithKeys; // Reverted to original format
  numberOfMaqamModulationHops?: number;
  ajnasModulations?: AjnasModulationsWithKeys; // Reverted to original format
  numberOfJinsModulationHops?: number;
}

interface MaqamWithAjnasAsObjects extends Omit<Maqam, "ascendingMaqamAjnas" | "descendingMaqamAjnas"> {
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

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  const maqamReference: { [maqamName: string]: MergedMaqam } = {};

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

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[englishify(pc.noteName)] = pc;
  });

  // Filter possible ajnas and maqamat
  const possibleAjnasOverview: JinsData[] = allAjnas.filter((jins) =>
    jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleAjnasOverviewInterfaces: JinsDataInterface[] = [];

  const possibleMaqamatOverview: MaqamData[] = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  const possibleMaqamatOverviewInterfaces: MaqamDataInterface[] = [];

  // Always include the counts
  result.numberOfPossibleAjnas = possibleAjnasOverview.length;
  result.numberOfPossibleMaqamat = possibleMaqamatOverview.length;

  // Include ajnas details if requested
  if (options.includeAjnasDetails || options.includeMaqamatDetails) {
    const possibleAjnas: Jins[] = [];

    for (let i = 0; i < possibleAjnasOverview.length; i++) {
      const jins = possibleAjnasOverview[i] as JinsData;

      let numberOfTranspositions = 0;
      for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
        possibleAjnas.push(jinsTransposition);
        numberOfTranspositions++;
      }

      const possibleJinsOverviewInterface = jins.convertToObject();
      possibleJinsOverviewInterface.numberOfTranspositions = numberOfTranspositions;

      possibleAjnasOverviewInterfaces.push(possibleJinsOverviewInterface);
    }

    result.possibleAjnas = [];

    for (const possibleJins of possibleAjnas) {
      const jinsOverview = possibleAjnasOverview.find((j) => j.getId() === possibleJins.jinsId);

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: possibleJins.jinsId,
          name: possibleJins.name,
          jinsPitchClasses: possibleJins.jinsPitchClasses.map((pc) => englishify(pc.noteName)),
          jinsPitchClassIntervals: possibleJins.jinsPitchClassIntervals,
          transposition: possibleJins.transposition,
          commentsEnglish: jinsOverview.getCommentsEnglish(),
          commentsArabic: jinsOverview.getCommentsArabic(),
          SourcePageReferences: jinsOverview.getSourcePageReferences(),
        };

        jinsReference[englishify(possibleJins.name)] = mergedJins;
        result.possibleAjnas.push(englishify(possibleJins.name));
      }
    }
  }

  // Include maqamat details if requested
  if (options.includeMaqamatDetails) {
    const possibleMaqamat: MaqamWithAjnasAsObjects[] = [];

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamData;

      let numberOfTranspositions = 0;
      for (const maqamTransposition of getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance)) {
        // Include modulations if requested
        if (options.includeMaqamatModulations || options.includeAjnasModulations) {
          if (options.includeMaqamatModulations) {
            const maqamatModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, false, centsTolerance) as MaqamatModulations;
            const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);
            (maqamTransposition as any).maqamatModulations = maqamatModulations;
            (maqamTransposition as any).numberOfMaqamModulationHops = numberOfMaqamModulationHops;
          }

          if (options.includeAjnasModulations) {
            const ajnasModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamTransposition, true, centsTolerance) as AjnasModulations;
            const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);
            (maqamTransposition as any).ajnasModulations = ajnasModulations;
            (maqamTransposition as any).numberOfJinsModulationHops = numberOfJinsModulationHops;
          }
        }

        possibleMaqamat.push(convertMaqamAjnasToObjects(maqamTransposition));
        numberOfTranspositions++;
      }

      const possibleMaqamOverviewInterface = maqam.convertToObject();
      possibleMaqamOverviewInterface.numberOfTranspositions = numberOfTranspositions;

      possibleMaqamatOverviewInterfaces.push(possibleMaqamOverviewInterface);
    }

    result.possibleMaqamat = [];

    for (const possibleMaqam of possibleMaqamat) {
      const maqamOverview = possibleMaqamatOverview.find((m) => m.getId() === possibleMaqam.maqamId);

      if (maqamOverview) {
        const mergedMaqam: MergedMaqam = {
          maqamId: possibleMaqam.maqamId,
          name: possibleMaqam.name,
          ascendingPitchClasses: possibleMaqam.ascendingPitchClasses.map((pc) => englishify(pc.noteName)),
          descendingPitchClasses: possibleMaqam.descendingPitchClasses.map((pc) => englishify(pc.noteName)),
          ascendingPitchClassIntervals: possibleMaqam.ascendingPitchClassIntervals,
          descendingPitchClassIntervals: possibleMaqam.descendingPitchClassIntervals,
          ascendingMaqamAjnas: possibleMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(Object.entries(possibleMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
            : undefined,
          descendingMaqamAjnas: possibleMaqam.descendingMaqamAjnas
            ? Object.fromEntries(Object.entries(possibleMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
            : undefined,
          transposition: possibleMaqam.transposition,
          commentsEnglish: maqamOverview.getCommentsEnglish(),
          commentsArabic: maqamOverview.getCommentsArabic(),
          SourcePageReferences: maqamOverview.getSourcePageReferences(),
        };

        maqamReference[englishify(possibleMaqam.name)] = mergedMaqam;
        result.possibleMaqamat.push(englishify(possibleMaqam.name));
      }
    }
  }

  result.pitchClassReference = pitchClassReference;
  result.jinsReference = jinsReference;
  result.maqamReference = maqamReference;

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

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[englishify(pc.noteName)] = pc;
  });

  let jinsToExport: Jins;
  let jinsData: JinsData | undefined;

  const allAjnas = getAjnas();

  // Check if input is a Jins instance or JinsData
  if ("jinsId" in jinsInput) {
    // It's a Jins instance - export this directly
    jinsToExport = jinsInput;

    // Find the jinsData for creating MergedJins
    jinsData = allAjnas.find((j) => j.getId() === jinsInput.jinsId);
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
    result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map((pc) => englishify(pc.noteName));
  }

  // Include the actual jins instance as MergedJins
  if (jinsData) {
    const mergedJins: MergedJins = {
      jinsId: jinsToExport.jinsId,
      name: jinsToExport.name,
      jinsPitchClasses: jinsToExport.jinsPitchClasses.map((pc) => englishify(pc.noteName)),
      jinsPitchClassIntervals: jinsToExport.jinsPitchClassIntervals,
      transposition: jinsToExport.transposition,
      commentsEnglish: jinsData.getCommentsEnglish(),
      commentsArabic: jinsData.getCommentsArabic(),
      SourcePageReferences: jinsData.getSourcePageReferences(),
    };
    result.jins = mergedJins;
  }

  // Include transpositions if requested and we have jinsData
  if (options.includeTranspositions && jinsData) {
    const transpositions: MergedJins[] = [];
    let numberOfTranspositions = 0;

    for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jinsData, true, centsTolerance)) {
      const jinsOverview = allAjnas.find((j) => j.getId() === jinsTransposition.jinsId);

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: jinsTransposition.jinsId,
          name: jinsTransposition.name,
          jinsPitchClasses: jinsTransposition.jinsPitchClasses.map((pc) => englishify(pc.noteName)),
          jinsPitchClassIntervals: jinsTransposition.jinsPitchClassIntervals,
          transposition: jinsTransposition.transposition,
          commentsEnglish: jinsOverview.getCommentsEnglish(),
          commentsArabic: jinsOverview.getCommentsArabic(),
          SourcePageReferences: jinsOverview.getSourcePageReferences(),
        };

        jinsReference[englishify(jinsTransposition.name)] = mergedJins;
      transpositions.push(mergedJins);
      numberOfTranspositions++;
    }

    result.transpositions = transpositions.map((jins) => englishify(jins.name));
    result.numberOfTranspositions = numberOfTranspositions;
  }}

  result.pitchClassReference = pitchClassReference;
  result.jinsReference = jinsReference;

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

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  const maqamReference: { [maqamName: string]: MergedMaqam } = {};

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[englishify(pc.noteName)] = pc;
  });

  let maqamToExport: Maqam;
  let maqamData: MaqamData | undefined;

  // Check if input is a Maqam instance or MaqamData
  if ("maqamId" in maqamInput) {
    // It's a Maqam instance - export this directly
    maqamToExport = maqamInput;

    // Find the maqamData for creating MergedMaqam
    const allMaqamat = getMaqamat();
    maqamData = allMaqamat.find((m) => m.getId() === maqamInput.maqamId);
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
    result.fullRangeTuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map((pc) => englishify(pc.noteName));
  }

  // Include the actual maqam instance as MergedMaqam
  if (maqamData) {
    const convertedMaqam = convertMaqamAjnasToObjects(maqamToExport);
    const mergedMaqam: MergedMaqam = {
      maqamId: maqamToExport.maqamId,
      name: maqamToExport.name,
      ascendingPitchClasses: maqamToExport.ascendingPitchClasses.map((pc) => englishify(pc.noteName)),
      descendingPitchClasses: maqamToExport.descendingPitchClasses.map((pc) => englishify(pc.noteName)),
      ascendingPitchClassIntervals: maqamToExport.ascendingPitchClassIntervals,
      descendingPitchClassIntervals: maqamToExport.descendingPitchClassIntervals,
      ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
        ? Object.fromEntries(Object.entries(convertedMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
        : undefined,
      descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
        ? Object.fromEntries(Object.entries(convertedMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
        : undefined,
      transposition: maqamToExport.transposition,
      commentsEnglish: maqamData.getCommentsEnglish(),
      commentsArabic: maqamData.getCommentsArabic(),
      SourcePageReferences: maqamData.getSourcePageReferences(),
    };
    result.maqam = mergedMaqam;
  }

  // Include modulations if requested
  if (options.includeMaqamatModulations || options.includeAjnasModulations) {
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    // Calculate Maqamat modulations if requested
    if (options.includeMaqamatModulations) {
      const maqamatModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamToExport, false, centsTolerance) as MaqamatModulations;
      const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);

      // Helper function to process maqam modulations and populate reference
      const processMaqamModulations = (maqamList: Maqam[]) => {
        return maqamList.map(maqam => {
          const englishifiedName = englishify(maqam.name);
          
          // Find the original maqam data for additional details
          const maqamOverview = allMaqamat.find((m) => m.getId() === maqam.maqamId);
          if (maqamOverview) {
            const mergedMaqam: MergedMaqam = {
              maqamId: maqam.maqamId,
              name: maqam.name,
              ascendingPitchClasses: maqam.ascendingPitchClasses.map((pc) => englishify(pc.noteName)),
              descendingPitchClasses: maqam.descendingPitchClasses.map((pc) => englishify(pc.noteName)),
              ascendingPitchClassIntervals: maqam.ascendingPitchClassIntervals,
              descendingPitchClassIntervals: maqam.descendingPitchClassIntervals,
              ascendingMaqamAjnas: maqam.ascendingMaqamAjnas
                ? Object.fromEntries(Object.entries(convertMaqamAjnasToObjects(maqam).ascendingMaqamAjnas || {}).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
                : undefined,
              descendingMaqamAjnas: maqam.descendingMaqamAjnas
                ? Object.fromEntries(Object.entries(convertMaqamAjnasToObjects(maqam).descendingMaqamAjnas || {}).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
                : undefined,
              transposition: maqam.transposition,
              commentsEnglish: maqamOverview.getCommentsEnglish(),
              commentsArabic: maqamOverview.getCommentsArabic(),
              SourcePageReferences: maqamOverview.getSourcePageReferences(),
            };
            maqamReference[englishifiedName] = mergedMaqam;
          }
          
          return englishifiedName;
        });
      };

      const maqamModulationWithKeys: MaqamatModulationsWithKeys = {
        modulationsOnOne: processMaqamModulations(maqamatModulations.modulationsOnOne),
        modulationsOnThree: processMaqamModulations(maqamatModulations.modulationsOnThree),
        modulationsOnThree2p: processMaqamModulations(maqamatModulations.modulationsOnThree2p),
        modulationsOnFour: processMaqamModulations(maqamatModulations.modulationsOnFour),
        modulationsOnFive: processMaqamModulations(maqamatModulations.modulationsOnFive),
        modulationsOnSixAscending: processMaqamModulations(maqamatModulations.modulationsOnSixAscending),
        modulationsOnSixDescending: processMaqamModulations(maqamatModulations.modulationsOnSixDescending),
        modulationsOnSixNoThird: processMaqamModulations(maqamatModulations.modulationsOnSixNoThird),
        noteName2p: maqamatModulations.noteName2p,
      }

      result.maqamatModulations = maqamModulationWithKeys;
      result.numberOfMaqamModulationHops = numberOfMaqamModulationHops;
    }

    // Calculate Ajnas modulations if requested
    if (options.includeAjnasModulations) {
      const ajnasModulations = modulate(fullRangeTuningSystemPitchClasses, allAjnas, allMaqamat, maqamToExport, true, centsTolerance) as AjnasModulations;
      const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);

      // Helper function to process jins modulations and populate reference
      const processJinsModulations = (jinsList: Jins[]) => {
        return jinsList.map(jins => {
          const englishifiedName = englishify(jins.name);
          
          // Find the original jins data for additional details
          const jinsOverview = allAjnas.find((j) => j.getId() === jins.jinsId);
          if (jinsOverview) {
            const mergedJins: MergedJins = {
              jinsId: jins.jinsId,
              name: jins.name,
              jinsPitchClasses: jins.jinsPitchClasses.map((pc) => englishify(pc.noteName)),
              jinsPitchClassIntervals: jins.jinsPitchClassIntervals,
              transposition: jins.transposition,
              commentsEnglish: jinsOverview.getCommentsEnglish(),
              commentsArabic: jinsOverview.getCommentsArabic(),
              SourcePageReferences: jinsOverview.getSourcePageReferences(),
            };
            jinsReference[englishifiedName] = mergedJins;
          }
          
          return englishifiedName;
        });
      };

      const ajnasModulationsWithKeys: AjnasModulationsWithKeys = {
        modulationsOnOne: processJinsModulations(ajnasModulations.modulationsOnOne),
        modulationsOnThree: processJinsModulations(ajnasModulations.modulationsOnThree),
        modulationsOnThree2p: processJinsModulations(ajnasModulations.modulationsOnThree2p),
        modulationsOnFour: processJinsModulations(ajnasModulations.modulationsOnFour),
        modulationsOnFive: processJinsModulations(ajnasModulations.modulationsOnFive),
        modulationsOnSixAscending: processJinsModulations(ajnasModulations.modulationsOnSixAscending),
        modulationsOnSixDescending: processJinsModulations(ajnasModulations.modulationsOnSixDescending),
        modulationsOnSixNoThird: processJinsModulations(ajnasModulations.modulationsOnSixNoThird),
        noteName2p: ajnasModulations.noteName2p,
      }

      result.ajnasModulations = ajnasModulationsWithKeys;
      result.numberOfJinsModulationHops = numberOfJinsModulationHops;
    }
  }

  // Include transpositions if requested and we have maqamData
  if (options.includeTranspositions && maqamData) {
    const transpositionNames: string[] = [];
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

      // Create merged maqam and add to reference
      const maqamOverview = allMaqamat.find((m) => m.getId() === maqamTransposition.maqamId);
      if (maqamOverview) {
        const convertedMaqam = convertMaqamAjnasToObjects(maqamTransposition);
        const mergedMaqam: MergedMaqam = {
          maqamId: maqamTransposition.maqamId,
          name: maqamTransposition.name,
          ascendingPitchClasses: maqamTransposition.ascendingPitchClasses.map((pc) => englishify(pc.noteName)),
          descendingPitchClasses: maqamTransposition.descendingPitchClasses.map((pc) => englishify(pc.noteName)),
          ascendingPitchClassIntervals: maqamTransposition.ascendingPitchClassIntervals,
          descendingPitchClassIntervals: maqamTransposition.descendingPitchClassIntervals,
          ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(Object.entries(convertedMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
            : undefined,
          descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
            ? Object.fromEntries(Object.entries(convertedMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [noteName, jins ? englishify(jins.name) : null]))
            : undefined,
          transposition: maqamTransposition.transposition,
          commentsEnglish: maqamOverview.getCommentsEnglish(),
          commentsArabic: maqamOverview.getCommentsArabic(),
          SourcePageReferences: maqamOverview.getSourcePageReferences(),
        };

        const englishifiedName = englishify(maqamTransposition.name);
        maqamReference[englishifiedName] = mergedMaqam;
        transpositionNames.push(englishifiedName);
      }
      
      numberOfTranspositions++;
    }

    result.transpositions = transpositionNames;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  result.pitchClassReference = pitchClassReference;
  result.jinsReference = jinsReference;
  result.maqamReference = maqamReference;

  return result;
}
