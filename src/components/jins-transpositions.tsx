"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import useTranspositionsContext from "@/contexts/transpositions-context";
import { Jins } from "@/models/Jins";
import Link from "next/link";
import StaffNotation from "./staff-notation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExportModal from "./export-modal";
import { stringifySource } from "@/models/bibliography/Source";

export default function JinsTranspositions() {
  // Configurable constants (extracted magic numbers for easier tuning)
  const DISPATCH_EVENT_DELAY_MS = 10; // delay before emitting custom event
  const SCROLL_TIMEOUT_MS = 60; // delay before performing scroll after event
  const URL_SCROLL_TIMEOUT_MS = 220; // delay for initial scroll from URL param
  const HEADER_SCROLL_MARGIN_TOP_PX = 170; // scroll margin top for first headers
  const INTERSECTION_ROOT_MARGIN = "200px 0px 0px 0px"; // observer root margin
  const BATCH_SIZE = 10; // batch size for lazy loading
  const PREFETCH_OFFSET = 5; // offset to trigger prefetch
  const { selectedJinsData, selectedTuningSystem, setSelectedPitchClasses, allPitchClasses, centsTolerance, setCentsTolerance, sources, setSelectedJins, selectedJins } = useAppContext();
  const { jinsTranspositions } = useTranspositionsContext();

  const { noteOn, noteOff, playSequence } = useSoundContext();

  const { filters, setFilters } = useFilterContext();

  const { t, language, getDisplayName } = useLanguageContext();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [jinsToExport, setJinsToExport] = useState<Jins | null>(null);

  const disabledFilters = ["pitchClass"];

  const handleJinsExport = (jins: Jins) => {
    setJinsToExport(jins);
    setIsExportModalOpen(true);
  };

  const getJinsHeaderId = (noteName: string): string => {
    if (typeof noteName !== "string") return "";
    return `jins-transpositions__header--${noteName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()}`;
  };

  function scrollToJinsHeader(firstNote: string, selectedJinsData?: any) {
    if (!firstNote && selectedJinsData) {
      firstNote = selectedJinsData.getNoteNames?.()?.[0];
    }
    if (!firstNote) return;
    const id = getJinsHeaderId(firstNote);
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [targetFirstNote, setTargetFirstNote] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const [openTranspositions, setOpenTranspositions] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Debounced toggle function to prevent rapid clicking issues
  const toggleTransposition = useCallback(
    (jinsName: string) => {
      if (isToggling) return; // Prevent rapid clicking

      setIsToggling(jinsName);

      // Small delay to show visual feedback before heavy computation
      setTimeout(() => {
        setOpenTranspositions((prev) => {
          // If this transposition is currently open, close it (and all others)
          // If it's closed, open only this one (close all others)
          if (!prev.includes(jinsName)) {
            return [jinsName];
          }
          // If we're closing this one, all others are already closed due to single-expansion logic
          return [];
        });
        setIsToggling(null);
      }, 50); // Small delay for better UX
    },
    [isToggling]
  );

  // Toggle show details function
  const toggleShowDetails = useCallback(
    (jinsName: string, e?: React.MouseEvent, isTransposition: boolean = false) => {
      e?.stopPropagation();
      if (isToggling) return; // Prevent rapid clicking

      setIsToggling(jinsName);

      // Get the jins object to check if it's a transposition
      const jins = jinsTranspositions?.find((j) => j.name === jinsName);
      const isJinsTransposition = jins?.transposition === true || isTransposition;

      // Small delay to show visual feedback before heavy computation
      setTimeout(() => {
        setOpenTranspositions((prev) => {
          const newArray = [...prev];
          const index = newArray.indexOf(jinsName);

          if (index >= 0) {
            // If closing, just remove this one
            newArray.splice(index, 1);
          } else {
            // If opening a transposition, close all others first
            if (isJinsTransposition) {
              // Keep only non-transposition items (like the analysis)
              const nonTranspositions = jinsTranspositions?.filter((j) => !j.transposition).map((j) => j.name) || [];

              // Start with only non-transposition items
              newArray.length = 0;
              nonTranspositions.forEach((name) => {
                if (prev.includes(name)) {
                  newArray.push(name);
                }
              });
            }
            // Add the new one
            newArray.push(jinsName);
          }
          return newArray;
        });
        setIsToggling(null);
      }, 50); // Small delay for better UX
    },
    [isToggling, jinsTranspositions]
  );

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    // Always open tahlil (first element) on load
    if (jinsTranspositions && jinsTranspositions.length > 0) {
      const tahlilName = jinsTranspositions[0].name;
      setOpenTranspositions([tahlilName]);
    }
  }, [selectedJinsData, selectedTuningSystem, jinsTranspositions]);

  // Auto-open and scroll to selected transposition
  useEffect(() => {
    if (jinsTranspositions && jinsTranspositions.length > 0) {
      if (selectedJins) {
        // Case 1: A specific jins is selected
        const selectedTranspositionName = selectedJins.name;

        // Find the transposition in the list
        const transpositionIndex = jinsTranspositions.findIndex((j) => j.name === selectedTranspositionName);

        // Auto-open the transposition
        setOpenTranspositions([selectedTranspositionName]);

        // Ensure it's visible
        const needed = transpositionIndex;
        setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));

        // Scroll to it after a short delay
        setTimeout(() => {
          const firstNote = selectedJins.jinsPitchClasses[0]?.noteName;
          if (firstNote) {
            scrollToJinsHeader(firstNote, selectedJinsData);
          }
        }, URL_SCROLL_TIMEOUT_MS);
      } else {
        // Case 2: No jins is selected (tahlil case)
        // Open the tahlil (first element)
        const tahlilName = jinsTranspositions[0].name;
        setOpenTranspositions([tahlilName]);

        // Ensure first batch is visible
        setVisibleCount(BATCH_SIZE);

        // Scroll to tahlil
        setTimeout(() => {
          if (jinsTranspositions[0].jinsPitchClasses?.length > 0) {
            const firstNote = jinsTranspositions[0].jinsPitchClasses[0].noteName;
            scrollToJinsHeader(firstNote, selectedJinsData);
          }
        }, URL_SCROLL_TIMEOUT_MS);
      }
    }
  }, [selectedJins, jinsTranspositions, selectedJinsData]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              const remaining = Math.max(0, jinsTranspositions.length - 1 - prev);
              if (remaining === 0) return prev;
              return prev + Math.min(BATCH_SIZE, remaining);
            });
          }
        });
      },
      { root: null, rootMargin: INTERSECTION_ROOT_MARGIN, threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [jinsTranspositions, visibleCount]);

  const transpositionTables = useMemo(() => {
    if (!selectedJinsData || !selectedTuningSystem) return null;
    if (!jinsTranspositions.length) return null;

    const jinsNoteNames = selectedJinsData.getNoteNames();
    if (jinsNoteNames.length < 2) return null;

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

    const numberOfFilterRows = Object.keys(filters).filter((key) => !disabledFilters.includes(key) && key !== valueType && filters[key as keyof typeof filters]).length;

    function renderTransposition(jins: Jins, index: number) {
      const transposition = jins.transposition;
      const pitchClasses = jins.jinsPitchClasses;
      const intervals = jins.jinsPitchClassIntervals;
      const colCount = jins.jinsPitchClasses.length * 2;
      const open = openTranspositions.includes(jins.name);
      const rowSpan = open ? 4 + numberOfFilterRows : 1;

      return (
        <>
          <tr
            className={`jins-transpositions__header ${isToggling === jins.name ? "jins-transpositions__header--toggling" : ""}`}
            id={getJinsHeaderId(pitchClasses[0]?.noteName)}
            style={index === 0 || index === 1 ? { scrollMarginTop: `${HEADER_SCROLL_MARGIN_TOP_PX}px` } : undefined}
          >
            <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`} rowSpan={rowSpan}>
              {index + 1}
            </td>

            <td className="jins-transpositions__jins-name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
              {!transposition ? (
                <span className="jins-transpositions__transposition-title" onClick={(e) => toggleShowDetails(jins.name, e, false)} style={{ cursor: "pointer" }}>
                  {t("jins.darajatAlIstiqrar")}: {getDisplayName(pitchClasses[0].noteName, "note") + ` (${getEnglishNoteName(pitchClasses[0].noteName)})`}
                </span>
              ) : (
                <span
                  className="jins-transpositions__transposition-title"
                  onClick={(e) => toggleShowDetails(jins.name, e, true)}
                >
                  {`${getDisplayName(jins.name, "jins")}`}{" "}
                    <span style={{ cursor: "pointer" }} dir="ltr">
                    {`(${getEnglishNoteName(pitchClasses[0].noteName)})`}
                  </span>
                </span>
              )}
              <span className="jins-transpositions__buttons">
                <button className="jins-transpositions__button jins-transpositions__button--toggle" onClick={(e) => toggleShowDetails(jins.name, e, transposition)}>
                  {open ? t("jins.hideDetails") : t("jins.showDetails")}
                </button>
                <button
                  className="jins-transpositions__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPitchClasses([]);
                    setSelectedPitchClasses(pitchClasses);
                    setSelectedJins(transposition ? jins : null);

                    // Auto-open the transposition when selecting it (close all others)
                    if (transposition) {
                      setOpenTranspositions([jins.name]);
                    } else {
                      // This is the tahlil case (first transposition)
                      // The useEffect will handle opening the first item when selectedJins becomes null
                    }

                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("jinsTranspositionChange", {
                          detail: { firstNote: pitchClasses[0].noteName },
                        })
                      );
                    }, DISPATCH_EVENT_DELAY_MS);
                  }}
                >
                  {t("jins.selectLoadToKeyboard")}
                </button>

                <button
                  className="jins-transpositions__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSequence(pitchClasses, true);
                  }}
                >
                  <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> {t("jins.playJins")}
                </button>

                <button
                  className="jins-transpositions__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJinsExport(jins);
                  }}
                >
                  <FileDownloadIcon className="jins-transpositions__export-icon" /> {t("jins.export")}
                </button>
              </span>
            </td>
          </tr>
          {open && (
            <>
              <tr>
                <th className="jins-transpositions__row-header">{t("jins.noteNames")}</th>
                {pitchClasses.map(({ noteName }, i) => (
                  <React.Fragment key={i}>
                    {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
                    <th className="jins-transpositions__header-cell">{getDisplayName(noteName, "note")}</th>
                  </React.Fragment>
                ))}
              </tr>
              {filters["abjadName"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.abjadName")}</th>
                  <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].abjadName || "--"}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass"></th>
                      <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].abjadName || "--"}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["englishName"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.englishName")}</th>
                  {(() => {
                    // Compute display English names sequentially (one-letter-per-degree policy)
                    let prevEnglish: string | undefined = undefined;
                    const displays: string[] = pitchClasses.map((pc) => {
                      const en = getEnglishNoteName(pc.noteName, { prevEnglish });
                      prevEnglish = en;
                      return en;
                    });
                    return (
                      <>
                        <th className="jins-transpositions__header-pitchClass">{displays[0]}</th>
                        {intervals.map((interval, i) => (
                          <React.Fragment key={i}>
                            <th className="jins-transpositions__header-pitchClass"></th>
                            <th className="jins-transpositions__header-pitchClass">{displays[i + 1]}</th>
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                </tr>
              )}
              <tr>
                <th className="jins-transpositions__row-header">{t(`jins.${valueType}`)}</th>
                <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].originalValue}</th>
                {intervals.map((interval, i) => (
                  <React.Fragment key={i}>
                    <th className="jins-transpositions__header-pitchClass">{useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}</th>
                    <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].originalValue}</th>
                  </React.Fragment>
                ))}
              </tr>
              {valueType !== "fraction" && filters["fraction"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.fraction")}</th>
                  <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].fraction}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.fraction})</th>
                      <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].fraction}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "cents" && filters["cents"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.cents")}</th>
                  <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].cents).toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.cents.toFixed(3)})</th>
                      <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].cents).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsFromZero"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.centsFromZero")}</th>
                  <th className="jins-transpositions__header-pitchClass">0.000</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.cents.toFixed(3)})</th>
                      <th className="jins-transpositions__header-pitchClass">{(parseFloat(pitchClasses[i + 1].cents) - parseFloat(pitchClasses[0].cents)).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsDeviation"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.centsDeviation")}</th>
                  {(() => {
                    // Build preferred mapping from current jins context for enharmonic consistency
                    const preferredMap: Record<string, string> = {};
                    let prevEnglish: string | undefined = undefined;
                    
                    // Use the jins pitch classes as context for enharmonic spelling
                    if (pitchClasses && pitchClasses.length > 0) {
                      prevEnglish = undefined;
                      for (const pc of pitchClasses) {
                        if (!pc || !pc.noteName) continue;
                        const en = getEnglishNoteName(pc.noteName, { prevEnglish });
                        preferredMap[pc.noteName] = en;
                        prevEnglish = en;
                      }
                    }

                    return (
                      <>
                        <th className="jins-transpositions__header-pitchClass">
                          {(() => {
                            const noteName = pitchClasses[0].noteName;
                            let referenceNoteName = pitchClasses[0].referenceNoteName;
                            
                            // Use preferred mapping if available, otherwise fall back to pitchClass.referenceNoteName
                            if (preferredMap[noteName]) {
                              referenceNoteName = preferredMap[noteName].replace(/[+-]/g, '');
                            } else if (referenceNoteName) {
                              referenceNoteName = referenceNoteName.replace(/[+-]/g, '');
                            }
                            
                            return (
                              <>
                                {referenceNoteName && <span>{referenceNoteName}</span>}
                                {pitchClasses[0].centsDeviation > 0 ? " +" : " "}
                                {pitchClasses[0].centsDeviation.toFixed(1)}
                              </>
                            );
                          })()}
                        </th>
                        {intervals.map((interval, i) => (
                          <React.Fragment key={i}>
                            <th className="jins-transpositions__header-pitchClass"></th>
                            <th className="jins-transpositions__header-pitchClass">
                              {(() => {
                                const noteName = pitchClasses[i + 1].noteName;
                                let referenceNoteName = pitchClasses[i + 1].referenceNoteName;
                                
                                // Use preferred mapping if available, otherwise fall back to pitchClass.referenceNoteName
                                if (preferredMap[noteName]) {
                                  referenceNoteName = preferredMap[noteName].replace(/[+-]/g, '');
                                } else if (referenceNoteName) {
                                  referenceNoteName = referenceNoteName.replace(/[+-]/g, '');
                                }
                                
                                return (
                                  <>
                                    {referenceNoteName && <span>{referenceNoteName}</span>}
                                    {pitchClasses[i + 1].centsDeviation > 0 ? " +" : " "}
                                    {pitchClasses[i + 1].centsDeviation.toFixed(1)}
                                  </>
                                );
                              })()}
                            </th>
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                </tr>
              )}
              {valueType !== "decimalRatio" && filters["decimalRatio"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.decimalRatio")}</th>
                  <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.decimalRatio.toFixed(3)})</th>
                      <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "stringLength" && filters["stringLength"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.stringLength")}</th>
                  <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].stringLength).toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.stringLength.toFixed(3)})</th>
                      <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "fretDivision" && filters["fretDivision"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.fretDivision")}</th>
                  <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].fretDivision).toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass">({interval.fretDivision.toFixed(3)})</th>
                      <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["midiNote"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.midiNote")}</th>
                  <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].midiNoteNumber.toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass"></th>
                      <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].midiNoteNumber.toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["frequency"] && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.frequency")}</th>
                  <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[0].frequency).toFixed(3)}</th>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <th className="jins-transpositions__header-pitchClass"></th>
                      <th className="jins-transpositions__header-pitchClass">{parseFloat(pitchClasses[i + 1].frequency).toFixed(3)}</th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              <tr>
                <th className="jins-transpositions__row-header">{t("jins.play")}</th>
                {pitchClasses.map((pitchClass, i) => (
                  <React.Fragment key={i}>
                    {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
                    <th className="jins-transpositions__header-cell">
                      <PlayCircleIcon
                        className="jins-transpositions__play-circle-icon"
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
                  </React.Fragment>
                ))}
              </tr>
              {filters.staffNotation && (
                <tr>
                  <th className="jins-transpositions__row-header">{t("jins.staffNotation")}</th>
                  <td className="staff-notation-cell" colSpan={pitchClasses.length * 2 - 1}>
                    {/* Only render staff notation when actually open to improve performance */}
                    {open && <StaffNotation pitchClasses={pitchClasses} />}
                  </td>
                </tr>
              )}
            </>
          )}
          <tr>
            <td className="jins-transpositions__spacer" colSpan={colCount} />
          </tr>
        </>
      );
    }

    return (
      <>
        <div className="jins-transpositions" key={language}>
          <h2 className="jins-transpositions__title">
            {t("jins.analysis")}: {`${getDisplayName(selectedJinsData.getName(), "jins")}`}{" "}
            {!useRatio && (
              <>
                {" "}
                / {t("jins.centsTolerance")}: <input className="jins-transpositions__input" type="number" value={centsTolerance ?? 0} onChange={(e) => setCentsTolerance(Number(e.target.value))} />
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
                    className={`tuning-system-manager__filter-item ${filters[filterKey as keyof typeof filters] ? "tuning-system-manager__filter-item_active" : ""}`}
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
                    <span className="tuning-system-manager__filter-label">{t(`jins.${filterKey}`)}</span>
                  </label>
                );
              })}
            </span>
          </h2>
          <table className="jins-transpositions__table">
            {(() => {
              // compute columns for the analysis table (index 0)
              const pcCount = jinsTranspositions[0].jinsPitchClasses.length;
              const totalCols = 2 + (pcCount - 1) * 2;
              const cols: React.ReactElement[] = [];
              cols.push(<col key={`c-0-anal`} style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />);
              cols.push(<col key={`c-1-anal`} style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />);
              for (let i = 2; i < totalCols; i++) cols.push(<col key={`c-anal-${i}`} style={{ minWidth: "30px" }} />);
              return <colgroup>{cols}</colgroup>;
            })()}

            <thead>{renderTransposition(jinsTranspositions[0], 0)}</thead>
          </table>

          {selectedJinsData && (selectedJinsData.getCommentsEnglish()?.trim() || selectedJinsData.getSourcePageReferences()?.length > 0) && (
            <>
              <div className="jins-transpositions__comments-sources-container">
                {language === "ar" ? (
                  <>
                    {selectedJinsData.getSourcePageReferences()?.length > 0 && (
                      <div className="jins-transpositions__sources-english">
                        <h3>{t("jins.sources")}:</h3>
                        <div className="jins-transpositions__sources-text">
                          {selectedJinsData.getSourcePageReferences().map((sourceRef, idx) => {
                            const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                            return source ? (
                              <Link key={idx} href={`/bibliography?source=${stringifySource(source, true, null)}`}>
                                {stringifySource(source, false, sourceRef.page)}
                                <br />
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {selectedJinsData.getCommentsEnglish()?.trim() && (
                      <div className="jins-transpositions__comments-english">
                        <h3>{t("jins.comments")}:</h3>
                        <div className="jins-transpositions__comments-text">{selectedJinsData.getCommentsEnglish()}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedJinsData.getCommentsEnglish()?.trim() && (
                      <div className="jins-transpositions__comments-english">
                        <h3>{t("jins.comments")}:</h3>
                        <div className="jins-transpositions__comments-text">{selectedJinsData.getCommentsEnglish()}</div>
                      </div>
                    )}

                    {selectedJinsData.getSourcePageReferences()?.length > 0 && (
                      <div className="jins-transpositions__sources-english">
                        <h3>{t("jins.sources")}:</h3>
                        <div className="jins-transpositions__sources-text">
                          {selectedJinsData.getSourcePageReferences().map((sourceRef, idx) => {
                            const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                            return source ? (
                              <Link key={idx} href={`/bibliography?source=${stringifySource(source, true, null)}`}>
                                {stringifySource(source, true, sourceRef.page)}
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

          <h2 className="jins-transpositions__title">
            {t("jins.transpositionsTitle")}: {`${getDisplayName(selectedJinsData.getName(), "jins")}`}
          </h2>

          <table className="jins-transpositions__table">
            {(() => {
              // default columns for subsequent transposition tables are computed per-row when rendering below
              // but include a fallback flexible colgroup matching a typical minimum structure
              const pcCountFallback = jinsTranspositions[1]?.jinsPitchClasses.length || 3;
              const totalColsFallback = 2 + (pcCountFallback - 1) * 2;
              const cols: React.ReactElement[] = [];
              cols.push(<col key={`c-0-list`} style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />);
              cols.push(<col key={`c-1-list`} style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />);
              for (let i = 2; i < totalColsFallback; i++) cols.push(<col key={`c-list-${i}`} style={{ minWidth: "30px" }} />);
              return <colgroup>{cols}</colgroup>;
            })()}

            <thead></thead>
            <tbody>
              {jinsTranspositions.slice(1, 1 + visibleCount).map((jinsTransposition, row) => {
                const isLastNeededForPrefetch = row === visibleCount - PREFETCH_OFFSET - 1 && visibleCount < jinsTranspositions.length - 1;
                return (
                  <React.Fragment key={row}>
                    {renderTransposition(jinsTransposition, row + 1)}
                    {isLastNeededForPrefetch && (
                      <tr>
                        <td colSpan={jinsTranspositions[row + 1].jinsPitchClasses.length * 2}>
                          <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {visibleCount < jinsTranspositions.length - 1 && (
            <div className="jins-transpositions__load-more-wrapper">
              <button
                type="button"
                className="jins-transpositions__button jins-transpositions__load-more"
                onClick={() => {
                  const remaining = jinsTranspositions.length - 1 - visibleCount;
                  setVisibleCount((c) => c + Math.min(BATCH_SIZE, remaining));
                }}
              >
                {t("jins.loadMore") || "Load More"}
              </button>
            </div>
          )}
        </div>
      </>
    );
  }, [
    selectedJinsData,
    selectedTuningSystem,
    openTranspositions,
    isToggling,
    jinsTranspositions,
    visibleCount,
    t,
    getDisplayName,
    language,
    toggleTransposition,
    setSelectedPitchClasses,
    setSelectedJins,
    playSequence,
    handleJinsExport,
    noteOn,
    noteOff,
    filters,
    sources,
    allPitchClasses,
    centsTolerance,
    setCentsTolerance,
    setFilters,
  ]);

  // Listen for custom event to scroll to header when jins/transposition changes (event-driven)
  useEffect(() => {
    function handleJinsTranspositionChange(e: CustomEvent) {
      const firstNote: string | undefined = e.detail?.firstNote;
      if (firstNote) {
        setTargetFirstNote(firstNote);
        const index = jinsTranspositions.findIndex((j) => j.jinsPitchClasses?.[0]?.noteName === firstNote);
        if (index > 0) {
          const needed = index; // because visibleCount covers slice(1)
          setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
        }
        if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = window.setTimeout(() => {
          scrollToJinsHeader(firstNote, selectedJinsData);
        }, SCROLL_TIMEOUT_MS);
      }
    }
    window.addEventListener("jinsTranspositionChange", handleJinsTranspositionChange as EventListener);
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      window.removeEventListener("jinsTranspositionChange", handleJinsTranspositionChange as EventListener);
    };
  }, [selectedJinsData, jinsTranspositions]);

  // Scroll to header on mount if jinsFirstNote is in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const jinsFirstNote = params.get("jinsFirstNote");
    if (jinsFirstNote) {
      const decoded = decodeURIComponent(jinsFirstNote);
      setTargetFirstNote(decoded);
      const index = jinsTranspositions.findIndex((j) => j.jinsPitchClasses?.[0]?.noteName === decoded);
      if (index > 0) {
        const needed = index;
        setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
      }
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollToJinsHeader(decoded, selectedJinsData);
      }, URL_SCROLL_TIMEOUT_MS);
    }
  }, [selectedJinsData, jinsTranspositions]);

  // Keep target visible after re-renders (filters, etc.)
  useEffect(() => {
    if (!targetFirstNote) return;
    const index = jinsTranspositions.findIndex((j) => j.jinsPitchClasses?.[0]?.noteName === targetFirstNote);
    if (index > 0) {
      const needed = index;
      setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
    }
  }, [targetFirstNote, jinsTranspositions]);

  // When selected jins changes, cancel any pending scroll & reset target
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    setTargetFirstNote(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [selectedJinsData]);

  return (
    <>
      {transpositionTables}
      {visibleCount < jinsTranspositions.length - 1 && visibleCount <= PREFETCH_OFFSET && <div ref={sentinelRef} style={{ width: 1, height: 1 }} />}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setJinsToExport(null);
        }}
        exportType="jins"
        specificJins={jinsToExport || undefined}
      />
    </>
  );
}
