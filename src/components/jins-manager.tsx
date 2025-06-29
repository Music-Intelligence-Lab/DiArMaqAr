"use client";

import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import JinsDetails from "@/models/Jins";
import React, { useState, useEffect, useMemo } from "react";
import { getJinsTranspositions } from "@/functions/transpose";
import { updateAjnas } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";

export default function JinsManager({ admin }: { admin: boolean }) {
  const { ajnas, setAjnas, selectedTuningSystem, selectedJinsDetails, setSelectedJinsDetails, handleClickJins, selectedPitchClasses, clearSelections, allPitchClasses, sources } = useAppContext();

  const { ajnasFilter, setAjnasFilter } = useFilterContext();
  const { clearHangingNotes } = useSoundContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedJinsDetails?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedJinsDetails?.getCommentsArabic() ?? "");

  // Dynamic note names for tabs ordered by allPitchClasses.noteName
  const tabs = useMemo(() => {
    const uniqueNoteNames = new Set<string>();
    ajnas.forEach((jins) => {
      const firstNote = jins.getNoteNames()[0]?.toLowerCase();
      if (firstNote) uniqueNoteNames.add(firstNote);
    });
    const orderedByPitchClasses = allPitchClasses
      .map((pc) => pc.noteName.toLowerCase())
      .filter((name) => uniqueNoteNames.has(name));
    return ["all", ...orderedByPitchClasses];
  }, [ajnas, allPitchClasses]);

  // Sync local state when a different jins is selected
  useEffect(() => {
    if (selectedJinsDetails) {
      setCommentsEnglishLocal(selectedJinsDetails.getCommentsEnglish());
      setCommentsArabicLocal(selectedJinsDetails.getCommentsArabic());
    }
  }, [selectedJinsDetails]);

  const jinsTranspositions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getJinsTranspositions>>();
    ajnas.forEach((jins) => {
      map.set(jins.getId(), getJinsTranspositions(allPitchClasses, jins, true));
    });
    return map;
  }, [ajnas, allPitchClasses]);

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
    if (!selectedJinsDetails) return;
    const selectedNoteNames = selectedPitchClasses.map((pitchClass) => pitchClass.noteName);
    const newJins = new JinsDetails(
      selectedJinsDetails.getId(),
      selectedJinsDetails.getName(),
      selectedNoteNames,
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedJinsDetails.getSourcePageReferences()
    );
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAjnas([...newAjnas, newJins]);
    setAjnas([...newAjnas, newJins]);
  };

  const handleDeleteJins = async () => {
    if (!selectedJinsDetails) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJinsDetails.getId());
    await updateAjnas(newAjnas);
    setAjnas(newAjnas);
  };

  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedJinsDetails) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedJinsDetails(selectedJinsDetails.createJinsWithNewSourcePageReferences(list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedJinsDetails) return;
    const refs = selectedJinsDetails.getSourcePageReferences() || [];
    const newList = refs.filter((_, i) => i !== index);
    setSelectedJinsDetails(selectedJinsDetails.createJinsWithNewSourcePageReferences(newList));
  };

  const addSourceRef = () => {
    if (!selectedJinsDetails) return;
    const refs = selectedJinsDetails.getSourcePageReferences() || [];
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    setSelectedJinsDetails(selectedJinsDetails.createJinsWithNewSourcePageReferences([...refs, newRef]));
  };

  // Filter ajnas by tab
  const filteredAjnas = useMemo(() => {
    if (ajnasFilter === "all") return sortedAjnas;
    return sortedAjnas.filter((jins) => jins.getNoteNames()[0]?.toLowerCase() === ajnasFilter.toLowerCase());
  }, [sortedAjnas, ajnasFilter]);

  const numberOfRows = 3; // Fixed number of rows
  const numberOfColumns = Math.ceil(filteredAjnas.length / numberOfRows); // Calculate columns dynamically

  return (
    <div className="jins-manager">
      <div className="jins-manager__tabs">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === "all") {
            count = sortedAjnas.length;
          } else {
            count = sortedAjnas.filter((jins) => jins.getNoteNames()[0]?.toLowerCase() === tab.toLowerCase()).length;
          }
          return (
            <button key={tab} className={"jins-manager__tab" + (ajnasFilter === tab ? " jins-manager__tab_active" : "")} onClick={() => setAjnasFilter(tab)}>
              {tab} <span className="jins-manager__tab-count">({count})</span>
            </button>
          );
        })}
      </div>
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
        <div className="jins-manager__list" style={{ gridTemplateColumns: `repeat(${numberOfColumns}, minmax(250px, 1fr))` }}>
          {filteredAjnas.length === 0 ? (
            <p>No ajnas available.</p>
          ) : (
            filteredAjnas.map((jinsDetails, index) => {
              const selectable = jinsDetails.isJinsSelectable(allPitchClasses);
              const numberOfTranspositions =
                jinsTranspositions
                  .get(jinsDetails.getId())
                  ?.filter(
                    (transposition) =>
                      transposition.jinsPitchClasses[0]?.octave === 1
                  ).length || 0;
              return (
                <div
                  key={index}
                  className={"jins-manager__item " + (jinsDetails.getName() === selectedJinsDetails?.getName() ? "jins-manager__item_selected " : "") + (selectable ? "jins-manager__item_active" : "")}
                  onClick={() => {
                    if (selectable) {
                      handleClickJins(jinsDetails);
                      clearHangingNotes();
                    }
                  }}
                >
                  <div className="jins-manager__item-name">
                    <strong>{jinsDetails.getName()}</strong>
                    {selectable && <strong className="jins-manager__item-name-transpositions">{`Transpositions: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
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

      {admin && !selectedJinsDetails && (
        <button onClick={() => setSelectedJinsDetails(new JinsDetails(newJinsId, "", [], "", "", []))} className="jins-manager__create-new-jins-button">
          Create New Jins
        </button>
      )}

      {admin && selectedJinsDetails && (
        <div className="jins-manager__jins-form">
          <div className="jins-manager__group">
            <input
              type="text"
              value={selectedJinsDetails.getName()}
              onChange={(e) =>
                setSelectedJinsDetails(
                  new JinsDetails(
                    selectedJinsDetails.getId(),
                    e.target.value,
                    selectedJinsDetails.getNoteNames(),
                    selectedJinsDetails.getCommentsEnglish(), // keep comments until save
                    selectedJinsDetails.getCommentsArabic(),
                    selectedJinsDetails.getSourcePageReferences()
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
            {selectedJinsDetails && (
              <button className="jins-manager__source-add-button" onClick={addSourceRef}>
                Add Source
              </button>
            )}
            {selectedJinsDetails.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="jins-manager__source-item">
                <select
                  className="jins-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedJinsDetails.getSourcePageReferences(), idx, { sourceId: e.target.value })}
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
                  onChange={(e) => updateSourceRefs(selectedJinsDetails.getSourcePageReferences(), idx, { page: e.target.value })}
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
              <textarea rows={5} className="jins-manager__input" id="commentsEnglishField" value={commentsEnglishLocal} onChange={(e) => setCommentsEnglishLocal(e.target.value)} />
            </div>

            <div className="jins-manager__input-container">
              <label className="jins-manager__label" htmlFor="commentsArabicField">
                Comments (Arabic)
              </label>
              <textarea rows={5} className="jins-manager__input" id="commentsArabicField" value={commentsArabicLocal} onChange={(e) => setCommentsArabicLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
