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

Generates files in `data/modulations/` with one JSON file per tuning system:

```
data/modulations/
├── Ronzevalle-(1904).json
├── al-Kindi-(874).json
├── Anglo-European-(1700).json
└── ... (35 total files)
```

## JSON Structure

Each file contains:

```json
{
  "id": "Ronzevalle-(1904)",
  "version": "2025-11-24T12:00:00.000Z",
  "sourceVersions": {
    "maqamat": "2025-10-18T19:41:17.132Z",
    "ajnas": "2025-10-18T19:34:26.343Z",
    "tuningSystems": "2025-10-18T..."
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
          "ajnasModulations": {
            "firstDegree": [...],
            ...
          },
          "lowerOctaveModulations": {
            "maqamatModulations": {...},
            "ajnasModulations": {...}
          }
        }
      ]
    }
  ]
}
```

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
     - Generate pitch classes
     - For each available maqam:
       - Calculate all transpositions
       - For each transposition:
         - Calculate ajnas modulations
         - Calculate maqamat modulations
         - Calculate lower octave variants (-1 octave)
         - Serialize to JSON
   - Write output file

### Performance

Expected generation time varies by system:
- Simple systems (7-12 pitch classes): Fast
- Complex systems (17+ pitch classes): May take several minutes

Total generation for all 35 tuning systems: 5-20 minutes (estimated)

## Testing

Validate output with:

```bash
# Check file exists
ls -lh data/modulations/Ronzevalle-\(1904\).json

# View structure
cat data/modulations/Ronzevalle-\(1904\).json | jq '.modulationData[0].maqamatModulations[0]'

# Count starting notes
cat data/modulations/Ronzevalle-\(1904\).json | jq '.modulationData | length'
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
