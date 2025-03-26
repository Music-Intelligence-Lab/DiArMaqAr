"use client";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context"; // Update import path as needed
import TuningSystem from "@/models/TuningSystem";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass } from "@/functions/convertPitchClass";
import TransliteratedNoteName, {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
  TransliteratedNoteNameOctaveThree,
  TransliteratedNoteNameOctaveZero,
} from "@/models/NoteName";

import { getEnglishNoteName, firstOctaveAbjadNames, secondOctaveAbjadNames } from "@/functions/noteNameMappings";

//todo: sound settings card
//todo: transfer all abjad names to new tuningSystems.json

export default function TuningSystemManager() {
  const { tuningSystems, selectedTuningSystem, setSelectedTuningSystem, updateAllTuningSystems, playNoteFrequency } = useAppContext();

  // Local state that mirrors the selected or “new” system’s fields
  const [id, setId] = useState("");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [year, setYear] = useState("");
  const [sourceEnglish, setSourceEnglish] = useState("");
  const [sourceArabic, setSourceArabic] = useState("");
  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  const [pitchClasses, setPitchClasses] = useState("");
  const [noteNames, setNoteNames] = useState<TransliteratedNoteName[][]>([]);
  const [stringLength, setStringLength] = useState<number>(0);
  const [referenceFrequency, setReferenceFrequency] = useState<number>(0);

  /**
   * We only store the note name “index” for the first octave (octaveOneNoteNames).
   * For example, if selectedIndices[i] = 5, that means the user has chosen the 5th element in octaveOneNoteNames.
   * If the user picks “none”, we store -1 in that slot.
   */
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [selectedAbjadOct1, setSelectedAbjadOct1] = useState<string[]>([]);
  const [selectedAbjadOct2, setSelectedAbjadOct2] = useState<string[]>([]);

  // Populate local state with the selected tuning system’s data:
  useEffect(() => {
    if (selectedTuningSystem) {
      setId(selectedTuningSystem.getId());
      setTitleEnglish(selectedTuningSystem.getTitleEnglish());
      setTitleArabic(selectedTuningSystem.getTitleArabic());
      setYear(selectedTuningSystem.getYear());
      setSourceEnglish(selectedTuningSystem.getSourceEnglish());
      setSourceArabic(selectedTuningSystem.getSourceArabic());
      setCreatorEnglish(selectedTuningSystem.getCreatorEnglish());
      setCommentsEnglish(selectedTuningSystem.getCommentsEnglish());
      setCommentsArabic(selectedTuningSystem.getCommentsArabic());
      setPitchClasses(selectedTuningSystem.getNotes().join("\n"));
      setStringLength(selectedTuningSystem.getStringLength());
      setSelectedAbjadOct1(selectedTuningSystem.getAbjadNames());
      setReferenceFrequency(selectedTuningSystem.getReferenceFrequency());

      const pitchArr = selectedTuningSystem.getNotes() || [];
      const loadedNames = selectedTuningSystem.getSetsOfNoteNames(); // array of strings from JSON
      setNoteNames(loadedNames);

      const firstSetOfNotes = loadedNames[0] ?? [];

      const mappedIndices = firstSetOfNotes.map((arabicName) => {
        const idx = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
        return idx >= 0 ? idx : -1;
      });

      while (mappedIndices.length < pitchArr.length) {
        mappedIndices.push(-1);
      }
      if (mappedIndices.length > pitchArr.length) {
        mappedIndices.length = pitchArr.length; // or keep them if you want
      }

      // 5) Update the selectedIndices state
      setSelectedIndices(mappedIndices);
      setOriginalIndices([...mappedIndices]);
    } else {
      // If user selects "new", reset everything
      resetFormForNewSystem();
    }
  }, [selectedTuningSystem]);

  // Clears the form for creating a new TuningSystem:
  const resetFormForNewSystem = () => {
    setId("");
    setTitleEnglish("");
    setTitleArabic("");
    setYear("");
    setSourceEnglish("");
    setSourceArabic("");
    setCreatorEnglish("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setPitchClasses("");
    setStringLength(0);
    setReferenceFrequency(0);
    setSelectedIndices([]);
  };

  // When user changes the dropdown (overall TuningSystem):
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") {
      setSelectedTuningSystem(null);
      resetFormForNewSystem();
    } else {
      const chosen = tuningSystems.find((ts) => ts.getId() === value);
      if (chosen) {
        setSelectedTuningSystem(chosen);
      }
    }
  };

  // Handle creating or updating a system:
  const handleSave = (event: FormEvent) => {
    event.preventDefault();

    // Each line in pitchClasses is one element in the array:
    const pitchClassesArr = pitchClasses
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (selectedTuningSystem) {
      // Editing an existing TuningSystem
      const updated = new TuningSystem(
        id,
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        pitchClassesArr,
        noteNames,
        selectedAbjadOct1,
        Number(stringLength),
        Number(referenceFrequency)
      );
      const updatedList = tuningSystems.map((ts) => (ts.getId() === selectedTuningSystem.getId() ? updated : ts));
      updateAllTuningSystems(updatedList);
      setSelectedTuningSystem(updated);

      // Persist changes if needed
      console.log("Edited TuningSystem saved:", updated);
    } else {
      // Creating a new TuningSystem
      const newSystem = new TuningSystem(
        id,
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        creatorEnglish,
        creatorArabic,
        commentsEnglish,
        commentsArabic,
        pitchClassesArr,
        noteNames,
        selectedAbjadOct1,
        Number(stringLength),
        Number(referenceFrequency)
      );
      const updatedList = [...tuningSystems, newSystem];
      updateAllTuningSystems(updatedList);
      setSelectedTuningSystem(newSystem);

      // Persist new item if needed
      console.log("New TuningSystem created:", newSystem);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedTuningSystem) {
      const updatedList = tuningSystems.filter((ts) => ts.getId() !== selectedTuningSystem.getId());
      updateAllTuningSystems(updatedList);
      setSelectedTuningSystem(null);
      console.log("TuningSystem deleted:", selectedTuningSystem.getId());
      resetFormForNewSystem();
    }
  };

  const haveIndicesChanged = () => {
    return JSON.stringify(originalIndices) !== JSON.stringify(selectedIndices);
  };

  const handleSaveStartingNoteConfiguration = () => {
    if (haveIndicesChanged()) {
      const newNoteSet = selectedIndices.map((idx) => (idx >= 0 ? octaveOneNoteNames[idx] : "none"));
      const firstNote = newNoteSet[0];

      const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
      newNoteNames.push(newNoteSet);
      setNoteNames(newNoteNames);

      setOriginalIndices(selectedIndices);
    }
  };

  const handleDeleteStartingNoteConfiguration = () => {
    const newNoteSet = selectedIndices.map((idx) => (idx >= 0 ? octaveOneNoteNames[idx] : "none"));
    const firstNote = newNoteSet[0];

    if (firstNote === "none") return;

    const newNoteNames = [...noteNames.filter((setOfNotes) => setOfNotes[0] !== firstNote)];
    setNoteNames(newNoteNames);

    setSelectedIndices(Array(selectedIndices.length).fill(-1));
    setOriginalIndices(Array(selectedIndices.length).fill(-1));
  };

  const handleStartNoteNameChange = (startingNoteName: string) => {
    for (const setOfNotes of noteNames) {
      if (setOfNotes[0] === startingNoteName) {
        const mappedIndices = setOfNotes.map((arabicName) => {
          const idx = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
          return idx >= 0 ? idx : -1;
        });

        while (mappedIndices.length < selectedIndices.length) {
          mappedIndices.push(-1);
        }
        if (mappedIndices.length > selectedIndices.length) {
          mappedIndices.length = selectedIndices.length;
        }

        setSelectedIndices(mappedIndices);
        setOriginalIndices([...mappedIndices]);
        return;
      }
    }

    setSelectedIndices(Array(selectedIndices.length).fill(-1));
  };

  // ----------------------------------------------------------------------------------
  // 4-Octave Note Name Grid
  // We store only the “first” octave’s selection in selectedIndices[].
  // The other octaves (0, 2, 3) are derived by the same index if not -1.
  // We also want “cascading” so that if the user picks a note for col i, col i+1 gets auto-filled.
  // If the user picks something in an *upper/lower* octave, we find its index in that octave’s array
  // and update the “first octave” index accordingly, maintaining sync.
  // ----------------------------------------------------------------------------------

  // Safety: parse pitch classes to figure out how many columns we need:
  const pitchClassesArr = pitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
    if (selectedAbjadOct1.length !== pitchClassesArr.length) {
      setSelectedAbjadOct1(Array(pitchClassesArr.length).fill(""));
    }
    if (selectedAbjadOct2.length !== pitchClassesArr.length) {
      setSelectedAbjadOct2(Array(pitchClassesArr.length).fill(""));
    }
  }, [pitchClassesArr.length, selectedAbjadOct1, selectedAbjadOct2]);

  function handleAbjadSelect(octave: number, colIndex: number, newValue: string) {
    if (octave === 1) {
      setSelectedAbjadOct1((prev) => {
        const copy = [...prev];
        copy[colIndex] = newValue;
        return copy;
      });
    } else if (octave === 2) {
      setSelectedAbjadOct2((prev) => {
        const copy = [...prev];
        copy[colIndex] = newValue;
        return copy;
      });
    }
    // If you want to auto-map from 1st to 2nd or vice versa, you can do so here.
  }

  // Make sure selectedIndices has length = pitchClassesArr.length
  useEffect(() => {
    if (pitchClassesArr.length !== selectedIndices.length) {
      setSelectedIndices((old) => {
        const newArr = [...old];
        newArr.length = pitchClassesArr.length;
        // fill new/undefined entries with -1
        for (let i = 0; i < newArr.length; i++) {
          if (newArr[i] === undefined) newArr[i] = -1;
        }
        return newArr;
      });
    }
  }, [pitchClassesArr.length, selectedIndices]);

  function getOctaveNoteName(octave: number, colIndex: number) {
    const idx = selectedIndices[colIndex];
    if (idx < 0) return "none";
    if (octave === 0 && idx < octaveZeroNoteNames.length) return octaveZeroNoteNames[idx];
    if (octave === 1 && idx < octaveOneNoteNames.length) return octaveOneNoteNames[idx];
    if (octave === 2 && idx < octaveTwoNoteNames.length) return octaveTwoNoteNames[idx];
    if (octave === 3 && idx < octaveThreeNoteNames.length) return octaveThreeNoteNames[idx];
    return "none";
  }

  // If user changes a note in a certain octave, find that note's index in that octave’s array, update the “first-octave” index.
  function handleSelectOctaveNote(octave: number, colIndex: number, chosenName: string) {
    setSelectedIndices((old) => {
      const newArr = [...old];

      // If user picked 'none', just set this one to -1 and stop:
      if (chosenName === "none") {
        newArr[colIndex] = -1;
        return newArr;
      }

      if (colIndex === 0) {
        const existingConfig = noteNames.find((config) => config[0] === chosenName);
        if (existingConfig) {
          // Build mapping from the saved configuration
          const newMapping = existingConfig.map((arabicName) => {
            const idx = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
            return idx >= 0 ? idx : -1;
          });
          // Ensure the mapping array has the same length as the current one
          while (newMapping.length < old.length) {
            newMapping.push(-1);
          }
          if (newMapping.length > old.length) {
            newMapping.length = old.length;
          }
          return newMapping;
        }
      }

      // 1) Find the first-octave index for this chosenName
      let foundIndex = -1;
      if (octave === 0) {
        foundIndex = octaveZeroNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveZero);
      } else if (octave === 1) {
        foundIndex = octaveOneNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveOne);
      } else if (octave === 2) {
        foundIndex = octaveTwoNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveTwo);
      } else {
        foundIndex = octaveThreeNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveThree);
      }

      // If not found, treat as none:
      if (foundIndex === -1) {
        newArr[colIndex] = -1;
        return newArr;
      }

      // 2) Set the chosen column’s index
      newArr[colIndex] = foundIndex;

      // 3) Cascade fill for all columns to the right
      //    i.e. colIndex+1, colIndex+2, ... until we run out of columns or name array
      //    For each column c, we want to use foundIndex + (c - colIndex).
      for (let c = colIndex + 1; c < newArr.length; c++) {
        const nextVal = foundIndex + (c - colIndex); // increment index
        // if nextVal is still within the note-name array bounds, fill it; otherwise stop
        let nameArray: ReadonlyArray<string> = [];
        if (octave === 0) nameArray = octaveZeroNoteNames;
        else if (octave === 1) nameArray = octaveOneNoteNames;
        else if (octave === 2) nameArray = octaveTwoNoteNames;
        else nameArray = octaveThreeNoteNames;

        if (nextVal < 0 || nextVal >= nameArray.length) {
          break; // we've run out of valid note names
        }

        newArr[c] = nextVal;
      }

      return newArr;
    });
  }

  // figure out what the input type is (fraction, cents, decimal, stringLength, or unknown)
  const pitchClassType = detectPitchClassType(pitchClassesArr);

  function renderConvertedCell(basePc: string, octave: 0 | 1 | 2 | 3, field: "fraction" | "decimal" | "cents" | "stringLength" | "frequency") {
    if (pitchClassType === "unknown") return "-";

    // Shift from octave 1 to whichever we want:
    const shiftedPc = shiftPitchClass(basePc, pitchClassType, octave);
    // Now convert that shifted PC to fraction/decimal/cents/stringLength/frequency
    const conv = convertPitchClass(shiftedPc, pitchClassType, stringLength, referenceFrequency);
    if (!conv) return "-";

    return conv[field] ?? "-";
  }

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

    const rowLabels = ["Index", "Note Name", "Abjad", "English", "Fraction", "Decimal", "Cents", "String Length", "Frequency", "Play", "Select"];

    return (
      <details className="tuning-system-manager__octave-details" open>
        <summary className="tuning-system-manager__octave-summary">Octave {octave}</summary>
        <table className="tuning-system-manager__octave-table" border={1} cellPadding={4}>
          <tbody>
            {/* Row 1: "Index" */}
            <tr>
              <td>{rowLabels[0]}</td>
              {pitchClassesArr.map((_, colIndex) => (
                <td key={colIndex}>{colIndex}</td>
              ))}
            </tr>

            {/* Row 2: "Note Name" */}
            <tr>
              <td>{rowLabels[1]}</td>
              {pitchClassesArr.map((_, colIndex) => {
                const currentVal = getOctaveNoteName(octave, colIndex);
                let nameArray: ReadonlyArray<string> = [];
                if (octave === 0) nameArray = octaveZeroNoteNames;
                else if (octave === 1) nameArray = octaveOneNoteNames;
                else if (octave === 2) nameArray = octaveTwoNoteNames;
                else nameArray = octaveThreeNoteNames;

                return (
                  <td key={colIndex}>
                    <select
                      className="tuning-system-manager__select-note"
                      value={currentVal ?? ""}
                      onChange={(e) => handleSelectOctaveNote(octave, colIndex, e.target.value)}
                    >
                      <option value="none">(none)</option>
                      {nameArray.map((nm) => (
                        <option key={nm} value={nm}>
                          {nm}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Abjad</td>
              {pitchClassesArr.map((_, colIndex) => {
                if (octave === 1) {
                  // Show a <select> from firstOctaveAbjadNames
                  return (
                    <td key={colIndex}>
                      <select
                        value={selectedAbjadOct1[colIndex] ?? ""}
                        className="tuning-system-manager__select-abjad"
                        onChange={(e) => handleAbjadSelect(1, colIndex, e.target.value)}
                      >
                        <option value="">(none)</option>
                        {firstOctaveAbjadNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                } else if (octave === 2) {
                  // Show a <select> from secondOctaveAbjadNames
                  return (
                    <td key={colIndex}>
                      <select
                        value={selectedAbjadOct2[colIndex] ?? ""}
                        className="tuning-system-manager__select-abjad"
                        onChange={(e) => handleAbjadSelect(2, colIndex, e.target.value)}
                      >
                        <option value="">(none)</option>
                        {secondOctaveAbjadNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                } else {
                  // For octaves 0 and 3, we just show “-” or blank
                  return <td key={colIndex}>-</td>;
                }
              })}
            </tr>

            <tr>
              <td>English</td>
              {pitchClassesArr.map((_, colIndex) => {
                // get the Arabic name that the user chose in “Note Name”
                const arabicName = getOctaveNoteName(octave, colIndex);
                // Now map it to English
                const english = getEnglishNoteName(arabicName);
                return <td key={colIndex}>{english}</td>;
              })}
            </tr>

            {/* Row 5: "Fraction" */}
            <tr>
              <td>{rowLabels[4]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>{renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "fraction")}</td>
              ))}
            </tr>

            {/* Row 6: "Decimal" */}
            <tr>
              <td>{rowLabels[5]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>{renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "decimal")}</td>
              ))}
            </tr>

            {/* Row 7: "Cents" */}
            <tr>
              <td>{rowLabels[6]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>{renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "cents")}</td>
              ))}
            </tr>

            {/* Row 8: "String Length" */}
            <tr>
              <td>{rowLabels[7]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>{renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "stringLength")}</td>
              ))}
            </tr>

            {/* Row 9: "Frequency" */}
            <tr>
              <td>{rowLabels[8]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>{renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "frequency")}</td>
              ))}
            </tr>

            {/* Row 10: "Play" */}
            <tr>
              <td>{rowLabels[9]}</td>
              {pitchClassesArr.map((basePc, colIndex) => (
                <td key={colIndex}>
                  <button type="button" className="tuning-system-manager__play-button" onClick={() => playNoteFrequency(parseInt(renderConvertedCell(basePc, octave as 0 | 1 | 2 | 3, "frequency")))}>
                    Play
                  </button>
                </td>
              ))}
            </tr>

            {/* Row 11: "Select" (checkbox) */}
            <tr>
              <td>{rowLabels[10]}</td>
              {pitchClassesArr.map((_, colIndex) => (
                <td key={colIndex}>
                  <input type="checkbox" className="tuning-system-manager__checkbox" />
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

  function getFirstNoteName() {
    const idx = selectedIndices[0];
    if (idx < 0) return "none";
    return octaveOneNoteNames[idx];
  }

  const isCurrentConfigurationNew = () => {
    const currentFirst = getFirstNoteName();
    if (currentFirst === "none") return false;
    return !noteNames.some((config) => config[0] === currentFirst);
  };

  return (
    <div className="tuning-system-manager">
      <h2 className="tuning-system-manager__header">Tuning System Manager</h2>

      <div className="tuning-system-manager__selection">
        <label htmlFor="tuningSystemSelect">Select Tuning System or Create New:</label>
        <select id="tuningSystemSelect" onChange={handleSelectChange} value={selectedTuningSystem ? selectedTuningSystem.getId() : "new"}>
          <option value="new">-- Create New System --</option>
          {tuningSystems.map((system) => (
            <option key={system.getId()} value={system.getId()}>
              {system.getCreatorEnglish()} ({system.getYear()}) {system.getTitleEnglish()}
            </option>
          ))}
        </select>
      </div>

      <form className="tuning-system-manager__form" onSubmit={handleSave}>
        {/* Identification / Titles */}
        <div className="tuning-system-manager__group">
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="idField">
              ID
            </label>
            <input className="tuning-system-manager__input" id="idField" type="text" value={id ?? ""} onChange={(e) => setId(e.target.value)} />
          </div>

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
            <input className="tuning-system-manager__input" id="yearField" type="text" value={year ?? ""} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>

        <div className="tuning-system-manager__group">
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="sourceEnglishField">
              Source (English)
            </label>
            <input
              className="tuning-system-manager__input"
              id="sourceEnglishField"
              type="text"
              value={sourceEnglish ?? ""}
              onChange={(e) => setSourceEnglish(e.target.value)}
            />
          </div>

          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="sourceArabicField">
              Source (Arabic)
            </label>
            <input
              className="tuning-system-manager__input"
              id="sourceArabicField"
              type="text"
              value={sourceArabic ?? ""}
              onChange={(e) => setSourceArabic(e.target.value)}
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
                Reference Frequency
              </label>
              <input
                className="tuning-system-manager__input"
                id="refFreqField"
                type="number"
                value={referenceFrequency ?? 0}
                onChange={(e) => setReferenceFrequency(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="tuning-system-manager__buttons">
          <button type="submit">{selectedTuningSystem ? "Save Changes" : "Create New System"}</button>
          {selectedTuningSystem && (
            <button type="button" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </form>

      {pitchClassesArr.length !== 0 && <div className="tuning-system-manager__starting-note-container">
        <div className="tuning-system-manager__starting-note-left">
          Choose Which Note Name To Start On:
          {noteNames.map((notes, index) => {
            const startingNote = notes[0];
            return (
              <button
                key={index}
                className={
                  "tuning-system-manager__starting-note " +
                  (getFirstNoteName() === startingNote ? "tuning-system-manager__starting-note_selected" : "")
                }
                onClick={() => handleStartNoteNameChange(startingNote)}
              >
                {startingNote}
              </button>
            );
          })}
          {isCurrentConfigurationNew() && (
            <button
              className={"tuning-system-manager__starting-note tuning-system-manager__starting-note_unsaved"}
              // Optionally, you can provide an onClick if you want to re-select it.
              onClick={() => {
                // For an unsaved config, you might just leave it as is or perform additional logic.
                console.log("New unsaved configuration selected:", getFirstNoteName());
              }}
            >
              {getFirstNoteName()} (unsaved)
            </button>
          )}
          <button
            className={"tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_reset"}
            onClick={() => handleStartNoteNameChange("none")}
          >
            Reset
          </button>
        </div>
        <div className="tuning-system-manager__starting-note-right">
          <button
            className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_save"
            onClick={handleSaveStartingNoteConfiguration}
            disabled={!haveIndicesChanged() || getFirstNoteName() === "none"}
          >
            Save
          </button>
          <button
            className="tuning-system-manager__starting-note-button tuning-system-manager__starting-note-button_delete"
            onClick={handleDeleteStartingNoteConfiguration}
            disabled={getFirstNoteName() === "none"}
          >
            Delete
          </button>
        </div>
      </div>}

      <div className="tuning-system-manager__grid-wrapper">{renderNoteNameGrid()}</div>
    </div>
  );
}
