
import { getTuningSystems } from '@/functions/import';
import { exportTuningSystem, ExportOptions } from '@/functions/export';
import NoteName from '@/models/NoteName';
import * as fs from 'fs';
import * as path from 'path';

interface CLIOptions {
  help: boolean;
  listTuningSystems: boolean;
  tuningSystem: string | null;
  startingNote: string | null;
  includeAjnasDetails: boolean;
  includeMaqamatDetails: boolean;
  includeMaqamatModulations: boolean;
  includeAjnasModulations: boolean;
  includeModulations8vb: boolean;
  outputDir: string;
}

function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    help: false,
    listTuningSystems: false,
    tuningSystem: null,
    startingNote: null,
    includeAjnasDetails: false,
    includeMaqamatDetails: false,
    includeMaqamatModulations: false,
    includeAjnasModulations: false,
    includeModulations8vb: false,
    outputDir: './exports'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--list-tuning-systems':
        options.listTuningSystems = true;
        break;
      case '--tuning-system':
      case '-t':
        options.tuningSystem = nextArg;
        i++;
        break;
      case '--starting-note':
      case '-s':
        options.startingNote = nextArg;
        i++;
        break;
      case '--include-ajnas-details':
        options.includeAjnasDetails = true;
        break;
      case '--no-ajnas-details':
        options.includeAjnasDetails = false;
        break;
      case '--include-maqamat-details':
        options.includeMaqamatDetails = true;
        break;
      case '--no-maqamat-details':
        options.includeMaqamatDetails = false;
        break;
      case '--include-maqamat-modulations':
        options.includeMaqamatModulations = true;
        break;
      case '--no-maqamat-modulations':
        options.includeMaqamatModulations = false;
        break;
      case '--include-ajnas-modulations':
        options.includeAjnasModulations = true;
        break;
      case '--no-ajnas-modulations':
        options.includeAjnasModulations = false;
        break;
      case '--include-modulations-8vb':
        options.includeModulations8vb = true;
        break;
      case '--no-modulations-8vb':
        options.includeModulations8vb = false;
        break;
      case '--output-dir':
      case '-o':
        options.outputDir = nextArg;
        i++;
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
Digital Arabic Maqām Archive - Proper Batch Export CLI

Usage:
  node scripts/batch-export/batch-export.js [options]

Options:
  --help, -h                    Show this help message
  --list-tuning-systems         List all available tuning systems and their starting notes
  --tuning-system, -t <id>      Tuning system ID (use 'all' for all systems)
  --starting-note, -s <note>    Starting note name (use 'all' for all available notes)
  --output-dir, -o <dir>        Output directory (default: ./exports)

Export Options (mirrors export modal exactly):
  --include-ajnas-details       Include ajnas details (default: true)
  --no-ajnas-details           Exclude ajnas details
  --include-maqamat-details     Include maqamat details (default: true)
  --no-maqamat-details         Exclude maqamat details
  --include-maqamat-modulations Include maqamat modulations (default: false)
  --no-maqamat-modulations     Exclude maqamat modulations
  --include-ajnas-modulations   Include ajnas modulations (default: false)
  --no-ajnas-modulations       Exclude ajnas modulations
  --include-modulations-8vb     Include lower octave modulations (default: false)
  --no-modulations-8vb         Exclude lower octave modulations

Examples:
  # List all available tuning systems
  node scripts/batch-export/batch-export.js --list-tuning-systems

  # Export specific tuning system with specific starting note (full data)
  node scripts/batch-export/batch-export.js --tuning-system "Al-Farabi-(950g)" --starting-note "yegāh"

  # Export all tuning systems with all their starting notes
  node scripts/batch-export/batch-export.js --tuning-system "all" --starting-note "all"

  # Export with modulations included (like advanced export modal options)
  node scripts/batch-export/batch-export.js --tuning-system "Al-Farabi-(950g)" --starting-note "yegāh" --include-maqamat-modulations --include-ajnas-modulations
`);
}

async function main(): Promise<void> {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  try {
    // Load tuning systems using the proper import function
    const tuningSystems = getTuningSystems();

    if (options.listTuningSystems) {
      console.log('Available Tuning Systems:');
      console.log('========================\n');

      tuningSystems.forEach(ts => {
        console.log(`ID: ${ts.getId()}`);
        console.log(`Title (EN): ${ts.getTitleEnglish()}`);
        console.log(`Title (AR): ${ts.getTitleArabic()}`);
        console.log(`Creator: ${ts.getCreatorEnglish()}`);
        console.log(`Year: ${ts.getYear()}`);
        console.log(`Starting Notes: ${ts.getNoteNameSets().map(set => set[0]).join(', ')}`);
        console.log('---');
      });
      return;
    }

    if (!options.tuningSystem || !options.startingNote) {
      console.error('Error: Both --tuning-system and --starting-note are required.');
      console.log('Use --help for usage information.');
      process.exit(1);
    }

    // Create output directory - use batch subfolder for "all" exports
    let actualOutputDir = options.outputDir;
    if (options.tuningSystem === 'all') {
      const timestamp = new Date().toISOString().split('T')[0];
      actualOutputDir = path.join(options.outputDir, `batch_all_systems_${timestamp}`);
    }

    if (!fs.existsSync(actualOutputDir)) {
      fs.mkdirSync(actualOutputDir, { recursive: true });
    }

    options.outputDir = actualOutputDir;

    const exportOptions: ExportOptions = {
      includeTuningSystemDetails: true,
      includePitchClasses: true,
      includeAjnasDetails: options.includeAjnasDetails,
      includeMaqamatDetails: options.includeMaqamatDetails,
      includeMaqamatModulations: options.includeMaqamatModulations,
      includeAjnasModulations: options.includeAjnasModulations,
      includeModulations8vb: options.includeModulations8vb,
      progressCallback: (percentage: number, step: string) => {
        process.stdout.write(`\r${step} (${Math.round(percentage)}%)`);
      }
    };

    let tuningSystemsToProcess = [];

    if (options.tuningSystem === 'all') {
      tuningSystemsToProcess = tuningSystems;
    } else {
      // Normalize input for flexible matching
      const normalizeForMatching = (str: string): string => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[āīūḥṣṭḍẓʿʾ]/g, (match: string) => { // Arabic transliteration
            const map: Record<string, string> = {'ā':'a','ī':'i','ū':'u','ḥ':'h','ṣ':'s','ṭ':'t','ḍ':'d','ẓ':'z','ʿ':'','ʾ':''};
            return map[match] || match;
          })
          .toLowerCase();
      };

      const normalizedInput = normalizeForMatching(options.tuningSystem);

      const selectedSystem = tuningSystems.find(ts => {
        const normalizedId = normalizeForMatching(ts.getId());
        return normalizedId === normalizedInput || ts.getId() === options.tuningSystem;
      });

      if (!selectedSystem) {
        console.error(`Error: Tuning system "${options.tuningSystem}" not found.`);
        console.log('Use --list-tuning-systems to see available options.');
        process.exit(1);
      }
      tuningSystemsToProcess = [selectedSystem];
    }

    let totalExports = 0;
    let completedExports = 0;

    // Calculate total exports
    for (const ts of tuningSystemsToProcess) {
      if (options.startingNote === 'all') {
        totalExports += ts.getNoteNameSets().length;
      } else {
        totalExports += 1;
      }
    }

    console.log(`Starting batch export of ${totalExports} configurations...`);
    console.log(`Output directory: ${path.resolve(options.outputDir)}`);
    console.log(`Systems to process: ${tuningSystemsToProcess.length}`);
    console.log(`Mode: ${options.tuningSystem === 'all' ? 'BATCH (all systems)' : 'SINGLE SYSTEM'}`);
    if (options.includeMaqamatModulations || options.includeAjnasModulations) {
      console.log('⚠️  Modulations enabled - this will take significantly longer');
    }
    console.log('\n' + '='.repeat(60));

    let systemIndex = 0;
    for (const tuningSystem of tuningSystemsToProcess) {
      systemIndex++;

      console.log(`\n[${systemIndex}/${tuningSystemsToProcess.length}] Processing: ${tuningSystem.getId()}`);
      console.log(`Title: ${tuningSystem.getTitleEnglish()}`);
      console.log('-'.repeat(50));
      let startingNotesToProcess: NoteName[] = [];

      if (options.startingNote === 'all') {
        startingNotesToProcess = tuningSystem.getNoteNameSets().map(set => set[0]);
      } else {
        const availableStartingNotes = tuningSystem.getNoteNameSets().map(set => set[0]);
        if (!availableStartingNotes.includes(options.startingNote as NoteName)) {
          console.error(`\nError: Starting note "${options.startingNote}" not available for tuning system "${tuningSystem.getId()}".`);
          console.log(`Available starting notes: ${availableStartingNotes.join(', ')}`);
          continue;
        }
        startingNotesToProcess = [options.startingNote as NoteName];
      }

      let noteIndex = 0;
      for (const startingNote of startingNotesToProcess) {
        noteIndex++;
        const overallProgress = `(${completedExports + 1}/${totalExports})`;
        const systemProgress = startingNotesToProcess.length > 1 ? ` [${noteIndex}/${startingNotesToProcess.length}]` : '';

        console.log(`\n  ${overallProgress}${systemProgress} → ${startingNote}`);

        try {
          // Use the ACTUAL exportTuningSystem function from the export modal
          const exportData = await exportTuningSystem(
            tuningSystem,
            startingNote,
            exportOptions
          );

          // Generate filename matching export modal pattern
          // Strip diacritics and normalize characters for safe filenames
          const stripDiacritics = (str: string): string => {
            return str
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
              .replace(/[āīūḥṣṭḍẓʿʾ]/g, (match: string) => { // Arabic transliteration
                const map: Record<string, string> = {'ā':'a','ī':'i','ū':'u','ḥ':'h','ṣ':'s','ṭ':'t','ḍ':'d','ẓ':'z','ʿ':'','ʾ':''};
                return map[match] || match;
              })
              .replace(/[^a-zA-Z0-9\-_()]/g, '_') // Replace remaining non-standard chars
              .replace(/_{2,}/g, '_') // Replace multiple underscores with single
              .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
          };

          const safeSystemId = stripDiacritics(tuningSystem.getId());
          const safeStartingNote = stripDiacritics(startingNote);
          const timestamp = new Date().toISOString().split('T')[0];

          let filename = `${safeSystemId}_${safeStartingNote}_${timestamp}`;

          // Add options to filename for clarity
          const optionFlags = [];
          if (exportOptions.includeAjnasDetails) optionFlags.push('ajnas');
          if (exportOptions.includeMaqamatDetails) optionFlags.push('maqamat');
          if (exportOptions.includeMaqamatModulations) optionFlags.push('maqamat-mod');
          if (exportOptions.includeAjnasModulations) optionFlags.push('ajnas-mod');

          if (optionFlags.length > 0) {
            filename += `_${optionFlags.join('_')}`;
          }

          filename += '.json';

          const filePath = path.join(options.outputDir, filename);

          // Write the JSON file with proper structure
          fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

          completedExports++;
          const progressPercent = Math.round((completedExports / totalExports) * 100);
          console.log(`\n    ✓ Export complete! ${filePath.split('/').pop()}`);

          // Show stats about the export based on what was actually included
          const stats = exportData.summaryStats;
          if (stats) {
            let statsLine = `📊 Pitch classes: ${stats.tuningPitchClassesInAllOctaves}`;

            if (exportOptions.includeAjnasDetails) {
              statsLine += `, Ajnas: ${stats.ajnasAvailableInTuning}`;
            }

            if (exportOptions.includeMaqamatDetails) {
              statsLine += `, Maqamat: ${stats.maqamatAvailableInTuning}`;
            }

            console.log(`    ${statsLine}`);

            if (stats.totalMaqamModulations > 0 || stats.totalAjnasModulations > 0) {
              console.log(`    🔄 Modulations: Maqam=${stats.totalMaqamModulations}, Ajnas=${stats.totalAjnasModulations}`);
            }
          }

          console.log(`    📈 Overall Progress: ${completedExports}/${totalExports} (${progressPercent}%) completed`);

          if (completedExports < totalExports) {
            const remaining = totalExports - completedExports;
            console.log(`    ⏳ ${remaining} configurations remaining...`);
          }

        } catch (error) {
          console.error(`\n✗ Failed to export ${tuningSystem.getId()} with ${startingNote}:`, (error as Error).message);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Batch export completed! ${completedExports}/${totalExports} exports successful.`);
    console.log(`📁 Files saved to: ${path.resolve(options.outputDir)}`);

    if (options.tuningSystem === 'all') {
      console.log(`📦 Batch folder created to organize ${completedExports} files`);
    }

    const failedExports = totalExports - completedExports;
    if (failedExports > 0) {
      console.log(`⚠️  ${failedExports} exports failed - check error messages above`);
    }

  } catch (error) {
    console.error('Fatal error:', (error as Error).message);
    console.error('Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nExport interrupted by user.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nExport terminated.');
  process.exit(0);
});

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
