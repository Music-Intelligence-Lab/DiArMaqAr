"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function KeyboardControls() {
  const {
    selectedCells,
    getSelectedCellDetails,
    noteOn,
    noteOff,
  } = useAppContext();

  // home row + semicolon + apostrophe
  const keys = ["a","s","d","f","g","h","j","k","l",";","'", "\\"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = keys.indexOf(e.key);
      if (idx < 0 || selectedCells.length === 0) return;
      // determine which selected cell and octave shift
      const baseCount = selectedCells.length;
      // If we have more than one full octave, do not use upper octaves
      if (baseCount > 8 && idx >= baseCount) return;
      const octaveShift = Math.floor(idx / baseCount);
      let cellIndex = idx % baseCount;
      if (octaveShift > 0) {
        // only bump when we have a full octave (>=8) of selected cells
        if (baseCount >= 8) {
          cellIndex = cellIndex + 1;
        } else {
          cellIndex = cellIndex + 0;
        }
      }
      if (cellIndex >= 0 && cellIndex < baseCount) {
        const cell = selectedCells[cellIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          // multiply frequency by 2^octaveShift
          noteOn(freq * Math.pow(2, octaveShift));
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const idx = keys.indexOf(e.key);
      if (idx < 0 || selectedCells.length === 0) return;
      const baseCount = selectedCells.length;
      // If we have more than one full octave, do not use upper octaves
      if (baseCount > 8 && idx >= baseCount) return;
      const octaveShift = Math.floor(idx / baseCount);
      let cellIndex = idx % baseCount;
      if (octaveShift > 0) {
        // only bump when we have a full octave (>=8) of selected cells
        if (baseCount >= 8) {
          cellIndex = cellIndex + 1;
        } else {
          cellIndex = cellIndex + 0;
        }
      }
      if (cellIndex >= 0 && cellIndex < baseCount) {
        const cell = selectedCells[cellIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOff(freq * Math.pow(2, octaveShift));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCells, getSelectedCellDetails, noteOn, noteOff]);

  return null;
}
