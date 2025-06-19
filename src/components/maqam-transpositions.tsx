"use client";

import React, { useState } from "react";
import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { getMaqamTranspositions } from "@/functions/transpose";
import { Maqam } from "@/models/Maqam";
import { calculateInterval } from "@/models/PitchClass";
import shiftPitchClass from "@/functions/shiftPitchClass";

export default function MaqamTranspositions() {
  const {
    selectedMaqamDetails,
    selectedTuningSystem,
    setSelectedPitchClasses,
    allPitchClasses,
    centsTolerance,
    setCentsTolerance,
    ajnas,
    setSelectedMaqam,
  } = useAppContext();

  const { playNoteFrequency, playSequence } = useSoundContext();

  const [highlightedNotes, setHighlightedNotes] = useState<{ index: number; noteNames: string[] }>({ index: -1, noteNames: [] });

  const isCellHighlighted = (index: number, noteName: string): boolean => {
    return highlightedNotes.index === index && highlightedNotes.noteNames.includes(noteName);
  };

  if (!selectedMaqamDetails || !selectedTuningSystem) return null;

  const ascendingNoteNames = selectedMaqamDetails.getAscendingNoteNames();
  const descendingNoteNames = selectedMaqamDetails.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return null;

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "XI", "X", "XI", "XII", "XIII", "XIV", "XV"];

  const ascendingMaqamPitchClasses = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));

  const numberOfMaqamNotes = ascendingMaqamPitchClasses.length;

  let noOctaveMaqam = false;

  if (numberOfMaqamNotes <= 7) {
    noOctaveMaqam = true;
    romanNumerals[numberOfMaqamNotes] = "I+";
  }

  const valueType = allPitchClasses[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamDetails, true, centsTolerance);

  function renderTranspositionRow(maqam: Maqam, ascending: boolean, rowIndex: number) {
    let ascendingTranspositionPitchClasses = maqam.ascendingPitchClasses;
    let descendingTranspositionPitchClasses = maqam.descendingPitchClasses;

    let ascendingIntervals = maqam.ascendingPitchClassIntervals;
    let descendingIntervals = maqam.descendingPitchClassIntervals;

    if (noOctaveMaqam) {
      const shiftedFirstCell = shiftPitchClass(allPitchClasses, maqam.ascendingPitchClasses[0], 1);
      const lastCell = ascendingTranspositionPitchClasses[ascendingTranspositionPitchClasses.length - 1];

      ascendingTranspositionPitchClasses = [...ascendingTranspositionPitchClasses, shiftedFirstCell];
      descendingTranspositionPitchClasses = [shiftedFirstCell, ...descendingTranspositionPitchClasses];

      const shiftedCellInterval = ascending ? calculateInterval(lastCell, shiftedFirstCell) : calculateInterval(shiftedFirstCell, lastCell);

      ascendingIntervals = [...ascendingIntervals, shiftedCellInterval];
      descendingIntervals = [shiftedCellInterval, ...descendingIntervals];
    }

    const transposition = maqam.transposition;
    const pitchclasses = ascending ? ascendingTranspositionPitchClasses : descendingTranspositionPitchClasses;
    const oppositePitchClasses = ascending ? descendingTranspositionPitchClasses : ascendingTranspositionPitchClasses;
    const intervals = ascending ? ascendingIntervals : descendingIntervals;
    const jinsTranspositions = ascending ? maqam.ascendingMaqamAjnas : maqam.descendingMaqamAjnas;

    return (
      <>
      {ascending && <tr>
          <th
            className={`maqam-transpositions__transposition-number maqam-transpositions__transposition-number_${pitchclasses[0].octave}`}
            rowSpan={16}
          >
            {rowIndex + 1}
          </th>
          <th className="maqam-transpositions__header" colSpan={3 + (pitchclasses.length - 1) * 2}>
            {!transposition ? (
              <span className="maqam-transpositions__transposition-title">{`Darajat al-Istiqrār (tonic/finalis): ${
                pitchclasses[0].noteName
              } (${getEnglishNoteName(pitchclasses[0].noteName)})`}</span>
            ) : (
              <span className="jins-transpositions__transposition-title">{maqam.name}</span>
            )}
            <button
              className="maqam-transpositions__button"
              onClick={() => {
                setSelectedPitchClasses(pitchclasses);
                setSelectedMaqam(transposition ? maqam : null);
              }}
            >
              Select & Load to Keyboard
            </button>
            <button
              className="maqam-transpositions__button"
              onClick={async () => {
                const ascFreq = pitchclasses.map((pitchClass) => parseInt(pitchClass.frequency));
                const descFreq = oppositePitchClasses.map((pitchClass) => parseInt(pitchClass.frequency)).reverse();
                await playSequence(ascFreq);
                await playSequence(descFreq, false);
              }}
            >
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              {"Ascending > Descending"}
            </button>
            <button className="maqam-transpositions__button" onClick={() => playSequence(pitchclasses.map((pitchClass) => parseInt(pitchClass.frequency)))}>
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              Ascending
            </button>
            <button
              className="maqam-transpositions__button"
              onClick={() => playSequence(oppositePitchClasses.map((pitchClass) => parseInt(pitchClass.frequency)).reverse(), false)}
            >
              <PlayCircleIcon className="maqam-transpositions__play-circle-icon" />
              Descending
            </button>
          </th>
        </tr>}
        <tr>
          <td className="maqam-transpositions__asc-desc-column" rowSpan={7}>
            {ascending ? "↗" : "↘"}
          </td>
        </tr>
        <tr>
          <th className="maqam-transpositions__row-header">Scale Degrees</th>
          {pitchclasses.map((_, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-cell_scale-degrees"></th>}
              <th className="maqam-transpositions__header-cell_scale-degrees-number">{romanNumerals[i]}</th>
            </React.Fragment>
          ))}
        </tr>
        <tr>
          <th className="maqam-transpositions__row-header">Note Names </th>
          {pitchclasses.map((pitchClass, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-pitchClass"></th>}
              <th
                className={
                  (!oppositePitchClasses.includes(pitchClass) ? "maqam-transpositions__header-cell_unique " : "maqam-transpositions__header-pitchClass ") +
                  (isCellHighlighted(rowIndex + (ascending ? 0 : 0.5), pitchClass.noteName) ? "maqam-transpositions__header-cell_highlighted" : "")
                }
              >
                {pitchClass.noteName + ` (${getEnglishNoteName(pitchClass.noteName)})`}{" "}
              </th>
            </React.Fragment>
          ))}
        </tr>
        <tr>
          <th className="maqam-transpositions__row-header">{valueType}</th>
          <th className="maqam-transpositions__header-pitchClass">{pitchclasses[0].originalValue}</th>
          {intervals.map((interval, i) => (
            <React.Fragment key={i}>
              <th className="maqam-transpositions__header-pitchClass">{useRatio ? `(${interval.fraction.replace("/", ":")})` : `${interval.cents.toFixed(3)}`}</th>
              <th className="maqam-transpositions__header-pitchClass">{pitchclasses[i + 1].originalValue}</th>
            </React.Fragment>
          ))}
        </tr>
        {valueType !== "cents" && (
          <tr>
            <th className="maqam-transpositions__row-header">cents (¢)</th>
            <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchclasses[0].cents).toFixed(3)}</th>
            {intervals.map((interval, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-pitchClass">{interval.cents.toFixed(3)}</th>
                <th className="maqam-transpositions__header-pitchClass">{parseFloat(pitchclasses[i + 1].cents).toFixed(3)}</th>
              </React.Fragment>
            ))}
          </tr>
        )}
        <tr>
          <th className="maqam-transpositions__row-header">Play</th>
          {pitchclasses.map(({ frequency }, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <th className="maqam-transpositions__header-pitchClass"></th>}
              <th>
                <PlayCircleIcon className="maqam-transpositions__play-circle-icon" onClick={() => playNoteFrequency(parseInt(frequency))} />
              </th>
            </React.Fragment>
          ))}
        </tr>
        {jinsTranspositions && (
          <tr>
            <th className="maqam-transpositions__row-header">Ajnas</th>
            {!ascending && <th className="maqam-transpositions__header-pitchClass"></th>}
            {jinsTranspositions.slice(0, jinsTranspositions.length - (noOctaveMaqam ? 0:1)).map((jinsTransposition, i) => (
              <React.Fragment key={i}>
                <th className="maqam-transpositions__header-pitchClass" colSpan={2}>
                  {jinsTransposition && (
                    <>
                      {jinsTransposition.name}
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const frequencies = jinsTransposition.jinsPitchClasses.map((pitchClass) => parseInt(pitchClass.frequency));
                          playSequence(frequencies);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="maqam-transpositions__jins-button"
                        onClick={() => {
                          const noteNames = jinsTransposition.jinsPitchClasses.map((pitchClass) => pitchClass.noteName);
                          setHighlightedNotes({ index: rowIndex + (ascending ? 0 : 0.5), noteNames });
                        }}
                      >
                        Highlight
                      </button>
                    </>
                  )}
                </th>
              </React.Fragment>
            ))}
            {ascending && <th className="maqam-transpositions__header-pitchClass"></th>}
          </tr>
        )}
        <tr>
          <td className="maqam-transpositions__spacer" colSpan={2 + (pitchclasses.length - 1) * 2} />
        </tr>
      </>
    );
  }

  function renderTransposition(maqam: Maqam, index: number) {
    return (
      <>
        {renderTranspositionRow(maqam, true, index)}
        {renderTranspositionRow(maqam, false, index)}
      </>
    );
  }

  return (
    <div className="maqam-transpositions">
      <h2 className="maqam-transpositions__title">
        Taḥlīl (analysis): {`${selectedMaqamDetails.getName()}`}
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

        <thead>{renderTransposition(maqamTranspositions[0], 0)}</thead>
      </table>

      <h2 className="maqam-transpositions__title">
        Taṣwīr (transpositions): {`${selectedMaqamDetails.getName()}`}
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
          {maqamTranspositions.slice(1).map((maqamTransposition, row) => {
            return (
              <React.Fragment key={row}>
                {renderTransposition(maqamTransposition, row)}
                <tr>
                  <td className="maqam-transpositions__spacer" colSpan={2 + (maqamTransposition.ascendingPitchClasses.length - 1) * 2} />
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
