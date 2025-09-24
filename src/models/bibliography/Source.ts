/**
 * @fileoverview Union type definition for bibliographic sources and page reference interface.
 *
 * This module provides the core type definitions for the bibliography system,
 * including the Source union type that encompasses all possible bibliographic
 * source types (Books and Articles) and the SourcePageReference interface
 * for linking musical content to specific pages in sources.
 *
 * Used throughout the maqam network for academic citations and source attribution.
 */

import Book from "./Book";
import Article from "./Article";

/**
 * Union type representing all possible bibliographic source types.
 *
 * The Source type is a discriminated union that can be either a Book
 * or an Article. This allows the bibliography system to handle different
 * types of academic sources in a type-safe manner while providing
 * common interfaces through the AbstractSource base class.
 */
export type Source = Book | Article;

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
 */
export function stringifySource(source: Source, english: boolean, page: string | null): string {
  //here if we don't have a page reference, I assume we are creating a url parameter and therefor replace spaces with dashes
  if (source.getContributors().length === 0) return "";

  let resultString = "";

  resultString += english ? source.getContributors()[0].lastNameEnglish : source.getContributors()[0].lastNameArabic;

  resultString += " (" + (english ? source.getPublicationDateEnglish() : source.getPublicationDateArabic());

  if (page) resultString += ":" + page + ")";
  else resultString += ")";

  return page ? resultString : resultString.replaceAll(" ", "-");
}
