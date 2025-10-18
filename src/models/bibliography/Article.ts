import { AbstractSource, Contributor } from "./AbstractSource";

/**
 * Represents a journal article source in the bibliography system.
 * 
 * This class extends AbstractSource to provide article-specific metadata including
 * journal information, volume and issue numbers, page ranges, and DOI identifiers.
 * All article-specific fields support bilingual English/Arabic content to accommodate
 * international Arabic music theory research published in various academic journals.
 * 
 * Articles are commonly used to reference research papers, scholarly studies,
 * theoretical analyses, and academic discourse related to Arabic music theory,
 * tuning systems, maqamat, and ajnas.
 */
export default class Article extends AbstractSource {
  /** Journal name in English */
  private journalEnglish: string;
  
  /** Journal name in Arabic */
  private journalArabic: string;
  
  /** Volume number in English */
  private volumeEnglish: string;
  
  /** Volume number in Arabic */
  private volumeArabic: string;
  
  /** Issue number in English */
  private issueEnglish: string;
  
  /** Issue number in Arabic */
  private issueArabic: string;
  
  /** Page range in English (e.g., "45-67") */
  private pageRangeEnglish: string;
  
  /** Page range in Arabic (e.g., "٤٥-٦٧") */
  private pageRangeArabic: string;
  
  /** Digital Object Identifier */
  private DOI: string;

  /**
   * Creates a new Article instance with comprehensive journal metadata.
   * 
   * @param id - Unique identifier for this article
   * @param titleEnglish - Article title in English
   * @param titleArabic - Article title in Arabic
   * @param contributors - Array of contributors (authors, editors, etc.)
   * @param editionEnglish - Edition information in English (usually empty for articles)
   * @param editionArabic - Edition information in Arabic (usually empty for articles)
   * @param publicationDateEnglish - Publication date in English
   * @param publicationDateArabic - Publication date in Arabic
   * @param journalEnglish - Journal name in English
   * @param journalArabic - Journal name in Arabic
   * @param volumeEnglish - Volume number in English
   * @param volumeArabic - Volume number in Arabic
   * @param issueEnglish - Issue number in English
   * @param issueArabic - Issue number in Arabic
   * @param pageRangeEnglish - Page range in English (e.g., "45-67")
   * @param pageRangeArabic - Page range in Arabic (e.g., "٤٥-٦٧")
   * @param DOI - Digital Object Identifier
   * @param url - URL for online access
   * @param dateAccessed - Date when the article was last accessed online
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
    journalEnglish: string,
    journalArabic: string,
    volumeEnglish: string,
    volumeArabic: string,
    issueEnglish: string,
    issueArabic: string,
    pageRangeEnglish: string,
    pageRangeArabic: string,
    DOI: string,
    url: string,
    dateAccessed: string,
    version?: string
  ) {
    super(
      id,
      titleEnglish,
      titleArabic,
      "Article", // discriminator
      contributors,
      editionEnglish,
      editionArabic,
      publicationDateEnglish,
      publicationDateArabic,
      url,
      dateAccessed,
      version
    );
    this.journalEnglish = journalEnglish;
    this.journalArabic = journalArabic;
    this.volumeEnglish = volumeEnglish;
    this.volumeArabic = volumeArabic;
    this.issueEnglish = issueEnglish;
    this.issueArabic = issueArabic;
    this.pageRangeEnglish = pageRangeEnglish;
    this.pageRangeArabic = pageRangeArabic;
    this.DOI = DOI;
  }

  /**
   * Gets the journal name in English.
   * 
   * @returns The English journal name
   */
  public getJournalEnglish(): string {
    return this.journalEnglish;
  }

  /**
   * Gets the journal name in Arabic.
   * 
   * @returns The Arabic journal name
   */
  public getJournalArabic(): string {
    return this.journalArabic;
  }

  /**
   * Gets the volume number in English.
   * 
   * @returns The English volume number
   */
  public getVolumeEnglish(): string {
    return this.volumeEnglish;
  }

  /**
   * Gets the volume number in Arabic.
   * 
   * @returns The Arabic volume number
   */
  public getVolumeArabic(): string {
    return this.volumeArabic;
  }

  /**
   * Gets the issue number in English.
   * 
   * @returns The English issue number
   */
  public getIssueEnglish(): string {
    return this.issueEnglish;
  }

  /**
   * Gets the issue number in Arabic.
   * 
   * @returns The Arabic issue number
   */
  public getIssueArabic(): string {
    return this.issueArabic;
  }

  /**
   * Gets the page range in English.
   * 
   * @returns The English page range (e.g., "45-67")
   */
  public getPageRangeEnglish(): string {
    return this.pageRangeEnglish;
  }

  /**
   * Gets the page range in Arabic.
   * 
   * @returns The Arabic page range (e.g., "٤٥-٦٧")
   */
  public getPageRangeArabic(): string {
    return this.pageRangeArabic;
  }

  /**
   * Gets the Digital Object Identifier.
   * 
   * @returns The DOI
   */
  public getDOI(): string {
    return this.DOI;
  }

  /**
   * Converts this article to a JSON-serializable object.
   * 
   * Includes all shared fields from AbstractSource plus article-specific
   * fields like journal, volume, issue, page range, and DOI.
   * 
   * @returns Object containing all article fields for JSON serialization
   */
  public convertToJSON(): object {
    return {
      ...super.convertToJSON(),
      journalEnglish: this.journalEnglish,
      journalArabic: this.journalArabic,
      volumeEnglish: this.volumeEnglish,
      volumeArabic: this.volumeArabic,
      issueEnglish: this.issueEnglish,
      issueArabic: this.issueArabic,
      pageRangeEnglish: this.pageRangeEnglish,
      pageRangeArabic: this.pageRangeArabic,
      DOI: this.DOI,
    };
  }

  /**
   * Creates an Article instance from a JSON object.
   * 
   * Static factory method for deserializing article data from JSON format,
   * useful for loading article bibliography data from files or APIs.
   * 
   * @param json - JSON object containing article data
   * @returns New Article instance created from the JSON data
   */
  public static fromJSON(json: any): Article {
    return new Article(
      json.id,
      json.titleEnglish,
      json.titleArabic,
      json.contributors,
      json.editionEnglish,
      json.editionArabic,
      json.publicationDateEnglish,
      json.publicationDateArabic,
      json.journalEnglish,
      json.journalArabic,
      json.volumeEnglish,
      json.volumeArabic,
      json.issueEnglish,
      json.issueArabic,
      json.pageRangeEnglish,
      json.pageRangeArabic,
      json.DOI,
      json.url,
      json.dateAccessed,
      json.version
    );
  }
}
