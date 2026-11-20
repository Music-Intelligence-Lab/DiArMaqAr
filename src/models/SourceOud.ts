import { SourcePageReference } from "./bibliography/Source";

/**
 * The ʿūd a historical source describes for a tuning system: its strings
 * (awtār), their open tuning, and the frets (dasātīn) tied across the neck.
 *
 * A tuning system stores pitches; a theorist such as al-Kindī, al-Fārābī or
 * Ibn Sīnā describes an instrument, and the pitches follow from it. Storing the
 * instrument as the source gives it lets the Awtār view show exactly that ʿūd —
 * each string with only its own frets, under their own names — so the archive's
 * values can be checked against the treatise rather than inferred from them.
 *
 * Ratios are always frequency ratios (e.g. "4/3"), whatever unit the tuning
 * system's values are entered in.
 */

/**
 * Who gives the strings or the frets. "source": the primary source's text
 * states them. "secondary": the secondary source's author supplies or reports
 * them (e.g. Farmer's tuning in fourths, which Ibn Sīnā's printed text does
 * not state).
 */
export type SourceOudAttribution = "source" | "secondary";

export interface SourceOudFret {
  /** Stable key, used by strings to list the frets they carry */
  id: string;
  /** Short display name, transliterated (e.g. "khinṣir") */
  nameEnglish: string;
  /** Short display name in Arabic (e.g. "الخنصر") */
  nameArabic: string;
  /** Frequency ratio above the open string (e.g. "4/3") */
  ratio: string;
  /** How the source places the fret, in English (the translation used) */
  constructionEnglish: string;
  /** How the source places the fret, in the source's own Arabic where it is printed */
  constructionArabic: string;
}

export interface SourceOudString {
  /** Stable key (e.g. "bamm") */
  id: string;
  /** Display name, transliterated (e.g. "bamm") */
  nameEnglish: string;
  /** Display name in Arabic (e.g. "البم") */
  nameArabic: string;
  /** Frequency ratio of the open string above the tuning system's 1/1 */
  openRatio: string;
  /** The frets this string carries, by id; lowest first. Absent means every fret. */
  frets?: string[];
}

export interface SourceOud {
  /** Strings lowest first */
  strings: SourceOudString[];
  /** Frets nearest the nut first */
  frets: SourceOudFret[];
  /**
   * Where the ʿūd is given: one list for the whole instrument, since its
   * strings and frets always come from the same source
   */
  pageReferences: SourcePageReference[];
  /** Who gives the strings' names and tuning: always one for all the strings */
  stringsAttribution: SourceOudAttribution;
  /** Who gives the frets' names and places: always one for all the frets */
  fretsAttribution: SourceOudAttribution;
  /** How the source's ʿūd is attested overall: what the text gives and what is supplied */
  noteEnglish: string;
  noteArabic: string;
}
