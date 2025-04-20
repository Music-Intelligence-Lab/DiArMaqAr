import TransliteratedNoteName from "./NoteName";

export default class Jins {
  private id: string;
  private name: string;
  private noteNames: TransliteratedNoteName[];

  constructor(id: string, name: string, noteNames: string[]) {
    this.id = id;
    this.name = name;
    this.noteNames = noteNames;
  }
  
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getNoteNames(): TransliteratedNoteName[] {
    return this.noteNames;
  }
}
