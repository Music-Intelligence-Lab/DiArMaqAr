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
import { getBaseJinsName, getFirstJinsNameForMaqamData } from "@/functions/classifyMaqamFamily";

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

  // Toggle state for filtering mode: 'note' or 'jins' - default to 'jins'
  const [filterMode, setFilterMode] = useState<'note' | 'jins'>('jins');

  // Use cached map from context to avoid recomputation
  const { allMaqamTranspositionsMap } = useTranspositionsContext();

  // Dynamic tabs based on filter mode
  const tabs = useMemo(() => {
    if (filterMode === 'note') {
      const uniqueNoteNames = new Set<string>();
      maqamat.forEach((maqam) => {
        const firstNote = maqam.getAscendingNoteNames()[0]?.toLowerCase();
        if (firstNote) uniqueNoteNames.add(firstNote);
      });
      const orderedByPitchClasses = allPitchClasses.map((pc) => pc.noteName.toLowerCase()).filter((name) => uniqueNoteNames.has(name));
      return ["all", ...orderedByPitchClasses];
    } else {
      // Jins mode - sort by pitch class order like notes
      const jinsToStartingNote = new Map<string, string>();
      const uniqueBaseJinsNames = new Set<string>();

      maqamat.forEach((maqam) => {
        const firstJinsName = getFirstJinsNameForMaqamData(maqam, allMaqamTranspositionsMap);
        if (firstJinsName) {
          const baseJinsName = getBaseJinsName(firstJinsName).toLowerCase();
          uniqueBaseJinsNames.add(baseJinsName);

          // Map this base jins name to the first note of the maqam for sorting
          const firstNote = maqam.getAscendingNoteNames()[0];
          if (firstNote && !jinsToStartingNote.has(baseJinsName)) {
            jinsToStartingNote.set(baseJinsName, firstNote.toLowerCase());
          }
        } else {
          uniqueBaseJinsNames.add('no jins'); // For maqamat with no jins on first degree
        }
      });

      // Sort jins names alphabetically
      const sortedJinsNames = Array.from(uniqueBaseJinsNames)
        .filter(name => name !== 'no jins') // Handle 'no jins' separately
        .sort((a, b) => a.localeCompare(b)); // Simple alphabetical sort

      // Add 'no jins' at the end if it exists
      const result = ["all", ...sortedJinsNames];
      if (uniqueBaseJinsNames.has('no jins')) {
        result.push('no jins');
      }
      return result;
    }
  }, [maqamat, allPitchClasses, filterMode, language, allMaqamTranspositionsMap]);

  // Sync local state when a different maqam is selected
  useEffect(() => {
    if (selectedMaqamData) {
      setCommentsEnglishLocal(selectedMaqamData.getCommentsEnglish());
      setCommentsArabicLocal(selectedMaqamData.getCommentsArabic());
    }
  }, [selectedMaqamData]);

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

    if (filterMode === 'note') {
      return sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === maqamatFilter.toLowerCase());
    } else {
      // Jins filtering
      if (maqamatFilter === 'no jins') {
        return sortedMaqamat.filter((maqam) => !getFirstJinsNameForMaqamData(maqam, allMaqamTranspositionsMap));
      }
      return sortedMaqamat.filter((maqam) => {
        const firstJinsName = getFirstJinsNameForMaqamData(maqam, allMaqamTranspositionsMap);
        if (!firstJinsName) return false;
        const baseJinsName = getBaseJinsName(firstJinsName);
        return baseJinsName.toLowerCase() === maqamatFilter.toLowerCase();
      });
    }
  }, [sortedMaqamat, maqamatFilter, filterMode, language, allMaqamTranspositionsMap]);

  return (
    <div className="maqam-manager" key={language}>
      {/* Tabs for filtering maqamat with toggle button */}
      <div className="maqam-manager__filter-controls">
        <div className="tabs">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === "all") {
            count = sortedMaqamat.length;
          } else if (filterMode === 'note') {
            count = sortedMaqamat.filter((maqam) => maqam.getAscendingNoteNames()[0]?.toLowerCase() === tab.toLowerCase()).length;
          } else {
            // Jins mode
            if (tab === 'no jins') {
              count = sortedMaqamat.filter((maqam) => !getFirstJinsNameForMaqamData(maqam, allMaqamTranspositionsMap)).length;
            } else {
              count = sortedMaqamat.filter((maqam) => {
                const firstJinsName = getFirstJinsNameForMaqamData(maqam, allMaqamTranspositionsMap);
                if (!firstJinsName) return false;
                const baseJinsName = getBaseJinsName(firstJinsName);
                return baseJinsName.toLowerCase() === tab.toLowerCase();
              }).length;
            }
          }

          let displayName: string;
          if (tab === "all") {
            displayName = t('maqam.all');
          } else if (filterMode === 'note') {
            displayName = getDisplayName(tab, 'note');
          } else {
            // Jins mode
            if (tab === 'no jins') {
              displayName = t('maqam.noJins') || 'No Jins';
            } else {
              // Remove "Jins " prefix from display name to save space
              const fullJinsName = getDisplayName(tab, 'jins');
              displayName = fullJinsName.replace(/^(Jins\s+|جنس\s+)/i, '');
            }
          }

          return (
            <button key={tab} className={"tabs__tab" + (maqamatFilter === tab ? " tabs__tab--active" : "")} onClick={() => setMaqamatFilter(tab)}>
              {displayName} <span className="tabs__count">({count})</span>
            </button>
          );
        })}
        </div>

        {/* Single toggle button positioned far right */}
        <button
          className="maqam-manager__filter-mode-toggle"
          onClick={() => {
            setFilterMode(filterMode === 'note' ? 'jins' : 'note');
            setMaqamatFilter('all');
          }}
        >
          {filterMode === 'note'
            ? (t('maqam.groupByJins') || 'Group by Jins')
            : (t('maqam.groupByStartingNote') || 'Group by Starting Note')
          }
        </button>
      </div>

      <div className="carousel__controls">
        <button
          className="carousel__button carousel__button--prev"
          onClick={() => {
            const container = document.querySelector(".carousel__list");
            if (container) container.scrollBy({ left: isRTL ? 600 : -600, behavior: "smooth" });
          }}
        >
          ‹
        </button>
        <div
          className="carousel__list"
        >
          {filteredMaqamat.map((maqamData, idx) => {
            const selectable = maqamData.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName));
            const numberOfTranspositions = allMaqamTranspositionsMap.get(maqamData.getId())?.filter((transposition: any) => transposition.ascendingPitchClasses[0]?.octave === 1).length || 0;
            return (
              <div
                key={idx}
                className={`carousel__item${maqamData.getName() === selectedMaqamData?.getName() ? " carousel__item--selected" : ""}${selectable ? " carousel__item--active" : " carousel__item--disabled"}`}
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
                <div className="carousel__item-name">
                  <strong>{`${getDisplayName(maqamData.getName(), 'maqam')}${!maqamData.isMaqamSymmetric() ? "*" : ""}`}</strong>
                  {selectable && <strong className="carousel__item-name-transpositions">{`${t('maqam.transpositions')}: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="carousel__button carousel__button--next"
          onClick={() => {
            const container = document.querySelector(".carousel__list");
            if (container) container.scrollBy({ left: isRTL ? -600 : 600, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>

      {admin && !selectedMaqamData && (
        <button onClick={() => setSelectedMaqamData(new MaqamData(newMaqamId, "", [], [], [], "", "", []))} className="maqam-manager__create-button">
          {t('maqam.createNewMaqam')}
        </button>
      )}

      {admin && selectedMaqamData && (
        <div className="maqam-manager__admin-form">
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
              className="maqam-manager__name-input"
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
                    .sort((a, b) => {
                      // Sort alphabetically by last name, or by title if no contributors
                      const aContribs = a.getContributors();
                      const bContribs = b.getContributors();
                      const aKey = aContribs && aContribs.length > 0 ? aContribs[0].lastNameEnglish.toLowerCase() : a.getTitleEnglish().toLowerCase();
                      const bKey = bContribs && bContribs.length > 0 ? bContribs[0].lastNameEnglish.toLowerCase() : b.getTitleEnglish().toLowerCase();
                      return aKey.localeCompare(bKey);
                    })
                    .map((s) => {
                      const contribs = s.getContributors();
                      const firstContributor = contribs && contribs.length > 0 ? contribs[0] : null;
                      const lastName = firstContributor ? firstContributor.lastNameEnglish : "n.a.";
                      return (
                        <option key={s.getId()} value={s.getId()}>
                          {`${lastName} (${s.getPublicationDateEnglish()}) ${s.getTitleEnglish()} (${s.getSourceType()})`}
                        </option>
                      );
                    })}
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
