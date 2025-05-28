"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import Maqam, { Sayr, SayrStop } from "@/models/Maqam";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import { nanoid } from "nanoid";
import { updateMaqamat } from "@/functions/update";

export default function SayrManager({ admin }: { admin: boolean }) {
  const { selectedMaqam, setSelectedMaqam, ajnas, maqamSayrId, setMaqamSayrId, sources, maqamat, setMaqamat } = useAppContext();

  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [page, setPage] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  const [stops, setStops] = useState<SayrStop[]>([]);

  const resetForm = () => {
    setCreatorEnglish("");
    setCreatorArabic("");
    setSourceId("");
    setPage("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setStops([]);
  };

  useEffect(() => {
    if (selectedMaqam && maqamSayrId) {
      const sel = selectedMaqam.getSuyūr().find((s) => s.id === maqamSayrId);
      if (sel) {
        setCreatorEnglish(sel.creatorEnglish ?? "");
        setCreatorArabic(sel.creatorArabic ?? "");
        setSourceId(sel.sourceId ?? "");
        setPage(sel.page ?? "");
        setCommentsEnglish(sel.commentsEnglish ?? "");
        setCommentsArabic(sel.commentsArabic ?? "");
        setStops(sel.stops.map((s) => ({ ...s })));
        return;
      }
    }
    resetForm();
  }, [maqamSayrId, selectedMaqam]);

  if (!selectedMaqam) return null;
  const existingSuyūr = selectedMaqam.getSuyūr();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => setMaqamSayrId(e.target.value);
  const addStop = () => setStops((prev) => [...prev, { type: "note", value: "" }]);
  const removeStop = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof SayrStop, val: string) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const idUse = maqamSayrId || nanoid();
    const newSayr: Sayr = {
      id: idUse,
      creatorEnglish,
      creatorArabic,
      sourceId,
      page,
      commentsEnglish,
      commentsArabic,
      stops,
    };
    const updated = existingSuyūr.some((s) => s.id === idUse) ? existingSuyūr.map((s) => (s.id === idUse ? newSayr : s)) : [...existingSuyūr, newSayr];
    const updatedMaqam = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      selectedMaqam.getDescendingNoteNames(),
      updated,
      selectedMaqam.getSourcePageReferences()
    );
    setSelectedMaqam(updatedMaqam);
    setMaqamSayrId(idUse);

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam]);
    setMaqamat([...others, updatedMaqam]);
  };

  const handleDelete = async () => {
    if (!maqamSayrId) return;
    const filtered = existingSuyūr.filter((s) => s.id !== maqamSayrId);
    const updatedMaqam = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      selectedMaqam.getDescendingNoteNames(),
      filtered,
      selectedMaqam.getSourcePageReferences()
    );
    setSelectedMaqam(updatedMaqam);
    setMaqamSayrId("");

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam]);
    setMaqamat([...others, updatedMaqam]);
  };

  return (
    <div className="sayr-manager">
      {admin && (
        <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label" htmlFor="sayrSelect">
              Select Sayr or Create New:
            </label>
            <select id="sayrSelect" className="sayr-manager__select" value={maqamSayrId} onChange={handleSelect}>
              <option value="">-- New Sayr --</option>
              {existingSuyūr.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.creatorEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!admin && <div className="sayr-manager__list">
            {existingSuyūr.length === 0 ? (
              <p>No suyūr available.</p>
            ) : (
              existingSuyūr.map((sayr, index) => (
                <div
                  key={index}
                  className={
                    "sayr-manager__item " +
                    (sayr.id === maqamSayrId ? "sayr-manager__item_selected " : "")
                  }
                  onClick={() => {
                    setMaqamSayrId(sayr.id);
                  }}
                >
                  {sayr.creatorEnglish}
                </div>
              ))
            )}
        </div>}

      <form className="sayr-manager__form" onSubmit={handleSave}>
        {admin && <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Creator (English)</label>
            <input className="sayr-manager__input" type="text" value={creatorEnglish} onChange={(e) => setCreatorEnglish(e.target.value)} />
          </div>
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Creator (Arabic)</label>
            <input className="sayr-manager__input" type="text" value={creatorArabic} onChange={(e) => setCreatorArabic(e.target.value)} />
          </div>
        </div>}

        {admin && <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Source</label>
            <select className="sayr-manager__select" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
              <option value="">Select source</option>
              {sources.map((s) => (
                <option key={s.getId()} value={s.getId()}>
                  {s.getTitleEnglish()}
                </option>
              ))}
            </select>
          </div>
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Page</label>
            <input className="sayr-manager__input" type="text" value={page} onChange={(e) => setPage(e.target.value)} />
          </div>
        </div>}

        {admin && <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Comments (English)</label>
            <textarea className="sayr-manager__textarea" rows={3} value={commentsEnglish} onChange={(e) => setCommentsEnglish(e.target.value)} />
          </div>
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label">Comments (Arabic)</label>
            <textarea className="sayr-manager__textarea" rows={3} value={commentsArabic} onChange={(e) => setCommentsArabic(e.target.value)} />
          </div>
        </div>}

        <div className="sayr-manager__stops-section">
          <h3 className="sayr-manager__stops-header">
            Stops{" "}
            {admin && (
              <button type="button" className="sayr-manager__add-stop" onClick={addStop}>
                + Add Stop
              </button>
            )}
          </h3>

          <div className="sayr-manager__stops">
            {stops.map((stop, i) => (
              <div key={i} className="sayr-manager__stop">
                <select className="sayr-manager__stop-type" value={stop.type} onChange={(e) => updateStop(i, "type", e.target.value)}>
                  <option value="note">note</option>
                  <option value="jins">jins</option>
                  <option value="direction">direction</option>
                </select>

                {/* --- note stop --- */}
                {stop.type === "note" && (
                  <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                    <option value="">(none)</option>
                    {octaveZeroNoteNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option disabled>---</option>
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
                    <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                      <option value="">(none)</option>
                      {ajnas.map((j) => (
                        <option key={j.getId()} value={j.getId()}>
                          {j.getName()}
                        </option>
                      ))}
                    </select>

                    {/* 2) optional starting note for this jins */}
                    <select
                      className="sayr-manager__stop-value"
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
                      className="sayr-manager__stop-value"
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
                  <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                    <option value="">(none)</option>
                    <option value="ascending">ascending</option>
                    <option value="descending">descending</option>
                  </select>
                )}

                {admin && (
                  <button type="button" className="sayr-manager__delete-stop" onClick={() => removeStop(i)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {admin && (
          <div className="sayr-manager__buttons">
            <button type="submit" className="sayr-manager__save-button">
              {maqamSayrId ? "Update Sayr" : "Save Sayr"}
            </button>
            {maqamSayrId && (
              <button type="button" className="sayr-manager__delete-button" onClick={handleDelete}>
                Delete Sayr
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
