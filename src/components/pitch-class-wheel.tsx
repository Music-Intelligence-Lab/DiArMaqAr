"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import Cell from "@/models/Cell";
import { Maqam } from "@/models/Maqam";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";

interface WheelCellProps {
  cell: Cell;
  isSelected: boolean;
  isActive: boolean;
  isDescending: boolean;
  isTonic: boolean;
  onClick: () => void;
}

const WheelCell = React.memo<WheelCellProps>(
  ({ cell, isSelected, isActive, isDescending, isTonic, onClick }) => {
    let className = "pitch-class-wheel__cell";
    if (isSelected) className += " pitch-class-wheel__cell_selected";
    if (isDescending) className += " pitch-class-wheel__cell_descending";
    if (isTonic) className += " pitch-class-wheel__cell_tonic";
    if (isActive) className += " pitch-class-wheel__cell_active";

    return (
      <div className={className} onClick={onClick} style={{ cursor: isTonic ? "pointer" : undefined }}>
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
    ajnas,
    selectedJins,
    setSelectedJinsTransposition,
    selectedMaqam,
    selectedMaqamTransposition,
    setSelectedMaqamTransposition,
    selectedCells,
    setSelectedCells,
    allCells,
    centsTolerance,
  } = useAppContext();

  const { activeCells } = useSoundContext();

  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const selectedEls = container.querySelectorAll<HTMLElement>(".pitch-class-wheel__cell_selected");
    if (selectedEls.length === 0) return;

    let minLeft = Infinity;
    let maxRight = -Infinity;

    selectedEls.forEach((el) => {
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
  }, [selectedCells]);

  const filteredJinsTranspositions = useMemo<Jins[]>(
    () => getJinsTranspositions(allCells, selectedJins, true, centsTolerance),
    [allCells, selectedJins, centsTolerance]
  );

  const filteredMaqamTranspositions = useMemo<Maqam[]>(
    () => getMaqamTranspositions(allCells, ajnas, selectedMaqam, true, centsTolerance),
    [allCells, selectedMaqam, centsTolerance]
  );

  const wheelCells = useMemo(() => {
    return allCells.map((cell) => {
      const note = cell.noteName;
      const isSelected = selectedCells.some((sc) => sc.noteName === note);
      const isActive = activeCells.some((ac) => ac.index === cell.index && ac.octave === cell.octave);

      const jinsTransposition = filteredJinsTranspositions.find((transposition) => transposition.cells[0].noteName === note);
      const maqamTransposition = filteredMaqamTranspositions.find((transposition) => transposition.ascendingCells[0].noteName === note);

      const isDescending = selectedMaqamTransposition
        ? selectedMaqamTransposition.descendingCells.map(cell => cell.noteName).includes(note)
        : selectedMaqam?.getDescendingNoteNames().includes(note) ?? false;

      const isTonic = !!(jinsTransposition || maqamTransposition);

      const onClick = () => {
        if (maqamTransposition && selectedMaqam) {
          setSelectedCells(maqamTransposition.ascendingCells);
          setSelectedMaqamTransposition(maqamTransposition);
          return;
        }
        if (jinsTransposition && selectedJins) {
          setSelectedCells(jinsTransposition.cells);
          setSelectedJinsTransposition(jinsTransposition);
        }
      };

      return {
        key: `${cell.index}-${cell.octave}`,
        cell,
        isSelected,
        isActive,
        isDescending,
        isTonic,
        onClick,
      };
    });
  }, [
    allCells,
    selectedCells,
    activeCells,
    filteredJinsTranspositions,
    filteredMaqamTranspositions,
    selectedMaqam,
    selectedMaqamTransposition,
    selectedJins,
    centsTolerance,
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
      onMouseMove={(e) => {
        if (!isDown.current || !rowRef.current) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        rowRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current);
      }}
      onMouseUp={() => {
        isDown.current = false;
        setGrabbing(false);
      }}
      onMouseLeave={() => {
        isDown.current = false;
        setGrabbing(false);
      }}
    >
      {wheelCells.map(({ key, ...props }) => (
        <WheelCell key={key} {...props} />
      ))}
    </div>
  );
}
