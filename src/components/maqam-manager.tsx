"use client";

import React, { useState, useEffect, useMemo } from "react";
import CarouselFilterRail from "./carousel-filter-rail";
import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import MaqamData from "@/models/Maqam";
// Transpositions now provided via TranspositionsContext
// import { calculateMaqamTranspositions } from "@/functions/transpose";
import { updateMaqamat } from "@/functions/update";
import { SourcePageReference, sourceSortKey } from "@/models/bibliography/Source";
import useTranspositionsContext from "@/contexts/transpositions-context";
import { getBaseJinsName, getFirstJinsNameForMaqamData } from "@/functions/classifyMaqamFamily";
import scrollCarouselByColumns from "@/functions/scrollCarouselByColumns";
import { compareNormalized } from "@/functions/normalizeForSort";
import useRememberedCarouselScroll from "@/hooks/use-remembered-carousel-scroll";

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

  // Carousel position survives switching tabs and reloading (see the hook).
  const { listRef, onScroll } = useRememberedCarouselScroll("maqamat", isRTL);

  // Local state for the editable fields. The name belongs here for the same
  // reason the comments do: writing each keystroke back to selectedMaqamData
  // would construct a new MaqamData per character, which invalidates the
  // transposition memo in transpositions-context and re-renders every consumer
  // of the selected maqam. The name only reaches the app once it is saved.
  const [nameLocal, setNameLocal] = useState<string>(selectedMaqamData?.getName() ?? "");
  const [commentsEnglishLocal, setCommentsEnglishLocal] = useState<string>(selectedMaqamData?.getCommentsEnglish() ?? "");
  const [commentsArabicLocal, setCommentsArabicLocal] = useState<string>(selectedMaqamData?.getCommentsArabic() ?? "");
  const [sourceRefsLocal, setSourceRefsLocal] = useState<SourcePageReference[]>(selectedMaqamData?.getSourcePageReferences() ?? []);

  // Toggle state for filtering mode: 'note' or 'jins' - default to 'jins'
  const [filterMode, setFilterMode] = useState<'note' | 'jins'>('note');

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

      // Sort jins names by their corresponding pitch class order
      const sortedJinsNames = Array.from(uniqueBaseJinsNames)
        .filter(name => name !== 'no jins') // Handle 'no jins' separately
        .sort((a, b) => {
          const noteA = jinsToStartingNote.get(a);
          const noteB = jinsToStartingNote.get(b);

          // Find indices in allPitchClasses
          const indexA = noteA ? allPitchClasses.findIndex(pc => pc.noteName.toLowerCase() === noteA) : -1;
          const indexB = noteB ? allPitchClasses.findIndex(pc => pc.noteName.toLowerCase() === noteB) : -1;

          // If both found, sort by pitch class order
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // Fallback to alphabetical if pitch class not found
          return a.localeCompare(b);
        });

      // Add 'no jins' at the end if it exists
      const result = ["all", ...sortedJinsNames];
      if (uniqueBaseJinsNames.has('no jins')) {
        result.push('no jins');
      }
      return result;
    }
  }, [maqamat, allPitchClasses, filterMode, language, allMaqamTranspositionsMap]);

  const buildFilterItems = () => {
    return tabs.map((tab) => {
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

      return { key: tab, label: displayName, count };
    });
  };

  // Sync local state when a different maqam is selected
  useEffect(() => {
    if (selectedMaqamData) {
      setNameLocal(selectedMaqamData.getName());
      setCommentsEnglishLocal(selectedMaqamData.getCommentsEnglish());
      setCommentsArabicLocal(selectedMaqamData.getCommentsArabic());
      setSourceRefsLocal(selectedMaqamData.getSourcePageReferences());
    }
  }, [selectedMaqamData]);

  const numberOfPitchClasses = selectedTuningSystem ? selectedTuningSystem.getOriginalPitchClassValues().length : 0;

  const sortedMaqamat = [...maqamat].sort((a, b) => compareNormalized(a.getName(), b.getName()));

  // Generate new unique ID
  const setOfMaqamat = new Set(maqamat.map((m) => m.getId()));
  let newMaqamIdNum = 1;
  while (setOfMaqamat.has(newMaqamIdNum.toString())) newMaqamIdNum++;
  const newMaqamId = newMaqamIdNum.toString();

  const selectedCellNoteNames = selectedPitchClasses.map((d) => d.noteName);

  // Base save logic
  const handleSaveMaqam = async (maqam: MaqamData) => {
    const others = maqamat.filter((m) => m.getId() !== maqam.getId());
    await updateMaqamat([...others, maqam], [maqam.getId()]);
    setMaqamat([...others, maqam]);
    setSelectedMaqamData(maqam);
  };

  // Every save button commits the same draft — name, comments and source page
  // references — and differs only in which note-name rows it rewrites. Building
  // them all here keeps that guarantee in one place: when the three buttons
  // each constructed their own MaqamData, "save name" quietly dropped whatever
  // source refs were drafted at the time.
  const buildUpdatedMaqam = (ascendingNames: string[], descendingNames: string[]): MaqamData => {
    if (!selectedMaqamData) throw new Error("buildUpdatedMaqam called with no selected maqam");
    return new MaqamData(
      selectedMaqamData.getId(),
      nameLocal,
      ascendingNames,
      descendingNames,
      selectedMaqamData.getSuyur(),
      commentsEnglishLocal,
      commentsArabicLocal,
      sourceRefsLocal,
      selectedMaqamData.getVersion(),
      selectedMaqamData.getPrimaryJinsDegree(),
      selectedMaqamData.getSecondaryJinsDegree(),
      selectedMaqamData.getTertiaryJinsDegree(),
      selectedMaqamData.getGhammaz()
    );
  };

  // Save the name, comments and source refs, leaving both note-name rows as they are
  const handleSaveDetails = async () => {
    if (!selectedMaqamData) return;
    handleSaveMaqam(buildUpdatedMaqam(selectedMaqamData.getAscendingNoteNames(), selectedMaqamData.getDescendingNoteNames()));
  };

  // Save ascending row
  const handleSaveAscending = async () => {
    if (!selectedMaqamData) return;
    const descendingNames = selectedMaqamData.getDescendingNoteNames().length > 0 ? selectedMaqamData.getDescendingNoteNames() : [...selectedCellNoteNames].reverse();
    handleSaveMaqam(buildUpdatedMaqam(selectedCellNoteNames, descendingNames));
  };

  // Save descending row
  const handleSaveDescending = async () => {
    if (!selectedMaqamData) return;
    handleSaveMaqam(buildUpdatedMaqam(selectedMaqamData.getAscendingNoteNames(), [...selectedCellNoteNames].reverse()));
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

  // Source refs are drafted locally for the same reason as the name and the
  // comments: writing each selection or page-number keystroke back to
  // selectedMaqamData would mint a new MaqamData, invalidating the
  // transposition memo in transpositions-context and scrolling the
  // transposition list back to the top mid-entry. They reach the app on save.
  const updateSourceRefs = (index: number, newRef: Partial<SourcePageReference>) => {
    setSourceRefsLocal((refs) => refs.map((ref, i) => (i === index ? { ...ref, ...newRef } : ref)));
  };

  const removeSourceRef = (index: number) => {
    setSourceRefsLocal((refs) => refs.filter((_, i) => i !== index));
  };

  const addSourceRef = () => {
    setSourceRefsLocal((refs) => [...refs, { sourceId: "", page: "" }]);
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

  // Filter-rail items: label + count per tab, in tab order (built above the
  // sorted list's declaration, evaluated here where it exists).
  const filterItems = useMemo(buildFilterItems, [tabs, sortedMaqamat, filterMode, allMaqamTranspositionsMap, language]);

  return (
    <div className="maqam-manager" key={language}>
      {/* Shared filter band, with the maqam group-by control as trailing content */}
      <CarouselFilterRail items={filterItems} activeKey={maqamatFilter} onSelect={setMaqamatFilter}>

        {/* Group-by segmented control: shows the current grouping as state */}
        <div className="maqam-manager__groupby">
          <span className="maqam-manager__groupby-label">{t('maqam.groupBy')}</span>
          <div className="maqam-manager__groupby-segments" role="group">
            <button
              className={"maqam-manager__groupby-segment" + (filterMode === 'note' ? " maqam-manager__groupby-segment_active" : "")}
              onClick={() => {
                if (filterMode !== 'note') {
                  setFilterMode('note');
                  setMaqamatFilter('all');
                }
              }}
            >
              {t('maqam.byTonic')}
            </button>
            <button
              className={"maqam-manager__groupby-segment" + (filterMode === 'jins' ? " maqam-manager__groupby-segment_active" : "")}
              onClick={() => {
                if (filterMode !== 'jins') {
                  setFilterMode('jins');
                  setMaqamatFilter('all');
                }
              }}
            >
              {t('maqam.byJins')}
            </button>
          </div>
        </div>
      </CarouselFilterRail>

      <div className="maqam-manager__carousel">
        <button
          className="carousel-button carousel-button-prev"
          onClick={() => scrollCarouselByColumns(listRef.current, -1, isRTL)}
        >
          ‹
        </button>
        <div className="maqam-manager__list" ref={listRef} onScroll={onScroll}>
          <div className="maqam-manager__item-grid">
          {filteredMaqamat.map((maqamData, idx) => {
            const selectable = maqamData.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName));
            const numberOfTranspositions = allMaqamTranspositionsMap.get(maqamData.getId())?.filter((transposition: any) => transposition.ascendingPitchClasses[0]?.octave === 1).length || 0;
            return (
              <div
                key={idx}
                className={`maqam-manager__item ${maqamData.getName() === selectedMaqamData?.getName() ? "maqam-manager__item_selected " : ""}${selectable ? "maqam-manager__item_active" : ""}`}
                aria-disabled={selectable ? undefined : true}
                data-tooltip={!selectable ? t("maqam.tooltip.itemNotAvailable") : undefined}
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
                  {`${getDisplayName(maqamData.getName(), 'maqam')}${!maqamData.isMaqamSymmetric() ? "*" : ""}`}
                  {selectable && <strong className="maqam-manager__item-name-transpositions">{`${t('maqam.transpositions')}: ${numberOfTranspositions}/${numberOfPitchClasses}`}</strong>}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        <button
          className="carousel-button carousel-button-next"
          onClick={() => scrollCarouselByColumns(listRef.current, 1, isRTL)}
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
              value={nameLocal}
              onChange={(e) => setNameLocal(e.target.value)}
              placeholder={t('maqam.enterMaqamName')}
              className="maqam-manager__name-input"
            />
            <button onClick={handleSaveDetails} className="maqam-manager__save-button">
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
            {sourceRefsLocal.map((ref, idx) => (
              <div key={idx} className="maqam-manager__source-item">
                <select
                  className="maqam-manager__source-select"
                  value={ref.sourceId}
                  onChange={(e) => updateSourceRefs(idx, { sourceId: e.target.value })}
                >
                  <option value="">{t('maqam.selectSource')}</option>
                  {[...sources]
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
                  className="maqam-manager__source-input"
                  type="text"
                  value={ref.page}
                  placeholder={t('maqam.page')}
                  onChange={(e) => updateSourceRefs(idx, { page: e.target.value })}
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
              <textarea rows={5} className="maqam-manager__input" id="commentsArabicField" dir="rtl" value={commentsArabicLocal} onChange={(e) => setCommentsArabicLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
