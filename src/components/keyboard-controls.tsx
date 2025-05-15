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
  const keys = ["a","s","d","f","g","h","j","k","l",";","'"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = keys.indexOf(e.key);
      if (idx >= 0 && idx < selectedCells.length) {
        const cell = selectedCells[idx];
        const freq = parseFloat(getSelectedCellDetails(cell).frequency);
        if (!isNaN(freq)) noteOn(freq);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const idx = keys.indexOf(e.key);
      if (idx >= 0 && idx < selectedCells.length) {
        const cell = selectedCells[idx];
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
