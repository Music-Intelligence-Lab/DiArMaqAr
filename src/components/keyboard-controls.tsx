"use client";

import { useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import { CellDetails } from "@/models/Cell";

export default function KeyboardControls() {
  const {
    selectedCellDetails,
    selectedMaqam,
    selectedMaqamTransposition,
    allCellDetails,
  } = useAppContext();
  const { noteOn, noteOff, setActiveCells } = useSoundContext();

  // home row + semicolon + apostrophe
  const firstRowKeys = [
    "q",
    "w",
    "e",
    "r",
    "t",
    "y",
    "u",
    "i",
    "o",
    "p",
    "[",
    "]",
  ];
  const secondRowKeys = [
    "a",
    "s",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    ";",
    "'",
    "\\",
  ];
  const thirdRowKeys = ["`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  const descendingNoteNames = selectedMaqamTransposition
    ? selectedMaqamTransposition.descendingNoteNames
    : selectedMaqam
    ? selectedMaqam.getDescendingNoteNames()
    : [];

  const descendingMaqamCells: CellDetails[] = allCellDetails.filter(
    (cellDetails) => {
      return descendingNoteNames.includes(cellDetails.noteName);
    }
  );

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return (
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.shiftKey ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        isTyping()
      )
        return;

      const firstRowIndex = firstRowKeys.indexOf(e.key);
      const secondRowIndex = secondRowKeys.indexOf(e.key);
      const thirdRowIndex = thirdRowKeys.indexOf(e.key);

      if (firstRowIndex < 0 && secondRowIndex < 0 && thirdRowIndex < 0) return;

      if (firstRowIndex >= 0) {
        const baseCount = descendingMaqamCells.length;
        if (baseCount === 0) return;
        const octaveShift = Math.floor(firstRowIndex / baseCount);
        const cellIndex = firstRowIndex % baseCount;
        const cell = descendingMaqamCells[cellIndex];
        const dIndex = cell.index;
        const dOct = cell.octave + octaveShift;
        const freq = parseFloat(cell.frequency);
        if (!isNaN(freq)) {
          noteOn(freq * Math.pow(2, octaveShift));
          window.dispatchEvent(
            new CustomEvent("noteTrigger", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      if (secondRowIndex >= 0 && selectedCellDetails.length > 0) {
        // determine which selected cell and octave shift
        const baseCount = selectedCellDetails.length;
        // only allow upper-octave keys when exactly 7 notes are selected
        if (secondRowIndex >= baseCount && baseCount !== 7) return;
        const octaveShift = Math.floor(secondRowIndex / baseCount);
        const cellIndex = secondRowIndex % baseCount;
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCellDetails[cellIndex];
          const sIndex = cell.index;
          const sOct = cell.octave + octaveShift;
          const freq = parseFloat(cell.frequency);
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
      if (thirdRowIndex >= 0 && selectedCellDetails.length > 0) {
        const baseCount = selectedCellDetails.length;
        if (thirdRowIndex >= baseCount && baseCount !== 7) return;
        const octaveShift = Math.floor(thirdRowIndex / baseCount) - 1;
        const cellIndex = thirdRowIndex % baseCount;
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCellDetails[cellIndex];
          const sIndex = cell.index;
          const sOct = cell.octave + octaveShift;
          const freq = parseFloat(cell.frequency);
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
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping())
        return;

      const firstRowIndex = firstRowKeys.indexOf(e.key);
      if (firstRowIndex >= 0 && descendingMaqamCells.length > 0) {
        const baseCount = descendingMaqamCells.length;
        const octaveShift = Math.floor(firstRowIndex / baseCount);
        const cellIndex = firstRowIndex % baseCount;
        const cellDetails = descendingMaqamCells[cellIndex];
        const freq = parseFloat(cellDetails.frequency);
        if (!isNaN(freq)) {
          const adjustedFreq = freq * Math.pow(2, octaveShift);
          noteOff(adjustedFreq);
          const dIndex = cellDetails.index;
          const dOct = cellDetails.octave + octaveShift;
          window.dispatchEvent(
            new CustomEvent("noteRelease", {
              detail: { index: dIndex, octave: dOct },
            })
          );
        }
      }

      const secondRowIndex = secondRowKeys.indexOf(e.key);
      const thirdRowIndex = thirdRowKeys.indexOf(e.key);
      if (secondRowIndex < 0 || selectedCellDetails.length === 0) {
        if (thirdRowIndex < 0 || selectedCellDetails.length === 0) return;
      }
      if (secondRowIndex >= 0 && selectedCellDetails.length > 0) {
        const baseCount = selectedCellDetails.length;
        // only allow upper-octave keys when exactly 7 notes are selected
        if (secondRowIndex >= baseCount && baseCount !== 7) return;
        const octaveShift = Math.floor(secondRowIndex / baseCount);
        const cellIndex = secondRowIndex % baseCount;
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCellDetails[cellIndex];
          const freq = parseFloat(cell.frequency);
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
      if (thirdRowIndex >= 0 && selectedCellDetails.length > 0) {
        const baseCount = selectedCellDetails.length;
        if (thirdRowIndex >= baseCount && baseCount !== 7) return;
        const octaveShift = Math.floor(thirdRowIndex / baseCount) - 1;
        const cellIndex = thirdRowIndex % baseCount;
        if (cellIndex >= 0 && cellIndex < baseCount) {
          const cell = selectedCellDetails[cellIndex];
          const sIndex = cell.index;
          const sOct = cell.octave + octaveShift;
          const freq = parseFloat(cell.frequency);
          if (!isNaN(freq)) {
            noteOff(freq * Math.pow(2, octaveShift));
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
  }, [selectedCellDetails, noteOn, noteOff]);

  useEffect(() => {
    const handleTrigger = (e: any) => {
      const { index, octave } = e.detail;
      setActiveCells((prev) => {
        if (prev.some((c) => c.index === index && c.octave === octave))
          return prev;
        return [...prev, { index, octave }];
      });
    };
    const handleRelease = (e: any) => {
      const { index, octave } = e.detail;
      setActiveCells((prev) =>
        prev.filter((c) => !(c.index === index && c.octave === octave))
      );
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
