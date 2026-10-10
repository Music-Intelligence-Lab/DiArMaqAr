/**
 * Parses an English note name and extracts its components for analysis.
 *
 * This helper function breaks down note names like "Db+", "F#-", "C" into
 * their constituent parts to determine the intended reference pitch.
 *
 * @param englishName - The English note name to parse (e.g., "Db+", "F#", "C")
 * @returns Object containing baseNote, chromaticSemitones, mainAccidental, and isMicrotonal
 */
function parseEnglishNoteName(englishName: string): { baseNote: string; chromaticSemitones: number; mainAccidental: string; isMicrotonal: boolean } {
  // Extract the base note (A, B, C, D, E, F, G) - first character
  const baseNote = englishName.charAt(0).toUpperCase();

  // Map base notes to their chromatic positions relative to C
  // C=0, D=2, E=4, F=5, G=7, A=9, B=11 (whole and half step pattern)
  const baseNotePositions: { [key: string]: number } = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  const chromaticSemitones = baseNotePositions[baseNote];

  // Parse the main accidental and detect microtonal modifiers
  const accidentals = englishName.slice(1); // Everything after the base note
  let mainAccidental = "";
  let isMicrotonal = false;

  // Check for microtonal modifiers (+ or -)
  // Patterns like "-b", "+b", "-#", "+#" are microtonal
  // Patterns like "b", "#" are standard chromatic
  const hasMicrotonalModifier = /[+-]/.test(accidentals);
  
  if (accidentals.includes("b")) {
    mainAccidental = "b";
    // If there's a +/- modifier, it's microtonal
    isMicrotonal = hasMicrotonalModifier;
  } else if (accidentals.includes("#")) {
    mainAccidental = "#";
    // If there's a +/- modifier, it's microtonal
    isMicrotonal = hasMicrotonalModifier;
  } else if (hasMicrotonalModifier) {
    // Pure microtonal (e.g., "C+", "D-") - no sharp/flat, just microtonal adjustment
    mainAccidental = "";
    isMicrotonal = true;
  }

  return { baseNote, chromaticSemitones, mainAccidental, isMicrotonal };
}

/**
 * Calculates cents deviation with explicit reference note determination.
 *
 * This function calculates how much a pitch deviates from equal temperament
 * by determining the exact reference note based on the English note name, 
 * providing both the deviation value and the reference note name for clarity.
 *
 * @param currentMidiNumber - The current MIDI note number (can be fractional)
 * @param currentCents - The current cents value as a string
 * @param startingMidiNumber - The starting/reference MIDI note number
 * @param currentNoteName - Optional current note name for reference determination
 * @param startingNoteName - Optional starting note name (kept for API compatibility)
 * @returns Object with deviation value and reference note name
 */
export function calculateCentsDeviationWithReferenceNote(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
  currentNoteName?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startingNoteName?: string // kept for API compatibility
): { deviation: number; referenceNoteName: string } {
  // Parse the English note name to get the intended 12-EDO reference
  if (currentNoteName) {
    const { baseNote, chromaticSemitones } = parseEnglishNoteName(currentNoteName);

    // The reference key is the letter plus the sharps/flats written IMMEDIATELY
    // after it: Ab--, Eb+, F#-, C#, F## → chromatic (Ab, Eb, F#, C#, F##);
    // E-b, F+#, C, C+, D- → natural (E, F, C, C, D). The letter is never
    // simplified: Cb stays Cb, F## stays F##.
    const leadingAccidental = currentNoteName.slice(1).match(/^(##|bb|#|b)?/)![1] ?? "";
    const accidentalSemitones: { [accidental: string]: number } = { "##": 2, "#": 1, "": 0, b: -1, bb: -2 };
    const referenceNoteName = baseNote + leadingAccidental;
    // Semitones above the letter's C, not wrapped: Cb is -1 and B# is 12, so the
    // reference stays in the octave the English name's letter belongs to.
    const targetSemitone = chromaticSemitones + accidentalSemitones[leadingAccidental];

    // Extract octave from englishName to calculate reference MIDI note
    // This respects Arabic musicological logic where microtonal modifiers indicate
    // what the pitch is a variant OF, not mathematical proximity to 12-EDO semitones
    const octaveMatch = currentNoteName.match(/(\d+)$/);
    let referenceMidiNumber: number;

    if (octaveMatch) {
      // Use octave from the note name (e.g., "A2" → octave 2, "E-b3" → octave 3)
      const octave = parseInt(octaveMatch[1], 10);
      referenceMidiNumber = (octave + 1) * 12 + targetSemitone;
    } else {
      // No octave in the name: nearest MIDI note in the target slot
      const slot = ((targetSemitone % 12) + 12) % 12;
      const below = slot + 12 * Math.floor((currentMidiNumber - slot) / 12);
      referenceMidiNumber = currentMidiNumber - below <= 6 ? below : below + 12;
    }

    // Calculate deviation from the determined reference using frequency ratios
    const referenceFrequency = 440 * Math.pow(2, (referenceMidiNumber - 69) / 12);
    const currentFrequency = 440 * Math.pow(2, (currentMidiNumber - 69) / 12);
    const actualDeviation = 1200 * Math.log2(currentFrequency / referenceFrequency);

    return { deviation: actualDeviation, referenceNoteName };
  }

  // Fallback to MIDI-based calculation if no English note name provided
  const roundedCurrent = Math.round(currentMidiNumber);
  const semitone = roundedCurrent % 12; // Get semitone within octave
  const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const referenceNoteName = noteNamesSharp[semitone];
  
  // Calculate deviation from the rounded MIDI note
  const referenceFrequency = 440 * Math.pow(2, (roundedCurrent - 69) / 12);
  const currentFrequency = 440 * Math.pow(2, (currentMidiNumber - 69) / 12);
  const deviation = 1200 * Math.log2(currentFrequency / referenceFrequency);

  return { deviation, referenceNoteName };
}

/**
 * Swaps a reference note name to its enharmonic equivalent.
 * This is similar to swapEnharmonicSimple in noteNameMappings but
 * simplified for reference note names (which don't have octave numbers).
 *
 * @param name - The reference note name (e.g., "F#", "Gb", "C")
 * @returns The enharmonic equivalent, or null if no swap available
 */
export function swapEnharmonicForReference(name: string): string | null {
  const map: { [k: string]: string } = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
    "E#": "F",
    "B#": "C",
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",
    "Fb": "E",
    "Cb": "B",
  };

  return map[name] || null;
}

/**
 * Gets the next sequential reference note name when avoiding letter repetition.
 * When a reference note name would repeat the same letter as the previous one,
 * this function returns the next sequential note (e.g., E → F, B → C).
 * 
 * This ensures unique sequential ordering for reference note names while
 * preserving accidentals when possible.
 *
 * @param name - The reference note name (e.g., "E", "E#", "B", "Bb")
 * @returns The next sequential note name, or null if already at the end
 */
export function getNextSequentialReferenceNote(name: string): string | null {
  const match = name.match(/^([A-G])([#b]*)$/);
  if (!match) return null;
  
  const baseNote = match[1];
  const accidental = match[2];
  
  // Map notes to their next sequential note
  const nextNoteMap: { [key: string]: string } = {
    "A": "B",
    "B": "C",
    "C": "D",
    "D": "E",
    "E": "F",
    "F": "G",
    "G": "A",
  };
  
  const nextBase = nextNoteMap[baseNote];
  if (!nextBase) return null;
  
  // Preserve accidental if it makes sense
  // E# → F# (sharp preserved)
  // E → F (no accidental)
  // Bb → Cb (but Cb is enharmonic to B, so we might want C instead)
  // Actually, let's keep it simple: preserve the accidental
  return nextBase + accidental;
}

/**
 * Gets the previous sequential reference note name when avoiding letter repetition in descending sequences.
 * When a reference note name would repeat the same letter as the previous one in a descending sequence,
 * this function returns the previous sequential note (e.g., D → C, C → B).
 * 
 * This ensures unique sequential ordering for reference note names in descending sequences while
 * preserving accidentals when possible.
 *
 * @param name - The reference note name (e.g., "D", "D#", "C", "Cb")
 * @returns The previous sequential note name, or null if already at the beginning
 */
export function getPreviousSequentialReferenceNote(name: string): string | null {
  const match = name.match(/^([A-G])([#b]*)$/);
  if (!match) return null;
  
  const baseNote = match[1];
  const accidental = match[2];
  
  // Map notes to their previous sequential note (for descending sequences)
  const prevNoteMap: { [key: string]: string } = {
    "A": "G",
    "B": "A",
    "C": "B",
    "D": "C",
    "E": "D",
    "F": "E",
    "G": "F",
  };
  
  const prevBase = prevNoteMap[baseNote];
  if (!prevBase) return null;
  
  // Preserve accidental
  return prevBase + accidental;
}
