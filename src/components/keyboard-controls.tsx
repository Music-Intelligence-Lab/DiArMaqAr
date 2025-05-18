"use client";

import { useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";

export default function KeyboardControls() {
  const { selectedCells, getSelectedCellDetails, noteOn, noteOff, selectedMaqam, getAllCells } = useAppContext();

  // home row + semicolon + apostrophe
  const firstRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "["];
  const secondRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"];

  const descendingNoteNames = selectedMaqam ? selectedMaqam.getDescendingNoteNames() : [];

  const descendingMaqamCellDetails = getAllCells()
    .map((cell) => getSelectedCellDetails(cell))
    .filter((cell) => descendingNoteNames.includes(cell.noteName))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && firstRowIndex < descendingMaqamCellDetails.length) {
        const cell = descendingMaqamCellDetails[firstRowIndex];
        const freq = parseFloat(cell.frequency);
        if (!isNaN(freq)) noteOn(freq);
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      if (secondRowIndex >= 0 && secondRowIndex < selectedCells.length) {
        const cell = selectedCells[secondRowIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) noteOn(freq);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && firstRowIndex < descendingMaqamCellDetails.length) {
        const cell = descendingMaqamCellDetails[firstRowIndex];
        const freq = parseFloat(cell.frequency);
        if (!isNaN(freq)) noteOff(freq);
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      if (secondRowIndex >= 0 && secondRowIndex < selectedCells.length) {
        const cell = selectedCells[secondRowIndex];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) noteOff(freq);
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
