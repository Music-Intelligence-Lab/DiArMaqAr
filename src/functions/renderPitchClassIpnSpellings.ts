import PitchClass from "@/models/PitchClass";
import { getSequentialEnglishNames } from "@/functions/noteNameMappings";

/**
 * Renders pitch classes with sequential International Pitch Notation name spellings for melodic sequences.
 *
 * This function ensures Western music notation convention where scales use consecutive
 * letters (D-E-F-G-A-B-C-D) by resolving enharmonic equivalents appropriately.
 *
 * **Context-Specific Function:**
 * - Use this for jins and maqam melodic sequences
 * - NOT for general tuning system pitch classes (which may have letter collisions)
 *
 * **Data Integrity:**
 * - Updates both `englishName` and `referenceNoteName` to use sequential spellings
 * - Ensures cents deviation and MIDI note deviation use correct reference notes
 * - Critical for display, export, and API endpoints
 *
 * @param pitchClasses - Array of pitch classes from a melodic sequence (jins or maqam)
 * @returns New array of pitch classes with sequential English name spellings
 *
 * @example
 * ```typescript
 * // For a maqam starting on D with intervallic pattern that includes Ab
 * const maqamPitchClasses = maqam.getPitchClasses();
 * const rendered = renderPitchClassSpellings(maqamPitchClasses);
 * // Result: D, Eb, F, G#, A, Bb, C#, D (sequential letters, not Ab)
 * ```
 */
export function renderPitchClassSpellings(pitchClasses: PitchClass[]): PitchClass[] {
  if (pitchClasses.length === 0) {
    return [];
  }

  // Calculate sequential English names for the entire sequence
  const noteNames = pitchClasses.map(pc => pc.noteName);
  const sequentialNames = getSequentialEnglishNames(noteNames);

  // Return new pitch class objects with updated English names
  // Note: We do NOT override referenceNoteName here - that is calculated separately
  // by getReferenceNoteName() which uses MIDI-based musicological logic
  return pitchClasses.map((pc, i) => ({
    ...pc,
    englishName: sequentialNames[i]
  }));
}
