export type SourceType = "Book" | "Article";

export interface Contributor {
  type: ContributorType;
  firstNameEnglish: string;
  lastNameEnglish: string;
  firstNameArabic: string;
  lastNameArabic: string;
}

export type ContributorType = "Author" | "Editor" | "Translator" | "Reviewer" | "Investigator";

export default class Source {
  private id: string;
  private titleEnglish: string;
  private titleArabic: string;
  private sourceType: SourceType;
  private contributors: Contributor[];
  private editionEnglish: string;
  private editionArabic: string;
  private publicationDateEnglish: string;
  private publicationDateArabic: string;
  private originalPublicationDateEnglish: string;
  private originalPublicationDateArabic: string;
  private publisherEnglish: string;
  private publisherArabic: string;
  private placeEnglish: string;
  private placeArabic: string;
  private ISBN: string;
  private url: string;
  private dateAccessed: string;

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
    this.id = id;
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.sourceType = sourceType;
    this.contributors = contributors;
    this.editionEnglish = editionEnglish;
    this.editionArabic = editionArabic;
    this.publicationDateEnglish = publicationDateEnglish;
    this.publicationDateArabic = publicationDateArabic;
    this.originalPublicationDateEnglish = originalPublicationDateEnglish;
    this.originalPublicationDateArabic = originalPublicationDateArabic;
    this.publisherEnglish = publisherEnglish;
    this.publisherArabic = publisherArabic;
    this.placeEnglish = placeEnglish;
    this.placeArabic = placeArabic;
    this.ISBN = ISBN;
    this.url = url;
    this.dateAccessed = dateAccessed;
  }

  public getId(): string {
    return this.id;
  }

  public getTitleEnglish(): string {
    return this.titleEnglish;
  }

  public getTitleArabic(): string {
    return this.titleArabic;
  }

  public getSourceType(): SourceType {
    return this.sourceType;
  }

  public getContributors(): Contributor[] {
    return this.contributors;
  }

  public getEditionEnglish(): string {
    return this.editionEnglish;
  }

  public getEditionArabic(): string {
    return this.editionArabic;
  }

  public getReleaseDateEnglish(): string {
    return this.publicationDateEnglish;
  }

  public getReleaseDateArabic(): string {
    return this.publicationDateArabic;
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

  public getUrl(): string {
    return this.url;
  }

  public getDateAccessed(): string {
    return this.dateAccessed;
  }

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
      originalPublicationDateEnglish: this.originalPublicationDateEnglish,
      originalPublicationDateArabic: this.originalPublicationDateArabic,
      publisherEnglish: this.publisherEnglish,
      publisherArabic: this.publisherArabic,
      placeEnglish: this.placeEnglish,
      placeArabic: this.placeArabic,
      ISBN: this.ISBN,
      url: this.url,
      dateAccessed: this.dateAccessed
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fromJSON(json: any): Source {
    return new Source(
      json.id,
      json.titleEnglish,
      json.titleArabic,
      json.sourceType,
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
