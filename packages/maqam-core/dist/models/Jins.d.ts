import { SourcePageReference } from "./bibliography/Source";
import PitchClass, { PitchClassInterval } from "./PitchClass";
import NoteName from "./NoteName";
export interface JinsTemplateInterface {
    id: string;
    name: string;
    noteNames: NoteName[];
    commentsEnglish: string;
    commentsArabic: string;
    SourcePageReferences: SourcePageReference[];
    numberOfTranspositions?: number;
}
export default class JinsTemplate {
    private id;
    private name;
    private noteNames;
    private commentsEnglish;
    private commentsArabic;
    private SourcePageReferences;
    constructor(id: string, name: string, noteNames: string[], commentsEnglish: string, commentsArabic: string, SourcePageReferences: SourcePageReference[]);
    getId(): string;
    getName(): string;
    getNoteNames(): NoteName[];
    getCommentsEnglish(): string;
    getCommentsArabic(): string;
    getSourcePageReferences(): SourcePageReference[];
    isJinsSelectable(allNoteNames: NoteName[]): boolean;
    createJinsWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): JinsTemplate;
    getTahlil(allPitchClasses: PitchClass[]): Jins;
    convertToObject(): JinsTemplateInterface;
}
export interface Jins {
    jinsId: string;
    name: string;
    transposition: boolean;
    jinsPitchClasses: PitchClass[];
    jinsPitchClassIntervals: PitchClassInterval[];
}
export interface AjnasModulations {
    modulationsOnOne: Jins[];
    modulationsOnThree: Jins[];
    modulationsOnThree2p: Jins[];
    modulationsOnFour: Jins[];
    modulationsOnFive: Jins[];
    modulationsOnSixAscending: Jins[];
    modulationsOnSixDescending: Jins[];
    modulationsOnSixNoThird: Jins[];
    noteName2p: string;
}
//# sourceMappingURL=Jins.d.ts.map