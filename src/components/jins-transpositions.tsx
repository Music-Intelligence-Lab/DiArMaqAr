// components/JinsTranspositions.tsx
"use client";

import React from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getJinsTranspositions } from "@/functions/transpose";
import { Jins } from "@/models/Jins";

export default function JinsTranspositions() {
  const { selectedJins, selectedTuningSystem, setSelectedPitchClasses, allPitchClasses, centsTolerance, setCentsTolerance, sources, setSelectedJinsTransposition } =
    useAppContext();

  const { playNoteFrequency, playSequence } = useSoundContext();

  if (!selectedJins || !selectedTuningSystem) return null;

  const jinsNoteNames = selectedJins.getNoteNames();

  if (jinsNoteNames.length < 2) return null;

  const valueType = allPitchClasses[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const jinsTranspositions = getJinsTranspositions(allPitchClasses, selectedJins, true, centsTolerance);

  function renderTransposition(jins: Jins, index: number) {
    const transposition = jins.transposition;
    const pitchClasses = jins.jinsPitchClasses;
    const intervals = jins.jinsPitchClassIntervals;
    const colCount = jins.jinsPitchClasses.length * 2;

    return (
      <>
        <tr className="jins-transpositions__header">
          <td className={`jins-transpositions__transposition-number jins-transpositions__transposition-number_${pitchClasses[0].octave}`} rowSpan={5}>
            {index + 1}
          </td>

          <td className="jins-transpositions__jins-name-row" colSpan={2 + (pitchClasses.length - 1) * 2}>
            {!transposition ? <span className="jins-transpositions__transposition-title">
              Darajat al-Istiqrār (tonic/finalis): {pitchClasses[0].noteName + ` (${getEnglishNoteName(pitchClasses[0].noteName)})`}
            </span>:<span className="jins-transpositions__transposition-title">
              {jins.name}
            </span>}
            <button
              className="jins-transpositions__button"
              onClick={() => {
                setSelectedPitchClasses(pitchClasses);
                setSelectedJinsTransposition(transposition ? jins : null);
              }}
            >
              Select & Load to Keyboard
            </button>

            <button
              className="jins-transpositions__button"
              onClick={() => {
                playSequence(pitchClasses.map(({ frequency }) => parseInt(frequency)));
              }}
            >
              <PlayCircleIcon className="jins-transpositions__play-circle-icon" /> Play jins
            </button>
          </td>
        </tr>

        <tr>
          <th className="jins-transpositions__row-header">Note Names </th>
          {pitchClasses.map(({ noteName }, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
              <th className="jins-transpositions__header-cell">{noteName + ` (${getEnglishNoteName(noteName)})`}</th>
            </React.Fragment>
          ))}
        </tr>
        <tr>
          <th className="jins-transpositions__row-header">{valueType}</th>
          <th className="jins-transpositions__header-cell">{pitchClasses[0].originalValue}</th>
          {intervals.map((interval, i) => (
            <React.Fragment key={i}>
              <th className="jins-transpositions__header-cell">{useRatio ? `(${interval.fraction.replace("/",":")})` : `${interval.cents.toFixed(3)}`}</th>
              <th className="jins-transpositions__header-cell">{pitchClasses[i + 1].originalValue}</th>
            </React.Fragment>
          ))}
        </tr>
        {valueType !== "cents" && (
          <tr>
            <th className="jins-transpositions__row-header">cents (¢)</th>
            <th className="jins-transpositions__header-cell">{Number(pitchClasses[0].cents).toFixed(3)}</th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="jins-transpositions__header-cell">{interval.cents.toFixed(3)}</th>
                <th className="jins-transpositions__header-cell">{Number(pitchClasses[i + 1].cents).toFixed(3)}</th>
              </React.Fragment>
            ))}
          </tr>
        )}
        <tr>
          <th className="jins-transpositions__row-header">Play</th>
          {pitchClasses.map(({ frequency }, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="jins-transpositions__header-cell"></th>}
              <th className="jins-transpositions__header-cell">
                <PlayCircleIcon className="jins-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(frequency))} />
              </th>
            </React.Fragment>
          ))}
        </tr>
        <tr>
          <td className="jins-transpositions__spacer" colSpan={colCount} />
        </tr>
      </>
    );
  }

  return (
    <>
      {/* JINS TRANSPOSITIONS TABLE */}
      <div className="jins-transpositions">
        <h2 className="jins-transpositions__title">Taḥlīl (analysis): {`${selectedJins.getName()}`}</h2>
        <table className="jins-transpositions__table">
          <colgroup>
            <col style={{ minWidth: "30px", maxWidth: "30px", width: "30px" }} />
            <col style={{ minWidth: "150px", maxWidth: "150px", width: "150px" }} />
          </colgroup>

          <thead>{renderTransposition(jinsTranspositions[0], 0)}</thead>
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

          <thead></thead>
          <tbody>
            {jinsTranspositions.slice(1).map((jinsTransposition, row) => {
              return <React.Fragment key={row}>{renderTransposition(jinsTransposition, row + 1)}</React.Fragment>;
            })}
          </tbody>
        </table>
      </div>

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

        {/* <div className="jins-transpositions__comments-arabic"> 
      <h3>تعليقات:</h3>
      {selectedTuningSystem?.getCommentsArabic()}
    </div>
  
    <div className="jins-transpositions__sources-arabic"> 
      <h3>مصادر:</h3>
      {selectedTuningSystem?.getSourceArabic()}
    </div> */}
      </div>
    </>
  );
}
