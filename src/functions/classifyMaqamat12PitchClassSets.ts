import TuningSystem from "@/models/TuningSystem";
import MaqamData, { Maqam } from "@/models/Maqam";
import PitchClass from "@/models/PitchClass";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { getIpnReferenceNoteName } from "@/functions/getIpnReferenceNoteName";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";

/**
 * Represents a 12-pitch-class set created from al-Kindi base with replacements
 */
export interface PitchClassSet {
  /** Map of IPN reference note name (C, C#, D, etc.) to pitch class */
  pitchClasses: Map<string, PitchClass>;
  /** The 12 IPN reference note names in order */
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
  pitchClassSet: PitchClassSet;
  compatibleMaqamat: MaqamTranspositionInfo[];
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
 * Gets the 12 pitch classes from al-Kindi-(874) on ushayran
 * and maps them by IPN reference note name, preferring a specific octave range
 */
export function getAlKindi12PitchClasses(
  tuningSystem: TuningSystem,
  startingNote: string,
  preferredOctaveRange?: { min: number; max: number }
): PitchClassSet {
  const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
  
  // Get unique 12 pitch classes by IPN reference (one per chromatic position)
  const pitchClassMap = new Map<string, PitchClass>();
  const ipnReferenceNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  // Group pitch classes by IPN reference
  const ipnRefGroups = new Map<string, PitchClass[]>();
  for (const pitchClass of allPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    if (!ipnRefGroups.has(ipnRef)) {
      ipnRefGroups.set(ipnRef, []);
    }
    ipnRefGroups.get(ipnRef)!.push(pitchClass);
  }
  
  // For each IPN reference, select the best pitch class
  for (const [ipnRef, pitchClasses] of ipnRefGroups.entries()) {
    let selected: PitchClass;
    
    if (preferredOctaveRange) {
      // Prefer pitch classes from the preferred octave range
      const inRange = pitchClasses.filter(
        pc => pc.octave >= preferredOctaveRange.min && pc.octave <= preferredOctaveRange.max
      );
      
      if (inRange.length > 0) {
        // Sort by octave (ascending), then by cents (ascending)
        inRange.sort((a, b) => {
          if (a.octave !== b.octave) return a.octave - b.octave;
          return parseFloat(a.cents) - parseFloat(b.cents);
        });
        selected = inRange[0];
      } else {
        // Fall back to closest octave
        pitchClasses.sort((a, b) => {
          const aDist = Math.abs(a.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          const bDist = Math.abs(b.octave - (preferredOctaveRange.min + preferredOctaveRange.max) / 2);
          if (Math.abs(aDist - bDist) < 0.1) {
            // If same distance, prefer lower octave, then lower cents
            if (a.octave !== b.octave) return a.octave - b.octave;
            return parseFloat(a.cents) - parseFloat(b.cents);
          }
          return aDist - bDist;
        });
        selected = pitchClasses[0];
      }
    } else {
      // No preference - use first occurrence (lowest octave, then lowest cents)
      pitchClasses.sort((a, b) => {
        if (a.octave !== b.octave) return a.octave - b.octave;
        return parseFloat(a.cents) - parseFloat(b.cents);
      });
      selected = pitchClasses[0];
    }
    
    pitchClassMap.set(ipnRef, selected);
  }
  
  return {
    pitchClasses: pitchClassMap,
    ipnReferenceNames
  };
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
 * Creates a 12-pitch-class set suitable for MIDI keyboard tuning and Scala export.
 *
 * Merges pitch classes from the maqam transposition with al-Kindi filler pitch classes
 * based on matching IPN references. The resulting set is ordered chromatically starting
 * from the maqam's tonic.
 *
 * IMPORTANT: The alKindiTuningSystem must use the same starting note as the maqam's
 * tuning system to ensure octaves align correctly and pitch classes can be properly
 * selected from matching octaves to maintain ascending chromatic order.
 *
 * @param maqamTransposition - The maqam transposition to build the set from
 * @param alKindiTuningSystem - al-Kindi tuning system for filler pitch classes
 * @param alKindiStartingNote - Starting note for al-Kindi (must match maqam's starting note)
 * @returns PitchClassSet with 12 chromatically ordered pitch classes, or null if incompatible
 *
 * Returns null if the maqam has duplicate IPN references (same IPN appearing with different
 * pitch values), which makes it incompatible with 12-tone chromatic tuning.
 */
export function create12PitchClassSet(
  maqamTransposition: Maqam,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string
): PitchClassSet | null {
  // Apply sequential reference note logic to ensure consistent assignments
  // This is critical for symmetrical maqamat where the same pitch class appears in both sequences
  const ascendingNoteNames = maqamTransposition.ascendingPitchClasses.map(pc => pc.noteName);
  const descendingNoteNames = maqamTransposition.descendingPitchClasses.map(pc => pc.noteName);
  const isSymmetrical = ascendingNoteNames.length === descendingNoteNames.length &&
    ascendingNoteNames.every((name, i) => name === descendingNoteNames[descendingNoteNames.length - 1 - i]);
  
  // For symmetrical maqamat, pass all pitch classes to ensure consistent reference note assignments
  const allMaqamPitchClassesForSequential = isSymmetrical
    ? [...maqamTransposition.ascendingPitchClasses, ...maqamTransposition.descendingPitchClasses]
    : undefined;
  
  const ascendingWithSequentialRefs = renderPitchClassSpellings(
    maqamTransposition.ascendingPitchClasses,
    true,
    allMaqamPitchClassesForSequential
  );
  const descendingWithSequentialRefs = renderPitchClassSpellings(
    maqamTransposition.descendingPitchClasses,
    false,
    allMaqamPitchClassesForSequential
  );
  
  // Collect all pitch classes from ascending and descending sequences (now with consistent reference notes)
  const allMaqamPitchClasses = [
    ...ascendingWithSequentialRefs,
    ...descendingWithSequentialRefs
  ];
  
  // Determine the octave range of the maqam's pitch classes
  const maqamOctaves = allMaqamPitchClasses.map(pc => pc.octave);
  const minOctave = Math.min(...maqamOctaves);
  const maxOctave = Math.max(...maqamOctaves);
  
  // Get al-Kindi base pitch classes, preferring the same octave range as the maqam
  const alKindiBase = getAlKindi12PitchClasses(
    alKindiTuningSystem,
    alKindiStartingNote,
    { min: minOctave, max: maxOctave }
  );
  
  // Map IPN reference to pitch classes from maqam
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
  // (e.g., C at 0 cents in ascending and C at 50 cents in descending)
  for (const pitchClasses of maqamIpnMap.values()) {
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
  }
  
  // Create new set by replacing matching IPN references
  const newPitchClassMap = new Map<string, PitchClass>();
  
  // Start with al-Kindi base
  for (const [ipnRef, pitchClass] of alKindiBase.pitchClasses.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }
  
  // Replace with maqam pitch classes where IPN reference matches
  // Use ascending first, then descending for any IPN refs not in ascending
  // Use the pitch classes with sequential reference notes applied
  const ascendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of ascendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    // Only add if this IPN ref exists in al-Kindi base
    if (alKindiBase.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef)) {
      ascendingIpnMap.set(ipnRef, pitchClass);
    }
  }
  
  const descendingIpnMap = new Map<string, PitchClass>();
  for (const pitchClass of descendingWithSequentialRefs) {
    const ipnRef = getIpnReferenceNoteName(pitchClass);
    // Only add if this IPN ref exists in al-Kindi base and not already in ascending
    if (alKindiBase.pitchClasses.has(ipnRef) && !ascendingIpnMap.has(ipnRef) && !descendingIpnMap.has(ipnRef)) {
      descendingIpnMap.set(ipnRef, pitchClass);
    }
  }
  
  // Replace: ascending takes priority, then descending
  for (const [ipnRef, pitchClass] of ascendingIpnMap.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }

  for (const [ipnRef, pitchClass] of descendingIpnMap.entries()) {
    newPitchClassMap.set(ipnRef, pitchClass);
  }

  // Adjust octaves to ensure chromatic ascending order from the tuning system
  // Get all pitch classes from al-Kindi tuning system to have octave options
  const allAlKindiPitchClasses = getTuningSystemPitchClasses(alKindiTuningSystem, alKindiStartingNote);
  const alKindiByIpn = new Map<string, PitchClass[]>();

  for (const pc of allAlKindiPitchClasses) {
    const ipnRef = getIpnReferenceNoteName(pc);
    if (!alKindiByIpn.has(ipnRef)) {
      alKindiByIpn.set(ipnRef, []);
    }
    alKindiByIpn.get(ipnRef)!.push(pc);
  }

  // Also group maqam pitch classes by IPN for consideration in octave selection
  const maqamByIpn = new Map<string, PitchClass[]>();
  for (const pc of [...ascendingWithSequentialRefs, ...descendingWithSequentialRefs]) {
    const ipnRef = getIpnReferenceNoteName(pc);
    if (!maqamByIpn.has(ipnRef)) {
      maqamByIpn.set(ipnRef, []);
    }
    maqamByIpn.get(ipnRef)!.push(pc);
  }

  // Find tonic (first pitch class from maqam's ascending sequence)
  // Use the actual pitch class with its actual octave and cents (including qarār positions with negative cents)
  const tonicPitchClass = ascendingWithSequentialRefs.length > 0
    ? ascendingWithSequentialRefs[0]
    : null;

  if (!tonicPitchClass) {
    return {
      pitchClasses: newPitchClassMap,
      ipnReferenceNames: alKindiBase.ipnReferenceNames
    };
  }

  const tonicIpnRef = getIpnReferenceNoteName(tonicPitchClass);
  const tonicCents = parseFloat(tonicPitchClass.cents);

  // Reorder chromatic sequence starting from tonic
  const chromaticOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const tonicIndex = chromaticOrder.indexOf(tonicIpnRef);
  const reorderedChromatic = [...chromaticOrder.slice(tonicIndex), ...chromaticOrder.slice(0, tonicIndex)];

  // Rebuild map with pitch classes from correct octaves for chromatic ascending order
  // Start with the tonic's actual cents (may be negative for qarār octaves)
  const finalPitchClassMap = new Map<string, PitchClass>();
  let previousCents = tonicCents - 0.01;

  for (let i = 0; i < reorderedChromatic.length; i++) {
    const ipnRef = reorderedChromatic[i];

    // For the first position (tonic), use the actual tonic pitch class from the maqam
    if (i === 0) {
      finalPitchClassMap.set(ipnRef, tonicPitchClass);
      previousCents = tonicCents;
      continue;
    }

    // For subsequent positions, prioritize maqam values over al-Kindi fillers
    // First try maqam candidates that satisfy ascending order requirement
    let selectedPitchClass: PitchClass | null = null;

    // Priority 1: Try maqam pitch classes first (if available)
    if (maqamByIpn.has(ipnRef)) {
      const maqamCandidates = maqamByIpn.get(ipnRef)!;
      const validMaqamCandidates = maqamCandidates
        .filter(pc => parseFloat(pc.cents) > previousCents)
        .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
      
      if (validMaqamCandidates.length > 0) {
        // Use the lowest maqam candidate that maintains ascending order
        selectedPitchClass = validMaqamCandidates[0];
      }
    }

    // Priority 2: Fall back to al-Kindi if no maqam candidate satisfies the requirement
    if (!selectedPitchClass && alKindiByIpn.has(ipnRef)) {
      const alKindiCandidates = alKindiByIpn.get(ipnRef)!;
      const validAlKindiCandidates = alKindiCandidates
        .filter(pc => parseFloat(pc.cents) > previousCents)
        .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents));
      
      if (validAlKindiCandidates.length > 0) {
        selectedPitchClass = validAlKindiCandidates[0];
      } else {
        // Last resort: use lowest al-Kindi candidate even if it doesn't maintain strict ascending order
        // (shouldn't happen with full tuning system coverage, but handle gracefully)
        const fallback = alKindiCandidates
          .sort((a, b) => parseFloat(a.cents) - parseFloat(b.cents))[0];
        selectedPitchClass = fallback;
      }
    }

    if (selectedPitchClass) {
      finalPitchClassMap.set(ipnRef, selectedPitchClass);
      previousCents = parseFloat(selectedPitchClass.cents);
    }
    // If no candidate found at all, skip this IPN reference (shouldn't happen)
  }

  return {
    pitchClasses: finalPitchClassMap,
    ipnReferenceNames: alKindiBase.ipnReferenceNames
  };
}

/**
 * Checks if a maqam transposition can be performed in a 12-pitch-class set
 * by verifying all notes in both ascending and descending sequences match the pitch classes in the set
 * 
 * A maqam is compatible if:
 * 1. All IPN references from the maqam exist in the set
 * 2. The actual pitch class values (cents) match within tolerance
 */
export function checkMaqamCompatibility(
  maqamTransposition: Maqam,
  pitchClassSet: PitchClassSet,
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
    
    // Compare actual pitch class values (cents)
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);
    
    // Normalize to same octave for comparison (cents are relative, so we compare modulo 1200)
    const maqamCentsNormalized = maqamCents % 1200;
    const setCentsNormalized = setCents % 1200;
    
    // Check if they match within tolerance
    const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
    
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
    
    // Compare actual pitch class values (cents)
    const maqamCents = parseFloat(maqamPitchClass.cents);
    const setCents = parseFloat(setPitchClass.cents);
    
    // Normalize to same octave for comparison (cents are relative, so we compare modulo 1200)
    const maqamCentsNormalized = maqamCents % 1200;
    const setCentsNormalized = setCents % 1200;
    
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
 * Main classification function that groups maqamat according to 12-pitch-class sets
 * 
 * The algorithm:
 * 1. Loops through all maqamat and their transpositions
 * 2. For each unprocessed maqam/transposition, creates a 12-pitch-class set
 * 3. Finds all compatible maqamat for that set (only from unprocessed ones)
 * 4. Marks all maqamat in that set as processed
 * 5. Continues to find the next set from remaining unprocessed maqamat
 * 6. Repeats until all maqamat are processed
 */
export function classifyMaqamat(
  maqamat: MaqamData[],
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
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
          cairoTuningSystem,
          cairoStartingNote,
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
        
        // Try to create 12-pitch-class set from this transposition
        const pitchClassSet = create12PitchClassSet(
          transposition,
          alKindiTuningSystem,
          alKindiStartingNote
        );
        
        if (!pitchClassSet) {
          // Incompatible - duplicate IPN references
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
              cairoTuningSystem,
              cairoStartingNote,
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
            compatibleMaqamat: compatibleMaqamat
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

/**
 * Creates a single 12-pitch-class set from a specific maqam
 *
 * This function:
 * 1. Finds a transposition of the specified maqam that creates a complete 12-pitch-class set
 * 2. Finds all compatible maqāmāt for that set
 * 3. Returns a single ClassificationSet with the specified maqam as the source
 *
 * @param sourceMaqamData - The maqam to create the set from
 * @param allMaqamat - All maqamat to check for compatibility
 * @param cairoTuningSystem - The tuning system for maqamat
 * @param cairoStartingNote - The starting note for the tuning system
 * @param alKindiTuningSystem - The al-Kindi tuning system for filler pitches
 * @param alKindiStartingNote - The starting note for al-Kindi (should match cairoStartingNote)
 * @param ajnas - All ajnas data
 * @param centsTolerance - Tolerance for cents comparison (default: 5)
 * @returns A ClassificationSet or null if no complete set can be created
 */
export function createSetFromMaqam(
  sourceMaqamData: MaqamData,
  allMaqamat: MaqamData[],
  cairoTuningSystem: TuningSystem,
  cairoStartingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  ajnas: any[],
  centsTolerance: number = 5
): ClassificationSet | null {
  // Get all transpositions of the source maqam
  const transpositions = getMaqamTranspositions(
    sourceMaqamData,
    cairoTuningSystem,
    cairoStartingNote,
    ajnas
  );

  // Find a transposition that creates a complete 12-pitch-class set
  let sourceMaqam: Maqam | null = null;
  let pitchClassSet: PitchClassSet | null = null;

  for (const transposition of transpositions) {
    const testSet = create12PitchClassSet(
      transposition,
      alKindiTuningSystem,
      alKindiStartingNote
    );

    // Check if this transposition creates a complete 12-pitch-class set
    if (testSet && testSet.pitchClasses.size === 12) {
      sourceMaqam = transposition;
      pitchClassSet = testSet;
      break;
    }
  }

  if (!sourceMaqam || !pitchClassSet) {
    return null; // No transposition creates a complete 12-pitch-class set
  }

  // Find all compatible maqāmāt
  const compatibleMaqamat: MaqamTranspositionInfo[] = [];

  // Add source maqam first (it's always compatible since it created the set)
  compatibleMaqamat.push({
    maqam: sourceMaqam,
    maqamData: sourceMaqamData,
    isCompatible: true
  });

  // Check all other maqamat for compatibility with this set
  for (const otherMaqamData of allMaqamat) {
    // Skip the source maqam (already added)
    if (otherMaqamData.getId() === sourceMaqamData.getId()) {
      // But check if other transpositions of the source maqam are compatible
      const otherTranspositions = getMaqamTranspositions(
        otherMaqamData,
        cairoTuningSystem,
        cairoStartingNote,
        ajnas
      );

      for (const otherTransposition of otherTranspositions) {
        // Skip the source transposition itself
        if (otherTransposition.name === sourceMaqam.name) {
          continue;
        }

        if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
          compatibleMaqamat.push({
            maqam: otherTransposition,
            maqamData: otherMaqamData,
            isCompatible: true
          });
        }
      }
    } else {
      // Check all transpositions of other maqamat
      const otherTranspositions = getMaqamTranspositions(
        otherMaqamData,
        cairoTuningSystem,
        cairoStartingNote,
        ajnas
      );

      for (const otherTransposition of otherTranspositions) {
        if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
          compatibleMaqamat.push({
            maqam: otherTransposition,
            maqamData: otherMaqamData,
            isCompatible: true
          });
        }
      }
    }
  }

  // Create set name from source maqam
  const setId = `maqam_${sourceMaqamData.getIdName()}_set`;
  const setName = `${sourceMaqam.name} set`;

  return {
    id: setId,
    name: setName,
    sourceMaqam: {
      id: sourceMaqamData.getId(),
      idName: sourceMaqamData.getIdName(),
      name: sourceMaqamData.getName()
    },
    sourceTransposition: sourceMaqam,
    pitchClassSet: pitchClassSet,
    compatibleMaqamat: compatibleMaqamat
  };
}

/**
 * Compares two pitch class sets for equality
 * Uses the same tolerance as compatibility check to ensure consistency
 */
function arePitchClassSetsEqual(set1: PitchClassSet, set2: PitchClassSet, centsTolerance: number = 5): boolean {
  if (set1.ipnReferenceNames.length !== set2.ipnReferenceNames.length) {
    return false;
  }
  
  for (const ipnRef of set1.ipnReferenceNames) {
    const pc1 = set1.pitchClasses.get(ipnRef);
    const pc2 = set2.pitchClasses.get(ipnRef);
    
    if (!pc1 || !pc2) {
      return false;
    }
    
    // Compare by cents value, normalized to same octave
    const cents1 = parseFloat(pc1.cents) % 1200;
    const cents2 = parseFloat(pc2.cents) % 1200;
    const diff = Math.abs(cents1 - cents2);
    const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
    
    if (diffWrapped > centsTolerance) {
      return false;
    }
  }
  
  return true;
}

