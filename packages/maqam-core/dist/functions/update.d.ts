import JinsDetails from "../models/Jins";
import MaqamDetails from "../models/Maqam";
import Pattern from "../models/Pattern";
import { Source } from "../models/bibliography/Source";
import TuningSystem from "../models/TuningSystem";
export declare function updateTuningSystems(newSystems: TuningSystem[]): Promise<void>;
export declare function updateAjnas(newAjnas: JinsDetails[]): Promise<void>;
export declare function updateMaqamat(newMaqamat: MaqamDetails[]): Promise<void>;
export declare function updateSources(sources: Source[]): Promise<void>;
export declare function updatePatterns(patterns: Pattern[]): Promise<void>;
//# sourceMappingURL=update.d.ts.map