import TransliteratedNoteName from "./NoteName";

export default class TuningSystem {
  private id: string;
  private titleEnglish: string;
  private titleArabic: string;
  private year: string;
  private sourceEnglish: string;
  private sourceArabic: string;
  private creator: string;
  private commentsEnglish: string;
  private commentsArabic: string;
  private pitchClasses: string[];
  private transliteratedNoteNames: TransliteratedNoteName[];
  private stringLength: number;
  private referenceFrequency: number;

  constructor(
    id: string,
    titleEnglish: string,
    titleArabic: string,
    year: string,
    sourceEnglish: string,
    sourceArabic: string,
    creator: string,
    commentsEnglish: string,
    commentsArabic: string,
    notes: string[],
    transliteratedNoteNames: TransliteratedNoteName[],
    stringLength: number,
    referenceFrequency: number
  ) {
    this.id = id;
    this.titleEnglish = titleEnglish;
    this.titleArabic = titleArabic;
    this.year = year;
    this.sourceEnglish = sourceEnglish;
    this.sourceArabic = sourceArabic;
    this.creator = creator;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.pitchClasses = notes;
    this.transliteratedNoteNames = transliteratedNoteNames;
    this.stringLength = stringLength;
    this.referenceFrequency = referenceFrequency;
  }

  getId(): string {
    return this.id;
  }

  getTitleEnglish(): string {
    return this.titleEnglish;
  }

  getTitleArabic(): string {
    return this.titleArabic;
  }

  getYear(): string {
    return this.year;
  }

  getSourceEnglish(): string {
    return this.sourceEnglish;
  }

  getSourceArabic(): string {
    return this.sourceArabic;
  }

  getCreator(): string {
    return this.creator;
  }

  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  getCommentsArabic(): string {
    return this.commentsArabic;
  }

  getNotes(): string[] {
    return this.pitchClasses;
  }

  getNoteNames(): TransliteratedNoteName[] {
    return this.transliteratedNoteNames;
  }

  getStringLength(): number {
    return this.stringLength;
  }

  getReferenceFrequency(): number {
    return this.referenceFrequency;
  }
}
