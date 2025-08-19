import { AbstractSource, Contributor } from "./AbstractSource";

/**
 * Represents a book source in the bibliography system.
 * 
 * This class extends AbstractSource to provide book-specific metadata including
 * publisher information, publication places, ISBN, and original publication dates
 * (useful for reprints and editions). All book-specific fields support bilingual
 * English/Arabic content to accommodate international Arabic music theory research.
 * 
 * Books are commonly used to reference theoretical treatises, historical manuscripts,
 * academic monographs, and reference works that document tuning systems, maqamat,
 * and ajnas in Arabic music theory.
 */
export default class Book extends AbstractSource {
  /** Original publication date in English (for reprints and editions) */
  private originalPublicationDateEnglish: string;
  
  /** Original publication date in Arabic (for reprints and editions) */
  private originalPublicationDateArabic: string;
  
  /** Publisher name in English */
  private publisherEnglish: string;
  
  /** Publisher name in Arabic */
  private publisherArabic: string;
  
  /** Publication place in English */
  private placeEnglish: string;
  
  /** Publication place in Arabic */
  private placeArabic: string;
  
  /** International Standard Book Number */
  private ISBN: string;

  /**
   * Creates a new Book instance with comprehensive bibliographic metadata.
   * 
   * @param id - Unique identifier for this book
   * @param titleEnglish - Book title in English
   * @param titleArabic - Book title in Arabic
   * @param contributors - Array of contributors (authors, editors, translators, etc.)
   * @param editionEnglish - Edition information in English
   * @param editionArabic - Edition information in Arabic
   * @param publicationDateEnglish - Publication date in English
   * @param publicationDateArabic - Publication date in Arabic
   * @param originalPublicationDateEnglish - Original publication date in English (for reprints)
   * @param originalPublicationDateArabic - Original publication date in Arabic (for reprints)
   * @param publisherEnglish - Publisher name in English
   * @param publisherArabic - Publisher name in Arabic
   * @param placeEnglish - Publication place in English
   * @param placeArabic - Publication place in Arabic
   * @param ISBN - International Standard Book Number
   * @param url - URL for online access
   * @param dateAccessed - Date when the book was last accessed online
   */
  constructor(
    id: string,
    titleEnglish: string,
    titleArabic: string,
    contributors: Contributor[],
    editionEnglish: string,
    editionArabic: string,
    publicationDateEnglish: string,
    publicationDateArabic: string,
    originalPublicationDateEnglish: string,
    originalPublicationDateArabic: string,
    publisherEnglish: string,
    publisherArabic: string,
    placeEnglish: string,
    placeArabic: string,
    ISBN: string,
    url: string,
    dateAccessed: string
  ) {
    super(
      id,
      titleEnglish,
      titleArabic,
      "Book", // discriminator
      contributors,
      editionEnglish,
      editionArabic,
      publicationDateEnglish,
      publicationDateArabic,
      url,
      dateAccessed
    );
    this.originalPublicationDateEnglish = originalPublicationDateEnglish;
    this.originalPublicationDateArabic = originalPublicationDateArabic;
    this.publisherEnglish = publisherEnglish;
    this.publisherArabic = publisherArabic;
    this.placeEnglish = placeEnglish;
    this.placeArabic = placeArabic;
    this.ISBN = ISBN;
  }

  /**
   * Gets the original publication date in English.
   * Useful for distinguishing between original composition dates and reprint dates.
   * 
   * @returns The original publication date in English
   */
  public getOriginalPublicationDateEnglish(): string {
    return this.originalPublicationDateEnglish;
  }

  /**
   * Gets the original publication date in Arabic.
   * Useful for distinguishing between original composition dates and reprint dates.
   * 
   * @returns The original publication date in Arabic
   */
  public getOriginalPublicationDateArabic(): string {
    return this.originalPublicationDateArabic;
  }

  /**
   * Gets the publisher name in English.
   * 
   * @returns The English publisher name
   */
  public getPublisherEnglish(): string {
    return this.publisherEnglish;
  }

  /**
   * Gets the publisher name in Arabic.
   * 
   * @returns The Arabic publisher name
   */
  public getPublisherArabic(): string {
    return this.publisherArabic;
  }

  /**
   * Gets the publication place in English.
   * 
   * @returns The English publication place
   */
  public getPlaceEnglish(): string {
    return this.placeEnglish;
  }

  /**
   * Gets the publication place in Arabic.
   * 
   * @returns The Arabic publication place
   */
  public getPlaceArabic(): string {
    return this.placeArabic;
  }

  /**
   * Gets the International Standard Book Number.
   * 
   * @returns The ISBN
   */
  public getISBN(): string {
    return this.ISBN;
  }

  /**
   * Converts this book to a JSON-serializable object.
   * 
   * Includes all shared fields from AbstractSource plus book-specific
   * fields like publisher, place, ISBN, and original publication dates.
   * 
   * @returns Object containing all book fields for JSON serialization
   */
  public convertToJSON(): object {
    return {
      ...super.convertToJSON(),
      originalPublicationDateEnglish: this.originalPublicationDateEnglish,
      originalPublicationDateArabic: this.originalPublicationDateArabic,
      publisherEnglish: this.publisherEnglish,
      publisherArabic: this.publisherArabic,
      placeEnglish: this.placeEnglish,
      placeArabic: this.placeArabic,
      ISBN: this.ISBN,
    };
  }

  /**
   * Creates a Book instance from a JSON object.
   * 
   * Static factory method for deserializing book data from JSON format,
   * useful for loading book bibliography data from files or APIs.
   * 
   * @param json - JSON object containing book data
   * @returns New Book instance created from the JSON data
   */
  public static fromJSON(json: any): Book {
    return new Book(
      json.id,
      json.titleEnglish,
      json.titleArabic,
      json.contributors,
      json.editionEnglish,
      json.editionArabic,
      json.publicationDateEnglish,
      json.publicationDateArabic,
      json.originalPublicationDateEnglish,
      json.originalPublicationDateArabic,
      json.publisherEnglish,
      json.publisherArabic,
      json.placeEnglish,
      json.placeArabic,
      json.ISBN,
      json.url,
      json.dateAccessed
    );
  }
}
