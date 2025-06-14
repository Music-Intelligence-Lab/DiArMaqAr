"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import { Cell, CellDetails } from "@/models/Cell";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getIntervalPattern, getTranspositions, mergeTranspositions, Interval } from "@/functions/transpose";
import Jins from "@/models/Jins";
import { MaqamTransposition } from "@/models/Maqam";

export default function MaqamTranspositions() {
  const {
    selectedMaqam,
    selectedTuningSystem,
    setSelectedCells,
    allCellDetails,
    centsTolerance,
    setCentsTolerance,
    ajnas,
    setSelectedMaqamTransposition,
  } = useAppContext();

  const { playNoteFrequency, playSequence } = useSoundContext();

  const [highlightedNotes, setHighlightedNotes] = useState<{ index: number; noteNames: string[] }>({ index: -1, noteNames: [] });

  const isCellHighlighted = (index: number, noteName: string): boolean => {
    return highlightedNotes.index === index && highlightedNotes.noteNames.includes(noteName);
  };

  if (!selectedMaqam || !selectedTuningSystem) return null;

  const ascendingNoteNames = selectedMaqam.getAscendingNoteNames();
  const descendingNoteNames = selectedMaqam.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return null;

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "XI", "X", "XI", "XII", "XIII", "XIV", "XV"];

  const ascendingMaqamCellDetails = allCellDetails.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCellDetails = allCellDetails.filter((cell) => descendingNoteNames.includes(cell.noteName)).reverse();

  const valueType = ascendingMaqamCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  function equalIntervalPatterns(pattern1: Interval[], pattern2: Interval[]): boolean {
    if (pattern1.length !== pattern2.length) return false;

    for (let i = 0; i < pattern1.length; i++) {
      const interval1 = pattern1[i];
      const interval2 = pattern2[i];

      if (useRatio) {
        if (interval1.ratio !== interval2.ratio) return false;
      } else {
        if (interval1.diff === undefined || interval2.diff === undefined) return false;
        const diff = Math.abs(interval1.diff - interval2.diff);
        if (diff > centsTolerance) return false;
      }
    }

    return true;
  }

  const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCellDetails, useRatio);

  const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCellDetails, useRatio);

  const ascendingSequences: CellDetails[][] = getTranspositions(allCellDetails, ascendingIntervalPattern, true, useRatio, centsTolerance);

  const descendingSequences: CellDetails[][] = getTranspositions(allCellDetails, descendingIntervalPattern, false, useRatio, centsTolerance);

  const filteredSequences: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = mergeTranspositions(
    ascendingSequences,
    descendingSequences
  );

  const ascendingAjnasIntervals: { jins: Jins; intervalPattern: Interval[] }[] = [];
  const descendingAjnasIntervals: { jins: Jins; intervalPattern: Interval[] }[] = [];

  for (const jins of ajnas) {
    const jinsCellDetails = allCellDetails.filter((cell) => jins.getNoteNames().includes(cell.noteName));
    if (jinsCellDetails.length !== jins.getNoteNames().length) continue;
    const reverseJinsCellDetails = [...jinsCellDetails].reverse();
    const ascendingJinsIntervalPattern = getIntervalPattern(jinsCellDetails, useRatio);
    ascendingAjnasIntervals.push({ jins, intervalPattern: ascendingJinsIntervalPattern });
    const descendingJinsIntervalPattern = getIntervalPattern(reverseJinsCellDetails, useRatio);
    descendingAjnasIntervals.push({ jins, intervalPattern: descendingJinsIntervalPattern });
  }

  const extendedAscendingIntervalPattern = [...ascendingIntervalPattern, ...ascendingIntervalPattern];
  const extendedDescendingIntervalPattern = [...descendingIntervalPattern, ...descendingIntervalPattern];

  let ascendingMaqamJinsIntervals: { jins: Jins | null; intervalPattern: Interval[] }[] = [];
  let descendingMaqamJinsIntervals: { jins: Jins | null; intervalPattern: Interval[] }[] = [];

  for (let i = 0; i < extendedAscendingIntervalPattern.length; i++) {
    let found = false;

    for (const { jins, intervalPattern } of ascendingAjnasIntervals) {
      const slicedIntervalPattern = extendedAscendingIntervalPattern.slice(i, i + intervalPattern.length);

      if (equalIntervalPatterns(slicedIntervalPattern, intervalPattern)) {
        ascendingMaqamJinsIntervals.push({ jins, intervalPattern });
        found = true;
        break;
      }
    }

    if (!found) {
      ascendingMaqamJinsIntervals.push({ jins: null, intervalPattern: [] });
    }
  }

  ascendingMaqamJinsIntervals = ascendingMaqamJinsIntervals.slice(0, ascendingIntervalPattern.length);

  for (let i = 0; i < extendedDescendingIntervalPattern.length; i++) {
    let found = false;

    for (const { jins, intervalPattern } of descendingAjnasIntervals) {
      const slicedIntervalPattern = extendedDescendingIntervalPattern.slice(i, i + intervalPattern.length);

      if (equalIntervalPatterns(slicedIntervalPattern, intervalPattern)) {
        descendingMaqamJinsIntervals.push({ jins, intervalPattern });
        found = true;
        break;
      }
    }

    if (!found) {
      descendingMaqamJinsIntervals.push({ jins: null, intervalPattern: [] });
    }
  }

  descendingMaqamJinsIntervals = descendingMaqamJinsIntervals.slice(0, descendingIntervalPattern.length);

  return (
    <div className="maqam-transpositions">
      <h2 className="maqam-transpositions__title">
        Taḥlīl (analysis): {`${selectedMaqam.getName()}`}
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
      </h2>

      <table className="maqam-transpositions__table">
        <colgroup>
          <col style={{ width: "30px" }} />
          <col style={{ width: "40px" }} />
        </colgroup>

        <thead>
          <tr>
            <th
              className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${ascendingMaqamCellDetails[0].octave}`}
              rowSpan={16}
            >
              {1}
            </th>

            <th className="maqam-transpositions__header" colSpan={3 + (ascendingMaqamCellDetails.length - 1) * 2}>
              <span className="maqam-transpositions__transposition-title">{`Darajat al-Istiqrār (tonic/finalis): ${
                ascendingMaqamCellDetails[0].noteName
              } (${getEnglishNoteName(ascendingMaqamCellDetails[0].noteName)})`}</span>
              <button
                className="maqam-transpositions__button"
                onClick={() => {
                  const transpositionNoteNames = ascendingMaqamCellDetails.map((cell) => cell.noteName);

                  const newSelectedCells: Cell[] = [];

                  for (const cellDetails of allCellDetails) {
                    if (transpositionNoteNames.includes(cellDetails.noteName)) {
                      newSelectedCells.push({ index: cellDetails.index, octave: cellDetails.octave });
                    }
                  }
                  setSelectedCells(newSelectedCells);
                  setSelectedMaqamTransposition(null);
                }}
              >
                Select & Load to Keyboard
              </button>
              <button
                className="maqam-transpositions__button"
                onClick={async () => {
                  const ascFreq = ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency));
                  const descFreq = descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)).reverse();
                  await playSequence(ascFreq);
                  await playSequence(descFreq, false);
                }}
              >
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                {"Ascending > Descending"}
              </button>
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)))}
              >
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                Ascending
              </button>
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)).reverse(), false)}
              >
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                Descending
              </button>
            </th>
          </tr>
          {/* Ascending Scale Degrees Row */}
          <tr>
            <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
              ↗
            </td>
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">Scale Degrees</th>
            {ascendingMaqamCellDetails.map((_, idx) =>
              idx === 0 ? (
                <th key={idx} className="maqam-transpositions__header-cell_scale-degrees-number">
                  {romanNumerals[idx]}
                </th>
              ) : (
                <React.Fragment key={idx}>
                  <th className="maqam-transpositions__header-cell_scale-degrees"></th>
                  <th className="maqam-transpositions__header-cell_scale-degrees-number">{romanNumerals[idx]}</th>
                </React.Fragment>
              )
            )}
          </tr>
          {/* Ascending Note Names Row */}
          <tr>
            <th className="maqam-transpositions__row-header">Note Names </th>
            {ascendingMaqamCellDetails.map((cell, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                <th
                  className={
                    (!descendingNoteNames.includes(cell.noteName)
                      ? "maqam-transpositions__header-cell_unique "
                      : "maqam-transpositions__header-cell ") +
                    (isCellHighlighted(0, cell.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                  }
                >
                  {cell.noteName + ` (${getEnglishNoteName(cell.noteName)})`}{" "}
                </th>
              </React.Fragment>
            ))}
          </tr>

          {/* Ascending Tuning Unit and Cents Values Row */}
          <tr>
            <th className="maqam-transpositions__row-header">{valueType}</th>
            <th className="maqam-transpositions__header-cell">{ascendingMaqamCellDetails[0].originalValue}</th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">
                  {useRatio
                    ? `(${pat.ratio})`
                    : `(${(
                        parseFloat(ascendingMaqamCellDetails[i + 1].originalValue) - parseFloat(ascendingMaqamCellDetails[i].originalValue)
                      ).toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-cell">{ascendingMaqamCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-cell">{parseFloat(ascendingMaqamCellDetails[0].cents).toFixed(3)}</th>
              {ascendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-cell">
                    {" "}
                    ({(parseFloat(ascendingMaqamCellDetails[i + 1].cents) - parseFloat(ascendingMaqamCellDetails[i].cents)).toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-cell">{parseFloat(ascendingMaqamCellDetails[i + 1].cents).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {/* Ascending Play Buttons Row */}
          <tr>
            <th className="maqam-transpositions__row-header">Play</th>
            <th>
              <PlayCircleIcon
                className="maqam-transpositions__play-circle-icon"
                onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[0].frequency))}
              />
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[i + 1].frequency))}
                  />
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">Ajnas</th>
            {ascendingMaqamJinsIntervals.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell" colSpan={2}>
                  {pat.jins && (
                    <>
                      {pat.jins.getName()}
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const frequencies = ascendingMaqamCellDetails
                            .slice(i, i + pat.intervalPattern.length)
                            .map((cell) => parseInt(cell.frequency));
                          playSequence(frequencies);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const noteNames = ascendingMaqamCellDetails.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
                          setHighlightedNotes({ index: 0, noteNames });
                        }}
                      >
                        Highlight
                      </button>
                    </>
                  )}
                </th>
              </React.Fragment>
            ))}
            <th className="maqam-transpositions__header-cell"></th>
          </tr>
          <tr>
            <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingMaqamCellDetails.length - 1) * 2} />
          </tr>

          {/* Descending Scale Degrees Row */}
          <tr>
            <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
              ↘
            </td>
          </tr>

          <tr>
            <th className="maqam-transpositions__row-header">Scale Degrees</th>
            {romanNumerals
              .slice(0, ascendingMaqamCellDetails.length)
              .reverse()
              .map((num, idx) =>
                idx === 0 ? (
                  <th key={idx} className="maqam-transpositions__header-cell_scale-degrees">
                    {num}
                  </th>
                ) : (
                  <React.Fragment key={idx}>
                    <th className="maqam-transpositions__header-cell_scale-degrees"></th>
                    <th className="maqam-transpositions__header-cell_scale-degrees-number">{num}</th>
                  </React.Fragment>
                )
              )}
          </tr>

          {/* Descending Note Names Row */}
          <tr>
            <th className="maqam-transpositions__row-header">Note Names</th>

            {descendingMaqamCellDetails.map((cell, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                <th
                  className={
                    (!ascendingNoteNames.includes(cell.noteName)
                      ? "maqam-transpositions__header-cell_unique "
                      : "maqam-transpositions__header-cell ") +
                    (isCellHighlighted(0.5, cell.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                  }
                >
                  {cell.noteName + ` (${getEnglishNoteName(cell.noteName)})`}{" "}
                </th>
              </React.Fragment>
            ))}
          </tr>

          {/* Descending Tuning Unit and Cents Values Row */}

          <tr>
            <th className="maqam-transpositions__row-header">{valueType}</th>
            <th className="maqam-transpositions__header-cell">{descendingMaqamCellDetails[0].originalValue}</th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">
                  {useRatio
                    ? `(${pat.ratio})`
                    : `(${(
                        parseFloat(descendingMaqamCellDetails[i + 1].originalValue) - parseFloat(descendingMaqamCellDetails[i].originalValue)
                      ).toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-cell">{descendingMaqamCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-cell">{descendingMaqamCellDetails[0].cents}</th>
              {descendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-cell">{`(${(
                    parseFloat(descendingMaqamCellDetails[i + 1].cents) - parseFloat(descendingMaqamCellDetails[i].cents)
                  ).toFixed(3)})`}</th>
                  <th className="maqam-transpositions__header-cell">{parseFloat(descendingMaqamCellDetails[i + 1].cents).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          {/* Descending Play Buttons Row */}
          <tr>
            <th className="maqam-transpositions__row-header">Play</th>
            <th>
              <PlayCircleIcon
                className="maqam-transpositions__play-circle-icon"
                onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[0].frequency))}
              />
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[i + 1].frequency))}
                  />
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam-transpositions__row-header">Ajnas</th>
            {descendingMaqamJinsIntervals.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell" colSpan={2}>
                  {pat.jins && (
                    <>
                      {pat.jins.getName()}
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const frequencies = descendingMaqamCellDetails
                            .slice(i, i + pat.intervalPattern.length)
                            .map((cell) => parseInt(cell.frequency));
                          playSequence(frequencies);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const noteNames = descendingMaqamCellDetails.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
                          setHighlightedNotes({ index: 0.5, noteNames });
                        }}
                      >
                        Highlight
                      </button>
                    </>
                  )}
                </th>
              </React.Fragment>
            ))}
            <th className="maqam-transpositions__header-cell"></th>
          </tr>
        </thead>
      </table>

      <h2 className="maqam-transpositions__title">
        Taṣwīr (transpositions): {`${selectedMaqam.getName()}`}
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
      </h2>

      <table className="maqam-transpositions__table">
        <colgroup>
          <col style={{ width: "30px" }} />
          <col style={{ width: "40px" }} />
        </colgroup>
        <tbody>
          {filteredSequences
            .filter((sequence) => sequence.ascendingSequence[0].noteName !== ascendingMaqamCellDetails[0].noteName)
            .map((seq, row) => {
              const ascendingDetails = seq.ascendingSequence;
              const descendingDetails = seq.descendingSequence;
              const colCount = 2 + (ascendingDetails.length - 1) * 2;
              const rowCount = 16;

              return (
                <React.Fragment key={row}>
                  <tr>
                    <td
                      className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${ascendingDetails[0].octave}`}
                      rowSpan={rowCount}
                    >
                      {row + 2}
                    </td>
                    <td className="maqam-transpositions__maqam-name-row" colSpan={colCount + 1}>
                      <span className="maqam-transpositions__transposition-title">{`${selectedMaqam.getName()} al-${
                        ascendingDetails[0].noteName
                      } (${getEnglishNoteName(ascendingDetails[0].noteName)})`}</span>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => {
                          const transpositionNoteNames = ascendingDetails.map((cell) => cell.noteName);

                          const newSelectedCells: Cell[] = [];

                          for (const cellDetails of allCellDetails) {
                            if (transpositionNoteNames.includes(cellDetails.noteName)) {
                              newSelectedCells.push({ index: cellDetails.index, octave: cellDetails.octave });
                            }
                          }
                          setSelectedCells(newSelectedCells);
                          const transposition: MaqamTransposition = {
                            //todo make this as a useeffect
                            name: `${selectedMaqam.getName()} al-${ascendingDetails[0].noteName} (${getEnglishNoteName(
                              ascendingDetails[0].noteName
                            )})`,
                            ascendingNoteNames: ascendingDetails.map((cell) => cell.noteName),
                            descendingNoteNames: descendingDetails.map((cell) => cell.noteName),
                          };
                          setSelectedMaqamTransposition(transposition);
                        }}
                      >
                        Select & Load to Keyboard
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={async () => {
                          const ascFreq = ascendingDetails.map((cell) => parseInt(cell.frequency));
                          const descFreq = descendingDetails.map((cell) => parseInt(cell.frequency));
                          await playSequence(ascFreq);
                          await playSequence(descFreq, false);
                        }}
                      >
                        <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        Ascending {">"} Descending
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => playSequence(ascendingDetails.map((cell) => parseInt(cell.frequency)))}
                      >
                        <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        Ascending
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => playSequence(descendingDetails.map((cell) => parseInt(cell.frequency)))}
                      >
                        <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        Descending
                      </button>
                    </td>
                  </tr>

                  {/* Ascending Scale Degrees Row */}
                  <tr>
                    <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
                      ↗
                    </td>
                  </tr>
                  <tr>
                    <th className="maqam-transpositions__row-header">Scale Degrees</th>
                    {ascendingDetails.map((_, idx) =>
                      idx === 0 ? (
                        <th key={idx} className="maqam-transpositions__header-cell_scale-degrees-number">
                          {romanNumerals[idx]}
                        </th>
                      ) : (
                        <React.Fragment key={idx}>
                          <th className="maqam-transpositions__header-cell_scale-degrees"></th>
                          <th className="maqam-transpositions__header-cell_scale-degrees-number">{romanNumerals[idx]}</th>
                        </React.Fragment>
                      )
                    )}
                  </tr>
                  {/* Ascending Note Names Row */}
                  <tr>
                    <th className="maqam-transpositions__row-header">Note Names </th>
                    {ascendingDetails.map((cell, i) => (
                      <React.Fragment key={i}>
                        {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                        <th
                          className={
                            (!descendingDetails.map((details) => details.noteName).includes(cell.noteName)
                              ? "maqam-transpositions__header-cell_unique "
                              : "maqam-transpositions__header-cell ") +
                            (isCellHighlighted(row + 1, cell.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                          }
                        >
                          {cell.noteName + ` (${getEnglishNoteName(cell.noteName)})`}{" "}
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>

                  {/* Ascending Tuning Unit and Cents Values Row */}
                  <tr>
                    <th className="maqam-transpositions__row-header">{valueType}</th>
                    <th className="maqam-transpositions__header-cell">{ascendingDetails[0].originalValue}</th>
                    {ascendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell">
                          {useRatio
                            ? `(${pat.ratio})`
                            : `(${(parseFloat(ascendingDetails[i + 1].originalValue) - parseFloat(ascendingDetails[i].originalValue)).toFixed(3)})`}
                        </th>
                        <th className="maqam-transpositions__header-cell">{ascendingDetails[i + 1].originalValue}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                  {valueType !== "cents" && (
                    <tr>
                      <th className="maqam-transpositions__row-header">cents (¢)</th>
                      <th className="maqam-transpositions__header-cell">{parseFloat(ascendingDetails[0].cents).toFixed(3)}</th>
                      {ascendingIntervalPattern.map((pat, i) => (
                        <React.Fragment key={i}>
                          <th className="maqam-transpositions__header-cell">
                            {" "}
                            ({(parseFloat(ascendingDetails[i + 1].cents) - parseFloat(ascendingDetails[i].cents)).toFixed(3)})
                          </th>
                          <th className="maqam-transpositions__header-cell">{parseFloat(ascendingDetails[i + 1].cents).toFixed(3)}</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  )}
                  {/* Ascending Play Buttons Row */}
                  <tr>
                    <th className="maqam-transpositions__row-header">Play</th>
                    <th>
                      <PlayCircleIcon
                        className="maqam-transpositions__play-circle-icon"
                        onClick={() => playNoteFrequency(parseInt(ascendingDetails[0].frequency))}
                      />
                    </th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell"></th>
                        <th>
                          <PlayCircleIcon
                            className="maqam-transpositions__play-circle-icon"
                            onClick={() => playNoteFrequency(parseInt(ascendingDetails[i + 1].frequency))}
                          />
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                  <tr>
                    <th className="maqam-transpositions__row-header">Ajnas</th>
                    {ascendingMaqamJinsIntervals.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell" colSpan={2}>
                          {pat.jins && (
                            <>
                              {pat.jins.getName()}
                              <button
                                className="maqam-transpositions__jins-button"
                                onClick={() => {
                                  const frequencies = ascendingDetails
                                    .slice(i, i + pat.intervalPattern.length)
                                    .map((cell) => parseInt(cell.frequency));
                                  playSequence(frequencies);
                                }}
                              >
                                Play
                              </button>
                              <button
                                className="maqam-transpositions__jins-button"
                                onClick={() => {
                                  const noteNames = ascendingDetails.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
                                  setHighlightedNotes({ index: row + 1, noteNames });
                                }}
                              >
                                Highlight
                              </button>
                            </>
                          )}
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="maqam-transpositions__header-cell"></th>
                  </tr>
                  <tr>
                    <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingDetails.length - 1) * 2} />
                  </tr>

                  {/* Descending Scale Degrees Row */}
                  <tr>
                    <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
                      ↘
                    </td>
                  </tr>

                  <tr>
                    <th className="maqam-transpositions__row-header">Scale Degrees</th>
                    {romanNumerals
                      .slice(0, ascendingDetails.length)
                      .reverse()
                      .map((num, idx) =>
                        idx === 0 ? (
                          <th key={idx} className="maqam-transpositions__header-cell_scale-degrees">
                            {num}
                          </th>
                        ) : (
                          <React.Fragment key={idx}>
                            <th className="maqam-transpositions__header-cell_scale-degrees"></th>
                            <th className="maqam-transpositions__header-cell_scale-degrees-number">{num}</th>
                          </React.Fragment>
                        )
                      )}
                  </tr>

                  {/* Descending Note Names Row */}
                  <tr>
                    <th className="maqam-transpositions__row-header">Note Names</th>

                    {descendingDetails.map((cell, i) => (
                      <React.Fragment key={i}>
                        {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                        <th
                          className={
                            (!ascendingDetails.map((details) => details.noteName).includes(cell.noteName)
                              ? "maqam-transpositions__header-cell_unique "
                              : "maqam-transpositions__header-cell ") +
                            (isCellHighlighted(row + 1.5, cell.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                          }
                        >
                          {cell.noteName + ` (${getEnglishNoteName(cell.noteName)})`}{" "}
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>

                  {/* Descending Tuning Unit and Cents Values Row */}

                  <tr>
                    <th className="maqam-transpositions__row-header">{valueType}</th>
                    <th className="maqam-transpositions__header-cell">{descendingDetails[0].originalValue}</th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell">
                          {useRatio
                            ? `(${pat.ratio})`
                            : `(${(parseFloat(descendingDetails[i + 1].originalValue) - parseFloat(descendingDetails[i].originalValue)).toFixed(3)})`}
                        </th>
                        <th className="maqam-transpositions__header-cell">{descendingDetails[i + 1].originalValue}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                  {valueType !== "cents" && (
                    <tr>
                      <th className="maqam-transpositions__row-header">cents (¢)</th>
                      <th className="maqam-transpositions__header-cell">{descendingDetails[0].cents}</th>
                      {descendingIntervalPattern.map((pat, i) => (
                        <React.Fragment key={i}>
                          <th className="maqam-transpositions__header-cell">{`(${(
                            parseFloat(descendingDetails[i + 1].cents) - parseFloat(descendingDetails[i].cents)
                          ).toFixed(3)})`}</th>
                          <th className="maqam-transpositions__header-cell">{parseFloat(descendingDetails[i + 1].cents).toFixed(3)}</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  )}
                  {/* Descending Play Buttons Row */}
                  <tr>
                    <th className="maqam-transpositions__row-header">Play</th>
                    <th>
                      <PlayCircleIcon
                        className="maqam-transpositions__play-circle-icon"
                        onClick={() => playNoteFrequency(parseInt(descendingDetails[0].frequency))}
                      />
                    </th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell"></th>
                        <th>
                          <PlayCircleIcon
                            className="maqam-transpositions__play-circle-icon"
                            onClick={() => playNoteFrequency(parseInt(descendingDetails[i + 1].frequency))}
                          />
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                  <tr>
                    <th className="maqam-transpositions__row-header">Ajnas</th>
                    {descendingMaqamJinsIntervals.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell" colSpan={2}>
                          {pat.jins && (
                            <>
                              {pat.jins.getName()}
                              <button
                                className="maqam-transpositions__jins-button"
                                onClick={() => {
                                  const frequencies = descendingDetails
                                    .slice(i, i + pat.intervalPattern.length)
                                    .map((cell) => parseInt(cell.frequency));
                                  playSequence(frequencies);
                                }}
                              >
                                Play
                              </button>
                              <button
                                className="maqam-transpositions__jins-button"
                                onClick={() => {
                                  const noteNames = descendingDetails.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
                                  setHighlightedNotes({ index: row + 1.5, noteNames });
                                }}
                              >
                                Highlight
                              </button>
                            </>
                          )}
                        </th>
                      </React.Fragment>
                    ))}
                    <th className="maqam-transpositions__header-cell"></th>
                  </tr>
                  <tr>
                    <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingDetails.length - 1) * 2} />
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
