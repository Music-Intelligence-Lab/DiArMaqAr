/**
 * The pattern playback tempo range, in beats per minute. Shared by every entry
 * point that changes it (number input, stepper buttons, slider) so they cannot drift.
 */
export const TEMPO_MIN = 20;
export const TEMPO_MAX = 300;

/** Clamps a proposed tempo into the supported range. */
export default function clampTempo(value: number): number {
  return Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, value));
}
