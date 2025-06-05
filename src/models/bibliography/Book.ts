// book.ts

import { AbstractSource, Contributor } from "./AbstractSource";

export default class Book extends AbstractSource {
  private originalPublicationDateEnglish: string;
  private originalPublicationDateArabic: string;
  private publisherEnglish: string;
  private publisherArabic: string;
  private placeEnglish: string;
  private placeArabic: string;
  private ISBN: string;

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

  public getOriginalReleaseDateEnglish(): string {
    return this.originalPublicationDateEnglish;
  }

  public getOriginalReleaseDateArabic(): string {
    return this.originalPublicationDateArabic;
  }

  public getPublisherEnglish(): string {
    return this.publisherEnglish;
  }

  public getPublisherArabic(): string {
    return this.publisherArabic;
  }

  public getPlaceEnglish(): string {
    return this.placeEnglish;
  }

  public getPlaceArabic(): string {
    return this.placeArabic;
  }

  public getISBN(): string {
    return this.ISBN;
  }

  /**
   * Include shared fields + all Book-specific fields.
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
