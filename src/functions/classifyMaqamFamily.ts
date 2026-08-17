import { Maqam } from "@/models/Maqam";
import MaqamData from "@/models/Maqam";
import { Jins } from "@/models/Jins";
import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";

/**
 * Classification method types for future extensibility
 */
export type MaqamFamilyClassificationMethod = "firstJins";

/**
 * Classification result for a maqam's family based on jins analysis
 */
export interface MaqamFamilyClassification {
  /** Classification method used */
  method: MaqamFamilyClassificationMethod;
  
  /** The base jins family name (e.g., "rast", "bayyāt", "nahāwand"). Returns "no jins" if no jins found. */
  familyName: string;
  
  /** Full jins name with transposition info (e.g., "Jins Rast al-rast"). Returns null if no jins found. */
  fullJinsName: string | null;
  
  /** The scale degree where this jins appears (typically "1" for first degree) */
  scaleDegree: string;
  
  /** Whether this came from ascending or descending ajnas analysis. Returns "none" if no jins found. */
  source: "ascending" | "descending" | "none";
}

/**
 * Reduces a full jins name to the name of its family.
 *
 * A jins keeps its whole name — only the "jins " prefix and a taṣwīr suffix come
 * off. Nothing is truncated to a first word: jins nawā athar belongs to the nawā
 * athar family, not the athar family, and jins rāḥat al-arwāḥ to rāḥat al-arwāḥ,
 * not rāḥat. Cutting a name short files a jins under a family it does not belong
 * to, and many of the archive's ajnās carry more than one word.
 *
 * The taṣwīr suffix is only stripped when what follows " al-" is an actual note
 * name, because three ajnās carry " al-" inside the name itself — rāḥat al-arwāḥ,
 * mazīj al-ṭīb and ashwāq al-kharīf. Matching on the last " al-" then handles a
 * transposed compound: "jins rāḥat al-arwāḥ al-nawā" loses only " al-nawā".
 *
 * @param jinsName - Full jins name (e.g., "jins rāst al-nawā")
 * @returns Family name (e.g., "rāst")
 *
 * @example
 * getBaseJinsName("jins rāst al-nawā")        // returns "rāst"
 * getBaseJinsName("jins nawā athar")          // returns "nawā athar"
 * getBaseJinsName("jins rāḥat al-arwāḥ")      // returns "rāḥat al-arwāḥ"
 * getBaseJinsName("jins ṣabā zamzam al-dūgāh") // returns "ṣabā zamzam"
 */
export function getBaseJinsName(jinsName: string): string {
  // Handle empty or invalid input
  if (!jinsName || !jinsName.trim()) {
    return 'no jins';
  }

  // Remove the "jins " or "جنس " prefix if present
  let baseName = jinsName.replace(/^(jins\s+|جنس\s+)/i, '').trim();

  // Strip a taṣwīr suffix, but only when what follows " al-" is a real note name.
  // Three ajnās carry " al-" inside the name itself (rāḥat al-arwāḥ, mazīj al-ṭīb,
  // ashwāq al-kharīf), so an unconditional cut would rename them. Taking the LAST
  // " al-" keeps a transposed compound intact: "rāḥat al-arwāḥ al-nawā" loses only
  // " al-nawā".
  const alIndex = baseName.lastIndexOf(' al-');
  if (alIndex !== -1) {
    const suffix = baseName.substring(alIndex + ' al-'.length).trim();
    if (getNoteNameIndexAndOctave(suffix as NoteName).index >= 0) {
      baseName = baseName.substring(0, alIndex).trim();
    }
  }

  // The source attribution stays. It is part of the entry's name, and two sources
  // reading a jins differently are two families here, not one: jins būselīk
  // (al-Shawwā) and jins būselīk (al-Ḥilū) each keep their own label.

  // Final safety check - return 'no jins' if we somehow got an empty result
  return baseName ? baseName : 'no jins';
}

/**
 * Reduces a maqām name onto the same axis as getBaseJinsName, so the two sides can
 * be compared for equality.
 *
 * Strips the "maqām " prefix, then hands the remainder to the identical reduction
 * the jins side gets — so "maqām rāḥat al-arwāḥ" and "jins rāḥat al-arwāḥ" both
 * land on "rāḥat al-arwāḥ" and match each other.
 */
function getBaseMaqamName(maqamName: string): string {
  if (!maqamName || !maqamName.trim()) return "no jins";
  const withoutPrefix = maqamName.replace(/^(Maqām\s+|Maqam\s+|مقام\s+)/i, "");
  return getBaseJinsName(withoutPrefix);
}

/**
 * Removes a trailing source attribution, for comparison only.
 *
 * Attributions are kept in the family label, but they must not decide whether a
 * maqām is named for a jins: the sources disagree about which entry a maqām is
 * named after, so maqām būselīk (ʿAbbās) is still named for jins būselīk even
 * when the matching jins entry is al-Ḥilū's reading.
 */
function withoutAttribution(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * Picks the jins on one degree whose name decides the maqām's family.
 *
 * A degree carries every jins matching there in suyūr-attested order, and that order
 * is the right one for display. It is not the right one for the family label: on
 * nawā athar and besendīdah the tonic carries both jins nikrīz and jins nawā athar
 * (the latter is the former's first four notes), and the suyūr rank nikrīz first —
 * which files maqām nawā athar under nikrīz. A maqām filed under a jins it is not
 * named for is a classification the archive cannot defend, so an eponymous match on
 * the degree wins and the suyūr-ordered head applies only when there is none.
 *
 * Base names are compared for EQUALITY, never by substring: maqām nawā athar must
 * match jins nawā athar and must not match a jins nawā. Where no eponymous jins
 * exists at all — besendīdah has no jins of its name — the head correctly stands.
 *
 * This narrows what the family label reads and nothing else; every other consumer
 * keeps the suyūr-ordered head.
 */
function pickFamilyJins(degree: Jins[] | undefined, maqamName: string): Jins | undefined {
  if (!degree || degree.length === 0) return undefined;
  const baseMaqamName = withoutAttribution(getBaseMaqamName(maqamName));
  return degree.find((jins) => withoutAttribution(getBaseJinsName(jins.name)) === baseMaqamName) ?? degree[0];
}

/**
 * Gets the first jins name for a maqam from its ajnas analysis.
 *
 * Checks ascending ajnas first (most common case), then descending ajnas
 * at the first scale degree. The descending ajnas array is in reverse order,
 * so the first scale degree jins is at the END of the array.
 * 
 * @param maqam - The maqam instance (tahlil) to analyze
 * @returns Full jins name or null if no jins found
 * 
 * @example
 * const tahlil = getMaqamTahlil(...);
 * const jinsName = getFirstJinsNameForMaqam(tahlil);
 * // Returns: "Jins Rast al-rast" or null
 */
export function getFirstJinsNameForMaqam(maqam: Maqam): string | null {
  // First, try to get jins from ascending ajnas (first scale degree)
  if (maqam.ascendingMaqamAjnas && maqam.ascendingMaqamAjnas.length > 0) {
    const firstAscendingJins = pickFamilyJins(maqam.ascendingMaqamAjnas[0], maqam.name);
    if (firstAscendingJins?.name) {
      return firstAscendingJins.name;
    }
  }

  // If no jins found in ascending, try descending ajnas
  // Descending ajnas are in reverse order, so the "first scale degree"
  // (which is the last note of the maqam) is at the END of the descending array
  if (maqam.descendingMaqamAjnas && maqam.descendingMaqamAjnas.length > 0) {
    const lastDescendingJins = pickFamilyJins(maqam.descendingMaqamAjnas[maqam.descendingMaqamAjnas.length - 1], maqam.name);
    if (lastDescendingJins?.name) {
      return lastDescendingJins.name;
    }
  }

  return null;
}

/**
 * Classifies a maqam into its family based on the jins at the first scale degree.
 * 
 * This implements the "firstJins" classification method, which groups maqamat
 * by the jins appearing at the first scale degree.
 * 
 * **Classification Priority:**
 * 1. Ascending ajnas at first degree (most common)
 * 2. Descending ajnas at first degree (fallback)
 * 3. "no jins" for maqamat with no identifiable jins
 * 
 * **Note:** This function should be called on the tahlil (original form, transposition: false)
 * to get accurate family classification. All transpositions inherit the same family.
 * 
 * @param maqam - The maqam instance to classify (should be tahlil, not transposition)
 * @returns Classification object with family name and metadata
 * 
 * @example
 * const tahlil = transpositions.find(t => !t.transposition);
 * const classification = classifyMaqamFamily(tahlil);
 * console.log(classification.method); // "firstJins"
 * console.log(classification.familyName); // "rast"
 * console.log(classification.source); // "ascending"
 */
export function classifyMaqamFamily(maqam: Maqam): MaqamFamilyClassification {
  // Get the first jins name
  const fullJinsName = getFirstJinsNameForMaqam(maqam);
  
  // If no jins found, return "no jins" classification
  if (!fullJinsName) {
    return {
      method: "firstJins",
      familyName: "no jins",
      fullJinsName: null,
      scaleDegree: "1",
      source: "none",
    };
  }

  // Extract base family name
  const baseFamilyName = getBaseJinsName(fullJinsName);

  // Determine source (ascending or descending)
  let source: "ascending" | "descending" = "ascending";
  if (maqam.ascendingMaqamAjnas && maqam.ascendingMaqamAjnas.length > 0) {
    // Same picker as getFirstJinsNameForMaqam, so the two cannot disagree about
    // which jins was chosen and mislabel the source.
    const firstAscendingJins = pickFamilyJins(maqam.ascendingMaqamAjnas[0], maqam.name);
    if (firstAscendingJins?.name !== fullJinsName) {
      source = "descending";
    }
  } else {
    source = "descending";
  }

  return {
    method: "firstJins",
    familyName: baseFamilyName,
    fullJinsName: fullJinsName,
    scaleDegree: "1",
    source: source,
  };
}

/**
 * Helper function to get first jins name for a MaqamData by looking up its tahlil
 * from a transpositions map.
 * 
 * This is a convenience wrapper for UI components that work with MaqamData and
 * have access to the TranspositionsContext.
 * 
 * @param maqamData - The MaqamData instance
 * @param transpositionsMap - Map of maqam ID to array of transpositions (from TranspositionsContext)
 * @returns Full jins name or null if no jins found
 * 
 * @example
 * const { allMaqamTranspositionsMap } = useTranspositionsContext();
 * const jinsName = getFirstJinsNameForMaqamData(maqamData, allMaqamTranspositionsMap);
 */
export function getFirstJinsNameForMaqamData(
  maqamData: MaqamData,
  transpositionsMap: Map<string, Maqam[]>
): string | null {
  const transpositions = transpositionsMap.get(maqamData.getId());
  if (!transpositions || transpositions.length === 0) return null;

  // Get the tahlil (original form, transposition: false) to get the first jins
  const tahlil = transpositions.find(t => !t.transposition);
  if (!tahlil) return null;

  return getFirstJinsNameForMaqam(tahlil);
}

/**
 * Helper function to classify a MaqamData by looking up its tahlil
 * from a transpositions map.
 * 
 * This is a convenience wrapper for UI components that work with MaqamData and
 * have access to the TranspositionsContext.
 * 
 * @param maqamData - The MaqamData instance
 * @param transpositionsMap - Map of maqam ID to array of transpositions (from TranspositionsContext)
 * @returns Classification object or null if no transpositions found
 * 
 * @example
 * const { allMaqamTranspositionsMap } = useTranspositionsContext();
 * const classification = classifyMaqamDataFamily(maqamData, allMaqamTranspositionsMap);
 */
export function classifyMaqamDataFamily(
  maqamData: MaqamData,
  transpositionsMap: Map<string, Maqam[]>
): MaqamFamilyClassification | null {
  const transpositions = transpositionsMap.get(maqamData.getId());
  if (!transpositions || transpositions.length === 0) return null;

  // Get the tahlil (original form, transposition: false)
  const tahlil = transpositions.find(t => !t.transposition);
  if (!tahlil) return null;

  return classifyMaqamFamily(tahlil);
}
