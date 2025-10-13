# Digital Arabic Maqām Archive - Batch Export CLI

This script allows batch export of tuning system data in JSON format from the command line, providing the same comprehensive data structure as the web export modal.

## Quick Start

```bash
# List all available tuning systems
node scripts/batch-export/batch-export.js --list-tuning-systems

# Complete export of everything to music intelligence lab google drive repo

node /Users/khyamallami/Offline\ Files/vscode\ projects/DiArMaqAr/scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --output-dir "/Users/khyamallami/Library/CloudStorage/GoogleDrive-kallami@gmail.com/.shortcut-targets-by-id/1qLH9SFg6Xkhx04GTBa15eGUi6C5UvT02/music lab repo/Data" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations \
  --include-modulations-8vb

# Export specific tuning system with full data including modulations
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

## Usage

```bash
# From project root
node scripts/batch-export/batch-export.js [options]

# Or from scripts/batch-export directory
node batch-export.js [options]
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
- `--include-modulations-8vb` - Include lower octave (8vb) modulations for maqamat (default: false)

## Examples

### Basic Export (tuning system only)
```bash
# Export only tuning system data and pitch classes (~100KB)
node scripts/batch-export/batch-export.js \
  --tuning-system "al-Kindi-(874)" \
  --starting-note "yegāh"
```

### Export with Ajnas and Maqamat
```bash
# Export with ajnas and maqamat data (~2MB)
node scripts/batch-export/batch-export.js \
  --tuning-system "al-Kindi-(874)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details
```

### Complete Export (with modulations)
```bash
# Export with full modulation analysis (~3MB, recommended for research)
node scripts/batch-export/batch-export.js \
  --tuning-system "Ronzevalle-(1904)" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations
```

### Export with Octave Shift Modulations (8vb)
```bash
# Export with lower octave modulations for advanced analysis
node scripts/batch-export/batch-export.js \
  --tuning-system "al-Kindi-(874)" \
  --starting-note "yegāh" \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-modulations-8vb
```

### Batch Exports
```bash
# Export all starting notes for one tuning system
node scripts/batch-export/batch-export.js \
  --tuning-system "al-Kindi-(874)" \
  --starting-note "all"

# Export ALL tuning systems with ALL starting notes (many files!)
node scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all"

# COMPLETE EXPORT - Everything possible (hundreds of files, many GB)
node scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations \
  --include-modulations-8vb
```

### Custom Output Directory
```bash
node scripts/batch-export/batch-export.js \
  --tuning-system "al-Kindi-(874)" \
  --starting-note "yegāh" \
  --output-dir "./my-exports"
```

## Memory Optimization

The script automatically optimizes memory usage:

- **Automatic memory management**: Sets Node.js memory limit to 4GB
- **Garbage collection**: Forces cleanup between exports to prevent memory buildup
- **Progress-aware allocation**: Uses more memory for modulation processing when needed

For very large batch exports, the script handles memory efficiently without requiring manual intervention.

## Output Files

Files are named with the pattern:
```
{TuningSystemID}_{StartingNote}_{Date}_{Time}_{Options}.json
```

**Filenames are sanitized** - diacritics and non-standard characters are normalized for filesystem compatibility.

Examples:
- Basic: `al-Kindi-(874)_yegah_2025-09-29_12-15-30.json`
- With data: `al-Kindi-(874)_yegah_2025-09-29_12-15-30_ajnas_maqamat.json`
- Complete: `al-Kindi-(874)_yegah_2025-09-29_12-15-30_ajnas_maqamat_maqamat-mod_ajnas-mod.json`

**Batch exports** (using `--tuning-system "all"`) are organized in timestamped folders:
```
exports/batch_all_systems_2025-09-29/
├── Ronzevalle-(1904)_ushayran_2025-09-29_12-15-30.json
├── Ronzevalle-(1904)_yegah_2025-09-29_12-15-30.json
├── al-Kindi-(874)_ushayran_2025-09-29_12-15-30.json
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

### Octave Shift Modulations (8vb)

When `--include-modulations-8vb` is used, maqamat export data includes additional octave-shifted modulation data:

```json
{
  "maqamatModulations": {
    "modulations": {
      "modulationsOnFirstDegree": ["maqam_rast_rast"],
      "modulationsOnThirdDegree": ["maqam_hijaz_rast"]
    },
    "modulationsLowerOctave": {
      "modulationsOnFirstDegree8vb": ["maqam_rast_rast_8vb"],
      "modulationsOnThirdDegree8vb": ["maqam_hijaz_rast_8vb"]
    }
  }
}
```

**Important Notes:**
- Only **maqamat** get octave shift data - ajnas do not modulate FROM themselves
- All octave shift properties use the "8vb" suffix (musical notation for "octave below")
- This provides transposed modulation data shifted down one octave (-1 octave shift)

## Progress Tracking

The script provides detailed progress tracking with improved accuracy:

### Progress Distribution
- **Without modulations**: 1-9% setup, 10-40% ajnas, 50-75% maqamat, 90-98% finalization
- **With modulations**: 1-9% setup, 10-30% ajnas, 45-85% maqamat, 90-98% finalization

### Progress Information Includes
- System-by-system progress (`[2/32] Processing: al-Kindi-(874)`)
- Individual export progress (`(5/156) [2/3] → yegāh`)
- Real-time processing steps (`Processing maqam 15/41... (85%)`)
- Export statistics (pitch classes, ajnas, maqamat counts)
- Modulation counts when enabled
- Overall completion percentage
- Remaining items countdown

## File Sizes

- Basic export (tuning system only): ~100KB
- With ajnas/maqamat: ~2MB
- With modulations: ~3MB per configuration
- Batch exports can generate many GB of data

## Requirements

The script automatically installs and manages dependencies:
- **tsx**: TypeScript execution (installed automatically)
- **Node.js**: Version 18+ recommended for optimal memory handling

## Troubleshooting

**Tuning system not found:**
```bash
# List available systems first
node scripts/batch-export/batch-export.js --list-tuning-systems
```

**Starting note not available:**
Each tuning system has specific starting notes. Use `--list-tuning-systems` to see available combinations.

**Large exports taking too long:**
- Modulation calculations can take several minutes for complex tuning systems
- Progress is shown during export with improved accuracy
- Memory is automatically optimized to prevent crashes
- Consider exporting single systems first before attempting full batch exports

**Memory issues:**
The script now automatically handles memory optimization, but for very large exports:
- Use smaller batch sizes by exporting one tuning system at a time
- Disable modulations (`--include-maqamat-modulations` and `--include-ajnas-modulations`) for faster exports
- Monitor progress to see which processing step is taking the most time

## Performance Tips

1. **Start small**: Test with a single tuning system before batch exports
2. **Use modulations selectively**: They significantly increase processing time and file size
3. **Monitor progress**: The improved progress bars show exactly what's happening
4. **Batch organization**: Full batch exports create timestamped folders to organize hundreds of files




 Ishaqal-Mawsili-(850)
  al-Kindi-(874)
  IbnMunajjim-(912)
  al-Farabi-(950a)
  al-Farabi-(950b)
  al-Farabii-(950c)
  al-Farabi-(950d)
  al-Farabi-(950e)
  al-Farabi-(950f)
  al-Farabi-(950g)
  al-Farabi-(950h)
  al-Farabi-(950i)
  IbnSina-(1037)
  al-Urmawi-(1294a)
  al-Urmawi-(1294b)
  al-Ladhiqi-(1495)
  Anglo-European-(1700)
  Anglo-European-(1800)
  Meshshaqa-(1899)
  Ronzevalle-(1904)
  al-KhuliandRagheb-(1904)
  al-Dik-(1926a)
  al-Dik-(1926b)
  CairoCongressTuningCommittee-(1929)
  CairoCongressTuningCommittee-(1932a)
  CairoCongressTuningCommittee-(1932b)
  MashrafaandMukhtar-(1944)
  al-Sabbagh-(1950)
  al-Sabbagh-(1954)
  al-Laythi-(1965)
  Allami-(2022)
  Allami-(2024)
  Allami-(2025)