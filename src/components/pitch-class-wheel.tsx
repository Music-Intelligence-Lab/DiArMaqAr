"use client";

import React, { useEffect, useState, useRef, useMemo, memo } from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import { getIntervalPattern, getTranspositions, mergeTranspositions } from "@/functions/transpose";
import { getEnglishNoteName } from "@/functions/noteNameMappings";

interface WheelCellProps {
  cell: CellDetails;
  isSelected: boolean;
  isActive: boolean;
  isDescending: boolean;
  isTonic: boolean;
  onClick: () => void;
}

const WheelCell = memo<WheelCellProps>(
  ({ cell, isSelected, isActive, isDescending, isTonic, onClick }) => {
    let className = "pitch-class-wheel__cell";
    if (isSelected) className += " pitch-class-wheel__cell_selected";
    if (isDescending) className += " pitch-class-wheel__cell_descending";
    if (isTonic) className += " pitch-class-wheel__cell_tonic";
    if (isActive) className += " pitch-class-wheel__cell_active";

    return (
      <div className={className} onClick={onClick}>
        <span className="pitch-class-wheel__cell-label">{cell.noteName.replace(/\//g, "/\u200B")}</span>
      </div>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected && prev.isActive === next.isActive && prev.isDescending === next.isDescending && prev.isTonic === next.isTonic
);

WheelCell.displayName = "WheelCell";

export default function PitchClassWheel() {
  const {
    selectedJins,
    setSelectedJinsTransposition,
    selectedMaqam,
    selectedMaqamTransposition,
    setSelectedMaqamTransposition,
    selectedCellDetails,
    setSelectedCells,
    allCellDetails,
    activeCells,
    centsTolerance,
  } = useAppContext();

  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const container = rowRef.current;
    if (!container) return;

    const els = container.querySelectorAll<HTMLElement>(".pitch-class-wheel__cell_selected");
    if (els.length === 0) return;

    let minLeft = Infinity,
      maxRight = -Infinity;
    els.forEach((el) => {
      minLeft = Math.min(minLeft, el.offsetLeft);
      maxRight = Math.max(maxRight, el.offsetLeft + el.offsetWidth);
    });

    const selectedCenter = (minLeft + maxRight) / 2;
    const target = selectedCenter - container.clientWidth / 2;
    container.scrollTo({ left: target, behavior: "smooth" });
  }, [selectedCellDetails]);

  const jinsNoteNames = selectedJins?.getNoteNames() ?? [];
  const filteredJinsTranspositions = useMemo<CellDetails[][]>(() => {
    if (jinsNoteNames.length < 2) return [];
    const jinsCells = allCellDetails.filter((c) => jinsNoteNames.includes(c.noteName));
    const useRatio = ["fraction", "ratios"].includes(jinsCells[0].originalValueType);
    const pattern = getIntervalPattern(jinsCells, useRatio);
    return getTranspositions(allCellDetails, pattern, true, useRatio, centsTolerance);
  }, [allCellDetails, jinsNoteNames, centsTolerance]);

  const filteredMaqamTranspositions = useMemo<{ ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[]>(() => {
    if (!selectedMaqam) return [];
    const asc = selectedMaqam.getAscendingNoteNames();
    const desc = selectedMaqam.getDescendingNoteNames();
    if (asc.length < 2 || desc.length < 2) return [];

    const ascCells = allCellDetails.filter((c) => asc.includes(c.noteName));
    const descCells = allCellDetails.filter((c) => desc.includes(c.noteName)).reverse();
    const useRatio = ["fraction", "ratios"].includes(ascCells[0].originalValueType);
    const ascPattern = getIntervalPattern(ascCells, useRatio);
    const descPattern = getIntervalPattern(descCells, useRatio);

    const ascSeqs = getTranspositions(allCellDetails, ascPattern, true, useRatio, centsTolerance);
    const descSeqs = getTranspositions(allCellDetails, descPattern, false, useRatio, centsTolerance);

    return mergeTranspositions(ascSeqs, descSeqs);
  }, [
    allCellDetails,
    selectedMaqam,
    selectedMaqam?.getAscendingNoteNames().join(","),
    selectedMaqam?.getDescendingNoteNames().join(","),
    centsTolerance,
  ]);

  const cellsData = useMemo(() => {
    return allCellDetails.map((cell) => {
      const name = cell.noteName;
      const isSelected = selectedCellDetails.some((c) => c.noteName === name);
      const isActive = activeCells.some((c) => c.index === cell.index && c.octave === cell.octave);

      const isDescending = selectedMaqamTransposition
        ? selectedMaqamTransposition.descendingNoteNames.includes(name) && !selectedMaqamTransposition.ascendingNoteNames.includes(name)
        : selectedMaqam
        ? selectedMaqam.getDescendingNoteNames().includes(name)
        : false;

      const isTonic =
        filteredMaqamTranspositions.some((t) => t.ascendingSequence[0].noteName === name) ||
        filteredJinsTranspositions.some((t) => t[0].noteName === name);

      const onClick = () => {
        if (selectedMaqam && filteredMaqamTranspositions.length) {
          const seq = filteredMaqamTranspositions.find((t) => t.ascendingSequence[0].noteName === name)!;
          setSelectedCells(seq.ascendingSequence.map((cd) => ({ index: cd.index, octave: cd.octave })));
          setSelectedMaqamTransposition({
            name: `${selectedMaqam.getName()} al-${name} (${getEnglishNoteName(name)})`,
            ascendingNoteNames: seq.ascendingSequence.map((cd) => cd.noteName),
            descendingNoteNames: seq.descendingSequence.map((cd) => cd.noteName),
          });
        } else if (selectedJins && filteredJinsTranspositions.length) {
          const seq = filteredJinsTranspositions.find((t) => t[0].noteName === name)!;
          setSelectedCells(seq.map((cd) => ({ index: cd.index, octave: cd.octave })));
          setSelectedJinsTransposition({
            name: `${selectedJins.getName()} al-${name} (${getEnglishNoteName(name)})`,
            noteNames: seq.map((cd) => cd.noteName),
          });
        }
      };

      return { cell, isSelected, isActive, isDescending, isTonic, onClick };
    });
  }, [
    allCellDetails,
    selectedCellDetails,
    activeCells,
    selectedMaqam,
    selectedMaqamTransposition,
    filteredMaqamTranspositions,
    selectedJins,
    filteredJinsTranspositions,
  ]);

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
        rowRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current);
      }}
    >
      {cellsData.map((c, i) => (
        <WheelCell
          key={i}
          cell={c.cell}
          isSelected={c.isSelected}
          isActive={c.isActive}
          isDescending={c.isDescending}
          isTonic={c.isTonic}
          onClick={c.onClick}
        />
      ))}
    </div>
  );
}
