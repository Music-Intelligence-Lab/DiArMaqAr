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

export interface Seir {
  id: string,
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
  startingNote?: TransliteratedNoteName
  direction?: "ascending" | "descending"
}