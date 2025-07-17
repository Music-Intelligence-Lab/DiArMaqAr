import NoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";
export default class TuningSystem {
    private id;
    private titleEnglish;
    private titleArabic;
    private year;
    private sourceEnglish;
    private sourceArabic;
    private sourcePageReferences;
    private creatorEnglish;
    private creatorArabic;
    private commentsEnglish;
    private commentsArabic;
    private tuningSystemPitchClasses;
    private setsOfTuningSystemNoteNames;
    private defaultReferenceFrequency;
    private referenceFrequencies;
    private abjadNames;
    private stringLength;
    private saved;
    constructor(titleEnglish: string, titleArabic: string, year: string, sourceEnglish: string, sourceArabic: string, SourcePageReferences: SourcePageReference[], creatorEnglish: string, creatorArabic: string, commentsEnglish: string, commentsArabic: string, notes: string[], setsOfTuningNoteNames: NoteName[][], abjadNames: string[], stringLength: number, referenceFrequencies: {
        [noteName: string]: number;
    }, defaultReferenceFrequency: number, saved: boolean);
    getId(): string;
    getTitleEnglish(): string;
    getTitleArabic(): string;
    getYear(): string;
    getSourceEnglish(): string;
    getSourceArabic(): string;
    getSourcePageReferences(): SourcePageReference[];
    getCreatorEnglish(): string;
    getCreatorArabic(): string;
    getCommentsEnglish(): string;
    getCommentsArabic(): string;
    getPitchClasses(): string[];
    getNoteNames(): NoteName[][];
    getAbjadNames(): string[];
    getStringLength(): number;
    getReferenceFrequencies(): {
        [noteName: string]: number;
    };
    getDefaultReferenceFrequency(): number;
    isSaved(): boolean;
    stringify(): string;
    getSetsOfNoteNamesShiftedUpAndDown(): NoteName[][];
    copyWithNewSetOfNoteNames(newNoteNames: NoteName[][]): TuningSystem;
    static createBlankTuningSystem(): TuningSystem;
}
//# sourceMappingURL=TuningSystem.d.ts.map