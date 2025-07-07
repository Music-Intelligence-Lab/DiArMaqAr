import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";

import TuningSystem from "@/models/TuningSystem";
import JinsDetails from "@/models/Jins";
import MaqamDetails from "@/models/Maqam";
import { Source } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Pattern from "@/models/Pattern";
import { NoteDuration } from "@/models/Pattern";

type RawSource = { sourceType: string; [key: string]: any };

export function getTuningSystems(): TuningSystem[] {
  return (tuningSystemsData as any[]).map(
    (d) =>
      new TuningSystem(
        d.titleEnglish,
        d.titleArabic,
        d.year,
        d.sourceEnglish,
        d.sourceArabic,
        d.sourcePageReferences,
        d.creatorEnglish,
        d.creatorArabic,
        d.commentsEnglish,
        d.commentsArabic,
        d.tuningSystemPitchClasses,
        d.noteNames,
        d.abjadNames,
        Number(d.stringLength),
        d.referenceFrequencies,
        Number(d.defaultReferenceFrequency),
        true
      )
  );
}

export function getAjnas(): JinsDetails[] {
  return (ajnasData as any[]).map((d) => new JinsDetails(d.id, d.name, d.noteNames, d.commentsEnglish, d.commentsArabic, d.sourcePageReferences));
}

export function getMaqamat(): MaqamDetails[] {
  return (maqamatData as any[]).map((d) => new MaqamDetails(d.id, d.name, d.ascendingNoteNames, d.descendingNoteNames, d.suyūr, d.commentsEnglish, d.commentsArabic, d.sourcePageReferences));
}

export function getSources(): Source[] {
  return (sourcesData as RawSource[]).map((d) => {
    switch (d.sourceType) {
      case "Book":
        return Book.fromJSON(d);
      case "Article":
        return Article.fromJSON(d);
      default:
        throw new Error(`Unknown sourceType "${d.sourceType}"`);
    }
  });
}

export function getPatterns(): Pattern[] {
  return patternsData.map(
    (data) =>
      new Pattern(
        data.id,
        data.name,
        data.notes.map((note: any) => {
          const base = {
            scaleDegree: note.scaleDegree as string,
            noteDuration: note.noteDuration as NoteDuration,
            isTarget: note.isTarget || false,
          };
          if (typeof note.velocity === "number") {
            return { ...base, velocity: note.velocity };
          }
          return base;
        })
      )
  );
}
