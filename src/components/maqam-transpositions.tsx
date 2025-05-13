// components/MaqamTranspositions.tsx
"use client";

import React from "react";
import { SelectedCell, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";

export default function MaqamTranspositions() {
  const { selectedMaqam, selectedTuningSystem, selectedCells, getAllCells, getSelectedCellDetails, centsTolerance, setCentsTolerance, isAscending } =
    useAppContext();

  if (!selectedMaqam || !selectedTuningSystem || selectedCells.length < 2) return null;

  // retrieve details for each selected cell
  const selectedCellDetails = isAscending
    ? selectedCells.map((cell) => getSelectedCellDetails(cell))
    : selectedCells.map((cell) => getSelectedCellDetails(cell)).reverse();

  // determine mode based on originalValueType
  const valueType = selectedCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  // helpers for ratio and gcd
  function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    const EPS = 1e-10;
    while (b > EPS) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a;
  }
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
    return oct !== 3;
  });

  return (
    <div className="maqam‑transpositions">
      <h2 className="maqam‑transpositions__title">{selectedMaqam.getName() + " - " + (isAscending ? "Ascending" : "Descending")}</h2>

      <table className="maqam‑transpositions__table">
        <thead>
          <tr>
            <th className="maqam‑transpositions__header">
              Transpositions{" "}
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
            </th>
            <th className="maqam‑transpositions__header">
              {selectedCellDetails[0].noteName + ` (${getEnglishNoteName(selectedCellDetails[0].noteName)})`}
            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header"></th>
                <th className="maqam‑transpositions__header">
                  {selectedCellDetails[i + 1].noteName + ` (${getEnglishNoteName(selectedCellDetails[i + 1].noteName)})`}
                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="maqam‑transpositions__header"></th>
            <th className="maqam‑transpositions__header">{selectedCellDetails[0].originalValue}</th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam‑transpositions__header">{useRatio ? `(${pat.ratio})` : `≈${(pat.diff ?? 0).toFixed(1)}¢`}</th>
                <th className="maqam‑transpositions__header">{selectedCellDetails[i + 1].originalValue}</th>
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
                  <td className="maqam‑transpositions__cell">{`${selectedMaqam.getName()} al-${details[0].noteName}`}</td>
                  <td className="maqam‑transpositions__cell">{details[0].noteName + ` (${getEnglishNoteName(details[0].noteName)})`}</td>
                  {details.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell"></td>
                      <td className="maqam‑transpositions__cell">{d.noteName + ` (${getEnglishNoteName(d.noteName)})`}</td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="maqam‑transpositions__cell"></td>
                  <td className="maqam‑transpositions__cell">{details[0].originalValue}</td>
                  {details.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam‑transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(details[j].fraction, d.fraction)})`
                          : `≈${(parseFloat(d.originalValue) - parseFloat(details[j].originalValue)).toFixed(1)}¢`}
                      </td>
                      <td className="maqam‑transpositions__cell">{d.originalValue}</td>
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
