"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import Pattern, { PatternNote, SCALE_DEGREES, DURATION_OPTIONS } from "@/models/Pattern";
import { nanoid } from "nanoid";
import { updatePatterns } from "@/functions/update";

export default function PatternsManager() {
  const { patterns, setPatterns } = useAppContext();
  const [patternId, setPatternId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [notes, setNotes] = useState<PatternNote[]>([]);

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
      setNotes(sel.getNotes().map((n) => ({ ...n }))); // clone
    } else {
      resetForm();
    }
  }, [patternId, patterns]);

  // Handle adding a new empty note
  const addNote = () => {
    setNotes((prev) => [...prev, { scaleDegree: "I", noteDuration: "8n", isTarget: false }]);
  };

  // Remove note at index
  const removeNote = (i: number) => {
    setNotes((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Update a field on a note
  const updateNote = (i: number, field: keyof PatternNote, val: string) => {
  setNotes((prev) =>
    prev.map((n, idx) => {
      if (idx === i) {
        if (field === "isTarget") {
          return { ...n, isTarget: val === "Target" } as PatternNote;
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

  return (
    <div className="patterns-manager">
      <h2 className="patterns-manager__header">Patterns</h2>
      <form className="patterns-manager__form" onSubmit={handleSave}>
        <div className="patterns-manager__group">
          <div className="patterns-manager__group">
            <div className="patterns-manager__input-container">
              <label className="patterns-manager__label" htmlFor="patternSelect">
                Select Pattern or Create New:
              </label>
              <select id="patternSelect" className="patterns-manager__select" value={patternId} onChange={(e) => setPatternId(e.target.value)}>
                <option value="">-- New Pattern --</option>
                {patterns.map((p) => (
                  <option key={p.getId()} value={p.getId()}>
                    {p.getName()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="patterns-manager__input-container">
            <label className="patterns-manager__label">Name</label>
            <input className="patterns-manager__input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>

        <div className="patterns-manager__notes-section">
          <h3 className="patterns-manager__notes-header">
            Notes{" "}
            <button type="button" className="patterns-manager__add-note" onClick={addNote}>
              + Add Note
            </button>
          </h3>

          <div className="patterns-manager__notes">
            {notes.map((note, i) => (
              <div key={i} className="patterns-manager__note">
                <select
                  className="patterns-manager__note-scaleDegree"
                  value={note.scaleDegree}
                  onChange={(e) => updateNote(i, "scaleDegree", e.target.value)}
                  required
                >
                  <option value="R">Rest</option>
                  {SCALE_DEGREES.map((rn) => (
                    (rn !== "R" && <option key={rn} value={rn}>
                      {rn}
                    </option>)
                  ))}
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
                  className="patterns-manager__note-duration"
                  value={note.isTarget ? "Target" : ""}
                  onChange={(e) => updateNote(i, "isTarget", e.target.value)}
                >
                  <option value="Target">Target</option>
                  <option value="">Not Target</option>
                </select>
                <button type="button" className="patterns-manager__delete-note" onClick={() => removeNote(i)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="patterns-manager__buttons">
          <button type="submit" className="patterns-manager__save-button">
            {patternId ? "Update Pattern" : "Save Pattern"}
          </button>
          {patternId && (
            <button type="button" className="patterns-manager__delete-button" onClick={handleDelete}>
              Delete Pattern
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
