"use client";

import { useAppContext } from "@/contexts/app-context";
import Jins from "@/models/Jins";
import React, { useState, useEffect } from "react";
import { getJinsTranspositions } from "@/functions/transpose";
import { updateAjnas } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";

export default function JinsManager({ admin }: { admin: boolean }) {
  const {
    ajnas,
    setAjnas,
    selectedTuningSystem,
    selectedJins,
    setSelectedJins,
    handleClickJins,
    checkIfJinsIsSelectable,
    selectedCellDetails,
    clearSelections,
    allCellDetails,
    sources,
  } = useAppContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedJins?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedJins?.getCommentsArabic() ?? "");

  // Sync local state when a different jins is selected
  useEffect(() => {
    if (selectedJins) {
      setCommentsEnglishLocal(selectedJins.getCommentsEnglish());
      setCommentsArabicLocal(selectedJins.getCommentsArabic());
    }
  }, [selectedJins]);

  const sortedAjnas = [...ajnas].sort((a, b) => a.getName().localeCompare(b.getName()));
  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getPitchClasses().length : 0;

  // Generate a new unique ID for creating a Jins
  const setOfAjnas = new Set(ajnas.map((j) => j.getId()));
  let newJinsIdNum = 1;
  while (setOfAjnas.has(newJinsIdNum.toString())) {
    newJinsIdNum++;
  }
  const newJinsId = newJinsIdNum.toString();

  // Save handler uses local comment state
  const handleSaveJins = async () => {
    if (!selectedJins) return;
    const selectedNoteNames = selectedCellDetails.map((cellDetails) => cellDetails.noteName);
    const newJins = new Jins(
      selectedJins.getId(),
      selectedJins.getName(),
      selectedNoteNames,
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedJins.getSourcePageReferences()
    );
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAjnas([...newAjnas, newJins]);
    setAjnas([...newAjnas, newJins]);
  };

  const handleDeleteJins = async () => {
    if (!selectedJins) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJins.getId());
    await updateAjnas(newAjnas);
    setAjnas(newAjnas);
  };

  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedJins) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedJins(selectedJins.createJinsWithNewSourcePageReferences(list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedJins) return;
    const refs = selectedJins.getSourcePageReferences() || [];
    const newList = refs.filter((_, i) => i !== index);
    setSelectedJins(selectedJins.createJinsWithNewSourcePageReferences(newList));
  };

  const addSourceRef = () => {
    if (!selectedJins) return;
    const refs = selectedJins.getSourcePageReferences() || [];
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    setSelectedJins(selectedJins.createJinsWithNewSourcePageReferences([...refs, newRef]));
  };

  return (
    <div className="jins-manager">
      <div className="jins-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => {
            const container = document.querySelector(".jins-manager__list");
            if (container) container.scrollBy({ left: -670, behavior: "smooth" });
          }}
        >
          ‹
        </button>
        <div className="jins-manager__list">
          {sortedAjnas.length === 0 ? (
            <p>No ajnas available.</p>
          ) : (
            sortedAjnas.map((jins, index) => {
              const isJinsSelectable = checkIfJinsIsSelectable(jins);
              return (
                <div
                  key={index}
                  className={
                    "jins-manager__item " +
                    (jins.getName() === selectedJins?.getName() ? "jins-manager__item_selected " : "") +
                    (isJinsSelectable ? "jins-manager__item_active" : "")
                  }
                  onClick={() => {
                    if (isJinsSelectable) handleClickJins(jins);
                  }}
                >
                  <div className="jins-manager__item-name">
                    <strong>{jins.getName()}</strong>
                    {isJinsSelectable && (
                      <strong className="jins-manager__item-name-transpositions">
                        {`Transpositions: ${getJinsTranspositions(allCellDetails, jins, true).length}/${numberOfPitchClasses}`}
                      </strong>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => {
            const container = document.querySelector(".jins-manager__list");
            if (container) container.scrollBy({ left: 520, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>

      {admin && !selectedJins && (
        <button onClick={() => setSelectedJins(new Jins(newJinsId, "", [], "", "", []))} className="jins-manager__create-new-jins-button">
          Create New Jins
        </button>
      )}

      {admin && selectedJins && (
        <div className="jins-manager__jins-form">
          <div className="jins-manager__group">
            <input
              type="text"
              value={selectedJins.getName()}
              onChange={(e) =>
                setSelectedJins(
                  new Jins(
                    selectedJins.getId(),
                    e.target.value,
                    selectedJins.getNoteNames(),
                    selectedJins.getCommentsEnglish(), // keep comments until save
                    selectedJins.getCommentsArabic(),
                    selectedJins.getSourcePageReferences()
                  )
                )
              }
              placeholder="Enter new jins name"
              className="jins-manager__jins-input"
            />
            <button onClick={handleSaveJins} className="jins-manager__save-button">
              Save
            </button>
            <button onClick={handleDeleteJins} className="jins-manager__delete-button">
              Delete
            </button>
            <button onClick={clearSelections} className="jins-manager__clear-button">
              Clear
            </button>
          </div>

          <div className="jins-manager__group">
            {selectedJins && (
              <button className="jins-manager__source-add-button" onClick={addSourceRef}>
                Add Source
              </button>
            )}
            {selectedJins.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="jins-manager__source-item">
                <select
                  className="jins-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedJins.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                >
                  <option value="">Select source</option>
                  {sources.map((s) => (
                    <option key={s.getId()} value={s.getId()}>
                      {s.getTitleEnglish()}
                    </option>
                  ))}
                </select>
                <input
                  className="jins-manager__source-input"
                  type="text"
                  value={ref.page}
                  placeholder="Page"
                  onChange={(e) => updateSourceRefs(selectedJins.getSourcePageReferences(), idx, { page: e.target.value })}
                />
                <button className="jins-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Comments fields with local state */}
          <div className="jins-manager__group">
            <div className="jins-manager__input-container">
              <label className="jins-manager__label" htmlFor="commentsEnglishField">
                Comments (English)
              </label>
              <textarea
                rows={5}
                className="jins-manager__input"
                id="commentsEnglishField"
                value={commentsEnglishLocal}
                onChange={(e) => setCommentsEnglishLocal(e.target.value)}
              />
            </div>

            <div className="jins-manager__input-container">
              <label className="jins-manager__label" htmlFor="commentsArabicField">
                Comments (Arabic)
              </label>
              <textarea
                rows={5}
                className="jins-manager__input"
                id="commentsArabicField"
                value={commentsArabicLocal}
                onChange={(e) => setCommentsArabicLocal(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
