"use client";

import { useEffect, useRef } from "react";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import clampOctaveShift from "@/functions/clampOctaveShift";

// Every key this component listens for is printable, so none of them may steal
// keystrokes from a focused form control — the admin's note-name boxes, the
// settings sidebar's number inputs, a `select`'s letter type-ahead.
const isTyping = () => {
  const el = document.activeElement;
  return (
    el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.tagName === "SELECT" || (el instanceof HTMLElement && el.isContentEditable)
  );
};

export default function KeyboardControls() {
  const { noteOn, noteOff, setActivePitchClasses, setSoundSettings, soundSettings, keyToPitchClassMapping } = useSoundContext();

  // What each held key actually started. A ref, not effect-local state: the
  // effect re-subscribes whenever keyToPitchClassMapping changes, which happens
  // every time the admin edits the selected pitch classes — an effect-local map
  // would be wiped mid-hold and strand the note.
  const heldPitchClasses = useRef(new Map<string, PitchClass>());

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
      if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || isTyping()) return;

      // Octave shift is deliberately handled before the QWERTY guard: shifting
      // the sounding octave from the computer keyboard is most useful exactly
      // when a MIDI controller is the note source. Repeats are allowed so
      // holding the key steps.
      if (e.code === "Minus" || e.code === "Equal") {
        e.preventDefault();
        const delta = e.code === "Equal" ? 1 : -1;
        setSoundSettings((prev) => ({ ...prev, octaveShift: clampOctaveShift(prev.octaveShift + delta) }));
        return;
      }

      if (e.repeat || soundSettings.inputType !== "QWERTY") return;

      const pitchClass = keyToPitchClassMapping[e.code];

      if (pitchClass) {
        heldPitchClasses.current.set(e.code, pitchClass);
        addActive(pitchClass);
      }
    };

    // Keyup releases only what keydown actually started, so it is deliberately
    // ungated by isTyping(): a key held before focus moved into a text box
    // still gets its noteOff, while a keystroke typed into that box never
    // entered the map and is a no-op. Gating on isTyping() here would strand
    // held notes; releasing by lookup instead of by map would let typing strip
    // pitch classes that playSequence or MIDI put in the active set.
    const handleKeyUp = (e: KeyboardEvent) => {
      const pitchClass = heldPitchClasses.current.get(e.code);
      if (!pitchClass) return;

      heldPitchClasses.current.delete(e.code);
      removeActive(pitchClass);
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
