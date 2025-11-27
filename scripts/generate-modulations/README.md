# Generate Modulations Script

Pre-computes modulation data for all tuning systems and stores as JSON files in `data/modulations/`.

## Overview

This script generates pre-computed modulation relationships to avoid expensive runtime calculations. For each tuning system, it:

- Calculates modulations for all starting notes
- Includes both maqam-to-maqam and maqam-to-jins modulations
- Generates lower octave (8vb) variants
- Stores results as static JSON files

## Usage

```bash
npm run generate:modulations
```

## Output

Generates files in `data/modulations/` with two JSON files per tuning system + starting note combination (one for maqamat modulations, one for ajnas modulations):

```
data/modulations/
├── ronzevalle-(1904)-ushayran-maqamat-modulations.json
├── ronzevalle-(1904)-ushayran-ajnas-modulations.json
├── ronzevalle-(1904)-rast-maqamat-modulations.json
├── ronzevalle-(1904)-rast-ajnas-modulations.json
├── al-kindi-(874)-ushayran-maqamat-modulations.json
├── al-kindi-(874)-ushayran-ajnas-modulations.json
└── ... (tuning systems × starting notes × 2 total files)
```

**File naming format**: `{tuningSystemId}-{startingNoteIdName}-{type}-modulations.json`

Each file contains data for a single starting note, making files smaller and easier to handle.

## JSON Structure

Each tuning system + starting note combination generates two separate files:

### Maqamat Modulations File (`{tuningSystemId}-{startingNoteIdName}-maqamat-modulations.json`)

Contains only maqam-to-maqam modulations for a single starting note:

```json
{
  "id": "ronzevalle-(1904)",
  "version": "2025-11-24T12:00:00.000Z",
  "sourceVersions": {
    "maqamat": "2025-10-18T19:41:17.132Z",
    "ajnas": "2025-10-18T19:34:26.343Z",
    "tuningSystems": "2025-10-18T00:00:00.000Z"
  },
  "statistics": {
    "totalStartingNotes": 1,
    "totalUniqueMaqamat": 60,
    "totalTranspositions": 60,
    "modulations": {
      "totalModulations": 1763,
      "averageModulationsPerMaqam": 29.4,
      "medianModulationsPerMaqam": 28,
      "minModulations": 15,
      "maxModulations": 45,
      "stdDevModulations": 8.2,
      "byDegree": {...}
    },
    "byStartingNote": [
      {
        "startingNote": "ʿushayrān",
        "maqamatCount": 60,
        "transposedCount": 0,
        "allMaqamatCount": 60,
        "modulationStats": {...}
      }
    ]
  },
  "modulationData": [
    {
      "startingNoteIdName": "ushayran",
      "startingNoteDisplayName": "ʿushayrān",
      "maqamatModulations": [
        {
          "maqamId": "1",
          "maqamIdName": "maqam_rast",
          "maqamDisplayName": "maqām rāst",
          "tonicIdName": "rast",
          "tonicDisplayName": "rāst",
          "isTransposition": false,
          "maqamatModulations": {
            "firstDegree": [...],
            "thirdDegree": [...],
            "altThirdDegree": [...],
            "fourthDegree": [...],
            "fifthDegree": [...],
            "sixthDegreeAsc": [...],
            "sixthDegreeDesc": [...],
            "sixthDegreeIfNoThird": [...],
            "noteName2pBelowThird": "kurdī"
          },
          "lowerOctaveModulations": {
            "maqamatModulations": {...}
          }
        }
      ]
    }
  ]
}
```

**Note**: The `modulationData` array contains exactly one entry (the single starting note for this file).

### Ajnas Modulations File (`{tuningSystemId}-{startingNoteIdName}-ajnas-modulations.json`)

Contains only maqam-to-jins modulations for a single starting note:

```json
{
  "id": "ronzevalle-(1904)",
  "version": "2025-11-24T12:00:00.000Z",
  "sourceVersions": {
    "maqamat": "2025-10-18T19:41:17.132Z",
    "ajnas": "2025-10-18T19:34:26.343Z",
    "tuningSystems": "2025-10-18T00:00:00.000Z"
  },
  "statistics": {
    "totalStartingNotes": 1,
    "totalUniqueMaqamat": 60,
    "totalTranspositions": 60,
    "modulations": {
      "totalModulations": 1271,
      "averageModulationsPerMaqam": 21.2,
      "medianModulationsPerMaqam": 20,
      "minModulations": 12,
      "maxModulations": 35,
      "stdDevModulations": 6.8,
      "byDegree": {...}
    },
    "byStartingNote": [
      {
        "startingNote": "ʿushayrān",
        "maqamatCount": 60,
        "transposedCount": 0,
        "allMaqamatCount": 60,
        "modulationStats": {...}
      }
    ]
  },
  "modulationData": [
    {
      "startingNoteIdName": "ushayran",
      "startingNoteDisplayName": "ʿushayrān",
      "ajnasModulations": [
        {
          "maqamId": "1",
          "maqamIdName": "maqam_rast",
          "maqamDisplayName": "maqām rāst",
          "tonicIdName": "rast",
          "tonicDisplayName": "rāst",
          "isTransposition": false,
          "ajnasModulations": {
            "firstDegree": [...],
            "thirdDegree": [...],
            "altThirdDegree": [...],
            "fourthDegree": [...],
            "fifthDegree": [...],
            "sixthDegreeAsc": [...],
            "sixthDegreeDesc": [...],
            "sixthDegreeIfNoThird": [...],
            "noteName2pBelowThird": "kurdī"
          },
          "lowerOctaveModulations": {
            "ajnasModulations": {...}
          }
        }
      ]
    }
  ]
}
```

**Note**: The `modulationData` array contains exactly one entry (the single starting note for this file).

## Implementation Details

### Core Functions Used

- `getTuningSystems()`, `getMaqamat()`, `getAjnas()` - Load data
- `getTuningSystemPitchClasses()` - Generate pitch classes
- `calculateMaqamTranspositions()` - Calculate transpositions
- `modulate()` - Main modulation calculation
- `shiftMaqamByOctaves()`, `shiftJinsByOctaves()` - Octave shifting

### Algorithm

1. For each tuning system:
   - Get all starting notes
   - For each starting note:
     - Create two output files (maqamat and ajnas) for this starting note
     - Generate pitch classes
     - For each available maqam:
       - Calculate all transpositions
       - For each transposition:
         - Calculate ajnas modulations
         - Calculate maqamat modulations
         - Calculate lower octave variants (-1 octave)
         - Serialize to JSON and write incrementally
     - Calculate statistics for this starting note
     - Finalize and close both files

### Performance

Expected generation time varies by system:
- Simple systems (7-12 pitch classes): Fast
- Complex systems (17+ pitch classes): May take several minutes

Total generation for all 35 tuning systems: 5-20 minutes (estimated)

## Migration from Combined Files

If you have existing combined modulation files (from before the per-starting-note split), you can migrate them using:

```bash
npm run split:modulations
```

This script will:
- Read existing combined files (or files split by type but not by starting note)
- Create separate files for each starting note
- Generate files with format: `{tuningSystemId}-{startingNoteIdName}-{type}-modulations.json`

Options:
- `--all`: Split all existing combined files
- `--ids <id1,id2>`: Split specific tuning systems
- `--backup`: Keep original files as `.backup`
- `--remove`: Remove original files after successful split
- `--dry-run`: Preview what would be split without writing files

Example:
```bash
# Split all files and keep backups
npm run split:modulations -- --all --backup

# Split specific tuning systems
npm run split:modulations -- --ids ronzevalle-(1904),al-kindi-(874)

# Preview what would be split
npm run split:modulations -- --all --dry-run
```

## Testing

Validate output with:

```bash
# Check files exist for a specific starting note
ls -lh data/modulations/ronzevalle-\(1904\)-ushayran-*.json

# View maqamat modulations structure
cat data/modulations/ronzevalle-\(1904\)-ushayran-maqamat-modulations.json | jq '.modulationData[0].maqamatModulations[0]'

# View ajnas modulations structure
cat data/modulations/ronzevalle-\(1904\)-ushayran-ajnas-modulations.json | jq '.modulationData[0].ajnasModulations[0]'

# Verify single starting note per file (should be 1)
cat data/modulations/ronzevalle-\(1904\)-ushayran-maqamat-modulations.json | jq '.modulationData | length'

# List all files for a tuning system
ls -lh data/modulations/ronzevalle-\(1904\)-*.json
```

## Naming Conventions

Following [naming-conventions-deep-dive.md](../../.ai-agent-instructions/reference/naming-conventions-deep-dive.md):

- `maqamIdName`: `maqam_{name}` (e.g., `maqam_rast`)
- `tonicIdName`: `standardizeText(noteName)` (e.g., `rast`, `dugah`)
- `startingNoteIdName`: `standardizeText(noteName)` (e.g., `ushayran`)
- Display names: Original with diacritics (e.g., `maqām rāst`, `rāst`)

## References

- [modulations.tsx](../../src/components/modulations.tsx) - UI component pattern
- [modulate.ts](../../src/functions/modulate.ts) - Core algorithm
- [TODO-generate-modulations-implementation-plan.md](../../.ai-agent-instructions/TODO-generate-modulations-implementation-plan.md) - Full specification
