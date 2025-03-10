"use client";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context"; // Update import path as needed
import TuningSystem from "@/models/TuningSystem";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass from "@/functions/convertPitchClass";
import TransliteratedNoteName, { octaveZeroNoteNames, OctaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames } from "@/models/NoteName";

export default function TuningSystemManager() {
  const { tuningSystems, selectedTuningSystem, setSelectedTuningSystem, updateAllTuningSystems } = useAppContext();

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
  // Now using a textarea for pitchClasses, each line becomes an element in the string[].
  const [pitchClasses, setPitchClasses] = useState("");
  // We’ll keep noteNames the same for now (comma-separated JSON strings or similar).
  const [noteNames, setNoteNames] = useState<string[]>([]);
  const [stringLength, setStringLength] = useState<number>(0);
  const [referenceFrequency, setReferenceFrequency] = useState<number>(0);

  /**
   * We only store the note name “index” for the first octave (OctaveOneNoteNames).
   * For example, if selectedIndices[i] = 5, that means the user has chosen the 5th element in OctaveOneNoteNames.
   * If the user picks “none”, we store -1 in that slot.
   */
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

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
      // Join pitchClasses by new lines
      setPitchClasses(selectedTuningSystem.getNotes().join("\n"));
      setNoteNames(selectedTuningSystem.getNoteNames().map((nn) => JSON.stringify(nn)));
      setStringLength(selectedTuningSystem.getStringLength());
      setReferenceFrequency(selectedTuningSystem.getReferenceFrequency());

      // If you want to restore previously stored note choices for the “first” octave, you'd do it here.
      // For now, we’ll just reset them to -1 for each pitch class:
      const pitchArr = selectedTuningSystem.getNotes() || [];
      setSelectedIndices(Array(pitchArr.length).fill(-1));
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
    setNoteNames([]);
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

    // Convert noteNames from string[] into array of TransliteratedNoteName
    const noteNamesArr: TransliteratedNoteName[] = noteNames
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((raw) => JSON.parse(raw) as TransliteratedNoteName);

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
        noteNamesArr,
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
        noteNamesArr,
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

  // A small ref to guard “cascading”:
  const [isCascading, setIsCascading] = useState(false);

  // Helper: get the note name from the user-chosen index, for a given octave
  function getOctaveNoteName(octave: number, colIndex: number) {
    const idx = selectedIndices[colIndex];
    if (idx < 0) return "none";
    if (octave === 0 && idx < octaveZeroNoteNames.length) return octaveZeroNoteNames[idx];
    if (octave === 1 && idx < OctaveOneNoteNames.length) return OctaveOneNoteNames[idx];
    if (octave === 2 && idx < octaveTwoNoteNames.length) return octaveTwoNoteNames[idx];
    if (octave === 3 && idx < octaveThreeNoteNames.length) return octaveThreeNoteNames[idx];
    return "none";
  }

  // If user changes a note in a certain octave, find that note's index in that octave’s array, update the “first-octave” index.
  function handleSelectOctaveNote(octave: number, colIndex: number, chosenName: string) {
    setIsCascading(true);

    setSelectedIndices((old) => {
      const newArr = [...old];
      if (chosenName === "none") {
        newArr[colIndex] = -1;
      } else {
        let foundIndex = -1;
        if (octave === 0) {
          foundIndex = octaveZeroNoteNames.indexOf(chosenName);
        } else if (octave === 1) {
          foundIndex = OctaveOneNoteNames.indexOf(chosenName);
        } else if (octave === 2) {
          foundIndex = octaveTwoNoteNames.indexOf(chosenName);
        } else {
          foundIndex = octaveThreeNoteNames.indexOf(chosenName);
        }
        newArr[colIndex] = foundIndex === -1 ? -1 : foundIndex;
      }
      return newArr;
    });

    // Cascade fill if they picked something not "none" and if there's a next column
    if (colIndex < pitchClassesArr.length - 1 && chosenName !== "none") {
      let nextIndex = -1;
      if (octave === 0) {
        const i = octaveZeroNoteNames.indexOf(chosenName);
        if (i >= 0 && i + 1 < octaveZeroNoteNames.length) {
          nextIndex = i + 1;
        }
      } else if (octave === 1) {
        const i = OctaveOneNoteNames.indexOf(chosenName);
        if (i >= 0 && i + 1 < OctaveOneNoteNames.length) {
          nextIndex = i + 1;
        }
      } else if (octave === 2) {
        const i = octaveTwoNoteNames.indexOf(chosenName);
        if (i >= 0 && i + 1 < octaveTwoNoteNames.length) {
          nextIndex = i + 1;
        }
      } else {
        const i = octaveThreeNoteNames.indexOf(chosenName);
        if (i >= 0 && i + 1 < octaveThreeNoteNames.length) {
          nextIndex = i + 1;
        }
      }
      if (nextIndex !== -1) {
        setSelectedIndices((old) => {
          const newArr = [...old];
          newArr[colIndex + 1] = nextIndex;
          return newArr;
        });
      }
    }

    setTimeout(() => setIsCascading(false), 0);
  }

  // figure out what the input type is (fraction, cents, decimal, stringLength, or unknown)
  const pitchClassType = detectPitchClassType(pitchClassesArr);

  // For each pitch class line, convert to fraction/decimal/cents/stringLength/frequency
  const convertedPitchClasses = pitchClassesArr.map((pc) => {
    if (pitchClassType === "unknown") return null;
    return convertPitchClass(pc, pitchClassType, stringLength, referenceFrequency);
  });

  // Just a dummy English name function if you want a placeholder
  function getEnglishName(colIndex: number) {
    return `ENG-${colIndex}`;
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

    return (
      <table className="tuning-system-manager__octave-table" border={1} cellPadding={4}>
        <thead>
          <tr>
            <th colSpan={pitchClassesArr.length}>
              Octave {octave} ({pitchClassType !== "unknown" ? pitchClassType : "?"})
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1: pitch class index */}
          <tr>
            {pitchClassesArr.map((_, colIndex) => (
              <td key={colIndex}>{colIndex}</td>
            ))}
          </tr>

          {/* Row 2: note name select */}
          <tr>
            {pitchClassesArr.map((_, colIndex) => {
              const currentVal = getOctaveNoteName(octave, colIndex);
              let nameArray: ReadonlyArray<string> = [];
              if (octave === 0) nameArray = octaveZeroNoteNames;
              else if (octave === 1) nameArray = OctaveOneNoteNames;
              else if (octave === 2) nameArray = octaveTwoNoteNames;
              else nameArray = octaveThreeNoteNames;

              return (
                <td key={colIndex}>
                  <select
                    className="tuning-system-manager__select-note"
                    value={currentVal}
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

          {/* Row 3: abjad select (dummy) */}
          <tr>
            {pitchClassesArr.map((_, colIndex) => (
              <td key={colIndex}>
                <select className="tuning-system-manager__select-abjad">
                  <option value="">(none)</option>
                  <option>Abjad1</option>
                  <option>Abjad2</option>
                  <option>Abjad3</option>
                </select>
              </td>
            ))}
          </tr>

          {/* Row 4: english name (dummy or real) */}
          <tr>
            {pitchClassesArr.map((_, colIndex) => (
              <td key={colIndex}>{getEnglishName(colIndex)}</td>
            ))}
          </tr>

          {/* Row 5: fraction */}
          <tr>
            {convertedPitchClasses.map((conv, colIndex) => (
              <td key={colIndex}>{conv ? conv.fraction : "-"}</td>
            ))}
          </tr>

          {/* Row 6: decimal */}
          <tr>
            {convertedPitchClasses.map((conv, colIndex) => (
              <td key={colIndex}>{conv ? conv.decimal : "-"}</td>
            ))}
          </tr>

          {/* Row 7: cents */}
          <tr>
            {convertedPitchClasses.map((conv, colIndex) => (
              <td key={colIndex}>{conv ? conv.cents : "-"}</td>
            ))}
          </tr>

          {/* Row 8: string length */}
          <tr>
            {convertedPitchClasses.map((conv, colIndex) => (
              <td key={colIndex}>{conv ? conv.stringLength : "-"}</td>
            ))}
          </tr>

          {/* Row 9: frequency */}
          <tr>
            {convertedPitchClasses.map((conv, colIndex) => (
              <td key={colIndex}>{conv ? conv.frequency : "-"}</td>
            ))}
          </tr>

          {/* Row 10: "Play" + checkbox */}
          <tr>
            {pitchClassesArr.map((_, colIndex) => (
              <td key={colIndex}>
                <button type="button" className="tuning-system-manager__play-button" onClick={() => alert("Play placeholder")}>
                  Play
                </button>
                <br />
                <input type="checkbox" className="tuning-system-manager__checkbox" />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  }

  // We can either display all 4 octaves in separate tables, or combine them.
  // Here, we do separate calls:
  function renderNoteNameGrid() {
    if (!pitchClassesArr.length) return <div>No pitch classes entered yet.</div>;

    return (
      <div className="tuning-system-manager__grid">
        {renderOctaveDetails(0)}
        {renderOctaveDetails(1)}
        {renderOctaveDetails(2)}
        {renderOctaveDetails(3)}
      </div>
    );
  }

  return (
    <div className="tuning-system-manager">
      <h2 className="tuning-system-manager__header">Tuning System Manager</h2>

      <div className="tuning-system-manager__selection">
        <label htmlFor="tuningSystemSelect">Select Tuning System or Create New:</label>
        <select id="tuningSystemSelect" onChange={handleSelectChange} value={selectedTuningSystem ? selectedTuningSystem.getId() : "new"}>
          <option value="new">-- Create New System --</option>
          {tuningSystems.map((system) => (
            <option key={system.getId()} value={system.getId()}>
              {system.getTitleEnglish()} (ID: {system.getId()})
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
            <input className="tuning-system-manager__input" id="idField" type="text" value={id} onChange={(e) => setId(e.target.value)} />
          </div>

          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="titleEnglishField">
              Title (English)
            </label>
            <input
              className="tuning-system-manager__input"
              id="titleEnglishField"
              type="text"
              value={titleEnglish}
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
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
            />
          </div>

          {/* Year / Source / Creator */}
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="yearField">
              Year
            </label>
            <input className="tuning-system-manager__input" id="yearField" type="text" value={year} onChange={(e) => setYear(e.target.value)} />
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
              value={sourceEnglish}
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
              value={sourceArabic}
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
              value={creatorEnglish}
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
              value={creatorArabic}
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
                value={stringLength}
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
                value={referenceFrequency}
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

      <div className="tuning-system-manager__grid-wrapper">
        {renderNoteNameGrid()}
      </div>
    </div>
  );
}
