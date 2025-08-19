import NoteName, { octaveFourNoteNames, octaveOneNoteNames, octaveThreeNoteNames, octaveTwoNoteNames, octaveZeroNoteNames } from "@/models/NoteName";

/**
 * Retrieves note names across multiple octaves for given pitch class indices.
 *
 * This function maps pitch class note name indices to their corresponding note names
 * across four octaves (0-3). It's essential for creating comprehensive pitch
 * collections when working with tuning systems that span multiple octaves.
 *
 * The function iterates through octaves 0-3 and maps each provided index
 * to its note name equivalent in that octave, building a complete list
 * of available note names for the tuning system.
 *
 * @param indicesToSearch - Array of pitch class indices to map to note names (default: [])
 * @returns Array of note names corresponding to the indices across all octaves
 */
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
