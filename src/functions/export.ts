import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { AjnasModulations, Jins, JinsDataInterface, shiftJinsByOctaves } from "@/models/Jins";
import MaqamData, { Maqam, MaqamatModulations, MaqamDataInterface, shiftMaqamByOctaves } from "@/models/Maqam";
import getTuningSystemPitchClasses from "./getTuningSystemPitchClasses";
import { getAjnas, getMaqamat } from "./import";
import { getJinsTranspositions, getMaqamTranspositions } from "./transpose";
import PitchClass, { PitchClassInterval } from "@/models/PitchClass";
import modulate from "./modulate";
import calculateNumberOfModulations from "./calculateNumberOfModulations";
import shiftPitchClass from "./shiftPitchClass";
import { classifyMaqamFamily } from "./classifyMaqamFamily";

/**
 * Multi-method maqam family classification for research and analysis.
 * Each classification method provides a different perspective on how to group maqamat.
 * All methods are optional - only calculated methods will be present in exports.
 */
export interface ExportMaqamFamilyClassification {
  /** Classification by first jins at scale degree 1 */
  firstJins?: {
    familyName: string;
  };
  
  // Future classification methods can be added here:
  // predominantJins?: {
  //   familyName: string;
  //   occurrences?: number;
  // };
  // finalJins?: {
  //   familyName: string;
  //   scaleDegree?: number;
  // };
  // tonicRelationship?: {
  //   familyName: string;
  // };
}

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
      // Remove Arabic hamza character
      .replace(/ʾ/g, "")
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
  maqamToMaqamModulations?: MaqamToMaqamModulationsWithKeys;
  maqamToJinsModulations?: MaqamToJinsModulationsWithKeys;
  transposition: boolean;
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: any[];
  maqamFamilyClassification: ExportMaqamFamilyClassification;
}

/**
 * Standard maqam-to-maqam modulations structure for a specific degree/position
 */
export interface MaqamToMaqamModulationsStructure {
  /** Indices of modulations that occur on the first scale degree */
  maqamToMaqamModulationsOnFirstDegree: string[];

  /** Indices of modulations that occur on the third scale degree */
  maqamToMaqamModulationsOnThirdDegree: string[];

  /** Indices of modulations that occur on the alternative third scale degree */
  maqamToMaqamModulationsOnAltThirdDegree: string[];

  /** Indices of modulations that occur on the fourth scale degree */
  maqamToMaqamModulationsOnFourthDegree: string[];

  /** Indices of modulations that occur on the fifth scale degree */
  maqamToMaqamModulationsOnFifthDegree: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree */
  maqamToMaqamModulationsOnSixthDegreeAsc: string[];

  /** Indices of descending modulations that occur on the sixth scale degree */
  maqamToMaqamModulationsOnSixthDegreeDesc: string[];

  /** Indices of modulations on the sixth scale degree without using the third */
  maqamToMaqamModulationsOnSixthDegreeIfNoThird: string[];

  /** The note name of the second degree (plus variations) */
  maqamToMaqamModulations2pBelowThirdNoteName: string;
}

/**
 * Standard maqam-to-jins modulations structure for a specific degree/position  
 */
export interface MaqamToJinsModulationsStructure {
  /** Indices of modulations that occur on the first scale degree */
  maqamToJinsModulationsOnFirstDegree: string[];

  /** Indices of modulations that occur on the third scale degree */
  maqamToJinsModulationsOnThirdDegree: string[];

  /** Indices of modulations that occur on the alternative third scale degree */
  maqamToJinsModulationsOnAltThirdDegree: string[];

  /** Indices of modulations that occur on the fourth scale degree */
  maqamToJinsModulationsOnFourthDegree: string[];

  /** Indices of modulations that occur on the fifth scale degree */
  maqamToJinsModulationsOnFifthDegree: string[];

  /** Indices of ascending modulations that occur on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeAsc: string[];

  /** Indices of descending modulations that occur on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeDesc: string[];

  /** Indices of modulations on the sixth scale degree without using the third */
  maqamToJinsModulationsOnSixthDegreeIfNoThird: string[];

  /** The note name of the second degree (plus variations) */
  maqamToJinsNoteName2pBelowThird: string;
}

/**
 * Maps each modulation degree to its corresponding note name
 */
export interface ModulationDegreesNoteNames {
  /** Note name for modulations on the first scale degree */
  maqamModulationsOnFirstDegreeNoteName: string;

  /** Note name for modulations on the third scale degree */
  maqamModulationsOnThirdDegreeNoteName: string;

  /** Note name for modulations on the alternative third scale degree */
  maqamModulationsOnAltThirdDegreeNoteName: string;

  /** Note name for modulations on the fourth scale degree */
  maqamModulationsOnFourthDegreeNoteName: string;

  /** Note name for modulations on the fifth scale degree */
  maqamModulationsOnFifthDegreeNoteName: string;

  /** Note name for ascending modulations on the sixth scale degree */
  maqamModulationsOnSixthDegreeAscNoteName: string;

  /** Note name for descending modulations on the sixth scale degree */
  maqamModulationsOnSixthDegreeDescNoteName: string;

  /** Note name for modulations on the sixth scale degree without using the third */
  maqamModulationsOnSixthDegreeIfNoThirdNoteName: string;
}

/**
 * Maps each maqam-to-jins modulation degree to its corresponding note name
 */
export interface JinsModulationDegreesNoteNames {
  /** Note name for modulations on the first scale degree */
  maqamToJinsModulationsOnFirstDegreeNoteName: string;

  /** Note name for modulations on the third scale degree */
  maqamToJinsModulationsOnThirdDegreeNoteName: string;

  /** Note name for modulations on the alternative third scale degree */
  maqamToJinsModulationsOnAltThirdDegreeNoteName: string;

  /** Note name for modulations on the fourth scale degree */
  maqamToJinsModulationsOnFourthDegreeNoteName: string;

  /** Note name for modulations on the fifth scale degree */
  maqamToJinsModulationsOnFifthDegreeNoteName: string;

  /** Note name for ascending modulations on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeAscNoteName: string;

  /** Note name for descending modulations on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeDescNoteName: string;

  /** Note name for modulations on the sixth scale degree without using the third */
  maqamToJinsModulationsOnSixthDegreeIfNoThirdNoteName: string;
}

/**
 * Maps each maqam-to-jins modulation degree to its corresponding octave-below note name
 */
export interface JinsModulationDegrees8vbNoteNames {
  /** Octave-below note name for modulations on the first scale degree */
  maqamToJinsModulationsOnFirstDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the third scale degree */
  maqamToJinsModulationsOnThirdDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the alternative third scale degree */
  maqamToJinsModulationsOnAltThirdDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the fourth scale degree */
  maqamToJinsModulationsOnFourthDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the fifth scale degree */
  maqamToJinsModulationsOnFifthDegree8vbNoteName: string;

  /** Octave-below note name for ascending modulations on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeAsc8vbNoteName: string;

  /** Octave-below note name for descending modulations on the sixth scale degree */
  maqamToJinsModulationsOnSixthDegreeDesc8vbNoteName: string;

  /** Octave-below note name for modulations on the sixth scale degree without using the third */
  maqamToJinsModulationsOnSixthDegreeIfNoThird8vbNoteName: string;
}
export interface ModulationDegrees8vbNoteNames {
  /** Octave-below note name for modulations on the first scale degree */
  maqamModulationsOnFirstDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the third scale degree */
  maqamModulationsOnThirdDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the alternative third scale degree */
  maqamModulationsOnAltThirdDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the fourth scale degree */
  maqamModulationsOnFourthDegree8vbNoteName: string;

  /** Octave-below note name for modulations on the fifth scale degree */
  maqamModulationsOnFifthDegree8vbNoteName: string;

  /** Octave-below note name for ascending modulations on the sixth scale degree */
  maqamModulationsOnSixthDegreeAsc8vbNoteName: string;

  /** Octave-below note name for descending modulations on the sixth scale degree */
  maqamModulationsOnSixthDegreeDesc8vbNoteName: string;

  /** Octave-below note name for modulations on the sixth scale degree without using the third */
  maqamModulationsOnSixthDegreeIfNoThird8vbNoteName: string;
}

/**
 * Maqam-to-maqam lower octave modulations structure (8vb versions)
 */
export interface MaqamToMaqamLowerOctaveModulationsStructure {
  /** Indices of maqam-to-maqam modulations that occur on the first scale degree (8vb) */
  maqamToMaqamModulationsOnFirstDegree8vb: string[];

  /** Indices of maqam-to-maqam modulations that occur on the third scale degree (8vb) */
  maqamToMaqamModulationsOnThirdDegree8vb: string[];

  /** Indices of maqam-to-maqam modulations that occur on the alternative third scale degree (8vb) */
  maqamToMaqamModulationsOnAltThirdDegree8vb: string[];

  /** Indices of maqam-to-maqam modulations that occur on the fourth scale degree (8vb) */
  maqamToMaqamModulationsOnFourthDegree8vb: string[];

  /** Indices of maqam-to-maqam modulations that occur on the fifth scale degree (8vb) */
  maqamToMaqamModulationsOnFifthDegree8vb: string[];

  /** Indices of ascending maqam-to-maqam modulations that occur on the sixth scale degree (8vb) */
  maqamToMaqamModulationsOnSixthDegreeAsc8vb: string[];

  /** Indices of descending maqam-to-maqam modulations that occur on the sixth scale degree (8vb) */
  maqamToMaqamModulationsOnSixthDegreeDesc8vb: string[];

  /** Indices of maqam-to-maqam modulations on the sixth scale degree without using the third (8vb) */
  maqamToMaqamModulationsOnSixthDegreeIfNoThird8vb: string[];

  /** The note name of the second degree (plus variations) (8vb) */
  maqamToMaqamModulations2pBelowThird8vb: string;
}

/**
 * Maqam-to-jins lower octave modulations structure (8vb versions)
 */
export interface MaqamToJinsLowerOctaveModulationsStructure {
  /** Indices of maqam-to-jins modulations that occur on the first scale degree (8vb) */
  maqamToJinsModulationsOnFirstDegree8vb: string[];

  /** Indices of maqam-to-jins modulations that occur on the third scale degree (8vb) */
  maqamToJinsModulationsOnThirdDegree8vb: string[];

  /** Indices of maqam-to-jins modulations that occur on the alternative third scale degree (8vb) */
  maqamToJinsModulationsOnAltThirdDegree8vb: string[];

  /** Indices of maqam-to-jins modulations that occur on the fourth scale degree (8vb) */
  maqamToJinsModulationsOnFourthDegree8vb: string[];

  /** Indices of maqam-to-jins modulations that occur on the fifth scale degree (8vb) */
  maqamToJinsModulationsOnFifthDegree8vb: string[];

  /** Indices of ascending maqam-to-jins modulations that occur on the sixth scale degree (8vb) */
  maqamToJinsModulationsOnSixthDegreeAsc8vb: string[];

  /** Indices of descending maqam-to-jins modulations that occur on the sixth scale degree (8vb) */
  maqamToJinsModulationsOnSixthDegreeDesc8vb: string[];

  /** Indices of maqam-to-jins modulations on the sixth scale degree without using the third (8vb) */
  maqamToJinsModulationsOnSixthDegreeIfNoThird8vb: string[];

  /** The note name of the second degree (plus variations) (8vb) */
  maqamToJinsNoteName2pBelowThird8vb: string;
}

/**
 * Index-based modulations for Maqam-to-Maqam relationships using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamToMaqamModulationsWithKeys {
  /** Maps each modulation degree to its corresponding note name */
  maqamToMaqamModulationsDegreesNoteNames: ModulationDegreesNoteNames;

  /** Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested) */
  maqamToMaqamModulationsLowerOctaveDegreesNoteNames?: ModulationDegrees8vbNoteNames;

  /** Standard modulations in normal octave positions */
  maqamToMaqamModulations: MaqamToMaqamModulationsStructure;

  /** Optional lower octave modulations (only when requested via CLI flag) */
  maqamToMaqamModulationsLowerOctave?: MaqamToMaqamLowerOctaveModulationsStructure;
}

/**
 * Index-based modulations for Maqam-to-Jins relationships using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamToJinsModulationsWithKeys {
  /** Maps each modulation degree to its corresponding note name */
  maqamToJinsModulationDegreesNoteNames: JinsModulationDegreesNoteNames;

  /** Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested) */
  maqamToJinsModulationsLowerOctaveDegreesNoteNames?: JinsModulationDegrees8vbNoteNames;

  /** Standard modulations in normal octave positions */
  maqamToJinsModulations: MaqamToJinsModulationsStructure;

  /** Optional lower octave modulations (only when requested via CLI flag) */
  maqamToJinsModulationsLowerOctave?: MaqamToJinsLowerOctaveModulationsStructure;
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
  includeMaqamToMaqamModulations: boolean;
  includeMaqamToJinsModulations: boolean;
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
  includeMaqamToMaqamModulations: boolean;
  includeMaqamToJinsModulations: boolean;
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
  maqamToMaqamModulations?: MaqamToMaqamModulationsWithKeys;
  numberOfMaqamModulationHops?: number;
  maqamToJinsModulations?: MaqamToJinsModulationsWithKeys;
  numberOfJinsModulationHops?: number;
}

interface MaqamWithAjnasAsObjects extends Omit<Maqam, "ascendingMaqamAjnas" | "descendingMaqamAjnas"> {
  ascendingMaqamAjnas?: { [noteName: string]: Jins | null };
  descendingMaqamAjnas?: { [noteName: string]: Jins | null };
  maqamToMaqamModulations?: MaqamToMaqamModulationsWithKeys;
  maqamToJinsModulations?: MaqamToJinsModulationsWithKeys;
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
    maqamModulationsOnFirstDegreeNoteName: standardizeText(ascendingPitchClasses[0] || ''),
    maqamModulationsOnThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2] || ''),
    maqamModulationsOnAltThirdDegreeNoteName: standardizeText(noteName2pBelowThird),
    maqamModulationsOnFourthDegreeNoteName: standardizeText(ascendingPitchClasses[3] || ''),
    maqamModulationsOnFifthDegreeNoteName: standardizeText(ascendingPitchClasses[4] || ''),
    maqamModulationsOnSixthDegreeAscNoteName: standardizeText(ascendingPitchClasses[5] || ''),
    maqamModulationsOnSixthDegreeDescNoteName: standardizeText(descendingPitchClasses[1] || ''), // Second from start in descending (reverse order)
    maqamModulationsOnSixthDegreeIfNoThirdNoteName: standardizeText(ascendingPitchClasses[5] || ''), // Same as ascending sixth
  };
}

/**
 * Helper function to create jins modulation degrees note names mapping
 */
function createJinsModulationDegreesNoteNames(
  ascendingPitchClasses: string[],
  descendingPitchClasses: string[],
  noteName2pBelowThird: string
): JinsModulationDegreesNoteNames {
  return {
    maqamToJinsModulationsOnFirstDegreeNoteName: standardizeText(ascendingPitchClasses[0] || ''),
    maqamToJinsModulationsOnThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2] || ''),
    maqamToJinsModulationsOnAltThirdDegreeNoteName: standardizeText(noteName2pBelowThird),
    maqamToJinsModulationsOnFourthDegreeNoteName: standardizeText(ascendingPitchClasses[3] || ''),
    maqamToJinsModulationsOnFifthDegreeNoteName: standardizeText(ascendingPitchClasses[4] || ''),
    maqamToJinsModulationsOnSixthDegreeAscNoteName: standardizeText(ascendingPitchClasses[5] || ''),
    maqamToJinsModulationsOnSixthDegreeDescNoteName: standardizeText(descendingPitchClasses[1] || ''), // Second from start in descending (reverse order)
    maqamToJinsModulationsOnSixthDegreeIfNoThirdNoteName: standardizeText(ascendingPitchClasses[5] || ''), // Same as ascending sixth
  };
}

/**
 * Helper function to map note names to their octave-below equivalents
 * Uses the proper pitch class system instead of hardcoded mappings
 */
function mapNoteToOctaveBelow(noteName: string, allPitchClasses: PitchClass[]): string {
  // Handle empty/invalid input
  if (!noteName) return '';

  // Find the pitch class with this note name, comparing standardized versions
  // since the input noteName is already standardized but pitch class noteNames may have diacritics
  const pitchClass = allPitchClasses.find(pc => standardizeText(pc.noteName) === noteName);
  if (!pitchClass) {
    // If not found, return empty string
    return '';
  }

  // Use the proper shift function to get the octave-below version
  const shiftedPitchClass = shiftPitchClass(allPitchClasses, pitchClass, -1);
  
  // Return the standardized note name of the shifted pitch class, or empty if shift failed
  return shiftedPitchClass?.noteName ? standardizeText(shiftedPitchClass.noteName) : '';
}

/**
 * Helper function to create octave-below modulation degrees note names mapping
 */
function createModulationDegrees8vbNoteNames(
  ascendingPitchClasses: string[],
  descendingPitchClasses: string[],
  noteName2pBelowThird: string,
  allPitchClasses: PitchClass[]
): ModulationDegrees8vbNoteNames {
  return {
    maqamModulationsOnFirstDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[0] || ''), allPitchClasses)),
    maqamModulationsOnThirdDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[2] || ''), allPitchClasses)),
    maqamModulationsOnAltThirdDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(noteName2pBelowThird), allPitchClasses)),
    maqamModulationsOnFourthDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[3] || ''), allPitchClasses)),
    maqamModulationsOnFifthDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[4] || ''), allPitchClasses)),
    maqamModulationsOnSixthDegreeAsc8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''), allPitchClasses)),
    maqamModulationsOnSixthDegreeDesc8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(descendingPitchClasses[1] || ''), allPitchClasses)),
    maqamModulationsOnSixthDegreeIfNoThird8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''), allPitchClasses)),
  };
}

/**
 * Helper function to create jins octave-below modulation degrees note names mapping
 */
function createJinsModulationDegrees8vbNoteNames(
  ascendingPitchClasses: string[],
  descendingPitchClasses: string[],
  noteName2pBelowThird: string,
  allPitchClasses: PitchClass[]
): JinsModulationDegrees8vbNoteNames {
  return {
    maqamToJinsModulationsOnFirstDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[0] || ''), allPitchClasses)),
    maqamToJinsModulationsOnThirdDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[2] || ''), allPitchClasses)),
    maqamToJinsModulationsOnAltThirdDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(noteName2pBelowThird), allPitchClasses)),
    maqamToJinsModulationsOnFourthDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[3] || ''), allPitchClasses)),
    maqamToJinsModulationsOnFifthDegree8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[4] || ''), allPitchClasses)),
    maqamToJinsModulationsOnSixthDegreeAsc8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''), allPitchClasses)),
    maqamToJinsModulationsOnSixthDegreeDesc8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(descendingPitchClasses[1] || ''), allPitchClasses)),
    maqamToJinsModulationsOnSixthDegreeIfNoThird8vbNoteName: standardizeText(mapNoteToOctaveBelow(standardizeText(ascendingPitchClasses[5] || ''), allPitchClasses)),
  };
}

/**
 * Helper function to create maqam-to-maqam modulations structure
 */
function createMaqamToMaqamModulations(modulations: MaqamatModulations): MaqamToMaqamModulationsStructure {
  const maqamatMods = modulations as MaqamatModulations;
  return {
    maqamToMaqamModulationsOnFirstDegree: (maqamatMods.modulationsOnFirstDegree || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnThirdDegree: (maqamatMods.modulationsOnThirdDegree || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnAltThirdDegree: (maqamatMods.modulationsOnAltThirdDegree || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnFourthDegree: (maqamatMods.modulationsOnFourthDegree || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnFifthDegree: (maqamatMods.modulationsOnFifthDegree || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnSixthDegreeAsc: (maqamatMods.modulationsOnSixthDegreeAsc || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnSixthDegreeDesc: (maqamatMods.modulationsOnSixthDegreeDesc || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulationsOnSixthDegreeIfNoThird: (maqamatMods.modulationsOnSixthDegreeIfNoThird || []).map((maqam) => standardizeText(maqam.name)),
    maqamToMaqamModulations2pBelowThirdNoteName: maqamatMods.noteName2pBelowThird || '',
  };
}

/**
 * Helper function to create maqam-to-jins modulations structure
 */
function createMaqamToJinsModulations(modulations: AjnasModulations): MaqamToJinsModulationsStructure {
  const ajnasMods = modulations as AjnasModulations;
  
  // Extra safety check for undefined ajnas modulations
  if (!ajnasMods) {
    return {
      maqamToJinsModulationsOnFirstDegree: [],
      maqamToJinsModulationsOnThirdDegree: [],
      maqamToJinsModulationsOnAltThirdDegree: [],
      maqamToJinsModulationsOnFourthDegree: [],
      maqamToJinsModulationsOnFifthDegree: [],
      maqamToJinsModulationsOnSixthDegreeAsc: [],
      maqamToJinsModulationsOnSixthDegreeDesc: [],
      maqamToJinsModulationsOnSixthDegreeIfNoThird: [],
      maqamToJinsNoteName2pBelowThird: '',
    };
  }
  
  return {
    maqamToJinsModulationsOnFirstDegree: (ajnasMods.modulationsOnFirstDegree || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnThirdDegree: (ajnasMods.modulationsOnThirdDegree || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnAltThirdDegree: (ajnasMods.modulationsOnAltThirdDegree || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnFourthDegree: (ajnasMods.modulationsOnFourthDegree || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnFifthDegree: (ajnasMods.modulationsOnFifthDegree || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnSixthDegreeAsc: (ajnasMods.modulationsOnSixthDegreeAsc || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnSixthDegreeDesc: (ajnasMods.modulationsOnSixthDegreeDesc || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsModulationsOnSixthDegreeIfNoThird: (ajnasMods.modulationsOnSixthDegreeIfNoThird || []).map((jins) => standardizeText(jins.name)),
    maqamToJinsNoteName2pBelowThird: ajnasMods.noteName2pBelowThird || '',
  };
}

/**
 * Helper function to create maqam-to-maqam lower octave modulations structure.
 * Creates proper 8vb (octave-below) data for maqam modulations.
 */
function createMaqamToMaqamLowerOctaveModulations(
  modulations: MaqamatModulations,
  allPitchClasses: PitchClass[]
): MaqamToMaqamLowerOctaveModulationsStructure {
  const maqamatMods = modulations as MaqamatModulations;
  
  return {
    maqamToMaqamModulationsOnFirstDegree8vb: (maqamatMods.modulationsOnFirstDegree || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnThirdDegree8vb: (maqamatMods.modulationsOnThirdDegree || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnAltThirdDegree8vb: (maqamatMods.modulationsOnAltThirdDegree || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnFourthDegree8vb: (maqamatMods.modulationsOnFourthDegree || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnFifthDegree8vb: (maqamatMods.modulationsOnFifthDegree || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnSixthDegreeAsc8vb: (maqamatMods.modulationsOnSixthDegreeAsc || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnSixthDegreeDesc8vb: (maqamatMods.modulationsOnSixthDegreeDesc || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulationsOnSixthDegreeIfNoThird8vb: (maqamatMods.modulationsOnSixthDegreeIfNoThird || [])
      .map((maqam) => {
        const shifted = shiftMaqamByOctaves(allPitchClasses, maqam, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToMaqamModulations2pBelowThird8vb: maqamatMods.noteName2pBelowThird ? 
      mapNoteToOctaveBelow(standardizeText(maqamatMods.noteName2pBelowThird), allPitchClasses) : '',
  };
}

/**
 * Helper function to create maqam-to-jins lower octave modulations structure.
 * Creates proper 8vb (octave-below) data for jins modulations.
 */
function createMaqamToJinsLowerOctaveModulations(
  modulations: AjnasModulations,
  allPitchClasses: PitchClass[]
): MaqamToJinsLowerOctaveModulationsStructure {
  const ajnasMods = modulations as AjnasModulations;
  
  // Extra safety check for undefined modulations object
  if (!ajnasMods) {
    return {
      maqamToJinsModulationsOnFirstDegree8vb: [],
      maqamToJinsModulationsOnThirdDegree8vb: [],
      maqamToJinsModulationsOnAltThirdDegree8vb: [],
      maqamToJinsModulationsOnFourthDegree8vb: [],
      maqamToJinsModulationsOnFifthDegree8vb: [],
      maqamToJinsModulationsOnSixthDegreeAsc8vb: [],
      maqamToJinsModulationsOnSixthDegreeDesc8vb: [],
      maqamToJinsModulationsOnSixthDegreeIfNoThird8vb: [],
      maqamToJinsNoteName2pBelowThird8vb: '',
    };
  }
  
  return {
    maqamToJinsModulationsOnFirstDegree8vb: (ajnasMods.modulationsOnFirstDegree || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnThirdDegree8vb: (ajnasMods.modulationsOnThirdDegree || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnAltThirdDegree8vb: (ajnasMods.modulationsOnAltThirdDegree || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnFourthDegree8vb: (ajnasMods.modulationsOnFourthDegree || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnFifthDegree8vb: (ajnasMods.modulationsOnFifthDegree || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnSixthDegreeAsc8vb: (ajnasMods.modulationsOnSixthDegreeAsc || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnSixthDegreeDesc8vb: (ajnasMods.modulationsOnSixthDegreeDesc || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsModulationsOnSixthDegreeIfNoThird8vb: (ajnasMods.modulationsOnSixthDegreeIfNoThird || [])
      .map((jins) => {
        const shifted = shiftJinsByOctaves(allPitchClasses, jins, -1);
        return shifted ? standardizeText(shifted.name) : null;
      })
      .filter((name): name is string => name !== null),
    maqamToJinsNoteName2pBelowThird8vb: ajnasMods.noteName2pBelowThird ? 
      mapNoteToOctaveBelow(standardizeText(ajnasMods.noteName2pBelowThird), allPitchClasses) : '',
  };
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

  // Store tahlil (original maqam) for classification
  const maqamTahlilMap = new Map<string, Maqam>();

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

        // Store tahlil for family classification (original form only)
        if (!maqamTransposition.transposition) {
          maqamTahlilMap.set(maqamTransposition.maqamId, maqamTransposition);
        }

        // Yield control every few transpositions to allow UI updates
        if (j % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        let maqamatModulations: MaqamatModulations | undefined = undefined;
        let ajnasModulations: AjnasModulations | undefined = undefined;

        // Include modulations if requested
        if (options.includeMaqamToMaqamModulations || options.includeMaqamToJinsModulations) {
          try {
            if (options.includeMaqamToMaqamModulations) {
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

            if (options.includeMaqamToJinsModulations) {
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
          } catch (error) {
            console.error(`🚨 Error processing modulations for maqam ${maqamTransposition.name}:`, error);
            console.error(`Maqam details:`, {
              name: maqamTransposition.name,
              ascending: maqamTransposition.ascendingPitchClasses?.length,
              descending: maqamTransposition.descendingPitchClasses?.length,
              maqamId: maqamTransposition.maqamId
            });
            // Skip this maqam transposition if there's an error
            continue;
          }
        }

        // Count maqam transpositions for statistics
        totalMaqamatTranspositions++;

        let maqamAjnasToObjects: MaqamWithAjnasAsObjects;
        try {
          maqamAjnasToObjects = convertMaqamAjnasToObjects(maqamTransposition);
        } catch (error) {
          console.error(`🚨 Error converting maqam ajnas for ${maqamTransposition.name}:`, error);
          continue;
        }

        try {
          if (maqamatModulations) {
            // Defensive checks for pitch classes before mapping
            if (!maqamTransposition.ascendingPitchClasses || !maqamTransposition.descendingPitchClasses) {
              console.warn(`⚠️ Skipping maqam modulations for ${maqamTransposition.name} due to undefined pitch classes`);
            } else {
              const maqamModulationWithKeys: MaqamToMaqamModulationsWithKeys = {
                maqamToMaqamModulationsDegreesNoteNames: createModulationDegreesNoteNames(
                  maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                  maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                  maqamatModulations.noteName2pBelowThird || ''
                ),
                ...(options.includeModulations8vb && {
                  maqamToMaqamModulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
                    maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                    maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                    maqamatModulations.noteName2pBelowThird || '',
                    fullRangeTuningSystemPitchClasses
                  )
                }),
                maqamToMaqamModulations: createMaqamToMaqamModulations(maqamatModulations),
                ...(options.includeModulations8vb && {
                  maqamToMaqamModulationsLowerOctave: createMaqamToMaqamLowerOctaveModulations(
                    maqamatModulations, 
                    fullRangeTuningSystemPitchClasses
                  )
                })
              };

              maqamAjnasToObjects.maqamToMaqamModulations = maqamModulationWithKeys;
            }
          }

          if (ajnasModulations) {
            // Defensive checks for pitch classes before mapping
            if (!maqamTransposition.ascendingPitchClasses || !maqamTransposition.descendingPitchClasses) {
              console.warn(`⚠️ Skipping ajnas modulations for ${maqamTransposition.name} due to undefined pitch classes`);
            } else {
              const ajnasModulationsWithKeys: MaqamToJinsModulationsWithKeys = {
                maqamToJinsModulationDegreesNoteNames: createJinsModulationDegreesNoteNames(
                  maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                  maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                  ajnasModulations.noteName2pBelowThird || ''
                ),
                ...(options.includeModulations8vb && {
                  maqamToJinsModulationsLowerOctaveDegreesNoteNames: createJinsModulationDegrees8vbNoteNames(
                    maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
                    maqamTransposition.descendingPitchClasses.map(pc => pc.noteName),
                    ajnasModulations.noteName2pBelowThird || '',
                    fullRangeTuningSystemPitchClasses
                  )
                }),
                maqamToJinsModulations: createMaqamToJinsModulations(ajnasModulations),
                ...(options.includeModulations8vb && {
                  maqamToJinsModulationsLowerOctave: createMaqamToJinsLowerOctaveModulations(
                    ajnasModulations, 
                    fullRangeTuningSystemPitchClasses
                  )
                })
              };

              maqamAjnasToObjects.maqamToJinsModulations = ajnasModulationsWithKeys;
            }
          }
        } catch (error) {
          console.error(`🚨 Error creating modulation data for ${maqamTransposition.name}:`, error);
          console.error(`Modulation context:`, {
            hasMaqamModulations: !!maqamatModulations,
            hasAjnasModulations: !!ajnasModulations,
            ascendingLength: maqamTransposition.ascendingPitchClasses?.length,
            descendingLength: maqamTransposition.descendingPitchClasses?.length
          });
          // Continue without modulations for this maqam
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
        // Defensive checks for undefined pitch classes arrays
        if (!possibleMaqam.ascendingPitchClasses || !possibleMaqam.descendingPitchClasses) {
          console.warn(`⚠️ Skipping maqam ${possibleMaqam.name} due to undefined pitch classes:`, {
            ascendingDefined: !!possibleMaqam.ascendingPitchClasses,
            descendingDefined: !!possibleMaqam.descendingPitchClasses,
            maqamId: possibleMaqam.maqamId
          });
          continue;
        }

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
          // Family classification - always included, inherited from tahlil
          maqamFamilyClassification: (() => {
            const tahlil = maqamTahlilMap.get(possibleMaqam.maqamId);
            if (tahlil) {
              try {
                const classification = classifyMaqamFamily(tahlil);
                return {
                  firstJins: {
                    familyName: classification.familyName,
                  }
                };
              } catch (error) {
                console.warn(`⚠️ Could not classify maqam ${possibleMaqam.name}:`, error);
              }
            }
            // Fallback if classification fails
            return {
              firstJins: {
                familyName: "no jins",
              }
            };
          })(),
        };

        if (possibleMaqam.maqamToMaqamModulations) mergedMaqam.maqamToMaqamModulations = possibleMaqam.maqamToMaqamModulations;
        if (possibleMaqam.maqamToJinsModulations) mergedMaqam.maqamToJinsModulations = possibleMaqam.maqamToJinsModulations;

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

  // Calculate classification once - will be reused for main maqam and all transpositions
  let maqamClassification: ExportMaqamFamilyClassification = {
    firstJins: {
      familyName: "no jins",
    }
  };
  
  // Include the actual maqam instance as MergedMaqam
  if (maqamData) {
    const convertedMaqam = convertMaqamAjnasToObjects(maqamToExport);
    
    // Get classification - calculate once from tahlil
    if (!maqamToExport.transposition) {
      // This IS the tahlil, classify it directly
      try {
        const result = classifyMaqamFamily(maqamToExport);
        maqamClassification = {
          firstJins: {
            familyName: result.familyName,
          }
        };
      } catch (error) {
        console.warn(`⚠️ Could not classify maqam ${maqamToExport.name}:`, error);
        maqamClassification = {
          firstJins: {
            familyName: "no jins",
          }
        };
      }
    } else {
      // This is a transposition - need to get tahlil and classify that
      const allAjnas = getAjnas();
      const allMaqamTranspositions = getMaqamTranspositions(fullRangeTuningSystemPitchClasses, allAjnas, maqamData, true, centsTolerance);
      const tahlil = allMaqamTranspositions.find(m => !m.transposition);
      
      if (tahlil) {
        try {
          const result = classifyMaqamFamily(tahlil);
          maqamClassification = {
            firstJins: {
              familyName: result.familyName,
            }
          };
        } catch (error) {
          console.warn(`⚠️ Could not classify maqam ${maqamToExport.name}:`, error);
          maqamClassification = {
            firstJins: {
              familyName: "no jins",
            }
          };
        }
      } else {
        maqamClassification = {
          firstJins: {
            familyName: "no jins",
          }
        };
      }
    }
    
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
      maqamFamilyClassification: maqamClassification,
    };
    result.maqam = mergedMaqam;
  }

  // Include modulations if requested
  if (options.includeMaqamToMaqamModulations || options.includeMaqamToJinsModulations) {
    const allAjnas = getAjnas();
    const allMaqamat = getMaqamat();

    // Calculate Maqamat modulations if requested
    if (options.includeMaqamToMaqamModulations) {
      const maqamatModulations = modulate(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        allMaqamat,
        maqamToExport,
        false,
        centsTolerance
      ) as MaqamatModulations;
      const numberOfMaqamModulationHops = calculateNumberOfModulations(maqamatModulations);

      const maqamModulationWithKeys: MaqamToMaqamModulationsWithKeys = {
        maqamToMaqamModulationsDegreesNoteNames: createModulationDegreesNoteNames(
          maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
          maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
          maqamatModulations.noteName2pBelowThird || ''
        ),
        ...(options.includeModulations8vb && {
          maqamToMaqamModulationsLowerOctaveDegreesNoteNames: createModulationDegrees8vbNoteNames(
            maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
            maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
            maqamatModulations.noteName2pBelowThird || '',
            fullRangeTuningSystemPitchClasses
          )
        }),
        maqamToMaqamModulations: createMaqamToMaqamModulations(maqamatModulations),
        ...(options.includeModulations8vb && {
          maqamToMaqamModulationsLowerOctave: createMaqamToMaqamLowerOctaveModulations(
            maqamatModulations, 
            fullRangeTuningSystemPitchClasses
          )
        })
      };

      result.maqamToMaqamModulations = maqamModulationWithKeys;
      result.numberOfMaqamModulationHops = numberOfMaqamModulationHops;
    }

    // Calculate Ajnas modulations if requested
    if (options.includeMaqamToJinsModulations) {
      const ajnasModulations = modulate(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        allMaqamat,
        maqamToExport,
        true,
        centsTolerance
      ) as AjnasModulations;
      const numberOfJinsModulationHops = calculateNumberOfModulations(ajnasModulations);

      const ajnasModulationsWithKeys: MaqamToJinsModulationsWithKeys = {
        maqamToJinsModulationDegreesNoteNames: createJinsModulationDegreesNoteNames(
          maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
          maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
          ajnasModulations.noteName2pBelowThird || ''
        ),
        ...(options.includeModulations8vb && {
          maqamToJinsModulationsLowerOctaveDegreesNoteNames: createJinsModulationDegrees8vbNoteNames(
            maqamToExport.ascendingPitchClasses.map(pc => pc.noteName),
            maqamToExport.descendingPitchClasses.map(pc => pc.noteName),
            ajnasModulations.noteName2pBelowThird || '',
            fullRangeTuningSystemPitchClasses
          )
        }),
        maqamToJinsModulations: createMaqamToJinsModulations(ajnasModulations),
        ...(options.includeModulations8vb && {
          maqamToJinsModulationsLowerOctave: createMaqamToJinsLowerOctaveModulations(
            ajnasModulations, 
            fullRangeTuningSystemPitchClasses
          )
        })
      };

      result.maqamToJinsModulations = ajnasModulationsWithKeys;
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

    // Reuse classification calculated above, or calculate it now if not done yet
    let sharedClassification: ExportMaqamFamilyClassification;
    if (maqamClassification.firstJins && maqamClassification.firstJins.familyName !== "no jins") {
      sharedClassification = maqamClassification;
    } else {
      // Calculate classification ONCE from the tahlil - all transpositions inherit it
      const tahlil = maqamTranspositions.find(m => !m.transposition);
      
      if (tahlil) {
        try {
          const result = classifyMaqamFamily(tahlil);
          sharedClassification = {
            firstJins: {
              familyName: result.familyName,
            }
          };
        } catch (error) {
          console.warn(`⚠️ Could not classify maqam ${tahlil.name}:`, error);
          sharedClassification = {
            firstJins: {
              familyName: "no jins",
            }
          };
        }
      } else {
        sharedClassification = {
          firstJins: {
            familyName: "no jins",
          }
        };
      }
    }

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
      if (options.includeMaqamToMaqamModulations) {
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

      if (options.includeMaqamToJinsModulations) {
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
        
        // Use the shared classification calculated once from the tahlil
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
          maqamFamilyClassification: sharedClassification,
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
