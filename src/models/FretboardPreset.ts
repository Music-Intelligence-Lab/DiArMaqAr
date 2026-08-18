import NoteName from "@/models/NoteName";

/**
 * Dūzān (tuning) presets for the dasātīn view: which awtār an ʿūd carries and
 * what each open watar is tuned to.
 *
 * Stored as note names rather than ratios, which is what makes a preset
 * tuning-system agnostic: a fourth is a different ratio in every tanghīm, but
 * dūgāh is dūgāh. A preset is offered when every one of its notes resolves in
 * the selected tanghīm and starting note, and is refused with its reason
 * otherwise — never snapped to a nearest pitch class.
 *
 * These live in source rather than in data/*.json because the archive files are
 * rewritten wholesale when the admin saves; presets are authored knowledge, not
 * editable archive data. NoteName.ts is the precedent for large const arrays
 * living beside their types.
 */
export interface FretboardPreset {
  /** Stable ASCII id, used as the <select> value and React key. */
  id: string;
  /** Open notes, LOWEST FIRST — index 0 renders as the top row. */
  openStringNoteNames: NoteName[];
}

/**
 * The note names an open watar may carry. Deliberately a short, musically
 * sensible list rather than the whole ladder: these are the courses ʿūds are
 * actually tuned to. Not every tanghīm contains every one of them, so the
 * picker must filter this against what resolves before offering it.
 */
export const openStringNoteNameOptions: NoteName[] = [
  "qarār ʿushayrān",
  "qarār ʿajam ʿushayrān",
  "qarār rāst",
  "qarār dūgāh",
  "qarār būselīk/ʿushshāq",
  "qarār chahārgāh",
  "yegāh",
  "ʿushayrān",
  "rāst",
  "dūgāh",
  "nawā",
  "kurdān",
  "māhūrān",
  "jawāb ʿajam",
] as NoteName[];

/** The custom option, which is not a preset but sits at the top of the picker. */
export const CUSTOM_PRESET_ID = "custom";

/** Fewest and most awtār the picker offers. */
export const MIN_STRINGS = 1;
export const MAX_STRINGS = 7;

/**
 * A custom dūzān starts from the tanghīm's own 1/1 and stacks fourths upward,
 * which is the ordinary ʿūd tuning and the least surprising default. Expressed
 * as note names so it behaves like any other tuning; names that do not resolve
 * are reported rather than substituted.
 */
export const customTuningLadder: NoteName[] = [
  "ʿushayrān",
  "dūgāh",
  "nawā",
  "kurdān",
  "māhūrān",
  "jawāb ʿajam",
  "rāst",
] as NoteName[];

export const fretboardPresets: FretboardPreset[] = [
  { id: "four-strings", openStringNoteNames: ["ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "two-strings", openStringNoteNames: ["yegāh", "rāst"] as NoteName[] },
  { id: "five-strings-1", openStringNoteNames: ["ʿushayrān", "dūgāh", "nawā", "kurdān", "māhūrān"] as NoteName[] },
  { id: "five-strings-2", openStringNoteNames: ["yegāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "five-strings-3", openStringNoteNames: ["qarār chahārgāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
];

/** The dūzān shown before the reader chooses anything. */
export const DEFAULT_PRESET_ID = "four-strings";
