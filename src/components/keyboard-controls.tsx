"use client";

import { useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import shiftPitchClass from "@/functions/shiftPitchClass";

export default function KeyboardControls() {
  const { selectedPitchClasses, selectedMaqamDetails, selectedMaqam, allPitchClasses } = useAppContext();
  const { noteOn, noteOff, setActivePitchClasses, soundSettings } = useSoundContext();

  // keyboard rows
  const firstRowCodes = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"];

  const secondRowCodes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backslash"];

  const thirdRowCodes = ["Backquote", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "Slash"];

  // const isTyping = () => {
  //   const el = document.activeElement;
  //   return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
  // };

  const pitchClassMapping: Record<string, PitchClass> = {};

  if (selectedMaqam || selectedMaqamDetails) {
    let ascendingMaqamPitchClasses: PitchClass[] = [];
    let descendingMaqamPitchClasses: PitchClass[] = [];

    if (selectedMaqam) {
      ascendingMaqamPitchClasses = selectedMaqam.ascendingPitchClasses;
      descendingMaqamPitchClasses = [...selectedMaqam.descendingPitchClasses].reverse();
    } else if (selectedMaqamDetails) {
      const ascendingNoteNames = selectedMaqamDetails.getAscendingNoteNames();

      const descendingNoteNames = selectedMaqamDetails.getDescendingNoteNames();

      ascendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));
      descendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName));
    }

    let sliceIndex = 0;
    const lastAscendingPitchClass = ascendingMaqamPitchClasses[ascendingMaqamPitchClasses.length - 1];

    for (let i = 0; i < ascendingMaqamPitchClasses.length; i++) {
      if (parseFloat(ascendingMaqamPitchClasses[i].frequency) * 2 <= parseFloat(lastAscendingPitchClass.frequency)) {
        sliceIndex = i + 1;
      }
    }

    const extendedAscendingPitchClasses = [
      ...ascendingMaqamPitchClasses,
      ...ascendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
      ...ascendingMaqamPitchClasses.slice(0, sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ...ascendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
    ];

    const extendedDescendingPitchClasses = [
      ...descendingMaqamPitchClasses,
      ...descendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
      ...descendingMaqamPitchClasses.slice(0, sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ...descendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
    ];

    for (let i = 0; i <= 12; i++) {
      const ascendingPitchClass = extendedAscendingPitchClasses[i];
      const descendingPitchClass = extendedDescendingPitchClasses[i];
      const ascendingShiftedPitchClass = shiftPitchClass(allPitchClasses, ascendingPitchClass, -1);

      pitchClassMapping[firstRowCodes[i]] = descendingPitchClass;
      pitchClassMapping[secondRowCodes[i]] = ascendingPitchClass;
      pitchClassMapping[thirdRowCodes[i]] = ascendingShiftedPitchClass;
    }
  } else {
    for (let i = 0; i < selectedPitchClasses.length; i++) {
      const pitchClass = selectedPitchClasses[i];
      const loweredOctavePitchClass = shiftPitchClass(allPitchClasses, pitchClass, -1);
      pitchClassMapping[secondRowCodes[i]] = pitchClass;
      pitchClassMapping[thirdRowCodes[i]] = loweredOctavePitchClass;
    }
  }

  useEffect(() => {
    const addActive = (pitchClass: PitchClass) => {
      // Use defaultNoteVelocity for QWERTY input
      noteOn(pitchClass, defaultNoteVelocity);
      setActivePitchClasses((prev) =>
        prev.some((c) => c.index === pitchClass.index && c.octave === pitchClass.octave) ? prev : [...prev, pitchClass]
      );
    };

    const removeActive = (pitchClass: PitchClass) => {
      noteOff(pitchClass);
      setActivePitchClasses((prev) => prev.filter((c) => !(c.index === pitchClass.index && c.octave === pitchClass.octave)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || soundSettings.inputType !== "QWERTY") return;

      const pitchClass = pitchClassMapping[e.code];

      if (pitchClass) addActive(pitchClass);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || soundSettings.inputType !== "QWERTY") return;

      const pitchClass = pitchClassMapping[e.code];

      if (pitchClass) removeActive(pitchClass);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedPitchClasses, selectedMaqamDetails, selectedMaqam, allPitchClasses, noteOn, noteOff, setActivePitchClasses]);

  return null;
}
