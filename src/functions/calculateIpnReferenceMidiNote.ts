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
 * **Logic**:
 * 1. Slot: the 12-EDO slot comes from referenceNoteName when present, else from
 *    englishName — the letter plus a # or b only when it follows the letter
 *    immediately ("Ab--3" → Ab, "E-b3" → E)
 * 2. Octave: anchored on englishName's natural letter and octave number, so
 *    "B#2" resolves to C3 (48) and "Cb4" to B3 (59)
 * 3. Last resort: round midiNoteDecimal to the nearest semitone
 *
 * **Example**:
 * - Input: { englishName: "Bb--3", referenceNoteName: "Bb", midiNoteDecimal: 57.9 }
 * - Slot: Bb (10); anchor: B3 = 59
 * - Reference: nearest Bb to 59 = 58
 *
 * @param pitchClass - Pitch class object with englishName, referenceNoteName, and midiNoteDecimal
 * @returns The 12-EDO reference MIDI note number
 */
export function calculateIpnReferenceMidiNote(pitchClass: any): number {
  // Map note names to chromatic positions (C=0, C#=1, D=2, etc.)
  const noteToChroma: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  // The 12-EDO slot (0-11) a name points to: the letter plus the sharps/flats only
  // when they follow the letter immediately ("Ab--" → Ab, "E-b" → E, "B#" → C,
  // "F##" → G).
  const slotOf = (name: string | undefined): number | null => {
    const match = name?.match(/^([A-G])(##|bb|#|b)?/);
    if (!match) return null;
    const accidentalSemitones: { [accidental: string]: number } = { '##': 2, '#': 1, b: -1, bb: -2 };
    const chroma = noteToChroma[match[1]] + (accidentalSemitones[match[2] ?? ''] ?? 0);
    return ((chroma % 12) + 12) % 12;
  };

  // referenceNoteName (maqām-context, may be collision-adjusted) takes precedence
  // over the slot implied by englishName.
  const slot = slotOf(pitchClass.referenceNoteName) ?? slotOf(pitchClass.englishName);
  if (slot === null) {
    return Math.round(pitchClass.midiNoteDecimal);
  }

  // Anchor the octave on the English name's natural letter (the octave number
  // belongs to the letter, so B#2 sits beside B2 and Cb4 beside C4); fall back to
  // the pitch itself when the name has no octave.
  const englishMatch = pitchClass.englishName?.match(/^([A-G])[^0-9]*(\d+)$/);
  const centre = englishMatch
    ? (parseInt(englishMatch[2], 10) + 1) * 12 + noteToChroma[englishMatch[1]]
    : pitchClass.midiNoteDecimal;

  // Nearest MIDI note in that slot
  const below = slot + 12 * Math.floor((centre - slot) / 12);
  return centre - below <= 6 ? below : below + 12;
}
