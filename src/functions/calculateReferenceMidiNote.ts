/**
 * Calculate the reference MIDI note number from a pitch class's reference note name.
 * This function parses the reference note name (e.g., "E", "F#", "Bb") and finds
 * the closest MIDI note number that matches that chromatic pitch class.
 * 
 * @param pitchClass - The pitch class object containing referenceNoteName and midiNoteNumber
 * @returns The MIDI note number of the reference note
 */
export function calculateReferenceMidiNote(pitchClass: any): number {
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
