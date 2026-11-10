import { calculateJinsForms, calculateMaqamForms } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import PitchClass from "@/models/PitchClass";
import MaqamData, { Maqam, MaqamatModulations } from "@/models/Maqam";
import JinsData, { Jins, AjnasModulations } from "@/models/Jins";

/**
 * Every maqām and jins form one pitch space allows (a tuning system on one
 * starting note), and the modulations from any maqām form in it.
 *
 * The forms are calculated once, on first use. Every modulate() call scans
 * every maqām and jins and would otherwise recompute their forms itself (see
 * project_modulate-batch-caller-caches). The cached lists hold exactly what
 * modulate() would compute (same pitch classes, ajnās and centsTolerance), so
 * the modulations are identical with or without them.
 *
 * The maqām detail routes and the statistics generator both count through this
 * class, so a modulation count reads the same wherever it is published.
 */
export class PitchSpaceForms {
  private maqamFormsCache?: Map<string, Maqam[]>;
  private jinsFormsCache?: Map<string, Jins[]>;
  private readonly baseFormModulationCounts = new Map<string, { maqamat: number; ajnas: number }>();

  constructor(
    readonly pitchClasses: PitchClass[],
    readonly ajnas: JinsData[],
    readonly maqamatData: MaqamData[],
    readonly centsTolerance: number = 5
  ) {}

  /** Every maqām form of this maqām in this pitch space, the base form included */
  transpositionsOf(maqam: MaqamData): Maqam[] {
    const cached = this.maqamForms().get(maqam.getId());
    if (cached) return cached;
    return calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.centsTolerance);
  }

  /** Every rendering of the maqām with this id in the pitch space (empty if it cannot be built) */
  maqamRenderings(maqamId: string): Maqam[] {
    return this.maqamForms().get(maqamId) ?? [];
  }

  /** Every rendering of the jins with this id in the pitch space (empty if it cannot be built) */
  jinsRenderings(jinsId: string): Jins[] {
    return this.jinsForms().get(jinsId) ?? [];
  }

  /** The forms of every maqām this pitch space can build, keyed by maqām id */
  maqamForms(): Map<string, Maqam[]> {
    if (!this.maqamFormsCache) {
      const noteNames = this.pitchClasses.map((pc) => pc.noteName);
      this.maqamFormsCache = new Map(
        this.maqamatData
          .filter((maqam) => maqam.isMaqamPossible(noteNames))
          .map((maqam) => [maqam.getId(), calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.centsTolerance)])
      );
    }
    return this.maqamFormsCache;
  }

  /** The forms of every jins, keyed by jins id (an empty list where it cannot be built) */
  jinsForms(): Map<string, Jins[]> {
    if (!this.jinsFormsCache) {
      this.jinsFormsCache = new Map(
        this.ajnas.map((jins) => [jins.getId(), calculateJinsForms(this.pitchClasses, jins, this.centsTolerance)])
      );
    }
    return this.jinsFormsCache;
  }

  maqamatModulations(form: Maqam): MaqamatModulations {
    return modulate(this.pitchClasses, this.ajnas, this.maqamatData, form, false, this.centsTolerance, this.maqamForms()) as MaqamatModulations;
  }

  ajnasModulations(form: Maqam): AjnasModulations {
    return modulate(this.pitchClasses, this.ajnas, this.maqamatData, form, true, this.centsTolerance, undefined, this.jinsForms()) as AjnasModulations;
  }

  /** How many maqāmāt and how many ajnās this form can modulate to */
  modulationCounts(form: Maqam): { maqamat: number; ajnas: number } {
    return {
      maqamat: calculateNumberOfModulations(this.maqamatModulations(form)),
      ajnas: calculateNumberOfModulations(this.ajnasModulations(form)),
    };
  }

  /** The modulation counts of a maqām's base form, calculated once per maqām */
  baseFormCounts(maqam: MaqamData, baseForm: Maqam): { maqamat: number; ajnas: number } {
    let counts = this.baseFormModulationCounts.get(maqam.getId());
    if (!counts) {
      counts = this.modulationCounts(baseForm);
      this.baseFormModulationCounts.set(maqam.getId(), counts);
    }
    return counts;
  }
}
