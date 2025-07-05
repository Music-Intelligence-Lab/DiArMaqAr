"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import { Maqam } from "@/models/Maqam";
import {
  getJinsTranspositions,
  getMaqamTranspositions,
} from "@/functions/transpose";
import { Jins } from "@/models/Jins";

interface WheelCellProps {
  pitchClass: PitchClass;
  isSelected: boolean;
  isActive: boolean;
  isDescending: boolean;
  isTonic: boolean;
  isCurrentTonic: boolean;
  onClick: () => void;
}

const WheelCell = React.memo<WheelCellProps>(
  ({
    pitchClass,
    isSelected,
    isActive,
    isDescending,
    isTonic,
    isCurrentTonic,
    onClick,
  }) => {
    let className = "pitch-class-wheel__cell";
    if (isSelected) className += " pitch-class-wheel__cell_selected";
    if (isDescending) className += " pitch-class-wheel__cell_descending";
    // Highlight all possible tonics
    if (isTonic) {
      className += " pitch-class-wheel__cell_tonic";
    }
    // Add a special class if this is the tonic of the current selected jins or maqam
    if (isCurrentTonic) {
      className += " pitch-class-wheel__cell_tonic_current";
    }
    if (isCurrentTonic && isActive) {
      className += " pitch-class-wheel__cell_tonic_current_active";
    }
    if (isActive) className += " pitch-class-wheel__cell_active";
  
    return (
      <div
        className={className}
        onClick={onClick}
        style={{ cursor: isTonic ? "pointer" : undefined }}
      >
        <span className="pitch-class-wheel__cell-label">
          {pitchClass.noteName.replace(/\//g, "/\u200B")}
        </span>
      </div>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isDescending === next.isDescending &&
    prev.isTonic === next.isTonic &&
    prev.isCurrentTonic === next.isCurrentTonic
);

WheelCell.displayName = "WheelCell";

export default function PitchClassWheel() {
  const {
    ajnas,
    selectedJinsDetails,
    setSelectedJins,
    selectedMaqamDetails,
    selectedMaqam,
    setSelectedMaqam,
    selectedPitchClasses,
    setSelectedPitchClasses,
    allPitchClasses,
    centsTolerance,
  } = useAppContext();

  const { activePitchClasses } = useSoundContext();

  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const selectedEls = container.querySelectorAll<HTMLElement>(
      ".pitch-class-wheel__cell_selected"
    );
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
  }, [selectedPitchClasses]);

  const filteredJinsTranspositions = useMemo<Jins[]>(
    () =>
      getJinsTranspositions(
        allPitchClasses,
        selectedJinsDetails,
        true,
        centsTolerance
      ),
    [allPitchClasses, selectedJinsDetails, centsTolerance]
  );

  const filteredMaqamTranspositions = useMemo<Maqam[]>(
    () =>
      getMaqamTranspositions(
        allPitchClasses,
        ajnas,
        selectedMaqamDetails,
        true,
        centsTolerance
      ),
    [allPitchClasses, selectedMaqamDetails, centsTolerance]
  );

  const wheelCells = useMemo(() => {
    // Determine the tonic of the current selected maqam or jins
    const maqamTonic = selectedMaqam
      ? selectedMaqam.ascendingPitchClasses[0]?.originalValue
      : selectedMaqamDetails?.getTahlil(allPitchClasses)
          .ascendingPitchClasses[0]?.originalValue;
    // Use getTahlil to get the tonic pitch class for the selected jins
    const jinsTonic =
      selectedJinsDetails?.getTahlil(allPitchClasses).jinsPitchClasses[0]
        ?.originalValue;

    return allPitchClasses.map((pitchClass: PitchClass) => {
      const originalValue = pitchClass.originalValue;
      const isSelected = selectedPitchClasses.some(
        (sc) => sc.originalValue === originalValue
      );
      const isActive = activePitchClasses.some(
        (ac) => ac.index === pitchClass.index && ac.octave === pitchClass.octave
      );

      const jinsTransposition = filteredJinsTranspositions.find(
        (transposition) =>
          transposition.jinsPitchClasses[0].originalValue === originalValue
      );
      const maqamTransposition = filteredMaqamTranspositions.find(
        (transposition) =>
          transposition.ascendingPitchClasses[0].originalValue === originalValue
      );

      const isDescending = selectedMaqam
        ? selectedMaqam.descendingPitchClasses
            .map((pitchClass) => pitchClass.originalValue)
            .includes(originalValue)
        : selectedMaqamDetails
            ?.getTahlil(allPitchClasses)
            .descendingPitchClasses.map(
              (pitchClass) => pitchClass.originalValue
            )
            .includes(originalValue) ?? false;

      const isTonic = !!(jinsTransposition || maqamTransposition);
      // Mark as current tonic if this pitch class is the tonic of the current selected maqam or jins
      const isCurrentTonic = Boolean(
        (maqamTonic && maqamTonic === originalValue) ||
          (jinsTonic && jinsTonic === originalValue)
      );

      const onClick = () => {
        if (maqamTransposition && selectedMaqamDetails) {
          setSelectedPitchClasses(maqamTransposition.ascendingPitchClasses);
          setSelectedMaqam(maqamTransposition);
          // Dispatch scroll event after DOM update
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("maqamTranspositionChange", {
                detail: { firstNote: maqamTransposition.ascendingPitchClasses[0]?.noteName }
              })
            );
          }, 0);
          return;
        }
        if (jinsTransposition && selectedJinsDetails) {
          setSelectedPitchClasses(jinsTransposition.jinsPitchClasses);
          setSelectedJins(jinsTransposition);
        }
      };

      return {
        key: `${pitchClass.index}-${pitchClass.octave}`,
        pitchClass,
        isSelected,
        isActive,
        isDescending,
        isTonic,
        isCurrentTonic,
        onClick,
      };
    });
  }, [
    allPitchClasses,
    selectedPitchClasses,
    activePitchClasses,
    filteredJinsTranspositions,
    filteredMaqamTranspositions,
    selectedMaqamDetails,
    selectedMaqam,
    selectedJinsDetails,
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
        rowRef.current.scrollLeft =
          scrollLeftStart.current - (x - startX.current);
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
