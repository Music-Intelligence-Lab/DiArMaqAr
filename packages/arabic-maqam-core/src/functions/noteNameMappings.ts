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
export function getEnglishNoteName(arabicName: string): string {
  const mapping = arabicToEnglishNoteMapping[arabicName];
  if (mapping) return splitEnglishNoteName(mapping).englishNoteNameNatural + splitEnglishNoteName(mapping).englishNoteNameAccidental;
  else return "--";
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
