import TransliteratedNoteName from "./NoteName";
import { SourcePageReference } from "./Source";

export default class Maqam {
  private id: string;
  private name: string;
  private ascendingNoteNames: TransliteratedNoteName[];
  private descendingNoteNames: TransliteratedNoteName[];
  private suyūr: Sayr[]
  private sourcePageReferences: SourcePageReference[];

  constructor(id: string, name: string, ascendingNoteNames: TransliteratedNoteName[], descendingNoteNames: TransliteratedNoteName[], suyūr: Sayr[], sourcePageReferences: SourcePageReference[]) {
    this.id = id;
    this.name = name;
    this.ascendingNoteNames = ascendingNoteNames;
    this.descendingNoteNames = descendingNoteNames;
    this.suyūr = suyūr;
    this.sourcePageReferences = sourcePageReferences;
  }
  
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getAscendingNoteNames(): TransliteratedNoteName[] {
    return this.ascendingNoteNames;
  }

  getDescendingNoteNames(): TransliteratedNoteName[] {
    return this.descendingNoteNames;
  }

  getSuyūr(): Sayr[] {
    return this.suyūr;
  }

  getSourcePageReferences(): SourcePageReference[] {
    return this.sourcePageReferences;
  }

  isMaqamSymmetric(): boolean {
    if (this.ascendingNoteNames.length !== this.descendingNoteNames.length) {
      return false;
    }

    for (let i = 0; i < this.ascendingNoteNames.length; i++) {
      if (this.ascendingNoteNames[i] !== this.descendingNoteNames[this.descendingNoteNames.length - 1 - i]) {
        return false;
      }
    }

    return true;
  }
}

export interface Sayr {
  id: string,
  creatorEnglish: string,
  creatorArabic: string,
  sourceId: string,
  page: string,
  commentsEnglish: string,
  commentsArabic: string,
  stops: SayrStop[]
}

export interface SayrStop {
  type: "note" | "jins" | "direction"
  value: string
  startingNote?: TransliteratedNoteName
  direction?: "ascending" | "descending"
}