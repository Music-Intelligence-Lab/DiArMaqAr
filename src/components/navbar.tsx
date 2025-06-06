"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import SettingsCard from "@/components/settings-cards";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import { useMenuContext } from "@/contexts/menu-context";
import { MaqamTransposition, Sayr } from "@/models/Maqam";
import { getIntervalPattern, getTranspositions, Interval, mergeTranspositions } from "@/functions/transpose";
import { getEnglishNoteName } from "@/functions/noteNameMappings";

export default function Navbar() {
  const { showAdminTabs, setShowAdminTabs, selectedMenu, setSelectedMenu } = useMenuContext();
  const { selectedTuningSystem, selectedJins, selectedMaqam, selectedMaqamTransposition, setSelectedMaqamTransposition, ajnas, checkIfJinsIsSelectable, maqamat, checkIfMaqamIsSelectable, maqamSayrId, sources, selectedCells, setSelectedCells, setSelectedTuningSystem, clearSelections, setPitchClasses, setSelectedIndices, setNoteNames, getAllCells, getCellDetails, activeCells, centsTolerance } = useAppContext();


  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  const allCellDetails = getAllCells().map(getCellDetails);
  const selectedCellDetails = useMemo(
    () => selectedCells.map(getCellDetails),
    [selectedCells]     // only re-runs when selectedCells reference changes
  );

  useEffect(() => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const selectedEls = container.querySelectorAll<HTMLElement>(".navbar__pc-cell_selected");
    if (selectedEls.length === 0) return;

    let minLeft = Infinity;
    let maxRight = -Infinity;

    selectedEls.forEach(el => {
      const elLeft = el.offsetLeft;
      const elRight = elLeft + el.offsetWidth;
      if (elLeft < minLeft) minLeft = elLeft;
      if (elRight > maxRight) maxRight = elRight;
    });

    const selectedCenter = (minLeft + maxRight) / 2;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = selectedCenter - containerWidth / 2;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [selectedCellDetails]);

  const selectedSayr: Sayr | null = (selectedMaqam && maqamSayrId) ? selectedMaqam.getSuyūr().find((sayr) => sayr.id === maqamSayrId) || null : null

  const selectedSayrSource = selectedSayr ? sources.find((source) => source.getId() === selectedSayr.sourceId) : null;

  const ascendingNoteNames = selectedMaqam ? selectedMaqam.getAscendingNoteNames() : [];
  const descendingNoteNames = selectedMaqam ? selectedMaqam.getDescendingNoteNames() : [];

  let filteredSequences: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = [];

  if (ascendingNoteNames.length >= 2 && descendingNoteNames.length >= 2){

  const ascendingMaqamCellDetails = allCellDetails.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCellDetails = allCellDetails.filter((cell) => descendingNoteNames.includes(cell.noteName)).reverse();

  const valueType = ascendingMaqamCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCellDetails, useRatio);

  const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCellDetails, useRatio);

  const ascendingSequences: CellDetails[][] = getTranspositions(allCellDetails, ascendingIntervalPattern, true, useRatio, centsTolerance);

  const descendingSequences: CellDetails[][] = getTranspositions(allCellDetails, descendingIntervalPattern, false, useRatio, centsTolerance);

  filteredSequences = mergeTranspositions(
    ascendingSequences,
    descendingSequences
  );}

  return (
    <>
      <nav className="navbar">
        <header className="navbar__top-bar">
          <div className="navbar__left-panel">
            <div className="navbar__left-panel-icon" onClick={() => setShowAdminTabs(!showAdminTabs)}>
              {showAdminTabs ? "User Mode" : "Admin Mode"}
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
              {!selectedMaqam
                ? ""
                : selectedMaqamTransposition
                ? `${selectedMaqam.getName()} al-${selectedMaqamTransposition.ascendingNoteNames[0]} (${getEnglishNoteName(selectedMaqamTransposition.ascendingNoteNames[0])})`
                : `${selectedMaqam.getName()} (${selectedMaqam.getAscendingNoteNames()[0]}/${getEnglishNoteName(selectedMaqam.getAscendingNoteNames()[0])})`}
              
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
        <div
          ref={rowRef}
          className="navbar__pc-cells-row"
          style={{ cursor: grabbing ? "grabbing" : "grab" }}
          onMouseDown={(e) => {
            if (!rowRef.current) return;
            isDown.current = true;
            setGrabbing(true);
            startX.current = e.pageX - rowRef.current.offsetLeft;
            scrollLeftStart.current = rowRef.current.scrollLeft;
          }}
          onMouseLeave={() => {
            isDown.current = false;
            setGrabbing(false);
          }}
          onMouseUp={() => {
            isDown.current = false;
            setGrabbing(false);
          }}
          onMouseMove={(e) => {
            if (!isDown.current || !rowRef.current) return;
            e.preventDefault();
            const x = e.pageX - rowRef.current.offsetLeft;
            const walk = x - startX.current;
            rowRef.current.scrollLeft = scrollLeftStart.current - walk;
          }}
        >{
            allCellDetails.map((cell, index) => {
              const cellNoteName = cell.noteName;
              // if (index < allCellDetails.length - 1) {
              //   const nextCell = allCellDetails[index + 1];
              //   divWidth = (parseFloat(nextCell.cents) - parseFloat(cell.cents))*2;
              // }
              const isSelected = selectedCellDetails.find(selectedCell => selectedCell.noteName === cellNoteName);
              const isActive = activeCells.find(activeCell => activeCell.index === cell.index && activeCell.octave == cell.octave);
              const filteredSequence = filteredSequences.find(filteredSequence => filteredSequence.ascendingSequence[0].noteName === cellNoteName);
              let isAscendingNoteName = false;
              let isDescendingNoteName = false;
              if (selectedMaqamTransposition) {
                if (selectedMaqamTransposition.ascendingNoteNames.includes(cellNoteName)) isAscendingNoteName = true;
                if (selectedMaqamTransposition.descendingNoteNames.includes(cellNoteName)) isDescendingNoteName = true;
              } else if (selectedMaqam) {
                if (selectedMaqam.getAscendingNoteNames().includes(cellNoteName)) isAscendingNoteName = true;
                if (selectedMaqam.getDescendingNoteNames().includes(cellNoteName)) isDescendingNoteName = true;
              }
              return (
                <div key={index} className="navbar__pc-cell-wrapper" style={{cursor: filteredSequence ? "pointer":""}}>
                  <div className={"navbar__pc-cell " + (isSelected ? "navbar__pc-cell_selected " : "") + (isDescendingNoteName && !isAscendingNoteName ? "navbar__pc-cell_descending " : "") + (filteredSequence ? "navbar__pc-cell_tonic ":"") + (isActive ? "navbar__pc-cell_active " : "")} onClick={() => {
                    if (!selectedMaqam || !filteredSequence) return
                    const transpositionNoteNames = filteredSequence.ascendingSequence.map((cell) => cell.noteName);

                    const newSelectedCells = [];

                    for (const cell of allCellDetails) {
                      const cellDetails = getCellDetails(cell);
                      if (transpositionNoteNames.includes(cellDetails.noteName)) {
                        newSelectedCells.push(cell);
                      }
                    }
                    setSelectedCells(newSelectedCells);
                    const transposition: MaqamTransposition = {
                      name: `${selectedMaqam.getName()} al-${filteredSequence.ascendingSequence[0].noteName} (${getEnglishNoteName(filteredSequence.ascendingSequence[0].noteName)})`,
                      ascendingNoteNames: filteredSequence.ascendingSequence.map((cell) => cell.noteName),
                      descendingNoteNames: filteredSequence.descendingSequence.map((cell) => cell.noteName),
                    }
                    setSelectedMaqamTransposition(transposition);
                  }}>
                    <span className="navbar__pc-cell-label">{cell.noteName.replace(/\//g, "/\u200B")}</span>
                  </div>
                    {/* <div className={"navbar__pc-cell-tonic " + (filteredSequence ? "navbar__pc-cell-tonic_active":"")}></div> */}
                </div>
              
              )
            })
          }</div>
      </nav>
    </>
  );
}
