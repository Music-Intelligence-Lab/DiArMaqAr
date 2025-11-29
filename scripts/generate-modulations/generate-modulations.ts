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
 * - Comprehensive statistics (mean, median, min, max, std dev)
 *
 * Resume capability:
 * - By default, skips existing files (resume mode)
 * - Use --force to regenerate all files
 *
 * Usage:
 *   npm run generate:modulations                    # Generate all (skip existing)
 *   npm run generate:modulations -- --all           # Generate all (skip existing, explicit)
 *   npm run generate:modulations -- --force         # Regenerate all (overwrite existing)
 *   npm run generate:modulations -- --ids <id1,id2> # Generate specific (skip existing)
 *   npm run generate:modulations -- <id1> <id2>     # Generate specific (shorthand, skip existing)
 *   npm run generate:modulations -- <id1> --force   # Generate specific (overwrite if exists)
 *
 * Examples:
 *   npm run generate:modulations -- --ids ronzevalle_1904,anglo-european-(1800)
 *   npm run generate:modulations -- ronzevalle_1904 anglo-european-(1800)
 *   npm run generate:modulations -- --all --force
 *   npm run generate:modulations -- alsabbagh_1950 --force
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

/**
 * Incremental JSON writer that writes data as it's generated and supports resuming
 * Uses fs.appendFileSync for immediate disk writes (no buffering)
 */
class IncrementalJsonWriter {
  private filePath: string;
  private logger: LogWriter;
  private isFirstStartingNote: boolean = true;
  private isFirstMaqamInStartingNote: boolean = true;
  private statistics: StatisticsSummary | null = null;
  private writtenMaqamatCount: number = 0;
  private useStream: boolean = false; // Set to true if we need stream for resume
  private writeStream: fs.WriteStream | null = null; // Only used when resuming

  constructor(filePath: string, logger: LogWriter, tuningSystemId: string) {
    this.filePath = filePath;
    this.logger = logger;
    
    logger.log(`    Creating file: ${filePath}`);
    
    // Write the header synchronously to ensure file is created immediately
    // This ensures the file exists and has content even if interrupted early
    const header = `{\n` +
      `  "id": ${JSON.stringify(tuningSystemId)},\n` +
      `  "version": ${JSON.stringify(new Date().toISOString())},\n` +
      `  "sourceVersions": ${JSON.stringify({
        maqamat: '2025-10-18T19:41:17.132Z',
        ajnas: '2025-10-18T19:34:26.343Z',
        tuningSystems: '2025-10-18T00:00:00.000Z',
      })},\n` +
      `  "statistics": null,\n` +
      `  "modulationData": [\n`;
    
    try {
      fs.writeFileSync(filePath, header, 'utf-8');
      logger.log(`    ✓ File created with header: ${filePath}`);
    } catch (error: any) {
      logger.error(`    ✗ Error creating file: ${error.message}`);
      throw error;
    }
    
    // For new files, we'll use appendFileSync for immediate writes
    // No need for a stream - we'll append synchronously
    this.useStream = false;
    this.writeStream = null;
  }

  private writeIndented(text: string, indent: number = 0): void {
    const indentStr = '  '.repeat(indent);
    const fullText = indentStr + text;
    
    try {
      if (this.useStream && this.writeStream) {
        // Use stream (for resume mode)
        const result = this.writeStream.write(fullText);
        if (!result) {
          this.writeStream.once('drain', () => {});
        }
      } else {
        // Use synchronous append for immediate disk write
        fs.appendFileSync(this.filePath, fullText, 'utf-8');
      }
    } catch (error: any) {
      this.logger.error(`    ✗ Error writing to file: ${error?.message || error}`);
      throw error;
    }
  }
  
  /**
   * Force flush the stream to ensure data is written to disk
   * This is important for incremental writing so data is saved even if interrupted
   */
  flush(): void {
    // Get the file descriptor from the stream and sync
    // Note: This is a workaround since Node.js streams don't expose fd directly
    // We'll use a different approach - ensure the stream is ready
    if (this.writeStream && !this.writeStream.destroyed) {
      // The stream will flush automatically, but we can't force it easily
      // Instead, we'll rely on the OS to flush periodically
      // For critical writes, we could use fs.writeFileSync in append mode, but that's slower
    }
  }

  /**
   * Start a new starting note section
   */
  startStartingNote(startingNoteIdName: string, startingNoteDisplayName: string): void {
    if (!this.isFirstStartingNote) {
      this.writeIndented('],\n', 2); // Close previous starting note's maqamat array
      this.writeIndented('},\n', 1); // Close previous starting note object
    }
    
    this.writeIndented('{\n', 1);
    this.writeIndented(`"startingNoteIdName": ${JSON.stringify(startingNoteIdName)},\n`, 2);
    this.writeIndented(`"startingNoteDisplayName": ${JSON.stringify(startingNoteDisplayName)},\n`, 2);
    this.writeIndented('"maqamatModulations": [\n', 2);
    
    this.isFirstStartingNote = false;
    this.isFirstMaqamInStartingNote = true;
  }

  /**
   * Write a maqam entry immediately as it's processed
   */
  writeMaqamEntry(entry: MaqamModulationEntry): void {
    try {
      if (this.useStream && this.writeStream) {
        // Stream mode (resume)
        if (!this.isFirstMaqamInStartingNote) {
          const result = this.writeStream.write(',\n');
          if (!result) {
            this.writeStream.once('drain', () => {});
          }
        }
        
        const entryJson = JSON.stringify(entry, null, 2);
        const indentedEntry = entryJson.split('\n').map((line, idx) => {
          if (idx === 0) return '      ' + line;
          return '      ' + line;
        }).join('\n');
        
        const result = this.writeStream.write(indentedEntry);
        if (!result) {
          this.writeStream.once('drain', () => {});
        }
      } else {
        // Synchronous append mode (immediate disk write)
        if (!this.isFirstMaqamInStartingNote) {
          fs.appendFileSync(this.filePath, ',\n', 'utf-8');
        }
        
        const entryJson = JSON.stringify(entry, null, 2);
        const indentedEntry = entryJson.split('\n').map((line, idx) => {
          if (idx === 0) return '      ' + line;
          return '      ' + line;
        }).join('\n');
        
        fs.appendFileSync(this.filePath, indentedEntry, 'utf-8');
      }
      
      this.isFirstMaqamInStartingNote = false;
      this.writtenMaqamatCount++;
    } catch (error: any) {
      this.logger.error(`    ✗ Error writing maqam entry: ${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Finish writing and calculate final statistics
   * Closes the stream, then synchronously updates the statistics field
   * If resuming, reads the complete file to calculate accurate statistics
   */
  finish(modulationData: StartingNoteData[], wasResumed: boolean = false): void {
    // Close the last starting note
    if (!this.isFirstStartingNote) {
      this.writeIndented(']\n', 2); // Close last starting note's maqamat array
      this.writeIndented('}\n', 1); // Close last starting note object
    }
    
    // Close modulationData array
    this.writeIndented(']\n', 1);
    
    // Close root object (statistics is already in header, will be replaced)
    this.writeIndented('}\n', 0);
    // Only end stream if it exists (it's null for non-resumed files)
    if (this.writeStream) {
      this.writeStream.end();
    }
    
    // Give the stream a moment to flush (file streams usually complete immediately)
    // In practice, end() on a file stream completes synchronously for our use case
    // If the file isn't ready, the read will fail and we'll handle it gracefully
    
    // Now update statistics synchronously
    try {
      let dataForStats: StartingNoteData[];
      
      if (wasResumed) {
        // If we resumed, we need to read the complete file to get all data for statistics
        try {
          const fileContent = fs.readFileSync(this.filePath, 'utf-8');
          // Replace "statistics": null temporarily to make it parseable
          const parseableContent = fileContent.replace(/"statistics":\s*null/, '"statistics": null');
          const fileData = JSON.parse(parseableContent) as ModulationDataFile;
          dataForStats = fileData.modulationData;
        } catch (parseError) {
          // If we can't parse the file, use only the data from this run
          this.logger.error(`    ⚠️  Warning: Could not parse file for complete statistics, using partial data: ${parseError}`);
          dataForStats = modulationData;
        }
      } else {
        // Not resumed, use the data we have
        dataForStats = modulationData;
      }
      
      // Calculate statistics
      this.statistics = calculateStatistics(dataForStats);
      const statsJson = JSON.stringify(this.statistics, null, 2);
      
      // Read file, replace null with statistics
      // For very large files, this read might be slow, but it's only once at the end
      let content = fs.readFileSync(this.filePath, 'utf-8');
      // Replace "statistics": null with actual statistics (replace ALL occurrences to handle any duplicates)
      const statsReplacement = `"statistics": ${statsJson}`;
      content = content.replace(/"statistics":\s*null/g, statsReplacement);
      
      // Write back
      fs.writeFileSync(this.filePath, content, 'utf-8');
    } catch (error: any) {
      // If file is too large to read into memory, that's okay - it's valid JSON without statistics
      if (error.message && error.message.includes('Invalid string length')) {
        this.logger.error(`    ⚠️  Warning: File too large to update statistics in-place. File is valid but statistics are null.`);
      } else {
        this.logger.error(`    ⚠️  Warning: Could not update statistics in file: ${error.message}`);
      }
      // File is still valid JSON, just with null statistics
    }
  }

  /**
   * Close the file (call this after finish() to ensure it's flushed)
   */
  close(): void {
    // Stream should already be ended, but ensure it's closed
    // Only close if stream exists (it's null for non-resumed files)
    if (this.writeStream && !this.writeStream.closed) {
      this.writeStream.end();
    }
  }

  /**
   * Check if a partial file exists and can be resumed
   * Returns info about what's been processed and the position to resume from
   */
  static canResume(filePath: string): { 
    canResume: boolean; 
    processedMaqamat: Set<string>; 
    isComplete: boolean;
    resumePosition: number; // Byte position to truncate to
    lastStartingNote: string | null; // Last starting note that was being processed
  } {
    if (!fs.existsSync(filePath)) {
      return { 
        canResume: false, 
        processedMaqamat: new Set(), 
        isComplete: false,
        resumePosition: 0,
        lastStartingNote: null
      };
    }

    try {
      // Check file size - empty files are incomplete
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return { 
          canResume: false, 
          processedMaqamat: new Set(), 
          isComplete: false,
          resumePosition: 0,
          lastStartingNote: null
        };
      }

      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Empty or very short content is incomplete
      if (content.trim().length < 50) {
        return { 
          canResume: false, 
          processedMaqamat: new Set(), 
          isComplete: false,
          resumePosition: 0,
          lastStartingNote: null
        };
      }
      
      // Check if file appears complete (has statistics and proper closing)
      const hasStatistics = content.includes('"statistics"') && !content.includes('"statistics": null');
      const endsProperly = content.trim().endsWith('}');
      const isComplete = hasStatistics && endsProperly;
      
      if (isComplete) {
        // Try to parse to verify it's valid JSON
        try {
          JSON.parse(content);
          return { 
            canResume: false, 
            processedMaqamat: new Set(), 
            isComplete: true,
            resumePosition: 0,
            lastStartingNote: null
          };
        } catch {
          // Invalid JSON, treat as incomplete
        }
      }
      
      // Extract processed maqamat IDs from partial file
      const processedMaqamat = new Set<string>();
      const maqamIdRegex = /"maqamId":\s*"([^"]+)"/g;
      let match;
      while ((match = maqamIdRegex.exec(content)) !== null) {
        processedMaqamat.add(match[1]);
      }
      
      // Initialize variables for resume position detection
      let resumePosition = content.length;
      let lastStartingNote: string | null = null;
      
      // Check if file has the header structure (even if no maqamat entries yet)
      // This means we can resume from the beginning of the modulationData array
      const hasHeader = content.includes('"modulationData": [');
      const hasStartingNote = content.includes('"startingNoteIdName"');
      
      // If file has header but no maqamat entries, we can still resume
      // (it was interrupted before writing the first entry)
      if (hasHeader && processedMaqamat.size === 0 && !hasStartingNote) {
        // File has header but no data yet - find where to resume (after modulationData array opening)
        const modulationDataStart = content.indexOf('"modulationData": [');
        if (modulationDataStart >= 0) {
          // Resume right after the opening bracket
          resumePosition = modulationDataStart + '"modulationData": ['.length;
          // Skip any whitespace
          const afterBracket = content.substring(resumePosition);
          const nextNonWhitespace = afterBracket.search(/\S/);
          if (nextNonWhitespace >= 0) {
            resumePosition += nextNonWhitespace;
          }
        }
        return {
          canResume: true,
          processedMaqamat: new Set(), // No entries yet, but we can resume
          isComplete: false,
          resumePosition,
          lastStartingNote: null
        };
      }
      
      // Find the last complete maqam entry by looking for complete JSON objects
      // We'll search backwards from the end to find where we can safely truncate
      
      // Strategy: Find the last complete maqam entry by looking for the pattern:
      // "maqamId": "..." followed by complete object structure ending with }
      // We need to find where a complete entry ends (closing brace + optional comma)
      
      // Look backwards from the end to find the last complete entry
      // A complete entry ends with: }\n      } (closing the maqam entry object)
      // Or: },\n      } (if there are more entries)
      
      // Try to find the last occurrence of a complete maqam entry structure
      // Pattern: closing brace with proper indentation (6 spaces = 3 levels)
      const completeEntryPattern = /\n      \}\s*(?:,\s*)?$/m;
      const entryEndMatch = content.match(completeEntryPattern);
      
      if (entryEndMatch && entryEndMatch.index !== undefined) {
        // Found a complete entry ending, truncate right after it
        resumePosition = entryEndMatch.index + entryEndMatch[0].length;
      } else {
        // Fallback: look for last complete maqam entry by finding "maqamId" and working forward
        // Find all maqamId positions
        const maqamIdMatches = [...content.matchAll(/"maqamId":\s*"[^"]+"/g)];
        if (maqamIdMatches.length > 0) {
          // For each maqamId, try to find if its entry is complete
          // Start from the last and work backwards
          for (let i = maqamIdMatches.length - 1; i >= 0; i--) {
            const maqamMatch = maqamIdMatches[i];
            const startPos = maqamMatch.index!;
            // Look ahead from this maqamId to find the closing brace of this entry
            const fromHere = content.substring(startPos);
            // Find the closing brace that matches this entry (with proper nesting)
            // Look for }\n      } pattern (entry closing)
            const entryCloseMatch = fromHere.match(/\n      \}\s*(?:,\s*)?/);
            if (entryCloseMatch) {
              resumePosition = startPos + entryCloseMatch.index! + entryCloseMatch[0].length;
              break;
            }
          }
        }
      }
      
      // Ensure we don't truncate before the header
      const headerEnd = content.indexOf('"modulationData": [');
      if (headerEnd >= 0 && resumePosition < headerEnd + 20) {
        resumePosition = headerEnd + 20; // Keep at least the header
      }
      
      // Extract last starting note being processed
      const startingNoteRegex = /"startingNoteIdName":\s*"([^"]+)"/g;
      const startingNoteMatches = [...content.matchAll(startingNoteRegex)];
      if (startingNoteMatches.length > 0) {
        lastStartingNote = startingNoteMatches[startingNoteMatches.length - 1][1];
      }
      
      // If file has content but no maqamat entries yet, it's just the header (incomplete)
      // If it has maqamat entries but isn't complete, we can resume
      return { 
        canResume: processedMaqamat.size > 0 && !isComplete, 
        processedMaqamat,
        isComplete,
        resumePosition,
        lastStartingNote
      };
    } catch (error) {
      // If we can't read it, assume we can't resume
      return { 
        canResume: false, 
        processedMaqamat: new Set(), 
        isComplete: false,
        resumePosition: 0,
        lastStartingNote: null
      };
    }
  }

  /**
   * Resume writing to an existing incomplete file
   * Creates a writer that appends to the existing file
   */
  static resume(filePath: string, logger: LogWriter, resumePosition: number): IncrementalJsonWriter {
    // Truncate file to remove any incomplete entry
    fs.truncateSync(filePath, resumePosition);
    
    // Read the truncated content to understand current state
    const content = fs.readFileSync(filePath, 'utf-8');
    const trimmed = content.trimEnd();
    
    // Create writer instance (but we'll use append mode)
    const writer = Object.create(IncrementalJsonWriter.prototype) as IncrementalJsonWriter;
    writer.filePath = filePath;
    writer.logger = logger;
    writer.statistics = null;
    writer.writtenMaqamatCount = 0;
    
    // Determine current state from content
    const hasStartingNotes = content.includes('"startingNoteIdName"');
    const lastStartingNoteStart = content.lastIndexOf('"startingNoteIdName"');
    
    if (hasStartingNotes && lastStartingNoteStart >= 0) {
      // We're resuming in the middle of data
      writer.isFirstStartingNote = false;
      const fromLastNote = content.substring(lastStartingNoteStart);
      const maqamCount = (fromLastNote.match(/"maqamId":/g) || []).length;
      writer.isFirstMaqamInStartingNote = maqamCount === 0;
    } else {
      // We're resuming from just the header (no starting notes written yet)
      writer.isFirstStartingNote = true;
      writer.isFirstMaqamInStartingNote = true;
    }
    
    // Open file in append mode
    const appendStream = fs.createWriteStream(filePath, { encoding: 'utf-8', flags: 'a', autoClose: false });
    
    appendStream.on('error', (error) => {
      logger.error(`    ✗ Error writing to file (resume): ${error.message}`);
    });
    
    let streamReady = false;
    appendStream.on('open', () => {
      streamReady = true;
      logger.log(`    ✓ Resume stream opened`);
      
      // Write the separator after stream is ready
      const lastChar = trimmed[trimmed.length - 1];
      if (lastChar === '}' || lastChar === ']') {
        // Need comma before next entry
        appendStream.write(',\n');
      } else if (lastChar === '[') {
        // Just opened array, no comma needed - but ensure we're on a new line
        if (!trimmed.endsWith('\n')) {
          appendStream.write('\n');
        }
      } else if (lastChar !== ',') {
        // Might be in middle of structure, add newline
        appendStream.write('\n');
      }
    });
    
    writer.writeStream = appendStream;
    
    // Store whether stream is ready (for writeIndented to check)
    (writer as any)._streamReady = streamReady;
    
    // If stream opens synchronously (which it often does), handle it
    if (appendStream.writable) {
      streamReady = true;
      (writer as any)._streamReady = true;
      const lastChar = trimmed[trimmed.length - 1];
      if (lastChar === '}' || lastChar === ']') {
        appendStream.write(',\n');
      } else if (lastChar === '[') {
        if (!trimmed.endsWith('\n')) {
          appendStream.write('\n');
        }
      } else if (lastChar !== ',') {
        appendStream.write('\n');
      }
    }
    
    return writer;
  }
}

/**
 * Dual incremental JSON writer that writes to two separate files simultaneously
 * One for maqamat modulations and one for ajnas modulations
 * Now writes a single starting note per file pair
 */
class DualIncrementalJsonWriter {
  private maqamatWriter: IncrementalJsonWriter;
  private ajnasWriter: IncrementalJsonWriter;
  private logger: LogWriter;
  private tuningSystemId: string;
  private startingNoteIdName: string;
  private startingNoteDisplayName: string;
  private maqamatData: MaqamatStartingNoteData;
  private ajnasData: AjnasStartingNoteData;

  constructor(
    maqamatFilePath: string,
    ajnasFilePath: string,
    logger: LogWriter,
    tuningSystemId: string,
    startingNoteIdName: string,
    startingNoteDisplayName: string
  ) {
    this.logger = logger;
    this.tuningSystemId = tuningSystemId;
    this.startingNoteIdName = startingNoteIdName;
    this.startingNoteDisplayName = startingNoteDisplayName;
    
    // Initialize data structures for this starting note
    this.maqamatData = {
      startingNoteIdName,
      startingNoteDisplayName,
      maqamatModulations: [],
    };
    this.ajnasData = {
      startingNoteIdName,
      startingNoteDisplayName,
      ajnasModulations: [],
    };
    
    // Create separate writers for each file type
    this.maqamatWriter = this.createWriter(maqamatFilePath, logger, tuningSystemId, 'maqamat');
    this.ajnasWriter = this.createWriter(ajnasFilePath, logger, tuningSystemId, 'ajnas');
    
    // Write the starting note section immediately
    this.writeStartingNoteHeader();
  }

  /**
   * Create a writer with modified header for split files
   */
  private createWriter(
    filePath: string,
    logger: LogWriter,
    tuningSystemId: string,
    type: 'maqamat' | 'ajnas'
  ): IncrementalJsonWriter {
    logger.log(`    Creating ${type} file: ${filePath}`);
    
    const header = `{\n` +
      `  "id": ${JSON.stringify(tuningSystemId)},\n` +
      `  "version": ${JSON.stringify(new Date().toISOString())},\n` +
      `  "sourceVersions": ${JSON.stringify({
        maqamat: '2025-10-18T19:41:17.132Z',
        ajnas: '2025-10-18T19:34:26.343Z',
        tuningSystems: '2025-10-18T00:00:00.000Z',
      })},\n` +
      `  "statistics": null,\n` +
      `  "modulationData": [\n`;
    
    // Create writer using constructor (it will write a header)
    const writer = new IncrementalJsonWriter(filePath, logger, tuningSystemId);
    
    // Overwrite with our custom header
    fs.writeFileSync(filePath, header, 'utf-8');
    
    return writer;
  }

  /**
   * Write the starting note header section to both files
   */
  private writeStartingNoteHeader(): void {
    fs.appendFileSync(this.maqamatWriter['filePath'], '{\n', 'utf-8');
    fs.appendFileSync(this.maqamatWriter['filePath'], `  "startingNoteIdName": ${JSON.stringify(this.startingNoteIdName)},\n`, 'utf-8');
    fs.appendFileSync(this.maqamatWriter['filePath'], `  "startingNoteDisplayName": ${JSON.stringify(this.startingNoteDisplayName)},\n`, 'utf-8');
    fs.appendFileSync(this.maqamatWriter['filePath'], '  "maqamatModulations": [\n', 'utf-8');
    
    fs.appendFileSync(this.ajnasWriter['filePath'], '{\n', 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], `  "startingNoteIdName": ${JSON.stringify(this.startingNoteIdName)},\n`, 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], `  "startingNoteDisplayName": ${JSON.stringify(this.startingNoteDisplayName)},\n`, 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], '  "ajnasModulations": [\n', 'utf-8');
    
    this.maqamatWriter['isFirstMaqamInStartingNote'] = true;
    this.ajnasWriter['isFirstMaqamInStartingNote'] = true;
  }

  /**
   * Write a maqam entry to both files (split into maqamat and ajnas entries)
   */
  writeMaqamEntry(entry: MaqamModulationEntry): void {
    // Create maqamat entry
    const maqamatEntry: MaqamatModulationEntry = {
      maqamId: entry.maqamId,
      maqamIdName: entry.maqamIdName,
      maqamDisplayName: entry.maqamDisplayName,
      tonicIdName: entry.tonicIdName,
      tonicDisplayName: entry.tonicDisplayName,
      isTransposition: entry.isTransposition,
      maqamatModulations: entry.maqamatModulations,
      lowerOctaveModulations: {
        maqamatModulations: entry.lowerOctaveModulations.maqamatModulations,
      },
    };

    // Create ajnas entry
    const ajnasEntry: AjnasModulationEntry = {
      maqamId: entry.maqamId,
      maqamIdName: entry.maqamIdName,
      maqamDisplayName: entry.maqamDisplayName,
      tonicIdName: entry.tonicIdName,
      tonicDisplayName: entry.tonicDisplayName,
      isTransposition: entry.isTransposition,
      ajnasModulations: entry.ajnasModulations,
      lowerOctaveModulations: {
        ajnasModulations: entry.lowerOctaveModulations.ajnasModulations,
      },
    };

    // Write to maqamat file
    if (!this.maqamatWriter['isFirstMaqamInStartingNote']) {
      fs.appendFileSync(this.maqamatWriter['filePath'], ',\n', 'utf-8');
    }
    const maqamatJson = JSON.stringify(maqamatEntry, null, 2);
    const indentedMaqamat = maqamatJson.split('\n').map(line => '    ' + line).join('\n');
    fs.appendFileSync(this.maqamatWriter['filePath'], indentedMaqamat, 'utf-8');
    this.maqamatWriter['isFirstMaqamInStartingNote'] = false;
    this.maqamatWriter['writtenMaqamatCount']++;

    // Write to ajnas file
    if (!this.ajnasWriter['isFirstMaqamInStartingNote']) {
      fs.appendFileSync(this.ajnasWriter['filePath'], ',\n', 'utf-8');
    }
    const ajnasJson = JSON.stringify(ajnasEntry, null, 2);
    const indentedAjnas = ajnasJson.split('\n').map(line => '    ' + line).join('\n');
    fs.appendFileSync(this.ajnasWriter['filePath'], indentedAjnas, 'utf-8');
    this.ajnasWriter['isFirstMaqamInStartingNote'] = false;
    this.ajnasWriter['writtenMaqamatCount']++;

    // Store in memory for statistics
    this.maqamatData.maqamatModulations.push(maqamatEntry);
    this.ajnasData.ajnasModulations.push(ajnasEntry);
  }

  /**
   * Finish writing and calculate statistics for both files
   */
  finish(): void {
    // Close starting note section in both files
    fs.appendFileSync(this.maqamatWriter['filePath'], ']\n', 'utf-8');
    fs.appendFileSync(this.maqamatWriter['filePath'], '}\n', 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], ']\n', 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], '}\n', 'utf-8');

    // Close modulationData array (statistics is already in header, will be replaced)
    fs.appendFileSync(this.maqamatWriter['filePath'], ']\n', 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], ']\n', 'utf-8');

    // Close root objects
    fs.appendFileSync(this.maqamatWriter['filePath'], '}\n', 'utf-8');
    fs.appendFileSync(this.ajnasWriter['filePath'], '}\n', 'utf-8');

    // Calculate and update statistics for both files (single starting note)
    try {
      const maqamatStats = calculateMaqamatStatistics(this.maqamatData);
      const ajnasStats = calculateAjnasStatistics(this.ajnasData);

      // Update maqamat file statistics (replace ALL occurrences to handle any duplicates)
      let maqamatContent = fs.readFileSync(this.maqamatWriter['filePath'], 'utf-8');
      const maqamatStatsJson = JSON.stringify(maqamatStats, null, 2);
      maqamatContent = maqamatContent.replace(/"statistics":\s*null/g, `"statistics": ${maqamatStatsJson}`);
      fs.writeFileSync(this.maqamatWriter['filePath'], maqamatContent, 'utf-8');

      // Update ajnas file statistics (replace ALL occurrences to handle any duplicates)
      let ajnasContent = fs.readFileSync(this.ajnasWriter['filePath'], 'utf-8');
      const ajnasStatsJson = JSON.stringify(ajnasStats, null, 2);
      ajnasContent = ajnasContent.replace(/"statistics":\s*null/g, `"statistics": ${ajnasStatsJson}`);
      fs.writeFileSync(this.ajnasWriter['filePath'], ajnasContent, 'utf-8');
    } catch (error: any) {
      this.logger.error(`    ⚠️  Warning: Could not update statistics: ${error.message}`);
    }
  }

  /**
   * Close both files
   */
  close(): void {
    // Files are already closed by finish()
  }
}

// Logging setup
interface LogWriter {
  log: (message: string) => void;
  error: (message: string) => void;
  close: () => void;
}

function createLogWriter(logFilePath: string): LogWriter {
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  let isClosed = false;
  
  const timestamp = () => new Date().toISOString();
  
  return {
    log: (message: string) => {
      const logMessage = `[${timestamp()}] ${message}\n`;
      process.stdout.write(message + '\n');
      if (!isClosed && !logStream.destroyed) {
        try {
          logStream.write(logMessage);
        } catch (error) {
          // Ignore write errors after stream is closed
        }
      }
    },
    error: (message: string) => {
      const logMessage = `[${timestamp()}] ERROR: ${message}\n`;
      process.stderr.write(message + '\n');
      if (!isClosed && !logStream.destroyed) {
        try {
          logStream.write(logMessage);
        } catch (error) {
          // Ignore write errors after stream is closed
        }
      }
    },
    close: () => {
      if (!isClosed) {
        isClosed = true;
        try {
          logStream.end();
        } catch (error) {
          // Ignore errors when closing
        }
      }
    }
  };
}

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

// Combined entry type (for backward compatibility during migration)
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

// Split entry types for separate files
interface MaqamatModulationEntry {
  maqamId: string;
  maqamIdName: string;
  maqamDisplayName: string;
  tonicIdName: string;
  tonicDisplayName: string;
  isTransposition: boolean;
  maqamatModulations: SerializedModulations;
  lowerOctaveModulations: {
    maqamatModulations: SerializedModulations;
  };
}

interface AjnasModulationEntry {
  maqamId: string;
  maqamIdName: string;
  maqamDisplayName: string;
  tonicIdName: string;
  tonicDisplayName: string;
  isTransposition: boolean;
  ajnasModulations: SerializedModulations;
  lowerOctaveModulations: {
    ajnasModulations: SerializedModulations;
  };
}

interface StartingNoteData {
  startingNoteIdName: string;
  startingNoteDisplayName: string;
  maqamatModulations: MaqamModulationEntry[];
}

// Split starting note data types
interface MaqamatStartingNoteData {
  startingNoteIdName: string;
  startingNoteDisplayName: string;
  maqamatModulations: MaqamatModulationEntry[];
}

interface AjnasStartingNoteData {
  startingNoteIdName: string;
  startingNoteDisplayName: string;
  ajnasModulations: AjnasModulationEntry[];
}

interface DegreeBreakdown {
  firstDegree: number;
  thirdDegree: number;
  altThirdDegree: number;
  fourthDegree: number;
  fifthDegree: number;
  sixthDegreeAsc: number;
  sixthDegreeDesc: number;
  sixthDegreeIfNoThird: number;
}

// Combined stats (for backward compatibility)
interface ModulationStats {
  totalMaqamatModulations: number;
  totalAjnasModulations: number;
  averageMaqamatModulationsPerMaqam: number;
  averageAjnasModulationsPerMaqam: number;
  medianMaqamatModulationsPerMaqam: number;
  medianAjnasModulationsPerMaqam: number;
  minMaqamatModulations: number;
  maxMaqamatModulations: number;
  minAjnasModulations: number;
  maxAjnasModulations: number;
  stdDevMaqamatModulations: number;
  stdDevAjnasModulations: number;
  maqamatByDegree: DegreeBreakdown;
  ajnasByDegree: DegreeBreakdown;
}

// Split stats for separate files
interface MaqamatModulationStats {
  totalModulations: number;
  averageModulationsPerMaqam: number;
  medianModulationsPerMaqam: number;
  minModulations: number;
  maxModulations: number;
  stdDevModulations: number;
  byDegree: DegreeBreakdown;
}

interface AjnasModulationStats {
  totalModulations: number;
  averageModulationsPerMaqam: number;
  medianModulationsPerMaqam: number;
  minModulations: number;
  maxModulations: number;
  stdDevModulations: number;
  byDegree: DegreeBreakdown;
}

interface StatisticsSummary {
  totalStartingNotes: number;
  totalUniqueMaqamat: number;
  totalTranspositions: number;
  modulations: ModulationStats;
  byStartingNote: {
    startingNote: string;
    maqamatCount: number;          // Maqamat in original form
    transposedCount: number;       // Transposed maqamat
    allMaqamatCount: number;       // Total (maqamatCount + transposedCount)
    modulationStats: ModulationStats;
  }[];
}

// Split statistics summaries
interface MaqamatStatisticsSummary {
  totalStartingNotes: number;
  totalUniqueMaqamat: number;
  totalTranspositions: number;
  modulations: MaqamatModulationStats;
  byStartingNote: {
    startingNote: string;
    maqamatCount: number;
    transposedCount: number;
    allMaqamatCount: number;
    modulationStats: MaqamatModulationStats;
  }[];
}

interface AjnasStatisticsSummary {
  totalStartingNotes: number;
  totalUniqueMaqamat: number;
  totalTranspositions: number;
  modulations: AjnasModulationStats;
  byStartingNote: {
    startingNote: string;
    maqamatCount: number;
    transposedCount: number;
    allMaqamatCount: number;
    modulationStats: AjnasModulationStats;
  }[];
}

interface ModulationDataFile {
  id: string;
  version: string;
  sourceVersions: {
    maqamat: string;
    ajnas: string;
    tuningSystems: string;
  };
  statistics: StatisticsSummary;
  modulationData: StartingNoteData[];
}

// Split file types
interface MaqamatModulationDataFile {
  id: string;
  version: string;
  sourceVersions: {
    maqamat: string;
    ajnas: string;
    tuningSystems: string;
  };
  statistics: MaqamatStatisticsSummary;
  modulationData: MaqamatStartingNoteData[];
}

interface AjnasModulationDataFile {
  id: string;
  version: string;
  sourceVersions: {
    maqamat: string;
    ajnas: string;
    tuningSystems: string;
  };
  statistics: AjnasStatisticsSummary;
  modulationData: AjnasStartingNoteData[];
}

/**
 * Calculate median of an array of numbers
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
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
 * Calculate modulation statistics for a single maqam entry
 * Note: At per-maqam level (n=1), average=median=min=max=total, stdDev=0
 */
function calculateModulationStats(maqamEntry: MaqamModulationEntry): ModulationStats {
  const maqamatMods = maqamEntry.maqamatModulations;
  const ajnasMods = maqamEntry.ajnasModulations;

  const totalMaqamatModulations =
    maqamatMods.firstDegree.length +
    maqamatMods.thirdDegree.length +
    maqamatMods.altThirdDegree.length +
    maqamatMods.fourthDegree.length +
    maqamatMods.fifthDegree.length +
    maqamatMods.sixthDegreeAsc.length +
    maqamatMods.sixthDegreeDesc.length +
    maqamatMods.sixthDegreeIfNoThird.length;

  const totalAjnasModulations =
    ajnasMods.firstDegree.length +
    ajnasMods.thirdDegree.length +
    ajnasMods.altThirdDegree.length +
    ajnasMods.fourthDegree.length +
    ajnasMods.fifthDegree.length +
    ajnasMods.sixthDegreeAsc.length +
    ajnasMods.sixthDegreeDesc.length +
    ajnasMods.sixthDegreeIfNoThird.length;

  return {
    totalMaqamatModulations,
    totalAjnasModulations,
    // For single maqam (n=1), all central tendency measures equal the total
    averageMaqamatModulationsPerMaqam: totalMaqamatModulations,
    averageAjnasModulationsPerMaqam: totalAjnasModulations,
    medianMaqamatModulationsPerMaqam: totalMaqamatModulations,
    medianAjnasModulationsPerMaqam: totalAjnasModulations,
    minMaqamatModulations: totalMaqamatModulations,
    maxMaqamatModulations: totalMaqamatModulations,
    minAjnasModulations: totalAjnasModulations,
    maxAjnasModulations: totalAjnasModulations,
    // No variation with single value
    stdDevMaqamatModulations: 0,
    stdDevAjnasModulations: 0,
    maqamatByDegree: {
      firstDegree: maqamatMods.firstDegree.length,
      thirdDegree: maqamatMods.thirdDegree.length,
      altThirdDegree: maqamatMods.altThirdDegree.length,
      fourthDegree: maqamatMods.fourthDegree.length,
      fifthDegree: maqamatMods.fifthDegree.length,
      sixthDegreeAsc: maqamatMods.sixthDegreeAsc.length,
      sixthDegreeDesc: maqamatMods.sixthDegreeDesc.length,
      sixthDegreeIfNoThird: maqamatMods.sixthDegreeIfNoThird.length,
    },
    ajnasByDegree: {
      firstDegree: ajnasMods.firstDegree.length,
      thirdDegree: ajnasMods.thirdDegree.length,
      altThirdDegree: ajnasMods.altThirdDegree.length,
      fourthDegree: ajnasMods.fourthDegree.length,
      fifthDegree: ajnasMods.fifthDegree.length,
      sixthDegreeAsc: ajnasMods.sixthDegreeAsc.length,
      sixthDegreeDesc: ajnasMods.sixthDegreeDesc.length,
      sixthDegreeIfNoThird: ajnasMods.sixthDegreeIfNoThird.length,
    }
  };
}

/**
 * Calculate aggregate modulation statistics for a starting note
 */
function calculateAggregateModulationStats(startingNoteData: StartingNoteData): ModulationStats {
  const allStats = startingNoteData.maqamatModulations.map(calculateModulationStats);

  const totalMaqamatModulations = allStats.reduce((sum, s) => sum + s.totalMaqamatModulations, 0);
  const totalAjnasModulations = allStats.reduce((sum, s) => sum + s.totalAjnasModulations, 0);
  const maqamCount = startingNoteData.maqamatModulations.length;

  // Extract arrays of modulation counts for distribution analysis
  const maqamatCounts = allStats.map(s => s.totalMaqamatModulations);
  const ajnasCounts = allStats.map(s => s.totalAjnasModulations);

  // Calculate distribution metrics
  const avgMaqamat = maqamCount > 0 ? totalMaqamatModulations / maqamCount : 0;
  const avgAjnas = maqamCount > 0 ? totalAjnasModulations / maqamCount : 0;

  return {
    totalMaqamatModulations,
    totalAjnasModulations,
    averageMaqamatModulationsPerMaqam: avgMaqamat,
    averageAjnasModulationsPerMaqam: avgAjnas,
    medianMaqamatModulationsPerMaqam: calculateMedian(maqamatCounts),
    medianAjnasModulationsPerMaqam: calculateMedian(ajnasCounts),
    minMaqamatModulations: maqamatCounts.length > 0 ? Math.min(...maqamatCounts) : 0,
    maxMaqamatModulations: maqamatCounts.length > 0 ? Math.max(...maqamatCounts) : 0,
    minAjnasModulations: ajnasCounts.length > 0 ? Math.min(...ajnasCounts) : 0,
    maxAjnasModulations: ajnasCounts.length > 0 ? Math.max(...ajnasCounts) : 0,
    stdDevMaqamatModulations: calculateStdDev(maqamatCounts, avgMaqamat),
    stdDevAjnasModulations: calculateStdDev(ajnasCounts, avgAjnas),
    maqamatByDegree: {
      firstDegree: allStats.reduce((sum, s) => sum + s.maqamatByDegree.firstDegree, 0),
      thirdDegree: allStats.reduce((sum, s) => sum + s.maqamatByDegree.thirdDegree, 0),
      altThirdDegree: allStats.reduce((sum, s) => sum + s.maqamatByDegree.altThirdDegree, 0),
      fourthDegree: allStats.reduce((sum, s) => sum + s.maqamatByDegree.fourthDegree, 0),
      fifthDegree: allStats.reduce((sum, s) => sum + s.maqamatByDegree.fifthDegree, 0),
      sixthDegreeAsc: allStats.reduce((sum, s) => sum + s.maqamatByDegree.sixthDegreeAsc, 0),
      sixthDegreeDesc: allStats.reduce((sum, s) => sum + s.maqamatByDegree.sixthDegreeDesc, 0),
      sixthDegreeIfNoThird: allStats.reduce((sum, s) => sum + s.maqamatByDegree.sixthDegreeIfNoThird, 0),
    },
    ajnasByDegree: {
      firstDegree: allStats.reduce((sum, s) => sum + s.ajnasByDegree.firstDegree, 0),
      thirdDegree: allStats.reduce((sum, s) => sum + s.ajnasByDegree.thirdDegree, 0),
      altThirdDegree: allStats.reduce((sum, s) => sum + s.ajnasByDegree.altThirdDegree, 0),
      fourthDegree: allStats.reduce((sum, s) => sum + s.ajnasByDegree.fourthDegree, 0),
      fifthDegree: allStats.reduce((sum, s) => sum + s.ajnasByDegree.fifthDegree, 0),
      sixthDegreeAsc: allStats.reduce((sum, s) => sum + s.ajnasByDegree.sixthDegreeAsc, 0),
      sixthDegreeDesc: allStats.reduce((sum, s) => sum + s.ajnasByDegree.sixthDegreeDesc, 0),
      sixthDegreeIfNoThird: allStats.reduce((sum, s) => sum + s.ajnasByDegree.sixthDegreeIfNoThird, 0),
    }
  };
}

/**
 * Calculate overall statistics for the entire modulation file
 */
function calculateStatistics(modulationData: StartingNoteData[]): StatisticsSummary {
  const uniqueMaqamat = new Set<string>();
  let totalTranspositions = 0;

  const byStartingNote = modulationData.map(startingNoteData => {
    const allMaqamatCount = startingNoteData.maqamatModulations.length;
    let maqamatCount = 0;      // Maqamat in original form
    let transposedCount = 0;   // Transposed maqamat

    startingNoteData.maqamatModulations.forEach(maqam => {
      uniqueMaqamat.add(maqam.maqamIdName);
      totalTranspositions++;
      if (maqam.isTransposition) {
        transposedCount++;
      } else {
        maqamatCount++;
      }
    });

    const modulationStats = calculateAggregateModulationStats(startingNoteData);

    return {
      startingNote: startingNoteData.startingNoteDisplayName,
      maqamatCount,           // Original form maqamat
      transposedCount,        // Transposed maqamat
      allMaqamatCount,        // Total (maqamatCount + transposedCount)
      modulationStats,
    };
  });

  // Calculate aggregate modulation stats across all starting notes
  const totalMaqamatMods = byStartingNote.reduce((sum, s) => sum + s.modulationStats.totalMaqamatModulations, 0);
  const totalAjnasMods = byStartingNote.reduce((sum, s) => sum + s.modulationStats.totalAjnasModulations, 0);

  // Collect arrays of modulation counts across all maqamat in all starting notes
  const allMaqamatCounts: number[] = [];
  const allAjnasCounts: number[] = [];

  modulationData.forEach(startingNoteData => {
    startingNoteData.maqamatModulations.forEach(maqamEntry => {
      const stats = calculateModulationStats(maqamEntry);
      allMaqamatCounts.push(stats.totalMaqamatModulations);
      allAjnasCounts.push(stats.totalAjnasModulations);
    });
  });

  // Calculate distribution metrics
  const avgMaqamat = totalTranspositions > 0 ? totalMaqamatMods / totalTranspositions : 0;
  const avgAjnas = totalTranspositions > 0 ? totalAjnasMods / totalTranspositions : 0;

  const aggregateModulations: ModulationStats = {
    totalMaqamatModulations: totalMaqamatMods,
    totalAjnasModulations: totalAjnasMods,
    averageMaqamatModulationsPerMaqam: avgMaqamat,
    averageAjnasModulationsPerMaqam: avgAjnas,
    medianMaqamatModulationsPerMaqam: calculateMedian(allMaqamatCounts),
    medianAjnasModulationsPerMaqam: calculateMedian(allAjnasCounts),
    minMaqamatModulations: allMaqamatCounts.length > 0 ? Math.min(...allMaqamatCounts) : 0,
    maxMaqamatModulations: allMaqamatCounts.length > 0 ? Math.max(...allMaqamatCounts) : 0,
    minAjnasModulations: allAjnasCounts.length > 0 ? Math.min(...allAjnasCounts) : 0,
    maxAjnasModulations: allAjnasCounts.length > 0 ? Math.max(...allAjnasCounts) : 0,
    stdDevMaqamatModulations: calculateStdDev(allMaqamatCounts, avgMaqamat),
    stdDevAjnasModulations: calculateStdDev(allAjnasCounts, avgAjnas),
    maqamatByDegree: {
      firstDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.firstDegree, 0),
      thirdDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.thirdDegree, 0),
      altThirdDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.altThirdDegree, 0),
      fourthDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.fourthDegree, 0),
      fifthDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.fifthDegree, 0),
      sixthDegreeAsc: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.sixthDegreeAsc, 0),
      sixthDegreeDesc: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.sixthDegreeDesc, 0),
      sixthDegreeIfNoThird: byStartingNote.reduce((sum, s) => sum + s.modulationStats.maqamatByDegree.sixthDegreeIfNoThird, 0),
    },
    ajnasByDegree: {
      firstDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.firstDegree, 0),
      thirdDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.thirdDegree, 0),
      altThirdDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.altThirdDegree, 0),
      fourthDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.fourthDegree, 0),
      fifthDegree: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.fifthDegree, 0),
      sixthDegreeAsc: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.sixthDegreeAsc, 0),
      sixthDegreeDesc: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.sixthDegreeDesc, 0),
      sixthDegreeIfNoThird: byStartingNote.reduce((sum, s) => sum + s.modulationStats.ajnasByDegree.sixthDegreeIfNoThird, 0),
    }
  };

  return {
    totalStartingNotes: modulationData.length,
    totalUniqueMaqamat: uniqueMaqamat.size,
    totalTranspositions,
    modulations: aggregateModulations,
    byStartingNote,
  };
}

/**
 * Calculate statistics for maqamat modulations for a single starting note
 */
function calculateMaqamatStatistics(
  startingNoteData: MaqamatStartingNoteData
): MaqamatStatisticsSummary {
  const uniqueMaqamat = new Set<string>();
  let totalTranspositions = 0;
  const allCounts: number[] = [];

  const allMaqamatCount = startingNoteData.maqamatModulations.length;
  let maqamatCount = 0;
  let transposedCount = 0;

  startingNoteData.maqamatModulations.forEach(maqam => {
    uniqueMaqamat.add(maqam.maqamIdName);
    totalTranspositions++;
    if (maqam.isTransposition) {
      transposedCount++;
    } else {
      maqamatCount++;
    }

    const totalMods = 
      maqam.maqamatModulations.firstDegree.length +
      maqam.maqamatModulations.thirdDegree.length +
      maqam.maqamatModulations.altThirdDegree.length +
      maqam.maqamatModulations.fourthDegree.length +
      maqam.maqamatModulations.fifthDegree.length +
      maqam.maqamatModulations.sixthDegreeAsc.length +
      maqam.maqamatModulations.sixthDegreeDesc.length +
      maqam.maqamatModulations.sixthDegreeIfNoThird.length +
      maqam.lowerOctaveModulations.maqamatModulations.firstDegree.length +
      maqam.lowerOctaveModulations.maqamatModulations.thirdDegree.length +
      maqam.lowerOctaveModulations.maqamatModulations.altThirdDegree.length +
      maqam.lowerOctaveModulations.maqamatModulations.fourthDegree.length +
      maqam.lowerOctaveModulations.maqamatModulations.fifthDegree.length +
      maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeAsc.length +
      maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeDesc.length +
      maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeIfNoThird.length;
    allCounts.push(totalMods);
  });

  const counts = startingNoteData.maqamatModulations.map(maqam =>
    maqam.maqamatModulations.firstDegree.length +
    maqam.maqamatModulations.thirdDegree.length +
    maqam.maqamatModulations.altThirdDegree.length +
    maqam.maqamatModulations.fourthDegree.length +
    maqam.maqamatModulations.fifthDegree.length +
    maqam.maqamatModulations.sixthDegreeAsc.length +
    maqam.maqamatModulations.sixthDegreeDesc.length +
    maqam.maqamatModulations.sixthDegreeIfNoThird.length +
    maqam.lowerOctaveModulations.maqamatModulations.firstDegree.length +
    maqam.lowerOctaveModulations.maqamatModulations.thirdDegree.length +
    maqam.lowerOctaveModulations.maqamatModulations.altThirdDegree.length +
    maqam.lowerOctaveModulations.maqamatModulations.fourthDegree.length +
    maqam.lowerOctaveModulations.maqamatModulations.fifthDegree.length +
    maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeAsc.length +
    maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeDesc.length +
    maqam.lowerOctaveModulations.maqamatModulations.sixthDegreeIfNoThird.length
  );

  const totalMods = counts.reduce((sum, c) => sum + c, 0);
  const avgMods = counts.length > 0 ? totalMods / counts.length : 0;
  const median = calculateMedian(counts);
  const stdDev = calculateStdDev(counts, avgMods);

  // Calculate by degree
  const byDegree: DegreeBreakdown = {
    firstDegree: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.firstDegree.length + 
      m.lowerOctaveModulations.maqamatModulations.firstDegree.length, 0),
    thirdDegree: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.thirdDegree.length + 
      m.lowerOctaveModulations.maqamatModulations.thirdDegree.length, 0),
    altThirdDegree: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.altThirdDegree.length + 
      m.lowerOctaveModulations.maqamatModulations.altThirdDegree.length, 0),
    fourthDegree: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.fourthDegree.length + 
      m.lowerOctaveModulations.maqamatModulations.fourthDegree.length, 0),
    fifthDegree: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.fifthDegree.length + 
      m.lowerOctaveModulations.maqamatModulations.fifthDegree.length, 0),
    sixthDegreeAsc: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.sixthDegreeAsc.length + 
      m.lowerOctaveModulations.maqamatModulations.sixthDegreeAsc.length, 0),
    sixthDegreeDesc: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.sixthDegreeDesc.length + 
      m.lowerOctaveModulations.maqamatModulations.sixthDegreeDesc.length, 0),
    sixthDegreeIfNoThird: startingNoteData.maqamatModulations.reduce((sum, m) => 
      sum + m.maqamatModulations.sixthDegreeIfNoThird.length + 
      m.lowerOctaveModulations.maqamatModulations.sixthDegreeIfNoThird.length, 0),
  };

  return {
    totalStartingNotes: 1,
    totalUniqueMaqamat: uniqueMaqamat.size,
    totalTranspositions,
    modulations: {
      totalModulations: totalMods,
      averageModulationsPerMaqam: avgMods,
      medianModulationsPerMaqam: median,
      minModulations: allCounts.length > 0 ? Math.min(...allCounts) : 0,
      maxModulations: allCounts.length > 0 ? Math.max(...allCounts) : 0,
      stdDevModulations: stdDev,
      byDegree,
    },
    byStartingNote: [{
      startingNote: startingNoteData.startingNoteDisplayName,
      maqamatCount,
      transposedCount,
      allMaqamatCount,
      modulationStats: {
        totalModulations: totalMods,
        averageModulationsPerMaqam: avgMods,
        medianModulationsPerMaqam: median,
        minModulations: counts.length > 0 ? Math.min(...counts) : 0,
        maxModulations: counts.length > 0 ? Math.max(...counts) : 0,
        stdDevModulations: stdDev,
        byDegree,
      },
    }],
  };
}

/**
 * Calculate statistics for ajnas modulations for a single starting note
 */
function calculateAjnasStatistics(
  startingNoteData: AjnasStartingNoteData
): AjnasStatisticsSummary {
  const uniqueMaqamat = new Set<string>();
  let totalTranspositions = 0;
  const allCounts: number[] = [];

  const allMaqamatCount = startingNoteData.ajnasModulations.length;
  let maqamatCount = 0;
  let transposedCount = 0;

  startingNoteData.ajnasModulations.forEach(maqam => {
    uniqueMaqamat.add(maqam.maqamIdName);
    totalTranspositions++;
    if (maqam.isTransposition) {
      transposedCount++;
    } else {
      maqamatCount++;
    }

    const totalMods = 
      maqam.ajnasModulations.firstDegree.length +
      maqam.ajnasModulations.thirdDegree.length +
      maqam.ajnasModulations.altThirdDegree.length +
      maqam.ajnasModulations.fourthDegree.length +
      maqam.ajnasModulations.fifthDegree.length +
      maqam.ajnasModulations.sixthDegreeAsc.length +
      maqam.ajnasModulations.sixthDegreeDesc.length +
      maqam.ajnasModulations.sixthDegreeIfNoThird.length +
      maqam.lowerOctaveModulations.ajnasModulations.firstDegree.length +
      maqam.lowerOctaveModulations.ajnasModulations.thirdDegree.length +
      maqam.lowerOctaveModulations.ajnasModulations.altThirdDegree.length +
      maqam.lowerOctaveModulations.ajnasModulations.fourthDegree.length +
      maqam.lowerOctaveModulations.ajnasModulations.fifthDegree.length +
      maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeAsc.length +
      maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeDesc.length +
      maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeIfNoThird.length;
    allCounts.push(totalMods);
  });

  const counts = startingNoteData.ajnasModulations.map(maqam =>
    maqam.ajnasModulations.firstDegree.length +
    maqam.ajnasModulations.thirdDegree.length +
    maqam.ajnasModulations.altThirdDegree.length +
    maqam.ajnasModulations.fourthDegree.length +
    maqam.ajnasModulations.fifthDegree.length +
    maqam.ajnasModulations.sixthDegreeAsc.length +
    maqam.ajnasModulations.sixthDegreeDesc.length +
    maqam.ajnasModulations.sixthDegreeIfNoThird.length +
    maqam.lowerOctaveModulations.ajnasModulations.firstDegree.length +
    maqam.lowerOctaveModulations.ajnasModulations.thirdDegree.length +
    maqam.lowerOctaveModulations.ajnasModulations.altThirdDegree.length +
    maqam.lowerOctaveModulations.ajnasModulations.fourthDegree.length +
    maqam.lowerOctaveModulations.ajnasModulations.fifthDegree.length +
    maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeAsc.length +
    maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeDesc.length +
    maqam.lowerOctaveModulations.ajnasModulations.sixthDegreeIfNoThird.length
  );

  const totalMods = counts.reduce((sum, c) => sum + c, 0);
  const avgMods = counts.length > 0 ? totalMods / counts.length : 0;
  const median = calculateMedian(counts);
  const stdDev = calculateStdDev(counts, avgMods);

  // Calculate by degree
  const byDegree: DegreeBreakdown = {
    firstDegree: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.firstDegree.length + 
      m.lowerOctaveModulations.ajnasModulations.firstDegree.length, 0),
    thirdDegree: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.thirdDegree.length + 
      m.lowerOctaveModulations.ajnasModulations.thirdDegree.length, 0),
    altThirdDegree: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.altThirdDegree.length + 
      m.lowerOctaveModulations.ajnasModulations.altThirdDegree.length, 0),
    fourthDegree: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.fourthDegree.length + 
      m.lowerOctaveModulations.ajnasModulations.fourthDegree.length, 0),
    fifthDegree: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.fifthDegree.length + 
      m.lowerOctaveModulations.ajnasModulations.fifthDegree.length, 0),
    sixthDegreeAsc: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.sixthDegreeAsc.length + 
      m.lowerOctaveModulations.ajnasModulations.sixthDegreeAsc.length, 0),
    sixthDegreeDesc: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.sixthDegreeDesc.length + 
      m.lowerOctaveModulations.ajnasModulations.sixthDegreeDesc.length, 0),
    sixthDegreeIfNoThird: startingNoteData.ajnasModulations.reduce((sum, m) => 
      sum + m.ajnasModulations.sixthDegreeIfNoThird.length + 
      m.lowerOctaveModulations.ajnasModulations.sixthDegreeIfNoThird.length, 0),
  };

  return {
    totalStartingNotes: 1,
    totalUniqueMaqamat: uniqueMaqamat.size,
    totalTranspositions,
    modulations: {
      totalModulations: totalMods,
      averageModulationsPerMaqam: avgMods,
      medianModulationsPerMaqam: median,
      minModulations: allCounts.length > 0 ? Math.min(...allCounts) : 0,
      maxModulations: allCounts.length > 0 ? Math.max(...allCounts) : 0,
      stdDevModulations: stdDev,
      byDegree,
    },
    byStartingNote: [{
      startingNote: startingNoteData.startingNoteDisplayName,
      maqamatCount,
      transposedCount,
      allMaqamatCount,
      modulationStats: {
        totalModulations: totalMods,
        averageModulationsPerMaqam: avgMods,
        medianModulationsPerMaqam: median,
        minModulations: counts.length > 0 ? Math.min(...counts) : 0,
        maxModulations: counts.length > 0 ? Math.max(...counts) : 0,
        stdDevModulations: stdDev,
        byDegree,
      },
    }],
  };
}

/**
 * Generate modulation data for a single tuning system with incremental writing
 * Supports resuming from partial files
 */
function generateModulationsForTuningSystem(
  tuningSystem: any,
  maqamatData: any[],
  ajnasData: any[],
  logger: LogWriter,
  outputPath: string,
  force: boolean,
  tolerance: number = 5
): void {
  logger.log(`\nProcessing tuning system: ${tuningSystem.getId()}`);

  // Create output directory path
  const outputDir = path.dirname(outputPath);
  const tuningSystemId = tuningSystem.getId();

  // Get all starting notes for this tuning system
  const startingNotes = tuningSystem.getNoteNameSets().map((set: any) => set[0]);
  logger.log(`  Starting notes: ${startingNotes.length}`);

  let filesCreated = 0;
  let filesSkipped = 0;

  for (const startingNote of startingNotes) {
    const startingNoteIdName = standardizeText(startingNote);
    logger.log(`    Processing starting note: ${startingNote}`);

    // Create file paths for this starting note
    const maqamatPath = path.join(
      outputDir,
      `${tuningSystemId}-${startingNoteIdName}-maqamat-modulations.json`
    );
    const ajnasPath = path.join(
      outputDir,
      `${tuningSystemId}-${startingNoteIdName}-ajnas-modulations.json`
    );

    // Check if both files already exist and are complete
    if (!force && fs.existsSync(maqamatPath) && fs.existsSync(ajnasPath)) {
      try {
        const maqamatContent = fs.readFileSync(maqamatPath, 'utf-8');
        const ajnasContent = fs.readFileSync(ajnasPath, 'utf-8');
        const maqamatFile = JSON.parse(maqamatContent) as MaqamatModulationDataFile;
        const ajnasFile = JSON.parse(ajnasContent) as AjnasModulationDataFile;
        
        // Check if both have statistics (indicating they're complete)
        if (maqamatFile.statistics && ajnasFile.statistics) {
          logger.log(`      ⊙ Files already exist and are complete, skipping`);
          filesSkipped += 2;
          continue;
        }
      } catch (error) {
        // Files exist but may be corrupted, regenerate
        logger.log(`      ⚠️  Files exist but may be incomplete, regenerating...`);
      }
    }

    // Create dual writer for this starting note
    const writer = new DualIncrementalJsonWriter(
      maqamatPath,
      ajnasPath,
      logger,
      tuningSystemId,
      startingNoteIdName,
      startingNote
    );

    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

    const startingNoteData: StartingNoteData = {
      startingNoteIdName,
      startingNoteDisplayName: startingNote,
      maqamatModulations: [],
    };

    let maqamCount = 0;
    let processedMaqams = 0;

    for (const maqamData of maqamatData) {
      processedMaqams++;
      if (processedMaqams % 10 === 0) {
        logger.log(`        Progress: ${processedMaqams}/${maqamatData.length} maqāmāt checked...`);
      }

      // Check if maqam is possible with THIS specific starting note's pitch classes
      const noteNames = pitchClasses.map((pc) => pc.noteName);
      const isAvailable = maqamData.isMaqamPossible(noteNames);

      if (!isAvailable) continue;

      // Calculate transpositions
      const transpositions = calculateMaqamTranspositions(
        pitchClasses,
        ajnasData,
        maqamData,
        true, // withTahlil
        tolerance
      );

      logger.log(`          Found ${transpositions.length} transpositions for ${maqamData.getName()}`);

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

        // Write immediately to file (incremental)
        writer.writeMaqamEntry(maqamEntry);
        
        // Also keep in memory for statistics calculation
        startingNoteData.maqamatModulations.push(maqamEntry);
        maqamCount++;
      }
    }

    logger.log(`      Generated ${maqamCount} maqam transpositions`);

    // Finish writing (calculates and writes statistics, closes files)
    writer.finish();
    writer.close();

    // Get file sizes
    const maqamatStats = fs.statSync(maqamatPath);
    const ajnasStats = fs.statSync(ajnasPath);
    const maqamatSizeMB = (maqamatStats.size / (1024 * 1024)).toFixed(2);
    const ajnasSizeMB = (ajnasStats.size / (1024 * 1024)).toFixed(2);
    const maqamatSizeKB = (maqamatStats.size / 1024).toFixed(2);
    const ajnasSizeKB = (ajnasStats.size / 1024).toFixed(2);
    
    // Use MB if > 1MB, otherwise KB
    const maqamatSizeStr = parseFloat(maqamatSizeMB) >= 1.0 
      ? `${maqamatSizeMB} MB` 
      : `${maqamatSizeKB} KB`;
    const ajnasSizeStr = parseFloat(ajnasSizeMB) >= 1.0 
      ? `${ajnasSizeMB} MB` 
      : `${ajnasSizeKB} KB`;
    
    logger.log(`      ✓ Created ${path.basename(maqamatPath)} (${maqamatSizeStr})`);
    logger.log(`      ✓ Created ${path.basename(ajnasPath)} (${ajnasSizeStr})`);
    filesCreated += 2;
  }

  logger.log(`  ✓ Completed: ${filesCreated} files created, ${filesSkipped} files skipped`);
}

/**
 * Parse command line arguments
 */
function parseArgs(): { ids?: string[]; all: boolean; force: boolean } {
  const args = process.argv.slice(2);

  // Check for --force flag
  const force = args.includes('--force') || args.includes('-f');

  if (args.length === 0) {
    return { all: true, force };
  }

  // Support --ids flag with comma-separated list
  const idsIndex = args.findIndex(arg => arg === '--ids' || arg === '-i');
  if (idsIndex >= 0 && args[idsIndex + 1]) {
    const ids = args[idsIndex + 1].split(',').map(id => id.trim());
    return { ids, all: false, force };
  }

  // Support --all flag
  if (args.includes('--all') || args.includes('-a')) {
    return { all: true, force };
  }

  // Filter out flag arguments to get IDs (only if --ids wasn't used)
  const nonFlagArgs = args.filter(arg =>
    !arg.startsWith('--') && !arg.startsWith('-')
  );

  // If we have non-flag arguments, treat them as IDs
  if (nonFlagArgs.length > 0) {
    return { ids: nonFlagArgs, all: false, force };
  }

  // Default to all if only flags were provided
  return { all: true, force };
}

/**
 * Format error for logging
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack || 'No stack trace available'}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error, null, 2);
}

/**
 * Main execution
 */
async function main() {
  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'data', 'modulations');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create log file with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFilePath = path.join(outputDir, `generate-modulations-${timestamp}.log`);
  const logger = createLogWriter(logFilePath);

  logger.log('=== Generate Modulations Script ===');
  logger.log(`Log file: ${logFilePath}\n`);

  // Parse command line arguments
  const { ids, all, force } = parseArgs();

  // Load data
  logger.log('Loading data...');
  const tuningSystems = getTuningSystems();
  const maqamatData = getMaqamat();
  const ajnasData = getAjnas();

  logger.log(`Loaded:`);
  logger.log(`  - ${tuningSystems.length} tuning systems`);
  logger.log(`  - ${maqamatData.length} maqamat`);
  logger.log(`  - ${ajnasData.length} ajnas`);

  // Filter tuning systems based on arguments
  let systemsToProcess = tuningSystems;

  if (!all && ids && ids.length > 0) {
    logger.log(`\nFiltering for specific tuning systems: ${ids.join(', ')}`);
    systemsToProcess = tuningSystems.filter(ts => ids.includes(ts.getId()));

    // Check if all requested IDs were found
    const foundIds = systemsToProcess.map(ts => ts.getId());
    const notFound = ids.filter(id => !foundIds.includes(id));
    if (notFound.length > 0) {
      logger.error(`\n⚠️  Warning: Could not find tuning systems: ${notFound.join(', ')}`);
    }
  }

  // Generate for all tuning systems
  logger.log('\nGenerating modulation data...');
  if (force) {
    logger.log('Force mode: Regenerating all files\n');
  } else {
    logger.log('Resume mode: Skipping existing files (use --force to regenerate)\n');
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{ tuningSystemId: string; error: string }> = [];

  logger.log(`Processing ${systemsToProcess.length} tuning system(s)...\n`);

  for (const tuningSystem of systemsToProcess) {
    const outputPath = path.join(outputDir, `${tuningSystem.getId()}-modulations.json`);

    try {
      // Generate and write incrementally (creates files per starting note)
      generateModulationsForTuningSystem(
        tuningSystem,
        maqamatData,
        ajnasData,
        logger,
        outputPath,
        force,
        5 // centsTolerance
      );

      // Function handles its own logging and file creation
      // Count as successful if no exception was thrown
      successCount++;
    } catch (error) {
      const errorMessage = formatError(error);
      const errorDetails = `  ✗ Error processing ${tuningSystem.getId()}:\n${errorMessage}`;
      logger.error(errorDetails);
      errors.push({
        tuningSystemId: tuningSystem.getId(),
        error: errorMessage
      });
      errorCount++;
      
      // If there was an error, partial files might be left behind
      // Leaving them allows manual inspection and potential resume
    }
  }

  logger.log('\n=== Summary ===');
  logger.log(`Successfully processed: ${successCount} tuning system(s)`);
  logger.log(`Errors: ${errorCount} tuning system(s)`);
  logger.log(`Note: Each tuning system generates 2 files per starting note (maqamat + ajnas)`);
  
  if (errors.length > 0) {
    logger.error('\n=== Error Details ===');
    errors.forEach((err, index) => {
      logger.error(`\nError ${index + 1}: ${err.tuningSystemId}`);
      logger.error(err.error);
    });
  }
  
  logger.log(`\nOutput directory: ${outputDir}`);
  logger.log(`Log file: ${logFilePath}`);
  
  // Close log file
  logger.close();
}

// Run the script
main().catch((error) => {
  const errorMessage = formatError(error);
  const fatalErrorMsg = `Fatal error:\n${errorMessage}`;
  console.error(fatalErrorMsg);
  
  // Try to write to a log file in the output directory
  try {
    const outputDir = path.join(process.cwd(), 'data', 'modulations');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFilePath = path.join(outputDir, `fatal-error-${timestamp}.log`);
    fs.writeFileSync(logFilePath, `[${new Date().toISOString()}] ${fatalErrorMsg}\n`, 'utf-8');
    console.error(`\nError details written to: ${logFilePath}`);
  } catch (logError) {
    // If we can't write to log file, just continue
  }
  
  process.exit(1);
});
