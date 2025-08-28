import PitchClass, { calculateInterval } from "@/models/PitchClass";

/**
 * Calculates intervals between consecutive pitch classes.
 * 
 * Fundamental utility for extracting intervallic patterns from pitch sequences,
 * forming the basis for all transposition analysis.
 * 
 * @param pitchClasses - Array of pitch classes to calculate intervals for
 * @returns Array of intervals between consecutive pitch classes
 */
export function getPitchClassIntervals(pitchClasses: PitchClass[]) {
  return pitchClasses.slice(1).map((pitchClass, index) => calculateInterval(pitchClasses[index], pitchClass));
}
