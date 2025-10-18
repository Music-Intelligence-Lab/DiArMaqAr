"use client";

import { useEffect } from "react";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";

export default function KeyboardControls() {
  const { noteOn, noteOff, setActivePitchClasses, soundSettings, keyToPitchClassMapping } = useSoundContext();

  useEffect(() => {
    const addActive = (pitchClass: PitchClass) => {
      // Use defaultNoteVelocity for QWERTY input
      noteOn(pitchClass, defaultNoteVelocity);
      setActivePitchClasses((prev) =>
        prev.some((c) => c.pitchClassIndex === pitchClass.pitchClassIndex && c.octave === pitchClass.octave) ? prev : [...prev, pitchClass]
      );
    };

    const removeActive = (pitchClass: PitchClass) => {
      noteOff(pitchClass);
      setActivePitchClasses((prev) => prev.filter((c) => !(c.pitchClassIndex === pitchClass.pitchClassIndex && c.octave === pitchClass.octave)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || soundSettings.inputType !== "QWERTY") return;

      const pitchClass = keyToPitchClassMapping[e.code];

      if (pitchClass) addActive(pitchClass);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || soundSettings.inputType !== "QWERTY") return;

      const pitchClass = keyToPitchClassMapping[e.code];

      if (pitchClass) removeActive(pitchClass);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyToPitchClassMapping, noteOn, noteOff, setActivePitchClasses, soundSettings.inputType]);

  return null;
}

// const isTyping = () => {
//   const el = document.activeElement;
//   return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
// };
