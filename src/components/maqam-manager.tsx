"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "@/contexts/app-context";
import { useFilterContext } from "@/contexts/filter-context";
import Maqam from "@/models/Maqam";
import { getMaqamTranspositions } from "@/functions/transpose";
import { updateMaqamat } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";

export default function MaqamManager({ admin }: { admin: boolean }) {
  const {
    maqamat,
    setMaqamat,
    selectedMaqam,
    setSelectedMaqam,
    selectedCellDetails,
    setSelectedCells,
    allCellDetails,
    clearSelections,
    handleClickMaqam,
    checkIfMaqamIsSelectable,
    sources,
    selectedTuningSystem,
  } = useAppContext();

  const { maqamatFilter, setMaqamatFilter } = useFilterContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(
    selectedMaqam?.getCommentsEnglish() ?? ""
  );
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(
    selectedMaqam?.getCommentsArabic() ?? ""
  );

  const tabs = [
    "all",
    "yegāh",
    "ʿushayrān",
    "ʿajam ʿushayrān",
    "ʿirāq",
    "rāst",
    "dūgāh",
    "segāh",
    "chahargāh",
  ];

  // Sync local state when a different maqam is selected
  useEffect(() => {
    if (selectedMaqam) {
      setCommentsEnglishLocal(selectedMaqam.getCommentsEnglish());
      setCommentsArabicLocal(selectedMaqam.getCommentsArabic());
    }
  }, [selectedMaqam]);

  const maqamTranspositions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getMaqamTranspositions>>();
    maqamat.forEach((maqam) => {
      map.set(
        maqam.getId(),
        getMaqamTranspositions(allCellDetails, maqam, true)
      );
    });
    return map;
  }, [maqamat, allCellDetails]);

  const numberOfPitchClasses = selectedTuningSystem
    ? selectedTuningSystem.getPitchClasses().length
    : 0;

  const sortedMaqamat = [...maqamat].sort((a, b) =>
    a.getName().localeCompare(b.getName())
  );

  // Generate new unique ID
  const setOfMaqamat = new Set(maqamat.map((m) => m.getId()));
  let newMaqamIdNum = 1;
  while (setOfMaqamat.has(newMaqamIdNum.toString())) newMaqamIdNum++;
  const newMaqamId = newMaqamIdNum.toString();

  const selectedCellNoteNames = selectedCellDetails.map((d) => d.noteName);

  // Base save logic
  const handleSaveMaqam = async (maqam: Maqam) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateMaqamat([...others, maqam]);
    setMaqamat([...others, maqam]);
    setSelectedMaqam(maqam);
  };

  // Save ascending row
  const handleSaveAscending = async () => {
    if (!selectedMaqam) return;
    const descendingNames =
      selectedMaqam.getDescendingNoteNames().length > 0
        ? selectedMaqam.getDescendingNoteNames()
        : [...selectedCellNoteNames].reverse();

    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedCellNoteNames,
      descendingNames,
      selectedMaqam.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqam.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Save descending row
  const handleSaveDescending = async () => {
    if (!selectedMaqam) return;
    const updated = new Maqam(
      selectedMaqam.getId(),
      selectedMaqam.getName(),
      selectedMaqam.getAscendingNoteNames(),
      [...selectedCellNoteNames].reverse(),
      selectedMaqam.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqam.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Delete maqam
  const handleDeleteMaqam = async () => {
    if (!selectedMaqam) return;
    const filtered = maqamat.filter((m) => m.getId() !== selectedMaqam.getId());
    await updateMaqamat(filtered);
    setMaqamat(filtered);
    setSelectedMaqam(null);
    setSelectedCells([]);
  };

  // Source refs handlers omitted for brevity (same as before)
  const updateSourceRefs = (
    refs: SourcePageReference[],
    index: number,
    newRef: Partial<SourcePageReference>
  ) => {
    if (!selectedMaqam) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedMaqam(
      selectedMaqam.createMaqamWithNewSourcePageReferences(list)
    );
  };

  const removeSourceRef = (index: number) => {
    if (!selectedMaqam) return;
    const refs = selectedMaqam.getSourcePageReferences() || [];
    setSelectedMaqam(
      selectedMaqam.createMaqamWithNewSourcePageReferences(
        refs.filter((_, i) => i !== index)
      )
    );
  };

  const addSourceRef = () => {
    if (!selectedMaqam) return;
    const refs = selectedMaqam.getSourcePageReferences() || [];
    setSelectedMaqam(
      selectedMaqam.createMaqamWithNewSourcePageReferences([
        ...refs,
        { sourceId: "", page: "" },
      ])
    );
  };

  const filteredMaqamat = useMemo(() => {
    if (maqamatFilter === "all") return sortedMaqamat;
    return sortedMaqamat.filter(
      (maqam) =>
        maqam.getAscendingNoteNames()[0]?.toLowerCase() ===
        maqamatFilter.toLowerCase()
    );
  }, [sortedMaqamat, maqamatFilter]);

  return (
    <div className="maqam-manager">
      {/* Tabs for filtering maqamat by starting note name */}
      <div className="maqam-manager__tabs">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === "all") {
            count = sortedMaqamat.length;
          } else {
            count = sortedMaqamat.filter(
              (maqam) =>
                maqam.getAscendingNoteNames()[0]?.toLowerCase() ===
                tab.toLowerCase()
            ).length;
          }
          return (
            <button
              key={tab}
              className={
                "maqam-manager__tab" +
                (maqamatFilter === tab ? " maqam-manager__tab_active" : "")
              }
              onClick={() => setMaqamatFilter(tab)}
            >
              {tab} <span className="maqam-manager__tab-count">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="maqam-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => {
            const c = document.querySelector(".maqam-manager__list");
            if (c) c.scrollBy({ left: -670, behavior: "smooth" });
          }}
        >
          ‹
        </button>
        <div className="maqam-manager__list">
          {filteredMaqamat.map((maqam, idx) => {
            const selectable = checkIfMaqamIsSelectable(maqam);
            const numberOfTranspositions =
              maqamTranspositions.get(maqam.getId())?.length || 0;
            return (
              <div
                key={idx}
                className={`maqam-manager__item ${
                  maqam.getName() === selectedMaqam?.getName()
                    ? "maqam-manager__item_selected "
                    : ""
                }${selectable ? "maqam-manager__item_active" : ""}`}
                onClick={() => selectable && handleClickMaqam(maqam)}
              >
                <div className="maqam-manager__item-name">
                  <strong>{`${maqam.getName()}${
                    !maqam.isMaqamSymmetric() ? "*" : ""
                  }`}</strong>
                  {selectable && (
                    <strong className="maqam-manager__item-name-transpositions">
                      {`Transpositions: ${numberOfTranspositions}/${numberOfPitchClasses}`}
                    </strong>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => {
            const c = document.querySelector(".maqam-manager__list");
            if (c) c.scrollBy({ left: 520, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>

      {admin && !selectedMaqam && (
        <button
          onClick={() =>
            setSelectedMaqam(new Maqam(newMaqamId, "", [], [], [], "", "", []))
          }
          className="maqam-manager__create-new-maqam-button"
        >
          Create New Maqam
        </button>
      )}

      {admin && selectedMaqam && (
        <div className="maqam-manager__maqam-form">
          <div className="maqam-manager__group">
            <input
              type="text"
              value={selectedMaqam.getName()}
              onChange={(e) =>
                setSelectedMaqam(
                  new Maqam(
                    selectedMaqam.getId(),
                    e.target.value,
                    selectedMaqam.getAscendingNoteNames(),
                    selectedMaqam.getDescendingNoteNames(),
                    selectedMaqam.getSuyūr(),
                    selectedMaqam.getCommentsEnglish(), // comments unchanged
                    selectedMaqam.getCommentsArabic(),
                    selectedMaqam.getSourcePageReferences()
                  )
                )
              }
              placeholder="Enter maqam name"
              className="maqam-manager__maqam-input"
            />
            <button
              onClick={() => {
                if (!selectedMaqam) return;
                const updated = new Maqam(
                  selectedMaqam.getId(),
                  selectedMaqam.getName(),
                  selectedMaqam.getAscendingNoteNames(),
                  selectedMaqam.getDescendingNoteNames(),
                  selectedMaqam.getSuyūr(),
                  commentsEnglishLocal,
                  commentsArabicLocal,
                  selectedMaqam.getSourcePageReferences()
                );
                handleSaveMaqam(updated);
              }}
              className="maqam-manager__save-button"
            >
              Save Details
            </button>
            <button
              onClick={handleSaveAscending}
              className="maqam-manager__save-button"
            >
              Save Ascending
            </button>
            <button
              onClick={handleSaveDescending}
              className="maqam-manager__save-button"
            >
              Save Descending
            </button>
            <button
              onClick={handleDeleteMaqam}
              className="maqam-manager__delete-button"
            >
              Delete
            </button>
            <button
              onClick={clearSelections}
              className="maqam-manager__clear-button"
            >
              Clear
            </button>
          </div>

          <div className="maqam-manager__group">
            <button
              className="maqam-manager__source-add-button"
              onClick={addSourceRef}
            >
              Add Source
            </button>
            {selectedMaqam.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="maqam-manager__source-item">
                <select
                  className="maqam-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) =>
                    updateSourceRefs(
                      selectedMaqam.getSourcePageReferences(),
                      idx,
                      { sourceId: e.target.value }
                    )
                  }
                >
                  <option value="">Select source</option>
                  {sources.map((s) => (
                    <option key={s.getId()} value={s.getId()}>
                      {s.getTitleEnglish()}
                    </option>
                  ))}
                </select>
                <input
                  className="maqam-manager__source-input"
                  type="text"
                  value={ref.page}
                  placeholder="Page"
                  onChange={(e) =>
                    updateSourceRefs(
                      selectedMaqam.getSourcePageReferences(),
                      idx,
                      { page: e.target.value }
                    )
                  }
                />
                <button
                  className="maqam-manager__source-delete-button"
                  onClick={() => removeSourceRef(idx)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Comments fields with local state */}
          <div className="maqam-manager__group">
            <div className="maqam-manager__input-container">
              <label
                className="maqam-manager__label"
                htmlFor="commentsEnglishField"
              >
                Comments (English)
              </label>
              <textarea
                rows={5}
                className="maqam-manager__input"
                id="commentsEnglishField"
                value={commentsEnglishLocal}
                onChange={(e) => setCommentsEnglishLocal(e.target.value)}
              />
            </div>
            <div className="maqam-manager__input-container">
              <label
                className="maqam-manager__label"
                htmlFor="commentsArabicField"
              >
                Comments (Arabic)
              </label>
              <textarea
                rows={5}
                className="maqam-manager__input"
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
