"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import { MaqamTransposition } from "@/models/Maqam";
import { getIntervalPattern, getTranspositions, Interval, mergeTranspositions } from "@/functions/transpose";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { JinsTransposition } from "@/models/Jins";

export default function PitchClassWheel() {
  const { selectedJins, setSelectedJinsTransposition, selectedMaqam, selectedMaqamTransposition, setSelectedMaqamTransposition, selectedCells, setSelectedCells, getAllCells, getCellDetails, activeCells, centsTolerance } = useAppContext();

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
    const selectedEls = container.querySelectorAll<HTMLElement>(".pitch-class-wheel__cell_selected");
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

  const jinsNoteNames = selectedJins ? selectedJins.getNoteNames() : [];

  let filteredJinsTranspositions: CellDetails[][] = [];

  if (jinsNoteNames.length >= 2) {
    const jinsCellDetails = allCellDetails.filter((cell) => jinsNoteNames.includes(cell.noteName));

    const valueType = jinsCellDetails[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "ratios";

    const intervalPattern: Interval[] = getIntervalPattern(jinsCellDetails, useRatio);

    filteredJinsTranspositions = getTranspositions(allCellDetails, intervalPattern, true, useRatio, centsTolerance);
  }

  const ascendingMaqamNoteNames = selectedMaqam ? selectedMaqam.getAscendingNoteNames() : [];
  const descendingMaqamNoteNames = selectedMaqam ? selectedMaqam.getDescendingNoteNames() : [];

  let filteredMaqamTranspositions: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = [];

  if (ascendingMaqamNoteNames.length >= 2 && descendingMaqamNoteNames.length >= 2) {

    const ascendingMaqamCellDetails = allCellDetails.filter((cell) => ascendingMaqamNoteNames.includes(cell.noteName));
    const descendingMaqamCellDetails = allCellDetails.filter((cell) => descendingMaqamNoteNames.includes(cell.noteName)).reverse();

    const valueType = ascendingMaqamCellDetails[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "ratios";

    const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCellDetails, useRatio);

    const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCellDetails, useRatio);

    const ascendingSequences: CellDetails[][] = getTranspositions(allCellDetails, ascendingIntervalPattern, true, useRatio, centsTolerance);

    const descendingSequences: CellDetails[][] = getTranspositions(allCellDetails, descendingIntervalPattern, false, useRatio, centsTolerance);

    filteredMaqamTranspositions = mergeTranspositions(
      ascendingSequences,
      descendingSequences
    );
  }

  return (
    <div
      ref={rowRef}
      className="pitch-class-wheel"
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
          const filteredMaqamTransposition = filteredMaqamTranspositions.find(filteredSequence => filteredSequence.ascendingSequence[0].noteName === cellNoteName);
          const filteredJinsTransposition = filteredJinsTranspositions.find(transposition => transposition[0].noteName === cellNoteName);
          let isAscendingNoteName = false;
          let isDescendingNoteName = false;
          if (selectedMaqamTransposition) {
            if (selectedMaqamTransposition.ascendingNoteNames.includes(cellNoteName)) isAscendingNoteName = true;
            if (selectedMaqamTransposition.descendingNoteNames.includes(cellNoteName)) isDescendingNoteName = true;
          } else if (selectedMaqam) {
            if (selectedMaqam.getAscendingNoteNames().includes(cellNoteName)) isAscendingNoteName = true;
            if (selectedMaqam.getDescendingNoteNames().includes(cellNoteName)) isDescendingNoteName = true;
          }

          let className = "pitch-class-wheel__cell";

          if (isSelected) className += " pitch-class-wheel__cell_selected";
          if (isDescendingNoteName && !isAscendingNoteName) className += " pitch-class-wheel__cell_descending";
          if (filteredMaqamTransposition || filteredJinsTransposition) className += " pitch-class-wheel__cell_tonic";
          if (isActive) className += " pitch-class-wheel__cell_active";

          return (
            <div key={index} className={className} style={{ cursor: filteredMaqamTransposition || filteredJinsTransposition ? "pointer" : "" }} onClick={() => {
              if (selectedMaqam && filteredMaqamTransposition) {
                const transpositionNoteNames = filteredMaqamTransposition.ascendingSequence.map((cell) => cell.noteName);

                const newSelectedCells = [];

                for (const cell of allCellDetails) {
                  const cellDetails = getCellDetails(cell);
                  if (transpositionNoteNames.includes(cellDetails.noteName)) {
                    newSelectedCells.push(cell);
                  }
                }
                setSelectedCells(newSelectedCells);
                const transposition: MaqamTransposition = {
                  name: `${selectedMaqam.getName()} al-${filteredMaqamTransposition.ascendingSequence[0].noteName} (${getEnglishNoteName(filteredMaqamTransposition.ascendingSequence[0].noteName)})`,
                  ascendingNoteNames: filteredMaqamTransposition.ascendingSequence.map((cell) => cell.noteName),
                  descendingNoteNames: filteredMaqamTransposition.descendingSequence.map((cell) => cell.noteName),
                }
                setSelectedMaqamTransposition(transposition);
              } else if (selectedJins && filteredJinsTransposition) {
                const transpositionNoteNames = filteredJinsTransposition.map((cell) => cell.noteName);

                const newSelectedCells = [];

                for (const cell of allCellDetails) {
                  const cellDetails = getCellDetails(cell);
                  if (transpositionNoteNames.includes(cellDetails.noteName)) {
                    newSelectedCells.push(cell);
                  }
                }
                setSelectedCells(newSelectedCells);
                const transposition: JinsTransposition = {
                  name: `${selectedJins.getName()} al-${filteredJinsTransposition[0].noteName} (${getEnglishNoteName(filteredJinsTransposition[0].noteName)})`,
                  noteNames: filteredJinsTransposition.map((cell) => cell.noteName),
                }
                setSelectedJinsTransposition(transposition);
              }

            }}>
              <span className="pitch-class-wheel__cell-label">{cell.noteName.replace(/\//g, "/\u200B")}</span>
            </div>
          )
        })
      }</div>
  );
}
