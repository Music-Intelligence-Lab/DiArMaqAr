"use client";

import React, { useEffect, useState, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import {
  octaveOneNoteNames,
  octaveTwoNoteNames,
  TransliteratedNoteNameOctaveOne,
  TransliteratedNoteNameOctaveTwo,
  octaveZeroNoteNames,
  octaveFourNoteNames,
  octaveThreeNoteNames,
} from "@/models/NoteName";

import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { abjadNames } from "@/functions/noteNameMappings";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import StaffNotation from "./staff-notation";
import getFirstNoteName from "@/functions/getFirstNoteName";

export default function TuningSystemOctaveTables({ admin }: { admin: boolean }) {
  const { t, getDisplayName, isRTL, language } = useLanguageContext();
  
  const {
    selectedTuningSystem,
    tuningSystemPitchClasses,
    referenceFrequencies,
    setReferenceFrequencies,
    selectedPitchClasses,
    setSelectedPitchClasses,
    selectedIndices,
    setSelectedIndices,
    selectedMaqamData,
    allPitchClasses,
    selectedAbjadNames,
    setSelectedAbjadNames,
    selectedMaqam,
  } = useAppContext();

  const { activePitchClasses, noteOn, noteOff } = useSoundContext();

  const { filters, setFilters } = useFilterContext();

  const [editingCell, setEditingCell] = useState<{
    octave: number;
    index: number;
  } | null>(null);

  const [openedOctaveRows, setOpenedOctaveRows] = useState<{
    0: boolean;
    1: boolean;
    2: boolean;
    3: boolean;
  }>({
    0: false,
    1: true,
    2: true,
    3: false,
  });

  const octaveScrollRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const isSyncingScroll = useRef(false);

  const [cascade, setCascade] = useState(false);

  const tuningSystemPitchClassesArray = tuningSystemPitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
    if (selectedPitchClasses.length === 0) {
      setOpenedOctaveRows({ 0: false, 1: true, 2: true, 3: false });
    } else {
      const rows = { 0: false, 1: false, 2: false, 3: false };
      for (const pitchClass of selectedPitchClasses) {
        if (rows[pitchClass.octave as 0 | 1 | 2 | 3] === false) {
          rows[pitchClass.octave as 0 | 1 | 2 | 3] = true;
        }
      }
      setOpenedOctaveRows(rows);
    }
  }, [selectedPitchClasses]);

  // Ensure current value type is always checked, uncheck value types not in current tuning system
  useEffect(() => {
    if (selectedPitchClasses && selectedPitchClasses.length > 0) {
      const currentValueType = selectedPitchClasses[0].originalValueType;

      // Collect all available value types in current tuning system
      const availableValueTypes = new Set<string>();
      selectedPitchClasses.forEach((pc) => {
        availableValueTypes.add(pc.originalValueType);
      });

      setFilters((prev) => {
        const updated = { ...prev };

        // Uncheck value types that aren't in the current tuning system
        const valueTypeFilters = ['fraction', 'cents', 'decimalRatio', 'stringLength', 'fretDivision'];
        valueTypeFilters.forEach((vt) => {
          if (!availableValueTypes.has(vt)) {
            updated[vt as keyof typeof updated] = false;
          }
        });

        // Always ensure current value type is checked
        updated[currentValueType as keyof typeof updated] = true;
        return updated;
      });
    }
  }, [selectedPitchClasses, setFilters]);

  // Sync horizontal scrolling across all octave tables
  useEffect(() => {
    const syncScroll = (sourceIndex: number) => (event: Event) => {
      if (isSyncingScroll.current) return;

      const sourceContainer = event.target as HTMLDivElement;
      const scrollLeft = sourceContainer.scrollLeft;

      isSyncingScroll.current = true;

      // Sync all other octave containers
      octaveScrollRefs.forEach((ref, index) => {
        if (index !== sourceIndex && ref.current) {
          ref.current.scrollLeft = scrollLeft;
        }
      });

      isSyncingScroll.current = false;
    };

    // Attach scroll listeners to all octave containers
    const listeners: Array<{ element: HTMLDivElement; handler: (event: Event) => void }> = [];

    octaveScrollRefs.forEach((ref, index) => {
      if (ref.current) {
        const handler = syncScroll(index);
        ref.current.addEventListener('scroll', handler);
        listeners.push({ element: ref.current, handler });
      }
    });

    // Cleanup
    return () => {
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener('scroll', handler);
      });
    };
  }, [openedOctaveRows]); // Re-attach when octaves open/close

  function getOctaveNoteName(octave: number, colIndex: number) {
    const idx = selectedIndices[colIndex];
    if (idx < 0) return "none";

    // The length of octaveOneNoteNames. For example, if it's 36,
    // then any idx >= 36 means it's from the "octaveTwoNoteNames" portion.
    const O1_LEN = octaveOneNoteNames.length;

    // Decide whether idx points into octaveOne or octaveTwo
    let localIndex = idx;
    let isFromOctaveOne = true;
    if (idx >= O1_LEN) {
      // It's from the "octaveTwo" segment
      isFromOctaveOne = false;
      localIndex = idx - O1_LEN;
    }

    // Now localIndex is the position within whichever segment
    // (octaveOne or octaveTwo), and we do the same old logic
    // but picking from the correct array depending on isFromOctaveOne.

    if (isFromOctaveOne) {
      // The user originally picked something in the "octaveOne" half
      if (octave === 0 && localIndex < octaveZeroNoteNames.length) {
        return octaveZeroNoteNames[localIndex];
      }
      if (octave === 1 && localIndex < octaveOneNoteNames.length) {
        return octaveOneNoteNames[localIndex];
      }
      if (octave === 2 && localIndex < octaveTwoNoteNames.length) {
        return octaveTwoNoteNames[localIndex];
      }
      if (octave === 3 && localIndex < octaveThreeNoteNames.length) {
        return octaveThreeNoteNames[localIndex];
      }
      return "none";
    } else {
      // The user originally picked something in the "octaveTwo" half
      // so localIndex is an index into the octaveTwoNoteNames array.
      if (octave === 0 && localIndex < octaveZeroNoteNames.length) {
        return octaveOneNoteNames[localIndex];
      }
      if (octave === 1 && localIndex < octaveOneNoteNames.length) {
        return octaveTwoNoteNames[localIndex];
      }
      if (octave === 2 && localIndex < octaveTwoNoteNames.length) {
        return octaveThreeNoteNames[localIndex];
      }
      if (octave === 3 && localIndex < octaveThreeNoteNames.length) {
        return octaveFourNoteNames[localIndex];
      }
      return "none";
    }
  }

  const isCellSelected = (octave: number, colIndex: number) => selectedPitchClasses.some((pitchClasses) => pitchClasses.octave === octave && pitchClasses.pitchClassIndex === colIndex);
  const isCellActive = (octave: number, colIndex: number) => activePitchClasses.some((pitchClasses) => pitchClasses.octave === octave && pitchClasses.pitchClassIndex === colIndex);
  const isCellDescending = (octave: number, colIndex: number) => {
    const pitchClassIndex = octave * tuningSystemPitchClassesArray.length + colIndex;
    
    // Safety check: ensure allPitchClasses exists and has the required index
    if (!allPitchClasses || pitchClassIndex >= allPitchClasses.length || !allPitchClasses[pitchClassIndex]) {
      return false;
    }
    
    const originalValue = allPitchClasses[pitchClassIndex].originalValue;
    return selectedMaqam
      ? selectedMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.originalValue).includes(originalValue)
      : selectedMaqamData
          ?.getTahlil(allPitchClasses)
          .descendingPitchClasses.map((pitchClass) => pitchClass.originalValue)
          .includes(originalValue) ?? false;
  };

  const getCellClassName = (octave: number, colIndex: number) => {
    const isSelected = isCellSelected(octave, colIndex);
    const isActive = isCellActive(octave, colIndex);
    const isDescending = !isSelected && !isActive && isCellDescending(octave, colIndex);

    return `tuning-system-manager__cell ${octave} ${isSelected ? "tuning-system-manager__cell_selected " : ""} ${isActive ? "tuning-system-manager__cell_active " : ""} ${
      isDescending ? "tuning-system-manager__cell_descending " : ""
    }`;
  };

  // Copy octave table to clipboard
  const copyOctaveTableToClipboard = async (octave: number) => {
    if (!selectedTuningSystem || !allPitchClasses) return;

    try {
      // Get pitch classes for this octave
      const octavePitchClasses = allPitchClasses.filter(pc => pc.octave === octave);
      
      if (octavePitchClasses.length === 0) return;

      const valueType = octavePitchClasses[0].originalValueType;

      // Function to build rows for octave table
      const buildOctaveRows = () => {
        const rows: string[][] = [];

        // Pitch Class row (if filter enabled)
        if (filters["pitchClass"]) {
          const pitchClassRow = [t("octave.pitchClass")];
          octavePitchClasses.forEach((pc, index) => {
            pitchClassRow.push(index.toString());
          });
          rows.push(pitchClassRow);
        }

        // Note names row
        const noteNamesRow = [t("octave.noteNames")];
        octavePitchClasses.forEach((pc) => {
          noteNamesRow.push(getDisplayName(pc.noteName, "note"));
        });
        rows.push(noteNamesRow);

        // Abjad names row (if filter enabled)
        if (filters["abjadName"]) {
          const abjadRow = [t("octave.abjadName")];
          octavePitchClasses.forEach((pc) => {
            abjadRow.push(pc.abjadName || "--");
          });
          rows.push(abjadRow);
        }

        // English names row (if filter enabled)
        if (filters["englishName"]) {
          const englishRow = [t("octave.englishName")];
          // Apply sequential naming for the octave pitch classes
          const rendered = renderPitchClassSpellings(octavePitchClasses);
          rendered.forEach((pc) => {
            englishRow.push(pc.englishName);
          });
          rows.push(englishRow);
        }

        // Primary value type row
        const valueRowHeader = valueType === 'fraction' ? 'fractionRatio' : 
                              valueType === 'decimalRatio' ? 'decimalRatio' : 
                              valueType === 'stringLength' ? 'stringLength' : 
                              valueType === 'fretDivision' ? 'fretDivision' : 'cents';
        const valueRow = [t(`octave.${valueRowHeader}`)];
        octavePitchClasses.forEach((pc) => {
          valueRow.push(pc.originalValue);
        });
        rows.push(valueRow);

        // Additional filter rows
        if (valueType !== "fraction" && filters["fraction"]) {
          const fractionRow = [t("octave.fractionRatio")];
          octavePitchClasses.forEach((pc) => {
            fractionRow.push(pc.fraction);
          });
          rows.push(fractionRow);
        }

        if (valueType !== "cents" && filters["cents"]) {
          const centsRow = [t("octave.cents")];
          octavePitchClasses.forEach((pc) => {
            centsRow.push(parseFloat(pc.cents).toFixed(2));
          });
          rows.push(centsRow);
        }

        if (filters["centsDeviation"]) {
          const centsDeviationRow = [t("octave.centsDeviation")];
          // Apply sequential naming for the octave pitch classes
          const rendered = renderPitchClassSpellings(octavePitchClasses);

          rendered.forEach((pc) => {
            const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pc);
            const deviationText = `${referenceNoteWithOctave}${pc.centsDeviation > 0 ? ' +' : ' '}${pc.centsDeviation.toFixed(2)}`;
            centsDeviationRow.push(deviationText);
          });
          rows.push(centsDeviationRow);
        }

        if (valueType !== "decimalRatio" && filters["decimalRatio"]) {
          const decimalRow = [t("octave.decimalRatio")];
          octavePitchClasses.forEach((pc) => {
            decimalRow.push(parseFloat(pc.decimalRatio).toFixed(2));
          });
          rows.push(decimalRow);
        }

        if (valueType !== "stringLength" && filters["stringLength"]) {
          const stringLengthRow = [t("octave.stringLength")];
          octavePitchClasses.forEach((pc) => {
            stringLengthRow.push(parseFloat(pc.stringLength).toFixed(2));
          });
          rows.push(stringLengthRow);
        }

        if (valueType !== "fretDivision" && filters["fretDivision"]) {
          const fretDivisionRow = [t("octave.fretDivision")];
          octavePitchClasses.forEach((pc) => {
            fretDivisionRow.push(parseFloat(pc.fretDivision).toFixed(2));
          });
          rows.push(fretDivisionRow);
        }

        if (filters["midiNote"]) {
          const midiRow = [t("octave.midiNote")];
          octavePitchClasses.forEach((pc) => {
            midiRow.push(pc.midiNoteDecimal.toFixed(2));
          });
          rows.push(midiRow);
        }

        if (filters["midiNoteDeviation"]) {
          const midiDeviationRow = [t("octave.midiNoteDeviation")];
          // Apply sequential naming for the octave pitch classes
          const rendered = renderPitchClassSpellings(octavePitchClasses);

          rendered.forEach((pc) => {
            const referenceMidiNote = calculateIpnReferenceMidiNote(pc);
            const deviationText = `${referenceMidiNote} ${pc.centsDeviation > 0 ? '+' : ''}${pc.centsDeviation.toFixed(2)}`;
            midiDeviationRow.push(deviationText);
          });
          rows.push(midiDeviationRow);
        }

        if (filters["frequency"]) {
          const frequencyRow = [t("octave.frequency")];
          octavePitchClasses.forEach((pc) => {
            frequencyRow.push(parseFloat(pc.frequency).toFixed(2));
          });
          rows.push(frequencyRow);
        }

        return rows;
      };

      // Build complete table
      const allRows: string[][] = [];
      
      const octaveRows = buildOctaveRows();
      allRows.push(...octaveRows);

      // Convert to multiple formats for universal compatibility
      // Create both TSV (for spreadsheets) and HTML (for documents)
      
      // Get max columns from data rows
      const maxCols = Math.max(...allRows.filter(r => r.length > 1).map(r => r.length));
      
      // Start with octave title as a heading
      const startingNote = getFirstNoteName(selectedIndices);
      const creator = language === 'ar' ? selectedTuningSystem.getCreatorArabic() : selectedTuningSystem.getCreatorEnglish();
      const title = language === 'ar' ? selectedTuningSystem.getTitleArabic() : selectedTuningSystem.getTitleEnglish();
      const tuningSystemTitle = `${creator} (${selectedTuningSystem.getYear()}) ${title} [${getDisplayName(startingNote, "note")}]`;
      const octaveTitle = `${tuningSystemTitle} - ${t("octave.title")} ${octave}`;
      
      // Build TSV format for spreadsheets
      let tsvText = `${octaveTitle}\n\n`;
      
      // Build HTML format for documents
      let htmlText = `<h3>${octaveTitle}</h3><table border="1" cellpadding="4" cellspacing="0"><tbody>`;
      
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
  };

  const handleCheckboxChange = (octave: number, colIndex: number, checked: boolean) => {
    setSelectedPitchClasses((prevCells) => {
      const newCells = prevCells.filter((pitchClass) => !(pitchClass.octave === octave && pitchClass.pitchClassIndex === colIndex));
      if (checked && allPitchClasses) {
        const existingCell = allPitchClasses.find((pitchClass) => pitchClass.octave === octave && pitchClass.pitchClassIndex === colIndex);
        if (existingCell) newCells.push(existingCell);
      }
      newCells.sort((a, b) => (a.octave === b.octave ? a.pitchClassIndex - b.pitchClassIndex : a.octave - b.octave));
      return newCells;
    });
  };

  // ----------------------------------------------------------------------------------
  // 4-Octave Note Name Grid
  // We store only the “first” octave’s selection in selectedIndices[].
  // The other octaves (0, 2, 3) are derived by the same index if not -1.
  // We also want “cascading” so that if the user picks a note for col i, col i+1 gets auto-filled.
  // If the user picks something in an *upper/lower* octave, we find its index in that octave’s array
  // and update the “first-octave” index accordingly, maintaining sync.
  // ----------------------------------------------------------------------------------

  const numberOfPitchClasses = tuningSystemPitchClassesArray.length;

  function handleAbjadSelect(colIndex: number, newValue: string, octave: number) {
    setSelectedAbjadNames((prev) => {
      const copy = [...prev];
      const rowOffset = octave === 1 ? 0 : numberOfPitchClasses;
      const baseIdx = rowOffset + colIndex;

      copy[baseIdx] = newValue;

      if (cascade) {
        const allNames = abjadNames;
        const startPos = allNames.indexOf(newValue);
        if (startPos >= 0) {
          for (let c = colIndex + 1; c < numberOfPitchClasses; c++) {
            copy[rowOffset + c] = allNames[startPos + (c - colIndex)] ?? "";
          }
        }
      }
      return copy;
    });
  }

  // If user changes a note in a certain octave, find that note's index in that octave’s array, update the “first-octave” index.
  function handleSelectOctaveNote(colIndex: number, chosenName: string) {
    setSelectedIndices((old) => {
      const newArr = [...old];

      // 1) If user picked '(none)', just set -1 in this column:
      if (chosenName === "none") {
        newArr[colIndex] = -1;
        return newArr;
      }

      const noteNames = selectedTuningSystem?.getNoteNameSets() || [[]];

      // 2) If this is the *first column*, try to see if there's an existing config
      //    whose FIRST note is chosenName. If yes, we load that config in full.
      if (colIndex === 0) {
        const existingConfig = noteNames.find((config) => config[0] === chosenName);
        if (existingConfig) {
          // Convert each note in existingConfig to its *combined* index:
          const newMapping = existingConfig.map((arabicName) => {
            // See if arabicName is in octaveOne or octaveTwo:
            const idxInOct1 = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
            if (idxInOct1 >= 0) {
              return idxInOct1;
            } else {
              const idxInOct2 = octaveTwoNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveTwo);
              if (idxInOct2 >= 0) {
                // Offset by length of octaveOne array to point into octaveTwo portion
                return octaveOneNoteNames.length + idxInOct2;
              } else {
                return -1;
              }
            }
          });

          // Make sure newMapping matches current length:
          while (newMapping.length < old.length) {
            newMapping.push(-1);
          }
          if (newMapping.length > old.length) {
            newMapping.length = old.length;
          }
          return newMapping;
        }
      }

      // 3) Otherwise, we directly find chosenName in either octaveOne or octaveTwo
      let foundIndex = -1;
      const idxInOct1 = octaveOneNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveOne);
      if (idxInOct1 >= 0) {
        foundIndex = idxInOct1;
      } else {
        const idxInOct2 = octaveTwoNoteNames.indexOf(chosenName as TransliteratedNoteNameOctaveTwo);
        if (idxInOct2 >= 0) {
          // Offset by the size of the first array
          foundIndex = octaveOneNoteNames.length + idxInOct2;
        }
      }

      if (foundIndex === -1) {
        // Not found in either array => treat as none
        newArr[colIndex] = -1;
        return newArr;
      }

      // 4) Put foundIndex into the chosen column
      newArr[colIndex] = foundIndex;

      // 5) Cascade fill for columns to the right
      if (cascade) {
        const totalRow1Length = octaveOneNoteNames.length + octaveTwoNoteNames.length;
        for (let c = colIndex + 1; c < newArr.length; c++) {
          const offset = c - colIndex; // increment for each column
          const nextVal = foundIndex + offset;
          if (nextVal >= totalRow1Length) {
            newArr[c] = -1; // or leave as -1 if out-of-bounds
          } else {
            newArr[c] = nextVal;
          }
        }
      }

      return newArr;
    });
  }

  // figure out what the input type is (fraction, cents, decimal, stringLength, or unknown)
  const pitchClassType = detectPitchClassValueType(tuningSystemPitchClassesArray);

  // MARK: Octave Rows

  const getOctavePitchClasses = (octave: number) => {
    if (!allPitchClasses || allPitchClasses.length === 0) return [];
    if (allPitchClasses.length % numberOfPitchClasses !== 0) throw new Error("All pitchClasses must be evenly divisible by the number of pitch classes.");
    return allPitchClasses.slice(octave * numberOfPitchClasses, (octave + 1) * numberOfPitchClasses);
  };

  const displayStringValue = (value: string | number, decimal = 2) => {
    if (typeof value === "number") return value.toFixed(decimal);
    else if (value.includes("/")) return value;
    else return parseFloat(value).toFixed(decimal);
  };

  /**
   * Render a single octave's table, with each column showing:
   *  1) pitch class index
   *  2) note name select
   *  3) abjad select
   *  4) english note name
   *  5) fraction
   *  6) decimal
   *  7) cents
   *  8) string length
   *  9) frequency
   *  10) "Play" button + checkbox
   */

  function renderOctave(octave: number) {
    if (!tuningSystemPitchClassesArray.length) return null;

    const rowCells = getOctavePitchClasses(octave);

    return (
      <details 
        className="tuning-system-manager__octave-details" 
        open={openedOctaveRows[octave as 0 | 1 | 2 | 3]}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open;
          setOpenedOctaveRows((rows) => ({
            ...rows,
            [octave]: isOpen,
          }));
        }}
      >
        <summary
          className="tuning-system-manager__octave-summary"
          /*  onClick={(e) => {
            e.preventDefault();
             setOpenedOctaveRows((rows) => ({
              ...rows,
              [octave]: !rows[octave as 0 | 1 | 2 | 3],
            }));
          }} */
        >
          <span
            className="tuning-system-manager__octave-summary-title"
            onClick={(e) => {
              e.preventDefault();
              
              // Toggle the octave row
              setOpenedOctaveRows((rows) => {
                const newRows = {
                  ...rows,
                  [octave]: !rows[octave as 0 | 1 | 2 | 3],
                };
                
                return newRows;
              });
            }}
          >
            {t('octave.title')} {octave}{" "}
          </span>
          {admin && ((octave === 1 && openedOctaveRows[1]) || (octave === 2 && openedOctaveRows[2])) && (
            <button
              className="tuning-system-manager__octave-cascade-button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setCascade((c) => !c);
              }}
            >
              {cascade ? t('octave.cascadeEnabled') : t('octave.cascadeDisabled')}
            </button>
          )}
          {octave === 1 && openedOctaveRows[1] && (
            <span className="tuning-system-manager__filter-menu">
              {/* Filter order matches table row appearance order */}
              {[
                "pitchClass",
                "abjadName",
                "englishName",
                "fraction",
                "cents",
                "centsDeviation",
                "decimalRatio",
                "stringLength",
                "fretDivision",
                "midiNote",
                "midiNoteDeviation",
                "frequency",
                "staffNotation",
              ].map((filterKey) => {
                const valueType = allPitchClasses && allPitchClasses.length > 0 ? allPitchClasses[0].originalValueType : null;
                const isDisabled =
                  (filterKey === "fraction" && pitchClassType === "fraction") ||
                  (filterKey === "cents" && pitchClassType === "cents") ||
                  (filterKey === "decimalRatio" && pitchClassType === "decimalRatio") ||
                  (filterKey === "stringLength" && pitchClassType === "stringLength") ||
                  (filterKey === "fretDivision" && pitchClassType === "fretDivision") ||
                  (filterKey === "centsFromZero" && pitchClassType === "cents");

                if (isDisabled) return null;

                // Hide centsFromZero filters from tuning system octave tables
                if (filterKey === 'centsFromZero') return null;

                const filterElement = (
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
                      {t(`filter.${filterKey}`)}
                    </span>
                  </label>
                );

                // Add original value type checkbox after englishName
                if (filterKey === "englishName" && pitchClassType && pitchClassType !== "unknown") {
                  return (
                    <React.Fragment key={`englishName-with-valuetype`}>
                      {filterElement}
                      <label
                        key={`originalValue-${pitchClassType}`}
                        htmlFor={`filter-${pitchClassType}`}
                        className={`tuning-system-manager__filter-item ${filters[pitchClassType as keyof typeof filters] ? "tuning-system-manager__filter-item_active" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          id={`filter-${pitchClassType}`}
                          type="checkbox"
                          className="tuning-system-manager__filter-checkbox"
                          checked={filters[pitchClassType as keyof typeof filters]}
                          onChange={(e) => {
                            e.stopPropagation();
                            setFilters((prev) => ({
                              ...prev,
                              [pitchClassType as keyof typeof filters]: e.target.checked,
                            }));
                          }}
                        />
                        <span className="tuning-system-manager__filter-label">
                          {t(`filter.${pitchClassType}`)}
                        </span>
                      </label>
                    </React.Fragment>
                  );
                }

                return filterElement;
              })}
            </span>
          )}

          {openedOctaveRows[octave as 0 | 1 | 2 | 3] && (
            <button
              className="tuning-system-manager__octave-copy-button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                copyOctaveTableToClipboard(octave);
              }}
              title="Copy table to clipboard (Excel format)"
            >
              <ContentCopyIcon className="tuning-system-manager__copy-icon" />
              {t("octave.copyTable")}
            </button>
          )}

          <div className="tuning-system-manager__octave-summary-content"></div>
        </summary>

        <div className="tuning-system-manager__octaves-carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const container = octaveScrollRefs[octave as 0 | 1 | 2 | 3].current;
              if (container) container.scrollBy({ left: isRTL ? 635 : -635 });
            }}
          >
            ‹
          </button>
          <div className="tuning-system-manager__octave-scroll" ref={octaveScrollRefs[octave as 0 | 1 | 2 | 3]}>
            <table className="tuning-system-manager__octave-table" border={0}>
              {(() => {
                // first column is the row header (fixed), remaining columns match pitch class count
                const totalCols = 1 + tuningSystemPitchClassesArray.length;
                const cols: React.ReactElement[] = [];
                cols.push(
                  <col
                    key={`oct-col-0-${octave}`}
                    style={{ minWidth: "110px", maxWidth: "110px", width: "110px" }}
                  />
                );
                for (let i = 1; i < totalCols; i++) {
                  cols.push(<col key={`oct-col-${i}-${octave}`} style={{ minWidth: "60px" }} />);
                }
                return <colgroup>{cols}</colgroup>;
              })()}

              <tbody>
                {/* Row 1: Pitch Class */}
                {filters.pitchClass && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.pitchClass')}</td>
                    {tuningSystemPitchClassesArray.map((_, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {colIndex}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 2: Note Name */}
                <tr
                  style={{
                    minHeight: "50px",
                    maxHeight: "50px",
                    height: "50px",
                  }}
                >
                  <td className="tuning-system-manager__row-header">{t('octave.noteNames')}</td>
                  {rowCells.map((pitchClass, colIndex) => {
                    if (octave === 1 && admin) {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          <select className="tuning-system-manager__select-note" value={getOctaveNoteName(octave, colIndex) ?? ""} onChange={(e) => handleSelectOctaveNote(colIndex, e.target.value)}>
                            <option value="none">{t('octave.none')}</option>
                            {octaveOneNoteNames.map((nm) => (
                              <option key={nm} value={nm}>
                                {getDisplayName(nm, 'note')}
                              </option>
                            ))}
                            {colIndex !== 0 && (
                              <>
                                <option value="none">---</option>
                                {octaveTwoNoteNames.map((nm) => (
                                  <option key={nm} value={nm}>
                                    {getDisplayName(nm, 'note')}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </td>
                      );
                    } else {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          {pitchClass.noteName === "none" ? t('octave.none') : getDisplayName(pitchClass.noteName, 'note')}
                        </td>
                      );
                    }
                  })}
                </tr>
                {/* Row 3: Abjad Name */}
                {filters.abjadName && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.abjadName')}</td>
                    {tuningSystemPitchClassesArray.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className={`
            ${getCellClassName(octave, colIndex)}
            ${!(octave === 1 || octave === 2) ? "tuning-system-manager__abjad-name" : ""}
          `}
                      >
                        {admin && (octave === 1 || octave === 2) ? (
                          <select
                            className="tuning-system-manager__select-abjad"
                            value={selectedAbjadNames[colIndex + (octave === 1 ? 0 : numberOfPitchClasses)] || ""}
                            onChange={(e) => handleAbjadSelect(colIndex, e.target.value, octave)}
                          >
                            <option value="">--</option>
                            {abjadNames.map((name, idx) => (
                              <option key={`${name}-${idx}`} value={name}>
                                {name.replace(/\//g, "/\u200B")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="tuning-system-manager__abjad-name">{(selectedAbjadNames[colIndex + (octave <= 1 ? 0 : numberOfPitchClasses)] || "--").replace(/\//g, "/\u200B")}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 4: English Name */}
                {filters.englishName && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.englishName')}</td>
                    {(() => {
                      // Build preferred mapping from current context (maqam/jins/selection)
                      const preferredMap: Record<string, string> = {};
                      const contextSeq = 
                        (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
                        (selectedPitchClasses && selectedPitchClasses.length >= 2 ? selectedPitchClasses : undefined);

                      if (contextSeq) {
                        // Apply sequential naming for melodic sequences
                        const renderedSeq = renderPitchClassSpellings(contextSeq);
                        renderedSeq.forEach((pc) => {
                          preferredMap[pc.noteName] = pc.englishName;
                        });
                      }

                      const displays = rowCells.map((pc) => {
                        const noteName = pc.noteName;
                        return preferredMap[noteName] || getEnglishNoteName(noteName);
                      });

                      return displays.map((d, colIndex) => (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          {d}
                        </td>
                      ));
                    })()}
                  </tr>
                )}

                {pitchClassType !== "unknown" && filters[pitchClassType as keyof typeof filters] && (
                  <tr className="tuning-system-manager__octave-table__detectedPitchClassType">
                    <td className="tuning-system-manager__row-header">
                      {t(`octave.${pitchClassType === 'fraction' ? 'fractionRatio' : 
                           pitchClassType === 'decimalRatio' ? 'decimalRatio' : 
                           pitchClassType === 'stringLength' ? 'stringLength' : 
                           pitchClassType === 'fretDivision' ? 'fretDivision' : 'cents'}`)}
                    </td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.originalValue)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 5: Cents (¢) */}
                {filters.cents && pitchClassType !== "cents" && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.cents')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.cents)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 5.5: Cents +/- 12-EDO */}
                {filters.centsDeviation && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.centsDeviation')}</td>
                    {rowCells.map((pitchClass, colIndex) => {
                      const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pitchClass);

                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          <span>{referenceNoteWithOctave}</span>
                          {pitchClass.centsDeviation > 0 ? ' +' : ' '}{pitchClass.centsDeviation.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Row 6: Fraction Ratio */}
                {filters.fraction && pitchClassType !== "fraction" && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.fractionRatio')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.fraction)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 7: String Length */}
                {filters.stringLength && pitchClassType !== "stringLength" && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.stringLength')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.stringLength)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 7.5: Fret Division */}
                {filters.fretDivision && pitchClassType !== "fretDivision" && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.fretDivision')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.fretDivision)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 8: Decimal Ratio */}
                {filters.decimalRatio && pitchClassType !== "decimalRatio" && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.decimalRatio')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.decimalRatio)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 9: Midi Note */}
                {filters.midiNote && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.midiNote')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayStringValue(pitchClass.midiNoteDecimal)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 9.5: MIDI Note Deviation */}
                {filters.midiNoteDeviation && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.midiNoteDeviation')}</td>
                    {(() => {
                      // Build preferred mapping from current context (maqam/jins/selection)
                      const preferredMap: Record<string, string> = {};
                      const contextSeq = 
                        (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
                        (selectedPitchClasses && selectedPitchClasses.length >= 2 ? selectedPitchClasses : undefined);

                      if (contextSeq) {
                        // Apply sequential naming for melodic sequences
                        const renderedSeq = renderPitchClassSpellings(contextSeq);
                        renderedSeq.forEach((pc) => {
                          preferredMap[pc.noteName] = pc.englishName;
                        });
                      }

                      return rowCells.map((pitchClass, colIndex) => {
                        // Create pitch class with appropriate reference note name
                        const pcWithRef = { ...pitchClass };
                        if (preferredMap[pitchClass.noteName]) {
                          pcWithRef.referenceNoteName = preferredMap[pitchClass.noteName].replace(/[+-]/g, '');
                        }

                        const referenceMidiNote = calculateIpnReferenceMidiNote(pcWithRef);

                        return (
                          <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                            {referenceMidiNote} {pitchClass.centsDeviation > 0 ? '+' : ''}{pitchClass.centsDeviation.toFixed(2)}
                          </td>
                        );
                      });
                    })()}
                  </tr>
                )}

                {/* Row 10: Freq (Hz) */}
                {filters.frequency && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.frequency')}</td>
                    {rowCells.map((pitchClass, colIndex) => {
                      const isEditing = editingCell?.octave === octave && editingCell.index === colIndex;
                      return (
                        <td
                          key={colIndex}
                          className={getCellClassName(octave, colIndex) + " " + (isEditing ? "tuning-system-manager__cell_editing " : "")}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (referenceFrequencies[getFirstNoteName(selectedIndices)]) setEditingCell({ octave, index: colIndex });
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              defaultValue={pitchClass.frequency}
                              autoFocus
                              className="tuning-system-manager__freq-input"
                              onBlur={(e) => {
                                const newFrequency = parseFloat(e.currentTarget.value);
                                const cents = pitchClass.cents;
                                const centsValue = parseFloat(cents);
                                const newStartingFrequency = newFrequency / Math.pow(2, centsValue / 1200);
                                const startingNote = getFirstNoteName(selectedIndices);
                                setReferenceFrequencies((prev) => ({
                                  ...prev,
                                  [startingNote]: newStartingFrequency,
                                }));
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                            />
                          ) : (
                            displayStringValue(pitchClass.frequency)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Row 11: Play */}
                <tr>
                  <td className="tuning-system-manager__row-header">{t('octave.play')}</td>
                  {rowCells.map((pitchClass, colIndex) => (
                    <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                      <PlayCircleIcon className="tuning-system-manager__play-circle-icon" onMouseUp={() => noteOff(pitchClass)} onMouseDown={() => noteOn(pitchClass)} />
                    </td>
                  ))}
                </tr>

                {/* Row 12: Select (checkbox) */}
                <tr>
                  <td className="tuning-system-manager__row-header">{t('octave.select')}</td>
                  {tuningSystemPitchClassesArray.map((_, colIndex) => (
                    <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                      <input
                        type="checkbox"
                        className="tuning-system-manager__checkbox"
                        checked={isCellSelected(octave, colIndex)}
                        onChange={(e) => handleCheckboxChange(octave, colIndex, e.target.checked)}
                        onClick={(e) => (e.currentTarget as HTMLInputElement).blur()}
                      />
                    </td>
                  ))}
                </tr>

                {/* Row 13: Staff Notation */}
                {filters.staffNotation && (
                  <tr>
                    <td className="tuning-system-manager__row-header">{t('octave.staffNotation')}</td>
                    <td colSpan={tuningSystemPitchClassesArray.length} className="staff-notation-cell">
                      <StaffNotation pitchClasses={rowCells} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const container = octaveScrollRefs[octave as 0 | 1 | 2 | 3].current;
              if (container) container.scrollBy({ left: isRTL ? -635 : 635 });
            }}
          >
            ›
          </button>
        </div>
      </details>
    );
  }

  // Don't render if no tuning system is selected to prevent errors
  if (!selectedTuningSystem || !allPitchClasses || allPitchClasses.length === 0) {
    return null;
  }

  return (
    <div className="tuning-system-manager__grid-wrapper">
      <div className="tuning-system-manager__grid">
        {renderOctave(0)}
        {renderOctave(1)}
        {renderOctave(2)}
        {renderOctave(3)}
      </div>
    </div>
  );
}
