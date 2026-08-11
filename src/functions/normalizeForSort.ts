/**
 * Builds a sort key that ignores the ornamentation transliterated Arabic
 * carries, so that "ʿAbbās" files under A and "al-Ḥilū" under its own initial
 * rather than ahead of every plain letter.
 *
 * Leading non-alphanumerics go first (ʿ, ʾ, quotes, brackets), then the
 * remaining diacritics and modifier letters are stripped from the whole
 * string. The result is only ever a comparison key — never displayed.
 *
 * Every alphabetical list of maqāmāt, ajnās and sources shares this key, so
 * they all order the same way.
 */
export default function normalizeForSort(str: string): string {
  return str
    .replace(/^[^\p{L}\p{N}]+/u, "") // drop leading special characters (ʿ, ʾ, quotes, brackets)
    .toLowerCase()
    .normalize("NFD") // decompose characters (e.g. é -> e + ́)
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritical marks
    .replace(/[\u02B0-\u02FF]/g, "") // remove modifier letters (including ʿ U+02BF and other modifiers)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compares two names with {@link normalizeForSort} applied, using the
 * collation settings the manager lists have always used.
 */
export function compareNormalized(a: string, b: string): number {
  return normalizeForSort(a).localeCompare(normalizeForSort(b), "en", {
    sensitivity: "base",
    numeric: true,
    ignorePunctuation: true,
  });
}
