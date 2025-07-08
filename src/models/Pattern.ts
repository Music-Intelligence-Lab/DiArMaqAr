export default class Pattern {
  private id: string;
  private name: string;
  private notes: PatternNote[];

  constructor(id: string, name: string, notes: PatternNote[]) {
    this.id = id;
    this.name = name;
    this.notes = notes;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getNotes(): PatternNote[] {
    return this.notes;
  }

  convertToJSON() {
    return {
      id: this.id,
      name: this.name,
      notes: this.notes,
    };
  }
}

export interface PatternNote {
  scaleDegree: string;
  noteDuration: NoteDuration;
  isTarget: boolean;
  velocity?: number; // Optional velocity (0-127)
}

export const DURATION_OPTIONS: string[] = [
  "32n",
  "32d",
  "32t",
  "16n",
  "16d",
  "16t",
  "8n",
  "8d",
  "8t",
  "4n",
  "4d",
  "4t",
  "2n",
  "2d",
  "2t",
  "1n",
  "1d",
  "1t",
];

export type NoteDuration = (typeof DURATION_OPTIONS)[number];
export const SCALE_DEGREES: string[] = [
  "-I",
  "-II",
  "-III",
  "-IV",
  "-V",
  "-VI",
  "-VII",
  "R",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "+I",
  "+II",
  "+III",
  "+IV",
  "+V",
  "+VI",
  "+VII",
];

export function reversePatternNotes(notes: PatternNote[]): PatternNote[] {
  const reversedScaleDegrees = notes.map((note) => note.scaleDegree).reverse();
  return notes.map((note, index) => ({
    scaleDegree: reversedScaleDegrees[index],
    noteDuration: note.noteDuration,
    isTarget: note.isTarget,
    velocity: note.velocity,
  }));
}
