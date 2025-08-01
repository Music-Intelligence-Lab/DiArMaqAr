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

function parseEnglishNoteName(englishName: string): { baseNote: string; chromaticSemitones: number; mainAccidental: string } {
  // Extract the base note (A, B, C, D, E, F, G)
  const baseNote = englishName.charAt(0).toUpperCase();
  
  // Map base notes to their chromatic positions (C = 0)
  const baseNotePositions: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  
  const chromaticSemitones = baseNotePositions[baseNote];
  
  // Parse the main accidental (first significant accidental, ignoring microtonal modifiers)
  const accidentals = englishName.slice(1);
  let mainAccidental = '';
  
  // Look for the main accidental (b or #) - ignore microtonal modifiers like -, +
  if (accidentals.includes('b') && !accidentals.startsWith('-') && !accidentals.startsWith('+')) {
    mainAccidental = 'b';
  } else if (accidentals.includes('#') && !accidentals.startsWith('-') && !accidentals.startsWith('+')) {
    mainAccidental = '#';
  }
  
  return { baseNote, chromaticSemitones, mainAccidental };
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
    const { baseNote, chromaticSemitones, mainAccidental } = parseEnglishNoteName(currentNoteName);
    
    const midiNoteNumber = Math.round(currentMidiNumber);
    const baseOctave = Math.floor(midiNoteNumber / 12) - 1;
    
    // Determine the reference note based on the main accidental
    let referenceMidiNumber: number;
    let referenceNoteName: string;
    
    if (mainAccidental === 'b') {
      // Use flat version: Eb, Ab, Bb, etc.
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones - 1;
      referenceNoteName = getNoteName(baseNote, -1);
    } else if (mainAccidental === '#') {
      // Use sharp version: C#, D#, F#, etc.
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones + 1;
      referenceNoteName = getNoteName(baseNote, 1);
    } else {
      // Use natural version: C, D, E, F, G, A, B
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones;
      referenceNoteName = baseNote;
    }
    
    // Calculate deviation from the determined reference
    const referenceFrequency = 440 * Math.pow(2, (referenceMidiNumber - 69) / 12);
    const currentFrequency = 440 * Math.pow(2, (currentMidiNumber - 69) / 12);
    const actualDeviation = 1200 * Math.log2(currentFrequency / referenceFrequency);
    
    return { deviation: actualDeviation, referenceNoteName };
  }
  
  // Fallback to MIDI-based calculation if no English note name
  const roundedCurrent = Math.round(currentMidiNumber);
  const semitone = roundedCurrent % 12;
  const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const referenceNoteName = noteNamesSharp[semitone];
  
  return { deviation, referenceNoteName };
}

// Helper function to get note names with accidentals
function getNoteName(baseNote: string, accidental: number): string {
  if (accidental === 0) return baseNote;
  
  // Handle special cases where flat/sharp names might be enharmonic
  const noteMap: { [key: string]: { flat: string; sharp: string } } = {
    'C': { flat: 'B', sharp: 'C#' },
    'D': { flat: 'Db', sharp: 'D#' },
    'E': { flat: 'Eb', sharp: 'F' },
    'F': { flat: 'E', sharp: 'F#' },
    'G': { flat: 'Gb', sharp: 'G#' },
    'A': { flat: 'Ab', sharp: 'A#' },
    'B': { flat: 'Bb', sharp: 'C' }
  };
  
  if (accidental < 0) {
    return noteMap[baseNote]?.flat || `${baseNote}b`;
  } else {
    return noteMap[baseNote]?.sharp || `${baseNote}#`;
  }
}

