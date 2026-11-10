import { calculateJinsForms, calculateMaqamForms } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import PitchClass from "@/models/PitchClass";
import MaqamData, { Maqam, MaqamatModulations, Sayr } from "@/models/Maqam";
import { playableSuyur, SuyurContext } from "@/functions/playableSuyur";
import JinsData, { Jins, AjnasModulations } from "@/models/Jins";

/**
 * Every maqām and jins form one pitch space allows (a tuning system on one
 * starting note), and the modulations from any maqām form in it.
 *
 * Each form list is calculated once, on first use. Every modulate() call scans
 * every maqām and jins and would otherwise recompute their forms itself (see
 * project_modulate-batch-caller-caches). The cached lists hold exactly what
 * modulate() would compute (same pitch classes, ajnās and centsTolerance), so
 * the modulations are identical with or without them.
 *
 * The maqām detail routes and the statistics generator both count through this
 * class, so a modulation count or a sayr count reads the same wherever it is
 * published. A form list is calculated only when first asked for, so judging a
 * sayr builds just the maqāmāt and ajnās it names.
 */
export class PitchSpaceForms {
  /** Forms by id, each calculated on first request (an empty list where it cannot be built) */
  private readonly maqamFormsById = new Map<string, Maqam[]>();
  private readonly jinsFormsById = new Map<string, Jins[]>();
  private allMaqamForms?: Map<string, Maqam[]>;
  private allJinsForms?: Map<string, Jins[]>;
  private noteNames?: string[];
  private suyurContext?: SuyurContext;
  private readonly baseFormModulationCounts = new Map<string, { maqamat: number; ajnas: number }>();

  constructor(
    readonly pitchClasses: PitchClass[],
    readonly ajnas: JinsData[],
    readonly maqamatData: MaqamData[],
    readonly centsTolerance: number = 5
  ) {}

  /** Every maqām form of this maqām in this pitch space, the base form included */
  transpositionsOf(maqam: MaqamData): Maqam[] {
    if (this.maqamatData.some((other) => other.getId() === maqam.getId())) return this.maqamRenderings(maqam.getId());
    return calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.centsTolerance);
  }

  /** Every rendering of the maqām with this id in the pitch space (empty if it cannot be built) */
  maqamRenderings(maqamId: string): Maqam[] {
    let forms = this.maqamFormsById.get(maqamId);
    if (!forms) {
      const maqam = this.maqamatData.find((other) => other.getId() === maqamId);
      if (!maqam) throw new Error(`No maqām with id ${maqamId}`);
      forms = maqam.isMaqamPossible(this.pitchSpaceNoteNames())
        ? calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.centsTolerance)
        : [];
      this.maqamFormsById.set(maqamId, forms);
    }
    return forms;
  }

  /** Every rendering of the jins with this id in the pitch space (empty if it cannot be built) */
  jinsRenderings(jinsId: string): Jins[] {
    let forms = this.jinsFormsById.get(jinsId);
    if (!forms) {
      const jins = this.ajnas.find((other) => other.getId() === jinsId);
      if (!jins) throw new Error(`No jins with id ${jinsId}`);
      forms = calculateJinsForms(this.pitchClasses, jins, this.centsTolerance);
      this.jinsFormsById.set(jinsId, forms);
    }
    return forms;
  }

  /** The forms of every maqām this pitch space can build, keyed by maqām id */
  maqamForms(): Map<string, Maqam[]> {
    this.allMaqamForms ??= new Map(
      this.maqamatData
        .filter((maqam) => maqam.isMaqamPossible(this.pitchSpaceNoteNames()))
        .map((maqam) => [maqam.getId(), this.maqamRenderings(maqam.getId())])
    );
    return this.allMaqamForms;
  }

  /** The forms of every jins, keyed by jins id (an empty list where it cannot be built) */
  jinsForms(): Map<string, Jins[]> {
    this.allJinsForms ??= new Map(this.ajnas.map((jins) => [jins.getId(), this.jinsRenderings(jins.getId())]));
    return this.allJinsForms;
  }

  /** The suyūr of the maqām that can be played on this form, moved onto it (see playableSuyur) */
  playableSuyur(maqam: MaqamData, form: Maqam): Sayr[] {
    this.suyurContext ??= {
      pitchClasses: this.pitchClasses,
      ajnas: this.ajnas,
      maqamat: this.maqamatData,
      renderings: { maqam: (id) => this.maqamRenderings(id), jins: (id) => this.jinsRenderings(id) },
    };
    return playableSuyur(maqam, form, this.suyurContext);
  }

  private pitchSpaceNoteNames(): string[] {
    this.noteNames ??= this.pitchClasses.map((pitchClass) => pitchClass.noteName);
    return this.noteNames;
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
