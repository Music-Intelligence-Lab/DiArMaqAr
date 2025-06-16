export interface Cell {
  octave: number;
  index: number;
}

export interface CellDetails {
  noteName: string;
  fraction: string;
  cents: string;
  ratios: string;
  stringLength: string;
  fretDivision: string;
  frequency: string;
  midiNoteNumber: number;
  originalValue: string;
  originalValueType: string;
  englishName: string;
  abjadName: string;
  index: number;
  octave: number;
}