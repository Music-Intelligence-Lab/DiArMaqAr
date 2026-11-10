import crypto from "crypto";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";
import { getTuningSystems, getAjnas, getMaqamat, getSources, getPatterns } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { formTypeOf, FormType } from "@/functions/formType";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { PitchSpaceForms } from "@/functions/pitchSpaceForms";

/** How many of each kind of form a pitch space allows */
export interface FormCounts {
  /** Entries that can be built: each has exactly one base form */
  possible: number;
  /** Entries in the archive */
  total: number;
  /** Taṣwīr: the form moved onto another tonic */
  transpositions: number;
  /** The base form or a taṣwīr one or more octaves away. Not a taṣwīr. */
  octaveRenderings: number;
}

/** How many maqāmāt and ajnās a group of maqām forms can modulate to, summed over the forms */
export interface ModulationCounts {
  maqamat: number;
  ajnas: number;
}

/** Statistics for one tuning system on one starting note */
export interface TuningSystemStatistics {
  tuningSystem: { id: string; idName: string; displayName: string; year: string };
  startingNote: { idName: string; displayName: string };
  ajnas: FormCounts;
  maqamat: FormCounts & {
    /** Suyūr of the maqāmāt that can be built: the suyūr the app shows for them */
    suyur: number;
  };
  /** Modulations kept apart by the kind of form they start from */
  modulations: {
    fromBaseForms: ModulationCounts;
    fromTranspositions: ModulationCounts;
    fromOctaveRenderings: ModulationCounts;
  };
}

export interface ArchiveStatistics {
  /** Hash of the data the statistics were computed from */
  dataFingerprint: string;
  /** When the statistics were computed (ISO 8601) */
  generatedAt: string;
  archive: {
    tuningSystems: number;
    /** (tuning system, starting note) pairs: one row each in `tuningSystems` */
    tuningSystemStartingNotes: number;
    maqamat: number;
    ajnas: number;
    suyur: number;
    sources: number;
    patterns: number;
  };
  tuningSystems: TuningSystemStatistics[];
}

/**
 * Fields no statistic depends on: editing them leaves every count as it was.
 * Everything else is fingerprinted, so a field added later counts as a change
 * until it is listed here.
 */
const IGNORED_FIELDS = new Set([
  "commentsEnglish",
  "commentsArabic",
  "sourceEnglish",
  "sourceArabic",
  "sourcePageReferences",
  "version",
  // A maqām's structural ajnās and ghammāz: they label degrees of the forms,
  // they do not decide which forms exist or where they can modulate
  "primaryJinsDegree",
  "secondaryJinsDegree",
  "tertiaryJinsDegree",
  "ghammaz",
]);

const countedFields = (entries: object[]) =>
  entries.map((entry) =>
    Object.fromEntries(
      Object.entries(entry)
        .filter(([key]) => !IGNORED_FIELDS.has(key))
        // Only how many suyūr a maqām has is counted, not what they say
        .map(([key, value]) => (key === "suyur" && Array.isArray(value) ? [key, value.length] : [key, value]))
    )
  );

/**
 * A hash of the data the statistics are computed from. Statistics carrying a
 * different fingerprint were computed from other data and must not be shown.
 * Sources and patterns are only counted, so only their number is hashed.
 */
export function dataFingerprint(): string {
  const data = {
    tuningSystems: countedFields(tuningSystemsData),
    ajnas: countedFields(ajnasData),
    maqamat: countedFields(maqamatData),
    sources: sourcesData.length,
    patterns: patternsData.length,
  };
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

const modulationBucket: Record<FormType, keyof TuningSystemStatistics["modulations"]> = {
  base: "fromBaseForms",
  transposition: "fromTranspositions",
  octaveRendering: "fromOctaveRenderings",
};

/**
 * Statistics for every tuning system on every starting note. Takes about a
 * minute: it runs modulate() twice for each of some 80,000 maqām forms.
 *
 * @param onProgress - Called after each (tuning system, starting note) pair
 */
export function computeArchiveStatistics(onProgress?: (row: TuningSystemStatistics) => void): ArchiveStatistics {
  const tuningSystems = getTuningSystems();
  const allAjnas = getAjnas();
  const allMaqamat = getMaqamat();
  const rows: TuningSystemStatistics[] = [];

  for (const tuningSystem of tuningSystems) {
    for (const noteNames of tuningSystem.getNoteNameSets()) {
      const startingNote = noteNames[0];
      const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
      const forms = new PitchSpaceForms(pitchClasses, allAjnas, allMaqamat);

      const ajnas: FormCounts = { possible: 0, total: allAjnas.length, transpositions: 0, octaveRenderings: 0 };
      const availableNoteNames = pitchClasses.map((pitchClass) => pitchClass.noteName);
      for (const jins of allAjnas) {
        if (!jins.isJinsPossible(availableNoteNames)) continue;
        ajnas.possible++;
        for (const form of forms.jinsRenderings(jins.getId())) {
          const formType = formTypeOf(form);
          if (formType === "transposition") ajnas.transpositions++;
          if (formType === "octaveRendering") ajnas.octaveRenderings++;
        }
      }

      const maqamat: TuningSystemStatistics["maqamat"] = { possible: 0, total: allMaqamat.length, transpositions: 0, octaveRenderings: 0, suyur: 0 };
      const modulations: TuningSystemStatistics["modulations"] = {
        fromBaseForms: { maqamat: 0, ajnas: 0 },
        fromTranspositions: { maqamat: 0, ajnas: 0 },
        fromOctaveRenderings: { maqamat: 0, ajnas: 0 },
      };
      for (const maqam of allMaqamat) {
        const maqamForms = forms.maqamRenderings(maqam.getId());
        if (maqamForms.length === 0) continue;
        maqamat.possible++;
        // Every sayr of a maqām the app can show, as the app shows them
        maqamat.suyur += maqam.getSuyur().length;
        for (const form of maqamForms) {
          const formType = formTypeOf(form);
          if (formType === "transposition") maqamat.transpositions++;
          if (formType === "octaveRendering") maqamat.octaveRenderings++;
          const counts = forms.modulationCounts(form);
          modulations[modulationBucket[formType]].maqamat += counts.maqamat;
          modulations[modulationBucket[formType]].ajnas += counts.ajnas;
        }
      }

      const row: TuningSystemStatistics = {
        tuningSystem: {
          id: tuningSystem.getId(),
          idName: standardizeText(tuningSystem.getId()),
          displayName: tuningSystem.stringify(),
          year: tuningSystem.getYear(),
        },
        startingNote: { idName: standardizeText(startingNote), displayName: startingNote },
        ajnas,
        maqamat,
        modulations,
      };
      rows.push(row);
      onProgress?.(row);
    }
  }

  return {
    dataFingerprint: dataFingerprint(),
    generatedAt: new Date().toISOString(),
    archive: {
      tuningSystems: tuningSystems.length,
      tuningSystemStartingNotes: rows.length,
      maqamat: allMaqamat.length,
      ajnas: allAjnas.length,
      suyur: allMaqamat.reduce((sum, maqam) => sum + maqam.getSuyur().length, 0),
      sources: getSources().length,
      patterns: getPatterns().length,
    },
    tuningSystems: rows,
  };
}
