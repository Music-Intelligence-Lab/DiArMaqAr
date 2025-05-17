// components/MaqamTranspositions.tsx
"use client";

import React from "react";
import { SelectedCell, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import computeRatio, { convertRatioToNumber } from "@/functions/computeRatio";

export default function MaqamTranspositions() {
  const {
    selectedMaqam,
    selectedTuningSystem,
    selectedCells,
    setSelectedCells,
    getAllCells,
    getSelectedCellDetails,
    centsTolerance,
    setCentsTolerance,
    playNoteFrequency,
    playSequence,
  } = useAppContext();

  if (!selectedMaqam || !selectedTuningSystem || selectedCells.length < 2) return null;

  const ascendingNoteNames = selectedMaqam.getAscendingNoteNames();
  const descendingNoteNames = selectedMaqam.getDescendingNoteNames();

  // retrieve details for each selected cell
  const selectedCellDetails = selectedCells.map((cell) => getSelectedCellDetails(cell));

  const allCells = getAllCells();

  const ascendingMaqamCellDetails = allCells.map((cell) => getSelectedCellDetails(cell)).filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCellDetails = allCells
    .map((cell) => getSelectedCellDetails(cell))
    .filter((cell) => descendingNoteNames.includes(cell.noteName))
    .reverse();

  // determine mode based on originalValueType
  const valueType = selectedCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  // build interval pattern: for ratios or cent/stringLength diffs
  type Pattern = { ratio?: string; diff?: number };
  const ascendingIntervalPattern: Pattern[] = ascendingMaqamCellDetails.slice(1).map((det, i) => {
    if (useRatio) {
      return {
        ratio: computeRatio(ascendingMaqamCellDetails[i].fraction, det.fraction),
      };
    } else {
      const prevVal = parseFloat(ascendingMaqamCellDetails[i].originalValue);
      const curVal = parseFloat(det.originalValue);
      return { diff: curVal - prevVal };
    }
  });

  const descendingIntervalPattern: Pattern[] = descendingMaqamCellDetails.slice(1).map((det, i) => {
    if (useRatio) {
      return {
        ratio: computeRatio(descendingMaqamCellDetails[i].fraction, det.fraction),
      };
    } else {
      const prevVal = parseFloat(descendingMaqamCellDetails[i].originalValue);
      const curVal = parseFloat(det.originalValue);
      return { diff: curVal - prevVal };
    }
  });

  const ascendingSequences: SelectedCell[][] = [];

  // build matching sequences recursively
  const buildAscendingSequences = (seq: SelectedCell[], cellIndex: number, intervalIndex: number) => {
    if (intervalIndex === ascendingIntervalPattern.length) {
      ascendingSequences.push(seq);
      return;
    }
    const last = seq[seq.length - 1];
    const lastDet = getSelectedCellDetails(last);

    for (let i = cellIndex; i < allCells.length; i++) {
      const candidate = allCells[i];

      const candDet = getSelectedCellDetails(candidate);
      const pat = ascendingIntervalPattern[intervalIndex];

      if (useRatio) {
        const computedRatio = computeRatio(lastDet.fraction, candDet.fraction);
        if (computedRatio === pat.ratio) {
          buildAscendingSequences([...seq, candidate], i + 1, intervalIndex + 1);
          break;
        } else if (convertRatioToNumber(computedRatio) > convertRatioToNumber(pat.ratio ?? "")) {
          break;
        }
      } else {
        const lastVal = parseFloat(lastDet.originalValue);
        const candVal = parseFloat(candDet.originalValue);
        const diff = candVal - lastVal;
        if (Math.abs(diff - (pat.diff ?? 0)) <= centsTolerance) {
          buildAscendingSequences([...seq, candidate], i + 1, intervalIndex + 1);
          break;
        } else if (Math.abs(pat.diff ?? 0) + centsTolerance < Math.abs(diff)) {
          break;
        }
      }
    }
  };

  const descendingSequences: SelectedCell[][] = [];

  const buildDescendingSequences = (seq: SelectedCell[], cellIndex: number, intervalIndex: number) => {
    if (intervalIndex === descendingIntervalPattern.length) {
      descendingSequences.push(seq);
      return;
    }
    const last = seq[seq.length - 1];
    const lastDet = getSelectedCellDetails(last);

    for (let i = cellIndex; i >= 0; i--) {
      const candidate = allCells[i];

      const candDet = getSelectedCellDetails(candidate);
      const pat = descendingIntervalPattern[intervalIndex];

      if (useRatio) {
        const computedRatio = computeRatio(lastDet.fraction, candDet.fraction);
        if (computedRatio === pat.ratio) {
          buildDescendingSequences([...seq, candidate], i - 1, intervalIndex + 1);
          break;
        } else if (convertRatioToNumber(computedRatio) < convertRatioToNumber(pat.ratio ?? "")) {
          break;
        }
      } else {
        const lastVal = parseFloat(lastDet.originalValue);
        const candVal = parseFloat(candDet.originalValue);
        const diff = candVal - lastVal;

        if (Math.abs(diff - (pat.diff ?? 0)) <= centsTolerance) {
          buildDescendingSequences([...seq, candidate], i - 1, intervalIndex + 1);
          break;
        } else if (Math.abs(pat.diff ?? 0) + centsTolerance < Math.abs(diff)) {
          break;
        }
      }
    }
  };

  for (let i = 0; i < allCells.length; i++) {
    const startingCell = allCells[i];

    buildAscendingSequences([startingCell], i + 1, 0);
    buildDescendingSequences([startingCell], i - 1, 0);
  }

  // only sequences starting in octave 1 or 2
  const filteredAscendingSequences = ascendingSequences.filter((seq) => {
    const oct = seq[0].octave;
    return oct !== 3;
  });

  const filteredDescendingSequences = descendingSequences.filter((seq) => {
    const oct = seq[0].octave;
    return oct !== 3;
  });

  const filteredSequences: { ascendingSequence: SelectedCell[]; descendingSequence: SelectedCell[] }[] = [];

  filteredAscendingSequences.forEach((ascSeq) => {
    const ascNoteName = getSelectedCellDetails(ascSeq[0]).noteName;
    const descSeq = filteredDescendingSequences.find((descSeq) => {
      const descNoteName = getSelectedCellDetails(descSeq[descSeq.length - 1]).noteName;
      return ascNoteName === descNoteName;
    });
    if (descSeq) {
      filteredSequences.push({ ascendingSequence: ascSeq, descendingSequence: descSeq });
    }
  });

  return (
    <div className="maqam‑transpositions">
      <h2 className="maqam‑transpositions__title">
        Transpositions
        {!useRatio && (
          <>
            {" "}
            / Cents Tolerance:{" "}
            <input
              className="maqam‑transpositions__input"
              type="number"
              value={centsTolerance ?? 0}
              onChange={(e) => setCentsTolerance(Number(e.target.value))}
            />
          </>
        )}
      </h2>

      <table className="maqam‑transpositions__table">
        <thead>
          <tr>
            <th className="maqam‑transpositions__header" colSpan={2 + (ascendingMaqamCellDetails.length - 1) * 2}>
              <button
                className="maqam‑transpositions__button"
                onClick={() => {
                  const ascFreq = ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency));
                  const descFreq = descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency));
                  const allFreq = [...ascFreq, ...descFreq];
                  playSequence(allFreq);
                }}
              >
                {`${selectedMaqam.getName()} al-${ascendingMaqamCellDetails[0].noteName}`}
              </button>
              <button
                className="maqam‑transpositions__button"
                onClick={() => {
                  const transpositionNoteNames = ascendingMaqamCellDetails.map((cell) => cell.noteName);

                  const newSelectedCells = [];

                  for (const cell of allCells) {
                    const cellDetails = getSelectedCellDetails(cell);
                    if (transpositionNoteNames.includes(cellDetails.noteName)) {
                      newSelectedCells.push(cell);
                    }
                  }
                  setSelectedCells(newSelectedCells);
                }}
              >
                Select Ascending
              </button>
              <button
                className="maqam‑transpositions__button"
                onClick={() => {
                  const transpositionNoteNames = descendingMaqamCellDetails.map((cell) => cell.noteName);

                  const newSelectedCells = [];

                  for (const cell of allCells) {
                    const cellDetails = getSelectedCellDetails(cell);
                    if (transpositionNoteNames.includes(cellDetails.noteName)) {
                      newSelectedCells.push(cell);
                    }
                  }
                  setSelectedCells(newSelectedCells);
                }}
              >
                Select Descending
              </button>
            </th>
          </tr>
          <tr>
            <th className="maqam‑transpositions__header">
              <button
                className="maqam‑transpositions__button"
                onClick={() => playSequence(ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)))}
              >
                Ascending
              </button>
            </th>
            <th className="maqam‑transpositions__header">
              <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[0].frequency))}>
                {ascendingMaqamCellDetails[0].noteName + ` (${getEnglishNoteName(ascendingMaqamCellDetails[0].noteName)})`}
              </button>
            </th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header"></th>
                <th className="maqam‑transpositions__header">
                  <button
                    className="maqam‑transpositions__button"
                    onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[i + 1].frequency))}
                  >
                    {ascendingMaqamCellDetails[i + 1].noteName + ` (${getEnglishNoteName(ascendingMaqamCellDetails[i + 1].noteName)})`}
                  </button>
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam‑transpositions__header">{valueType}</th>
            <th className="maqam‑transpositions__header">{ascendingMaqamCellDetails[0].originalValue}</th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header">{useRatio ? `(${pat.ratio})` : `≈${(pat.diff ?? 0).toFixed(1)}`}</th>
                <th className="maqam‑transpositions__header">{ascendingMaqamCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam‑transpositions__header">cents (¢)</th>
              <th className="maqam‑transpositions__header">{ascendingMaqamCellDetails[0].cents}</th>
              {ascendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam‑transpositions__header">{`≈${
                    parseInt(ascendingMaqamCellDetails[i].cents) - parseInt(ascendingMaqamCellDetails[i + 1].cents)
                  }`}</th>
                  <th className="maqam‑transpositions__header">{ascendingMaqamCellDetails[i + 1].cents}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
          <tr>
            <th className="maqam‑transpositions__header">
              <button
                className="maqam‑transpositions__button"
                onClick={() => playSequence(descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)))}
              >
                Descending
              </button>
            </th>
            <th className="maqam‑transpositions__header">
              <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[0].frequency))}>
                {descendingMaqamCellDetails[0].noteName + ` (${getEnglishNoteName(descendingMaqamCellDetails[0].noteName)})`}
              </button>
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header"></th>
                <th className="maqam‑transpositions__header">
                  <button
                    className="maqam‑transpositions__button"
                    onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[i + 1].frequency))}
                  >
                    {descendingMaqamCellDetails[i + 1].noteName + ` (${getEnglishNoteName(descendingMaqamCellDetails[i + 1].noteName)})`}
                  </button>
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam‑transpositions__header">{valueType}</th>
            <th className="maqam‑transpositions__header">{descendingMaqamCellDetails[0].originalValue}</th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header">{useRatio ? `(${pat.ratio})` : `≈${(pat.diff ?? 0).toFixed(1)}`}</th>
                <th className="maqam‑transpositions__header">{descendingMaqamCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam‑transpositions__header">cents (¢)</th>
              <th className="maqam‑transpositions__header">{descendingMaqamCellDetails[0].cents}</th>
              {descendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam‑transpositions__header">{`≈${
                    parseInt(descendingMaqamCellDetails[i].cents) - parseInt(descendingMaqamCellDetails[i + 1].cents)
                  }`}</th>
                  <th className="maqam‑transpositions__header">{descendingMaqamCellDetails[i + 1].cents}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {filteredSequences.map((seq, row) => {
            const ascendingDetails = seq.ascendingSequence.map(getSelectedCellDetails);
            const descendingDetails = seq.descendingSequence.map(getSelectedCellDetails);
            const colCount = 2 + (ascendingDetails.length - 1) * 2;
            if (ascendingMaqamCellDetails[0].noteName === ascendingDetails[0].noteName) return null;

            return (
              <React.Fragment key={row}>
                <tr>
                  <td className="maqam-transpositions__spacer" colSpan={colCount} />
                </tr>
                <tr>
                  <td className="maqam‑transpositions__cell" colSpan={colCount}>
                    <button
                      className="maqam‑transpositions__button"
                      onClick={() => {
                        const ascFreq = ascendingDetails.map((cell) => parseInt(cell.frequency));
                        const descFreq = descendingDetails.map((cell) => parseInt(cell.frequency));
                        const allFreq = [...ascFreq, ...descFreq];
                        playSequence(allFreq);
                      }}
                    >
                      {`${selectedMaqam.getName()} al-${ascendingDetails[0].noteName}`}
                    </button>
                    <button
                      className="maqam‑transpositions__button"
                      onClick={() => {
                        const transpositionNoteNames = ascendingDetails.map((cell) => cell.noteName);

                        const newSelectedCells = [];

                        for (const cell of allCells) {
                          const cellDetails = getSelectedCellDetails(cell);
                          if (transpositionNoteNames.includes(cellDetails.noteName)) {
                            newSelectedCells.push(cell);
                          }
                        }
                        setSelectedCells(newSelectedCells);
                      }}
                    >
                      Select Ascending
                    </button>
                    <button
                      className="maqam‑transpositions__button"
                      onClick={() => {
                        const transpositionNoteNames = descendingDetails.map((cell) => cell.noteName);

                        const newSelectedCells = [];

                        for (const cell of allCells) {
                          const cellDetails = getSelectedCellDetails(cell);
                          if (transpositionNoteNames.includes(cellDetails.noteName)) {
                            newSelectedCells.push(cell);
                          }
                        }
                        setSelectedCells(newSelectedCells);
                      }}
                    >
                      Select Descending
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="maqam‑transpositions__cell">
                    <button
                      className="maqam‑transpositions__button"
                      onClick={() => playSequence(ascendingDetails.map((cell) => parseInt(cell.frequency)))}
                    >
                      Ascending
                    </button>
                  </td>
                  <td className="maqam‑transpositions__cell">
                    <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(ascendingDetails[0].frequency))}>
                      {ascendingDetails[0].noteName + ` (${getEnglishNoteName(ascendingDetails[0].noteName)})`}
                    </button>
                  </td>
                  {ascendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell"></td>
                      <td className="maqam‑transpositions__cell">
                        <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(d.frequency))}>
                          {d.noteName + ` (${getEnglishNoteName(d.noteName)})`}
                        </button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="maqam‑transpositions__cell">{valueType}</td>
                  <td className="maqam‑transpositions__cell">{ascendingDetails[0].originalValue}</td>
                  {ascendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(ascendingDetails[j].fraction, d.fraction)})`
                          : `≈${(parseFloat(d.originalValue) - parseFloat(ascendingDetails[j].originalValue)).toFixed(1)}`}
                      </td>
                      <td className="maqam‑transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <th className="maqam‑transpositions__cell">cents (¢)</th>
                    <th className="maqam‑transpositions__cell">{ascendingDetails[0].cents}</th>
                    {ascendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam‑transpositions__cell">{`≈${
                          parseInt(ascendingDetails[i].cents) - parseInt(ascendingDetails[i + 1].cents)
                        }`}</th>
                        <th className="maqam‑transpositions__cell">{ascendingDetails[i + 1].cents}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="maqam‑transpositions__cell">
                    <button
                      className="maqam‑transpositions__button"
                      onClick={() => playSequence(descendingDetails.map((cell) => parseInt(cell.frequency)))}
                    >
                      Descending
                    </button>
                  </td>
                  <td className="maqam‑transpositions__cell">
                    <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(descendingDetails[0].frequency))}>
                      {descendingDetails[0].noteName + ` (${getEnglishNoteName(descendingDetails[0].noteName)})`}
                    </button>
                  </td>
                  {descendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell"></td>
                      <td className="maqam‑transpositions__cell">
                        <button className="maqam‑transpositions__button" onClick={() => playNoteFrequency(parseInt(d.frequency))}>
                          {d.noteName + ` (${getEnglishNoteName(d.noteName)})`}
                        </button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="maqam‑transpositions__cell">{valueType}</td>
                  <td className="maqam‑transpositions__cell">{descendingDetails[0].originalValue}</td>
                  {descendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(descendingDetails[j].fraction, d.fraction)})`
                          : `≈${(parseFloat(d.originalValue) - parseFloat(descendingDetails[j].originalValue)).toFixed(1)}`}
                      </td>
                      <td className="maqam‑transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <th className="maqam‑transpositions__cell">cents (¢)</th>
                    <th className="maqam‑transpositions__cell">{descendingDetails[0].cents}</th>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="maqam‑transpositions__cell">{`≈${
                          parseInt(descendingDetails[i].cents) - parseInt(descendingDetails[i + 1].cents)
                        }`}</th>
                        <th className="maqam‑transpositions__cell">{descendingDetails[i + 1].cents}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
