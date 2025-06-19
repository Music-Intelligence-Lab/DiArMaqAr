import { getCellIntervals } from "@/functions/transpose";
import Cell, { CellInterval } from "./Cell";
import { Jins } from "./Jins";
import NoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";

export default class MaqamDetails {
  private id: string;
  private name: string;
  private ascendingNoteNames: NoteName[];
  private descendingNoteNames: NoteName[];
  private suyūr: Sayr[];
  private commentsEnglish: string;
  private commentsArabic: string;
  private sourcePageReferences: SourcePageReference[];

  constructor(
    id: string,
    name: string,
    ascendingNoteNames: NoteName[],
    descendingNoteNames: NoteName[],
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

  getAscendingNoteNames(): NoteName[] {
    return this.ascendingNoteNames;
  }

  getDescendingNoteNames(): NoteName[] {
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


  getTahlil(allCells: Cell[]): Maqam {
    const ascendingCells = allCells.filter(cell => this.ascendingNoteNames.includes(cell.noteName));
    const ascendingCellIntervals: CellInterval[] = getCellIntervals(ascendingCells);
    const descendingCells = allCells.filter(cell => this.descendingNoteNames.includes(cell.noteName)).reverse();
    const descendingCellIntervals: CellInterval[] = getCellIntervals(descendingCells);
    return {
      maqamId: this.id,
      name: this.name,
      tahlil: true,
      ascendingCells,
      ascendingCellIntervals,
      descendingCells,
      descendingCellIntervals,
    };
  }
  
  createMaqamWithNewSuyūr(newSuyūr: Sayr[]): MaqamDetails {
    return new MaqamDetails(
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

  createMaqamWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): MaqamDetails {
    return new MaqamDetails(
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
  startingNote?: NoteName;
  direction?: "ascending" | "descending";
}

export interface Maqam {
  maqamId: string;
  name: string;
  tahlil: boolean;
  ascendingCells: Cell[];
  ascendingCellIntervals: CellInterval[];
  ascendingJinsTranspositions?: (Jins | null)[];
  descendingCells: Cell[];
  descendingCellIntervals: CellInterval[];
  descendingJinsTranspositions?: (Jins | null)[];
}

export interface MaqamModulations {
  hopsFromOne: Maqam[];
  hopsFromThree: Maqam[];
  hopsFromThree2p: Maqam[];
  hopsFromFour: Maqam[];
  hopsFromFive: Maqam[];
  hopsFromSix: Maqam[];
  noteName2p: string;
}