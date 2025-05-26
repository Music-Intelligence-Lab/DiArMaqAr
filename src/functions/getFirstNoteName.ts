import { octaveOneNoteNames } from "@/models/NoteName";

export default function getFirstNoteName(selectedIndices: number[]): string {
    if (selectedIndices.length === 0) return "none";
    const idx = selectedIndices[0];
    if (idx < 0) return "none";
    return octaveOneNoteNames[idx];
  }