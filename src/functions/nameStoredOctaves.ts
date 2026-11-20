import NoteName, { shiftNoteName } from "@/models/NoteName";
import { StorableOctave } from "@/models/TuningSystem";

/** Rounding slack when comparing cents computed from different units. */
const CENTS_EPSILON = 1e-6;

type ByOctave<T> = Partial<Record<StorableOctave, T>>;

/**
 * Names the stored octaves of one note-name set after their values change.
 *
 * Each value keeps the name the admin gave it, when that exact value was
 * already in the octave. A new value that is exactly an octave above or below
 * a named note in the neighbouring octave takes that note's name an octave
 * away: for example, when 9/8 in octave 1 is named kawasht, 9/4 in octave 2
 * is named māhūr, because māhūr is kawasht an octave up. Every other value is
 * "none", left visibly unnamed for the admin to name.
 *
 * Neighbours: octave 2 and octave 0 are named from octave 1, octave 3 from
 * octave 2 (the stored one, or octave 1 doubled when octave 2 is not stored).
 *
 * @param octaveOneValues - octave 1's values, in the tuning system's unit
 * @param octaveOneNames - this set's octave 1 names, one per value
 * @param values - the new values of every stored octave
 * @param previous - the values and this set's names before the change, if any
 * @param toCents - reads a value in the tuning system's unit as cents
 */
export default function nameStoredOctaves(
  octaveOneValues: string[],
  octaveOneNames: NoteName[],
  values: ByOctave<string[]>,
  previous: { values: ByOctave<string[]>; names: ByOctave<NoteName[]> } | null,
  toCents: (value: string) => number
): ByOctave<NoteName[]> {
  const octaveOne = { cents: octaveOneValues.map(toCents), names: octaveOneNames };
  const named: ByOctave<NoteName[]> = {};

  const nameOctave = (octave: StorableOctave, neighbour: { cents: number[]; names: NoteName[] }, shift: 1 | -1): NoteName[] =>
    values[octave]!.map((value) => {
      const before = previous?.values[octave]?.indexOf(value) ?? -1;
      const kept = before >= 0 ? previous?.names[octave]?.[before] : undefined;
      if (kept) return kept;
      const cents = toCents(value) - 1200 * shift;
      const j = neighbour.cents.findIndex((c) => Math.abs(c - cents) < CENTS_EPSILON);
      const name = j >= 0 ? neighbour.names[j] : undefined;
      if (!name || name === "none") return "none";
      return shiftNoteName(name, shift) || "none";
    });

  if (values[2]) named[2] = nameOctave(2, octaveOne, 1);
  if (values[0]) named[0] = nameOctave(0, octaveOne, -1);
  if (values[3]) {
    const octaveTwo = values[2]
      ? { cents: values[2].map(toCents), names: named[2]! }
      : { cents: octaveOne.cents.map((c) => c + 1200), names: octaveOne.names.map((n) => (n === "none" ? n : shiftNoteName(n, 1) || "none")) };
    named[3] = nameOctave(3, octaveTwo, 1);
  }
  return named;
}
