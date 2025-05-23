import { SourcePageReference } from './Source';
import TransliteratedNoteName from "./NoteName";

export default class Jins {
  private id: string;
  private name: string;
  private noteNames: TransliteratedNoteName[];
  private SourcePageReferences: SourcePageReference[];

  constructor(id: string, name: string, noteNames: string[], SourcePageReferences: SourcePageReference[]) {
    this.id = id;
    this.name = name;
    this.noteNames = noteNames;
    this.SourcePageReferences = SourcePageReferences;
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
  getSourcePageReferences(): SourcePageReference[] {
    return this.SourcePageReferences;
  }
}
