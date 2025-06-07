import { SourcePageReference } from "./bibliography/Source";
import TransliteratedNoteName from "./NoteName";

export default class Jins {
  private id: string;
  private name: string;
  private noteNames: TransliteratedNoteName[];
  private commentsEnglish: string;
  private commentsArabic: string;
  private SourcePageReferences: SourcePageReference[];

  constructor(
    id: string,
    name: string,
    noteNames: string[],
    commentsEnglish: string,
    commentsArabic: string,
    SourcePageReferences: SourcePageReference[]
  ) {
    this.id = id;
    this.name = name;
    this.noteNames = noteNames;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
    this.SourcePageReferences = SourcePageReferences;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getNoteNames(): TransliteratedNoteName[] {
    return this.noteNames;
  }
  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }
  getCommentsArabic(): string {
    return this.commentsArabic;
  }
  getSourcePageReferences(): SourcePageReference[] {
    return this.SourcePageReferences;
  }

  createJinsWithNewSourcePageReferences(
    newSourcePageReferences: SourcePageReference[]
  ): Jins {
    return new Jins(
      this.id,
      this.name,
      this.noteNames,
      this.commentsEnglish,
      this.commentsArabic,
      newSourcePageReferences
    );
  }
}

export interface JinsTransposition {
  name: string;
  noteNames: TransliteratedNoteName[];
}