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
  /**
   * How the picker names it: by a fixed label (its translation key), or by
   * its range, from its lowest open note to its highest (the five- and
   * six-string ʿūds, which differ in where they start and end). Two ʿūds with
   * the same range are told apart by the open note of one string, named by
   * its tablature number (the lowest string carries the highest number).
   */
  label: { key: string } | { range: true; showString?: number };
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

/** The source's own ʿūd (SourceOud), offered when the tuning system records one. */
export const SOURCE_PRESET_ID = "source";

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

// In the picker's order: fewest strings first; within a string count, lowest first
export const fretboardPresets: FretboardPreset[] = [
  { id: "two-strings-fourth", label: { key: "fretboard.preset.two-strings-fourth" }, openStringNoteNames: ["yegāh", "rāst"] as NoteName[] },
  { id: "two-strings", label: { key: "fretboard.preset.two-strings" }, openStringNoteNames: ["yegāh", "dūgāh"] as NoteName[] },
  { id: "four-strings", label: { key: "fretboard.preset.four-strings" }, openStringNoteNames: ["ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "five-strings-qarar-buselik", label: { range: true }, openStringNoteNames: ["qarār būselīk/ʿushshāq", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "five-strings-3", label: { range: true }, openStringNoteNames: ["qarār chahārgāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "five-strings-2", label: { range: true }, openStringNoteNames: ["yegāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "five-strings-1", label: { range: true }, openStringNoteNames: ["ʿushayrān", "dūgāh", "nawā", "kurdān", "māhūrān"] as NoteName[] },
  { id: "six-strings-yegah", label: { range: true, showString: 5 }, openStringNoteNames: ["qarār rāst", "yegāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "six-strings-qarar-chahargah", label: { range: true, showString: 5 }, openStringNoteNames: ["qarār rāst", "qarār chahārgāh", "ʿushayrān", "dūgāh", "nawā", "kurdān"] as NoteName[] },
  { id: "six-strings-qarar-buselik", label: { range: true, showString: 5 }, openStringNoteNames: ["qarār būselīk/ʿushshāq", "ʿushayrān", "dūgāh", "nawā", "kurdān", "māhūrān"] as NoteName[] },
  { id: "six-strings-ushayran", label: { range: true, showString: 5 }, openStringNoteNames: ["qarār chahārgāh", "ʿushayrān", "dūgāh", "nawā", "kurdān", "māhūrān"] as NoteName[] },
];

/** The dūzān shown before the reader chooses anything. */
export const DEFAULT_PRESET_ID = "four-strings";

/**
 * The dūzān in force for a tuning system: the reader's choice made on that
 * tuning system, else the source's ʿūd when the tuning system records one,
 * else the default. A "source" choice whose ʿūd no longer exists falls back
 * the same way. Custom keeps its own open notes; a preset's come from it.
 */
export function resolveDuzan(
  choice: { tuningSystemId: string; presetId: string; customOpenStrings: NoteName[] } | null,
  tuningSystemId: string,
  hasSourceOud: boolean
): { presetId: string; openStringNoteNames: NoteName[] } {
  const own = choice?.tuningSystemId === tuningSystemId ? choice : null;
  const automatic = hasSourceOud ? SOURCE_PRESET_ID : DEFAULT_PRESET_ID;
  const presetId = !own || (own.presetId === SOURCE_PRESET_ID && !hasSourceOud) ? automatic : own.presetId;
  const openStringNoteNames =
    presetId === CUSTOM_PRESET_ID
      ? own!.customOpenStrings
      : (fretboardPresets.find((p) => p.id === presetId) ?? fretboardPresets.find((p) => p.id === DEFAULT_PRESET_ID)!).openStringNoteNames;
  return { presetId, openStringNoteNames };
}
