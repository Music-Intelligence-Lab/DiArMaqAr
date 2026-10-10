import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import type PitchClass from "@/models/PitchClass";

/**
 * Maqām-context note spellings for API pitch data.
 *
 * Every maqām and jins route that returns `englishName`, `solfege`,
 * `ipnReferenceNoteName`, `centsDeviation` or `midiNotePlusCentsDeviation`
 * spells its pitch classes through these two functions, so one maqām or jins
 * reads the same on every endpoint.
 *
 * Each degree gets its own consecutive letter and a 12-EDO key to match. In
 * al-Ṣabbāgh (1954) from rāst, maqām bayyāt on nawā reads G3 A-b3 Bb--3 C4 D4
 * Eb4 F4: nīm ʿajam is spelled Bb--3 against the key Bb (−9.8¢), not A-#3
 * against A (+90.2¢) as the tuning-system table spells it.
 *
 * Ascending and descending are spelled each on their own: an ascending degree
 * and a descending degree may share a 12-EDO key. Only 12-pitch-class sets
 * combine the two directions, and they do so in their own builder.
 */

/** Spell a maqām's ascending and descending sequences, each on its own. */
export function spellMaqamDirections(
  ascendingPitchClasses: PitchClass[],
  descendingPitchClasses: PitchClass[]
): { ascending: PitchClass[]; descending: PitchClass[] } {
  return {
    ascending: renderPitchClassSpellings(ascendingPitchClasses, true),
    descending: renderPitchClassSpellings(descendingPitchClasses, false),
  };
}

/** Spell a jins: a single ascending sequence. */
export function spellJinsPitchClasses(jinsPitchClasses: PitchClass[]): PitchClass[] {
  return renderPitchClassSpellings(jinsPitchClasses, true);
}
