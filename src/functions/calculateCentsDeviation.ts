/**
 * Calculate the cents deviation from 12-EDO for a given pitch class
 */

// 12-EDO chromatic scale starting from C = 0 cents
const TWELVE_EDO_NOTES: { [key: string]: number } = {
  'C': 0,
  'C#': 100,
  'Db': 100,
  'D': 200,
  'D#': 300,
  'Eb': 300,
  'E': 400,
  'F': 500,
  'F#': 600,
  'Gb': 600,
  'G': 700,
  'G#': 800,
  'Ab': 800,
  'A': 900,
  'A#': 1000,
  'Bb': 1000,
  'B': 1100,
};

/**
 * Extract the natural note name from an English note name
 * E.g., "E-b" -> "E", "F#+" -> "F#", "Ab--" -> "Ab"
 */
function extractNaturalNoteName(englishNoteName: string): string {
  if (!englishNoteName || englishNoteName === "--") return "";
  
  // Handle flat notes (Ab, Bb, Db, Eb, Gb)
  if (englishNoteName.length >= 2 && englishNoteName[1] === 'b') {
    return englishNoteName.substring(0, 2);
  }
  
  // Handle sharp notes (C#, D#, F#, G#, A#)
  if (englishNoteName.length >= 2 && englishNoteName[1] === '#') {
    return englishNoteName.substring(0, 2);
  }
  
  // Handle natural notes (C, D, E, F, G, A, B)
  return englishNoteName[0];
}

/**
 * Calculate the 12-EDO cents value for a given English note name
 * This function maps any English note name to its 12-EDO equivalent
 */
function getTwelveEdoCents(englishNoteName: string, octave: number): number {
  const naturalNote = extractNaturalNoteName(englishNoteName);
  
  if (!naturalNote || !(naturalNote in TWELVE_EDO_NOTES)) {
    return 0; // Default to C if note not found
  }
  
  const baseCents = TWELVE_EDO_NOTES[naturalNote];
  return baseCents + (octave * 1200);
}

/**
 * Calculate the cents deviation from 12-EDO
 * Positive values mean the note is sharp compared to 12-EDO
 * Negative values mean the note is flat compared to 12-EDO
 */
export function calculateCentsDeviation(
  actualCents: number,
  englishNoteName: string,
  octave: number
): number {
  if (!englishNoteName || englishNoteName === "--") {
    return 0;
  }
  
  const twelveEdoCents = getTwelveEdoCents(englishNoteName, octave);
  return actualCents - twelveEdoCents;
}

export default calculateCentsDeviation;
