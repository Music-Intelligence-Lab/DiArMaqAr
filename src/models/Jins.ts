import { SourcePageReference } from "./bibliography/Source";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import NoteName from "./NoteName";

export default class JinsDetails {
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

  createJinsWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): JinsDetails {
    return new JinsDetails(this.id, this.name, this.noteNames, this.commentsEnglish, this.commentsArabic, newSourcePageReferences);
  }
}

export interface Jins {
  jinsId: string;
  name: string;
  transposition: boolean;
  jinsPitchClasses: PitchClass[];
  jinsPitchClassIntervals: PitchClassInterval[];
}
