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
  private releaseDateEnglish: string;
  private releaseDateArabic: string;
  private originalReleaseDateEnglish: string;
  private originalReleaseDateArabic: string;
  private publisherEnglish: string;
  private publisherArabic: string;
  private locationEnglish: string;
  private locationArabic: string;
  private ISBN: string;
  private digitizedBookURL: string;
  private dateAccessed: string;

  constructor(
    id: string,
    titleEnglish: string,
    titleArabic: string,
    sourceType: SourceType,
    contributors: Contributor[],
    editionEnglish: string,
    editionArabic: string,
    releaseDateEnglish: string,
    releaseDateArabic: string,
    originalReleaseDateEnglish: string,
    originalReleaseDateArabic: string,
    publisherEnglish: string,
    publisherArabic: string,
    locationEnglish: string,
    locationArabic: string,
    ISBN: string,
    digitizedBookURL: string,
    dateAccessed: string
  ) {
    this.id = id;
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.sourceType = sourceType;
    this.contributors = contributors;
    this.editionEnglish = editionEnglish;
    this.editionArabic = editionArabic;
    this.releaseDateEnglish = releaseDateEnglish;
    this.releaseDateArabic = releaseDateArabic;
    this.originalReleaseDateEnglish = originalReleaseDateEnglish;
    this.originalReleaseDateArabic = originalReleaseDateArabic;
    this.publisherEnglish = publisherEnglish;
    this.publisherArabic = publisherArabic;
    this.locationEnglish = locationEnglish;
    this.locationArabic = locationArabic;
    this.ISBN = ISBN;
    this.digitizedBookURL = digitizedBookURL;
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
    return this.releaseDateEnglish;
  }

  public getReleaseDateArabic(): string {
    return this.releaseDateArabic;
  }

  public getOriginalReleaseDateEnglish(): string {
    return this.originalReleaseDateEnglish;
  }

  public getOriginalReleaseDateArabic(): string {
    return this.originalReleaseDateArabic;
  }

  public getPublisherEnglish(): string {
    return this.publisherEnglish;
  }

  public getPublisherArabic(): string {
    return this.publisherArabic;
  }

  public getLocationEnglish(): string {
    return this.locationEnglish;
  }

  public getLocationArabic(): string {
    return this.locationArabic;
  }

  public getISBN(): string {
    return this.ISBN;
  }

  public getDigitizedBookURL(): string {
    return this.digitizedBookURL;
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
      releaseDateEnglish: this.releaseDateEnglish,
      releaseDateArabic: this.releaseDateArabic,
      originalReleaseDateEnglish: this.originalReleaseDateEnglish,
      originalReleaseDateArabic: this.originalReleaseDateArabic,
      publisherEnglish: this.publisherEnglish,
      publisherArabic: this.publisherArabic,
      locationEnglish: this.locationEnglish,
      locationArabic: this.locationArabic,
      ISBN: this.ISBN,
      digitizedBookURL: this.digitizedBookURL,
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
      json.releaseDateEnglish,
      json.releaseDateArabic,
      json.originalReleaseDateEnglish,
      json.originalReleaseDateArabic,
      json.publisherEnglish,
      json.publisherArabic,
      json.locationEnglish,
      json.locationArabic,
      json.ISBN,
      json.digitizedBookURL,
      json.dateAccessed
    );
  }
}
