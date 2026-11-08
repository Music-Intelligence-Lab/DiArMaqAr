import TuningSystem from "@/models/TuningSystem";
import NoteName from "@/models/NoteName";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";

/**
 * The note names a tuning system offers from one of its starting notes: every
 * pitch class getTuningSystemPitchClasses builds, in every octave it builds.
 *
 * This is the one answer to "can this maqām or jins be played here?". The
 * transpositions, modulations and the app's maqām list all work in this pitch
 * space, so a listing that checked a narrower range would hide a maqām the rest
 * of the archive can compute — maqām farahnāk (al-Ḥilū) reaches jawāb ḥusaynī,
 * which lies above the three octaves the listings used to check.
 */
export function getPitchSpaceNoteNames(tuningSystem: TuningSystem, startingNote: NoteName): NoteName[] {
  return getTuningSystemPitchClasses(tuningSystem, startingNote).map((pitchClass) => pitchClass.noteName as NoteName);
}

/**
 * Every starting note of a tuning system with its pitch-space note names, in
 * the order of the tuning system's note-name sets.
 */
export function getStartingNotePitchSpaces(tuningSystem: TuningSystem): { startingNote: NoteName; noteNames: NoteName[] }[] {
  return tuningSystem
    .getNoteNameSets()
    .filter((set) => Boolean(set[0]))
    .map((set) => ({ startingNote: set[0], noteNames: getPitchSpaceNoteNames(tuningSystem, set[0]) }));
}
