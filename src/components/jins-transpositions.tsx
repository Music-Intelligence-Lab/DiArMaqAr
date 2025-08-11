"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
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

export default function JinsTranspositions() {
  // Configurable constants (extracted magic numbers for easier tuning)
  const DISPATCH_EVENT_DELAY_MS = 10;             // delay before emitting custom event
  const SCROLL_TIMEOUT_MS = 60;                   // delay before performing scroll after event
  const URL_SCROLL_TIMEOUT_MS = 220;              // delay for initial scroll from URL param
  const HEADER_SCROLL_MARGIN_TOP_PX = 170;        // scroll margin top for first headers
  const INTERSECTION_ROOT_MARGIN = '200px 0px 0px 0px'; // observer root margin
  const BATCH_SIZE = 10;                          // batch size for lazy loading
  const PREFETCH_OFFSET = 5;                      // offset to trigger prefetch
  const { selectedJinsData, selectedTuningSystem, setSelectedPitchClasses, allPitchClasses, centsTolerance, setCentsTolerance, sources, setSelectedJins } = useAppContext();
  const { jinsTranspositions } = useTranspositionsContext();

  const { noteOn, noteOff, playSequence, soundSettings } = useSoundContext();

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

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedJinsData, selectedTuningSystem]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => {
            const remaining = Math.max(0, jinsTranspositions.length - 1 - prev);
            if (remaining === 0) return prev;
            return prev + Math.min(BATCH_SIZE, remaining);
          });
        }
      });
  }, { root: null, rootMargin: INTERSECTION_ROOT_MARGIN, threshold: 0 });
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

      return (
        <>
          <tr className="jins-transpositions__header" id={getJinsHeaderId(pitchClasses[0]?.noteName)} style={index === 0 || index === 1 ? { scrollMarginTop: `${HEADER_SCROLL_MARGIN_TOP_PX}px` } : undefined}>
            <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`} rowSpan={4 + numberOfFilterRows}>
              {index + 1}
            </td>

            <td className="jins-transpositions__jins-name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
              {!transposition ? (
                <span className="jins-transpositions__transposition-title">{t('jins.darajatAlIstiqrar')}: {getDisplayName(pitchClasses[0].noteName, 'note') + ` (${getEnglishNoteName(pitchClasses[0].noteName)})`}</span>
              ) : (
                <span className="jins-transpositions__transposition-title">{`${getDisplayName(jins.name, 'jins')}`}</span>
              )}
              <button
                className="jins-transpositions__button"
                onClick={() => {
                  setSelectedPitchClasses([]);
                  setSelectedPitchClasses(pitchClasses);
                  setSelectedJins(transposition ? jins : null);
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent("jinsTranspositionChange", {
                        detail: { firstNote: pitchClasses[0].noteName },
                      })
                    );
                  }, DISPATCH_EVENT_DELAY_MS);
                }}
              >
                {t('jins.selectLoadToKeyboard')}
              </button>

              <button
                className="jins-transpositions__button"
                onClick={() => {
                  playSequence(pitchClasses, true);
                }}
              >
                <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> {t('jins.playJins')}
              </button>
              
              <button
                className="jins-transpositions__button"
                onClick={() => handleJinsExport(jins)}
              >
                <FileDownloadIcon className="jins-transpositions__export-icon" /> {t('jins.export')}
              </button>
            </td>
          </tr>
          <tr>
            <th className="jins-transpositions__row-header">{t('jins.noteNames')}</th>
            {pitchClasses.map(({ noteName }, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
                <th className="jins-transpositions__header-cell">{getDisplayName(noteName, 'note')}</th>
              </React.Fragment>
            ))}
          </tr>
          {filters["abjadName"] && (
            <tr>
              <th className="jins-transpositions__row-header">{t('jins.abjadName')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.englishName')}</th>
              <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].englishName}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].englishName}</th>
                </React.Fragment>
              ))}
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
              <th className="jins-transpositions__row-header">{t('jins.fraction')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.cents')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.centsFromZero')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.centsDeviation')}</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].referenceNoteName && (
                  <span>
                    {pitchClasses[0].referenceNoteName}
                  </span>
                )}
                {pitchClasses[0].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[0].centsDeviation.toFixed(1)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].referenceNoteName && (
                      <span>
                        {pitchClasses[i + 1].referenceNoteName}
                      </span>
                    )}
                    {pitchClasses[i + 1].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[i + 1].centsDeviation.toFixed(1)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && filters["decimalRatio"] && (
            <tr>
              <th className="jins-transpositions__row-header">{t('jins.decimalRatio')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.stringLength')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.fretDivision')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.midiNote')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.frequency')}</th>
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
            <th className="jins-transpositions__row-header">{t('jins.play')}</th>
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
              <th className="jins-transpositions__row-header">{t('jins.staffNotation')}</th>
              <td className="staff-notation-cell" colSpan={pitchClasses.length * 2 - 1}>
                <StaffNotation 
                  pitchClasses={pitchClasses}
                />
              </td>
            </tr>
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
            {t('jins.analysis')}: {`${getDisplayName(selectedJinsData.getName(), 'jins')}`}{" "}
            {!useRatio && (
              <>
                {" "}
                / {t('jins.centsTolerance')}: <input className="jins-transpositions__input" type="number" value={centsTolerance ?? 0} onChange={(e) => setCentsTolerance(Number(e.target.value))} />
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
                    <span className="tuning-system-manager__filter-label">
                      {t(`jins.${filterKey}`)}
                    </span>
                  </label>
                );
              })}
            </span>
          </h2>
          <table className="jins-transpositions__table">
            <colgroup>
              <col style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />
              <col style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />
            </colgroup>

            <thead>{renderTransposition(jinsTranspositions[0], 0)}</thead>
          </table>

          {selectedJinsData && (
            <>
              <div className="jins-transpositions__comments-sources-container">
                {language === 'ar' ? (
                  <>
                    <div className="jins-transpositions__sources-english">
                      <h3>{t('jins.sources')}:</h3>
                      <div className="jins-transpositions__sources-text">
                        {selectedJinsData?.getSourcePageReferences().length > 0 &&
                          selectedJinsData.getSourcePageReferences().map((sourceRef, idx) => {
                            const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                            return source ? (
                              <Link href={`/bibliography?source=${source?.getId()}`} key={idx}>
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

                    <div className="jins-transpositions__comments-english">
                      <h3>{t('jins.comments')}:</h3>
                      <div className="jins-transpositions__comments-text">{selectedJinsData.getCommentsEnglish()}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="jins-transpositions__comments-english">
                      <h3>{t('jins.comments')}:</h3>
                      <div className="jins-transpositions__comments-text">{selectedJinsData.getCommentsEnglish()}</div>
                    </div>

                    <div className="jins-transpositions__sources-english">
                      <h3>{t('jins.sources')}:</h3>
                      <div className="jins-transpositions__sources-text">
                        {selectedJinsData?.getSourcePageReferences().length > 0 &&
                          selectedJinsData.getSourcePageReferences().map((sourceRef, idx) => {
                            const source = sources.find((s: any) => s.id === sourceRef.sourceId);
                            return source ? (
                              <Link href={`/bibliography?source=${source?.getId()}`} key={idx}>
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
                  </>
                )}
              </div>
            </>
          )}

          <h2 className="jins-transpositions__title">{t('jins.transpositionsTitle')}: {`${getDisplayName(selectedJinsData.getName(), 'jins')}`}</h2>

          <table className="jins-transpositions__table">
            <colgroup>
              <col style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />
              <col style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />
            </colgroup>

            <thead></thead>
            <tbody>
              {jinsTranspositions.slice(1, 1 + visibleCount).map((jinsTransposition, row) => {
                const isLastNeededForPrefetch = row === visibleCount - PREFETCH_OFFSET - 1 && visibleCount < (jinsTranspositions.length - 1);
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
                {t('jins.loadMore') || 'Load More'}
              </button>
            </div>
          )}
        </div>
      </>
    );
  }, [allPitchClasses, selectedJinsData, filters, soundSettings, language, jinsTranspositions, visibleCount, t]);

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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [selectedJinsData]);

  return (
    <>
  {transpositionTables}
  {visibleCount < (jinsTranspositions.length - 1) && visibleCount <= PREFETCH_OFFSET && (
    <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
  )}
      
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
