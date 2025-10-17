"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { standardizeText } from "@/functions/export";
import { calculateReferenceMidiNote } from "@/functions/calculateReferenceMidiNote";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import useTranspositionsContext from "@/contexts/transpositions-context";
import { Jins } from "@/models/Jins";
import Link from "next/link";
import StaffNotation from "./staff-notation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExportModal from "./export-modal";
import { stringifySource } from "@/models/bibliography/Source";

export default function JinsTranspositions() {
  // Configurable constants (extracted magic numbers for easier tuning)
  const DISPATCH_EVENT_DELAY_MS = 10; // delay before emitting custom event
  const SCROLL_TIMEOUT_MS = 60; // delay before performing scroll after event
  const URL_SCROLL_TIMEOUT_MS = 220; // delay for initial scroll from URL param (increased to wait for comments to render)
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
    return `jins-transpositions__header--${standardizeText(noteName).toLowerCase()}`;
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

  // Toggle show details function (single-open mode: opening one closes all others)
  const toggleShowDetails = useCallback(
    (jinsName: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isToggling) return;

      setIsToggling(jinsName);
      const jins = jinsTranspositions?.find((j) => j.name === jinsName);
      const isOpening = !openTranspositions.includes(jinsName);

      setTimeout(() => {
        setOpenTranspositions((prev) => 
          prev.includes(jinsName) ? [] : [jinsName]
        );
        setIsToggling(null);

        // Dispatch scroll event if opening
        if (isOpening && jins) {
          setTimeout(() => {
            const firstNote = jins.jinsPitchClasses[0]?.noteName;
            if (firstNote) {
              window.dispatchEvent(
                new CustomEvent("jinsTranspositionChange", {
                  detail: { firstNote },
                })
              );
            }
          }, DISPATCH_EVENT_DELAY_MS);
        }
      }, 50);
    },
    [isToggling, jinsTranspositions, openTranspositions]
  );

  // Copy jins table to clipboard
  const copyJinsTableToClipboard = useCallback(
    async (jins: Jins) => {
      if (!jins) return;

      try {
        const pitchClasses = jins.jinsPitchClasses;
        const intervals = jins.jinsPitchClassIntervals;

        const valueType = allPitchClasses[0].originalValueType;
        const useRatio = valueType === "fraction" || valueType === "decimalRatio";

        // Function to build rows for jins table
        const buildJinsRows = () => {
          const rows: string[][] = [];

          // Note names row
          const noteNamesRow = [t("jins.noteNames")];
          pitchClasses.forEach((pc, i) => {
            noteNamesRow.push(getDisplayName(pc.noteName, "note"));
            if (i < pitchClasses.length - 1) noteNamesRow.push(''); // interval column
          });
          rows.push(noteNamesRow);

          // Abjad names row (if filter enabled)
          if (filters["abjadName"]) {
            const abjadRow = [t("jins.abjadName")];
            pitchClasses.forEach((pc, i) => {
              abjadRow.push(pc.abjadName || "--");
              if (i < pitchClasses.length - 1) abjadRow.push(''); // interval column
            });
            rows.push(abjadRow);
          }

          // English names row (if filter enabled)
          if (filters["englishName"]) {
            const englishRow = [t("jins.englishName")];
            const englishNames: string[] = [];
            let prev: string | undefined;
            for (const pc of pitchClasses) {
              const name = getEnglishNoteName(pc.noteName, prev ? { prevEnglish: prev } : undefined);
              englishNames.push(name);
              prev = name;
            }
            englishNames.forEach((name, i) => {
              englishRow.push(name);
              if (i < englishNames.length - 1) englishRow.push(''); // interval column
            });
            rows.push(englishRow);
          }

          // Primary value type row
          const valueRow = [t(`jins.${valueType}`)];
          pitchClasses.forEach((pc, i) => {
            valueRow.push(pc.originalValue);
            if (i < pitchClasses.length - 1) {
              const interval = intervals[i];
              const intervalValue = useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`;
              valueRow.push(intervalValue);
            }
          });
          rows.push(valueRow);

          // Additional filter rows
          if (valueType !== "fraction" && filters["fraction"]) {
            const fractionRow = [t("jins.fraction")];
            pitchClasses.forEach((pc, i) => {
              fractionRow.push(pc.fraction);
              if (i < pitchClasses.length - 1) {
                fractionRow.push(`(${intervals[i].fraction})`);
              }
            });
            rows.push(fractionRow);
          }

          if (valueType !== "cents" && filters["cents"]) {
            const centsRow = [t("jins.cents")];
            pitchClasses.forEach((pc, i) => {
              centsRow.push(parseFloat(pc.cents).toFixed(3));
              if (i < pitchClasses.length - 1) {
                centsRow.push(`(${intervals[i].cents.toFixed(3)})`);
              }
            });
            rows.push(centsRow);
          }

          if (filters["centsFromZero"]) {
            const centsFromZeroRow = [t("jins.centsFromZero")];
            pitchClasses.forEach((pc, i) => {
              if (i === 0) {
                centsFromZeroRow.push("0.000");
              } else {
                const centsFromZero = (parseFloat(pc.cents) - parseFloat(pitchClasses[0].cents)).toFixed(3);
                centsFromZeroRow.push(centsFromZero);
              }
              if (i < pitchClasses.length - 1) {
                centsFromZeroRow.push(`(${intervals[i].cents.toFixed(3)})`);
              }
            });
            rows.push(centsFromZeroRow);
          }

          if (filters["centsDeviation"]) {
            const centsDeviationRow = [t("jins.centsDeviation")];
            
            pitchClasses.forEach((pc, i) => {
              const referenceNoteName = pc.referenceNoteName;
              const deviationText = `${referenceNoteName || ''}${pc.centsDeviation > 0 ? ' +' : ' '}${pc.centsDeviation.toFixed(1)}`;
              centsDeviationRow.push(deviationText);
              if (i < pitchClasses.length - 1) {
                centsDeviationRow.push(''); // interval column empty for cents deviation
              }
            });
            rows.push(centsDeviationRow);
          }

          if (valueType !== "decimalRatio" && filters["decimalRatio"]) {
            const decimalRow = [t("jins.decimalRatio")];
            pitchClasses.forEach((pc, i) => {
              decimalRow.push(parseFloat(pc.decimalRatio).toFixed(3));
              if (i < pitchClasses.length - 1) {
                decimalRow.push(`(${intervals[i].decimalRatio.toFixed(3)})`);
              }
            });
            rows.push(decimalRow);
          }

          if (valueType !== "stringLength" && filters["stringLength"]) {
            const stringLengthRow = [t("jins.stringLength")];
            pitchClasses.forEach((pc, i) => {
              stringLengthRow.push(parseFloat(pc.stringLength).toFixed(3));
              if (i < pitchClasses.length - 1) {
                stringLengthRow.push(`(${intervals[i].stringLength.toFixed(3)})`);
              }
            });
            rows.push(stringLengthRow);
          }

          if (valueType !== "fretDivision" && filters["fretDivision"]) {
            const fretDivisionRow = [t("jins.fretDivision")];
            pitchClasses.forEach((pc, i) => {
              fretDivisionRow.push(parseFloat(pc.fretDivision).toFixed(3));
              if (i < pitchClasses.length - 1) {
                fretDivisionRow.push(`(${intervals[i].fretDivision.toFixed(3)})`);
              }
            });
            rows.push(fretDivisionRow);
          }

          if (filters["midiNote"]) {
            const midiRow = [t("jins.midiNote")];
            pitchClasses.forEach((pc, i) => {
              midiRow.push(pc.midiNoteNumber.toFixed(3));
              if (i < pitchClasses.length - 1) {
                midiRow.push(''); // interval column empty for MIDI
              }
            });
            rows.push(midiRow);
          }

          if (filters["midiNoteDeviation"]) {
            const midiDeviationRow = [t("jins.midiNoteDeviation")];
            pitchClasses.forEach((pc, i) => {
              const referenceMidiNote = calculateReferenceMidiNote(pc);
              const deviation = `${referenceMidiNote} ${pc.centsDeviation > 0 ? "+" : ""}${pc.centsDeviation.toFixed(1)}`;
              midiDeviationRow.push(deviation);
              if (i < pitchClasses.length - 1) {
                midiDeviationRow.push(''); // interval column empty
              }
            });
            rows.push(midiDeviationRow);
          }

          if (filters["frequency"]) {
            const frequencyRow = [t("jins.frequency")];
            pitchClasses.forEach((pc, i) => {
              frequencyRow.push(parseFloat(pc.frequency).toFixed(3));
              if (i < pitchClasses.length - 1) {
                frequencyRow.push(''); // interval column empty for frequency
              }
            });
            rows.push(frequencyRow);
          }

          return rows;
        };

        // Build complete table
        const allRows: string[][] = [];
        
        const jinsRows = buildJinsRows();
        allRows.push(...jinsRows);

        // Convert to multiple formats for universal compatibility
        // Create both TSV (for spreadsheets) and HTML (for documents)
        
        // Get max columns from data rows
        const maxCols = Math.max(...allRows.filter(r => r.length > 1).map(r => r.length));
        
        // Start with jins name as a heading
        const jinsTitle = getDisplayName(jins.name, 'jins');
        
        // Build TSV format for spreadsheets
        let tsvText = `${jinsTitle}\n\n`;
        
        // Build HTML format for documents
        let htmlText = `<h3>${jinsTitle}</h3><table border="1" cellpadding="4" cellspacing="0"><tbody>`;
        
        for (const row of allRows) {
          const paddedRow = [...row];
          // Pad to max columns
          while (paddedRow.length < maxCols) {
            paddedRow.push('');
          }
          
          // TSV format
          tsvText += paddedRow.join('\t') + '\n';
          
          // HTML format
          htmlText += '<tr>';
          paddedRow.forEach((cell, index) => {
            // First column is row header, style it differently
            if (index === 0) {
              htmlText += `<th style="background-color: #f8f8f8; text-align: left;">${cell || ''}</th>`;
            } else {
              htmlText += `<td style="text-align: center;">${cell || ''}</td>`;
            }
          });
          htmlText += '</tr>';
        }
        
        htmlText += '</tbody></table>';

        // Copy both formats to clipboard using the modern Clipboard API
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([tsvText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    },
    [filters, getDisplayName, getEnglishNoteName, t, allPitchClasses, language]
  );

  // Create a unified list of all tables (analysis + transpositions) sorted by tonic pitch class
  const sortedTables = useMemo(() => {
    if (!jinsTranspositions || jinsTranspositions.length === 0) return [];
    
    // Map each jins to include its sorting info
    const tablesWithSortInfo = jinsTranspositions.map((jins, originalIndex) => {
      const firstPitchClass = jins.jinsPitchClasses[0];
      const isAnalysis = !jins.transposition; // First item is analysis (no transposition flag)
      
      return {
        jins,
        originalIndex,
        isAnalysis,
        sortKey: parseFloat(firstPitchClass?.cents || '0'), // Sort by cents value of first pitch class
        firstNoteName: firstPitchClass?.noteName || '',
      };
    });
    
    // Sort by cents value (tonic pitch class)
    tablesWithSortInfo.sort((a, b) => a.sortKey - b.sortKey);
    
    return tablesWithSortInfo;
  }, [jinsTranspositions]);

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
    if (sortedTables && sortedTables.length > 0) {
      if (selectedJins) {
        // Case 1: A specific jins is selected
        const selectedTranspositionName = selectedJins.name;

        // Find the transposition in the sorted list
        const transpositionIndex = sortedTables.findIndex((t) => t.jins.name === selectedTranspositionName);

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
        // Find and open the analysis table (where transposition is falsy)
        const analysisTable = sortedTables.find((t) => !t.jins.transposition);
        if (analysisTable) {
          const analysisIndex = sortedTables.findIndex((t) => !t.jins.transposition);
          setOpenTranspositions([analysisTable.jins.name]);

          // Ensure first batch is visible (or enough to include the analysis table)
          const needed = Math.max(BATCH_SIZE, analysisIndex + 1);
          setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));

          // Scroll to analysis table
          setTimeout(() => {
            if (analysisTable.jins.jinsPitchClasses?.length > 0) {
              const firstNote = analysisTable.jins.jinsPitchClasses[0].noteName;
              scrollToJinsHeader(firstNote, selectedJinsData);
            }
          }, URL_SCROLL_TIMEOUT_MS);
        }
      }
    }
  }, [selectedJins, sortedTables, selectedJinsData]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              const remaining = Math.max(0, sortedTables.length - prev);
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
  }, [sortedTables, visibleCount]);

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
      const colCount = 2 + (pitchClasses.length - 1) * 2;
      const open = openTranspositions.includes(jins.name);
      const rowSpan = open ? 4 + numberOfFilterRows : 1;

      return (
        <>
          <tr
            className={`jins-transpositions__transposition-row ${isToggling === jins.name ? "jins-transpositions__transposition-row--toggling" : ""}`}
            id={getJinsHeaderId(pitchClasses[0]?.noteName)}
            style={index === 0 || index === 1 ? { scrollMarginTop: `${HEADER_SCROLL_MARGIN_TOP_PX}px` } : undefined}
          >
            <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`} rowSpan={rowSpan}>
              {index + 1}
            </td>

            <td className="jins-transpositions__jins-name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
              {!transposition ? (
                <button 
                  className="jins-transpositions__transposition-title" 
                  onClick={(e) => toggleShowDetails(jins.name, e)}
                >
                  <span>
                    {getDisplayName(jins.name, 'jins')}
                    {" "}
                    ({getDisplayName(pitchClasses[0].noteName, "note")} / <span dir="ltr">{getEnglishNoteName(pitchClasses[0].noteName)}</span>)
                  </span>
                  <span className="jins-transpositions__darajat-al-istiqrar">
                    {t("jins.darajatAlIstiqrar")}
                  </span>
                </button>
              ) : (
                <button
                  className="jins-transpositions__transposition-title"
                  onClick={(e) => toggleShowDetails(jins.name, e)}
                >
                  <span>
                    {`${getDisplayName(jins.name, "jins")}`}{" "}
                    <span dir="ltr">
                      {`(${getEnglishNoteName(pitchClasses[0].noteName)})`}
                    </span>
                  </span>
                </button>
              )}
              <span className="jins-transpositions__buttons">
                <button className="jins-transpositions__button--toggle" onClick={(e) => toggleShowDetails(jins.name, e)}>
                  {open ? t("jins.hideDetails") : t("jins.showDetails")}
                </button>
                <button
                  className="jins-transpositions__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPitchClasses([]);
                    setSelectedPitchClasses(pitchClasses);
                    setSelectedJins(transposition ? jins : null);
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
                <button
                  className="jins-transpositions__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyJinsTableToClipboard(jins);
                  }}
                  title="Copy table to clipboard (Excel format)"
                >
                  <ContentCopyIcon className="jins-transpositions__copy-icon" />
                  {t("jins.copyTable")}
                </button>
              </span>
            </td>
          </tr>
          {open && (
            <>
              <tr data-row-type="noteNames">
                <th scope="col" id={`jins-${standardizeText(jins.name)}-noteNames-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.noteNames")}</th>
                {pitchClasses.map(({ noteName }, i) => (
                  <React.Fragment key={i}>
                    {i !== 0 && <th scope="col" className="jins-transpositions__table-cell" data-column-type="empty"></th>}
                    <th scope="col" className="jins-transpositions__table-cell--pitch-class" data-column-type="note-name">{getDisplayName(noteName, "note")}</th>
                  </React.Fragment>
                ))}
              </tr>
              {filters["abjadName"] && (
                <tr data-row-type="abjadName">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-abjadName-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.abjadName")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[0].abjadName || "--"}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[i + 1].abjadName || "--"}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["englishName"] && (
                <tr data-row-type="englishName">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-englishName-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.englishName")}</th>
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
                        <td className="jins-transpositions__table-cell--pitch-class" data-column-type="note-name">{displays[0]}</td>
                        {intervals.map((interval, i) => (
                          <React.Fragment key={i}>
                            <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                            <td className="jins-transpositions__table-cell--pitch-class" data-column-type="note-name">{displays[i + 1]}</td>
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                </tr>
              )}
              <tr data-row-type={valueType}>
                <th scope="row" id={`jins-${standardizeText(jins.name)}-primaryValue-header`} className="jins-transpositions__row-header jins-transpositions__row-header--primary-value" data-column-type="row-header">{t(`jins.${valueType}`)}</th>
                <td className="jins-transpositions__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[0].originalValue}</td>
                {intervals.map((interval, i) => (
                  <React.Fragment key={i}>
                    <td className="jins-transpositions__table-cell--pitch-class" data-column-type={`${valueType}-interval`}>{useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}</td>
                    <td className="jins-transpositions__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[i + 1].originalValue}</td>
                  </React.Fragment>
                ))}
              </tr>
              {valueType !== "fraction" && filters["fraction"] && (
                <tr data-row-type="fraction">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-fraction-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.fraction")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[0].fraction}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fraction-interval">({interval.fraction})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[i + 1].fraction}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "cents" && filters["cents"] && (
                <tr data-row-type="cents">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-cents-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.cents")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[0].cents).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[i + 1].cents).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsFromZero"] && (
                <tr data-row-type="centsFromZero">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-centsFromZero-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.centsFromZero")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-from-zero">0.000</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-from-zero">{(parseFloat(pitchClasses[i + 1].cents) - parseFloat(pitchClasses[0].cents)).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsDeviation"] && (
                <tr data-row-type="centsDeviation">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-centsDeviation-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.centsDeviation")}</th>
                  {(() => {
                    return (
                      <>
                        <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-deviation">
                          {(() => {
                            const referenceNoteName = pitchClasses[0].referenceNoteName;

                            return (
                              <>
                                {referenceNoteName && <span>{referenceNoteName}</span>}
                                {pitchClasses[0].centsDeviation > 0 ? " +" : " "}
                                {pitchClasses[0].centsDeviation.toFixed(1)}
                              </>
                            );
                          })()}
                        </td>
                        {intervals.map((interval, i) => (
                          <React.Fragment key={i}>
                            <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                            <td className="jins-transpositions__table-cell--pitch-class" data-column-type="cents-deviation">
                              {(() => {
                                const referenceNoteName = pitchClasses[i + 1].referenceNoteName;

                                return (
                                  <>
                                    {referenceNoteName && <span>{referenceNoteName}</span>}
                                    {pitchClasses[i + 1].centsDeviation > 0 ? " +" : " "}
                                    {pitchClasses[i + 1].centsDeviation.toFixed(1)}
                                  </>
                                );
                              })()}
                            </td>
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                </tr>
              )}
              {valueType !== "decimalRatio" && filters["decimalRatio"] && (
                <tr data-row-type="decimalRatio">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-decimalRatio-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.decimalRatio")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="decimal-ratio-interval">({interval.decimalRatio.toFixed(3)})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "stringLength" && filters["stringLength"] && (
                <tr data-row-type="stringLength">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-stringLength-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.stringLength")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[0].stringLength).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="string-length-interval">({interval.stringLength.toFixed(3)})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "fretDivision" && filters["fretDivision"] && (
                <tr data-row-type="fretDivision">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-fretDivision-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.fretDivision")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[0].fretDivision).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fret-division-interval">({interval.fretDivision.toFixed(3)})</td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["midiNote"] && (
                <tr data-row-type="midiNote">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-midiNote-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.midiNote")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[0].midiNoteNumber.toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[i + 1].midiNoteNumber.toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["midiNoteDeviation"] && (
                <tr data-row-type="midiNoteDeviation">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-midiNoteDeviation-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.midiNoteDeviation")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="midi-note-deviation">
                    {calculateReferenceMidiNote(pitchClasses[0])} {pitchClasses[0].centsDeviation > 0 ? "+" : ""}{pitchClasses[0].centsDeviation.toFixed(1)}
                  </td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="midi-note-deviation">
                        {calculateReferenceMidiNote(pitchClasses[i + 1])} {pitchClasses[i + 1].centsDeviation > 0 ? "+" : ""}{pitchClasses[i + 1].centsDeviation.toFixed(1)}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["frequency"] && (
                <tr data-row-type="frequency">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-frequency-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.frequency")}</th>
                  <td className="jins-transpositions__table-cell--pitch-class" data-column-type="frequency">{parseFloat(pitchClasses[0].frequency).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="jins-transpositions__table-cell" data-column-type="empty"></td>
                      <td className="jins-transpositions__table-cell--pitch-class" data-column-type="frequency">{parseFloat(pitchClasses[i + 1].frequency).toFixed(3)}</td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              <tr data-row-type="play">
                <th scope="row" id={`jins-${standardizeText(jins.name)}-play-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.play")}</th>
                {pitchClasses.map((pitchClass, i) => (
                  <React.Fragment key={i}>
                    {i !== 0 && <td className="jins-transpositions__table-cell" data-column-type="empty"></td>}
                    <td className="jins-transpositions__table-cell" data-column-type="play-button">
                      <PlayCircleIcon
                        className="jins-transpositions__play-circle-icon"
                        aria-label={t("jins.playNote")}
                        onMouseDown={() => {
                          noteOn(pitchClass, defaultNoteVelocity);
                          const handleMouseUp = () => {
                            noteOff(pitchClass);
                            window.removeEventListener("mouseup", handleMouseUp);
                          };
                          window.addEventListener("mouseup", handleMouseUp);
                        }}
                      />
                    </td>
                  </React.Fragment>
                ))}
              </tr>
              {filters.staffNotation && (
                <tr data-row-type="staffNotation">
                  <th scope="row" id={`jins-${standardizeText(jins.name)}-staffNotation-header`} className="jins-transpositions__row-header" data-column-type="row-header">{t("jins.staffNotation")}</th>
                  <td className="staff-notation-cell" colSpan={pitchClasses.length * 2 - 1}>
                    {/* Only render staff notation when actually open to improve performance */}
                    {open && <StaffNotation pitchClasses={pitchClasses} />}
                  </td>
                </tr>
              )}
            </>
          )}
          <tr>
            <td className="jins-transpositions__transposition-spacer" colSpan={colCount} />
          </tr>
        </>
      );
    }

    return (
      <>
        <div className="jins-transpositions maqam-jins-transpositions-shared" key={language}>
          <div className="jins-transpositions__sticky-header">
            <div className="jins-transpositions__title-row" dir={language === "ar" ? "rtl" : "ltr"}>
              {t("jins.analysis")}: {`${getDisplayName(selectedJinsData.getName(), "jins")}`}{" "}
              {!useRatio && (
                <>
                  {" "}
                  / {t("jins.centsTolerance")}: <input className="maqam-jins-transpositions-shared__cents-tolerance-input" type="number" value={centsTolerance ?? 0} onChange={(e) => setCentsTolerance(Number(e.target.value))} />
                </>
              )}
            </div>

            <div className="jins-transpositions__filter-menu">
              {/* Filter order matches table row appearance order */}
              {[
                "abjadName",
                "englishName",
                "fraction",
                "cents",
                "centsFromZero",
                "centsDeviation",
                "decimalRatio",
                "stringLength",
                "fretDivision",
                "midiNote",
                "midiNoteDeviation",
                "frequency",
                "staffNotation",
              ].map((filterKey) => {
                const isDisabled =
                  (filterKey === "fraction" && valueType === "fraction") ||
                  (filterKey === "cents" && valueType === "cents") ||
                  (filterKey === "decimalRatio" && valueType === "decimalRatio") ||
                  (filterKey === "stringLength" && valueType === "stringLength") ||
                  (filterKey === "fretDivision" && valueType === "fretDivision") ||
                  (filterKey === "centsFromZero" && valueType === "cents");

                if (isDisabled) return null;

                if (disabledFilters.includes(filterKey)) return null;

                return (
                  <label
                    key={filterKey}
                    htmlFor={`filter-${filterKey}`}
                    className={`jins-transpositions__filter-item ${filters[filterKey as keyof typeof filters] ? "jins-transpositions__filter-item_active" : ""}`}
                    // prevent the drawer (or parent) click handler from firing
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={`filter-${filterKey}`}
                      type="checkbox"
                      className="jins-transpositions__filter-checkbox"
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
                    <span className="jins-transpositions__filter-label">{t(`jins.${filterKey}`)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Render all tables (analysis + transpositions) in sorted order */}
          {sortedTables.slice(0, visibleCount).map((tableInfo, displayIndex) => {
            const { jins, isAnalysis, firstNoteName } = tableInfo;
            const isLastNeededForPrefetch = displayIndex === visibleCount - PREFETCH_OFFSET - 1 && visibleCount < sortedTables.length;
            
            return (
              <React.Fragment key={`${isAnalysis ? 'analysis' : 'transposition'}-${jins.name}`}>
                <table 
                  className={`jins-transpositions__table ${isAnalysis ? 'jins-transpositions__table--analysis' : 'jins-transpositions__table--transposition'}`}
                  data-table-type={isAnalysis ? "analysis" : "transposition"}
                  data-jins-name={jins.name}
                  data-first-note={firstNoteName}
                  data-transposition-index={displayIndex + 1}
                  data-value-type={valueType}
                >
                  {(() => {
                    const pcCount = jins.jinsPitchClasses.length;
                    const totalCols = 2 + (pcCount - 1) * 2;
                    const cols: React.ReactElement[] = [];
                    cols.push(<col key={`c-0-${displayIndex}`} style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />);
                    cols.push(<col key={`c-1-${displayIndex}`} style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />);
                    for (let i = 2; i < totalCols; i++) cols.push(<col key={`c-${i}-${displayIndex}`} style={{ minWidth: "30px" }} />);
                    return <colgroup>{cols}</colgroup>;
                  })()}

                  <thead></thead>
                  <tbody>
                    {renderTransposition(jins, displayIndex)}
                    {isLastNeededForPrefetch && (
                      <tr>
                        <td colSpan={jins.jinsPitchClasses.length * 2}>
                          <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </React.Fragment>
            );
          })}
          {visibleCount < sortedTables.length && (
            <div className="jins-transpositions__load-more-wrapper">
              <button
                type="button"
                className="jins-transpositions__button jins-transpositions__load-more"
                onClick={() => {
                  const remaining = sortedTables.length - visibleCount;
                  setVisibleCount((c) => c + Math.min(BATCH_SIZE, remaining));
                }}
              >
                {t("jins.loadMore") || "Load More"}
              </button>
            </div>
          )}

          {selectedJinsData && (selectedJinsData.getCommentsEnglish()?.trim() || selectedJinsData.getCommentsArabic()?.trim() || selectedJinsData.getSourcePageReferences()?.length > 0) && (
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

                    {selectedJinsData.getCommentsArabic()?.trim() && (
                      <div className="jins-transpositions__comments-arabic">
                        <h3>{t("jins.comments")}:</h3>
                        <div className="jins-transpositions__comments-text">{selectedJinsData.getCommentsArabic()}</div>
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
        </div>
      </>
    );
  }, [
    selectedTuningSystem,
    openTranspositions,
    isToggling,
    sortedTables,
    visibleCount,
    t,
    getDisplayName,
    language,
    toggleShowDetails,
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
        const index = sortedTables.findIndex((t) => t.jins.jinsPitchClasses?.[0]?.noteName === firstNote);
        if (index > 0) {
          const needed = index;
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
  }, [selectedJinsData, sortedTables]);

  // Scroll to header on mount if jinsFirstNote is in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const jinsFirstNote = params.get("jinsFirstNote");
    if (jinsFirstNote) {
      const decoded = decodeURIComponent(jinsFirstNote);
      setTargetFirstNote(decoded);
      const index = sortedTables.findIndex((t) => t.jins.jinsPitchClasses?.[0]?.noteName === decoded);
      if (index > 0) {
        const needed = index;
        setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
      }
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollToJinsHeader(decoded, selectedJinsData);
      }, URL_SCROLL_TIMEOUT_MS);
    }
  }, [selectedJinsData, sortedTables]);

  // Keep target visible after re-renders (filters, etc.)
  useEffect(() => {
    if (!targetFirstNote) return;
    const index = sortedTables.findIndex((t) => t.jins.jinsPitchClasses?.[0]?.noteName === targetFirstNote);
    if (index > 0) {
      const needed = index;
      setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));
    }
  }, [targetFirstNote, sortedTables]);

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
