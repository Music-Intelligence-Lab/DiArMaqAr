"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useFilterContext from "@/contexts/filter-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import TuningSystem from "@/models/TuningSystem";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass from "@/functions/convertPitchClass";
import NoteName, { octaveOneNoteNames, octaveTwoNoteNames, TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo, getNoteNameIndex } from "@/models/NoteName";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { updateTuningSystems } from "@/functions/update";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { SourcePageReference } from "@/models/bibliography/Source";
import TuningSystemOctaveTables from "./tuning-system-octave-tables";
import JinsData from "@/models/Jins";
import MaqamData, { Maqam } from "@/models/Maqam";
import ExportModal from "./export-modal";
import SelectedPitchClassTranspositions from "./selected-pitch-classes-transpositions";
import Link from "next/link";
import { canTransposeMaqamToNote } from "@/functions/transpose";
import FrequencyKnob from "./frequency-knob";

function isTuningSystemDisabled(
  tuningSystem: TuningSystem,
  selectedJinsData: JinsData | null,
  selectedMaqamData: MaqamData | null,
  selectedMaqam: Maqam | null,
  startingNoteName: NoteName = ""
): { disabled: boolean; noteName: string } {
  const shiftedNoteNames = tuningSystem.getSetsOfNoteNamesShiftedUpAndDown();

  if (!selectedJinsData && !selectedMaqamData) return { disabled: false, noteName: "" };

  if (selectedJinsData) {
    for (const set of shiftedNoteNames) {
      if (selectedJinsData.isJinsSelectable(set)) {
        const firstNoteName = set[set.length / 3];
        if (startingNoteName && firstNoteName !== startingNoteName) continue;
        return { disabled: false, noteName: firstNoteName };
      }
    }
  } else if (selectedMaqamData) {
    for (const set of shiftedNoteNames) {
      if (selectedMaqamData.isMaqamSelectable(set)) {
        const firstNoteName = set[set.length / 3];
        if (startingNoteName && firstNoteName !== startingNoteName) continue;
        if (selectedMaqam) {
          if (canTransposeMaqamToNote(tuningSystem, firstNoteName, selectedMaqamData, selectedMaqam.ascendingPitchClasses[0].noteName)) return { disabled: false, noteName: firstNoteName };
        } else return { disabled: false, noteName: firstNoteName };
      }
    }
  }

  return { disabled: true, noteName: "" };
}
export default function TuningSystemManager({ admin }: { admin: boolean }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { t, language, getDisplayName } = useLanguageContext();

  const {
    tuningSystems,
    setTuningSystems,
    selectedTuningSystem,
    setSelectedTuningSystem,
    tuningSystemPitchClasses,
    setTuningSystemPitchClasses,
    tuningSystemStringLength,
    setTuningSystemStringLength,
    referenceFrequencies,
    setReferenceFrequencies,
    originalReferenceFrequencies,
    setOriginalReferenceFrequencies,
    selectedIndices,
    setSelectedIndices,
    originalIndices,
    setOriginalIndices,
    mapIndices,
    clearSelections,
    handleStartNoteNameChange,
    sources,
    selectedAbjadNames,
    setSelectedAbjadNames,
    selectedJinsData,
    selectedMaqamData,
    selectedMaqam,
  } = useAppContext();

  const { tuningSystemsFilter, setTuningSystemsFilter } = useFilterContext();

  const { clearHangingNotes, updateAllActiveNotesByReferenceFrequency, recalculateAllActiveNoteFrequencies } = useSoundContext();

  const alKindiPitchClasses = ["1/1", "256/243", "9/8", "32/27", "81/64", "4/3", "1024/729", "3/2", "128/81", "27/16", "16/9", "4096/2187"];

  const alKindiNoteNames = [
    "ʿushayrān",
    "ʿajam ʿushayrān",
    "kawasht",
    "rāst",
    "zīrgūleh",
    "dūgāh",
    "kurdī",
    "būsilīk/ʿushshāq",
    "chahārgāh",
    "ḥijāz",
    "nawā",
    "ḥiṣār",
    "ḥuseinī",
    "ʿajam",
    "māhūr",
    "kurdān",
    "shahnāz",
    "muḥayyar",
    "sunbuleh/zawāl",
    "jawāb būsilīk",
    "māhūrān",
    "jawāb ḥijāz",
    "saham/ramal tūtī",
    "jawāb ḥiṣār",
    "jawāb ḥuseinī",
  ];

  const [sortOption, setSortOption] = useState<"id" | "creatorEnglish" | "year">("year");

  const tabs = [
    { label: "all", labelKey: "tuningSystem.all", min: -Infinity, max: Infinity },
    { label: "8th–10th c. CE", labelKey: "tuningSystem.8th10thCentury", min: 700, max: 999 },
    { label: "11th–15th c. CE", labelKey: "tuningSystem.11th15thCentury", min: 1000, max: 1499 },
    { label: "16th–19th c. CE", labelKey: "tuningSystem.16th19thCentury", min: 1500, max: 1899 },
    { label: "20th–21st c. CE", labelKey: "tuningSystem.20th21stCentury", min: 1900, max: 2100 },
  ];

  // MARK: States
  // Local state that mirrors the selected or “new” system’s fields
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [year, setYear] = useState("");
  const [sourceEnglish, setSourceEnglish] = useState("");
  const [sourceArabic, setSourceArabic] = useState("");
  const [sourcePageReferences, setSourcePageReferences] = useState<SourcePageReference[]>([]);
  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");

  const [defaultReferenceFrequency, setDefaultReferenceFrequency] = useState<number>(0);

  const octaveScrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const tuningSystemPitchClassesArray = tuningSystemPitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
    if (selectedTuningSystem) {
      setTitleEnglish(selectedTuningSystem.getTitleEnglish());
      setTitleArabic(selectedTuningSystem.getTitleArabic());
      setYear(selectedTuningSystem.getYear());
      setSourceEnglish(selectedTuningSystem.getSourceEnglish());
      setSourceArabic(selectedTuningSystem.getSourceArabic());
      setSourcePageReferences(selectedTuningSystem.getSourcePageReferences());
      setCreatorEnglish(selectedTuningSystem.getCreatorEnglish());
      setCreatorArabic(selectedTuningSystem.getCreatorArabic());
      setCommentsEnglish(selectedTuningSystem.getCommentsEnglish());
      setCommentsArabic(selectedTuningSystem.getCommentsArabic());
      setTuningSystemPitchClasses(selectedTuningSystem.getPitchClasses().join("\n"));
      setSelectedAbjadNames(selectedTuningSystem.getAbjadNames());
      setTuningSystemStringLength(selectedTuningSystem.getStringLength());
      setDefaultReferenceFrequency(selectedTuningSystem.getDefaultReferenceFrequency());
      
      const defaultFreqs = selectedTuningSystem.getReferenceFrequencies();
      // Only set reference frequencies if this is a different tuning system
      // or if referenceFrequencies is empty (first mount)
      if (Object.keys(referenceFrequencies).length === 0 || 
          JSON.stringify(defaultFreqs) !== JSON.stringify(originalReferenceFrequencies)) {
        setReferenceFrequencies(defaultFreqs);
        setOriginalReferenceFrequencies(defaultFreqs);
      }
    } else {
      // Clear frequencies when no tuning system is selected
      setReferenceFrequencies({});
    }
  }, [selectedTuningSystem]);

  useEffect(() => {
    const syncScroll = (sourceIdx: number, newScrollLeft: number) => {
      octaveScrollRefs.forEach((r, idx) => {
        if (idx !== sourceIdx && r.current) {
          if (r.current.scrollLeft !== newScrollLeft) {
            r.current.scrollLeft = newScrollLeft;
          }
        }
      });
    };

    const cleanups = octaveScrollRefs.map((ref, idx) => {
      const el = ref.current;
      if (!el) return () => {};
      const handler = () => {
        const x = el.scrollLeft;
        syncScroll(idx, x);
      };
      el.addEventListener("scroll", handler, { passive: true });
      return () => {
        el.removeEventListener("scroll", handler);
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [octaveScrollRefs]);

  const sortedTuningSystems = [...tuningSystems].sort((a, b) => {
    switch (sortOption) {
      case "creatorEnglish":
        return a.getCreatorEnglish().localeCompare(b.getCreatorEnglish());

      case "year":
        return a.getYear().localeCompare(b.getYear(), undefined, {
          numeric: true,
          sensitivity: "base",
        });

      case "id":
      default:
        return a.getId().localeCompare(b.getId());
    }
  });

  function getYearNum(ts: any) {
    const y = parseInt(ts.getYear?.() ?? ts.year ?? "");
    return isNaN(y) ? 0 : y;
  }

  // Filter tuning systems by period tab
  const filteredTuningSystems = useMemo(() => {
    const tab = tabs.find((t) => t.label === tuningSystemsFilter);
    if (!tab || tab.label === "all") return sortedTuningSystems;
    return sortedTuningSystems.filter((ts) => {
      const y = getYearNum(ts);
      return y >= tab.min && y <= tab.max;
    });
  }, [sortedTuningSystems, tuningSystemsFilter]);

  // MARK: Tuning System Function Handlers

  // Clears the form for creating a new TuningSystem:
  const resetFormForNewSystem = () => {
    setTitleEnglish("");
    setTitleArabic("");
    setYear("");
    setSourceEnglish("");
    setSourceArabic("");
    setSourcePageReferences([]);
    setCreatorEnglish("");
    setCreatorArabic("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setTuningSystemPitchClasses("");
    setTuningSystemStringLength(0);
    setDefaultReferenceFrequency(0);
    setSelectedIndices([]);
    setSelectedAbjadNames([]);

    clearSelections();

    mapIndices([], 0, false);
  };

  // When user changes the dropdown (overall TuningSystem):
  const handleTuningSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    clearSelections();
    if (id === "") {
      setSelectedTuningSystem(null);
      resetFormForNewSystem();
    } else if (id === "new") {
      setSelectedTuningSystem(TuningSystem.createBlankTuningSystem());
    } else {
      const chosen = tuningSystems.find((ts) => ts.getId() === id);
      if (chosen) {
        // set the chosen system
        setSelectedTuningSystem(chosen);
        handleStartNoteNameChange("", chosen.getNoteNames(), chosen.getPitchClasses().length);
      }
    }
  };

  const handleTuningSystemClick = (ts: TuningSystem, noteName: NoteName = "") => {
    setSelectedTuningSystem(ts);
    handleStartNoteNameChange(noteName, ts.getNoteNames(), ts.getPitchClasses().length);
    clearHangingNotes();
  };

  const updateSourceRefs = (index: number, newRef: Partial<SourcePageReference>) => {
    const list = [...sourcePageReferences];
    list[index] = { ...list[index], ...newRef } as SourcePageReference;
    setSourcePageReferences(list);
  };

  const removeSourceRef = (index: number) => {
    const refs = sourcePageReferences;
    const newList = refs.filter((_, i) => i !== index);
    setSourcePageReferences(newList);
  };

  const addSourceRef = () => {
    const refs = sourcePageReferences;
    const newRef: SourcePageReference = { sourceId: "", page: "" };
    const newList = [...refs, newRef];
    setSourcePageReferences(newList);
  };

  // Handle creating or updating a system:
  const handleSaveTuningSystem = (givenNoteNames: NoteName[][] = []) => {
    const usedNoteNames = givenNoteNames.length > 0 ? givenNoteNames : selectedTuningSystem?.getNoteNames() || [[]];

    if (selectedTuningSystem) {
      const updated = new TuningSystem(
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        sourcePageReferences,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        tuningSystemPitchClassesArray,
        usedNoteNames,
        selectedAbjadNames,
        Number(tuningSystemStringLength),
        referenceFrequencies,
        Number(defaultReferenceFrequency),
        true
      );
      const updatedList = selectedTuningSystem.isSaved() ? tuningSystems.map((ts) => (ts.getId() === selectedTuningSystem.getId() ? updated : ts)) : [...tuningSystems, updated];
      updateTuningSystems(updatedList);
      setTuningSystems(updatedList);
      setSelectedTuningSystem(updated);
      clearSelections();
    } else {
      // Creating a new TuningSystem
      const newSystem = new TuningSystem(
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        sourcePageReferences,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        tuningSystemPitchClassesArray,
        usedNoteNames,
        selectedAbjadNames,
        Number(tuningSystemStringLength),
        referenceFrequencies,
        Number(defaultReferenceFrequency),
        true
      );
      const updatedList = [...tuningSystems, newSystem];
      updateTuningSystems(updatedList);
      setTuningSystems(updatedList);
      setSelectedTuningSystem(newSystem);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedTuningSystem) {
      const updatedList = tuningSystems.filter((ts) => ts.getId() !== selectedTuningSystem.getId());
      updateTuningSystems(updatedList);
      setTuningSystems(updatedList);
      setSelectedTuningSystem(null);
      resetFormForNewSystem();
      clearSelections();
    }
  };
  function handlePitchClassesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const raw = e.target.value;
    setTuningSystemPitchClasses(raw);

    // 1. Recompute the array of pitch‐classes
    const newArr = raw
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // 2. Detect type (fraction/decimal/cents/stringLength/unknown)
    const typeOfPitchClass = detectPitchClassType(newArr);

    // 3. Build initial newSelectedIndices[] exactly as before:
    const newSelectedIndices = Array.from({ length: newArr.length }, () => -1);

    if (typeOfPitchClass !== "unknown") {
      for (let i = 0; i < newArr.length; i++) {
        const pitchClass = newArr[i];
        const conv = convertPitchClass(pitchClass, typeOfPitchClass, tuningSystemStringLength, defaultReferenceFrequency);
        const fraction = conv?.fraction;
        if (fraction) {
          const idx = alKindiPitchClasses.indexOf(fraction);
          if (idx >= 0) {
            // first try octaveOne
            const o1 = octaveOneNoteNames.indexOf(alKindiNoteNames[idx] as TransliteratedNoteNameOctaveOne);
            if (o1 >= 0) {
              newSelectedIndices[i] = o1;
            } else {
              // otherwise try octaveTwo
              const o2 = octaveTwoNoteNames.indexOf(alKindiNoteNames[idx] as TransliteratedNoteNameOctaveTwo);
              if (o2 >= 0) {
                newSelectedIndices[i] = octaveOneNoteNames.length + o2;
              }
            }
          }
        }
      }
    }

    // 4. “Cascade‐fill” every remaining -1 so that no indices stay undefined.
    //    We treat the combined octave‐1 + octave‐2 arrays as a single “row”:
    const TOTAL_NOTE_NAMES = octaveOneNoteNames.length + octaveTwoNoteNames.length;

    // If the very first column is still -1, force it to 0:
    if (newSelectedIndices[0] < 0) {
      newSelectedIndices[0] = 0;
    }

    // Keep track of “last valid” as we scan left→right
    let lastValidIndex = newSelectedIndices[0];

    for (let i = 1; i < newSelectedIndices.length; i++) {
      if (newSelectedIndices[i] < 0) {
        // no match at i, so cascade from lastValidIndex
        let candidate = lastValidIndex + 1;
        if (candidate >= TOTAL_NOTE_NAMES) {
          // if we would run past the end of our combined row, clamp to the topmost index
          candidate = TOTAL_NOTE_NAMES - 1;
        }
        newSelectedIndices[i] = candidate;
      }
      // update lastValidIndex (whether it was originally set or just cascaded)
      lastValidIndex = newSelectedIndices[i];
    }

    setSelectedIndices(newSelectedIndices);

    // 5. Re‐pad selectedAbjadNames to length = newArr.length * 2
    const totalAbjadSlots = newArr.length * 2;
    const padded = Array(totalAbjadSlots).fill("");
    setSelectedAbjadNames(padded);
  }

  // MARK: Note Names Function Handlers

  const haveIndicesChanged = () => {
    return JSON.stringify(originalIndices) !== JSON.stringify(selectedIndices) || JSON.stringify(selectedTuningSystem?.getReferenceFrequencies()) !== JSON.stringify(referenceFrequencies);
  };

  // Handle reference frequency changes and recalculate active note frequencies
  const handleReferenceFrequencyChange = (noteName: string, newFrequency: number, shouldRecalculateSound: boolean = true) => {
    setReferenceFrequencies((prev) => ({
      ...prev,
      [noteName]: newFrequency,
    }));

    // Only recalculate sound if explicitly requested (not for drag end)
    if (shouldRecalculateSound) {
      // After state update, recalculate all active notes to match their new pitch class frequencies
      // Use setTimeout to ensure the state update and pitch class recalculation has completed
      setTimeout(() => {
        recalculateAllActiveNoteFrequencies();
      }, 0);
    }
  };

  const handleSaveStartingNoteConfiguration = () => {
    clearSelections();
    if (selectedTuningSystem && haveIndicesChanged()) {
      const newNoteSet = selectedIndices.map((idx) => {
        if (idx < 0) return "none";
        const O1_LEN = octaveOneNoteNames.length;
        if (idx < O1_LEN) {
          return octaveOneNoteNames[idx];
        } else {
          return octaveTwoNoteNames[idx - O1_LEN];
        }
      });

      const firstNote = newNoteSet[0];

      const noteNames = selectedTuningSystem.getNoteNames();

      const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
      newNoteNames.push(newNoteSet);

      handleSaveTuningSystem(newNoteNames);

      setOriginalIndices(selectedIndices);
    }
  };

  const handleDeleteStartingNoteConfiguration = () => {
    if (!selectedTuningSystem) return;

    const newNoteSet = selectedIndices.map((idx) => (idx >= 0 ? octaveOneNoteNames[idx] : "none"));
    const firstNote = newNoteSet[0];

    if (firstNote === "none") return;

    const noteNames = selectedTuningSystem?.getNoteNames() || [[]];

    const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
    setSelectedTuningSystem(selectedTuningSystem.copyWithNewSetOfNoteNames(newNoteNames));

    setSelectedIndices(Array(selectedIndices.length).fill(-1));
    setOriginalIndices(Array(selectedIndices.length).fill(-1));
  };

  // Here, we do separate calls:
  const isCurrentConfigurationNew = () => {
    const currentFirst = getFirstNoteName(selectedIndices);
    if (currentFirst === "none") return false;
    const noteNames = selectedTuningSystem?.getNoteNames() || [[]];
    return !noteNames.some((config) => config[0] === currentFirst);
  };

  // MARK: Main Component

  return (
    <div className="tuning-system-manager">
      {/*       <details open={true} className="tuning-system-manager__details">
         <summary className="tuning-system-manager__summary">
        <h2 className="tuning-system-manager__header">Tanghīm (tuning system)</h2>
      </summary>
      */}
      {admin && (
        <div className="tuning-system-manager__group">
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="tuningSystemSelect">
              {t("tuningSystem.selectOrCreate")}
            </label>
            <select
              className="tuning-system-manager__select"
              id="tuningSystemSelect"
              onChange={handleTuningSystemChange}
              value={selectedTuningSystem ? (selectedTuningSystem.isSaved() ? selectedTuningSystem.getId() : "new") : ""}
            >
              <option value="">{t("tuningSystem.none")}</option>
              <option value="new">{t("tuningSystem.createNew")}</option>
              {sortedTuningSystems.map((system) => (
                <option key={system.getId()} value={system.getId()}>
                  {system.stringify()}
                </option>
              ))}
            </select>
          </div>
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="sortOptionSelect" style={{ marginRight: "8px" }}>
              {t("tuningSystem.sortBy")}
            </label>
            <select className="tuning-system-manager__select" id="sortOptionSelect" value={sortOption} onChange={(e) => setSortOption(e.target.value as "id" | "creatorEnglish" | "year")}>
              <option value="id">{t("tuningSystem.id")}</option>
              <option value="creatorEnglish">{t("tuningSystem.creator")}</option>
              <option value="year">{t("tuningSystem.year")}</option>
            </select>
          </div>
        </div>
      )}

      {admin && selectedTuningSystem && (
        <div className="tuning-system-manager__form">
          {/* Identification / Titles */}
          <div className="tuning-system-manager__group">
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="titleEnglishField">
                {t("tuningSystem.titleEnglish")}
              </label>
              <input className="tuning-system-manager__input" id="titleEnglishField" type="text" value={titleEnglish ?? ""} onChange={(e) => setTitleEnglish(e.target.value)} />
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="titleArabicField">
                {t("tuningSystem.titleArabic")}
              </label>
              <input className="tuning-system-manager__input" id="titleArabicField" type="text" value={titleArabic ?? ""} onChange={(e) => setTitleArabic(e.target.value)} />
            </div>

            {/* Year / Source / Creator */}
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="yearField">
                {t("tuningSystem.year")}
              </label>
              <input className="tuning-system-manager__input" id="yearField" type="text" value={year ?? ""} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>

          <div className="tuning-system-manager__group">
            <div className="tuning-system-manager__sources-select-container">
              {sourcePageReferences.length < 6 && (
                <button className="tuning-system-manager__source-add-button" onClick={addSourceRef}>
                  {t("tuningSystem.addSource")}
                </button>
              )}
              {sourcePageReferences.map((ref, idx) => (
                <div key={idx} className="tuning-system-manager__source-select-item">
                  <select className="tuning-system-manager__source-select" value={ref.sourceId} onChange={(e) => updateSourceRefs(idx, { sourceId: e.target.value })}>
                    <option value="">{t("tuningSystem.selectSource")}</option>
                    {sources.map((s) => (
                      <option key={s.getId()} value={s.getId()}>
                        {s.getTitleEnglish()}
                      </option>
                    ))}
                  </select>
                  <input
                    className="tuning-system-manager__source-input"
                    type="text"
                    value={ref.page}
                    placeholder={t("tuningSystem.page")}
                    onChange={(e) => updateSourceRefs(idx, { page: e.target.value })}
                  />
                  <button className="jins-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                    {t("tuningSystem.delete")}
                  </button>
                </div>
              ))}
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="creatorEnglishField">
                {t("tuningSystem.creatorEnglish")}
              </label>
              <input className="tuning-system-manager__input" id="creatorEnglishField" type="text" value={creatorEnglish ?? ""} onChange={(e) => setCreatorEnglish(e.target.value)} />
            </div>
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="creatorArabicField">
                {t("tuningSystem.creatorArabic")}
              </label>
              <input className="tuning-system-manager__input" id="creatorArabicField" type="text" value={creatorArabic ?? ""} onChange={(e) => setCreatorArabic(e.target.value)} />
            </div>
          </div>

          {/* Comments */}
          <div className="tuning-system-manager__group">
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="commentsEnglishField">
                {t("tuningSystem.commentsEnglish")}
              </label>
              <textarea rows={5} className="tuning-system-manager__input" id="commentsEnglishField" value={commentsEnglish} onChange={(e) => setCommentsEnglish(e.target.value)} />
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="commentsArabicField">
                {t("tuningSystem.commentsArabic")}
              </label>
              <textarea rows={5} className="tuning-system-manager__input" id="commentsArabicField" value={commentsArabic} onChange={(e) => setCommentsArabic(e.target.value)} />
            </div>
          </div>
          <div className="tuning-system-manager__group">
            {/* Pitch Classes (textarea, each line => one element in string[]) */}
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="pitchClassesField">
                {t("tuningSystem.pitchClasses")}{" "}
                {detectPitchClassType(tuningSystemPitchClasses.split("\n")) !== "unknown" && (
                  <span className="tuning-system-manager__pitch-class-type">{"// " + detectPitchClassType(tuningSystemPitchClasses.split("\n"))}</span>
                )}
              </label>
              <textarea className="tuning-system-manager__textarea" id="pitchClassesField" rows={5} value={tuningSystemPitchClasses} onChange={handlePitchClassesChange} />
            </div>

            {/* Numeric fields */}
            <div className="tuning-system-manager__input-container">
              <div className="tuning-system-manager__input-container">
                <label className="tuning-system-manager__label" htmlFor="stringLengthField">
                  {t("tuningSystem.stringLength")}
                </label>
                <input
                  className="tuning-system-manager__input"
                  id="stringLengthField"
                  type="number"
                  value={tuningSystemStringLength ?? 0}
                  onChange={(e) => setTuningSystemStringLength(Number(e.target.value))}
                />
              </div>

              <div className="tuning-system-manager__input-container">
                <label className="tuning-system-manager__label" htmlFor="refFreqField">
                  {t("tuningSystem.defaultReferenceFrequency")}
                </label>
                <input
                  className="tuning-system-manager__input"
                  id="refFreqField"
                  type="number"
                  value={defaultReferenceFrequency ?? 0}
                  onChange={(e) => setDefaultReferenceFrequency(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="tuning-system-manager__buttons">
            <button className="tuning-system-manager__save-button" onClick={() => handleSaveTuningSystem()} disabled={!(!haveIndicesChanged() || getFirstNoteName(selectedIndices) === "none")}>
              {selectedTuningSystem.isSaved() ? t("tuningSystem.save") : t("tuningSystem.create")}
            </button>
            {selectedTuningSystem && (
              <button className="tuning-system-manager__delete-button" type="button" onClick={handleDelete}>
                {t("tuningSystem.deleteTuningSystem")}
              </button>
            )}
          </div>
        </div>
      )}

      {!admin && (
        <div className="tuning-system-manager__tabs">
          {tabs.map((tab) => {
            let count = 0;
            if (tab.label === "All") {
              count = sortedTuningSystems.length;
            } else {
              count = sortedTuningSystems.filter((ts) => {
                const y = getYearNum(ts);
                return y >= tab.min && y <= tab.max;
              }).length;
            }
            return (
              <button
                key={tab.label}
                className={"tuning-system-manager__tab" + (tuningSystemsFilter === tab.label ? " tuning-system-manager__tab_active" : "")}
                onClick={() => setTuningSystemsFilter(tab.label)}
              >
                {t(tab.labelKey)} <span className="tuning-system-manager__tab-count">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {!admin && (
        <div className="tuning-system-manager__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const container = document.querySelector(".tuning-system-manager__list");
              // In Arabic (RTL) mode many browsers invert the meaning of scrollLeft; to keep UX intuitive,
              // treat the "prev" button as moving visually right in RTL (positive delta) and left in LTR (negative delta).
              if (container) container.scrollBy({ left: language === "ar" ? 635 : -635, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div
            className="tuning-system-manager__list"
            style={{
              gridTemplateColumns: `repeat(${Math.ceil(filteredTuningSystems.length / 3)}, minmax(430px, 1fr))`,
            }}
          >
            {filteredTuningSystems.length === 0 ? (
              <p>{t("tuningSystem.noSystemsAvailable")}</p>
            ) : (
              filteredTuningSystems.map((tuningSystem, index) => (
                <div
                  key={index}
                  className={
                    "tuning-system-manager__item " +
                    (isTuningSystemDisabled(tuningSystem, selectedJinsData, selectedMaqamData, selectedMaqam).disabled ? "tuning-system-manager__item_disabled " : "") +
                    (tuningSystem.getId() === selectedTuningSystem?.getId() ? "tuning-system-manager__item_selected " : "")
                  }
                  onClick={() => {
                    const { noteName } = isTuningSystemDisabled(tuningSystem, selectedJinsData, selectedMaqamData, selectedMaqam);
                    handleTuningSystemClick(tuningSystem, noteName);
                  }}
                >
                  <strong className="tuning-system-manager__item-english-creator">
                    {language === "ar" && tuningSystem.getCreatorArabic()
                      ? `${tuningSystem.getCreatorArabic()} (${tuningSystem.getYear()})`
                      : `${tuningSystem.getCreatorEnglish()} (${tuningSystem.getYear()})`}
                  </strong>
                  <strong className="tuning-system-manager__item-english-title">
                    {language === "ar" && tuningSystem.getTitleArabic() ? tuningSystem.getTitleArabic() : tuningSystem.getTitleEnglish()}
                  </strong>
                </div>
              ))
            )}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const container = document.querySelector(".tuning-system-manager__list");
              // Mirror logic of prev button for RTL so "next" always moves visually left in RTL and right in LTR.
              if (container) container.scrollBy({ left: language === "ar" ? -635 : 635, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      )}
      <div className="tuning-system-manager__options-container">
        {/*         {!admin && (
          <div className="tuning-system-manager__sorting-options">
            <label
              className="tuning-system-manager__sorting-label"
              htmlFor="sortOptionSelect"
            >
              Sort By:
            </label>
            {
              <button
                className={
                  "tuning-system-manager__sorting-button " +
                  (sortOption === "id"
                    ? "tuning-system-manager__sorting-button_selected"
                    : "")
                }
                onClick={() => setSortOption("id")}
              >
                ID
              </button>
            }{" "}
            <button
              className={
                "tuning-system-manager__sorting-button " +
                (sortOption === "creatorEnglish"
                  ? "tuning-system-manager__sorting-button_selected"
                  : "")
              }
              onClick={() => setSortOption("creatorEnglish")}
            >
              Creator (English)
            </button>
            <button
              className={
                "tuning-system-manager__sorting-button " +
                (sortOption === "year"
                  ? "tuning-system-manager__sorting-button_selected"
                  : "")
              }
              onClick={() => setSortOption("year")}
            >
              Year
            </button>
            
          </div>
        )} */}

        {tuningSystemPitchClassesArray.length !== 0 && selectedTuningSystem && (
          <div className="tuning-system-manager__starting-note-container">
            <div className="tuning-system-manager__starting-note-left">
              {t("tuningSystem.startingNoteName")}
              {[...selectedTuningSystem.getNoteNames()]
                .sort((a, b) => getNoteNameIndex(a[0] ?? 0) - getNoteNameIndex(b[0] ?? 0))
                .map((notes, index) => {
                  const startingNote = notes[0];
                  const disabled = isTuningSystemDisabled(selectedTuningSystem, selectedJinsData, selectedMaqamData, selectedMaqam, startingNote).disabled;
                  return (
                    <div className="tuning-system-manager__starting-note" key={index}>
                      <div className="tuning-system-manager__starting-note-controls">
                        <button
                          className={
                            "tuning-system-manager__starting-note-button " +
                            (getFirstNoteName(selectedIndices) === startingNote ? "tuning-system-manager__starting-note-button_selected " : "") +
                            (disabled ? "tuning-system-manager__starting-note-button_disabled " : "")
                          }
                          onClick={() => handleStartNoteNameChange(startingNote)}
                        >
                          {getDisplayName(startingNote, "note")}
                        </button>
                        {admin ? (
                          <label htmlFor="reference-frequency-input">
                            <input
                              type="number"
                              id="reference-frequency-input"
                              value={referenceFrequencies[startingNote] ?? 0}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setReferenceFrequencies((prev) => ({
                                  ...prev,
                                  [startingNote]: val,
                                }));
                              }}
                              className="tuning-system-manager__starting-note-input"
                            />{" "}
                            Hz
                          </label>
                        ) : (
                          <FrequencyKnob
                            key={`${selectedTuningSystem?.getId()}-${startingNote}`}
                            value={referenceFrequencies[startingNote] ?? 220}
                            onChange={(val, shouldRecalculate) => {
                              handleReferenceFrequencyChange(startingNote, val, shouldRecalculate);
                            }}
                            onNewReferenceFrequency={updateAllActiveNotesByReferenceFrequency}
                            id={`tuning-system-${selectedTuningSystem?.getId()}-note-${startingNote}`}
                            noteName={startingNote}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              {isCurrentConfigurationNew() && (
                <div className="tuning-system-manager__starting-note">
                  <div className="tuning-system-manager__starting-note-controls">
                    <button className={"tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_unsaved tuning-system-manager__starting-note-button_selected"}>
                      {getDisplayName(getFirstNoteName(selectedIndices), "note")} ({t("tuningSystem.unsaved")})
                    </button>
                    {admin ? (
                      <label htmlFor="reference-frequency-input">
                        {t("tuningSystem.frequency")}
                        <input
                          type="number"
                          id="reference-frequency-input"
                          disabled={!admin}
                          value={referenceFrequencies[getFirstNoteName(selectedIndices)] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setReferenceFrequencies((prev) => ({
                              ...prev,
                              [getFirstNoteName(selectedIndices)]: val,
                            }));
                          }}
                          className="tuning-system-manager__starting-note-input"
                        />
                      </label>
                    ) : (
                      <FrequencyKnob
                        key={`${selectedTuningSystem?.getId()}-${getFirstNoteName(selectedIndices)}`}
                        value={referenceFrequencies[getFirstNoteName(selectedIndices)] ?? 220}
                        onChange={(val, shouldRecalculate) => {
                          handleReferenceFrequencyChange(getFirstNoteName(selectedIndices), val, shouldRecalculate);
                        }}
                        onNewReferenceFrequency={updateAllActiveNotesByReferenceFrequency}
                        id={`tuning-system-${selectedTuningSystem?.getId()}-note-${getFirstNoteName(selectedIndices)}`}
                        noteName={getFirstNoteName(selectedIndices)}
                      />
                    )}
                  </div>
                </div>
              )}
              <label htmlFor="reference-frequency-input">
                {t("tuningSystem.stringLength")}:
                <input
                  type="number"
                  id="reference-frequency-input"
                  value={tuningSystemStringLength ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTuningSystemStringLength(val);
                  }}
                  className="tuning-system-manager__starting-note-input"
                />
              </label>
            </div>
            {admin && (
              <div className="tuning-system-manager__starting-note-right">
                <button
                  className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_save"
                  onClick={handleSaveStartingNoteConfiguration}
                  disabled={!haveIndicesChanged() || getFirstNoteName(selectedIndices) === "none"}
                >
                  {t("tuningSystem.saveNoteConfiguration")}
                </button>
                <button
                  className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_delete"
                  onClick={handleDeleteStartingNoteConfiguration}
                  disabled={getFirstNoteName(selectedIndices) === "none"}
                >
                  {t("tuningSystem.deleteNoteConfiguration")}
                </button>
              </div>
            )}
          </div>
        )}

        {selectedTuningSystem && (
          <div className="tuning-system-manager__export-container">
            {t("tuningSystem.export")}
            <button className="tuning-system-manager__export-button" onClick={() => setIsExportModalOpen(true)}>
              <FileDownloadIcon style={{ fontSize: 18 }} />
            </button>
          </div>
        )}
      </div>

      {/* TUNING OCTAVES TABLES GRID */}

      <TuningSystemOctaveTables admin={admin} />
      <SelectedPitchClassTranspositions />

      {selectedTuningSystem && (selectedTuningSystem.getCommentsEnglish().trim() || selectedTuningSystem.getCommentsArabic().trim() || (sourcePageReferences && sourcePageReferences.length > 0)) && (
        <div className="tuning-system-manager__comments-sources-container">
          {(selectedTuningSystem.getCommentsEnglish().trim() || selectedTuningSystem.getCommentsArabic().trim()) && (
            <div className="tuning-system-manager__comments-english">
              <h3>{t("tuningSystem.comments")}</h3>
              <div>
                {(language === "ar" && selectedTuningSystem.getCommentsArabic().trim() ? selectedTuningSystem.getCommentsArabic() : selectedTuningSystem.getCommentsEnglish())
                  .split("\n")
                  .map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
              </div>
            </div>
          )}

          {sourcePageReferences && sourcePageReferences.length > 0 && (
            <div className="tuning-system-manager__sources-english">
              <h3>{t("tuningSystem.sources")}</h3>
              {[...sourcePageReferences]
                .sort((a, b) => {
                  const srcA = sources.find((s) => s.getId() === a.sourceId);
                  const srcB = sources.find((s) => s.getId() === b.sourceId);
                  const nameA = srcA?.getContributors()[0]?.lastNameEnglish || "";
                  const nameB = srcB?.getContributors()[0]?.lastNameEnglish || "";
                  return nameA.localeCompare(nameB);
                })
                .map((ref, idx) => {
                  const source = sources.find((s) => s.getId() === ref.sourceId);
                  return (
                    <Link href={`/bibliography?source=${source?.getId()}`} key={idx} className="tuning-system-manager__source-item">
                      {source && source.getContributors().length !== 0 && (
                        <span>
                          {source.getContributors()[0].lastNameEnglish?.length
                            ? `${source.getContributors()[0]?.lastNameEnglish ?? ""}, ${
                                source
                                  .getContributors()[0]
                                  ?.firstNameEnglish?.split(" ")
                                  .map((w) => w.charAt(0))
                                  .join(". ") ?? ""
                              }. (${source.getPublicationDateEnglish() ?? ""}${
                                source.getSourceType?.() === "Book" && "getOriginalPublicationDateEnglish" in source && source.getOriginalPublicationDateEnglish?.()
                                  ? "/" + source.getOriginalPublicationDateEnglish()
                                  : ""
                              }:${ref.page})`
                            : `{${source.getPublicationDateEnglish() ?? ""}${
                                source.getSourceType?.() === "Book" && "getOriginalPublicationDateEnglish" in source && source.getOriginalPublicationDateEnglish?.()
                                  ? "/" + source.getOriginalPublicationDateEnglish()
                                  : ""
                              }:${ref.page})`}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} exportType="tuning-system" />
    </div>
  );
}
