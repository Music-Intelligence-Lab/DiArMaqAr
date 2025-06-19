"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import TuningSystem from "@/models/TuningSystem";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass from "@/functions/convertPitchClass";
import NoteName, {
  octaveOneNoteNames,
  octaveTwoNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
  getNoteNameIndex,
  octaveZeroNoteNames,
  octaveFourNoteNames,
  octaveThreeNoteNames,
} from "@/models/NoteName";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { abjadNames } from "@/functions/noteNameMappings";
import { updateTuningSystems } from "@/functions/update";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { SourcePageReference } from "@/models/bibliography/Source";
import { exportTuningSystem } from "@/functions/export";

export default function TuningSystemManager({ admin }: { admin: boolean }) {
  const {
    tuningSystems,
    setTuningSystems,
    selectedTuningSystem,
    setSelectedTuningSystem,
    tuningSystemPitchClasses,
    setTuningSystemPitchClasses,
    referenceFrequencies,
    setReferenceFrequencies,
    selectedPitchClasses,
    setSelectedPitchClasses,
    selectedIndices,
    setSelectedIndices,
    originalIndices,
    setOriginalIndices,
    mapIndices,
    clearSelections,
    handleStartNoteNameChange,
    sources,
    selectedJins,
    selectedMaqam,
    allPitchClasses,
  } = useAppContext();

  const { activePitchClasses, playNoteFrequency, playSequence } = useSoundContext();

  const { filters, setFilters, tuningSystemsFilter, setTuningSystemsFilter } = useFilterContext();

  const alKindiPitchClasses = ["1/1", "256/243", "9/8", "32/27", "81/64", "4/3", "1024/729", "3/2", "128/81", "27/16", "16/9", "4096/2187"];

  const alKindiNoteNames = [
    "ʿushayrān",
    "ʿajam ʿushayrān",
    "kawasht",
    "rāst",
    "zirguleh",
    "dūgāh",
    "kurdī",
    "buselīk/ʿushshāq",
    "chahargāh",
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
    "jawāb buselīk",
    "mahurān",
    "jawāb ḥijāz",
    "saham/ramal tūtī",
    "jawāb ḥiṣār",
    "jawāb ḥuseinī",
  ];

  const [sortOption, setSortOption] = useState<"id" | "creatorEnglish" | "year">("year");
  const [editingCell, setEditingCell] = useState<{ octave: number; index: number } | null>(null);
  const tabs = [
    { label: "all", min: -Infinity, max: Infinity },
    { label: "8th–10th c. CE", min: 700, max: 999 },
    { label: "11th–15th c. CE", min: 1000, max: 1499 },
    { label: "16th–19th c. CE", min: 1500, max: 1899 },
    { label: "20th–21st c. CE", min: 1900, max: 2100 },
  ];

  const [openedOctaveRows, setOpenedOctaveRows] = useState<{
    0: boolean;
    1: boolean;
    2: boolean;
    3: boolean;
  }>({
    0: false,
    1: true,
    2: true,
    3: false,
  });

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

  const [stringLength, setStringLength] = useState<number>(0);
  const [defaultReferenceFrequency, setDefaultReferenceFrequency] = useState<number>(0);

  const octaveScrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const [cascade, setCascade] = useState(false);
  const [selectedAbjadNames, setSelectedAbjadNames] = useState<string[]>([]);

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
      setStringLength(selectedTuningSystem.getStringLength());
      setSelectedAbjadNames(selectedTuningSystem.getAbjadNames());
      setReferenceFrequencies(selectedTuningSystem.getReferenceFrequencies());
      setDefaultReferenceFrequency(selectedTuningSystem.getDefaultReferenceFrequency());
    }
  }, [selectedTuningSystem]);

  useEffect(() => {
    if (!selectedJins || !selectedMaqam) return;
    if (selectedPitchClasses.length === 0) {
      setOpenedOctaveRows({ 0: false, 1: true, 2: true, 3: false });
    } else {
      const rows = { 0: false, 1: false, 2: false, 3: false };
      for (const pitchClass of selectedPitchClasses) {
        if (rows[pitchClass.octave as 0 | 1 | 2 | 3] === false) {
          rows[pitchClass.octave as 0 | 1 | 2 | 3] = true;
        }
      }
      setOpenedOctaveRows(rows);
    }
  }, [selectedPitchClasses]);

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
    setStringLength(0);
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

  const handleTuningSystemClick = (ts: TuningSystem) => {
    setSelectedTuningSystem(ts);
    handleStartNoteNameChange("", ts.getNoteNames(), ts.getPitchClasses().length);
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
        Number(stringLength),
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
        Number(stringLength),
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

  function getOctaveNoteName(octave: number, colIndex: number) {
    const idx = selectedIndices[colIndex];
    if (idx < 0) return "none";

    // The length of octaveOneNoteNames. For example, if it's 36,
    // then any idx >= 36 means it's from the "octaveTwoNoteNames" portion.
    const O1_LEN = octaveOneNoteNames.length;

    // Decide whether idx points into octaveOne or octaveTwo
    let localIndex = idx;
    let isFromOctaveOne = true;
    if (idx >= O1_LEN) {
      // It's from the "octaveTwo" segment
      isFromOctaveOne = false;
      localIndex = idx - O1_LEN;
    }

    // Now localIndex is the position within whichever segment
    // (octaveOne or octaveTwo), and we do the same old logic
    // but picking from the correct array depending on isFromOctaveOne.

    if (isFromOctaveOne) {
      // The user originally picked something in the "octaveOne" half
      if (octave === 0 && localIndex < octaveZeroNoteNames.length) {
        return octaveZeroNoteNames[localIndex];
      }
      if (octave === 1 && localIndex < octaveOneNoteNames.length) {
        return octaveOneNoteNames[localIndex];
      }
      if (octave === 2 && localIndex < octaveTwoNoteNames.length) {
        return octaveTwoNoteNames[localIndex];
      }
      if (octave === 3 && localIndex < octaveThreeNoteNames.length) {
        return octaveThreeNoteNames[localIndex];
      }
      return "none";
    } else {
      // The user originally picked something in the "octaveTwo" half
      // so localIndex is an index into the octaveTwoNoteNames array.
      if (octave === 0 && localIndex < octaveZeroNoteNames.length) {
        return octaveOneNoteNames[localIndex];
      }
      if (octave === 1 && localIndex < octaveOneNoteNames.length) {
        return octaveTwoNoteNames[localIndex];
      }
      if (octave === 2 && localIndex < octaveTwoNoteNames.length) {
        return octaveThreeNoteNames[localIndex];
      }
      if (octave === 3 && localIndex < octaveThreeNoteNames.length) {
        return octaveFourNoteNames[localIndex];
      }
      return "none";
    }
  }

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
        const conv = convertPitchClass(pitchClass, typeOfPitchClass, stringLength, defaultReferenceFrequency);
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

  // MARK: pitchClass Checkbox Handlers

  // Given an octave and a column index, check if that pitchClass is already selected.
  const isCellSelected = (octave: number, colIndex: number) => selectedPitchClasses.some((pitchClasses) => pitchClasses.octave === octave && pitchClasses.index === colIndex);
  const isCellActive = (octave: number, colIndex: number) => activePitchClasses.some((pitchClasses) => pitchClasses.octave === octave && pitchClasses.index === colIndex);

  const getCellClassName = (octave: number, colIndex: number) => {
    const isSelected = isCellSelected(octave, colIndex);
    const isActive = isCellActive(octave, colIndex);
    return `tuning-system-manager__cell ${octave} ${isSelected ? "tuning-system-manager__cell_selected " : ""} ${
      isActive ? "tuning-system-manager__cell_active " : ""
    }`;
  };

  const handleCheckboxChange = (octave: number, colIndex: number, checked: boolean) => {
    setSelectedPitchClasses((prevCells) => {
      const newCells = prevCells.filter((pitchClass) => !(pitchClass.octave === octave && pitchClass.index === colIndex));
      if (checked) {
        const existingCell = allPitchClasses.find((pitchClass) => pitchClass.octave === octave && pitchClass.index === colIndex);
        if (existingCell) newCells.push(existingCell);
      }
      newCells.sort((a, b) => (a.octave === b.octave ? a.index - b.index : a.octave - b.octave));
      return newCells;
    });
  };

  // ----------------------------------------------------------------------------------
  // 4-Octave Note Name Grid
  // We store only the “first” octave’s selection in selectedIndices[].
  // The other octaves (0, 2, 3) are derived by the same index if not -1.
  // We also want “cascading” so that if the user picks a note for col i, col i+1 gets auto-filled.
  // If the user picks something in an *upper/lower* octave, we find its index in that octave’s array
  // and update the “first-octave” index accordingly, maintaining sync.
  // ----------------------------------------------------------------------------------

  const numberOfPitchClasses = tuningSystemPitchClassesArray.length;

  function handleAbjadSelect(colIndex: number, newValue: string, octave: number) {
    setSelectedAbjadNames((prev) => {
      const copy = [...prev];
      const rowOffset = octave === 1 ? 0 : numberOfPitchClasses;
      const baseIdx = rowOffset + colIndex;

      copy[baseIdx] = newValue;

      if (cascade) {
        const allNames = abjadNames;
        const startPos = allNames.indexOf(newValue);
        if (startPos >= 0) {
          for (let c = colIndex + 1; c < numberOfPitchClasses; c++) {
            copy[rowOffset + c] = allNames[startPos + (c - colIndex)] ?? "";
          }
        }
      }
      return copy;
    });
  }

  // If user changes a note in a certain octave, find that note's index in that octave’s array, update the “first-octave” index.
  function handleSelectOctaveNote(colIndex: number, chosenName: string) {
    setSelectedIndices((old) => {
      const newArr = [...old];

      // 1) If user picked '(none)', just set -1 in this column:
      if (chosenName === "none") {
        newArr[colIndex] = -1;
        return newArr;
      }

      const noteNames = selectedTuningSystem?.getNoteNames() || [[]];

      // 2) If this is the *first column*, try to see if there's an existing config
      //    whose FIRST note is chosenName. If yes, we load that config in full.
      if (colIndex === 0) {
        const existingConfig = noteNames.find((config) => config[0] === chosenName);
        if (existingConfig) {
          // Convert each note in existingConfig to its *combined* index:
          const newMapping = existingConfig.map((arabicName) => {
            // See if arabicName is in octaveOne or octaveTwo:
            const idxInOct1 = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
            if (idxInOct1 >= 0) {
              return idxInOct1;
            } else {
              const idxInOct2 = octaveTwoNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveTwo);
              if (idxInOct2 >= 0) {
                // Offset by length of octaveOne array to point into octaveTwo portion
                return octaveOneNoteNames.length + idxInOct2;
              } else {
                return -1;
              }
            }
          });

          // Make sure newMapping matches current length:
          while (newMapping.length < old.length) {
            newMapping.push(-1);
          }
          if (newMapping.length > old.length) {
            newMapping.length = old.length;
          }
          return newMapping;
        }
      }

      // 3) Otherwise, we directly find chosenName in either octaveOne or octaveTwo
      let foundIndex = -1;
      const idxInOct1 = octaveOneNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveOne);
      if (idxInOct1 >= 0) {
        foundIndex = idxInOct1;
      } else {
        const idxInOct2 = octaveTwoNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveTwo);
        if (idxInOct2 >= 0) {
          // Offset by the size of the first array
          foundIndex = octaveOneNoteNames.length + idxInOct2;
        }
      }

      if (foundIndex === -1) {
        // Not found in either array => treat as none
        newArr[colIndex] = -1;
        return newArr;
      }

      // 4) Put foundIndex into the chosen column
      newArr[colIndex] = foundIndex;

      // 5) Cascade fill for columns to the right
      if (cascade) {
        const totalRow1Length = octaveOneNoteNames.length + octaveTwoNoteNames.length;
        for (let c = colIndex + 1; c < newArr.length; c++) {
          const offset = c - colIndex; // increment for each column
          const nextVal = foundIndex + offset;
          if (nextVal >= totalRow1Length) {
            newArr[c] = -1; // or leave as -1 if out-of-bounds
          } else {
            newArr[c] = nextVal;
          }
        }
      }



      return newArr;
    });
  }

  // figure out what the input type is (fraction, cents, decimal, stringLength, or unknown)
  const pitchClassType = detectPitchClassType(tuningSystemPitchClassesArray);

  // MARK: Octave Rows

  const getCells = (octave: number) => {
    if (allPitchClasses.length % numberOfPitchClasses !== 0) throw new Error("All pitchClasses must be evenly divisible by the number of pitch classes.");
    return allPitchClasses.slice(octave * numberOfPitchClasses, (octave + 1) * numberOfPitchClasses);
  };

  const displayStringValue = (value: string | number, decimal = 2) => {
    if (typeof value === "number") return value.toFixed(decimal);
    else if (value.includes("/")) return value;
    else return parseFloat(value).toFixed(decimal);
  };

  /**
   * Render a single octave's table, with each column showing:
   *  1) pitch class index
   *  2) note name select
   *  3) abjad select
   *  4) english note name
   *  5) fraction
   *  6) decimal
   *  7) cents
   *  8) string length
   *  9) frequency
   *  10) "Play" button + checkbox
   */

  function renderOctave(octave: number) {
    if (!tuningSystemPitchClassesArray.length) return null;

    const rowCells = getCells(octave);

    return (
      <details className="tuning-system-manager__octave-details" open={openedOctaveRows[octave as 0 | 1 | 2 | 3]}>
        <summary
          className="tuning-system-manager__octave-summary"
          onClick={(e) => {
            e.preventDefault();
            /* setOpenedOctaveRows((rows) => ({
              ...rows,
              [octave]: !rows[octave as 0 | 1 | 2 | 3],
            })); */
          }}
        >
          <span
            className="tuning-system-manager__octave-summary-title"
            onClick={() =>
              setOpenedOctaveRows((rows) => ({
                ...rows,
                [octave]: !rows[octave as 0 | 1 | 2 | 3],
              }))
            }
          >
            Dīwān (octave) {octave}{" "}
          </span>
          {admin && ((octave === 1 && openedOctaveRows[1]) || (octave === 2 && openedOctaveRows[2])) && (
            <button
              className="tuning-system-manager__octave-cascade-button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setCascade((c) => !c);
              }}
            >
              {cascade ? "Cascade Enabled" : "Cascade Disabled"}
            </button>
          )}
          {octave === 1 && openedOctaveRows[1] && (
            <span className="tuning-system-manager__filter-menu">
              {Object.keys(filters).map((filterKey) => {
                const isDisabled =
                  (filterKey === "fractionRatio" && pitchClassType === "fraction") ||
                  (filterKey === "cents" && pitchClassType === "cents") ||
                  (filterKey === "decimalRatio" && pitchClassType === "decimalRatio") ||
                  (filterKey === "stringLength" && pitchClassType === "stringLength");

                if (isDisabled) return null;

                return (
                  <label
                    key={filterKey}
                    htmlFor={`filter-${filterKey}`}
                    className={`tuning-system-manager__filter-item ${
                      filters[filterKey as keyof typeof filters] ? "tuning-system-manager__filter-item_active" : ""
                    }`}
                    // prevent the drawer (or parent) click handler from firing
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={`filter-${filterKey}`}
                      type="checkbox"
                      className="tuning-system-manager__filter-checkbox"
                      checked={filters[filterKey as keyof typeof filters]}
                      disabled={isDisabled}
                      onChange={(e) => {
                        // still stop propagation so only the checkbox toggles
                        e.stopPropagation();
                        setFilters((prev) => ({
                          ...prev,
                          [filterKey as keyof typeof filters]: e.target.checked,
                        }));
                      }}
                    />
                    <span className="tuning-system-manager__filter-label">
                      {filterKey
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .charAt(0)
                        .toUpperCase() +
                        filterKey
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                          .slice(1)}
                    </span>
                  </label>
                );
              })}
            </span>
          )}

          <div className="tuning-system-manager__octave-summary-content"></div>
        </summary>

        <div className="tuning-system-manager__octaves-carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const container = document.querySelector(".tuning-system-manager__octave-scroll");
              if (container) container.scrollBy({ left: -635, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="tuning-system-manager__octave-scroll" ref={octaveScrollRefs[octave as 0 | 1 | 2 | 3]}>
            <table className="tuning-system-manager__octave-table" border={0}>
              <colgroup>
                <col
                  style={{
                    minWidth: "110px",
                    maxWidth: "110px",
                    width: "110px",
                  }}
                />
              </colgroup>

              <tbody>
                {/* Row 1: Pitch Class */}
                {filters.pitchClass && (
                  <tr>
                    <td>Pitch Class</td>
                    {tuningSystemPitchClassesArray.map((_, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {colIndex}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 2: Note Name */}
                <tr
                  style={{
                    minHeight: "50px",
                    maxHeight: "50px",
                    height: "50px",
                  }}
                >
                  <td>Note Name</td>
                  {rowCells.map((pitchClass, colIndex) => {
                    if (octave === 1 && admin) {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          <select
                            className="tuning-system-manager__select-note"
                            value={getOctaveNoteName(octave, colIndex) ?? ""}
                            onChange={(e) => handleSelectOctaveNote(colIndex, e.target.value)}
                          >
                            <option value="none">(none)</option>
                            {octaveOneNoteNames.map((nm) => (
                              <option key={nm} value={nm}>
                                {nm.replace(/\//g, "/\u200B")}
                              </option>
                            ))}
                            {colIndex !== 0 && (
                              <>
                                <option value="none">---</option>
                                {octaveTwoNoteNames.map((nm) => (
                                  <option key={nm} value={nm}>
                                    {nm.replace(/\//g, "/\u200B")}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </td>
                      );
                    } else {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          {pitchClass.noteName === "none" ? "(none)" : pitchClass.noteName.replace(/\//g, "/\u200B")}
                        </td>
                      );
                    }
                  })}
                </tr>
                {/* Row 3: Abjad Name */}
                {filters.abjadName && (
                  <tr>
                    <td>Abjad Name</td>
                    {tuningSystemPitchClassesArray.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className={`
            ${getCellClassName(octave, colIndex)}
            ${!(octave === 1 || octave === 2) ? "tuning-system-manager__abjad-name" : ""}
          `}
                      >
                        {admin && (octave === 1 || octave === 2) ? (
                          <select
                            className="tuning-system-manager__select-abjad"
                            value={selectedAbjadNames[colIndex + (octave === 1 ? 0 : numberOfPitchClasses)] || ""}
                            onChange={(e) => handleAbjadSelect(colIndex, e.target.value, octave)}
                          >
                            <option value="">--</option>
                            {abjadNames.map((name, idx) => (
                              <option key={`${name}-${idx}`} value={name}>
                                {name.replace(/\//g, "/\u200B")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="tuning-system-manager__abjad-name">
                            {(selectedAbjadNames[colIndex + (octave <= 1 ? 0 : numberOfPitchClasses)] || "--").replace(/\//g, "/\u200B")}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 4: English Name */}
                {filters.englishName && (
                  <tr>
                    <td>English Name</td>
                    {rowCells.map((pitchClass, colIndex) => {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          {pitchClass.englishName}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {pitchClassType !== "unknown" && (
                  <tr className="tuning-system-manager__octave-table__detectedPitchClassType">
                    <td>
                      {
                        {
                          fraction: "Fraction Ratio",
                          cents: "Cents (¢)",
                          decimalRatio: "Decimal Ratio",
                          stringLength: "String Length",
                        }[pitchClassType]
                      }
                    </td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.originalValue)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 5: Cents (¢) */}
                {filters.cents && pitchClassType !== "cents" && (
                  <tr>
                    <td>Cents (¢)</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.cents)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 6: Fraction Ratio */}
                {filters.fractionRatio && pitchClassType !== "fraction" && (
                  <tr>
                    <td>Fraction Ratio</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.fraction)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 7: String Length */}
                {filters.stringLength && pitchClassType !== "stringLength" && (
                  <tr>
                    <td>String Length</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.stringLength)}
                      </td>
                    ))}
                  </tr>
                )}

                {filters.fretDivision && (
                  <tr>
                    <td>Fret Division</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.fretDivision)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 8: Decimal Ratio */}
                {filters.decimalRatio && pitchClassType !== "decimalRatio" && (
                  <tr>
                    <td>Decimal Ratio</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.decimalRatio)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 9: Midi Note */}
                {filters.midiNote && (
                  <tr>
                    <td>Midi Note</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.midiNoteNumber)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 10: Freq (Hz) */}
                {filters.frequency && (
                  <tr>
                    <td>Freq (Hz)</td>
                    {rowCells.map((pitchClass, colIndex) => {
                      const isEditing = editingCell?.octave === octave && editingCell.index === colIndex;
                      return (
                        <td
                          key={colIndex}
                          className={getCellClassName(octave, colIndex) + " " + (isEditing ? "tuning-system-manager__cell_editing " : "")}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (referenceFrequencies[getFirstNoteName(selectedIndices)]) setEditingCell({ octave, index: colIndex });
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              defaultValue={pitchClass.frequency}
                              autoFocus
                              className="tuning-system-manager__freq-input"
                              onBlur={(e) => {
                                const newFrequency = parseFloat(e.currentTarget.value);
                                const cents = pitchClass.cents;
                                const centsValue = parseFloat(cents);
                                const newStartingFrequency = newFrequency / Math.pow(2, centsValue / 1200);
                                const startingNote = getFirstNoteName(selectedIndices);
                                setReferenceFrequencies((prev) => ({
                                  ...prev,
                                  [startingNote]: newStartingFrequency,
                                }));
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                            />
                          ) : (
                            displayStringValue(pitchClass.frequency)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Row 11: Play */}
                <tr>
                  <td>Play</td>
                  {rowCells.map((pitchClass, colIndex) => (
                    <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                      <PlayCircleIcon
                        className="tuning-system-manager__play-circle-icon"
                        onClick={() => playNoteFrequency(parseFloat(pitchClass.frequency))}
                      />
                    </td>
                  ))}
                </tr>

                {/* Row 12: Select (checkbox) */}
                <tr>
                  <td>Select</td>
                  {tuningSystemPitchClassesArray.map((_, colIndex) => (
                    <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                      <input
                        type="checkbox"
                        className="tuning-system-manager__checkbox"
                        checked={isCellSelected(octave, colIndex)}
                        onChange={(e) => handleCheckboxChange(octave, colIndex, e.target.checked)}
                        onClick={(e) => (e.currentTarget as HTMLInputElement).blur()}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const container = document.querySelector(".tuning-system-manager__octave-scroll");
              if (container) container.scrollBy({ left: 635, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      </details>
    );
  }

  // We can either display all 4 octaves in separate tables, or combine them.
  // Here, we do separate calls:
  function renderNoteNameGrid() {
    if (!tuningSystemPitchClassesArray.length) return null;

    return (
      <div className="tuning-system-manager__grid">
        {renderOctave(0)}
        {renderOctave(1)}
        {renderOctave(2)}
        {renderOctave(3)}
      </div>
    );
  }

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
              Select Tuning System or Create New:
            </label>
            <select
              className="tuning-system-manager__select"
              id="tuningSystemSelect"
              onChange={handleTuningSystemChange}
              value={selectedTuningSystem ? (selectedTuningSystem.isSaved() ? selectedTuningSystem.getId() : "new") : ""}
            >
              <option value="">-- None --</option>
              <option value="new">-- Create New System --</option>
              {sortedTuningSystems.map((system) => (
                <option key={system.getId()} value={system.getId()}>
                  {system.stringify()}
                </option>
              ))}
            </select>
          </div>
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="sortOptionSelect" style={{ marginRight: "8px" }}>
              Sort By:
            </label>
            <select
              className="tuning-system-manager__select"
              id="sortOptionSelect"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "id" | "creatorEnglish" | "year")}
            >
              <option value="id">ID</option>
              <option value="creatorEnglish">Creator (English)</option>
              <option value="year">Year</option>
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
                Title (English)
              </label>
              <input
                className="tuning-system-manager__input"
                id="titleEnglishField"
                type="text"
                value={titleEnglish ?? ""}
                onChange={(e) => setTitleEnglish(e.target.value)}
              />
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="titleArabicField">
                Title (Arabic)
              </label>
              <input
                className="tuning-system-manager__input"
                id="titleArabicField"
                type="text"
                value={titleArabic ?? ""}
                onChange={(e) => setTitleArabic(e.target.value)}
              />
            </div>

            {/* Year / Source / Creator */}
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="yearField">
                Year
              </label>
              <input
                className="tuning-system-manager__input"
                id="yearField"
                type="text"
                value={year ?? ""}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="tuning-system-manager__group">
            <div className="tuning-system-manager__sources-select-container">
              {sourcePageReferences.length < 6 && (
                <button className="tuning-system-manager__source-add-button" onClick={addSourceRef}>
                  Add Source
                </button>
              )}
              {sourcePageReferences.map((ref, idx) => (
                <div key={idx} className="tuning-system-manager__source-select-item">
                  <select
                    className="tuning-system-manager__source-select"
                    value={ref.sourceId}
                    onChange={(e) => updateSourceRefs(idx, { sourceId: e.target.value })}
                  >
                    <option value="">Select source</option>
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
                    placeholder="Page"
                    onChange={(e) => updateSourceRefs(idx, { page: e.target.value })}
                  />
                  <button className="jins-manager__source-delete-button" onClick={() => removeSourceRef(idx)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="creatorEnglishField">
                Creator (English)
              </label>
              <input
                className="tuning-system-manager__input"
                id="creatorEnglishField"
                type="text"
                value={creatorEnglish ?? ""}
                onChange={(e) => setCreatorEnglish(e.target.value)}
              />
            </div>
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="creatorArabicField">
                Creator (Arabic)
              </label>
              <input
                className="tuning-system-manager__input"
                id="creatorArabicField"
                type="text"
                value={creatorArabic ?? ""}
                onChange={(e) => setCreatorArabic(e.target.value)}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="tuning-system-manager__group">
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="commentsEnglishField">
                Comments (English)
              </label>
              <textarea
                rows={5}
                className="tuning-system-manager__input"
                id="commentsEnglishField"
                value={commentsEnglish}
                onChange={(e) => setCommentsEnglish(e.target.value)}
              />
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="commentsArabicField">
                Comments (Arabic)
              </label>
              <textarea
                rows={5}
                className="tuning-system-manager__input"
                id="commentsArabicField"
                value={commentsArabic}
                onChange={(e) => setCommentsArabic(e.target.value)}
              />
            </div>
          </div>
          <div className="tuning-system-manager__group">
            {/* Pitch Classes (textarea, each line => one element in string[]) */}
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="pitchClassesField">
                Pitch Classes (one per line){" "}
                {detectPitchClassType(tuningSystemPitchClasses.split("\n")) !== "unknown" && (
                  <span className="tuning-system-manager__pitch-class-type">{"// " + detectPitchClassType(tuningSystemPitchClasses.split("\n"))}</span>
                )}
              </label>
              <textarea
                className="tuning-system-manager__textarea"
                id="pitchClassesField"
                rows={5}
                value={tuningSystemPitchClasses}
                onChange={handlePitchClassesChange}
              />
            </div>

            {/* Numeric fields */}
            <div className="tuning-system-manager__input-container">
              <div className="tuning-system-manager__input-container">
                <label className="tuning-system-manager__label" htmlFor="stringLengthField">
                  String Length
                </label>
                <input
                  className="tuning-system-manager__input"
                  id="stringLengthField"
                  type="number"
                  value={stringLength ?? 0}
                  onChange={(e) => setStringLength(Number(e.target.value))}
                />
              </div>

              <div className="tuning-system-manager__input-container">
                <label className="tuning-system-manager__label" htmlFor="refFreqField">
                  Default Reference Frequency
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
              {selectedTuningSystem.isSaved() ? "Save Tuning System Changes" : "Create New Tuning System"}
            </button>
            {selectedTuningSystem && (
              <button className="tuning-system-manager__delete-button" type="button" onClick={handleDelete}>
                Delete Tuning System
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
                {tab.label.charAt(0).toUpperCase() + tab.label.slice(1)} <span className="tuning-system-manager__tab-count">({count})</span>
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
              if (container) container.scrollBy({ left: -635, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="tuning-system-manager__list" style={{ ["--column-count" as any]: Math.min(filteredTuningSystems.length, 10) }}>
            {filteredTuningSystems.length === 0 ? (
              <p>No tuning systems available.</p>
            ) : (
              filteredTuningSystems.map((tuningSystem, index) => (
                <div
                  key={index}
                  className={
                    "tuning-system-manager__item " +
                    (tuningSystem.getId() === selectedTuningSystem?.getId() ? "tuning-system-manager__item_selected " : "")
                  }
                  onClick={() => {
                    handleTuningSystemClick(tuningSystem);
                  }}
                >
                  <strong className="tuning-system-manager__item-english-creator">{`${tuningSystem.getCreatorEnglish()} (${tuningSystem.getYear()})`}</strong>
                  <strong className="tuning-system-manager__item-english-title">{tuningSystem.getTitleEnglish()}</strong>
                </div>
              ))
            )}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const container = document.querySelector(".tuning-system-manager__list");
              if (container) container.scrollBy({ left: 635, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      )}

      {!admin && (
        <div className="tuning-system-manager__sorting-options">
          <label className="tuning-system-manager__sorting-label" htmlFor="sortOptionSelect">
            Sort By:
          </label>
          <button
            className={"tuning-system-manager__sorting-button " + (sortOption === "id" ? "tuning-system-manager__sorting-button_selected" : "")}
            onClick={() => setSortOption("id")}
          >
            ID
          </button>
          <button
            className={
              "tuning-system-manager__sorting-button " + (sortOption === "creatorEnglish" ? "tuning-system-manager__sorting-button_selected" : "")
            }
            onClick={() => setSortOption("creatorEnglish")}
          >
            Creator (English)
          </button>
          <button
            className={"tuning-system-manager__sorting-button " + (sortOption === "year" ? "tuning-system-manager__sorting-button_selected" : "")}
            onClick={() => setSortOption("year")}
          >
            Year
          </button>
        </div>
      )}

      {tuningSystemPitchClassesArray.length !== 0 && selectedTuningSystem && (
        <div className="tuning-system-manager__starting-note-container">
          <div className="tuning-system-manager__starting-note-left">
            Start Note Names From:
            {[...selectedTuningSystem.getNoteNames()]
              .sort((a, b) => getNoteNameIndex(a[0] ?? 0) - getNoteNameIndex(b[0] ?? 0))
              .map((notes, index) => {
                const startingNote = notes[0];
                return (
                  <div className="tuning-system-manager__starting-note" key={index}>
                    <button
                      className={
                        "tuning-system-manager__starting-note-button " +
                        (getFirstNoteName(selectedIndices) === startingNote ? "tuning-system-manager__starting-note-button_selected" : "")
                      }
                      onClick={() => handleStartNoteNameChange(startingNote)}
                    >
                      {startingNote}
                    </button>
                    <label htmlFor="reference-frequency-input">
                      Frequency (Hz):
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
                      />
                    </label>
                  </div>
                );
              })}
            {isCurrentConfigurationNew() && (
              <div className="tuning-system-manager__starting-note">
                <button
                  className={
                    "tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_unsaved tuning-system-manager__starting-note-button_selected"
                  }
                >
                  {getFirstNoteName(selectedIndices)} (unsaved)
                </button>
                <label htmlFor="reference-frequency-input">
                  Frequency (Hz):
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
              </div>
            )}
            {selectedTuningSystem && (
              <button
                className="tuning-system-manager__export-button"
                onClick={() => {
                  const firstNote = getFirstNoteName(selectedIndices);
                  const data = exportTuningSystem(selectedTuningSystem, firstNote);
                  const json = JSON.stringify(data, null, 2);
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedTuningSystem.stringify()} starting on ${firstNote}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <FileDownloadIcon />
              </button>
            )}
          </div>
          {admin && (
            <div className="tuning-system-manager__starting-note-right">
              <button
                className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_save"
                onClick={handleSaveStartingNoteConfiguration}
                disabled={!haveIndicesChanged() || getFirstNoteName(selectedIndices) === "none"}
              >
                Save Note Name Configuration
              </button>
              <button
                className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_delete"
                onClick={handleDeleteStartingNoteConfiguration}
                disabled={getFirstNoteName(selectedIndices) === "none"}
              >
                Delete Note Name Configuration
              </button>
            </div>
          )}
        </div>
      )}
      {/* </details> */}

      <div className="tuning-system-manager__grid-wrapper">{renderNoteNameGrid()}</div>
      <div className="tuning-system-manager__buttons">
        <button
          className="tuning-system-manager__play-sequence-button"
          disabled={selectedPitchClasses.length === 0}
          onClick={() => {
            const frequencies = selectedPitchClasses.map((pitchClasses) => {
              return parseInt(pitchClasses.frequency) ?? 0;
            });

            playSequence(frequencies);
          }}
        >
          Play Selected Sequence
        </button>
      </div>

      {/* COMMENTS AND SOURCES */}
      <div className="tuning-system-manager__comments-sources-container">
        <div className="tuning-system-manager__comments-english">
          <h3>Comments:</h3>
          <div>
            {selectedTuningSystem
              ?.getCommentsEnglish()
              .split("\n")
              .map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
          </div>
        </div>

        {/* <div className="tuning-system-manager__comments-arabic">
        <h3>تعليقات:</h3>
        {selectedTuningSystem?.getCommentsArabic()}
      </div> */}

        <div className="tuning-system-manager__sources-english">
          <h3>Sources:</h3>
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
                <div key={idx} className="tuning-system-manager__source-item">
                  {source && source.getContributors().length !== 0 && (
                    <span className="">
                      {source.getContributors()[0].lastNameEnglish?.length
                        ? `${source.getContributors()[0]?.lastNameEnglish ?? ""}, ${
                            source
                              .getContributors()[0]
                              ?.firstNameEnglish?.split(" ")
                              .map((w) => w.charAt(0))
                              .join(". ") ?? ""
                          }. (${source.getReleaseDateEnglish() ? source.getReleaseDateEnglish() + "/" : ""}${source.getReleaseDateEnglish() ?? ""}:${
                            ref.page
                          })`
                        : `${source.getTitleEnglish()} (${source.getReleaseDateEnglish() ? source.getReleaseDateEnglish() + "/" : ""}${
                            source.getReleaseDateEnglish() ?? ""
                          }:${ref.page})`}
                    </span>
                  )}
                </div>
              );
            })}
        </div>

        {/* <div className="tuning-system-manager__sources-arabic">
        <h3>مصادر:</h3>
        {selectedTuningSystem?.getSourceArabic()}
      </div> */}
      </div>
    </div>
  );
}
