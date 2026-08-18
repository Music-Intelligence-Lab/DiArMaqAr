import PitchClass from "@/models/PitchClass";

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
 * so its distance from the anf (nut) is 1 - 1/r of the string. The octave
 * therefore falls at exactly half the string, and spacing compresses toward it.
 */

/** The drawn window is the half string: anf (0) to the octave (0.5). */
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
  | { kind: "noOctaveAbove"; stringIndex: number; noteName: string };

export interface FretboardDivision {
  pitchClass: PitchClass;
  /** 0 … FRETBOARD_MAX_POSITION, proportional along the whole string. */
  position: number;
  isOpen: boolean;
  isOctave: boolean;
  /**
   * Past the note this watar shares with the next one down. Those pitches are
   * reachable lower on that next watar, so this watar is not where a player
   * would take them — and not where they need naming.
   */
  beyondHandover: boolean;
}

export interface FretboardString {
  openPitchClass: PitchClass;
  /** Tablature numbering: the lowest-pitched watar carries the highest number. */
  courseNumber: number;
  divisions: FretboardDivision[];
  /** Cents of the note shared with the watar below, or null if unknown. */
  handoverCents: number | null;
  /** Frets tied across the neck that land on no pitch of this watar. */
  phantomPositions: number[];
}

export type FretboardResult =
  | {
      ok: true;
      /** Index 0 is the LOWEST watar, which renders as the top row. */
      strings: FretboardString[];
      /** Every fret position on the neck, since a dastān is tied across it. */
      fretPositions: number[];
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
    const hasOctave = allPitchClasses.some(
      (pc) => Math.abs(centsOf(pc) - (centsOf(openPitchClass) + 1200)) < CENTS_EPSILON
    );
    if (!hasOctave) {
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
 */
export default function getFretboardDivisions(
  allPitchClasses: PitchClass[],
  openStringNoteNames: string[]
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
          centsOf(pc) <= openCents + 1200 + CENTS_EPSILON
      )
      .sort((a, b) => centsOf(a) - centsOf(b))
      .map((pitchClass) => {
        // Clamped only against floating-point noise, never as a fallback.
        const raw = divisionPosition(openCents, centsOf(pitchClass));
        const position = Math.min(Math.max(raw, 0), FRETBOARD_MAX_POSITION);
        return {
          pitchClass,
          position,
          isOpen: position === 0,
          isOctave: position === FRETBOARD_MAX_POSITION,
          beyondHandover:
            handoverCents !== null && centsOf(pitchClass) > handoverCents + CENTS_EPSILON,
        };
      });

    return { openPitchClass, courseNumber: open.length - stringIndex, divisions, handoverCents, phantomPositions: [] };
  });

  // A dastān is a gut fret tied right across the neck, so it crosses every
  // watar — including those on which it lands on no pitch of the tanghīm.
  const fretPositions: number[] = [];
  strings
    .flatMap((s) => s.divisions.map((d) => d.position))
    .sort((a, b) => a - b)
    .forEach((p) => {
      const last = fretPositions[fretPositions.length - 1];
      if (last === undefined || p - last > 1e-9) fretPositions.push(p);
    });

  strings.forEach((string) => {
    const owned = string.divisions.map((d) => d.position);
    string.phantomPositions = fretPositions.filter(
      (p) => !owned.some((q) => Math.abs(q - p) < 1e-9)
    );
  });

  return { ok: true, strings, fretPositions };
}
