import PitchClass from "@/models/PitchClass";
import NoteName, { shiftNoteName } from "@/models/NoteName";

/**
 * Where each octave sits in a generated pitch-class array, and how octave 1 and
 * octave 2 correspond.
 *
 * `getTuningSystemPitchClasses` lays out four octaves, lowest first. Usually each
 * octave is its neighbour halved or doubled, so neighbouring octaves match cell
 * for cell. A tuning system can also store an octave as the source gives it (see
 * `StoredOctaves`): that octave may have a different number of cells, and its
 * cells correspond to the neighbouring octave by name — jawāb X is the octave of
 * X — or not at all.
 */
export interface OctaveLayout {
  /** Array index of each octave's first cell */
  offsets: number[];
  /** Number of cells in each octave */
  counts: number[];
  /**
   * For each pair of neighbouring octaves (entry k is octave k and k + 1): true when
   * the upper is the lower doubled cell for cell, so they correspond by position;
   * false when they correspond by name.
   */
  byPosition: boolean[];
}

const OCTAVES = 4;
const CENTS_EPSILON = 1e-6;
const layouts = new WeakMap<PitchClass[], OctaveLayout>();

/** The octave layout of a generated pitch-class array (cached per array). */
export function getOctaveLayout(allPitchClasses: PitchClass[]): OctaveLayout {
  const cached = layouts.get(allPitchClasses);
  if (cached) return cached;

  const counts = Array.from({ length: OCTAVES }, (_, octave) => allPitchClasses.filter((pc) => pc.octave === octave).length);
  const offsets = counts.map((_, octave) => counts.slice(0, octave).reduce((a, b) => a + b, 0));

  // Neighbouring octaves correspond by position exactly when the upper is the
  // lower doubled: same number of cells and each one 1200 cents above its partner.
  const byPosition = Array.from({ length: OCTAVES - 1 }, (_, lower) =>
    counts[lower] === counts[lower + 1] &&
    allPitchClasses
      .slice(offsets[lower + 1], offsets[lower + 1] + counts[lower + 1])
      .every((pc, i) => Math.abs(parseFloat(pc.cents) - parseFloat(allPitchClasses[offsets[lower] + i].cents) - 1200) < CENTS_EPSILON)
  );

  const layout = { offsets, counts, byPosition };
  layouts.set(allPitchClasses, layout);
  return layout;
}

/** Array index of a cell, found by its octave and its index within that octave; -1 if absent. */
export function arrayIndexOf(allPitchClasses: PitchClass[], octave: number, pitchClassIndex: number): number {
  const { offsets, counts } = getOctaveLayout(allPitchClasses);
  if (octave < 0 || octave >= OCTAVES || pitchClassIndex < 0 || pitchClassIndex >= counts[octave]) return -1;
  const index = offsets[octave] + pitchClassIndex;
  const cell = allPitchClasses[index];
  return cell && cell.octave === octave && cell.pitchClassIndex === pitchClassIndex ? index : -1;
}

/** The cells of one octave, in order. */
export function octaveCells(allPitchClasses: PitchClass[], octave: number): PitchClass[] {
  const { offsets, counts } = getOctaveLayout(allPitchClasses);
  return allPitchClasses.slice(offsets[octave], offsets[octave] + counts[octave]);
}

/** One octave step (up when `direction` is 1, down when -1) from the cell at `index`; -1 when there is none. */
function stepOctave(allPitchClasses: PitchClass[], index: number, direction: 1 | -1): number {
  const { offsets, counts, byPosition } = getOctaveLayout(allPitchClasses);
  const cell = allPitchClasses[index];
  const from = cell.octave;
  const to = from + direction;
  if (to < 0 || to >= OCTAVES) return -1;

  if (byPosition[Math.min(from, to)]) {
    const position = cell.pitchClassIndex;
    return position < counts[to] ? offsets[to] + position : -1;
  }

  // An octave stored as the source gives it corresponds to its neighbour by name only
  if (!cell.noteName || cell.noteName === "none") return -1;
  const targetName = shiftNoteName(cell.noteName as NoteName, direction);
  if (!targetName || targetName === "none") return -1;
  const found = octaveCells(allPitchClasses, to).findIndex((pc) => pc.noteName === targetName);
  return found === -1 ? -1 : offsets[to] + found;
}

/**
 * Array index of the same note `octaveShift` octaves away from `pitchClass`, or -1
 * when the tuning system has no such note (outside the four octaves, or a stored
 * octave 2 with no partner for it).
 */
export function octaveEquivalentIndex(allPitchClasses: PitchClass[], pitchClass: PitchClass, octaveShift: number): number {
  let index = arrayIndexOf(allPitchClasses, pitchClass.octave, pitchClass.pitchClassIndex);
  const direction = octaveShift > 0 ? 1 : -1;
  for (let step = 0; step < Math.abs(octaveShift) && index !== -1; step++) {
    index = stepOctave(allPitchClasses, index, direction);
  }
  return index;
}

const familyKeyCache = new WeakMap<PitchClass[], string[]>();

/**
 * A key shared by every octave of the same note, for grouping cells as "the same
 * pitch class in different octaves". Two cells share a key exactly when one is an
 * octave equivalent of the other. The key names the lowest octave the note
 * reaches. Computed once per array.
 */
export function pitchClassFamilyKey(allPitchClasses: PitchClass[], pitchClass: PitchClass): string {
  let keys = familyKeyCache.get(allPitchClasses);
  if (!keys) {
    keys = allPitchClasses.map((_, start) => {
      let index = start;
      for (;;) {
        const below = stepOctave(allPitchClasses, index, -1);
        if (below === -1) break;
        index = below;
      }
      return `${allPitchClasses[index].octave}:${allPitchClasses[index].pitchClassIndex}`;
    });
    familyKeyCache.set(allPitchClasses, keys);
  }
  const index = arrayIndexOf(allPitchClasses, pitchClass.octave, pitchClass.pitchClassIndex);
  return index === -1 ? `${pitchClass.octave}:${pitchClass.pitchClassIndex}` : keys[index];
}

/**
 * Where a rising sequence starts repeating at the octave: the index just after
 * the last pitch whose octave above (the tuning system's own octave, see
 * octaveEquivalentIndex) still lies at or below the sequence's last pitch; 0 when
 * no pitch qualifies. Pitches from this index on are the ones a playback or
 * keyboard extension continues an octave up.
 */
export function octaveRepeatStartIndex(allPitchClasses: PitchClass[], sequence: PitchClass[]): number {
  if (!sequence.length) return 0;
  const lastFrequency = parseFloat(sequence[sequence.length - 1].frequency);
  let index = 0;
  sequence.forEach((pitchClass, i) => {
    const above = octaveEquivalentIndex(allPitchClasses, pitchClass, 1);
    if (above !== -1 && parseFloat(allPitchClasses[above].frequency) <= lastFrequency) index = i + 1;
  });
  return index;
}

/**
 * The mirror of octaveRepeatStartIndex: one more than the index of the first pitch
 * whose octave below still lies at or above the sequence's first pitch; 0 when no
 * pitch qualifies.
 */
export function octaveRepeatEndIndex(allPitchClasses: PitchClass[], sequence: PitchClass[]): number {
  if (!sequence.length) return 0;
  const firstFrequency = parseFloat(sequence[0].frequency);
  for (let i = 0; i < sequence.length; i++) {
    const below = octaveEquivalentIndex(allPitchClasses, sequence[i], -1);
    if (below !== -1 && parseFloat(allPitchClasses[below].frequency) >= firstFrequency) return i + 1;
  }
  return 0;
}

const exactOctaveCache = new WeakMap<PitchClass[], boolean[]>();

/**
 * Whether a cell is an exact octave of a pitch in the neighbouring octave toward
 * octave 1: in octaves 2 and 3, exactly double a pitch of the octave below; in
 * octave 0, exactly half a pitch of octave 1. Octave 1 is the reference and
 * always counts as exact. Decided by value, not by name, so an unnamed cell that
 * is an exact double still counts. False marks the pitches a source gives that
 * are not octave doublings (see StoredOctaves). Computed once per array.
 */
export function isExactOctave(allPitchClasses: PitchClass[], pitchClass: PitchClass): boolean {
  let flags = exactOctaveCache.get(allPitchClasses);
  if (!flags) {
    flags = allPitchClasses.map((pc) => {
      if (pc.octave === 1) return true;
      const neighbour = pc.octave === 0 ? 1 : pc.octave - 1;
      const target = parseFloat(pc.cents) + (pc.octave === 0 ? 1200 : -1200);
      return octaveCells(allPitchClasses, neighbour).some((other) => Math.abs(parseFloat(other.cents) - target) < CENTS_EPSILON);
    });
    exactOctaveCache.set(allPitchClasses, flags);
  }
  const index = arrayIndexOf(allPitchClasses, pitchClass.octave, pitchClass.pitchClassIndex);
  return index === -1 ? true : flags[index];
}
