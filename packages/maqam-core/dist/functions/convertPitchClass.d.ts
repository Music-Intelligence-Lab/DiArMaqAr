export declare function frequencyToMidiNoteNumber(frequency: number): number;
export default function convertPitchClass(originalValue: string, inputType: "fraction" | "cents" | "decimalRatio" | "stringLength", stringLength: number, referenceFrequency: number): {
    fraction: string;
    decimal: string;
    cents: string;
    stringLength: string;
    frequency: string;
};
export declare function shiftPitchClassBaseValue(baseValue: string, inputType: "fraction" | "decimalRatio" | "cents" | "stringLength", targetOctave: 0 | 1 | 2 | 3 | 4): string;
//# sourceMappingURL=convertPitchClass.d.ts.map