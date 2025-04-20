import TransliteratedNoteName from "./NoteName";

export default class Maqam {
  private id: string;
  private name: string;
  private ascendingNoteNames: TransliteratedNoteName[];
  private descendingNoteNames: TransliteratedNoteName[];
  private suyur: Seir[]

  constructor(id: string, name: string, ascendingNoteNames: TransliteratedNoteName[], descendingNoteNames: TransliteratedNoteName[], suyur: Seir[]) {
    this.id = id;
    this.name = name;
    this.ascendingNoteNames = ascendingNoteNames;
    this.descendingNoteNames = descendingNoteNames;
    this.suyur = suyur;
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

  getSuyur(): Seir[] {
    return this.suyur;
  }
}

export interface Seir {
  creatorEnglish: string,
  creatorArabic: string,
  sourceEnglish: string,
  sourceArabic: string,
  year: string,
  page: string,
  commentsEnglish: string,
  commentsArabic: string,
  stops: SeirStop[]
}

export interface SeirStop {
  type: "note" | "jins" | "direction"
  value: string
}