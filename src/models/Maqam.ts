import TransliteratedNoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";

export default class Maqam {
  private id: string;
  private name: string;
  private ascendingNoteNames: TransliteratedNoteName[];
  private descendingNoteNames: TransliteratedNoteName[];
  private suyūr: Sayr[];
  private commentsEnglish: string;
  private commentsArabic: string;
  private sourcePageReferences: SourcePageReference[];

  constructor(
    id: string,
    name: string,
    ascendingNoteNames: TransliteratedNoteName[],
    descendingNoteNames: TransliteratedNoteName[],
    suyūr: Sayr[],
    commentsEnglish: string,
    commentsArabic: string,
    sourcePageReferences: SourcePageReference[]
  ) {
    this.id = id;
    this.name = name;
    this.ascendingNoteNames = ascendingNoteNames;
    this.descendingNoteNames = descendingNoteNames;
    this.suyūr = suyūr;
    this.commentsEnglish = commentsEnglish;
    this.commentsArabic = commentsArabic;
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

  getCommentsEnglish(): string {
    return this.commentsEnglish;
  }

  getCommentsArabic(): string {
    return this.commentsArabic;
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


  convertToMaqamTransposition(): MaqamTransposition {
    return {
      name: this.name,
      ascendingNoteNames: this.ascendingNoteNames,
      descendingNoteNames: this.descendingNoteNames,
    };
  }
  
  createMaqamWithNewSuyūr(newSuyūr: Sayr[]): Maqam {
    return new Maqam(
      this.id,
      this.name,
      this.ascendingNoteNames,
      this.descendingNoteNames,
      newSuyūr,
      this.commentsEnglish,
      this.commentsArabic,
      this.sourcePageReferences
    );
  }

  createMaqamWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): Maqam {
    return new Maqam(
      this.id,
      this.name,
      this.ascendingNoteNames,
      this.descendingNoteNames,
      this.suyūr,
      this.commentsEnglish,
      this.commentsArabic,
      newSourcePageReferences
    );
  }
}

export interface Sayr {
  id: string;
  creatorEnglish: string;
  creatorArabic: string;
  sourceId: string;
  page: string;
  commentsEnglish: string;
  commentsArabic: string;
  stops: SayrStop[];
}

export interface SayrStop {
  type: "note" | "jins" | "direction";
  value: string;
  startingNote?: TransliteratedNoteName;
  direction?: "ascending" | "descending";
}

export interface MaqamTransposition {
  name: string;
  ascendingNoteNames: TransliteratedNoteName[];
  descendingNoteNames: TransliteratedNoteName[];
}

export interface MaqamModulations {
  hopsFromOne: MaqamTransposition[];
  hopsFromThree: MaqamTransposition[];
  hopsFromThree2p: MaqamTransposition[];
  hopsFromFour: MaqamTransposition[];
  hopsFromFive: MaqamTransposition[];
  hopsFromSix: MaqamTransposition[];
  noteName2p: string;
}