import PitchClass from "@/models/PitchClass";
import { getEnglishNoteName, getSequentialEnglishNames, getSolfegeFromEnglishName, getSpellingPosition } from "@/functions/noteNameMappings";
import NoteName, { getNoteNameIndexAndOctave, getParentNoteName } from "@/models/NoteName";
import { calculateCentsDeviationWithReferenceNote } from "@/functions/calculateCentsDeviation";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";

/**
 * Renders pitch classes with sequential International Pitch Notation spellings
 * for melodic sequences and resolves maqām-context 12-TET chromatic-slot collisions.
 *
 * ## Two concerns, one function
 *
 * 1. **Sequential letter spelling** (Western notation convention): scales use
 *    consecutive letters (D-E-F-G-A-B-C-D). `getSequentialEnglishNames` picks
 *    enharmonic equivalents to avoid repeated letters. This drives `englishName`
 *    and (downstream) `solfege`.
 *
 * 2. **Maqām-context reference-note mapping** (this function's canonical pass):
 *    when two pitches of a maqām project onto the same 12-EDO chromatic slot
 *    (e.g. segāh `E-b3` and nīm būselīk `E-3` both default to natural E), the
 *    keyboard/MIDI projection cannot fit both. The rule, read from the spelling
 *    and never from measured cents: **the note whose spelling is closer to the
 *    shared key keeps it; the other moves one key toward the side it lies on**
 *    (below → flat, above → sharp). A plain letter is closest, then comma
 *    symbols, then quarter-tone symbols. segāh E-b vs nīm būselīk E- → segāh
 *    moves to E♭; chahārgāh F vs nīm ḥijāz F-# → nīm ḥijāz moves to F♯.
 *
 * ## englishName vs referenceNoteName
 *
 * - `englishName` is the **authentic maqām-pitch identifier** (e.g. `E-b3`).
 *   Never rewritten by the collision rule — it is a contract with the user and
 *   the musicological record. `solfege` is derived from `englishName` and so
 *   also stays untouched by the collision rule.
 * - `referenceNoteName` is the **12-TET chromatic slot** the pitch projects to
 *   (e.g. `E`, `Eb`). Adjusted by the collision rule. `centsDeviation` and
 *   `midiNoteDeviation` follow from `referenceNoteName` and are recomputed.
 * - `midiNoteDecimal` is the actual pitch value and never changes.
 *
 * ## Collision detection
 *
 * Compare references by **12-EDO chromatic slot**, not by first letter. `E` vs
 * `E` is a collision; `Bb` vs `B` is NOT (slots 10 vs 11). `referenceToChroma`
 * computes the slot and the second pass triggers only on real same-slot matches.
 *
 * ## Cross-direction visibility
 *
 * Ascending and descending sequences are independent everywhere except in
 * 12-pitch-class sets: an ascending degree and a descending degree may share a
 * 12-EDO key in the maqām tables, staff notation and maqām API. Those callers
 * pass one direction only. **Only the 12-pitch-class set builder (and exports
 * built on it) passes the combined ascending + descending pitch classes** via
 * `allPitchClasses`, because a set must hold every pitch of the maqām on its
 * own key.
 *
 * ## Context
 *
 * - Use this for jins and maqām melodic sequences.
 * - NOT for general tuning-system pitch classes (which may have letter
 *   collisions by design).
 * - See `.ai-agent-instructions/essentials/04-musicology-essentials.md` §5.1
 *   for the full rule and rationale.
 *
 * @param pitchClasses - Pitch classes from the sequence being rendered
 * @param ascending - Direction (true = ascending, false = descending). Defaults true.
 * @param allPitchClasses - Combined pitch classes from both sequences of the
 *   maqām, for 12-pitch-class sets only. Omit it everywhere else so each
 *   direction is keyed on its own.
 * @returns New array of pitch classes with sequential `englishName`, adjusted
 *   `referenceNoteName` / `centsDeviation` / `midiNoteDeviation`, and `solfege`
 *   derived from the sequential englishName.
 *
 * @example
 * ```typescript
 * // 12-pitch-class set context — maqām bayyātī ʿushayrān in al-Fārābī 950g / ʿushayrān:
 * //   ascending uses segāh (E-b3, ≈ 643¢) at degree V
 * //   descending uses nīm būselīk (E-3, ≈ 666¢) at degree V
 * // Both default to natural E → collision.
 * const allPcs = [...maqam.ascendingPitchClasses, ...maqam.descendingPitchClasses];
 * const asc = renderPitchClassSpellings(maqam.ascendingPitchClasses, true, allPcs);
 * const desc = renderPitchClassSpellings(maqam.descendingPitchClasses, false, allPcs);
 * // segāh: englishName stays "E-b3"; referenceNoteName → "Eb"; midiDev "51 +42.9"
 * // nīm būselīk: englishName stays "E-3"; referenceNoteName → "E"; midiDev "52 -33.7"
 * ```
 */
export function renderPitchClassSpellings(
  pitchClasses: PitchClass[],
  ascending: boolean = true,
  pitchClassSetSequences?: { ascending: PitchClass[]; descending: PitchClass[] }
): PitchClass[] {
  if (pitchClasses.length === 0) {
    return [];
  }

  // Calculate sequential English names for the entire sequence
  const noteNames = pitchClasses.map(pc => pc.noteName);
  const sequentialNames = getSequentialEnglishNames(noteNames, ascending);

  // The spelling each note's key is read from. In a 12-pitch-class set both
  // directions share one key per pitch, so every note takes one spelling for
  // both calls: its ascending spelling, else its descending one.
  const contextEnglishNameByNoteName = new Map<string, string>();
  const addSpellings = (sequence: PitchClass[], names: string[]) => {
    sequence.forEach((pc, i) => {
      if (names[i] && names[i] !== "--") contextEnglishNameByNoteName.set(pc.noteName, names[i]);
    });
  };
  if (pitchClassSetSequences) {
    const { ascending: up, descending: down } = pitchClassSetSequences;
    addSpellings(down, getSequentialEnglishNames(down.map((pc) => pc.noteName), false));
    addSpellings(up, getSequentialEnglishNames(up.map((pc) => pc.noteName), true));
  } else {
    addSpellings(pitchClasses, sequentialNames);
  }

  // Get starting pitch class for reference calculations
  const startingPitchClass = pitchClasses[0];
  const startingMidiNumber = startingPitchClass.midiNoteDecimal;
  const startingNoteName = startingPitchClass.englishName;

  // The notes whose keys must be told apart: both directions for a
  // 12-pitch-class set, otherwise only this sequence.
  const pitchClassesForCanonical = pitchClassSetSequences
    ? [...pitchClassSetSequences.ascending, ...pitchClassSetSequences.descending]
    : pitchClasses;

  const uniquePitchClassesMap = new Map<string, PitchClass>();
  pitchClassesForCanonical.forEach(pc => {
    if (!uniquePitchClassesMap.has(pc.noteName)) {
      uniquePitchClassesMap.set(pc.noteName, pc);
    }
  });

  // Build canonical ordering: sort unique pitch classes by MIDI note (ascending)
  // This creates a deterministic ordering that doesn't depend on sequence direction
  const canonicalOrder = Array.from(uniquePitchClassesMap.values()).sort(
    (a, b) => a.midiNoteDecimal - b.midiNoteDecimal
  );

  // First pass: Calculate base reference notes for all canonical pitch classes
  // This ensures the same pitch class gets the same base reference note regardless of direction
  const canonicalBaseReferenceNotes = canonicalOrder.map((pc) => {
    // Use the maqām-context sequential spelling when available (matches UI and avoids
    // deriving reference note names from tuning-system spellings that may differ).
    const maqamContextEnglishName = contextEnglishNameByNoteName.get(pc.noteName) ?? pc.englishName;
    const deviationResult = calculateCentsDeviationWithReferenceNote(
      pc.midiNoteDecimal,
      pc.cents,
      startingMidiNumber,
      maqamContextEnglishName,
      startingNoteName
    );
    return {
      pitchClass: pc,
      maqamContextEnglishName,
      baseReferenceNote: deviationResult.referenceNoteName,
      baseCentsDeviation: deviationResult.deviation
    };
  });

  // Second pass: give every pitch its own 12-EDO key when two notes of the maqām
  // would otherwise share one (the keyboard/MIDI projection cannot hold both).
  //
  // Each note has a first-choice key and may move one key to its own side:
  // - a nīm or tīk note (PAO naming: nīm X is X lowered, tīk X is X raised)
  //   first takes the key of the note it varies (12-pitch-class sets) and moves
  //   down if nīm, up if tīk: tīk kawasht → kawasht's B, nīm ʿajam → ʿajam's Bb;
  // - any other note first takes the key its spelling names and moves to the
  //   side its spelling lies on, judged from the spelling, never from measured
  //   cents (segāh E-b lies below E, so it moves to Eb);
  // - a note spelled exactly on its key moves one key either way, but only as a
  //   last resort, when no answer leaves it in place (al-Dīk 1926b: qarār ḥijāz
  //   E## moves to F so qarār tīk ḥijāz/ṣabā and yegāh can take F# and G).
  //
  // The keys are chosen for the whole maqām at once: every pitch gets its own
  // key, keys keep the order of the pitches, and the fewest notes move. Among
  // equally few moves, the notes whose spellings are closest to their
  // first-choice keys keep them (a plain letter, then comma symbols, then
  // quarter-tone symbols). Examples:
  //   segāh E-b + nīm būselīk E-   → Eb, E
  //   chahārgāh F + nīm ḥijāz F-#  → F, F#
  //   nīm shahnāz + tīk zīrgūleh + muḥayyar (Anglo-European 1800) → C, C#, D
  //   nīm ʿajam + nīm māhūr + māhūr (Ronzevalle 1904)            → A, Bb, B
  // If no such choice exists (more pitches than keys), the first-choice keys
  // stay and the 12-pitch-class set reports the maqām as incompatible.
  //
  // Keys: in a 12-pitch-class set a key is one of the 12 pitch classes (octave
  // ignored, and a note and its octave are one pitch); otherwise it is a key in
  // a specific octave.
  //
  // Only the MAPPING changes (referenceNoteName, centsDeviation, midiNoteDeviation).
  // englishName stays untouched (it is the authentic maqām-pitch identifier), and
  // solfege stays derived from englishName downstream.
  const canonicalReferenceNoteMap = new Map<string, { referenceNoteName: string; centsDeviation: number }>();

  const recalcDeviation = (pc: PitchClass, referenceNoteName: string): number => {
    const tempPc = { ...pc, referenceNoteName } as PitchClass;
    const newRefMidi = calculateIpnReferenceMidiNote(tempPc);
    const referenceFrequency = 440 * Math.pow(2, (newRefMidi - 69) / 12);
    const currentFrequency = 440 * Math.pow(2, (pc.midiNoteDecimal - 69) / 12);
    return 1200 * Math.log2(currentFrequency / referenceFrequency);
  };

  // Map a bare reference letter+accidental (no octave) to a 12-EDO chromatic slot
  // (0-11). Two references collide when they resolve to the same slot; different
  // accidentals of the same letter (e.g. Bb vs B) are distinct slots and do NOT
  // collide.
  const referenceToChroma = (ref: string): number | null => {
    const m = ref.match(/^([A-G])(##|bb|#|b)?$/);
    if (!m) return null;
    const base: { [k: string]: number } = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const accidentalSemitones: { [k: string]: number } = { "##": 2, "#": 1, b: -1, bb: -2 };
    const c = base[m[1].toUpperCase()] + (accidentalSemitones[m[2] ?? ""] ?? 0);
    return ((c % 12) + 12) % 12;
  };

  // Where a spelling sits relative to a key, as written: [quarter tones, commas],
  // quarter tones wrapped to the nearer side of the key.
  const displacementFromKey = (englishName: string, keyChroma: number): [number, number] | null => {
    const position = getSpellingPosition(englishName);
    if (!position) return null;
    return [((position[0] - keyChroma * 2 + 36) % 24) - 12, position[1]];
  };
  // Quarter tones always outweigh commas (at most two commas per spelling)
  const distance = (d: [number, number]) => Math.abs(d[0]) * 100 + Math.abs(d[1]);
  const sideOf = (d: [number, number]) => Math.sign(d[0] !== 0 ? d[0] : d[1]);

  // One key down or up: a natural keeps its letter (E → Eb, F → F#); an
  // accidental key steps to the neighbouring key (Ab ↓ G, C# ↑ D).
  const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const flatNames = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  const moveKey = (reference: string, side: number): string => {
    if (/^[A-G]$/.test(reference)) return reference + (side < 0 ? "b" : "#");
    const chroma = (referenceToChroma(reference)! + side + 12) % 12;
    return (side < 0 ? flatNames : sharpNames)[chroma];
  };

  // PAO naming: nīm X is X lowered and tīk X is X raised. In a 12-pitch-class
  // set a nīm or tīk note's first choice of key is the key of the note it
  // varies, written on its own letter (tīk kawasht C-b → Cb, kawasht's B key).
  const letterChroma: { [letter: string]: number } = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const parentKeyOnLetter = (pc: PitchClass, englishName: string): string | null => {
    const parent = getParentNoteName(pc.noteName as NoteName);
    if (!parent) return null;
    const parentReference = calculateCentsDeviationWithReferenceNote(0, "0", 0, getEnglishNoteName(parent)).referenceNoteName;
    const parentChroma = referenceToChroma(parentReference);
    if (parentChroma === null) return null;
    const letter = englishName[0].toUpperCase();
    let semitones = (((parentChroma - letterChroma[letter]) % 12) + 12) % 12;
    if (semitones > 6) semitones -= 12;
    const accidental: { [semitones: number]: string } = { [-2]: "bb", [-1]: "b", 0: "", 1: "#", 2: "##" };
    return accidental[semitones] === undefined ? parentReference : letter + accidental[semitones];
  };

  // One unit per pitch: in a 12-pitch-class set a note and its octave (nawā G3,
  // saham/ramal tūtī G4) are the same pitch and share one key.
  type Unit = {
    members: PitchClass[];
    englishName: string;
    firstReference: string;
    side: number;
    spellingDistance: number;
    key: number;
    pitch: number;
    chosenReference: string;
  };
  const pitchClassOf = (pc: PitchClass) => Math.round(((((parseFloat(pc.cents) % 1200) + 1200) % 1200)) * 1e6) / 1e6;
  // Position across octaves, so a nīm note sits below and a tīk note above its parent
  const positionOf = (noteName: NoteName) => {
    const { octave, index } = getNoteNameIndexAndOctave(noteName);
    return octave * 37 + index;
  };
  const units: Unit[] = [];
  const unitByPitch = new Map<number, Unit>();
  canonicalBaseReferenceNotes.forEach(({ pitchClass, maqamContextEnglishName, baseReferenceNote, baseCentsDeviation }) => {
    canonicalReferenceNoteMap.set(pitchClass.noteName, { referenceNoteName: baseReferenceNote, centsDeviation: baseCentsDeviation });
    const pitch = pitchClassOf(pitchClass);
    const shared = pitchClassSetSequences ? unitByPitch.get(pitch) : undefined;
    if (shared) {
      shared.members.push(pitchClass);
      return;
    }
    const parentKey = pitchClassSetSequences ? parentKeyOnLetter(pitchClass, maqamContextEnglishName) : null;
    const firstReference = parentKey ?? baseReferenceNote;
    const firstChroma = referenceToChroma(firstReference);
    const d = firstChroma === null ? null : displacementFromKey(maqamContextEnglishName, firstChroma);
    // The side is judged from where the note starts: on its parent's key the name
    // decides (nīm below, tīk above); on its own spelled key the spelling does.
    const parent = parentKey ? getParentNoteName(pitchClass.noteName as NoteName) : null;
    const side = parent
      ? Math.sign(positionOf(pitchClass.noteName as NoteName) - positionOf(parent))
      : d ? sideOf(d) : 0;
    const key = calculateIpnReferenceMidiNote({ ...pitchClass, englishName: maqamContextEnglishName, referenceNoteName: firstReference });
    const unit: Unit = {
      members: [pitchClass],
      englishName: maqamContextEnglishName,
      firstReference,
      side,
      spellingDistance: d ? distance(d) : 0,
      key,
      pitch: pitchClass.midiNoteDecimal,
      chosenReference: firstReference,
    };
    units.push(unit);
    unitByPitch.set(pitch, unit);
  });

  // In a 12-pitch-class set the keys wrap at the octave: bring every unit into
  // one octave above the lowest first-choice key, pitch and key together.
  if (pitchClassSetSequences && units.length > 0) {
    const origin = Math.min(...units.map((unit) => unit.key));
    for (const unit of units) {
      const shift = 12 * Math.floor((unit.key - origin) / 12);
      unit.key -= shift;
      unit.pitch -= shift;
    }
  }

  const slotOf = (key: number) => (pitchClassSetSequences ? ((key % 12) + 12) % 12 : key);
  const hasClash = new Set(units.map((unit) => slotOf(unit.key))).size < units.length;

  if (hasClash) {
    const ordered = [...units].sort((a, b) => a.pitch - b.pitch);
    // Each note may stay on its first-choice key or move one key to its own side.
    // A note spelled exactly on its key has no side: it may move one key either
    // way, but only as a last resort, when no answer leaves it in place.
    const options = ordered.map((unit) =>
      unit.side === 0
        ? [{ step: 0, lastResort: false }, { step: -1, lastResort: true }, { step: 1, lastResort: true }]
        : [{ step: 0, lastResort: false }, { step: unit.side, lastResort: false }]
    );
    type Best = { lastResortMoves: number; moves: number; movedDistance: number; steps: number[] };
    let best: Best | null = null;
    const keys: number[] = [];
    const steps: number[] = [];
    const worse = (lastResortMoves: number, moves: number, b: Best) =>
      lastResortMoves > b.lastResortMoves || (lastResortMoves === b.lastResortMoves && moves > b.moves);
    const search = (i: number, lastResortMoves: number, moves: number, movedDistance: number) => {
      if (best && worse(lastResortMoves, moves, best)) return;
      if (i === ordered.length) {
        const better =
          !best ||
          lastResortMoves < best.lastResortMoves ||
          (lastResortMoves === best.lastResortMoves && (moves < best.moves || movedDistance > best.movedDistance));
        if (better) best = { lastResortMoves, moves, movedDistance, steps: [...steps] };
        return;
      }
      for (const option of options[i]) {
        const key = ordered[i].key + option.step;
        // Keys rise with pitch; a set's keys fit in one octave (12 distinct keys)
        if (i > 0 && key <= keys[i - 1]) continue;
        if (pitchClassSetSequences && i > 0 && key - keys[0] > 11) continue;
        keys[i] = key;
        steps[i] = option.step;
        const moved = option.step !== 0;
        search(
          i + 1,
          lastResortMoves + (option.lastResort ? 1 : 0),
          moves + (moved ? 1 : 0),
          movedDistance + (moved ? ordered[i].spellingDistance : 0)
        );
      }
    };
    search(0, 0, 0, 0);
    const solution = best as Best | null;
    if (solution) {
      ordered.forEach((unit, i) => {
        if (solution.steps[i] !== 0) unit.chosenReference = moveKey(unit.firstReference, solution.steps[i]);
      });
    }
  }

  for (const unit of units) {
    for (const pc of unit.members) {
      const base = canonicalReferenceNoteMap.get(pc.noteName)!;
      if (base.referenceNoteName === unit.chosenReference) continue;
      canonicalReferenceNoteMap.set(pc.noteName, {
        referenceNoteName: unit.chosenReference,
        // Each member keeps its own octave: measure it with its own spelling, not
        // the unit's (jawāb sunbuleh Eb4 against Eb4's key, not sunbuleh's Eb3).
        centsDeviation: recalcDeviation(
          { ...pc, englishName: contextEnglishNameByNoteName.get(pc.noteName) ?? pc.englishName } as PitchClass,
          unit.chosenReference
        ),
      });
    }
  }

  // Third pass: Apply canonical reference notes to the current sequence
  const processedReferenceNotes = pitchClasses.map((pc) => {
    const canonicalRef = canonicalReferenceNoteMap.get(pc.noteName);
    if (canonicalRef) {
      return { pitchClass: pc, referenceNoteName: canonicalRef.referenceNoteName, centsDeviation: canonicalRef.centsDeviation };
    }
    // Fallback: calculate independently if not in canonical map (shouldn't happen)
    const deviationResult = calculateCentsDeviationWithReferenceNote(
      pc.midiNoteDecimal,
      pc.cents,
      startingMidiNumber,
      pc.englishName,
      startingNoteName
    );
    return { pitchClass: pc, referenceNoteName: deviationResult.referenceNoteName, centsDeviation: deviationResult.deviation };
  });

  // Third pass: Combine sequential English names with processed reference notes
  return pitchClasses.map((pc, i) => {
    const processed = processedReferenceNotes[i];
    const tempPcWithRef = { ...pc, referenceNoteName: processed.referenceNoteName };
    const referenceMidiNote = calculateIpnReferenceMidiNote(tempPcWithRef);
    const sign = processed.centsDeviation > 0 ? "+" : "";
    const midiNoteDeviation = `${referenceMidiNote} ${sign}${processed.centsDeviation.toFixed(1)}`;

    return {
    ...pc,
      englishName: sequentialNames[i],
      solfege: getSolfegeFromEnglishName(sequentialNames[i]),
      referenceNoteName: processed.referenceNoteName,
      centsDeviation: processed.centsDeviation,
      midiNoteDeviation
    };
  });
}
