#!/usr/bin/env node

/**
 * Digital Arabic Maqām Archive - Batch Export CLI
 *
 * This script allows batch export of tuning system data in JSON format from the command line,
 * providing the same comprehensive data structure as the web export modal.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    listTuningSystems: false,
    tuningSystem: null,
    startingNote: null,
    includeAjnasDetails: false,
    includeMaqamatDetails: false,
    includeMaqamToMaqamModulations: false,
    includeMaqamToJinsModulations: false,
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
      case '--include-maqamat-details':
        options.includeMaqamatDetails = true;
        break;
      case '--include-maqamat-modulations':
        options.includeMaqamToMaqamModulations = true;
        break;
      case '--include-ajnas-modulations':
        options.includeMaqamToJinsModulations = true;
        break;
      case '--include-modulations-8vb':
        options.includeModulations8vb = true;
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

function showHelp() {
  console.log(`
Digital Arabic Maqām Archive - Batch Export CLI

Usage:
  node scripts/batch-export/batch-export.js [options]

Options:
  --help, -h                    Show this help message
  --list-tuning-systems         List all available tuning systems and their starting notes
  --tuning-system, -t <id>      Tuning system ID (use "all" for all systems)
  --starting-note, -s <note>    Starting note name (use "all" for all available notes)
  --output-dir, -o <dir>        Output directory (default: ./exports)

Export Options:
  --include-ajnas-details       Include ajnas details (default: false)
  --include-maqamat-details     Include maqamat details (default: false)
  --include-maqamat-modulations Include maqamat modulations (default: false)
  --include-ajnas-modulations   Include ajnas modulations (default: false)
  --include-modulations-8vb     Include lower octave (8vb) modulations (default: false)

Examples:
  # List all available tuning systems
  node scripts/batch-export/batch-export.js --list-tuning-systems

  # Export specific tuning system with basic data
  node scripts/batch-export/batch-export.js --tuning-system "al-Kindi-(874)" --starting-note "yegāh"

  # Export with full data including modulations
  node scripts/batch-export/batch-export.js \\
    --tuning-system "al-Kindi-(874)" \\
    --starting-note "yegāh" \\
    --include-ajnas-details \\
    --include-maqamat-details \\
    --include-maqamat-modulations \\
    --include-ajnas-modulations

  # Export all systems with all starting notes (batch export)
  node scripts/batch-export/batch-export.js --tuning-system "all" --starting-note "all"
`);
}

async function main() {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  // Determine output options for memory allocation
  const outputOptions = [];
  if (options.includeAjnasDetails) outputOptions.push('ajnas');
  if (options.includeMaqamatDetails) outputOptions.push('maqamat');
  if (options.includeMaqamToMaqamModulations) outputOptions.push('maqamat-mod');
  if (options.includeMaqamToJinsModulations) outputOptions.push('ajnas-mod');

  // Dynamic memory allocation based on export complexity
  const isFullBatchExport = options.tuningSystem === 'all' && options.startingNote === 'all';
  const MAX_MEMORY = outputOptions.includes('maqamat-mod') || outputOptions.includes('ajnas-mod') ? '12288' : '8192'; // Increased memory for modulations
  const executionOptions = `--max-old-space-size=${MAX_MEMORY}`;

  // Create TypeScript runner that uses the actual export function
  const tsFilePath = path.join(__dirname, 'batch-export-runner.ts');

  const tsRunnerContent = `
import { getTuningSystems } from '@/functions/import';
import { exportTuningSystem, ExportOptions } from '@/functions/export';
import NoteName from '@/models/NoteName';
import * as fs from 'fs';
import * as path from 'path';

// Normalize input for flexible matching
function normalizeForMatching(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '') // Remove diacritics
    .replace(/[āīūḥṣṭḍẓʿʾ]/g, (match: string) => {
      const map: { [key: string]: string } = {'ā':'a','ī':'i','ū':'u','ḥ':'h','ṣ':'s','ṭ':'t','ḍ':'d','ẓ':'z','ʿ':'','ʾ':''};
      return map[match] || match;
    })
    .toLowerCase();
}

async function run() {
  const options = ${JSON.stringify(options)};

  try {
    console.log('Running proper export with full data structures...\\n');

    const tuningSystems = getTuningSystems();

    if (options.listTuningSystems) {
      console.log('Available Tuning Systems:');
      console.log('========================\\n');

      tuningSystems.forEach(ts => {
        console.log(\`ID: \${ts.getId()}\`);
        console.log(\`Title (EN): \${ts.getTitleEnglish()}\`);
        console.log(\`Title (AR): \${ts.getTitleArabic()}\`);
        console.log(\`Creator: \${ts.getCreatorEnglish()}\`);
        console.log(\`Year: \${ts.getYear()}\`);
        console.log(\`Starting Notes: \${ts.getNoteNameSets().map(set => set[0]).join(', ')}\`);
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
      actualOutputDir = path.join(options.outputDir, \`batch_all_systems_\${timestamp}\`);
    }

    if (!fs.existsSync(actualOutputDir)) {
      fs.mkdirSync(actualOutputDir, { recursive: true });
    }

    const exportOptions: ExportOptions = {
      includeTuningSystemDetails: true,
      includePitchClasses: true,
      includeAjnasDetails: options.includeAjnasDetails,
      includeMaqamatDetails: options.includeMaqamatDetails,
      includeMaqamToMaqamModulations: options.includeMaqamToMaqamModulations,
      includeMaqamToJinsModulations: options.includeMaqamToJinsModulations,
      includeModulations8vb: options.includeModulations8vb,
      progressCallback: (percentage: number, step: string) => {
        process.stdout.write(\`\\r\${step} (\${Math.round(percentage)}%)\`);
      }
    };

    let tuningSystemsToProcess = [];

    if (options.tuningSystem === 'all') {
      tuningSystemsToProcess = tuningSystems;
    } else {
      const normalizedInput = normalizeForMatching(options.tuningSystem);
      const selectedSystem = tuningSystems.find(ts => {
        const normalizedId = normalizeForMatching(ts.getId());
        return normalizedId === normalizedInput || ts.getId() === options.tuningSystem;
      });

      if (!selectedSystem) {
        console.error(\`Error: Tuning system "\${options.tuningSystem}" not found.\`);
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

    console.log(\`Starting batch export of \${totalExports} configurations...\`);
    console.log(\`Output directory: \${path.resolve(actualOutputDir)}\`);
    console.log(\`Systems to process: \${tuningSystemsToProcess.length}\`);
    console.log(\`Mode: \${options.tuningSystem === 'all' ? 'BATCH (all systems)' : 'SINGLE SYSTEM'}\`);
    if (options.includeMaqamToMaqamModulations || options.includeMaqamToJinsModulations) {
      console.log('⚠️  Modulations enabled - this will take significantly longer');
    }
    console.log('\\n' + '='.repeat(60));

    let systemIndex = 0;
    for (const tuningSystem of tuningSystemsToProcess) {
      systemIndex++;

      console.log(\`\\n[\${systemIndex}/\${tuningSystemsToProcess.length}] Processing: \${tuningSystem.getId()}\`);
      console.log(\`Title: \${tuningSystem.getTitleEnglish()}\`);
      console.log('-'.repeat(50));

      let startingNotesToProcess: NoteName[] = [];

      if (options.startingNote === 'all') {
        startingNotesToProcess = tuningSystem.getNoteNameSets().map(set => set[0]);
      } else {
        const availableStartingNotes = tuningSystem.getNoteNameSets().map(set => set[0]);
        const normalizedStartingNote = normalizeForMatching(options.startingNote);
        const matchedNote = availableStartingNotes.find(note => {
          const normalizedNote = normalizeForMatching(note);
          return normalizedNote === normalizedStartingNote || note === options.startingNote;
        });

        if (!matchedNote) {
          console.error(\`\\nError: Starting note "\${options.startingNote}" not available for tuning system "\${tuningSystem.getId()}".\`);
          console.log(\`Available starting notes: \${availableStartingNotes.join(', ')}\`);
          continue;
        }
        startingNotesToProcess = [matchedNote as NoteName];
      }

      let j = 0;
      for (const startingNote of startingNotesToProcess) {
        j++;
        const overallProgress = \`(\${completedExports + 1}/\${totalExports})\`;
        const systemProgress = startingNotesToProcess.length > 1 ? \` [\${j}/\${startingNotesToProcess.length}]\` : '';

        console.log(\`\\n  \${overallProgress}\${systemProgress} → \${startingNote}\`);

        try {
          // Force garbage collection before each export if available
          if (global.gc) {
            global.gc();
          }

          // Additional memory management for large batch exports
          if (${isFullBatchExport} && completedExports > 0 && completedExports % 5 === 0) {
            console.log(\`\\n🧹 Running memory cleanup after \${completedExports} exports...\`);
            if (global.gc) {
              global.gc();
              // Force multiple garbage collection cycles for large exports
              setTimeout(() => global.gc && global.gc(), 100);
              setTimeout(() => global.gc && global.gc(), 200);
            }
          }

          // Use the ACTUAL exportTuningSystem function from the export modal
          const exportData = await exportTuningSystem(
            tuningSystem,
            startingNote,
            exportOptions
          );

          // Generate filename matching export modal pattern
          // Comprehensive character normalization for safe filenames
          const stripDiacritics = (str: string): string => {
            return str
              .normalize('NFD') // Unicode normalization
              .replace(/[\\u0300-\\u036f]/g, '') // Remove combining diacritics
              .replace(/[\\u0590-\\u05FF]/g, '') // Remove Hebrew characters
              .replace(/[\\u0600-\\u06FF]/g, '') // Remove Arabic characters
              .replace(/[\\u0750-\\u077F]/g, '') // Remove Arabic Supplement
              .replace(/[\\u08A0-\\u08FF]/g, '') // Remove Arabic Extended-A
              .replace(/[\\uFB50-\\uFDFF]/g, '') // Remove Arabic Presentation Forms-A
              .replace(/[\\uFE70-\\uFEFF]/g, '') // Remove Arabic Presentation Forms-B
              // Comprehensive Arabic/Persian transliteration mapping
              .replace(/[āáàâäãåăąǎǟǡǻȁȃạảấầẩẫậắằẳẵặ]/gi, 'a')
              .replace(/[ēéèêëĕėęěȅȇẹẻẽếềểễệ]/gi, 'e')
              .replace(/[īíìîïĩĭįǐȉȋịỉĩ]/gi, 'i')
              .replace(/[ōóòôöõŏőǒǫȍȏọỏốồổỗộớờởỡợ]/gi, 'o')
              .replace(/[ūúùûüũŭůűųǔǖǘǚǜȕȗụủứừửữự]/gi, 'u')
              .replace(/[ýỳŷÿỹȳẏỵỷ]/gi, 'y')
              // Arabic transliteration characters
              .replace(/[ḥḤ]/g, 'h') // ḥā'
              .replace(/[ṣṢ]/g, 's') // ṣād
              .replace(/[ṭṬ]/g, 't') // ṭā'
              .replace(/[ḍḌ]/g, 'd') // ḍād
              .replace(/[ẓẒ]/g, 'z') // ẓā'
              .replace(/[ʿ]/g, '') // ʿayn (remove)
              .replace(/[ʾ]/g, '') // hamza (remove)
              .replace(/[ḏḎ]/g, 'd') // dhāl
              .replace(/[ṯṮ]/g, 't') // thā'
              .replace(/[ḫḪ]/g, 'kh') // khā'
              .replace(/[ġĠ]/g, 'gh') // ghayn
              .replace(/[šŠ]/g, 'sh') // shīn
              .replace(/[žŽ]/g, 'zh') // zhē
              .replace(/[čČ]/g, 'ch') // chē
              .replace(/[ñÑ]/g, 'n') // eñe
              .replace(/[çÇ]/g, 'c') // cedilla
              .replace(/[ßẞ]/g, 'ss') // eszett
              // Remove remaining non-ASCII, keep alphanumeric, hyphens, underscores, parentheses
              .replace(/[^a-zA-Z0-9\\-_()]/g, '_')
              .replace(/_{2,}/g, '_') // Collapse multiple underscores
              .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
          };

          const safeSystemId = stripDiacritics(tuningSystem.getId());
          const safeStartingNote = stripDiacritics(startingNote);

          // Create local timestamp with date and time (YYYY-MM-DD_HH-MM-SS format)
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const seconds = String(now.getSeconds()).padStart(2, '0');
          const timestamp = year + '-' + month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds;

          let filename = safeSystemId + '_' + safeStartingNote + '_' + timestamp;

          // Add options to filename for clarity
          const optionFlags = [];
          if (exportOptions.includeAjnasDetails) optionFlags.push('ajnas');
          if (exportOptions.includeMaqamatDetails) optionFlags.push('maqamat');
          if (exportOptions.includeMaqamToMaqamModulations) optionFlags.push('maqamat-mod');
          if (exportOptions.includeMaqamToJinsModulations) optionFlags.push('ajnas-mod');

          if (optionFlags.length > 0) {
            filename += \`_\${optionFlags.join('_')}\`;
          }

          filename += '.json';

          const filePath = path.join(actualOutputDir, filename);

          // Write the JSON file with proper structure
          fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

          completedExports++;
          const progressPercent = Math.round((completedExports / totalExports) * 100);
          console.log(\`\\n    ✓ Export complete! \${filePath.split('/').pop()}\`);

          // Show stats about the export based on what was actually included
          const stats = exportData.summaryStats;
          if (stats) {
            let statsLine = \`📊 Pitch classes: \${stats.tuningPitchClassesInAllOctaves}\`;

            if (exportOptions.includeAjnasDetails) {
              statsLine += \`, Ajnas: \${stats.ajnasAvailableInTuning}\`;
            }

            if (exportOptions.includeMaqamatDetails) {
              statsLine += \`, Maqamat: \${stats.maqamatAvailableInTuning}\`;
            }

            console.log(\`    \${statsLine}\`);

            if (stats.totalMaqamModulations > 0 || stats.totalAjnasModulations > 0) {
              console.log(\`    🔄 Modulations: Maqam=\${stats.totalMaqamModulations}, Ajnas=\${stats.totalAjnasModulations}\`);
            }
          }

          console.log(\`    📈 Overall Progress: \${completedExports}/\${totalExports} (\${progressPercent}%) completed\`);

          if (completedExports < totalExports) {
            const remaining = totalExports - completedExports;
            console.log(\`    ⏳ \${remaining} configurations remaining...\`);
          }

          // Explicit cleanup after each export
          // exportData = null; // Skip explicit nulling since it's const

        } catch (error) {
          console.error(\`\\n✗ Failed to export \${tuningSystem.getId()} with \${startingNote}:\`, error.message);
        }

        // Force garbage collection after each export to prevent memory buildup
        if (global.gc) {
          global.gc();
        }
      }

      // Clean up after each tuning system
      if (global.gc) {
        global.gc();
      }
    }

    console.log('\\n' + '='.repeat(60));
    console.log(\`🎉 Batch export completed! \${completedExports}/\${totalExports} exports successful.\`);
    console.log(\`📁 Files saved to: \${path.resolve(actualOutputDir)}\`);

    if (options.tuningSystem === 'all') {
      console.log(\`📦 Batch folder created to organize \${completedExports} files\`);
    }

    const failedExports = totalExports - completedExports;
    if (failedExports > 0) {
      console.log(\`⚠️  \${failedExports} exports failed - check error messages above\`);
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n\\nExport interrupted by user.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\n\\nExport terminated.');
  process.exit(0);
});

run().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
`;

  // Write the TypeScript file
  fs.writeFileSync(tsFilePath, tsRunnerContent);

  try {
    // Run with increased memory and tsx
    const args = process.argv.slice(2).map(arg => `"${arg}"`).join(' ');
    const projectRoot = path.resolve(__dirname, '..', '..');

    // Use tsx with the memory options
    execSync(`node ${executionOptions} --expose-gc $(npm root -g)/tsx/dist/cli.mjs "${tsFilePath}"`, {
      stdio: 'inherit',
      cwd: projectRoot,
      env: { ...process.env, NODE_OPTIONS: `${executionOptions} --expose-gc` }
    });

  } catch (tsxError) {
    // Try with ts-node if tsx fails
    try {
      const args = process.argv.slice(2).map(arg => `"${arg}"`).join(' ');
      const projectRoot = path.resolve(__dirname, '..', '..');

      execSync(`node ${executionOptions} --expose-gc $(npm root -g)/ts-node/dist/bin.js "${tsFilePath}"`, {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env, NODE_OPTIONS: `${executionOptions} --expose-gc` }
      });

    } catch (tsNodeError) {
      console.error('Failed to run TypeScript version. Make sure tsx or ts-node is available:');
      console.error('npm install -g tsx');
      console.error('or');
      console.error('npm install -g ts-node');
      process.exit(1);
    }
  } finally {
    // Clean up the temporary TypeScript file
    if (fs.existsSync(tsFilePath)) {
      fs.unlinkSync(tsFilePath);
    }
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