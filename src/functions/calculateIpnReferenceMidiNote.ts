/**
 * Calculates the International Pitch Notation reference MIDI note for a microtonal pitch.
 *
 * **Purpose**: Given a microtonal pitch (like E-b3), finds the 12-EDO reference note
 * that the pitch is a musicological variant of.
 *
 * **Arabic Musicological Logic**:
 * This function respects Arabic musicological logic where microtonal modifiers indicate
 * what the pitch is a variant OF, not mathematical proximity to 12-EDO semitones.
 *
 * **Simple Logic**:
 * 1. Primary: Extract from englishName (e.g., "A2" → A, octave 2)
 * 2. Fallback: Parse referenceNoteName (e.g., "E-b3" → E, octave 3, ignore microtonal "-b")
 * 3. Last resort: Round midiNoteDecimal to nearest semitone
 *
 * **Example**:
 * - Input: { englishName: "A2", midiNoteDecimal: 45.0 }
 * - Base note: "A" (chromatic position 9)
 * - Octave: 2
 * - Reference: A2 = (2+1) * 12 + 9 = 45
 *
 * @param pitchClass - Pitch class object with englishName, referenceNoteName, and midiNoteDecimal
 * @returns The 12-EDO reference MIDI note number
 */
export function calculateIpnReferenceMidiNote(pitchClass: any): number {
  // Map note names to chromatic positions (C=0, C#=1, D=2, etc.)
  const noteToChroma: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  // Strategy 1: Extract from englishName (e.g., "A2", "Bb3", "C#4")
  // This is the primary source of truth for Arabic musicological logic
  const englishName = pitchClass.englishName;
  if (englishName) {
    // Match pattern: Base note (A-G), optional accidental (#/b), octave number
    const englishMatch = englishName.match(/^([A-G])(#|b)?(\d+)$/);
    if (englishMatch) {
      const baseNote = englishMatch[1];
      const accidental = englishMatch[2] || '';
      const octave = parseInt(englishMatch[3], 10);

      let chroma = noteToChroma[baseNote];
      if (accidental === '#') chroma += 1;
      if (accidental === 'b') chroma -= 1;
      chroma = ((chroma % 12) + 12) % 12; // normalize to 0-11

      // Calculate MIDI note: (octave + 1) * 12 + chroma
      // (octave + 1 because MIDI octave -1 starts at note 0)
      return (octave + 1) * 12 + chroma;
    }
  }

  // Strategy 2: Parse referenceNoteName (fallback for when englishName not available or doesn't match)
  // Extract base note, accidental, and octave, ignoring microtonal modifiers
  const referenceNoteName = pitchClass.referenceNoteName;
  if (referenceNoteName) {
    // Match pattern: Base note (A-G), optional accidental (#/b), optional microtonal modifier, optional octave
    // Examples: "E-b3" → E, no accidental, octave 3 | "C#3" → C, #, octave 3
    const baseNoteMatch = referenceNoteName.match(/^([A-G])(#|b)?[^0-9]*(\d+)?/);
    if (baseNoteMatch) {
      const baseNote = baseNoteMatch[1];
      const accidental = baseNoteMatch[2] || '';
      const octaveStr = baseNoteMatch[3];

      let chroma = noteToChroma[baseNote];
      if (accidental === '#') chroma += 1;
      if (accidental === 'b') chroma -= 1;
      chroma = ((chroma % 12) + 12) % 12; // normalize to 0-11

      // Determine the octave: use from note name if available, otherwise from midiNoteDecimal
      if (octaveStr !== undefined) {
        // Octave in note name (e.g., "E-b3" → octave 3)
        const octave = parseInt(octaveStr, 10);
        return (octave + 1) * 12 + chroma;
      } else {
        // Use octave from midiNoteDecimal
        const currentMidi = pitchClass.midiNoteDecimal;
        const currentOctave = Math.floor(currentMidi / 12);
        return currentOctave * 12 + chroma;
      }
    }
  }

  // Strategy 3: Last resort - round to nearest semitone
  return Math.round(pitchClass.midiNoteDecimal);
}
