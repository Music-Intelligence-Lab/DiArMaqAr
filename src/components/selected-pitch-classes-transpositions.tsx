"use client";

import React, { useMemo } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext, { defaultNoteVelocity } from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import useLanguageContext from "@/contexts/language-context";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getPitchClassIntervals } from "@/functions/getPitchClassIntervals";
import { getEnglishNoteName } from "@/functions/noteNameMappings";

export default function SelectedPitchClassTranspositions() {
  const { selectedPitchClasses, selectedTuningSystem, allPitchClasses, centsTolerance, setCentsTolerance } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings } = useSoundContext();

  const { filters, setFilters } = useFilterContext();

  const { t, getDisplayName } = useLanguageContext();

  const disabledFilters = ["pitchClass"];

  const transpositionTables = useMemo(() => {
    if (!selectedTuningSystem || selectedPitchClasses.length < 2) return null;

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

    const numberOfFilterRows = Object.keys(filters).filter(
      (key) => !disabledFilters.includes(key) && key !== valueType && filters[key as keyof typeof filters]
    ).length;
    const pitchClassIntervals = getPitchClassIntervals(selectedPitchClasses);
    function renderTable() {
      const pitchClasses = selectedPitchClasses;
      const intervals = pitchClassIntervals;
      const colCount = selectedPitchClasses.length * 2;

      return (
        <>
          <tr className="jins-transpositions__header" style={{ scrollMarginTop: "140px" }}>
            <td
              className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`}
              rowSpan={4 + numberOfFilterRows}
            >
            </td>

            <td className="jins-transpositions__jins-name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
              <button
                className="jins-transpositions__button"
                onClick={() => {
                  playSequence(pitchClasses, true);
                }}
              >
                <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> {t('analysis.playSelectedPitchClasses')}
              </button>
            </td>
          </tr>
          <tr>
            <th className="jins-transposition s__row-header">{t('analysis.noteNames')} </th>
            {pitchClasses.map(({ noteName }, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
                <th className="jins-transpositions__header-cell">{getDisplayName(noteName, 'note')}</th>
              </React.Fragment>
            ))}
          </tr>
          {filters["abjadName"] && (
            <tr>
              <th className="jins-transpositions__row-header">{t('analysis.abjadName')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.englishName')}</th>
              {(() => {
                let prevEnglish: string | undefined = undefined;
                const displays = pitchClasses.map((pc) => {
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
            <th className="jins-transpositions__row-header">{t(`analysis.${valueType}`)}</th>
            <th className="jins-transpositions__header-pitchClass">{pitchClasses[0].originalValue}</th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-pitchClass">
                  {useRatio ? `(${interval.fraction.replace("/", ":")})` : `(${interval.cents.toFixed(3)})`}
                </th>
                <th className="jins-transpositions__header-pitchClass">{pitchClasses[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "fraction" && filters["fraction"] && (
            <tr>
              <th className="jins-transpositions__row-header">{t('analysis.fraction')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.cents')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.centsFromZero')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.centsDeviation')}</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].referenceNoteName && `${pitchClasses[0].referenceNoteName} `}
                {pitchClasses[0].centsDeviation > 0 ? '+' : ''}{pitchClasses[0].centsDeviation.toFixed(1)}¢
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].referenceNoteName && `${pitchClasses[i + 1].referenceNoteName} `}
                    {pitchClasses[i + 1].centsDeviation > 0 ? '+' : ''}{pitchClasses[i + 1].centsDeviation.toFixed(1)}¢
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && filters["decimalRatio"] && (
            <tr>
              <th className="jins-transpositions__row-header">{t('analysis.decimalRatio')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.stringLength')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.fretDivision')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.midiNote')}</th>
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
              <th className="jins-transpositions__row-header">{t('analysis.frequency')}</th>
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
            <th className="jins-transpositions__row-header">{t('analysis.play')}</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
                <th className="jins-transpositions__header-cell">
                  <PlayCircleIcon
                    className="jins-transpositions__play-circle-icon"
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
          <tr>
            <td className="jins-transpositions__spacer" colSpan={colCount} />
          </tr>
        </>
      );
    }

    return (
      <>
        <div className="jins-transpositions">
          <h2 className="jins-transpositions__title">
            {t('analysis.title')}:
            {!useRatio && (
              <>
                {" "}
                / {t('analysis.centsTolerance')}:{" "}
                <input
                  className="jins-transpositions__input"
                  type="number"
                  value={centsTolerance ?? 0}
                  onChange={(e) => setCentsTolerance(Number(e.target.value))}
                />
              </>
            )}
            <span className="filter-menu">
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
                    className={`filter-item ${
                      filters[filterKey as keyof typeof filters] ? "filter-item_active" : ""
                    }`}
                    // prevent the drawer (or parent) click handler from firing
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id={`filter-${filterKey}`}
                      type="checkbox"
                      className="filter-checkbox"
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
                    <span className="filter-label">
                      {t(`filter.${filterKey}`)}
                    </span>
                  </label>
                );
              })}
            </span>
          </h2>
          <table className="jins-transpositions__table">
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
  }, [selectedTuningSystem, allPitchClasses, selectedPitchClasses, centsTolerance, filters, soundSettings, t, getDisplayName]);

  return transpositionTables;
}
