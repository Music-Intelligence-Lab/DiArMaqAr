"use client";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "@/contexts/app-context"; // Update import path as needed
import TuningSystem from "@/models/TuningSystem";
import TransliteratedNoteName from "@/models/NoteName";

export default function TuningSystemManager() {
  const { tuningSystems, selectedTuningSystem, setSelectedTuningSystem, updateAllTuningSystems } = useAppContext();

  // Local state that mirrors the selected or “new” system’s fields
  const [id, setId] = useState("");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [year, setYear] = useState("");
  const [sourceEnglish, setSourceEnglish] = useState("");
  const [sourceArabic, setSourceArabic] = useState("");
  const [creator, setCreator] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  // Now using a textarea for pitchClasses, each line becomes an element in the string[].
  const [pitchClasses, setPitchClasses] = useState("");
  // We’ll keep noteNames the same for now (comma-separated JSON strings or similar).
  const [noteNames, setNoteNames] = useState("");
  const [stringLength, setStringLength] = useState<number>(0);
  const [referenceFrequency, setReferenceFrequency] = useState<number>(0);

  // Populate local state with the selected tuning system’s data:
  useEffect(() => {
    if (selectedTuningSystem) {
      setId(selectedTuningSystem.getId());
      setTitleEnglish(selectedTuningSystem.getTitleEnglish());
      setTitleArabic(selectedTuningSystem.getTitleArabic());
      setYear(selectedTuningSystem.getYear());
      setSourceEnglish(selectedTuningSystem.getSourceEnglish());
      setSourceArabic(selectedTuningSystem.getSourceArabic());
      setCreator(selectedTuningSystem.getCreator());
      setCommentsEnglish(selectedTuningSystem.getCommentsEnglish());
      setCommentsArabic(selectedTuningSystem.getCommentsArabic());
      // Join pitchClasses by new lines
      setPitchClasses(selectedTuningSystem.getNotes().join("\n"));
      setNoteNames(
        selectedTuningSystem
          .getNoteNames()
          .map((nn) => JSON.stringify(nn))
          .join(", ")
      );
      setStringLength(selectedTuningSystem.getStringLength());
      setReferenceFrequency(selectedTuningSystem.getReferenceFrequency());
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
    setCreator("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setPitchClasses("");
    setNoteNames("");
    setStringLength(0);
    setReferenceFrequency(0);
  };

  // When user changes the dropdown:
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

    // Convert noteNames from comma-separated string to an array of TransliteratedNoteName
    const noteNamesArr: TransliteratedNoteName[] = noteNames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((raw) => {
        return JSON.parse(raw) as TransliteratedNoteName;
      });

    if (selectedTuningSystem) {
      // Editing an existing TuningSystem
      const updated = new TuningSystem(
        id,
        titleEnglish,
        titleArabic,
        year,
        sourceEnglish,
        sourceArabic,
        creator,
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
        creator,
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
            <label className="tuning-system-manager__label" htmlFor="creatorField">
              Creator
            </label>
            <input
              className="tuning-system-manager__input"
              id="creatorField"
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
            />
          </div>
        </div>

        {/* Comments */}
        <div className="tuning-system-manager__input-container">
          <label className="tuning-system-manager__label" htmlFor="commentsEnglishField">
            Comments (English)
          </label>
          <input
            className="tuning-system-manager__input"
            id="commentsEnglishField"
            type="text"
            value={commentsEnglish}
            onChange={(e) => setCommentsEnglish(e.target.value)}
          />
        </div>

        <div className="tuning-system-manager__input-container">
          <label className="tuning-system-manager__label" htmlFor="commentsArabicField">
            Comments (Arabic)
          </label>
          <input
            className="tuning-system-manager__input"
            id="commentsArabicField"
            type="text"
            value={commentsArabic}
            onChange={(e) => setCommentsArabic(e.target.value)}
          />
        </div>
        <div className="tuning-system-manager__group">
          {/* Pitch Classes (textarea, each line => one element in string[]) */}
          <div className="tuning-system-manager__input-container">
            <label className="tuning-system-manager__label" htmlFor="pitchClassesField">
              Pitch Classes (one per line)
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
    </div>
  );
}
