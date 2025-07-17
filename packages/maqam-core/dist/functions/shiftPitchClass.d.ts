import PitchClass from "../models/PitchClass";
export default function shiftPitchClass(allPitchClasses: PitchClass[], pitchClass: PitchClass | undefined, octaveShift: number): PitchClass;
/**
 * Shifts a given PitchClass by a specified number of octaves by adjusting existing pitchClass fields.
 *
 * @param pitchClass - The original PitchClass object to shift.
 * @param octaves - Number of octaves to shift (positive shifts upward, negative shifts downward).
 * @returns A new PitchClass with updated tuning data.
 */
export declare function shiftPitchClassWithoutAllPitchClasses(pitchClass: PitchClass, octaves: number): PitchClass;
//# sourceMappingURL=shiftPitchClass.d.ts.map