#!/usr/bin/env node
/**
 * Generate Modulations Script
 *
 * Pre-computes all modulation relationships for each tuning system and stores
 * them as static JSON files in data/modulations/.
 *
 * This script generates:
 * - Maqam-to-maqam modulations
 * - Maqam-to-jins modulations
 * - Lower octave (8vb) variants for both
 *
 * Usage: npm run generate:modulations
 */

import fs from 'fs';
import path from 'path';
import { getTuningSystems, getMaqamat, getAjnas } from '@/functions/import';
import getTuningSystemPitchClasses from '@/functions/getTuningSystemPitchClasses';
import { calculateMaqamTranspositions } from '@/functions/transpose';
import modulate from '@/functions/modulate';
import { shiftMaqamByOctaves, Maqam } from '@/models/Maqam';
import { shiftJinsByOctaves, Jins } from '@/models/Jins';
import { standardizeText } from '@/functions/export';
import type { MaqamatModulations } from '@/models/Maqam';
import type { AjnasModulations } from '@/models/Jins';
import type PitchClass from '@/models/PitchClass';

// Type definitions for serialized output
interface SerializedMaqam {
  maqamId: string;
  maqamIdName: string;
  maqamDisplayName: string;
  tonicIdName: string;
  tonicDisplayName: string;
  isTransposition: boolean;
}

interface SerializedJins {
  jinsId: string;
  jinsIdName: string;
  jinsDisplayName: string;
  tonicIdName: string;
  tonicDisplayName: string;
}

interface SerializedModulations {
  firstDegree: (SerializedMaqam | SerializedJins)[];
  thirdDegree: (SerializedMaqam | SerializedJins)[];
  altThirdDegree: (SerializedMaqam | SerializedJins)[];
  fourthDegree: (SerializedMaqam | SerializedJins)[];
  fifthDegree: (SerializedMaqam | SerializedJins)[];
  sixthDegreeAsc: (SerializedMaqam | SerializedJins)[];
  sixthDegreeDesc: (SerializedMaqam | SerializedJins)[];
  sixthDegreeIfNoThird: (SerializedMaqam | SerializedJins)[];
  noteName2pBelowThird: string;
}

interface MaqamModulationEntry {
  maqamId: string;
  maqamIdName: string;
  maqamDisplayName: string;
  tonicIdName: string;
  tonicDisplayName: string;
  isTransposition: boolean;
  maqamatModulations: SerializedModulations;
  ajnasModulations: SerializedModulations;
  lowerOctaveModulations: {
    maqamatModulations: SerializedModulations;
    ajnasModulations: SerializedModulations;
  };
}

interface StartingNoteData {
  startingNoteIdName: string;
  startingNoteDisplayName: string;
  maqamatModulations: MaqamModulationEntry[];
}

interface ModulationDataFile {
  id: string;
  version: string;
  sourceVersions: {
    maqamat: string;
    ajnas: string;
    tuningSystems: string;
  };
  modulationData: StartingNoteData[];
}

/**
 * Serialize a Maqam or Jins object to plain JSON
 */
function serializeMaqamOrJins(item: Maqam | Jins): SerializedMaqam | SerializedJins {
  if ('ascendingPitchClasses' in item) {
    // This is a Maqam
    return {
      maqamId: item.maqamId,
      maqamIdName: standardizeText(item.name),
      maqamDisplayName: item.name,
      tonicIdName: standardizeText(item.ascendingPitchClasses[0].noteName),
      tonicDisplayName: item.ascendingPitchClasses[0].noteName,
      isTransposition: item.transposition,
    };
  } else {
    // This is a Jins
    return {
      jinsId: item.jinsId,
      jinsIdName: standardizeText(item.name),
      jinsDisplayName: item.name,
      tonicIdName: standardizeText(item.jinsPitchClasses[0].noteName),
      tonicDisplayName: item.jinsPitchClasses[0].noteName,
    };
  }
}

/**
 * Serialize modulations object to plain JSON structure
 */
function serializeModulations(
  modulations: MaqamatModulations | AjnasModulations
): SerializedModulations {
  return {
    firstDegree: modulations.modulationsOnFirstDegree.map(serializeMaqamOrJins),
    thirdDegree: modulations.modulationsOnThirdDegree.map(serializeMaqamOrJins),
    altThirdDegree: modulations.modulationsOnAltThirdDegree.map(serializeMaqamOrJins),
    fourthDegree: modulations.modulationsOnFourthDegree.map(serializeMaqamOrJins),
    fifthDegree: modulations.modulationsOnFifthDegree.map(serializeMaqamOrJins),
    sixthDegreeAsc: modulations.modulationsOnSixthDegreeAsc.map(serializeMaqamOrJins),
    sixthDegreeDesc: modulations.modulationsOnSixthDegreeDesc.map(serializeMaqamOrJins),
    sixthDegreeIfNoThird: modulations.modulationsOnSixthDegreeIfNoThird.map(serializeMaqamOrJins),
    noteName2pBelowThird: modulations.noteName2pBelowThird,
  };
}

/**
 * Shift all modulations by octave offset
 * Based on modulations.tsx lines 51-74
 */
function shiftAllMaqamatModulations(
  pitchClasses: PitchClass[],
  modulations: MaqamatModulations,
  octaveShift: number
): MaqamatModulations {
  return {
    modulationsOnFirstDegree: modulations.modulationsOnFirstDegree
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnThirdDegree: modulations.modulationsOnThirdDegree
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnAltThirdDegree: modulations.modulationsOnAltThirdDegree
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnFourthDegree: modulations.modulationsOnFourthDegree
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnFifthDegree: modulations.modulationsOnFifthDegree
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnSixthDegreeAsc: modulations.modulationsOnSixthDegreeAsc
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnSixthDegreeDesc: modulations.modulationsOnSixthDegreeDesc
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    modulationsOnSixthDegreeIfNoThird: modulations.modulationsOnSixthDegreeIfNoThird
      .map((maqam) => shiftMaqamByOctaves(pitchClasses, maqam, octaveShift))
      .filter((maqam): maqam is Maqam => maqam !== null),
    noteName2pBelowThird: modulations.noteName2pBelowThird,
  };
}

/**
 * Shift all ajnas modulations by octave offset
 * Based on modulations.tsx lines 51-74
 */
function shiftAllAjnasModulations(
  pitchClasses: PitchClass[],
  modulations: AjnasModulations,
  octaveShift: number
): AjnasModulations {
  return {
    modulationsOnFirstDegree: modulations.modulationsOnFirstDegree
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnThirdDegree: modulations.modulationsOnThirdDegree
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnAltThirdDegree: modulations.modulationsOnAltThirdDegree
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnFourthDegree: modulations.modulationsOnFourthDegree
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnFifthDegree: modulations.modulationsOnFifthDegree
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnSixthDegreeAsc: modulations.modulationsOnSixthDegreeAsc
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnSixthDegreeDesc: modulations.modulationsOnSixthDegreeDesc
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    modulationsOnSixthDegreeIfNoThird: modulations.modulationsOnSixthDegreeIfNoThird
      .map((jins) => shiftJinsByOctaves(pitchClasses, jins, octaveShift))
      .filter((jins): jins is Jins => jins !== null),
    noteName2pBelowThird: modulations.noteName2pBelowThird,
  };
}

/**
 * Generate modulation data for a single tuning system
 */
function generateModulationsForTuningSystem(
  tuningSystem: any,
  maqamatData: any[],
  ajnasData: any[],
  tolerance: number = 5
): ModulationDataFile {
  console.log(`\nProcessing tuning system: ${tuningSystem.getId()}`);

  const outputFile: ModulationDataFile = {
    id: tuningSystem.getId(),
    version: new Date().toISOString(),
    sourceVersions: {
      maqamat: '2025-10-18T19:41:17.132Z',
      ajnas: '2025-10-18T19:34:26.343Z',
      tuningSystems: '2025-10-18T00:00:00.000Z',
    },
    modulationData: [],
  };

  // Get all starting notes for this tuning system
  // Each note name set has a different starting note (first note in the set)
  const startingNotes = tuningSystem.getNoteNameSets().map((set: any) => set[0]);
  console.log(`  Starting notes: ${startingNotes.length}`);

  for (const startingNote of startingNotes) {
    console.log(`    Processing starting note: ${startingNote}`);

    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

    const startingNoteData: StartingNoteData = {
      startingNoteIdName: standardizeText(startingNote),
      startingNoteDisplayName: startingNote,
      maqamatModulations: [],
    };

    let maqamCount = 0;
    let processedMaqams = 0;

    for (const maqamData of maqamatData) {
      processedMaqams++;
      if (processedMaqams % 10 === 0) {
        console.log(`      Progress: ${processedMaqams}/${maqamatData.length} maqāmāt checked...`);
      }

      // Check if maqam is possible in this tuning system
      const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
      const isAvailable = shiftedSets.some((set: any) =>
        maqamData.isMaqamPossible(set)
      );

      if (!isAvailable) continue;

      // Calculate transpositions
      const transpositions = calculateMaqamTranspositions(
        pitchClasses,
        ajnasData,
        maqamData,
        true, // withTahlil
        tolerance
      );

      console.log(`        Found ${transpositions.length} transpositions for ${maqamData.getName()}`);

      for (const transposition of transpositions) {
        // Calculate standard modulations
        const ajnasMods = modulate(
          pitchClasses,
          ajnasData,
          maqamatData,
          transposition,
          true // ajnas mode
        ) as AjnasModulations;

        const maqamatMods = modulate(
          pitchClasses,
          ajnasData,
          maqamatData,
          transposition,
          false // maqamat mode
        ) as MaqamatModulations;

        // Calculate lower octave modulations (shifted -1 octave)
        const lowerOctaveMaqamatMods = shiftAllMaqamatModulations(
          pitchClasses,
          maqamatMods,
          -1
        );

        const lowerOctaveAjnasMods = shiftAllAjnasModulations(
          pitchClasses,
          ajnasMods,
          -1
        );

        // Create entry for this transposition
        const maqamEntry: MaqamModulationEntry = {
          maqamId: transposition.maqamId,
          maqamIdName: standardizeText(transposition.name),
          maqamDisplayName: transposition.name,
          tonicIdName: standardizeText(transposition.ascendingPitchClasses[0].noteName),
          tonicDisplayName: transposition.ascendingPitchClasses[0].noteName,
          isTransposition: transposition.transposition,
          maqamatModulations: serializeModulations(maqamatMods),
          ajnasModulations: serializeModulations(ajnasMods),
          lowerOctaveModulations: {
            maqamatModulations: serializeModulations(lowerOctaveMaqamatMods),
            ajnasModulations: serializeModulations(lowerOctaveAjnasMods),
          },
        };

        startingNoteData.maqamatModulations.push(maqamEntry);
        maqamCount++;
      }
    }

    console.log(`      Generated ${maqamCount} maqam transpositions`);
    outputFile.modulationData.push(startingNoteData);
  }

  return outputFile;
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Generate Modulations Script ===\n');

  // Load data
  console.log('Loading data...');
  const tuningSystems = getTuningSystems();
  const maqamatData = getMaqamat();
  const ajnasData = getAjnas();

  console.log(`Loaded:`);
  console.log(`  - ${tuningSystems.length} tuning systems`);
  console.log(`  - ${maqamatData.length} maqamat`);
  console.log(`  - ${ajnasData.length} ajnas`);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'data', 'modulations');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`\nCreated output directory: ${outputDir}`);
  }

  // Generate for all tuning systems
  console.log('\nGenerating modulation data...');
  let successCount = 0;
  let errorCount = 0;

  // Process all tuning systems (or filter for testing)
  // For testing: use tuningSystems.slice(0, 1) or tuningSystems.filter(ts => ts.getId() === 'al-sabbagh-(1954)')
  // For production: use tuningSystems
  const systemsToProcess = tuningSystems;
  console.log(`Processing ${systemsToProcess.length} tuning system(s)...\n`);

  for (const tuningSystem of systemsToProcess) {
    try {
      const modulationData = generateModulationsForTuningSystem(
        tuningSystem,
        maqamatData,
        ajnasData,
        5 // centsTolerance
      );

      // Write to file with "-modulations" suffix for clarity
      const outputPath = path.join(outputDir, `${tuningSystem.getId()}-modulations.json`);
      fs.writeFileSync(
        outputPath,
        JSON.stringify(modulationData, null, 2),
        'utf-8'
      );

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log(`  ✓ Wrote ${outputPath} (${fileSizeKB} KB)`);
      successCount++;
    } catch (error) {
      console.error(`  ✗ Error processing ${tuningSystem.getId()}:`, error);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Successfully generated: ${successCount} files`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nOutput directory: ${outputDir}`);
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
