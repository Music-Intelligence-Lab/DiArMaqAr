"use client";

import React, { useMemo, useState, useEffect } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useFilterContext from "@/contexts/filter-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getMaqamTranspositions } from "@/functions/transpose";
import { Maqam } from "@/models/Maqam";
import { calculateInterval } from "@/models/PitchClass";
import shiftPitchClass from "@/functions/shiftPitchClass";
import camelCaseToWord from "@/functions/camelCaseToWord";

// Utility to create a safe id from a note name
// Utility to create a safe id from a note name
const getHeaderId = (noteName: string): string => {
  if (typeof noteName !== "string") return "";
  return `maqam-transpositions__header--${noteName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()}`;
};

const MaqamTranspositions: React.FC = () => {
  const {
    selectedMaqamDetails,
    selectedTuningSystem,
    setSelectedPitchClasses,
    allPitchClasses,
    centsTolerance,
    setCentsTolerance,
    ajnas,
    setSelectedMaqam,
    sources,
  } = useAppContext();

  const { noteOn, noteOff, playSequence, soundSettings, clearHangingNotes } =
    useSoundContext();

  const { filters, setFilters } = useFilterContext();

  const [highlightedNotes, setHighlightedNotes] = useState<{
    index: number;
    noteNames: string[];
  }>({ index: -1, noteNames: [] });

  const isCellHighlighted = (index: number, noteName: string): boolean => {
    return (
      highlightedNotes.index === index &&
      highlightedNotes.noteNames.includes(noteName)
    );
  };

  const disabledFilters = ["pitchClass"];

  // Removed unused prevFirstNoteRef
  const maqamTranspositions = useMemo(() => {
    const transpositions = getMaqamTranspositions(
      allPitchClasses,
      ajnas,
      selectedMaqamDetails,
      true,
      centsTolerance
    );
    return transpositions;
  }, [allPitchClasses, ajnas, selectedMaqamDetails, centsTolerance]);


  const transpositionTables = useMemo(() => {
    if (!selectedMaqamDetails || !selectedTuningSystem) return null;

    const ascendingNoteNames = selectedMaqamDetails.getAscendingNoteNames();
    const descendingNoteNames = selectedMaqamDetails.getDescendingNoteNames();

    if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2)
      return null;

    let romanNumerals = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
      "XIV",
      "XV",
    ];

    const ascendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) =>
      ascendingNoteNames.includes(pitchClass.noteName)
    );

    const numberOfMaqamNotes = ascendingMaqamPitchClasses.length;

    let noOctaveMaqam = false;

    if (numberOfMaqamNotes <= 7) {
      noOctaveMaqam = true;
      romanNumerals[numberOfMaqamNotes] = "I+";
    }

    romanNumerals = romanNumerals.slice(
      0,
      numberOfMaqamNotes + (noOctaveMaqam ? 1 : 0)
    );

    const valueType = allPitchClasses[0].originalValueType;
    const useRatio = valueType === "fraction" || valueType === "decimalRatio";

    const numberOfFilterRows = Object.keys(filters).filter(
      (key) =>
        !disabledFilters.includes(key) &&
        key !== valueType &&
        filters[key as keyof typeof filters]
    ).length;

    function renderTranspositionRow(
      maqam: Maqam,
      ascending: boolean,
      rowIndex: number
    ) {
      let ascendingTranspositionPitchClasses = maqam.ascendingPitchClasses;
      let descendingTranspositionPitchClasses = maqam.descendingPitchClasses;

      let ascendingIntervals = maqam.ascendingPitchClassIntervals;
      let descendingIntervals = maqam.descendingPitchClassIntervals;

      let jinsTranspositions = ascending
        ? maqam.ascendingMaqamAjnas
        : maqam.descendingMaqamAjnas;

      if (noOctaveMaqam) {
        const shiftedFirstCell = shiftPitchClass(
          allPitchClasses,
          maqam.ascendingPitchClasses[0],
          1
        );
        const lastCell =
          ascendingTranspositionPitchClasses[
            ascendingTranspositionPitchClasses.length - 1
          ];

        ascendingTranspositionPitchClasses = [
          ...ascendingTranspositionPitchClasses,
          shiftedFirstCell,
        ];
        descendingTranspositionPitchClasses = [
          shiftedFirstCell,
          ...descendingTranspositionPitchClasses,
        ];

        const shiftedCellInterval = ascending
          ? calculateInterval(lastCell, shiftedFirstCell)
          : calculateInterval(shiftedFirstCell, lastCell);

        ascendingIntervals = [...ascendingIntervals, shiftedCellInterval];
        descendingIntervals = [shiftedCellInterval, ...descendingIntervals];

        if (jinsTranspositions) {
          let octaveTransposition = maqam.ascendingMaqamAjnas
            ? maqam.ascendingMaqamAjnas[0]
            : null;
          if (octaveTransposition) {
            const foundJinsDetails = ajnas.find(
              (jins) => jins.getId() === octaveTransposition?.jinsId
            );
            if (foundJinsDetails) {
              octaveTransposition = {
                ...octaveTransposition,
                jinsPitchClasses: [shiftedFirstCell],
                jinsPitchClassIntervals: [],
                name:
                  foundJinsDetails.getName() +
                  " al-" +
                  shiftedFirstCell.noteName,
              };
            }
          }
          jinsTranspositions = ascending
            ? [...jinsTranspositions, octaveTransposition]
            : [octaveTransposition, ...jinsTranspositions];
        }
      }

      const transposition = maqam.transposition;
      const pitchClasses = ascending
        ? ascendingTranspositionPitchClasses
        : descendingTranspositionPitchClasses;
      const oppositePitchClasses = ascending
        ? descendingTranspositionPitchClasses
        : ascendingTranspositionPitchClasses;
      const intervals = ascending ? ascendingIntervals : descendingIntervals;

      return (
        <>
          {ascending && (
            <tr>
              <th
                className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${pitchClasses[0].octave}`}
                rowSpan={14 + numberOfFilterRows * 2}
              >
                {rowIndex + 1}
              </th>
              <th
                className="maqam-transpositions__header"
                id={getHeaderId(pitchClasses[0]?.noteName)}
                colSpan={4 + (pitchClasses.length - 1) * 2}
              >
                {!transposition ? (
                  <span className="maqam-transpositions__transposition-title">{`Darajat al-Istiqrār (tonic/finalis): ${
                    pitchClasses[0].noteName
                  } (${getEnglishNoteName(pitchClasses[0].noteName)})`}</span>
                ) : (
                  <span className="maqam-transpositions__transposition-title">
                    {maqam.name}
                  </span>
                )}
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    setSelectedPitchClasses(
                      noOctaveMaqam ? pitchClasses.slice(0, -1) : pitchClasses
                    );
                    setSelectedMaqam(transposition ? maqam : null);
                    // Dispatch event for scroll after DOM update
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("maqamTranspositionChange", {
                          detail: { firstNote: pitchClasses[0].noteName }
                        })
                      );
                    }, 0);
                  }}
                >
                  Select & Load to Keyboard
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={async () => {
                    await clearHangingNotes();
                    await playSequence(pitchClasses);
                    await playSequence(
                      [...oppositePitchClasses].reverse(),
                      false
                    );
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  {"Ascending > Descending"}
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    clearHangingNotes();
                    playSequence(pitchClasses);
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  Ascending
                </button>
                <button
                  className="maqam-transpositions__button"
                  onClick={() => {
                    clearHangingNotes();
                    playSequence([...oppositePitchClasses].reverse(), false);
                  }}
                >
                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  Descending
                </button>
              </th>
            </tr>
          )}
          <tr>
            <td
              className="maqam-transpositions__asc-desc-column"
              rowSpan={6 + numberOfFilterRows}
            >
              {ascending ? "↗" : "↘"}
            </td>
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">Scale Degrees</th>
            {pitchClasses.map((_, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell_scale-degrees-number">
                  {ascending
                    ? romanNumerals[i]
                    : romanNumerals[romanNumerals.length - 1 - i]}
                </th>
                <th className="maqam-transpositions__header-cell_scale-degrees"></th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">Note Names </th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                <th
                  className={
                    (!oppositePitchClasses.includes(pitchClass)
                      ? "maqam-transpositions__header-cell_unique "
                      : "maqam-transpositions__header-pitchClass ") +
                    (isCellHighlighted(
                      rowIndex + (ascending ? 0 : 0.5),
                      pitchClass.noteName
                    )
                      ? "maqam-transpositions__header-cell_highlighted"
                      : "")
                  }
                >
                  {pitchClass.noteName}{" "}
                </th>
                <th className="maqam-transpositions__header-pitchClass"></th>
              </React.Fragment>
            ))}
          </tr>
          {filters["abjadName"] && (
            <tr>
              <th className="maqam-transpositions__row-header">Abjad Name</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    {pitchClass.abjadName || "--"}
                  </th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["englishName"] && (
            <tr>
              <th className="maqam-transpositions__row-header">English Name</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    {pitchClass.englishName}
                  </th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="maqam-transpositions__row-header">
              {camelCaseToWord(valueType)}
            </th>
            <th className="maqam-transpositions__header-pitchClass">
              {pitchClasses[0].originalValue}
            </th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-pitchClass">
                  {useRatio
                    ? `(${interval.fraction.replace("/", ":")})`
                    : `(${interval.cents.toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-pitchClass">
                  {pitchClasses[i + 1].originalValue}
                </th>
                {i === intervals.length - 1 && (
                  <th className="maqam-transpositions__header-cell"></th>
                )}
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "fraction" && filters["fraction"] && (
            <tr>
              <th className="maqam-transpositions__row-header">fraction</th>
              <th className="maqam-transpositions__header-pitchClass">
                {pitchClasses[0].fraction}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    ({interval.fraction})
                  </th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {pitchClasses[i + 1].fraction}
                  </th>
                  {i === intervals.length - 1 && (
                    <th className="maqam-transpositions__header-cell"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "cents" && filters["cents"] && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].cents).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    ({interval.cents.toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].cents).toFixed(3)}
                  </th>
                  {i === intervals.length - 1 && (
                    <th className="maqam-transpositions__header-cell"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "decimalRatio" && filters["decimalRatio"] && (
            <tr>
              <th className="maqam-transpositions__row-header">
                decimal ratio
              </th>
              <th className="maqam-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].decimalRatio).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    ({interval.decimalRatio.toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].decimalRatio).toFixed(3)}
                  </th>
                  {i === intervals.length - 1 && (
                    <th className="maqam-transpositions__header-cell"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "stringLength" && filters["stringLength"] && (
            <tr>
              <th className="maqam-transpositions__row-header">
                string length
              </th>
              <th className="maqam-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].stringLength).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    ({interval.stringLength.toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].stringLength).toFixed(3)}
                  </th>
                  {i === intervals.length - 1 && (
                    <th className="maqam-transpositions__header-cell"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          )}
          {valueType !== "fretDivision" && filters["fretDivision"] && (
            <tr>
              <th className="maqam-transpositions__row-header">
                fret division
              </th>
              <th className="maqam-transpositions__header-pitchClass">
                {parseFloat(pitchClasses[0].fretDivision).toFixed(3)}
              </th>
              {intervals.map((interval, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    ({interval.fretDivision.toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-pitchClass">
                    {parseFloat(pitchClasses[i + 1].fretDivision).toFixed(3)}
                  </th>
                  {i === intervals.length - 1 && (
                    <th className="maqam-transpositions__header-cell"></th>
                  )}
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["midiNote"] && (
            <tr>
              <th className="maqam-transpositions__row-header">MIDI Note</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    {pitchClass.midiNoteNumber.toFixed(3)}
                  </th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {filters["frequency"] && (
            <tr>
              <th className="maqam-transpositions__row-header">Freq (Hz)</th>
              {pitchClasses.map((pitchClass, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-pitchClass">
                    {parseFloat(pitchClass.frequency).toFixed(3)}
                  </th>
                  <th className="maqam-transpositions__header-pitchClass"></th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="maqam-transpositions__row-header">Play</th>
            {pitchClasses.map((pitchClass, i) => (
              <React.Fragment key={i}>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onMouseDown={() => noteOn(pitchClass)}
                    onMouseUp={() => noteOff(pitchClass)}
                  />
                </th>
                <th className="maqam-transpositions__header-cell"></th>
              </React.Fragment>
            ))}
          </tr>
          {jinsTranspositions && (
            <>
              <tr>
                <th className="maqam-transpositions__row-header">Ajnas</th>
                {jinsTranspositions.map((jinsTransposition, index) => {
                  return (
                    <th
                      className="maqam-transpositions__header-pitchClass"
                      colSpan={2}
                      key={index}
                    >
                      {jinsTransposition && (
                        <button
                          className="maqam-transpositions__jins-button"
                          onClick={() => {
                            const noteNames =
                              jinsTransposition.jinsPitchClasses.map(
                                (pc) => pc.noteName
                              );
                            setHighlightedNotes({
                              index: rowIndex + (ascending ? 0 : 0.5),
                              noteNames,
                            });
                          }}
                        >
                          {jinsTransposition.name}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </>
          )}
          <tr>
            <td
              className="maqam-transpositions__spacer"
              colSpan={2 + (pitchClasses.length - 1) * 2}
            />
          </tr>
        </>
      );
    }

    function renderTransposition(maqam: Maqam, index: number) {
      return (
        <>
          {renderTranspositionRow(maqam, true, index)}
          {renderTranspositionRow(maqam, false, index)}
        </>
      );
    }

    return (
      <div className="maqam-transpositions"> 
        {maqamTranspositions.length > 0 && (
          <>
            <h2 className="maqam-transpositions__title">
              Taḥlīl (analysis): {`${selectedMaqamDetails.getName()}`}
              {!useRatio && (
                <>
                  {" "}
                  / Cents Tolerance:{" "}
                  <input
                    className="maqam-transpositions__input"
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
                            [filterKey as keyof typeof filters]:
                              e.target.checked,
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

            <table className="maqam-transpositions__table">
              <colgroup>
                <col style={{ width: "30px" }} />
                <col style={{ width: "40px" }} />
                <col
                  style={{
                    minWidth: "100px",
                    maxWidth: "100px",
                    width: "100px",
                  }}
                />
              </colgroup>
              <thead>{renderTransposition(maqamTranspositions[0], 0)}</thead>
            </table>
          </>
        )}
        {/* COMMENTS AND SOURCES */}
        {selectedMaqamDetails && (
          <>
            <div className="maqam-transpositions__comments-sources-container">
              <div className="maqam-transpositions__comments-english">
                <h3>Comments:</h3>
                <div className="maqam-transpositions__comments-text">
                  {selectedMaqamDetails.getCommentsEnglish()}
                </div>
              </div>

              <div className="maqam-transpositions__sources-english">
                <h3>Sources:</h3>
                <div className="maqam-transpositions__sources-text">
                  {selectedMaqamDetails?.getSourcePageReferences().length > 0 &&
                    selectedMaqamDetails
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
        {maqamTranspositions.length > 1 && (
          <>
            <div className="maqam-transpositions__title-container">
              <h2 className="maqam-transpositions__title">
                Taṣwīr (transpositions): {`${selectedMaqamDetails.getName()}`}
                {!useRatio && (
                  <>
                    {" "}
                    / Cents Tolerance:{" "}
                    <input
                      className="maqam-transpositions__input"
                      type="number"
                      value={centsTolerance ?? 0}
                      onChange={(e) =>
                        setCentsTolerance(Number(e.target.value))
                      }
                    />
                  </>
                )}
              </h2>
            </div>
            <table className="maqam-transpositions__table">
              <colgroup>
                <col style={{ width: "30px" }} />
                <col style={{ width: "40px" }} />
                <col
                  style={{
                    minWidth: "100px",
                    maxWidth: "100px",
                    width: "100px",
                  }}
                />
              </colgroup>
              <tbody>
                {maqamTranspositions.slice(1).map((maqamTransposition, row) => {
                  return (
                    <React.Fragment key={row}>
                      {renderTransposition(maqamTransposition, row)}
                      <tr>
                        <td
                          className="maqam-transpositions__spacer"
                          colSpan={
                            2 +
                            (maqamTransposition.ascendingPitchClasses.length -
                              1) *
                              2
                          }
                        />
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  }, [
    allPitchClasses,
    ajnas,
    selectedMaqamDetails,
    selectedTuningSystem,
    centsTolerance,
    filters,
    highlightedNotes,
    soundSettings,
  ]);

  // Listen for custom event to scroll to header when maqam/transposition changes (event-driven)
  useEffect(() => {
    function handleMaqamTranspositionChange(e: CustomEvent) {
      let firstNote = e.detail?.firstNote;
      // fallback: try to get from selectedMaqamDetails if not provided
      if (!firstNote && selectedMaqamDetails) {
        firstNote = selectedMaqamDetails.getAscendingNoteNames?.()?.[0];
      }
      if (!firstNote) return;
      const id = getHeaderId(firstNote);
      const el = document.getElementById(id);
      if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
    return () => {
      window.removeEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
    };
  }, [selectedMaqamDetails]);

  // Scroll to header on mount if maqamFirstNote is in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const maqamFirstNote = params.get("maqamFirstNote");
    if (maqamFirstNote) {
      // decode and normalize
      const id = getHeaderId(decodeURIComponent(maqamFirstNote));
      const el = document.getElementById(id);
      if (el && typeof el.scrollIntoView === "function") {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    }
  }, []);
  return transpositionTables;
};

export default MaqamTranspositions;

