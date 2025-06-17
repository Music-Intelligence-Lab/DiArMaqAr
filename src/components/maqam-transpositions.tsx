"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getMaqamTranspositions } from "@/functions/transpose";
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

  // let noOctaveMaqam = false;

  if (numberOfMaqamNotes <= 7) {
    // noOctaveMaqam = true;
    romanNumerals[numberOfMaqamNotes] = "I+";
    const firstCell = ascendingMaqamCells[0];
    const octaveCell = shiftCell(firstCell, 1);
    ascendingMaqamCells = [...ascendingMaqamCells, octaveCell];
    descendingMaqamCells = [octaveCell, ...descendingMaqamCells];
  }

  const valueType = allCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const maqamTranspositions = getMaqamTranspositions(allCells, ajnas, selectedMaqam, true, centsTolerance);

  function renderTranspositionRow(transposition: MaqamTransposition, ascending: boolean, rowIndex: number) {
    const cells = ascending ? transposition.ascendingCells : transposition.descendingCells;
    const oppositeCells = ascending ? descendingMaqamCells : ascendingMaqamCells;
    const intervals = ascending ? transposition.ascendingCellIntervals : transposition.descendingCellIntervals;
    const jinsTranspositions = ascending ? transposition.ascendingJinsTranspositions : transposition.descendingJinsTranspositions;

    return (
      <>
        {/* Ascending Scale Degrees Row */}
        <tr>
          <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
            {ascending ? "↗" : "↘"}
          </td>
        </tr>
        <tr>
          <th className="maqam-transpositions__row-header">Scale Degrees</th>
          {cells.map((_, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-cell_scale-degrees"></th>}
              <th className="maqam-transpositions__header-cell_scale-degrees-number">{romanNumerals[i]}</th>
            </React.Fragment>
          ))}
        </tr>
        {/* Ascending Note Names Row */}
        <tr>
          <th className="maqam-transpositions__row-header">Note Names </th>
          {cells.map((cell, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
              <th
                className={
                  (!oppositeCells.includes(cell) ? "maqam-transpositions__header-cell_unique " : "maqam-transpositions__header-cell ") +
                  (isCellHighlighted(rowIndex + (ascending ? 0:0.5), cell.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
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
          <th className="maqam-transpositions__header-cell">{cells[0].originalValue}</th>
          {intervals.map((interval, i) => (
            <React.Fragment key={i}>
              <th className="maqam-transpositions__header-cell">{useRatio ? `(${interval.decimalRatio})` : `${interval.cents.toFixed(3)}`}</th>
              <th className="maqam-transpositions__header-cell">{cells[i + 1].originalValue}</th>
            </React.Fragment>
          ))}
        </tr>
        {valueType !== "cents" && (
          <tr>
            <th className="maqam-transpositions__row-header">cents (¢)</th>
            <th className="maqam-transpositions__header-cell">{parseFloat(cells[0].cents).toFixed(3)}</th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">{interval.cents}</th>
                <th className="maqam-transpositions__header-cell">{parseFloat(cells[i + 1].cents).toFixed(3)}</th>
              </React.Fragment>
            ))}
          </tr>
        )}
        {/* Ascending Play Buttons Row */}
        <tr>
          <th className="maqam-transpositions__row-header">Play</th>
          {cells.map(({ frequency }, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-cell"></th>}
              <th>
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(frequency))} />
              </th>
            </React.Fragment>
          ))}
        </tr>
        {jinsTranspositions && <tr>
          <th className="maqam-transpositions__row-header">Ajnas</th>
          {jinsTranspositions.map((jinsTransposition, i) => (
            <React.Fragment key={i}>
              <th className="maqam-transpositions__header-cell" colSpan={2}>
                {jinsTransposition && (
                  <>
                    {jinsTransposition.name}
                    <button
                      className="maqam-transpositions__jins-button"
                      onClick={() => {
                        const frequencies = jinsTransposition.cells.map(cell => parseInt(cell.frequency));
                        playSequence(frequencies);
                      }}
                    >
                      Play
                    </button>
                    <button
                      className="maqam-transpositions__jins-button"
                      onClick={() => {
                        const noteNames = jinsTransposition.cells.map(cell => cell.noteName);
                        setHighlightedNotes({ index: rowIndex + (ascending ? 0:0.5) , noteNames });
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
        </tr>}
        <tr>
          <td className="maqam-transpositions__spacer" colSpan={2 + (cells.length - 1) * 2} />
        </tr>
      </>
    );
  }

  function renderTransposition(transposition: MaqamTransposition, index: number) {
    const tahlil = transposition.tahlil;
    const ascendingCells = transposition.ascendingCells;
    const descendingCells = transposition.descendingCells;
    return (
      <>
        <tr>
          <th
            className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${ascendingCells[0].octave}`}
            rowSpan={16}
          >
            {index + 1}
          </th>

          <th className="maqam-transpositions__header" colSpan={3 + (ascendingCells.length - 1) * 2}>
            <span className="maqam-transpositions__transposition-title">{`Darajat al-Istiqrār (tonic/finalis): ${
              ascendingCells[0].noteName
            } (${getEnglishNoteName(ascendingCells[0].noteName)})`}</span>
            <button
              className="maqam-transpositions__button"
              onClick={() => {
                setSelectedCells(ascendingCells);
                setSelectedMaqamTransposition(tahlil ? null : transposition);
              }}
            >
              Select & Load to Keyboard
            </button>
            <button
              className="maqam-transpositions__button"
              onClick={async () => {
                const ascFreq = ascendingCells.map((cell) => parseInt(cell.frequency));
                const descFreq = descendingCells.map((cell) => parseInt(cell.frequency)).reverse();
                await playSequence(ascFreq);
                await playSequence(descFreq, false);
              }}
            >
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              {"Ascending > Descending"}
            </button>
            <button className="maqam-transpositions__button" onClick={() => playSequence(ascendingCells.map((cell) => parseInt(cell.frequency)))}>
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              Ascending
            </button>
            <button
              className="maqam-transpositions__button"
              onClick={() => playSequence(descendingCells.map((cell) => parseInt(cell.frequency)).reverse(), false)}
            >
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              Descending
            </button>
          </th>
        </tr>

        {renderTranspositionRow(transposition, true, index)}
        {renderTranspositionRow(transposition, false, index)}
      </>
    );
  }

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
          {renderTransposition(maqamTranspositions[0], 0)}
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
          {maqamTranspositions.slice(1)
            .map((maqamTransposition, row) => {
              return (
                <React.Fragment key={row}>
                  {renderTransposition(maqamTransposition, row)}
                  <tr>
                    <td className="maqam-transpositions__spacer" colSpan={2 + (maqamTransposition.ascendingCells.length - 1) * 2} />
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
