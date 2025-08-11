/**
 * Dynamic Arabic Script Converter
 * Converts Library of Congress Arabic transliteration to Arabic script
 * This approach is dynamic and works with any transliterated text following LOC standards
 */

// Library of Congress Arabic Romanization to Arabic Script Mapping
const LOC_TRANSLITERATION_MAP: Record<string, string> = {
  // Basic Arabic letters
  'ʾ': 'ء',     // hamza
  'ʾa': 'أ',     // hamza  
  'ʾَā': 'آ',     // hamza  
  'ā': 'ا',     // alif with madda
  'a': '',     // short alif (when not handled by diacritics)
  'b': 'ب',     // ba
  't': 'ت',     // ta
  'th': 'ث',    // tha
  'j': 'ج',     // jim
  'ḥ': 'ح',     // ha (emphatic)
  'kh': 'خ',    // kha
  'd': 'د',     // dal
  'dh': 'ذ',    // dhal
  'r': 'ر',     // ra
  'z': 'ز',     // zay
  's': 'س',     // sin
  'sh': 'ش',    // shin
  'ṣ': 'ص',     // sad (emphatic)
  'ḍ': 'ض',     // dad (emphatic)
  'ṭ': 'ط',     // ta (emphatic)
  'ẓ': 'ظ',     // za (emphatic)
  'ʿ': 'ع',     // ayn
  'gh': 'غ',    // ghayn
  'f': 'ف',     // fa
  'q': 'ق',     // qaf
  'k': 'ك',     // kaf
  'l': 'ل',     // lam
  'm': 'م',     // mim
  'n': 'ن',     // nun
  'h': 'ه',     // ha
  'w': 'و',     // waw
  'ū': 'و',     // waw with damma (long u)
  'u': '',     // short waw (when not handled by diacritics)
  'y': 'ي',     // ya
  'ī': 'ي',     // ya with kasra (long i)
  'i': '',     // short ya (when not handled by diacritics)
  'iy': 'ي',    // ya with kasra (variant)
  'e': '',    // ya with kasra (variant)
  
  // Persian/Turkish letters commonly used in maqam terminology
  'p': 'پ',     // pa (Persian)
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
  'nawā': 'نوى',
  'athar': 'أثر',
  'ʾawj': 'أوج',
  'segāh': 'سيكاه',
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
    const regex = new RegExp(`(^|\\s)${transliterated}(\\s|$)`, 'g');
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
