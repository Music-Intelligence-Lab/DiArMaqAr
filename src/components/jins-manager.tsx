"use client";

import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import JinsData from "@/models/Jins";
import React, { useState, useEffect, useMemo } from "react";
// Transpositions now provided via TranspositionsContext
// import { calculateJinsTranspositions } from "@/functions/transpose";
import { updateAjnas } from "@/functions/update";
import { SourcePageReference } from "@/models/bibliography/Source";
import useTranspositionsContext from "@/contexts/transpositions-context";

export default function JinsManager({ admin }: { admin: boolean }) {
  const { ajnas, setAjnas, selectedTuningSystem, selectedJinsData, setSelectedJinsData, handleClickJins, selectedPitchClasses, clearJinsSelections, allPitchClasses, sources } = useAppContext();

  const { ajnasFilter, setAjnasFilter } = useFilterContext();
  const { clearHangingNotes } = useSoundContext();
  const { t, language, isRTL, getDisplayName } = useLanguageContext();

  // Local state for comments
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedJinsData?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedJinsData?.getCommentsArabic() ?? "");

  // Dynamic note names for tabs ordered by allPitchClasses.noteName
  const tabs = useMemo(() => {
    const uniqueNoteNames = new Set<string>();
    ajnas.forEach((jins) => {
      const firstNote = jins.getNoteNames()[0]?.toLowerCase();
      if (firstNote) uniqueNoteNames.add(firstNote);
    });
    const orderedByPitchClasses = allPitchClasses.map((pc) => pc.noteName.toLowerCase()).filter((name) => uniqueNoteNames.has(name));
    return ["all", ...orderedByPitchClasses];
  }, [ajnas, allPitchClasses]);

  // Sync local state when a different jins is selected
  useEffect(() => {
    if (selectedJinsData) {
      setCommentsEnglishLocal(selectedJinsData.getCommentsEnglish());
      setCommentsArabicLocal(selectedJinsData.getCommentsArabic());
    }
  }, [selectedJinsData]);

  const { allJinsTranspositionsMap } = useTranspositionsContext();

  // Helper function to strip leading special characters for sorting
  const stripLeadingSpecialChars = (str: string): string => {
    return str.replace(/^[^\p{L}\p{N}]+/u, '');
  };

  // Helper function to normalize string for consistent sorting
  const normalizeForSort = (str: string): string => {
    return stripLeadingSpecialChars(str)
      .toLowerCase()
      .normalize('NFD') // Decompose characters (e.g., é -> e + ́)
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
      .replace(/[\u02B0-\u02FF]/g, '') // Remove modifier letters (including ʿ U+02BF and other modifiers)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const sortedAjnas = [...ajnas].sort((a, b) => {
    const nameA = normalizeForSort(a.getName());
    const nameB = normalizeForSort(b.getName());
    // Use a more permissive comparison that handles mixed scripts better
    return nameA.localeCompare(nameB, 'en', { 
      sensitivity: 'base', 
      numeric: true,
      ignorePunctuation: true 
    });
  });

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getOriginalPitchClassValues().length : 0;

  // Generate a new unique ID for creating a Jins
  const setOfAjnas = new Set(ajnas.map((j) => j.getId()));
  let newJinsIdNum = 1;
  while (setOfAjnas.has(newJinsIdNum.toString())) {
    newJinsIdNum++;
  }
  const newJinsId = newJinsIdNum.toString();

  // Save handler uses local comment state
  const handleSaveJins = async () => {
    if (!selectedJinsData) return;
    const selectedNoteNames = selectedPitchClasses.map((pitchClass) => pitchClass.noteName);
    const newJins = new JinsData(
      selectedJinsData.getId(),
      selectedJinsData.getName(),
      selectedNoteNames,
      commentsEnglishLocal,
      commentsArabicLocal,
      selectedJinsData.getSourcePageReferences(),
      selectedJinsData.getVersion()
    );
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAjnas([...newAjnas, newJins], [newJins.getId()]);
    setAjnas([...newAjnas, newJins]);
  };

  const handleDeleteJins = async () => {
    if (!selectedJinsData) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJinsData.getId());
    await updateAjnas(newAjnas);
    setAjnas(newAjnas);
  };

  const updateSourceRefs = (refs: SourcePageReference[], index: number, newRef: Partial<SourcePageReference>) => {
    if (!selectedJinsData) return;
    const list = [...refs];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSelectedJinsData(selectedJinsData.createJinsWithNewSourcePageReferences(list));
  };

  const removeSourceRef = (index: number) => {
    if (!selectedJinsData) return;
    const refs = selectedJinsData.getSourcePageReferences() || [];
    const newList = refs.filter((_, i) => i !== index);
    setSelectedJinsData(selectedJinsData.createJinsWithNewSourcePageReferences(newList));
  };

  const addSourceRef = () => {
    if (!selectedJinsData) return;
    const refs = selectedJinsData.getSourcePageReferences() || [];
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    setSelectedJinsData(selectedJinsData.createJinsWithNewSourcePageReferences([...refs, newRef]));
  };

  // Filter ajnas by tab
  const filteredAjnas = useMemo(() => {
    if (ajnasFilter === "all") return sortedAjnas;
    return sortedAjnas.filter((jins) => jins.getNoteNames()[0]?.toLowerCase() === ajnasFilter.toLowerCase());
  }, [sortedAjnas, ajnasFilter, language]);

  const numberOfRows = 3; // Fixed number of rows
  const numberOfColumns = Math.ceil(filteredAjnas.length / numberOfRows); // Calculate columns dynamically

  return (
    <div className="jins-manager" key={language}>
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
              {tab === "all" ? t('jins.all') : getDisplayName(tab, 'note')} <span className="jins-manager__tab-count">({count})</span>
            </button>
          );
        })}
      </div>
      <div className="jins-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => {
            const container = document.querySelector(".jins-manager__list");
            if (container) container.scrollBy({ left: isRTL ? 670 : -670, behavior: "smooth" });
          }}
        >
          ‹
        </button>
        <div className="jins-manager__list" style={{ gridTemplateColumns: `repeat(${numberOfColumns}, minmax(250px, 1fr))` }}>
          {filteredAjnas.length === 0 ? (
            <p>{t('jins.noAjnasAvailable')}</p>
          ) : (
            filteredAjnas.map((jinsData, index) => {
              const selectable = jinsData.isJinsPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName));
              const numberOfTranspositions = allJinsTranspositionsMap.get(jinsData.getId())?.filter((transposition: any) => transposition.jinsPitchClasses[0]?.octave === 1).length || 0;
              return (
                <div
                  key={index}
                  className={"jins-manager__item " + (jinsData.getName() === selectedJinsData?.getName() ? "jins-manager__item_selected " : "") + (selectable ? "jins-manager__item_active" : "")}
                  onClick={() => {
                    if (selectable) {
                      // Toggle functionality: if clicking the same jins, deselect it
                      if (selectedJinsData?.getName() === jinsData.getName()) {
                        setSelectedJinsData(null);
                        clearJinsSelections();
                      } else {
                        handleClickJins(jinsData);
                      }
                      clearHangingNotes();
                    }
                  }}
                >
                  <div className="jins-manager__item-name">
                    <strong>{getDisplayName(jinsData.getName(), 'jins')}</strong>
                    {selectable && <strong className="jins-manager__item-name-transpositions">{`${t('jins.transpositions')}: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
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
            if (container) container.scrollBy({ left: isRTL ? -520 : 520, behavior: "smooth" });
          }}
        >
          ›
        </button>
      </div>

      {admin && !selectedJinsData && (
        <button onClick={() => setSelectedJinsData(new JinsData(newJinsId, "", [], "", "", []))} className="jins-manager__create-button">
          {t('jins.createNewJins')}
        </button>
      )}

      {admin && selectedJinsData && (
        <div className="jins-manager__admin-form">
          <div className="jins-manager__group">
            <input
              type="text"
              value={selectedJinsData.getName()}
              onChange={(e) =>
                setSelectedJinsData(
                  new JinsData(
                    selectedJinsData.getId(),
                    e.target.value,
                    selectedJinsData.getNoteNames(),
                    selectedJinsData.getCommentsEnglish(), // keep comments until save
                    selectedJinsData.getCommentsArabic(),
                    selectedJinsData.getSourcePageReferences()
                  )
                )
              }
              placeholder={t('jins.enterNewJinsName')}
              className="jins-manager__name-input"
            />
            <button onClick={handleSaveJins} className="jins-manager__save-button">
              {t('jins.save')}
            </button>
            <button onClick={handleDeleteJins} className="jins-manager__delete-button">
              {t('jins.delete')}
            </button>
            <button onClick={clearJinsSelections} className="jins-manager__clear-button">
              {t('jins.clear')}
            </button>
          </div>

          <div className="jins-manager__group">
            {selectedJinsData && (
              <button className="jins-manager__source-add-button" onClick={addSourceRef}>
                {t('jins.addSource')}
              </button>
            )}
            {selectedJinsData.getSourcePageReferences().map((ref, idx) => (
              <div key={idx} className="jins-manager__source-item">
                <select
                  className="jins-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(selectedJinsData.getSourcePageReferences(), idx, { sourceId: e.target.value })}
                >
                  <option value="">{t('jins.selectSource')}</option>
                  {sources
                    .slice()
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
                  className="jins-manager__source-input"
                  type="text"
                  value={ref.page}
                  placeholder={t('jins.page')}
                  onChange={(e) => updateSourceRefs(selectedJinsData.getSourcePageReferences(), idx, { page: e.target.value })}
                />
                <button className="jins-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                  {t('jins.delete')}
                </button>
              </div>
            ))}
          </div>

          {/* Comments fields with local state */}
          <div className="jins-manager__group">
            <div className="jins-manager__input-container">
              <label className="jins-manager__label" htmlFor="commentsEnglishField">
                {t('jins.commentsEnglish')}
              </label>
              <textarea rows={5} className="jins-manager__input" id="commentsEnglishField" value={commentsEnglishLocal} onChange={(e) => setCommentsEnglishLocal(e.target.value)} />
            </div>

            <div className="jins-manager__input-container">
              <label className="jins-manager__label" htmlFor="commentsArabicField">
                {t('jins.commentsArabic')}
              </label>
              <textarea rows={5} className="jins-manager__input" id="commentsArabicField" dir="rtl" value={commentsArabicLocal} onChange={(e) => setCommentsArabicLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
