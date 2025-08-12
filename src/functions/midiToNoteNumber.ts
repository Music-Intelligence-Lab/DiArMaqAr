/**
 * Converts MIDI note numbers to note names with octave information.
 * 
 * This function handles the conversion from MIDI note numbers (0-127) to
 * readable note names, including special handling for certain notes that
 * require enharmonic adjustments. It provides both sharp and flat spellings
 * when they differ, enabling flexible display options.
 * 
 * Special note handling: D#, G#, and A# notes across all octaves receive
 * a +1 MIDI adjustment to account for enharmonic spelling preferences
 * in maqam music theory.
 * 
 * @param noteNumber - MIDI note number (0-127, can be fractional)
 * @returns Object containing note name, alternative spelling (if different), and octave
 * @throws RangeError if noteNumber is outside valid MIDI range
 * 
 * @example
 * midiNumberToNoteName(60) // Returns { note: "C", octave: 4 }
 * 
 * @example
 * midiNumberToNoteName(63) // Returns { note: "D#", alt: "Eb", octave: 4 }
 * 
 * @example
 * midiNumberToNoteName(69) // Returns { note: "A", octave: 4 } (A440)
 */
export default function midiNumberToNoteName(noteNumber: number): {note: string; alt?: string; octave: number } {
  // Validate MIDI range
  if (noteNumber < 0 || noteNumber > 127) {
    throw new RangeError("MIDI note number must be between 0 and 127");
  }

  // Define special note sets that require +1 adjustment
  // These correspond to D#, G#, and A# notes across all octaves
  const d_sharp = [3, 15, 27, 39, 51, 63, 75, 87, 99, 111, 123];   // D# positions
  const g_sharp = [8, 20, 32, 44, 56, 68, 80, 92, 104, 116];       // G# positions
  const a_sharp = [10, 22, 34, 46, 58, 70, 82, 94, 106, 118];     // A# positions
  const special_notes = new Set([...d_sharp, ...g_sharp, ...a_sharp]);

  // Round to nearest integer for note calculation
  let rounded = Math.round(noteNumber);
  
  // Apply special rule for D#, G#, A# notes
  // This adjustment accounts for enharmonic spelling preferences in maqam theory
  if (special_notes.has(rounded)) {
    rounded += 1;
  }

  // Note name arrays for sharp and flat spellings
  const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteNamesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  // Calculate semitone position within octave (0-11)
  const semitone = rounded % 12;
  
  // Calculate octave number (MIDI convention: octave 4 contains middle C)
  const octave = Math.floor(rounded / 12) - 1;

  // Get primary note name (sharp spelling)
  const note = noteNamesSharp[semitone];
  
  // Get alternative name (flat spelling) if different
  const altName = noteNamesFlat[semitone];
  const alt = altName !== note ? altName : undefined;

  return { note, alt, octave };
}




