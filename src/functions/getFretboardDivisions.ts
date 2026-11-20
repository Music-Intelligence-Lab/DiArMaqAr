import PitchClass from "@/models/PitchClass";
import { octaveEquivalentIndex } from "@/functions/octaveLayout";
import { SourceOud, SourceOudFret, SourceOudString } from "@/models/SourceOud";

/**
 * Lays a tuning system out as dasātīn (fret divisions) on virtual ʿūd awtār.
 *
 * A tuning system is a fixed set of absolute pitches, not a transposable scale,
 * so every watar shows a different window of that set: the pitches between its
 * own open note and the octave of that note — one dīwān. Because the pitches
 * are absolute rather than relative, the pattern of divisions genuinely differs
 * from watar to watar wherever the system is not symmetrical under the interval
 * the awtār are tuned in. That asymmetry is the thing this view exists to show,
 * and it is how al-Kindī and al-Fārābī described the ʿūd in the first place.
 *
 * The geometry is the physical one. A pitch sounding an interval r above an
 * open watar is stopped where the remaining string length is 1/r of the whole,
 * so its distance from the anf (nut) is 1 - 1/r of the string. An exact octave
 * therefore falls at half the string, and spacing compresses toward it.
 *
 * Each watar ends at the tuning system's own octave of its open note (see
 * octaveLayout). Where the source gives an octave that is not an exact doubling
 * (Ibn Sīnā's ʿūd), that octave is drawn where it really falls, a little short of
 * or past the half string.
 */

/** The half string: where an exact octave falls (anf = 0). */
export const FRETBOARD_MAX_POSITION = 0.5;

/**
 * Cents are doubles derived from log2, so exact equality is not safe. A
 * millionth of a cent is far below any interval in the archive and far above
 * floating-point noise.
 */
const CENTS_EPSILON = 1e-6;

/**
 * Where a pitch stops the string, as a fraction of the whole string length.
 *
 * Expressed in cents rather than as a ratio so that it is independent of the
 * unit a tuning system was entered in — fractions, cents, decimal ratios and
 * string lengths all give the same geometry. Never derive this from
 * `pitchClass.fraction`, which for non-fraction systems is a brute-forced
 * approximation with denominators no larger than 99.
 */
export function divisionPosition(openCents: number, pitchCents: number): number {
  return 1 - Math.pow(2, -(pitchCents - openCents) / 1200);
}

/** Why a tuning cannot be laid out. Never a reason to substitute something. */
export type FretboardUnavailability =
  | { kind: "fretDivisionValueType" }
  | { kind: "noteNotInSystem"; stringIndex: number; noteName: string }
  | { kind: "notAscending"; stringIndex: number; noteName: string }
  | { kind: "noOctaveAbove"; stringIndex: number; noteName: string }
  | { kind: "sourcePitchNotInSystem"; stringIndex: number; stringName: string; fretName: string; ratio: string };

export interface FretboardDivision {
  pitchClass: PitchClass;
  /** 0 … the watar's octave position, proportional along the whole string. */
  position: number;
  isOpen: boolean;
  isOctave: boolean;
  /**
   * Past the note this watar shares with the next one down. Those pitches are
   * reachable lower on that next watar, so this watar is not where a player
   * would take them — and not where they need naming.
   */
  beyondHandover: boolean;
  /** The source's fret this division is, when drawing the source's own ʿūd */
  fret?: SourceOudFret;
}

export interface FretboardString {
  openPitchClass: PitchClass;
  /** The tuning system's own octave of the open note, where this watar's window ends. */
  octavePitchClass: PitchClass;
  /** Tablature numbering: the lowest-pitched watar carries the highest number. */
  courseNumber: number;
  divisions: FretboardDivision[];
  /** Cents of the note shared with the watar below, or null if unknown. */
  handoverCents: number | null;
  /**
   * Frets tied across the neck that land on no pitch of this watar: none within
   * the cents tolerance of one of its pitches, and none within the tolerance of
   * another one drawn (see withFretsAcrossTheNeck).
   */
  phantomPositions: number[];
  /** The source's string, when drawing the source's own ʿūd */
  sourceString?: SourceOudString;
}

export type FretboardResult =
  | {
      ok: true;
      /** Index 0 is the LOWEST watar, which renders as the top row. */
      strings: FretboardString[];
      /** Every fret position on the neck, since a dastān is tied across it. */
      fretPositions: number[];
      /**
       * The drawn window: anf (0) to the furthest octave of any watar. Exactly
       * FRETBOARD_MAX_POSITION when every octave is an exact doubling.
       */
      maxPosition: number;
    }
  | { ok: false; reasons: FretboardUnavailability[] };

const centsOf = (pitchClass: PitchClass) => parseFloat(pitchClass.cents);

/**
 * Resolves each open-string note name against the tuning system, in ascending
 * order. Matching is by note name only: a name identifies a pitch, and the
 * lowest pitch carrying that name above the previous watar is the one meant.
 * Nothing is ever snapped to a nearest pitch class.
 */
export function resolveOpenStrings(
  allPitchClasses: PitchClass[],
  openStringNoteNames: string[]
): { ok: true; open: PitchClass[] } | { ok: false; reasons: FretboardUnavailability[] } {
  const open: PitchClass[] = [];
  const reasons: FretboardUnavailability[] = [];
  let previousCents = -Infinity;

  openStringNoteNames.forEach((noteName, stringIndex) => {
    const carrying = allPitchClasses.filter((pc) => pc.noteName === noteName);
    if (!carrying.length) {
      reasons.push({ kind: "noteNotInSystem", stringIndex, noteName });
      return;
    }

    const ascending = carrying
      .filter((pc) => centsOf(pc) > previousCents + CENTS_EPSILON)
      .sort((a, b) => centsOf(a) - centsOf(b));
    if (!ascending.length) {
      reasons.push({ kind: "notAscending", stringIndex, noteName });
      return;
    }

    const openPitchClass = ascending[0];
    if (octaveEquivalentIndex(allPitchClasses, openPitchClass, 1) === -1) {
      reasons.push({ kind: "noOctaveAbove", stringIndex, noteName });
      return;
    }

    previousCents = centsOf(openPitchClass);
    open.push(openPitchClass);
  });

  return reasons.length ? { ok: false, reasons } : { ok: true, open };
}

/**
 * @param allPitchClasses - the tuning system's pitch classes, as produced by
 *   getTuningSystemPitchClasses for the selected starting note
 * @param openStringNoteNames - the open note of each watar, LOWEST FIRST
 * @param centsTolerance - how close, in cents, a fret tied for another watar
 *   must come to a pitch of this one to count as that pitch (the app's cents
 *   tolerance, as used to match jins and maqām forms)
 */
export default function getFretboardDivisions(
  allPitchClasses: PitchClass[],
  openStringNoteNames: string[],
  centsTolerance: number
): FretboardResult {
  /**
   * Octave shifting is not implemented for fret-division input (see the TODO in
   * convertPitchClass), so such a system yields four identical octaves and the
   * geometry would silently collapse onto the nut. One accurate sentence beats
   * a drawing that is quietly wrong.
   */
  if (allPitchClasses.length && allPitchClasses[0].originalValueType === "fretDivision") {
    return { ok: false, reasons: [{ kind: "fretDivisionValueType" }] };
  }

  const resolved = resolveOpenStrings(allPitchClasses, openStringNoteNames);
  if (!resolved.ok) return resolved;

  const open = resolved.open;

  const strings: FretboardString[] = open.map((openPitchClass, stringIndex) => {
    const openCents = centsOf(openPitchClass);
    // resolveOpenStrings has already refused any open note without an octave
    const octavePitchClass = allPitchClasses[octaveEquivalentIndex(allPitchClasses, openPitchClass, 1)];
    const octaveCents = centsOf(octavePitchClass);
    const octavePosition = divisionPosition(openCents, octaveCents);

    /**
     * The note shared with the watar below. The bottom watar has none, so it
     * carries the span forward by repeating the interval above it — otherwise
     * it would be the one row with nothing marked as beyond.
     */
    let handoverCents: number | null = null;
    if (stringIndex + 1 < open.length) {
      handoverCents = centsOf(open[stringIndex + 1]);
    } else if (stringIndex > 0) {
      handoverCents = openCents + (openCents - centsOf(open[stringIndex - 1]));
    }

    const divisions = allPitchClasses
      .filter(
        (pc) =>
          centsOf(pc) >= openCents - CENTS_EPSILON &&
          centsOf(pc) <= octaveCents + CENTS_EPSILON
      )
      .sort((a, b) => centsOf(a) - centsOf(b))
      .map((pitchClass) => {
        // Clamped only against floating-point noise, never as a fallback.
        const raw = divisionPosition(openCents, centsOf(pitchClass));
        const position = Math.min(Math.max(raw, 0), octavePosition);
        return {
          pitchClass,
          position,
          isOpen: position === 0,
          isOctave: position === octavePosition,
          beyondHandover:
            handoverCents !== null && centsOf(pitchClass) > handoverCents + CENTS_EPSILON,
        };
      });

    return { openPitchClass, octavePitchClass, courseNumber: open.length - stringIndex, divisions, handoverCents, phantomPositions: [] };
  });

  return withFretsAcrossTheNeck(strings, centsTolerance);
}

/**
 * Cents above the open watar of a stop at this position. The cents between two
 * positions are therefore the same on every watar, which is what lets one
 * tolerance compare frets across the neck.
 */
export const centsAtPosition = (position: number) => -1200 * Math.log2(1 - position);

/**
 * A dastān is a gut fret tied right across the neck, so it crosses every watar —
 * including those on which it lands on no pitch of the tanghīm, or which do not
 * use it. Fills each string's phantom positions and the drawn window.
 *
 * A fret that comes within the cents tolerance of one of a watar's own pitches
 * counts as that pitch, so it is not drawn as a phantom: a gap the ear does not
 * hear as a different pitch is not shown as one. Frets from different awtār that
 * lie within the tolerance of each other are drawn once, at the lowest of them.
 */
function withFretsAcrossTheNeck(strings: FretboardString[], centsTolerance: number): FretboardResult {
  const fretPositions: number[] = [];
  strings
    .flatMap((s) => s.divisions.map((d) => d.position))
    .sort((a, b) => a - b)
    .forEach((p) => {
      const last = fretPositions[fretPositions.length - 1];
      if (last === undefined || p - last > 1e-9) fretPositions.push(p);
    });

  const near = (p: number, q: number) => Math.abs(centsAtPosition(p) - centsAtPosition(q)) <= centsTolerance + CENTS_EPSILON;
  strings.forEach((string) => {
    const owned = string.divisions.map((d) => d.position);
    const phantoms: number[] = [];
    fretPositions.forEach((p) => {
      if (owned.some((q) => near(p, q))) return;
      if (phantoms.length && near(p, phantoms[phantoms.length - 1])) return;
      phantoms.push(p);
    });
    string.phantomPositions = phantoms;
  });

  const maxPosition = Math.max(...strings.map((string) => string.divisions[string.divisions.length - 1]?.position ?? 0), 0);

  return { ok: true, strings, fretPositions, maxPosition };
}

/** A ratio such as "4/3" as a number; throws on anything else. */
export function ratioValue(ratio: string): number {
  const match = /^\s*([1-9]\d*)\s*\/\s*([1-9]\d*)\s*$/.exec(ratio);
  if (!match) throw new Error(`"${ratio}" is not a ratio such as 4/3`);
  return Number(match[1]) / Number(match[2]);
}

/**
 * The ʿūd a source describes (see SourceOud), laid out as it is: each string
 * from its open note to its last fret, carrying only its own frets, each one a
 * pitch of the tanghīm. Nothing is inferred: a stopped pitch the tanghīm does
 * not hold is a reason the layout is unavailable, never something snapped or
 * dropped.
 *
 * @param allPitchClasses - the tuning system's pitch classes, as produced by
 *   getTuningSystemPitchClasses
 * @param centsTolerance - as for getFretboardDivisions
 */
export function getSourceOudDivisions(allPitchClasses: PitchClass[], oud: SourceOud, centsTolerance: number): FretboardResult {
  const unison = allPitchClasses.find((pc) => pc.octave === 1 && pc.pitchClassIndex === 0);
  if (!unison) return { ok: false, reasons: [] };
  const base = centsOf(unison);
  const pitchAt = (ratio: number) => {
    const cents = base + 1200 * Math.log2(ratio);
    return allPitchClasses.find((pc) => Math.abs(centsOf(pc) - cents) < CENTS_EPSILON);
  };

  const reasons: FretboardUnavailability[] = [];
  const strings: FretboardString[] = [];
  oud.strings.forEach((sourceString, stringIndex) => {
    const open = ratioValue(sourceString.openRatio);
    const frets = sourceString.frets ? oud.frets.filter((f) => sourceString.frets!.includes(f.id)) : oud.frets;
    const stops: { ratio: number; ratioText: string; fret?: SourceOudFret }[] = [
      { ratio: 1, ratioText: "1/1" },
      ...frets.map((fret) => ({ ratio: ratioValue(fret.ratio), ratioText: fret.ratio, fret })),
    ];

    const divisions: FretboardDivision[] = [];
    for (const stop of stops) {
      const pitchClass = pitchAt(open * stop.ratio);
      if (!pitchClass) {
        reasons.push({
          kind: "sourcePitchNotInSystem",
          stringIndex,
          stringName: sourceString.nameEnglish,
          fretName: stop.fret?.nameEnglish ?? "open",
          ratio: stop.ratioText,
        });
        continue;
      }
      divisions.push({
        pitchClass,
        position: 1 - 1 / stop.ratio,
        isOpen: !stop.fret,
        isOctave: false,
        beyondHandover: false,
        fret: stop.fret,
      });
    }

    const openPitchClass = divisions.find((d) => d.isOpen)?.pitchClass;
    if (!openPitchClass) return;
    strings.push({
      openPitchClass,
      octavePitchClass: divisions[divisions.length - 1].pitchClass,
      courseNumber: oud.strings.length - stringIndex,
      divisions,
      handoverCents: null,
      phantomPositions: [],
      sourceString,
    });
  });

  return reasons.length ? { ok: false, reasons } : withFretsAcrossTheNeck(strings, centsTolerance);
}
