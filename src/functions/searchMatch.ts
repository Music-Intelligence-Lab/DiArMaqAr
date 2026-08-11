import normalizeForSort from "./normalizeForSort";

/**
 * The generic word every entry of a collection carries, which nobody types
 * when searching for one: "maqām rāst" is looked up as "rast", not "maqam
 * rast". Stripped from the front of a name before matching, in both the
 * transliteration and the Arabic.
 */
const ENTITY_PREFIX = /^(maqām|maqam|jins|مقام|جنس)\s+/i;

/**
 * Arabic marks a reader supplies from context and a searcher never types:
 * the ḥarakāt and sukūn/shadda (U+064B–U+0652), the maddah and the two
 * hamza marks (U+0653–U+0655), the superscript alef (U+0670), and tatweel
 * (U+0640), which is decoration rather than a letter.
 *
 * The hamza marks have to be listed here and not only in the letter folding
 * below: normalizeForSort runs NFD first, which splits أ into a bare alef
 * plus a combining hamza, so by the time this runs the precomposed letter is
 * gone and only the mark is left to remove. Without them a query typed without
 * the hamza failed to find the name that carries one.
 */
const ARABIC_DIACRITICS = /[\u064B-\u0655\u0670\u0640]/g;

/**
 * Orthographic variants of the same Arabic letter. A searcher types the bare
 * form — "احمد" for "أحمد" — so both sides fold to it before comparison.
 */
const ARABIC_LETTER_FOLDING: Array<[RegExp, string]> = [
  [/[\u0622\u0623\u0625\u0671]/g, "\u0627"], // aa, a-hamza-above, a-hamza-below, alef wasla -> alef
  [/\u0649/g, "\u064A"], // alef maqsura -> ya
  [/\u0629/g, "\u0647"], // ta marbuta -> ha
];

/**
 * Reduces a name or a query to what a searcher actually types: no
 * transliteration diacritics, no ʿayn or hamza modifiers, no Arabic ḥarakāt,
 * and one spelling per Arabic letter.
 *
 * Deliberately separate from normalizeForSort, which this builds on. That one
 * produces a collation key and must leave Arabic script alone — folding ة to
 * ه would put words in the wrong place in an index. Here the same folding is
 * what lets a search succeed.
 */
export function normalizeForSearch(text: string): string {
  let result = normalizeForSort(text.replace(ENTITY_PREFIX, ""));
  result = result.replace(ARABIC_DIACRITICS, "");
  for (const [pattern, replacement] of ARABIC_LETTER_FOLDING) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

/**
 * The definite article, which binds to the word it defines and so travels
 * inside it: "al-Ṣabbāgh", "al-Fārābī", "الصبّاغ". A searcher reaches for the
 * name itself and types "sabbagh" or "farabi", exactly as they type "rāst"
 * rather than "maqām rāst" — so a word carrying the article is offered for
 * matching both with it and without.
 */
const DEFINITE_ARTICLE = /^(al-|el-|ال)/;

/**
 * Every point in a name where a query is allowed to anchor: the start of each
 * word, plus the stem of any word carrying the definite article.
 */
function anchorsIn(name: string): string[] {
  const words = normalizeForSearch(name).split(/[\s()/,،]+/).filter(Boolean);
  const anchors: string[] = [];
  for (const word of words) {
    anchors.push(word);
    const stem = word.replace(DEFINITE_ARTICLE, "");
    if (stem && stem !== word) anchors.push(stem);
  }
  return anchors;
}

/**
 * Whether a name should show up for a typed query.
 *
 * The match is a prefix, never a substring — typing "ra" surfaces "rāst" but
 * never "ṣabā" — but it anchors at the start of ANY word, so a name is
 * reachable by its distinctive word rather than only its first: "kurd" finds
 * both "maqām kurd" and "maqām ḥijāz kār kurd".
 *
 * Parenthesised attributions are words too, so "jins nikrīz (al-Ṣabbāgh)" is
 * reachable by "sabbagh" as well as by "nikriz".
 *
 * @param query - Raw text from the search box.
 * @param names - The name in each form the entry is known by (transliteration
 *   and localized display name); matching any one of them is enough, so a
 *   search works the same in either interface language.
 */
export function matchesSearchQuery(query: string, ...names: string[]): boolean {
  const needle = normalizeForSearch(query);
  if (!needle) return true;

  return names.some((name) => anchorsIn(name).some((anchor) => anchor.startsWith(needle)));
}
