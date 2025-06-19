import Cell from "@/models/Cell";

const emptyCell: Cell = {
  noteName: "",
  fraction: "",
  cents: "",
  decimalRatio: "",
  stringLength: "",
  frequency: "",
  englishName: "",
  originalValue: "",
  originalValueType: "",
  index: -1,
  octave: -1,
  abjadName: "",
  fretDivision: "",
  midiNoteNumber: 0,
};

export default function shiftCell(allCells: Cell[], cell: Cell, octaveShift: number) {
  const cellIndex = allCells.findIndex((c) => c.index === cell.index && c.octave === cell.octave);
  if (cellIndex === -1) return emptyCell;

  const numberOfPitchClasses = allCells.length / 4;

  const newIndex = cellIndex + octaveShift * numberOfPitchClasses;

  if (newIndex < 0 || newIndex >= allCells.length) return emptyCell;

  return { ...allCells[newIndex], octave: cell.octave + octaveShift };
}
