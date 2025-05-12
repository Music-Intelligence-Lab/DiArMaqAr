// components/JinsTranspositions.tsx
"use client";

import React from "react";
import { SelectedCell, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";

export default function JinsTranspositions() {
  const { selectedJins, selectedTuningSystem, selectedCells, getAllCells, getSelectedCellDetails, centsTolerance, setCentsTolerance } =
    useAppContext();

  if (!selectedJins || !selectedTuningSystem || selectedCells.length < 2) return null;

  // retrieve details for each selected cell
  const selectedCellDetails = selectedCells.map((cell) => getSelectedCellDetails(cell));

  // determine mode based on originalValueType
  const valueType = selectedCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  // helpers for ratio and gcd
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const computeRatio = (prev: string, next: string) => {
    const [a, b] = prev.split("/").map(Number);
    const [c, d] = next.split("/").map(Number);
    const num = c * b;
    const den = d * a;
    const g = gcd(num, den);
    return `${num / g}:${den / g}`;
  };

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
    return  oct !== 3;
  });

  return (
    <div className="jins‑transpositions">
      <h2 className="jins‑transpositions__title">{selectedJins.getName()}</h2>

      <table className="jins‑transpositions__table">
        <thead>
          <tr>
            <th className="jins‑transpositions__header">
              Transpositions{" "}
              {!useRatio && <> / Cents Tolerance: <input
                className="jins‑transpositions__input"
                type="number"
                value={centsTolerance ?? 0}
                onChange={(e) => setCentsTolerance(Number(e.target.value))}
              /></>}
            </th>
            <th className="jins‑transpositions__header">
              {selectedCellDetails[0].noteName + ` (${getEnglishNoteName(selectedCellDetails[0].noteName)})`}
            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins‑transpositions__header"></th>
                <th className="jins‑transpositions__header">
                  {selectedCellDetails[i + 1].noteName + ` (${getEnglishNoteName(selectedCellDetails[i + 1].noteName)})`}
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="jins‑transpositions__header">
            </th>
            <th className="jins‑transpositions__header">
              {selectedCellDetails[0].fraction}
            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins‑transpositions__header">{useRatio ? `(${pat.ratio})` : `≈${(pat.diff ?? 0).toFixed(1)}¢`}</th>
                <th className="jins‑transpositions__header">
                  {selectedCellDetails[i + 1].fraction}
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredSeqs.map((seq, row) => {
            const details = seq.map(getSelectedCellDetails);
            return (
              <React.Fragment key={row}>
              <tr>
                <td className="jins‑transpositions__cell">{`${selectedJins.getName()} al-${details[0].noteName}`}</td>
                <td className="jins‑transpositions__cell">
                  {details[0].noteName + ` (${getEnglishNoteName(details[0].noteName)})`}
                </td>
                {details.slice(1).map((d, j) => (
                  <React.Fragment key={j}>
                    <td className="jins‑transpositions__cell">
                    </td>
                    <td className="jins‑transpositions__cell">
                      {d.noteName + ` (${getEnglishNoteName(d.noteName)})`}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <td className="jins‑transpositions__cell"></td>
                <td className="jins‑transpositions__cell">
                  {details[0].originalValue}
                </td>
                {details.slice(1).map((d, j) => (
                  <React.Fragment key={j}>
                    <td className="jins‑transpositions__cell">
                      {useRatio
                        ? `(${computeRatio(details[j].fraction, d.fraction)})`
                        : `≈${(parseFloat(d.originalValue) - parseFloat(details[j].originalValue)).toFixed(1)}¢`}
                    </td>
                    <td className="jins‑transpositions__cell">
                      {d.originalValue}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
