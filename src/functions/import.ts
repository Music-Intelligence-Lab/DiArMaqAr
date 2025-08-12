/**
 * Data Import Functions for Maqam Network
 * 
 * This module provides functions to import and instantiate data objects from JSON files.
 * It serves as the central data loading mechanism for the application, converting
 * raw JSON data into typed TypeScript objects with full method support.
 */

import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";

import TuningSystem from "@/models/TuningSystem";
import JinsData from "@/models/Jins";
import MaqamData from "@/models/Maqam";
import { Source } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Pattern from "@/models/Pattern";
import { NoteDuration } from "@/models/Pattern";

type RawSource = { sourceType: string; [key: string]: any };

/**
 * Imports and instantiates tuning system objects from JSON data.
 * 
 * Creates TuningSystem instances with full functionality including pitch class
 * generation, note name mappings, and frequency calculations. Each tuning system
 * contains the mathematical foundation for generating scales and pitch collections.
 * 
 * @returns Array of TuningSystem objects with complete functionality
 * 
 * @example
 * const tuningSystems = getTuningSystems();
 * const system = tuningSystems[0];
 * const pitchClasses = system.generatePitchClasses("D3Js");
 */
export function getTuningSystems(): TuningSystem[] {
  return (tuningSystemsData as any[]).map(
    (d) =>
      new TuningSystem(
        d.titleEnglish,                    // English title of the tuning system
        d.titleArabic,                     // Arabic title
        d.year,                            // Year of publication/creation
        d.sourceEnglish,                   // English source reference
        d.sourceArabic,                    // Arabic source reference
        d.sourcePageReferences,            // Specific page references
        d.creatorEnglish,                  // Creator name in English
        d.creatorArabic,                   // Creator name in Arabic
        d.commentsEnglish,                 // English commentary
        d.commentsArabic,                  // Arabic commentary
        d.tuningSystemPitchClasses,        // Raw pitch class data
        d.noteNames,                       // Note name mappings
        d.abjadNames,                      // Abjad (Arabic letter) names
        Number(d.stringLength),            // Reference string length
        d.referenceFrequencies,            // Reference frequency data
        Number(d.defaultReferenceFrequency), // Default reference frequency
        true                               // Enable full functionality
      )
  );
}

/**
 * Imports and instantiates jins (melodic fragments) objects from JSON data.
 * 
 * Creates JinsData instances representing the building blocks of maqam scales.
 * Each jins defines a specific melodic pattern with characteristic intervals
 * and can be combined to form complete maqam scales.
 * 
 * @returns Array of JinsData objects representing melodic fragments
 * 
 * @example
 * const ajnas = getAjnas();
 * const hijazJins = ajnas.find(j => j.name.includes("hijaz"));
 */
export function getAjnas(): JinsData[] {
  return (ajnasData as any[]).map((d) => new JinsData(
    d.id,                      // Unique identifier
    d.name,                    // Name of the jins
    d.noteNames,               // Note names that comprise the jins
    d.commentsEnglish,         // English commentary
    d.commentsArabic,          // Arabic commentary
    d.sourcePageReferences     // Source page references
  ));
}

/**
 * Imports and instantiates maqam objects from JSON data.
 * 
 * Creates MaqamData instances representing complete maqam scales with
 * ascending and descending forms. Maqamat are the complete scale structures
 * used in Arabic music, each with distinctive characteristics and emotional
 * associations.
 * 
 * @returns Array of MaqamData objects representing complete scale structures
 * 
 * @example
 * const maqamat = getMaqamat();
 * const rastMaqam = maqamat.find(m => m.name.includes("rast"));
 */
export function getMaqamat(): MaqamData[] {
  return (maqamatData as any[]).map((d) => new MaqamData(
    d.id,                      // Unique identifier
    d.name,                    // Name of the maqam
    d.ascendingNoteNames,      // Note names for ascending form
    d.descendingNoteNames,     // Note names for descending form
    d.suyūr,                   // Melodic progressions (suyur)
    d.commentsEnglish,         // English commentary
    d.commentsArabic,          // Arabic commentary
    d.sourcePageReferences     // Source page references
  ));
}

/**
 * Imports and instantiates source objects from JSON data.
 * 
 * Creates Source instances (Book or Article) representing bibliographic
 * references used throughout the system. Handles different source types
 * and converts them to appropriate class instances.
 * 
 * @returns Array of Source objects (Books and Articles)
 * @throws Error if unknown sourceType is encountered
 * 
 * @example
 * const sources = getSources();
 * const books = sources.filter(s => s instanceof Book);
 */
export function getSources(): Source[] {
  return (sourcesData as RawSource[]).map((d) => {
    switch (d.sourceType) {
      case "Book":
        return Book.fromJSON(d);      // Create Book instance
      case "Article":
        return Article.fromJSON(d);   // Create Article instance
      default:
        throw new Error(`Unknown sourceType "${d.sourceType}"`);
    }
  });
}

/**
 * Imports and instantiates pattern objects from JSON data.
 * 
 * Creates Pattern instances representing melodic and rhythmic patterns
 * used in maqam performance. These patterns include scale degree sequences,
 * durations, and performance instructions.
 * 
 * @returns Array of Pattern objects for melodic/rhythmic analysis
 * 
 * @example
 * const patterns = getPatterns();
 * const samazenPattern = patterns.find(p => p.name.includes("samazen"));
 */
export function getPatterns(): Pattern[] {
  return patternsData.map(
    (data) =>
      new Pattern(
        data.id,                           // Unique pattern identifier
        data.name,                         // Pattern name
        data.notes.map((note: any) => {    // Convert note data to proper format
          const base = {
            scaleDegree: note.scaleDegree as string,    // Scale degree (I, II, III, etc.)
            noteDuration: note.noteDuration as NoteDuration, // Duration (quarter, eighth, etc.)
            isTarget: note.isTarget || false,           // Whether this is a target note
          };
          
          // Add velocity if specified (for MIDI playback)
          if (typeof note.velocity === "number") {
            return { ...base, velocity: note.velocity };
          }
          return base;
        })
      )
  );
}
