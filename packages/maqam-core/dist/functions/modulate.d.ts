import PitchClass from "../models/PitchClass";
import JinsDetails, { AjnasModulations } from "../models/Jins";
import MaqamDetails, { Maqam, MaqamatModulations } from "../models/Maqam";
export default function modulate(allPitchClasses: PitchClass[], allAjnas: JinsDetails[], allMaqamat: MaqamDetails[], sourceMaqamTransposition: Maqam, ajnasModulationsMode: boolean, centsTolerance?: number): MaqamatModulations | AjnasModulations;
//# sourceMappingURL=modulate.d.ts.map