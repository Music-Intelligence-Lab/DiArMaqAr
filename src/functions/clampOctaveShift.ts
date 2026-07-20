/**
 * The sounding-octave shift range, in octaves. Shared by every entry point
 * that changes it (settings buttons, keyboard shortcuts) so they cannot drift.
 */
export const OCTAVE_SHIFT_MIN = -3;
export const OCTAVE_SHIFT_MAX = 3;

/** Clamps a proposed octave shift into the supported range. */
export default function clampOctaveShift(value: number): number {
  return Math.min(OCTAVE_SHIFT_MAX, Math.max(OCTAVE_SHIFT_MIN, value));
}
