// NoteNameMappings.ts
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "../models/NoteName";

// 1. Define the parallel English-note arrays:
const englishOctaveZero = [
  "G",
  "G-#",
  "Ab-",
  "Ab",
  "A-b",
  "A-",
  "A",
  "A-#",
  "Bb",
  "Bb+",
  "Bb++",
  "B-b",
  "B--",
  "B-",
  "B",
  "C-b",
  "C",
  "C+",
  "C-#",
  "C#",
  "D-b",
  "D",
  "D-#",
  "Eb-",
  "Eb",
  "Eb+",
  "E-b",
  "E-",
  "E",
  "F-b",
  "F",
  "F+",
  "F-#",
  "F#-",
  "F#",
  "G-b",
  "G-",
];

const englishOctaveOne = [
  "G",
  "G-#",
  "Ab-",
  "Ab",
  "A-b",
  "A-",
  "A",
  "A-#",
  "Bb",
  "Bb+",
  "Bb++",
  "B-b",
  "B--",
  "B-",
  "B",
  "C-b",
  "C",
  "C+",
  "C-#",
  "C#",
  "D-b",
  "D",
  "D-#",
  "Eb-",
  "Eb",
  "Eb+",
  "E-b",
  "E-",
  "E",
  "F-b",
  "F",
  "F+",
  "F-#",
  "F#-",
  "F#",
  "G-b",
  "G-",
];

const englishOctaveTwo = [
  "g",
  "g-#",
  "ab-",
  "ab",
  "a-b",
  "a-",
  "a",
  "a-#",
  "bb",
  "bb+",
  "bb++",
  "b-b",
  "b--",
  "b-",
  "b",
  "c-b",
  "c",
  "c+",
  "c-#",
  "c#",
  "d-b",
  "d",
  "d-#",
  "eb-",
  "eb",
  "eb+",
  "e-b",
  "e-",
  "e",
  "f-b",
  "f",
  "f+",
  "f-#",
  "f#-",
  "f#",
  "g-b",
  "g-",
];

const englishOctaveThree = [
  "g",
  "g-#",
  "ab-",
  "ab",
  "a-b",
  "a-",
  "a",
  "a-#",
  "bb",
  "bb+",
  "bb++",
  "b-b",
  "b--",
  "b-",
  "b",
  "c-b",
  "c",
  "c+",
  "c-#",
  "c#",
  "d-b",
  "d",
  "d-#",
  "eb-",
  "eb",
  "eb+",
  "e-b",
  "e-",
  "e",
  "f-b",
  "f",
  "f+",
  "f-#",
  "f#-",
  "f#",
  "g-b",
  "g-",
];

const englishOctaveFour = [
  "g",
  "g-#",
  "ab-",
  "ab",
  "a-b",
  "a-",
  "a",
  "a-#",
  "bb",
  "bb+",
  "bb++",
  "b-b",
  "b--",
  "b-",
  "b",
  "c-b",
  "c",
  "c+",
  "c-#",
  "c#",
  "d-b",
  "d",
  "d-#",
  "eb-",
  "eb",
  "eb+",
  "e-b",
  "e-",
  "e",
  "f-b",
  "f",
  "f+",
  "f-#",
  "f#-",
  "f#",
  "g-b",
];

// 2. A small helper to zip Arabic→English:
function makeMap(arabic: string[], english: string[]) {
  if (arabic.length !== english.length) {
    throw new Error("octave arrays and english arrays must be same length");
  }
  return Object.fromEntries(arabic.map((a, i) => [a, english[i]]));
}

// 3. Build the single mapping by merging all four octaves:
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
 * Converts an Arabic note name to its corresponding English note name.
 *
 * This function provides a mapping from Arabic musical note names to
 * their Western equivalent note names. It's essential for cross-cultural
 * music theory communication and display purposes in the maqam analysis system.
 *
 * The function uses a comprehensive mapping table to convert between
 * Arabic musical terminology and Western notation systems.
 *
 * @param arabicName - The Arabic note name to convert
 * @returns The corresponding English note name, or "--" if not found
 */
export type EnglishNameOptions = { prevEnglish?: string; prefer?: "sharp" | "flat" | "auto" };

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

  // Normalize case for lookup then restore case of original first char
  const key = name.length >= 2 ? name[0].toUpperCase() + name.slice(1) : name.toUpperCase();
  const swapped = map[key];
  if (!swapped) return null;

  // match case of original (if original first char was lowercase, return lowercase)
  if (name[0] === name[0].toLowerCase()) return swapped.toLowerCase();
  return swapped;
}

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

// -----------------------
// Abjad arrays
// -----------------------
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
