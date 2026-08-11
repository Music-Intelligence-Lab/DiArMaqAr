/**
 * @fileoverview Union type definition for bibliographic sources and page reference interface.
 *
 * This module provides the core type definitions for the bibliography system,
 * including the Source union type that encompasses all possible bibliographic
 * source types (Books, Articles, and Theses) and the SourcePageReference interface
 * for linking musical content to specific pages in sources.
 *
 * Used throughout the maqam network for academic citations and source attribution.
 */

import Book from "./Book";
import Article from "./Article";
import Thesis from "./Thesis";
import { standardizeText } from "@/functions/export";

/**
 * Union type representing all possible bibliographic source types.
 *
 * The Source type is a discriminated union that can be a Book,
 * an Article, or a Thesis. This allows the bibliography system to handle different
 * types of academic sources in a type-safe manner while providing
 * common interfaces through the AbstractSource base class.
 */
export type Source = Book | Article | Thesis;

/**
 * Interface for referencing specific pages within a bibliographic source.
 *
 * Used to create precise citations that link musical content (maqamat, ajnas,
 * tuning systems, etc.) to their specific locations within academic sources.
 * The page field supports various formats including single pages, page ranges,
 * and Arabic page numbering.
 */
export interface SourcePageReference {
  /** Unique identifier of the source being referenced */
  sourceId: string;
  /** Page number or range (supports various formats including Arabic) */
  page: string;
}

/**
 * Creates a standardized string representation of a bibliographic source.
 *
 * @param source - The source to stringify
 * @param english - Whether to use English or Arabic field values
 * @param page - Optional page reference to include in the citation
 * @returns Formatted citation string
 *
 * Format examples:
 * - Without page: "Author (2020)"
 * - With page: "Author (2020:45)"
 * - With original date: "Author (1950/2020:45)"
 *
 * The output is always human-readable. An absent page shortens the citation;
 * it never switches the format. The URL-safe slug lives in
 * {@link urlSafeSourceId} — the two used to share this function, and a source
 * reference saved with an empty page rendered as "abbas-(1986)" in the
 * attribution line.
 */
export function stringifySource(source: Source, english: boolean, page: string | null): string {
  if (source.getContributors().length === 0) return "";

  let resultString = "";

  resultString += english ? source.getContributors()[0].lastNameEnglish : source.getContributors()[0].lastNameArabic;

  resultString += " (";

  // Check if this is a Book with an original publication date
  if (source.getSourceType() === "Book") {
    const book = source as Book;
    // Fall back to English if Arabic is empty
    const originalDate = english
      ? book.getOriginalPublicationDateEnglish()
      : (book.getOriginalPublicationDateArabic() || book.getOriginalPublicationDateEnglish());

    if (originalDate) {
      // Extract year from original publication date
      const originalYearMatch = originalDate.match(/^\d{4}/);
      const originalYear = originalYearMatch ? originalYearMatch[0] : originalDate;
      resultString += originalYear + "/";
    }
  }

  // Add publication date
  // Fall back to English if Arabic is empty
  const pubDate = english
    ? source.getPublicationDateEnglish()
    : (source.getPublicationDateArabic() || source.getPublicationDateEnglish());
  const yearMatch = pubDate.match(/^\d{4}/);
  const year = yearMatch ? yearMatch[0] : pubDate;
  resultString += year;

  if (page) resultString += ":" + page + ")";
  else resultString += ")";

  return resultString;
}

/**
 * The text a source is filed under in an alphabetical picker: the first
 * contributor's last name, or the title when a source has no contributors.
 * Pass it through `compareNormalized` so that "ʿAbbās" files under A.
 */
export function sourceSortKey(source: Source): string {
  const contributors = source.getContributors();
  return contributors.length > 0 ? contributors[0].lastNameEnglish : source.getTitleEnglish();
}

/**
 * The legacy URL-safe form of a source's identity, e.g. "abbas-(1986)".
 *
 * Source ids are snake_case now ("abbas_1986"); this format survives only so
 * that sourceIds written before that change can still be matched back to their
 * source. It is an identifier, not a citation — never render it to a reader.
 */
export function urlSafeSourceId(source: Source, english: boolean = true): string {
  const citation = stringifySource(source, english, null);
  if (!citation) return "";
  return standardizeText(citation).replace(/_/g, "-");
}
