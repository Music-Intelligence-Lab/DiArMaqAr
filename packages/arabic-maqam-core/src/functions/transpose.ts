import PitchClass, { calculateInterval, PitchClassInterval, matchingListOfIntervals } from "@/models/PitchClass";
import MaqamData, { Maqam, Sayr } from "@/models/Maqam";
import JinsData, { Jins } from "@/models/Jins";
import TuningSystem from "@/models/TuningSystem";
import NoteName from "@/models/NoteName";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
import shiftPitchClass from "./shiftPitchClass";

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
 * @param useRatio - Matching mode (true = exact ratios, false = cents with tolerance)
 * @param centsTolerance - Tolerance in cents for fuzzy matching (typically ±5 cents)
 * @returns Array of pitch class sequences that match the interval pattern
 */
function getPitchClassTranspositions(inputPitchClasses: PitchClass[], pitchClassIntervals: PitchClassInterval[], ascending: boolean, useRatio: boolean, centsTolerance: number) {
  // Determine search direction: use original order for ascending, reverse for descending
  const allPitchClasses = ascending ? inputPitchClasses : [...inputPitchClasses].reverse();

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

    // Search loop: Test each remaining pitch class as a potential next note
    for (let i = cellIndex; i < allPitchClasses.length; i++) {
      const candidateCell = allPitchClasses[i]; // Current pitch class being tested

      // Get the target interval we need to match at this position
      const cellInterval = pitchClassIntervals[intervalIndex];
      
      // Calculate the actual interval between last note and candidate note
      const computedInterval = calculateInterval(lastCell, candidateCell);

      // Interval matching: Choose matching criteria based on source data type
      if (useRatio) {
        // Exact ratio matching (for fractional sources)
        const comp = computedInterval.decimalRatio;
        const target = cellInterval.decimalRatio;

        if (comp === target) {
          // Exact match found: Recursively continue building sequence from next position
          buildSequences([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
          break; // Found exact match, no need to continue this loop
        } else if ((ascending && comp > target) || (!ascending && comp < target)) {
          // Early termination: We've gone past the target ratio, stop searching
          break;
        }
      } else {
        // Fuzzy cents matching (for string length/cents sources)
        if (Math.abs(computedInterval.cents - cellInterval.cents) <= centsTolerance) {
          // Match within tolerance: Recursively continue building sequence
          buildSequences([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
          break; // Found acceptable match, no need to continue this loop
        } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) {
          // Early termination: We've exceeded the tolerance threshold, stop searching
          break;
        }
      }
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
 * Maqām-Specific Bidirectional Sequence Merging
 *
 * Since we are transposing the ascending and descending sequences for maqāmāt separately,
 * we require this function to merge both sequences into filtered ascending/descending sequence pairs.
 *
 * Pairing Logic:
 * - Ascending sequences start from the tonic note
 * - Descending sequences end on the tonic note  
 * - Successful pairing requires matching note names at these positions
 * - Enables complete bidirectional maqām transposition analysis
 * 
 * @param ascendingSequences - Array of ascending maqām pitch class sequences
 * @param descendingSequences - Array of descending maqām pitch class sequences
 * @returns Array of objects containing paired ascending and descending sequences
 */
function mergeSequences(ascendingSequences: PitchClass[][], descendingSequences: PitchClass[][]) {
  // Array to store successfully paired ascending/descending sequence combinations
  const filteredSequences: { ascendingSequence: PitchClass[]; descendingSequence: PitchClass[] }[] = [];

  // Pairing loop: For each ascending sequence, find a matching descending sequence
  ascendingSequences.forEach((ascSeq) => {
    // Get the starting note name of the ascending sequence (the tonic)
    const ascNoteName = ascSeq[0].noteName;
    
    // Search for matching descending sequence: Find one that ends on the same tonic
    const descSeq = descendingSequences.find((descSeq) => {
      // Get the ending note name of the descending sequence
      const descNoteName = descSeq[descSeq.length - 1].noteName;
      
      // Check if ascending start matches descending end (same tonic)
      return ascNoteName === descNoteName;
    });
    
    // Successful pairing: If we found a matching descending sequence, add the pair
    if (descSeq) {
      filteredSequences.push({ ascendingSequence: ascSeq, descendingSequence: descSeq });
    }
    // Note: If no matching descending sequence found, this ascending sequence is ignored
  });

  return filteredSequences;
}

/**
 * Maqām Transposition Analysis
 * 
 * 
 * Comprehensive Maqām Analysis:
 * 1. **Bidirectional Processing**: Analyzes ascending and descending sequences separately,
 *    accounting for maqāmāt that employ different intervallic patterns in each direction
 * 
 * 2. **Embedded Jins Recognition**: Automatically identifies and transposes all constituent
 *    ajnās within each maqām transposition, creating complete analytical structures
 * 
 * 3. **Octave Extension**: Accurately extends sequences across octave boundaries to
 *    ensure complete jins recognition and proper intervallic analysis
 * 
 * 4. **Tahlil vs Taswir**: Distinguishes between analytical (tahlil) and transposed (taswir)
 *    positions, following traditional Arabic music theory terminology
 * 
 * Algorithmic Precision:
 * - **Pattern Matching**: Extracts intervallic fingerprints from original maqām structure
 * - **Systematic Search**: Tests all possible starting positions within tuning system
 * - **Tolerance Handling**: Uses appropriate matching criteria (exact ratios vs fuzzy cents)
 * - **Bounds Checking**: Ensures transpositions remain within practical octave limits
 * 
 * Naming Conventions:
 * Follows traditional Arabic nomenclature: "maqām [name] al-[starting note]"
 * Example: "maqām bayyātī al-nawā" for bayyātī transposed to start on nawā
 * 
 * @param allPitchClasses - Complete tuning system pitch classes to search within
 * @param allAjnas - Available ajnās for embedded jins recognition
 * @param maqamData - Source maqām to find transpositions for
 * @param withTahlil - Include analytical (original) position in results
 * @param centsTolerance - Tolerance for fuzzy matching (default: ±5 cents JND)
 * @param onlyOctaveOne - Restrict search to first octave only
 * @returns Array of all possible maqām transpositions with embedded jins analysis
 */
export function getMaqamTranspositions(
  allPitchClasses: PitchClass[],
  allAjnas: JinsData[],
  maqamData: MaqamData | null,
  withTahlil: boolean,
  centsTolerance: number = 5,
  onlyOctaveOne: boolean = false
): Maqam[] {
  if (allPitchClasses.length === 0 || !maqamData) return [];

  const ascendingNoteNames = maqamData.getAscendingNoteNames();
  const descendingNoteNames = maqamData.getDescendingNoteNames();

  if (ascendingNoteNames.length < 2 || descendingNoteNames.length < 2) return [];

  const ascendingMaqamCells = allPitchClasses.filter((pitchClass) => ascendingNoteNames.includes(pitchClass.noteName));
  const descendingMaqamCells = [...allPitchClasses.filter((pitchClass) => descendingNoteNames.includes(pitchClass.noteName))].reverse();

  if (ascendingMaqamCells.length === 0 || descendingMaqamCells.length === 0) return [];

  const valueType = allPitchClasses[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const ascendingIntervalPattern: PitchClassInterval[] = getPitchClassIntervals(ascendingMaqamCells);

  const descendingIntervalPattern: PitchClassInterval[] = getPitchClassIntervals(descendingMaqamCells);

  const ascendingSequences: PitchClass[][] = getPitchClassTranspositions(allPitchClasses, ascendingIntervalPattern, true, useRatio, centsTolerance).filter(
    (sequence) => !onlyOctaveOne || sequence[0].octave === 1
  );

  const descendingSequences: PitchClass[][] = getPitchClassTranspositions(allPitchClasses, descendingIntervalPattern, false, useRatio, centsTolerance);

  const ajnasIntervals: { jins: JinsData; intervals: PitchClassInterval[] }[] = [];

  for (const jins of allAjnas) {
    const jinsCells = allPitchClasses.filter((pitchClass) => jins.getNoteNames().includes(pitchClass.noteName));
    if (jinsCells.length !== jins.getNoteNames().length) continue;
    const ascendingJinsIntervalPattern = getPitchClassIntervals(jinsCells);
    ajnasIntervals.push({ jins, intervals: ascendingJinsIntervalPattern });
  }

  const maqamTranspositions: Maqam[] = mergeSequences(ascendingSequences, descendingSequences).map((sequencePair) => {
    const ascendingPitchClasses = sequencePair.ascendingSequence;
    let sliceIndex = 0;
    const lastAscendingPitchClass = ascendingPitchClasses[ascendingPitchClasses.length - 1];

    for (let i = 0; i < ascendingPitchClasses.length; i++) {
      // if the maqam is longer than 7 and has octaves in them, then you want to slice the sequence in a way where you dont shift the octave again
      if (parseFloat(ascendingPitchClasses[i].frequency) * 2 < parseFloat(lastAscendingPitchClass.frequency)) {
        sliceIndex = i + 1;
      }
    }

    if (sliceIndex === 0) sliceIndex = -1;

    const extendedAscendingPitchClasses = [...ascendingPitchClasses, ...ascendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1))];

    const ascendingPitchClassIntervals = getPitchClassIntervals(ascendingPitchClasses);
    const ascendingMaqamAjnas: (Jins | null)[] = [];

    const descendingPitchClasses = [...sequencePair.descendingSequence].reverse();

    const extendedDescendingPitchClasses = [...descendingPitchClasses, ...descendingPitchClasses.slice(sliceIndex + 1).map((pitchClass) => shiftPitchClass(allPitchClasses, pitchClass, 1))];

    const descendingPitchClassIntervals = getPitchClassIntervals(descendingPitchClasses);
    const descendingMaqamAjnas: (Jins | null)[] = [];

    const extendedAscendingPitchClassIntervals = getPitchClassIntervals(extendedAscendingPitchClasses);
    const extendedDescendingPitchClassIntervals = getPitchClassIntervals(extendedDescendingPitchClasses);

    if (allAjnas.length > 0) {
      for (let i = 0; i < extendedAscendingPitchClassIntervals.length; i++) {
        let found = false;

        for (const jinsInterval of ajnasIntervals) {
          const lengthOfInterval = jinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedAscendingPitchClassIntervals.slice(i, i + lengthOfInterval), jinsInterval.intervals, centsTolerance)) {
            const jins = jinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedAscendingPitchClasses[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              transposition: firstJinsNote !== firstCell.noteName,
              jinsPitchClasses: extendedAscendingPitchClasses.slice(i, i + lengthOfInterval + 1),
              jinsPitchClassIntervals: extendedAscendingPitchClassIntervals.slice(i, i + lengthOfInterval),
            };

            ascendingMaqamAjnas.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) ascendingMaqamAjnas.push(null);
        if (ascendingMaqamAjnas.length - 1 === ascendingPitchClassIntervals.length) break;
      }

      for (let i = 0; i < extendedDescendingPitchClassIntervals.length; i++) {
        let found = false;

        for (const jinsInterval of ajnasIntervals) {
          const lengthOfInterval = jinsInterval.intervals.length;
          if (matchingListOfIntervals(extendedDescendingPitchClassIntervals.slice(i, i + lengthOfInterval), jinsInterval.intervals, centsTolerance)) {
            const jins = jinsInterval.jins;
            const firstJinsNote = jins.getNoteNames()[0];
            const firstCell = extendedDescendingPitchClasses[i];

            const jinsTransposition = {
              jinsId: jins.getId(),
              name: `${jins.getName()} al-${firstCell.noteName}`,
              transposition: firstJinsNote !== firstCell.noteName,
              jinsPitchClasses: extendedDescendingPitchClasses.slice(i, i + lengthOfInterval + 1),
              jinsPitchClassIntervals: extendedDescendingPitchClassIntervals.slice(i, i + lengthOfInterval),
            };

            descendingMaqamAjnas.push(jinsTransposition);

            found = true;
            break;
          }
        }

        if (!found) descendingMaqamAjnas.push(null);
        if (descendingMaqamAjnas.length - 1 === descendingPitchClassIntervals.length) break;
      }
    }

    return {
      maqamId: maqamData.getId(),
      name: `${maqamData.getName()} al-${sequencePair.ascendingSequence[0].noteName}`,
      transposition: true,
      ascendingPitchClasses,
      ascendingPitchClassIntervals,
      ascendingMaqamAjnas,
      descendingPitchClasses: descendingPitchClasses.reverse(),
      descendingPitchClassIntervals: descendingPitchClassIntervals.reverse(),
      descendingMaqamAjnas: descendingMaqamAjnas.reverse(),
    };
  });

  const tahlilTransposition = maqamTranspositions.find((transposition) => transposition.ascendingPitchClasses[0].noteName === ascendingNoteNames[0]);
  const maqamTranspositionsWithoutTahlil = maqamTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  // if (maqamData.getId() === "12")

  if (withTahlil && tahlilTransposition) {
    return [{ ...tahlilTransposition, transposition: false }, ...maqamTranspositionsWithoutTahlil];
  } else return maqamTranspositionsWithoutTahlil;
}

/**
 * Jins Transposition Analysis
 * 
 * Finds all possible transpositions of a jins within available pitch classes. This function
 * analyzes a jins interval pattern and systematically searches for all valid starting positions
 * where the complete sequence can be realized within the tuning system.
 * 
 * Algorithmic Operation:
 * 1. **Pattern Extraction**: Extracts intervallic fingerprint from the source jins
 * 2. **Systematic Search**: Tests all possible starting positions within tuning system
 * 3. **Interval Matching**: Uses appropriate matching criteria (exact ratios vs fuzzy cents)
 * 4. **Octave Filtering**: Ensures transpositions remain within valid octave bounds
 * 5. **Tahlil Handling**: Optionally includes or excludes the original analytical position
 * 
 * Naming Conventions:
 * Follows traditional Arabic nomenclature: "[jins name] al-[starting note]"
 * Example: "jins kurd al-muhayyar" for kurd jins transposed to start on muhayyar
 * 
 * Unlike maqām transpositions, ajnās have only a single non-directional sequence,
 * so no bidirectional merging is required.
 * 
 * @param allPitchClasses - Complete tuning system to search within
 * @param jinsData - Source jins data to find transpositions for
 * @param withTahlil - Include original analytical position in results
 * @param centsTolerance - Tolerance for interval matching (default: ±5 cents JND)
 * @param onlyOctaveOne - Restrict search to first octave only
 * @returns Array of all possible jins transpositions following traditional naming
 */
export function getJinsTranspositions(allPitchClasses: PitchClass[], jinsData: JinsData | null, withTahlil: boolean, centsTolerance: number = 5, onlyOctaveOne: boolean = false): Jins[] {
  if (allPitchClasses.length === 0 || !jinsData) return [];

  const jinsNoteNames = jinsData.getNoteNames();

  if (jinsNoteNames.length < 2) return [];

  const jinsCells = allPitchClasses.filter((pitchClass) => jinsNoteNames.includes(pitchClass.noteName));

  if (jinsCells.length === 0) return [];

  const valueType = jinsCells[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  const intervalPattern: PitchClassInterval[] = getPitchClassIntervals(jinsCells);

  const jinsTranspositions: Jins[] = getPitchClassTranspositions(allPitchClasses, intervalPattern, true, useRatio, centsTolerance)
    .filter((sequence) => !onlyOctaveOne || sequence[0].octave === 1)
    .map((sequence) => {
      return {
        jinsId: jinsData.getId(),
        name: `${jinsData.getName()} al-${sequence[0].noteName}`,
        transposition: true,
        jinsPitchClasses: sequence,
        jinsPitchClassIntervals: getPitchClassIntervals(sequence),
      };
    });

  const tahlilTransposition = jinsTranspositions.find((transposition) => transposition.jinsPitchClasses[0].noteName === jinsNoteNames[0]);
  const jinsTranspositionsWithoutTahlil = jinsTranspositions.filter((transposition) => transposition !== tahlilTransposition);

  if (withTahlil && tahlilTransposition) return [{ ...tahlilTransposition, transposition: false }, ...jinsTranspositionsWithoutTahlil];
  else return jinsTranspositionsWithoutTahlil;
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
 * The algorithm extracts the source maqām's tahlīl (analysis), derives its interval pattern,
 * and attempts to rebuild the sequence starting from the target note. This validation is
 * essential for preventing incomplete or invalid transpositions in the user interface.
 * 
 * @param tuningSystem - The tuning system containing the available pitch classes
 * @param startingNote - The original starting note of the maqām in its current position
 * @param maqamData - The maqām object containing the tahlīl and structural information
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

  // Generate pitch classes from the tuning system
  const allPitchClasses = getTuningSystemCells(tuningSystem, startingNote);
  
  if (allPitchClasses.length === 0) return false;

  // Check if the target note exists in the pitch classes
  const targetNoteIndex = allPitchClasses.findIndex((pitchClass) => pitchClass.noteName === targetFirstNote);
  if (targetNoteIndex === -1) return false;

  const ascendingNoteNames = maqamData.getAscendingNoteNames();
  if (ascendingNoteNames.length < 2) return false;

  // Get the tahlil (source) maqam pitch classes
  const sourceMaqam = maqamData.getTahlil(allPitchClasses);
  if (!sourceMaqam || sourceMaqam.ascendingPitchClasses.length === 0) return false;

  // Get the interval pattern from the source maqam
  const intervalPattern = getPitchClassIntervals(sourceMaqam.ascendingPitchClasses);
  
  const valueType = allPitchClasses[0].originalValueType;
  const useRatio = valueType === "fraction" || valueType === "decimalRatio";

  // Find the starting pitch class for the target note
  const startingCell = allPitchClasses.find((pitchClass) => pitchClass.noteName === targetFirstNote);
  if (!startingCell) return false;

  function buildSequence(pitchClasses: PitchClass[], cellIndex: number, intervalIndex: number): boolean {
    if (intervalIndex === intervalPattern.length) {
      return true; // Successfully built the complete sequence
    }
    
    const lastCell = pitchClasses[pitchClasses.length - 1];

    for (let i = cellIndex; i < allPitchClasses.length; i++) {
      const candidateCell = allPitchClasses[i];

      const cellInterval = intervalPattern[intervalIndex];
      const computedInterval = calculateInterval(lastCell, candidateCell);

      if (useRatio) {
        const comp = computedInterval.decimalRatio;
        const target = cellInterval.decimalRatio;

        if (comp === target) {
          return buildSequence([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
        } else if (comp > target) {
          break; // Ascending, so we've gone too far
        }
      } else {
        if (Math.abs(computedInterval.cents - cellInterval.cents) <= centsTolerance) {
          return buildSequence([...pitchClasses, candidateCell], i + 1, intervalIndex + 1);
        } else if (Math.abs(cellInterval.cents) + centsTolerance < Math.abs(computedInterval.cents)) {
          break; // We've gone too far
        }
      }
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

  const shiftNoteName = (noteName: string) => {
    const noteIndex = allPitchClasses.findIndex((pitchClass) => pitchClass.noteName === noteName);

    if (noteIndex === -1) return noteName; // If the note is not found, return it unchanged
    
    const newIndex = noteIndex + shift;
    
    // If the shifted index is out of bounds, mark as out of bounds and return the original note name
    if (newIndex < 0 || newIndex >= allPitchClasses.length) {
      hasOutOfBoundsNotes = true;
      return noteName;
    }

    return allPitchClasses[newIndex].noteName;
  };

  const originalStops = sayr.stops;

  const newStops = originalStops.map((stop) => {
    const newNoteName = stop.type === "note" ? shiftNoteName(stop.value) : stop.value;

    const newStartingNote = (stop.type === "jins" || stop.type === "maqam") && stop.startingNote ? shiftNoteName(stop.startingNote) : stop.startingNote;
    return { ...stop, value: newNoteName, startingNote: newStartingNote };
  });

  return { 
    transposedSayr: { ...sayr, stops: newStops },
    hasOutOfBoundsNotes
  };
}

