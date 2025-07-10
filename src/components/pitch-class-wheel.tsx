"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import PitchClass from "@/models/PitchClass";
import { Maqam } from "@/models/Maqam";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";
import shiftPitchClass from "@/functions/shiftPitchClass";

interface WheelCellProps {
  pitchClass: PitchClass;
  isSelected: boolean;
  isActive: boolean;
  isDescending: boolean;
  isTonic: boolean;
  isCurrentTonic: boolean;
  mapping: string;
  onClick: () => void;
}

const WheelCell = React.memo<WheelCellProps>(
  ({ pitchClass, isSelected, isActive, isDescending, isTonic, isCurrentTonic, mapping, onClick }) => {
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
      <div className={className} onClick={onClick} style={{ cursor: isTonic ? "pointer" : undefined }}>
        <span className="pitch-class-wheel__cell-label">{pitchClass.noteName.replace(/\//g, "/\u200B")}</span>

        <span className="pitch-class-wheel__cell-qwerty-englishname"><span className="pitch-class-wheel__cell-english">{pitchClass.englishName}</span>{mapping && <span className="pitch-class-wheel__cell-mapping">{mapping}</span>}</span>
        
        
      </div>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isDescending === next.isDescending &&
    prev.isTonic === next.isTonic &&
    prev.isCurrentTonic === next.isCurrentTonic &&
    prev.mapping === next.mapping
);

WheelCell.displayName = "WheelCell";

export default function PitchClassWheel() {
  const {
    ajnas,
    selectedJinsDetails,
    selectedJins,
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

  const firstRowCodes = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"];

  const secondRowCodes = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backslash"];

  const thirdRowCodes = ["Backquote", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", ""];

  function conciseKey(code: string): string {
    if (!code) return "";
    if (code.startsWith("Key")) return code.slice(3).toLowerCase();
    if (code.startsWith("Digit")) return code.slice(5);
    const special: Record<string, string> = {
      Backquote: "`",
      Minus: "-",
      Equal: "=",
      BracketLeft: "[",
      BracketRight: "]",
      Backslash: "\\",
      Semicolon: ";",
      Quote: "'",
      Comma: ",",
      Period: ".",
      Slash: "/",
    };
    return special[code] ?? code.toLowerCase();
  }

  const pitchClassMapping: Record<string, string> = {};

  if (selectedMaqam || selectedMaqamDetails) {
    let ascendingMaqamPitchClasses: PitchClass[] = [];
    let descendingMaqamPitchClasses: PitchClass[] = [];

    if (selectedMaqam) {
      ascendingMaqamPitchClasses = selectedMaqam.ascendingPitchClasses;
      descendingMaqamPitchClasses = [...selectedMaqam.descendingPitchClasses].reverse();
    } else if (selectedMaqamDetails) {
      const ascendingNoteNames = selectedMaqamDetails.getAscendingNoteNames();

      const descendingNoteNames = selectedMaqamDetails.getDescendingNoteNames();

      ascendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));
      descendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName));
    }

    let sliceIndex = 0;
    const lastAscendingPitchClass = ascendingMaqamPitchClasses[ascendingMaqamPitchClasses.length - 1];

    for (let i = 0; i < ascendingMaqamPitchClasses.length; i++) {
      if (parseFloat(ascendingMaqamPitchClasses[i].frequency) * 2 <= parseFloat(lastAscendingPitchClass.frequency)) {
        sliceIndex = i + 1;
      }
    }

    const extendedAscendingPitchClasses = [
      ...ascendingMaqamPitchClasses,
      ...ascendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
      ...ascendingMaqamPitchClasses.slice(0, sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ...ascendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
    ];

    const extendedDescendingPitchClasses = [
      ...descendingMaqamPitchClasses,
      ...descendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1)),
      ...descendingMaqamPitchClasses.slice(0, sliceIndex).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
      ...descendingMaqamPitchClasses.slice(sliceIndex, -1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 2)),
    ];

    for (let i = 0; i <= 12; i++) {
      const ascendingPitchClass = extendedAscendingPitchClasses[i];
      const descendingPitchClass = extendedDescendingPitchClasses[i];
      const ascendingShiftedPitchClass = shiftPitchClass(allPitchClasses, ascendingPitchClass, -1);

      // First assign first and third row mappings (lower priority)
      const key1 = conciseKey(firstRowCodes[i]);
      if (key1 && !pitchClassMapping[descendingPitchClass.fraction]) {
        pitchClassMapping[descendingPitchClass.fraction] = key1;
      }

      const key3 = conciseKey(thirdRowCodes[i]);
      if (key3 && !pitchClassMapping[ascendingShiftedPitchClass.fraction]) {
        pitchClassMapping[ascendingShiftedPitchClass.fraction] = key3;
      }

      // Then assign second row mapping (higher priority - will overwrite if there's a conflict)
      const key2 = conciseKey(secondRowCodes[i]);
      if (key2) {
        pitchClassMapping[ascendingPitchClass.fraction] = key2;
      }
    }
  } else {
    for (let i = 0; i < selectedPitchClasses.length; i++) {
      const pitchClass = selectedPitchClasses[i];
      const loweredOctavePitchClass = shiftPitchClass(allPitchClasses, pitchClass, -1);

      // Assign third row first (lower priority)
      const key3 = conciseKey(thirdRowCodes[i]);
      if (key3 && !pitchClassMapping[loweredOctavePitchClass.fraction]) {
        pitchClassMapping[loweredOctavePitchClass.fraction] = key3;
      }

      // Then assign second row (higher priority - will overwrite if there's a conflict)
      const key2 = conciseKey(secondRowCodes[i]);
      if (key2) {
        pitchClassMapping[pitchClass.fraction] = key2;
      }
    }
  }

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
  }, [selectedPitchClasses]);

  const filteredJinsTranspositions = useMemo<Jins[]>(
    () => getJinsTranspositions(allPitchClasses, selectedJinsDetails, true, centsTolerance),
    [allPitchClasses, selectedJinsDetails, centsTolerance]
  );

  const filteredMaqamTranspositions = useMemo<Maqam[]>(
    () => getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamDetails, true, centsTolerance),
    [allPitchClasses, selectedMaqamDetails, centsTolerance]
  );

  const wheelCells = useMemo(() => {
    // Determine the tonic of the current selected maqam or jins
    const maqamTonic = selectedMaqam
      ? selectedMaqam.ascendingPitchClasses[0]?.originalValue
      : selectedMaqamDetails?.getTahlil(allPitchClasses).ascendingPitchClasses[0]?.originalValue;
    // Use selectedJins (transposition) if available, else fall back to base jins details
    const jinsTonic = selectedJins
      ? selectedJins.jinsPitchClasses[0]?.originalValue
      : selectedJinsDetails?.getTahlil(allPitchClasses).jinsPitchClasses[0]?.originalValue;

    return allPitchClasses.map((pitchClass: PitchClass) => {
      const originalValue = pitchClass.originalValue;
      const isSelected = selectedPitchClasses.some((sc) => sc.originalValue === originalValue);
      const isActive = activePitchClasses.some((ac) => ac.index === pitchClass.index && ac.octave === pitchClass.octave);

      const jinsTransposition = filteredJinsTranspositions.find((transposition) => transposition.jinsPitchClasses[0].originalValue === originalValue);
      const maqamTransposition = filteredMaqamTranspositions.find(
        (transposition) => transposition.ascendingPitchClasses[0].originalValue === originalValue
      );

      const isDescending = selectedMaqam
        ? selectedMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.originalValue).includes(originalValue)
        : selectedMaqamDetails
            ?.getTahlil(allPitchClasses)
            .descendingPitchClasses.map((pitchClass) => pitchClass.originalValue)
            .includes(originalValue) ?? false;

      const isTonic = !!(jinsTransposition || maqamTransposition);
      // Mark as current tonic if this pitch class is the tonic of the current selected maqam or jins
      const isCurrentTonic = Boolean((maqamTonic && maqamTonic === originalValue) || (jinsTonic && jinsTonic === originalValue));

      const onClick = () => {
        if (maqamTransposition && selectedMaqamDetails) {
          setSelectedPitchClasses([]); // Clear first
          setTimeout(() => {
            setSelectedPitchClasses(maqamTransposition.ascendingPitchClasses);
            setSelectedMaqam(maqamTransposition);
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("maqamTranspositionChange", {
                  detail: { firstNote: maqamTransposition.ascendingPitchClasses[0]?.noteName },
                })
              );
            }, 10);
          }, 20);
          return;
        }
        if (jinsTransposition && selectedJinsDetails) {
          setSelectedPitchClasses([]); // Clear first
          setTimeout(() => {
            setSelectedPitchClasses(jinsTransposition.jinsPitchClasses);
            setSelectedJins(jinsTransposition);
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("jinsTranspositionChange", {
                  detail: { firstNote: jinsTransposition.jinsPitchClasses[0]?.noteName },
                })
              );
            }, 10);
          }, 20);
        }
      };

      const mapping = pitchClassMapping[pitchClass.fraction] || "";

      return {
        key: `${pitchClass.index}-${pitchClass.octave}`,
        pitchClass,
        isSelected,
        isActive,
        isDescending,
        isTonic,
        isCurrentTonic,
        mapping,
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
