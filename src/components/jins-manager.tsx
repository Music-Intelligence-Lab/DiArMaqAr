"use client";

import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import JinsData from "@/models/Jins";
import CarouselFilterRail from "./carousel-filter-rail";
import React, { useState, useEffect, useMemo } from "react";
// Transpositions now provided via TranspositionsContext
// import { calculateJinsTranspositions } from "@/functions/transpose";
import { updateAjnas } from "@/functions/update";
import { SourcePageReference, sourceSortKey } from "@/models/bibliography/Source";
import useTranspositionsContext from "@/contexts/transpositions-context";
import scrollCarouselByColumns from "@/functions/scrollCarouselByColumns";
import { compareNormalized } from "@/functions/normalizeForSort";
import useRememberedCarouselScroll from "@/hooks/use-remembered-carousel-scroll";

export default function JinsManager({ admin }: { admin: boolean }) {
  const { ajnas, setAjnas, selectedTuningSystem, selectedJinsData, setSelectedJinsData, handleClickJins, selectedPitchClasses, clearJinsSelections, allPitchClasses, sources } = useAppContext();

  const { ajnasFilter, setAjnasFilter } = useFilterContext();
  const { clearHangingNotes } = useSoundContext();
  const { t, language, isRTL, getDisplayName } = useLanguageContext();

  // Carousel position survives switching tabs and reloading (see the hook).
  const { listRef, onScroll } = useRememberedCarouselScroll("ajnas", isRTL);

  // Local state for the editable fields. The name belongs here for the same
  // reason the comments do: writing each keystroke back to selectedJinsData
  // would construct a new JinsData per character, which invalidates the
  // transposition memo in transpositions-context and re-renders every consumer
  // of the selected jins. The name only reaches the app once it is saved.
  const [nameLocal, setNameLocal] = useState<string>(selectedJinsData?.getName() ?? "");
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedJinsData?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedJinsData?.getCommentsArabic() ?? "");
  const [sourceRefsLocal, setSourceRefsLocal] = useState<SourcePageReference[]>(selectedJinsData?.getSourcePageReferences() ?? []);

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
      setNameLocal(selectedJinsData.getName());
      setCommentsEnglishLocal(selectedJinsData.getCommentsEnglish());
      setCommentsArabicLocal(selectedJinsData.getCommentsArabic());
      setSourceRefsLocal(selectedJinsData.getSourcePageReferences());
    }
  }, [selectedJinsData]);

  const { allJinsTranspositionsMap } = useTranspositionsContext();

  const sortedAjnas = [...ajnas].sort((a, b) => compareNormalized(a.getName(), b.getName()));

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
      nameLocal,
      selectedNoteNames,
      commentsEnglishLocal,
      commentsArabicLocal,
      sourceRefsLocal,
      selectedJinsData.getVersion()
    );
    const newAjnas = ajnas.filter((jins) => jins.getId() !== newJins.getId());
    await updateAjnas([...newAjnas, newJins], [newJins.getId()]);
    setAjnas([...newAjnas, newJins]);
    // Re-point the selection at the saved object, as handleSaveMaqam does. The
    // name used to reach selectedJinsData keystroke by keystroke; now that it
    // arrives only on save, leaving the stale object selected would break the
    // list's selected-item match, which compares by name.
    setSelectedJinsData(newJins);
  };

  const handleDeleteJins = async () => {
    if (!selectedJinsData) return;
    const newAjnas = ajnas.filter((jins) => jins.getId() !== selectedJinsData.getId());
    await updateAjnas(newAjnas);
    setAjnas(newAjnas);
  };

  // Source refs are drafted locally for the same reason as the name and the
  // comments: writing each selection or page-number keystroke back to
  // selectedJinsData would mint a new JinsData, invalidating the transposition
  // memo in transpositions-context and scrolling the transposition list back
  // to the top mid-entry. They reach the app on save.
  const updateSourceRefs = (index: number, newRef: Partial<SourcePageReference>) => {
    setSourceRefsLocal((refs) => refs.map((ref, i) => (i === index ? { ...ref, ...newRef } : ref)));
  };

  const removeSourceRef = (index: number) => {
    setSourceRefsLocal((refs) => refs.filter((_, i) => i !== index));
  };

  const addSourceRef = () => {
    setSourceRefsLocal((refs) => [...refs, { sourceId: "", page: "" }]);
  };

  // Filter ajnas by tab
  const filteredAjnas = useMemo(() => {
    if (ajnasFilter === "all") return sortedAjnas;
    return sortedAjnas.filter((jins) => jins.getNoteNames()[0]?.toLowerCase() === ajnasFilter.toLowerCase());
  }, [sortedAjnas, ajnasFilter, language]);


  // Filter-rail items: label + count per starting note, in tab order.
  const filterItems = useMemo(() => tabs.map((tab) => ({
    key: tab,
    label: tab === "all" ? t('jins.all') : getDisplayName(tab, 'note'),
    count: tab === "all" ? sortedAjnas.length : sortedAjnas.filter((jins) => jins.getNoteNames()[0]?.toLowerCase() === tab.toLowerCase()).length,
  })), [tabs, sortedAjnas, language]);

  return (
    <div className="jins-manager" key={language}>
      <CarouselFilterRail items={filterItems} activeKey={ajnasFilter} onSelect={setAjnasFilter} />
      <div className="jins-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => scrollCarouselByColumns(listRef.current, -1, isRTL)}
        >
          ‹
        </button>
        <div className="jins-manager__list" ref={listRef} onScroll={onScroll}>
          <div className="jins-manager__item-grid">
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
                  aria-disabled={selectable ? undefined : true}
                  data-tooltip={!selectable ? t("jins.tooltip.itemNotAvailable") : undefined}
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
                    {getDisplayName(jinsData.getName(), 'jins')}
                    {selectable && <strong className="jins-manager__item-name-transpositions">{`${t('jins.transpositions')}: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => scrollCarouselByColumns(listRef.current, 1, isRTL)}
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
              value={nameLocal}
              onChange={(e) => setNameLocal(e.target.value)}
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
            {sourceRefsLocal.map((ref, idx) => (
              <div key={idx} className="jins-manager__source-item">
                <select
                  className="jins-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(idx, { sourceId: e.target.value })}
                >
                  <option value="">{t('jins.selectSource')}</option>
                  {sources
                    .slice()
                    .sort((a, b) => compareNormalized(sourceSortKey(a), sourceSortKey(b)))
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
                  onChange={(e) => updateSourceRefs(idx, { page: e.target.value })}
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
