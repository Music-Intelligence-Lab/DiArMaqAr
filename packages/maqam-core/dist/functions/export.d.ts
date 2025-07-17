import NoteName from "../models/NoteName";
import TuningSystem from "../models/TuningSystem";
import JinsDetails, { AjnasModulations, Jins, JinsDetailsInterface } from "../models/Jins";
import MaqamDetails, { Maqam, MaqamatModulations, MaqamDetailsInterface } from "../models/Maqam";
import PitchClass from "../models/PitchClass";
interface ExportedTuningSystem {
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    numberOfPossibleAjnas?: number;
    numberOfAjnas?: number;
    possibleAjnasOverview?: JinsDetailsInterface[];
    possibleAjnas?: Jins[];
    numberOfPossibleMaqamat?: number;
    numberOfMaqamat?: number;
    possibleMaqamatOverview?: MaqamDetailsInterface[];
    possibleMaqamat?: Maqam[];
}
export interface ExportOptions {
    includeTuningSystemDetails: boolean;
    includePitchClasses: boolean;
    includeAjnasDetails: boolean;
    includeMaqamatDetails: boolean;
    includeModulations: boolean;
    modulationType: 'maqamat' | 'ajnas';
}
export interface JinsExportOptions {
    includeTuningSystemDetails: boolean;
    includePitchClasses: boolean;
    includeTranspositions: boolean;
}
export interface MaqamExportOptions {
    includeTuningSystemDetails: boolean;
    includePitchClasses: boolean;
    includeTranspositions: boolean;
    includeModulations: boolean;
    modulationType: 'maqamat' | 'ajnas';
}
interface ExportedJins {
    jinsDetails?: JinsDetailsInterface;
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    transpositions?: Jins[];
    numberOfTranspositions?: number;
}
interface ExportedMaqam {
    maqamDetails?: MaqamDetailsInterface;
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    transpositions?: Maqam[];
    numberOfTranspositions?: number;
    modulations?: MaqamatModulations | AjnasModulations;
    numberOfHops?: number;
}
export declare function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName, options: ExportOptions, centsTolerance?: number): ExportedTuningSystem;
export declare function exportJins(jins: JinsDetails, tuningSystem: TuningSystem, startingNote: NoteName, options: JinsExportOptions, centsTolerance?: number): ExportedJins;
export declare function exportMaqam(maqam: MaqamDetails, tuningSystem: TuningSystem, startingNote: NoteName, options: MaqamExportOptions, centsTolerance?: number): ExportedMaqam;
export {};
//# sourceMappingURL=export.d.ts.map