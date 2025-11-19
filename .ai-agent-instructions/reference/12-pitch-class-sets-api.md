# 12-Pitch-Class Sets API Reference

**Purpose**: Complete reference for the `/api/maqamat/classification/12-pitch-class-sets` endpoint.

---

## Table of Contents

1. [Overview](#overview)
2. [API Parameters](#api-parameters)
3. [Response Structure](#response-structure)
4. [Usage Examples](#usage-examples)
5. [Concrete Example: Maqām Ḥijāz](#concrete-example-maqām-ḥijāz)
6. [Scala Export Functions](#scala-export-functions)

---

## Overview

The `/api/maqamat/classification/12-pitch-class-sets` endpoint provides flexible pitch class set data for both musicological analysis and practical applications like Scala (.scl) file export and MIDI keyboard tuning.

### Key Features

1. **Dual-Mode Presentation** (`startSetFromC`): Start from maqām tonic (analysis) or IPN "C" (Scala export)
2. **Flexible Data Output** (`pitchClassDataType`): Control which pitch class fields are returned
3. **Per-Maqam Tonic Information**: Each compatible maqām includes its specific tonic details
4. **Scala Export Compatibility**: Direct .scl file generation without .kbm mapping files

### What Is a 12-Pitch-Class Set?

A **12-pitch-class set** is a complete chromatic collection of 12 pitch classes (one for each semitone: C, C#, D, D#, E, F, F#, G, G#, A, A#, B) created by:

1. Taking a maqām's pitch classes
2. Filling gaps with pitch classes from a 12-tone tuning system (al-Kindī by default)
3. Ensuring chromatic ascending order
4. Optimizing octave selection

This creates a **playable chromatic set** suitable for MIDI keyboards and composition tools.

---

## API Parameters

### `startSetFromC` (boolean, optional, default: false)

Controls the starting point and ordering of the 12-pitch-class set.

**Values**:
- **`false` (default)**: Pitch classes start from maqām tonic for musicological analysis
- **`true`**: Pitch classes start from C for Scala export and MIDI keyboard tuning

**Use Cases**:
- `false`: Musicological analysis, displaying maqam structure from tonic
- `true`: Scala (.scl) file export, MIDI keyboard tuning (no .kbm file needed)

**Impact on Response**:
- Changes ordering of `pitchClasses` array
- Changes `relativeCents` reference point (tonic vs C)
- Changes `octave` assignments for notes before tonic
- Updates `tonic.positionInSet` for compatible maqāmāt

---

### `pitchClassDataType` (string, optional)

Controls which pitch class data fields are returned in the response.

**Core Options**:
- `all` - Returns all 15 available pitch class fields
- `cents` - Absolute cents value from tuning system
- `relativeCents` - Cents relative to first pitch class (0.00 at tonic or C)
- `fraction` - Frequency ratio as fraction string
- `decimalRatio` - Frequency ratio as decimal number
- `frequency` - Frequency in Hz

**Note Naming**:
- `englishName` - English note name with octave (e.g., "D2", "E-b3")
- `abjadName` - Arabic abjad notation
- `referenceNoteName` - IPN reference note name for 12-EDO comparison

**Instrument-Specific**:
- `stringLength` - String length for oud/qanun
- `fretDivision` - Fret position for oud

**MIDI & 12-EDO Comparison**:
- `midiNoteNumber` - MIDI note number as decimal
- `midiNoteDeviation` - MIDI note with cents deviation string (e.g., "62 +4.1")
- `centsDeviation` - Cents deviation from 12-EDO

**Default Behavior (Parameter Omitted)**:

When `pitchClassDataType` is not provided, returns minimal fields:
- `ipnReferenceNoteName`
- `noteName` (Arabic)
- `relativeCents`
- `octave`

---

### `setId` (string, optional)

Filter to a specific 12-pitch-class set by its ID.

**Format**: `{maqam_type}_{maqam_name}_set`

**Examples**:
- `maqam_rast_set`
- `maqam_hijaz_set`
- `maqam_bayati_set`

**When to Use**:
- Reduce response size by filtering to one set
- Get data for a specific maqām family

**When to Omit**:
- Get all 12-pitch-class sets in one request
- Compare multiple sets

---

## Response Structure

### Top-Level Structure

```json
{
  "sets": [
    {
      "setId": "maqam_rast_set",
      "pitchClassSet": {
        "pitchClasses": [ /* 12 pitch classes */ ]
      },
      "compatibleMaqamat": [ /* compatible maqāmāt with tonic info */ ]
    }
  ]
}
```

### Pitch Class Object

**Default (minimal)**:
```json
{
  "ipnReferenceNoteName": "C",
  "noteName": "rāst",
  "relativeCents": 0,
  "octave": 1
}
```

**With `pitchClassDataType=cents`**:
```json
{
  "ipnReferenceNoteName": "C",
  "noteName": "rāst",
  "cents": 498.0449991346125
}
```

**With `pitchClassDataType=all`**:
```json
{
  "ipnReferenceNoteName": "C",
  "noteName": "rāst",
  "cents": 498.0449991346125,
  "relativeCents": 0,
  "fraction": "1/1",
  "decimalRatio": 1,
  "frequency": 264,
  "octave": 1,
  "englishName": "C2",
  "stringLength": "66.000",
  "fretDivision": "0.000",
  "midiNoteDecimal": 60.0449991346125,
  "midiNoteDeviation": "60 +4.5",
  "centsDeviation": 4.5,
  "referenceNoteName": "C"
}
```

### Compatible Maqām Object

Each compatible maqām includes its own tonic information:

```json
{
  "maqamIdName": "maqam_hijaz",
  "maqamDisplayName": "maqām ḥijāz",
  "baseMaqamIdName": "maqam_hijaz",
  "isTransposed": false,
  "tonic": {
    "ipnReferenceNoteName": "D",
    "noteNameIdName": "dugah",
    "noteNameDisplayName": "dūgāh",
    "positionInSet": 2
  }
}
```

**Why per-maqam tonic?** Different compatible maqāmāt can have different tonics (transpositions). For example, in the same set:
- Maqām ḥijāz: tonic D (dūgāh) at position 2
- Maqām rāḥat al-arwāḥ al-awj: tonic B (awj) at position 11

**Octave equivalents**: Maqāmāt starting in different octaves (e.g., qarār dūgāh, muḥayyar) correctly map to their pitch class equivalents, showing the same `ipnReferenceNoteName` and `positionInSet`.

---

## Usage Examples

### Example 1: Minimal Default Response

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set'
```

**Returns**: Minimal fields (IPN, note name, relative cents, octave) starting from maqām tonic

**Response Size**: ~10 KB

**Use Case**: Quick lookup of maqām structure

---

### Example 2: Scala Mode with Cents Only

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true&pitchClassDataType=cents'
```

**Returns**: Pitch classes starting from C with absolute cents values - optimized for Scala .scl file generation

**Response Size**: ~8 KB

**Use Case**: Generate .scl file for MIDI keyboard

---

### Example 3: Full Data, Analysis Mode

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=all'
```

**Returns**: All 15 fields per pitch class, starting from maqām tonic - complete data for scholarly research

**Response Size**: ~25 KB

**Use Case**: Academic analysis, comprehensive documentation

---

### Example 4: Verify Tonic Positions in Scala Mode

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true' | \
  python3 -c "import json, sys; data = json.load(sys.stdin); \
  [print(f'{m[\"maqamDisplayName\"]:30s} → Tonic: {m[\"tonic\"][\"ipnReferenceNoteName\"]:3s} ({m[\"tonic\"][\"noteNameDisplayName\"]:15s}) at position {m[\"tonic\"][\"positionInSet\"]}') \
  for m in data['sets'][0]['compatibleMaqamat'][:5]]"
```

**Returns**: List of compatible maqāmāt with their tonic positions in the C-based set

**Output Example**:
```
maqām ḥijāz                    → Tonic: D   (dūgāh         ) at position 2
maqām shadd ʿarabān            → Tonic: G   (nawā          ) at position 7
maqām shahnāz                  → Tonic: C#  (shahnāz       ) at position 1
...
```

**Use Case**: Verify tonic positions for keyboard mapping

---

### Example 5: All Sets with Minimal Data

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets'
```

**Returns**: All 12-pitch-class sets with minimal pitch class data

**Response Size**: ~150 KB (varies based on number of sets)

**Use Case**: Overview of all maqām families and their pitch class sets

---

## Concrete Example: Maqām Ḥijāz

### Default Mode (`startSetFromC=false`)

**Request**:
```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&pitchClassDataType=cents'
```

**Response** (first 5 pitch classes):
```json
{
  "sets": [{
    "setId": "maqam_hijaz_set",
    "pitchClassSet": {
      "pitchClasses": [
        {"ipnReferenceNoteName": "D", "noteName": "dūgāh", "cents": 702.13},
        {"ipnReferenceNoteName": "D#", "noteName": "kurdī", "cents": 792.18},
        {"ipnReferenceNoteName": "E", "noteName": "segāh", "cents": 642.86},
        {"ipnReferenceNoteName": "F", "noteName": "chahārgāh", "cents": 792.18},
        {"ipnReferenceNoteName": "F#", "noteName": "ḥijāz", "cents": 905.87}
        // ... 7 more
      ]
    },
    "compatibleMaqamat": [
      {
        "maqamIdName": "maqam_hijaz",
        "maqamDisplayName": "maqām ḥijāz",
        "tonic": {
          "ipnReferenceNoteName": "D",
          "noteNameDisplayName": "dūgāh",
          "positionInSet": 0
        }
      }
      // ... more compatible maqāmāt
    ]
  }]
}
```

**Key Observations**:
- First note: **D** (tonic)
- Tonic position: **0**
- Pitch classes ordered from tonic

---

### Scala Mode (`startSetFromC=true`)

**Request**:
```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true&pitchClassDataType=cents'
```

**Response** (first 5 pitch classes):
```json
{
  "sets": [{
    "setId": "maqam_hijaz_set",
    "pitchClassSet": {
      "pitchClasses": [
        {"ipnReferenceNoteName": "C", "noteName": "rāst", "cents": 498.04},
        {"ipnReferenceNoteName": "C#", "noteName": "zīrgūleh", "cents": 590.25},
        {"ipnReferenceNoteName": "D", "noteName": "dūgāh", "cents": 702.13},
        {"ipnReferenceNoteName": "D#", "noteName": "kurdī", "cents": 792.18},
        {"ipnReferenceNoteName": "E", "noteName": "segāh", "cents": 642.86}
        // ... 7 more
      ]
    },
    "compatibleMaqamat": [
      {
        "maqamIdName": "maqam_hijaz",
        "maqamDisplayName": "maqām ḥijāz",
        "tonic": {
          "ipnReferenceNoteName": "D",
          "noteNameDisplayName": "dūgāh",
          "positionInSet": 2
        }
      }
      // ... more compatible maqāmāt
    ]
  }]
}
```

**Key Observations**:
- First note: **C** (not tonic)
- Tonic (D) position: **2**
- Pitch classes ordered from C
- Note names changed for C and C# (rāst/zīrgūleh instead of kurdān/shahnāz)

---

### Comparison: Default vs Scala Mode

| Aspect | Default Mode | Scala Mode |
|--------|-------------|------------|
| **First note** | Maqām tonic (D) | C (IPN reference) |
| **Relative cents start** | 0.00 at tonic | 0.00 at C |
| **C note name (ḥijāz)** | kurdān (oct 2) | rāst (oct 1) |
| **C# note name (ḥijāz)** | shahnāz (oct 2) | zīrgūleh (oct 1) |
| **Tonic position** | Always 0 | Varies (e.g., 2 for D) |
| **Octave for C/C#** | 2 (after tonic) | 1 (shifted for Scala) |
| **Use case** | Musicological analysis | Scala export, MIDI tuning |

---

## Scala Export Functions

### `exportMaqamTo12ToneScala`

**Purpose**: Generates a complete Scala (.scl) file from a maqām's 12-pitch-class set.

**File**: `src/functions/scala-export.ts` (lines 632-1080)

**Function Signature**:
```typescript
export function exportMaqamTo12ToneScala(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  description?: string,
  currentUrl?: string
): string | null
```

**Parameters**:
- `maqamInput`: Maqam object or MaqamData
- `tuningSystem`: Primary tuning system for the maqām
- `startingNote`: Starting note for the tuning system
- `alKindiTuningSystem`: Fallback 12-tone tuning system (for fillers)
- `alKindiStartingNote`: Starting note for al-Kindī system
- `description`: Optional description for the .scl file
- `currentUrl`: Optional URL for more information

**Returns**:
- `.scl` file content as string
- `null` if maqām is not a source for any 12-pitch-class set

**Key Implementation Details**:

1. **Calls Classification Algorithm**: Internally calls `classifyMaqamat()` to get the 12-pitch-class set
2. **Matches API Behavior**: Uses identical logic to API endpoint with `startSetFromC=true`
3. **Starting Note Name Lookup**: Gets the starting note name from the tuning system's note name sets (not from abstract arrays or indices). Uses `standardizeText()` comparison to find matching note name set, then uses the first element which has proper diacritics. This matches the API endpoint pattern (route.ts lines 293-311).
4. **Octave Shifting**: Automatically shifts octave 2 notes before tonic to octave 1
5. **Rotation to C**: Rotates pitch class array to start from C (degree 0)
6. **Relative Cents**: Calculates relative cents from C (not tonic)
7. **Capitalization**: Uses sentence case for labels (first letter capitalized, rest lowercase) and lowercase for all maqām names and note names throughout the header
8. **Reference Frequency Label**: Uses format "Scala file 1/1 (0 cents) reference frequency:" to clearly indicate this is the reference for the 1/1 ratio (0 cents) note

**Output Format** (Scala .scl file):
```
! maqām bayyāt shūrī (12 pitch class chromatic set)
! Generated by the Digital Arabic Maqām Archive (DiArMaqAr) https://diarmaqar.netlify.app
! Source maqām: maqām bayyāt shūrī
! Source maqām tonic note name: dūgāh
! Source tuning system: al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone + al-Kindī (874) 12-Tone (starting note: ʿushayrān, reference frequency: 110.00 Hz)
! Scala file 1/1 (0 cents) reference frequency: 130.37 Hz (C3)
! More information: [URL]
!
! Compatible maqāmāt in this set (13 total):
! - maqām sūznāk (and its octave equivalents: ...)
!   Tonic: C (rāst), position 0
!   ...
maqām bayyāt shūrī - 12-tone chromatic set (al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone + al-Kindī (874) 12-Tone)
12
!
113.69
203.91
294.13
348.73
498.04
611.73
701.96
800.91
905.87
996.09
1109.78
1200.00
```

**Header Formatting Rules**:
- **Capitalization**: Sentence case for labels (first letter capitalized, rest lowercase). Lowercase for all maqām names and note names.
- **Starting Note**: Displayed as actual note name from tuning system (e.g., "ʿushayrān"), not as numeric index. Obtained from `tuningSystem.getNoteNameSets()` using `standardizeText()` comparison.
- **Reference Frequency**: Label format is "Scala file 1/1 (0 cents) reference frequency:" to indicate this is the reference for the 1/1 ratio (0 cents) note.

**Important Notes**:
- Returns `null` if maqām is not a source for any 12-pitch-class set
- Uses same classification algorithm as API endpoint
- Pitch classes already in chromatic ascending order (DO NOT re-sort)
- Always operates in "Scala mode" (equivalent to `startSetFromC=true`)

**Related Function**: `exportMaqamTo12ToneScalaKeymap` - Generates keyboard mapping (.kbm) file for MIDI mapping

---

## Related Documentation

- [scala-export-overview.md](./scala-export-overview.md) - Choose export type
- [scala-scl-export.md](./scala-scl-export.md) - How to create .scl files (Section B)
- [scala-kbm-export.md](./scala-kbm-export.md) - How to create .kbm files (Section B)
- [12-pitch-class-sets-algorithm.md](./12-pitch-class-sets-algorithm.md) - Algorithm deep dive

---

*API reference for 12-pitch-class sets in DiArMaqAr*
