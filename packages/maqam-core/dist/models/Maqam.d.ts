import PitchClass, { PitchClassInterval } from "./PitchClass";
import { AjnasModulations, Jins } from "./Jins";
import NoteName from "./NoteName";
import { SourcePageReference } from "./bibliography/Source";
export interface MaqamTemplateInterface {
    id: string;
    name: string;
    ascendingNoteNames: NoteName[];
    descendingNoteNames: NoteName[];
    suyūr: Sayr[];
    commentsEnglish: string;
    commentsArabic: string;
    sourcePageReferences: SourcePageReference[];
    numberOfTranspositions?: number;
}
export default class MaqamTemplate {
    private id;
    private name;
    private ascendingNoteNames;
    private descendingNoteNames;
    private suyūr;
    private commentsEnglish;
    private commentsArabic;
    private sourcePageReferences;
    ascendingPitchClasses: any;
    constructor(id: string, name: string, ascendingNoteNames: NoteName[], descendingNoteNames: NoteName[], suyūr: Sayr[], commentsEnglish: string, commentsArabic: string, sourcePageReferences: SourcePageReference[]);
    getId(): string;
    getName(): string;
    getAscendingNoteNames(): NoteName[];
    getDescendingNoteNames(): NoteName[];
    getSuyūr(): Sayr[];
    getCommentsEnglish(): string;
    getCommentsArabic(): string;
    getSourcePageReferences(): SourcePageReference[];
    isMaqamSymmetric(): boolean;
    isMaqamSelectable(allNoteNames: NoteName[]): boolean;
    getTahlil(allPitchClasses: PitchClass[]): Maqam;
    createMaqamWithNewSuyūr(newSuyūr: Sayr[]): MaqamTemplate;
    createMaqamWithNewSourcePageReferences(newSourcePageReferences: SourcePageReference[]): MaqamTemplate;
    convertToObject(): MaqamTemplateInterface;
}
export interface Sayr {
    id: string;
    creatorEnglish: string;
    creatorArabic: string;
    sourceId: string;
    page: string;
    commentsEnglish: string;
    commentsArabic: string;
    stops: SayrStop[];
}
export interface SayrStop {
    type: "note" | "jins" | "maqam" | "direction";
    value: string;
    startingNote?: NoteName;
    direction?: "ascending" | "descending";
}
export interface Maqam {
    maqamId: string;
    name: string;
    transposition: boolean;
    ascendingPitchClasses: PitchClass[];
    ascendingPitchClassIntervals: PitchClassInterval[];
    ascendingMaqamAjnas?: (Jins | null)[];
    descendingPitchClasses: PitchClass[];
    descendingPitchClassIntervals: PitchClassInterval[];
    descendingMaqamAjnas?: (Jins | null)[];
    modulations?: MaqamatModulations | AjnasModulations;
    numberOfHops?: number;
}
export interface MaqamatModulations {
    modulationsOnOne: Maqam[];
    modulationsOnThree: Maqam[];
    modulationsOnThree2p: Maqam[];
    modulationsOnFour: Maqam[];
    modulationsOnFive: Maqam[];
    modulationsOnSixAscending: Maqam[];
    modulationsOnSixDescending: Maqam[];
    modulationsOnSixNoThird: Maqam[];
    noteName2p: string;
}
//# sourceMappingURL=Maqam.d.ts.map