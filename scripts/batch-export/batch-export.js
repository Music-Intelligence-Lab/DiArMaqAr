#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Digital Arabic Maqām Archive - Batch Export CLI
 *
 * This script allows batch export of tuning system data in text format from the command line,
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
  node scripts/batch-export/batch-export.js --tuning-system "alkindi_874" --starting-note "yegāh"

  # Export with full data including modulations
  node scripts/batch-export/batch-export.js --tuning-system "alkindi_874" --starting-note "yegāh" --include-ajnas-details --include-maqamat-details --include-maqamat-modulations --include-ajnas-modulations

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
    .replace(/[\\u0300-\\u036f]/g, '') // Remove combining diacritics
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
    .toLowerCase()
    .trim();
}

// Format duration in human-readable format
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return \`\${seconds.toFixed(2)}s\`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);
  if (minutes < 60) {
    return \`\${minutes}m \${remainingSeconds}s\`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return \`\${hours}h \${remainingMinutes}m \${remainingSeconds}s\`;
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

    // Initialize log data structure
    const logData = {
      exportStartTime: new Date().toISOString(),
      exportEndTime: null,
      totalDurationSeconds: 0,
      exportOptions: {
        includeAjnasDetails: options.includeAjnasDetails,
        includeMaqamatDetails: options.includeMaqamatDetails,
        includeMaqamToMaqamModulations: options.includeMaqamToMaqamModulations,
        includeMaqamToJinsModulations: options.includeMaqamToJinsModulations,
        includeModulations8vb: options.includeModulations8vb,
      },
      tuningSystems: []
    };
    const exportStartTime = Date.now();

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
      const systemStartTime = Date.now();

      console.log(\`\\n[\${systemIndex}/\${tuningSystemsToProcess.length}] Processing: \${tuningSystem.getId()}\`);
      console.log(\`Title: \${tuningSystem.getTitleEnglish()}\`);
      console.log('-'.repeat(50));

      // Initialize log entry for this tuning system
      const systemLogEntry = {
        tuningSystemId: tuningSystem.getId(),
        tuningSystemTitle: tuningSystem.getTitleEnglish(),
        startTime: new Date().toISOString(),
        endTime: null,
        durationSeconds: 0,
        startingNotes: []
      };

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
        const noteStartTime = Date.now();
        const overallProgress = \`(\${completedExports + 1}/\${totalExports})\`;
        const systemProgress = startingNotesToProcess.length > 1 ? \` [\${j}/\${startingNotesToProcess.length}]\` : '';

        console.log(\`\\n  \${overallProgress}\${systemProgress} → \${startingNote}\`);

        // Initialize log entry for this starting note
        const noteLogEntry = {
          startingNote: startingNote,
          startTime: new Date().toISOString(),
          endTime: null,
          durationSeconds: 0,
          success: false,
          errorMessage: null,
          stats: null
        };

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

          filename += '.txt';

          const filePath = path.join(actualOutputDir, filename);

          // Write the text file with JSON structure
          fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');

          completedExports++;
          const progressPercent = Math.round((completedExports / totalExports) * 100);
          console.log(\`\\n    ✓ Export complete! \${path.basename(filePath)}\`);

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

            // Store stats in log
            noteLogEntry.stats = stats;
          }

          console.log(\`    📈 Overall Progress: \${completedExports}/\${totalExports} (\${progressPercent}%) completed\`);

          if (completedExports < totalExports) {
            const remaining = totalExports - completedExports;
            console.log(\`    ⏳ \${remaining} configurations remaining...\`);
          }

          // Mark as successful
          noteLogEntry.success = true;

          // Explicit cleanup after each export
          // exportData = null; // Skip explicit nulling since it's const

        } catch (error) {
          console.error(\`\\n✗ Failed to export \${tuningSystem.getId()} with \${startingNote}:\`, error.message);
          noteLogEntry.errorMessage = error.message;
        }

        // Record end time and duration for this starting note
        const noteEndTime = Date.now();
        noteLogEntry.endTime = new Date().toISOString();
        noteLogEntry.durationSeconds = Number(((noteEndTime - noteStartTime) / 1000).toFixed(2));
        systemLogEntry.startingNotes.push(noteLogEntry);

        console.log(\`    ⏱️  Export time: \${noteLogEntry.durationSeconds}s\`);

        // Force garbage collection after each export to prevent memory buildup
        if (global.gc) {
          global.gc();
        }
      }

      // Clean up after each tuning system
      if (global.gc) {
        global.gc();
      }

      // Record end time and duration for this tuning system
      const systemEndTime = Date.now();
      systemLogEntry.endTime = new Date().toISOString();
      systemLogEntry.durationSeconds = Number(((systemEndTime - systemStartTime) / 1000).toFixed(2));
      logData.tuningSystems.push(systemLogEntry);

      console.log(\`\\n  ⏱️  Total system time: \${systemLogEntry.durationSeconds}s\`);
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

    // Finalize log data
    const exportEndTime = Date.now();
    logData.exportEndTime = new Date().toISOString();
    logData.totalDurationSeconds = Number(((exportEndTime - exportStartTime) / 1000).toFixed(2));

    // Calculate summary statistics
    logData.summary = {
      totalTuningSystems: logData.tuningSystems.length,
      totalStartingNotes: logData.tuningSystems.reduce((sum, ts) => sum + ts.startingNotes.length, 0),
      successfulExports: completedExports,
      failedExports: failedExports,
      averageTimePerExport: logData.tuningSystems.length > 0 
        ? Number((logData.totalDurationSeconds / completedExports).toFixed(2))
        : 0,
      totalDurationFormatted: formatDuration(logData.totalDurationSeconds)
    };

    // Write log file as text file
    const logFileName = 'export-log_' + new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                        new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0] + '.txt';
    const logFilePath = path.join(actualOutputDir, logFileName);
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2), 'utf-8');

    console.log(\`\\n📊 Export log saved: \${logFileName}\`);
    console.log(\`⏱️  Total export time: \${logData.summary.totalDurationFormatted}\`);
    console.log(\`📈 Average time per export: \${logData.summary.averageTimePerExport}s\`);

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
    const projectRoot = path.resolve(__dirname, '..', '..');

    // Get npm global root in a cross-platform way
    let npmGlobalRoot;
    try {
      npmGlobalRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.error('Failed to get npm global root directory');
      throw error;
    }

    // Try tsx first (cross-platform path handling)
    const tsxPath = path.join(npmGlobalRoot, 'tsx', 'dist', 'cli.mjs');

    if (fs.existsSync(tsxPath)) {
      execSync(`node ${executionOptions} --expose-gc "${tsxPath}" "${tsFilePath}"`, {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env, NODE_OPTIONS: `${executionOptions} --expose-gc` }
      });
    } else {
      throw new Error('tsx not found');
    }

  } catch (tsxError) {
    // Try with ts-node if tsx fails
    try {
      const projectRoot = path.resolve(__dirname, '..', '..');

      // Get npm global root in a cross-platform way
      let npmGlobalRoot;
      try {
        npmGlobalRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
      } catch (error) {
        console.error('Failed to get npm global root directory');
        throw error;
      }

      const tsNodePath = path.join(npmGlobalRoot, 'ts-node', 'dist', 'bin.js');

      if (fs.existsSync(tsNodePath)) {
        execSync(`node ${executionOptions} --expose-gc "${tsNodePath}" "${tsFilePath}"`, {
          stdio: 'inherit',
          cwd: projectRoot,
          env: { ...process.env, NODE_OPTIONS: `${executionOptions} --expose-gc` }
        });
      } else {
        throw new Error('ts-node not found');
      }

    } catch (tsNodeError) {
      console.error('Failed to run TypeScript version. Make sure tsx or ts-node is available:');
      console.error('npm install -g tsx');
      console.error('or');
      console.error('npm install -g ts-node');
      console.error('\nError details:', tsxError.message);
      if (tsNodeError.message !== 'ts-node not found') {
        console.error('Stack trace:', tsNodeError.stack);
      }
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