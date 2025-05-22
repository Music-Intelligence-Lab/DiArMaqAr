"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import Pattern, { PatternNote, NoteDuration } from "@/models/Pattern";
import { nanoid } from "nanoid";

const DURATION_OPTIONS: NoteDuration[] = [
  "32n",
  "32d",
  "32t",
  "16n",
  "16d",
  "16t",
  "8n",
  "8d",
  "8t",
  "4n",
  "4d",
  "4t",
  "2n",
  "2d",
  "2t",
  "1n",
  "1d",
  "1t",
];

export default function PatternsPage() {
  const { patterns, setPatterns, updateAllPatterns } = useAppContext();
  const [patternId, setPatternId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [notes, setNotes] = useState<PatternNote[]>([]);

  const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

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
    setNotes((prev) => [...prev, { scaleDegree: "", noteDuration: "4n" }]);
  };

  // Remove note at index
  const removeNote = (i: number) => {
    setNotes((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Update a field on a note
  const updateNote = (i: number, field: keyof PatternNote, val: string) => {
    setNotes((prev) => prev.map((n, idx) => (idx === i ? ({ ...n, [field]: val } as PatternNote) : n)));
  };

  // Handle save or update
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const idUse = patternId || nanoid();
    const newPattern = new Pattern(idUse, name, notes);
    const updatedList = patterns.some((p) => p.getId() === idUse)
      ? patterns.map((p) => (p.getId() === idUse ? newPattern : p))
      : [...patterns, newPattern];
    updateAllPatterns(updatedList);
    setPatterns(updatedList);
    setPatternId(idUse);
  };

  // Handle delete
  const handleDelete = () => {
    if (!patternId) return;
    const filtered = patterns.filter((p) => p.getId() !== patternId);
    updateAllPatterns(filtered);
    setPatterns(filtered);
    setPatternId("");
  };

  return (
    <div className="patterns-page">
      <h2 className="patterns-page__header">Patterns</h2>

      <form className="patterns-page__form" onSubmit={handleSave}>
        <div className="patterns-page__group">
          <div className="patterns-page__group">
            <div className="patterns-page__input-container">
              <label className="patterns-page__label" htmlFor="patternSelect">
                Select Pattern or Create New:
              </label>
              <select id="patternSelect" className="patterns-page__select" value={patternId} onChange={(e) => setPatternId(e.target.value)}>
                <option value="">-- New Pattern --</option>
                {patterns.map((p) => (
                  <option key={p.getId()} value={p.getId()}>
                    {p.getName()}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="patterns-page__input-container">
            <label className="patterns-page__label">Name</label>
            <input className="patterns-page__input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>

        <div className="patterns-page__notes-section">
          <h3 className="patterns-page__notes-header">
            Notes{" "}
            <button type="button" className="patterns-page__add-note" onClick={addNote}>
              + Add Note
            </button>
          </h3>

          <div className="patterns-page__notes">
            {notes.map((note, i) => (
              <div key={i} className="patterns-page__note">
                <select
                  className="patterns-page__note-scaleDegree"
                  value={note.scaleDegree}
                  onChange={(e) => updateNote(i, "scaleDegree", e.target.value)}
                  required
                >
                  <option value="0">Rest</option>
                  {ROMAN_NUMERALS.map((rn) => (
                    <option key={rn} value={rn}>
                      {rn}
                    </option>
                  ))}
                </select>
                <select
                  className="patterns-page__note-duration"
                  value={note.noteDuration}
                  onChange={(e) => updateNote(i, "noteDuration", e.target.value)}
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <button type="button" className="patterns-page__delete-note" onClick={() => removeNote(i)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="patterns-page__buttons">
          <button type="submit" className="patterns-page__save-button">
            {patternId ? "Update Pattern" : "Save Pattern"}
          </button>
          {patternId && (
            <button type="button" className="patterns-page__delete-button" onClick={handleDelete}>
              Delete Pattern
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
