import { calculateIpnReferenceMidiNote } from "./calculateIpnReferenceMidiNote";

/**
 * Extracts the 12-EDO reference note name (without microtonal modifiers) from a pitch class.
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
 * Extracts the 12-EDO reference note name with octave number from a pitch class.
 *
 * @param pitchClass - Pitch class object with midiNoteDecimal
 * @returns 12-EDO reference note name with octave number (e.g., "E3", "Bb4", "F#2")
 *
 * @example
 * ```typescript
 * const pc = { midiNoteDecimal: 51.366, englishName: "E-b3", ... };
 * const ref = get12EdoReferenceNoteNameWithOctave(pc); // Returns "E3"
 * ```
 */
export function getIpnReferenceNoteNameWithOctave(pitchClass: any): string {
  const referenceMidiNote = calculateIpnReferenceMidiNote(pitchClass);
  const referenceNote = getIpnReferenceNoteName(pitchClass);
  const midiOctave = Math.floor(referenceMidiNote / 12) - 1;
  return `${referenceNote}${midiOctave}`;
}
