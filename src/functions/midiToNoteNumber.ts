export default function midiNumberToNoteName(noteNumber: number): {note: string; alt?: string; octave: number } {
  if (noteNumber < 0 || noteNumber > 127) {
    throw new RangeError("MIDI note number must be between 0 and 127");
  }

  const noteNamesSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteNamesFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  const semitone = noteNumber % 12;
  const octave = Math.floor(noteNumber / 12) - 1;

  const note = noteNamesSharp[semitone];
  const altName = noteNamesFlat[semitone];
  // only include alt if it's different (i.e. a genuine enharmonic)
  const alt = altName !== note ? altName : undefined;

  return { note, alt, octave };
}
