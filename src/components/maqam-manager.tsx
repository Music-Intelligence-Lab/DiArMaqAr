"use client";

import React, { useState, useEffect, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import MaqamData from "@/models/Maqam";
// Transpositions now provided via TranspositionsContext
// import { getMaqamTranspositions } from "@/functions/transpose";
import { updateMaqamat } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";
import useTranspositionsContext from "@/contexts/transpositions-context";

export default function MaqamManager({ admin }: { admin: boolean }) {
  const {
    maqamat,
    setMaqamat,
    selectedMaqamData,
    setSelectedMaqamData,
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
  const { t, language, isRTL, getDisplayName } = useLanguageContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedMaqamData?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedMaqamData?.getCommentsArabic() ?? "");

  // Dynamic note names for tabs ordered by allPitchClasses.noteName
  const tabs = useMemo(() => {
    const uniqueNoteNames = new Set<string>();
    maqamat.forEach((maqam) => {
      const firstNote = maqam.getAscendingNoteNames()[0]?.toLowerCase();
      if (firstNote) uniqueNoteNames.add(firstNote);
    });
    const orderedByPitchClasses = allPitchClasses.map((pc) => pc.noteName.toLowerCase()).filter((name) => uniqueNoteNames.has(name));
    return ["all", ...orderedByPitchClasses];
  }, [maqamat, allPitchClasses, language]);

  // Sync local state when a different maqam is selected
  useEffect(() => {
    if (selectedMaqamData) {
      setCommentsEnglishLocal(selectedMaqamData.getCommentsEnglish());
      setCommentsArabicLocal(selectedMaqamData.getCommentsArabic());
    }
  }, [selectedMaqamData]);

  // Use cached map from context to avoid recomputation
  const { allMaqamTranspositionsMap } = useTranspositionsContext();

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getOriginalPitchClassValues().length : 0;

  const sortedMaqamat = [...maqamat].sort((a, b) => a.getName().localeCompare(b.getName()));

  // Generate new unique ID
  const setOfMaqamat = new Set(maqamat.map((m) => m.getId()));
  let newMaqamIdNum = 1;
  while (setOfMaqamat.has(newMaqamIdNum.toString())) newMaqamIdNum++;
  const newMaqamId = newMaqamIdNum.toString();

  const selectedCellNoteNames = selectedPitchClasses.map((d) => d.noteName);

  // Base save logic
  const handleSaveMaqam = async (maqam: MaqamData) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateMaqamat([...others, maqam]);
    setMaqamat([...others, maqam]);
    setSelectedMaqamData(maqam);
  };

  // Save ascending row
  const handleSaveAscending = async () => {
    if (!selectedMaqamData) return;
    const descendingNames = selectedMaqamData.getDescendingNoteNames().length > 0 ? selectedMaqamData.getDescendingNoteNames() : [...selectedCellNoteNames].reverse();

    const updated = new MaqamData(
      selectedMaqamData.getId(),
      selectedMaqamData.getName(),
      selectedCellNoteNames,
      descendingNames,
      selectedMaqamData.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqamData.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Save descending row
  const handleSaveDescending = async () => {
    if (!selectedMaqamData) return;
    const updated = new MaqamData(
      selectedMaqamData.getId(),
      selectedMaqamData.getName(),
      selectedMaqamData.getAscendingNoteNames(),
      [...selectedCellNoteNames].reverse(),
      selectedMaqamData.getSuyūr(),
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedMaqamData.getSourcePageReferences()
    );
    handleSaveMaqam(updated);
  };

  // Delete maqam
  const handleDeleteMaqam = async () => {
    if (!selectedMaqamData) return;
    const filtered = maqamat.filter((m) => m.getId() !== selectedMaqamData.getId());
    await updateMaqamat(filtered);
    setMaqamat(filtered);
    setSelectedMaqamData(null);
    setSelectedPitchClasses([]);
  };

  // Source refs handlers omitted for brevity (same as before)
  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedMaqamData) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedMaqamData(selectedMaqamData.createMaqamWithNewSourcePageReferences(list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedMaqamData) return;
    const refs = selectedMaqamData.getSourcePageReferences() || [];
    setSelectedMaqamData(selectedMaqamData.createMaqamWithNewSourcePageReferences(refs.filter((_, i) => i !== index)));
  };

  const addSourceRef = () => {
    if (!selectedMaqamData) return;
    const refs = selectedMaqamData.getSourcePageReferences() || [];
    setSelectedMaqamData(selectedMaqamData.createMaqamWithNewSourcePageReferences([...refs, { sourceId: "", page: "" }]));
  };

  const filteredMaqamat = useMemo(() => {
    if (maqamatFilter === "all") return sortedMaqamat;
    return sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === maqamatFilter.toLowerCase());
  }, [sortedMaqamat, maqamatFilter, language]);

  const numberOfRows = 3; // Fixed number of rows
  const numberOfColumns = Math.ceil(filteredMaqamat.length / numberOfRows); // Calculate columns dynamically

  return (
    <div className="maqam-manager" key={language}>
      {/* Tabs for filtering maqamat by starting note name */}
      <div className="maqam-manager__tabs">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === "all") {
            count = sortedMaqamat.length;
          } else {
            count = sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === tab.toLowerCase()).length;
          }
          const displayName = tab === "all" ? t('maqam.all') : getDisplayName(tab, 'note');
          return (
            <button key={tab} className={"maqam-manager__tab" + (maqamatFilter === tab ? " maqam-manager__tab_active" : "")} onClick={() => setMaqamatFilter(tab)}>
              {displayName} <span className="maqam-manager__tab-count">({count})</span>
            </button>
          );
        })}
        

      </div>

      <div className="maqam-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => {
            const c = document.querySelector(".maqam-manager__list");
            if (c) c.scrollBy({ left: isRTL ? 670 : -670, behavior: "smooth" });
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
          {filteredMaqamat.map((maqamData, idx) => {
            const selectable = maqamData.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName));
            const numberOfTranspositions = allMaqamTranspositionsMap.get(maqamData.getId())?.filter((transposition: any) => transposition.ascendingPitchClasses[0]?.octave === 1).length || 0;
            return (
              <div
                key={idx}
                className={`maqam-manager__item ${maqamData.getName() === selectedMaqamData?.getName() ? "maqam-manager__item_selected " : ""}${selectable ? "maqam-manager__item_active" : ""}`}
                onClick={() => {
                  if (selectable) {
                    // Toggle functionality: if clicking the same maqam, deselect it
                    if (selectedMaqamData?.getName() === maqamData.getName()) {
                      setSelectedMaqamData(null);
                      setSelectedPitchClasses([]);
                    } else {
                      handleClickMaqam(maqamData);
                    }
                    clearHangingNotes();
                  }
                }}
              >
                <div className="maqam-manager__item-name">
                  <strong>{`${getDisplayName(maqamData.getName(), 'maqam')}${!maqamData.isMaqamSymmetric() ? "*" : ""}`}</strong>
                  {selectable && <strong className="maqam-manager__item-name-transpositions">{`${t('maqam.transpositions')}: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => {
            const c = document.querySelector(".maqam-manager__list");
            if (c) c.scrollBy({ left: isRTL ? -520 : 520, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>

      {admin && !selectedMaqamData && (
        <button onClick={() => setSelectedMaqamData(new MaqamData(newMaqamId, "", [], [], [], "", "", []))} className="maqam-manager__create-new-maqam-button">
          {t('maqam.createNewMaqam')}
        </button>
      )}

      {admin && selectedMaqamData && (
        <div className="maqam-manager__maqam-form">
          <div className="maqam-manager__group">
            <input
              type="text"
              value={selectedMaqamData.getName()}
              onChange={(e) =>
                setSelectedMaqamData(
                  new MaqamData(
                    selectedMaqamData.getId(),
                    e.target.value,
                    selectedMaqamData.getAscendingNoteNames(),
                    selectedMaqamData.getDescendingNoteNames(),
                    selectedMaqamData.getSuyūr(),
                    selectedMaqamData.getCommentsEnglish(), // comments unchanged
                    selectedMaqamData.getCommentsArabic(),
                    selectedMaqamData.getSourcePageReferences()
                  )
                )
              }
              placeholder={t('maqam.enterMaqamName')}
              className="maqam-manager__maqam-input"
            />
            <button
              onClick={() => {
                if (!selectedMaqamData) return;
                const updated = new MaqamData(
                  selectedMaqamData.getId(),
                  selectedMaqamData.getName(),
                  selectedMaqamData.getAscendingNoteNames(),
                  selectedMaqamData.getDescendingNoteNames(),
                  selectedMaqamData.getSuyūr(),
                  commentsEnglishLocal,
                  commentsArabicLocal,
                  selectedMaqamData.getSourcePageReferences()
                );
                handleSaveMaqam(updated);
              }}
              className="maqam-manager__save-button"
            >
              {t('maqam.saveName')}
            </button>
            <button onClick={handleSaveAscending} className="maqam-manager__save-button">
              {t('maqam.saveAscending')}
            </button>
            <button onClick={handleSaveDescending} className="maqam-manager__save-button">
              {t('maqam.saveDescending')}
            </button>
            <button onClick={handleDeleteMaqam} className="maqam-manager__delete-button">
              {t('maqam.delete')}
            </button>
            <button onClick={clearSelections} className="maqam-manager__clear-button">
              {t('maqam.clear')}
            </button>
          </div>

          <div className="maqam-manager__group">
            <button className="maqam-manager__source-add-button" onClick={addSourceRef}>
              {t('maqam.addSource')}
            </button>
            {selectedMaqamData.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="maqam-manager__source-item">
                <select
                  className="maqam-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedMaqamData.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                >
                  <option value="">{t('maqam.selectSource')}</option>
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
                  placeholder={t('maqam.page')}
                  onChange={(e) => updateSourceRefs(selectedMaqamData.getSourcePageReferences(), idx, { page: e.target.value })}
                />
                <button className="maqam-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                  {t('maqam.delete')}
                </button>
              </div>
            ))}
          </div>

          {/* Comments fields with local state */}
          <div className="maqam-manager__group">
            <div className="maqam-manager__input-container">
              <label className="maqam-manager__label" htmlFor="commentsEnglishField">
                {t('maqam.commentsEnglish')}
              </label>
              <textarea rows={5} className="maqam-manager__input" id="commentsEnglishField" value={commentsEnglishLocal} onChange={(e) => setCommentsEnglishLocal(e.target.value)} />
            </div>
            <div className="maqam-manager__input-container">
              <label className="maqam-manager__label" htmlFor="commentsArabicField">
                {t('maqam.commentsArabic')}
              </label>
              <textarea rows={5} className="maqam-manager__input" id="commentsArabicField" value={commentsArabicLocal} onChange={(e) => setCommentsArabicLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
