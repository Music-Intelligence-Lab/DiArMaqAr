"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import Maqam, { Seir, SeirStop } from "@/models/Maqam";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import { nanoid } from "nanoid";

export default function SeirManager() {
  const { selectedMaqam, setSelectedMaqam, ajnas } = useAppContext();

  const [seirId, setSeirId] = useState<string>("");
  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [sourceEnglish, setSourceEnglish] = useState("");
  const [sourceArabic, setSourceArabic] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  const [stops, setStops] = useState<SeirStop[]>([]);

  const resetForm = () => {
    setCreatorEnglish("");
    setCreatorArabic("");
    setSourceEnglish("");
    setSourceArabic("");
    setYear("");
    setPage("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setStops([]);
  };

  useEffect(() => {
    setSeirId("");
    resetForm();
  }, [selectedMaqam]);

  useEffect(() => {
    if (selectedMaqam && seirId) {
      const sel = selectedMaqam.getSuyur().find((s) => s.id === seirId);
      if (sel) {
        setCreatorEnglish(sel.creatorEnglish);
        setCreatorArabic(sel.creatorArabic);
        setSourceEnglish(sel.sourceEnglish);
        setSourceArabic(sel.sourceArabic);
        setYear(sel.year);
        setPage(sel.page);
        setCommentsEnglish(sel.commentsEnglish);
        setCommentsArabic(sel.commentsArabic);
        setStops(sel.stops.map((s) => ({ ...s })));
        return;
      }
    }
    resetForm();
  }, [seirId, selectedMaqam]);

  if (!selectedMaqam) return null;
  const existing = selectedMaqam.getSuyur();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => setSeirId(e.target.value);
  const addStop = () => setStops((prev) => [...prev, { type: "note", value: "" }]);
  const removeStop = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof SeirStop, val: string) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const idUse = seirId || nanoid();
    const newSeir: Seir = {
      id: idUse,
      creatorEnglish,
      creatorArabic,
      sourceEnglish,
      sourceArabic,
      year,
      page,
      commentsEnglish,
      commentsArabic,
      stops,
    };
    const updated = existing.some((s) => s.id === idUse) ? existing.map((s) => (s.id === idUse ? newSeir : s)) : [...existing, newSeir];
    const updatedM = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      selectedMaqam.getDescendingNoteNames(),
      updated
    );
    setSelectedMaqam(updatedM);
    setSeirId(idUse);
  };

  const handleDelete = () => {
    if (!seirId) return;
    const filtered = existing.filter((s) => s.id !== seirId);
    const updatedM = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      selectedMaqam.getDescendingNoteNames(),
      filtered
    );
    setSelectedMaqam(updatedM);
    setSeirId("");
  };

  return (
    <div className="seir-manager">
      <h2 className="seir-manager__header">Seir Manager</h2>

      <div className="seir-manager__group">
        <div className="seir-manager__input-container">
          <label className="seir-manager__label" htmlFor="seirSelect">
            Select Seir or Create New:
          </label>
          <select id="seirSelect" className="seir-manager__select" value={seirId} onChange={handleSelect}>
            <option value="">-- New Seir --</option>
            {existing.map((s) => (
              <option key={s.id} value={s.id}>
                {s.creatorEnglish} ({s.year || "NA"})
              </option>
            ))}
          </select>
        </div>
      </div>

      <form className="seir-manager__form" onSubmit={handleSave}>
        <div className="seir-manager__group">
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Creator (English)</label>
            <input className="seir-manager__input" type="text" value={creatorEnglish} onChange={(e) => setCreatorEnglish(e.target.value)} />
          </div>
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Creator (Arabic)</label>
            <input className="seir-manager__input" type="text" value={creatorArabic} onChange={(e) => setCreatorArabic(e.target.value)} />
          </div>
        </div>

        <div className="seir-manager__group">
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Source (English)</label>
            <input className="seir-manager__input" type="text" value={sourceEnglish} onChange={(e) => setSourceEnglish(e.target.value)} />
          </div>
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Source (Arabic)</label>
            <input className="seir-manager__input" type="text" value={sourceArabic} onChange={(e) => setSourceArabic(e.target.value)} />
          </div>
        </div>

        <div className="seir-manager__group">
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Year</label>
            <input className="seir-manager__input" type="text" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Page</label>
            <input className="seir-manager__input" type="text" value={page} onChange={(e) => setPage(e.target.value)} />
          </div>
        </div>

        <div className="seir-manager__group">
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Comments (English)</label>
            <textarea className="seir-manager__textarea" rows={3} value={commentsEnglish} onChange={(e) => setCommentsEnglish(e.target.value)} />
          </div>
          <div className="seir-manager__input-container">
            <label className="seir-manager__label">Comments (Arabic)</label>
            <textarea className="seir-manager__textarea" rows={3} value={commentsArabic} onChange={(e) => setCommentsArabic(e.target.value)} />
          </div>
        </div>

        <div className="seir-manager__stops-section">
          <h3 className="seir-manager__stops-header">
            Stops{" "}
            <button type="button" className="seir-manager__add-stop" onClick={addStop}>
              + Add Stop
            </button>
          </h3>

          <div className="seir-manager__stops">
            {stops.map((stop, i) => (
              <div key={i} className="seir-manager__stop">
                <select className="seir-manager__stop-type" value={stop.type} onChange={(e) => updateStop(i, "type", e.target.value)}>
                  <option value="note">note</option>
                  <option value="jins">jins</option>
                  <option value="direction">direction</option>
                </select>

                {/* --- note stop --- */}
                {stop.type === "note" && (
                  <select className="seir-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                    <option value="">(none)</option>
                    {octaveOneNoteNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option disabled>---</option>
                    {octaveTwoNoteNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                )}

                {/* --- jins stop (updated) --- */}
                {stop.type === "jins" && (
                  <>
                    {/* 1) select which jins */}
                    <select className="seir-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                      <option value="">(none)</option>
                      {ajnas.map((j) => (
                        <option key={j.getId()} value={j.getId()}>
                          {j.getName()}
                        </option>
                      ))}
                    </select>

                    {/* 2) optional starting note for this jins */}
                    <select
                      className="seir-manager__stop-value"
                      value={stop.startingNote ?? ""}
                      onChange={(e) => updateStop(i, "startingNote", e.target.value)}
                    >
                      <option value="">(none)</option>
                      {octaveOneNoteNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                      <option disabled>---</option>
                      {octaveTwoNoteNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>

                    {/* 3) optional direction for this jins */}
                    <select
                      className="seir-manager__stop-value"
                      value={stop.direction ?? ""}
                      onChange={(e) => updateStop(i, "direction", e.target.value)}
                    >
                      <option value="">(none)</option>
                      <option value="ascending">ascending</option>
                      <option value="descending">descending</option>
                    </select>
                  </>
                )}

                {/* --- direction stop --- */}
                {stop.type === "direction" && (
                  <select className="seir-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                    <option value="">(none)</option>
                    <option value="ascending">ascending</option>
                    <option value="descending">descending</option>
                  </select>
                )}

                <button type="button" className="seir-manager__delete-stop" onClick={() => removeStop(i)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="seir-manager__buttons">
          <button type="submit" className="seir-manager__save-button">
            {seirId ? "Update Seir" : "Save Seir"}
          </button>
          {seirId && (
            <button type="button" className="seir-manager__delete-button" onClick={handleDelete}>
              Delete Seir
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
