"use client";

import React, { useMemo, useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getJinsTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";
import camelCaseToWord from "@/functions/camelCaseToWord";

export default function JinsTranspositions() {
  const {
    selectedJinsDetails,
    selectedTuningSystem,
    setSelectedPitchClasses,
    allPitchClasses,
    centsTolerance,
    setCentsTolerance,
    sources,
    setSelectedJins,
  } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings } = useSoundContext();

  const { filters, setFilters } = useFilterContext();

  const disabledFilters = ["pitchClass"];

  // --- Utility: getHeaderId for jins ---
  const getJinsHeaderId = (noteName: string): string => {
    if (typeof noteName !== "string") return "";
    return `jins-transpositions__header--${noteName
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()}`;
  };

  // --- Utility: scroll to jins header by note name ---
  function scrollToJinsHeader(firstNote: string, selectedJinsDetails?: any) {
    if (!firstNote && selectedJinsDetails) {
      firstNote = selectedJinsDetails.getNoteNames?.()?.[0];
    }
    if (!firstNote) return;
    const id = getJinsHeaderId(firstNote);
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const transpositionTables = useMemo(() => {
    if (!selectedJinsDetails || !selectedTuningSystem) return null;

    const jinsNoteNames = selectedJinsDetails.getNoteNames();

    if (jinsNoteNames.length < 2) return null;

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

    const numberOfFilterRows = Object.keys(filters).filter(
      (key) =>
        !disabledFilters.includes(key) &&
        key !== valueType &&
        filters[key as keyof typeof filters]
    ).length;

    const jinsTranspositions = getJinsTranspositions(
      allPitchClasses,
      selectedJinsDetails,
      true,
      centsTolerance
    );

    function renderTransposition(jins: Jins, index: number) {
      const transposition = jins.transposition;
      const pitchClasses = jins.jinsPitchClasses;
      const intervals = jins.jinsPitchClassIntervals;
      const colCount = jins.jinsPitchClasses.length * 2;

      return (
        <>
          <tr
            className="jins-transpositions__header"
            id={getJinsHeaderId(pitchClasses[0]?.noteName)}
            style={index === 0 || index === 1 ? { scrollMarginTop: "150px" } : undefined}
          >
            <td
              className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`}
              rowSpan={4 + numberOfFilterRows}
            >
              {index + 1}
            </td>

            <td
              className="jins-transpositions__jins-name-row"
              colSpan={2 + (pitchClasses.length - 1) * 2}
            >
              {!transposition ? (
                <span className="jins-transpositions__transposition-title">
                  Darajat al-Istiqrār (tonic/finalis):{" "}
                  {pitchClasses[0].noteName +
                    ` (${getEnglishNoteName(pitchClasses[0].noteName)})`}
                </span>
              ) : (
                <span className="jins-transpositions__transposition-title">
                  {jins.name}
                </span>
              )}
              <button
                className="jins-transpositions__button"
                onClick={() => {
                  setSelectedPitchClasses(pitchClasses);
                  setSelectedJins(transposition ? jins : null);
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent("jinsTranspositionChange", {
                        detail: { firstNote: pitchClasses[0].noteName },
                      })
                    );
                  }, 0);
                }}
              >
                Select & Load to Keyboard
              </button>

              <button
                className="jins-transpositions__button"
                onClick={() => {
                  playSequence(pitchClasses);
                }}
              >
                <PlayCircleIcon className="jins-transpositions__play-circle-icon" />{" "}
                Play jins
              </button>
            </td>
          </tr>
          <tr>
            <th className="jins-transposition s__row-header">Note Names </th>
            {pitchClasses.map(({ noteName }, i) => (
              <React.Fragment key={i}>
                {i !== 0 && (
                  <th className="jins-transpositions__header-cell"></th>
                )}
                <th className="jins-transpositions__header-cell">{noteName}</th>
              </React.Fragment>
            ))}
          </tr>
          {filters["abjadName"] && (
            <tr>
              <th className="jins-transpositions__row-header">Abjad Name</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].abjadName || "--"}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].abjadName || "--"}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["englishName"] && (
            <tr>
              <th className="jins-transpositions__row-header">English Name</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].englishName}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].englishName}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="jins-transpositions__row-header">
              {camelCaseToWord(valueType)}
            </th>
            <th className="jins-transpositions__header-pitchClass">
              {pitchClasses[0].originalValue}
            </th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-pitchClass">
                  {useRatio
                    ? `(${interval.fraction.replace("/", ":")})`
                    : `(${interval.cents.toFixed(3)})`}
                </th>
                <th className="jins-transpositions__header-pitchClass">
                  {pitchClasses[i + 1].originalValue}
                </th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "fraction" && filters["fraction"] && (
            <tr>
              <th className="jins-transpositions__row-header">fraction</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].fraction}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass">
                    ({interval.fraction})
                  </th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].fraction}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "cents" && filters["cents"] && (
            <tr>
              <th className="jins-transpositions__row-header">cents (¢)</th>
              <th className="jins-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].cents).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass">
                    ({interval.cents.toFixed(3)})
                  </th>
                  <th className="jins-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].cents).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && filters["decimalRatio"] && (
            <tr>
              <th className="jins-transpositions__row-header">decimal ratio</th>
              <th className="jins-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass">
                    ({interval.decimalRatio.toFixed(3)})
                  </th>
                  <th className="jins-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "stringLength" && filters["stringLength"] && (
            <tr>
              <th className="jins-transpositions__row-header">string length</th>
              <th className="jins-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].stringLength).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass">
                    ({interval.stringLength.toFixed(3)})
                  </th>
                  <th className="jins-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "fretDivision" && filters["fretDivision"] && (
            <tr>
              <th className="jins-transpositions__row-header">fret division</th>
              <th className="jins-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].fretDivision).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass">
                    ({interval.fretDivision.toFixed(3)})
                  </th>
                  <th className="jins-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["midiNote"] && (
            <tr>
              <th className="jins-transpositions__row-header">MIDI Note</th>
              <th className="jins-transpositions__header-pitchClass">
                {pitchClasses[0].midiNoteNumber.toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].midiNoteNumber.toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["frequency"] && (
            <tr>
              <th className="jins-transpositions__row-header">Freq (Hz)</th>
              <th className="jins-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].frequency).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-pitchClass"></th>
                  <th className="jins-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].frequency).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="jins-transpositions__row-header">Play</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                {i !== 0 && (
                  <th className="jins-transpositions__header-cell"></th>
                )}
                <th className="jins-transpositions__header-cell">
                  <PlayCircleIcon
                    className="jins-transpositions__play-circle-icon"
                    onMouseDown={() => noteOn(pitchClass)}
                    onMouseUp={() => noteOff(pitchClass)}
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
            Taḥlīl (analysis): {`${selectedJinsDetails.getName()}`}{" "}
            {!useRatio && (
              <>
                {" "}
                / Cents Tolerance:{" "}
                <input
                  className="jins-transpositions__input"
                  type="number"
                  value={centsTolerance ?? 0}
                  onChange={(e) => setCentsTolerance(Number(e.target.value))}
                />
              </>
            )}
            <span className="tuning-system-manager__filter-menu">
              {Object.keys(filters).map((filterKey) => {
                const isDisabled =
                  (filterKey === "fraction" && valueType === "fraction") ||
                  (filterKey === "cents" && valueType === "cents") ||
                  (filterKey === "decimalRatio" &&
                    valueType === "decimalRatio") ||
                  (filterKey === "stringLength" &&
                    valueType === "stringLength");

                if (isDisabled) return null;

                if (disabledFilters.includes(filterKey)) return null;

                return (
                  <label
                    key={filterKey}
                    htmlFor={`filter-${filterKey}`}
                    className={`tuning-system-manager__filter-item ${
                      filters[filterKey as keyof typeof filters]
                        ? "tuning-system-manager__filter-item_active"
                        : ""
                    }`}
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
                      {filterKey
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .charAt(0)
                        .toUpperCase() +
                        filterKey
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                          .slice(1)}
                    </span>
                  </label>
                );
              })}
            </span>
          </h2>
          <table className="jins-transpositions__table">
            <colgroup>
              <col
                style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }}
              />
              <col
                style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }}
              />
            </colgroup>

            <thead>{renderTransposition(jinsTranspositions[0], 0)}</thead>
          </table>

          {/* COMMENTS AND SOURCES */}
          {selectedJinsDetails && (
            <>
              <div className="jins-transpositions__comments-sources-container">
                <div className="jins-transpositions__comments-english">
                  <h3>Comments:</h3>
                  <div className="jins-transpositions__comments-text">
                    {selectedJinsDetails.getCommentsEnglish()}
                  </div>
                </div>

                <div className="jins-transpositions__sources-english">
                  <h3>Sources:</h3>
                  <div className="jins-transpositions__sources-text">
                    {selectedJinsDetails?.getSourcePageReferences().length >
                      0 &&
                      selectedJinsDetails
                        .getSourcePageReferences()
                        .map((sourceRef, idx) => {
                          const source = sources.find(
                            (s: any) => s.id === sourceRef.sourceId
                          );
                          return source ? (
                            <React.Fragment key={idx}>
                              {source.getContributors()[0].lastNameEnglish} (
                              {source.getPublicationDateEnglish()}:
                              {sourceRef.page})
                              <br />
                            </React.Fragment>
                          ) : null;
                        })}
                  </div>
                </div>
              </div>
            </>
          )}

          <h2 className="jins-transpositions__title">
            Taṣwīr (transpositions): {`${selectedJinsDetails.getName()}`}
          </h2>

          <table className="jins-transpositions__table">
            <colgroup>
              <col
                style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }}
              />
              <col
                style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }}
              />
            </colgroup>

            <thead></thead>
            <tbody>
              {jinsTranspositions.slice(1).map((jinsTransposition, row) => {
                return (
                  <React.Fragment key={row}>
                    {renderTransposition(jinsTransposition, row + 1)}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }, [
    allPitchClasses,
    selectedJinsDetails,
    centsTolerance,
    filters,
    soundSettings,
  ]);

  // Listen for custom event to scroll to header when jins/transposition changes (event-driven)
  useEffect(() => {
    function handleJinsTranspositionChange(e: CustomEvent) {
      scrollToJinsHeader(e.detail?.firstNote, selectedJinsDetails);
    }
    window.addEventListener(
      "jinsTranspositionChange",
      handleJinsTranspositionChange as EventListener
    );
    return () => {
      window.removeEventListener(
        "jinsTranspositionChange",
        handleJinsTranspositionChange as EventListener
      );
    };
  }, [selectedJinsDetails]);

  // Scroll to header on mount if jinsFirstNote is in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const jinsFirstNote = params.get("jinsFirstNote");
    if (jinsFirstNote) {
      setTimeout(() => {
        scrollToJinsHeader(
          decodeURIComponent(jinsFirstNote),
          selectedJinsDetails
        );
      }, 200);
    }
  }, [selectedJinsDetails]);

  return transpositionTables;
}
