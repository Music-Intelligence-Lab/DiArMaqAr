/**
 * Converts Roman numerals to numbers for parsing pattern notes in playSequence.
 *
 * When playing musical patterns, notes can be specified as Roman numerals (I, II, III, etc.)
 * representing scale degrees. This function converts them to numbers so we can find the
 * correct pitch in the scale. Supports + and - prefixes for octave shifts.
 *
 * Used in sound-context.tsx playSequence function to parse pattern note degrees
 * like "V" → 5th scale degree, "+II" → 2nd degree in higher octave.
 *
 * @param r - Roman numeral (I-XII), optionally prefixed with + or -
 * @returns Number 1-12, or 0 if invalid
 *
 * @example
 * romanToNumber("V") // 5 (fifth scale degree)
 * romanToNumber("+IV") // 4 (fourth degree, higher octave)
 * romanToNumber("-II") // 2 (second degree, lower octave)
 */
export default function romanToNumber(r: string) {
  // Mapping from Roman numerals to Arabic numbers
  // Covers the common range used in music theory (I-XII)
  const map: Record<string, number> = {
    I: 1, // First degree (tonic)
    II: 2, // Second degree (supertonic)
    III: 3, // Third degree (mediant)
    IV: 4, // Fourth degree (subdominant)
    V: 5, // Fifth degree (dominant)
    VI: 6, // Sixth degree (submediant)
    VII: 7, // Seventh degree (leading tone)
    VIII: 8, // Octave
    IX: 9, // Ninth
    X: 10, // Tenth
    XI: 11, // Eleventh
    XII: 12, // Twelfth
  };

  // Handle prefixed signs (+ for raised, - for lowered degrees)
  // The sign indicates chromatic alteration but we return the base degree number
  if (r.startsWith("+") || r.startsWith("-")) {
    const baseRoman = r.slice(1); // Remove the prefix
    return map[baseRoman] ?? 0; // Return the base degree number
  }

  // Handle unprefixed Roman numerals
  return map[r] ?? 0; // Return 0 if not found in mapping
}
