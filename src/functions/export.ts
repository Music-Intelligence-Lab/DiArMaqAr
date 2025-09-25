import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { AjnasModulations, Jins, JinsDataInterface } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations, MaqamDataInterface, shiftMaqamByOctaves } from "@/models/Maqam";
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
export function standardizeText(text: string): string {
  return (
    text
      // Normalize to decompose combined characters
      .normalize("NFD")
      // Remove diacritics (combining marks)
      .replace(/[\u0300-\u036f]/g, "")
      // Remove apostrophes
      .replace(/'/g, "")
      // Remove Arabic ayn character
      .replace(/ʿ/g, "")
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
  maqamatModulations?: MaqamatModulationsWithKeys;
  ajnasModulations?: AjnasModulationsWithKeys;
  transposition: boolean;
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: any[];
}

/**
 * Standard modulations structure for a specific degree/position
 */
export interface StandardModulationsStructure {
  /** Indices of modulations that occur on the first scale degree */
  modulationsOnFirstDegree: string[];

  /** Indices of modulations that occur on the third scale degree */
  modulationsOnThirdDegree: string[];

  /** Indices of modulations that occur on the alternative third scale degree */
  modulationsOnAltThirdDegree: string[];

  /** Indices of modulations that occur on the fourth scale degree */
  modulationsOnFourthDegree: string[];

  /** Indices of modulations that occur on the fifth scale degree */
  modulationsOnFifthDegree: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeAsc: string[];

  /** Indices of descending modulations that occur on the sixth scale degree */
  modulationsOnSixthDegreeDesc: string[];

  /** Indices of modulations on the sixth scale degree without using the third */
  modulationsOnSixthDegreeIfNoThird: string[];

  /** The note name of the second degree (plus variations) */
  noteName2pBelowThird: string;
}

/**
 * Maps each modulation degree to its corresponding note name
 */
export interface ModulationDegreesNoteNames {
  /** Note name for modulations on the first scale degree */
  modulationsOnFirstDegree: string;

  /** Note name for modulations on the third scale degree */
  modulationsOnThirdDegree: string;

  /** Note name for modulations on the alternative third scale degree */
  modulationsOnAltThirdDegree: string;

  /** Note name for modulations on the fourth scale degree */
  modulationsOnFourthDegree: string;

  /** Note name for modulations on the fifth scale degree */
  modulationsOnFifthDegree: string;

  /** Note name for ascending modulations on the sixth scale degree */
  modulationsOnSixthDegreeAsc: string;

  /** Note name for descending modulations on the sixth scale degree */
  modulationsOnSixthDegreeDesc: string;

  /** Note name for modulations on the sixth scale degree without using the third */
  modulationsOnSixthDegreeIfNoThird: string;
}

/**
 * Maps each modulation degree to its corresponding octave-below note name
 */
export interface ModulationDegrees8vbNoteNames {
  /** Octave-below note name for modulations on the first scale degree */
  modulationsOnFirstDegree8vb: string;

  /** Octave-below note name for modulations on the third scale degree */
  modulationsOnThirdDegree8vb: string;

  /** Octave-below note name for modulations on the alternative third scale degree */
  modulationsOnAltThirdDegree8vb: string;

  /** Octave-below note name for modulations on the fourth scale degree */
  modulationsOnFourthDegree8vb: string;

  /** Octave-below note name for modulations on the fifth scale degree */
  modulationsOnFifthDegree8vb: string;

  /** Octave-below note name for ascending modulations on the sixth scale degree */
  modulationsOnSixthDegreeAsc8vb: string;

  /** Octave-below note name for descending modulations on the sixth scale degree */
  modulationsOnSixthDegreeDesc8vb: string;

  /** Octave-below note name for modulations on the sixth scale degree without using the third */
  modulationsOnSixthDegreeIfNoThird8vb: string;
}

/**
 * Lower octave modulations structure (8vb versions)
 */
export interface LowerOctaveModulationsStructure {
  /** Indices of modulations that occur on the first scale degree (8vb) */
  modulationsOnFirstDegree8vb: string[];

  /** Indices of modulations that occur on the third scale degree (8vb) */
  modulationsOnThirdDegree8vb: string[];

  /** Indices of modulations that occur on the alternative third scale degree (8vb) */
  modulationsOnAltThirdDegree8vb: string[];

  /** Indices of modulations that occur on the fourth scale degree (8vb) */
  modulationsOnFourthDegree8vb: string[];

  /** Indices of modulations that occur on the fifth scale degree (8vb) */
  modulationsOnFifthDegree8vb: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree (8vb) */
  modulationsOnSixthDegreeAsc8vb: string[];

  /** Indices of descending modulations that occur on the sixth scale degree (8vb) */
  modulationsOnSixthDegreeDesc8vb: string[];

  /** Indices of modulations on the sixth scale degree without using the third (8vb) */
  modulationsOnSixthDegreeIfNoThird8vb: string[];

  /** The note name of the second degree (plus variations) (8vb) */
  noteName2pBelowThird8vb: string;
}

/**
 * Index-based modulations for Maqamat using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamatModulationsWithKeys {
  /** Maps each modulation degree to its corresponding note name */
  modulationDegreesNoteNames: ModulationDegreesNoteNames;

  /** Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested) */
  modulationsLowerOctaveDegreesNoteNames?: ModulationDegrees8vbNoteNames;

  /** Standard modulations in normal octave positions */
  modulations: StandardModulationsStructure;

  /** Optional lower octave modulations (only when requested via CLI flag) */
  modulationsLowerOctave?: LowerOctaveModulationsStructure;
}

/**
 * Index-based modulations for Ajnas using array indices instead of full objects
 * to reduce JSON export size
 */
export interface AjnasModulationsWithKeys {
  /** Maps each modulation degree to its corresponding note name */
  modulationDegreesNoteNames: ModulationDegreesNoteNames;

  /** Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested) */
  modulationsLowerOctaveDegreesNoteNames?: ModulationDegrees8vbNoteNames;

  /** Standard modulations in normal octave positions */
  modulations: StandardModulationsStructure;

  /** Optional lower octave modulations (only when requested via CLI flag) */
  modulationsLowerOctave?: LowerOctaveModulationsStructure;
}

interface ExportedTuningSystem {
  // Export metadata
  exportInfo?: {
    timestamp: string;
  };

  // Summary statistics (precise ground truth data)
  summaryStats?: {
    totalAjnasInDatabase: number;
    totalMaqamatInDatabase: number;
    tuningPitchClassesInSingleOctave: number;
    tuningPitchClassesInAllOctaves: number;
    ajnasAvailableInTuning: number;
    maqamatAvailableInTuning: number;
    totalAjnasTranspositions: number;
    totalMaqamatTranspositions: number;
    totalMaqamModulations: number;
    totalAjnasModulations: number;
  };

  // Foundation data
  tuningSystemData?: TuningSystem;
  startingNote?: NoteName;
  tuningSystemPitchClasses?: string[]; // Array of note names - resolve via pitchClassReference

  // Lookup references
  pitchClassReference?: { [noteName: string]: PitchClass };

  // Main musical data
  allAjnasData?: { [ajnasName: string]: MergedJins };
  allMaqamatData?: { [maqamName: string]: MergedMaqam };
}

export interface ExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeAjnasDetails: boolean;
  includeMaqamatDetails: boolean;
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
  includeModulations8vb: boolean;
  progressCallback?: (percentage: number, step: string) => void;
}

export interface JinsExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeTranspositions: boolean;
  progressCallback?: (percentage: number, step: string) => void;
}

export interface MaqamExportOptions {
  includeTuningSystemDetails: boolean;
  includePitchClasses: boolean;
  includeTranspositions: boolean;
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
  includeModulations8vb: boolean;
  progressCallback?: (percentage: number, step: string) => void;
}

interface ExportedJins {
  exportInfo?: {
    timestamp: string;
  };
  jins?: MergedJins;
  tuningSystemData?: TuningSystem;
  startingNote?: NoteName;
  pitchClassReference?: { [noteName: string]: PitchClass };
  allAjnasData?: { [ajnasName: string]: MergedJins };
  tuningSystemPitchClasses?: string[];
  transpositions?: string[];
  numberOfTranspositions?: number;
}

interface ExportedMaqam {
  exportInfo?: {
    timestamp: string;
  };
  maqam?: MergedMaqam;
  tuningSystemData?: TuningSystem;
  startingNote?: NoteName;
  pitchClassReference?: { [noteName: string]: PitchClass };
  allAjnasData?: { [ajnasName: string]: MergedJins };
  allMaqamatData?: { [maqamName: string]: MergedMaqam };
  tuningSystemPitchClasses?: string[];
  transpositions?: string[];
  numberOfTranspositions?: number;
  maqamatModulations?: MaqamatModulationsWithKeys;
  numberOfMaqamModulationHops?: number;
  ajnasModulations?: AjnasModulationsWithKeys;
  numberOfJinsModulationHops?: number;
}

interface MaqamWithAjnasAsObjects extends Omit<Maqam, "ascendingMaqamAjnas" | "descendingMaqamAjnas"> {
  ascendingMaqamAjnas?: { [noteName: string]: Jins | null };
  descendingMaqamAjnas?: { [noteName: string]: Jins | null };
  maqamatModulations?: MaqamatModulationsWithKeys;
  ajnasModulations?: AjnasModulationsWithKeys;
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
 * **Optimization**: This function uses a pure reference architecture with
 * maqamReference and jinsReference dictionaries only. All data is accessible
 * via Object.values() for optimal performance - no redundant arrays that
 * would require double lookups.
 *
 * @param tuningSystem - The tuning system to export
 * @param startingNote - The starting note of the tuning system
 * @param options - Export configuration options specifying what data to include
 * @param centsTolerance - Tolerance in cents for matching cents values (default: 5)
 * @returns Comprehensive export object containing all requested tuning system data
 */

/**
 * Helper function to create modulation degrees note names mapping
 */
function createModulationDegreesNoteNames(
  ascendingPitchClasses: string[],
  descendingPitchClasses: string[],
  noteName2pBelowThird: string
): ModulationDegreesNoteNames {
  return {
    modulationsOnFirstDegree: standardizeText(ascendingPitchClasses[0] || ''),
    modulationsOnThirdDegree: standardizeText(ascendingPitchClasses[2] || ''),
    modulationsOnAltThirdDegree: standardizeText(noteName2pBelowThird),
    modulationsOnFourthDegree: standardizeText(ascendingPitchClasses[3] || ''),
    modulationsOnFifthDegree: standardizeText(ascendingPitchClasses[4] || ''),
    modulationsOnSixthDegreeAsc: standardizeText(ascendingPitchClasses[5] || ''),
    modulationsOnSixthDegreeDesc: standardizeText(descendingPitchClasses[1] || ''), // Second from start in descending (reverse order)
    modulationsOnSixthDegreeIfNoThird: standardizeText(ascendingPitchClasses[5] || ''), // Same as ascending sixth
  };
}

/**
 * Helper function to map note names to their octave-below equivalents
 */
function mapNoteToOctaveBelow(noteName: string): string {
  // Handle empty/invalid input
  if (!noteName) return '';

  // Create a mapping based on the pitch class relationships
  // This mimics the logic used in the actual maqam octave shifting
  const noteNameLower = noteName.toLowerCase();
  
  // Define the standard octave mapping patterns observed in the data
  const octaveMapping: Record<string, string> = {
    // Main pitch classes to their octave-below equivalents
    'rast': 'qarar_rast',
    'dugah': 'qarar_dugah', 
    'segah': 'qarar_segah',
    'chahargah': 'qarar_chahargah',
    'nawa': 'yegah',           // Special case: nawa → yegah
    'husayni': 'ushayran',     // Special case: husayni → ushayran
    'awj': 'qarar_awj',
    'kurdi': 'qarar_kurdi',
    'kurdī': 'qarar_kurdi',    // Handle diacritical variants
    
    // Additional common pitch classes
    'ajam': 'qarar_ajam',
    'iraq': 'qarar_iraq',
    'muhayyer': 'buzurk',
    'muhayar': 'buzurk',       // Alternative spelling
    'buzurk': 'kurdan',
    'mahur': 'qarar_mahur',
    'mahuran': 'qarar_mahuran',
    
    // Handle some already-octave-below names (pass through)
    'yegah': 'qarar_yegah',
    'ushayran': 'qarar_ushayran',
    'ushshaq': 'qarar_ushshaq',
    'buselik': 'qarar_buselik',
    'kawasht': 'qarar_kawasht',
    'hijaz': 'qarar_hijaz',
  };

  // Try direct mapping first
  const directMapping = octaveMapping[noteNameLower];
  if (directMapping) {
    return directMapping;
  }

  // If no direct mapping found, construct qarar_ prefix for most cases
  // This handles the general pattern where most notes become qarar_[notename]
  return `qarar_${noteName}`;
}

/**
 * Helper function to create octave-below modulation degrees note names mapping
 */
function createModulationDegrees8vbNoteNames(
  ascendingPitchClasses: string[],
  descendingPitchClasses: string[],
  noteName2pBelowThird: string
): ModulationDegrees8vbNoteNames {
  return {
    modulationsOnFirstDegree8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[0] || ''))),
    modulationsOnThirdDegree8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[2] || ''))),
    modulationsOnAltThirdDegree8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(noteName2pBelowThird))),
    modulationsOnFourthDegree8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[3] || ''))),
    modulationsOnFifthDegree8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[4] || ''))),
    modulationsOnSixthDegreeAsc8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''))),
    modulationsOnSixthDegreeDesc8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(descendingPitchClasses[1] || ''))),
    modulationsOnSixthDegreeIfNoThird8vb: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''))),
  };
}

/**
 * Helper function to create standard modulations structure
 */
function createStandardModulations(modulations: MaqamatModulations | AjnasModulations): StandardModulationsStructure {
  if ('modulationsOnFirstDegree' in modulations) {
    // It's MaqamatModulations
    const maqamatMods = modulations as MaqamatModulations;
    return {
      modulationsOnFirstDegree: (maqamatMods.modulationsOnFirstDegree || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnThirdDegree: (maqamatMods.modulationsOnThirdDegree || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnAltThirdDegree: (maqamatMods.modulationsOnAltThirdDegree || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnFourthDegree: (maqamatMods.modulationsOnFourthDegree || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnFifthDegree: (maqamatMods.modulationsOnFifthDegree || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnSixthDegreeAsc: (maqamatMods.modulationsOnSixthDegreeAsc || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnSixthDegreeDesc: (maqamatMods.modulationsOnSixthDegreeDesc || []).map((maqam) => standardizeText(maqam.name)),
      modulationsOnSixthDegreeIfNoThird: (maqamatMods.modulationsOnSixthDegreeIfNoThird || []).map((maqam) => standardizeText(maqam.name)),
      noteName2pBelowThird: maqamatMods.noteName2pBelowThird || '',
    };
  } else {
    // It's AjnasModulations
    const ajnasMods = modulations as AjnasModulations;
    return {
      modulationsOnFirstDegree: (ajnasMods.modulationsOnFirstDegree || []).map((jins) => standardizeText(jins.name)),
      modulationsOnThirdDegree: (ajnasMods.modulationsOnThirdDegree || []).map((jins) => standardizeText(jins.name)),
      modulationsOnAltThirdDegree: (ajnasMods.modulationsOnAltThirdDegree || []).map((jins) => standardizeText(jins.name)),
      modulationsOnFourthDegree: (ajnasMods.modulationsOnFourthDegree || []).map((jins) => standardizeText(jins.name)),
      modulationsOnFifthDegree: (ajnasMods.modulationsOnFifthDegree || []).map((jins) => standardizeText(jins.name)),
      modulationsOnSixthDegreeAsc: (ajnasMods.modulationsOnSixthDegreeAsc || []).map((jins) => standardizeText(jins.name)),
      modulationsOnSixthDegreeDesc: (ajnasMods.modulationsOnSixthDegreeDesc || []).map((jins) => standardizeText(jins.name)),
      modulationsOnSixthDegreeIfNoThird: (ajnasMods.modulationsOnSixthDegreeIfNoThird || []).map((jins) => standardizeText(jins.name)),
      noteName2pBelowThird: ajnasMods.noteName2pBelowThird || '',
    };
  }
}

/**
 * Helper function to create lower octave modulations structure.
 * Only creates 8vb data for maqamat modulations - returns empty structure for ajnas.
 */
function createLowerOctaveModulations(
  modulations: MaqamatModulations | AjnasModulations,
  allPitchClasses: PitchClass[]
): LowerOctaveModulationsStructure {
  if ('modulationsOnFirstDegree' in modulations) {
    // It's MaqamatModulations
    const maqamatMods = modulations as MaqamatModulations;
    return {
      modulationsOnFirstDegree8vb: (maqamatMods.modulationsOnFirstDegree || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnThirdDegree8vb: (maqamatMods.modulationsOnThirdDegree || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnAltThirdDegree8vb: (maqamatMods.modulationsOnAltThirdDegree || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnFourthDegree8vb: (maqamatMods.modulationsOnFourthDegree || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnFifthDegree8vb: (maqamatMods.modulationsOnFifthDegree || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnSixthDegreeAsc8vb: (maqamatMods.modulationsOnSixthDegreeAsc || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnSixthDegreeDesc8vb: (maqamatMods.modulationsOnSixthDegreeDesc || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      modulationsOnSixthDegreeIfNoThird8vb: (maqamatMods.modulationsOnSixthDegreeIfNoThird || [])
        .map((maqam) => {
          try {
            const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
            return shifted ? standardizeText(shifted.name) : standardizeText(maqam.name + ' (shift failed)');
          } catch {
            return standardizeText(maqam.name + ' (error)');
          }
        }),
      noteName2pBelowThird8vb: maqamatMods.noteName2pBelowThird || '',
    };
  } else {
    // It's AjnasModulations - return empty structure since we don't include 8vb data for ajnas
    return {
      modulationsOnFirstDegree8vb: [],
      modulationsOnThirdDegree8vb: [],
      modulationsOnAltThirdDegree8vb: [],
      modulationsOnFourthDegree8vb: [],
      modulationsOnFifthDegree8vb: [],
      modulationsOnSixthDegreeAsc8vb: [],
      modulationsOnSixthDegreeDesc8vb: [],
      modulationsOnSixthDegreeIfNoThird8vb: [],
      noteName2pBelowThird8vb: '',
    };
  }
}

export async function exportTuningSystem(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: ExportOptions,
  centsTolerance: number = 5
): Promise<ExportedTuningSystem> {
  // Progress tracking helper - setup immediately
  const updateProgress = options.progressCallback || (() => {});

  // IMMEDIATE progress update to signal function has started
  updateProgress(61, "Starting tuning system export...");

  // Build result in logical order: Info → Summary → Foundation → Lookups → Data
  const result: ExportedTuningSystem = {};

  // === 1. EXPORT INFO ===
  updateProgress(62, "Initializing export structure...");
  result.exportInfo = {
    timestamp: new Date().toISOString(),
  };

  // === 2. GET BASE DATA FOR STATISTICS ===
  // Use setTimeout to yield control back to browser for UI updates
  updateProgress(63, "Loading ajnas database...");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const allAjnas = getAjnas();

  updateProgress(64, "Loading maqamat database...");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const allMaqamat = getMaqamat();

  updateProgress(65, "Computing pitch class range...");
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  for (const tuningSystemPitchClass of fullRangeTuningSystemPitchClasses) {
    if (tuningSystemPitchClass.noteName === "none") {
      tuningSystemPitchClass.noteName = `none ${tuningSystemPitchClass.octave}/${tuningSystemPitchClass.index}`;
    }
  }

  // Filter possible ajnas and maqamat
  updateProgress(66, "Filtering compatible ajnas...");
  const possibleAjnasOverview: JinsData[] = allAjnas.filter((jins) =>
    jins.getNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  updateProgress(67, "Filtering compatible maqamat...");
  const possibleMaqamatOverview: MaqamData[] = allMaqamat.filter(
    (maqam) =>
      maqam.getAscendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => fullRangeTuningSystemPitchClasses.some((pitchClass) => pitchClass.noteName === noteName))
  );

  // === 3. FOUNDATION DATA ===
  if (options.includeTuningSystemDetails) {
    // Create a copy of the tuning system with only the relevant note name set
    const allSets = tuningSystem.getNoteNameSets();
    const relevantNoteNameSet = allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

    // Create object with explicit property order
    result.tuningSystemData = {
      // Core identification first
      id: tuningSystem.getId(),
      titleEnglish: tuningSystem.getTitleEnglish(),
      titleArabic: tuningSystem.getTitleArabic(),
      year: tuningSystem.getYear(),
      sourceEnglish: tuningSystem.getSourceEnglish(),
      sourceArabic: tuningSystem.getSourceArabic(),
      sourcePageReferences: tuningSystem.getSourcePageReferences(),
      creatorEnglish: tuningSystem.getCreatorEnglish(),
      creatorArabic: tuningSystem.getCreatorArabic(),
      commentsEnglish: tuningSystem.getCommentsEnglish(),
      commentsArabic: tuningSystem.getCommentsArabic(),
      // Starting note for this export
      startingNote: standardizeText(startingNote),

      // Musical data with explicit ordering
      originalPitchClassValues: tuningSystem.getOriginalPitchClassValues(),
      originalPitchClassNoteNames: [relevantNoteNameSet], // Right after originalPitchClassValues
      abjadNames: tuningSystem.getAbjadNames(),

      // Technical parameters
      stringLength: tuningSystem.getStringLength(),
      referenceFrequencies: tuningSystem.getReferenceFrequencies(),
      defaultReferenceFrequency: tuningSystem.getDefaultReferenceFrequency(),
      saved: (tuningSystem as any).saved,
    } as any;
  }

  if (options.includePitchClasses) {
    // Store only note names - users can resolve full objects via pitchClassReference
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map((pc) => standardizeText(pc.noteName));
  }

  // === SUMMARY STATISTICS ===
  updateProgress(68, "Compiling summary statistics...");
  result.summaryStats = {
    totalAjnasInDatabase: allAjnas.length,
    totalMaqamatInDatabase: allMaqamat.length,
    tuningPitchClassesInSingleOctave: tuningSystem.getOriginalPitchClassValues().length,
    tuningPitchClassesInAllOctaves: fullRangeTuningSystemPitchClasses.length,
    ajnasAvailableInTuning: possibleAjnasOverview.length,
    maqamatAvailableInTuning: possibleMaqamatOverview.length,
    totalAjnasTranspositions: 0, // Will be calculated during processing
    totalMaqamatTranspositions: 0, // Will be calculated during processing
    totalMaqamModulations: 0, // Will be calculated during processing
    totalAjnasModulations: 0, // Will be calculated during processing
  };

  // === 4. LOOKUP REFERENCES ===
  updateProgress(69, "Building pitch class references...");
  const pitchClassReference: { [noteName: string]: PitchClass } = {};
  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[standardizeText(pc.noteName)] = pc;
  });
  result.pitchClassReference = pitchClassReference;

  // === 6. MUSICAL DATA SECTION (Core Content) ===
  const jinsReference: { [jinsName: string]: MergedJins } = {};
  const maqamReference: { [maqamName: string]: MergedMaqam } = {};

  // Initialize statistics counters
  let totalAjnasTranspositions = 0;
  let totalMaqamatTranspositions = 0;
  let totalMaqamModulations = 0;
  let totalAjnasModulations = 0;

  // Include ajnas details if requested
  if (options.includeAjnasDetails || options.includeMaqamatDetails) {
    const possibleAjnas: Jins[] = [];
    const possibleAjnasOverviewInterfaces: JinsDataInterface[] = [];

    updateProgress(70, `Processing ${possibleAjnasOverview.length} ajnas...`);

    for (let i = 0; i < possibleAjnasOverview.length; i++) {
      const jins = possibleAjnasOverview[i] as JinsData;

      // Yield control to browser every few iterations to allow UI updates
      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Update progress for each jins - spread across 70-75% (moderate complexity)
      if (possibleAjnasOverview.length > 5) {
        const ajnasProgress = 70 + Math.round((i / possibleAjnasOverview.length) * 5);
        updateProgress(ajnasProgress, `Processing ajnas ${i + 1}/${possibleAjnasOverview.length}...`);
      }

      let numberOfTranspositions = 0;
      for (const jinsTransposition of getJinsTranspositions(fullRangeTuningSystemPitchClasses, jins, true, centsTolerance)) {
        possibleAjnas.push(jinsTransposition);
        numberOfTranspositions++;
      }

      // Count ajnas transpositions for statistics as we process
      totalAjnasTranspositions += numberOfTranspositions;

      const possibleJinsOverviewInterface = jins.convertToObject();
      possibleJinsOverviewInterface.numberOfTranspositions = numberOfTranspositions;

      possibleAjnasOverviewInterfaces.push(possibleJinsOverviewInterface);
    }

    updateProgress(76, "Merging ajnas data...");
    for (const possibleJins of possibleAjnas) {
      const jinsOverview = possibleAjnasOverview.find((j) => j.getId() === possibleJins.jinsId);

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: possibleJins.jinsId,
          name: possibleJins.name,
          jinsPitchClasses: possibleJins.jinsPitchClasses.map((pc) => standardizeText(pc.noteName)),
          jinsPitchClassIntervals: possibleJins.jinsPitchClassIntervals,
          transposition: possibleJins.transposition,
          commentsEnglish: jinsOverview.getCommentsEnglish(),
          commentsArabic: jinsOverview.getCommentsArabic(),
          SourcePageReferences: jinsOverview.getSourcePageReferences(),
        };

        jinsReference[standardizeText(possibleJins.name)] = mergedJins;
      }
    }
  }

  // Include maqamat details if requested
  if (options.includeMaqamatDetails) {
    const possibleMaqamat: MaqamWithAjnasAsObjects[] = [];
    const possibleMaqamatOverviewInterfaces: MaqamDataInterface[] = [];

    updateProgress(78, `Processing ${possibleMaqamatOverview.length} maqamat...`);

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamData;

      // Yield control to browser every few iterations
      if (i % 3 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Update progress for each maqam - spread across 78-90% (heavy complexity - 12% of progress bar)
      if (possibleMaqamatOverview.length > 3) {
        const maqamProgress = 78 + Math.round((i / possibleMaqamatOverview.length) * 12);
        updateProgress(maqamProgress, `Processing maqam ${i + 1}/${possibleMaqamatOverview.length}...`);
      }

      let numberOfTranspositions = 0;
      const maqamTranspositions = getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqam, true, centsTolerance);

      for (let j = 0; j < maqamTranspositions.length; j++) {
        const maqamTransposition = maqamTranspositions[j];

        // Yield control every few transpositions to allow UI updates
        if (j % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        let maqamatModulations: MaqamatModulations | undefined = undefined;
        let ajnasModulations: AjnasModulations | undefined = undefined;

        // Include modulations if requested
        if (options.includeMaqamatModulations || options.includeAjnasModulations) {
          if (options.includeMaqamatModulations) {
            maqamatModulations = modulate(
              fullRangeTuningSystemPitchClasses,
              allAjnas,
              allMaqamat,
              maqamTransposition,
              false,
              centsTolerance
            ) as MaqamatModulations;
            const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);
            (maqamTransposition as any).maqamatModulations = maqamatModulations;
            (maqamTransposition as any).numberOfMaqamModulationHops = numberOfMaqamModulationHops;

            // Count modulations for statistics
            totalMaqamModulations += numberOfMaqamModulationHops;
          }

          if (options.includeAjnasModulations) {
            ajnasModulations = modulate(
              fullRangeTuningSystemPitchClasses,
              allAjnas,
              allMaqamat,
              maqamTransposition,
              true,
              centsTolerance
            ) as AjnasModulations;
            const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);
            (maqamTransposition as any).ajnasModulations = ajnasModulations;
            (maqamTransposition as any).numberOfJinsModulationHops = numberOfJinsModulationHops;

            // Count modulations for statistics
            totalAjnasModulations += numberOfJinsModulationHops;
          }
        }

        // Count maqam transpositions for statistics
        totalMaqamatTranspositions++;

        const maqamAjnasToObjects = convertMaqamAjnasToObjects(maqamTransposition);

        if (maqamatModulations) {
          const maqamModulationWithKeys: MaqamatModulationsWithKeys = {
            modulationDegreesNoteNames: createModulationDegreesNoteNames(
              maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
              maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
              maqamatModulations.noteName2pBelowThird || ''
            ),
            ...(options.includeModulations8vb && {
              modulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
                maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                maqamatModulations.noteName2pBelowThird || ''
              )
            }),
            modulations: createStandardModulations(maqamatModulations),
            ...(options.includeModulations8vb && {
              modulationsLowerOctave: createLowerOctaveModulations(
                maqamatModulations, 
                fullRangeTuningSystemPitchClasses
              )
            })
          };

          maqamAjnasToObjects.maqamatModulations = maqamModulationWithKeys;
        }

        if (ajnasModulations) {
          const ajnasModulationsWithKeys: AjnasModulationsWithKeys = {
            modulationDegreesNoteNames: createModulationDegreesNoteNames(
              maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
              maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
              ajnasModulations.noteName2pBelowThird || ''
            ),
            ...(options.includeModulations8vb && {
              modulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
                maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                ajnasModulations.noteName2pBelowThird || ''
              )
            }),
            modulations: createStandardModulations(ajnasModulations),
            ...(options.includeModulations8vb && {
              modulationsLowerOctave: createLowerOctaveModulations(
                ajnasModulations, 
                fullRangeTuningSystemPitchClasses
              )
            })
          };

          maqamAjnasToObjects.ajnasModulations = ajnasModulationsWithKeys;
        }

        possibleMaqamat.push(maqamAjnasToObjects);
        numberOfTranspositions++;
      }

      const possibleMaqamOverviewInterface = maqam.convertToObject();
      possibleMaqamOverviewInterface.numberOfTranspositions = numberOfTranspositions;

      possibleMaqamatOverviewInterfaces.push(possibleMaqamOverviewInterface);
    }

    for (const possibleMaqam of possibleMaqamat) {
      const maqamOverview = possibleMaqamatOverview.find((m) => m.getId() === possibleMaqam.maqamId);

      if (maqamOverview) {
        const mergedMaqam: MergedMaqam = {
          maqamId: possibleMaqam.maqamId,
          name: possibleMaqam.name,
          ascendingPitchClasses: possibleMaqam.ascendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
          descendingPitchClasses: possibleMaqam.descendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
          ascendingPitchClassIntervals: possibleMaqam.ascendingPitchClassIntervals,
          descendingPitchClassIntervals: possibleMaqam.descendingPitchClassIntervals,
          ascendingMaqamAjnas: possibleMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(possibleMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
              )
            : undefined,
          descendingMaqamAjnas: possibleMaqam.descendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(possibleMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
              )
            : undefined,
          transposition: possibleMaqam.transposition,
          commentsEnglish: maqamOverview.getCommentsEnglish(),
          commentsArabic: maqamOverview.getCommentsArabic(),
          SourcePageReferences: maqamOverview.getSourcePageReferences(),
        };

        if (possibleMaqam.maqamatModulations) mergedMaqam.maqamatModulations = possibleMaqam.maqamatModulations;
        if (possibleMaqam.ajnasModulations) mergedMaqam.ajnasModulations = possibleMaqam.ajnasModulations;

        maqamReference[standardizeText(possibleMaqam.name)] = mergedMaqam;
      }
    }
  }

  // === UPDATE SUMMARY STATISTICS (with calculated values) ===
  updateProgress(91, "Updating summary statistics...");
  if (result.summaryStats) {
    result.summaryStats.totalAjnasTranspositions = totalAjnasTranspositions;
    result.summaryStats.totalMaqamatTranspositions = totalMaqamatTranspositions;
    result.summaryStats.totalMaqamModulations = totalMaqamModulations;
    result.summaryStats.totalAjnasModulations = totalAjnasModulations;
  }

  // === 7. MAIN DATA ===
  updateProgress(95, "Finalizing export data...");

  // Only include ajnas data if it was requested in the export options
  if (options.includeAjnasDetails) {
    result.allAjnasData = jinsReference;
  }

  // Only include maqamat data if it was requested in the export options
  if (options.includeMaqamatDetails) {
    result.allMaqamatData = maqamReference;
  }

  updateProgress(98, "Export compilation complete!");
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
export async function exportJins(
  jinsInput: Jins | JinsData,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: JinsExportOptions,
  centsTolerance: number = 5
): Promise<ExportedJins> {
  // Progress tracking helper - setup immediately
  const updateProgress = options.progressCallback || (() => {});

  // IMMEDIATE progress update to signal function has started
  updateProgress(83, "Starting jins export...");

  const result: ExportedJins = {};

  // Add export info
  updateProgress(84, "Initializing export structure...");
  result.exportInfo = {
    timestamp: new Date().toISOString(),
  };

  updateProgress(85, "Computing pitch class range...");
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  for (const tuningSystemPitchClass of fullRangeTuningSystemPitchClasses) {
    if (tuningSystemPitchClass.noteName === "none") {
      tuningSystemPitchClass.noteName = `none ${tuningSystemPitchClass.octave}/${tuningSystemPitchClass.index}`;
    }
  }

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[standardizeText(pc.noteName)] = pc;
  });

  let jinsToExport: Jins;
  let jinsData: JinsData | undefined;

  updateProgress(86, "Loading ajnas database...");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const allAjnas = getAjnas();

  // Check if input is a Jins instance or JinsData
  if ("jinsId" in jinsInput) {
    // It's a Jins instance - export this directly
    jinsToExport = jinsInput;

    for (const pc of jinsToExport.jinsPitchClasses) {
      if (pc.noteName === "none") {
        pc.noteName = `none ${pc.octave}/${pc.index}`;
      }
    }

    // Find the jinsData for creating MergedJins
    jinsData = allAjnas.find((j) => j.getId() === jinsInput.jinsId);
  } else {
    // It's a JinsData instance - convert to Jins using getTahlil
    jinsData = jinsInput;
    jinsToExport = jinsData.getTahlil(fullRangeTuningSystemPitchClasses);
  }

  // Include tuning system details if requested
  if (options.includeTuningSystemDetails) {
    // Create a copy of the tuning system with only the relevant note name set
    const allSets = tuningSystem.getNoteNameSets();
    const relevantNoteNameSet = allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

    // Create object with explicit property order
    result.tuningSystemData = {
      // Core identification first
      id: tuningSystem.getId(),
      titleEnglish: tuningSystem.getTitleEnglish(),
      titleArabic: tuningSystem.getTitleArabic(),
      year: tuningSystem.getYear(),
      sourceEnglish: tuningSystem.getSourceEnglish(),
      sourceArabic: tuningSystem.getSourceArabic(),
      sourcePageReferences: tuningSystem.getSourcePageReferences(),
      creatorEnglish: tuningSystem.getCreatorEnglish(),
      creatorArabic: tuningSystem.getCreatorArabic(),
      commentsEnglish: tuningSystem.getCommentsEnglish(),
      commentsArabic: tuningSystem.getCommentsArabic(),
      // Starting note for this export
      startingNote: startingNote,

      // Musical data with explicit ordering
      originalPitchClassValues: tuningSystem.getOriginalPitchClassValues(),
      originalPitchClassNoteNames: [relevantNoteNameSet], // Right after originalPitchClassValues
      abjadNames: tuningSystem.getAbjadNames(),

      // Technical parameters
      stringLength: tuningSystem.getStringLength(),
      referenceFrequencies: tuningSystem.getReferenceFrequencies(),
      defaultReferenceFrequency: tuningSystem.getDefaultReferenceFrequency(),
      saved: (tuningSystem as any).saved,
    } as any;
  }

  // Include pitch classes if requested
  if (options.includePitchClasses) {
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map((pc) => standardizeText(pc.noteName));
  }

  // Include the actual jins instance as MergedJins
  if (jinsData) {
    const mergedJins: MergedJins = {
      jinsId: jinsToExport.jinsId,
      name: jinsToExport.name,
      jinsPitchClasses: jinsToExport.jinsPitchClasses.map((pc) => standardizeText(pc.noteName)),
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
    updateProgress(87, "Processing jins transpositions...");
    const transpositions: MergedJins[] = [];
    let numberOfTranspositions = 0;

    const jinsTranspositions = Array.from(getJinsTranspositions(fullRangeTuningSystemPitchClasses, jinsData, true, centsTolerance));

    for (let i = 0; i < jinsTranspositions.length; i++) {
      const jinsTransposition = jinsTranspositions[i];

      // Yield control every few iterations
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (jinsTranspositions.length > 10) {
          const progress = 87 + Math.round((i / jinsTranspositions.length) * 7);
          updateProgress(progress, `Processing transposition ${i + 1}/${jinsTranspositions.length}...`);
        }
      }

      const jinsOverview = allAjnas.find((j) => j.getId() === jinsTransposition.jinsId);

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: jinsTransposition.jinsId,
          name: jinsTransposition.name,
          jinsPitchClasses: jinsTransposition.jinsPitchClasses.map((pc) => standardizeText(pc.noteName)),
          jinsPitchClassIntervals: jinsTransposition.jinsPitchClassIntervals,
          transposition: jinsTransposition.transposition,
          commentsEnglish: jinsOverview.getCommentsEnglish(),
          commentsArabic: jinsOverview.getCommentsArabic(),
          SourcePageReferences: jinsOverview.getSourcePageReferences(),
        };

        jinsReference[standardizeText(jinsTransposition.name)] = mergedJins;
        transpositions.push(mergedJins);
        numberOfTranspositions++;
      }
    }

    updateProgress(94, "Finalizing jins transpositions...");
    result.transpositions = transpositions.map((jins) => standardizeText(jins.name));
    result.numberOfTranspositions = numberOfTranspositions;
  }

  updateProgress(95, "Compiling jins export data...");
  result.pitchClassReference = pitchClassReference;
  result.allAjnasData = jinsReference;

  updateProgress(96, "Jins export complete!");
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
export async function exportMaqam(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  options: MaqamExportOptions,
  centsTolerance: number = 5
): Promise<ExportedMaqam> {
  // Progress tracking helper - setup immediately
  const updateProgress = options.progressCallback || (() => {});

  // IMMEDIATE progress update to signal function has started
  updateProgress(61, "Starting maqam export...");

  const result: ExportedMaqam = {};

  // Add export info
  updateProgress(62, "Initializing export structure...");
  result.exportInfo = {
    timestamp: new Date().toISOString(),
  };

  updateProgress(63, "Computing pitch class range...");
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  for (const tuningSystemPitchClass of fullRangeTuningSystemPitchClasses) {
    if (tuningSystemPitchClass.noteName === "none") {
      tuningSystemPitchClass.noteName = `none ${tuningSystemPitchClass.octave}/${tuningSystemPitchClass.index}`;
    }
  }

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  const maqamReference: { [maqamName: string]: MergedMaqam } = {};

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[standardizeText(pc.noteName)] = pc;
  });

  let maqamToExport: Maqam;
  let maqamData: MaqamData | undefined;

  // Check if input is a Maqam instance or MaqamData
  if ("maqamId" in maqamInput) {
    // It's a Maqam instance - export this directly
    maqamToExport = maqamInput;

    for (let i = 0; i < maqamToExport.ascendingPitchClasses.length; i++) {
      const ascendingPitchClass = maqamToExport.ascendingPitchClasses[i];
      const descendingPitchClass = maqamToExport.descendingPitchClasses[i];
      if (ascendingPitchClass.noteName === "none") {
        ascendingPitchClass.noteName = `none ${ascendingPitchClass.octave}/${ascendingPitchClass.index}`;
      }

      if (descendingPitchClass.noteName === "none") {
        descendingPitchClass.noteName = `none ${descendingPitchClass.octave}/${descendingPitchClass.index}`;
      }
    }

    // Find the maqamData for creating MergedMaqam
    updateProgress(64, "Loading maqamat database...");
    await new Promise((resolve) => setTimeout(resolve, 0));
    const allMaqamat = getMaqamat();
    maqamData = allMaqamat.find((m) => m.getId() === maqamInput.maqamId);
  } else {
    // It's a MaqamData instance - convert to Maqam using getTahlil
    maqamData = maqamInput;
    maqamToExport = maqamData.getTahlil(fullRangeTuningSystemPitchClasses);
  }

  // Include tuning system details if requested
  if (options.includeTuningSystemDetails) {
    // Create a copy of the tuning system with only the relevant note name set
    const allSets = tuningSystem.getNoteNameSets();
    const relevantNoteNameSet = allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

    // Create object with explicit property order
    result.tuningSystemData = {
      // Core identification first
      id: tuningSystem.getId(),
      titleEnglish: tuningSystem.getTitleEnglish(),
      titleArabic: tuningSystem.getTitleArabic(),
      year: tuningSystem.getYear(),
      sourceEnglish: tuningSystem.getSourceEnglish(),
      sourceArabic: tuningSystem.getSourceArabic(),
      sourcePageReferences: tuningSystem.getSourcePageReferences(),
      creatorEnglish: tuningSystem.getCreatorEnglish(),
      creatorArabic: tuningSystem.getCreatorArabic(),
      commentsEnglish: tuningSystem.getCommentsEnglish(),
      commentsArabic: tuningSystem.getCommentsArabic(),
      // Starting note for this export
      startingNote: startingNote,

      // Musical data with explicit ordering
      originalPitchClassValues: tuningSystem.getOriginalPitchClassValues(),
      originalPitchClassNoteNames: [relevantNoteNameSet], // Right after originalPitchClassValues
      abjadNames: tuningSystem.getAbjadNames(),

      // Technical parameters
      stringLength: tuningSystem.getStringLength(),
      referenceFrequencies: tuningSystem.getReferenceFrequencies(),
      defaultReferenceFrequency: tuningSystem.getDefaultReferenceFrequency(),
      saved: (tuningSystem as any).saved,
    } as any;
  }

  // Include pitch classes if requested
  if (options.includePitchClasses) {
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map((pc) => standardizeText(pc.noteName));
  }

  // Include the actual maqam instance as MergedMaqam
  if (maqamData) {
    const convertedMaqam = convertMaqamAjnasToObjects(maqamToExport);
    const mergedMaqam: MergedMaqam = {
      maqamId: maqamToExport.maqamId,
      name: maqamToExport.name,
      ascendingPitchClasses: maqamToExport.ascendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
      descendingPitchClasses: maqamToExport.descendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
      ascendingPitchClassIntervals: maqamToExport.ascendingPitchClassIntervals,
      descendingPitchClassIntervals: maqamToExport.descendingPitchClassIntervals,
      ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
        ? Object.fromEntries(
            Object.entries(convertedMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
          )
        : undefined,
      descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
        ? Object.fromEntries(
            Object.entries(convertedMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
          )
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
      const maqamatModulations = modulate(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        allMaqamat,
        maqamToExport,
        false,
        centsTolerance
      ) as MaqamatModulations;
      const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);

      const maqamModulationWithKeys: MaqamatModulationsWithKeys = {
        modulationDegreesNoteNames: createModulationDegreesNoteNames(
          maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
          maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
          maqamatModulations.noteName2pBelowThird || ''
        ),
        ...(options.includeModulations8vb && {
          modulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
            maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
            maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
            maqamatModulations.noteName2pBelowThird || ''
          )
        }),
        modulations: createStandardModulations(maqamatModulations),
        ...(options.includeModulations8vb && {
          modulationsLowerOctave: createLowerOctaveModulations(
            maqamatModulations, 
            fullRangeTuningSystemPitchClasses
          )
        })
      };

      result.maqamatModulations = maqamModulationWithKeys;
      result.numberOfMaqamModulationHops = numberOfMaqamModulationHops;
    }

    // Calculate Ajnas modulations if requested
    if (options.includeAjnasModulations) {
      const ajnasModulations = modulate(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        allMaqamat,
        maqamToExport,
        true,
        centsTolerance
      ) as AjnasModulations;
      const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);

      const ajnasModulationsWithKeys: AjnasModulationsWithKeys = {
        modulationDegreesNoteNames: createModulationDegreesNoteNames(
          maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
          maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
          ajnasModulations.noteName2pBelowThird || ''
        ),
        ...(options.includeModulations8vb && {
          modulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
            maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
            maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
            ajnasModulations.noteName2pBelowThird || ''
          )
        }),
        modulations: createStandardModulations(ajnasModulations),
        ...(options.includeModulations8vb && {
          modulationsLowerOctave: createLowerOctaveModulations(
            ajnasModulations, 
            fullRangeTuningSystemPitchClasses
          )
        })
      };

      result.ajnasModulations = ajnasModulationsWithKeys;
      result.numberOfJinsModulationHops = numberOfJinsModulationHops;
    }
  }

  // Include transpositions if requested and we have maqamData
  if (options.includeTranspositions && maqamData) {
    updateProgress(65, "Processing maqam transpositions...");
    const transpositionNames: string[] = [];
    let numberOfTranspositions = 0;
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    const maqamTranspositions = Array.from(getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqamData, true, centsTolerance));

    for (let i = 0; i < maqamTranspositions.length; i++) {
      const maqamTransposition = maqamTranspositions[i];

      // Yield control every few iterations
      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (maqamTranspositions.length > 5) {
          const progress = 65 + Math.round((i / maqamTranspositions.length) * 25);
          updateProgress(progress, `Processing transposition ${i + 1}/${maqamTranspositions.length}...`);
        }
      }

      // Include modulations for each transposition if requested
      if (options.includeMaqamatModulations) {
        const maqamatModulations = modulate(
          fullRangeTuningSystemPitchClasses,
          allAjnas,
          allMaqamat,
          maqamTransposition,
          false,
          centsTolerance
        ) as MaqamatModulations;
        const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);
        (maqamTransposition as any).maqamatModulations = maqamatModulations; // Use original format
        (maqamTransposition as any).numberOfMaqamModulationHops = numberOfMaqamModulationHops;
      }

      if (options.includeAjnasModulations) {
        const ajnasModulations = modulate(
          fullRangeTuningSystemPitchClasses,
          allAjnas,
          allMaqamat,
          maqamTransposition,
          true,
          centsTolerance
        ) as AjnasModulations;
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
          ascendingPitchClasses: maqamTransposition.ascendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
          descendingPitchClasses: maqamTransposition.descendingPitchClasses.map((pc) => standardizeText(pc.noteName)),
          ascendingPitchClassIntervals: maqamTransposition.ascendingPitchClassIntervals,
          descendingPitchClassIntervals: maqamTransposition.descendingPitchClassIntervals,
          ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(convertedMaqam.ascendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
              )
            : undefined,
          descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(convertedMaqam.descendingMaqamAjnas).map(([noteName, jins]) => [standardizeText(noteName), jins ? standardizeText(jins.name) : null])
              )
            : undefined,
          transposition: maqamTransposition.transposition,
          commentsEnglish: maqamOverview.getCommentsEnglish(),
          commentsArabic: maqamOverview.getCommentsArabic(),
          SourcePageReferences: maqamOverview.getSourcePageReferences(),
        };

        const englishifiedName = standardizeText(maqamTransposition.name);
        maqamReference[englishifiedName] = mergedMaqam;
        transpositionNames.push(englishifiedName);
      }

      numberOfTranspositions++;
    }

    updateProgress(91, "Finalizing maqam transpositions...");
    result.transpositions = transpositionNames;
    result.numberOfTranspositions = numberOfTranspositions;
  }

  updateProgress(95, "Compiling maqam export data...");
  result.pitchClassReference = pitchClassReference;
  result.allAjnasData = jinsReference;
  result.allMaqamatData = maqamReference;

  updateProgress(98, "Maqam export complete!");
  return result;
}
