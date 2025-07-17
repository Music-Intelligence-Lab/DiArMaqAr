export declare const octaveZeroNoteNames: string[];
export declare const octaveOneNoteNames: string[];
export declare const octaveTwoNoteNames: string[];
export declare const octaveThreeNoteNames: string[];
export declare const octaveFourNoteNames: string[];
export interface Cell {
    octave: number;
    index: number;
}
export declare const allNotes: readonly string[];
type NoteName = (typeof allNotes)[number];
export default NoteName;
export type TransliteratedNoteNameOctaveOne = (typeof octaveOneNoteNames)[number];
export type TransliteratedNoteNameOctaveZero = (typeof octaveZeroNoteNames)[number];
export type TransliteratedNoteNameOctaveTwo = (typeof octaveTwoNoteNames)[number];
export type TransliteratedNoteNameOctaveThree = (typeof octaveThreeNoteNames)[number];
export type TransliteratedNoteNameOctaveFour = (typeof octaveFourNoteNames)[number];
export declare function getNoteNameIndex(noteName: NoteName): number;
export declare function getNoteNameIndexAndOctave(noteName: NoteName): Cell;
export declare function getNoteNameFromIndexAndOctave(cell: Cell): NoteName;
export declare function shiftNoteName(noteName: NoteName, shift: number): NoteName;
//# sourceMappingURL=NoteName.d.ts.map