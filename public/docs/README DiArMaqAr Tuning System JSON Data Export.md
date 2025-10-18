# Digital Arabic Maqām Archive (DiArMaqAr)

## README • Tuning System Export Data Format

##  Overview

This document describes the structure and contents of comprehensive tuning system export files from the Maqām Network. 

These JSON exports contain complete musical data for a specific historical tuning system, including all available maqāmāt (scales), ajnās (melodic genera), their transpositions, and modulation relationships.

## Table of Contents

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
│   └── saved
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
│   │   └── SourcePageReferences []
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
    │   ├── transposition
    │   ├── commentsEnglish
    │   ├── commentsArabic
    │   ├── SourcePageReferences []
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

### Tuning System Information

```json
{
  "tuningSystemData": {
    "id": "IbnSina-(1037)", // Property: Unique identifier for the tuning system
    "titleEnglish": "7-Fret Oud 17-Tone", // Property: English title/description
    "titleArabic": "7 نغمات 17 دستان على العود", // Property: Arabic title/description
    "year": "1037", // Property: Historical year of origin
    "sourceEnglish": "", // Property: Primary source title in English
    "sourceArabic": "", // Property: Primary source title in Arabic
    "sourcePageReferences": [], // Property: Array of page references from the primary source
    "creatorEnglish": "Ibn Sīnā ", // Property: Creator name in English
    "creatorArabic": "إبن سينا", // Property: Creator name in Arabic
    "commentsEnglish": "Farmer, H.G. (1937) 'The Lute Scale of Avicenna'...", // Property: Additional context in English
    "commentsArabic": "", // Property: Additional context in Arabic
    "startingNote": "ushayran", // Property: Reference pitch class note name for this tuning system
    "originalPitchClassValues": [ // Property: Array of pitch class values (as fractions or decimals) defining the tuning system, as per bibliographic source
      "1/1", "273/256", "13/12", "9/8", "32/27", "39/32", "81/64",
      "4/3", "91/64", "13/9", "3/2", "128/81", "13/8", "27/16",
      "16/9", "91/48", "52/27"
    ],
    "originalPitchClassNoteNames": [ // Property: Array of arab-ottoman-persian note names assigned to the originalPitchClassValues, as per bibliographic source
      [
        "ʿushayrān", "ʿajam ʿushayrān", "ʿirāq", "kawasht", "rāst",
        "nīm zīrgūleh", "zīrgūleh", "dūgāh", "kurdī", "segāh",
        "būselīk/ʿushshāq", "chahārgāh", "nīm ḥijāz", "ḥijāz", "nawā",
        "ḥiṣār", "tīk ḥiṣār"
      ]
    ],
    "abjadNames": [ // Property: Array of traditional abjad notation assigned to the originalPitchClassValues (may be empty if not used in this tuning system)
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
    ],
    "stringLength": 1000, // Property: Reference string length for fret division calculations
    "referenceFrequencies": { // Property: Reference frequencies (Hz) for specific note names, as per bibliographic source
      "yegāh": 97.999, // Property: Reference frequency for yegāh in Hz
      "ʿushayrān": 110   // Property: Reference frequency for ʿushayrān in Hz
    },
    "defaultReferenceFrequency": 97.999, // Property: Default reference frequency (Hz) if referenceFrequencies are not defined
    "saved": true // Property: Database save status flag
  }
}
```

### Tuning System Pitch Classes

```json
{
  "tuningSystemPitchClasses": [ // Property: Array of all pitch class keys available in this tuning system
    "qarar_ushayran",
    "qarar_ajam_ushayran",
    "qarar_iraq",
    "qarar_kawasht",
    "qarar_rast",
    "qarar_nim_zirguleh",
    "qarar_zirguleh",
    "qarar_dugah",
    "qarar_kurdi",
    "qarar_segah",
    "qarar_buselik/ushshaq",
    "qarar_chahargah",
    "qarar_nim_hijaz",
    "qarar_hijaz",
    "yegah",
    "qarar_hisar",
    "qarar_tik_hisar/shuri",
    "ushayran",
    "ajam_ushayran",
    "iraq",
    "kawasht",
    "rast",
    "nim_zirguleh",
    "zirguleh",
    "dugah",
    "kurdi",
    "segah",
    "buselik/ushshaq",
    "chahargah",
    "nim_hijaz",
    "hijaz",
    "nawa",
    "hisar",
    "tik_hisar",
    "husayni",
    "ajam",
    "awj",
    "mahur",
    "kurdan",
    "nim_shahnaz",
    "shahnaz",
    "muhayyar",
    "sunbuleh/zawal",
    "buzurk",
    "jawab_buselik",
    "mahuran",
    "jawab_nim_hijaz",
    "jawab_hijaz",
    "saham/ramal_tuti",
    "jawab_hisar",
    "jawab_tik_hisar",
    "jawab_husayni",
    "jawab_ajam",
    "jawab_awj",
    "jawab_mahur",
    "jawab_kurdan",
    "jawab_nim_shahnaz",
    "jawab_shahnaz",
    "jawab_muhayyar",
    "jawab_sunbuleh/zawal",
    "jawab_buzurk",
    "jawab_jawab_buselik",
    "jawab_mahuran",
    "jawab_jawab_nim_hijaz",
    "jawab_jawab_hijaz",
    "jawab_saham/ramal_tuti",
    "jawab_jawab_hisar",
    "jawab_jawab_tik_hisar"
  ]
}
```

### Summary Statistics

```json
{
  "summaryStats": {
    "totalAjnasInDatabase": 32, // Property: Total count of ajnās (melodic genera) in the core database
    "totalMaqamatInDatabase": 60, // Property: Total count of maqāmāt (scales) in the core database
    "tuningPitchClassesInSingleOctave": 17, // Property: Number of distinct pitch classes in one octave of this tuning
    "tuningPitchClassesInAllOctaves": 68, // Property: Total pitch classes across all four octaves
    "ajnasAvailableInTuning": 25, // Property: Count of ajnās that can be realized in this tuning system
    "maqamatAvailableInTuning": 39, // Property: Count of maqāmāt that can be realized in this tuning system
    "totalAjnasTranspositions": 244, // Property: Total count of all ajnās transpositions across all starting notes
    "totalMaqamatTranspositions": 198, // Property: Total count of all maqāmāt transpositions across all starting notes
    "totalMaqamModulations": 4799, // Property: Total count of all possible maqām-to-maqām modulations
    "totalAjnasModulations": 5490 // Property: Total count of all possible jins-to-jins modulations
  }
}
```

## Pitch Class Reference

The pitchClassReference section contains detailed information for each pitch class across all octaves:

```json
{
  "pitchClassReference": {
    "qarar_ushayran": { // Reference Key: Arab-ottoman-persian note name without diacritics or spaces
      "noteName": "qarār ʿushayrān", // Property: Arab-ottoman-persian note name to be used for display (includes diacritics and spaces)
      "abjadName": "", // Property: Arabic abjad delineation (if applicable). Only populated for octaves 1 and 2 in tuning systems that use abjad notation. Empty for octaves 0 and 3, and for tuning systems without abjad notation.
      "englishName": "A1", // Property: English note name equivalent using International Pitch Notation (IPN). Based on expanded modern Arabic maqām theory where note names use modifiers to indicate inflections (e.g., segāh = E-b). For historical tuning systems with more, or slight variations on, pitch classes than the 24-tone modern Arabic system, the same logic is extended as needed.
      "pitchClassIndex": 0, // Property: 0-based index position within the tuning system's pitch class array. This same index repeats across all octaves, allowing grouping of the same pitch class type regardless of octave (e.g., pitchClassIndex 5 in octave 0 represents the same pitch class type as pitchClassIndex 5 in octaves 1, 2, and 3).
      "octave": 0, // Property: Octave number (0-3). Arabic maqām theory traditionally uses two octaves (octaves 1 and 2). This system extends to four octaves total: octave 0 (qarār/lower), octave 1 (normal/first), octave 2 (jawāb/second), and octave 3 (jawāb jawāb/upper), to accommodate the full range of traditional Arab instruments.
      "originalValue": "1/2", // Property: Original value from tuning system definition as per bibliographic source
      "originalValueType": "fraction", // Property: Format type of original value as per bibliographic source
      "cents": "-1200", // Property: Cents value relative to the fundamental reference pitch class of 0 cents
      "centsDeviation": 0, // Property: Deviation in cents from the 12-EDO reference note specified in referenceNoteName, following Arabic maqām theory logic where pitches with modifiers (e.g., E-b, F+#) are measured relative to their natural note (E, F), not the mathematically closest 12-EDO pitch.
      "fraction": "1/2", // Property: Frequency ratio as fraction relative to the fundamental reference pitch class (0 cents or 1/1 frequency ratio)
      "decimalRatio": "0.5", // Property: Frequency ratio as decimal relative to the fundamental reference pitch class (0 cents or 1/1 frequency ratio)
      "stringLength": "2000", // Property: String length relative to tuning system string length
      "fretDivision": "-1000.000", // Property: Fret position calculation relative to stringLength (negative indicates theoretical position beyond open string)
      "midiNoteDecimal": 33, // Property: MIDI note number with decimal/fractional precision e.g., 51.366 for a pitch between MIDI notes 51 and 52. As this number can only be positive it is different from the MIDI note number calculated in midiNoteDeviation.
      "referenceNoteName": "A", // Property: 12-EDO reference note name in International Pitch Notation (without octave number) determined by Arabic maqām theory logic. For pitches with modifiers (e.g., E-b, F+#), this is the natural note (E, F), NOT the mathematically closest 12-EDO pitch. For standard sharps/flats (e.g., Eb, F#) or natural notes, this follows standard International Pitch Notation naming.
      "midiNoteDeviation": "33 0", // Property: Formatted string showing the 12-EDO reference MIDI note number (based on referenceNoteName following Arabic maqām theory logic) followed by the cents deviation (e.g., "52 -63.4" means 63.4 cents below MIDI note 52). The deviation can be positive or negative, and may exceed ±50 cents because the reference is determined by maqām theory, not mathematical proximity.
      "frequency": "55" // Property: Frequency in Hz based on reference frequency of starting note
    }
  }
}
```

## Maqām Family Reference

The maqamFamilyReference section provides a lookup table for maqām family display names used throughout the export. Each maqām belongs to a family (e.g., Maqām Rāst belongs to the Rāst family, Maqām Māhūr belongs to the Rāst family, etc.). This reference allows quick lookup of properly formatted family names with diacritics.

```json
{
  "maqamFamilyReference": {
    "rast": { // Reference Key: Maqām family identifier without diacritics or spaces
      "displayName": "rāst" // Property: Display name with proper diacritics for UI presentation
    },
    "hijaz": {
      "displayName": "ḥijāz"
    },
    "kurd": {
      "displayName": "kurd"
    },
    "nikriz": {
      "displayName": "nikrīz"
    },
    "bayyat": {
      "displayName": "bayyāt"
    },
    "nahawand": {
      "displayName": "nahāwand"
    },
    "saba": {
      "displayName": "ṣabā"
    }
    // ... additional maqām families
  }
}
```

## Ajnās Data

The allAjnasData section contains all melodic genera available in the tuning system:

```json
{
  "allAjnasData": {
    "jins_bayyat": { // Object Key: Unique identifier for this jins transposition
      "jinsId": "2", // Property: Core database jins ID linking to the original jins definition
      "name": "jins bayyāt", // Property: Full display name including the jins's starting note name (its tonic/root/qarār)
      "jinsPitchClasses": ["dugah", "segah", "chahargah", "nawa"], // Property: Array of pitch class names in ascending order, used as keys to reference pitchClassReference objects
      "jinsPitchClassIntervals": [ // Property: Array of interval objects between consecutive pitches
        {
          "fraction": "13/12", // Property: Interval value as frequency ratio
          "cents": 138.57266090392324, // Property: Interval value in cents
          "decimalRatio": 1.0833333333333333, // Property: Interval value as decimal ratio
          "stringLength": -57.692307692307736, // Property: String length relative to tuning system string length
          "fretDivision": 57.69200000000001, // Property: Fret position calculation
          "pitchClassIndex": 2, // Property: Pitch class index difference considering octaves
          "originalValue": "13/12", // Property: Interval value calculated from the original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value (e.g., "fraction", "decimal", "cents")
        },
        {
          "fraction": "128/117", // Property: Second interval in the jins
          "cents": 155.5623364999144, // Property: Interval value in cents
          "decimalRatio": 1.0940170940170941, // Property: Interval value as decimal ratio
          "stringLength": -59.495192307692264, // Property: String length relative to tuning system string length
          "fretDivision": 59.49599999999998, // Property: Fret position calculation
          "pitchClassIndex": 2, // Property: Pitch class index difference considering octaves
          "originalValue": "128/117", // Property: Interval value calculated from the original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value
        },
        {
          "fraction": "9/8", // Property: Third interval in the jins
          "cents": 203.91000173077487, // Property: Interval value in cents
          "decimalRatio": 1.125, // Property: Interval value as decimal ratio
          "stringLength": -70.3125, // Property: String length relative to tuning system string length
          "fretDivision": 70.31200000000001, // Property: Fret position calculation
          "pitchClassIndex": 3, // Property: Pitch class index difference considering octaves
          "originalValue": "9/8", // Property: Interval value calculated from the original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value
        }
      ],
      "transposition": false, // Property: Boolean indicating if this is base form (false) or transposed (true)
      "commentsEnglish": "", // Property: Additional context in English
      "commentsArabic": "", // Property: Additional context in Arabic
      "SourcePageReferences": [] // Property: Array of academic source citations
    }
  }
}
```

## Maqāmāt Data

The allMaqamatData section contains complete scale information:

```json
{
  "allMaqamatData": {
    "maqam_rast": { // Object Key: Unique identifier for this maqām transposition
      "maqamId": "1", // Property: Core database maqām ID linking to the original maqām definition
      "name": "maqām rāst", // Property: Full display name with starting note
      "ascendingPitchClasses": ["rast", "dugah", "segah", "chahargah", "nawa", "husayni", "awj"], // Property: Array of pitch class names for ascending melodic motion
      "descendingPitchClasses": ["ajam", "husayni", "nawa", "chahargah", "segah", "dugah", "rast"], // Property: Array of pitch class names for descending melodic motion
      "ascendingPitchClassIntervals": [ // Property: Array of interval objects for ascending motion
        {
          "fraction": "9/8", // Property: First interval (rast to dugah)
          "cents": 203.91000173077487, // Property: Interval value in cents
          "decimalRatio": 1.125, // Property: Interval value as decimal ratio
          "stringLength": -93.75, // Property: String length relative to tuning system string length
          "fretDivision": 93.75, // Property: Fret position calculation
          "pitchClassIndex": 3, // Property: Pitch class index difference considering octaves
          "originalValue": "9/8", // Property: Interval value from original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value
        },
        {
          "fraction": "13/12", // Property: Second interval (dugah to segah)
          "cents": 138.57266090392324, // Property: Interval value in cents
          "decimalRatio": 1.0833333333333333, // Property: Interval value as decimal ratio
          "stringLength": -57.692307692307736, // Property: String length relative to tuning system
          "fretDivision": 57.69200000000001, // Property: Fret position calculation
          "pitchClassIndex": 2, // Property: Pitch class index difference considering octaves
          "originalValue": "13/12", // Property: Interval value from original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value
        }
        // ... additional intervals for remaining degrees
      ],
      "descendingPitchClassIntervals": [ // Property: Array of interval objects for descending motion
        {
          "fraction": "273/256", // Property: First descending interval
          "cents": 111.30856910382295, // Property: Interval value in cents
          "decimalRatio": 1.06640625, // Property: Interval value as decimal ratio
          "stringLength": -31.135531135531153, // Property: String length relative to tuning system
          "fretDivision": 31.135999999999967, // Property: Fret position calculation
          "pitchClassIndex": 2, // Property: Pitch class index difference considering octaves
          "originalValue": "273/256", // Property: Interval value from original tuning system definition
          "originalValueType": "fraction" // Property: Format type of original input value
        }
        // ... additional intervals for remaining degrees
      ],
      "ascendingMaqamAjnas": { // Property: Object mapping pitch class names to jins references for ascending motion
        "rast": "jins_rast_nawa_al-rast", // Property: Reference to jins used on this pitch class
        "dugah": "jins_bayyat", // Property: Reference to jins used on this pitch class
        "segah": "jins_segah", // Property: Reference to jins used on this pitch class
        "chahargah": null, // Property: No jins assigned to this pitch class
        "nawa": "jins_rast_nawa", // Property: Reference to jins used on this pitch class
        "husayni": "jins_bayyat_al-husayni", // Property: Reference to jins used on this pitch class
        "awj": "jins_segah_al-awj" // Property: Reference to jins used on this pitch class
      },
      "descendingMaqamAjnas": { // Property: Object mapping pitch class names to jins references for descending motion
        "ajam": null, // Property: No jins assigned to this pitch class
        "husayni": "jins_kurd_al-husayni", // Property: Reference to jins used on this pitch class
        "nawa": "jins_nahawand_al-nawa", // Property: Reference to jins used on this pitch class
        "chahargah": "jins_chahargah_(al-Shawwa)", // Property: Reference to jins used on this pitch class
        "segah": "jins_segah", // Property: Reference to jins used on this pitch class
        "dugah": "jins_bayyat", // Property: Reference to jins used on this pitch class
        "rast": "jins_rast_nawa_al-rast" // Property: Reference to jins used on this pitch class
      },
      "transposition": false, // Property: Boolean indicating if this is base form (false) or transposed (true)
      "commentsEnglish": "", // Property: Additional context in English
      "commentsArabic": "", // Property: Additional context in Arabic
      "SourcePageReferences": [], // Property: Array of academic source citations
      "maqamToMaqamModulations": { // Property: Object containing all possible maqām modulations from this maqām
        "maqamToMaqamModulationsDegreesNoteNames": { // Property: Note names for each modulation degree
          "maqamModulationsOnFirstDegreeNoteName": "rast", // Property: Note name for first degree modulations
          "maqamModulationsOnThirdDegreeNoteName": "segah", // Property: Note name for third degree modulations
          "maqamModulationsOnAltThirdDegreeNoteName": "kurdi", // Property: Note name for alternative third degree modulations
          "maqamModulationsOnFourthDegreeNoteName": "chahargah", // Property: Note name for fourth degree modulations
          "maqamModulationsOnFifthDegreeNoteName": "nawa", // Property: Note name for fifth degree modulations
          "maqamModulationsOnSixthDegreeAscNoteName": "husayni", // Property: Note name for sixth degree ascending modulations
          "maqamModulationsOnSixthDegreeDescNoteName": "husayni", // Property: Note name for sixth degree descending modulations
          "maqamModulationsOnSixthDegreeIfNoThirdNoteName": "husayni" // Property: Note name for sixth degree modulations if no third
        },
        "maqamToMaqamModulationsLowerOctaveDegreesNoteNames": { // Property: Lower octave note names for each modulation degree
          "maqamModulationsOnFirstDegree8vbNoteName": "qarar_rast", // Property: Lower octave note name for first degree modulations
          "maqamModulationsOnThirdDegree8vbNoteName": "qarar_segah", // Property: Lower octave note name for third degree modulations
          "maqamModulationsOnAltThirdDegree8vbNoteName": "qarar_kurdi", // Property: Lower octave note name for alternative third degree modulations
          "maqamModulationsOnFourthDegree8vbNoteName": "qarar_chahargah", // Property: Lower octave note name for fourth degree modulations
          "maqamModulationsOnFifthDegree8vbNoteName": "yegah", // Property: Lower octave note name for fifth degree modulations
          "maqamModulationsOnSixthDegreeAsc8vbNoteName": "ushayran", // Property: Lower octave note name for sixth degree ascending modulations
          "maqamModulationsOnSixthDegreeDesc8vbNoteName": "ushayran", // Property: Lower octave note name for sixth degree descending modulations
          "maqamModulationsOnSixthDegreeIfNoThird8vbNoteName": "ushayran" // Property: Lower octave note name for sixth degree modulations if no third
        },
        "maqamToMaqamModulations": { // Property: Maqām modulation arrays for each degree
          "maqamToMaqamModulationsOnFirstDegree": ["maqam_hijaz_kar_kurd", "maqam_nikriz", "maqam_nawa_athar", "maqam_nahawand", "maqam_nahawand_kabir", "maqam_nayruz", "maqam_hijaz_kar", "maqam_sultani_yegah_al-rast"], // Property: Array of maqām references for modulations from first degree
          "maqamToMaqamModulationsOnThirdDegree": ["maqam_segah", "maqam_huzam", "maqam_rahat_al-arwah_al-segah", "maqam_mustaar", "maqam_awj_ara_al-segah"], // Property: Array of maqām references for modulations from third degree
          "maqamToMaqamModulationsOnAltThirdDegree": [], // Property: Array of maqām references for modulations from alternative third degree
          "maqamToMaqamModulationsOnFourthDegree": ["maqam_nikriz_al-chahargah", "maqam_chahargah_(al-Shawwa)"], // Property: Array of maqām references for modulations from fourth degree
          "maqamToMaqamModulationsOnFifthDegree": ["maqam_hijaz_al-nawa", "maqam_nawa_athar_al-nawa", "maqam_nahawand_kabir_al-nawa", "maqam_farahfazza_al-nawa", "maqam_sultani_yegah_al-nawa", "maqam_dilkeshidah_al-nawa", "maqam_rast_yegah_al-nawa", "maqam_hijaz_kar_(mutlaq)_al-nawa", "maqam_nahawand_al-nawa", "maqam_bayyat_nawa"], // Property: Array of maqām references for modulations from fifth degree
          "maqamToMaqamModulationsOnSixthDegreeAsc": ["maqam_bayyat_shuri_al-husayni", "maqam_bayyat_husayni_al-husayni", "maqam_husayni_ushayran_al-husayni"], // Property: Array of maqām references for modulations from sixth degree ascending
          "maqamToMaqamModulationsOnSixthDegreeDesc": [], // Property: Array of maqām references for modulations from sixth degree descending
          "maqamToMaqamModulationsOnSixthDegreeIfNoThird": [], // Property: Array of maqām references for modulations from sixth degree if no third
          "maqamToMaqamModulations2pBelowThirdNoteName": "kurdī" // Property: Alternative note name for third degree (if applicable)
        },
        "maqamToMaqamModulationsLowerOctave": { // Property: Lower octave maqām modulation arrays for each degree
          "maqamToMaqamModulationsOnFirstDegree8vb": ["maqam_hijaz_kar_kurd_al-qarar_rast", "maqam_nikriz_al-qarar_rast", "maqam_nawa_athar_al-qarar_rast", "maqam_nahawand_al-qarar_rast", "maqam_nahawand_kabir_al-qarar_rast", "maqam_nayruz_al-qarar_rast", "maqam_hijaz_kar_al-qarar_rast", "maqam_sultani_yegah_al-qarar_rast"], // Property: Array of maqām references for lower octave modulations from first degree
          "maqamToMaqamModulationsOnThirdDegree8vb": ["maqam_segah_al-qarar_segah", "maqam_huzam_al-qarar_segah", "maqam_rahat_al-qarar_segah", "maqam_mustaar_al-qarar_segah", "maqam_awj_ara_al-qarar_segah"], // Property: Array of maqām references for lower octave modulations from third degree
          "maqamToMaqamModulationsOnAltThirdDegree8vb": [], // Property: Array of maqām references for lower octave modulations from alternative third degree
          "maqamToMaqamModulationsOnFourthDegree8vb": ["maqam_nikriz_al-qarar_chahargah", "maqam_chahargah_(al-Shawwa)_al-qarar_chahargah"], // Property: Array of maqām references for lower octave modulations from fourth degree
          "maqamToMaqamModulationsOnFifthDegree8vb": ["maqam_hijaz_al-yegah", "maqam_nawa_athar_al-yegah", "maqam_nahawand_kabir_al-yegah", "maqam_farahfazza_al-yegah", "maqam_sultani_yegah_al-yegah", "maqam_dilkeshidah_al-yegah", "maqam_rast_yegah_al-yegah", "maqam_hijaz_kar_(mutlaq)_al-yegah", "maqam_nahawand_al-yegah", "maqam_bayyat_nawa_al-yegah"], // Property: Array of maqām references for lower octave modulations from fifth degree
          "maqamToMaqamModulationsOnSixthDegreeAsc8vb": ["maqam_bayyat_shuri_al-ushayran", "maqam_bayyat_husayni_al-ushayran", "maqam_husayni_ushayran_al-ushayran"], // Property: Array of maqām references for lower octave modulations from sixth degree ascending
          "maqamToMaqamModulationsOnSixthDegreeDesc8vb": [], // Property: Array of maqām references for lower octave modulations from sixth degree descending
          "maqamToMaqamModulationsOnSixthDegreeIfNoThird8vb": [], // Property: Array of maqām references for lower octave modulations from sixth degree if no third
          "maqamToMaqamModulations2pBelowThird8vb": "qarar_kurdi" // Property: Lower octave alternative note name for third degree
        }
      },
      "maqamToJinsModulations": { // Property: Object containing all possible jins modulations from this maqām
        "maqamToJinsModulationDegreesNoteNames": { // Property: Note names for each jins modulation degree
          "maqamToJinsModulationsOnFirstDegreeNoteName": "rast", // Property: Note name for first degree jins modulations
          "maqamToJinsModulationsOnThirdDegreeNoteName": "segah", // Property: Note name for third degree jins modulations
          "maqamToJinsModulationsOnAltThirdDegreeNoteName": "kurdi", // Property: Note name for alternative third degree jins modulations
          "maqamToJinsModulationsOnFourthDegreeNoteName": "chahargah", // Property: Note name for fourth degree jins modulations
          "maqamToJinsModulationsOnFifthDegreeNoteName": "nawa", // Property: Note name for fifth degree jins modulations
          "maqamToJinsModulationsOnSixthDegreeAscNoteName": "husayni", // Property: Note name for sixth degree ascending jins modulations
          "maqamToJinsModulationsOnSixthDegreeDescNoteName": "husayni", // Property: Note name for sixth degree descending jins modulations
          "maqamToJinsModulationsOnSixthDegreeIfNoThirdNoteName": "husayni" // Property: Note name for sixth degree jins modulations if no third
        },
        "maqamToJinsModulationsLowerOctaveDegreesNoteNames": { // Property: Lower octave note names for each jins modulation degree
          "maqamToJinsModulationsOnFirstDegree8vbNoteName": "qarar_rast", // Property: Lower octave note name for first degree jins modulations
          "maqamToJinsModulationsOnThirdDegree8vbNoteName": "qarar_segah", // Property: Lower octave note name for third degree jins modulations
          "maqamToJinsModulationsOnAltThirdDegree8vbNoteName": "qarar_kurdi", // Property: Lower octave note name for alternative third degree jins modulations
          "maqamToJinsModulationsOnFourthDegree8vbNoteName": "qarar_chahargah", // Property: Lower octave note name for fourth degree jins modulations
          "maqamToJinsModulationsOnFifthDegree8vbNoteName": "yegah", // Property: Lower octave note name for fifth degree jins modulations
          "maqamToJinsModulationsOnSixthDegreeAsc8vbNoteName": "ushayran", // Property: Lower octave note name for sixth degree ascending jins modulations
          "maqamToJinsModulationsOnSixthDegreeDesc8vbNoteName": "ushayran", // Property: Lower octave note name for sixth degree descending jins modulations
          "maqamToJinsModulationsOnSixthDegreeIfNoThird8vbNoteName": "ushayran" // Property: Lower octave note name for sixth degree jins modulations if no third
        },
        "maqamToJinsModulations": { // Property: Jins modulation arrays for each degree
          "maqamToJinsModulationsOnFirstDegree": ["jins_rast_nawa_al-rast", "jins_nahawand", "jins_nikriz", "jins_rast", "jins_nahawand_nawa_al-rast", "jins_hijaz_3_(binsir)", "jins_kurd_(binsir)"], // Property: Array of ajnās references for modulations from first degree
          "maqamToJinsModulationsOnThirdDegree": ["jins_segah", "jins_mustaar_al-segah", "jins_awj_ara_al-segah", "jins_iraq_al-segah"], // Property: Array of ajnās references for modulations from third degree
          "maqamToJinsModulationsOnAltThirdDegree": [], // Property: Array of ajnās references for modulations from alternative third degree
          "maqamToJinsModulationsOnFourthDegree": ["jins_nikriz_al-chahargah", "jins_chahargah_(al-Shawwa)"], // Property: Array of ajnās references for modulations from fourth degree
          "maqamToJinsModulationsOnFifthDegree": ["jins_rast_nawa", "jins_nahawand_al-nawa", "jins_hijaz_1_al-nawa", "jins_segah_baladi", "jins_nikriz_al-nawa", "jins_rast_al-nawa", "jins_nahawand_nawa", "jins_hijaz_ushayran_al-nawa", "jins_bayyat_nawa"], // Property: Array of ajnās references for modulations from fifth degree
          "maqamToJinsModulationsOnSixthDegreeAsc": ["jins_rast_nawa_al-husayni", "jins_bayyat_al-husayni", "jins_saba_al-husayni", "jins_kurd_al-husayni", "jins_saba_zamzam_al-husayni", "jins_athar_kurd_al-husayni", "jins_hijaz_1_al-husayni", "jins_segah_baladi_al-husayni", "jins_rast_al-husayni", "jins_buselik_(al-Hilu)_al-husayni", "jins_bayyat_ushayran_al-husayni", "jins_hijaz_ushayran_al-husayni", "jins_kurd_ushayran_al-husayni"], // Property: Array of ajnās references for modulations from sixth degree ascending
          "maqamToJinsModulationsOnSixthDegreeDesc": [], // Property: Array of ajnās references for modulations from sixth degree descending
          "maqamToJinsModulationsOnSixthDegreeIfNoThird": [], // Property: Array of ajnās references for modulations from sixth degree if no third
          "maqamToJinsNoteName2pBelowThird": "kurdī" // Property: Alternative note name for third degree (if applicable)
        },
        "maqamToJinsModulationsLowerOctave": { // Property: Lower octave jins modulation arrays for each degree
          "maqamToJinsModulationsOnFirstDegree8vb": ["jins_rast_nawa_al-qarar_rast", "jins_nahawand_al-qarar_rast", "jins_nikriz_al-qarar_rast", "jins_rast_al-qarar_rast", "jins_nahawand_nawa_al-qarar_rast", "jins_hijaz_3_(binsir)_al-qarar_rast", "jins_kurd_(binsir)_al-qarar_rast"], // Property: Array of ajnās references for lower octave modulations from first degree
          "maqamToJinsModulationsOnThirdDegree8vb": ["jins_segah_al-qarar_segah", "jins_mustaar_al-qarar_segah", "jins_awj_ara_al-qarar_segah", "jins_iraq_al-qarar_segah"], // Property: Array of ajnās references for lower octave modulations from third degree
          "maqamToJinsModulationsOnAltThirdDegree8vb": [], // Property: Array of ajnās references for lower octave modulations from alternative third degree
          "maqamToJinsModulationsOnFourthDegree8vb": ["jins_nikriz_al-qarar_chahargah", "jins_chahargah_(al-Shawwa)_al-qarar_chahargah"], // Property: Array of ajnās references for lower octave modulations from fourth degree
          "maqamToJinsModulationsOnFifthDegree8vb": ["jins_rast_nawa_al-yegah", "jins_nahawand_al-yegah", "jins_hijaz_1_al-yegah", "jins_segah_baladi_al-yegah", "jins_nikriz_al-yegah", "jins_rast_al-yegah", "jins_nahawand_nawa_al-yegah", "jins_hijaz_ushayran_al-yegah", "jins_bayyat_nawa_al-yegah"], // Property: Array of ajnās references for lower octave modulations from fifth degree
          "maqamToJinsModulationsOnSixthDegreeAsc8vb": ["jins_rast_nawa_al-ushayran", "jins_bayyat_al-ushayran", "jins_saba_al-ushayran", "jins_kurd_al-ushayran", "jins_saba_zamzam_al-ushayran", "jins_athar_kurd_al-ushayran", "jins_hijaz_1_al-ushayran", "jins_segah_baladi_al-ushayran", "jins_rast_al-ushayran", "jins_buselik_(al-Hilu)_al-ushayran", "jins_bayyat_ushayran_al-ushayran", "jins_hijaz_ushayran_al-ushayran", "jins_kurd_ushayran_al-ushayran"], // Property: Array of ajnās references for lower octave modulations from sixth degree ascending
          "maqamToJinsModulationsOnSixthDegreeDesc8vb": [], // Property: Array of ajnās references for lower octave modulations from sixth degree descending
          "maqamToJinsModulationsOnSixthDegreeIfNoThird8vb": [], // Property: Array of ajnās references for lower octave modulations from sixth degree if no third
          "maqamToJinsNoteName2pBelowThird8vb": "qarar_kurdi" // Property: Lower octave alternative note name for third degree
        }
      }
    }
  }
}
```

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
  }
}
```

#### *Data Objects*

Complete objects containing structured information:

```json
{
  "qarar_ushayran": {             // ← Object Key: Identifies this pitch class
    "noteName": "qarār ʿushayrān", // ← Property: Display name
    "englishName": "G",           // ← Property: Western equivalent
    "fraction": "1/2",            // ← Property: Mathematical ratio
    "cents": "-1200"              // ← Property: Logarithmic measurement
    // ... more properties
  }
}
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

* Modulation arrays within maqāmāt and ajnās may include both base forms and transpositions, reflecting all possible modal pathways in the system.

* To analyze all possible realizations of a jins or maqām, enumerate both the base form and all its transpositions as listed in the export.

* When comparing structures across tuning systems, always check the transposition property to distinguish between original and derived forms.