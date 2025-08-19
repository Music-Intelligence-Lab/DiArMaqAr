/**
 * @fileoverview Abstract base class and supporting types for bibliographic sources.
 *
 * This module provides the foundation for the bibliography system used throughout
 * the maqam network.
 */

/**
 * Enumeration of possible bibliographic source types.
 *
 * Used to categorize sources in the bibliography system and enable
 * type-specific processing and formatting.
 */
export type SourceType = "Book" | "Article";

/**
 * Enumeration of contributor roles in academic publications.
 *
 * Supports various roles found in Middle Eastern musicology publications,
 * including traditional Western academic roles and roles specific to
 * Arabic manuscript traditions.
 */
export type ContributorType = "Author" | "Editor" | "Translator" | "Reviewer" | "Investigator";

/**
 * Interface representing a contributor to a bibliographic source.
 *
 * Supports bilingual contributor information with separate fields for
 * English and Arabic names, accommodating the multilingual nature of
 * Middle Eastern musicology research.
 */
export interface Contributor {
  /** Role of the contributor in the publication */
  type: ContributorType;
  /** Contributor's first name in English */
  firstNameEnglish: string;
  /** Contributor's last name in English */
  lastNameEnglish: string;
  /** Contributor's first name in Arabic */
  firstNameArabic: string;
  /** Contributor's last name in Arabic */
  lastNameArabic: string;
}

/**
 * Abstract base class for all bibliographic sources in the maqam network.
 *
 * Provides common functionality for Books, Articles, and other academic sources
 * used in Middle Eastern musicology research. Implements bilingual metadata
 * support (English/Arabic) and standardized fields for academic citation.
 *
 * Uses the Template Method pattern - concrete subclasses override specific
 * behavior while inheriting common source management functionality.
 */
export abstract class AbstractSource {
  /** Unique identifier for the source */
  protected id: string;
  /** Source title in English */
  protected titleEnglish: string;
  /** Source title in Arabic */
  protected titleArabic: string;
  /** Type discriminator for union types */
  protected sourceType: SourceType; // discriminator
  /** List of contributors (authors, editors, etc.) */
  protected contributors: Contributor[];
  /** Edition information in English */
  protected editionEnglish: string;
  /** Edition information in Arabic */
  protected editionArabic: string;
  /** Publication date in English format */
  protected publicationDateEnglish: string;
  /** Publication date in Arabic format */
  protected publicationDateArabic: string;
  /** URL for online sources */
  protected url: string;
  /** Date when online source was accessed */
  protected dateAccessed: string;

  /**
   * Creates a new AbstractSource instance.
   *
   * Base constructor for all bibliographic sources, establishing common
   * fields required for academic citation and source management.
   *
   * @param id - Unique identifier for the source
   * @param titleEnglish - Source title in English
   * @param titleArabic - Source title in Arabic
   * @param sourceType - Type discriminator ("Book" or "Article")
   * @param contributors - Array of contributors (authors, editors, etc.)
   * @param editionEnglish - Edition information in English
   * @param editionArabic - Edition information in Arabic
   * @param publicationDateEnglish - Publication date in English format
   * @param publicationDateArabic - Publication date in Arabic format
   * @param url - URL for online sources (empty string if not applicable)
   * @param dateAccessed - Date when online source was accessed (empty string if not applicable)
   */
  constructor(
    id: string,
    titleEnglish: string,
    titleArabic: string,
    sourceType: SourceType,
    contributors: Contributor[],
    editionEnglish: string,
    editionArabic: string,
    publicationDateEnglish: string,
    publicationDateArabic: string,
    url: string,
    dateAccessed: string
  ) {
    this.id = id;
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.sourceType = sourceType;
    this.contributors = contributors;
    this.editionEnglish = editionEnglish;
    this.editionArabic = editionArabic;
    this.publicationDateEnglish = publicationDateEnglish;
    this.publicationDateArabic = publicationDateArabic;
    this.url = url;
    this.dateAccessed = dateAccessed;
  }

  /** @returns The unique identifier for this source */
  public getId(): string {
    return this.id;
  }

  /** @returns The source title in English */
  public getTitleEnglish(): string {
    return this.titleEnglish;
  }

  /** @returns The source title in Arabic */
  public getTitleArabic(): string {
    return this.titleArabic;
  }

  /** @returns The source type discriminator */
  public getSourceType(): SourceType {
    return this.sourceType;
  }

  /** @returns Array of contributors (authors, editors, translators, etc.) */
  public getContributors(): Contributor[] {
    return this.contributors;
  }

  /** @returns Edition information in English */
  public getEditionEnglish(): string {
    return this.editionEnglish;
  }

  /** @returns Edition information in Arabic */
  public getEditionArabic(): string {
    return this.editionArabic;
  }

  /** @returns Publication date in English format */
  public getPublicationDateEnglish(): string {
    return this.publicationDateEnglish;
  }

  /** @returns Publication date in Arabic format */
  public getPublicationDateArabic(): string {
    return this.publicationDateArabic;
  }

  /** @returns URL for online sources (empty if not applicable) */
  public getUrl(): string {
    return this.url;
  }

  /** @returns Date when online source was accessed (empty if not applicable) */
  public getDateAccessed(): string {
    return this.dateAccessed;
  }

  /**
   * Converts this source to a JSON-serializable object.
   *
   * Returns only the shared fields common to all source types. Subclasses
   * should override this method and spread in their additional fields.
   *
   * @returns Object containing all shared source fields for JSON serialization
   */
  public convertToJSON(): object {
    return {
      id: this.id,
      titleEnglish: this.titleEnglish,
      titleArabic: this.titleArabic,
      sourceType: this.sourceType,
      contributors: this.contributors,
      editionEnglish: this.editionEnglish,
      editionArabic: this.editionArabic,
      publicationDateEnglish: this.publicationDateEnglish,
      publicationDateArabic: this.publicationDateArabic,
      url: this.url,
      dateAccessed: this.dateAccessed,
    };
  }
}
