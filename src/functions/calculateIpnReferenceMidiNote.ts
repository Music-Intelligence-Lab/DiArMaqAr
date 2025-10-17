/**
 * Calculates the International Pitch Notation reference MIDI note for a microtonal pitch.
 *
 * **Purpose**: Given a microtonal pitch (like E-b3), finds the nearest standard International Pitch Notation MIDI note
 * that the pitch theoretically relates to for cents deviation calculations.
 *
 * **Simple Logic**:
 * 1. Parse the reference note name (e.g., "E-b" → base note "E", modifier "-b")
 * 2. Extract just the 12-EDO part (e.g., "E" without microtonal modifiers)
 * 3. Convert to chromatic position (C=0, C#/Db=1, D=2, ... B=11)
 * 4. Find which octave the microtonal pitch is in
 * 5. Check 3 candidate MIDI notes: same octave, one below, one above
 * 6. Pick the closest one by MIDI distance
 *
 * **Example**:
 * - Input: E-b3 (MIDI 51.366)
 * - Base note: "E" (chromatic position 4)
 * - Candidates: E3 (40), E4 (52), E5 (64)
 * - Closest: E4 (52)
 * - Deviation: 51.366 - 52 = -0.634 semitones = -63.4 cents
 *
 * @param pitchClass - Pitch class object with referenceNoteName and midiNoteNumber
 * @returns The 12-EDO reference MIDI note number
 */
export function calculate12EdoReferenceMidiNote(pitchClass: any): number {
  const referenceNoteName = pitchClass.referenceNoteName;
  
  // Parse the reference note to get base note and accidental
  const baseNoteMatch = referenceNoteName?.match(/^([A-G])(#|b)?/);
  let referenceMidiNote = Math.round(pitchClass.midiNoteNumber); // fallback
  
  if (baseNoteMatch) {
    const baseNote = baseNoteMatch[1];
    const accidental = baseNoteMatch[2] || '';
    
    // Map note names to chromatic positions (C=0, C#=1, D=2, etc.)
    const noteToChroma: { [key: string]: number } = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    let chroma = noteToChroma[baseNote];
    if (accidental === '#') chroma += 1;
    if (accidental === 'b') chroma -= 1;
    chroma = ((chroma % 12) + 12) % 12; // normalize to 0-11
    
    // Find the closest MIDI note with this chroma value
    const currentMidi = pitchClass.midiNoteNumber;
    const currentOctave = Math.floor(currentMidi / 12);
    
    // Try current octave, one below, and one above
    const candidates = [
      currentOctave * 12 + chroma,
      (currentOctave - 1) * 12 + chroma,
      (currentOctave + 1) * 12 + chroma
    ];
    
    // Pick the closest one
    referenceMidiNote = candidates.reduce((closest, candidate) => 
      Math.abs(candidate - currentMidi) < Math.abs(closest - currentMidi) ? candidate : closest
    );
  }
  
  return referenceMidiNote;
}
