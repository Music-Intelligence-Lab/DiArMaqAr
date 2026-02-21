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
    const { baseNote, chromaticSemitones, mainAccidental, isMicrotonal } = parseEnglishNoteName(currentNoteName);

    // Determine the reference note name based on the main accidental
    let referenceNoteName: string;
    let targetSemitone: number; // The semitone within an octave (0-11)

    // For microtonal notes (like E-b, F+#, Ab--), use the chromatic note as reference
    // The microtonal modifier describes deviation FROM that chromatic note (Eb, Ab, F#)
    if (isMicrotonal && mainAccidental) {
      // Microtonal with accidental (e.g., "E-b", "F+#", "Ab--")
      // Use chromatic note as reference - the pitch is a variant OF that note
      if (mainAccidental === "b") {
        referenceNoteName = getNoteName(baseNote, -1);
        targetSemitone = (chromaticSemitones - 1 + 12) % 12;
      } else {
        referenceNoteName = getNoteName(baseNote, 1);
        targetSemitone = (chromaticSemitones + 1) % 12;
      }
    } else if (mainAccidental === "b") {
      // Standard flat (non-microtonal): Eb, Ab, Bb, etc.
      referenceNoteName = getNoteName(baseNote, -1);
      // Flat is one semitone below the natural note
      targetSemitone = (chromaticSemitones - 1 + 12) % 12;
    } else if (mainAccidental === "#") {
      // Standard sharp (non-microtonal): C#, D#, F#, etc.
      referenceNoteName = getNoteName(baseNote, 1);
      // Sharp is one semitone above the natural note
      targetSemitone = (chromaticSemitones + 1) % 12;
    } else {
      // Natural note or pure microtonal (e.g., C, D, E or C+, D-)
      referenceNoteName = baseNote;
      targetSemitone = chromaticSemitones;
    }

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
      // Fallback: use octave from current MIDI number
      const currentOctave = Math.floor(currentMidiNumber / 12);
      referenceMidiNumber = currentOctave * 12 + targetSemitone;
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
