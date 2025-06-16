"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import Cell from "@/models/Cell";
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
    allCells,
    centsTolerance,
    setCentsTolerance,
    ajnas,
    setSelectedMaqamTransposition,
    shiftCell,
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

  let ascendingMaqamCells = allCells.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  let descendingMaqamCells = allCells.filter((cell) => descendingNoteNames.includes(cell.noteName)).reverse();

  const numberOfMaqamNotes = ascendingMaqamCells.length;

  let noOctaveMaqam = false;

  if (numberOfMaqamNotes <= 7) {
    noOctaveMaqam = true;
    romanNumerals[numberOfMaqamNotes] = "I+";
    const firstCell = ascendingMaqamCells[0];
    const octaveCell = shiftCell(firstCell, 1);
    ascendingMaqamCells = [...ascendingMaqamCells, octaveCell];
    descendingMaqamCells = [octaveCell, ...descendingMaqamCells];
  }

  const valueType = ascendingMaqamCells[0].originalValueType;
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

  const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCells, useRatio);

  const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCells, useRatio);

  const ascendingSequences: Cell[][] = getTranspositions(allCells, ascendingIntervalPattern, true, useRatio, centsTolerance);

  const descendingSequences: Cell[][] = getTranspositions(allCells, descendingIntervalPattern, false, useRatio, centsTolerance);

  const filteredSequences: { ascendingSequence: Cell[]; descendingSequence: Cell[] }[] = mergeTranspositions(ascendingSequences, descendingSequences);

  const ascendingAjnasIntervals: { jins: Jins; intervalPattern: Interval[] }[] = [];
  const descendingAjnasIntervals: { jins: Jins; intervalPattern: Interval[] }[] = [];

  for (const jins of ajnas) {
    const jinsCells = allCells.filter((cell) => jins.getNoteNames().includes(cell.noteName));
    if (jinsCells.length !== jins.getNoteNames().length) continue;
    const reverseJinsCells = [...jinsCells].reverse();
    const ascendingJinsIntervalPattern = getIntervalPattern(jinsCells, useRatio);
    ascendingAjnasIntervals.push({ jins, intervalPattern: ascendingJinsIntervalPattern });
    const descendingJinsIntervalPattern = getIntervalPattern(reverseJinsCells, useRatio);
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
              className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${ascendingMaqamCells[0].octave}`}
              rowSpan={16}
            >
              {1}
            </th>

            <th className="maqam-transpositions__header" colSpan={3 + (ascendingMaqamCells.length - 1) * 2}>
              <span className="maqam-transpositions__transposition-title">{`Darajat al-Istiqrār (tonic/finalis): ${
                ascendingMaqamCells[0].noteName
              } (${getEnglishNoteName(ascendingMaqamCells[0].noteName)})`}</span>
              <button
                className="maqam-transpositions__button"
                onClick={() => {
                  const transpositionNoteNames = ascendingMaqamCells.map((cell) => cell.noteName);

                  const newSelectedCells: Cell[] = [];

                  for (const cell of allCells) {
                    if (transpositionNoteNames.includes(cell.noteName)) {
                      if (!noOctaveMaqam || newSelectedCells.every((selectedCell) => selectedCell.index !== cell.index)) newSelectedCells.push(cell);
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
                  const ascFreq = ascendingMaqamCells.map((cell) => parseInt(cell.frequency));
                  const descFreq = descendingMaqamCells.map((cell) => parseInt(cell.frequency)).reverse();
                  await playSequence(ascFreq);
                  await playSequence(descFreq, false);
                }}
              >
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                {"Ascending > Descending"}
              </button>
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(ascendingMaqamCells.map((cell) => parseInt(cell.frequency)))}
              >
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                Ascending
              </button>
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(descendingMaqamCells.map((cell) => parseInt(cell.frequency)).reverse(), false)}
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
            {ascendingMaqamCells.map((_, idx) =>
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
            {ascendingMaqamCells.map((cell, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                <th
                  className={
                    (!descendingMaqamCells.includes(cell) ? "maqam-transpositions__header-cell_unique " : "maqam-transpositions__header-cell ") +
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
            <th className="maqam-transpositions__header-cell">{ascendingMaqamCells[0].originalValue}</th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">
                  {useRatio
                    ? `(${pat.ratio})`
                    : `(${(parseFloat(ascendingMaqamCells[i + 1].originalValue) - parseFloat(ascendingMaqamCells[i].originalValue)).toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-cell">{ascendingMaqamCells[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-cell">{parseFloat(ascendingMaqamCells[0].cents).toFixed(3)}</th>
              {ascendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-cell">
                    {" "}
                    ({(parseFloat(ascendingMaqamCells[i + 1].cents) - parseFloat(ascendingMaqamCells[i].cents)).toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-cell">{parseFloat(ascendingMaqamCells[i + 1].cents).toFixed(3)}</th>
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
                onClick={() => playNoteFrequency(parseInt(ascendingMaqamCells[0].frequency))}
              />
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onClick={() => playNoteFrequency(parseInt(ascendingMaqamCells[i + 1].frequency))}
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
                          const frequencies = ascendingMaqamCells.slice(i, i + pat.intervalPattern.length).map((cell) => parseInt(cell.frequency));
                          playSequence(frequencies);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const noteNames = ascendingMaqamCells.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
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
            <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingMaqamCells.length - 1) * 2} />
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
              .slice(0, ascendingMaqamCells.length)
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

            {descendingMaqamCells.map((cell, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                <th
                  className={
                    (!ascendingMaqamCells.includes(cell) ? "maqam-transpositions__header-cell_unique " : "maqam-transpositions__header-cell ") +
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
            <th className="maqam-transpositions__header-cell">{descendingMaqamCells[0].originalValue}</th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">
                  {useRatio
                    ? `(${pat.ratio})`
                    : `(${(parseFloat(descendingMaqamCells[i + 1].originalValue) - parseFloat(descendingMaqamCells[i].originalValue)).toFixed(3)})`}
                </th>
                <th className="maqam-transpositions__header-cell">{descendingMaqamCells[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-cell">{parseFloat(descendingMaqamCells[0].cents).toFixed(3)}</th>
              {descendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-cell">{`(${(
                    parseFloat(descendingMaqamCells[i + 1].cents) - parseFloat(descendingMaqamCells[i].cents)
                  ).toFixed(3)})`}</th>
                  <th className="maqam-transpositions__header-cell">{parseFloat(descendingMaqamCells[i + 1].cents).toFixed(3)}</th>
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
                onClick={() => playNoteFrequency(parseInt(descendingMaqamCells[0].frequency))}
              />
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th>
                  <PlayCircleIcon
                    className="maqam-transpositions__play-circle-icon"
                    onClick={() => playNoteFrequency(parseInt(descendingMaqamCells[i + 1].frequency))}
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
                          const frequencies = descendingMaqamCells.slice(i, i + pat.intervalPattern.length).map((cell) => parseInt(cell.frequency));
                          playSequence(frequencies);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const noteNames = descendingMaqamCells.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
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
            .filter((sequence) => sequence.ascendingSequence[0].noteName !== ascendingMaqamCells[0].noteName)
            .map((seq, row) => {
              const ascendingCells = seq.ascendingSequence;
              const descendingCells = seq.descendingSequence;
              const colCount = 2 + (ascendingCells.length - 1) * 2;
              const rowCount = 16;

              return (
                <React.Fragment key={row}>
                  <tr>
                    <td
                      className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${ascendingCells[0].octave}`}
                      rowSpan={rowCount}
                    >
                      {row + 2}
                    </td>
                    <td className="maqam-transpositions__maqam-name-row" colSpan={colCount + 1}>
                      <span className="maqam-transpositions__transposition-title">{`${selectedMaqam.getName()} al-${
                        ascendingCells[0].noteName
                      } (${getEnglishNoteName(ascendingCells[0].noteName)})`}</span>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => {
                          const transpositionNoteNames = ascendingCells.map((cell) => cell.noteName);

                          const newSelectedCells: Cell[] = [];

                          for (const cell of allCells) {
                            if (transpositionNoteNames.includes(cell.noteName)) {
                              if (!noOctaveMaqam || newSelectedCells.every((selectedCell) => selectedCell.index !== cell.index))
                                newSelectedCells.push(cell);
                            }
                          }
                          setSelectedCells(newSelectedCells);
                          const transposition: MaqamTransposition = {
                            name: `${selectedMaqam.getName()} al-${ascendingCells[0].noteName} (${getEnglishNoteName(ascendingCells[0].noteName)})`,
                            ascendingNoteNames: ascendingCells
                              .filter((cell) => !noOctaveMaqam || !newSelectedCells.some((c) => c.index === cell.index))
                              .map((cell) => cell.noteName),
                            descendingNoteNames: descendingCells
                              .filter((cell) => !noOctaveMaqam || !newSelectedCells.some((c) => c.index === cell.index))
                              .map((cell) => cell.noteName),
                          };
                          setSelectedMaqamTransposition(transposition);
                        }}
                      >
                        Select & Load to Keyboard
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={async () => {
                          const ascFreq = ascendingCells.map((cell) => parseInt(cell.frequency));
                          const descFreq = descendingCells.map((cell) => parseInt(cell.frequency));
                          await playSequence(ascFreq);
                          await playSequence(descFreq, false);
                        }}
                      >
                        <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        Ascending {">"} Descending
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => playSequence(ascendingCells.map((cell) => parseInt(cell.frequency)))}
                      >
                        <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        Ascending
                      </button>
                      <button
                        className="maqam-transpositions__button"
                        onClick={() => playSequence(descendingCells.map((cell) => parseInt(cell.frequency)))}
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
                    {ascendingCells.map((_, idx) =>
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
                    {ascendingCells.map((cell, i) => (
                      <React.Fragment key={i}>
                        {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                        <th
                          className={
                            (!descendingCells.map((details) => details.noteName).includes(cell.noteName)
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
                    <th className="maqam-transpositions__header-cell">{ascendingCells[0].originalValue}</th>
                    {ascendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell">
                          {useRatio
                            ? `(${pat.ratio})`
                            : `(${(parseFloat(ascendingCells[i + 1].originalValue) - parseFloat(ascendingCells[i].originalValue)).toFixed(3)})`}
                        </th>
                        <th className="maqam-transpositions__header-cell">{ascendingCells[i + 1].originalValue}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                  {valueType !== "cents" && (
                    <tr>
                      <th className="maqam-transpositions__row-header">cents (¢)</th>
                      <th className="maqam-transpositions__header-cell">{parseFloat(ascendingCells[0].cents).toFixed(3)}</th>
                      {ascendingIntervalPattern.map((pat, i) => (
                        <React.Fragment key={i}>
                          <th className="maqam-transpositions__header-cell">
                            {" "}
                            ({(parseFloat(ascendingCells[i + 1].cents) - parseFloat(ascendingCells[i].cents)).toFixed(3)})
                          </th>
                          <th className="maqam-transpositions__header-cell">{parseFloat(ascendingCells[i + 1].cents).toFixed(3)}</th>
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
                        onClick={() => playNoteFrequency(parseInt(ascendingCells[0].frequency))}
                      />
                    </th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell"></th>
                        <th>
                          <PlayCircleIcon
                            className="maqam-transpositions__play-circle-icon"
                            onClick={() => playNoteFrequency(parseInt(ascendingCells[i + 1].frequency))}
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
                                  const frequencies = ascendingCells.slice(i, i + pat.intervalPattern.length).map((cell) => parseInt(cell.frequency));
                                  playSequence(frequencies);
                                }}
                              >
                                Play
                              </button>
                              <button
                                className="maqam-transpositions__jins-button"
                                onClick={() => {
                                  const noteNames = ascendingCells.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
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
                    <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingCells.length - 1) * 2} />
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
                      .slice(0, ascendingCells.length)
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

                    {descendingCells.map((cell, i) => (
                      <React.Fragment key={i}>
                        {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
                        <th
                          className={
                            (!ascendingCells.map((details) => details.noteName).includes(cell.noteName)
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
                    <th className="maqam-transpositions__header-cell">{descendingCells[0].originalValue}</th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell">
                          {useRatio
                            ? `(${pat.ratio})`
                            : `(${(parseFloat(descendingCells[i + 1].originalValue) - parseFloat(descendingCells[i].originalValue)).toFixed(3)})`}
                        </th>
                        <th className="maqam-transpositions__header-cell">{descendingCells[i + 1].originalValue}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                  {valueType !== "cents" && (
                    <tr>
                      <th className="maqam-transpositions__row-header">cents (¢)</th>
                      <th className="maqam-transpositions__header-cell">{parseFloat(descendingCells[0].cents).toFixed(3)}</th>
                      {descendingIntervalPattern.map((pat, i) => (
                        <React.Fragment key={i}>
                          <th className="maqam-transpositions__header-cell">{`(${(
                            parseFloat(descendingCells[i + 1].cents) - parseFloat(descendingCells[i].cents)
                          ).toFixed(3)})`}</th>
                          <th className="maqam-transpositions__header-cell">{parseFloat(descendingCells[i + 1].cents).toFixed(3)}</th>
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
                        onClick={() => playNoteFrequency(parseInt(descendingCells[0].frequency))}
                      />
                    </th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam-transpositions__header-cell"></th>
                        <th>
                          <PlayCircleIcon
                            className="maqam-transpositions__play-circle-icon"
                            onClick={() => playNoteFrequency(parseInt(descendingCells[i + 1].frequency))}
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
                                  const frequencies = descendingCells
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
                                  const noteNames = descendingCells.slice(i, i + pat.intervalPattern.length).map((cell) => cell.noteName);
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
                    <td className="maqam-transpositions__spacer" colSpan={2 + (ascendingCells.length - 1) * 2} />
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
