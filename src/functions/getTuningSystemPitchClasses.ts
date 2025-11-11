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
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import convertPitchClassValue, { shiftPitchClassBaseValue, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { calculateCentsDeviationWithReferenceNote, swapEnharmonicForReference, getNextSequentialReferenceNote } from "@/functions/calculateCentsDeviation";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import PitchClass from "@/models/PitchClass";

/**
 * 
 * Generates a complete array of PitchClass objects for a tuning system starting from a specific note.
 *
 * @remarks
 * This is the most important function in the system because it is a generative function that creates the pitch classes
 * that we work with throughout the application (view, select, play, highlight).
 * 
 * This is a core function that creates the fundamental pitch collection for analysis.
 * It takes a tuning system and starting note, then generates all pitch classes across
 * multiple octaves with their frequencies, MIDI numbers, cents deviations, and other
 * properties needed for maqam analysis.
 *
 * The function handles various pitch class formats (ratios, frequencies, cents) and
 * automatically detects the input type. It also manages reference frequencies and
 * octave relationships to create a comprehensive pitch space.
 *
 * @param tuningSystem - The tuning system to generate pitch classes for
 * @param startingNote - The note to start the tuning system from
 * @param tuningSystemPitchClasses - Optional custom pitch classes (default: from tuning system)
 * @param inputStringLength - Optional length parameter for custom input
 * @param inputReferenceFrequencies - Optional custom reference frequencies
 * @returns Complete array of PitchClass objects spanning multiple octaves
 */
export default function getTuningSystemPitchClasses(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  tuningSystemPitchClasses: string[] = [],
  inputStringLength: number = 0,
  inputReferenceFrequencies: { [noteName: string]: number } = {}
): PitchClass[] {
  const pitchArr = tuningSystemPitchClasses.length ? tuningSystemPitchClasses : tuningSystem.getOriginalPitchClassValues();
  const nPC = pitchArr.length;
  const allSets = tuningSystem.getNoteNameSets();
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

  const type = detectPitchClassValueType(pitchArr);
  if (type === "unknown") return [];

  const stringLength = inputStringLength > 0 ? inputStringLength : tuningSystem.getStringLength();
  const actualReferenceFrequency = inputReferenceFrequencies[startingNote] ?? tuningSystem.getReferenceFrequencies()[startingNote] ?? tuningSystem.getDefaultReferenceFrequency();
  const openConv = convertPitchClassValue(shiftPitchClassBaseValue(pitchArr[0], type, 1), type, stringLength, actualReferenceFrequency)!;
  const openLen = parseFloat(openConv.stringLength);

  const abjadArr = tuningSystem?.getAbjadNames();

  const pitchClasses: PitchClass[] = [];

  for (let octave = 0; octave < 4; octave++) {
    for (let idx = 0; idx < nPC; idx++) {
      const basePc = pitchArr[idx];
      const shifted = shiftPitchClassBaseValue(basePc, type, octave as 0 | 1 | 2 | 3);
      const conv = convertPitchClassValue(shifted, type, stringLength, actualReferenceFrequency);
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
      const midiNoteDecimal = frequencyToMidiNoteNumber(parseFloat(conv.frequency));

      // English note name and cents deviation
      const englishNoteName = getEnglishNoteName(noteName);

      pitchClasses.push({
        // Core identifiers (matching UI table order)
        noteName,
        abjadName,
        englishName: englishNoteName,

        // Position identifiers
        pitchClassIndex: idx,
        octave,

        // Primary value
        originalValue: shifted,
        originalValueType: type,

        // Interval measurements
        cents: conv.cents,
        centsDeviation: 0, // Will be calculated later
        fraction: conv.fraction,
        decimalRatio: conv.decimal,
        stringLength: conv.stringLength,
        fretDivision,

        // MIDI values
        midiNoteDecimal,

        // Frequency
        frequency: conv.frequency,
      });
    }
  }

  const startingPitchClass = pitchClasses.find((pc) => pc.pitchClassIndex === 0 && pc.octave === 1);

  if (startingPitchClass) {
    const startingMidiNumber = startingPitchClass.midiNoteDecimal;
    const startingNoteName = startingPitchClass.englishName;
    let prevReferenceNoteName: string | undefined = undefined;
    
    pitchClasses.forEach((pc) => {
      const deviationResult = calculateCentsDeviationWithReferenceNote(pc.midiNoteDecimal, pc.cents, startingMidiNumber, pc.englishName, startingNoteName);
      
      // Apply sequential logic to avoid repeating the same letter in reference note names.
      // Both englishName and referenceNoteName need unique sequential orders.
      // When the same letter would repeat, try to move to the next sequential note first,
      // then fall back to enharmonic swap if that's not possible.
      let referenceNoteName = deviationResult.referenceNoteName;
      let centsDeviation = deviationResult.deviation;
      
      if (prevReferenceNoteName) {
        const prevLetter = prevReferenceNoteName.charAt(0).toUpperCase();
        const currLetter = referenceNoteName.charAt(0).toUpperCase();
        
        if (prevLetter === currLetter) {
          // Try moving to the next sequential note (e.g., E → F, B → C)
          const nextSequential = getNextSequentialReferenceNote(referenceNoteName);
          if (nextSequential) {
            referenceNoteName = nextSequential;
          } else {
            // Fall back to enharmonic swap if next sequential is not available
          const swapped = swapEnharmonicForReference(referenceNoteName);
          if (swapped) {
            referenceNoteName = swapped;
            }
          }
          
          // Recalculate cents deviation based on the new reference note
          if (referenceNoteName !== deviationResult.referenceNoteName) {
            const tempPc = { ...pc, referenceNoteName };
            const newRefMidi = calculateIpnReferenceMidiNote(tempPc);
            const referenceFrequency = 440 * Math.pow(2, (newRefMidi - 69) / 12);
            const currentFrequency = 440 * Math.pow(2, (pc.midiNoteDecimal - 69) / 12);
            centsDeviation = 1200 * Math.log2(currentFrequency / referenceFrequency);
          }
        }
      }
      
      pc.referenceNoteName = referenceNoteName;
      pc.centsDeviation = centsDeviation;
      prevReferenceNoteName = referenceNoteName;

      // Calculate MIDI Note Deviation (formatted string for display/export)
      const referenceMidiNote = calculateIpnReferenceMidiNote(pc);
      const sign = pc.centsDeviation > 0 ? "+" : "";
      pc.midiNoteDeviation = `${referenceMidiNote} ${sign}${pc.centsDeviation.toFixed(1)}`;
    });
  }

  return pitchClasses;
}
