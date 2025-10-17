"use client";

import React, { useMemo, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getPitchClassIntervals } from "@/functions/getPitchClassIntervals";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import { calculate12EdoReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import StaffNotation from "./staff-notation";

export default function SelectedPitchClassesAnalysis() {
  const { selectedPitchClasses, selectedTuningSystem, allPitchClasses, centsTolerance, setCentsTolerance } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings } = useSoundContext();

  const { t, getDisplayName } = useLanguageContext();

  // Local filter state - independent from global filter context
  const [localFilters, setLocalFilters] = useState({
    abjadName: false,
    englishName: false,
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
  });

  const disabledFilters = ["pitchClass"];

  const copyTableToClipboard = async () => {
    try {
      const pitchClasses = renderPitchClassSpellings(selectedPitchClasses);
      const intervals = getPitchClassIntervals(selectedPitchClasses);
      const valueType = allPitchClasses[0].originalValueType;
      const useRatio = valueType === "fraction" || valueType === "decimalRatio";

      const rows: string[][] = [];

      // Note names row
      const noteNamesRow = [t("analysis.noteNames")];
      pitchClasses.forEach((pc, i) => {
        noteNamesRow.push(getDisplayName(pc.noteName, "note"));
        if (i < pitchClasses.length - 1) noteNamesRow.push('');
      });
      rows.push(noteNamesRow);

      // Primary value type row
      const valueRow = [t(`analysis.${valueType}`)];
      pitchClasses.forEach((pc, i) => {
        valueRow.push(pc.originalValue);
        if (i < pitchClasses.length - 1) {
          const interval = intervals[i];
          const intervalValue = useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`;
          valueRow.push(intervalValue);
        }
      });
      rows.push(valueRow);

      // Convert to TSV format for Excel compatibility
      const tsvContent = rows.map(row => row.join('\t')).join('\n');
      
      await navigator.clipboard.writeText(tsvContent);
      alert(t("analysis.tableCopied"));
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
      (key) => !disabledFilters.includes(key) && key !== valueType && localFilters[key as keyof typeof localFilters]
    ).length;
    const pitchClassIntervals = getPitchClassIntervals(selectedPitchClasses);
    function renderTable() {
      // Apply sequential English name spellings for melodic sequences
      const pitchClasses = renderPitchClassSpellings(selectedPitchClasses);
      const intervals = pitchClassIntervals;
      const rowSpan = 4 + numberOfFilterRows;

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
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[0].midiNoteNumber.toFixed(3)}</th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note">{pitchClasses[i + 1].midiNoteNumber.toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {localFilters["midiNoteDeviation"] && (
            <tr data-row-type="midiNoteDeviation">
              <th className="maqam-jins-transpositions-shared__row-header" data-column-type="row-header">{t('analysis.midiNoteDeviation')}</th>
              <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note-deviation">
                {calculate12EdoReferenceMidiNote(pitchClasses[0])} {pitchClasses[0].centsDeviation > 0 ? "+" : ""}{pitchClasses[0].centsDeviation.toFixed(1)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="empty"></th>
                  <th className="maqam-jins-transpositions-shared__table-cell--pitch-class" data-column-type="midi-note-deviation">
                    {calculate12EdoReferenceMidiNote(pitchClasses[i + 1])} {pitchClasses[i + 1].centsDeviation > 0 ? "+" : ""}{pitchClasses[i + 1].centsDeviation.toFixed(1)}
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
              {t('analysis.title')}:
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
              {Object.keys(localFilters).map((filterKey) => {
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
  }, [selectedTuningSystem, allPitchClasses, selectedPitchClasses, centsTolerance, localFilters, soundSettings, t, getDisplayName]);

  return transpositionTables;
}
