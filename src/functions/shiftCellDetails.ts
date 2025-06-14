import { octaveFourNoteNames, octaveOneNoteNames, octaveThreeNoteNames, octaveTwoNoteNames, octaveZeroNoteNames } from "@/models/NoteName";
import { getEnglishNoteName } from "./noteNameMappings";
import { shiftPitchClass } from "./convertPitchClass";
import { CellDetails } from "@/models/Cell";


export default function shiftCellDetails(cellDetails: CellDetails): CellDetails {
  const newOctave = cellDetails.octave + 1;
  if (newOctave > 3) return cellDetails;

  const { noteName, fraction, cents, ratios, stringLength, frequency, originalValue, originalValueType } = cellDetails;
  const newOriginalValue = shiftPitchClass(
    originalValue,
    originalValueType as "fraction" | "cents" | "decimal" | "stringLength",
    newOctave as 0 | 1 | 2 | 3
  );
  const newFraction = shiftPitchClass(fraction, "fraction", newOctave as 0 | 1 | 2 | 3);
  const newCents = shiftPitchClass(cents, "cents", newOctave as 0 | 1 | 2 | 3);
  const newRatios = shiftPitchClass(ratios, "decimal", newOctave as 0 | 1 | 2 | 3);
  const newStringLength = shiftPitchClass(stringLength, "stringLength", newOctave as 0 | 1 | 2 | 3);
  const newFrequency = parseFloat(frequency as string) * 2;
  let newNoteName = "";

  if (octaveZeroNoteNames.includes(noteName)) {
    const newIndex = octaveZeroNoteNames.indexOf(noteName);
    newNoteName = octaveOneNoteNames[newIndex] || "";
  } else if (octaveOneNoteNames.includes(noteName)) {
    const newIndex = octaveOneNoteNames.indexOf(noteName);
    newNoteName = octaveTwoNoteNames[newIndex] || "";
  } else if (octaveTwoNoteNames.includes(noteName)) {
    const newIndex = octaveTwoNoteNames.indexOf(noteName);
    newNoteName = octaveThreeNoteNames[newIndex] || "";
  } else if (octaveThreeNoteNames.includes(noteName)) {
    const newIndex = octaveThreeNoteNames.indexOf(noteName);
    newNoteName = octaveFourNoteNames[newIndex] || "";
  }

  return {
    noteName: newNoteName,
    englishName: getEnglishNoteName(newNoteName),
    fraction: newFraction,
    cents: newCents,
    ratios: newRatios,
    stringLength: newStringLength,
    frequency: newFrequency.toFixed(2),
    originalValue: newOriginalValue,
    originalValueType,
    octave: newOctave,
    index: cellDetails.index,
  };
}
