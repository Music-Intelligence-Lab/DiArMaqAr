import PitchClass, { calculateInterval, PitchClassInterval, matchingListOfIntervals } from "@/models/PitchClass";
import MaqamDetails, { Maqam } from "@/models/Maqam";
import JinsDetails, { Jins } from "@/models/Jins";
import shiftPitchClass from "./shiftPitchClass";

export function getPitchClassIntervals(pitchClasses: PitchClass[]) {
  return pitchClasses.slice(1).map((pitchClass, index) => calculateInterval(pitchClasses[index], pitchClass));
}

export function getPitchClassTranspositions(inputPitchClasses: PitchClass[], jinsPitchClassIntervals: PitchClassInterval[], ascending: boolean, useRatio: boolean, centsTolerance: number) {
  const allPitchClasses = ascending ? inputPitchClasses : [...inputPitchClasses].reverse();

  const sequences: PitchClass[][] = [];

  function buildSequences(pitchClasses: PitchClass[], cellIndex: number, intervalIndex: number) {
    if (intervalIndex === jinsPitchClassIntervals.length) {
      sequences.push(pitchClasses);
      return;
    }
    const lastCell = pitchClasses[pitchClasses.length - 1];

    for (let i = cellIndex; i < allPitchClasses.length; i++) {
      const candidateCell = allPitchClasses[i];

      const cellInterval = jinsPitchClassIntervals[intervalIndex];
      const computedInterval = calculateInterval(lastCell, candidateCell);

      if (useRatio) {
        const comp = computedInterval.decimalRatio;
        const target = cellInterval.decimalRatio;

        if (comp === target) {
          buildSequences([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
          break;
        } else if ((ascending && comp > target) || (!ascending && comp < target)) break;
      } else {
        if (Math.abs(computedInterval.cents - cellInterval.cents) <= centsTolerance) {
          buildSequences([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
          break;
        } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) break;
      }
    }
  }

  for (let i = 0; i < allPitchClasses.length; i++) {
    const startingCell = allPitchClasses[i];

    buildSequences([startingCell], i + 1, 0);
  }

  return sequences.filter((sequence) => {
    let oct: number;

    if (ascending) {
      oct = sequence[0].octave;
    } else {
      oct = sequence[sequence.length - 1].octave;
    }

    return oct !== 3;
  });
}

export function mergeTranspositions(ascendingSequences: PitchClass[][], descendingSequences: PitchClass[][]) {
  const filteredSequences: { ascendingSequence: PitchClass[]; descendingSequence: PitchClass[] }[] = [];

  ascendingSequences.forEach((ascSeq) => {
    const ascNoteName = ascSeq[0].noteName;
    const descSeq = descendingSequences.find((descSeq) => {
      const descNoteName = descSeq[descSeq.length - 1].noteName;
      return ascNoteName === descNoteName;
    });
    if (descSeq) {
      filteredSequences.push({ ascendingSequence: ascSeq, descendingSequence: descSeq });
    }
  });

  return filteredSequences;
}

export function getMaqamTranspositions(
  allPitchClasses: PitchClass[],
  allAjnas: JinsDetails[],
  maqamDetails: MaqamDetails | null,
  withTahlil: boolean,
  centsTolerance: number = 5,
  onlyOctaveOne: boolean = false
): Maqam[] {
  if (allPitchClasses.length === 0 || !maqamDetails) return [];

  const ascendingNoteNames = maqamDetails.getAscendingNoteNames();
  const descendingNoteNames = maqamDetails.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return [];

  const ascendingMaqamCells = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));
  const descendingMaqamCells = [...allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName))].reverse();

  if (ascendingMaqamCells.length === 0 || descendingMaqamCells.length === 0) return [];

  const valueType = allPitchClasses[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const ascendingIntervalPattern: PitchClassInterval[] = getPitchClassIntervals(ascendingMaqamCells);

  const descendingIntervalPattern: PitchClassInterval[] = getPitchClassIntervals(descendingMaqamCells);

  const ascendingSequences: PitchClass[][] = getPitchClassTranspositions(allPitchClasses, ascendingIntervalPattern, true, useRatio, centsTolerance).filter(
    (sequence) => !onlyOctaveOne || sequence[0].octave === 1
  );

  const descendingSequences: PitchClass[][] = getPitchClassTranspositions(allPitchClasses, descendingIntervalPattern, false, useRatio, centsTolerance);

  const ajnasIntervals: { jins: JinsDetails; intervals: PitchClassInterval[] }[] = [];

  for (const jins of allAjnas) {
    const jinsCells = allPitchClasses.filter((pitchClass) => jins.getNoteNames().includes(pitchClass.noteName));
    if (jinsCells.length !== jins.getNoteNames().length) continue;
    const ascendingJinsIntervalPattern = getPitchClassIntervals(jinsCells);
    ajnasIntervals.push({ jins, intervals: ascendingJinsIntervalPattern });
  }

  const maqamTranspositions: Maqam[] = mergeTranspositions(ascendingSequences, descendingSequences).map((sequencePair) => {
    const ascendingPitchClasses = sequencePair.ascendingSequence;
    let sliceIndex = 0;
    const lastAscendingPitchClass = ascendingPitchClasses[ascendingPitchClasses.length - 1];

    for (let i = 0; i < ascendingPitchClasses.length; i++) {
      // if the maqam is longer than 7 and has octaves in them, then you want to slice the sequence in a way where you dont shift the octave again
      if (parseFloat(ascendingPitchClasses[i].frequency) * 2 < parseFloat(lastAscendingPitchClass.frequency)) {
        sliceIndex = i + 1;
      }
    }

    if (sliceIndex === 0) sliceIndex = -1;

    const extendedAscendingPitchClasses = [...ascendingPitchClasses, ...ascendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1))];

    const ascendingPitchClassIntervals = getPitchClassIntervals(ascendingPitchClasses);
    const ascendingMaqamAjnas: (Jins | null)[] = [];

    const descendingPitchClasses = [...sequencePair.descendingSequence].reverse();

    const extendedDescendingPitchClasses = [...descendingPitchClasses, ...descendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1))];

    const descendingPitchClassIntervals = getPitchClassIntervals(descendingPitchClasses);
    const descendingMaqamAjnas: (Jins | null)[] = [];

    const extendedAscendingPitchClassIntervals = getPitchClassIntervals(extendedAscendingPitchClasses);
    const extendedDescendingPitchClassIntervals = getPitchClassIntervals(extendedDescendingPitchClasses);

    if (allAjnas.length > 0) {
      for (let i = 0; i < extendedAscendingPitchClassIntervals.length; i++) {
        let found = false;

        for (const jinsInterval of ajnasIntervals) {
          const lengthOfInterval = jinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedAscendingPitchClassIntervals.slice(i, i + lengthOfInterval), jinsInterval.intervals, centsTolerance)) {
            const jins = jinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedAscendingPitchClasses[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              transposition: firstJinsNote !== firstCell.noteName,
              jinsPitchClasses: extendedAscendingPitchClasses.slice(i, i + lengthOfInterval + 1),
              jinsPitchClassIntervals: extendedAscendingPitchClassIntervals.slice(i, i + lengthOfInterval),
            };

            ascendingMaqamAjnas.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) ascendingMaqamAjnas.push(null);
        if (ascendingMaqamAjnas.length - 1 === ascendingPitchClassIntervals.length) break;
      }

      for (let i = 0; i < extendedDescendingPitchClassIntervals.length; i++) {
        let found = false;

        for (const jinsInterval of ajnasIntervals) {
          const lengthOfInterval = jinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedDescendingPitchClassIntervals.slice(i, i + lengthOfInterval), jinsInterval.intervals, centsTolerance)) {
            const jins = jinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedDescendingPitchClasses[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              transposition: firstJinsNote !== firstCell.noteName,
              jinsPitchClasses: extendedDescendingPitchClasses.slice(i, i + lengthOfInterval + 1),
              jinsPitchClassIntervals: extendedDescendingPitchClassIntervals.slice(i, i + lengthOfInterval),
            };

            descendingMaqamAjnas.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) descendingMaqamAjnas.push(null);
        if (descendingMaqamAjnas.length - 1 === descendingPitchClassIntervals.length) break;
      }
    }

    return {
      maqamId: maqamDetails.getId(),
      name: `${maqamDetails.getName()} al-${sequencePair.ascendingSequence[0].noteName}`,
      transposition: true,
      ascendingPitchClasses,
      ascendingPitchClassIntervals,
      ascendingMaqamAjnas,
      descendingPitchClasses: descendingPitchClasses.reverse(),
      descendingPitchClassIntervals: descendingPitchClassIntervals.reverse(),
      descendingMaqamAjnas: descendingMaqamAjnas.reverse(),
    };
  });

  const tahlilTransposition = maqamTranspositions.find((transposition) => transposition.ascendingPitchClasses[0].noteName === ascendingNoteNames[0]);
  const maqamTranspositionsWithoutTahlil = maqamTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  // if (maqamDetails.getId() === "12")

  if (withTahlil && tahlilTransposition) {
    return [{ ...tahlilTransposition, transposition: false }, ...maqamTranspositionsWithoutTahlil];
  } else return maqamTranspositionsWithoutTahlil;
}

export function getJinsTranspositions(allPitchClasses: PitchClass[], jinsDetails: JinsDetails | null, withTahlil: boolean, centsTolerance: number = 5, onlyOctaveOne: boolean = false): Jins[] {
  if (allPitchClasses.length === 0 || !jinsDetails) return [];

  const jinsNoteNames = jinsDetails.getNoteNames();

  if (jinsNoteNames.length < 2) return [];

  const jinsCells = allPitchClasses.filter((pitchClass) => jinsNoteNames.includes(pitchClass.noteName));

  const valueType = jinsCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const intervalPattern: PitchClassInterval[] = getPitchClassIntervals(jinsCells);

  const jinsTranspositions: Jins[] = getPitchClassTranspositions(allPitchClasses, intervalPattern, true, useRatio, centsTolerance)
    .filter((sequence) => !onlyOctaveOne || sequence[0].octave === 1)
    .map((sequence) => {
      return {
        jinsId: jinsDetails.getId(),
        name: `${jinsDetails.getName()} al-${sequence[0].noteName}`,
        transposition: true,
        jinsPitchClasses: sequence,
        jinsPitchClassIntervals: getPitchClassIntervals(sequence),
      };
    });

  const tahlilTransposition = jinsTranspositions.find((transposition) => transposition.jinsPitchClasses[0].noteName === jinsNoteNames[0]);
  const jinsTranspositionsWithoutTahlil = jinsTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  if (withTahlil && tahlilTransposition) return [{ ...tahlilTransposition, transposition: false }, ...jinsTranspositionsWithoutTahlil];
  else return jinsTranspositionsWithoutTahlil;
}
