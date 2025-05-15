// components/JinsTranspositions.tsx
"use client";

import React from "react";
import { SelectedCell, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import computeRatio from "@/functions/computeRatio";

export default function JinsTranspositions() {
  const {
    selectedJins,
    selectedTuningSystem,
    selectedCells,
    setSelectedCells,
    getAllCells,
    getSelectedCellDetails,
    centsTolerance,
    setCentsTolerance,
    playNoteFrequency,
    playSequence
  } = useAppContext();

  if (!selectedJins || !selectedTuningSystem || selectedCells.length < 2) return null;

  // retrieve details for each selected cell
  const selectedCellDetails = selectedCells.map((cell) => getSelectedCellDetails(cell));

  // determine mode based on originalValueType
  const valueType = selectedCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  // build interval pattern: for ratios or cent/stringLength diffs
  type Pattern = { ratio?: string; diff?: number };
  const intervalPattern: Pattern[] = selectedCellDetails.slice(1).map((det, i) => {
    if (useRatio) {
      return {
        ratio: computeRatio(selectedCellDetails[i].fraction, det.fraction),
      };
    } else {
      const prevVal = parseFloat(selectedCellDetails[i].originalValue);
      const curVal = parseFloat(det.originalValue);
      return { diff: curVal - prevVal };
    }
  });

  const allCells = getAllCells();
  const sequences: SelectedCell[][] = [];

  // build matching sequences recursively
  const buildSeq = (seq: SelectedCell[], idx: number) => {
    if (idx === intervalPattern.length) {
      sequences.push(seq);
      return;
    }
    const last = seq[seq.length - 1];
    const lastDet = getSelectedCellDetails(last);

    for (const candidate of allCells) {
      const candDet = getSelectedCellDetails(candidate);
      const pat = intervalPattern[idx];

      if (useRatio) {
        if (computeRatio(lastDet.fraction, candDet.fraction) === pat.ratio) {
          buildSeq([...seq, candidate], idx + 1);
        }
      } else {
        const lastVal = parseFloat(lastDet.originalValue);
        const candVal = parseFloat(candDet.originalValue);
        const diff = candVal - lastVal;
        if (Math.abs(diff - (pat.diff ?? 0)) <= centsTolerance) {
          buildSeq([...seq, candidate], idx + 1);
        }
      }
    }
  };

  allCells.forEach((start) => buildSeq([start], 0));

  // only sequences starting in octave 1 or 2
  const filteredSeqs = sequences.filter((seq) => {
    const oct = seq[0].octave;
    return oct !== 3;
  });

  return (
    <div className="jins-transpositions">
      <h2 className="jins-transpositions__title">
        Transpositions{" "}
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
      </h2>
      <table className="jins-transpositions__table">
        <thead>
          <tr>
            <th className="jins-transpositions__header">
              <button className="jins-transpositions__button" onClick={() => {
                playSequence(selectedCellDetails.map((cell) => parseInt(cell.frequency)));
              }}>
              {`${selectedJins.getName()} al-${selectedCellDetails[0].noteName}`}
              </button>
              </th>
            <th className="jins-transpositions__header">
              <button className="jins-transpositions__button" onClick={() => playNoteFrequency(parseInt(selectedCellDetails[0].frequency))}>
                {selectedCellDetails[0].noteName + ` (${getEnglishNoteName(selectedCellDetails[0].noteName)})`}
              </button>
            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header"></th>
                <th className="jins-transpositions__header">
                  <button className="jins-transpositions__button" onClick={() => playNoteFrequency(parseInt(selectedCellDetails[i + 1].frequency))}>
                    {selectedCellDetails[i + 1].noteName + ` (${getEnglishNoteName(selectedCellDetails[i + 1].noteName)})`}
                  </button>
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="jins-transpositions__header">{valueType}</th>
            <th className="jins-transpositions__header">{selectedCellDetails[0].originalValue}</th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header">{useRatio ? `(${pat.ratio})` : `≈${(pat.diff ?? 0).toFixed(1)}`}</th>
                <th className="jins-transpositions__header">{selectedCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="jins-transpositions__header">cents (¢)</th>
              <th className="jins-transpositions__header">{selectedCellDetails[0].cents}</th>
              {intervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header">{`≈${
                    parseInt(selectedCellDetails[i].cents) - parseInt(selectedCellDetails[i + 1].cents)
                  }`}</th>
                  <th className="jins-transpositions__header">{selectedCellDetails[i + 1].cents}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {filteredSeqs.map((seq, row) => {
            const details = seq.map(getSelectedCellDetails);
            const colCount = 2 + (details.length - 1) * 2;
            if (selectedCellDetails[0].noteName === details[0].noteName) return null;
            return (
              <React.Fragment key={row}>
                <tr>
                  <td className="jins-transpositions__spacer" colSpan={colCount} />
                </tr>
                <tr>
                  <td className="jins-transpositions__cell">
                    <button className="jins-transpositions__button" onClick={() => {
                      playSequence(details.map((cell) => parseInt(cell.frequency)));
                    }}>
                    {`${selectedJins.getName()} al-${details[0].noteName}`}
                    </button>
                    <button className="jins-transpositions__button" onClick={() => {
                      const transpositionNoteNames = details.map((cell) => cell.noteName);
                      
                      const newSelectedCells = [];

                      for (const cell of allCells) {
                        const cellDetails = getSelectedCellDetails(cell);
                        if (transpositionNoteNames.includes(cellDetails.noteName)) {
                          newSelectedCells.push(cell);
                        }
                      }
                      setSelectedCells(newSelectedCells);
                    }}>select</button>
                    </td>
                  <td className="jins-transpositions__cell">
                    <button className="jins-transpositions__button" onClick={() => playNoteFrequency(parseInt(details[0].frequency))}>
                      {details[0].noteName + ` (${getEnglishNoteName(details[0].noteName)})`}
                    </button>
                  </td>
                  {details.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="jins-transpositions__cell"></td>
                      <td className="jins-transpositions__cell">
                        <button className="jins-transpositions__button" onClick={() => playNoteFrequency(parseInt(d.frequency))}>
                          {d.noteName + ` (${getEnglishNoteName(d.noteName)})`}
                        </button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="jins-transpositions__cell">{valueType}</td>
                  <td className="jins-transpositions__cell">{details[0].originalValue}</td>
                  {details.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="jins-transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(details[j].fraction, d.fraction)})`
                          : `≈${(parseFloat(d.originalValue) - parseFloat(details[j].originalValue)).toFixed(1)}`}
                      </td>
                      <td className="jins-transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <th className="jins-transpositions__cell">cents (¢)</th>
                    <th className="jins-transpositions__cell">{details[0].cents}</th>
                    {intervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="jins-transpositions__cell">{`≈${parseInt(details[i].cents) - parseInt(details[i + 1].cents)}`}</th>
                        <th className="jins-transpositions__cell">{details[i + 1].cents}</th>
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
