import PitchClass from "@/models/PitchClass";
import { getSequentialEnglishNames } from "@/functions/noteNameMappings";
import { calculateCentsDeviationWithReferenceNote, getNextSequentialReferenceNote, swapEnharmonicForReference } from "@/functions/calculateCentsDeviation";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";

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
 * @param ascending - Direction of the sequence (true for ascending, false for descending). Defaults to true.
 * @param allPitchClasses - Optional: All pitch classes from both sequences (for symmetrical maqamat to ensure consistent assignments)
 * @returns New array of pitch classes with sequential English name spellings and reference note names
 *
 * @example
 * ```typescript
 * // For a maqam starting on D with intervallic pattern that includes Ab
 * const maqamPitchClasses = maqam.getPitchClasses();
 * const rendered = renderPitchClassSpellings(maqamPitchClasses);
 * // Result: D, Eb, F, G#, A, Bb, C#, D (sequential letters, not Ab)
 * ```
 */
export function renderPitchClassSpellings(pitchClasses: PitchClass[], ascending: boolean = true, allPitchClasses?: PitchClass[]): PitchClass[] {
  if (pitchClasses.length === 0) {
    return [];
  }

  // Calculate sequential English names for the entire sequence
  const noteNames = pitchClasses.map(pc => pc.noteName);
  const sequentialNames = getSequentialEnglishNames(noteNames, ascending);

  // Get starting pitch class for reference calculations
  const startingPitchClass = pitchClasses[0];
  const startingMidiNumber = startingPitchClass.midiNoteDecimal;
  const startingNoteName = startingPitchClass.englishName;

  // Determine which pitch classes to use for building canonical reference note assignments
  // If allPitchClasses is provided (for symmetrical maqamat), use all unique pitch classes
  // Otherwise, use just the current sequence
  const pitchClassesForCanonical = allPitchClasses || pitchClasses;
  
  // Create a map of unique pitch classes by noteName (for symmetrical maqamat, same noteName = same pitch class)
  const uniquePitchClassesMap = new Map<string, PitchClass>();
  pitchClassesForCanonical.forEach(pc => {
    if (!uniquePitchClassesMap.has(pc.noteName)) {
      uniquePitchClassesMap.set(pc.noteName, pc);
    }
  });
  
  // Build canonical ordering: sort unique pitch classes by MIDI note (ascending)
  // This creates a deterministic ordering that doesn't depend on sequence direction
  const canonicalOrder = Array.from(uniquePitchClassesMap.values()).sort(
    (a, b) => a.midiNoteDecimal - b.midiNoteDecimal
  );

  // First pass: Calculate base reference notes for all canonical pitch classes
  // This ensures the same pitch class gets the same base reference note regardless of direction
  const canonicalBaseReferenceNotes = canonicalOrder.map((pc) => {
    const deviationResult = calculateCentsDeviationWithReferenceNote(
      pc.midiNoteDecimal,
      pc.cents,
      startingMidiNumber,
      pc.englishName, // Use original English name
      startingNoteName
    );
    return {
      pitchClass: pc,
      baseReferenceNote: deviationResult.referenceNoteName,
      baseCentsDeviation: deviationResult.deviation
    };
  });

  // Second pass: Apply sequential logic to canonical ordering to avoid duplicate letters
  // This creates a deterministic map of reference notes that will be consistent for both sequences
  let prevReferenceNoteName: string | undefined = undefined;
  const canonicalReferenceNoteMap = new Map<string, { referenceNoteName: string; centsDeviation: number }>();
  
  canonicalBaseReferenceNotes.forEach(({ pitchClass, baseReferenceNote, baseCentsDeviation }) => {
    let referenceNoteName = baseReferenceNote;
    let centsDeviation = baseCentsDeviation;

    // Apply sequential logic to avoid repeating the same letter
    if (prevReferenceNoteName) {
      const prevLetter = prevReferenceNoteName.charAt(0).toUpperCase();
      const currLetter = referenceNoteName.charAt(0).toUpperCase();

      if (prevLetter === currLetter) {
        // Prefer enharmonic swap (F# → Gb) over sequential advance (F# → G#).
        // Sequential advance changes the PITCH (G# ≠ F#); enharmonic swap preserves it.
        const swapped = swapEnharmonicForReference(referenceNoteName);
        if (swapped) {
          referenceNoteName = swapped;
        } else {
          const sequentialNote = getNextSequentialReferenceNote(referenceNoteName);
          if (sequentialNote) {
            referenceNoteName = sequentialNote;
          }
        }

        // Recalculate cents deviation based on the new reference note
        if (referenceNoteName !== baseReferenceNote) {
          const tempPc = { ...pitchClass, referenceNoteName };
          const newRefMidi = calculateIpnReferenceMidiNote(tempPc);
          const referenceFrequency = 440 * Math.pow(2, (newRefMidi - 69) / 12);
          const currentFrequency = 440 * Math.pow(2, (pitchClass.midiNoteDecimal - 69) / 12);
          centsDeviation = 1200 * Math.log2(currentFrequency / referenceFrequency);
        }
      }
    }

    prevReferenceNoteName = referenceNoteName;
    canonicalReferenceNoteMap.set(pitchClass.noteName, { referenceNoteName, centsDeviation });
  });

  // Third pass: Apply canonical reference notes to the current sequence
  const processedReferenceNotes = pitchClasses.map((pc) => {
    const canonicalRef = canonicalReferenceNoteMap.get(pc.noteName);
    if (canonicalRef) {
      return { pitchClass: pc, referenceNoteName: canonicalRef.referenceNoteName, centsDeviation: canonicalRef.centsDeviation };
    }
    // Fallback: calculate independently if not in canonical map (shouldn't happen)
    const deviationResult = calculateCentsDeviationWithReferenceNote(
      pc.midiNoteDecimal,
      pc.cents,
      startingMidiNumber,
      pc.englishName,
      startingNoteName
    );
    return { pitchClass: pc, referenceNoteName: deviationResult.referenceNoteName, centsDeviation: deviationResult.deviation };
  });

  // Third pass: Combine sequential English names with processed reference notes
  return pitchClasses.map((pc, i) => {
    const processed = processedReferenceNotes[i];
    const tempPcWithRef = { ...pc, referenceNoteName: processed.referenceNoteName };
    const referenceMidiNote = calculateIpnReferenceMidiNote(tempPcWithRef);
    const sign = processed.centsDeviation > 0 ? "+" : "";
    const midiNoteDeviation = `${referenceMidiNote} ${sign}${processed.centsDeviation.toFixed(1)}`;

    return {
    ...pc,
      englishName: sequentialNames[i],
      referenceNoteName: processed.referenceNoteName,
      centsDeviation: processed.centsDeviation,
      midiNoteDeviation
    };
  });
}
