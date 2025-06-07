"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function KeyboardControls() {
  const { selectedCells, getCellDetails, noteOn, noteOff, selectedMaqam, selectedMaqamTransposition, getAllCells, setActiveCells } = useAppContext();

  // home row + semicolon + apostrophe
  const firstRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"];
  const secondRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\"];
  const thirdRowKeys = ["`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  const descendingNoteNames = selectedMaqamTransposition ? selectedMaqamTransposition.descendingNoteNames : selectedMaqam ? selectedMaqam.getDescendingNoteNames() : [];

  const descendingMaqamCells = getAllCells().filter((cell) => {
    const det = getCellDetails(cell);
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
        const dIndex = cell.index;
        const dOct = cell.octave;
        const freq = parseFloat(getCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOn(freq);
          window.dispatchEvent(
            new CustomEvent("noteTrigger", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      const thirdRowIndex = thirdRowKeys.indexOf(e.key);
      if (secondRowIndex < 0 || selectedCells.length === 0) {
        if (thirdRowIndex < 0 || selectedCells.length === 0) return;
      }
      if (secondRowIndex >= 0 && selectedCells.length > 0) {
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
          const sIndex = cell.index;
          const sOct = cell.octave + octaveShift;
          const freq = parseFloat(getCellDetails(cell).frequency);
          if (!isNaN(freq)) {
            noteOn(freq * Math.pow(2, octaveShift));
            window.dispatchEvent(
              new CustomEvent("noteTrigger", {
                detail: { index: sIndex, octave: sOct },
              })
            );
          }
        }
      }
      if (thirdRowIndex >= 0 && selectedCells.length > 0) {
        const baseCount = selectedCells.length;
        if (thirdRowIndex >= baseCount && baseCount !== 8) return;
        const octaveShift = Math.floor(thirdRowIndex / baseCount) - 1;
        let cellIndex = thirdRowIndex % baseCount;
        if (octaveShift > -1 && baseCount === 8) {
          cellIndex = cellIndex + 1;
        }
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCells[cellIndex];
          const sIndex = cell.index;
          const sOct = cell.octave + octaveShift;
          const freq = parseFloat(getCellDetails(cell).frequency);
          if (!isNaN(freq)) {
            noteOn(freq * Math.pow(2, octaveShift));
            window.dispatchEvent(
              new CustomEvent("noteTrigger", {
                detail: { index: sIndex, octave: sOct },
              })
            );
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && firstRowIndex < descendingMaqamCells.length) {
        const cell = descendingMaqamCells[firstRowIndex];
        const freq = parseFloat(getCellDetails(cell).frequency);
        if (!isNaN(freq)) {
          noteOff(freq);
          const dIndex = cell.index;
          const dOct = cell.octave;
          window.dispatchEvent(
            new CustomEvent("noteRelease", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      const thirdRowIndex = thirdRowKeys.indexOf(e.key);
      if (secondRowIndex < 0 || selectedCells.length === 0) {
        if (thirdRowIndex < 0 || selectedCells.length === 0) return;
      }
      if (secondRowIndex >= 0 && selectedCells.length > 0) {
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
          const freq = parseFloat(getCellDetails(cell).frequency);
          if (!isNaN(freq)) {
            noteOff(freq * Math.pow(2, octaveShift));
            const sIndex = cell.index;
            const sOct = cell.octave + octaveShift;
            window.dispatchEvent(
              new CustomEvent("noteRelease", {
                detail: { index: sIndex, octave: sOct },
              })
            );
          }
        }
      }
      if (thirdRowIndex >= 0 && selectedCells.length > 0) {
        const baseCount = selectedCells.length;
        if (thirdRowIndex >= baseCount && baseCount !== 8) return;
        const octaveShift = Math.floor(thirdRowIndex / baseCount) - 1;
        let cellIndex = thirdRowIndex % baseCount;
        if (octaveShift > -1 && baseCount === 8) {
          cellIndex = cellIndex + 1;
        }
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCells[cellIndex];
          const freq = parseFloat(getCellDetails(cell).frequency);
          if (!isNaN(freq)) {
            noteOff(freq * Math.pow(2, octaveShift));
            const sIndex = cell.index;
            const sOct = cell.octave + octaveShift;
            window.dispatchEvent(
              new CustomEvent("noteRelease", {
                detail: { index: sIndex, octave: sOct },
              })
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCells, getCellDetails, noteOn, noteOff]);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const { index, octave } = e.detail;
      setActiveCells((prev) => {
        if (prev.some((c) => c.index === index && c.octave === octave)) return prev;
        return [...prev, { index, octave }];
      });
    };
    const handleRelease = (e: any) => {
      const { index, octave } = e.detail;
      setActiveCells((prev) => prev.filter((c) => !(c.index === index && c.octave === octave)));
    };
    window.addEventListener("noteTrigger", handleTrigger);
    window.addEventListener("noteRelease", handleRelease);
    return () => {
      window.removeEventListener("noteTrigger", handleTrigger);
      window.removeEventListener("noteRelease", handleRelease);
    };
  }, [setActiveCells]);

  return null;
}
