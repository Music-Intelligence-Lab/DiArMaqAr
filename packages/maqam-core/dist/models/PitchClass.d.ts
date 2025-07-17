export default interface PitchClass {
    noteName: string;
    fraction: string;
    cents: string;
    decimalRatio: string;
    stringLength: string;
    fretDivision: string;
    frequency: string;
    midiNoteNumber: number;
    originalValue: string;
    originalValueType: string;
    englishName: string;
    abjadName: string;
    index: number;
    octave: number;
}
export interface PitchClassInterval {
    fraction: string;
    cents: number;
    decimalRatio: number;
    stringLength: number;
    fretDivision: number;
    index: number;
    originalValue: string;
    originalValueType: string;
}
export declare function calculateInterval(firstPitchClass: PitchClass, secondPitchClass: PitchClass): PitchClassInterval;
export declare function matchingIntervals(firstInterval: PitchClassInterval, secondInterval: PitchClassInterval, centsTolerance?: number): boolean;
export declare function matchingListOfIntervals(firstIntervals: PitchClassInterval[], secondIntervals: PitchClassInterval[], centsTolerance?: number): boolean;
//# sourceMappingURL=PitchClass.d.ts.map