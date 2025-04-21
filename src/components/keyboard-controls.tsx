// components/KeyboardControls.tsx
"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function KeyboardControls() {
  const {
    selectedCells,
    getSelectedCellDetails,
    playNoteFrequency,
  } = useAppContext();

  // Home‐row keys A S D F G H J K L
  const keys = ["a","s","d","f","g","h","j","k","l"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ignore typing in inputs, and repeated key events
      if (e.target instanceof HTMLInputElement || e.repeat) return;

      const idx = keys.indexOf(e.key);
      if (idx !== -1 && idx < selectedCells.length) {
        const cell = selectedCells[idx];
        const details = getSelectedCellDetails(cell);
        const freq = parseFloat(details.frequency);
        if (!isNaN(freq)) {
          playNoteFrequency(freq);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells, getSelectedCellDetails, playNoteFrequency]);

  return null;
}
