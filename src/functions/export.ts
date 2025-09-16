import NoteName from "@/models/NoteName";
import TuningSystem from "@/models/TuningSystem";
import JinsData, {
  AjnasModulations,
  Jins,
  JinsDataInterface,
} from "@/models/Jins";
import MaqamData, {
  Maqam,
  MaqamatModulations,
  MaqamDataInterface,
} from "@/models/Maqam";
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
 * Index-based modulations for Maqamat using array indices instead of full objects
 * to reduce JSON export size
 */
export interface MaqamatModulationsWithKeys {
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

interface MaqamWithAjnasAsObjects
  extends Omit<Maqam, "ascendingMaqamAjnas" | "descendingMaqamAjnas"> {
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
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(
    tuningSystem,
    startingNote
  );

  // Filter possible ajnas and maqamat
  updateProgress(66, "Filtering compatible ajnas...");
  const possibleAjnasOverview: JinsData[] = allAjnas.filter((jins) =>
    jins
      .getNoteNames()
      .every((noteName) =>
        fullRangeTuningSystemPitchClasses.some(
          (pitchClass) => pitchClass.noteName === noteName
        )
      )
  );

  updateProgress(67, "Filtering compatible maqamat...");
  const possibleMaqamatOverview: MaqamData[] = allMaqamat.filter(
    (maqam) =>
      maqam
        .getAscendingNoteNames()
        .every((noteName) =>
          fullRangeTuningSystemPitchClasses.some(
            (pitchClass) => pitchClass.noteName === noteName
          )
        ) &&
      maqam
        .getDescendingNoteNames()
        .every((noteName) =>
          fullRangeTuningSystemPitchClasses.some(
            (pitchClass) => pitchClass.noteName === noteName
          )
        )
  );

  // === 3. FOUNDATION DATA ===
  if (options.includeTuningSystemDetails) {
    // Create a copy of the tuning system with only the relevant note name set
    const allSets = tuningSystem.getNoteNameSets();
    const relevantNoteNameSet =
      allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

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

  if (options.includePitchClasses) {
    // Store only note names - users can resolve full objects via pitchClassReference
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map(
      (pc) => englishify(pc.noteName)
    );
  }

  // === SUMMARY STATISTICS ===
  updateProgress(68, "Compiling summary statistics...");
  result.summaryStats = {
    totalAjnasInDatabase: allAjnas.length,
    totalMaqamatInDatabase: allMaqamat.length,
    tuningPitchClassesInSingleOctave:
      tuningSystem.getOriginalPitchClassValues().length,
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
    pitchClassReference[englishify(pc.noteName)] = pc;
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
        const ajnasProgress =
          70 + Math.round((i / possibleAjnasOverview.length) * 5);
        updateProgress(
          ajnasProgress,
          `Processing ajnas ${i + 1}/${possibleAjnasOverview.length}...`
        );
      }

      let numberOfTranspositions = 0;
      for (const jinsTransposition of getJinsTranspositions(
        fullRangeTuningSystemPitchClasses,
        jins,
        true,
        centsTolerance
      )) {
        possibleAjnas.push(jinsTransposition);
        numberOfTranspositions++;
      }

      // Count ajnas transpositions for statistics as we process
      totalAjnasTranspositions += numberOfTranspositions;

      const possibleJinsOverviewInterface = jins.convertToObject();
      possibleJinsOverviewInterface.numberOfTranspositions =
        numberOfTranspositions;

      possibleAjnasOverviewInterfaces.push(possibleJinsOverviewInterface);
    }

    updateProgress(76, "Merging ajnas data...");
    for (const possibleJins of possibleAjnas) {
      const jinsOverview = possibleAjnasOverview.find(
        (j) => j.getId() === possibleJins.jinsId
      );

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: possibleJins.jinsId,
          name: possibleJins.name,
          jinsPitchClasses: possibleJins.jinsPitchClasses.map((pc) =>
            englishify(pc.noteName)
          ),
          jinsPitchClassIntervals: possibleJins.jinsPitchClassIntervals,
          transposition: possibleJins.transposition,
          commentsEnglish: jinsOverview.getCommentsEnglish(),
          commentsArabic: jinsOverview.getCommentsArabic(),
          SourcePageReferences: jinsOverview.getSourcePageReferences(),
        };

        jinsReference[englishify(possibleJins.name)] = mergedJins;
      }
    }
  }

  // Include maqamat details if requested
  if (options.includeMaqamatDetails) {
    const possibleMaqamat: MaqamWithAjnasAsObjects[] = [];
    const possibleMaqamatOverviewInterfaces: MaqamDataInterface[] = [];

    updateProgress(
      78,
      `Processing ${possibleMaqamatOverview.length} maqamat...`
    );

    for (let i = 0; i < possibleMaqamatOverview.length; i++) {
      const maqam = possibleMaqamatOverview[i] as MaqamData;

      // Yield control to browser every few iterations
      if (i % 3 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Update progress for each maqam - spread across 78-90% (heavy complexity - 12% of progress bar)
      if (possibleMaqamatOverview.length > 3) {
        const maqamProgress =
          78 + Math.round((i / possibleMaqamatOverview.length) * 12);
        updateProgress(
          maqamProgress,
          `Processing maqam ${i + 1}/${possibleMaqamatOverview.length}...`
        );
      }

      let numberOfTranspositions = 0;
      const maqamTranspositions = getMaqamTranspositions(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        maqam,
        true,
        centsTolerance
      );

      for (let j = 0; j < maqamTranspositions.length; j++) {
        const maqamTransposition = maqamTranspositions[j];

        // Yield control every few transpositions to allow UI updates
        if (j % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        let maqamatModulations: MaqamatModulations | undefined = undefined;
        let ajnasModulations: AjnasModulations | undefined = undefined;

        // Include modulations if requested
        if (
          options.includeMaqamatModulations ||
          options.includeAjnasModulations
        ) {
          if (options.includeMaqamatModulations) {
            maqamatModulations = modulate(
              fullRangeTuningSystemPitchClasses,
              allAjnas,
              allMaqamat,
              maqamTransposition,
              false,
              centsTolerance
            ) as MaqamatModulations;
            const numberOfMaqamModulationHops =
              calculateNumberOfModulations(maqamatModulations);
            (maqamTransposition as any).maqamatModulations = maqamatModulations;
            (maqamTransposition as any).numberOfMaqamModulationHops =
              numberOfMaqamModulationHops;

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
            const numberOfJinsModulationHops =
              calculateNumberOfModulations(ajnasModulations);
            (maqamTransposition as any).ajnasModulations = ajnasModulations;
            (maqamTransposition as any).numberOfJinsModulationHops =
              numberOfJinsModulationHops;

            // Count modulations for statistics
            totalAjnasModulations += numberOfJinsModulationHops;
          }
        }

        // Count maqam transpositions for statistics
        totalMaqamatTranspositions++;

        const maqamAjnasToObjects =
          convertMaqamAjnasToObjects(maqamTransposition);

        if (maqamatModulations) {
          const maqamModulationWithKeys: MaqamatModulationsWithKeys = {
            modulationsOnOne: maqamatModulations.modulationsOnOne.map((maqam) =>
              englishify(maqam.name)
            ),
            modulationsOnThree: maqamatModulations.modulationsOnThree.map(
              (maqam) => englishify(maqam.name)
            ),
            modulationsOnThree2p: maqamatModulations.modulationsOnThree2p.map(
              (maqam) => englishify(maqam.name)
            ),
            modulationsOnFour: maqamatModulations.modulationsOnFour.map(
              (maqam) => englishify(maqam.name)
            ),
            modulationsOnFive: maqamatModulations.modulationsOnFive.map(
              (maqam) => englishify(maqam.name)
            ),
            modulationsOnSixAscending:
              maqamatModulations.modulationsOnSixAscending.map((maqam) =>
                englishify(maqam.name)
              ),
            modulationsOnSixDescending:
              maqamatModulations.modulationsOnSixDescending.map((maqam) =>
                englishify(maqam.name)
              ),
            modulationsOnSixNoThird:
              maqamatModulations.modulationsOnSixNoThird.map((maqam) =>
                englishify(maqam.name)
              ),
            noteName2p: maqamatModulations.noteName2p,
          };

          maqamAjnasToObjects.maqamatModulations = maqamModulationWithKeys;
        }

        if (ajnasModulations) {
          const ajnasModulationsWithKeys: AjnasModulationsWithKeys = {
            modulationsOnOne: ajnasModulations.modulationsOnOne.map((jins) =>
              englishify(jins.name)
            ),
            modulationsOnThree: ajnasModulations.modulationsOnThree.map(
              (jins) => englishify(jins.name)
            ),
            modulationsOnThree2p: ajnasModulations.modulationsOnThree2p.map(
              (jins) => englishify(jins.name)
            ),
            modulationsOnFour: ajnasModulations.modulationsOnFour.map((jins) =>
              englishify(jins.name)
            ),
            modulationsOnFive: ajnasModulations.modulationsOnFive.map((jins) =>
              englishify(jins.name)
            ),
            modulationsOnSixAscending:
              ajnasModulations.modulationsOnSixAscending.map((jins) =>
                englishify(jins.name)
              ),
            modulationsOnSixDescending:
              ajnasModulations.modulationsOnSixDescending.map((jins) =>
                englishify(jins.name)
              ),
            modulationsOnSixNoThird:
              ajnasModulations.modulationsOnSixNoThird.map((jins) =>
                englishify(jins.name)
              ),
            noteName2p: ajnasModulations.noteName2p,
          };

          maqamAjnasToObjects.ajnasModulations = ajnasModulationsWithKeys;
        }

        possibleMaqamat.push(maqamAjnasToObjects);
        numberOfTranspositions++;
      }

      const possibleMaqamOverviewInterface = maqam.convertToObject();
      possibleMaqamOverviewInterface.numberOfTranspositions =
        numberOfTranspositions;

      possibleMaqamatOverviewInterfaces.push(possibleMaqamOverviewInterface);
    }

    for (const possibleMaqam of possibleMaqamat) {
      const maqamOverview = possibleMaqamatOverview.find(
        (m) => m.getId() === possibleMaqam.maqamId
      );

      if (maqamOverview) {
        const mergedMaqam: MergedMaqam = {
          maqamId: possibleMaqam.maqamId,
          name: possibleMaqam.name,
          ascendingPitchClasses: possibleMaqam.ascendingPitchClasses.map((pc) =>
            englishify(pc.noteName)
          ),
          descendingPitchClasses: possibleMaqam.descendingPitchClasses.map(
            (pc) => englishify(pc.noteName)
          ),
          ascendingPitchClassIntervals:
            possibleMaqam.ascendingPitchClassIntervals,
          descendingPitchClassIntervals:
            possibleMaqam.descendingPitchClassIntervals,
          ascendingMaqamAjnas: possibleMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(possibleMaqam.ascendingMaqamAjnas).map(
                  ([noteName, jins]) => [
                    noteName,
                    jins ? englishify(jins.name) : null,
                  ]
                )
              )
            : undefined,
          descendingMaqamAjnas: possibleMaqam.descendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(possibleMaqam.descendingMaqamAjnas).map(
                  ([noteName, jins]) => [
                    noteName,
                    jins ? englishify(jins.name) : null,
                  ]
                )
              )
            : undefined,
          transposition: possibleMaqam.transposition,
          commentsEnglish: maqamOverview.getCommentsEnglish(),
          commentsArabic: maqamOverview.getCommentsArabic(),
          SourcePageReferences: maqamOverview.getSourcePageReferences(),
        };

        if (possibleMaqam.maqamatModulations)
          mergedMaqam.maqamatModulations = possibleMaqam.maqamatModulations;
        if (possibleMaqam.ajnasModulations)
          mergedMaqam.ajnasModulations = possibleMaqam.ajnasModulations;

        maqamReference[englishify(possibleMaqam.name)] = mergedMaqam;
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
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(
    tuningSystem,
    startingNote
  );

  const pitchClassReference: { [noteName: string]: PitchClass } = {};

  const jinsReference: { [jinsName: string]: MergedJins } = {};

  fullRangeTuningSystemPitchClasses.forEach((pc) => {
    pitchClassReference[englishify(pc.noteName)] = pc;
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
    const relevantNoteNameSet =
      allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

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
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map(
      (pc) => englishify(pc.noteName)
    );
  }

  // Include the actual jins instance as MergedJins
  if (jinsData) {
    const mergedJins: MergedJins = {
      jinsId: jinsToExport.jinsId,
      name: jinsToExport.name,
      jinsPitchClasses: jinsToExport.jinsPitchClasses.map((pc) =>
        englishify(pc.noteName)
      ),
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

    const jinsTranspositions = Array.from(
      getJinsTranspositions(
        fullRangeTuningSystemPitchClasses,
        jinsData,
        true,
        centsTolerance
      )
    );

    for (let i = 0; i < jinsTranspositions.length; i++) {
      const jinsTransposition = jinsTranspositions[i];

      // Yield control every few iterations
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (jinsTranspositions.length > 10) {
          const progress = 87 + Math.round((i / jinsTranspositions.length) * 7);
          updateProgress(
            progress,
            `Processing transposition ${i + 1}/${jinsTranspositions.length}...`
          );
        }
      }

      const jinsOverview = allAjnas.find(
        (j) => j.getId() === jinsTransposition.jinsId
      );

      if (jinsOverview) {
        const mergedJins: MergedJins = {
          jinsId: jinsTransposition.jinsId,
          name: jinsTransposition.name,
          jinsPitchClasses: jinsTransposition.jinsPitchClasses.map((pc) =>
            englishify(pc.noteName)
          ),
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
    }

    updateProgress(94, "Finalizing jins transpositions...");
    result.transpositions = transpositions.map((jins) => englishify(jins.name));
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
  const fullRangeTuningSystemPitchClasses = getTuningSystemPitchClasses(
    tuningSystem,
    startingNote
  );

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
    const relevantNoteNameSet =
      allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

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
    result.tuningSystemPitchClasses = fullRangeTuningSystemPitchClasses.map(
      (pc) => englishify(pc.noteName)
    );
  }

  // Include the actual maqam instance as MergedMaqam
  if (maqamData) {
    const convertedMaqam = convertMaqamAjnasToObjects(maqamToExport);
    const mergedMaqam: MergedMaqam = {
      maqamId: maqamToExport.maqamId,
      name: maqamToExport.name,
      ascendingPitchClasses: maqamToExport.ascendingPitchClasses.map((pc) =>
        englishify(pc.noteName)
      ),
      descendingPitchClasses: maqamToExport.descendingPitchClasses.map((pc) =>
        englishify(pc.noteName)
      ),
      ascendingPitchClassIntervals: maqamToExport.ascendingPitchClassIntervals,
      descendingPitchClassIntervals:
        maqamToExport.descendingPitchClassIntervals,
      ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
        ? Object.fromEntries(
            Object.entries(convertedMaqam.ascendingMaqamAjnas).map(
              ([noteName, jins]) => [
                noteName,
                jins ? englishify(jins.name) : null,
              ]
            )
          )
        : undefined,
      descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
        ? Object.fromEntries(
            Object.entries(convertedMaqam.descendingMaqamAjnas).map(
              ([noteName, jins]) => [
                noteName,
                jins ? englishify(jins.name) : null,
              ]
            )
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
      const numberOfMaqamModulationHops =
        calculateNumberOfModulations(maqamatModulations);

      // Helper function to process maqam modulations and populate reference
      const processMaqamModulations = (maqamList: Maqam[]) => {
        return maqamList.map((maqam) => {
          const englishifiedName = englishify(maqam.name);

          // Find the original maqam data for additional details
          const maqamOverview = allMaqamat.find(
            (m) => m.getId() === maqam.maqamId
          );
          if (maqamOverview) {
            const mergedMaqam: MergedMaqam = {
              maqamId: maqam.maqamId,
              name: maqam.name,
              ascendingPitchClasses: maqam.ascendingPitchClasses.map((pc) =>
                englishify(pc.noteName)
              ),
              descendingPitchClasses: maqam.descendingPitchClasses.map((pc) =>
                englishify(pc.noteName)
              ),
              ascendingPitchClassIntervals: maqam.ascendingPitchClassIntervals,
              descendingPitchClassIntervals:
                maqam.descendingPitchClassIntervals,
              ascendingMaqamAjnas: maqam.ascendingMaqamAjnas
                ? Object.fromEntries(
                    Object.entries(
                      convertMaqamAjnasToObjects(maqam).ascendingMaqamAjnas ||
                        {}
                    ).map(([noteName, jins]) => [
                      noteName,
                      jins ? englishify(jins.name) : null,
                    ])
                  )
                : undefined,
              descendingMaqamAjnas: maqam.descendingMaqamAjnas
                ? Object.fromEntries(
                    Object.entries(
                      convertMaqamAjnasToObjects(maqam).descendingMaqamAjnas ||
                        {}
                    ).map(([noteName, jins]) => [
                      noteName,
                      jins ? englishify(jins.name) : null,
                    ])
                  )
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
        modulationsOnOne: processMaqamModulations(
          maqamatModulations.modulationsOnOne
        ),
        modulationsOnThree: processMaqamModulations(
          maqamatModulations.modulationsOnThree
        ),
        modulationsOnThree2p: processMaqamModulations(
          maqamatModulations.modulationsOnThree2p
        ),
        modulationsOnFour: processMaqamModulations(
          maqamatModulations.modulationsOnFour
        ),
        modulationsOnFive: processMaqamModulations(
          maqamatModulations.modulationsOnFive
        ),
        modulationsOnSixAscending: processMaqamModulations(
          maqamatModulations.modulationsOnSixAscending
        ),
        modulationsOnSixDescending: processMaqamModulations(
          maqamatModulations.modulationsOnSixDescending
        ),
        modulationsOnSixNoThird: processMaqamModulations(
          maqamatModulations.modulationsOnSixNoThird
        ),
        noteName2p: maqamatModulations.noteName2p,
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
      const numberOfJinsModulationHops =
        calculateNumberOfModulations(ajnasModulations);

      // Helper function to process jins modulations and populate reference
      const processJinsModulations = (jinsList: Jins[]) => {
        return jinsList.map((jins) => {
          const englishifiedName = englishify(jins.name);

          // Find the original jins data for additional details
          const jinsOverview = allAjnas.find((j) => j.getId() === jins.jinsId);
          if (jinsOverview) {
            const mergedJins: MergedJins = {
              jinsId: jins.jinsId,
              name: jins.name,
              jinsPitchClasses: jins.jinsPitchClasses.map((pc) =>
                englishify(pc.noteName)
              ),
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
        modulationsOnOne: processJinsModulations(
          ajnasModulations.modulationsOnOne
        ),
        modulationsOnThree: processJinsModulations(
          ajnasModulations.modulationsOnThree
        ),
        modulationsOnThree2p: processJinsModulations(
          ajnasModulations.modulationsOnThree2p
        ),
        modulationsOnFour: processJinsModulations(
          ajnasModulations.modulationsOnFour
        ),
        modulationsOnFive: processJinsModulations(
          ajnasModulations.modulationsOnFive
        ),
        modulationsOnSixAscending: processJinsModulations(
          ajnasModulations.modulationsOnSixAscending
        ),
        modulationsOnSixDescending: processJinsModulations(
          ajnasModulations.modulationsOnSixDescending
        ),
        modulationsOnSixNoThird: processJinsModulations(
          ajnasModulations.modulationsOnSixNoThird
        ),
        noteName2p: ajnasModulations.noteName2p,
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

    const maqamTranspositions = Array.from(
      getMaqamTranspositions(
        fullRangeTuningSystemPitchClasses,
        allAjnas,
        maqamData,
        true,
        centsTolerance
      )
    );

    for (let i = 0; i < maqamTranspositions.length; i++) {
      const maqamTransposition = maqamTranspositions[i];

      // Yield control every few iterations
      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        if (maqamTranspositions.length > 5) {
          const progress =
            65 + Math.round((i / maqamTranspositions.length) * 25);
          updateProgress(
            progress,
            `Processing transposition ${i + 1}/${maqamTranspositions.length}...`
          );
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
        const numberOfMaqamModulationHops =
          calculateNumberOfModulations(maqamatModulations);
        (maqamTransposition as any).maqamatModulations = maqamatModulations; // Use original format
        (maqamTransposition as any).numberOfMaqamModulationHops =
          numberOfMaqamModulationHops;
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
        const numberOfJinsModulationHops =
          calculateNumberOfModulations(ajnasModulations);
        (maqamTransposition as any).ajnasModulations = ajnasModulations; // Use original format
        (maqamTransposition as any).numberOfJinsModulationHops =
          numberOfJinsModulationHops;
      }

      // Create merged maqam and add to reference
      const maqamOverview = allMaqamat.find(
        (m) => m.getId() === maqamTransposition.maqamId
      );
      if (maqamOverview) {
        const convertedMaqam = convertMaqamAjnasToObjects(maqamTransposition);
        const mergedMaqam: MergedMaqam = {
          maqamId: maqamTransposition.maqamId,
          name: maqamTransposition.name,
          ascendingPitchClasses: maqamTransposition.ascendingPitchClasses.map(
            (pc) => englishify(pc.noteName)
          ),
          descendingPitchClasses: maqamTransposition.descendingPitchClasses.map(
            (pc) => englishify(pc.noteName)
          ),
          ascendingPitchClassIntervals:
            maqamTransposition.ascendingPitchClassIntervals,
          descendingPitchClassIntervals:
            maqamTransposition.descendingPitchClassIntervals,
          ascendingMaqamAjnas: convertedMaqam.ascendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(convertedMaqam.ascendingMaqamAjnas).map(
                  ([noteName, jins]) => [
                    noteName,
                    jins ? englishify(jins.name) : null,
                  ]
                )
              )
            : undefined,
          descendingMaqamAjnas: convertedMaqam.descendingMaqamAjnas
            ? Object.fromEntries(
                Object.entries(convertedMaqam.descendingMaqamAjnas).map(
                  ([noteName, jins]) => [
                    noteName,
                    jins ? englishify(jins.name) : null,
                  ]
                )
              )
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
