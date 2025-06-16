"use client";

import { useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import Cell from "@/models/Cell";

export default function KeyboardControls() {
  const { selectedCells, selectedMaqam, selectedMaqamTransposition, allCells, shiftCell } = useAppContext();
  const { noteOn, noteOff, setActiveCells } = useSoundContext();

  // keyboard rows
  const firstRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"];
  const secondRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\"];
  const thirdRowKeys = ["`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  // derive descending cells
  const descendingNoteNames = selectedMaqamTransposition
    ? selectedMaqamTransposition.descendingNoteNames
    : selectedMaqam
    ? selectedMaqam.getDescendingNoteNames()
    : [];

  const descendingMaqamCells: Cell[] = allCells.filter((cell) => descendingNoteNames.includes(cell.noteName));

  const isTyping = () => {
    const el = document.activeElement;
    return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
  };

  useEffect(() => {
    const addActive = (cell: Cell) => {
      const freq = parseFloat(cell.frequency);
      if (isNaN(freq)) return;
      noteOn(freq);
      setActiveCells((prev) => (prev.some((c) => c.index === cell.index && c.octave === cell.octave) ? prev : [...prev, cell]));
    };

    const removeActive = (cell: Cell) => {
      const freq = parseFloat(cell.frequency);
      if (isNaN(freq)) return;
      noteOff(freq);
      setActiveCells((prev) => prev.filter((c) => !(c.index === cell.index && c.octave === cell.octave)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      let cell: Cell | null = null;
      const idx1 = firstRowKeys.indexOf(e.key);
      if (idx1 >= 0 && descendingMaqamCells.length > 0) {
        const base = descendingMaqamCells.length;
        cell = shiftCell(descendingMaqamCells[idx1 % base], Math.floor(idx1 / base));
      } else {
        const idx2 = secondRowKeys.indexOf(e.key);
        if (idx2 >= 0 && selectedCells.length > 0) {
          const base = selectedCells.length;
          if (idx2 < base || base === 7) {
            cell = shiftCell(selectedCells[idx2 % base], Math.floor(idx2 / base));
          }
        } else {
          const idx3 = thirdRowKeys.indexOf(e.key);
          if (idx3 >= 0 && selectedCells.length > 0) {
            const base = selectedCells.length;
            if (idx3 < base || base === 7) {
              cell = shiftCell(selectedCells[idx3 % base], Math.floor(idx3 / base) - 1);
            }
          }
        }
      }

      if (cell) addActive(cell);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      let cell: Cell | null = null;
      const idx1 = firstRowKeys.indexOf(e.key);
      if (idx1 >= 0 && descendingMaqamCells.length > 0) {
        const base = descendingMaqamCells.length;
        cell = shiftCell(descendingMaqamCells[idx1 % base], Math.floor(idx1 / base));
      } else {
        const idx2 = secondRowKeys.indexOf(e.key);
        if (idx2 >= 0 && selectedCells.length > 0) {
          const base = selectedCells.length;
          if (idx2 < base || base === 7) {
            cell = shiftCell(selectedCells[idx2 % base], Math.floor(idx2 / base));
          }
        } else {
          const idx3 = thirdRowKeys.indexOf(e.key);
          if (idx3 >= 0 && selectedCells.length > 0) {
            const base = selectedCells.length;
            if (idx3 < base || base === 7) {
              cell = shiftCell(selectedCells[idx3 % base], Math.floor(idx3 / base) - 1);
            }
          }
        }
      }

      if (cell) removeActive(cell);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedCells, selectedMaqam, selectedMaqamTransposition, allCells, shiftCell, descendingMaqamCells, noteOn, noteOff, setActiveCells]);

  return null;
}
