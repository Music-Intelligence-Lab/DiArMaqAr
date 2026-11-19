import { calculateIpnReferenceMidiNote } from "./calculateIpnReferenceMidiNote";

/**
 * The 12-EDO chromatic slot of a pitch class, as a sharps-only key ("C", "C#" … "B").
 *
 * For grouping and matching by slot (Ab and G# must compare equal). Not a display
 * spelling: use getIpnReferenceNoteNameWithOctave() or `referenceNoteName` for that.
 *
 * This function respects Arabic musicological logic where microtonal modifiers indicate
 * what the pitch is a variant OF, not mathematical proximity to 12-EDO semitones.
 *
 * **Examples:**
 * - E-b (E half-flat) → E (variant of E natural, not Eb)
 * - B-b (B half-flat) → B (variant of B natural, not Bb)
 * - Bb++ (Bb double-raising) → Bb (variant of Bb)
 *
 * **Implementation:**
 * Uses the MIDI-based reference calculation from calculate12EdoReferenceMidiNote(),
 * which already encodes the correct musicological logic.
 *
 * @param pitchClass - Pitch class object with midiNoteDecimal and optional referenceNoteName
 * @returns 12-EDO reference note name without octave number (e.g., "E", "Bb", "F#")
 *
 * @example
 * ```typescript
 * const pc = { midiNoteDecimal: 51.366, englishName: "E-b3", ... };
 * const ref = get12EdoReferenceNoteName(pc); // Returns "E"
 * ```
 */
export function getIpnReferenceNoteName(pitchClass: any): string {
  const midiNote = calculateIpnReferenceMidiNote(pitchClass);
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return noteNames[midiNote % 12];
}

/**
 * Display form of a pitch class's 12-EDO reference note, with octave number.
 *
 * Shows the stored maqām-context spelling (`referenceNoteName`, e.g. "Ab", "Eb")
 * rather than the sharps-only slot key from getIpnReferenceNoteName(), which is
 * for grouping by chromatic slot, not for display. The octave number follows the
 * letter, so a "Cb" reference at MIDI 59 reads "Cb4".
 *
 * @param pitchClass - Pitch class object with referenceNoteName, englishName and midiNoteDecimal
 * @returns Reference note name with octave number (e.g., "E3", "Bb4", "Ab3")
 *
 * @example
 * ```typescript
 * const pc = { midiNoteDecimal: 56.49, englishName: "Ab3", referenceNoteName: "Ab" };
 * getIpnReferenceNoteNameWithOctave(pc); // "Ab3" (not "G#3")
 * ```
 */
export function getIpnReferenceNoteNameWithOctave(pitchClass: any): string {
  const referenceMidiNote = calculateIpnReferenceMidiNote(pitchClass);
  const stored: string | undefined = pitchClass.referenceNoteName;
  const spelling = stored && /^[A-G](##|bb|#|b)?$/.test(stored) ? stored : getIpnReferenceNoteName(pitchClass);
  const accidental = spelling.slice(1);
  const accidentalOffset = accidental.length * (accidental.startsWith("#") ? 1 : -1);
  const octave = Math.floor((referenceMidiNote - accidentalOffset) / 12) - 1;
  return `${spelling}${octave}`;
}
