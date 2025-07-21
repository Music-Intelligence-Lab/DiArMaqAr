import PitchClass from "../models/PitchClass";
import JinsTemplate, { AjnasModulations } from "../models/Jins";
import MaqamTemplate, { Maqam, MaqamatModulations } from "../models/Maqam";
export default function modulate(allPitchClasses: PitchClass[], allAjnas: JinsTemplate[], allMaqamat: MaqamTemplate[], sourceMaqamTransposition: Maqam, ajnasModulationsMode: boolean, centsTolerance?: number): MaqamatModulations | AjnasModulations;
//# sourceMappingURL=modulate.d.ts.map