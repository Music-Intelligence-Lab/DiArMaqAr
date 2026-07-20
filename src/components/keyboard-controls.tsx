"use client";

import { useEffect } from "react";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import clampOctaveShift from "@/functions/clampOctaveShift";

export default function KeyboardControls() {
  const { noteOn, noteOff, setActivePitchClasses, setSoundSettings, soundSettings, keyToPitchClassMapping } = useSoundContext();

  useEffect(() => {
    // `-` and `=` are printable, so they must not steal keystrokes from the
    // settings sidebar's number inputs (tempo, pitch bend range).
    const isTyping = () => {
      const el = document.activeElement;
      return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || (el instanceof HTMLElement && el.isContentEditable);
    };

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
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

      // Octave shift is deliberately handled before the QWERTY guard: shifting
      // the sounding octave from the computer keyboard is most useful exactly
      // when a MIDI controller is the note source. Repeats are allowed so
      // holding the key steps.
      if (!isTyping() && (e.code === "Minus" || e.code === "Equal")) {
        e.preventDefault();
        const delta = e.code === "Equal" ? 1 : -1;
        setSoundSettings((prev) => ({ ...prev, octaveShift: clampOctaveShift(prev.octaveShift + delta) }));
        return;
      }

      if (e.repeat || soundSettings.inputType !== "QWERTY") return;

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
  }, [keyToPitchClassMapping, noteOn, noteOff, setActivePitchClasses, setSoundSettings, soundSettings.inputType]);

  return null;
}
