# Digital Arabic Maqām Archive (DiArMaqAr)

## README • Tuning System Export Data Format

##  Overview

This document describes the structure and contents of comprehensive tuning system export files from the Maqām Network. 

These JSON exports contain complete musical data for a specific historical tuning system, including all available maqāmāt and ajnās, their transpositions, and modulation relationships.

## Table of Contents

- [Quick Start](#quick-start)
- [Common Tasks](#common-tasks)
- [File Structure](#file-structure)
  - [Export Tree Diagram](#export-tree-diagram)
  - [Legend](#legend)
  - [Export Metadata](#export-metadata)
  - [Tuning System Information](#tuning-system-information)
  - [Tuning System Pitch Classes](#tuning-system-pitch-classes)
  - [Summary Statistics](#summary-statistics)
- [Pitch Class Reference](#pitch-class-reference)
- [Maqām Family Reference](#maqām-family-reference)
- [Ajnās Data](#ajnās-data)
- [Maqāmāt Data](#maqāmāt-data)
- [JSON Structure Elements](#json-structure-elements)
  - [Keys vs Objects vs References](#keys-vs-objects-vs-references)
    - [Object Keys](#object-keys)
    - [Reference Values](#reference-values)
    - [Data Objects](#data-objects)
    - [Arrays](#arrays)
- [Data Navigation](#data-navigation)
  - [Finding Specific Content](#finding-specific-content)
  - [Working with Transpositions](#working-with-transpositions)

## Quick Start

**Just need the basics?** Start here.

Each export file contains:

1. **`summaryStats`** — Quick facts: How many maqāmāt? How many ajnās? How many pitch classes?
2. **`tuningSystemData`** — Metadata: Creator, year, source, tuning details
3. **`tuningSystemPitchClasses[]`** — All pitch class names (keys to look up in `pitchClassReference`)
4. **`allMaqamatData{}`** — Complete maqāmāt with their structure and relationships
5. **`allAjnasData{}`** — Ajnās that form the basis of maqāmāt
6. **`pitchClassReference{}`** — Detailed info on each pitch: fractions, cents, string lengths

**The core insight:** Maqāmāt are built from ajnās, which are built from pitch classes. Use `ascendingMaqamAjnas` and `descendingMaqamAjnas` to see which ajnās are used on each degree of a maqām.

## Common Tasks

**Looking for something specific?** Try these navigation patterns.

### Find all maqāmāt available in this tuning

```
Look at: summaryStats.maqamatAvailableInTuning
Then: Iterate through allMaqamatData keys where transposition: false for base forms
```

### See which ajnās make up a maqām

```
For any maqam in allMaqamatData:
  - Check ascendingMaqamAjnas {} to see ascending structure
  - Check descendingMaqamAjnas {} to see descending structure
  - Each maps pitch class name → jins reference
  - Look up that jins reference in allAjnasData
```

### Understand a maqām's pitch structure

```
For any maqam in allMaqamatData:
  - ascendingPitchClasses[]: Names of pitches in ascending order
  - ascendingPitchClassIntervals[]: Size of each step (as fractions, cents, string lengths)
  - Use pitchClassReference to look up each pitch class and access its fractions, cents, cents deviations, and string lengths
```

### See how two maqāmāt modulate into each other

```
For any maqam in allMaqamatData:
  - Check maqamToMaqamModulations.maqamToMaqamModulations
  - Each degree (first, third, fourth, etc.) has an array of possible maqāmāt to modulate to
  - Look up each maqām reference in allMaqamatData
```

### Find pitch frequency information

```
For any pitch name (e.g., "rast"):
  - Look in pitchClassReference using key like "rast" or "qarar_rast"
  - Properties available: frequency (Hz), cents, fraction, decimalRatio, MIDI note
```

### Understand the 4-octave system

Arabic maqām theory traditionally spans 2 octaves. This system extends to 4 for broader instrument compatibility:

| Octave | Arabic Name | Prefix | Example |
|--------|-------------|--------|---------|
| 0 | Qarār (lower) | `qarar_` | `qarar_rast` |
| 1 | ʿUshayrān (first) | (none) | `rast` |
| 2 | Jawāb (second) | `jawab_` | `jawab_rast` |
| 3 | Jawāb Jawāb (upper) | `jawab_jawab_` | `jawab_jawab_rast` |



## File Structure

### Export Tree Diagram

```
tuning-system-export.json
├── exportInfo
│   └── timestamp
├── tuningSystemData
│   ├── id
│   ├── titleEnglish
│   ├── titleArabic
│   ├── year
│   ├── sourceEnglish
│   ├── sourceArabic
│   ├── sourcePageReferences []
│   ├── creatorEnglish
│   ├── creatorArabic
│   ├── commentsEnglish
│   ├── commentsArabic
│   ├── startingNote
│   ├── originalPitchClassValues []
│   ├── originalPitchClassNoteNames [[]]
│   ├── abjadNames []
│   ├── stringLength
│   ├── referenceFrequencies {}
│   ├── defaultReferenceFrequency
│   ├── saved
│   └── version
├── tuningSystemPitchClasses []
├── summaryStats
│   ├── totalAjnasInDatabase
│   ├── totalMaqamatInDatabase
│   ├── tuningPitchClassesInSingleOctave
│   ├── tuningPitchClassesInAllOctaves
│   ├── ajnasAvailableInTuning
│   ├── maqamatAvailableInTuning
│   ├── totalAjnasTranspositions
│   ├── totalMaqamatTranspositions
│   ├── totalMaqamModulations
│   └── totalAjnasModulations
├── pitchClassReference
│   ├── qarar_ushayran {}
│   ├── ... (all pitch classes across 4 octaves)
│   └── jawab_jawab_tik_hisar {}
├── maqamFamilyReference
│   ├── rast {}
│   ├── ... (all maqām families)
│   └── chahargah {}
├── allAjnasData
│   ├── jins_rast_nawa
│   │   ├── jinsId
│   │   ├── name
│   │   ├── jinsPitchClasses []
│   │   ├── jinsPitchClassIntervals []
│   │   ├── transposition
│   │   ├── commentsEnglish
│   │   ├── commentsArabic
│   │   ├── SourcePageReferences []
│   │   └── version
│   └── ... (additional ajnās following same structure)
└── allMaqamatData
    ├── maqam_rast
    │   ├── maqamId
    │   ├── name
    │   ├── ascendingPitchClasses []
    │   ├── descendingPitchClasses []
    │   ├── ascendingPitchClassIntervals []
    │   ├── descendingPitchClassIntervals []
    │   ├── ascendingMaqamAjnas {}
    │   ├── descendingMaqamAjnas {}
    │   ├── suyur []
    │   │   ├── id
    │   │   ├── creatorEnglish
    │   │   ├── creatorArabic
    │   │   ├── sourceId
    │   │   ├── page
    │   │   ├── commentsEnglish
    │   │   ├── commentsArabic
    │   │   ├── stops []
    │   │   └── version
    │   ├── transposition
    │   ├── commentsEnglish
    │   ├── commentsArabic
    │   ├── SourcePageReferences []
    │   ├── version
    │   ├── maqamFamilyClassification
    │   │   └── firstJins
    │   │       └── familyName
    │   ├── maqamToMaqamModulations
    │   │   ├── maqamToMaqamModulationsDegreesNoteNames {}
    │   │   ├── maqamToMaqamModulationsLowerOctaveDegreesNoteNames {}
    │   │   ├── maqamToMaqamModulations {}
    │   │   │   ├── maqamToMaqamModulationsOnFirstDegree []
    │   │   │   ├── maqamToMaqamModulationsOnThirdDegree []
    │   │   │   ├── maqamToMaqamModulationsOnAltThirdDegree []
    │   │   │   ├── maqamToMaqamModulationsOnFourthDegree []
    │   │   │   ├── maqamToMaqamModulationsOnFifthDegree []
    │   │   │   ├── maqamToMaqamModulationsOnSixthDegreeAsc []
    │   │   │   ├── maqamToMaqamModulationsOnSixthDegreeDesc []
    │   │   │   ├── maqamToMaqamModulationsOnSixthDegreeIfNoThird []
    │   │   │   └── maqamToMaqamModulations2pBelowThirdNoteName
    │   │   └── maqamToMaqamModulationsLowerOctave {}
    │   │       ├── maqamToMaqamModulationsOnFirstDegree8vb []
    │   │       ├── maqamToMaqamModulationsOnThirdDegree8vb []
    │   │       ├── maqamToMaqamModulationsOnAltThirdDegree8vb []
    │   │       ├── maqamToMaqamModulationsOnFourthDegree8vb []
    │   │       ├── maqamToMaqamModulationsOnFifthDegree8vb []
    │   │       ├── maqamToMaqamModulationsOnSixthDegreeAsc8vb []
    │   │       ├── maqamToMaqamModulationsOnSixthDegreeDesc8vb []
    │   │       ├── maqamToMaqamModulationsOnSixthDegreeIfNoThird8vb []
    │   │       └── maqamToMaqamModulations2pBelowThird8vb
    │   └── maqamToJinsModulations
    │       ├── maqamToJinsModulationDegreesNoteNames {}
    │       ├── maqamToJinsModulationsLowerOctaveDegreesNoteNames {}
    │       ├── maqamToJinsModulations {}
    │       │   ├── maqamToJinsModulationsOnFirstDegree []
    │       │   ├── maqamToJinsModulationsOnThirdDegree []
    │       │   ├── maqamToJinsModulationsOnAltThirdDegree []
    │       │   ├── maqamToJinsModulationsOnFourthDegree []
    │       │   ├── maqamToJinsModulationsOnFifthDegree []
    │       │   ├── maqamToJinsModulationsOnSixthDegreeAsc []
    │       │   ├── maqamToJinsModulationsOnSixthDegreeDesc []
    │       │   ├── maqamToJinsModulationsOnSixthDegreeIfNoThird []
    │       │   └── maqamToJinsNoteName2pBelowThird
    │       └── maqamToJinsModulationsLowerOctave {}
    │           ├── maqamToJinsModulationsOnFirstDegree8vb []
    │           ├── maqamToJinsModulationsOnThirdDegree8vb []
    │           ├── maqamToJinsModulationsOnAltThirdDegree8vb []
    │           ├── maqamToJinsModulationsOnFourthDegree8vb []
    │           ├── maqamToJinsModulationsOnFifthDegree8vb []
    │           ├── maqamToJinsModulationsOnSixthDegreeAsc8vb []
    │           ├── maqamToJinsModulationsOnSixthDegreeDesc8vb []
    │           ├── maqamToJinsModulationsOnSixthDegreeIfNoThird8vb []
    │           └── maqamToJinsNoteName2pBelowThird8vb
    └── ... (additional maqāmāt following same structure)
```

### **Legend:** 

\- {} \= Object containing multiple properties 

\- \[\] \= Array of values 

\- \[\[\]\] \= Array of arrays 

\- No symbol \= Single value (string, number, boolean)

### Export Metadata

```json
{
  "exportInfo": {
    "timestamp": "2025-09-28T20:25:10.371Z"
  }
}
```

| Property | Description | Type |
|----------|-------------|------|
| `timestamp` | ISO 8601 timestamp indicating when this export file was generated | string |

### Tuning System Information

```json
{
  "tuningSystemData": {
    "id": "IbnSina-(1037)",
    "titleEnglish": "7-Fret Oud 17-Tone",
    "titleArabic": "7 نغمات 17 دستان على العود",
    "year": "1037",
    "sourceEnglish": "",
    "sourceArabic": "",
    "sourcePageReferences": [],
    "creatorEnglish": "Ibn Sīnā",
    "creatorArabic": "إبن سينا",
    "commentsEnglish": "Farmer, H.G. (1937) 'The Lute Scale of Avicenna'...",
    "commentsArabic": "",
    "startingNote": "ushayran",
    "originalPitchClassValues": ["1/1", "273/256", "13/12", "9/8", "32/27", "39/32", "81/64", "4/3", "91/64", "13/9", "3/2", "128/81", "13/8", "27/16", "16/9", "91/48", "52/27"],
    "originalPitchClassNoteNames": [["ʿushayrān", "ʿajam ʿushayrān", "ʿirāq", "kawasht", "rāst", "nīm zīrgūleh", "zīrgūleh", "dūgāh", "kurdī", "segāh", "būselīk/ʿushshāq", "chahārgāh", "nīm ḥijāz", "ḥijāz", "nawā", "ḥiṣār", "tīk ḥiṣār"]],
    "abjadNames": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    "stringLength": 1000,
    "referenceFrequencies": {"yegāh": 97.999, "ʿushayrān": 110},
    "defaultReferenceFrequency": 97.999,
    "saved": true,
    "version": "2025-10-18T19:41:17.132Z"
  }
}
```

### Tuning System Information Properties

| Property | Description | Type |
|----------|-------------|------|
| `id` | Unique identifier for this tuning system (e.g., composer name and year) | string |
| `titleEnglish` | Title or description of the tuning system in English | string |
| `titleArabic` | Title or description in Arabic | string |
| `year` | Historical year or period of origin | string |
| `sourceEnglish` | Primary bibliographic source title in English (may be empty) | string |
| `sourceArabic` | Primary bibliographic source title in Arabic (may be empty) | string |
| `sourcePageReferences[]` | Array of page references from the primary source | array |
| `creatorEnglish` | Creator or documenter name in English | string |
| `creatorArabic` | Creator or documenter name in Arabic | string |
| `commentsEnglish` | Additional scholarly or historical context in English | string |
| `commentsArabic` | Additional context in Arabic | string |
| `startingNote` | Reference pitch class name for this tuning system | string |
| `originalPitchClassValues[]` | Array of frequency ratios as defined in the bibliographic source | array |
| `originalPitchClassNoteNames[][]` | Array of note name arrays assigned to the pitch class values in the source | array of arrays |
| `abjadNames[]` | Traditional abjad notation assigned to pitch classes (if used in the source; empty otherwise) | array |
| `stringLength` | Reference string length used for fret division calculations (in arbitrary units) | number |
| `referenceFrequencies{}` | Object mapping specific note names to reference frequencies in Hz | object |
| `defaultReferenceFrequency` | Default reference frequency in Hz if not specified per note | number |
| `saved` | Database save status flag | boolean |
| `version` | ISO 8601 timestamp of last modification | string |

### Tuning System Pitch Classes

```json
{
  "tuningSystemPitchClasses": [
    "qarar_ushayran",
    "qarar_ajam_ushayran",
    "qarar_iraq",
    "qarar_kawasht",
    "qarar_rast",
    "... (all pitch classes across 4 octaves)",
    "jawab_jawab_tik_hisar"
  ]
}
```

The `tuningSystemPitchClasses` array contains all pitch class keys available in this tuning system across all four octaves. Use these keys to look up detailed information in `pitchClassReference`.

### Summary Statistics

```json
{
  "summaryStats": {
    "totalAjnasInDatabase": 32,
    "totalMaqamatInDatabase": 60,
    "tuningPitchClassesInSingleOctave": 17,
    "tuningPitchClassesInAllOctaves": 68,
    "ajnasAvailableInTuning": 25,
    "maqamatAvailableInTuning": 39,
    "totalAjnasTranspositions": 244,
    "totalMaqamatTranspositions": 198,
    "totalMaqamModulations": 4799,
    "totalAjnasModulations": 5490
  }
}
```

| Property | Description | Type |
|----------|-------------|------|
| `totalAjnasInDatabase` | Total count of distinct ajnās in the core database | number |
| `totalMaqamatInDatabase` | Total count of distinct maqāmāt in the core database | number |
| `tuningPitchClassesInSingleOctave` | Number of distinct pitch classes in one octave of this tuning | number |
| `tuningPitchClassesInAllOctaves` | Total pitch classes across all four octaves | number |
| `ajnasAvailableInTuning` | Count of ajnās that can be realized with this tuning's pitch classes | number |
| `maqamatAvailableInTuning` | Count of maqāmāt that can be realized with this tuning's pitch classes | number |
| `totalAjnasTranspositions` | Total count of all ajnās transpositions (base forms + all transpositions at all starting notes) | number |
| `totalMaqamatTranspositions` | Total count of all maqāmāt transpositions (base forms + all transpositions at all starting notes) | number |
| `totalMaqamModulations` | Total count of all possible maqām-to-maqām modulation relationships | number |
| `totalAjnasModulations` | Total count of all possible jins-to-jins modulation relationships | number |

## Pitch Class Reference

The `pitchClassReference` section contains detailed information for each pitch class across all four octaves. Each entry uses the pitch class name as a key:

```json
{
  "pitchClassReference": {
    "qarar_ushayran": {
      "noteName": "qarār ʿushayrān",
      "abjadName": "",
      "englishName": "A1",
      "pitchClassIndex": 0,
      "octave": 0,
      "originalValue": "1/2",
      "originalValueType": "fraction",
      "cents": "-1200",
      "centsDeviation": 0,
      "fraction": "1/2",
      "decimalRatio": "0.5",
      "stringLength": "2000",
      "fretDivision": "-1000.000",
      "midiNoteDecimal": 33,
      "referenceNoteName": "A1",
      "midiNoteDeviation": "33 0",
      "frequency": "55"
    },
    // ... additional pitch classes for all four octaves
  }
}
```

### Pitch Class Properties

Each pitch class contains the following properties. **Core properties** (needed to understand basic pitch information) are marked:

| Property | Description | Type |
|----------|-------------|------|
| **`noteName`** ⭐ | Display name with proper diacritics for UI presentation | string |
| **`octave`** ⭐ | Octave number (0–3): qarār (0), ʿushayrān (1), jawāb (2), jawāb jawāb (3) | number |
| **`frequency`** ⭐ | Frequency in Hz, calculated from reference frequency | number |
| **`cents`** ⭐ | Cents relative to this tuning's fundamental (0 cents = `1/1` ratio) | string |
| **`englishName`** | International Pitch Notation equivalent (e.g., "G", "E-b"). Determined by maqām theory, not mathematical proximity to 12-EDO | string |
| `pitchClassIndex` | 0-based position within a single octave (0–16 for 17-tone system). Index repeats across octaves to group pitch class types | number |
| `fraction` | Frequency ratio as mathematical fraction relative to fundamental (`1/1`) | string |
| `decimalRatio` | Frequency ratio as decimal relative to fundamental | string |
| `originalValue` | Value from bibliographic source (may be fraction, decimal, or cents) | string |
| `originalValueType` | Format type of source value: "fraction", "decimal", or "cents" | string |
| `centsDeviation` | Deviation in cents from 12-EDO reference note (determined by maqām theory logic, not mathematical rounding) | number |
| `stringLength` | String length relative to tuning system's reference (used for fret calculations on oud/qanun) | string |
| `fretDivision` | Calculated fret position on reference string length (negative = position beyond open string) | string |
| `referenceNoteName` | 12-EDO reference note (e.g., "A2", "C#2"). For pitches with modifiers (C-b, D-#), this is the natural note, NOT closest 12-EDO pitch | string |
| `midiNoteDeviation` | MIDI note number + cents offset (e.g., "45 0" means MIDI 45 with 0 cents deviation). Deviation can exceed ±50 cents when referenced by maqām theory | string |
| `abjadName` | Traditional abjad notation (if used). Populated for octaves 1–2 in systems with abjad notation; empty for octaves 0, 3 | string |
| `midiNoteDecimal` | MIDI note with decimal/fractional precision for pitches between standard MIDI notes | number |

## Maqām Family Reference

The maqamFamilyReference section provides a lookup table for maqām family display names used throughout the export. Each maqām belongs to a family (e.g., Maqām Rāst belongs to the Rāst family, Maqām Māhūr belongs to the Rāst family, etc.). This reference allows quick lookup of properly formatted family names with diacritics.

```json
{
  "maqamFamilyReference": {
    "rast": {
      "displayName": "rāst"
    },
    "hijaz": {
      "displayName": "ḥijāz"
    },
    "bayyat": {
      "displayName": "bayyāt"
    }
  }
}
```

### Maqām Family Properties

| Property | Description | Type |
|----------|-------------|------|
| Family Key (e.g., `rast`) | Reference identifier for the maqām family (lowercase, no diacritics or spaces) | string (object key) |
| `displayName` | Display name with proper Arabic diacritics for use in UI and documentation | string |

## Ajnās Data

The `allAjnasData` section contains all melodic genera available in the tuning system. Each jins includes pitch classes with pitch class intervals arrays:

```json
{
  "allAjnasData": {
    "jins_bayyat": {
      "jinsId": "2",
      "name": "jins bayyāt",
      "jinsPitchClasses": ["dugah", "segah", "chahargah", "nawa"],
      "jinsPitchClassIntervals": [
        {
          "fraction": "13/12",
          "cents": 138.57266090392324,
          "decimalRatio": 1.0833333333333333,
          "stringLength": -57.692307692307736,
          "fretDivision": 57.69200000000001,
          "pitchClassIndex": 2,
          "originalValue": "13/12",
          "originalValueType": "fraction"
        },
        {
          "fraction": "128/117",
          "cents": 155.5623364999144,
          "decimalRatio": 1.0940170940170941,
          "stringLength": -59.495192307692264,
          "fretDivision": 59.49599999999998,
          "pitchClassIndex": 2,
          "originalValue": "128/117",
          "originalValueType": "fraction"
        },
        {
          "fraction": "2187/2048",
          "cents": 113.68500605771214,
          "decimalRatio": 1.06787109375,
          "stringLength": -40.21990740740739,
          "fretDivision": 40.218999999999994,
          "pitchClassIndex": 2,
          "originalValue": "2187/2048",
          "originalValueType": "fraction"
        }
      ],
      "transposition": false,
      "commentsEnglish": "",
      "commentsArabic": "",
      "SourcePageReferences": [
        {"sourceId": "al-Khulʿī-(2011)", "page": "55"},
        {"sourceId": "al-Urmawī-al-Baghdādī-(2017)", "page": "23"}
      ],
      "version": "2025-10-18T19:34:26.343Z"
    }
    // ... additional ajnās
  }
}
```

### Ajnās Properties

| Property | Description | Logic |
|----------|-------------|-------|
| `jinsId` | Core database ID linking to original jins definition. Multiple transpositions share same ID | Numerical identifier |
| **`name`** | Display name with diacritics and spaces. Used for UI and documentation | Example: "jins bayyāt" |
| **`jinsPitchClasses[]`** | Array of pitch class keys in ascending order. Use these keys to look up `pitchClassReference` for fractions, cents, and string lengths | `["dugah", "segah", "chahargah", "nawa"]` |
| **`jinsPitchClassIntervals[]`** | Array of interval objects between consecutive pitches (see Interval Properties table below) | Computed from pitch frequency ratios |
| `transposition` | Boolean: `false` for base form (canonical), `true` for transposed instances | Distinguishes original vs derived structures |
| `commentsEnglish` | Additional context, performance notes, or musicological context in English | May reference historical sources or performance practice |
| `commentsArabic` | Same as above in Arabic | For preservation of original terminology |
| `SourcePageReferences[]` | Array of academic citations (sourceId + page number) supporting this jins | Links to bibliographic sources |
| `version` | ISO 8601 timestamp of last modification | Tracks data provenance and changes |

### Interval Properties (for `jinsPitchClassIntervals` and `ascendingPitchClassIntervals`)

| Property | Description |
|----------|-------------|
| **`fraction`** | Frequency ratio as reduced fraction (e.g., "3/2", "9/8") |
| **`cents`** | Logarithmic interval measurement (1200 cents = an octave) |
| **`decimalRatio`** | Frequency ratio as decimal (fraction value converted) |
| `stringLength` | Relative string length for this pitch class |
| `fretDivision` | String division calculation on reference string length |
| `pitchClassIndex` | Pitch class index difference considering octave positions |
| `originalValue` | Value from bibliographic source as per historical documentation |
| `originalValueType` | Format of original value: "fraction", "decimal", or "cents" |

## Maqāmāt Data

The `allMaqamatData` section contains complete maqām information with pitch sequences, ajnās structure, suyur (documented performance practice), and modulation relationships:

```json
{
  "allMaqamatData": {
    "maqam_rast": {
      "maqamId": "1",
      "name": "maqām rāst",
      "ascendingPitchClasses": ["rast", "dugah", "segah", "chahargah", "nawa", "husayni", "awj"],
      "descendingPitchClasses": ["ajam", "husayni", "nawa", "chahargah", "segah", "dugah", "rast"],
      "ascendingPitchClassIntervals": [
        {"fraction": "9/8", "cents": 203.91000173077487, "decimalRatio": 1.125, ...},
        {"fraction": "13/12", "cents": 138.57266090392324, "decimalRatio": 1.0833333333333333, ...},
        {"fraction": "128/117", "cents": 155.5623364999144, "decimalRatio": 1.0940170940170941, ...}
        // ... additional intervals
      ],
      "descendingPitchClassIntervals": [
        {"fraction": "273/256", "cents": 111.30856910382295, "decimalRatio": 1.06640625, ...},
        {"fraction": "9/8", "cents": 203.91000173077498, "decimalRatio": 1.125, ...}
        // ... additional intervals
      ],
      "ascendingMaqamAjnas": {
        "rast": "jins_rast",
        "dugah": "jins_bayyat",
        "segah": "jins_segah",
        "chahargah": null,
        "nawa": "jins_rast_al-nawa",
        "husayni": "jins_bayyat_al-husayni",
        "awj": "jins_segah_al-awj"
      },
      "descendingMaqamAjnas": {
        "ajam": null,
        "husayni": "jins_kurd_al-husayni",
        "nawa": "jins_nahawand_al-nawa",
        "chahargah": "jins_chahargah_(al-Shawwa)",
        "segah": "jins_segah",
        "dugah": "jins_bayyat",
        "rast": "jins_rast"
      },
      "suyur": [
        {
          "id": "Sayr al-Ṣabbāgh-(1950)",
          "creatorEnglish": "Ṣabbāgh",
          "creatorArabic": "صبّاغ",
          "sourceId": "al-Ṣabbāgh-(1950)",
          "page": "41",
          "commentsEnglish": "Known in Tunis as Ṭabe' al-Dhīl, also Ṭabe' al-Sharqī and Inqilāb al-'irāq...",
          "commentsArabic": "",
          "stops": [
            {"type": "jins", "value": "1", "startingNote": "rāst"},
            {"type": "jins", "value": "10", "startingNote": "rāst"},
            {"type": "jins", "value": "3", "startingNote": "rāst"}
            // ... additional stops
          ],
          "version": "2025-10-18T19:41:17.132Z"
        }
        // ... additional suyur
      ],
      "transposition": false,
      "commentsEnglish": "",
      "commentsArabic": "",
      "SourcePageReferences": [],
      "version": "2025-10-18T19:41:17.132Z",
      "maqamFamilyClassification": {
        "firstJins": {"familyName": "rast"}
      },
      "maqamToMaqamModulations": {
        "maqamToMaqamModulationsDegreesNoteNames": {
          "maqamModulationsOnFirstDegreeNoteName": "rast",
          "maqamModulationsOnThirdDegreeNoteName": "segah",
          "maqamModulationsOnAltThirdDegreeNoteName": "kurdi",
          // ... additional degree names
        },
        "maqamToMaqamModulationsLowerOctaveDegreesNoteNames": {
          "maqamModulationsOnFirstDegree8vbNoteName": "qarar_rast",
          "maqamModulationsOnThirdDegree8vbNoteName": "qarar_segah",
          // ... additional lower octave degree names
        },
        "maqamToMaqamModulations": {
          "maqamToMaqamModulationsOnFirstDegree": [
            "maqam_hijaz_kar_kurd",
            "maqam_nikriz",
            "maqam_nawa_athar",
            "... (additional modulation references)"
          ],
          "maqamToMaqamModulationsOnThirdDegree": ["maqam_segah", "maqam_huzam", "..."],
          "... (additional modulation arrays for other degrees)": []
        },
        "maqamToMaqamModulationsLowerOctave": { "... (same structure as above for lower octave)": {} }
      },
      "maqamToJinsModulations": {
        "maqamToJinsModulationDegreesNoteNames": { "... (jins modulation degrees)": "" },
        "maqamToJinsModulationsLowerOctaveDegreesNoteNames": { "... (lower octave jins modulation degrees)": "" },
        "maqamToJinsModulations": { "... (jins references at each degree)": [] },
        "maqamToJinsModulationsLowerOctave": { "... (lower octave jins modulations)": {} }
      }
    }
    // ... additional maqāmāt
  }
}
```

### Maqām Core Properties

| Property | Description | Logic |
|----------|-------------|-------|
| `maqamId` | Core database ID linking to original maqām definition. Multiple transpositions share same ID | Numerical identifier |
| **`name`** | Display name with diacritics and starting note | Example: "maqām rāst" |
| **`ascendingPitchClasses[]`** | Array of pitch class keys for ascending melodic motion in order from lowest to highest | Keys match `pitchClassReference` |
| **`descendingPitchClasses[]`** | Array of pitch class keys for descending melodic motion (may differ from ascending) | Keys match `pitchClassReference` |
| **`ascendingPitchClassIntervals[]`** | Array of interval objects between consecutive ascending pitches (see Interval Properties) | Computed from pitch ratios |
| **`descendingPitchClassIntervals[]`** | Array of interval objects between consecutive descending pitches | Computed from pitch ratios |
| **`ascendingMaqamAjnas{}`** | Object mapping each ascending pitch degree to its associated jins reference. Value is `null` if no jins assigned | Example: `"rast": "jins_rast"` |
| **`descendingMaqamAjnas{}`** | Object mapping each descending pitch degree to its associated jins reference | Same structure as ascending |
| `suyur[]` | Array of sayr (plural: suyur) objects. Each contains documentation from a specific source about how a maqām is performed, including stops and structural notes | Links to documented performance practice |
| `transposition` | Boolean: `false` for base form (canonical), `true` for transposed starting note | Distinguishes original vs derived forms |
| `commentsEnglish` | Structural description and performance details from the source, including melodic context and usage information in English | From original bibliographic source |
| `commentsArabic` | Same as above in Arabic | Preserves original terminology |
| `SourcePageReferences[]` | Array of academic citations (sourceId + page) supporting this maqām | Links to bibliographic sources |
| `version` | ISO 8601 timestamp of last modification | Tracks data provenance |
| `maqamFamilyClassification` | Object containing `firstJins.familyName`: the maqām family name determined by its opening jins | Links maqām to family classifications |
| `maqamToMaqamModulations` | Object containing all possible maqām-to-maqām modulations organized by degree and octave | Advanced feature for composition/analysis |
| `maqamToJinsModulations` | Object containing all possible jins-to-jins modulations organized by degree and octave | Advanced feature for composition/analysis |

### Sayr Properties

| Property | Description |
|----------|-------------|
| `id` | Unique identifier combining source, creator, and date (e.g., "Sayr al-Ṣabbāgh-(1950)") |
| `creatorEnglish` | Name of sayr creator/documenter in English (may be empty) |
| `creatorArabic` | Name of sayr creator/documenter in Arabic (may be empty) |
| `sourceId` | Reference ID to source document in bibliography |
| `page` | Page number(s) in source document (may be empty) |
| `commentsEnglish` | Structural description and performance details from the source in English |
| `commentsArabic` | Structural description and performance details from the source in Arabic (may be empty) |
| `stops[]` | Array of stops defining the sayr structure. Each stop has: `type` (jins, note, direction, or maqam), `value` (reference ID, note name, or direction), and optional `startingNote` (present only for jins and maqam types) |
| `version` | ISO 8601 timestamp of last modification |

## JSON Structure Elements

Understanding the different types of elements in the export format:

### Keys vs Objects vs References

#### *Object Keys*

These are string identifiers that serve as keys in JSON objects:

```json
{
  "allMaqamatData": { // Main Section: Collection of all maqām data
    "maqam_rast": {  // ← Object Key: Identifies this specific maqām
      "maqamId": "1",                 // ← Property: Links to core database
      "name": "maqām rāst" // ← Property: Display name
    // ... more properties      
    }
  }
}
```

#### *Reference Values*

String values that point to other objects in the data structure:

```json
{
  "ascendingMaqamAjnas": { // Property: Maps degrees to jins references
    "rāst": "jins_rast",    // ← Reference Value: Points to allAjnasData object
    "dūgāh": "jins_bayyat"         // ← Reference Value: Points to allAjnasData object
    // ... more references

  }
}
```

#### *Data Objects*

Complete objects containing structured information:

```json
```json
{
  "qarar_ushayran": {             // ← Object Key: Identifies this pitch class
    "noteName": "qarār ʿushayrān", // ← Property: Display name
    "englishName": "G",           // ← Property: International Pitch Notation equivalent
    "fraction": "1/2",            // ← Property: Mathematical ratio
    "cents": "-1200"              // ← Property: Logarithmic measurement
    // ... more properties
  }
```
```

#### *Arrays*

Ordered lists of elements:

```json
{
  "ascendingPitchClasses": ["rast", "dugah", "segah"],  // ← Array: Ordered sequence of pitch class names
  "modulationsOnOne": [                                 // ← Array: List of references to other maqāmāt
    "maqam_hijaz_kar_kurd",        // ← Reference Value: Points to allMaqamatData object
    "maqam_nikriz"                 // ← Reference Value: Points to allMaqamatData object
  ]
}
```

## Data Navigation

### Finding Specific Content

1. **Browse by type**: Use allAjnasData to access all melodic genera (ajnās) and allMaqamatData for all modal scales (maqāmāt). Each entry is keyed by a unique identifier and contains detailed properties and references.

2. **Check availability**: Refer to the summaryStats section for the total number of ajnās and maqāmāt in the database, as well as how many are available in the current tuning system. This helps determine the scope of musical material supported by the export.

3. **Navigate pitch classes**: Use the tuningSystemPitchClasses array to get a complete list of all pitch class keys available in the tuning system. These keys correspond to entries in the pitchClassReference section and are used throughout ajnās and maqāmāt data.

4. **Explore relationships**: Use modulation arrays (such as modulationsOnOne, modulationsOnThree, etc.) within each maqām or jins object to find all possible modulations and related structures. These arrays provide references to other maqāmāt or ajnās that can be reached from specific degrees.

5. **Access pitch details**: Reference the pitchClassReference section for comprehensive information about each pitch class, including note names, frequency ratios, cents, decimal values, abjad notation, and more. Use the pitch class names found in ajnās and maqāmāt arrays as keys to look up their detailed definitions here.

6. **Trace structure composition**: For each maqām, examine the ascendingMaqamAjnas and descendingMaqamAjnas objects to see which ajnās are used on each degree in both directions. This reveals the internal structure and modal building blocks of each scale.

7. **Locate bibliographic context**: Use the SourcePageReferences arrays in ajnās and maqāmāt objects to find academic or historical sources for each structure, supporting further research or verification.

### Working with Transpositions

* All structures marked with "transposition": true are transposed forms derived from a base (untransposed) structure. These represent the same modal pattern starting on different notes.

* Base forms have "transposition": false and serve as the canonical version of each jins or maqām.

* Modulation arrays within maqāmāt and ajnās may include both base forms and transpositions, reflecting all possible modulation relationships in the system.

* To analyze all possible realizations of a jins or maqām, enumerate both the base form and all its transpositions as listed in the export.

* When comparing structures across tuning systems, always check the transposition property to distinguish between original and derived forms.