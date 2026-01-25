"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getPitchClassIntervals } from "@/functions/getPitchClassIntervals";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { calculateInterval } from "@/models/PitchClass";
import StaffNotation from "./staff-notation";

export default function SelectedPitchClassesAnalysis() {
  const { selectedPitchClasses, selectedTuningSystem, allPitchClasses, centsTolerance, setCentsTolerance } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings } = useSoundContext();

  const { t, getDisplayName } = useLanguageContext();

  // Local filter state - independent from global filter context
  const [localFilters, setLocalFilters] = useState({
    abjadName: false,
    englishName: false,
    solfege: false,
    fraction: false,
    cents: false,
    centsFromZero: false,
    centsDeviation: false,
    decimalRatio: false,
    stringLength: false,
    fretDivision: false,
    midiNote: false,
    midiNoteDeviation: false,
    frequency: false,
    staffNotation: false,
    pitchClass: false,
    intervalsMatrix: false,
  });

  // Unit selection for intervals matrix - default to cents
  // Use a ref to track if we've initialized the unit based on valueType
  const hasInitializedUnit = useRef(false);
  const [intervalsMatrixUnit, setIntervalsMatrixUnit] = useState<"fraction" | "cents" | "centsFromZero" | "decimalRatio" | "stringLength" | "fretDivision">("cents");

  // Initialize intervalsMatrixUnit once based on valueType, but don't override user's manual selection
  useEffect(() => {
    if (selectedPitchClasses && selectedPitchClasses.length > 0 && !hasInitializedUnit.current) {
      const currentValueType = selectedPitchClasses[0].originalValueType;
      const calculableUnits: Array<"fraction" | "cents" | "centsFromZero" | "decimalRatio" | "stringLength" | "fretDivision"> = ["fraction", "cents", "centsFromZero", "decimalRatio", "stringLength", "fretDivision"];
      
      // Set initial value based on valueType if it's a calculable unit
      if (calculableUnits.includes(currentValueType as any)) {
        setIntervalsMatrixUnit(currentValueType as "fraction" | "cents" | "centsFromZero" | "decimalRatio" | "stringLength" | "fretDivision");
      }
      hasInitializedUnit.current = true;
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

      setLocalFilters((prev) => {
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
  }, [selectedPitchClasses]);

  const disabledFilters: string[] = [];

  // Helper function to format interval based on selected unit
  const formatIntervalValue = (
    interval: ReturnType<typeof calculateInterval>,
    unit: typeof intervalsMatrixUnit,
    fromPcIndex: number
  ): string => {
    switch (unit) {
      case "fraction":
        return `(${interval.fraction.replace("/", ":")})`;
      case "cents":
        return `(${interval.cents.toFixed(3)})`;
      case "centsFromZero":
        // For intervals, centsFromZero is the same as cents (intervals are already relative)
        return `(${interval.cents.toFixed(3)})`;
      case "decimalRatio":
        return `(${interval.decimalRatio.toFixed(3)})`;
      case "stringLength":
        return `(${interval.stringLength.toFixed(3)})`;
      case "fretDivision":
        return `(${interval.fretDivision.toFixed(3)})`;
      default:
        return `(${interval.cents.toFixed(3)})`;
    }
  };

  // Helper function to format pitch class value based on selected unit
  const formatPitchClassValue = (
    pitchClass: typeof selectedPitchClasses[0],
    unit: typeof intervalsMatrixUnit,
    pitchClassIndex: number
  ): string => {
    switch (unit) {
      case "fraction":
        return pitchClass.fraction.replace("/", ":");
      case "cents":
        return parseFloat(pitchClass.cents).toFixed(3);
      case "centsFromZero":
        // Calculate cents from the first pitch class (index 0)
        if (pitchClassIndex === 0) {
          return "0.000";
        }
        const firstPitchClass = selectedPitchClasses[0];
        const centsFromZero = parseFloat(pitchClass.cents) - parseFloat(firstPitchClass.cents);
        return centsFromZero.toFixed(3);
      case "decimalRatio":
        return parseFloat(pitchClass.decimalRatio).toFixed(3);
      case "stringLength":
        return parseFloat(pitchClass.stringLength).toFixed(3);
      case "fretDivision":
        return parseFloat(pitchClass.fretDivision).toFixed(3);
      default:
        return parseFloat(pitchClass.cents).toFixed(3);
    }
  };

  const copyTableToClipboard = async () => {
    try {
      const pitchClasses = renderPitchClassSpellings(selectedPitchClasses);
      const intervals = getPitchClassIntervals(selectedPitchClasses);
      const valueType = allPitchClasses[0].originalValueType;
      const useRatio = valueType === "fraction" || valueType === "decimalRatio";

      const rows: string[][] = [];

      // Note names row (always included)
      const noteNamesRow = [t("analysis.noteNames")];
      pitchClasses.forEach((pc, i) => {
        if (i > 0) noteNamesRow.push(''); // Empty cell for interval column
        noteNamesRow.push(getDisplayName(pc.noteName, "note"));
      });
      rows.push(noteNamesRow);

      // Pitch Class row (if filter enabled)
      if (localFilters["pitchClass"]) {
        const pitchClassRow = [t("analysis.pitchClass")];
        pitchClasses.forEach((pitchClass, i) => {
          if (i > 0) pitchClassRow.push(''); // Empty cell for interval column
          pitchClassRow.push(pitchClass.pitchClassIndex.toString());
        });
        rows.push(pitchClassRow);
      }

      // Abjad names row (if filter enabled)
      if (localFilters["abjadName"]) {
        const abjadRow = [t("analysis.abjadName")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) abjadRow.push(''); // Empty cell for interval column
          abjadRow.push(pc.abjadName || "--");
        });
        rows.push(abjadRow);
      }

      // English names row (if filter enabled)
      if (localFilters["englishName"]) {
        const englishRow = [t("analysis.englishName")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) englishRow.push(''); // Empty cell for interval column
          englishRow.push(pc.englishName);
        });
        rows.push(englishRow);
      }

      // Solfege row (if filter enabled)
      if (localFilters["solfege"]) {
        const solfegeRow = [t("analysis.solfege")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) solfegeRow.push(''); // Empty cell for interval column
          solfegeRow.push(pc.solfege || "--");
        });
        rows.push(solfegeRow);
      }

      // Primary value type row (if filter enabled)
      if (localFilters[valueType as keyof typeof localFilters]) {
        const valueRow = [t(`analysis.${valueType}`)];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            const intervalValue = useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`;
            valueRow.push(intervalValue);
          }
          valueRow.push(pc.originalValue);
        });
        rows.push(valueRow);
      }

      // Additional filter rows
      if (valueType !== "fraction" && localFilters["fraction"]) {
        const fractionRow = [t("analysis.fraction")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            fractionRow.push(`(${interval.fraction})`);
          }
          fractionRow.push(pc.fraction);
        });
        rows.push(fractionRow);
      }

      if (valueType !== "cents" && localFilters["cents"]) {
        const centsRow = [t("analysis.cents")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            centsRow.push(`(${interval.cents.toFixed(3)})`);
          }
          centsRow.push(parseFloat(pc.cents).toFixed(3));
        });
        rows.push(centsRow);
      }

      if (localFilters["centsFromZero"]) {
        const centsFromZeroRow = [t("analysis.centsFromZero")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            centsFromZeroRow.push(`(${interval.cents.toFixed(3)})`);
          }
          const centsFromZero = i === 0 ? "0.000" : (parseFloat(pc.cents) - parseFloat(pitchClasses[0].cents)).toFixed(3);
          centsFromZeroRow.push(centsFromZero);
        });
        rows.push(centsFromZeroRow);
      }

      if (localFilters["centsDeviation"]) {
        const centsDeviationRow = [t("analysis.centsDeviation")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) centsDeviationRow.push(''); // Empty cell for interval column
          const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pc);
          const deviationText = `${referenceNoteWithOctave}${pc.centsDeviation > 0 ? ' +' : ' '}${pc.centsDeviation.toFixed(1)}¢`;
          centsDeviationRow.push(deviationText);
        });
        rows.push(centsDeviationRow);
      }

      if (valueType !== "decimalRatio" && localFilters["decimalRatio"]) {
        const decimalRow = [t("analysis.decimalRatio")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            decimalRow.push(`(${interval.decimalRatio.toFixed(3)})`);
          }
          decimalRow.push(parseFloat(pc.decimalRatio).toFixed(3));
        });
        rows.push(decimalRow);
      }

      if (valueType !== "stringLength" && localFilters["stringLength"]) {
        const stringLengthRow = [t("analysis.stringLength")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            stringLengthRow.push(`(${interval.stringLength.toFixed(3)})`);
          }
          stringLengthRow.push(parseFloat(pc.stringLength).toFixed(3));
        });
        rows.push(stringLengthRow);
      }

      if (valueType !== "fretDivision" && localFilters["fretDivision"]) {
        const fretDivisionRow = [t("analysis.fretDivision")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) {
            const interval = intervals[i - 1];
            fretDivisionRow.push(`(${interval.fretDivision.toFixed(3)})`);
          }
          fretDivisionRow.push(parseFloat(pc.fretDivision).toFixed(3));
        });
        rows.push(fretDivisionRow);
      }

      if (localFilters["midiNote"]) {
        const midiRow = [t("analysis.midiNote")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) midiRow.push(''); // Empty cell for interval column
          midiRow.push(pc.midiNoteDecimal.toFixed(3));
        });
        rows.push(midiRow);
      }

      if (localFilters["midiNoteDeviation"]) {
        const midiDeviationRow = [t("analysis.midiNoteDeviation")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) midiDeviationRow.push(''); // Empty cell for interval column
          const referenceMidiNote = calculateIpnReferenceMidiNote(pc);
          const deviationText = `${referenceMidiNote} ${pc.centsDeviation > 0 ? '+' : ''}${pc.centsDeviation.toFixed(1)}`;
          midiDeviationRow.push(deviationText);
        });
        rows.push(midiDeviationRow);
      }

      if (localFilters["frequency"]) {
        const frequencyRow = [t("analysis.frequency")];
        pitchClasses.forEach((pc, i) => {
          if (i > 0) frequencyRow.push(''); // Empty cell for interval column
          frequencyRow.push(parseFloat(pc.frequency).toFixed(3));
        });
        rows.push(frequencyRow);
      }

      // Intervals matrix rows (if filter enabled)
      if (localFilters["intervalsMatrix"]) {
        // Build list of all intervals to display (one per row)
        const intervalsToShow: Array<{ fromPc: typeof pitchClasses[0], fromIndex: number, toPc: typeof pitchClasses[0], toIndex: number }> = [];
        
        // Only consider pitch classes up to second-to-last (exclude last)
        pitchClasses.slice(0, -1).forEach((fromPc, sliceIndex) => {
          const fromIndex = sliceIndex;
          
          // Find all ascending intervals from this pitch class (including adjacent)
          pitchClasses.slice(1).forEach((toPc, toIndex) => {
            const actualIndex = toIndex + 1;
            if (fromIndex < actualIndex) {
              intervalsToShow.push({ fromPc, fromIndex, toPc, toIndex: actualIndex });
            }
          });
        });

        // Create one row per interval
        intervalsToShow.forEach((interval) => {
          const matrixRow = [`${t('analysis.intervalBetween')} ${getDisplayName(interval.fromPc.noteName, "note")} ${t('analysis.and')} ${getDisplayName(interval.toPc.noteName, "note")}`];
          
          // First pitch class: only show if fromIndex is 0
          if (interval.fromIndex === 0) {
            matrixRow.push(formatPitchClassValue(pitchClasses[0], intervalsMatrixUnit, 0));
          } else {
            matrixRow.push('');
          }
          
          // Subsequent pitch classes
          pitchClasses.slice(1).forEach((pc, pcIndex) => {
            const actualIndex = pcIndex + 1;
            
            if (actualIndex < interval.fromIndex) {
              // Before the "from" pitch class: empty
              matrixRow.push('');
              matrixRow.push('');
            } else if (actualIndex === interval.fromIndex) {
              // At the "from" pitch class: empty interval, then value
              matrixRow.push('');
              matrixRow.push(formatPitchClassValue(pc, intervalsMatrixUnit, actualIndex));
            } else if (actualIndex < interval.toIndex) {
              // Between "from" and "to": empty
              matrixRow.push('');
              matrixRow.push('');
            } else if (actualIndex === interval.toIndex) {
              // At the "to" pitch class: interval then value
              const calculatedInterval = calculateInterval(interval.fromPc, interval.toPc);
              const intervalValue = formatIntervalValue(calculatedInterval, intervalsMatrixUnit, interval.fromIndex);
              matrixRow.push(intervalValue);
              matrixRow.push(formatPitchClassValue(pc, intervalsMatrixUnit, actualIndex));
            } else {
              // After the "to" pitch class: empty
              matrixRow.push('');
              matrixRow.push('');
            }
          });
          
          rows.push(matrixRow);
        });
      }

      // Get max columns from data rows
      const maxCols = Math.max(...rows.filter(r => r.length > 1).map(r => r.length));
      
      // Build title
      const title = t("analysis.title");
      
      // Build TSV format for spreadsheets
      let tsvText = `${title}\n\n`;
      
      // Build HTML format for documents
      let htmlText = `<h3>${title}</h3><table border="1" cellpadding="4" cellspacing="0"><tbody>`;
      
      for (const row of rows) {
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
      console.error("Failed to copy table:", error);
      alert(t("analysis.copyFailed"));
    }
  };

  const transpositionTables = useMemo(() => {
    if (!selectedTuningSystem || selectedPitchClasses.length < 2) return null;

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

      const numberOfFilterRows = Object.keys(localFilters).filter(
        (key) => !disabledFilters.includes(key) && key !== valueType && key !== "intervalsMatrix" && localFilters[key as keyof typeof localFilters]
      ).length;
      const pitchClassIntervals = getPitchClassIntervals(selectedPitchClasses);
      function renderTable() {
        // Apply sequential English name spellings for melodic sequences
        const pitchClasses = renderPitchClassSpellings(selectedPitchClasses);
        const intervals = pitchClassIntervals;
        // Intervals matrix rows: count all ascending intervals
        let intervalsMatrixRows = 0;
        if (localFilters["intervalsMatrix"]) {
          pitchClasses.slice(0, -1).forEach((fromPc, sliceIndex) => {
            const fromIndex = sliceIndex;
            pitchClasses.slice(1).forEach((toPc, toIndex) => {
              const actualIndex = toIndex + 1;
              if (fromIndex < actualIndex) {
                intervalsMatrixRows++;
              }
            });
          });
        }
        const rowSpan = 4 + numberOfFilterRows + intervalsMatrixRows;

      return (
        <>
          <tr className="maqam-jins-transpositions-shared__transposition-row">
            <td
              className={`maqam-jins-transpositions-shared__transposition-number maqam-jins-transpositions-shared__transposition-number_${pitchClasses[0].octave}`}
              rowSpan={rowSpan}
            >
              1
            </td>

            <td className="maqam-jins-transpositions-shared__name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
              <button
                className="maqam-jins-transpositions-shared__transposition-title"
                onClick={() => {
                  playSequence(pitchClasses, true);
                }}
              >
                {t('analysis.selectedPitchClasses')}
              </button>
              <span className="maqam-jins-transpositions-shared__buttons">
                <button
                  className="maqam-jins-transpositions-shared__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSequence(pitchClasses, true);
                  }}
                >
                  <PlayCircleIcon className="maqam-jins-transpositions-shared__play-circle-icon" /> {t("analysis.playSelectedPitchClasses")}
                </button>

                <button
                  className="maqam-jins-transpositions-shared__button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTableToClipboard();
                  }}
                  title={t("analysis.copyTableToClipboard")}
                >
                  <ContentCopyIcon className="maqam-jins-transpositions-shared__copy-icon" />
                  {t("analysis.copyTable")}
                </button>
              </span>
            </td>
          </tr>
          <tr data-row-type="noteNames">
            <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.noteNames')} </th>
            {pitchClasses.map(({ noteName }, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>}
                <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{getDisplayName(noteName, 'note')}</th>
              </React.Fragment>
            ))}
          </tr>
          {localFilters["pitchClass"] && (
            <tr data-row-type="pitchClass">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.pitchClass')}</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  {i !== 0 && <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>}
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="pitch-class">{pitchClass.pitchClassIndex}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["abjadName"] && (
            <tr data-row-type="abjadName">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.abjadName')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[0].abjadName || "--"}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[i + 1].abjadName || "--"}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["englishName"] && (
            <tr data-row-type="englishName">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.englishName')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[0].englishName}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="note-name">{pitchClasses[i + 1].englishName}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["solfege"] && (
            <tr data-row-type="solfege">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.solfege')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="solfege">{pitchClasses[0].solfege || '--'}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="solfege">{pitchClasses[i + 1].solfege || '--'}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters[valueType as keyof typeof localFilters] && (
            <tr data-row-type={valueType}>
              <th className="maqam-jins-transpositions-shared__row-header maqam-jins-transpositions-shared__row-header--primary-value" data-column-type="row-header">{t(`analysis.${valueType}`)}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[0].originalValue}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={`${valueType}-interval`}>
                    {useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}
                  </th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type={valueType}>{pitchClasses[i + 1].originalValue}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "fraction" && localFilters["fraction"] && (
            <tr data-row-type="fraction">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.fraction')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[0].fraction}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction-interval">({interval.fraction})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fraction">{pitchClasses[i + 1].fraction}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "cents" && localFilters["cents"] && (
            <tr data-row-type="cents">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.cents')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[0].cents).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents">{parseFloat(pitchClasses[i + 1].cents).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["centsFromZero"] && (
            <tr data-row-type="centsFromZero">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.centsFromZero')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-from-zero">0.000</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-interval">({interval.cents.toFixed(3)})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-from-zero">{(parseFloat(pitchClasses[i + 1].cents) - parseFloat(pitchClasses[0].cents)).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["centsDeviation"] && (
            <tr data-row-type="centsDeviation">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.centsDeviation')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-deviation">
                {getIpnReferenceNoteNameWithOctave(pitchClasses[0])}
                {pitchClasses[0].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[0].centsDeviation.toFixed(1)}¢
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="cents-deviation">
                    {getIpnReferenceNoteNameWithOctave(pitchClasses[i + 1])}
                    {pitchClasses[i + 1].centsDeviation > 0 ? ' +' : ' '}{pitchClasses[i + 1].centsDeviation.toFixed(1)}¢
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && localFilters["decimalRatio"] && (
            <tr data-row-type="decimalRatio">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.decimalRatio')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio-interval">({interval.decimalRatio.toFixed(3)})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="decimal-ratio">{parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "stringLength" && localFilters["stringLength"] && (
            <tr data-row-type="stringLength">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.stringLength')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[0].stringLength).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length-interval">({interval.stringLength.toFixed(3)})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="string-length">{parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "fretDivision" && localFilters["fretDivision"] && (
            <tr data-row-type="fretDivision">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.fretDivision')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[0].fretDivision).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division-interval">({interval.fretDivision.toFixed(3)})</th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="fret-division">{parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["midiNote"] && (
            <tr data-row-type="midiNote">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.midiNote')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[0].midiNoteDecimal.toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[i + 1].midiNoteDecimal.toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["midiNoteDeviation"] && (
            <tr data-row-type="midiNoteDeviation">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.midiNoteDeviation')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note-deviation">
                {calculateIpnReferenceMidiNote(pitchClasses[0])} {pitchClasses[0].centsDeviation > 0 ? "+" : ""}{pitchClasses[0].centsDeviation.toFixed(1)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note-deviation">
                    {calculateIpnReferenceMidiNote(pitchClasses[i + 1])} {pitchClasses[i + 1].centsDeviation > 0 ? "+" : ""}{pitchClasses[i + 1].centsDeviation.toFixed(1)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["frequency"] && (
            <tr data-row-type="frequency">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.frequency')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="frequency">{parseFloat(pitchClasses[0].frequency).toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="frequency">{parseFloat(pitchClasses[i + 1].frequency).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["staffNotation"] && (
            <tr data-row-type="staffNotation">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.staffNotation')}</th>
              <td className="staff-notation-cell" colSpan={pitchClasses.length * 2 - 1}>
                <StaffNotation pitchClasses={pitchClasses} />
              </td>
            </tr>
          )}
          {localFilters["intervalsMatrix"] && (() => {
            // Build list of all intervals to display (one per row)
            const intervalsToShow: Array<{ fromPc: typeof pitchClasses[0], fromIndex: number, toPc: typeof pitchClasses[0], toIndex: number }> = [];
            
            // Only consider pitch classes up to second-to-last (exclude last)
            pitchClasses.slice(0, -1).forEach((fromPc, sliceIndex) => {
              const fromIndex = sliceIndex;
              
              // Find all ascending intervals from this pitch class (including adjacent)
              pitchClasses.slice(1).forEach((toPc, toIndex) => {
                const actualIndex = toIndex + 1;
                if (fromIndex < actualIndex) {
                  intervalsToShow.push({ fromPc, fromIndex, toPc, toIndex: actualIndex });
                }
              });
            });

            return intervalsToShow.map((interval, rowIndex) => {
              const calculatedInterval = calculateInterval(interval.fromPc, interval.toPc);
              // Calculate how many interval cells to merge between fromIndex and toIndex
              // Structure: for each pitch class i (i > 0), we have: [interval cell] [value cell]
              // We want to merge only the interval cells (not value cells) between fromIndex and toIndex
              // Number of interval cells to merge = (toIndex - fromIndex) interval cells
              // But we also need to account for the value cells in between, so:
              // Total cells to span = (toIndex - fromIndex) * 2 - 1
              // (subtract 1 because we don't include the toIndex value cell in the merge)
              const cellsToMerge = (interval.toIndex - interval.fromIndex) * 2 - 1;
              
              return (
                <tr key={`intervals-matrix-${interval.fromIndex}-${interval.toIndex}`} data-row-type="intervalsMatrix">
                  <th className="maqam-jins-transpositions-shared__row-header maqam-jins-transpositions-shared__row-header--sentence-case" data-column-type="row-header">
                    {t('analysis.intervalBetween')} {getDisplayName(interval.fromPc.noteName, 'note')} {t('analysis.and')} {getDisplayName(interval.toPc.noteName, 'note')}
                  </th>
                  {/* Special handling when fromIndex is 0 */}
                  {interval.fromIndex === 0 ? (
                    <>
                      {/* First pitch class value */}
                      <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="intervals-matrix-value">
                        {formatPitchClassValue(pitchClasses[0], intervalsMatrixUnit, 0)}
                      </th>
                      {/* Merged interval cell spanning from after index 0 to before toIndex */}
                      {cellsToMerge > 0 && (
                        <th 
                          className="maqam-jins-transpositions-shared__table-cell--pitch-class maqam-jins-transpositions-shared__table-cell--centered" 
                          data-column-type="intervals-matrix"
                          colSpan={cellsToMerge}
                        >
                          {formatIntervalValue(calculatedInterval, intervalsMatrixUnit, interval.fromIndex)}
                        </th>
                      )}
                      {/* Subsequent pitch classes - only show those at or after toIndex */}
                      {pitchClasses.slice(1).map((pc, pcIndex) => {
                        const actualIndex = pcIndex + 1;
                        
                        if (actualIndex < interval.toIndex) {
                          // Before the "to" pitch class: skip (merged into colspan above)
                          return null;
                        } else if (actualIndex === interval.toIndex) {
                          // At the "to" pitch class: show value (interval is already shown in merged cell)
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="intervals-matrix-value">
                                {formatPitchClassValue(pc, intervalsMatrixUnit, actualIndex)}
                              </th>
                            </React.Fragment>
                          );
                        } else {
                          // After the "to" pitch class: show empty
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                            </React.Fragment>
                          );
                        }
                      })}
                    </>
                  ) : (
                    <>
                      {/* First pitch class value - empty when fromIndex is not 0 */}
                      <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                      {/* Subsequent pitch classes */}
                      {pitchClasses.slice(1).map((pc, pcIndex) => {
                        const actualIndex = pcIndex + 1;
                        
                        if (actualIndex < interval.fromIndex) {
                          // Before the "from" pitch class: show empty
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                            </React.Fragment>
                          );
                        } else if (actualIndex === interval.fromIndex) {
                          // At the "from" pitch class: show value, then merged interval cell with centered value
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="intervals-matrix-value">
                                {formatPitchClassValue(pc, intervalsMatrixUnit, actualIndex)}
                              </th>
                              {/* Merged interval cell spanning from after fromIndex to before toIndex */}
                              {cellsToMerge > 0 && (
                                <th 
                                  className="maqam-jins-transpositions-shared__table-cell--pitch-class maqam-jins-transpositions-shared__table-cell--centered" 
                                  data-column-type="intervals-matrix"
                                  colSpan={cellsToMerge}
                                >
                                  {formatIntervalValue(calculatedInterval, intervalsMatrixUnit, interval.fromIndex)}
                                </th>
                              )}
                            </React.Fragment>
                          );
                        } else if (actualIndex < interval.toIndex) {
                          // Between "from" and "to": skip these cells (they're merged into the colspan above)
                          return null;
                        } else if (actualIndex === interval.toIndex) {
                          // At the "to" pitch class: show value (interval is already shown in merged cell)
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="intervals-matrix-value">
                                {formatPitchClassValue(pc, intervalsMatrixUnit, actualIndex)}
                              </th>
                            </React.Fragment>
                          );
                        } else {
                          // After the "to" pitch class: show empty
                          return (
                            <React.Fragment key={actualIndex}>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                              <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>
                            </React.Fragment>
                          );
                        }
                      })}
                    </>
                  )}
                </tr>
              );
            });
          })()}
          <tr data-row-type="play">
            <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.play')}</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="empty"></th>}
                <th className="maqam-jins-transpositions-shared__table-cell" data-column-type="play-button">
                  <PlayCircleIcon
                    className="maqam-jins-transpositions-shared__play-circle-icon"
                    onMouseDown={() => {
                      noteOn(pitchClass, defaultNoteVelocity);
                      // Add global mouseup listener to ensure noteOff always fires
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
        </>
      );
    }

    return (
      <>
        <div className="tuning-system-pitch-classes-analysis maqam-jins-transpositions-shared">
          <div className="maqam-jins-transpositions-shared__analysis-header">
            <div className="maqam-jins-transpositions-shared__title-row">
              {t('analysis.title')}
              {!useRatio && (
                <>
                  {" "}
                  / {t('analysis.centsTolerance')}:{" "}
                  <input
                    className="maqam-jins-transpositions-shared__input"
                    type="number"
                    value={centsTolerance ?? 0}
                    onChange={(e) => setCentsTolerance(Number(e.target.value))}
                  />
                </>
              )}
            </div>
              <div className="maqam-jins-transpositions-shared__filter-menu">
              {/* Filter order matches table row appearance order */}
              {[
                "pitchClass",
                "abjadName",
                "englishName",
                "solfege",
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
                "intervalsMatrix",
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

                // Special handling for intervalsMatrix with unit dropdown
                if (filterKey === "intervalsMatrix") {
                  // All units are always available because calculateInterval always returns all properties
                  return (
                    <React.Fragment key={filterKey}>
                      <label
                        className={`maqam-jins-transpositions-shared__filter-item ${
                          localFilters[filterKey as keyof typeof localFilters] ? "maqam-jins-transpositions-shared__filter-item_active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalFilters((prev) => ({
                            ...prev,
                            [filterKey as keyof typeof localFilters]: !prev[filterKey as keyof typeof localFilters],
                          }));
                        }}
                      >
                        <input
                          type="checkbox"
                          className="maqam-jins-transpositions-shared__filter-checkbox"
                          checked={localFilters[filterKey as keyof typeof localFilters]}
                          onChange={() => {}}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                        <span className="maqam-jins-transpositions-shared__filter-label">
                          {t(`filter.${filterKey}`)}
                        </span>
                      </label>
                      {localFilters[filterKey as keyof typeof localFilters] && (
                        <select
                          className="maqam-jins-transpositions-shared__intervals-matrix-unit-select"
                          value={intervalsMatrixUnit}
                          onChange={(e) => {
                            e.stopPropagation();
                            setIntervalsMatrixUnit(e.target.value as typeof intervalsMatrixUnit);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <option value="fraction">{t('filter.fraction')}</option>
                          <option value="cents">{t('filter.cents')}</option>
                          <option value="centsFromZero">{t('filter.centsFromZero')}</option>
                          <option value="decimalRatio">{t('filter.decimalRatio')}</option>
                          <option value="stringLength">{t('filter.stringLength')}</option>
                          <option value="fretDivision">{t('filter.fretDivision')}</option>
                        </select>
                      )}
                    </React.Fragment>
                  );
                }

                const filterElement = (
                  <label
                    key={filterKey}
                    className={`maqam-jins-transpositions-shared__filter-item ${
                      localFilters[filterKey as keyof typeof localFilters] ? "maqam-jins-transpositions-shared__filter-item_active" : ""
                    }`}
                    // prevent the drawer (or parent) click handler from firing
                    onClick={(e) => {
                      e.stopPropagation();
                      // Manually toggle the checkbox
                      setLocalFilters((prev) => ({
                        ...prev,
                        [filterKey as keyof typeof localFilters]: !prev[filterKey as keyof typeof localFilters],
                      }));
                    }}
                  >
                    <input
                      type="checkbox"
                      className="maqam-jins-transpositions-shared__filter-checkbox"
                      checked={localFilters[filterKey as keyof typeof localFilters]}
                      disabled={isDisabled}
                      onChange={() => {
                        // Handled by label onClick to avoid scroll jump
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                    <span className="maqam-jins-transpositions-shared__filter-label">
                      {t(`filter.${filterKey}`)}
                    </span>
                  </label>
                );

                // Add original value type checkbox after solfege (matching table row order)
                if (filterKey === "solfege" && valueType) {
                  return (
                    <React.Fragment key={`solfege-with-valuetype`}>
                      {filterElement}
                      <label
                        key={`originalValue-${valueType}`}
                        className={`maqam-jins-transpositions-shared__filter-item ${
                          localFilters[valueType as keyof typeof localFilters] ? "maqam-jins-transpositions-shared__filter-item_active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalFilters((prev) => ({
                            ...prev,
                            [valueType as keyof typeof localFilters]: !prev[valueType as keyof typeof localFilters],
                          }));
                        }}
                      >
                        <input
                          type="checkbox"
                          className="maqam-jins-transpositions-shared__filter-checkbox"
                          checked={localFilters[valueType as keyof typeof localFilters]}
                          onChange={() => {
                            // Handled by label onClick to avoid scroll jump
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                        <span className="maqam-jins-transpositions-shared__filter-label">
                          {t(`filter.${valueType}`)}
                        </span>
                      </label>
                    </React.Fragment>
                  );
                }

                return filterElement;
              })}
            </div>
            
          </div>
          <table className="maqam-jins-transpositions-shared__table">
            {(() => {
              const pcCount = selectedPitchClasses.length;
              const totalCols = 2 + (pcCount - 1) * 2;
              const cols: React.ReactElement[] = [];
              cols.push(<col key={`c-0-sel`} style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />);
              cols.push(<col key={`c-1-sel`} style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />);
              for (let i = 2; i < totalCols; i++) cols.push(<col key={`c-sel-${i}`} style={{ minWidth: "30px" }} />);
              return <colgroup>{cols}</colgroup>;
            })()}

            <thead>{renderTable()}</thead>
          </table>
        </div>
      </>
    );
  }, [selectedTuningSystem, allPitchClasses, selectedPitchClasses, centsTolerance, localFilters, intervalsMatrixUnit, soundSettings, t, getDisplayName]);

  return transpositionTables;
}
