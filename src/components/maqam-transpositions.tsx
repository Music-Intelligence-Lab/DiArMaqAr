"use client";

import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import useTranspositionsContext from "@/contexts/transpositions-context";
import StaffNotation from "./staff-notation";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
import { stringifySource } from "@/models/bibliography/Source";

const MaqamTranspositions: React.FC = () => {
  // Configurable constants (previous magic numbers)
  const SCROLL_TIMEOUT_MS = 60; // short timeout before scrolling after event
  const URL_SCROLL_TIMEOUT_MS = 220; // timeout used when scrolling from URL param
  const ANALYSIS_SCROLL_MARGIN_TOP_PX = 160; // scroll margin for top analysis header
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
  const [targetFirstNote, setTargetFirstNote] = useState<string | null>(null);
  // Track pending scroll timeout so we can cancel if maqam changes
  const scrollTimeoutRef = useRef<number | null>(null);
  const [openTranspositions, setOpenTranspositions] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  // When true, the next change to `selectedMaqam` should not trigger auto-open of its details.
  const skipAutoOpenRef = useRef(false);

  // Debounced toggle function to prevent rapid clicking issues
  const toggleTransposition = useCallback(
    (maqamName: string) => {
      if (isToggling) return; // Prevent rapid clicking

      setIsToggling(maqamName);

      // Small delay to show visual feedback before heavy computation
      setTimeout(() => {
        setOpenTranspositions((prev) => {
          const newArray = [...prev];
          const index = newArray.indexOf(maqamName);
          if (index >= 0) {
            newArray.splice(index, 1);
          } else {
            newArray.push(maqamName);
          }
          return newArray;
        });
        setIsToggling(null);
      }, 50); // Small delay for better UX
    },
    [isToggling]
  );

  // Toggle show details function
  const toggleShowDetails = useCallback(
    (maqamName: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isToggling) return; // Prevent rapid clicking

      setIsToggling(maqamName);

      // Get the maqam object to check if it's a transposition
      const maqam = maqamTranspositions?.find((m) => m.name === maqamName);

      // Check if we're opening (not already in the list)
      const isOpening = !openTranspositions.includes(maqamName);

      // Small delay to show visual feedback before heavy computation
      setTimeout(() => {
        setOpenTranspositions((prev) => {
          const isCurrentlyOpen = prev.includes(maqamName);

          if (isCurrentlyOpen) {
            // If closing, just remove this one
            return prev.filter((name) => name !== maqamName);
          } else {
            // If opening, close all others and open only this one
            return [maqamName];
          }
        });
        setIsToggling(null);

        // If opening, dispatch scroll event after a delay
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
      }, 50); // Small delay for better UX
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
          const shiftedFirstCell = shiftPitchClass(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
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
            const shiftedFirstCell = shiftPitchClass(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
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
            // Build preferred mapping for enharmonic consistency
            const preferredMap: Record<string, string> = {};
            let prevEnglish: string | undefined = undefined;
            for (const pc of pitchClasses) {
              if (!pc || !pc.noteName) continue;
              const en = getEnglishNoteName(pc.noteName, { prevEnglish });
              preferredMap[pc.noteName] = en;
              prevEnglish = en;
            }
            
            pitchClasses.forEach((pc, i) => {
              let referenceNoteName = pc.referenceNoteName;
              if (preferredMap[pc.noteName]) {
                referenceNoteName = preferredMap[pc.noteName].replace(/[+-]/g, '');
              } else if (referenceNoteName) {
                referenceNoteName = referenceNoteName.replace(/[+-]/g, '');
              }
              const deviationText = `${referenceNoteName || ''}${pc.centsDeviation > 0 ? ' +' : ' '}${pc.centsDeviation.toFixed(1)}`;
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
            <tr>
              <th className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${pitchClasses[0].octave}`} rowSpan={rowSpan}>
                {rowIndex + 1}
              </th>
              <th
                className={`maqam-transpositions__header ${isToggling === maqam.name ? "maqam-transpositions__header--toggling" : ""}`}
                id={getHeaderId(pitchClasses[0]?.noteName)}
                colSpan={4 + (pitchClasses.length - 1) * 2}
                style={{
                  ...(rowIndex === 0 && ascending ? { scrollMarginTop: `${ANALYSIS_SCROLL_MARGIN_TOP_PX}px` } : {}),
                }}
              >
                {!transposition ? (
                  <span className="maqam-transpositions__transposition-title" onClick={(e) => toggleShowDetails(maqam.name, e)} style={{ cursor: "pointer" }}>
                    <span>
                      {getDisplayName(maqam.name, 'maqam')}
                      {" "}
                      ({getDisplayName(pitchClasses[0].noteName, "note")} / <span dir="ltr">{getEnglishNoteName(pitchClasses[0].noteName)}</span>)
                    </span>
                    <span className="maqam-transpositions__darajat-al-istiqrar">
                      {t("maqam.darajatAlIstiqrar")}
                    </span>
                  </span>
                ) : (
                    <span className="maqam-transpositions__transposition-title" onClick={(e) => toggleShowDetails(maqam.name, e)} style={{ cursor: "pointer" }}>
                    <span>
                      {getDisplayName(maqam.name, 'maqam')}
                      {" "}
                      (<span style={{ cursor: "pointer" }} dir="ltr">{getEnglishNoteName(pitchClasses[0].noteName)}</span>)
                    </span>
                    </span>
                )}
                <span className="maqam-transpositions__buttons">
                  <button className="maqam-transpositions__button maqam-transpositions__button--toggle" onClick={(e) => toggleShowDetails(maqam.name, e)}>
                    {open ? t("maqam.hideDetails") : t("maqam.showDetails")}
                  </button>
                  <button
                    className="maqam-transpositions__button"
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
                    className="maqam-transpositions__button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      await playSequence(pitchClasses, true);
                      await playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                    }}
                  >
                    <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                    {t("maqam.ascendingDescending")}
                  </button>
                  <button
                    className="maqam-transpositions__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      playSequence(pitchClasses, true);
                    }}
                  >
                    <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                    {t("maqam.ascending")}
                  </button>
                  <button
                    className="maqam-transpositions__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHangingNotes();
                      playSequence([...oppositePitchClasses].reverse(), false, pitchClasses);
                    }}
                  >
                    <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                    {t("maqam.descending")}
                  </button>
                  <button
                    className="maqam-transpositions__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaqamExport(maqam);
                    }}
                  >
                    <FileDownloadIcon className="maqam-transpositions__export-icon" />
                    {t("maqam.export")}
                  </button>
                  <button
                    className="maqam-transpositions__button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyMaqamTableToClipboard(maqam);
                    }}
                    title="Copy table to clipboard (Excel format)"
                  >
                    <ContentCopyIcon className="maqam-transpositions__copy-icon" />
                    {t("maqam.copyTable")}
                  </button>
                </span>
              </th>
            </tr>
          )}
          {open && (
            <>
              <tr>
                <td className="maqam-transpositions__asc-desc-column" rowSpan={6 + numberOfFilterRows}>
                  {language === "ar" ? (ascending ? "↖" : "↙") : ascending ? "↗" : "↘"}
                </td>
              </tr>
              <tr>
                <th className="maqam-transpositions__row-header">{t("maqam.scaleDegrees")}</th>
                {pitchClasses.map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="maqam-transpositions__header-cell_scale-degrees-number">{ascending ? romanNumerals[i] : romanNumerals[romanNumerals.length - 1 - i]}</th>
                    <th className="maqam-transpositions__header-cell_scale-degrees"></th>
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <th className="maqam-transpositions__row-header">{t("maqam.noteNames")}</th>
                {pitchClasses.map((pitchClass, i) => (
                  <React.Fragment key={i}>
                    <th
                      className={
                        (!oppositePitchClasses.includes(pitchClass) ? "maqam-transpositions__header-cell_unique " : "maqam-transpositions__header-pitchClass ") +
                        (isCellHighlighted(rowIndex + (ascending ? 0 : 0.5), pitchClass.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                      }
                    >
                      {getDisplayName(pitchClass.noteName, "note")}{" "}
                    </th>
                    <th className="maqam-transpositions__header-pitchClass"></th>
                  </React.Fragment>
                ))}
              </tr>
              {filters["abjadName"] && (
                <tr>
                  <th className="maqam-transpositions__row-header">{t("maqam.abjadName")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.englishName")}</th>
                  {(() => {
                    const englishNames: string[] = [];
                    let prev: string | undefined;
                    for (const pc of pitchClasses) {
                      const name = getEnglishNoteName(pc.noteName, prev ? { prevEnglish: prev } : undefined);
                      englishNames.push(name);
                      prev = name;
                    }
                    return englishNames.map((ename, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-pitchClass">{ename}</th>
                        <th className="maqam-transpositions__header-pitchClass"></th>
                      </React.Fragment>
                    ));
                  })()}
                </tr>
              )}
              <tr>
                <th className="maqam-transpositions__row-header">{t(`maqam.${valueType}`)}</th>
                <th className="maqam-transpositions__header-pitchClass">{pitchClasses[0].originalValue}</th>
                {intervals.map((interval, i) => (
                  <React.Fragment key={i}>
                    <th className="maqam-transpositions__header-pitchClass">{useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}</th>
                    <th className="maqam-transpositions__header-pitchClass">{pitchClasses[i + 1].originalValue}</th>
                    {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                  </React.Fragment>
                ))}
              </tr>
              {valueType !== "fraction" && filters["fraction"] && (
                <tr>
                  <th className="maqam-transpositions__row-header">{t("maqam.fraction")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.cents")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.centsFromZero")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.centsDeviation")}</th>
                  {(() => {
                    // Build preferred mapping from current maqam context for enharmonic consistency
                    const preferredMap: Record<string, string> = {};
                    let prevEnglish: string | undefined = undefined;
                    
                    // Use the maqam pitch classes as context for enharmonic spelling
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
                        <th className="maqam-transpositions__header-pitchClass">
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
                            <th className="maqam-transpositions__header-pitchClass"></th>
                            <th className="maqam-transpositions__header-pitchClass">
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
                            {i === intervals.length - 1 && <th className="maqam-transpositions__header-cell"></th>}
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()}
                </tr>
              )}
              {valueType !== "decimalRatio" && filters["decimalRatio"] && (
                <tr>
                  <th className="maqam-transpositions__row-header">{t("maqam.decimalRatio")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.stringLength")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.fretDivision")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.midiNote")}</th>
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
                  <th className="maqam-transpositions__row-header">{t("maqam.frequency")}</th>
                  {pitchClasses.map((pitchClass, i) => (
                    <React.Fragment key={i}>
                      <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchClass.frequency).toFixed(3)}</th>
                      <th className="maqam-transpositions__header-pitchClass"></th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
              <tr>
                <th className="maqam-transpositions__row-header">{t("maqam.play")}</th>
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
                    <th className="maqam-transpositions__row-header">{t("maqam.ajnas")}</th>
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
                              {getDisplayName(jinsTransposition.name, "jins")}
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
                  <th className="maqam-transpositions__row-header">{t("maqam.staffNotation")}</th>
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

    function renderTransposition(maqam: Maqam, index: number) {
      // Compute colSpan to match the table width for this transposition.
      const pitchClassesCount = maqam.ascendingPitchClasses.length + (maqamConfig?.noOctaveMaqam ? 1 : 0);
      const colSpan = 2 + (pitchClassesCount - 1) * 2;

      const isOpen = openTranspositions.includes(maqam.name);

      return (
        <>
          {renderTranspositionRow(maqam, true, index)}

          {/* spacer between ascending and descending sections of the same table - only when open */}
          {isOpen && (
            <tr>
              <td className="maqam-transpositions__spacer-between" colSpan={colSpan} />
            </tr>
          )}

          {renderTranspositionRow(maqam, false, index)}
        </>
      );
    }

    return (
      <div className="maqam-transpositions" key={language}>
        {maqamTranspositions.length > 0 && (
          <>
            <h2 className="maqam-transpositions__title" dir={language === "ar" ? "rtl" : "ltr"}>
              {t("maqam.analysis")}: {`${getDisplayName(selectedMaqamData?.getName() || "", "maqam")}`}
              {!useRatio && (
                <>
                  {" "}
                  / {t("maqam.centsTolerance")}: <input className="maqam-transpositions__input" type="number" value={centsTolerance ?? 0} onChange={(e) => setCentsTolerance(Number(e.target.value))} />
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
                      <span className="tuning-system-manager__filter-label">{t(`maqam.${filterKey}`)}</span>
                    </label>
                  );
                })}
              </span>
            </h2>

            {/* Render all tables (analysis + transpositions) in sorted order */}
            {sortedTables.slice(0, visibleCount).map((tableInfo, displayIndex) => {
              const { maqam, isAnalysis, firstNoteName } = tableInfo;
              const isLastNeededForPrefetch = displayIndex === visibleCount - PREFETCH_OFFSET - 1 && visibleCount < sortedTables.length;
              
              return (
                <React.Fragment key={`${isAnalysis ? 'analysis' : 'transposition'}-${maqam.name}`}>
                  <table 
                    className={`maqam-transpositions__table ${isAnalysis ? 'maqam-transpositions__table--analysis' : 'maqam-transpositions__table--transposition'}`}
                    data-table-type={isAnalysis ? "analysis" : "transposition"}
                    data-maqam-name={maqam.name}
                    data-first-note={firstNoteName}
                    data-transposition-index={displayIndex + 1}
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
                  <div className="maqam-transpositions__spacer-after" aria-hidden="true" />
                </React.Fragment>
              );
            })}
          </>
        )}
        {/* COMMENTS AND SOURCES */}
        {selectedMaqamData && (selectedMaqamData.getCommentsEnglish()?.trim() || selectedMaqamData.getCommentsArabic()?.trim() || selectedMaqamData.getSourcePageReferences()?.length > 0) && (
          <>
            <div className="maqam-transpositions__comments-sources-container">
              {language === "ar" ? (
                <>
                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-transpositions__sources-english">
                      <h3>{t("maqam.sources")}:</h3>
                      <div className="maqam-transpositions__sources-text">
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
                    <div className="maqam-transpositions__comments-arabic">
                      <h3>{t("maqam.comments")}:</h3>
                      <div className="maqam-transpositions__comments-text">{selectedMaqamData.getCommentsArabic()}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {selectedMaqamData.getCommentsEnglish()?.trim() && (
                    <div className="maqam-transpositions__comments-english">
                      <h3>{t("maqam.comments")}:</h3>
                      <div className="maqam-transpositions__comments-text">{selectedMaqamData.getCommentsEnglish()}</div>
                    </div>
                  )}

                  {selectedMaqamData.getSourcePageReferences()?.length > 0 && (
                    <div className="maqam-transpositions__sources-english">
                      <h3>{t("maqam.sources")}:</h3>
                      <div className="maqam-transpositions__sources-text">
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
          <div className="maqam-transpositions__load-more-wrapper">
            <button
              type="button"
              className="maqam-transpositions__button maqam-transpositions__load-more"
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
    toggleTransposition,
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
