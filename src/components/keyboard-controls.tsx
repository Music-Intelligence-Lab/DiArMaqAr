"use client";

import { useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import shiftPitchClass from "@/functions/shiftPitchClass";

export default function KeyboardControls() {
  const { selectedPitchClasses, selectedMaqamDetails, selectedMaqam, allPitchClasses } = useAppContext();
  const { noteOn, noteOff, setActivePitchClasses, soundSettings } = useSoundContext();

  // keyboard rows
  const firstRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"];
  const secondRowKeys = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\"];
  const thirdRowKeys = ["`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  // derive descending pitch classes
  const descendingNoteNames = selectedMaqam ? selectedMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.noteName) : selectedMaqamDetails ? selectedMaqamDetails.getDescendingNoteNames() : [];

  const descendingMaqamCells: PitchClass[] = allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName));

  const isTyping = () => {
    const el = document.activeElement;
    return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
  };

  useEffect(() => {
    const addActive = (pitchClass: PitchClass) => {
      const freq = parseFloat(pitchClass.frequency);
      if (isNaN(freq)) return;
      noteOn(freq);
      setActivePitchClasses((prev) => (prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave) ? prev : [...prev, pitchClass]));
    };

    const removeActive = (pitchClass: PitchClass) => {
      const freq = parseFloat(pitchClass.frequency);
      if (isNaN(freq)) return;
      noteOff(freq);
      setActivePitchClasses((prev) => prev.filter((c) => !(c.index === pitchClass.index && c.octave === pitchClass.octave)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping() || soundSettings.inputType !== "QWERTY") return;

      let pitchClass: PitchClass | null = null;
      const idx1 = firstRowKeys.indexOf(e.key);
      if (idx1 >= 0 && descendingMaqamCells.length > 0) {
        const base = descendingMaqamCells.length;
        pitchClass = shiftPitchClass(allPitchClasses, descendingMaqamCells[idx1 % base], Math.floor(idx1 / base));
      } else {
        const idx2 = secondRowKeys.indexOf(e.key);
        if (idx2 >= 0 && selectedPitchClasses.length > 0) {
          const base = selectedPitchClasses.length;
          if (idx2 < base || base === 7) {
            pitchClass = shiftPitchClass(allPitchClasses, selectedPitchClasses[idx2 % base], Math.floor(idx2 / base));
          }
        } else {
          const idx3 = thirdRowKeys.indexOf(e.key);
          if (idx3 >= 0 && selectedPitchClasses.length > 0) {
            const base = selectedPitchClasses.length;
            if (idx3 < base || base === 7) {
              pitchClass = shiftPitchClass(allPitchClasses, selectedPitchClasses[idx3 % base], Math.floor(idx3 / base) - 1);
            }
          }
        }
      }

      if (pitchClass) addActive(pitchClass);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping() || soundSettings.inputType !== "QWERTY") return;

      let pitchClass: PitchClass | null = null;
      const idx1 = firstRowKeys.indexOf(e.key);
      if (idx1 >= 0 && descendingMaqamCells.length > 0) {
        const base = descendingMaqamCells.length;
        pitchClass = shiftPitchClass(allPitchClasses, descendingMaqamCells[idx1 % base], Math.floor(idx1 / base));
      } else {
        const idx2 = secondRowKeys.indexOf(e.key);
        if (idx2 >= 0 && selectedPitchClasses.length > 0) {
          const base = selectedPitchClasses.length;
          if (idx2 < base || base === 7) {
            pitchClass = shiftPitchClass(allPitchClasses, selectedPitchClasses[idx2 % base], Math.floor(idx2 / base));
          }
        } else {
          const idx3 = thirdRowKeys.indexOf(e.key);
          if (idx3 >= 0 && selectedPitchClasses.length > 0) {
            const base = selectedPitchClasses.length;
            if (idx3 < base || base === 7) {
              pitchClass = shiftPitchClass(allPitchClasses, selectedPitchClasses[idx3 % base], Math.floor(idx3 / base) - 1);
            }
          }
        }
      }

      if (pitchClass) removeActive(pitchClass);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedPitchClasses, selectedMaqamDetails, selectedMaqam, allPitchClasses, descendingMaqamCells, noteOn, noteOff, setActivePitchClasses]);

  return null;
}
