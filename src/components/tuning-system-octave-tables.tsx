"use client";

import React, { useEffect, useState, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import NoteName, {
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
import { getEnglishNoteName, getSolfegeFromEnglishName } from "@/functions/noteNameMappings";
import PitchClass from "@/models/PitchClass";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import StaffNotation from "./staff-notation";
import getFirstNoteName from "@/functions/getFirstNoteName";
import noteNameWithBreaks from "@/functions/noteNameWithBreaks";
import { arrayIndexOf, isExactOctave, octaveCells } from "@/functions/octaveLayout";
import { StorableOctave } from "@/models/TuningSystem";

/**
 * How far one chevron press travels: a viewport, less one column so a
 * landmark survives the jump. The column width is measured off the table
 * rather than mirrored from the stylesheet, and the floor keeps the press
 * meaningful on a narrow container.
 */
function octaveScrollStep(container: HTMLDivElement): number {
  const dataCell = container.querySelector<HTMLElement>("tbody td + td");
  const columnWidth = dataCell?.offsetWidth ?? 0;
  return Math.max(container.clientWidth - columnWidth, container.clientWidth * 0.5);
}

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
    storedOctaves,
    setStoredOctaveNoteNames,
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

  // Which cells are selected, by position. The open octaves follow a change of
  // selection only: naming a note rebuilds the pitch classes (a new array with
  // the same cells selected), and that must not close the octave being named.
  const selectionKey = selectedPitchClasses.map((pc) => `${pc.octave}:${pc.pitchClassIndex}`).join(",");
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
  }, [selectionKey]);

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

      // Release only AFTER those assignments have dispatched their own scroll
      // events. Scroll events are delivered asynchronously, so clearing the
      // flag synchronously here left it guarding nothing: every mirrored
      // container echoed back and wrote scrollLeft onto the source, which
      // cancels an in-flight smooth scroll each frame — the chevrons appeared
      // to barely move because their animation was being killed on arrival.
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
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
    // Safety check: ensure allPitchClasses exists and has the required cell
    const pitchClassIndex = allPitchClasses ? arrayIndexOf(allPitchClasses, octave, colIndex) : -1;
    if (pitchClassIndex === -1) {
      return false;
    }
    
    const originalValue = allPitchClasses[pitchClassIndex].originalValue;
    return selectedMaqam
      ? selectedMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.originalValue).includes(originalValue)
      : selectedMaqamData
          ?.getBaseForm(allPitchClasses)
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
          octavePitchClasses.forEach((pc) => {
            englishRow.push(displayEnglishName(pc));
          });
          rows.push(englishRow);
        }

        // Solfege row (if filter enabled)
        if (filters["solfege"]) {
          const solfegeRow = [t("octave.solfege")];
          octavePitchClasses.forEach((pc) => {
            solfegeRow.push(getSolfegeFromEnglishName(displayEnglishName(pc)));
          });
          rows.push(solfegeRow);
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
      if (typeof ClipboardItem !== 'undefined') {
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([tsvText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        throw new Error('ClipboardItem is not supported in this browser');
      }
      
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

  /**
   * Where a cell's abjad name sits in the abjad list, which holds octave 1's names
   * then octave 2's (octave 2 may have its own count; see StoredOctaves). Octave 0
   * reads octave 1's names and octave 3 octave 2's, as the generator does, unless
   * that octave is stored: a stored octave 0 or 3 has no abjad names (-1).
   */
  const octaveCount = (octave: number) => (allPitchClasses ? octaveCells(allPitchClasses, octave).length : 0);
  function abjadIndex(octave: number, colIndex: number): number {
    if ((octave === 0 || octave === 3) && isStoredOctave(octave)) return -1;
    return octave <= 1 ? colIndex : numberOfPitchClasses + colIndex;
  }

  function handleAbjadSelect(colIndex: number, newValue: string, octave: number) {
    setSelectedAbjadNames((prev) => {
      const copy = [...prev];
      copy[abjadIndex(octave, colIndex)] = newValue;

      if (cascade) {
        const allNames = abjadNames;
        const startPos = allNames.indexOf(newValue);
        if (startPos >= 0) {
          for (let c = colIndex + 1; c < octaveCount(octave); c++) {
            copy[abjadIndex(octave, c)] = allNames[startPos + (c - colIndex)] ?? "";
          }
        }
      }
      return copy;
    });
  }

  // ----------------------------------------------------------------------------------
  // Stored octaves (see StoredOctaves): an octave the source gives as its own list
  // is named cell by cell, per note-name set, rather than derived from octave 1.
  // ----------------------------------------------------------------------------------

  const startingNote = getFirstNoteName(selectedIndices);
  const isStoredOctave = (octave: number) =>
    octave !== 1 && !!storedOctaves?.pitchClassValues[octave as StorableOctave] && startingNote !== "none";

  /** The names a stored octave's cells can take: its own register and the one above (as octave 1's select offers octave one and two). */
  const storedOctaveNameOptions = (octave: StorableOctave): NoteName[][] => {
    const registers = [octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames];
    return [registers[octave] as readonly string[] as NoteName[], registers[octave + 1] as readonly string[] as NoteName[]];
  };

  function handleSelectStoredOctaveNote(octave: StorableOctave, colIndex: number, chosenName: NoteName) {
    if (!storedOctaves || startingNote === "none") return;
    const names = [...(storedOctaves.noteNames[startingNote]?.[octave] ?? storedOctaves.pitchClassValues[octave]!.map(() => "none" as NoteName))];
    names[colIndex] = chosenName;

    // Cascade: the following cells take the following names, in the select's order
    if (cascade && chosenName !== "none") {
      const order = storedOctaveNameOptions(octave).flat();
      const start = order.indexOf(chosenName);
      for (let c = colIndex + 1; c < names.length; c++) {
        names[c] = order[start + (c - colIndex)] ?? "none";
      }
    }
    setStoredOctaveNoteNames(startingNote, octave, names);
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
    // Octaves can differ in length when the source gives them (see StoredOctaves)
    return octaveCells(allPitchClasses, octave);
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

  // Maqām-context spellings, keyed by note name: the selected maqām's ascending
  // sequence, else a selection of two or more pitch classes. Notes outside that
  // context keep their tuning-system spelling. Every display row and the staff use
  // this one source so they always agree.
  const contextEnglishNames: Record<string, string> = {};
  const contextSeq =
    (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
    (selectedPitchClasses && selectedPitchClasses.length >= 2 ? selectedPitchClasses : undefined);
  if (contextSeq) {
    renderPitchClassSpellings(contextSeq).forEach((pc) => {
      contextEnglishNames[pc.noteName] = pc.englishName;
    });
  }
  const displayEnglishName = (pc: PitchClass) => contextEnglishNames[pc.noteName] || getEnglishNoteName(pc.noteName);

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
          onClick={(e) => {
            // Only the title toggles the row; suppress the native
            // click-anywhere-on-summary behavior everywhere else.
            e.preventDefault();
          }}
        >
          <span
            className="tuning-system-manager__octave-summary-title"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

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
            {t('octave.title')} {octave}
            {/* Each octave's own count: a stored octave can differ from octave 1 */}
            {"  ·  "}
            {t("octave.noteCount").replace("{count}", String(rowCells.length))}{" "}
          </span>
          {admin && openedOctaveRows[octave as 0 | 1 | 2 | 3] && (octave === 1 || octave === 2 || isStoredOctave(octave)) && (
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
                "solfege",
                "fraction",
                "cents",
                "frequency",
                "centsDeviation",
                "decimalRatio",
                "stringLength",
                "fretDivision",
                "midiNote",
                "midiNoteDeviation",
                "staffNotation",
              ].map((filterKey) => {
                const isDisabled =
                  (filterKey === "fraction" && pitchClassType === "fraction") ||
                  (filterKey === "cents" && pitchClassType === "cents") ||
                  (filterKey === "decimalRatio" && pitchClassType === "decimalRatio") ||
                  (filterKey === "stringLength" && pitchClassType === "stringLength") ||
                  (filterKey === "fretDivision" && pitchClassType === "fretDivision");

                if (isDisabled) return null;

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

                // Add original value type checkbox after solfege (matching table row order)
                if (filterKey === "solfege" && pitchClassType && pitchClassType !== "unknown") {
                  return (
                    <React.Fragment key={`solfege-with-valuetype`}>
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

        {/* What the two marks on the source-value row mean */}
        {pitchClassType !== "unknown" && filters[pitchClassType as keyof typeof filters] && (
          <div className="tuning-system-manager__legend">
            <p className="tuning-system-manager__legend-item tuning-system-manager__legend-item_source-values">{t("octave.sourceValuesLegend")}</p>
            {rowCells.some((cell) => !isExactOctave(allPitchClasses, cell)) && (
              <p className="tuning-system-manager__legend-item tuning-system-manager__legend-item_not-exact-octave">{t("octave.notExactOctaveLegend")}</p>
            )}
          </div>
        )}

        <div className="tuning-system-manager__octaves-carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const container = octaveScrollRefs[octave as 0 | 1 | 2 | 3].current;
              // One viewport per press, less a column of overlap so the reader
              // keeps a landmark. Derived from the container, not a magic 635.
              if (container) container.scrollBy({ left: (isRTL ? 1 : -1) * octaveScrollStep(container), behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="tuning-system-manager__octave-scroll" ref={octaveScrollRefs[octave as 0 | 1 | 2 | 3]}>
            <table className="tuning-system-manager__octave-table" border={0}>
              {(() => {
                // first column is the row header (fixed), remaining columns match pitch class count
                const totalCols = 1 + rowCells.length;
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
                {/* Row 1: Note Name — the column's identity leads, and the
                    pitch-class index follows as its coordinate */}
                <tr
                  data-row-type="noteNames"
                  style={{
                    minHeight: "50px",
                    maxHeight: "50px",
                    height: "50px",
                  }}
                >
                  <td className="tuning-system-manager__row-header">{t('octave.noteNames')}</td>
                  {rowCells.map((pitchClass, colIndex) => {
                    if (admin && isStoredOctave(octave)) {
                      return (
                        <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                          <select
                            className="tuning-system-manager__select-note"
                            value={pitchClass.noteName}
                            onChange={(e) => handleSelectStoredOctaveNote(octave as StorableOctave, colIndex, e.target.value as NoteName)}
                          >
                            <option value="none">{t('octave.none')}</option>
                            {storedOctaveNameOptions(octave as StorableOctave).map((group, groupIndex) => (
                              <React.Fragment key={groupIndex}>
                                {groupIndex > 0 && <option disabled value="">---</option>}
                                {group.map((nm) => (
                                  <option key={nm} value={nm}>
                                    {getDisplayName(nm, 'note')}
                                  </option>
                                ))}
                              </React.Fragment>
                            ))}
                          </select>
                        </td>
                      );
                    }
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
                          {pitchClass.noteName === "none" ? t('octave.none') : noteNameWithBreaks(getDisplayName(pitchClass.noteName, 'note'))}
                        </td>
                      );
                    }
                  })}
                </tr>
                {/* Row 2: Pitch Class */}
                {filters.pitchClass && (
                  <tr data-row-type="pitchClass">
                    <td className="tuning-system-manager__row-header">{t('octave.pitchClass')}</td>
                    {rowCells.map((_, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {colIndex}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 3: Abjad Name */}
                {filters.abjadName && (
                  <tr data-row-type="abjadName">
                    <td className="tuning-system-manager__row-header">{t('octave.abjadName')}</td>
                    {rowCells.map((_, colIndex) => (
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
                            value={selectedAbjadNames[abjadIndex(octave, colIndex)] || ""}
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
                          <span className="tuning-system-manager__abjad-name">{((abjadIndex(octave, colIndex) === -1 ? "" : selectedAbjadNames[abjadIndex(octave, colIndex)]) || "--").replace(/\//g, "/\u200B")}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Row 4: English Name */}
                {filters.englishName && (
                  <tr data-row-type="englishName">
                    <td className="tuning-system-manager__row-header">{t('octave.englishName')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {displayEnglishName(pitchClass)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row: Solfege */}
                {filters.solfege && (
                  <tr data-row-type="solfege">
                    <td className="tuning-system-manager__row-header">{t('octave.solfege')}</td>
                    {rowCells.map((pitchClass, colIndex) => (
                      <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                        {getSolfegeFromEnglishName(displayEnglishName(pitchClass))}
                      </td>
                    ))}
                  </tr>
                )}

                {pitchClassType !== "unknown" && filters[pitchClassType as keyof typeof filters] && (
                  <tr
                    className="tuning-system-manager__octave-table__detectedPitchClassType"
                    data-row-type={pitchClassType === 'fraction' ? 'fractionRatio' : pitchClassType}
                  >
                    <td className="tuning-system-manager__row-header">
                      {t(`octave.${pitchClassType === 'fraction' ? 'fractionRatio' :
                           pitchClassType === 'decimalRatio' ? 'decimalRatio' :
                           pitchClassType === 'stringLength' ? 'stringLength' :
                           pitchClassType === 'fretDivision' ? 'fretDivision' : 'cents'}`)}
                    </td>
                    {/* The source's own value carries the mark: whether it is an exact
                        octave is a claim about what the source gives */}
                    {rowCells.map((pitchClass, colIndex) => (
                      <td
                        key={colIndex}
                        className={
                          getCellClassName(octave, colIndex) +
                          (isExactOctave(allPitchClasses, pitchClass) ? "" : "tuning-system-manager__cell_not-exact-octave ")
                        }
                      >
                        {displayStringValue(pitchClass.originalValue)}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Row 5: Cents (¢) */}
                {filters.cents && pitchClassType !== "cents" && (
                  <tr data-row-type="cents">
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
                  <tr data-row-type="centsDeviation">
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
                  <tr data-row-type="fractionRatio">
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
                  <tr data-row-type="stringLength">
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
                  <tr data-row-type="fretDivision">
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
                  <tr data-row-type="decimalRatio">
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
                  <tr data-row-type="midiNote">
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
                  <tr data-row-type="midiNoteDeviation">
                    <td className="tuning-system-manager__row-header">{t('octave.midiNoteDeviation')}</td>
                    {(() => {
                      const preferredMap = contextEnglishNames;

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
                  <tr data-row-type="frequency">
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
                              onFocus={(e) => e.target.select()}
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
                <tr data-row-type="play">
                  <td className="tuning-system-manager__row-header">{t('octave.play')}</td>
                  {rowCells.map((pitchClass, colIndex) => (
                    <td key={colIndex} className={getCellClassName(octave, colIndex)}>
                      <PlayCircleIcon className="tuning-system-manager__play-circle-icon" onMouseUp={() => noteOff(pitchClass)} onMouseDown={() => noteOn(pitchClass)} />
                    </td>
                  ))}
                </tr>

                {/* Row 12: Select (checkbox) */}
                <tr data-row-type="select">
                  <td className="tuning-system-manager__row-header">{t('octave.select')}</td>
                  {rowCells.map((_, colIndex) => (
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
                  <tr data-row-type="staffNotation">
                    <td className="tuning-system-manager__row-header">{t('octave.staffNotation')}</td>
                    <td colSpan={rowCells.length} className="staff-notation-cell">
                      <StaffNotation pitchClasses={rowCells.map((pc) => ({ ...pc, englishName: displayEnglishName(pc) }))} />
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
              if (container) container.scrollBy({ left: (isRTL ? -1 : 1) * octaveScrollStep(container), behavior: "smooth" });
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
