import PitchClass, { PitchClassInterval } from "../models/PitchClass";
import MaqamTemplate, { Maqam } from "../models/Maqam";
import JinsTemplate, { Jins } from "../models/Jins";
export declare function getPitchClassIntervals(pitchClasses: PitchClass[]): PitchClassInterval[];
export declare function getPitchClassTranspositions(inputPitchClasses: PitchClass[], jinsPitchClassIntervals: PitchClassInterval[], ascending: boolean, useRatio: boolean, centsTolerance: number): PitchClass[][];
export declare function mergeTranspositions(ascendingSequences: PitchClass[][], descendingSequences: PitchClass[][]): {
    ascendingSequence: PitchClass[];
    descendingSequence: PitchClass[];
}[];
export declare function getMaqamTranspositions(allPitchClasses: PitchClass[], allAjnas: JinsTemplate[], maqamTemplate: MaqamTemplate | null, withTahlil: boolean, centsTolerance?: number, onlyOctaveOne?: boolean): Maqam[];
export declare function getJinsTranspositions(allPitchClasses: PitchClass[], jinsTemplate: JinsTemplate | null, withTahlil: boolean, centsTolerance?: number, onlyOctaveOne?: boolean): Jins[];
//# sourceMappingURL=transpose.d.ts.map