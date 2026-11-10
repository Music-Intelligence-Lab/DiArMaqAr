import PitchClass, { calculateInterval, PitchClassInterval, matchingListOfIntervals } from "@/models/PitchClass";
import MaqamData, { Maqam, Sayr } from "@/models/Maqam";
import JinsData, { Jins } from "@/models/Jins";
import TuningSystem from "@/models/TuningSystem";
import NoteName from "@/models/NoteName";
import { sameModalDegreeSlot } from "@/models/NoteName";
import { compareJinsCandidates, getSuyurAttestation, JinsCandidate } from "@/functions/ajnasOrdering";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import shiftPitchClassByOctave from "./shiftPitchClassByOctave";
import { getPitchClassIntervals } from "./getPitchClassIntervals";

/**
 * Universal Interval Pattern Transposition Algorithm
 * 
 * This is a general-purpose function that finds all possible transpositions of ANY interval
 * pattern within available pitch classes. Used by both ajnās and maqāmāt transposition analysis.
 * 
 * 
 * Matching Criteria:
 * - **Ratio Mode**: Exact decimal ratio equality (for fractional sources)
 * - **Cents Mode**: Tolerance-based matching (±centsTolerance, default ±5 cents)
 * - **Early Termination**: Stops searching when intervals exceed target thresholds
 * 
 * This function enables the systematic discovery of all valid transposition positions,
 * ensuring that each maintains the authentic intervallic structure of the original.
 * 
 * @param inputPitchClasses - Available pitch classes to search within (tuning system)
 * @param pitchClassIntervals - Target interval pattern to match 
 * @param ascending - Search direction (true = ascending, false = descending)
 * @param centsTolerance - Matching tolerance in cents (applies to all value types; exact matches have a cents distance of 0)
 * @param centsTolerance - Tolerance in cents for fuzzy matching (typically ±5 cents)
 * @returns Array of pitch class sequences that match the interval pattern
 */
function calculatePitchClassTranspositions(inputPitchClasses: PitchClass[], pitchClassIntervals: PitchClassInterval[], ascending: boolean, centsTolerance: number) {
  // Determine search direction: use original order for ascending, reverse for descending.
  // Exclude "none" placeholder cells (unmapped tuning-system indices) — they carry pitch
  // values but no note identity, so tolerant matching must never build sequences through them.
  const orderedPitchClasses = ascending ? inputPitchClasses : [...inputPitchClasses].reverse();
  const allPitchClasses = orderedPitchClasses.filter((pitchClass) => pitchClass.noteName !== "none");

  // Array to collect all valid transposition sequences found
  const sequences: PitchClass[][] = [];

  /**
   * Recursive Sequence Builder - The Core Algorithm
   * 
   * This recursive function systematically builds valid sequences by testing each possible
   * next pitch class against the required interval pattern. It's the mathematical heart
   * of the transposition algorithm.
   * 
   * @param pitchClasses - Current sequence being built
   * @param cellIndex - Current position in allPitchClasses to start searching from
   * @param intervalIndex - Current position in the target interval pattern
   */
  function buildSequences(pitchClasses: PitchClass[], cellIndex: number, intervalIndex: number) {
    // Base case: If we've matched all required intervals, we have a complete valid sequence
    if (intervalIndex === pitchClassIntervals.length) {
      sequences.push(pitchClasses); // Add this successful sequence to results
      return; // Exit this recursion branch
    }
    
    // Get the last pitch class in our current sequence (to calculate intervals from)
    const lastCell = pitchClasses[pitchClasses.length - 1];

    // Get the target interval we need to match at this position
    const cellInterval = pitchClassIntervals[intervalIndex];

    // Collect every candidate within tolerance for this step. Interval matching is
    // cents comparison within tolerance for all value types (ratio-based sources
    // included — an exact ratio match has a cents distance of 0). The scan stops
    // once the computed interval exceeds the target by more than the tolerance.
    const candidates: { index: number; cell: PitchClass; deviation: number }[] = [];
    for (let i = cellIndex; i < allPitchClasses.length; i++) {
      const candidateCell = allPitchClasses[i]; // Current pitch class being tested
      const computedInterval = calculateInterval(lastCell, candidateCell);
      const deviation = Math.abs(computedInterval.cents - cellInterval.cents);

      if (deviation <= centsTolerance) {
        candidates.push({ index: i, cell: candidateCell, deviation });
      } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) {
        // Early termination: We've exceeded the tolerance threshold, stop searching
        break;
      }
    }

    // Prefer the closest match (the exact note has deviation 0) and backtrack to
    // the next-closest candidate only if that path dead-ends — a greedy first-in-
    // pitch-order pick would commit to a near-miss neighbor and lose the whole
    // sequence when its path fails. At most one completed sequence per branch.
    candidates.sort((a, b) => a.deviation - b.deviation);
    for (const candidate of candidates) {
      const sequencesBefore = sequences.length;
      buildSequences([...pitchClasses, candidate.cell], candidate.index + 1, intervalIndex + 1);
      if (sequences.length > sequencesBefore) break;
    }
  }

  // Initialization loop: Try every pitch class as a potential starting point
  for (let i = 0; i < allPitchClasses.length; i++) {
    const startingCell = allPitchClasses[i]; // Current starting pitch being tested
    
    // Begin recursive sequence building from this starting point
    buildSequences([startingCell], i + 1, 0);
  }

  // Octave filtering: Remove sequences that start/end outside valid octave range (0-3)
  return sequences.filter((sequence) => {
    let oct: number;

    // Determine which octave to check based on search direction
    if (ascending) {
      oct = sequence[0].octave; // Check starting octave for ascending sequences
    } else {
      oct = sequence[sequence.length - 1].octave; // Check ending octave for descending sequences
    }

    // Allow octaves 0, 1, 2, 3 but exclude anything beyond octave 3
    return oct >= 0 && oct <= 3;
  });
}

/**
 * Shifts a note name by `shift` positions within `allPitchClasses`. Used by
 * sayr transposition. This is a fixed shift across the tuning system, not a
 * scale-degree mapping: where the steps are uneven, moving the tonic by N
 * positions does not move every degree by N. The maqām degree fields are
 * mapped by structure position instead (see calculateMaqamForms).
 *
 * @param noteName Source note name to shift.
 * @param shift Positive = upward, negative = downward, in tuning-system positions.
 * @param allPitchClasses The tuning system's full pitch-class array.
 * @returns An object reporting the shifted note name plus flags for the two
 *   failure modes: `notFound` if `noteName` is absent from `allPitchClasses`,
 *   and `outOfBounds` if the shifted index falls outside the pitch-class array.
 *   In both failure modes the original `noteName` is returned unchanged so
 *   callers that want "preserve on failure" behaviour (like transposeSayr)
 *   can use the result directly.
 */
function shiftNoteNameByTransposition(
  noteName: string,
  shift: number,
  allPitchClasses: PitchClass[]
): { noteName: string; outOfBounds: boolean; notFound: boolean } {
  const noteIndex = allPitchClasses.findIndex((p) => p.noteName === noteName);
  if (noteIndex === -1) {
    return { noteName, outOfBounds: false, notFound: true };
  }
  const newIndex = noteIndex + shift;
  if (newIndex < 0 || newIndex >= allPitchClasses.length) {
    return { noteName, outOfBounds: true, notFound: false };
  }
  return { noteName: allPitchClasses[newIndex].noteName, outOfBounds: false, notFound: false };
}

/**
 * Every form of a maqām that a tuning system can play.
 *
 * A form is one rendering of the maqām in the tuning system's pitch space. There
 * are three kinds, and only the last is a transposition (see formTypeOf in
 * ./formType):
 * - the base form: the maqām on the tonic the sources give
 *   (maqām rāst on rāst)
 * - an octave rendering: the base form one or more octaves away, on the same modal
 *   degree (maqām rāst on qarār rāst or kirdān). Neither the base form nor a taṣwīr: the
 *   darajat al-istiqrār has not moved, only its register.
 * - a taṣwīr (transposition): the maqām moved to another modal degree
 *   (maqām rāst al-nawā)
 *
 * To count or pick out one kind, use formTypeOf. Never test
 * `transposition === false`: that matches the base form and every octave
 * rendering of it alike.
 *
 * How the forms are found: the maqām's whole stored structure (every distinct
 * note of either direction, in pitch order) is reduced to its interval pattern,
 * and every starting position in the tuning system that reproduces that pattern
 * within the cents tolerance is a form. The ascending and descending sequences
 * are read back out of each match, and the ajnās on every degree are identified.
 *
 * Naming: the base form keeps the maqām's own name; every other form names its
 * tonic, "maqām [name] al-[starting note]" (maqām bayyātī al-nawā).
 *
 * @param allPitchClasses - Complete tuning system pitch classes to search within
 * @param allAjnas - Available ajnās for embedded jins recognition
 * @param maqamData - The maqām whose forms to find
 * @param centsTolerance - Tolerance for fuzzy matching (default: ±5 cents JND)
 * @returns Every form, base form first, or an empty array if the tuning system
 *   cannot build the maqām at all
 * @throws If the tuning system can build the maqām but no form starts on its
 *   canonical first note, i.e. the base form cannot be resolved
 */
export function calculateMaqamForms(
  allPitchClasses: PitchClass[],
  allAjnas: JinsData[],
  maqamData: MaqamData | null,
  centsTolerance: number = 5
): Maqam[] {
  if (allPitchClasses.length === 0 || !maqamData) return [];

  const ascendingNoteNames = maqamData.getAscendingNoteNames();
  const descendingNoteNames = maqamData.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return [];

  // A maqām the tuning system cannot build has no forms. Without this
  // the filters below would silently drop the missing notes and derive an
  // interval pattern from the surviving ones — forms of a maqām that
  // does not exist here. Mirrors the embedded-ajnās check further down.
  if (!maqamData.isMaqamPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName))) return [];

  // The stored form is one structure: every distinct note the maqām uses going
  // up or coming down, in pitch order. Each form places that whole
  // structure, and its ascending and descending sequences are read back out of
  // it at the positions the stored form gives. The descending sequence is never
  // searched for on its own, so a symmetric maqām stays symmetric and an
  // asymmetric one keeps exactly its stored relationship between directions.
  // (Searching each direction separately and pairing by tonic let a descending
  // run through near-identical notes stand in for the stored one: ḥijāz kār
  // kurd (al-Ṣabbāgh) in Allami 2025 descended through jawāb nayrūz and jawāb
  // shūrī instead of its own nīm ʿajam and nīm ḥiṣār.)
  const ascendingMaqamCells = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));
  const descendingMaqamCells = [...allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName))].reverse();
  const structureCells = allPitchClasses.filter(
    (pitchClass) => ascendingNoteNames.includes(pitchClass.noteName) || descendingNoteNames.includes(pitchClass.noteName)
  );
  const ascendingPositions = ascendingMaqamCells.map((cell) => structureCells.indexOf(cell));
  const descendingPositions = descendingMaqamCells.map((cell) => structureCells.indexOf(cell));

  const structureIntervalPattern: PitchClassInterval[] = getPitchClassIntervals(structureCells);
  const structureSequences: PitchClass[][] = calculatePitchClassTranspositions(allPitchClasses, structureIntervalPattern, true, centsTolerance);

  const ajnasIntervals: { jins: JinsData; intervals: PitchClassInterval[] }[] = [];

  for (const jins of allAjnas) {
    const jinsCells = allPitchClasses.filter((pitchClass) => jins.getNoteNames().includes(pitchClass.noteName));
    if (jinsCells.length !== jins.getNoteNames().length) continue;
    const ascendingJinsIntervalPattern = getPitchClassIntervals(jinsCells);
    ajnasIntervals.push({ jins, intervals: ascendingJinsIntervalPattern });
  }

  // Fetched once per call rather than once per transposition or per degree.
  const suyurAttestation = getSuyurAttestation();

  const candidateForms: Maqam[] = structureSequences.map((structure) => {
    const ascendingPitchClasses = ascendingPositions.map((position) => structure[position]);
    let sliceIndex = 0;
    const lastAscendingPitchClass = ascendingPitchClasses[ascendingPitchClasses.length - 1];

    for (let i = 0; i < ascendingPitchClasses.length; i++) {
      // if the maqam is longer than 7 and has octaves in them, then you want to slice the sequence in a way where you dont shift the octave again
      if (parseFloat(ascendingPitchClasses[i].frequency) * 2 < parseFloat(lastAscendingPitchClass.frequency)) {
        sliceIndex = i + 1;
      }
    }

    if (sliceIndex === 0) sliceIndex = -1;

    const extendedAscendingPitchClasses = [...ascendingPitchClasses, ...ascendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClassByOctave(allPitchClasses, pitchClass, 1))];

    const ascendingPitchClassIntervals = getPitchClassIntervals(ascendingPitchClasses);

    // Low to high here, like the ascending notes; reversed to descending order on output
    const descendingPitchClasses = descendingPositions.map((position) => structure[position]).reverse();

    const extendedDescendingPitchClasses = [...descendingPitchClasses, ...descendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClassByOctave(allPitchClasses, pitchClass, 1))];

    const descendingPitchClassIntervals = getPitchClassIntervals(descendingPitchClasses);

    const extendedAscendingPitchClassIntervals = getPitchClassIntervals(extendedAscendingPitchClasses);
    const extendedDescendingPitchClassIntervals = getPitchClassIntervals(extendedDescendingPitchClasses);

    // One helper for both directions: the ascending and descending loops were
    // near-identical copies and had already drifted once.
    const collectAjnasPerDegree = (
      extendedPitchClasses: PitchClass[],
      extendedIntervals: PitchClassInterval[],
      ownIntervalCount: number
    ): Jins[][] => {
      const perDegree: Jins[][] = [];
      if (allAjnas.length === 0) return perDegree;

      for (let i = 0; i < extendedIntervals.length; i++) {
        const degreeNoteName = extendedPitchClasses[i].noteName;
        const matches: { candidate: JinsCandidate; jins: Jins }[] = [];

        // Every match is collected, not just the first. Stopping at the first hit
        // meant data/ajnas.json order silently decided which of several valid
        // readings a degree showed.
        for (const jinsInterval of ajnasIntervals) {
          const lengthOfInterval = jinsInterval.intervals.length;
          if (!matchingListOfIntervals(extendedIntervals.slice(i, i + lengthOfInterval), jinsInterval.intervals, centsTolerance)) continue;

          const jins = jinsInterval.jins;
          const firstJinsNote = jins.getNoteNames()[0];
          // Register/octave variants are equivalent for taṣwīr: a jins seated on
          // rāst is still that jins on kurdān.
          const isTransposed = !sameModalDegreeSlot(firstJinsNote, degreeNoteName);
          // Same exact canonical-note test calculateJinsForms uses to
          // pick the base form, so an embedded jins agrees with its standalone entry.
          const isBaseForm = firstJinsNote === degreeNoteName;

          matches.push({
            candidate: { jinsId: jins.getId(), firstNoteName: firstJinsNote, noteCount: jins.getNoteNames().length },
            jins: {
              jinsId: jins.getId(),
              // Every form but the base form names its tonic, an octave rendering
              // (jins yegāh on nawā) as much as a taṣwīr — the same names
              // calculateJinsForms gives, so the jins at a maqām degree
              // and its standalone entry share one identifier.
              name: isBaseForm ? jins.getName() : `${jins.getName()} al-${degreeNoteName}`,
              transposition: isTransposed,
              isBaseForm,
              jinsPitchClasses: extendedPitchClasses.slice(i, i + lengthOfInterval + 1),
              jinsPitchClassIntervals: extendedIntervals.slice(i, i + lengthOfInterval),
            },
          });
        }

        matches.sort((x, y) => compareJinsCandidates(x.candidate, y.candidate, degreeNoteName, suyurAttestation));
        perDegree.push(matches.map((match) => match.jins));

        if (perDegree.length - 1 === ownIntervalCount) break;
      }

      return perDegree;
    };

    const ascendingMaqamAjnas = collectAjnasPerDegree(
      extendedAscendingPitchClasses,
      extendedAscendingPitchClassIntervals,
      ascendingPitchClassIntervals.length
    );
    const descendingMaqamAjnas = collectAjnasPerDegree(
      extendedDescendingPitchClasses,
      extendedDescendingPitchClassIntervals,
      descendingPitchClassIntervals.length
    );

    const firstMaqamNote = ascendingNoteNames[0];
    const firstTransposedNote = ascendingPitchClasses[0].noteName;
    // "Transposition" (taswīr) is a change of modal tonic, not a register/octave variant
    // like qarār dūgāh vs dūgāh vs muḥayyar (same modal degree slot in NoteName tables).
    const isTransposed = !sameModalDegreeSlot(firstMaqamNote, firstTransposedNote);

    // The four degree fields (primary, secondary and tertiary jins, ghammāz) are
    // stored as note names of the base form. Each is carried to this form by its
    // place in the maqām: the note at the same position of the structure. A
    // fixed tuning-system shift (move every note as far as the tonic moved) is
    // wrong wherever the steps are uneven: in Allami 2025, maqām rāst on qarār
    // chahārgāh moved its ghammāz nawā to rahāwī, which is not in that form at
    // all, instead of to its own degree V.
    //
    // A stored degree outside the structure is taken through the structure
    // note an octave from it, then moved back by that octave (tarznwin's
    // ghammāz nawā through its saham/ramal tūtī). On the base form both rules
    // return the stored name unchanged.
    const mapDegreeNote = (noteName: string): string | null => {
      const position = structureCells.findIndex((cell) => cell.noteName === noteName);
      if (position !== -1) return structure[position].noteName;

      const source = allPitchClasses.find((pitchClass) => pitchClass.noteName === noteName);
      if (!source) return null;
      const octaveEquivalents = structureCells
        .map((cell, index) => ({ index, octaves: cell.octave - source.octave, cell }))
        .filter(({ cell, octaves }) => octaves !== 0 && cell.pitchClassIndex === source.pitchClassIndex)
        .sort((a, b) => Math.abs(a.octaves) - Math.abs(b.octaves));
      if (octaveEquivalents.length === 0) return null;
      const { index, octaves } = octaveEquivalents[0];
      const shifted = shiftPitchClassByOctave(allPitchClasses, structure[index], -octaves);
      return shifted.noteName === "" ? null : shifted.noteName;
    };

    const mapDegree = (source: string[] | null | undefined): string[] | null => {
      if (source == null) return null;
      const resolved: string[] = [];
      for (const n of source) {
        const mapped = mapDegreeNote(n);
        // Any failure collapses the whole degree to null — mixing resolved
        // and unresolved notes in one degree is musicologically meaningless.
        if (mapped == null) return null;
        resolved.push(mapped);
      }
      return resolved;
    };

    const primaryJinsNoteName = mapDegree(maqamData.getPrimaryJinsDegree());
    const secondaryJinsNoteName = mapDegree(maqamData.getSecondaryJinsDegree());
    const tertiaryJinsNoteName = mapDegree(maqamData.getTertiaryJinsDegree());
    const ghammazNoteName = mapDegree(maqamData.getGhammaz());

    // Look up jins objects for the three jins degrees. Must run BEFORE the
    // descendingMaqamAjnas.reverse() in the return statement, so we capture the
    // ascending-index layout of the descending array here.
    const jinsLookup = (noteNames: string[] | null): Jins[][] => {
      if (noteNames == null) return [];
      const out: Jins[][] = [];
      for (const n of noteNames) {
        // Every jins at a degree is sliced from the same starting pitch class, so
        // the head's first note identifies the whole degree.
        const ascIndex = ascendingMaqamAjnas.findIndex((degree) => degree[0]?.jinsPitchClasses[0]?.noteName === n);
        if (ascIndex !== -1) { out.push(ascendingMaqamAjnas[ascIndex]); continue; }
        const descIndex = descendingMaqamAjnas.findIndex((degree) => degree[0]?.jinsPitchClasses[0]?.noteName === n);
        if (descIndex !== -1) { out.push(descendingMaqamAjnas[descIndex]); continue; }
        // No matching jins — skip this noteName. Keeps the array compact.
      }
      return out;
    };

    const primaryJins = jinsLookup(primaryJinsNoteName);
    const secondaryJins = jinsLookup(secondaryJinsNoteName);
    const tertiaryJins = jinsLookup(tertiaryJinsNoteName);

    return {
      maqamId: maqamData.getId(),
      name: isTransposed ? `${maqamData.getName()} al-${firstTransposedNote}` : maqamData.getName(),
      transposition: isTransposed,
      // Provisional: the base form is picked out below and re-stamped true.
      isBaseForm: false,
      ascendingPitchClasses,
      ascendingPitchClassIntervals,
      ascendingMaqamAjnas,
      descendingPitchClasses: descendingPitchClasses.reverse(),
      descendingPitchClassIntervals: descendingPitchClassIntervals.reverse(),
      descendingMaqamAjnas: descendingMaqamAjnas.reverse(),
      primaryJinsNoteName,
      secondaryJinsNoteName,
      tertiaryJinsNoteName,
      ghammazNoteName,
      primaryJins,
      secondaryJins,
      tertiaryJins,
    };
  });

  // The base form is the form on the EXACT canonical first note (rāst →
  // rāst/C3), never an octave rendering (qarār rāst/C2, kirdān/C4). The guard at
  // the top of this function guarantees that note is in the tuning system, and
  // a sequence starting there matches the maqām's own interval pattern at zero
  // deviation, so the match always exists.
  const canonicalFirstNote = ascendingNoteNames[0];
  const baseForm = candidateForms.find(
    (form) => form.ascendingPitchClasses[0].noteName === canonicalFirstNote
  );
  // Octave renderings of the base form (same modal degree slot, different
  // register — e.g. qarār rāst vs rāst vs kirdān) keep transposition=false
  // by design (register shift is not taṣwīr), but give them a distinguishing
  // name suffix so name-based lookups in the UI are unambiguous.
  const otherForms = candidateForms
    .filter((form) => form !== baseForm)
    .map((form) => {
      if (
        !form.transposition &&
        form.ascendingPitchClasses[0].noteName !== canonicalFirstNote
      ) {
        return {
          ...form,
          name: `${maqamData.getName()} al-${form.ascendingPitchClasses[0].noteName}`,
        };
      }
      return form;
    });

  if (!baseForm) {
    throw new Error(
      `Could not resolve the base form of maqām ${maqamData.getName()}: no form starts on its canonical first note '${canonicalFirstNote}', ` +
        `even though the tuning system contains every note of the maqām. This means the form search failed to return the maqām's own position.`
    );
  }

  return [{ ...baseForm, name: maqamData.getName(), transposition: false, isBaseForm: true }, ...otherForms];
}

/**
 * Every form of a jins that a tuning system can play.
 *
 * A form is one rendering of the jins in the tuning system's pitch space. There
 * are three kinds, and only the last is a transposition (see formTypeOf in
 * ./formType):
 * - the base form: the jins on the tonic the sources give
 *   (jins bayyāt on dūgāh)
 * - an octave rendering: the base form one or more octaves away, on the same modal
 *   degree (jins bayyāt on muḥayyar). Neither the base form nor a taṣwīr: the
 *   darajat al-istiqrār has not moved, only its register.
 * - a taṣwīr (transposition): the jins moved to another modal degree
 *   (jins bayyāt al-ʿushayrān)
 *
 * To count or pick out one kind, use formTypeOf. Never test
 * `transposition === false`: that matches the base form and every octave
 * rendering of it alike.
 *
 * How the forms are found: the jins's notes are reduced to their interval
 * pattern, and every starting position in the tuning system that reproduces
 * that pattern within the cents tolerance is a form. A jins has one
 * non-directional sequence, so unlike a maqām there is nothing to merge.
 *
 * Naming: the base form keeps the jins's own name; every other form names its
 * tonic, "[jins name] al-[starting note]" (jins kurd al-ḥusaynī).
 *
 * @param allPitchClasses - Complete tuning system to search within
 * @param jinsData - The jins whose forms to find
 * @param centsTolerance - Tolerance for interval matching (default: ±5 cents JND)
 * @returns Every form, base form first, or an empty array if the tuning system
 *   cannot build the jins at all
 * @throws If the tuning system can build the jins but no form starts on its
 *   canonical first note, i.e. the base form cannot be resolved
 */
export function calculateJinsForms(allPitchClasses: PitchClass[], jinsData: JinsData | null, centsTolerance: number = 5): Jins[] {
  if (allPitchClasses.length === 0 || !jinsData) return [];

  const jinsNoteNames = jinsData.getNoteNames();

  if (jinsNoteNames.length < 2) return [];

  // A jins the tuning system cannot build has no forms. Without this
  // the filter below would silently drop the missing notes and derive an
  // interval pattern from the surviving ones — forms of a jins that
  // does not exist here. Mirrors the embedded-ajnās check in
  // calculateMaqamForms.
  if (!jinsData.isJinsPossible(allPitchClasses.map((pitchClass) => pitchClass.noteName))) return [];

  const jinsCells = allPitchClasses.filter((pitchClass) => jinsNoteNames.includes(pitchClass.noteName));

  const intervalPattern: PitchClassInterval[] = getPitchClassIntervals(jinsCells);

  const candidateForms: Jins[] = calculatePitchClassTranspositions(allPitchClasses, intervalPattern, true, centsTolerance)
    .map((sequence) => {
      const tonic = sequence[0].noteName;
      const isTransposed = !sameModalDegreeSlot(jinsNoteNames[0], tonic);
      return {
        jinsId: jinsData.getId(),
        name: isTransposed ? `${jinsData.getName()} al-${tonic}` : jinsData.getName(),
        transposition: isTransposed,
        // Provisional: the base form is picked out below and re-stamped true.
        isBaseForm: false,
        jinsPitchClasses: sequence,
        jinsPitchClassIntervals: getPitchClassIntervals(sequence),
      };
    });

  // The base form is the form on the EXACT canonical first note (rāst →
  // rāst/C3), never an octave rendering (qarār rāst/C2, kirdān/C4). The guard at
  // the top of this function guarantees that note is in the tuning system, and
  // a sequence starting there matches the jins's own interval pattern at zero
  // deviation, so the match always exists.
  const canonicalFirstNote = jinsNoteNames[0];
  const baseForm = candidateForms.find(
    (form) => form.jinsPitchClasses[0].noteName === canonicalFirstNote
  );
  // Octave renderings of the base form (same modal degree slot, different
  // register — e.g. qarār rāst vs rāst vs kirdān) keep transposition=false
  // by design (register shift is not taṣwīr), but give them a distinguishing
  // name suffix so name-based lookups in the UI (open/collapse state, scroll
  // targets) are unambiguous — mirrors calculateMaqamForms.
  const otherForms = candidateForms
    .filter((form) => form !== baseForm)
    .map((form) => {
      if (
        !form.transposition &&
        form.jinsPitchClasses[0].noteName !== canonicalFirstNote
      ) {
        return {
          ...form,
          name: `${jinsData.getName()} al-${form.jinsPitchClasses[0].noteName}`,
        };
      }
      return form;
    });

  if (!baseForm) {
    throw new Error(
      `Could not resolve the base form of jins ${jinsData.getName()}: no form starts on its canonical first note '${canonicalFirstNote}', ` +
        `even though the tuning system contains every note of the jins. This means the form search failed to return the jins's own position.`
    );
  }

  return [{ ...baseForm, name: jinsData.getName(), transposition: false, isBaseForm: true }, ...otherForms];
}

/**
 * Determines whether a maqām can be successfully transposed to a specific target note.
 * 
 * This function validates transposition feasibility by analyzing the source maqām's interval
 * pattern and checking if the target tuning system contains the necessary pitch classes to
 * reconstruct the complete maqām sequence starting from the specified target note. It uses
 * recursive sequence building to ensure all required intervals can be matched within the
 * specified cents tolerance.
 * 
 * The algorithm extracts the source maqām's base form, derives its interval pattern,
 * and attempts to rebuild the sequence starting from the target note. This validation is
 * essential for preventing incomplete or invalid transpositions in the user interface.
 * 
 * @param tuningSystem - The tuning system containing the available pitch classes
 * @param startingNote - The original starting note of the maqām in its current position
 * @param maqamData - The maqām object containing the base form and structural information
 * @param targetFirstNote - The desired starting note for the transposed maqām
 * @param centsTolerance - Maximum allowed deviation in cents for interval matching (default: 5)
 * @returns true if the maqām can be completely transposed to the target note, false otherwise
 */
export function canTransposeMaqamToNote(
  tuningSystem: TuningSystem,
  startingNote: NoteName,
  maqamData: MaqamData, 
  targetFirstNote: string, 
  centsTolerance: number = 5
): boolean {
  if (!tuningSystem || !maqamData) return false;

  // Generate pitch classes from the tuning system, excluding "none" placeholder cells
  // (unmapped indices) so tolerant matching never builds sequences through them
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote).filter((pitchClass) => pitchClass.noteName !== "none");

  if (allPitchClasses.length === 0) return false;

  // Check if the target note exists in the pitch classes
  const targetNoteIndex = allPitchClasses.findIndex((pitchClass) => pitchClass.noteName === targetFirstNote);
  if (targetNoteIndex === -1) return false;

  const ascendingNoteNames = maqamData.getAscendingNoteNames();
  if (ascendingNoteNames.length < 2) return false;

  // Get the base-form (source) maqam pitch classes
  const sourceMaqam = maqamData.getBaseForm(allPitchClasses);
  if (!sourceMaqam || sourceMaqam.ascendingPitchClasses.length === 0) return false;

  // Get the interval pattern from the source maqam
  const intervalPattern = getPitchClassIntervals(sourceMaqam.ascendingPitchClasses);
  
  // Find the starting pitch class for the target note
  const startingCell = allPitchClasses.find((pitchClass) => pitchClass.noteName === targetFirstNote);
  if (!startingCell) return false;

  function buildSequence(pitchClasses: PitchClass[], cellIndex: number, intervalIndex: number): boolean {
    if (intervalIndex === intervalPattern.length) {
      return true; // Successfully built the complete sequence
    }
    
    const lastCell = pitchClasses[pitchClasses.length - 1];
    const cellInterval = intervalPattern[intervalIndex];

    // Cents comparison within tolerance for all value types (ratio-based included);
    // collect all candidates, then try closest-first with backtracking — see
    // calculatePitchClassTranspositions for the rationale
    const candidates: { index: number; cell: PitchClass; deviation: number }[] = [];
    for (let i = cellIndex; i < allPitchClasses.length; i++) {
      const candidateCell = allPitchClasses[i];
      const computedInterval = calculateInterval(lastCell, candidateCell);
      const deviation = Math.abs(computedInterval.cents - cellInterval.cents);

      if (deviation <= centsTolerance) {
        candidates.push({ index: i, cell: candidateCell, deviation });
      } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) {
        break; // We've gone too far
      }
    }

    candidates.sort((a, b) => a.deviation - b.deviation);
    for (const candidate of candidates) {
      if (buildSequence([...pitchClasses, candidate.cell], candidate.index + 1, intervalIndex + 1)) return true;
    }

    return false; // Couldn't find a matching interval
  }

  return buildSequence([startingCell], targetNoteIndex + 1, 0);
}

/**
 * Transposes a sayr by shifting its note names.
 * 
 * Calculates the shift amount by comparing the first note of the source maqām data
 * with the first note of the target maqām, then applies this shift to all note
 * references in the sayr. Handles different stop types appropriately and flags
 * when transposed notes fall outside the available tuning system range.
 * 
 * @param sayr - The sayr structure to transpose
 * @param allPitchClasses - Available pitch classes in the tuning system
 * @param maqamData - Source maqām data for calculating shift amount
 * @param maqam - Target maqām for calculating shift amount
 * @returns Object containing the transposed sayr and out-of-bounds flag
 */
export function transposeSayr(sayr: Sayr, allPitchClasses: PitchClass[], maqamData: MaqamData, maqam: Maqam): { transposedSayr: Sayr; hasOutOfBoundsNotes: boolean } {
  const firstNoteInData = maqamData.getAscendingNoteNames()[0];
  const firstNoteInMaqam = maqam.ascendingPitchClasses[0].noteName;

  const firstNoteInDataIndex = allPitchClasses.findIndex((pitchClass) => pitchClass.noteName === firstNoteInData);
  const firstNoteInMaqamIndex = allPitchClasses.findIndex((pitchClass) => pitchClass.noteName === firstNoteInMaqam);

  const shift = firstNoteInMaqamIndex - firstNoteInDataIndex;
  let hasOutOfBoundsNotes = false;

  const shiftOne = (noteName: string): string => {
    const result = shiftNoteNameByTransposition(noteName, shift, allPitchClasses);
    if (result.outOfBounds) hasOutOfBoundsNotes = true;
    return result.noteName;
  };

  const originalStops = sayr.stops;

  const newStops = originalStops.map((stop) => {
    const newNoteName = stop.type === "note" ? shiftOne(stop.value) : stop.value;
    const newStartingNote = (stop.type === "jins" || stop.type === "maqam") && stop.startingNote ? shiftOne(stop.startingNote) : stop.startingNote;
    return { ...stop, value: newNoteName, startingNote: newStartingNote };
  });

  return {
    transposedSayr: { ...sayr, stops: newStops },
    hasOutOfBoundsNotes
  };
}


/**
 * Every rendering of each maqām and jins, computed on first request and kept.
 * What shiftMaqamByOctaves and shiftJinsByOctaves look a shifted form up in.
 */
export function renderingsLookup(allPitchClasses: PitchClass[], allAjnas: JinsData[], allMaqamat: MaqamData[], centsTolerance: number = 5) {
  const maqamRenderings = new Map<string, Maqam[]>();
  const jinsRenderings = new Map<string, Jins[]>();
  return {
    maqam(maqamId: string): Maqam[] {
      if (!maqamRenderings.has(maqamId)) {
        const maqamData = allMaqamat.find((m) => m.getId() === maqamId);
        if (!maqamData) throw new Error(`No maqām with id ${maqamId}`);
        maqamRenderings.set(maqamId, calculateMaqamForms(allPitchClasses, allAjnas, maqamData, centsTolerance));
      }
      return maqamRenderings.get(maqamId)!;
    },
    jins(jinsId: string): Jins[] {
      if (!jinsRenderings.has(jinsId)) {
        const jinsData = allAjnas.find((j) => j.getId() === jinsId);
        if (!jinsData) throw new Error(`No jins with id ${jinsId}`);
        jinsRenderings.set(jinsId, calculateJinsForms(allPitchClasses, jinsData, centsTolerance));
      }
      return jinsRenderings.get(jinsId)!;
    },
  };
}
