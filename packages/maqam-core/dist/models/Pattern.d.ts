export default class Pattern {
    private id;
    private name;
    private notes;
    constructor(id: string, name: string, notes: PatternNote[]);
    getId(): string;
    getName(): string;
    getNotes(): PatternNote[];
    convertToJSON(): {
        id: string;
        name: string;
        notes: PatternNote[];
    };
}
export interface PatternNote {
    scaleDegree: string;
    noteDuration: NoteDuration;
    isTarget: boolean;
    velocity?: number;
}
export declare const DURATION_OPTIONS: string[];
export type NoteDuration = (typeof DURATION_OPTIONS)[number];
export declare const SCALE_DEGREES: string[];
export declare function reversePatternNotes(notes: PatternNote[]): PatternNote[];
//# sourceMappingURL=Pattern.d.ts.map