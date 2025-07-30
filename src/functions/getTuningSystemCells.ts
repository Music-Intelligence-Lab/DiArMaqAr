import TuningSystem from "@/models/TuningSystem";
import NoteName, {
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames,
} from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClassBaseValue, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { calculateCentsDeviationWithReferenceNote } from "@/functions/calculateCentsDeviation";
import PitchClass from "@/models/PitchClass";

export default function getTuningSystemCells(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  tuningSystemPitchClasses: string[] = [],
  inputStringLength: number = 0,
  inputReferenceFrequencies: { [noteName: string]: number } = {}
): PitchClass[] {
  const pitchArr = tuningSystemPitchClasses.length ? tuningSystemPitchClasses : tuningSystem.getPitchClasses();
  const nPC = pitchArr.length;
  const allSets = tuningSystem.getNoteNames();
  const noteNames = allSets.find((s) => s[0] === startingNote) ?? allSets[0] ?? [];

  const O1 = octaveOneNoteNames.length;
  const selectedIndices = noteNames.slice(0, nPC).map((nm) => {
    const i1 = octaveOneNoteNames.indexOf(nm as TransliteratedNoteNameOctaveOne);
    if (i1 >= 0) return i1;
    const i2 = octaveTwoNoteNames.indexOf(nm as TransliteratedNoteNameOctaveTwo);
    if (i2 >= 0) return O1 + i2;
    return -1;
  });
  while (selectedIndices.length < nPC) selectedIndices.push(-1);
  selectedIndices.length = nPC;

  const type = detectPitchClassType(pitchArr);
  if (type === "unknown") return [];

  const stringLength = inputStringLength > 0 ? inputStringLength : tuningSystem.getStringLength();
  const actualReferenceFrequency = inputReferenceFrequencies[startingNote] ?? tuningSystem.getReferenceFrequencies()[startingNote] ?? tuningSystem.getDefaultReferenceFrequency();
  const openConv = convertPitchClass(shiftPitchClassBaseValue(pitchArr[0], type, 1), type, stringLength, actualReferenceFrequency)!;
  const openLen = parseFloat(openConv.stringLength);

  const abjadArr = tuningSystem?.getAbjadNames();

  const pitchClasses: PitchClass[] = [];

  for (let octave = 0; octave < 4; octave++) {
    for (let idx = 0; idx < nPC; idx++) {
      const basePc = pitchArr[idx];
      const shifted = shiftPitchClassBaseValue(basePc, type, octave as 0 | 1 | 2 | 3);
      const conv = convertPitchClass(shifted, type, stringLength, actualReferenceFrequency);
      if (!conv) continue;

      // noteName
      const ci = selectedIndices[idx];
      let noteName = "none";
      if (ci >= 0) {
        if (ci < O1) {
          noteName = [octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames][octave][ci] ?? "none";
        } else {
          const loc = ci - O1;
          noteName = [octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames][octave][loc] ?? "none";
        }
      }

      // abjadName (only for octaves 1 & 2)
      let abjadName = "";
      const offset = octave <= 1 ? 0 : nPC;
      abjadName = abjadArr[offset + idx] || "";

      // fretDivision
      const thisLen = parseFloat(conv.stringLength);
      const fretDivision = (openLen - thisLen).toFixed(3);

      // midi
      const midiNoteNumber = frequencyToMidiNoteNumber(parseFloat(conv.frequency));

      // English note name and cents deviation
      const englishNoteName = getEnglishNoteName(noteName);

      pitchClasses.push({
        noteName,
        englishName: englishNoteName,
        fraction: conv.fraction,
        cents: conv.cents,
        decimalRatio: conv.decimal,
        stringLength: conv.stringLength,
        frequency: conv.frequency,
        originalValue: shifted,
        originalValueType: type,
        index: idx,
        octave,
        abjadName,
        fretDivision,
        midiNoteNumber,
        centsDeviation: 0,
      });
    }
  }

  const startingPitchClass = pitchClasses.find(pc => pc.index === 0 && pc.octave === 1);

  if (startingPitchClass) {
    const startingMidiNumber = startingPitchClass.midiNoteNumber;
    const startingNoteName = startingPitchClass.englishName;
    pitchClasses.forEach(pc => {
      const deviationResult = calculateCentsDeviationWithReferenceNote(
        pc.midiNoteNumber, 
        pc.cents, 
        startingMidiNumber,
        pc.englishName,
        startingNoteName
      );
      pc.centsDeviation = deviationResult.deviation;
      pc.referenceNoteName = deviationResult.referenceNoteName;
    });
  }

  return pitchClasses;
}
