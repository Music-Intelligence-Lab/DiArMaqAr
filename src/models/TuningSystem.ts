import NoteName from "./NoteName";

export default class TuningSystem {
  private id: string;
  private title: string;
  private year: string;
  private source: string;
  private creator: string;
  private comments: string;
  private notes: string[];
  private noteNames: NoteName[];

  private stringLength: number;
  private referenceFrequency: number;

  constructor(
    id: string,
    title: string,
    year: string,
    source: string,
    creator: string,
    comments: string,
    notes: string[],
    noteNames: NoteName[],
    stringLength: number,
    referenceFrequency: number
  ) {
    this.id = id;
    this.title = title;
    this.year = year;
    this.source = source;
    this.creator = creator;
    this.comments = comments;
    this.notes = notes;
    this.noteNames = noteNames;
    this.stringLength = stringLength;
    this.referenceFrequency = referenceFrequency;
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getYear(): string {
    return this.year;
  }

  getSource(): string {
    return this.source;
  }

  getCreator(): string {
    return this.creator;
  }

  getComments(): string {
    return this.comments;
  }

  getNotes(): string[] {
    return this.notes;
  }

  getNoteNames(): NoteName[] {
    return this.noteNames;
  }

  getStringLength(): number {
    return this.stringLength;
  }

  getReferenceFrequency(): number {
    return this.referenceFrequency;
  }
}