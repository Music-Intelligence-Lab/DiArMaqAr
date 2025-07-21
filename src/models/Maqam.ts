import { getPitchClassIntervals } from "@/functions/transpose";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import { AjnasModulations, Jins } from "./Jins";
import NoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";

export interface MaqamTemplateInterface {
  id: string;
  name: string;
  ascendingNoteNames: NoteName[];
  descendingNoteNames: NoteName[];
  suyūr: Sayr[];
  commentsEnglish: string;
  commentsArabic: string;
  sourcePageReferences: SourcePageReference[];
  numberOfTranspositions?: number;
}

export default class MaqamTemplate {
  private id: string;
  private name: string;
  private ascendingNoteNames: NoteName[];
  private descendingNoteNames: NoteName[];
  private suyūr: Sayr[];
  private commentsEnglish: string;
  private commentsArabic: string;
  private sourcePageReferences: SourcePageReference[];
  ascendingPitchClasses: any;

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

  isMaqamSelectable(allNoteNames: NoteName[]): boolean {
    return (
      this.ascendingNoteNames.every((noteName) => allNoteNames.includes(noteName)) &&
      this.descendingNoteNames.every((noteName) => allNoteNames.includes(noteName))
    );
  }

  getTahlil(allPitchClasses: PitchClass[]): Maqam {
    const ascendingPitchClasses = allPitchClasses.filter((pitchClass) => this.ascendingNoteNames.includes(pitchClass.noteName));
    const ascendingPitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(ascendingPitchClasses);
    const descendingPitchClasses = allPitchClasses.filter((pitchClass) => this.descendingNoteNames.includes(pitchClass.noteName)).reverse();
    const descendingPitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(descendingPitchClasses);
    return {
      maqamId: this.id,
      name: this.name,
      transposition: false,
      ascendingPitchClasses: ascendingPitchClasses,
      ascendingPitchClassIntervals: ascendingPitchClassIntervals,
      descendingPitchClasses: descendingPitchClasses,
      descendingPitchClassIntervals: descendingPitchClassIntervals,
    };
  }

  createMaqamWithNewSuyūr(newSuyūr: Sayr[]): MaqamTemplate {
    return new MaqamTemplate(
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

  createMaqamWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): MaqamTemplate {
    return new MaqamTemplate(
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

  convertToObject(): MaqamTemplateInterface {
    return {
      id: this.id,
      name: this.name,
      ascendingNoteNames: this.ascendingNoteNames,
      descendingNoteNames: this.descendingNoteNames,
      suyūr: this.suyūr,
      commentsEnglish: this.commentsEnglish,
      commentsArabic: this.commentsArabic,
      sourcePageReferences: this.sourcePageReferences,
    };
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
  type: "note" | "jins" | "maqam" | "direction";
  value: string;
  startingNote?: NoteName;
  direction?: "ascending" | "descending";
}

export interface Maqam {
  maqamId: string;
  name: string;
  transposition: boolean;
  ascendingPitchClasses: PitchClass[];
  ascendingPitchClassIntervals: PitchClassInterval[];
  ascendingMaqamAjnas?: (Jins | null)[];
  descendingPitchClasses: PitchClass[];
  descendingPitchClassIntervals: PitchClassInterval[];
  descendingMaqamAjnas?: (Jins | null)[];
  modulations?: MaqamatModulations | AjnasModulations;
  numberOfHops?: number;
}

export interface MaqamatModulations {
  modulationsOnOne: Maqam[];
  modulationsOnThree: Maqam[];
  modulationsOnThree2p: Maqam[];
  modulationsOnFour: Maqam[];
  modulationsOnFive: Maqam[];
  modulationsOnSixAscending: Maqam[];
  modulationsOnSixDescending: Maqam[];
  modulationsOnSixNoThird: Maqam[];
  noteName2p: string;
}
