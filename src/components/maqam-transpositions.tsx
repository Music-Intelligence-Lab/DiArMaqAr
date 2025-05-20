// components/MaqamTranspositions.tsx
"use client";

import React from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import computeRatio from "@/functions/computeRatio";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getIntervalPattern, getTranspositions, mergeTranspositions, Pattern } from "@/functions/transpose";

export default function MaqamTranspositions() {
  const {
    selectedMaqam,
    selectedTuningSystem,
    setSelectedCells,
    getAllCells,
    getSelectedCellDetails,
    centsTolerance,
    setCentsTolerance,
    playNoteFrequency,
    playSequence,
  } = useAppContext();
  

  if (!selectedMaqam || !selectedTuningSystem) return null;

  const ascendingNoteNames = selectedMaqam.getAscendingNoteNames();
  const descendingNoteNames = selectedMaqam.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return null;

  const romanNumerals = ['I','II','III','IV','V','VI','VII', 'VIII', 'XI', 'X', 'XI', 'XII'];
  
  const allCells = getAllCells();

  const allCellDetails = allCells.map((cell) => getSelectedCellDetails(cell));

  const ascendingMaqamCellDetails = allCellDetails.filter((cell) => ascendingNoteNames.includes(cell.noteName));
  const descendingMaqamCellDetails = allCellDetails
    .filter((cell) => descendingNoteNames.includes(cell.noteName))
    .reverse();

  const valueType = ascendingMaqamCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  const ascendingIntervalPattern: Pattern[] = getIntervalPattern(ascendingMaqamCellDetails, useRatio);
  
  const descendingIntervalPattern: Pattern[] = getIntervalPattern(descendingMaqamCellDetails, useRatio);

  const ascendingSequences: CellDetails[][] = getTranspositions(allCellDetails, ascendingIntervalPattern, true, useRatio, centsTolerance);

  const descendingSequences: CellDetails[][] =  getTranspositions(allCellDetails, descendingIntervalPattern, false, useRatio, centsTolerance);

  const filteredSequences: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = mergeTranspositions(ascendingSequences, descendingSequences);

  return (
    <div className="maqam-transpositions">
      <h2 className="maqam-transpositions__title">
        Analysis: {`${selectedMaqam.getName()}`}
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
        <thead>
          <tr>
            <th className="maqam-transpositions__header" colSpan={2 + (ascendingMaqamCellDetails.length - 1) * 2}>
              <button
                className="maqam-transpositions__button"
                onClick={() => {
                  const ascFreq = ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency));
                  const descFreq = descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency));
                  const allFreq = [...ascFreq, ...descFreq];
                  playSequence(allFreq);
                }}
              >
                 <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> {`${selectedMaqam.getName()} al-${ascendingMaqamCellDetails[0].noteName}`}
              </button>
              <button
                className="maqam-transpositions__button"
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
                className="maqam-transpositions__button"
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
            <th className="maqam-transpositions__row-header">
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(ascendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)))}
              >
                Ascending <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              </button>
            </th>
            <th className="maqam-transpositions__header-cell">
              <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[0].frequency))}>
               {ascendingMaqamCellDetails[0].noteName + ` (${getEnglishNoteName(ascendingMaqamCellDetails[0].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              </button>
            </th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th className="maqam-transpositions__header-cell">
                  <button
                    className="maqam-transpositions__button"
                    onClick={() => playNoteFrequency(parseInt(ascendingMaqamCellDetails[i + 1].frequency))}
                  >
                  {ascendingMaqamCellDetails[i + 1].noteName + ` (${getEnglishNoteName(ascendingMaqamCellDetails[i + 1].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                  </button>
                </th>
              </React.Fragment>
            ))}
          </tr>
 <tr>
            <th className="maqam-transpositions__row-header">Scale Degrees</th>
            {ascendingMaqamCellDetails.map((_, idx) =>
              idx === 0 ? (
                <th key={idx} className="maqam-transpositions__header-cell">
                  {romanNumerals[idx]}
                </th>
              ) : (
                <React.Fragment key={idx}>
                  <th className="maqam-transpositions__header-cell"></th>
                  <th className="maqam-transpositions__header-cell">
                    {romanNumerals[idx]}
                  </th>
                </React.Fragment>
              )
            )}
          </tr>

          <tr>
            <th className="maqam-transpositions__row-header">{valueType}</th>
            <th className="maqam-transpositions__header-cell">{ascendingMaqamCellDetails[0].originalValue}</th>
            {ascendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">{useRatio ? `(${pat.ratio})` : `(${(pat.diff ?? 0).toFixed(3)})`}</th>
                <th className="maqam-transpositions__header-cell">{ascendingMaqamCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="maqam-transpositions__row-header">cents (¢)</th>
              <th className="maqam-transpositions__header-cell">
                {parseFloat(ascendingMaqamCellDetails[0].cents).toFixed(3)}
              </th>
              {ascendingIntervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="maqam-transpositions__header-cell"> (
                    {(parseFloat(ascendingMaqamCellDetails[i + 1].cents) -
                      parseFloat(ascendingMaqamCellDetails[i].cents)
                    ).toFixed(3)})
                  </th>
                  <th className="maqam-transpositions__header-cell">
                    {parseFloat(ascendingMaqamCellDetails[i + 1].cents).toFixed(3)}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          )}

          <tr>
            <th className="maqam-transpositions__row-header">
              <button
                className="maqam-transpositions__button"
                onClick={() => playSequence(descendingMaqamCellDetails.map((cell) => parseInt(cell.frequency)))}
              >
                Descending <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              </button>
            </th>
            <th className="maqam-transpositions__header-cell">
              <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[0].frequency))}>
                {descendingMaqamCellDetails[0].noteName + ` (${getEnglishNoteName(descendingMaqamCellDetails[0].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> 
              </button>
            </th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell"></th>
                <th className="maqam-transpositions__header-cell">
                  <button
                    className="maqam-transpositions__button"
                    onClick={() => playNoteFrequency(parseInt(descendingMaqamCellDetails[i + 1].frequency))}
                  >
                    {descendingMaqamCellDetails[i + 1].noteName + ` (${getEnglishNoteName(descendingMaqamCellDetails[i + 1].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> 
                  </button>
                </th>
              </React.Fragment>
            ))}
          </tr>

          <tr>
            <th className="maqam-transpositions__row-header">Scale Degrees</th>
            {romanNumerals
              .slice(0, ascendingMaqamCellDetails.length)
              .reverse()
              .map((num, idx) =>
                idx === 0 ? (
                  <th key={idx} className="maqam-transpositions__header-cell">
                    {num}
                  </th>
                ) : (
                  <React.Fragment key={idx}>
                    <th className="maqam-transpositions__header-cell"></th>
                    <th className="maqam-transpositions__header-cell">
                      {num}
                    </th>
                  </React.Fragment>
                )
              )}
          </tr>

          <tr>
            <th className="maqam-transpositions__row-header">{valueType}</th>
            <th className="maqam-transpositions__header-cell">{descendingMaqamCellDetails[0].originalValue}</th>
            {descendingIntervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-cell">{useRatio ? `(${pat.ratio})` : `(${(pat.diff ?? 0).toFixed(3)})`}</th>
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
                  <th className="maqam-transpositions__header-cell">{`(${
                    (
                      parseFloat(descendingMaqamCellDetails[i + 1].cents) -
                      parseFloat(descendingMaqamCellDetails[i].cents)
                    ).toFixed(3)
                  })`}</th>
                  <th className="maqam-transpositions__header-cell">{parseFloat(descendingMaqamCellDetails[i + 1].cents).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
        </thead>
      </table>



        <h2 className="maqam-transpositions__title">
        Transpositions: {`${selectedMaqam.getName()}`}
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
        <thead>
      <tr>
        </tr>
          </thead>
        <tbody>
          {filteredSequences.map((seq, row) => {
            const ascendingDetails = seq.ascendingSequence;
            const descendingDetails = seq.descendingSequence;
            const colCount = 2 + (ascendingDetails.length - 1) * 2;
            if (ascendingMaqamCellDetails[0].noteName === ascendingDetails[0].noteName) return null;

            return (
              <React.Fragment key={row}>
                <tr>
                  <td className="maqam-transpositions__maqam-name-row" colSpan={colCount}>
                    <span className="maqam-transpositions__transposition-title" >{`${selectedMaqam.getName()} al-${ascendingDetails[0].noteName}`}</span>
                    <button
                      className="maqam-transpositions__button"
                      onClick={() => {
                        const ascFreq = ascendingDetails.map((cell) => parseInt(cell.frequency));
                        const descFreq = descendingDetails.map((cell) => parseInt(cell.frequency));
                        const allFreq = [...ascFreq, ...descFreq];
                        playSequence(allFreq);
                      }}
                    >
                      <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> Ascending {'>'} Descending
                    </button>
                    <button
                      className="maqam-transpositions__button"
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
                      className="maqam-transpositions__button"
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
                  <td className="maqam-transpositions__row-header">
                    <button
                      className="maqam-transpositions__button"
                      onClick={() => playSequence(ascendingDetails.map((cell) => parseInt(cell.frequency)))}
                    >
                      Ascending <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                    </button>
                  </td>
                  <td className="maqam-transpositions__cell">
                    <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(ascendingDetails[0].frequency))}>
                      {ascendingDetails[0].noteName + ` (${getEnglishNoteName(ascendingDetails[0].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> 
                    </button>
                  </td>
                  {ascendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam-transpositions__cell"></td>
                      <td className="maqam-transpositions__cell">
                        <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(d.frequency))}>
                          {d.noteName + ` (${getEnglishNoteName(d.noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> 
                        </button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="maqam-transpositions__row-header">{valueType}</td>
                  <td className="maqam-transpositions__cell">{ascendingDetails[0].originalValue}</td>
                  {ascendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam-transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(ascendingDetails[j].fraction, d.fraction)})`
                          : `(${(parseFloat(d.originalValue) - parseFloat(ascendingDetails[j].originalValue)).toFixed(3)})`}
                      </td>
                      <td className="maqam-transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <td className="maqam-transpositions__row-header">cents (¢)</td>
                    <td className="maqam-transpositions__cell">{ascendingDetails[0].cents}</td>
                    {ascendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <td className="maqam-transpositions__cell">{`(${
                          (parseFloat(ascendingDetails[i + 1].cents) -
                           parseFloat(ascendingDetails[i].cents)
                          ).toFixed(3)
                        })`}</td>
                        <td className="maqam-transpositions__cell">{parseFloat(ascendingDetails[i + 1].cents).toFixed(3)}</td>
                      </React.Fragment>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="maqam-transpositions__row-header">
                    <button
                      className="maqam-transpositions__button"
                      onClick={() => playSequence(descendingDetails.map((cell) => parseInt(cell.frequency)))}
                    >
                      Descending <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> 
                    </button>
                  </td>
                  <td className="maqam-transpositions__cell">
                    <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(descendingDetails[0].frequency))}>
                      {descendingDetails[0].noteName + ` (${getEnglishNoteName(descendingDetails[0].noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                    </button>
                  </td>
                  {descendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam-transpositions__cell"></td>
                      <td className="maqam-transpositions__cell">
                        <button className="maqam-transpositions__button" onClick={() => playNoteFrequency(parseInt(d.frequency))}>
                        {d.noteName + ` (${getEnglishNoteName(d.noteName)})`} <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
                        </button>
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="maqam-transpositions__row-header">{valueType}</td>
                  <td className="maqam-transpositions__cell">{descendingDetails[0].originalValue}</td>
                  {descendingDetails.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="maqam-transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(descendingDetails[j].fraction, d.fraction)})`
                          : `${(parseFloat(d.originalValue) - parseFloat(descendingDetails[j].originalValue)).toFixed(3)}`}
                      </td>
                      <td className="maqam-transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <td className="maqam-transpositions__row-header">cents (¢)</td>
                    <td className="maqam-transpositions__cell">{descendingDetails[0].cents}</td>
                    {descendingIntervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <td className="maqam-transpositions__cell">{`(${
                          (
                            parseFloat(descendingDetails[i + 1].cents) -
                            parseFloat(descendingDetails[i].cents)
                          ).toFixed(3)
                        })`}</td>
                        <td className="maqam-transpositions__cell">
                          {parseFloat(descendingDetails[i + 1].cents).toFixed(3)}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                  
                )}
                                <tr>
                  <td className="maqam-transpositions__spacer" colSpan={colCount} />
                </tr>

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
