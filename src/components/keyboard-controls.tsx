"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function KeyboardControls() {
  const { selectedCells, getSelectedCellDetails, noteOn, noteOff, selectedMaqam, getAllCells } = useAppContext();

  // home row + semicolon + apostrophe
  const firstRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "["];
  const secondRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\"];

  const descendingNoteNames = selectedMaqam ? selectedMaqam.getDescendingNoteNames() : [];

  const descendingMaqamCells = getAllCells().filter((cell) => {
    const det = getSelectedCellDetails(cell);
    return descendingNoteNames.includes(det.noteName);
  });

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && firstRowIndex < descendingMaqamCells.length) {
        const cell = descendingMaqamCells[firstRowIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOn(freq);
          const cAny = cell as any;
          const dIndex = cAny.index;              // full pitch‑class index
          const dOct   = cAny.octave;
          window.dispatchEvent(
            new CustomEvent("noteTrigger", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      if (secondRowIndex < 0 || selectedCells.length === 0) return;
      // determine which selected cell and octave shift
      const baseCount = selectedCells.length;
      // only allow upper-octave keys when exactly 8 notes are selected
      if (secondRowIndex >= baseCount && baseCount !== 8) return;
      const octaveShift = Math.floor(secondRowIndex / baseCount);
      let cellIndex = secondRowIndex % baseCount;
      if (octaveShift > 0) {
        // only bump into next scale degree when exactly 8 are selected
        if (baseCount === 8) {
          cellIndex = cellIndex + 1;
        } else {
          cellIndex = cellIndex + 0;
        }
      }
      if (cellIndex >= 0 && cellIndex < baseCount) {
        const cell = selectedCells[cellIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOn(freq * Math.pow(2, octaveShift));
          const scAny = cell as any; // original Cell object
          const sIndex = scAny.index;
          const sOct = scAny.octave + octaveShift;
          window.dispatchEvent(
            new CustomEvent("noteTrigger", {
              detail: { index: sIndex, octave: sOct },
            })
          );
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && firstRowIndex < descendingMaqamCells.length) {
        const cell = descendingMaqamCells[firstRowIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOff(freq);
          const cAny = cell as any;
          const dIndex = cAny.index;
          const dOct = cAny.octave;
          window.dispatchEvent(
            new CustomEvent("noteRelease", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      if (secondRowIndex < 0 || selectedCells.length === 0) return;
      const baseCount = selectedCells.length;
      // only allow upper-octave keys when exactly 8 notes are selected
      if (secondRowIndex >= baseCount && baseCount !== 8) return;
      const octaveShift = Math.floor(secondRowIndex / baseCount);
      let cellIndex = secondRowIndex % baseCount;
      if (octaveShift > 0) {
        // only bump into next scale degree when exactly 8 are selected
        if (baseCount === 8) {
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
          const scAny = cell as any;
          const sIndex = scAny.index;
          const sOct = scAny.octave + octaveShift;
          window.dispatchEvent(
            new CustomEvent("noteRelease", {
              detail: { index: sIndex, octave: sOct },
            })
          );
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
