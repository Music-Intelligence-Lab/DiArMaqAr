import TuningSystem, { STORABLE_OCTAVES } from "@/models/TuningSystem";
import NoteName, { allNotes, getNoteNameIndex } from "@/models/NoteName";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";

/** Rounding slack when comparing cents computed from different units. */
const CENTS_EPSILON = 1e-6;

/**
 * Checks a tuning system's stored octaves and throws, naming the problem, if any
 * part of them cannot be used as it stands. Nothing is padded, rounded or
 * substituted: a stored octave is either exactly what the source gives or it is
 * refused.
 *
 * Structure:
 * - each stored octave has values in octave 1's unit (the unit is detected from
 *   octave 1 alone: octave-2 cents run from 1200 to 2400, which the detector
 *   would read as fret divisions); fret-division systems cannot store octaves;
 * - every note-name set has a name list for each stored octave, keyed by the set's
 *   starting note, exactly as long as that octave's values, and no names belong to
 *   a set or an octave that does not exist.
 *
 * Result, for every note-name set (read through getTuningSystemPitchClasses, so
 * what is checked is exactly what the app will show):
 * - each octave's values lie inside that octave (octave n from 1200·(n−1) up to
 *   1200·n cents above octave 1's first value);
 * - pitches rise strictly through all four octaves;
 * - names are real note names or "none", and rise strictly, so none repeats.
 */
export default function validateStoredOctaves(tuningSystem: TuningSystem): void {
  const stored = tuningSystem.getStoredOctaves();
  if (!stored) return;

  const id = tuningSystem.getId();
  const fail = (message: string): never => {
    throw new Error(`Tuning system "${id}", stored octaves: ${message}`);
  };

  const octaveOne = tuningSystem.getOriginalPitchClassValues();
  if (!octaveOne.length) fail("octave 1 has no values");
  const type = detectPitchClassValueType(octaveOne);
  if (type === "unknown") fail("octave 1's value type cannot be detected");
  if (type === "fretDivision") fail("fret-division systems cannot store octaves (octave shifting is not implemented for fret divisions)");

  for (const key of Object.keys(stored.pitchClassValues)) {
    if (!(STORABLE_OCTAVES as readonly number[]).includes(Number(key))) fail(`octave "${key}" cannot be stored (only ${STORABLE_OCTAVES.join(", ")})`);
  }
  const storedOctaves = STORABLE_OCTAVES.filter((octave) => stored.pitchClassValues[octave]);
  if (!storedOctaves.length) fail("no octave is stored; remove the field instead");

  const fractionPattern = /^[1-9]\d*[/:][1-9]\d*$/;
  for (const octave of storedOctaves) {
    const values = stored.pitchClassValues[octave]!;
    if (!values.length) fail(`octave ${octave}'s value list is empty`);
    values.forEach((value, i) => {
      const ok = type === "fraction" ? fractionPattern.test(value.trim()) : value.trim() !== "" && !isNaN(Number(value));
      if (!ok) fail(`octave ${octave}, value ${i + 1} ("${value}") is not a ${type} value like octave 1's`);
    });
  }

  // The abjad list holds octave 1's names then octave 2's, whatever octave 2's count
  const octaveTwoCount = stored.pitchClassValues[2]?.length ?? octaveOne.length;
  const abjadCount = tuningSystem.getAbjadNames().length;
  if (abjadCount !== octaveOne.length + octaveTwoCount)
    fail(`the abjad list has ${abjadCount} names; octave 1 (${octaveOne.length}) and octave 2 (${octaveTwoCount}) need ${octaveOne.length + octaveTwoCount}`);

  const sets = tuningSystem.getNoteNameSets();
  const startingNotes = sets.map((set) => set[0]);
  for (const [key, byOctave] of Object.entries(stored.noteNames)) {
    if (!startingNotes.includes(key as NoteName)) fail(`names are given for "${key}", which starts none of the note-name sets (${startingNotes.join(", ")})`);
    for (const octave of Object.keys(byOctave)) {
      if (!storedOctaves.includes(Number(octave) as (typeof storedOctaves)[number])) fail(`the "${key}" set names octave ${octave}, which is not stored`);
    }
  }
  for (const set of sets) {
    for (const octave of storedOctaves) {
      const names = stored.noteNames[set[0]]?.[octave];
      const count = stored.pitchClassValues[octave]!.length;
      if (!names) fail(`the "${set[0]}" set has no octave-${octave} names`);
      if (names!.length !== count) fail(`the "${set[0]}" set has ${names!.length} octave-${octave} names for ${count} values`);
      names!.forEach((name, i) => {
        if (name !== "none" && !(allNotes as readonly string[]).includes(name)) fail(`the "${set[0]}" set, octave ${octave}, name ${i + 1} ("${name}") is not a note name`);
      });
    }
  }

  for (const set of sets) {
    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, set[0]);
    const base = parseFloat(pitchClasses.find((pc) => pc.octave === 1 && pc.pitchClassIndex === 0)!.cents);

    let previousCents = -Infinity;
    let previousName: { name: string; index: number } | null = null;
    for (const pc of pitchClasses) {
      const where = `the "${set[0]}" set, octave ${pc.octave}, position ${pc.pitchClassIndex + 1} ("${pc.originalValue}"${pc.noteName !== "none" ? `, ${pc.noteName}` : ""})`;
      const cents = parseFloat(pc.cents) - base;
      const low = 1200 * (pc.octave - 1);
      if (cents < low - CENTS_EPSILON || cents >= low + 1200 - CENTS_EPSILON)
        fail(`${where} is ${cents.toFixed(3)} cents above octave 1's first value, outside octave ${pc.octave} (${low} to ${low + 1200})`);
      if (cents <= previousCents + CENTS_EPSILON) fail(`${where} does not rise above the pitch before it`);
      previousCents = cents;

      if (pc.noteName === "none") continue;
      const index = getNoteNameIndex(pc.noteName as NoteName);
      if (previousName && index <= previousName.index) fail(`${where}: the name does not come after "${previousName.name}" in note-name order`);
      previousName = { name: pc.noteName, index };
    }
  }
}
