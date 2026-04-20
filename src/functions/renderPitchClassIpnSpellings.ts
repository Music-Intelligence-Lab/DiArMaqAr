import PitchClass from "@/models/PitchClass";
import { getSequentialEnglishNames, getSolfegeFromEnglishName } from "@/functions/noteNameMappings";
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
 *    keyboard/MIDI projection cannot fit both. Maqām theory guarantees at most
 *    two variants per diatonic slot, so the flat accidental is always free. The
 *    rule: **higher-cents pitch keeps the natural letter; lower-cents pitch is
 *    displaced onto the flat accidental** (E → E♭, A → A♭, etc.).
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
 * For asymmetric maqāmāt the colliding pitches are often in different sequences
 * (ascending vs descending). The collision is only visible when the caller
 * passes the **combined** ascending + descending pitch classes via
 * `allPitchClasses`. **Maqām-context callers must always pass combined pitches**
 * (API routes, transpositions UI, 12-pitch-class set builder, etc.).
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
 *   maqām. Required for asymmetric maqāmāt so cross-direction collisions fire.
 *   Pass even for symmetric maqāmāt — it's harmless there and keeps call sites
 *   uniform.
 * @returns New array of pitch classes with sequential `englishName`, adjusted
 *   `referenceNoteName` / `centsDeviation` / `midiNoteDeviation`, and `solfege`
 *   derived from the sequential englishName.
 *
 * @example
 * ```typescript
 * // Maqām bayyātī ʿushayrān in al-Fārābī 950g / ʿushayrān:
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
export function renderPitchClassSpellings(pitchClasses: PitchClass[], ascending: boolean = true, allPitchClasses?: PitchClass[]): PitchClass[] {
  if (pitchClasses.length === 0) {
    return [];
  }

  // Calculate sequential English names for the entire sequence
  const noteNames = pitchClasses.map(pc => pc.noteName);
  const sequentialNames = getSequentialEnglishNames(noteNames, ascending);
  const sequentialEnglishNameByNoteName = new Map<string, string>();
  for (let i = 0; i < pitchClasses.length; i++) {
    const key = pitchClasses[i]?.noteName;
    const val = sequentialNames[i];
    if (key && val && val !== "--") {
      sequentialEnglishNameByNoteName.set(key, val);
    }
  }

  // Get starting pitch class for reference calculations
  const startingPitchClass = pitchClasses[0];
  const startingMidiNumber = startingPitchClass.midiNoteDecimal;
  const startingNoteName = startingPitchClass.englishName;

  // Determine which pitch classes to use for building canonical reference note assignments
  // If allPitchClasses is provided (for symmetrical maqamat), use all unique pitch classes
  // Otherwise, use just the current sequence
  const pitchClassesForCanonical = allPitchClasses || pitchClasses;
  
  // Create a map of unique pitch classes by noteName (for symmetrical maqamat, same noteName = same pitch class)
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
    const maqamContextEnglishName = sequentialEnglishNameByNoteName.get(pc.noteName) ?? pc.englishName;
    const deviationResult = calculateCentsDeviationWithReferenceNote(
      pc.midiNoteDecimal,
      pc.cents,
      startingMidiNumber,
      maqamContextEnglishName,
      startingNoteName
    );
    return {
      pitchClass: pc,
      baseReferenceNote: deviationResult.referenceNoteName,
      baseCentsDeviation: deviationResult.deviation
    };
  });

  // Second pass: Apply sequential logic to canonical ordering to avoid duplicate letters
  // on the reference-note mapping.
  //
  // Maqām-context rule: when two pitches of a maqām resolve to the same natural
  // letter slot (microtonal-vs-natural OR microtonal-vs-microtonal), the
  // **higher-cents** pitch keeps the natural letter and the **lower-cents** pitch
  // is displaced onto the **flat accidental** of the same letter (E → E♭, etc.).
  // Maqām theory guarantees the flat slot is free in these cases — a maqām never
  // uses three variants of a single diatonic slot.
  //
  // Only the MAPPING changes (referenceNoteName, centsDeviation, midiNoteDeviation).
  // englishName stays untouched (it is the authentic maqām-pitch identifier), and
  // solfege stays derived from englishName downstream.
  //
  // Canonical order is ascending by MIDI, so on collision the previously-assigned
  // pitch is the lower-cents one — it gets retroactively moved to the flat.
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
    const m = ref.match(/^([A-G])(#|b)?$/);
    if (!m) return null;
    const base: { [k: string]: number } = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let c = base[m[1].toUpperCase()];
    if (c === undefined) return null;
    if (m[2] === "#") c += 1;
    if (m[2] === "b") c -= 1;
    return ((c % 12) + 12) % 12;
  };

  let prevReferenceNoteName: string | undefined = undefined;
  let prevPitchClass: PitchClass | undefined = undefined;

  canonicalBaseReferenceNotes.forEach(({ pitchClass, baseReferenceNote, baseCentsDeviation }) => {
    const referenceNoteName = baseReferenceNote;
    const centsDeviation = baseCentsDeviation;

    if (prevReferenceNoteName && prevPitchClass) {
      const prevChroma = referenceToChroma(prevReferenceNoteName);
      const currChroma = referenceToChroma(referenceNoteName);

      // Real collision: both references resolve to the same 12-EDO chromatic slot.
      // Bb vs B is NOT a collision (different slots). E vs E IS a collision.
      if (prevChroma !== null && currChroma !== null && prevChroma === currChroma) {
        // Canonical order is ascending by MIDI, so the previously-assigned pitch is
        // the lower-cents one. Maqām-theory rule: higher-cents keeps the natural
        // letter; lower-cents moves onto the flat accidental of the same letter.
        //
        // We only rewrite the PREVIOUS (lower) pitch's reference — the current
        // (higher) pitch keeps its base reference (the natural). This covers the
        // standard bayyātī-ʿushayrān case where segāh E-b3 and nīm būselīk E-3
        // both resolve to E.
        const naturalLetter = referenceNoteName.charAt(0).toUpperCase();
        const flatRef = `${naturalLetter}b`;
        const updatedPrev = canonicalReferenceNoteMap.get(prevPitchClass.noteName);
        if (updatedPrev) {
          const newPrevDeviation = recalcDeviation(prevPitchClass, flatRef);
          canonicalReferenceNoteMap.set(prevPitchClass.noteName, {
            referenceNoteName: flatRef,
            centsDeviation: newPrevDeviation,
          });
        }
      }
    }

    prevReferenceNoteName = referenceNoteName;
    prevPitchClass = pitchClass;
    canonicalReferenceNoteMap.set(pitchClass.noteName, { referenceNoteName, centsDeviation });
  });

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
