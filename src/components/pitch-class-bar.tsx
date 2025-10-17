"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import PitchClass from "@/models/PitchClass";
import useTranspositionsContext from "@/contexts/transpositions-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";

interface WheelCellProps {
  pitchClass: PitchClass;
  englishName?: string;
  isSelected: boolean;
  isActive: boolean;
  isDescending: boolean;
  isTonic: boolean;
  isCurrentTonic: boolean;
  mapping: string;
  inputType: "QWERTY" | "MIDI";
  isBlackKey: boolean;
  isMapped: boolean;
  onClick: () => void;
}

const WheelCell = React.memo<WheelCellProps>(
  ({ pitchClass, englishName, isSelected, isActive, isDescending, isTonic, isCurrentTonic, mapping, inputType, isBlackKey, isMapped, onClick }) => {
    const { getDisplayName } = useLanguageContext();
    
    const baseClassName = "pitch-class-bar__cell";
    const classNames = [baseClassName];
    
    if (isDescending) classNames.push("pitch-class-bar__cell_descending");
    if (isTonic) classNames.push("pitch-class-bar__cell_tonic");
    if (isCurrentTonic) classNames.push("pitch-class-bar__cell_tonic_current");
    if (isSelected) classNames.push("pitch-class-bar__cell_selected");
    
    // Add the combined tonic_current_active class when all three conditions are met
    if (isTonic && isCurrentTonic && isActive) {
      classNames.push("pitch-class-bar__cell_tonic_current_active");
    }
    
    if (inputType === "MIDI" && isMapped) {
      if (isBlackKey) {
        classNames.push("pitch-class-bar__cell_midi_black");
        if (isTonic) classNames.push("pitch-class-bar__cell_midi_tonic_black");
      } else {
        classNames.push("pitch-class-bar__cell_midi_white");
        if (isTonic) classNames.push("pitch-class-bar__cell_midi_tonic_white");
      }
      
      if (isCurrentTonic) {
        classNames.push("pitch-class-bar__cell_midi_tonic_current");
        if (isActive) classNames.push("pitch-class-bar__cell_midi_tonic_current_active");
      } else {
        // For MIDI input, mark active non-tonic notes with midi_active
        if (isActive) classNames.push("pitch-class-bar__cell_midi_active");
      }
    }
    else {
      // Non-MIDI (or unmapped) active state
      if (isActive) classNames.push("pitch-class-bar__cell_active");
    }
    
    const className = classNames.join(" ");
  const displayNoteName = getDisplayName(pitchClass.noteName, 'note');
  const displayedEnglish = englishName ?? pitchClass.englishName;

    return (
      <div className={className} onClick={onClick} style={{ cursor: isTonic ? "pointer" : undefined }}>
        <span className="pitch-class-bar__cell-label">{displayNoteName.replace(/\//g, "/\u200B")}</span>

        <span className="pitch-class-bar__cell-qwerty-englishname">
          <span className="pitch-class-bar__cell-english" dir="ltr">{displayedEnglish}</span>
          {inputType === "QWERTY" && mapping && <span className="pitch-class-bar__cell-mapping">{mapping}</span>}
        </span>
      </div>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isActive === next.isActive &&
    prev.isDescending === next.isDescending &&
    prev.isTonic === next.isTonic &&
    prev.isCurrentTonic === next.isCurrentTonic &&
    prev.mapping === next.mapping &&
    prev.inputType === next.inputType &&
    prev.isBlackKey === next.isBlackKey &&
    prev.isMapped === next.isMapped
);

WheelCell.displayName = "WheelCell";

export default function PitchClassBar() {
  const {
    selectedJinsData,
    selectedJins,
    setSelectedJins,
    selectedMaqamData,
    selectedMaqam,
    setSelectedMaqam,
    selectedPitchClasses,
    setSelectedPitchClasses,
    allPitchClasses,
    selectedTuningSystem,
    centsTolerance,
  } = useAppContext();

  const { activePitchClasses, soundSettings, pitchClassToKeyMapping, pitchClassToBlackOrWhite } = useSoundContext();

  const { language } = useLanguageContext();

  const rowRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [grabbing, setGrabbing] = useState(false);
  const isDragging = useRef(false);
  const dragThreshold = 5; // pixels - minimum movement to consider it a drag

  useEffect(() => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const selectedEls = container.querySelectorAll<HTMLElement>(".pitch-class-bar__cell_selected");
    if (selectedEls.length === 0) return;

    const isRTL = language === "ar";

    if (isRTL) {
      // In RTL, find rightmost selected element and position at right edge
      let maxRight = -Infinity;
      selectedEls.forEach((el) => {
        const elRight = el.offsetLeft + el.offsetWidth;
        if (elRight > maxRight) maxRight = elRight;
      });

      const containerWidth = container.offsetWidth;
      const targetScrollLeft = maxRight - containerWidth + 30;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    } else {
      // In LTR, find leftmost selected element and position at left edge
      let minLeft = Infinity;
      selectedEls.forEach((el) => {
        const elLeft = el.offsetLeft;
        if (elLeft < minLeft) minLeft = elLeft;
      });

      const targetScrollLeft = minLeft - 30;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  }, [selectedPitchClasses, language]);

  const { jinsTranspositions: filteredJinsTranspositions, maqamTranspositions: filteredMaqamTranspositions } = useTranspositionsContext();

  const wheelCells = useMemo(() => {
    // Determine the tonic of the current selected maqam or jins
    const maqamTonic = selectedMaqam
      ? selectedMaqam.ascendingPitchClasses[0]?.originalValue
      : selectedMaqamData?.getTahlil(allPitchClasses).ascendingPitchClasses[0]?.originalValue;
    // Use selectedJins (transposition) if available, else fall back to base jins details
    const jinsTonic = selectedJins
      ? selectedJins.jinsPitchClasses[0]?.originalValue
      : selectedJinsData?.getTahlil(allPitchClasses).jinsPitchClasses[0]?.originalValue;

    const entries = allPitchClasses.map((pitchClass: PitchClass) => {
      const originalValue = pitchClass.originalValue;
      const isSelected = selectedPitchClasses.some((sc) => sc.originalValue === originalValue);
      const isActive = activePitchClasses.some((ac) => ac.index === pitchClass.index && ac.octave === pitchClass.octave);

      const jinsTransposition = filteredJinsTranspositions.find((transposition) => transposition.jinsPitchClasses[0].originalValue === originalValue);
      const maqamTransposition = filteredMaqamTranspositions.find(
        (transposition) => transposition.ascendingPitchClasses[0].originalValue === originalValue
      );

      const isDescending = selectedMaqam
        ? selectedMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.originalValue).includes(originalValue)
        : selectedMaqamData
            ?.getTahlil(allPitchClasses)
            .descendingPitchClasses.map((pitchClass) => pitchClass.originalValue)
            .includes(originalValue) ?? false;

      const isTonic = !!(jinsTransposition || maqamTransposition);
      // Mark as current tonic if this pitch class is the tonic of the current selected maqam or jins
      const isCurrentTonic = Boolean((maqamTonic && maqamTonic === originalValue) || (jinsTonic && jinsTonic === originalValue));

      const onClick = () => {
        // Don't trigger transposition if we were dragging
        if (isDragging.current) {
          return;
        }
        
        if (maqamTransposition && selectedMaqamData) {
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
        if (jinsTransposition && selectedJinsData) {
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

      const mapping = pitchClassToKeyMapping[pitchClass.fraction] || "";

      return {
        key: `${pitchClass.index}-${pitchClass.octave}`,
        pitchClass,
        isSelected,
        isActive,
        isDescending,
        isTonic,
        isCurrentTonic,
        mapping,
        inputType: soundSettings.inputType,
        isBlackKey: pitchClassToBlackOrWhite[pitchClass.fraction] === "black",
        isMapped: pitchClassToBlackOrWhite[pitchClass.fraction] !== undefined,
        onClick,
      };
    });

    // First, try to compute a preferred enharmonic mapping from the current musical context
    // (selected maqam, selected jins, or current selectedPitchClasses). This ensures that
    // when a maqam is active (e.g., maqam ṣabā) we prefer the enharmonic spellings implied by it.
    const preferredMap: Record<string, string> = {};
    const contextSeq: PitchClass[] | undefined =
      (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
      (selectedJins && selectedJins.jinsPitchClasses) ||
      (selectedPitchClasses && selectedPitchClasses.length >= 2 ? selectedPitchClasses : undefined);

    if (contextSeq) {
      // Apply sequential naming for melodic sequences
      const renderedSeq = renderPitchClassSpellings(contextSeq);
      renderedSeq.forEach((pc) => {
        preferredMap[pc.noteName] = pc.englishName;
      });
    }

    // Attach englishName: prefer preferredMap, else use default mapping
    for (const entry of entries) {
      const noteName = entry.pitchClass.noteName;
      (entry as any).englishName = preferredMap[noteName] || getEnglishNoteName(noteName);
    }

    return entries;
  }, [
    allPitchClasses,
    selectedPitchClasses,
    activePitchClasses,
    filteredJinsTranspositions,
    filteredMaqamTranspositions,
    selectedMaqamData,
    selectedMaqam,
    selectedJinsData,
    soundSettings.inputType,
    soundSettings.inputMode,
    selectedTuningSystem,
    centsTolerance,
    pitchClassToBlackOrWhite,
  ]);

  return (
    <div
      ref={rowRef}
      className="pitch-class-bar"
      dir={language === "ar" ? "rtl" : "ltr"}
      style={{ cursor: grabbing ? "grabbing" : "grab" }}
      onMouseDown={(e) => {
        if (!rowRef.current) return;
        isDown.current = true;
        isDragging.current = false;
        setGrabbing(true);
        startX.current = e.pageX - rowRef.current.offsetLeft;
        scrollLeftStart.current = rowRef.current.scrollLeft;
      }}
      onMouseMove={(e) => {
        if (!isDown.current || !rowRef.current) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const distance = Math.abs(x - startX.current);
        
        // Mark as dragging if we've moved beyond the threshold
        if (distance > dragThreshold) {
          isDragging.current = true;
        }
        
        rowRef.current.scrollLeft = scrollLeftStart.current - (x - startX.current);
      }}
      onMouseUp={() => {
        isDown.current = false;
        setGrabbing(false);
        // Reset dragging flag after a short delay to allow click events to check it
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }}
      onMouseLeave={() => {
        isDown.current = false;
        setGrabbing(false);
        // Reset dragging flag after a short delay to allow click events to check it
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }}
      // Prevent context menu on right click during drag
      onContextMenu={(e) => {
        if (isDragging.current) {
          e.preventDefault();
        }
      }}
    >
      {wheelCells.map(({ key, ...props }) => (
        <WheelCell key={key} {...props} />
      ))}
    </div>
  );
}
