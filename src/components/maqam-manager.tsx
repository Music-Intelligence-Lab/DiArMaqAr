"use client";

import React, { useState, useEffect, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import MaqamTemplate from "@/models/Maqam";
import { getMaqamTranspositions } from "@/functions/transpose";
import { updateMaqamat } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";

export default function MaqamManager({ admin }: { admin: boolean }) {
  const {
    maqamat,
    setMaqamat,
    ajnas,
    selectedMaqamTemplate,
    setSelectedMaqamTemplate,
    selectedPitchClasses,
    setSelectedPitchClasses,
    allPitchClasses,
    clearSelections,
    handleClickMaqam,
    sources,
    selectedTuningSystem,
  } = useAppContext();

  const { maqamatFilter, setMaqamatFilter } = useFilterContext();

  const { clearHangingNotes } = useSoundContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedMaqamTemplate?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedMaqamTemplate?.getCommentsArabic() ?? "");

  // Dynamic note names for tabs ordered by allPitchClasses.noteName
  const tabs = useMemo(() => {
    const uniqueNoteNames = new Set<string>();
    maqamat.forEach((maqam) => {
      const firstNote = maqam.getAscendingNoteNames()[0]?.toLowerCase();
      if (firstNote) uniqueNoteNames.add(firstNote);
    });
    const orderedByPitchClasses = allPitchClasses.map((pc) => pc.noteName.toLowerCase()).filter((name) => uniqueNoteNames.has(name));
    return ["all", ...orderedByPitchClasses];
  }, [maqamat, allPitchClasses]);

  // Sync local state when a different maqam is selected
  useEffect(() => {
    if (selectedMaqamTemplate) {
      setCommentsEnglishLocal(selectedMaqamTemplate.getCommentsEnglish());
      setCommentsArabicLocal(selectedMaqamTemplate.getCommentsArabic());
    }
  }, [selectedMaqamTemplate]);

  const maqamTranspositions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getMaqamTranspositions>>();
    maqamat.forEach((maqam) => {
      map.set(maqam.getId(), getMaqamTranspositions(allPitchClasses, ajnas, maqam, true));
    });
    return map;
  }, [maqamat, allPitchClasses, ajnas]);

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getPitchClasses().length : 0;

  const sortedMaqamat = [...maqamat].sort((a, b) => a.getName().localeCompare(b.getName()));

  // Generate new unique ID
  const setOfMaqamat = new Set(maqamat.map((m) => m.getId()));
  let newMaqamIdNum = 1;
  while (setOfMaqamat.has(newMaqamIdNum.toString())) newMaqamIdNum++;
  const newMaqamId = newMaqamIdNum.toString();

  const selectedCellNoteNames = selectedPitchClasses.map((d) => d.noteName);

  // Base save logic
  const handleSaveMaqam = async (maqam: MaqamTemplate) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateMaqamat([...others, maqam]);
    setMaqamat([...others, maqam]);
    setSelectedMaqamTemplate(maqam);
  };

  // Save ascending row
  const handleSaveAscending = async () => {
    if (!selectedMaqamTemplate) return;
    const descendingNames = selectedMaqamTemplate.getDescendingNoteNames().length > 0 ? selectedMaqamTemplate.getDescendingNoteNames() : [...selectedCellNoteNames].reverse();

    const updated = new MaqamTemplate(
      selectedMaqamTemplate.getId(),
      selectedMaqamTemplate.getName(),
      selectedCellNoteNames,
      descendingNames,
      selectedMaqamTemplate.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqamTemplate.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Save descending row
  const handleSaveDescending = async () => {
    if (!selectedMaqamTemplate) return;
    const updated = new MaqamTemplate(
      selectedMaqamTemplate.getId(),
      selectedMaqamTemplate.getName(),
      selectedMaqamTemplate.getAscendingNoteNames(),
      [...selectedCellNoteNames].reverse(),
      selectedMaqamTemplate.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqamTemplate.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Delete maqam
  const handleDeleteMaqam = async () => {
    if (!selectedMaqamTemplate) return;
    const filtered = maqamat.filter((m) => m.getId() !== selectedMaqamTemplate.getId());
    await updateMaqamat(filtered);
    setMaqamat(filtered);
    setSelectedMaqamTemplate(null);
    setSelectedPitchClasses([]);
  };

  // Source refs handlers omitted for brevity (same as before)
  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedMaqamTemplate) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedMaqamTemplate(selectedMaqamTemplate.createMaqamWithNewSourcePageReferences(list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedMaqamTemplate) return;
    const refs = selectedMaqamTemplate.getSourcePageReferences() || [];
    setSelectedMaqamTemplate(selectedMaqamTemplate.createMaqamWithNewSourcePageReferences(refs.filter((_, i) => i !== index)));
  };

  const addSourceRef = () => {
    if (!selectedMaqamTemplate) return;
    const refs = selectedMaqamTemplate.getSourcePageReferences() || [];
    setSelectedMaqamTemplate(selectedMaqamTemplate.createMaqamWithNewSourcePageReferences([...refs, { sourceId: "", page: "" }]));
  };

  const filteredMaqamat = useMemo(() => {
    if (maqamatFilter === "all") return sortedMaqamat;
    return sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === maqamatFilter.toLowerCase());
  }, [sortedMaqamat, maqamatFilter]);

  const numberOfRows = 3; // Fixed number of rows
  const numberOfColumns = Math.ceil(filteredMaqamat.length / numberOfRows); // Calculate columns dynamically

  return (
    <div className="maqam-manager">
      {/* Tabs for filtering maqamat by starting note name */}
      <div className="maqam-manager__tabs">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === "all") {
            count = sortedMaqamat.length;
          } else {
            count = sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === tab.toLowerCase()).length;
          }
          return (
            <button key={tab} className={"maqam-manager__tab" + (maqamatFilter === tab ? " maqam-manager__tab_active" : "")} onClick={() => setMaqamatFilter(tab)}>
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
        <div
          className="maqam-manager__list"
          style={{
            gridTemplateColumns: `repeat(${numberOfColumns}, minmax(250px, 1fr))`,
          }}
        >
          {filteredMaqamat.map((maqamTemplate, idx) => {
            const selectable = maqamTemplate.isMaqamSelectable(allPitchClasses.map((pitchClass) => pitchClass.noteName));
            const numberOfTranspositions = maqamTranspositions.get(maqamTemplate.getId())?.filter((transposition) => transposition.ascendingPitchClasses[0]?.octave === 1).length || 0;
            return (
              <div
                key={idx}
                className={`maqam-manager__item ${maqamTemplate.getName() === selectedMaqamTemplate?.getName() ? "maqam-manager__item_selected " : ""}${selectable ? "maqam-manager__item_active" : ""}`}
                onClick={() => {
                  if (selectable) {
                    handleClickMaqam(maqamTemplate);
                    clearHangingNotes();
                  }
                }}
              >
                <div className="maqam-manager__item-name">
                  <strong>{`${maqamTemplate.getName()}${!maqamTemplate.isMaqamSymmetric() ? "*" : ""}`}</strong>
                  {selectable && <strong className="maqam-manager__item-name-transpositions">{`Transpositions: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
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

      {admin && !selectedMaqamTemplate && (
        <button onClick={() => setSelectedMaqamTemplate(new MaqamTemplate(newMaqamId, "", [], [], [], "", "", []))} className="maqam-manager__create-new-maqam-button">
          Create New Maqam
        </button>
      )}

      {admin && selectedMaqamTemplate && (
        <div className="maqam-manager__maqam-form">
          <div className="maqam-manager__group">
            <input
              type="text"
              value={selectedMaqamTemplate.getName()}
              onChange={(e) =>
                setSelectedMaqamTemplate(
                  new MaqamTemplate(
                    selectedMaqamTemplate.getId(),
                    e.target.value,
                    selectedMaqamTemplate.getAscendingNoteNames(),
                    selectedMaqamTemplate.getDescendingNoteNames(),
                    selectedMaqamTemplate.getSuyūr(),
                    selectedMaqamTemplate.getCommentsEnglish(), // comments unchanged
                    selectedMaqamTemplate.getCommentsArabic(),
                    selectedMaqamTemplate.getSourcePageReferences()
                  )
                )
              }
              placeholder="Enter maqam name"
              className="maqam-manager__maqam-input"
            />
            <button
              onClick={() => {
                if (!selectedMaqamTemplate) return;
                const updated = new MaqamTemplate(
                  selectedMaqamTemplate.getId(),
                  selectedMaqamTemplate.getName(),
                  selectedMaqamTemplate.getAscendingNoteNames(),
                  selectedMaqamTemplate.getDescendingNoteNames(),
                  selectedMaqamTemplate.getSuyūr(),
                  commentsEnglishLocal,
                  commentsArabicLocal,
                  selectedMaqamTemplate.getSourcePageReferences()
                );
                handleSaveMaqam(updated);
              }}
              className="maqam-manager__save-button"
            >
              Save Name
            </button>
            <button onClick={handleSaveAscending} className="maqam-manager__save-button">
              Save Ascending
            </button>
            <button onClick={handleSaveDescending} className="maqam-manager__save-button">
              Save Descending
            </button>
            <button onClick={handleDeleteMaqam} className="maqam-manager__delete-button">
              Delete
            </button>
            <button onClick={clearSelections} className="maqam-manager__clear-button">
              Clear
            </button>
          </div>

          <div className="maqam-manager__group">
            <button className="maqam-manager__source-add-button" onClick={addSourceRef}>
              Add Source
            </button>
            {selectedMaqamTemplate.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="maqam-manager__source-item">
                <select
                  className="maqam-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedMaqamTemplate.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                >
                  <option value="">Select source</option>
                  {[...sources]
                    .sort((a, b) => a.getTitleEnglish().localeCompare(b.getTitleEnglish()))
                    .map((s) => (
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
                  onChange={(e) => updateSourceRefs(selectedMaqamTemplate.getSourcePageReferences(), idx, { page: e.target.value })}
                />
                <button className="maqam-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Comments fields with local state */}
          <div className="maqam-manager__group">
            <div className="maqam-manager__input-container">
              <label className="maqam-manager__label" htmlFor="commentsEnglishField">
                Comments (English)
              </label>
              <textarea rows={5} className="maqam-manager__input" id="commentsEnglishField" value={commentsEnglishLocal} onChange={(e) => setCommentsEnglishLocal(e.target.value)} />
            </div>
            <div className="maqam-manager__input-container">
              <label className="maqam-manager__label" htmlFor="commentsArabicField">
                Comments (Arabic)
              </label>
              <textarea rows={5} className="maqam-manager__input" id="commentsArabicField" value={commentsArabicLocal} onChange={(e) => setCommentsArabicLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
