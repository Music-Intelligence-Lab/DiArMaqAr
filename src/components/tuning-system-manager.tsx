"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { useFilterContext } from "@/contexts/filter-context";
import TuningSystem from "@/models/TuningSystem";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass, frequencyToMidiNoteNumber } from "@/functions/convertPitchClass";
import TransliteratedNoteName, {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
} from "@/models/NoteName";
import { nanoid } from "nanoid";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getEnglishNoteName, abjadNames } from "@/functions/noteNameMappings";
import { updateTuningSystems } from "@/functions/update";
import getFirstNoteName from "@/functions/getFirstNoteName";

export default function TuningSystemManager({ admin }: { admin: boolean }) {
  const {
    tuningSystems,
    setTuningSystems,
    selectedTuningSystem,
    setSelectedTuningSystem,
    pitchClasses,
    setPitchClasses,
    noteNames,
    setNoteNames,
    referenceFrequencies,
    setReferenceFrequencies,
    playNoteFrequency,
    selectedCells,
    setSelectedCells,
    selectedIndices,
    setSelectedIndices,
    originalIndices,
    setOriginalIndices,
    mapIndices,
    clearSelections,
    handleStartNoteNameChange,
    getSelectedCellDetails,
    playSequence,
    sources,
  } = useAppContext();

  const { filters, setFilters } = useFilterContext();

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

  const [openedOctaveRows, setOpenedOctaveRows] = useState<{ 0: boolean; 1: boolean; 2: boolean; 3: boolean }>({
    0: false,
    1: true,
    2: true,
    3: false,
  });

  // MARK: States
  // Local state that mirrors the selected or “new” system’s fields
  const [id, setId] = useState(nanoid());
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [year, setYear] = useState("");
  const [sourceEnglish, setSourceEnglish] = useState("");
  const [sourceArabic, setSourceArabic] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [page, setPage] = useState("");
  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");

  const [stringLength, setStringLength] = useState<number>(0);
  const [defaultReferenceFrequency, setDefaultReferenceFrequency] = useState<number>(0);

  /**
   * We only store the note name “index” for the first octave (octaveOneNoteNames).
   * For example, if selectedIndices[i] = 5, that means the user has chosen the 5th element in octaveOneNoteNames.
   * If the user picks “none”, we store -1 in that slot.
   */
  const [cascade, setCascade] = useState(false);
  const [selectedAbjadNames, setSelectedAbjadNames] = useState<string[]>([]);

  const pitchClassesArr = pitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
    if (selectedTuningSystem) {
      setId(selectedTuningSystem.getId());
      setTitleEnglish(selectedTuningSystem.getTitleEnglish());
      setTitleArabic(selectedTuningSystem.getTitleArabic());
      setYear(selectedTuningSystem.getYear());
      setSourceEnglish(selectedTuningSystem.getSourceEnglish());
      setSourceArabic(selectedTuningSystem.getSourceArabic());
      setSourceId(selectedTuningSystem.getSourceId());
      setPage(selectedTuningSystem.getPage());
      setCreatorEnglish(selectedTuningSystem.getCreatorEnglish());
      setCreatorArabic(selectedTuningSystem.getCreatorArabic());
      setCommentsEnglish(selectedTuningSystem.getCommentsEnglish());
      setCommentsArabic(selectedTuningSystem.getCommentsArabic());
      setPitchClasses(selectedTuningSystem.getPitchClasses().join("\n"));
      setStringLength(selectedTuningSystem.getStringLength());
      setSelectedAbjadNames(selectedTuningSystem.getAbjadNames());
      setReferenceFrequencies(selectedTuningSystem.getReferenceFrequencies());
      setDefaultReferenceFrequency(selectedTuningSystem.getDefaultReferenceFrequency());

      const loadedNames = selectedTuningSystem.getSetsOfNoteNames(); // array of strings from JSON
      setNoteNames(loadedNames);
    }
  }, [selectedTuningSystem]);

  useEffect(() => {
    if (selectedCells.length === 0) {
      setOpenedOctaveRows({ 0: false, 1: true, 2: true, 3: false });
    } else {
      const rows = { 0: false, 1: false, 2: false, 3: false };
      for (const selectedCell of selectedCells) {
        if (rows[selectedCell.octave as 0 | 1 | 2 | 3] === false) {
          rows[selectedCell.octave as 0 | 1 | 2 | 3] = true;
        }
      }
      setOpenedOctaveRows(rows);
    }
  }, [selectedCells]);

  // Sort the tuning systems according to sortOption
  // so our dropdown is neatly sorted:
  const sortedTuningSystems = [...tuningSystems].sort((a, b) => {
    switch (sortOption) {
      case "creatorEnglish":
        return a.getCreatorEnglish().localeCompare(b.getCreatorEnglish());

      case "year": {
        const yearA = parseInt(a.getYear()) || 0;
        const yearB = parseInt(b.getYear()) || 0;
        return yearA - yearB;
      }

      case "id":
      default:
        return a.getId().localeCompare(b.getId());
    }
  });

  // MARK: Tuning System Function Handlers

  // Clears the form for creating a new TuningSystem:
  const resetFormForNewSystem = () => {
    setId(nanoid());
    setTitleEnglish("");
    setTitleArabic("");
    setYear("");
    setSourceEnglish("");
    setSourceArabic("");
    setSourceId("");
    setPage("");
    setCreatorEnglish("");
    setCreatorArabic("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setPitchClasses("");
    setStringLength(0);
    setDefaultReferenceFrequency(0);
    setSelectedIndices([]);
    setSelectedAbjadNames([]);

    clearSelections();

    setNoteNames([]);

    mapIndices([], 0, false);
  };

  // When user changes the dropdown (overall TuningSystem):
  const handleTuningSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    clearSelections();

    if (id === "new") {
      // If "new," you can remove `tuningSystem` from the URL or set it to something else
      setSelectedTuningSystem(null);
      resetFormForNewSystem();
    } else {
      const chosen = tuningSystems.find((ts) => ts.getId() === id);
      if (chosen) {
        // set the chosen system
        setSelectedTuningSystem(chosen);
        handleStartNoteNameChange("", chosen.getSetsOfNoteNames(), chosen.getPitchClasses().length);
      }
    }
  };

  const handleTuningSystemClick = (ts: TuningSystem) => {
    clearSelections();
    setSelectedTuningSystem(ts);
    handleStartNoteNameChange("", ts.getSetsOfNoteNames(), ts.getPitchClasses().length);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSourceId(value);
  };

  // Handle creating or updating a system:
  const handleSaveTuningSystem = (givenNoteNames: TransliteratedNoteName[][] = []) => {
    const usedNoteNames = givenNoteNames.length > 0 ? givenNoteNames : noteNames;

    if (selectedTuningSystem) {
      const updated = new TuningSystem(
        id,
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        sourceId,
        page,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        pitchClassesArr,
        usedNoteNames,
        selectedAbjadNames,
        Number(stringLength),
        referenceFrequencies,
        Number(defaultReferenceFrequency)
      );
      const updatedList = tuningSystems.map((ts) => (ts.getId() === selectedTuningSystem.getId() ? updated : ts));
      updateTuningSystems(updatedList);
      setTuningSystems(updatedList);
      setSelectedTuningSystem(updated);
      clearSelections();
    } else {
      // Creating a new TuningSystem
      const newSystem = new TuningSystem(
        id,
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        sourceId,
        page,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        pitchClassesArr,
        usedNoteNames,
        selectedAbjadNames,
        Number(stringLength),
        referenceFrequencies,
        Number(defaultReferenceFrequency)
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

  // MARK: Note Names Function Handlers

  const haveIndicesChanged = () => {
    return JSON.stringify(originalIndices) !== JSON.stringify(selectedIndices);
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

      const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
      newNoteNames.push(newNoteSet);
      setNoteNames(newNoteNames);

      handleSaveTuningSystem(newNoteNames);

      setOriginalIndices(selectedIndices);
    }
  };

  const handleDeleteStartingNoteConfiguration = () => {
    clearSelections();
    const newNoteSet = selectedIndices.map((idx) => (idx >= 0 ? octaveOneNoteNames[idx] : "none"));
    const firstNote = newNoteSet[0];

    if (firstNote === "none") return;

    const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
    setNoteNames(newNoteNames);

    setSelectedIndices(Array(selectedIndices.length).fill(-1));
    setOriginalIndices(Array(selectedIndices.length).fill(-1));
  };

  // MARK: Cell Checkbox Handlers

  // Given an octave and a column index, check if that cell is already selected.
  const isCellSelected = (octave: number, colIndex: number) => selectedCells.some((cell) => cell.octave === octave && cell.index === colIndex);

  // When a checkbox is toggled, update the selectedCells accordingly.
  const handleCheckboxChange = (octave: number, colIndex: number, checked: boolean) => {
    setSelectedCells((prevCells) => {
      // Remove any existing instance of this cell.
      const newCells = prevCells.filter((cell) => !(cell.octave === octave && cell.index === colIndex));
      // If the checkbox is now checked, add the cell.
      if (checked) newCells.push({ octave, index: colIndex });
      // Always sort the cells first by octave then by index.
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
  // and update the “first octave” index accordingly, maintaining sync.
  // ----------------------------------------------------------------------------------

  const numberOfPitchClasses = pitchClassesArr.length;

  useEffect(() => {
    if (selectedIndices.length < numberOfPitchClasses) {
      const typeOfPitchClass = detectPitchClassType(pitchClassesArr);

      if (typeOfPitchClass === "unknown") {
        setSelectedIndices((prev) => [...prev, -1]);
      } else {
        const newSelectedIndices = Array.from({ length: numberOfPitchClasses }, () => -1);

        for (let i = 0; i < numberOfPitchClasses; i++) {
          if (!selectedIndices[i] || selectedIndices[i] === -1) {
            const pitchClass = pitchClassesArr[i];
            const fraction = convertPitchClass(pitchClass, typeOfPitchClass, stringLength, defaultReferenceFrequency)?.fraction;

            if (fraction) {
              const alKindiFractionIndex = alKindiPitchClasses.indexOf(fraction);
              if (alKindiFractionIndex >= 0) {
                const alKindiNoteName = alKindiNoteNames[alKindiFractionIndex];
                const octaveOneIndex = octaveOneNoteNames.indexOf(alKindiNoteName as TransliteratedNoteNameOctaveOne);
                if (octaveOneIndex >= 0) {
                  newSelectedIndices[i] = octaveOneIndex;
                } else {
                  const octaveTwoIndex = octaveTwoNoteNames.indexOf(alKindiNoteName as TransliteratedNoteNameOctaveTwo);
                  if (octaveTwoIndex >= 0) {
                    newSelectedIndices[i] = octaveOneNoteNames.length + octaveTwoIndex;
                  }
                }
              }
            }
          } else {
            newSelectedIndices[i] = selectedIndices[i];
          }
        }

        setSelectedIndices(newSelectedIndices);
      }
    }
  }, [pitchClassesArr, selectedIndices]);

  useEffect(() => {
    if (selectedAbjadNames.length > numberOfPitchClasses * 2) {
      setSelectedAbjadNames(selectedAbjadNames.slice(0, numberOfPitchClasses * 2));
    } else if (selectedAbjadNames.length < numberOfPitchClasses * 2) {
      const newArr = [...selectedAbjadNames];
      while (newArr.length < numberOfPitchClasses * 2) {
        newArr.push("");
      }
      setSelectedAbjadNames(newArr);
    }
  }, [pitchClassesArr, selectedAbjadNames]);

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

  // If user changes a note in a certain octave, find that note's index in that octave’s array, update the “first-octave” index.
  function handleSelectOctaveNote(colIndex: number, chosenName: string) {
    setSelectedIndices((old) => {
      const newArr = [...old];

      // 1) If user picked '(none)', just set -1 in this column:
      if (chosenName === "none") {
        newArr[colIndex] = -1;
        return newArr;
      }

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
  const pitchClassType = detectPitchClassType(pitchClassesArr);

  const actualReferenceFrequency = referenceFrequencies[getFirstNoteName(selectedIndices)] || defaultReferenceFrequency;

  function renderConvertedCell(basePc: string, octave: 0 | 1 | 2 | 3, field: "fraction" | "decimal" | "cents" | "stringLength" | "frequency") {
    if (pitchClassType === "unknown") return "-";

    // Shift from octave 1 to whichever we want:
    const shiftedPc = shiftPitchClass(basePc, pitchClassType, octave);
    // Now convert that shifted PC to fraction/decimal/cents/stringLength/frequency
    const conv = convertPitchClass(shiftedPc, pitchClassType, stringLength, actualReferenceFrequency);
    if (!conv) return "-";

    return conv[field] ?? "-";
  }

  // MARK: Octave Rows

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
  function renderOctaveDetails(octave: number) {
    if (!pitchClassesArr.length) return null;

    return (
      <details className="tuning-system-manager__octave-details" open={openedOctaveRows[octave as 0 | 1 | 2 | 3]}>
        <summary
          className="tuning-system-manager__octave-summary"
          onClick={(e) => {
            e.preventDefault();
            setOpenedOctaveRows((rows) => ({
              ...rows,
              [octave]: !rows[octave as 0 | 1 | 2 | 3],
            }));
          }}
        >
          <span className="tuning-system-manager__octave-summary-title">
            Diwān (octave) {octave}{" "}
            {((octave === 1 && openedOctaveRows[1]) || (octave === 2 && openedOctaveRows[2])) && (
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
                    (filterKey === "decimalRatio" && pitchClassType === "decimal") ||
                    (filterKey === "stringLength" && pitchClassType === "stringLength");

                  if (isDisabled) return null;

                  return (
                    <label
                      key={filterKey}
                      htmlFor={`filter-${filterKey}`}
                      className={`tuning-system-manager__filter-item ${filters[filterKey as keyof typeof filters] ? "tuning-system-manager__filter-item_active" : ""
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
                        {filterKey.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + filterKey.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                      </span>

                    </label>
                  );
                })}
              </span>
            )}
          </span>
          <div className="tuning-system-manager__octave-summary-content">

          </div>
        </summary>


        <table className="tuning-system-manager__octave-table" border={0}>


          <colgroup>
            <col style={{ minWidth: "110px", maxWidth: "110px", width: "110px" }} />
          </colgroup>



          <tbody>
            {/* Row 1: Pitch Class */}
            <tr>
              <td>Pitch Class</td>
              {pitchClassesArr.map((_, colIndex) => (
                <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                  {colIndex}
                </td>
              ))}
            </tr>
            {/* Row 2: Note Name */}
            <tr style={{ minHeight: "50px", maxHeight: "50px", height: "50px" }}>
              <td>Note Name</td>
              {pitchClassesArr.map((_, colIndex) => {
                const currentVal = getOctaveNoteName(octave, colIndex);

                if (octave === 1 && admin) {
                  return (
                    <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                      <select
                        className="tuning-system-manager__select-note"
                        value={currentVal ?? ""}
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
                    <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                      {currentVal === "none" ? "(none)" : currentVal.replace(/\//g, "/\u200B")}
                    </td>
                  );
                }
              })}
            </tr>
            {/* Row 3: Abjad Name */}
            {filters.abjadName && (
              <tr>
                <td>Abjad Name</td>
                {pitchClassesArr.map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className={`
            ${isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected " : ""}
            ${!(octave === 1 || octave === 2) ? "tuning-system-manager__abjad-name" : ""}
          `.trim()}
                  >
                    {octave === 1 || octave === 2 ? (
                      <select
                        className="tuning-system-manager__select-abjad"
                        value={selectedAbjadNames[colIndex + (octave === 1 ? 0 : numberOfPitchClasses)] || ""}
                        onChange={(e) => handleAbjadSelect(colIndex, e.target.value, octave)}
                      >
                        <option value="">(none)</option>
                        {abjadNames.map((name, idx) => (
                          <option key={`${name}-${idx}`} value={name}>
                            {name.replace(/\//g, "/\u200B")}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="tuning-system-manager__abjad-name">
                        {(selectedAbjadNames[colIndex + (octave === 1 ? 0 : numberOfPitchClasses)] || "").replace(/\//g, "/\u200B")}
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
                {pitchClassesArr.map((_, colIndex) => {
                  const arabicName = getOctaveNoteName(octave, colIndex);
                  const english = getEnglishNoteName(arabicName);
                  return (
                    <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                      {english}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>

        <table className="tuning-system-manager__octave-table" border={0}>

          <colgroup>
            <col style={{ minWidth: "110px", maxWidth: "110px", width: "110px" }} />
          </colgroup>

          <tbody>
            {pitchClassType !== "unknown" && (
              <tr className="tuning-system-manager__octave-table__detectedPitchClassType">
                <td>{{ fraction: "Fraction Ratio", cents: "Cents (¢)", decimal: "Decimal Ratio", stringLength: "String Length" }[pitchClassType]}</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, pitchClassType)}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 5: Cents (¢) */}
            {filters.cents && pitchClassType !== "cents" && (
              <tr>
                <td>Cents (¢)</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "cents")}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 6: Fraction Ratio */}
            {filters.fractionRatio && pitchClassType !== "fraction" && (
              <tr>
                <td>Fraction Ratio</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "fraction")}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 7: String Length */}
            {filters.stringLength && pitchClassType !== "stringLength" && (
              <tr>
                <td>String Length</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "stringLength")}
                  </td>
                ))}
              </tr>
            )}

            {filters.fretDivision && (
              <tr>
                <td>Fret Division</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {(
                      parseFloat(renderConvertedCell(pitchClassesArr[0], 1, "stringLength")) -
                      parseFloat(renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "stringLength"))
                    ).toFixed(3)}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 8: Decimal Ratio */}
            {filters.decimalRatio && pitchClassType !== "decimal" && (
              <tr>
                <td>Decimal Ratio</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "decimal")}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 9: Midi Note */}
            {filters.midiNote && (
              <tr>
                <td>Midi Note</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {frequencyToMidiNoteNumber(parseInt(renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "frequency"))).toFixed(2)}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 10: Freq (Hz) */}
            {filters.frequency && (
              <tr>
                <td>Freq (Hz)</td>
                {pitchClassesArr.map((basePc, colIndex) => (
                  <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                    {renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "frequency")}
                  </td>
                ))}
              </tr>
            )}

            {/* Row 11: Play */}
            <tr>
              <td>Play</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                  <PlayCircleIcon className="tuning-system-manager__play-circle-icon" onClick={() => playNoteFrequency(parseInt(renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "frequency")))} />

                </td>
              ))}
            </tr>

            {/* Row 12: Select (checkbox) */}
            <tr>
              <td>Select</td>
              {pitchClassesArr.map((_, colIndex) => (
                <td key={colIndex} className={isCellSelected(octave, colIndex) ? "tuning-system-manager__cell-selected" : ""}>
                  <input
                    type="checkbox"
                    className="tuning-system-manager__checkbox"
                    checked={isCellSelected(octave, colIndex)}
                    onChange={(e) => handleCheckboxChange(octave, colIndex, e.target.checked)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </details>
    );
  }

  // We can either display all 4 octaves in separate tables, or combine them.
  // Here, we do separate calls:
  function renderNoteNameGrid() {
    if (!pitchClassesArr.length) return null;

    return (
      <div className="tuning-system-manager__grid">
        {renderOctaveDetails(0)}
        {renderOctaveDetails(1)}
        {renderOctaveDetails(2)}
        {renderOctaveDetails(3)}
      </div>
    );
  }

  const isCurrentConfigurationNew = () => {
    const currentFirst = getFirstNoteName(selectedIndices);
    if (currentFirst === "none") return false;
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
              value={selectedTuningSystem ? selectedTuningSystem.getId() : "new"}
            >
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

      {admin && (
        <form className="tuning-system-manager__form">
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
            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="tuningSystemSelect">
                Select Source:
              </label>
              <select className="tuning-system-manager__select" id="tuningSystemSelect" onChange={handleSourceChange} value={sourceId}>
                <option value="">-- No Source Selected --</option>
                {sources.map((source) => (
                  <option key={source.getId()} value={source.getId()}>
                    {`${source.getTitleEnglish()} (${source.getSourceType()})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="tuning-system-manager__input-container">
              <label className="tuning-system-manager__label" htmlFor="sourceArabicField">
                Page
              </label>
              <input
                className="tuning-system-manager__input"
                id="sourceArabicField"
                type="text"
                value={page ?? ""}
                onChange={(e) => setPage(e.target.value)}
              />
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
                {detectPitchClassType(pitchClasses.split("\n")) !== "unknown" && (
                  <span className="tuning-system-manager__pitch-class-type">{"// " + detectPitchClassType(pitchClasses.split("\n"))}</span>
                )}
              </label>
              <textarea
                className="tuning-system-manager__textarea"
                id="pitchClassesField"
                rows={5}
                value={pitchClasses}
                onChange={(e) => setPitchClasses(e.target.value)}
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
            <button className="tuning-system-manager__save-button" onClick={() => handleSaveTuningSystem()}>
              {selectedTuningSystem ? "Save Tuning System Changes" : "Create New Tuning System"}
            </button>
            {selectedTuningSystem && (
              <button className="tuning-system-manager__delete-button" type="button" onClick={handleDelete}>
                Delete Tuning System
              </button>
            )}
          </div>
        </form>
      )}

      {!admin && (
        <div className="tuning-system-manager__list">
          {tuningSystems.length === 0 ? (
            <p>No tuning systems available.</p>
          ) : (
            tuningSystems.map((tuningSystem, index) => (
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
                {tuningSystem.stringify()}
              </div>
            ))
          )}
        </div>
      )}

      {pitchClassesArr.length !== 0 && (
        <div className="tuning-system-manager__starting-note-container">
          <div className="tuning-system-manager__starting-note-left">
            Start Note Names From:
            {noteNames.map((notes, index) => {
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
                      disabled={!admin}
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




            {/*               <button
                className={"tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_reset"}
                onClick={() => handleStartNoteNameChange("none")}
              >
                Reset Note Names
              </button>
 */}
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

      {/* COMMENTS AND SOURCES */}
      <div className="tuning-system-manager__comments-english">
        <h3>Comments:</h3>
        {selectedTuningSystem?.getCommentsEnglish()}
      </div>

      <div className="tuning-system-manager__sources-english">
        <h3>Sources:</h3>
        {(() => {
          const source = sources.find(source => source.getId() === selectedTuningSystem?.getSourceId());
          if (!source) return null;
          return (
            <>
              {source.getContributors()[0].lastNameEnglish}, {source.getContributors()[0].firstNameEnglish} ({source.getReleaseDateEnglish()}:{selectedTuningSystem?.getPage()})<br />
            </>
          );
        })()}
      </div>

      <div className="tuning-system-manager__comments-arabic">
        <h3>تعليقات:</h3>
        {selectedTuningSystem?.getCommentsArabic()}
      </div>

      <div className="tuning-system-manager__sources-arabic">
        <h3>مصادر:</h3>
        {selectedTuningSystem?.getSourceArabic()}
      </div>


      <div className="tuning-system-manager__grid-wrapper">{renderNoteNameGrid()}</div>
      <div className="tuning-system-manager__buttons">
        <button
          className="tuning-system-manager__play-sequence-button"
          disabled={selectedCells.length === 0}
          onClick={() => {
            const frequencies = selectedCells.map((cell) => {
              const cellDetails = getSelectedCellDetails(cell);

              return parseInt(cellDetails.frequency) ?? 0;
            });

            playSequence(frequencies);
          }}
        >
          Play Selected Sequence
        </button>
      </div>
    </div>
  );
}
