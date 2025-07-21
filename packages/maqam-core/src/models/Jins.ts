import { SourcePageReference } from "./bibliography/Source";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import NoteName from "./NoteName";
import { getPitchClassIntervals } from "../functions/transpose";

export interface JinsTemplateInterface {
  id: string;
  name: string;
  noteNames: NoteName[];
  commentsEnglish: string;
  commentsArabic: string;
  SourcePageReferences: SourcePageReference[];
  numberOfTranspositions?: number;
}

export default class JinsTemplate {
  private id: string;
  private name: string;
  private noteNames: NoteName[];
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

  getNoteNames(): NoteName[] {
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

  isJinsSelectable(allNoteNames: NoteName[]): boolean {
    return this.noteNames.every((noteName) => allNoteNames.some((allNoteName) => allNoteName === noteName));
  }

  createJinsWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): JinsTemplate {
    return new JinsTemplate(this.id, this.name, this.noteNames, this.commentsEnglish, this.commentsArabic, newSourcePageReferences);
  }

  getTahlil(allPitchClasses: PitchClass[]): Jins {
      const pitchClasses = allPitchClasses.filter((pitchClass) => this.noteNames.includes(pitchClass.noteName));
      const pitchClassIntervals: PitchClassInterval[] = getPitchClassIntervals(pitchClasses);
      return {
        jinsId: this.id,
        name: this.name,
        transposition: false,
        jinsPitchClasses: pitchClasses,
        jinsPitchClassIntervals: pitchClassIntervals,
      };
    }

  convertToObject(): JinsTemplateInterface {
    return {
      id: this.id,
      name: this.name,
      noteNames: this.noteNames,
      commentsEnglish: this.commentsEnglish,
      commentsArabic: this.commentsArabic,
      SourcePageReferences: this.SourcePageReferences,
    };
  }
}

export interface Jins {
  jinsId: string;
  name: string;
  transposition: boolean;
  jinsPitchClasses: PitchClass[];
  jinsPitchClassIntervals: PitchClassInterval[];
}

export interface AjnasModulations {
  modulationsOnOne: Jins[];
  modulationsOnThree: Jins[];
  modulationsOnThree2p: Jins[];
  modulationsOnFour: Jins[];
  modulationsOnFive: Jins[];
  modulationsOnSixAscending: Jins[];
  modulationsOnSixDescending: Jins[];
  modulationsOnSixNoThird: Jins[];
  noteName2p: string;
}
