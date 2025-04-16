import TransliteratedNoteName from "./NoteName";

export default class Jins {
  private name: string;
  private noteNames: TransliteratedNoteName[];

  constructor(name: string, noteNames: string[]) {
    this.name = name;
    this.noteNames = noteNames;
  }

  getName(): string {
    return this.name;
  }

  getNoteNames(): TransliteratedNoteName[] {
    return this.noteNames;
  }
}
