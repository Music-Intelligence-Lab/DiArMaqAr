import { octaveOneNoteNames } from "@/models/NoteName";

/**
 * Retrieves the first note name from an array of selected pitch class indices.
 *
 * This utility function is used in UI state management to determine the
 * starting note when pitch classes are selected. It maps the first selected
 * index to its corresponding note name from the octave one note names array.
 *
 * @param selectedIndices - Array of selected pitch class indices
 * @returns The note name corresponding to the first index, or "none" if empty or invalid
 */
export default function getFirstNoteName(selectedIndices: number[]): string {
  // Handle empty array
  if (selectedIndices.length === 0) return "none";

  // Get the first index
  const idx = selectedIndices[0];

  // Validate index is non-negative and within bounds
  if (idx < 0) return "none";

  // Return the corresponding note name from the octave one note names
  // This array contains the canonical note names for the first octave
  return octaveOneNoteNames[idx];
}
