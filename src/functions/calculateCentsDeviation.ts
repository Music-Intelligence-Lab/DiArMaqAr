export default function calculateCentsDeviation(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
  currentNoteName?: string,
  startingNoteName?: string,
): number {

  // Special note sets that need adjustment
  const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123];
  const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116];
  const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118];
  const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);

  let roundedCurrent = Math.round(currentMidiNumber);
  let roundedStarting = Math.round(startingMidiNumber);

  // Adjust current note: only add +1 if it's displayed as sharp, not if displayed as flat
  if (currentNoteName) {
    const isFlat = currentNoteName.endsWith('b') && !currentNoteName.includes('-') && !currentNoteName.includes('+');
    if (special_notes.has(roundedCurrent) && !isFlat) {
      roundedCurrent += 1;
    }
  } else if (special_notes.has(roundedCurrent)) {
    // Default behavior when no note name provided
    roundedCurrent += 1;
  }

  // Adjust starting note: only add +1 if it's displayed as sharp, not if displayed as flat
  if (startingNoteName) {
    const isFlat = startingNoteName.endsWith('b') && !startingNoteName.includes('-') && !startingNoteName.includes('+');
    if (special_notes.has(roundedStarting) && !isFlat) {
      roundedStarting += 1;
    }
  } else if (special_notes.has(roundedStarting)) {
    // Default behavior when no note name provided
    roundedStarting += 1;
  }

  return parseFloat(currentCents) - (roundedCurrent - roundedStarting) * 100;
}

function parseEnglishNoteName(englishName: string): { baseNote: string; chromaticSemitones: number } {
  // Extract the base note (A, B, C, D, E, F, G)
  const baseNote = englishName.charAt(0).toUpperCase();
  
  // Map base notes to their chromatic positions (C = 0)
  const baseNotePositions: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  const chromaticSemitones = baseNotePositions[baseNote];
  
  return { baseNote, chromaticSemitones };
}

export function calculateCentsDeviationWithReferenceNote(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
  currentNoteName?: string,
  startingNoteName?: string,
): { deviation: number; referenceNoteName: string } {
  const deviation = calculateCentsDeviation(currentMidiNumber, currentCents, startingMidiNumber, currentNoteName, startingNoteName);
  
  // Parse the English note name to get the intended 12-EDO reference
  if (currentNoteName) {
    const { baseNote, chromaticSemitones } = parseEnglishNoteName(currentNoteName);
    
    // Calculate the actual 12-EDO reference frequency and cents
    const midiNoteNumber = Math.round(currentMidiNumber);
    const baseOctave = Math.floor(midiNoteNumber / 12) - 1;
    
    // Calculate the 12-EDO MIDI number for the base note in the same octave
    const referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones;
    
    // Calculate deviation from the intended base note (not the nearest chromatic semitone)
    const referenceFrequency = 440 * Math.pow(2, (referenceMidiNumber - 69) / 12);
    const currentFrequency = 440 * Math.pow(2, (currentMidiNumber - 69) / 12);
    
    // Calculate cents deviation from the base note
    const actualDeviation = 1200 * Math.log2(currentFrequency / referenceFrequency);
    
    // Use just the base note letter as the reference (no accidentals)
    const referenceNoteName = baseNote;
    
    return { deviation: actualDeviation, referenceNoteName };
  }
  
  // Fallback to MIDI-based calculation if no English note name
  const roundedCurrent = Math.round(currentMidiNumber);
  const semitone = roundedCurrent % 12;
  const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const referenceNoteName = noteNamesSharp[semitone];
  
  return { deviation, referenceNoteName };
}

