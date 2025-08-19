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
  // Hamza patterns (must come first - longest patterns first)
  āʾ: "اء", // hamza after long alif
  ʾā: "آ", // alif with madda
  ʾa: "أ", // hamza above alif (only actual hamza character)
  ʾi: "إ", // hamza below alif (only actual hamza character)
  ʾu: "أ", // hamza above alif with damma (only actual hamza character)
  ʾ: "ء", // standalone hamza (only actual hamza character)

  // Long vowels
  ā: "ا", // alif (long a)
  ī: "ي", // ya (long i)
  ū: "و", // waw (long u)

  // Consonants
  b: "ب", // ba
  t: "ت", // ta
  th: "ث", // tha
  j: "ج", // jim
  ḥ: "ح", // ha (emphatic)
  kh: "خ", // kha
  d: "د", // dal
  dh: "ذ", // dhal
  r: "ر", // ra
  z: "ز", // zay
  s: "س", // sin
  sh: "ش", // shin
  ṣ: "ص", // sad (emphatic)
  ḍ: "ض", // dad (emphatic)
  ṭ: "ط", // ta (emphatic)
  ẓ: "ظ", // za (emphatic)
  ʿ: "ع", // ayn
  gh: "غ", // ghayn
  f: "ف", // fa
  q: "ق", // qaf
  k: "ك", // kaf
  l: "ل", // lam
  m: "م", // mim
  n: "ن", // nun
  h: "ه", // ha
  w: "و", // waw
  y: "ي", // ya

  // Persian/Turkish letters and patterns
  p: "ب", // pa (Persian)
  ch: "ج", // che (Persian) - corrected
  zh: "ژ", // zhe (Persian)
  g: "ك", // gaf (Persian) - corrected

  // Persian/Ottoman syllable patterns (common in maqam names)
  ye: "ي", // Persian ye (as in yegāh → يگاه)
  se: "سي", // Persian se (as in segāh → سه‌گاه)
  kesh: "كِش", // Persian kesh (as in keshk → كشک)

  // Persian vowel handling
  e: "", // Persian e (often dropped in Arabic transliteration)

  // Short vowels (with tashkīل) -- handled contextually, not mapped directly

  // Doubled consonants (shadda)
  bb: "بّ",
  tt: "تّ",
  thth: "ثّ",
  jj: "جّ",
  ḥḥ: "حّ",
  khkh: "خّ",
  dd: "دّ",
  dhdh: "ذّ",
  rr: "رّ",
  zz: "زّ",
  ss: "سّ",
  shsh: "شّ",
  ṣṣ: "صّ",
  ḍḍ: "ضّ",
  ṭṭ: "طّ",
  ẓẓ: "ظّ",
  ʿʿ: "عّ",
  ghgh: "غّ",
  ff: "فّ",
  qq: "قّ",
  kk: "كّ",
  ll: "لّ",
  mm: "مّ",
  nn: "نّ",
  hh: "هّ",
  ww: "وّ",
  yy: "يّ",

  // Definite article
  "al-": "ال", // definite article

  // Taa marbuta patterns following LOC standards
  "ah\\b": "ة", // taa marbuta in pause/final position
  "at al-": "ة ال", // taa marbuta in construct state before definite article
  "at\\b": "ة", // taa marbuta in construct state (general)
};

// Dialect-specific terms that don't follow standard LOC
const MAQAM_SPECIAL_TERMS: Record<string, string> = {
  girkah: "جركه", // Egyptian dialect
  bestenegār: "بِستِنِكار", // Persian term for a specific maqam
  būselīk: "بوسِليك", // Persian term for a specific maqam
  zīrgūleh: "زيركولِه", // Persian term for a specific maqam
  nawā: "نوى", // alif baṭṭa
  maqām: "مقام", // without tashkīl
  jins: "جنس", // without tashkīl
  none: "دون تعريف", // placeholder for "none"
};

/**
 * Convert Library of Congress transliteration to Arabic script with full tashkīл
 */
// Update transliteration logic to ensure proper handling of definite articles and sun letters
function transliterateToArabic(text: string): string {
  if (!text || typeof text !== "string") return text;

  let result = text.toLowerCase();

  // Remove preprocessing: rely on LOC mapping and post-process to prevent tashkīl on first consonant after 'ال' when the vowel is part of a syllable

  // Handle dialect-specific terms first
  Object.keys(MAQAM_SPECIAL_TERMS).forEach((term) => {
    result = result.replace(new RegExp(term, "g"), MAQAM_SPECIAL_TERMS[term]);
  });

  // Apply LOC transliteration mapping (longest patterns first)
  Object.keys(LOC_TRANSLITERATION_MAP)
    .sort((a, b) => b.length - a.length)
    .forEach((key) => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      result = result.replace(regex, LOC_TRANSLITERATION_MAP[key]);
    });

  // Handle initial vowels (a, i, u) at the start of words – convert to hamza
  result = result.replace(/(\s|^)a(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1أ");
  result = result.replace(/(\s|^)i(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1إ");
  result = result.replace(/(\s|^)u(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1أ");

  // Handle initial vowels (a, i, u) at the start of words - convert to hamza
  result = result.replace(/(ال)a(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1أ");
  result = result.replace(/(ال)i(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1إ");
  result = result.replace(/(ال)u(?=[بتثجحخدذرزسشصضطظعغفقكلمنهوير])/g, "$1أ");

  // Apply tashkīl only if a, i, u are preceded by a consonant (including those with shadda) and followed by a word boundary, space, or non-letter
  // Fatha
  result = result.replace(/([بتثجحخدذرزسشصضطظعغفقكلمنهويّ])a(?=\b|\s|$|[^a-zāīūḥṣṭḍẓʿʾbtdjkhdrzssṣḍṭẓghfqklmnhwyوي])/g, "$1َ");
  // Kasra
  result = result.replace(/([بتثجحخدذرزسشصضطظعغفقكلمنهويّ])i(?=\b|\s|$|[^a-zāīūḥṣṭḍẓʿʾbtdjkhdrzssṣḍṭẓghfqklmnhwyوي])/g, "$1ِ");
  // Damma
  result = result.replace(/([بتثجحخدذرزسشصضطظعغفقكلمنهويّ])u(?=\b|\s|$|[^a-zāīūḥṣṭḍẓʿʾbtdjkhdrzssṣḍṭẓghfqklmnhwyوي])/g, "$1ُ");

  // Handle initial vowels that need hamza (LOC standard)
  result = result.replace(/(^|\s)([َُِ])([بتثجحخدذرزسشصضطظعغفقكلمنهويپژچگ])/g, "$1أ$3");

  // Prevent tashkīl from being added at the start of a word
  result = result.replace(/(^|\s)[َُِ]/g, "$1");

  // Handle definite articles with sun letters (add shadda)
  result = result.replace(/\bال([تثدذرزسشصضطظلن])/g, "ال$1ّ");

  // Handle definite articles with moon letters (no shadda)
  result = result.replace(/\bال([أإآبتجحخعغفقكلمنهوي])/g, "ال$1");

  // Remove tashkīل from first consonant after "ال" if it is immediately followed by a long vowel (ا, و, ي)
  result = result.replace(/(ال[بتثجحخدذرزسشصضطظعغفقكلمنهوي])َ([اوي])/g, "$1$2");
  result = result.replace(/(ال[بتثجحخدذرزسشصضطظعغفقكلمنهوي])ِ([اوي])/g, "$1$2");
  result = result.replace(/(ال[بتثجحخدذرزسشصضطظعغفقكلمنهوي])ُ([اوي])/g, "$1$2");

  // Normalize spaces and clean up
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

/**
 * Enhanced function that handles common maqam naming patterns
 */
function convertMaqamNameToArabic(name: string): string {
  if (!name) return name;

  // Handle specific patterns common in maqam names
  let converted = transliterateToArabic(name);

  // Post-processing for better Arabic rendering
  converted = converted
    .replace(/ال(\w)/g, "ال$1") // Handle definite article
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  return converted;
}

/**
 * Convert note names with special handling for octave indicators
 */
function convertNoteNameToArabic(name: string): string {
  if (!name) return name;

  // Handle compound note names with slashes
  if (name.includes("/")) {
    return name
      .split("/")
      .map((part) => transliterateToArabic(part.trim()))
      .join("/");
  }

  return transliterateToArabic(name);
}

/**
 * Generic dynamic Arabic converter that detects type and applies appropriate conversion
 */
export function getDynamicArabicName(name: string, type: "note" | "jins" | "maqam"): string {
  if (!name || typeof name !== "string") return name;

  switch (type) {
    case "note":
      return convertNoteNameToArabic(name);
    case "jins":
      return convertMaqamNameToArabic(name);
    case "maqam":
      return convertMaqamNameToArabic(name);
    default:
      return transliterateToArabic(name);
  }
}
