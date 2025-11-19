import TuningSystem from "@/models/TuningSystem";
import MaqamData, { Maqam } from "@/models/Maqam";
import PitchClass from "@/models/PitchClass";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { getIpnReferenceNoteName } from "@/functions/getIpnReferenceNoteName";

/**
 * Represents a maqam-based pitch class set with variable number of pitch classes
 * Unlike 12-pitch-class sets, these sets contain only the pitch classes needed
 * for the source maqam (no filler pitch classes from other tuning systems)
 */
export interface MaqamPitchClassSet {
  /** Map of IPN reference note name (C, C#, D, etc.) to pitch class */
  pitchClasses: Map<string, PitchClass>;
  /** The IPN reference note names in the set (variable length, not fixed at 12) */
  ipnReferenceNames: string[];
}

/**
 * Represents a maqam transposition with its compatibility status
 */
export interface MaqamTranspositionInfo {
  maqam: Maqam;
  maqamData: MaqamData;
  isCompatible: boolean;
}

/**
 * Represents a classification set grouping compatible maqamat
 */
export interface ClassificationSet {
  id: string;
  name: string;
  sourceMaqam: {
    id: string;
    idName: string;
    name: string;
  };
  sourceTransposition: Maqam;
  pitchClassSet: MaqamPitchClassSet;
  compatibleMaqamat: MaqamTranspositionInfo[];
  pitchClassCount: number;
}

/**
 * Represents an incompatible maqam with reason
 */
export interface IncompatibleMaqam {
  maqam: MaqamData;
  transposition: Maqam | null;
  reason: string;
}

/**
 * Classification result containing all sets and incompatible maqamat
 */
export interface ClassificationResult {
  sets: ClassificationSet[];
  incompatibleMaqamat: IncompatibleMaqam[];
}

/**
 * Gets all transpositions of a maqam in the specified tuning system
 */
export function getMaqamTranspositions(
  maqamData: MaqamData,
  tuningSystem: TuningSystem,
  startingNote: string,
  ajnas: any[]
): Maqam[] {
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  return calculateMaqamTranspositions(allPitchClasses, ajnas, maqamData, true, 5, false);
}

/**
 * Creates a maqam-based pitch class set from a maqam transposition.
 * Extracts the union of all pitch classes from ascending and descending sequences.
 *
 * Unlike 12-pitch-class sets, this function:
 * - Does NOT merge with a chromatic base or al-Kindi filler
 * - Creates a set with variable number of pitch classes (not fixed at 12)
 * - Uses only the pitch classes present in the maqam itself
 * - Uses octave-equivalent IPN references (C in any octave maps to "C")
 *
 * @param maqamTransposition - The maqam transposition to extract pitch classes from
 * @returns MaqamPitchClassSet with all unique pitch classes from the maqam, or null if duplicate IPN with different cents
 */
export function createMaqamPitchClassSet(
  maqamTransposition: Maqam
): MaqamPitchClassSet | null {
  // Collect all pitch classes from ascending and descending sequences
  const allMaqamPitchClasses = [
    ...maqamTransposition.ascendingPitchClasses,
    ...maqamTransposition.descendingPitchClasses
  ];

  // Map IPN reference to pitch classes from maqam (octave-equivalent)
  const maqamIpnMap = new Map<string, PitchClass[]>();

  for (const pitchClass of allMaqamPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    if (!maqamIpnMap.has(ipnRef)) {
      maqamIpnMap.set(ipnRef, []);
    }
    maqamIpnMap.get(ipnRef)!.push(pitchClass);
  }

  // Check for duplicate IPN references with different pitch class values (incompatible)
  // A maqam is incompatible if the same IPN reference appears with different pitch class values
  // when normalized to the same octave (e.g., C at 0 cents and C at 50 cents)
  const pitchClassMap = new Map<string, PitchClass>();

  for (const [ipnRef, pitchClasses] of maqamIpnMap.entries()) {
    if (pitchClasses.length > 1) {
      // Normalize cents to same octave (modulo 1200) for comparison
      // Handle negative values properly: ((x % 1200) + 1200) % 1200
      const normalizeCents = (cents: number): number => {
        const normalized = ((cents % 1200) + 1200) % 1200;
        // Round to 6 decimal places to handle floating point precision issues
        return Math.round(normalized * 1000000) / 1000000;
      };

      const firstCentsNormalized = normalizeCents(parseFloat(pitchClasses[0].cents));

      // Check if all pitch classes with this IPN reference have the same normalized cents value
      // Use exact equality after rounding to handle floating point precision
      const allSame = pitchClasses.every(
        (pc) => {
          const pcCentsNormalized = normalizeCents(parseFloat(pc.cents));
          return pcCentsNormalized === firstCentsNormalized;
        }
      );

      if (!allSame) {
        // Multiple pitch classes with same IPN reference but different values - incompatible
        return null;
      }
    }

    // Use the first pitch class for this IPN reference
    // (all have the same normalized cents value if we reached here)
    pitchClassMap.set(ipnRef, pitchClasses[0]);
  }

  // Extract IPN reference names in chromatic order
  const chromaticOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const ipnReferenceNames = chromaticOrder.filter(ipn => pitchClassMap.has(ipn));

  return {
    pitchClasses: pitchClassMap,
    ipnReferenceNames
  };
}

/**
 * Checks if a maqam transposition can be performed using only the pitch classes
 * in a maqam-based pitch class set.
 *
 * A maqam is compatible if:
 * 1. All IPN references from the maqam exist in the set (octave-equivalent)
 * 2. The actual pitch class values (cents) match within tolerance (normalized to same octave)
 *
 * @param maqamTransposition - The maqam transposition to check
 * @param pitchClassSet - The pitch class set to check against
 * @param centsTolerance - Tolerance for cents comparison (default: 5)
 * @returns true if compatible, false otherwise
 */
export function checkMaqamCompatibility(
  maqamTransposition: Maqam,
  pitchClassSet: MaqamPitchClassSet,
  centsTolerance: number = 5
): boolean {
  // Check all pitch classes from ascending sequence
  for (const maqamPitchClass of maqamTransposition.ascendingPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(maqamPitchClass);
    const setPitchClass = pitchClassSet.pitchClasses.get(ipnRef);

    if (!setPitchClass) {
      // IPN reference doesn't exist in set
      return false;
    }

    // Compare actual pitch class values (cents), normalized to same octave
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);

    // Normalize to same octave for comparison (octave-equivalent matching)
    const normalizeCents = (cents: number): number => {
      return ((cents % 1200) + 1200) % 1200;
    };

    const maqamCentsNormalized = normalizeCents(maqamCents);
    const setCentsNormalized = normalizeCents(setCents);

    // Check if they match within tolerance
    const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around (e.g., 1195 cents vs 5 cents)

    if (diffWrapped > centsTolerance) {
      // Pitch class values don't match
      return false;
    }
  }

  // Check all pitch classes from descending sequence
  for (const maqamPitchClass of maqamTransposition.descendingPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(maqamPitchClass);
    const setPitchClass = pitchClassSet.pitchClasses.get(ipnRef);

    if (!setPitchClass) {
      // IPN reference doesn't exist in set
      return false;
    }

    // Compare actual pitch class values (cents), normalized to same octave
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);

    // Normalize to same octave for comparison (octave-equivalent matching)
    const normalizeCents = (cents: number): number => {
      return ((cents % 1200) + 1200) % 1200;
    };

    const maqamCentsNormalized = normalizeCents(maqamCents);
    const setCentsNormalized = normalizeCents(setCents);

    // Check if they match within tolerance
    const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around

    if (diffWrapped > centsTolerance) {
      // Pitch class values don't match
      return false;
    }
  }

  return true;
}

/**
 * Compares two maqam pitch class sets for equality
 * Uses octave-normalized cents values with tolerance to determine if sets are identical
 *
 * @param set1 - First pitch class set
 * @param set2 - Second pitch class set
 * @param centsTolerance - Tolerance for cents comparison (default: 5)
 * @returns true if sets are equal, false otherwise
 */
export function arePitchClassSetsEqual(
  set1: MaqamPitchClassSet,
  set2: MaqamPitchClassSet,
  centsTolerance: number = 5
): boolean {
  // Sets must have same number of pitch classes
  if (set1.ipnReferenceNames.length !== set2.ipnReferenceNames.length) {
    return false;
  }

  // Check if all IPN references match
  const ipnSet1 = new Set(set1.ipnReferenceNames);
  const ipnSet2 = new Set(set2.ipnReferenceNames);

  if (ipnSet1.size !== ipnSet2.size) {
    return false;
  }

  for (const ipn of ipnSet1) {
    if (!ipnSet2.has(ipn)) {
      return false;
    }
  }

  // Check if all pitch class values match within tolerance
  for (const ipnRef of set1.ipnReferenceNames) {
    const pc1 = set1.pitchClasses.get(ipnRef);
    const pc2 = set2.pitchClasses.get(ipnRef);

    if (!pc1 || !pc2) {
      return false;
    }

    // Compare by cents value, normalized to same octave
    const cents1 = ((parseFloat(pc1.cents) % 1200) + 1200) % 1200;
    const cents2 = ((parseFloat(pc2.cents) % 1200) + 1200) % 1200;
    const diff = Math.abs(cents1 - cents2);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around

    if (diffWrapped > centsTolerance) {
      return false;
    }
  }

  return true;
}

/**
 * Main classification function that groups maqamat according to maqam-based pitch class sets.
 *
 * This function answers the question: "Which maqamat can be performed using only the
 * pitch classes of a single maqam?"
 *
 * Algorithm:
 * 1. Two-pass processing: tahlil (base) versions first, then transpositions
 * 2. For each unprocessed maqam transposition:
 *    a. Extract all unique pitch classes (ascending + descending, octave-equivalent)
 *    b. Create a maqam-based pitch class set
 *    c. Find all compatible maqamat (those whose pitch classes are a subset of this set)
 *    d. Mark all compatible maqamat as processed
 * 3. Continue until all maqamat are processed
 *
 * Key differences from 12-pitch-class-sets classification:
 * - No chromatic base merging (no al-Kindi filler)
 * - Variable set sizes (not fixed at 12 pitch classes)
 * - Uses octave-equivalent IPN matching (C in any octave = "C")
 * - Single tuning system (no need for al-Kindi fallback)
 *
 * @param maqamat - Array of all maqam data
 * @param tuningSystem - The tuning system to use for all maqamat
 * @param startingNote - The starting note for the tuning system
 * @param ajnas - Array of all ajnas data
 * @param centsTolerance - Tolerance for cents comparison (default: 5)
 * @returns ClassificationResult with sets and incompatible maqamat
 */
export function classifyMaqamatByMaqamPitchClassSets(
  maqamat: MaqamData[],
  tuningSystem: TuningSystem,
  startingNote: string,
  ajnas: any[],
  centsTolerance: number = 5
): ClassificationResult {
  const sets: ClassificationSet[] = [];
  const incompatibleMaqamat: IncompatibleMaqam[] = [];
  const processedMaqamat = new Set<string>(); // Track processed maqam/transposition combinations

  // Continue looping until all maqamat are processed
  let hasUnprocessed = true;
  let iterationCount = 0;
  const maxIterations = 1000; // Safety limit

  while (hasUnprocessed && iterationCount < maxIterations) {
    iterationCount++;
    hasUnprocessed = false;
    let foundNewSet = false;

    // IMPORTANT: Two-pass approach to prioritize tahlil versions globally
    // Pass 1: Process ALL tahlil (non-transposed) versions first
    // Pass 2: Process ALL transposed versions

    for (let pass = 1; pass <= 2; pass++) {
      const processingTahlil = (pass === 1);

      for (const maqamData of maqamat) {
        // Get all transpositions of this maqam
        const transpositions = getMaqamTranspositions(
          maqamData,
          tuningSystem,
          startingNote,
          ajnas
        );

        // Filter based on current pass
        const transpositionsToProcess = processingTahlil
          ? transpositions.filter(t => !t.transposition)  // Pass 1: Only tahlil
          : transpositions.filter(t => t.transposition);   // Pass 2: Only transpositions

        for (const transposition of transpositionsToProcess) {
          // Create unique key for this maqam/transposition combination
          const key = `${maqamData.getId()}_${transposition.name}`;

          // Skip if already processed
          if (processedMaqamat.has(key)) {
            continue;
          }

          // Found an unprocessed maqam
          hasUnprocessed = true;

          // Try to create maqam-based pitch class set from this transposition
          const pitchClassSet = createMaqamPitchClassSet(transposition);

          if (!pitchClassSet) {
            // Incompatible - duplicate IPN references with different cents values
            incompatibleMaqamat.push({
              maqam: maqamData,
              transposition: transposition,
              reason: "duplicate_ipn_reference"
            });
            processedMaqamat.add(key);
            continue;
          }

          // Check if this set already exists (compare by pitch class values)
          let existingSet: ClassificationSet | null = null;
          for (const set of sets) {
            if (arePitchClassSetsEqual(pitchClassSet, set.pitchClassSet, centsTolerance)) {
              existingSet = set;
              break;
            }
          }

          if (existingSet) {
            // Add this maqam to existing set if it's not already there
            const alreadyInSet = existingSet.compatibleMaqamat.some(
              (info) => info.maqamData.getId() === maqamData.getId() &&
                        info.maqam.name === transposition.name
            );

            if (!alreadyInSet) {
              existingSet.compatibleMaqamat.push({
                maqam: transposition,
                maqamData: maqamData,
                isCompatible: true
              });
            }
            processedMaqamat.add(key);
            foundNewSet = true;
          } else {
            // Create new set
            const compatibleMaqamat: MaqamTranspositionInfo[] = [];

            // Add source maqam first (it's always compatible since it created the set)
            compatibleMaqamat.push({
              maqam: transposition,
              maqamData: maqamData,
              isCompatible: true
            });

            // Check all other maqamat for compatibility with this set
            // Only check unprocessed maqamat to allow for finding multiple distinct sets
            for (const otherMaqamData of maqamat) {
              const otherTranspositions = getMaqamTranspositions(
                otherMaqamData,
                tuningSystem,
                startingNote,
                ajnas
              );

              for (const otherTransposition of otherTranspositions) {
                const otherKey = `${otherMaqamData.getId()}_${otherTransposition.name}`;

                // Skip if already processed or if it's the source maqam
                if (processedMaqamat.has(otherKey) || otherKey === key) {
                  continue;
                }

                if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
                  compatibleMaqamat.push({
                    maqam: otherTransposition,
                    maqamData: otherMaqamData,
                    isCompatible: true
                  });
                  // Mark as processed when added to this set
                  processedMaqamat.add(otherKey);
                }
              }
            }

            // Create set name from source maqam transposition
            const setId = `maqam_${maqamData.getIdName()}_set`;
            // Use the transposition name (which may include "maqām" prefix and transposition info)
            const setName = `${transposition.name} set`;

            sets.push({
              id: setId,
              name: setName,
              sourceMaqam: {
                id: maqamData.getId(),
                idName: maqamData.getIdName(),
                name: maqamData.getName()
              },
              sourceTransposition: transposition,
              pitchClassSet: pitchClassSet,
              compatibleMaqamat: compatibleMaqamat,
              pitchClassCount: pitchClassSet.ipnReferenceNames.length
            });

            // Mark source maqam as processed
            processedMaqamat.add(key);
            foundNewSet = true;
          }

          // If we found a new set, break and restart the loop to find the next set
          if (foundNewSet) {
            break;
          }
        }

        // If we found a new set, break from maqamData loop
        if (foundNewSet) {
          break;
        }
      }

      // If we found a new set, break from pass loop and restart iteration
      if (foundNewSet) {
        break;
      }
    }
  }

  return {
    sets,
    incompatibleMaqamat
  };
}
