/**
 * Converts Roman numeral strings to Arabic numbers with optional sign prefix handling.
 * 
 * This function is used in maqam analysis for converting degree notations
 * (I, II, III, IV, V, VI, VII) to numeric values. It supports optional
 * + and - prefixes for indicating raised or lowered degrees.
 * 
 * @param r - Roman numeral string (I-XII), optionally prefixed with + or -
 * @returns The corresponding Arabic number (1-12), or 0 if not recognized
 * 
 * @example
 * romanToNumber("V") // Returns 5
 * 
 * @example
 * romanToNumber("+IV") // Returns 4 (raised fourth degree)
 * 
 * @example
 * romanToNumber("-VII") // Returns 7 (lowered seventh degree)
 * 
 * @example
 * romanToNumber("XIII") // Returns 0 (not in mapping)
 */
export default function romanToNumber(r: string) {
  // Mapping from Roman numerals to Arabic numbers
  // Covers the common range used in music theory (I-XII)
  const map: Record<string, number> = {
    I: 1,     // First degree (tonic)
    II: 2,    // Second degree (supertonic)
    III: 3,   // Third degree (mediant)
    IV: 4,    // Fourth degree (subdominant)
    V: 5,     // Fifth degree (dominant)
    VI: 6,    // Sixth degree (submediant)
    VII: 7,   // Seventh degree (leading tone)
    VIII: 8,  // Octave
    IX: 9,    // Ninth
    X: 10,    // Tenth
    XI: 11,   // Eleventh
    XII: 12,  // Twelfth
  };

  // Handle prefixed signs (+ for raised, - for lowered degrees)
  // The sign indicates chromatic alteration but we return the base degree number
  if (r.startsWith("+") || r.startsWith("-")) {
    const baseRoman = r.slice(1); // Remove the prefix
    return map[baseRoman] ?? 0;   // Return the base degree number
  }
  
  // Handle unprefixed Roman numerals
  return map[r] ?? 0; // Return 0 if not found in mapping
}
