import NoteName from "../models/NoteName";
import TuningSystem from "../models/TuningSystem";
import JinsTemplate, { AjnasModulations, Jins, JinsTemplateInterface } from "../models/Jins";
import MaqamTemplate, { Maqam, MaqamatModulations, MaqamTemplateInterface } from "../models/Maqam";
import PitchClass from "../models/PitchClass";
interface ExportedTuningSystem {
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    numberOfPossibleAjnas?: number;
    numberOfAjnas?: number;
    possibleAjnasOverview?: JinsTemplateInterface[];
    possibleAjnas?: Jins[];
    numberOfPossibleMaqamat?: number;
    numberOfMaqamat?: number;
    possibleMaqamatOverview?: MaqamTemplateInterface[];
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
    jinsTemplate?: JinsTemplateInterface;
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    transpositions?: Jins[];
    numberOfTranspositions?: number;
}
interface ExportedMaqam {
    maqamTemplate?: MaqamTemplateInterface;
    tuningSystem?: TuningSystem;
    startingNote?: NoteName;
    fullRangeTuningSystemPitchClasses?: PitchClass[];
    transpositions?: Maqam[];
    numberOfTranspositions?: number;
    modulations?: MaqamatModulations | AjnasModulations;
    numberOfHops?: number;
}
export declare function exportTuningSystem(tuningSystem: TuningSystem, startingNote: NoteName, options: ExportOptions, centsTolerance?: number): ExportedTuningSystem;
export declare function exportJins(jins: JinsTemplate, tuningSystem: TuningSystem, startingNote: NoteName, options: JinsExportOptions, centsTolerance?: number): ExportedJins;
export declare function exportMaqam(maqam: MaqamTemplate, tuningSystem: TuningSystem, startingNote: NoteName, options: MaqamExportOptions, centsTolerance?: number): ExportedMaqam;
export {};
//# sourceMappingURL=export.d.ts.map