import { entityToken, standardizeText } from "@/functions/export";
import { calculateJinsForms, calculateMaqamForms } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { spellMaqamDirections } from "@/app/api/pitch-spellings";
import { buildEntityNamespace, buildIdentifierNamespace } from "@/app/api/response-shapes";
import { getMaqamNameDisplayAr, getJinsNameDisplayAr, getNoteNameDisplayAr, getComments, getCommentsAr } from "@/app/api/arabic-helpers";
import PitchClass, { calculateInterval } from "@/models/PitchClass";
import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";
import { formTypeOf } from "@/functions/formType";
import MaqamData, { Maqam, MaqamatModulations, shiftMaqamByOctaves } from "@/models/Maqam";
import JinsData, { Jins, AjnasModulations, shiftJinsByOctaves } from "@/models/Jins";

/**
 * The analysis of one maqām form — its base form, a taṣwīr or an octave
 * rendering — as GET /maqamat/{idName} returns it.
 *
 * Both that route and the bulk GET /maqamat/all build their maqām objects here,
 * so a form reads the same whichever route a client asks: the bulk route's
 * items are this object, and the single route wraps it in its envelope
 * (parameters, context, links).
 */

/** Roman numeral for each maqām degree */
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

export const validPitchClassDataTypes = [
  "all",
  "englishName",
  "solfege",
  "fraction",
  "cents",
  "decimalRatio",
  "stringLength",
  "frequency",
  "abjadName",
  "fretDivision",
  "midiNoteNumber",
  "midiNoteDeviation",
  "centsDeviation",
  "referenceNoteName",
  "pitchClassIndex",
  "scaleDegree",
];

/**
 * Format pitch data according to requested format
 * @param pitchClasses - Array of pitch classes to format
 * @param format - Output format type
 * @param isDescending - Whether this is descending data (reverses scale degrees)
 * @param inArabic - Whether to return Arabic script for note names
 */
export function formatPitchData(pitchClasses: PitchClass[], format: string | null | undefined, isDescending: boolean = false, inArabic: boolean = false) {
  const length = pitchClasses.length;

  // The fields every format carries
  const base = (pc: PitchClass, index: number, withArabic: boolean = true) => ({
    pitchClassIndex: pc.pitchClassIndex,
    octave: pc.octave,
    scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
    noteName: standardizeText(pc.noteName),
    noteNameDisplay: pc.noteName,
    ...(withArabic && inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
  });

  // Return minimal fields when pitchClassDataType is not provided
  if (!format || format === "") return pitchClasses.map((pc, index) => base(pc, index));

  switch (format) {
    case "all":
      return pitchClasses.map((pc, index) => ({
        ...base(pc, index),
        englishName: pc.englishName,
        solfege: pc.solfege,
        abjadName: pc.abjadName,
        fraction: pc.fraction,
        cents: parseFloat(pc.cents),
        decimalRatio: parseFloat(pc.decimalRatio),
        stringLength: parseFloat(pc.stringLength),
        frequency: parseFloat(pc.frequency),
        fretDivision: pc.fretDivision,
        midiNoteDecimal: pc.midiNoteDecimal,
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation.toFixed(1)}`,
        centsDeviation: pc.centsDeviation,
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    case "englishName":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), englishName: pc.englishName }));
    case "solfege":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), solfege: pc.solfege }));
    case "fraction":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), fraction: pc.fraction }));
    case "cents":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), cents: parseFloat(pc.cents) }));
    case "decimalRatio":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), decimalRatio: parseFloat(pc.decimalRatio) }));
    case "stringLength":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), stringLength: parseFloat(pc.stringLength) }));
    case "frequency":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), frequency: parseFloat(pc.frequency) }));
    case "abjadName":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), abjadName: pc.abjadName }));
    case "fretDivision":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), fretDivision: pc.fretDivision }));
    case "midiNoteNumber":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), midiNoteDecimal: pc.midiNoteDecimal }));
    case "midiNoteDeviation":
      return pitchClasses.map((pc, index) => ({
        ...base(pc, index),
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation}`
      }));
    case "centsDeviation":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), centsDeviation: pc.centsDeviation }));
    case "referenceNoteName":
      return pitchClasses.map((pc, index) => ({ ...base(pc, index), ipnReferenceNoteName: pc.referenceNoteName }));
    case "pitchClassIndex":
    case "scaleDegree":
      return pitchClasses.map((pc, index) => base(pc, index, false));
    default:
      return pitchClasses; // Return full objects
  }
}

/**
 * Format interval data according to requested format
 */
export function formatIntervalData(intervals: any[], format: string) {
  switch (format) {
    case "all":
      return intervals.map((interval) => ({
        fraction: interval.fraction,
        cents: interval.cents,
        decimalRatio: interval.decimalRatio,
        stringLength: interval.stringLength,
        fretDivision: interval.fretDivision,
        pitchClassIndex: interval.pitchClassIndex
      }));
    case "fraction":
      return intervals.map((interval) => ({ fraction: interval.fraction }));
    case "cents":
      return intervals.map((interval) => ({ cents: interval.cents }));
    case "decimalRatio":
      return intervals.map((interval) => ({ decimalRatio: interval.decimalRatio }));
    case "stringLength":
      return intervals.map((interval) => ({ stringLength: interval.stringLength }));
    case "fretDivision":
      return intervals.map((interval) => ({ fretDivision: interval.fretDivision }));
    // Formats that don't apply to intervals return minimal info
    case "englishName":
    case "abjadName":
    case "frequency":
    case "midiNoteNumber":
    case "midiNoteDeviation":
    case "centsDeviation":
    case "referenceNoteName":
      return intervals.map((interval) => ({ cents: interval.cents }));
    default:
      return intervals; // Return full objects
  }
}

/** The top-level fields of a maqām form that `fields` can select; `maqam` is always present */
export const MAQAM_DETAIL_FIELDS = [
  "family",
  "tonic",
  "transposition",
  "stats",
  "characteristics",
  "availableTranspositions",
  "availableOctaveRenderings",
  "comments",
  "sources",
  "pitchData",
  "intervals",
  "ajnas",
  "primaryJins",
  "secondaryJins",
  "tertiaryJins",
  "primaryJinsDescending",
  "secondaryJinsDescending",
  "tertiaryJinsDescending",
  "ghammaz",
  "suyur",
  "modulations",
  "lowerOctaveModulations",
];

export interface MaqamDetailOptions {
  pitchClassDataType: string | null;
  includeIntervals: boolean;
  includeModulations: boolean;
  includeModulations8vb: boolean;
  includeSuyur: boolean;
  inArabic: boolean;
  centsTolerance: number;
}

/**
 * Everything one (tuning system, starting note, options) request shares across
 * the maqām forms it describes. The transposition caches are built once, on
 * first use: every modulate() call scans every maqām and jins and would
 * otherwise recompute their transpositions itself (see
 * project_modulate-batch-caller-caches). They hold exactly what modulate()
 * would compute — same pitch classes, ajnās and centsTolerance — so the
 * analysis is identical with or without them.
 */
export class MaqamDetailContext {
  private maqamTranspositionsCache?: Map<string, Maqam[]>;
  private jinsTranspositionsCache?: Map<string, Jins[]>;
  private readonly baseFormModulationCounts = new Map<string, { maqamat: number; ajnas: number }>();
  private maqamEntities?: Map<string, { id: string }>;
  private jinsEntities?: Map<string, { id: string }>;

  constructor(
    readonly pitchClasses: PitchClass[],
    readonly ajnas: JinsData[],
    readonly maqamatData: MaqamData[],
    readonly options: MaqamDetailOptions
  ) {}

  /** Every maqām form of this maqām in this pitch space, the base form included */
  transpositionsOf(maqam: MaqamData): Maqam[] {
    const cached = this.maqamTranspositions().get(maqam.getId());
    if (cached) return cached;
    return calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.options.centsTolerance);
  }

  /** Every rendering of the maqām with this id in the pitch space (empty if it cannot be built) */
  maqamRenderings(maqamId: string): Maqam[] {
    return this.maqamTranspositions().get(maqamId) ?? [];
  }

  /** Every rendering of the jins with this id in the pitch space (empty if it cannot be built) */
  jinsRenderings(jinsId: string): Jins[] {
    return this.jinsTranspositions().get(jinsId) ?? [];
  }

  private maqamTranspositions(): Map<string, Maqam[]> {
    if (!this.maqamTranspositionsCache) {
      const noteNames = this.pitchClasses.map((pc) => pc.noteName);
      this.maqamTranspositionsCache = new Map(
        this.maqamatData
          .filter((maqam) => maqam.isMaqamPossible(noteNames))
          .map((maqam) => [maqam.getId(), calculateMaqamForms(this.pitchClasses, this.ajnas, maqam, this.options.centsTolerance)])
      );
    }
    return this.maqamTranspositionsCache;
  }

  private jinsTranspositions(): Map<string, Jins[]> {
    if (!this.jinsTranspositionsCache) {
      this.jinsTranspositionsCache = new Map(
        this.ajnas.map((jins) => [jins.getId(), calculateJinsForms(this.pitchClasses, jins, this.options.centsTolerance)])
      );
    }
    return this.jinsTranspositionsCache;
  }

  maqamatModulations(form: Maqam): MaqamatModulations {
    return modulate(this.pitchClasses, this.ajnas, this.maqamatData, form, false, this.options.centsTolerance, this.maqamTranspositions()) as MaqamatModulations;
  }

  ajnasModulations(form: Maqam): AjnasModulations {
    return modulate(this.pitchClasses, this.ajnas, this.maqamatData, form, true, this.options.centsTolerance, undefined, this.jinsTranspositions()) as AjnasModulations;
  }

  /** The modulation counts in `stats`, which describe the base form whatever form is shown */
  baseFormCounts(maqam: MaqamData, baseForm: Maqam): { maqamat: number; ajnas: number } {
    let counts = this.baseFormModulationCounts.get(maqam.getId());
    if (!counts) {
      const total = (modulations: object) =>
        Object.values(modulations).filter((value) => Array.isArray(value)).reduce((sum, list) => sum + list.length, 0);
      counts = { maqamat: total(this.maqamatModulations(baseForm)), ajnas: total(this.ajnasModulations(baseForm)) };
      this.baseFormModulationCounts.set(maqam.getId(), counts);
    }
    return counts;
  }

  maqamEntity(id: string): { id: string } | undefined {
    this.maqamEntities ??= new Map(this.maqamatData.map((maqam) => [maqam.getId(), { id: maqam.getId() }]));
    return this.maqamEntities.get(id);
  }

  jinsEntity(id: string): { id: string } | undefined {
    this.jinsEntities ??= new Map(this.ajnas.map((jins) => [jins.getId(), { id: jins.getId() }]));
    return this.jinsEntities.get(id);
  }
}

/** The jins as a maqām degree names it: an entity reference to that form */
function jinsReference(jins: Jins, inArabic: boolean) {
  return {
    id: jins.jinsId,
    idName: entityToken(jins),
    displayName: jins.name || '',
    isBaseForm: jins.isBaseForm,
    formType: formTypeOf(jins),
    ...(inArabic && { displayNameAr: getJinsNameDisplayAr(jins.name || '') }),
  };
}

/**
 * Every jins found at each degree, keyed by the degree's URL-safe note name
 * (the `noteName` of `pitchData`), in suyūr-attested order; an empty array
 * where nothing matches.
 */
export function ajnasByDegree(pitchClasses: PitchClass[], ajnasPerDegree: Jins[][] | undefined, inArabic: boolean) {
  const byDegree: Record<string, ReturnType<typeof jinsReference>[]> = {};
  if (!ajnasPerDegree) return byDegree;
  pitchClasses.forEach((pc, i) => {
    byDegree[standardizeText(pc.noteName)] = (ajnasPerDegree[i] ?? []).map((jins) => jinsReference(jins, inArabic));
  });
  return byDegree;
}

/**
 * Why a structural jins entry has a jins or not:
 *
 * - "matched": the archive has a jins starting on this degree in this direction
 * - "noMatchingJins": the degree is in the maqām, but no jins in the archive
 *   starts there in this tuning system (maqām lāmī's degree IV, nawā)
 * - "degreeNotInMaqam": the stored degree is not one of the notes this
 *   direction of the maqām passes through
 *
 * The data stores each structural slot as a degree (a note name) from the
 * sources; the jins on it is what the archive finds there.
 */
export type StructuralJinsStatus = "matched" | "noMatchingJins" | "degreeNotInMaqam";

/** The notes of one direction from the tonic upwards, with the ajnās found on each */
function directionDegrees(form: Maqam, direction: "ascending" | "descending"): { pitchClasses: PitchClass[]; ajnas: Jins[][] } {
  if (direction === "ascending") return { pitchClasses: form.ascendingPitchClasses, ajnas: form.ascendingMaqamAjnas ?? [] };
  // Stored top-down; read upwards so a degree counts from the tonic
  return { pitchClasses: [...form.descendingPitchClasses].reverse(), ajnas: [...(form.descendingMaqamAjnas ?? [])].reverse() };
}

function degreeEntry(noteName: string, index: number, inArabic: boolean) {
  return {
    noteName: standardizeText(noteName),
    noteNameDisplay: noteName,
    ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(noteName) }),
    maqamDegree: index >= 0 ? romanNumerals[index] || String(index + 1) : null,
  };
}

/**
 * The structural jins entries of one slot (primary, secondary or tertiary) in
 * one direction: each source-given degree, its place in that direction of the
 * form, and the jins the archive finds starting there. Null when the form has
 * no entry for the slot (rāst has no tertiary jins). Arrays, to allow
 * alternatives at a slot.
 */
export function structuralJinsEntries(
  form: Maqam,
  noteNames: string[] | null | undefined,
  direction: "ascending" | "descending",
  inArabic: boolean
): any[] | null {
  if (noteNames == null) return null;
  const { pitchClasses, ajnas } = directionDegrees(form, direction);
  return noteNames.map((noteName) => {
    const index = pitchClasses.findIndex((pc) => pc.noteName === noteName);
    // The first of the ajnās on the degree, in suyūr-attested order (as `ajnas` lists them)
    const jins = index >= 0 ? ajnas[index]?.[0] : undefined;
    const jinsStatus: StructuralJinsStatus = index < 0 ? "degreeNotInMaqam" : jins ? "matched" : "noMatchingJins";
    return {
      ...degreeEntry(noteName, index, inArabic),
      jinsStatus,
      jinsId: jins ? jins.jinsId : null,
      jinsIdName: jins ? entityToken(jins) : null,
      jinsDisplayName: jins ? jins.name || "" : null,
      jinsIsBaseForm: jins ? jins.isBaseForm : null,
      jinsFormType: jins ? formTypeOf(jins) : null,
      ...(inArabic && { jinsDisplayNameAr: jins ? getJinsNameDisplayAr(jins.name || "") : null }),
    };
  });
}

/**
 * The ghammāz entries of a form: each degree, its place in the ascending form,
 * and the interval from the tonic up to it (cents and ratio). The interval is
 * null when the ghammāz is not one of the ascending notes.
 */
export function ghammazEntries(form: Maqam, noteNames: string[] | null | undefined, inArabic: boolean): any[] | null {
  if (noteNames == null) return null;
  const tonic = form.ascendingPitchClasses[0];
  return noteNames.map((noteName) => {
    const index = form.ascendingPitchClasses.findIndex((pc) => pc.noteName === noteName);
    const interval = index >= 0 ? calculateInterval(tonic, form.ascendingPitchClasses[index]) : null;
    return {
      ...degreeEntry(noteName, index, inArabic),
      intervalFromTonic: interval && { cents: interval.cents, fraction: interval.fraction, decimalRatio: interval.decimalRatio },
    };
  });
}

const MODULATION_DEGREES = [
  ["firstDegree", "modulationsOnFirstDegree"],
  ["thirdDegree", "modulationsOnThirdDegree"],
  ["altThirdDegree", "modulationsOnAltThirdDegree"],
  ["fourthDegree", "modulationsOnFourthDegree"],
  ["fifthDegree", "modulationsOnFifthDegree"],
  ["sixthDegreeAsc", "modulationsOnSixthDegreeAsc"],
  ["sixthDegreeDesc", "modulationsOnSixthDegreeDesc"],
  ["sixthDegreeIfNoThird", "modulationsOnSixthDegreeIfNoThird"],
] as const;

/** The modulation targets on each degree, as entity references to each form */
function serializeModulations(
  ctx: MaqamDetailContext,
  maqamatModulations: MaqamatModulations,
  ajnasModulations: AjnasModulations,
  octaveShift: 0 | -1
) {
  const { inArabic } = ctx.options;
  const serialize = (targets: (Maqam | Jins)[], isAjnas: boolean) =>
    targets
      .map((target: any) => {
        const entity = isAjnas ? ctx.jinsEntity(target.jinsId) : ctx.maqamEntity(target.maqamId);
        if (!entity) return null;
        const tonic = target.ascendingPitchClasses?.[0]?.noteName || target.jinsPitchClasses?.[0]?.noteName || '';
        const reference: any = {
          id: entity.id,
          idName: entityToken(target),
          displayName: target.name,
          tonicIdName: standardizeText(tonic),
          tonicDisplayName: tonic,
        };
        if (!isAjnas) reference.isTransposition = target.transposition || false;
        // Both kinds: an octave rendering of the base form is not a
        // taṣwīr, so isTransposition alone cannot identify the base form.
        reference.isBaseForm = target.isBaseForm || false;
        reference.formType = formTypeOf(target);
        if (inArabic) {
          reference.displayNameAr = isAjnas ? getJinsNameDisplayAr(target.name) : getMaqamNameDisplayAr(target.name);
          reference.tonicDisplayNameAr = getNoteNameDisplayAr(tonic);
        }
        return reference;
      })
      .filter(Boolean);

  const shiftMaqam = (targets: Maqam[]) =>
    octaveShift === 0
      ? targets
      : (targets.map((m) => shiftMaqamByOctaves(ctx.pitchClasses, m, octaveShift, ctx.maqamRenderings(m.maqamId))).filter(Boolean) as Maqam[]);
  const shiftJins = (targets: Jins[]) =>
    octaveShift === 0
      ? targets
      : (targets.map((j) => shiftJinsByOctaves(ctx.pitchClasses, j, octaveShift, ctx.jinsRenderings(j.jinsId))).filter(Boolean) as Jins[]);

  const maqamat: any = {};
  const ajnas: any = {};
  for (const [field, source] of MODULATION_DEGREES) {
    maqamat[field] = serialize(shiftMaqam(maqamatModulations[source] as Maqam[]), false);
    ajnas[field] = serialize(shiftJins(ajnasModulations[source] as Jins[]), true);
  }
  // The niṣf note is named only for the modulations on the maqām's own register
  if (octaveShift === 0) {
    maqamat.noteNameNisfBelowThird = maqamatModulations.noteNameNisfBelowThird;
    ajnas.noteNameNisfBelowThird = ajnasModulations.noteNameNisfBelowThird;
  }
  return { maqamat, ajnas };
}

/**
 * One maqām form as GET /maqamat/{idName} describes it.
 *
 * @param envelope - fields the caller places after `sources` (the single route's
 *   parameters, context and links), so its key order stays as documented
 * @param fields - the top-level fields to build; all of them when omitted.
 *   `maqam` is always built. A field left out is not computed at all, so a
 *   client that skips modulations and stats skips the modulation analysis.
 */
export function buildMaqamDetail(
  ctx: MaqamDetailContext,
  maqam: MaqamData,
  transpositions: Maqam[],
  form: Maqam,
  envelope: Record<string, unknown> = {},
  fields?: ReadonlySet<string>
): Record<string, any> {
  const { inArabic, pitchClassDataType, includeIntervals, includeModulations, includeModulations8vb, includeSuyur } = ctx.options;
  const wants = (field: string) => !fields || fields.has(field);

  // The base form, by flag rather than by position — transpose.ts happens to
  // return it first, but nothing states that as a contract.
  const baseForm = transpositions.find((t) => t.isBaseForm)!;
  const familyClassification = classifyMaqamFamily(baseForm);

  // A taṣwīr moves the tonic to another modal degree. An octave-register
  // sibling of the base form is not one, so it has no `transposition`
  // namespace and isBaseForm is false all the same.
  const originalMaqamTonic = maqam.getAscendingNoteNames()[0];
  const formTonic = form.ascendingPitchClasses[0].noteName;
  const isTransposed =
    getNoteNameIndexAndOctave(originalMaqamTonic as NoteName).index !== getNoteNameIndexAndOctave(formTonic as NoteName).index;

  const tonicNamespace = buildIdentifierNamespace(
    { idName: standardizeText(formTonic), displayName: formTonic },
    { inArabic, displayAr: inArabic ? getNoteNameDisplayAr(formTonic) : undefined }
  );

  const familyId = standardizeText(familyClassification.familyName);
  const familyDisplay = familyClassification.familyName;

  const ascendingNoteNames = form.ascendingPitchClasses.map((pc) => pc.noteName);
  const descendingNoteNames = form.descendingPitchClasses.map((pc) => pc.noteName);

  const availableForm = (t: Maqam) => {
    const tonic = t.ascendingPitchClasses[0].noteName;
    return {
      idName: entityToken(t),
      displayName: t.name,
      ...(inArabic && { displayNameAr: getMaqamNameDisplayAr(t.name) }),
      formType: formTypeOf(t),
      tonic: {
        idName: standardizeText(tonic),
        displayName: tonic,
        ...(inArabic && { displayNameAr: getNoteNameDisplayAr(tonic) }),
      },
    };
  };

  const detail: Record<string, any> = {
    maqam: buildEntityNamespace(
      { id: maqam.getId(), idName: entityToken(form), displayName: form.name },
      {
        version: maqam.getVersion(),
        extras: { isBaseForm: form.isBaseForm, formType: formTypeOf(form) },
        inArabic,
        displayNameAr: inArabic ? getMaqamNameDisplayAr(form.name) : undefined,
      }
    ),
    family: buildIdentifierNamespace(
      { idName: familyId, displayName: familyDisplay },
      { inArabic, displayAr: inArabic && familyDisplay !== "unknown" ? getMaqamNameDisplayAr(familyDisplay) : undefined }
    ),
    tonic: tonicNamespace,
    transposition: isTransposed
      ? {
          original: buildIdentifierNamespace(
            { idName: standardizeText(originalMaqamTonic), displayName: originalMaqamTonic },
            { inArabic, displayAr: inArabic ? getNoteNameDisplayAr(originalMaqamTonic) : undefined }
          ),
          resolved: tonicNamespace,
        }
      : undefined,
    stats: wants("stats")
      ? {
          numberOfTranspositions: transpositions.filter((t) => t.transposition).length,
          numberOfPitchClasses: ascendingNoteNames.length,
          numberOfMaqamModulations: ctx.baseFormCounts(maqam, baseForm).maqamat,
          numberOfAjnasModulations: ctx.baseFormCounts(maqam, baseForm).ajnas,
        }
      : undefined,
    characteristics: {
      isOctaveRepeating: ascendingNoteNames.length <= 7,
      hasAsymmetricDescending: JSON.stringify(ascendingNoteNames) !== JSON.stringify([...descendingNoteNames].reverse()),
      hasSuyur: maqam.getSuyur().length > 0,
    },
    // Intentionally minimal: a client wanting a form's own analysis asks for
    // that form. The taṣwīr, then the octave renderings, each its own list.
    availableTranspositions: transpositions.filter((t) => formTypeOf(t) === "transposition").map(availableForm),
    availableOctaveRenderings: transpositions.filter((t) => formTypeOf(t) === "octaveRendering").map(availableForm),
    comments: {
      english: getComments(maqam.getCommentsEnglish()),
      arabic: getCommentsAr(maqam.getCommentsArabic()),
    },
    sources: maqam.getSourcePageReferences().map((src) => ({ sourceId: src.sourceId, page: src.page })),
    ...envelope,
  };
  if (fields) {
    for (const key of Object.keys(detail)) if (key !== "maqam" && !(key in envelope) && !fields.has(key)) delete detail[key];
  }

  // Maqām-context spellings, each direction on its own (shared with the
  // compare route so both read the same)
  if (wants("pitchData")) {
    const spelled = spellMaqamDirections(form.ascendingPitchClasses, form.descendingPitchClasses);
    detail.pitchData = {
      ascending: formatPitchData(spelled.ascending, pitchClassDataType, false, inArabic),
      descending: formatPitchData(spelled.descending, pitchClassDataType, true, inArabic),
    };
  }

  if (includeIntervals && wants("intervals")) {
    detail.intervals = {
      ascending: formatIntervalData(form.ascendingPitchClassIntervals, pitchClassDataType || "all"),
      descending: formatIntervalData(form.descendingPitchClassIntervals, pitchClassDataType || "all"),
    };
  }

  if (wants("ajnas")) {
    detail.ajnas = {
      ascending: ajnasByDegree(form.ascendingPitchClasses, form.ascendingMaqamAjnas, inArabic),
      descending: ajnasByDegree(form.descendingPitchClasses, form.descendingMaqamAjnas, inArabic),
    };
  }

  // Transposed in step with the form: each entry names the form's own notes
  // and their degree in it. Arrays, to allow alternatives at a slot.
  for (const [field, noteNames] of [
    ["primaryJins", form.primaryJinsNoteName],
    ["secondaryJins", form.secondaryJinsNoteName],
    ["tertiaryJins", form.tertiaryJinsNoteName],
  ] as const) {
    if (wants(field)) detail[field] = structuralJinsEntries(form, noteNames, "ascending", inArabic);
    const descendingField = `${field}Descending`;
    if (wants(descendingField)) detail[descendingField] = structuralJinsEntries(form, noteNames, "descending", inArabic);
  }
  if (wants("ghammaz")) detail.ghammaz = ghammazEntries(form, form.ghammazNoteName, inArabic);

  if (includeSuyur && wants("suyur")) detail.suyur = maqam.getSuyur();

  if (includeModulations && (wants("modulations") || (includeModulations8vb && wants("lowerOctaveModulations")))) {
    const maqamatModulations = ctx.maqamatModulations(form);
    const ajnasModulations = ctx.ajnasModulations(form);
    if (wants("modulations")) detail.modulations = serializeModulations(ctx, maqamatModulations, ajnasModulations, 0);
    if (includeModulations8vb && wants("lowerOctaveModulations")) {
      detail.lowerOctaveModulations = serializeModulations(ctx, maqamatModulations, ajnasModulations, -1);
    }
  }

  return detail;
}
