import NoteName, { octaveFourNoteNames, octaveOneNoteNames, octaveThreeNoteNames, octaveTwoNoteNames, octaveZeroNoteNames } from "@/models/NoteName";

export default function getNoteNamesUsedInTuningSystem(indicesToSearch: number[] = []): NoteName[] {
  const noteNames = [];
  const baseLength = octaveOneNoteNames.length;

  for (let octave = 0; octave < 4; octave++) {
    for (const index of indicesToSearch) {
      if (index < baseLength) {
        switch (octave) {
          case 0:
            noteNames.push(octaveZeroNoteNames[index] || "none");
            break;
          case 1:
            noteNames.push(octaveOneNoteNames[index] || "none");
            break;
          case 2:
            noteNames.push(octaveTwoNoteNames[index] || "none");
            break;
          case 3:
            noteNames.push(octaveThreeNoteNames[index] || "none");
            break;
        }
      } else {
        const localIndex = index - baseLength;
        switch (octave) {
          case 0:
            noteNames.push(octaveOneNoteNames[localIndex] || "none");
            break;
          case 1:
            noteNames.push(octaveTwoNoteNames[localIndex] || "none");
            break;
          case 2:
            noteNames.push(octaveThreeNoteNames[localIndex] || "none");
            break;
          case 3:
            noteNames.push(octaveFourNoteNames[localIndex] || "none");
            break;
        }
      }
    }
  }

  return noteNames;
}
