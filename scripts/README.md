# Digital Arabic Maqām Archive - Batch Export CLI

This script allows batch export of tuning system data in JSON format from the command line, providing the same comprehensive data structure as the web export modal.

## Quick Start

```bash
# List all available tuning systems
node scripts/batch-export.js --list-tuning-systems

# Export specific tuning system with full data including modulations
node scripts/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

## Usage

```bash
node scripts/batch-export.js [options]
```

### Required Options

- `--tuning-system, -t <id>` - Tuning system ID (use `"all"` for all systems)
- `--starting-note, -s <note>` - Starting note name (use `"all"` for all available notes)

### Optional Options

- `--output-dir, -o <dir>` - Output directory (default: `./exports`)
- `--help, -h` - Show help message
- `--list-tuning-systems` - List all available systems and starting notes

### Export Options

**Basic exports include only tuning system data and pitch classes by default.**

- `--include-ajnas-details` - Include ajnas details (default: false)
- `--include-maqamat-details` - Include maqamat details (default: false)
- `--include-maqamat-modulations` - Include maqamat modulations (default: false)
- `--include-ajnas-modulations` - Include ajnas modulations (default: false)

## Examples

### Basic Export (tuning system only)
```bash
# Export only tuning system data and pitch classes (~100KB)
node scripts/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh"
```

### Export with Ajnas and Maqamat
```bash
# Export with ajnas and maqamat data (~2MB)
node scripts/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details
```

### Complete Export (with modulations)
```bash
# Export with full modulation analysis (~3MB, recommended for research)
node scripts/batch-export.js \
  --tuning-system "IbnSīnā-(1037)" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

### Batch Exports
```bash
# Export all starting notes for one tuning system
node scripts/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "all"

# Export ALL tuning systems with ALL starting notes (many files!)
node scripts/batch-export.js \
  --tuning-system "all" \
  --starting-note "all"

# COMPLETE EXPORT - Everything possible (hundreds of files, many GB)
node scripts/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```


### Custom Output Directory
```bash
node scripts/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --output-dir "./my-exports"
```

## Output Files

Files are named with the pattern:
```
{TuningSystemID}_{StartingNote}_{Date}_{Options}.json
```

**Filenames are sanitized** - diacritics and non-standard characters are normalized for filesystem compatibility.

Examples:
- Basic: `Al-Farabi-(950g)_yegah_2025-09-24.json`
- With data: `Al-Farabi-(950g)_yegah_2025-09-24_ajnas_maqamat.json`
- Complete: `Al-Farabi-(950g)_yegah_2025-09-24_ajnas_maqamat_maqamat-mod_ajnas-mod.json`

**Batch exports** (using `--tuning-system "all"`) are organized in timestamped folders:
```
exports/batch_all_systems_2025-09-24/
├── Al-Farabi-(950g)_ushayran_2025-09-24.json
├── Al-Farabi-(950g)_yegah_2025-09-24.json
├── Al-Sabbagh-1950_rast_2025-09-24.json
└── ... (hundreds of files)
```

## Export Data Structure

The exported JSON contains:

- **exportInfo** - Timestamp and metadata
- **tuningSystemData** - Complete tuning system details with source references
- **summaryStats** - Statistics (pitch classes, transpositions, modulations)
- **pitchClassReference** - Full pitch class objects with frequencies, cents, MIDI
- **allAjnasData** - All ajnas with transpositions (if enabled)
- **allMaqamatData** - All maqamat with transpositions and modulations (if enabled)

## File Sizes

- Basic export (tuning system only): ~100KB
- With ajnas/maqamat: ~2MB
- With modulations: ~3MB per configuration
- Batch exports can generate many GB of data

## Requirements

The script automatically installs `tsx` if needed to run TypeScript code.

## Troubleshooting

**Tuning system not found:**
```bash
# List available systems first
node scripts/batch-export.js --list-tuning-systems
```

**Starting note not available:**
Each tuning system has specific starting notes. Use `--list-tuning-systems` to see available combinations.

**Large exports:**
Modulation calculations can take several minutes for complex tuning systems. Progress is shown during export.

**Progress indicators:**
The script provides detailed progress tracking including:
- System-by-system progress (`[2/32] Processing: Al-Farabi-(950g)`)
- Individual export progress (`(5/156) [2/3] → yegāh`)
- Export statistics (pitch classes, ajnas, maqamat counts)
- Overall completion percentage
- Remaining items countdown