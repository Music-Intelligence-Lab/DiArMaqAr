"use client";
import React, { useEffect, useState, useRef } from "react";
import SettingsCard from "@/components/settings-cards";
import { useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import { Sayr } from "@/models/Maqam";

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


export function TuningSystemManager({ admin }: { admin: boolean }) {
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
    selectedJins,
    selectedMaqam,
  } = useAppContext();
}

export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } = useMenuContext();
  const { selectedTuningSystem, selectedJins, selectedMaqam, ajnas, checkIfJinsIsSelectable, maqamat, checkIfMaqamIsSelectable, maqamSayrId, sources, selectedCells, selectedIndices, setSelectedTuningSystem, clearSelections, setPitchClasses, setSelectedIndices, setNoteNames, getSelectedCellDetails } = useAppContext();

  const [activeNoteCells, setActiveNoteCells] = useState<{ index: number; octave: number }[]>([]);

  const lowestOctave = Math.min(...selectedCells.map(cell => cell.octave));
  const highestOctave = Math.max(...selectedCells.map(cell => cell.octave));

  useEffect(() => {
    const handleNoteTrigger = (event: any) => {
      const { index, octave: origOctave } = event.detail;
      let adjOctave = origOctave;

      if (adjOctave < lowestOctave) {
        adjOctave += (lowestOctave - adjOctave);
      }
      if (adjOctave > highestOctave) {
        adjOctave -= (adjOctave - highestOctave);
      }
      if (lowestOctave === 0) {
        adjOctave += 1;
      }

      setActiveNoteCells((prev) => [...prev, { index, octave: adjOctave }]);
    };

    const handleNoteRelease = (event: any) => {
      const { index, octave: origOctave } = event.detail;
      let adjOctave = origOctave;

      if (adjOctave < lowestOctave) {
        adjOctave += (lowestOctave - adjOctave);
      }
      if (adjOctave > highestOctave) {
        adjOctave -= (adjOctave - highestOctave);
      }
      if (lowestOctave === 0) {
        adjOctave += 1;
      }

      setActiveNoteCells((prev) =>
        prev.filter((cell) => !(cell.index === index && cell.octave === adjOctave))
      );
    };

    window.addEventListener("noteTrigger", handleNoteTrigger);
    window.addEventListener("noteRelease", handleNoteRelease);
    return () => {
      window.removeEventListener("noteTrigger", handleNoteTrigger);
      window.removeEventListener("noteRelease", handleNoteRelease);
    };
  }, [lowestOctave, highestOctave]);

  const selectedSayr: Sayr | null = (selectedMaqam && maqamSayrId) ? selectedMaqam.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  const adjustedCells = selectedCells.map(cell => {
    if (lowestOctave === 0) {
      return { ...cell, octave: cell.octave + 1 };
    } else if (highestOctave === 3 && lowestOctave > 1) {
      return { ...cell, octave: cell.octave - (lowestOctave - 1) };
    }
    return cell;
  });

return (
  <>
  <nav className="navbar">
    <header className="navbar__top-bar">
      <div className="navbar__left-panel">
        <div className="navbar__left-panel-icon" onClick={() => setShowAdminTabs(!showAdminTabs)}>
          {showAdminTabs ? "Admin Mode" : "User Mode"}
        </div>
      </div>

      <div className="navbar__center-panel"><span className="navbar__title" onClick={() => {
        clearSelections();
        setSelectedTuningSystem(null);
        setPitchClasses("");
        setSelectedIndices([]);
        setNoteNames([]);
      }}> Arabic Maqām Database</span>
        <br></br><span className="navbar__subtitle">Explore and play the tanghīm, ajnās, maqāmāt and suyūr of the Arabic Maqām system</span>
      </div>
      <div className="navbar__right-panel">
        <div className="navbar__left-panel-icon">
          <SettingsCard />
        </div>
      </div>
    </header>
    <div className="navbar__bottom-bar">
      <button
        className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("tuningSystem")}
      >
        {selectedTuningSystem ? (
          <>
            <span className="navbar__bottom-bar-item_tab-title">
              {selectedTuningSystem.getCreatorEnglish()} ({selectedTuningSystem.getYear()})
            </span>
            <span className="navbar__bottom-bar-item_tab-subtitle">
              {selectedTuningSystem.getTitleEnglish()}
            </span>
          </>
        ) : (
          "Tanghīm (Tuning Systems)"
        )}
      </button>
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "tuningSystem-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("tuningSystem-admin")}
      >
        Tuning System Admin
      </button>}
      <button
        className={`navbar__bottom-bar-item ${selectedMenu === "jins" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("jins")}
        disabled={!selectedTuningSystem}
      >
        <span className="navbar__bottom-bar-item_tab-title">
          {selectedTuningSystem ? `Ajnās (${ajnas.filter((jins) => checkIfJinsIsSelectable(jins)).length}/${ajnas.length})` : "Ajnās"}
        </span>
        <span className="navbar__bottom-bar-item_tab-subtitle">
          {selectedJins && selectedJins.getName()}
        </span>
      </button>
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "jins-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("jins-admin")}
        disabled={!selectedTuningSystem}
      >
        Jins Admin
      </button>}
      <button
        className={`navbar__bottom-bar-item ${selectedMenu === "maqam" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("maqam")}
        disabled={!selectedTuningSystem}
      >
        <span className="navbar__bottom-bar-item_tab-title">
          {selectedTuningSystem ? `Maqāmāt (${maqamat.filter((maqam) => checkIfMaqamIsSelectable(maqam)).length}/${maqamat.length})` : "Maqāmāt"} <br />
        </span>
        <span className="navbar__bottom-bar-item_tab-subtitle">
          {selectedMaqam && selectedMaqam.getName()}
        </span>
      </button>
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "maqam-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("maqam-admin")}
        disabled={!selectedTuningSystem}
      >
        Maqam Admin
      </button>}
      <button
        className={`navbar__bottom-bar-item ${selectedMenu === "sayr" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("sayr")}
        disabled={!selectedMaqam}
      >
        <span className="navbar__bottom-bar-item_tab-title">
          {selectedMaqam ? `Suyūr (${selectedMaqam.getSuyūr().length})` : "Suyūr"} <br />
        </span>
        <span className="navbar__bottom-bar-item_tab-subtitle">
          {selectedSayr && `${selectedSayr.creatorEnglish} ${selectedSayrSource ? `(${selectedSayrSource.getReleaseDateEnglish()})` : ""}`}
        </span>
      </button>
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "sayr-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("sayr-admin")}
        disabled={!selectedMaqam}
      >
        Sayr Admin
      </button>}
      <button
        className={`navbar__bottom-bar-item ${selectedMenu === "bibliography" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("bibliography")}
      >
        Bibliography
      </button>
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "bibliography-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("bibliography-admin")}
      >
        Bibliography Admin
      </button>}
      {showAdminTabs && <button
        className={`navbar__bottom-bar-item ${selectedMenu === "pattern-admin" ? "navbar__bottom-bar-item_selected" : ""}`}
        onClick={() => setSelectedMenu("pattern-admin")}
      >
        Patterns Admin
      </button>}
    </div>
  </nav>


  {selectedTuningSystem && (
    <div className="navbar__note-name-row-wrapper">
      <table className="navbar__note-name-table">
        <tbody>
            <tr>
             <td className="navbar__note-name-header">Dīwān 1</td>
            {selectedTuningSystem.getPitchClasses().map((_, colIndex) => {
              const idx = selectedIndices[colIndex];
              if (idx < 0) return <td key={colIndex}>(none)</td>;

              const O1_LEN = octaveOneNoteNames.length;
              const isFromO1 = idx < O1_LEN;
              const localIndex = isFromO1 ? idx : idx - O1_LEN;

              let lowerName = "none";
              if (isFromO1 && localIndex < octaveOneNoteNames.length) {
              lowerName = octaveOneNoteNames[localIndex];
              } else if (!isFromO1 && localIndex < octaveTwoNoteNames.length) {
              lowerName = octaveTwoNoteNames[localIndex];
              }

              const octaveLength = octaveOneNoteNames.length;
              const isHighlighted = adjustedCells.some(cell => cell.index === (colIndex % octaveLength) && cell.octave === 1);
              const isActive = activeNoteCells.some(cell => cell.index === (colIndex % octaveLength) && cell.octave === 1);

              return (
              <td
                key={colIndex}
                className={`navbar__note-name-cell ${isHighlighted ? "navbar__note-name-cell_highlighted" : ""} ${isActive ? "navbar__note-name-cell_active" : ""}`}
              >
                {lowerName.replace(/\//g, "/\u200B")}

              </td>
              );
            })}
            </tr>
            <tr>
             <td className="navbar__note-name-header">Dīwān 2</td>
            {selectedTuningSystem.getPitchClasses().map((_, colIndex) => {
              const idx = selectedIndices[colIndex];
              if (idx < 0) return <td key={colIndex}>(none)</td>;

              const O1_LEN = octaveOneNoteNames.length;
              const isFromO1 = idx < O1_LEN;
              const localIndex = isFromO1 ? idx : idx - O1_LEN;

              let upperName = "";
              if (isFromO1 && localIndex < octaveOneNoteNames.length) {
              upperName = octaveTwoNoteNames[localIndex];
              } else if (!isFromO1 && localIndex < octaveTwoNoteNames.length) {
              upperName = octaveThreeNoteNames[localIndex];
              }

              const octaveLength = octaveOneNoteNames.length;
              const isHighlighted = adjustedCells.some(cell => cell.index === (colIndex % octaveLength) && cell.octave === 2);
              const isActive = activeNoteCells.some(cell => cell.index === (colIndex % octaveLength) && cell.octave === 2);

              return (
              <td
                key={colIndex}
                className={`navbar__note-name-cell ${isHighlighted ? "navbar__note-name-cell_highlighted" : ""} ${isActive ? "navbar__note-name-cell_active" : ""}`}
              >
                {upperName.replace(/\//g, "/\u200B")}
              </td>
              );
            })}
            </tr>
        </tbody>
      </table>
    </div>

  )}
  </>
);
}
