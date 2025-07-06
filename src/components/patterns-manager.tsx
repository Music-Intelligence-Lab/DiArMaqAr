"use client";

import React, { FormEvent, useEffect, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, {
  defaultNoteVelocity,
  defaultTargetVelocity,
} from "@/contexts/sound-context";
import Pattern, {
  PatternNote,
  SCALE_DEGREES as scale_degrees,
  DURATION_OPTIONS,
} from "@/models/Pattern";
import { nanoid } from "nanoid";
import { updatePatterns } from "@/functions/update";

export default function PatternsManager() {
  const { patterns, setPatterns, selectedMaqamDetails, allPitchClasses } =
    useAppContext();
  const { playSequence } = useSoundContext();
  const [patternId, setPatternId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [notes, setNotes] = useState<PatternNote[]>([]);

  const maqamModel = selectedMaqamDetails
    ? selectedMaqamDetails.getTahlil(allPitchClasses)
    : null;

  const pitchClasses = maqamModel ? maqamModel.ascendingPitchClasses : [];

  // Find the selected pattern
  const selectedPattern = patterns.find((p) => p.getId() === patternId);

  // Reset form fields
  const resetForm = () => {
    setName("");
    setNotes([]);
  };

  // When selecting a pattern, load its data
  useEffect(() => {
    if (!patternId) {
      resetForm();
      return;
    }
    const sel = patterns.find((p) => p.getId() === patternId);
    if (sel) {
      setName(sel.getName());
      setNotes(
        sel.getNotes().map((n) => ({
          ...n,
          velocity:
            typeof n.velocity === "number"
              ? n.velocity
              : n.isTarget
              ? defaultTargetVelocity
              : defaultNoteVelocity,
        }))
      );
    } else {
      resetForm();
    }
  }, [patternId, patterns]);

  // Handle adding a new empty note at a given index (default to end)
  const addNote = (index?: number) => {
    setNotes((prev) => {
      const newNote = {
        scaleDegree: "I",
        noteDuration: "8n",
        isTarget: false,
        velocity: defaultNoteVelocity,
      };
      if (typeof index === "number") {
        return [
          ...prev.slice(0, index),
          newNote,
          ...prev.slice(index),
        ];
      } else {
        return [...prev, newNote];
      }
    });
  };

  // Remove note at index
  const removeNote = (i: number) => {
    setNotes((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Update a field on a note
  const updateNote = (
    i: number,
    field: keyof PatternNote,
    val: string | number
  ) => {
    setNotes((prev) =>
      prev.map((n, idx) => {
        if (idx === i) {
          if (field === "isTarget") {
            const isTarget = val === "Target";
            return {
              ...n,
              isTarget,
              velocity: isTarget
                ? defaultTargetVelocity
                : defaultNoteVelocity,
            } as PatternNote;
          }
          if (field === "velocity") {
            return { ...n, velocity: Number(val) } as PatternNote;
          }
          return { ...n, [field]: val } as PatternNote;
        }
        return n;
      })
    );
  };

  // Handle save or update
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const idUse = patternId || nanoid();
    const newPattern = new Pattern(idUse, name, notes);
    const updatedList = patterns.some((p) => p.getId() === idUse)
      ? patterns.map((p) => (p.getId() === idUse ? newPattern : p))
      : [...patterns, newPattern];
    updatePatterns(updatedList);
    setPatterns(updatedList);
    setPatternId(idUse);
  };

  // Handle delete
  const handleDelete = () => {
    if (!patternId) return;
    const filtered = patterns.filter((p) => p.getId() !== patternId);
    updatePatterns(filtered);
    setPatterns(filtered);
    setPatternId("");
  };

  const playAscending = () => {
    if (!maqamModel) return;
    playSequence(pitchClasses);
  };

  const playPattern = async () => {
    if (!maqamModel || !selectedPattern) return;
    const selectedPatternPitchClasses = selectedPattern
      .getNotes()
      .map((n: PatternNote) => {
        // Find the absolute index in SCALE_DEGREES
        const degreeIndex = scale_degrees.indexOf(n.scaleDegree);
        // First occurrence of "I" marks the start of octave degrees
        const firstDegree = scale_degrees.indexOf("I");
        // Calculate position within the maqam's seven-tone scale
        const relIndex = degreeIndex - firstDegree;
        if (relIndex < 0 || relIndex >= pitchClasses.length) {
          // Rest or out-of-range → silence (0)
          return null;
        }

        return pitchClasses[relIndex];
      });
    await playSequence(selectedPatternPitchClasses.filter((f) => f !== null));
  };

  return (
    <div className="patterns-manager">
      <h2 className="patterns-manager__header">Patterns</h2>
      <form className="patterns-manager__form" onSubmit={handleSave}>
          <div className="patterns-manager__group">
            <div className="patterns-manager__input-container">
              <label
                className="patterns-manager__label"
                htmlFor="patternSelect"
              >
                Select Pattern or Create New:
              </label>
              <select
                id="patternSelect"
                className="patterns-manager__select"
                value={patternId}
                onChange={(e) => setPatternId(e.target.value)}
              >
                <option value="">-- New Pattern --</option>
                {patterns.map((p) => (
                  <option key={p.getId()} value={p.getId()}>
                    {p.getName()}
                  </option>
                ))}
              </select>
            </div>

                      <div className="patterns-manager__input-container">
            <label className="patterns-manager__label">Name</label>
            <input
              className="patterns-manager__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          </div>
        

        <div className="patterns-manager__notes-section">
          <h3 className="patterns-manager__notes-header">Notes</h3>
          <div className="patterns-manager__notes">
            {notes.map((note, i) => (
              <React.Fragment key={i}>
                {/* Add button before each note */}
                <button
                  type="button"
                  className="patterns-manager__add-note patterns-manager__add-note--inline"
                  onClick={() => addNote(i)}
                  title="Add note here"
                >
                  +
                </button>
                <div className="patterns-manager__note">
                  <select
                    className="patterns-manager__note-scaleDegree"
                    value={note.scaleDegree}
                    onChange={(e) => updateNote(i, "scaleDegree", e.target.value)}
                    required
                  >
                    <option value="R">Rest</option>
                    {scale_degrees.map(
                      (rn) =>
                        rn !== "R" && (
                          <option key={rn} value={rn}>
                            {rn}
                          </option>
                        )
                    )}
                  </select>
                  <select
                    className="patterns-manager__note-duration"
                    value={note.noteDuration}
                    onChange={(e) => updateNote(i, "noteDuration", e.target.value)}
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    className="patterns-manager__note-target"
                    value={note.isTarget ? "Target" : ""}
                    onChange={(e) => updateNote(i, "isTarget", e.target.value)}
                  >
                    <option value="Target">Target</option>
                    <option value="">Not Target</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={127}
                    step={1}
                    className="patterns-manager__note-velocity"
                    value={
                      typeof note.velocity === "number"
                        ? note.velocity
                        : note.isTarget
                        ? defaultTargetVelocity
                        : defaultNoteVelocity
                    }
                    onChange={(e) => updateNote(i, "velocity", e.target.value)}
                    title="Velocity (1-127)"
                  />
                  <button
                    type="button"
                    className="patterns-manager__delete-note"
                    onClick={() => removeNote(i)}
                  >
                    Delete
                  </button>
                </div>
              </React.Fragment>
            ))}
            {/* Add button at the end */}
            <button
              type="button"
              className="patterns-manager__add-note patterns-manager__add-note--end"
              onClick={() => addNote(notes.length)}
              title="Add note at end"
            >
              + Add Note
            </button>
          </div>
        </div>

        <div className="patterns-manager__buttons">
          {!maqamModel && (
          <p className="patterns-manager__warning">
            Please select a Maqam before playing patterns.
          </p>
        )}

          <button className="patterns-manager__play-button" type="button" onClick={playPattern} disabled={!maqamModel}>
            Play Pattern
          </button>
          <button className="patterns-manager__play-button" type="button" onClick={playAscending} disabled={!maqamModel}>
            Play Ascending
          </button>
        
        <button type="submit" className="patterns-manager__save-button">
            {patternId ? "Update Pattern" : "Save Pattern"}
          </button>
          {patternId && (
            <button
              type="button"
              className="patterns-manager__delete-button"
              onClick={handleDelete}
            >
              Delete Pattern
            </button>
          )}
        </div>

        
      </form>
    </div>
  );
}
