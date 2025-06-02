// components/JinsTranspositions.tsx
"use client";

import React from "react";
import { CellDetails, useAppContext } from "@/contexts/app-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import computeRatio from "@/functions/computeRatio";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getIntervalPattern, getTranspositions, Interval } from "@/functions/transpose";

export default function JinsTranspositions() {
  const {
    selectedJins,
    selectedTuningSystem,
    setSelectedCells,
    getAllCells,
    getSelectedCellDetails,
    centsTolerance,
    setCentsTolerance,
    playNoteFrequency,
    playSequence,
    sources,
  } = useAppContext();

  if (!selectedJins || !selectedTuningSystem) return null;

  const jinsNoteNames = selectedJins.getNoteNames();

  if (jinsNoteNames.length < 2) return null;

  const allCells = getAllCells();

  const allCellDetails = allCells.map(getSelectedCellDetails);

  const jinsCellDetails = allCellDetails.filter((cell) => jinsNoteNames.includes(cell.noteName));

  const valueType = jinsCellDetails[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "ratios";

  const intervalPattern: Interval[] = getIntervalPattern(jinsCellDetails, useRatio);

  const sequences: CellDetails[][] = getTranspositions(allCellDetails, intervalPattern, true, useRatio, centsTolerance);
  
  const rowCount = 5;


return (
  <>
    {/* COMMENTS AND SOURCES */}
<div className="jins-transpositions__comments-sources-container">
    <div className="jins-transpositions__comments-english">
      <h3>Comments:</h3>
    </div>
  
    <div className="jins-transpositions__sources-english">
      <h3>Sources:</h3>
      {selectedJins?.getSourcePageReferences().length > 0 &&
      selectedJins.getSourcePageReferences().map((sourceRef, idx) => {
        const source = sources.find((s: any) => s.id === sourceRef.sourceId);
        return source ? (
        <React.Fragment key={idx}>
          {source.getContributors()[0].lastNameEnglish} ({source.getReleaseDateEnglish()}:{sourceRef.page})
          <br />
        </React.Fragment>
        ) : null;
      })}
    </div>
  
    <div className="jins-transpositions__comments-arabic"> 
      <h3>تعليقات:</h3>
      {selectedTuningSystem?.getCommentsArabic()}
    </div>
  
    <div className="jins-transpositions__sources-arabic"> 
      <h3>مصادر:</h3>
      {selectedTuningSystem?.getSourceArabic()}
    </div>

</div>

    {/* JINS TRANSPOSITIONS TABLE */}

    <div className="jins-transpositions">
      <h2 className="jins-transpositions__title">
        Taḥlīl (analysis): {`${selectedJins.getName()}`}
{/*         {!useRatio && (
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
 */}      </h2>
      <table className="jins-transpositions__table">
        <colgroup>
          <col style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />          
          <col style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />          
        </colgroup>

        <thead>
          <tr className="jins-transpositions__header">
            <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${jinsCellDetails[0].octave}`} rowSpan={5}>{1}</td>

            <td className="jins-transpositions__jins-name-row" colSpan={11}>
              <span className="jins-transpositions__transposition-title" >Darajat al-Istiqrār (tonic/finalis):  {jinsCellDetails[0].noteName + ` (${getEnglishNoteName(jinsCellDetails[0].noteName)})`}</span>
             {/*  <button
                className="jins-transpositions__button"
                onClick={() => {
                  const transpositionNoteNames = jinsCellDetails.map((cell) => cell.noteName);

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
                select
              </button> */}

              <button
                className="jins-transpositions__button"
                onClick={() => {
                  playSequence(jinsCellDetails.map((cell) => parseInt(cell.frequency)));
                }}
              >
                <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> Play jins{/* {`${selectedJins.getName()} al-${sequence[0].noteName}`} */}
              </button>

            </td>
          </tr>

          <tr>
            <th className="jins-transpositions__row-header">
              Note Names            </th>
            <th className="jins-transpositions__header-cell">
              {jinsCellDetails[0].noteName + ` (${getEnglishNoteName(jinsCellDetails[0].noteName)})`}

            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-cell"></th>
                <th className="jins-transpositions__header-cell">
                  {jinsCellDetails[i + 1].noteName + ` (${getEnglishNoteName(jinsCellDetails[i + 1].noteName)})`}

                </th>
              </React.Fragment>
            ))}
          </tr>
          <tr>
            <th className="jins-transpositions__row-header">{valueType}</th>
            <th className="jins-transpositions__header-cell">{jinsCellDetails[0].originalValue}</th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-cell">{useRatio ? `(${pat.ratio})` : `${(pat.diff ?? 0).toFixed(3)}`}</th>
                <th className="jins-transpositions__header-cell">{jinsCellDetails[i + 1].originalValue}</th>
              </React.Fragment>
            ))}
          </tr>
          {valueType !== "cents" && (
            <tr>
              <th className="jins-transpositions__row-header">cents (¢)</th>
              <th className="jins-transpositions__header-cell">{Number(jinsCellDetails[0].cents).toFixed(3)}</th>
              {intervalPattern.map((pat, i) => (
                <React.Fragment key={i}>
                  <th className="jins-transpositions__header-cell">{`${(parseInt(jinsCellDetails[i + 1].cents) - parseInt(jinsCellDetails[i].cents)).toFixed(3)}`}</th>
                  <th className="jins-transpositions__header-cell">{Number(jinsCellDetails[i + 1].cents).toFixed(3)}</th>
                </React.Fragment>
              ))}
            </tr>

          )}
          <tr>
            <th className="jins-transpositions__row-header">Play</th>
            <th className="jins-transpositions__header-cell">
              <PlayCircleIcon className="jins-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(jinsCellDetails[0].frequency))} />
            </th>
            {intervalPattern.map((pat, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-cell"></th>
                <th className="jins-transpositions__header-cell">
                  <PlayCircleIcon className="jins-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(jinsCellDetails[i + 1].frequency))} />
                </th>
              </React.Fragment>
            ))}
          </tr>

        </thead>
      </table>

      <h2 className="jins-transpositions__title">
        Taṣwīr (transpositions): {`${selectedJins.getName()}`}
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
                <colgroup>
          <col style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />          
          <col style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />          
        </colgroup>

        <thead>
        </thead>
        <tbody>

          {sequences.filter((sequence) => sequence[0].noteName !== jinsCellDetails[0].noteName).map((sequence, row) => {
            const colCount = 2 + (sequence.length - 1) * 2;
            return (
              <React.Fragment key={row}>
                <tr>
                  <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${sequence[0].octave}`} rowSpan={rowCount}>{row + 2}</td>

                  <td className="jins-transpositions__jins-name-row" colSpan={colCount}>
                    <span className="jins-transpositions__transposition-title" >{`${selectedJins.getName()} al-${sequence[0].noteName} (${getEnglishNoteName(sequence[0].noteName)})`}</span>
                    <button
                      className="jins-transpositions__button"
                      onClick={() => {
                        const transpositionNoteNames = sequence.map((cell) => cell.noteName);

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
                      Select & Load to Keyboard
                    </button>
                    <button
                      className="jins-transpositions__button"
                      onClick={() => {
                        playSequence(sequence.map((cell) => parseInt(cell.frequency)));
                      }}
                    >
                      <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> Play jins{/* {`${selectedJins.getName()} al-${sequence[0].noteName}`} */}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="jins-transpositions__row-header">
                    Note Names
                  </td>
                  <td className="jins-transpositions__cell">
                    {sequence[0].noteName + ` (${getEnglishNoteName(sequence[0].noteName)})`}
                  </td>
                  {sequence.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="jins-transpositions__cell"></td>
                      <td className="jins-transpositions__cell">
                        {d.noteName + ` (${getEnglishNoteName(d.noteName)})`}

                      </td>
                    </React.Fragment>
                  ))}
                </tr>
                <tr>
                  <td className="jins-transpositions__row-header">{valueType}</td>
                  <td className="jins-transpositions__cell">{sequence[0].originalValue}</td>
                  {sequence.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="jins-transpositions__cell">
                        {useRatio
                          ? `(${computeRatio(sequence[j].fraction, d.fraction)})`
                          : `≈${(parseFloat(d.originalValue) - parseFloat(sequence[j].originalValue)).toFixed(3)}`}
                      </td>
                      <td className="jins-transpositions__cell">{d.originalValue}</td>
                    </React.Fragment>
                  ))}
                </tr>
                {valueType !== "cents" && (
                  <tr>
                    <th className="jins-transpositions__row-header">cents (¢)</th>
                    <th className="jins-transpositions__cell">{Number(sequence[0].cents).toFixed(3)}</th>
                    {intervalPattern.map((pat, i) => (
                      <React.Fragment key={i}>
                        <th className="jins-transpositions__cell">{`${(parseInt(jinsCellDetails[i + 1].cents) - parseInt(jinsCellDetails[i].cents)).toFixed(3)}`}</th>
                        <th className="jins-transpositions__cell">{Number(sequence[i + 1].cents).toFixed(3)}</th>

                      </React.Fragment>
                    ))}

                  </tr>
                )}
                <tr>
                  <td className="jins-transpositions__row-header">
                    Play
                  </td>
                  <td className="jins-transpositions__cell">

                    <PlayCircleIcon className="jins-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(sequence[0].frequency))} />

                  </td>
                  {sequence.slice(1).map((d, j) => (
                    <React.Fragment key={j}>
                      <td className="jins-transpositions__cell"></td>
                      <td className="jins-transpositions__cell">
                        <PlayCircleIcon className="jins-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(d.frequency))} />
                      </td>
                    </React.Fragment>
                  ))}
                </tr>

                <tr>
                  <td className="jins-transpositions__spacer" colSpan={colCount} />
                </tr>
              </React.Fragment>
            );
          })}

        </tbody>
      </table>
      </div>
    </>
  );
}
