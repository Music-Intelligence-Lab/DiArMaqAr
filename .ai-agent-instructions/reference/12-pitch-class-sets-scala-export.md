# 12-Pitch-Class Sets API: Comprehensive Guide

## Overview

The `/api/maqamat/classification/12-pitch-class-sets` endpoint provides flexible pitch class set data for both musicological analysis and practical applications like Scala (.scl) file export and MIDI keyboard tuning. It supports multiple parameters to customize the output format and data presentation.

## Key Features

1. **Dual-Mode Presentation** (`startSetFromC`): Start from maqām tonic (analysis) or IPN "C" (Scala export)
2. **Flexible Data Output** (`pitchClassDataType`): Control which pitch class fields are returned
3. **Per-Maqam Tonic Information**: Each compatible maqām includes its specific tonic details
4. **Scala Export Compatibility**: Direct .scl file generation without .kbm mapping files

---

# Feature 1: Scala Export Mode (`startSetFromC`)

## Purpose

- **Default mode (`startSetFromC=false`)**: Pitch classes start from maqām tonic for musicological analysis
- **Scala mode (`startSetFromC=true`)**: Pitch classes start from C for Scala export and MIDI keyboard tuning (no .kbm file needed)

## Technical Implementation

### 1. Octave Selection Logic

For maqāmāt starting mid-octave (e.g., D, E, F), pitch classes are selectively shifted to maintain correct Arabic note names:

```
Chromatic order: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
Maqām tonic: D (index 2)

Octave selection:
- C, C#: Before tonic → Use octave 1 (rāst, zīrgūleh)
- D onwards: At/after tonic → Use original octaves
```

**Why this matters**: According to the NoteName model:
- C octave 1 = rāst
- C octave 2 = kurdān
- D octave 1 = dūgāh

Without selective octave shifting, a maqām starting on D would incorrectly use kurdān (C octave 2) instead of rāst (C octave 1).

### 2. Array Rotation

After octave selection, the array is rotated to place C first:

```typescript
const cIndex = allPitchClasses.findIndex(item => item.ipnRef === 'C');
orderedPitchClasses = [
  ...allPitchClasses.slice(cIndex),
  ...allPitchClasses.slice(0, cIndex)
];
```

### 3. Relative Cents Calculation

Relative cents are calculated from C (first element = 0.00 cents). Octave wrap-around is handled:

```typescript
let relativeCents = cents - referenceCents;

// Handle wrap-around (e.g., D at 702.13 - C at 498.04 = 204.08)
if (startSetFromC && relativeCents < 0) {
  relativeCents += 1200;  // Add octave
}
```

### 4. Per-Maqam Tonic Tracking

Each compatible maqām in the set includes its own `tonic` information (since transpositions have different tonics):

```json
{
  "compatibleMaqamat": [
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
  ]
}
```

**Why per-maqam?** Different compatible maqāmāt can have different tonics (transpositions). For example, in the same set:
- Maqām ḥijāz: tonic D (dūgāh) at position 2
- Maqām rāḥat al-arwāḥ al-awj: tonic B (awj) at position 11

**Octave equivalents**: Maqāmāt starting in different octaves (e.g., qarār dūgāh, muḥayyar) correctly map to their pitch class equivalents. For example, qarār dūgāh (lower octave D) and muḥayyar (upper octave D) both show `ipnReferenceNoteName: "D"` and the same `positionInSet` as dūgāh, since they are all variants of the D pitch class.

## Concrete Example: Maqām Ḥijāz

### Default Mode

```
Tonic: D (dūgāh)
Position 0: D - dūgāh (0.00 cents relative, 702.13 cents absolute)
Position 1: D# - kurdī (90.05 cents relative, 792.18 cents absolute)
...
Position 10: C - kurdān (995.92 cents relative, 1698.04 cents absolute)
Position 11: C# - shahnāz (1086.14 cents relative, 1788.27 cents absolute)
```

### Scala Mode

```
Tonic: D (dūgāh) at position 2
Position 0: C - rāst (0.00 cents relative, 498.04 cents absolute)
Position 1: C# - zīrgūleh (92.21 cents relative, 590.25 cents absolute)
Position 2: D - dūgāh (204.08 cents relative, 702.13 cents absolute) ← TONIC
Position 3: D# - kurdī (294.13 cents relative, 792.18 cents absolute)
...
```

## Key Differences Between Modes

| Aspect | Default Mode | Scala Mode |
|--------|-------------|------------|
| **First note** | Maqām tonic | C (IPN reference) |
| **Relative cents start** | 0.00 at tonic | 0.00 at C |
| **C note name (ḥijāz)** | kurdān (oct 2) | rāst (oct 1) |
| **C# note name (ḥijāz)** | shahnāz (oct 2) | zīrgūleh (oct 1) |
| **Tonic position** | Always 0 | Varies (e.g., 2 for D) |
| **Use case** | Musicological analysis | Scala export, MIDI tuning |

## Implementation Files

- **API Route**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts` (lines 207-258)
- **Octave selection**: Lines 228-243
- **Array rotation**: Lines 248-258
- **Relative cents wrap**: Lines 302-307

## Note Name Verification

Always verify note names against `src/models/NoteName.ts`:

```typescript
export const octaveOneNoteNames = [
  "yegāh",      // 0
  ...
  "rāst",       // 16  ← C octave 1
  ...
  "zīrgūleh",   // 19  ← C# octave 1
  ...
  "dūgāh",      // 21  ← D octave 1
  ...
];

export const octaveTwoNoteNames = [
  "nawā",       // 0   ← G octave 2
  ...
  "kurdān",     // 16  ← C octave 2
  ...
  "shahnāz",    // 19  ← C# octave 2
  ...
];
```

## Critical Rules

1. **Never mix octaves incorrectly**: C and C# before the tonic MUST come from octave 1
2. **Preserve absolute cents**: Absolute cents values are unchanged between modes
3. **Maintain chromatic order**: The 12 pitch classes follow C, C#, D, D#, E, F, F#, G, G#, A, A#, B
4. **Track tonic position**: Always include maqamTonic metadata in Scala mode
5. **Handle wrap-around**: Add 1200 cents to negative relative cents values

## Testing

Verify both modes return identical note names for pitch classes at or after the tonic:

```bash
# Default mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set'

# Scala mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?startSetFromC=true&setId=maqam_hijaz_set'

# Compare: D, D#, E, F, F#, G, G#, A, A#, B should have identical note names
# Only C and C# differ (rāst/zīrgūleh vs kurdān/shahnāz)
```

---

# Feature 2: Flexible Data Output (`pitchClassDataType`)

## Purpose

Control which pitch class data fields are returned in the response to optimize payload size and focus on specific use cases.

## Available Options

### Core Options
- `all` - Returns all 15 available pitch class fields
- `cents` - Absolute cents value from tuning system
- `relativeCents` - Cents relative to first pitch class (0.00 at tonic or C)
- `fraction` - Frequency ratio as fraction string
- `decimalRatio` - Frequency ratio as decimal number
- `frequency` - Frequency in Hz

### Note Naming
- `englishName` - English note name with octave (e.g., "D2", "E-b3")
- `abjadName` - Arabic abjad notation
- `referenceNoteName` - IPN reference note name for 12-EDO comparison

### Instrument-Specific
- `stringLength` - String length for oud/qanun
- `fretDivision` - Fret position for oud

### MIDI & 12-EDO Comparison
- `midiNoteNumber` - MIDI note number as decimal
- `midiNoteDeviation` - MIDI note with cents deviation string (e.g., "62 +4.1")
- `centsDeviation` - Cents deviation from 12-EDO

## Default Behavior (Parameter Omitted)

When `pitchClassDataType` is not provided, returns minimal fields:
- `ipnReferenceNoteName`
- `noteName` (Arabic)
- `relativeCents`
- `octave`

## Usage Examples

```bash
# Minimal output (default)
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set'

# Only cents values
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=cents'

# All available data
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=all'

# Combined with Scala mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true&pitchClassDataType=fraction'
```

## Response Structure Comparison

### Default (No Parameter)
```json
{
  "ipnReferenceNoteName": "C",
  "noteName": "rāst",
  "relativeCents": 0,
  "octave": 1
}
```

### With `pitchClassDataType=cents`
```json
{
  "ipnReferenceNoteName": "C",
  "noteName": "rāst",
  "cents": 498.0449991346125
}
```

### With `pitchClassDataType=all`
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

## Implementation Details

**File**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts`
- **Helper function**: Lines 24-95 (`formatPitchClassData`)
- **Validation**: Lines 115-144
- **Application**: Line 305

**Pattern**: Same filtering approach as `/maqamat/{idName}` endpoint for API consistency

---

# Feature 3: Compatible Maqāmāt with Tonic Information

## Structure

Each compatible maqām in a 12-pitch-class set includes:

```typescript
{
  maqamIdName: string;           // Standardized ID (e.g., "maqam_hijaz")
  maqamDisplayName: string;      // Display name (e.g., "maqām ḥijāz")
  baseMaqamIdName: string;       // Base maqam ID (for filtering transpositions)
  isTransposed: boolean;         // Whether this is a transposition
  tonic: {
    ipnReferenceNoteName: string;      // IPN letter (e.g., "D") - uses octave equivalent
    noteNameIdName: string;            // Standardized name (e.g., "dugah")
    noteNameDisplayName: string;       // Display name (e.g., "dūgāh") - preserves original octave
    positionInSet: number;             // Index 0-11 (matches pitch class in set)
  } | null
}
```

## Real-World Example: Maqām Ḥijāz Set (Scala Mode)

```json
{
  "compatibleMaqamat": [
    {
      "maqamDisplayName": "maqām ḥijāz",
      "tonic": {
        "ipnReferenceNoteName": "D",
        "noteNameDisplayName": "dūgāh",
        "positionInSet": 2
      }
    },
    {
      "maqamDisplayName": "maqām ḥijāz al-qarār dūgāh",
      "tonic": {
        "ipnReferenceNoteName": "D",
        "noteNameDisplayName": "qarār dūgāh",
        "positionInSet": 2
      }
    },
    {
      "maqamDisplayName": "maqām ḥijāz al-muḥayyar",
      "tonic": {
        "ipnReferenceNoteName": "D",
        "noteNameDisplayName": "muḥayyar",
        "positionInSet": 2
      }
    },
    {
      "maqamDisplayName": "maqām rāḥat al-arwāḥ al-awj",
      "tonic": {
        "ipnReferenceNoteName": "B",
        "noteNameDisplayName": "awj",
        "positionInSet": 11
      }
    }
  ]
}
```

## Why This Matters

1. **Transposition identification**: Quickly see which maqāmāt share the same pitch collection but start on different tonics
2. **MIDI mapping**: Know exactly which MIDI key each maqām starts on when using the 12-pitch-class tuning
3. **Scala keyboard layout**: Understand keyboard mapping without needing .kbm files
4. **Octave equivalence**: Maqāmāt starting in different octaves (qarār, muḥayyar) correctly map to their pitch class equivalents, showing the same IPN and position

## Critical Implementation Detail

**Why not top-level `maqamTonic`?** Each compatible maqām can have a different tonic (transpositions). A top-level tonic field would be ambiguous and not useful. Instead, tonic information belongs to each individual maqām object.

**Octave Equivalent Matching**: The implementation matches tonics by their IPN reference note name (`referenceNoteName`) rather than exact Arabic note name. This ensures that qarār dūgāh (lower D), dūgāh (D), and muḥayyar (upper D) all correctly map to the same pitch class "D" in the 12-pitch-class set:

```typescript
// Get the IPN reference note name for the tonic (e.g., "D", "C#")
// This works even if the tonic is in a different octave
const tonicIpnRef = maqamTonicPitchClass?.referenceNoteName || '';

// Find the matching IPN in the 12-pitch-class set
// This finds the octave equivalent within the set
const maqamTonicPitchClassMatch = tonicIpnRef
  ? orderedPitchClasses.find(item => item.ipnRef === tonicIpnRef)
  : null;
```

**File**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts` (lines 323-340)

---

# Combined Feature Usage

## Example: Scala Export with Minimal Data

Generate Scala-compatible output with only essential cents data:

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&startSetFromC=true&pitchClassDataType=cents'
```

**Result**:
- Pitch classes start from C at 0.00 cents (relative)
- Each pitch class shows only IPN, note name, and absolute cents
- Each compatible maqām shows its tonic position in the C-based set
- Minimal payload for efficient Scala .scl file generation

## Example: Full Analysis Mode

Get complete data for musicological analysis:

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&pitchClassDataType=all'
```

**Result**:
- Pitch classes start from maqām tonic (D for ḥijāz)
- All 15 fields per pitch class (cents, fractions, MIDI, deviations, etc.)
- Full tonic information for all compatible maqāmāt
- Complete data for scholarly research and comparison

---

# Updated Testing Guide

```bash
# Test 1: Minimal default response
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set'

# Test 2: Scala mode with cents only
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true&pitchClassDataType=cents'

# Test 3: Full data, default mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=all'

# Test 4: Verify tonic positions in Scala mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true' | \
  python3 -c "import json, sys; data = json.load(sys.stdin); \
  [print(f'{m[\"maqamDisplayName\"]:30s} → Tonic: {m[\"tonic\"][\"ipnReferenceNoteName\"]:3s} ({m[\"tonic\"][\"noteNameDisplayName\"]:15s}) at position {m[\"tonic\"][\"positionInSet\"]}') \
  for m in data['sets'][0]['compatibleMaqamat'][:5]]"

# Test 5: Validate parameter combinations
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=invalid'
# Should return 400 error with valid options list
```
