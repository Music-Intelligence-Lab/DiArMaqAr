import TuningSystem from "@/models/TuningSystem";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getSourceOudDivisions, ratioValue } from "@/functions/getFretboardDivisions";

/** Rounding slack when comparing cents computed from different units. */
const CENTS_EPSILON = 1e-6;

/**
 * Checks the ʿūd a source describes against the tuning system and throws,
 * naming the problem, if they disagree. The tuning system's pitches and the
 * source's instrument are two records of one thing, so each must account for
 * the other:
 *
 * - structure: unique fret and string ids, every ratio a ratio such as 4/3,
 *   frets rising from the nut, strings rising from the lowest, every fret a
 *   string names exists;
 * - every pitch the ʿūd sounds (each string open and at each of its frets) is a
 *   pitch of the tuning system;
 * - every pitch of the tuning system from the lowest open string up to the
 *   highest stopped note is sounded somewhere on the ʿūd. Pitches outside that
 *   range (an extension the source does not give) are not the ʿūd's to explain.
 */
export default function validateSourceOud(tuningSystem: TuningSystem): void {
  const oud = tuningSystem.getSourceOud();
  if (!oud) return;

  const fail = (message: string): never => {
    throw new Error(`Tuning system "${tuningSystem.getId()}", source ʿūd: ${message}`);
  };
  const ratio = (text: string, where: string) => {
    try {
      return ratioValue(text);
    } catch {
      return fail(`${where}: "${text}" is not a ratio such as 4/3`);
    }
  };

  if (!oud.strings.length) fail("it has no strings");
  if (!oud.frets.length) fail("it has no frets");
  if (!Array.isArray(oud.pageReferences)) fail("it has no list of page references");
  if (oud.pageReferences.some((ref) => !ref.sourceId)) fail("a page reference names no source");
  for (const [field, value] of [["stringsAttribution", oud.stringsAttribution], ["fretsAttribution", oud.fretsAttribution]] as const) {
    if (value !== "source" && value !== "secondary") fail(`${field} is "${value}", not "source" or "secondary"`);
  }

  const fretIds = new Set<string>();
  let previousFret = 1;
  for (const fret of oud.frets) {
    if (fretIds.has(fret.id)) fail(`the fret id "${fret.id}" is used twice`);
    fretIds.add(fret.id);
    const value = ratio(fret.ratio, `fret "${fret.id}"`);
    if (value <= previousFret) fail(`fret "${fret.id}" (${fret.ratio}) does not lie beyond the fret before it`);
    previousFret = value;
    if (!fret.nameEnglish || !fret.nameArabic) fail(`fret "${fret.id}" needs an English and an Arabic name`);
  }

  const stringIds = new Set<string>();
  let previousOpen = 0;
  for (const string of oud.strings) {
    if (stringIds.has(string.id)) fail(`the string id "${string.id}" is used twice`);
    stringIds.add(string.id);
    const value = ratio(string.openRatio, `string "${string.id}"`);
    if (value <= previousOpen) fail(`string "${string.id}" (${string.openRatio}) is not higher than the string below it`);
    previousOpen = value;
    for (const id of string.frets ?? []) {
      if (!fretIds.has(id)) fail(`string "${string.id}" names a fret "${id}" that is not among the frets`);
    }
  }

  // The ʿūd's pitches do not depend on the note-name set, so any set will do
  const startingNote = tuningSystem.getNoteNameSets()[0]?.[0];
  if (!startingNote) fail("the tuning system has no note-name set to read its pitches from");
  const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

  // Only whether the ʿūd lays out is checked, not the frets crossing each string, so any tolerance will do
  const layout = getSourceOudDivisions(pitchClasses, oud, 0);
  if (!layout.ok) {
    const missing = layout.reasons.map((r) => (r.kind === "sourcePitchNotInSystem" ? `${r.stringName} at ${r.fretName} (${r.ratio})` : r.kind));
    fail(`these pitches of the ʿūd are not pitches of the tuning system: ${missing.join("; ")}`);
  }
  if (!layout.ok) return;

  const sounded = layout.strings.flatMap((s) => s.divisions.map((d) => parseFloat(d.pitchClass.cents)));
  const lowest = Math.min(...sounded);
  const highest = Math.max(...sounded);
  const unexplained = pitchClasses.filter((pc) => {
    const cents = parseFloat(pc.cents);
    if (cents < lowest - CENTS_EPSILON || cents > highest + CENTS_EPSILON) return false;
    return !sounded.some((c) => Math.abs(c - cents) < CENTS_EPSILON);
  });
  if (unexplained.length) {
    fail(`these pitches of the tuning system are not sounded anywhere on the ʿūd: ${unexplained.map((pc) => `${pc.originalValue} (octave ${pc.octave})`).join(", ")}`);
  }
}
