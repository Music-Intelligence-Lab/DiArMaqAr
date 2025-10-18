/**
 * Note Name Mappings Module
 * 
 * Provides bidirectional mapping between Arabic transliterated note names and
 * International Pitch Notation (IPN) equivalents across all four octaves.
 * 
 * This module serves as the canonical reference for converting between the culturally-specific
 * Arabic note nomenclature (rāst, dūgāh, segāh, etc.) and their Western pitch notation equivalents
 * (G2, A2, B-b2, etc.). The mappings are organized by octave to support the four-octave system
 * used throughout the platform.
 * 
 * **Octave Organization:**
 * - Octave 0 (qarār): Lower octave, MIDI range ~G1-G2
 * - Octave 1 (ʿushayrān): Primary octave, MIDI range ~G2-G3
 * - Octave 2 (jawāb): Second octave, MIDI range ~G3-G4
 * - Octave 3 (jawāb jawāb): Upper octave, MIDI range ~G4-G5
 * 
 * **Musicological Note:**
 * IPN spellings (e.g., E-b for "half-flat E") follow Arabic maqām theory logic where
 * microtonal modifiers indicate what the pitch is a variant OF, not mathematical
 * proximity to 12-EDO semitones. For example, E-b is a variant of E natural, not Eb.
 */

// NoteNameMappings.ts
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "../models/NoteName";

/**
 * International Pitch Notation equivalents for qarār (lower) octave notes.
 * Maps to octaveZeroNoteNames from NoteName model.
 * Range: ~G1 to G2 (MIDI 31-43)
 */
const englishOctaveZero = [
  "G1",
  "G-#1",
  "Ab-1",
  "Ab1",
  "A-b1",
  "A-1",
  "A1",
  "A-#1",
  "Bb1",
  "Bb+1",
  "Bb++1",
  "B-b1",
  "B--1",
  "B-1",
  "B1",
  "C-b2",
  "C2",
  "C+2",
  "C-#2",
  "C#2",
  "D-b2",
  "D2",
  "D-#2",
  "Eb-2",
  "Eb2",
  "Eb+2",
  "E-b2",
  "E-2",
  "E2",
  "F-b2",
  "F2",
  "F+2",
  "F-#2",
  "F#-2",
  "F#2",
  "G-b2",
  "G-2",
];

/**
 * International Pitch Notation equivalents for ʿushayrān (primary/first) octave notes.
 * Maps to octaveOneNoteNames from NoteName model.
 * Range: ~G2 to G3 (MIDI 43-55)
 * This is the primary octave used in most Arabic maqām theory.
 */
const englishOctaveOne = [
  "G2",
  "G-#2",
  "Ab-2",
  "Ab2",
  "A-b2",
  "A-2",
  "A2",
  "A-#2",
  "Bb2",
  "Bb+2",
  "Bb++2",
  "B-b2",
  "B--2",
  "B-2",
  "B2",
  "C-b3",
  "C3",
  "C+3",
  "C-#3",
  "C#3",
  "D-b3",
  "D3",
  "D-#3",
  "Eb-3",
  "Eb3",
  "Eb+3",
  "E-b3",
  "E-3",
  "E3",
  "F-b3",
  "F3",
  "F+3",
  "F-#3",
  "F#-3",
  "F#3",
  "G-b3",
  "G-3",
];

/**
 * International Pitch Notation equivalents for jawāb (second) octave notes.
 * Maps to octaveTwoNoteNames from NoteName model.
 * Range: ~G3 to G4 (MIDI 55-67)
 */
const englishOctaveTwo = [
  "G3",
  "G-#3",
  "Ab-3",
  "Ab3",
  "A-b3",
  "A-3",
  "A3",
  "A-#3",
  "Bb3",
  "Bb+3",
  "Bb++3",
  "B-b3",
  "B--3",
  "B-3",
  "B3",
  "C-b4",
  "C4",
  "C+4",
  "C-#4",
  "C#4",
  "D-b4",
  "D4",
  "D-#4",
  "Eb-4",
  "Eb4",
  "Eb+4",
  "E-b4",
  "E-4",
  "E4",
  "F-b4",
  "F4",
  "F+4",
  "F-#4",
  "F#-4",
  "F#4",
  "G-b4",
  "G-4",
];

/**
 * International Pitch Notation equivalents for jawāb jawāb (upper/third) octave notes.
 * Maps to octaveThreeNoteNames from NoteName model.
 * Range: ~G4 to G5 (MIDI 67-79)
 */
const englishOctaveThree = [
  "G4",
  "G-#4",
  "Ab-4",
  "Ab4",
  "A-b4",
  "A-4",
  "A4",
  "A-#4",
  "Bb4",
  "Bb+4",
  "Bb++4",
  "B-b4",
  "B--4",
  "B-4",
  "B4",
  "C-b5",
  "C5",
  "C+5",
  "C-#5",
  "C#5",
  "D-b5",
  "D5",
  "D-#5",
  "Eb-5",
  "Eb5",
  "Eb+5",
  "E-b5",
  "E-5",
  "E5",
  "F-b5",
  "F5",
  "F+5",
  "F-#5",
  "F#-5",
  "F#5",
  "G-b5",
  "G-5",
];

/**
 * International Pitch Notation equivalents for the extended fourth octave notes.
 * Maps to octaveFourNoteNames from NoteName model.
 * Range: ~G5 to G6 (MIDI 79-91)
 * This octave extends beyond traditional Arabic maqām theory for broader instrument compatibility.
 */
const englishOctaveFour = [
  "G5",
  "G-#5",
  "Ab-5",
  "Ab5",
  "A-b5",
  "A-5",
  "A5",
  "A-#5",
  "Bb5",
  "Bb+5",
  "Bb++5",
  "B-b5",
  "B--5",
  "B-5",
  "B5",
  "C-b6",
  "C6",
  "C+6",
  "C-#6",
  "C#6",
  "D-b6",
  "D6",
  "D-#6",
  "Eb-6",
  "Eb6",
  "Eb+6",
  "E-b6",
  "E-6",
  "E6",
  "F-b6",
  "F6",
  "F+6",
  "F-#6",
  "F#-6",
  "F#6",
  "G-b6",
];

/**
 * Creates a mapping object from Arabic note names to English note names.
 * 
 * @param arabic - Array of Arabic note names
 * @param english - Array of corresponding English note names
 * @returns Object mapping Arabic names to English names
 * @throws Error if arrays have different lengths
 */
function makeMap(arabic: string[], english: string[]) {
  if (arabic.length !== english.length) {
    throw new Error("octave arrays and english arrays must be same length");
  }
  return Object.fromEntries(arabic.map((a, i) => [a, english[i]]));
}

/**
 * Complete bidirectional mapping from Arabic note names to International Pitch Notation.
 * Combines all four octaves (qarār, ʿushayrān, jawāb, jawāb jawāb) into a single lookup table.
 * 
 * Used by conversion functions to translate between cultural nomenclature systems.
 */
const arabicToEnglishNoteMapping = {
  ...makeMap(octaveZeroNoteNames, englishOctaveZero),
  ...makeMap(octaveOneNoteNames, englishOctaveOne),
  ...makeMap(octaveTwoNoteNames, englishOctaveTwo),
  ...makeMap(octaveThreeNoteNames, englishOctaveThree),
  ...makeMap(octaveFourNoteNames, englishOctaveFour),
};

/**
 * Splits an English note name into its natural note and accidental parts.
 *
 * @param englishNoteName - The English note name to split (e.g., "Ab", "C#")
 * @returns Object with natural note and accidental parts
 */
function splitEnglishNoteName(englishNoteName: string) {
  return { englishNoteNameNatural: englishNoteName[0], englishNoteNameAccidental: englishNoteName.slice(1) };
}

/**
 * Options for controlling English note name conversion behavior.
 * 
 * @property prevEnglish - Previous English note name for avoiding diatonic letter repetition
 * @property prefer - Preferred accidental spelling ("sharp", "flat", or "auto")
 */
export type EnglishNameOptions = { prevEnglish?: string; prefer?: "sharp" | "flat" | "auto" };

/**
 * Swaps simple enharmonic equivalents while preserving octave and case.
 * Handles single sharps/flats only (C#/Db, F#/Gb, etc.), not microtonal notes.
 * 
 * This function is used to avoid repeating diatonic letters in melodic sequences,
 * following Western notation conventions where consecutive notes typically use
 * different letter names (e.g., C-D-E rather than C-C#-D).
 * 
 * @param name - The English note name to swap (e.g., "F#3", "Db4")
 * @returns The enharmonic equivalent, or null if not found or not applicable
 * 
 * @example
 * ```typescript
 * swapEnharmonicSimple("C#3");  // "Db3"
 * swapEnharmonicSimple("Ab2");  // "G#2"
 * swapEnharmonicSimple("F+3");  // null (microtonal not supported)
 * ```
 */
function swapEnharmonicSimple(name: string): string | null {
  // handle simple single-sharp / single-flat enharmonics, preserve case
  const map: { [k: string]: string } = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
    "E#": "F",
    "B#": "C",
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",
    "Fb": "E",
    "Cb": "B",
  };

  // Extract the note part (without octave number) and the octave part
  // E.g., "F#3" -> notePart: "F#", octavePart: "3"
  const match = name.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) return null;
  
  const notePart = match[1];
  const octavePart = match[2];

  // Normalize case for lookup
  const key = notePart.length >= 2 ? notePart[0].toUpperCase() + notePart.slice(1) : notePart.toUpperCase();
  const swapped = map[key];
  if (!swapped) return null;

  // match case of original (if original first char was lowercase, return lowercase)
  const finalSwapped = notePart[0] === notePart[0].toLowerCase() ? swapped.toLowerCase() : swapped;
  
  // Append the octave part back
  return finalSwapped + octavePart;
}

/**
 * Converts an Arabic note name to its International Pitch Notation equivalent.
 * 
 * Provides bidirectional cultural translation between Arabic maqām nomenclature
 * (e.g., rāst, dūgāh, segāh) and Western International Pitch Notation (e.g., G3, A3, B-b3).
 * 
 * Optionally avoids repeating diatonic letters when provided with the previous note,
 * following Western notation conventions for melodic sequences. For example, if the
 * previous note was "C3" and the mapping returns "C#3", it will swap to "Db3" to
 * avoid consecutive C letters.
 * 
 * @param arabicName - The Arabic note name to convert (from NoteName model)
 * @param opts - Optional conversion options
 * @param opts.prevEnglish - Previous English note for avoiding letter repetition
 * @param opts.prefer - Preferred accidental spelling (currently unused, reserved for future)
 * @returns The International Pitch Notation equivalent, or "--" if not found
 * 
 * @example
 * ```typescript
 * getEnglishNoteName("rāst");           // "G3"
 * getEnglishNoteName("dūgāh");          // "A3"
 * getEnglishNoteName("segāh-b");        // "Bb3"
 * 
 * // Avoiding letter repetition:
 * getEnglishNoteName("rāst-#", { prevEnglish: "G3" });  // "Ab3" instead of "G#3"
 * ```
 */
export function getEnglishNoteName(arabicName: string, opts?: EnglishNameOptions): string {
  const mapping = arabicToEnglishNoteMapping[arabicName];
  if (!mapping) return "--";

  // By default just return the direct mapping
  let candidate = mapping;

  // If caller supplied a previous English name, avoid repeating the same diatonic letter
  if (opts && opts.prevEnglish) {
    try {
      const prev = splitEnglishNoteName(opts.prevEnglish);
      const cand = splitEnglishNoteName(candidate);
      const prevLetter = prev.englishNoteNameNatural.toUpperCase();
      const candLetter = cand.englishNoteNameNatural.toUpperCase();

      if (prevLetter === candLetter) {
        // try simple enharmonic swap (C# <-> Db, etc.) but only for simple tokens (no microtonal + / - tokens)
        if (!/[+\-]{1,2}/.test(candidate) && !/[+\-]{1,2}/.test(opts.prevEnglish)) {
          const swapped = swapEnharmonicSimple(candidate);
          if (swapped) candidate = swapped;
        }
      }
    } catch {
      // fallback: ignore and return mapping
    }
  }

  return splitEnglishNoteName(candidate).englishNoteNameNatural + splitEnglishNoteName(candidate).englishNoteNameAccidental;
}

/**
 * Determines the expected letter sequence for a melodic sequence.
 * For diatonic scales, the natural letter sequence should follow alphabetical order.
 *
 * @param startLetter - The starting letter (A-G)
 * @param count - Number of notes in the sequence
 * @returns Array of expected letters in sequence
 */
function getExpectedLetterSequence(startLetter: string, count: number): string[] {
  const letters = ["A", "B", "C", "D", "E", "F", "G"];
  const startIndex = letters.indexOf(startLetter.toUpperCase());
  if (startIndex === -1) return [];

  const sequence: string[] = [];
  for (let i = 0; i < count; i++) {
    sequence.push(letters[(startIndex + i) % 7]);
  }
  return sequence;
}

/**
 * Finds the best enharmonic spelling that matches a target letter.
 *
 * @param noteName - The English note name (e.g., "Ab3", "F#4")
 * @param targetLetter - The desired letter (A-G)
 * @returns The note name with the target letter, or null if impossible
 */
function findEnharmonicWithLetter(noteName: string, targetLetter: string): string | null {
  // Extract note part and octave part
  const match = noteName.match(/^([A-Ga-g][#b+-]*)(.*)$/);
  if (!match) return null;

  const notePart = match[1];
  const octavePart = match[2];

  // Normalize: first letter uppercase, rest as-is (e.g., "Ab", "C#", "Bb")
  const key = notePart.charAt(0).toUpperCase() + notePart.slice(1).toLowerCase();

  // Don't provide alternatives for microtonal notes (with + or - symbols)
  if (/[+-]/.test(notePart)) {
    return null;
  }

  // Simple enharmonic map (only common single sharps/flats)
  const enharmonicMap: { [key: string]: string[] } = {
    "C": ["C", "B#"],
    "C#": ["C#", "Db"],
    "Db": ["Db", "C#"],
    "D": ["D"],
    "D#": ["D#", "Eb"],
    "Eb": ["Eb", "D#"],
    "E": ["E", "Fb"],
    "F": ["F", "E#"],
    "F#": ["F#", "Gb"],
    "Gb": ["Gb", "F#"],
    "G": ["G"],
    "G#": ["G#", "Ab"],
    "Ab": ["Ab", "G#"],
    "A": ["A"],
    "A#": ["A#", "Bb"],
    "Bb": ["Bb", "A#"],
    "B": ["B", "Cb"],
  };

  const alternatives = enharmonicMap[key] || [key];

  // Find the alternative that starts with the target letter
  for (const alt of alternatives) {
    if (alt[0].toUpperCase() === targetLetter.toUpperCase()) {
      // Preserve case and add octave
      const result = notePart[0] === notePart[0].toLowerCase()
        ? alt.toLowerCase() + octavePart
        : alt + octavePart;
      return result;
    }
  }

  return null;
}

/**
 * Resolves enharmonic spellings for a sequence of notes to ensure sequential natural letters.
 * This follows Western music notation convention where scales use consecutive letters (D-E-F-G-A-B-C-D).
 *
 * The algorithm:
 * 1. Determines the expected letter sequence from the first note
 * 2. For each note, finds the enharmonic spelling that matches the expected letter
 * 3. Falls back to the default mapping if no suitable enharmonic exists
 *
 * @param arabicNames - Array of Arabic note names to convert
 * @returns Array of English note names with sequential natural letters
 */
export function getSequentialEnglishNames(arabicNames: string[]): string[] {
  if (arabicNames.length === 0) return [];

  // Get default mappings
  const defaultNames = arabicNames.map(name => {
    const mapping = arabicToEnglishNoteMapping[name];
    return mapping || "--";
  });

  // Handle single note or invalid cases
  if (arabicNames.length === 1 || defaultNames[0] === "--") {
    return defaultNames;
  }

  // Determine expected letter sequence from the first note
  const firstLetter = defaultNames[0][0].toUpperCase();
  const expectedLetters = getExpectedLetterSequence(firstLetter, arabicNames.length);

  const result: string[] = [];

  for (let i = 0; i < defaultNames.length; i++) {
    const defaultName = defaultNames[i];

    if (defaultName === "--") {
      result.push("--");
      continue;
    }

    const expectedLetter = expectedLetters[i];
    const actualLetter = defaultName[0].toUpperCase();

    // If the default already matches the expected letter, use it
    if (actualLetter === expectedLetter) {
      result.push(defaultName);
      continue;
    }

    // Try to find an enharmonic spelling with the expected letter
    const enharmonic = findEnharmonicWithLetter(defaultName, expectedLetter);
    if (enharmonic) {
      result.push(enharmonic);
    } else {
      // No enharmonic found, use default (this handles microtonal notes or complex cases)
      result.push(defaultName);
    }
  }

  return result;
}

/**
 * Arabic Abjad numerals used in traditional music notation systems.
 * 
 * Abjad is the Arabic alphabetical ordering system where letters represent numerical values,
 * historically used for numbering and ordering. In Arabic music theory, these letters are
 * sometimes used to label scale degrees, frets, or pitch positions.
 * 
 * The array includes:
 * - Single letters: آ ب ج د ه و ز ح ط ي ك ل م ن س ع ف ص ق ر ش ت ث خ ذ ض ظ غ
 * - Compound forms: يا يب يج... (yā combinations), كا كب كج... (kāf combinations), لا لب لج... (lām combinations)
 * 
 * Used for compatibility with historical treatises and traditional notation systems.
 */
export const abjadNames = [
  "آ",
  "ب",
  "ج",
  "د",
  "ه",
  "و",
  "ز",
  "ح",
  "ط",
  "ي",
  "ك",
  "ل",
  "م",
  "ن",
  "س",
  "ع",
  "ف",
  "ص",
  "ق",
  "ر",
  "ش",
  "ت",
  "ث",
  "خ",
  "ذ",
  "ض",
  "ظ",
  "غ",
  "يا",
  "يب",
  "يج",
  "يد",
  "يه",
  "يو",
  "يز",
  "يح",
  "يط",
  "كا",
  "كب",
  "كج",
  "كد",
  "كه",
  "كو",
  "كز",
  "كح",
  "كط",
  "لا",
  "لب",
  "لج",
  "لد",
  "له",
  "لو",
  "لز",
  "لح",
  "لط",
];
