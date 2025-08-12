"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import useTranspositionsContext from "@/contexts/transpositions-context";
import StaffNotation from "./staff-notation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExportModal from "./export-modal";

const getHeaderId = (noteName: string): string => {
  if (typeof noteName !== "string") return "";
  return `maqam-transpositions__header--${noteName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()}`;
};

export function scrollToMaqamHeader(firstNote: string, selectedMaqamData?: any) {
  if (!firstNote && selectedMaqamData) {
    firstNote = selectedMaqamData.getAscendingNoteNames?.()?.[0];
  }
  if (!firstNote) return;
  const id = getHeaderId(firstNote);
  const el = document.getElementById(id);
  if (el && typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
import { Maqam } from "@/models/Maqam";
import { calculateInterval } from "@/models/PitchClass";
import shiftPitchClass from "@/functions/shiftPitchClass";
import Link from "next/link";

const MaqamTranspositions: React.FC = () => {
  // Configurable constants (previous magic numbers)
  const DISPATCH_EVENT_DELAY_MS = 10;              // delay before emitting maqamTranspositionChange
  const SCROLL_TIMEOUT_MS = 60;                    // short timeout before scrolling after event
  const URL_SCROLL_TIMEOUT_MS = 220;               // timeout used when scrolling from URL param
  const ANALYSIS_SCROLL_MARGIN_TOP_PX = 160;       // scroll margin for top analysis header
  const INTERSECTION_ROOT_MARGIN = '200px 0px 0px 0px'; // prefetch root margin
  const BATCH_SIZE = 10;                           // number of transpositions to load at once
  const PREFETCH_OFFSET = 5;                       // how many before end to prefetch more

  const {
    selectedMaqamData,
    selectedTuningSystem,
    setSelectedPitchClasses,
    allPitchClasses,
    centsTolerance,
    setCentsTolerance,
    ajnas,
    setSelectedMaqam,
    sources,
  } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings, clearHangingNotes } = useSoundContext();

  const { filters, setFilters } = useFilterContext();
  const { t, language, getDisplayName } = useLanguageContext();

  const [highlightedNotes, setHighlightedNotes] = useState<{
    index: number;
    noteNames: string[];
  }>({ index: -1, noteNames: [] });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [maqamToExport, setMaqamToExport] = useState<Maqam | null>(null);

  const handleMaqamExport = (maqam: Maqam) => {
    setMaqamToExport(maqam);
    setIsExportModalOpen(true);
  };

  const isCellHighlighted = (index: number, noteName: string): boolean => {
    return highlightedNotes.index === index && highlightedNotes.noteNames.includes(noteName);
  };

  const disabledFilters = ["pitchClass"];

  const { maqamTranspositions } = useTranspositionsContext();

  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [targetFirstNote, setTargetFirstNote] = useState<string | null>(null);
  // Track pending scroll timeout so we can cancel if maqam changes
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedMaqamData, selectedTuningSystem]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => {
            if (!maqamTranspositions) return prev;
            const remaining = Math.max(0, maqamTranspositions.length - 1 - prev);
            if (remaining === 0) return prev;
            return prev + Math.min(BATCH_SIZE, remaining);
          });
        }
      });
  }, { root: null, rootMargin: INTERSECTION_ROOT_MARGIN, threshold: 0 });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [maqamTranspositions, visibleCount]);

  const transpositionTables = useMemo(() => {
    if (!selectedMaqamData || !selectedTuningSystem) return null;

    const ascendingNoteNames = selectedMaqamData.getAscendingNoteNames();
    const descendingNoteNames = selectedMaqamData.getDescendingNoteNames();

    if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return null;

    let romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

    const ascendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));

    const numberOfMaqamNotes = ascendingMaqamPitchClasses.length;

    let noOctaveMaqam = false;

    if (numberOfMaqamNotes <= 7) {
      noOctaveMaqam = true;
      romanNumerals[numberOfMaqamNotes] = "I+";
    }

    romanNumerals = romanNumerals.slice(0, numberOfMaqamNotes + (noOctaveMaqam ? 1 : 0));

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

    const numberOfFilterRows = Object.keys(filters).filter(
      (key) => !disabledFilters.includes(key) && key !== valueType && filters[key as keyof typeof filters]
    ).length;

    function renderTranspositionRow(maqam: Maqam, ascending: boolean, rowIndex: number) {
      let ascendingTranspositionPitchClasses = maqam.ascendingPitchClasses;
      let descendingTranspositionPitchClasses = maqam.descendingPitchClasses;

      let ascendingIntervals = maqam.ascendingPitchClassIntervals;
      let descendingIntervals = maqam.descendingPitchClassIntervals;

      let jinsTranspositions = ascending ? maqam.ascendingMaqamAjnas : maqam.descendingMaqamAjnas;

      if (noOctaveMaqam) {
        const shiftedFirstCell = shiftPitchClass(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
        const lastCell = ascendingTranspositionPitchClasses[ascendingTranspositionPitchClasses.length - 1];

        ascendingTranspositionPitchClasses = [...ascendingTranspositionPitchClasses, shiftedFirstCell];
        descendingTranspositionPitchClasses = [shiftedFirstCell, ...descendingTranspositionPitchClasses];

        const shiftedCellInterval = ascending ? calculateInterval(lastCell, shiftedFirstCell) : calculateInterval(shiftedFirstCell, lastCell);

        ascendingIntervals = [...ascendingIntervals, shiftedCellInterval];
        descendingIntervals = [shiftedCellInterval, ...descendingIntervals];

        if (jinsTranspositions) {
          let octaveTransposition = maqam.ascendingMaqamAjnas ? maqam.ascendingMaqamAjnas[0] : null;
          if (octaveTransposition) {
            const foundJinsData = ajnas.find((jins) => jins.getId() === octaveTransposition?.jinsId);
            if (foundJinsData) {
              octaveTransposition = {
                ...octaveTransposition,
                jinsPitchClasses: [shiftedFirstCell],
                jinsPitchClassIntervals: [],
                name: getDisplayName(foundJinsData.getName(), 'jins') + " al-" + getDisplayName(shiftedFirstCell.noteName, 'note'),
              };
            }
          }
          jinsTranspositions = ascending ? [...jinsTranspositions, octaveTransposition] : [octaveTransposition, ...jinsTranspositions];
        }
      }

      const transposition = maqam.transposition;
      const pitchClasses = ascending ? ascendingTranspositionPitchClasses : descendingTranspositionPitchClasses;
      const oppositePitchClasses = ascending ? descendingTranspositionPitchClasses : ascendingTranspositionPitchClasses;
      const intervals = ascending ? ascendingIntervals : descendingIntervals;

      return (
        <>
          {ascending && (
            <tr>
              <th
                className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${pitchClasses[0].octave}`}
                rowSpan={14 + numberOfFilterRows * 2}
              >
                {rowIndex + 1}
              </th>
              <th
                className="maqam-transpositions__header"
                id={getHeaderId(pitchClasses[0]?.noteName)}
                colSpan={4 + (pitchClasses.length - 1) * 2}
                style={rowIndex === 0 && ascending ? { scrollMarginTop: `${ANALYSIS_SCROLL_MARGIN_TOP_PX}px` } : undefined}
              >
                {!transposition ? (
                  <span className="maqam-transpositions__transposition-title">{`${t('maqam.darajatAlIstiqrar')}: ${
                    getDisplayName(pitchClasses[0].noteName, 'note')
                  } (${getEnglishNoteName(pitchClasses[0].noteName)})`}</span>
                ) : (
                  <span className="maqam-transpositions__transposition-title">{getDisplayName(maqam.name, 'maqam')}</span>
                )}
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    setSelectedPitchClasses([]);
                    setSelectedPitchClasses(noOctaveMaqam ? pitchClasses.slice(0, -1) : pitchClasses);
                    setSelectedMaqam(transposition ? maqam : null);
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("maqamTranspositionChange", {
                          detail: { firstNote: pitchClasses[0].noteName },
                        })
                      );
                    }, DISPATCH_EVENT_DELAY_MS);
                  }}
                >
                  {t('maqam.selectLoadToKeyboard')}
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={async () => {
                    clearHangingNotes();
                    await playSequence(pitchClasses, true);
                    await playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  {t('maqam.ascendingDescending')}
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    clearHangingNotes();
                    playSequence(pitchClasses, true);
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  {t('maqam.ascending')}
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    clearHangingNotes();
                    playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  {t('maqam.descending')}
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={() => handleMaqamExport(maqam)}
                >
                  <FileDownloadIcon className="maqam-transpositions__export-icon" />
                  {t('maqam.export')}
                </button>
              </th>
            </tr>
          )}
          <tr>
            <td className="maqam-transpositions__asc-desc-column" rowSpan={6 + numberOfFilterRows}>
              {language === 'ar' 
                ? (ascending ? "↖" : "↙") 
                : (ascending ? "↗" : "↘")}
            </td>
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">{t('maqam.scaleDegrees')}</th>
            {pitchClasses.map((_, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell_scale-degrees-number">
                  {ascending ? romanNumerals[i] : romanNumerals[romanNumerals.length - 1 - i]}
                </th>
                <th className="maqam-transpositions__header-cell_scale-degrees"></th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">{t('maqam.noteNames')}</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                <th
                  className={
                    (!oppositePitchClasses.includes(pitchClass)
                      ? "maqam-transpositions__header-cell_unique "
                      : "maqam-transpositions__header-pitchClass ") +
                    (isCellHighlighted(rowIndex + (ascending ? 0 : 0.5), pitchClass.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                  }
                >
                  {getDisplayName(pitchClass.noteName, 'note')}{" "}
                </th>
                <th className="maqam-transpositions__header-pitchClass"></th>
              </React.Fragment>
            ))}
          </tr>
          {filters["abjadName"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.abjadName')}</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">{pitchClass.abjadName || "--"}</th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["englishName"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.englishName')}</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">{pitchClass.englishName}</th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="maqam-transpositions__row-header">{t(`maqam.${valueType}`)}</th>
            <th className="maqam-transpositions__header-pitchClass">{pitchClasses[0].originalValue}</th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-pitchClass">
                  {useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-pitchClass">{pitchClasses[i + 1].originalValue}</th>
                {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "fraction" && filters["fraction"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.fraction')}</th>
              <th className="maqam-transpositions__header-pitchClass">{pitchClasses[0].fraction}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.fraction})</th>
                  <th className="maqam-transpositions__header-pitchClass">{pitchClasses[i + 1].fraction}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "cents" && filters["cents"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.cents')}</th>
              <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].cents).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.cents.toFixed(3)})</th>
                  <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].cents).toFixed(3)}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["centsFromZero"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.centsFromZero')}</th>
              <th className="maqam-transpositions__header-pitchClass">0.000</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.cents.toFixed(3)})</th>
                  <th className="maqam-transpositions__header-pitchClass">{(parseFloat(pitchClasses[i + 1].cents) - parseFloat(pitchClasses[0].cents)).toFixed(3)}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["centsDeviation"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.centsDeviation')}</th>
              <th className="maqam-transpositions__header-pitchClass">
                {pitchClasses[0].referenceNoteName && (
                  <span>
                    {pitchClasses[0].referenceNoteName}
                  </span>
                )}
                {pitchClasses[0].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[0].centsDeviation.toFixed(1)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].referenceNoteName && (
                      <span>
                        {pitchClasses[i + 1].referenceNoteName}
                      </span>
                    )}
                    {pitchClasses[i + 1].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[i + 1].centsDeviation.toFixed(1)}
                  </th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && filters["decimalRatio"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.decimalRatio')}</th>
              <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.decimalRatio.toFixed(3)})</th>
                  <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "stringLength" && filters["stringLength"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.stringLength')}</th>
              <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].stringLength).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.stringLength.toFixed(3)})</th>
                  <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "fretDivision" && filters["fretDivision"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.fretDivision')}</th>
              <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].fretDivision).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">({interval.fretDivision.toFixed(3)})</th>
                  <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}</th>
                  {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["midiNote"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.midiNote')}</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">{pitchClass.midiNoteNumber.toFixed(3)}</th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["frequency"] && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.frequency')}</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClass.frequency).toFixed(3)}</th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="maqam-transpositions__row-header">{t('maqam.play')}</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onMouseDown={() => {
                      noteOn(pitchClass, defaultNoteVelocity);
                      const handleMouseUp = () => {
                        noteOff(pitchClass);
                        window.removeEventListener("mouseup", handleMouseUp);
                      };
                      window.addEventListener("mouseup", handleMouseUp);
                    }}
                  />
                </th>
                <th className="maqam-transpositions__header-cell"></th>
              </React.Fragment>
            ))}
          </tr>
          {jinsTranspositions && (
            <>
              <tr>
                <th className="maqam-transpositions__row-header">{t('maqam.ajnas')}</th>
                {jinsTranspositions.map((jinsTransposition, index) => {
                  return (
                    <th className="maqam-transpositions__header-pitchClass" colSpan={2} key={index}>
                      {jinsTransposition && (
                        <button
                          className="maqam-transpositions__jins-button"
                          onClick={() => {
                            const noteNames = jinsTransposition.jinsPitchClasses.map((pc) => pc.noteName);
                            setHighlightedNotes({
                              index: rowIndex + (ascending ? 0 : 0.5),
                              noteNames,
                            });
                          }}
                        >
                          {getDisplayName(jinsTransposition.name, 'jins')}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </>
          )}
          {filters.staffNotation && (
            <tr>
              <th className="maqam-transpositions__row-header">{t('maqam.staffNotation')}</th>
              <td className="staff-notation-cell" colSpan={pitchClasses.length * 2}>
                <StaffNotation pitchClasses={pitchClasses} />
              </td>
            </tr>
          )}

          <tr>
            <td className="maqam-transpositions__spacer" colSpan={2 + (pitchClasses.length - 1) * 2} />
          </tr>
        </>
      );
    }

    function renderTransposition(maqam: Maqam, index: number) {
      return (
        <>
          {renderTranspositionRow(maqam, true, index)}
          {renderTranspositionRow(maqam, false, index)}
        </>
      );
    }

    return (
      <div className="maqam-transpositions" key={language}>
        {maqamTranspositions.length > 0 && (
          <>
            <h2 className="maqam-transpositions__title">
              {t('maqam.analysis')}: {`${getDisplayName(selectedMaqamData.getName(), 'maqam')}`}
              {!useRatio && (
                <>
                  {" "}
                  / {t('maqam.centsTolerance')}:{" "}
                  <input
                    className="maqam-transpositions__input"
                    type="number"
                    value={centsTolerance ?? 0}
                    onChange={(e) => setCentsTolerance(Number(e.target.value))}
                  />
                </>
              )}
              <span className="tuning-system-manager__filter-menu">
                {Object.keys(filters).map((filterKey) => {
                  const isDisabled =
                    (filterKey === "fraction" && valueType === "fraction") ||
                    (filterKey === "cents" && valueType === "cents") ||
                    (filterKey === "decimalRatio" && valueType === "decimalRatio") ||
                    (filterKey === "stringLength" && valueType === "stringLength") ||
                    (filterKey === "centsFromZero" && valueType === "cents");

                  if (isDisabled) return null;

                  if (disabledFilters.includes(filterKey)) return null;

                  return (
                    <label
                      key={filterKey}
                      htmlFor={`filter-${filterKey}`}
                      className={`tuning-system-manager__filter-item ${
                        filters[filterKey as keyof typeof filters] ? "tuning-system-manager__filter-item_active" : ""
                      }`}
                      // prevent the drawer (or parent) click handler from firing
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        id={`filter-${filterKey}`}
                        type="checkbox"
                        className="tuning-system-manager__filter-checkbox"
                        checked={filters[filterKey as keyof typeof filters]}
                        disabled={isDisabled}
                        onChange={(e) => {
                          // still stop propagation so only the checkbox toggles
                          e.stopPropagation();
                          setFilters((prev) => ({
                            ...prev,
                            [filterKey as keyof typeof filters]: e.target.checked,
                          }));
                        }}
                      />
                      <span className="tuning-system-manager__filter-label">
                        {t(`maqam.${filterKey}`)}
                      </span>
                    </label>
                  );
                })}
              </span>
            </h2>

            <table className="maqam-transpositions__table">
              <colgroup>
                <col style={{ width: "30px" }} />
                <col style={{ width: "40px" }} />
                <col
                  style={{
                    minWidth: "100px",
                    maxWidth: "100px",
                    width: "100px",
                  }}
                />
              </colgroup>
              <thead>{renderTransposition(maqamTranspositions[0], 0)}</thead>
            </table>
          </>
        )}
        {/* COMMENTS AND SOURCES */}
        {selectedMaqamData && (selectedMaqamData.getCommentsEnglish()?.trim() || selectedMaqamData.getSourcePageReferences()?.length > 0) && (
          <>
            <div className="maqam-transpositions__comments-sources-container">
              {language === 'ar' ? (
                <>
                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-transpositions__sources-english">
                      <h3>{t('maqam.sources')}:</h3>
                      <div className="maqam-transpositions__sources-text">
                        {selectedMaqamData.getSourcePageReferences().map((sourceRef, idx) => {
                          const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                          return source ? (
                            <Link key={idx} href={`/bibliography?source=${source.getId()}`}>
                              {(language as string) === 'ar' 
                                ? `${source.getContributors()[0].lastNameArabic} (${source.getPublicationDateEnglish()}:${sourceRef.page})`
                                : `${source.getContributors()[0].lastNameEnglish} (${source.getPublicationDateEnglish()}:${sourceRef.page})`
                              }
                              <br />
                            </Link>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {selectedMaqamData.getCommentsEnglish()?.trim() && (
                    <div className="maqam-transpositions__comments-english">
                      <h3>{t('maqam.comments')}:</h3>
                      <div className="maqam-transpositions__comments-text">{selectedMaqamData.getCommentsEnglish()}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedMaqamData.getCommentsEnglish()?.trim() && (
                    <div className="maqam-transpositions__comments-english">
                      <h3>{t('maqam.comments')}:</h3>
                      <div className="maqam-transpositions__comments-text">{selectedMaqamData.getCommentsEnglish()}</div>
                    </div>
                  )}

                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-transpositions__sources-english">
                      <h3>{t('maqam.sources')}:</h3>
                      <div className="maqam-transpositions__sources-text">
                        {selectedMaqamData.getSourcePageReferences().map((sourceRef, idx) => {
                          const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                          return source ? (
                            <Link key={idx} href={`/bibliography?source=${source.getId()}`}>
                              {(language as string) === 'ar' 
                                ? `${source.getContributors()[0].lastNameArabic} (${source.getPublicationDateEnglish()}:${sourceRef.page})`
                                : `${source.getContributors()[0].lastNameEnglish} (${source.getPublicationDateEnglish()}:${sourceRef.page})`
                              }
                              <br />
                            </Link>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
        {maqamTranspositions.length > 1 && (
          <>
            <div className="maqam-transpositions__title-container">
              <h2 className="maqam-transpositions__title">
                {t('maqam.transpositionsTitle')}: {`${getDisplayName(selectedMaqamData.getName(), 'maqam')}`}
                {!useRatio && (
                  <>
                    {" "}
                    / {t('maqam.centsTolerance')}:{" "}
                    <input
                      className="maqam-transpositions__input"
                      type="number"
                      value={centsTolerance ?? 0}
                      onChange={(e) => setCentsTolerance(Number(e.target.value))}
                    />
                  </>
                )}
              </h2>
            </div>
            <table className="maqam-transpositions__table">
              <colgroup>
                <col style={{ width: "30px" }} />
                <col style={{ width: "40px" }} />
                <col
                  style={{
                    minWidth: "100px",
                    maxWidth: "100px",
                    width: "100px",
                  }}
                />
              </colgroup>
              <tbody>
                {maqamTranspositions.slice(1, 1 + visibleCount).map((maqamTransposition, row) => {
                  const isLastNeededForPrefetch =
                    row === visibleCount - PREFETCH_OFFSET - 1 &&
                    visibleCount < (maqamTranspositions.length - 1);
                  return (
                    <React.Fragment key={row}>
                      {renderTransposition(maqamTransposition, row)}
                      <tr>
                        <td className="maqam-transpositions__spacer" colSpan={2 + (maqamTransposition.ascendingPitchClasses.length - 1) * 2} />
                      </tr>
                      {isLastNeededForPrefetch && (
                        <tr>
                          <td colSpan={2 + (maqamTransposition.ascendingPitchClasses.length - 1) * 2}>
                            <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {visibleCount < maqamTranspositions.length - 1 && (
              <div className="maqam-transpositions__load-more-wrapper">
                <button
                  type="button"
                  className="maqam-transpositions__button maqam-transpositions__load-more"
                  onClick={() => {
                    const remaining = maqamTranspositions.length - 1 - visibleCount;
                    setVisibleCount((c) => c + Math.min(BATCH_SIZE, remaining));
                  }}
                >
                  {t('maqam.loadMore') || 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [allPitchClasses, ajnas, selectedMaqamData, selectedTuningSystem, centsTolerance, filters, highlightedNotes, soundSettings, language, maqamTranspositions, visibleCount, t]);

  // Listen for custom event to scroll to header when maqam/transposition changes (event-driven)
  useEffect(() => {
    function handleMaqamTranspositionChange(e: CustomEvent) {
      const firstNote: string | undefined = e.detail?.firstNote;
      if (firstNote) {
        setTargetFirstNote(firstNote);
        // Ensure it's visible before scrolling
        const index = maqamTranspositions.findIndex((m) => m.ascendingPitchClasses?.[0]?.noteName === firstNote);
        if (index > 0) { // index 0 is the analysis table already visible
          const needed = index; // because visibleCount counts slice(1)
          setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
        }
        // Scroll after next paint (DOM update due to visibleCount change if any)
        if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
  scrollTimeoutRef.current = window.setTimeout(() => {
          // Only scroll if the maqam still matches the target (avoid stale scroll after maqam change)
          scrollToMaqamHeader(firstNote, selectedMaqamData);
  }, SCROLL_TIMEOUT_MS);
      }
    }
    window.addEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      window.removeEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
    };
  }, [selectedMaqamData, maqamTranspositions]);

  // Scroll to header on mount if maqamFirstNote is in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const maqamFirstNote = params.get("maqamFirstNote");
    if (maqamFirstNote) {
      const decoded = decodeURIComponent(maqamFirstNote);
      setTargetFirstNote(decoded);
      const index = maqamTranspositions.findIndex((m) => m.ascendingPitchClasses?.[0]?.noteName === decoded);
      if (index > 0) {
        const needed = index; // number of rows in slice(1) we need
        setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
      }
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollToMaqamHeader(decoded, selectedMaqamData);
      }, URL_SCROLL_TIMEOUT_MS);
    }
  }, [selectedMaqamData, maqamTranspositions]);

  // If targetFirstNote changes later (e.g., filters changing re-render), ensure still visible
  useEffect(() => {
    if (!targetFirstNote) return;
    const index = maqamTranspositions.findIndex((m) => m.ascendingPitchClasses?.[0]?.noteName === targetFirstNote);
    if (index > 0) {
      const needed = index;
      setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
    }
  }, [targetFirstNote, maqamTranspositions]);

  // When the selected maqam changes, cancel any pending scroll from previous maqam & reset target note
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    setTargetFirstNote(null);
    // Optionally scroll to top so user starts at analysis of new maqam
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [selectedMaqamData]);
  
  return (
    <>
  {transpositionTables}
  {visibleCount < (maqamTranspositions?.length || 0) - 1 && visibleCount <= PREFETCH_OFFSET && (
    <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
  )}
      
      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        exportType="maqam" 
        specificMaqam={maqamToExport || undefined}
      />
    </>
  );
};

export default MaqamTranspositions;
