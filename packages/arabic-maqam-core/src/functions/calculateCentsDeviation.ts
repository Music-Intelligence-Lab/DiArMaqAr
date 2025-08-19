/**
 * Calculates the cents deviation between two MIDI note numbers, accounting for
 * special note adjustments and enharmonic spellings.
 *
 * This function is crucial for determining how much a pitch deviates from equal
 * temperament when analyzing microtonal scales and maqam tunings. It handles
 * special cases where certain MIDI numbers need adjustment based on their
 * enharmonic spelling.
 *
 * @param currentMidiNumber - The current MIDI note number (can be fractional)
 * @param currentCents - The current cents value as a string
 * @param startingMidiNumber - The starting/reference MIDI note number
 * @param currentNoteName - Optional current note name for sharp/flat detection
 * @param startingNoteName - Optional starting note name for sharp/flat detection
 * @returns The calculated cents deviation from equal temperament
 */
function calculateCentsDeviation(currentMidiNumber: number, currentCents: string, startingMidiNumber: number, currentNoteName?: string, startingNoteName?: string): number {
  // Special note sets that need +1 MIDI adjustment when displayed as sharp
  // These correspond to D#, G#, and A# across all octaves
  // The adjustment is needed because of enharmonic spelling conventions
  const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123]; // D# notes
  const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116]; // G# notes
  const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118]; // A# notes
  const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);

  // Round MIDI numbers to nearest integer for special note detection
  let roundedCurrent = Math.round(currentMidiNumber);
  let roundedStarting = Math.round(startingMidiNumber);

  // Adjust current note: only add +1 if it's displayed as sharp, not if displayed as flat
  // This handles enharmonic spelling where Eb vs D# affects the calculation
  if (currentNoteName) {
    // Check if note is spelled as flat (ends with 'b' but doesn't contain microtonal modifiers)
    const isFlat = currentNoteName.endsWith("b") && !currentNoteName.includes("-") && !currentNoteName.includes("+");
    if (special_notes.has(roundedCurrent) && !isFlat) {
      roundedCurrent += 1; // Apply +1 adjustment for sharp spelling
    }
  } else if (special_notes.has(roundedCurrent)) {
    // Default behavior when no note name provided - assume sharp spelling
    roundedCurrent += 1;
  }

  // Adjust starting note: apply same logic as current note
  if (startingNoteName) {
    const isFlat = startingNoteName.endsWith("b") && !startingNoteName.includes("-") && !startingNoteName.includes("+");
    if (special_notes.has(roundedStarting) && !isFlat) {
      roundedStarting += 1; // Apply +1 adjustment for sharp spelling
    }
  } else if (special_notes.has(roundedStarting)) {
    // Default behavior when no note name provided - assume sharp spelling
    roundedStarting += 1;
  }

  // Calculate final deviation: current cents minus equal temperament interval
  // Each semitone = 100 cents in equal temperament
  return parseFloat(currentCents) - (roundedCurrent - roundedStarting) * 100;
}

/**
 * Parses an English note name and extracts its components for analysis.
 *
 * This helper function breaks down note names like "Db+", "F#-", "C" into
 * their constituent parts to determine the intended reference pitch.
 *
 * @param englishName - The English note name to parse (e.g., "Db+", "F#", "C")
 * @returns Object containing baseNote, chromaticSemitones, and mainAccidental
 */
function parseEnglishNoteName(englishName: string): { baseNote: string; chromaticSemitones: number; mainAccidental: string } {
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

  // Parse the main accidental (first significant accidental, ignoring microtonal modifiers)
  const accidentals = englishName.slice(1); // Everything after the base note
  let mainAccidental = "";

  // Look for the main accidental (b or #) - ignore microtonal modifiers like -, +
  // Microtonal modifiers that start with - or + are not considered main accidentals
  if (accidentals.includes("b") && !accidentals.startsWith("-") && !accidentals.startsWith("+")) {
    mainAccidental = "b";
  } else if (accidentals.includes("#") && !accidentals.startsWith("-") && !accidentals.startsWith("+")) {
    mainAccidental = "#";
  }

  return { baseNote, chromaticSemitones, mainAccidental };
}

/**
 * Calculates cents deviation with explicit reference note determination.
 *
 * This function extends the basic cents deviation calculation by determining
 * the exact reference note based on the English note name, providing both
 * the deviation value and the reference note name for clarity.
 *
 * @param currentMidiNumber - The current MIDI note number (can be fractional)
 * @param currentCents - The current cents value as a string
 * @param startingMidiNumber - The starting/reference MIDI note number
 * @param currentNoteName - Optional current note name for reference determination
 * @param startingNoteName - Optional starting note name
 * @returns Object with deviation value and reference note name
 */
export function calculateCentsDeviationWithReferenceNote(
  currentMidiNumber: number,
  currentCents: string,
  startingMidiNumber: number,
  currentNoteName?: string,
  startingNoteName?: string
): { deviation: number; referenceNoteName: string } {
  // Get basic deviation using the main function
  const deviation = calculateCentsDeviation(currentMidiNumber, currentCents, startingMidiNumber, currentNoteName, startingNoteName);

  // Parse the English note name to get the intended 12-EDO reference
  if (currentNoteName) {
    const { baseNote, chromaticSemitones, mainAccidental } = parseEnglishNoteName(currentNoteName);

    // Calculate the octave from the MIDI note number
    const midiNoteNumber = Math.round(currentMidiNumber);
    const baseOctave = Math.floor(midiNoteNumber / 12) - 1; // MIDI octave calculation

    // Determine the reference note based on the main accidental
    let referenceMidiNumber: number;
    let referenceNoteName: string;

    if (mainAccidental === "b") {
      // Use flat version: Eb, Ab, Bb, etc.
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones - 1;
      referenceNoteName = getNoteName(baseNote, -1);
    } else if (mainAccidental === "#") {
      // Use sharp version: C#, D#, F#, etc.
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones + 1;
      referenceNoteName = getNoteName(baseNote, 1);
    } else {
      // Use natural version: C, D, E, F, G, A, B
      referenceMidiNumber = (baseOctave + 1) * 12 + chromaticSemitones;
      referenceNoteName = baseNote;
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

  return { deviation, referenceNoteName };
}

/**
 * Helper function to get note names with accidentals, handling enharmonic equivalents.
 *
 * This function generates the correct note name given a base note and an accidental
 * direction, taking into account enharmonic equivalents (e.g., E# = F, Cb = B).
 *
 * @param baseNote - The base note letter (A, B, C, D, E, F, G)
 * @param accidental - The accidental direction (-1 for flat, +1 for sharp, 0 for natural)
 * @returns The correct note name with appropriate accidental
 */
function getNoteName(baseNote: string, accidental: number): string {
  // Return natural note if no accidental
  if (accidental === 0) return baseNote;

  // Handle special cases where flat/sharp names result in enharmonic equivalents
  // This mapping ensures we use the most common enharmonic spelling
  const noteMap: { [key: string]: { flat: string; sharp: string } } = {
    C: { flat: "B", sharp: "C#" }, // Cb = B, C# = C#
    D: { flat: "Db", sharp: "D#" }, // Db = Db, D# = D#
    E: { flat: "Eb", sharp: "F" }, // Eb = Eb, E# = F
    F: { flat: "E", sharp: "F#" }, // Fb = E, F# = F#
    G: { flat: "Gb", sharp: "G#" }, // Gb = Gb, G# = G#
    A: { flat: "Ab", sharp: "A#" }, // Ab = Ab, A# = A#
    B: { flat: "Bb", sharp: "C" }, // Bb = Bb, B# = C
  };

  if (accidental < 0) {
    // Return the flat version (or enharmonic equivalent)
    return noteMap[baseNote]?.flat || `${baseNote}b`;
  } else {
    // Return the sharp version (or enharmonic equivalent)
    return noteMap[baseNote]?.sharp || `${baseNote}#`;
  }
}
