// NoteNameMappings.ts
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "../models/NoteName";

// 1. Define the parallel English-note arrays:
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
