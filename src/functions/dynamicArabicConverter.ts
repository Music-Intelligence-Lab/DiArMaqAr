/**
 * Dynamic Arabic Script Converter
 * 
 * Converts Library of Congress Arabic transliteration to Arabic script using
 * dynamic pattern matching. This comprehensive converter handles the full range
 * of LOC transliteration standards with contextual processing for different
 * types of musical terminology.
 * 
 * Key Features:
 * - Comprehensive LOC transliteration mapping
 * - Multi-character sequence handling (e.g., "th" → "ث")
 * - Context-aware diacritic processing
 * - Persian/Turkish letter support for maqam names
 * - Automatic word boundary detection
 * - Longest-match-first algorithm for accuracy
 * 
 * This approach is dynamic and works with any transliterated text following
 * Library of Congress standards, making it suitable for converting both
 * classical Arabic terms and Ottoman/Persian musical terminology.
 */

/**
 * Library of Congress Arabic Romanization to Arabic Script Mapping
 * 
 * This comprehensive mapping covers:
 * - All 28 Arabic letters in their various forms
 * - Emphatic consonants with proper diacritical marks
 * - Long and short vowels with appropriate representations
 * - Persian and Turkish letters commonly used in maqam terminology
 * - Special characters and combinations unique to musical terms
 */
const LOC_TRANSLITERATION_MAP: Record<string, string> = {
  // Basic Arabic letters with their standard LOC transliterations
  'āʾ': 'اء',     // hamza with alif
  'ʾa': 'أ',     // hamza above alif  
  'ʾā': 'آ',     // alif with madda (long a with hamza)
  'ā': 'ا',     // alif (long a)
  'a': '',     // short alif (usually handled by diacritics in context)
  'b': 'ب',     // ba (b sound)
  't': 'ت',     // ta (t sound)
  'th': 'ث',    // tha (th sound as in "think")
  'j': 'ج',     // jim (j sound)
  'ḥ': 'ح',     // ha (emphatic h, pharyngeal fricative)
  'kh': 'خ',    // kha (ch sound as in German "ach")
  'd': 'د',     // dal (d sound)
  'dh': 'ذ',    // dhal (th sound as in "this")
  'r': 'ر',     // ra (r sound, rolled)
  'z': 'ز',     // zay (z sound)
  's': 'س',     // sin (s sound)
  'sh': 'ش',    // shin (sh sound)
  'ṣ': 'ص',     // sad (emphatic s)
  'ḍ': 'ض',     // dad (emphatic d)
  'ṭ': 'ط',     // ta (emphatic t)
  'ẓ': 'ظ',     // za (emphatic z)
  'ʿ': 'ع',     // ayn (pharyngeal stop)
  'gh': 'غ',    // ghayn (voiced equivalent of kh)
  'f': 'ف',     // fa (f sound)
  'q': 'ق',     // qaf (uvular stop)
  'k': 'ك',     // kaf (k sound)
  'l': 'ل',     // lam (l sound)
  'm': 'م',     // mim (m sound)
  'n': 'ن',     // nun (n sound)
  'h': 'ه',     // ha (h sound)
  'w': 'و',     // waw (w sound)
  'ū': 'و',     // waw with damma (long u)
  'u': '',     // short waw (contextual, often handled by diacritics)
  'y': 'ي',     // ya (y sound)
  'ī': 'ي',     // ya with kasra (long i)
  'i': '',     // short ya (contextual, often handled by diacritics)
  'iy': 'ي',    // ya with kasra (alternative long i)
  'e': '',    // ya with kasra (colloquial variant)
  
  // Persian/Turkish letters commonly used in maqam terminology
  'p': 'پ',     // pa (Persian p sound, used in Turkish/Persian maqam names)
  'ch': 'ج',    // che (Persian)
  'zh': 'ژ',    // zhe (Persian)
  'g': 'ك',     // gaf (Persian)

  // Long vowels and diphthongs
  'yy': 'ي',   // diphthong ay
  'ww': 'و',   // diphthong aw

  // Special combinations for maqam terminology
  'ūr': 'ور',   // common ending
  'ān': 'ان',   // common ending
  'īn': 'ين',   // common ending
  'āt': 'ات',   // plural ending
  'iyy': 'ي',   // ya with shadda (simplified)
  'uww': 'و',   // waw with shadda (simplified)
  
  // Additional LOC patterns
  'iyah': 'ية',  // common feminine ending
  'ūn': 'ون',    // masculine plural ending
  'īyah': 'ية',  // variant feminine ending
};

// Arabic diacritical marks (tashkeel) - handled separately to avoid conflicts
const ARABIC_DIACRITICS: Record<string, string> = {
  /* // Tanween (nunation) - when explicitly written in LOC
  'an': 'ً',     // fathatain (tanween fatha)
  'un': 'ٌ',     // dammatain (tanween damma)  
  'in': 'ٍ',     // kasratain (tanween kasra)
   */
  // Shadda (gemination) - doubled consonants in LOC
  'dd': 'دّ',     // shadda with dal
  'tt': 'تّ',     // shadda with ta
  'ss': 'سّ',     // shadda with sin
  'nn': 'نّ',     // shadda with nun
  'll': 'لّ',     // shadda with lam
  'mm': 'مّ',     // shadda with mim
  'rr': 'رّ',     // shadda with ra
  'bb': 'بّ',     // shadda with ba
  'kk': 'كّ',     // shadda with kaf
  'ff': 'فّ',     // shadda with fa
  'ḥḥ': 'حّ',     // shadda with ha
  'ṣṣ': 'صّ',     // shadda with sad
  
  // Common LOC patterns for Arabic music terminology
  'iyy': 'يّ',    // ya with shadda (as in rāstiyy)
  'uww': 'وّ',    // waw with shadda
  'zz': 'زّ',    // shadda with zay
  'shsh': 'شّ',    // shadda with shin
  
  // Al- (definite article) patterns
  'al-': 'ال',    // definite article
  
  // Special LOC vowel combinations
  'iya': 'يا',    // ya + alif
  'uwa': 'وا',    // waw + alif
};

// Common maqam terminology that should be handled specially
const MAQAM_SPECIAL_TERMS: Record<string, string> = {
  '/girkah': 'جركه',
  'athar': 'أثر',
  'ʾawj': 'أوج',
  'segāh': 'سيكاه',
  'nawā': 'نوى',
  'ʾārāʾ': 'آراء',
};

/**
 * Convert Library of Congress transliteration to Arabic script
 */
export function transliterateToArabic(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  let result = text.toLowerCase();
  
  // Handle special maqam terms (whole words) - MOST IMPORTANT for accuracy
  const specialTermKeys = Object.keys(MAQAM_SPECIAL_TERMS).sort((a, b) => b.length - a.length);
  for (const transliterated of specialTermKeys) {
    const arabic = MAQAM_SPECIAL_TERMS[transliterated];
    // Use more flexible matching that handles special characters like ā
    // Also handle cases where the term appears at the beginning or end of strings
    const regex = new RegExp(`(^|\\s|-)${transliterated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|-|$)`, 'gi');
    result = result.replace(regex, `$1${arabic}$2`);
  }
  
  // Handle Arabic diacritics and special patterns (longest patterns first)
  const diacriticKeys = Object.keys(ARABIC_DIACRITICS).sort((a, b) => b.length - a.length);
  for (const transliterated of diacriticKeys) {
    const arabic = ARABIC_DIACRITICS[transliterated];
    const regex = new RegExp(transliterated, 'g');
    result = result.replace(regex, arabic);
  }
  
  // Finally, handle character-by-character mapping (longest patterns first)
  const sortedKeys = Object.keys(LOC_TRANSLITERATION_MAP).sort((a, b) => b.length - a.length);
  for (const transliterated of sortedKeys) {
    const arabic = LOC_TRANSLITERATION_MAP[transliterated];
    const regex = new RegExp(transliterated, 'g');
    result = result.replace(regex, arabic);
  }
  
  // Clean up extra spaces and normalize
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Enhanced function that handles common maqam naming patterns
 */
export function convertMaqamNameToArabic(name: string): string {
  if (!name) return name;
  
  // Handle specific patterns common in maqam names
  let converted = transliterateToArabic(name);
  
  // Post-processing for better Arabic rendering
  converted = converted
    .replace(/ال(\w)/g, 'ال$1') // Handle definite article
    .replace(/\s+/g, ' ')      // Normalize spaces
    .trim();
  
  return converted;
}

/**
 * Convert note names with special handling for octave indicators
 */
export function convertNoteNameToArabic(name: string): string {
  if (!name) return name;
  
  // Handle compound note names with slashes
  if (name.includes('/')) {
    return name.split('/').map(part => transliterateToArabic(part.trim())).join('/');
  }
  
  return transliterateToArabic(name);
}

/**
 * Generic dynamic Arabic converter that detects type and applies appropriate conversion
 */
export function getDynamicArabicName(name: string, type: 'note' | 'jins' | 'maqam'): string {
  if (!name || typeof name !== 'string') return name;
  
  switch (type) {
    case 'note':
      return convertNoteNameToArabic(name);
    case 'jins':
      return convertMaqamNameToArabic(name);
    case 'maqam':
      return convertMaqamNameToArabic(name);
    default:
      return transliterateToArabic(name);
  }
}

/**
 * Batch convert an array of names
 */
export function convertNamesArrayToArabic(names: string[], type: 'note' | 'jins' | 'maqam'): string[] {
  return names.map(name => getDynamicArabicName(name, type));
}

/**
 * Validate if a string appears to be LOC transliteration
 */
export function isLOCTransliteration(text: string): boolean {
  if (!text) return false;
  
  // Check for characteristic LOC transliteration patterns
  const locPatterns = [
    /[ḥṣṭḍẓāīūʿʾ]/, // Characteristic diacritics
    /\b(maqām|jins|qarār|jawāb)\b/, // Common maqam terms
    /[āīū]/, // Long vowels
    /(gh|kh|sh|th|dh)/, // Digraphs
  ];
  
  return locPatterns.some(pattern => pattern.test(text));
}
