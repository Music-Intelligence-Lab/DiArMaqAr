"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { standardizeText } from "@/functions/export";
import { calculate12EdoReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { getIpnReferenceNoteName, getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import useTranspositionsContext from "@/contexts/transpositions-context";
import StaffNotation from "./staff-notation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExportModal from "./export-modal";

const getHeaderId = (noteName: string): string => {
  if (typeof noteName !== "string") return "";
  return `maqam-transpositions__header--${standardizeText(noteName).toLowerCase()}`;
};

export function scrollToMaqamHeader(firstNote: string, selectedMaqamData?: any) {
  const HEADER_SCROLL_MARGIN_TOP_PX = 240; // scroll margin for headers (matches $total-navbar-height)
  
  if (!firstNote && selectedMaqamData) {
    firstNote = selectedMaqamData.getAscendingNoteNames?.()?.[0];
  }
  if (!firstNote) return;
  const id = getHeaderId(firstNote);
  const el = document.getElementById(id);
  if (!el) return;

  // Compute deterministic scroll position so the header lands at the same offset
  function getScrollableAncestor(
    node: HTMLElement | null
  ): HTMLElement | Window {
    let elNode: HTMLElement | null = node;
    while (
      elNode &&
      elNode !== document.body &&
      elNode !== document.documentElement
    ) {
      const style = window.getComputedStyle(elNode);
      const overflowY = style.overflowY;
      const isScrollable = overflowY === "auto" || overflowY === "scroll";
      if (isScrollable && elNode.scrollHeight > elNode.clientHeight)
        return elNode;
      elNode = elNode.parentElement;
    }
    return window;
  }

  const scrollContainer = getScrollableAncestor(el as HTMLElement);
  const rect = el.getBoundingClientRect();

  if (scrollContainer === window) {
    const absoluteTop = rect.top + window.pageYOffset;
    const target = Math.max(0, absoluteTop - HEADER_SCROLL_MARGIN_TOP_PX);
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const container = scrollContainer as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const offsetTopWithinContainer =
      rect.top - containerRect.top + container.scrollTop;
    const target = Math.max(
      0,
      offsetTopWithinContainer - HEADER_SCROLL_MARGIN_TOP_PX
    );
    container.scrollTo({ top: target, behavior: "smooth" });
  }
}
import { Maqam } from "@/models/Maqam";
import { calculateInterval } from "@/models/PitchClass";
import shiftPitchClassByOctave from "@/functions/shiftPitchClassByOctave";
import Link from "next/link";
import { stringifySource } from "@/models/bibliography/Source";

const MaqamTranspositions: React.FC = () => {
  // Configurable constants (previous magic numbers)
  const SCROLL_TIMEOUT_MS = 60; // short timeout before scrolling after event
  const URL_SCROLL_TIMEOUT_MS = 220; // timeout used when scrolling from URL param
  const ANALYSIS_SCROLL_MARGIN_TOP_PX = 170; // scroll margin for top analysis header
  const INTERSECTION_ROOT_MARGIN = "200px 0px 0px 0px"; // prefetch root margin
  const BATCH_SIZE = 10; // number of transpositions to load at once
  const PREFETCH_OFFSET = 5; // how many before end to prefetch more
  const DISPATCH_EVENT_DELAY_MS = 10; // delay before emitting custom event

  const { selectedMaqamData, selectedTuningSystem, setSelectedPitchClasses, allPitchClasses, centsTolerance, setCentsTolerance, ajnas, setSelectedMaqam, selectedMaqam, sources } = useAppContext();

  const { noteOn, noteOff, playSequence, clearHangingNotes } = useSoundContext();

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
  const stickyHeaderSentinelRef = useRef<HTMLDivElement | null>(null);
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);
  const [targetFirstNote, setTargetFirstNote] = useState<string | null>(null);
  // Track pending scroll timeout so we can cancel if maqam changes
  const scrollTimeoutRef = useRef<number | null>(null);
  const [openTranspositions, setOpenTranspositions] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const skipAutoOpenRef = useRef(false);

  // Toggle show details function (single-open mode: opening one closes all others)
  const toggleShowDetails = useCallback(
    (maqamName: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isToggling) return;

      setIsToggling(maqamName);
      const maqam = maqamTranspositions?.find((m) => m.name === maqamName);
      const isOpening = !openTranspositions.includes(maqamName);

      setTimeout(() => {
        setOpenTranspositions((prev) => 
          prev.includes(maqamName) ? [] : [maqamName]
        );
        setIsToggling(null);

        // Dispatch scroll event if opening
        if (isOpening && maqam) {
          setTimeout(() => {
            const firstNote = maqam.ascendingPitchClasses[0]?.noteName;
            if (firstNote) {
              window.dispatchEvent(
                new CustomEvent("maqamTranspositionChange", {
                  detail: { firstNote },
                })
              );
            }
          }, DISPATCH_EVENT_DELAY_MS);
        }
      }, 50);
    },
    [isToggling, maqamTranspositions, openTranspositions]
  );

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    // Always open tahlil (first element) on load
    if (maqamTranspositions && maqamTranspositions.length > 0) {
      const tahlilName = maqamTranspositions[0].name;
      setOpenTranspositions([tahlilName]);
    }
  }, [selectedMaqamData, selectedTuningSystem, maqamTranspositions]);

  // Detect when sticky header becomes stuck using sentinel element
  useEffect(() => {
    if (!stickyHeaderSentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderStuck(!entry.isIntersecting);
      },
      {
        threshold: [0],
        // Negative top margin equal to navbar height (30px) + sticky top position (30px)
        rootMargin: '-60px 0px 0px 0px'
      }
    );

    observer.observe(stickyHeaderSentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Auto-open and scroll to selected transposition
  useEffect(() => {
    // If a recent user action requested skipping auto-open (e.g., Select/Load button), honor it.
    if (skipAutoOpenRef.current) {
      // reset flag so future changes act normally
      skipAutoOpenRef.current = false;
      return;
    }

    if (maqamTranspositions && maqamTranspositions.length > 0) {
      if (selectedMaqam) {
        // Case 1: A specific maqam is selected
        const selectedTranspositionName = selectedMaqam.name;

        // Find the transposition in the list
        const transpositionIndex = maqamTranspositions.findIndex((m) => m.name === selectedTranspositionName);

        // Skip analysis table at index 0
        // Auto-open the transposition
        setOpenTranspositions([selectedTranspositionName]);

        // Ensure it's visible
        const needed = transpositionIndex;
        setVisibleCount((prev) => (needed > prev ? Math.ceil(needed / BATCH_SIZE) * BATCH_SIZE : prev));

        // Scroll to it after a short delay
        setTimeout(() => {
          const firstNote = selectedMaqam.ascendingPitchClasses[0]?.noteName;
          if (firstNote) {
            scrollToMaqamHeader(firstNote, selectedMaqamData);
          }
        }, URL_SCROLL_TIMEOUT_MS);
      } else {
        // Case 2: No maqam is selected (tahlil case)
        // Open the tahlil (first element)
        const tahlilName = maqamTranspositions[0].name;
        setOpenTranspositions([tahlilName]);

        // Ensure first batch is visible
        setVisibleCount(BATCH_SIZE);

        // Scroll to tahlil
        setTimeout(() => {
          if (maqamTranspositions[0].ascendingPitchClasses?.length > 0) {
            const firstNote = maqamTranspositions[0].ascendingPitchClasses[0].noteName;
            scrollToMaqamHeader(firstNote, selectedMaqamData);
          }
        }, URL_SCROLL_TIMEOUT_MS);
      }
    }
  }, [selectedMaqam, maqamTranspositions, selectedMaqamData]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((prev) => {
              if (!maqamTranspositions) return prev;
              const remaining = Math.max(0, maqamTranspositions.length - prev);
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
  }, [maqamTranspositions, visibleCount]);

  // Memoize the basic configuration separately to avoid recalculation
  const maqamConfig = useMemo(() => {
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

    const numberOfFilterRows = Object.keys(filters).filter((key) => !disabledFilters.includes(key) && key !== valueType && filters[key as keyof typeof filters]).length;

    return {
      ascendingNoteNames,
      descendingNoteNames,
      romanNumerals,
      ascendingMaqamPitchClasses,
      numberOfMaqamNotes,
      noOctaveMaqam,
      valueType,
      useRatio,
      numberOfFilterRows,
    };
  }, [selectedMaqamData, selectedTuningSystem, allPitchClasses, filters]);

  // Copy maqam table to clipboard
  const copyMaqamTableToClipboard = useCallback(
    async (maqam: Maqam) => {
      if (!maqam || !maqamConfig) return;

      try {
        let ascending = maqam.ascendingPitchClasses;
        let descending = maqam.descendingPitchClasses;
        let ascendingIntervals = maqam.ascendingPitchClassIntervals;
        let descendingIntervals = maqam.descendingPitchClassIntervals;

        const { romanNumerals, valueType, useRatio, noOctaveMaqam } = maqamConfig;

        // Apply the same octave transformations as the UI rendering
        if (noOctaveMaqam) {
          const shiftedFirstCell = shiftPitchClassByOctave(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
          const lastCell = ascending[ascending.length - 1];

          ascending = [...ascending, shiftedFirstCell];
          descending = [shiftedFirstCell, ...descending];

          const shiftedCellInterval = calculateInterval(lastCell, shiftedFirstCell);

          ascendingIntervals = [...ascendingIntervals, shiftedCellInterval];
          descendingIntervals = [shiftedCellInterval, ...descendingIntervals];
        }

        // Get jins data for each direction
        let ascendingJins = maqam.ascendingMaqamAjnas;
        let descendingJins = maqam.descendingMaqamAjnas;
        
        // Apply octave transformations to jins data as well
        if (noOctaveMaqam && ascendingJins) {
          let octaveTransposition = ascendingJins[0];
          if (octaveTransposition) {
            const shiftedFirstCell = shiftPitchClassByOctave(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
            const foundJinsData = ajnas.find((jins) => jins.getId() === octaveTransposition?.jinsId);
            if (foundJinsData) {
              octaveTransposition = {
                ...octaveTransposition,
                jinsPitchClasses: [shiftedFirstCell],
                jinsPitchClassIntervals: [],
                name: getDisplayName(foundJinsData.getName(), "jins") + " al-" + getDisplayName(shiftedFirstCell.noteName, "note"),
              };
            }
          }
          ascendingJins = [...ascendingJins, octaveTransposition];
          descendingJins = [octaveTransposition, ...(descendingJins || [])];
        }

        // Function to build rows for one direction
        const buildDirectionRows = (pitchClasses: any[], intervals: any[], ascending: boolean, jinsTranspositions?: any[]) => {
          const rows: string[][] = [];
          
          // Scale degrees row
          const scaleDegreesRow = [t("maqam.scaleDegrees")];
          pitchClasses.forEach((_, i) => {
            const degree = ascending ? romanNumerals[i] : romanNumerals[romanNumerals.length - 1 - i];
            scaleDegreesRow.push(degree);
            if (i < pitchClasses.length - 1) scaleDegreesRow.push(''); // interval column
          });
          rows.push(scaleDegreesRow);

          // Note names row
          const noteNamesRow = [t("maqam.noteNames")];
          pitchClasses.forEach((pc, i) => {
            noteNamesRow.push(getDisplayName(pc.noteName, "note"));
            if (i < pitchClasses.length - 1) noteNamesRow.push(''); // interval column
          });
          rows.push(noteNamesRow);

          // Abjad names row (if filter enabled)
          if (filters["abjadName"]) {
            const abjadRow = [t("maqam.abjadName")];
            pitchClasses.forEach((pc, i) => {
              abjadRow.push(pc.abjadName || "--");
              if (i < pitchClasses.length - 1) abjadRow.push(''); // interval column
            });
            rows.push(abjadRow);
          }

          // English names row (if filter enabled)
          if (filters["englishName"]) {
            const englishRow = [t("maqam.englishName")];
            pitchClasses.forEach((pc, i) => {
              englishRow.push(pc.englishName);
              if (i < pitchClasses.length - 1) englishRow.push(''); // interval column
            });
            rows.push(englishRow);
          }

          // Primary value type row
          const valueRow = [t(`maqam.${valueType}`)];
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
            const fractionRow = [t("maqam.fraction")];
            pitchClasses.forEach((pc, i) => {
              fractionRow.push(pc.fraction);
              if (i < pitchClasses.length - 1) {
                fractionRow.push(`(${intervals[i].fraction})`);
              }
            });
            rows.push(fractionRow);
          }

          if (valueType !== "cents" && filters["cents"]) {
            const centsRow = [t("maqam.cents")];
            pitchClasses.forEach((pc, i) => {
              centsRow.push(parseFloat(pc.cents).toFixed(3));
              if (i < pitchClasses.length - 1) {
                centsRow.push(`(${intervals[i].cents.toFixed(3)})`);
              }
            });
            rows.push(centsRow);
          }

          if (filters["centsFromZero"]) {
            const centsFromZeroRow = [t("maqam.centsFromZero")];
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
            const centsDeviationRow = [t("maqam.centsDeviation")];
            pitchClasses.forEach((pc, i) => {
              const referenceNote = getIpnReferenceNoteName(pc);
              const deviationText = `${referenceNote}${pc.centsDeviation > 0 ? ' +' : ' '}${pc.centsDeviation.toFixed(1)}`;
              centsDeviationRow.push(deviationText);
              if (i < pitchClasses.length - 1) {
                centsDeviationRow.push(''); // interval column empty for cents deviation
              }
            });
            rows.push(centsDeviationRow);
          }

          if (valueType !== "decimalRatio" && filters["decimalRatio"]) {
            const decimalRow = [t("maqam.decimalRatio")];
            pitchClasses.forEach((pc, i) => {
              decimalRow.push(parseFloat(pc.decimalRatio).toFixed(3));
              if (i < pitchClasses.length - 1) {
                decimalRow.push(`(${intervals[i].decimalRatio.toFixed(3)})`);
              }
            });
            rows.push(decimalRow);
          }

          if (valueType !== "stringLength" && filters["stringLength"]) {
            const stringLengthRow = [t("maqam.stringLength")];
            pitchClasses.forEach((pc, i) => {
              stringLengthRow.push(parseFloat(pc.stringLength).toFixed(3));
              if (i < pitchClasses.length - 1) {
                stringLengthRow.push(`(${intervals[i].stringLength.toFixed(3)})`);
              }
            });
            rows.push(stringLengthRow);
          }

          if (valueType !== "fretDivision" && filters["fretDivision"]) {
            const fretDivisionRow = [t("maqam.fretDivision")];
            pitchClasses.forEach((pc, i) => {
              fretDivisionRow.push(parseFloat(pc.fretDivision).toFixed(3));
              if (i < pitchClasses.length - 1) {
                fretDivisionRow.push(`(${intervals[i].fretDivision.toFixed(3)})`);
              }
            });
            rows.push(fretDivisionRow);
          }

          if (filters["midiNote"]) {
            const midiRow = [t("maqam.midiNote")];
            pitchClasses.forEach((pc, i) => {
              midiRow.push(pc.midiNoteNumber.toFixed(3));
              if (i < pitchClasses.length - 1) {
                midiRow.push(''); // interval column empty for MIDI
              }
            });
            rows.push(midiRow);
          }

          if (filters["midiNoteDeviation"]) {
            const midiDeviationRow = [t("maqam.midiNoteDeviation")];
            pitchClasses.forEach((pc, i) => {
              const referenceMidiNote = calculate12EdoReferenceMidiNote(pc);
              const deviation = pc.centsDeviation;
              const sign = deviation > 0 ? "+" : "";
              midiDeviationRow.push(`${referenceMidiNote} ${sign}${deviation.toFixed(1)}`);
              if (i < pitchClasses.length - 1) {
                midiDeviationRow.push(''); // interval column empty for MIDI deviation
              }
            });
            rows.push(midiDeviationRow);
          }

          if (filters["frequency"]) {
            const frequencyRow = [t("maqam.frequency")];
            pitchClasses.forEach((pc, i) => {
              frequencyRow.push(parseFloat(pc.frequency).toFixed(3));
              if (i < pitchClasses.length - 1) {
                frequencyRow.push(''); // interval column empty for frequency
              }
            });
            rows.push(frequencyRow);
          }

          // Ajnas row
          if (jinsTranspositions && jinsTranspositions.length > 0) {
            const ajnasRow = [t("maqam.ajnas")];
            jinsTranspositions.forEach((jinsTransposition) => {
              if (jinsTransposition && jinsTransposition.name) {
                ajnasRow.push(getDisplayName(jinsTransposition.name, "jins"));
              } else {
                ajnasRow.push('');
              }
              ajnasRow.push(''); // interval column
            });
            // Fill remaining columns if needed
            while (ajnasRow.length - 1 < pitchClasses.length * 2 - 1) {
              ajnasRow.push('');
            }
            rows.push(ajnasRow);
          }

          return rows;
        };

        // Build complete table
        const allRows: string[][] = [];
        
        // Ascending section header
        allRows.push([t("maqam.ascending")]);
        const ascendingRows = buildDirectionRows(ascending, ascendingIntervals, true, ascendingJins);
        allRows.push(...ascendingRows);
        allRows.push([]); // Empty row for spacing

        // Descending section header and data
        allRows.push([t("maqam.descending")]);
        const descendingRows = buildDirectionRows(descending, descendingIntervals, false, descendingJins);
        allRows.push(...descendingRows);

        // Convert to multiple formats for universal compatibility
        // Create both TSV (for spreadsheets) and HTML (for documents)
        
        // Get max columns from data rows
        const maxCols = Math.max(...allRows.filter(r => r.length > 1).map(r => r.length));
        
        // Start with maqam name as a heading
        const maqamTitle = getDisplayName(maqam.name, 'maqam');
        
        // Build TSV format for spreadsheets
        let tsvText = `${maqamTitle}\n\n`;
        
        // Build HTML format for documents
        let htmlText = `<h3>${maqamTitle}</h3><table border="1" cellpadding="4" cellspacing="0"><tbody>`;
        
        for (const row of allRows) {
          if (row.length === 0) {
            // Skip empty rows - they were just for spacing in our array
            continue;
          } else if (row.length === 1) {
            // Header row - span full table width
            const headerRow = [row[0]];
            // Fill remaining columns with empty strings
            while (headerRow.length < maxCols) {
              headerRow.push('');
            }
            
            // TSV format
            tsvText += headerRow.join('\t') + '\n';
            
            // HTML format - header row with colspan
            htmlText += `<tr><th colspan="${maxCols}" style="background-color: #f0f0f0; font-weight: bold; text-align: center;">${row[0]}</th></tr>`;
          } else {
            // Data row
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
    [filters, getDisplayName, getEnglishNoteName, t, maqamConfig, ajnas, allPitchClasses]
  );

  // Create a unified list of all tables (analysis + transpositions) sorted by tonic pitch class
  const sortedTables = useMemo(() => {
    if (!maqamTranspositions || maqamTranspositions.length === 0) return [];
    
    // Map each maqam to include its sorting info
    const tablesWithSortInfo = maqamTranspositions.map((maqam, originalIndex) => {
      const firstPitchClass = maqam.ascendingPitchClasses[0];
      const isAnalysis = !maqam.transposition; // First item is analysis (no transposition flag)
      
      return {
        maqam,
        originalIndex,
        isAnalysis,
        sortKey: parseFloat(firstPitchClass?.cents || '0'), // Sort by cents value of first pitch class
        firstNoteName: firstPitchClass?.noteName || '',
      };
    });
    
    // Sort by cents value (tonic pitch class)
    tablesWithSortInfo.sort((a, b) => a.sortKey - b.sortKey);
    
    return tablesWithSortInfo;
  }, [maqamTranspositions]);

  const transpositionTables = useMemo(() => {
    if (!maqamConfig) return null;

    const { romanNumerals, noOctaveMaqam, valueType, useRatio, numberOfFilterRows } = maqamConfig;

    function renderTranspositionRow(maqam: Maqam, ascending: boolean, rowIndex: number) {
      // Apply sequential English name spellings for melodic sequences
      let ascendingTranspositionPitchClasses = renderPitchClassSpellings(maqam.ascendingPitchClasses);
      let descendingTranspositionPitchClasses = renderPitchClassSpellings(maqam.descendingPitchClasses);

      let ascendingIntervals = maqam.ascendingPitchClassIntervals;
      let descendingIntervals = maqam.descendingPitchClassIntervals;

      let jinsTranspositions = ascending ? maqam.ascendingMaqamAjnas : maqam.descendingMaqamAjnas;

      if (noOctaveMaqam) {
        const shiftedFirstCell = shiftPitchClassByOctave(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
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
                name: getDisplayName(foundJinsData.getName(), "jins") + " al-" + getDisplayName(shiftedFirstCell.noteName, "note"),
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
      const open = openTranspositions.includes(maqam.name);

      const rowSpan = open ? 14 + numberOfFilterRows * 2 : 1;

      return (
        <>
          {ascending && (
            <tr
              className={`maqam-jins-transpositions-shared__transposition-row ${isToggling === maqam.name ? "maqam-jins-transpositions-shared__transposition-row--toggling" : ""}`}
              id={getHeaderId(pitchClasses[0]?.noteName)}
              style={{
                ...(rowIndex === 0 && ascending ? { scrollMarginTop: `${ANALYSIS_SCROLL_MARGIN_TOP_PX}px` } : {}),
              }}
            >
              <th className={`maqam-jins-transpositions-shared__transposition-number maqam-jins-transpositions-shared__transposition-number_${pitchClasses[0].octave}`} rowSpan={rowSpan}>
                {rowIndex + 1}
              </th>
              <th
                className="maqam-jins-transpositions-shared__title-cell"
                colSpan={4 + (pitchClasses.length - 1) * 2}
              >
                {!transposition ? (
                  <button 
                    className="maqam-jins-transpositions-shared__transposition-title" 
                    onClick={(e) => toggleShowDetails(maqam.name, e)}
                  >
                    <span>
                      {getDisplayName(maqam.name, 'maqam')}
                      {" "}
                      ({getDisplayName(pitchClasses[0].noteName, "note")} / <span dir="ltr">{getEnglishNoteName(pitchClasses[0].noteName)}</span>)
                    </span>
                    <span className="maqam-jins-transpositions-shared__darajat-al-istiqrar">
                      {t("maqam.darajatAlIstiqrar")}
                    </span>
                  </button>
                ) : (
                  <button 
                    className="maqam-jins-transpositions-shared__transposition-title" 
                    onClick={(e) => toggleShowDetails(maqam.name, e)}
                  >
                    <span>
                      {getDisplayName(maqam.name, 'maqam')}
                      {" "}
                      (<span dir="ltr">{getEnglishNoteName(pitchClasses[0].noteName)}</span>)
                    </span>
                  </button>
                )}
                <span className="maqam-jins-transpositions-shared__buttons">
                  <button className="maqam-jins-transpositions-shared__button--toggle" onClick={(e) => toggleShowDetails(maqam.name, e)}>
                    {open ? t("maqam.hideDetails") : t("maqam.showDetails")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Prevent auto-open/scroll effect from triggering
                      skipAutoOpenRef.current = true;
                      setSelectedPitchClasses([]);
                      setSelectedPitchClasses(noOctaveMaqam ? pitchClasses.slice(0, -1) : pitchClasses);
                      setSelectedMaqam(transposition ? maqam : null);
                    }}
                  >
                    {t("maqam.selectLoadToKeyboard")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      await playSequence(pitchClasses, true);
                      await playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                    }}
                  >
                    <PlayCircleIcon className="maqam-jins-transpositions-shared__play-circle-icon" />
                    {t("maqam.ascendingDescending")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      playSequence(pitchClasses, true);
                    }}
                  >
                    <PlayCircleIcon className="maqam-jins-transpositions-shared__play-circle-icon" />
                    {t("maqam.ascending")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                    }}
                  >
                    <PlayCircleIcon className="maqam-jins-transpositions-shared__play-circle-icon" />
                    {t("maqam.descending")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaqamExport(maqam);
                    }}
                  >
                    <FileDownloadIcon className="maqam-jins-transpositions-shared__export-icon" />
                    {t("maqam.export")}
                  </button>
                  <button
                    className="maqam-jins-transpositions-shared__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyMaqamTableToClipboard(maqam);
                    }}
                    title="Copy table to clipboard (Excel format)"
                  >
                    <ContentCopyIcon className="maqam-jins-transpositions-shared__copy-icon" />
                    {t("maqam.copyTable")}
                  </button>
                </span>
              </th>
            </tr>
          )}
          {open && (
            <>
              <tr>
                <td className="maqam-jins-transpositions-shared__asc-desc-column" rowSpan={6 + numberOfFilterRows} data-column-type="direction">
                  {language === "ar" ? (ascending ? "↖" : "↙") : ascending ? "↗" : "↘"}
                </td>
              </tr>
              <tr data-row-type="scaleDegrees">
                <th scope="col" id={`maqam-${standardizeText(maqam.name)}-scaleDegrees-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.scaleDegrees")}</th>
                {pitchClasses.map((_, i) => (
                  <React.Fragment key={i}>
                    <th scope="col" className="maqam-jins-transpositions-shared__table-cell--scale-degree" data-column-type="scale-degree">{ascending ? romanNumerals[i] : romanNumerals[romanNumerals.length - 1 - i]}</th>
                    <th scope="col" className="maqam-jins-transpositions-shared__table-cell--scale-degree" data-column-type="empty"></th>
                  </React.Fragment>
                ))}
              </tr>
              <tr data-row-type="noteNames">
                <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-noteNames-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.noteNames")}</th>
                {pitchClasses.map((pitchClass, i) => (
                  <React.Fragment key={i}>
                    <td
                      className={
                        (!oppositePitchClasses.includes(pitchClass) ? "maqam-jins-transpositions-shared__table-cell--unique " : "maqam-jins-transpositions-shared__table-cell--pitch-class ") +
                        (isCellHighlighted(rowIndex + (ascending ? 0 : 0.5), pitchClass.noteName) ? "maqam-jins-transpositions-shared__table-cell--highlighted" : "")
                      }
                      data-column-type="note-name"
                    >
                      {getDisplayName(pitchClass.noteName, "note")}{" "}
                    </td>
                    <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                  </React.Fragment>
                ))}
              </tr>
              {filters["abjadName"] && (
                <tr data-row-type="abjadName">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-abjadName-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.abjadName")}</th>
                  {pitchClasses.map((pitchClass, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pitchClass.abjadName || "--"}</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["englishName"] && (
                <tr data-row-type="englishName">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-englishName-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.englishName")}</th>
                  {pitchClasses.map((pc, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pc.englishName}</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              <tr data-row-type={valueType}>
                <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-primaryValue-header`} className="maqam-jins-transpositions-shared__row-header maqam-jins-transpositions-shared__row-header--primary-value" data-column-type="row-header">{t(`maqam.${valueType}`)}</th>
                <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[0].originalValue}</td>
                {intervals.map((interval, i) => (
                  <React.Fragment key={i}>
                    <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={`${valueType}-interval`}>{useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}</td>
                    <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[i + 1].originalValue}</td>
                    {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                  </React.Fragment>
                ))}
              </tr>
              {valueType !== "fraction" && filters["fraction"] && (
                <tr data-row-type="fraction">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-fraction-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.fraction")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[0].fraction}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction-interval">({interval.fraction})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[i + 1].fraction}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "cents" && filters["cents"] && (
                <tr data-row-type="cents">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-cents-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.cents")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[0].cents).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[i + 1].cents).toFixed(3)}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsFromZero"] && (
                <tr data-row-type="centsFromZero">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-centsFromZero-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.centsFromZero")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-from-zero">0.000</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-from-zero">{(parseFloat(pitchClasses[i + 1].cents) - parseFloat(pitchClasses[0].cents)).toFixed(3)}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["centsDeviation"] && (
                <tr data-row-type="centsDeviation">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-centsDeviation-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.centsDeviation")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-deviation">
                    <span>{getIpnReferenceNoteNameWithOctave(pitchClasses[0])}</span>
                    {pitchClasses[0].centsDeviation > 0 ? " +" : " "}
                    {pitchClasses[0].centsDeviation.toFixed(1)}
                  </td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-deviation">
                        <span>{getIpnReferenceNoteNameWithOctave(pitchClasses[i + 1])}</span>
                        {pitchClasses[i + 1].centsDeviation > 0 ? " +" : " "}
                        {pitchClasses[i + 1].centsDeviation.toFixed(1)}
                      </td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="interval"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "decimalRatio" && filters["decimalRatio"] && (
                <tr data-row-type="decimalRatio">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-decimalRatio-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.decimalRatio")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio-interval">({interval.decimalRatio.toFixed(3)})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "stringLength" && filters["stringLength"] && (
                <tr data-row-type="stringLength">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-stringLength-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.stringLength")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[0].stringLength).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length-interval">({interval.stringLength.toFixed(3)})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {valueType !== "fretDivision" && filters["fretDivision"] && (
                <tr data-row-type="fretDivision">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-fretDivision-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.fretDivision")}</th>
                  <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[0].fretDivision).toFixed(3)}</td>
                  {intervals.map((interval, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division-interval">({interval.fretDivision.toFixed(3)})</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}</td>
                      {i === intervals.length - 1 && <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>}
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["midiNote"] && (
                <tr data-row-type="midiNote">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-midiNote-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.midiNote")}</th>
                  {pitchClasses.map((pitchClass, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note">{pitchClass.midiNoteNumber.toFixed(3)}</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              {filters["midiNoteDeviation"] && (
                <tr data-row-type="midiNoteDeviation">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-midiNoteDeviation-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.midiNoteDeviation")}</th>
                  {pitchClasses.map((pitchClass, i) => {
                    const referenceMidiNote = calculate12EdoReferenceMidiNote(pitchClass);

                    return (
                      <React.Fragment key={i}>
                        <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note-deviation">
                          {referenceMidiNote} {pitchClass.centsDeviation > 0 ? "+" : ""}{pitchClass.centsDeviation.toFixed(1)}
                        </td>
                        <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              )}
              {filters["frequency"] && (
                <tr data-row-type="frequency">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-frequency-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.frequency")}</th>
                  {pitchClasses.map((pitchClass, i) => (
                    <React.Fragment key={i}>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="frequency">{parseFloat(pitchClass.frequency).toFixed(3)}</td>
                      <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></td>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              <tr data-row-type="play">
                <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-play-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.play")}</th>
                {pitchClasses.map((pitchClass, i) => (
                  <React.Fragment key={i}>
                    <td data-column-type="play-button">
                      <PlayCircleIcon
                        className="maqam-jins-transpositions-shared__play-circle-icon"
                        aria-label={t("maqam.playNote")}
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
                    <td className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></td>
                  </React.Fragment>
                ))}
              </tr>
              {jinsTranspositions && (
                <>
                  <tr data-row-type="ajnas">
                    <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-ajnas-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.ajnas")}</th>
                    {jinsTranspositions.map((jinsTransposition, index) => {
                      const noteNames = jinsTransposition?.jinsPitchClasses.map((pc) => pc.noteName) || [];
                      const isActive = highlightedNotes.index === rowIndex + (ascending ? 0 : 0.5) && 
                                      noteNames.every(name => highlightedNotes.noteNames.includes(name)) &&
                                      highlightedNotes.noteNames.every(name => noteNames.includes(name));
                      
                      return (
                        <td className="maqam-jins-transpositions-shared__table-cell--pitch-class" colSpan={2} key={index} data-column-type="jins">
                          {jinsTransposition && (
                            <button
                              className={`maqam-jins-transpositions-shared__jins-button ${isActive ? "maqam-jins-transpositions-shared__jins-button--active" : ""}`}
                              onClick={() => {
                                // Toggle: if already active, clear highlights; otherwise set new highlights
                                if (isActive) {
                                  setHighlightedNotes({ index: -1, noteNames: [] });
                                } else {
                                  setHighlightedNotes({
                                    index: rowIndex + (ascending ? 0 : 0.5),
                                    noteNames,
                                  });
                                }
                              }}
                            >
                              {getDisplayName(jinsTransposition.name, "jins")}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}
              {filters.staffNotation && (
                <tr data-row-type="staffNotation">
                  <th scope="row" id={`maqam-${standardizeText(maqam.name)}-${ascending ? 'ascending' : 'descending'}-staffNotation-header`} className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t("maqam.staffNotation")}</th>
                  <td className="staff-notation-cell" colSpan={pitchClasses.length * 2}>
                    {/* Only render staff notation when actually open to improve performance */}
                    {open && <StaffNotation pitchClasses={pitchClasses} />}
                  </td>
                </tr>
              )}
            </>
          )}



          {/* spacer removed from per-row placement; rendered once after both rows in renderTransposition */}
        </>
      );
    }

    function renderTransposition(
      maqam: Maqam,
      index: number
    ) {
      // Compute colSpan to match the table width for this transposition.
      const pitchClassesCount = maqam.ascendingPitchClasses.length + (maqamConfig?.noOctaveMaqam ? 1 : 0);
      const colSpan = pitchClassesCount * 2;

      const isOpen = openTranspositions.includes(maqam.name);

      return (
        <>
          {renderTranspositionRow(maqam, true, index)}

          {/* Only render descending row and spacer when open */}
          {isOpen && (
            <>
              <tr>
                <td className="maqam-transpositions__direction-spacer" colSpan={colSpan} />
              </tr>
              {renderTranspositionRow(maqam, false, index)}
            </>
          )}
        </>
      );
    }

    return (
      <div className="maqam-transpositions maqam-jins-transpositions-shared" key={language}>
        {maqamTranspositions.length > 0 && (
          <>
            {/* Sentinel element positioned to detect when sticky header becomes stuck */}
            <div 
              ref={stickyHeaderSentinelRef} 
              style={{ 
                height: '1px',
                pointerEvents: 'none',
                visibility: 'hidden'
              }} 
            />
            <div className={`maqam-jins-transpositions-shared__sticky-header${isHeaderStuck ? ' maqam-jins-transpositions-shared__sticky-header_stuck' : ''}`}>
              <div className="maqam-jins-transpositions-shared__title-row" dir={language === "ar" ? "rtl" : "ltr"}>
                {t("maqam.analysis")}: {`${getDisplayName(selectedMaqamData?.getName() || "", "maqam")}`}
                {!useRatio && (
                  <>
                    {" "}
                    / {t("maqam.centsTolerance")}: <input className="maqam-jins-transpositions-shared__cents-tolerance-input" type="number" value={centsTolerance ?? 0} onChange={(e) => setCentsTolerance(Number(e.target.value))} />
                  </>
                )}
              </div>

              <div className="maqam-jins-transpositions-shared__filter-menu">
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
                      className={`maqam-jins-transpositions-shared__filter-item ${filters[filterKey as keyof typeof filters] ? "maqam-jins-transpositions-shared__filter-item_active" : ""}`}
                      // prevent the drawer (or parent) click handler from firing
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        id={`filter-${filterKey}`}
                        type="checkbox"
                        className="maqam-jins-transpositions-shared__filter-checkbox"
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
                      <span className="maqam-jins-transpositions-shared__filter-label">{t(`maqam.${filterKey}`)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Render all tables (analysis + transpositions) in sorted order */}
            {sortedTables.slice(0, visibleCount).map((tableInfo, displayIndex) => {
              const { maqam, isAnalysis, firstNoteName } = tableInfo;
              const isLastNeededForPrefetch = displayIndex === visibleCount - PREFETCH_OFFSET - 1 && visibleCount < sortedTables.length;
              
              return (
                <React.Fragment key={`${isAnalysis ? 'analysis' : 'transposition'}-${maqam.name}`}>
                  <table 
                    className={`maqam-jins-transpositions-shared__table ${isAnalysis ? 'maqam-jins-transpositions-shared__table--analysis' : 'maqam-jins-transpositions-shared__table--transposition'}`}
                    data-table-type={isAnalysis ? "analysis" : "transposition"}
                    data-maqam-name={maqam.name}
                    data-first-note={firstNoteName}
                    data-transposition-index={displayIndex + 1}
                    data-value-type={valueType}
                  >
                    {(() => {
                      const pcCount = maqam.ascendingPitchClasses.length + (maqamConfig?.noOctaveMaqam ? 1 : 0);
                      const totalCols = 2 + (pcCount - 1) * 2;
                      const cols: React.ReactElement[] = [];
                      cols.push(<col key={`c-0-${displayIndex}`} style={{ width: "30px" }} />);
                      cols.push(<col key={`c-1-${displayIndex}`} style={{ width: "40px" }} />);
                      cols.push(<col key={`c-2-${displayIndex}`} style={{ minWidth: "110px", maxWidth: "110px", width: "110px" }} />);
                      for (let i = 3; i < totalCols; i++) {
                        cols.push(<col key={`c-${i}-${displayIndex}`} style={{ minWidth: "30px" }} />);
                      }
                      return <colgroup>{cols}</colgroup>;
                    })()}
                    <thead></thead>
                    <tbody>
                      {renderTransposition(maqam, displayIndex)}
                      {isLastNeededForPrefetch && (
                        <tr>
                          <td colSpan={2 + (maqam.ascendingPitchClasses.length - 1) * 2}>
                            <div ref={sentinelRef} style={{ width: 1, height: 1 }} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Spacer after each table */}
                  <div className="maqam-jins-transpositions-shared__transposition-spacer" aria-hidden="true" />
                </React.Fragment>
              );
            })}
          </>
        )}
        {/* COMMENTS AND SOURCES */}
        {selectedMaqamData && (selectedMaqamData.getCommentsEnglish()?.trim() || selectedMaqamData.getCommentsArabic()?.trim() || selectedMaqamData.getSourcePageReferences()?.length > 0) && (
          <>
            <div className="maqam-jins-transpositions-shared__comments-sources-container">
              {language === "ar" ? (
                <>
                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-jins-transpositions-shared__sources-english">
                      <h3>{t("maqam.sources")}:</h3>
                      <div className="maqam-jins-transpositions-shared__sources-text">
                        {selectedMaqamData.getSourcePageReferences().map((sourceRef, idx) => {
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

                  {selectedMaqamData.getCommentsArabic()?.trim() && (
                    <div className="maqam-jins-transpositions-shared__comments-arabic">
                      <h3>{t("maqam.comments")}:</h3>
                      <div className="maqam-jins-transpositions-shared__comments-text">{selectedMaqamData.getCommentsArabic()}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedMaqamData.getCommentsEnglish()?.trim() && (
                    <div className="maqam-jins-transpositions-shared__comments-english">
                      <h3>{t("maqam.comments")}:</h3>
                      <div className="maqam-jins-transpositions-shared__comments-text">{selectedMaqamData.getCommentsEnglish()}</div>
                    </div>
                  )}

                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-jins-transpositions-shared__sources-english">
                      <h3>{t("maqam.sources")}:</h3>
                      <div className="maqam-jins-transpositions-shared__sources-text">
                        {selectedMaqamData.getSourcePageReferences().map((sourceRef, idx) => {
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
        {/* Load More button */}
        {visibleCount < sortedTables.length && (
          <div className="maqam-jins-transpositions-shared__load-more-wrapper">
            <button
              type="button"
              className="maqam-jins-transpositions-shared__button maqam-jins-transpositions-shared__load-more"
              onClick={() => {
                const remaining = sortedTables.length - visibleCount;
                setVisibleCount((c) => c + Math.min(BATCH_SIZE, remaining));
              }}
            >
              {t("maqam.loadMore") || "Load More"}
            </button>
          </div>
        )}
      </div>
    );
  }, [
    maqamConfig,
    openTranspositions,
    isToggling,
    maqamTranspositions,
    sortedTables,
    visibleCount,
    highlightedNotes,
    t,
    getDisplayName,
    language,
    toggleShowDetails,
    setSelectedPitchClasses,
    setSelectedMaqam,
    playSequence,
    clearHangingNotes,
    handleMaqamExport,
    setHighlightedNotes,
    centsTolerance,
    setCentsTolerance,
    setFilters,
    sources,
  ]);

  // Listen for custom event to scroll to header when maqam/transposition changes (event-driven)
  useEffect(() => {
    function handleMaqamTranspositionChange(e: CustomEvent) {
      const firstNote: string | undefined = e.detail?.firstNote;
      if (firstNote) {
        setTargetFirstNote(firstNote);
        // Ensure it's visible before scrolling
        const index = maqamTranspositions.findIndex((m) => m.ascendingPitchClasses?.[0]?.noteName === firstNote);
        if (index > 0) {
          // index 0 is the analysis table already visible
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
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [selectedMaqamData]);

  return (
    <>
      {transpositionTables}
      {visibleCount < (maqamTranspositions?.length || 0) - 1 && visibleCount <= PREFETCH_OFFSET && <div ref={sentinelRef} style={{ width: 1, height: 1 }} />}

      {/* Export Modal */}
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} exportType="maqam" specificMaqam={maqamToExport || undefined} />
    </>
  );
};

export default MaqamTranspositions;
