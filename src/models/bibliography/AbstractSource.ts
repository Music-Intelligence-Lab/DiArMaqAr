export type SourceType = "Book" | "Article";

export type ContributorType = "Author" | "Editor" | "Translator" | "Reviewer" | "Investigator";

export interface Contributor {
  type: ContributorType;
  firstNameEnglish: string;
  lastNameEnglish: string;
  firstNameArabic: string;
  lastNameArabic: string;
}

export abstract class AbstractSource {
  protected id: string;
  protected titleEnglish: string;
  protected titleArabic: string;
  protected sourceType: SourceType; // discriminator
  protected contributors: Contributor[];
  protected editionEnglish: string;
  protected editionArabic: string;
  protected publicationDateEnglish: string;
  protected publicationDateArabic: string;
  protected url: string;
  protected dateAccessed: string;

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

  public getUrl(): string {
    return this.url;
  }

  public getDateAccessed(): string {
    return this.dateAccessed;
  }

  /**
   * Returns only the “shared” fields. Subclasses will override and spread in their own extras.
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
