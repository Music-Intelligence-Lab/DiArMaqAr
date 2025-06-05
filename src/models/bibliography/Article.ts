// article.ts

import { AbstractSource, Contributor } from "./AbstractSource";

export default class Article extends AbstractSource {
  private journalEnglish: string;
  private journalArabic: string;
  private volumeEnglish: string;
  private volumeArabic: string;
  private issueEnglish: string;
  private issueArabic: string;
  private pageRangeEnglish: string;
  private pageRangeArabic: string;
  private DOI: string;

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
    dateAccessed: string
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
      dateAccessed
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

  public getJournalEnglish(): string {
    return this.journalEnglish;
  }

  public getJournalArabic(): string {
    return this.journalArabic;
  }

  public getVolumeEnglish(): string {
    return this.volumeEnglish;
  }

  public getVolumeArabic(): string {
    return this.volumeArabic;
  }

  public getIssueEnglish(): string {
    return this.issueEnglish;
  }

  public getIssueArabic(): string {
    return this.issueArabic;
  }

  public getPageRangeEnglish(): string {
    return this.pageRangeEnglish;
  }

  public getPageRangeArabic(): string {
    return this.pageRangeArabic;
  }

  public getDOI(): string {
    return this.DOI;
  }

  /**
   * Include shared fields + all Article-specific fields.
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
      json.dateAccessed
    );
  }
}
