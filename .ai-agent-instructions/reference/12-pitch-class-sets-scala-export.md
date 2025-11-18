# 12-Pitch-Class Sets & Scala Export: Comprehensive Guide

**Complete reference for the 12-pitch-class sets API, classification algorithm, and Scala export functionality**

---

## Table of Contents

### Part 1: API Usage & Features
1. [Overview](#overview)
2. [API Parameters](#api-parameters)
3. [Response Structure](#response-structure)
4. [Usage Examples](#usage-examples)

### Part 2: Algorithm Deep Dive
5. [Set Creation Algorithm](#set-creation-algorithm)
6. [Compatibility Matching Process](#compatibility-matching-process)
7. [Octave Selection & Ordering](#octave-selection--ordering)
8. [startSetFromC Transformation](#startsetfromc-transformation)

### Part 3: Detailed Examples
9. [Manual Calculation Walkthrough](#manual-calculation-walkthrough)
10. [Verification Results](#verification-results)

---

# Part 1: API Usage & Features

## Overview

The `/api/maqamat/classification/12-pitch-class-sets` endpoint provides flexible pitch class set data for both musicological analysis and practical applications like Scala (.scl) file export and MIDI keyboard tuning.

### Key Features

1. **Dual-Mode Presentation** (`startSetFromC`): Start from maqām tonic (analysis) or IPN "C" (Scala export)
2. **Flexible Data Output** (`pitchClassDataType`): Control which pitch class fields are returned
3. **Per-Maqam Tonic Information**: Each compatible maqām includes its specific tonic details
4. **Scala Export Compatibility**: Direct .scl file generation without .kbm mapping files

---

## API Parameters

### `startSetFromC` (boolean, optional, default: false)

Controls the starting point and ordering of the 12-pitch-class set:

- **`false` (default)**: Pitch classes start from maqām tonic for musicological analysis
- **`true`**: Pitch classes start from C for Scala export and MIDI keyboard tuning

**Use Cases**:
- `false`: Musicological analysis, displaying maqam structure from tonic
- `true`: Scala (.scl) file export, MIDI keyboard tuning (no .kbm file needed)

### `pitchClassDataType` (string, optional)

Controls which pitch class data fields are returned in the response:

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

### `setId` (string, optional)

Filter to a specific 12-pitch-class set by its ID (e.g., `maqam_rast_set`, `maqam_hijaz_set`).

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

### Example 2: Scala Mode with Cents Only

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true&pitchClassDataType=cents'
```

**Returns**: Pitch classes starting from C with absolute cents values - optimized for Scala .scl file generation

### Example 3: Full Data, Analysis Mode

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=all'
```

**Returns**: All 15 fields per pitch class, starting from maqām tonic - complete data for scholarly research

### Example 4: Verify Tonic Positions in Scala Mode

```bash
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set&startSetFromC=true' | \
  python3 -c "import json, sys; data = json.load(sys.stdin); \
  [print(f'{m[\"maqamDisplayName\"]:30s} → Tonic: {m[\"tonic\"][\"ipnReferenceNoteName\"]:3s} ({m[\"tonic\"][\"noteNameDisplayName\"]:15s}) at position {m[\"tonic\"][\"positionInSet\"]}') \
  for m in data['sets'][0]['compatibleMaqamat'][:5]]"
```

**Returns**: List of compatible maqāmāt with their tonic positions in the C-based set

---

## Concrete Example: Maqām Ḥijāz

### Default Mode (`startSetFromC=false`)

```
Tonic: D (dūgāh) at position 0
Position 0: D - dūgāh (0.00 cents relative, 702.13 cents absolute)
Position 1: D# - kurdī (90.05 cents relative, 792.18 cents absolute)
...
Position 10: C - kurdān (995.92 cents relative, 1698.04 cents absolute)
Position 11: C# - shahnāz (1086.14 cents relative, 1788.27 cents absolute)
```

### Scala Mode (`startSetFromC=true`)

```
Tonic: D (dūgāh) at position 2
Position 0: C - rāst (0.00 cents relative, 498.04 cents absolute)
Position 1: C# - zīrgūleh (92.21 cents relative, 590.25 cents absolute)
Position 2: D - dūgāh (204.08 cents relative, 702.13 cents absolute) ← TONIC
Position 3: D# - kurdī (294.13 cents relative, 792.18 cents absolute)
...
```

### Key Differences Between Modes

| Aspect | Default Mode | Scala Mode |
|--------|-------------|------------|
| **First note** | Maqām tonic | C (IPN reference) |
| **Relative cents start** | 0.00 at tonic | 0.00 at C |
| **C note name (ḥijāz)** | kurdān (oct 2) | rāst (oct 1) |
| **C# note name (ḥijāz)** | shahnāz (oct 2) | zīrgūleh (oct 1) |
| **Tonic position** | Always 0 | Varies (e.g., 2 for D) |
| **Use case** | Musicological analysis | Scala export, MIDI tuning |

---

## Scala File Export Functions

### `exportMaqamTo12ToneScala`

**Purpose**: Generates a complete Scala (.scl) file from a maqām's 12-pitch-class set.

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

**File**: `src/functions/scala-export.ts` (lines 632-1080)

---

# Part 2: Algorithm Deep Dive

## Set Creation Algorithm

The algorithm creates 12-pitch-class sets by merging maqām pitch classes with a tuning system's 12-pitch base to create complete chromatic sets suitable for MIDI keyboard tuning and Scala export.

### Overall Algorithm Flow

The classification algorithm uses an iterative approach to find all distinct sets:

```typescript
while (hasUnprocessed && iterationCount < maxIterations) {
  // Two-pass approach: Process tahlil first, then transpositions
  for (let pass = 1; pass <= 2; pass++) {
    // Process all maqāmāt
    for (const maqamData of maqamat) {
      // Get all transpositions
      const transpositions = getMaqamTranspositions(...);

      // Filter by pass (tahlil vs transposed)
      const transpositionsToProcess = processingTahlil
        ? transpositions.filter(t => !t.transposition)  // Pass 1: Only tahlil
        : transpositions.filter(t => t.transposition);   // Pass 2: Only transpositions

      for (const transposition of transpositionsToProcess) {
        // Skip if already processed
        if (processedMaqamat.has(key)) continue;

        // Create set from this transposition
        const pitchClassSet = create12PitchClassSet(...);

        // Check if identical set exists
        if (existingSet) {
          // Add to existing set
        } else {
          // Create new set and find compatible maqāmāt
        }
      }
    }
  }
}
```

### Key Algorithm Features

1. **Two-Pass Processing**:
   - **Pass 1**: Process ALL tahlil (non-transposed) versions first
   - **Pass 2**: Process ALL transposed versions
   - **Purpose**: Ensures canonical sets are created from tahlil versions

2. **Processed Tracking**:
   - Each maqām/transposition combination has a unique key: `${maqamData.getId()}_${transposition.name}`
   - Once added to a set, marked as processed
   - Prevents maqāmāt from appearing in multiple sets

3. **Set Deduplication**:
   - Before creating a new set, checks if identical set exists (using `arePitchClassSetsEqual()`)
   - If identical set found, adds maqām to existing set instead

4. **Compatibility Checking**:
   - Only checks **unprocessed** maqāmāt
   - Checks **all transpositions** of each maqām
   - Uses tolerance-based comparison (default: 5 cents)

### Implementation Files

- **Main classification**: `src/functions/classifyMaqamat12PitchClassSets.ts`
- **Set creation**: `src/functions/create12PitchClassSet.ts`
- **API route**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts`

---

## Compatibility Matching Process

After a 12-pitch-class set is created from a source maqām, the system checks all other maqāmāt (and their transpositions) to find which ones can be performed entirely within that set. This matching process uses tolerance-based comparison of pitch class values.

### Step 1: Set Creation

A 12-pitch-class set is created from a source maqām transposition:

```typescript
const pitchClassSet = create12PitchClassSet(
  transposition,
  alKindiTuningSystem,
  alKindiStartingNote
);
```

**Result**: A `PitchClassSet` containing 12 pitch classes mapped by IPN reference (C, C#, D, D#, E, F, F#, G, G#, A, A#, B).

### Step 2: Check for Existing Set

Before creating a new set, the algorithm checks if an identical set already exists:

```typescript
let existingSet: ClassificationSet | null = null;
for (const set of sets) {
  if (arePitchClassSetsEqual(pitchClassSet, set.pitchClassSet, centsTolerance)) {
    existingSet = set;
    break;
  }
}
```

**Purpose**: Prevents duplicate sets - if the same pitch class values already exist, the maqām is added to that existing set instead.

**Comparison Method**: Uses `arePitchClassSetsEqual()` which compares normalized cents values (modulo 1200) within tolerance.

### Step 3: Find Compatible Maqāmāt

If creating a new set, the algorithm checks all other maqāmāt for compatibility:

```typescript
// Check all other maqamat for compatibility with this set
// Only check unprocessed maqamat to allow for finding multiple distinct sets
for (const otherMaqamData of maqamat) {
  const otherTranspositions = getMaqamTranspositions(
    otherMaqamData,
    cairoTuningSystem,
    cairoStartingNote,
    ajnas
  );

  for (const otherTransposition of otherTranspositions) {
    const otherKey = `${otherMaqamData.getId()}_${otherTransposition.name}`;

    // Skip if already processed or if it's the source maqam
    if (processedMaqamat.has(otherKey) || otherKey === key) {
      continue;
    }

    if (checkMaqamCompatibility(otherTransposition, pitchClassSet, centsTolerance)) {
      compatibleMaqamat.push({
        maqam: otherTransposition,
        maqamData: otherMaqamData,
        isCompatible: true
      });
      // Mark as processed when added to this set
      processedMaqamat.add(otherKey);
    }
  }
}
```

**Key Points**:
- Only checks **unprocessed** maqāmāt (allows finding multiple distinct sets)
- Checks **all transpositions** of each maqām
- Marks maqāmāt as processed when added to a set (prevents duplicates)
- Source maqām is automatically compatible (it created the set)

### The `checkMaqamCompatibility` Function

A maqām is compatible if **ALL** of the following are true:

1. ✅ **All IPN references exist**: Every pitch class in the maqām's ascending and descending sequences has a matching IPN reference in the set
2. ✅ **Cents values match**: The actual pitch class values (cents) match within tolerance, normalized to the same octave

#### Phase 1: Check Ascending Sequence

```typescript
// Check all pitch classes from ascending sequence
for (const maqamPitchClass of maqamTransposition.ascendingPitchClasses) {
  const ipnRef = getIpnReferenceNoteName(maqamPitchClass);
  const setPitchClass = pitchClassSet.pitchClasses.get(ipnRef);

  if (!setPitchClass) {
    // IPN reference doesn't exist in set
    return false;  // ❌ INCOMPATIBLE
  }

  // Compare actual pitch class values (cents)
  const maqamCents = parseFloat(maqamPitchClass.cents);
  const setCents = parseFloat(setPitchClass.cents);

  // Normalize to same octave for comparison (cents are relative, so we compare modulo 1200)
  const maqamCentsNormalized = maqamCents % 1200;
  const setCentsNormalized = setCents % 1200;

  // Check if they match within tolerance
  const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
  const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around

  if (diffWrapped > centsTolerance) {
    // Pitch class values don't match
    return false;  // ❌ INCOMPATIBLE
  }
}
```

**Process**:
1. For each pitch class in ascending sequence:
   - **Get IPN Reference**: Call `getIpnReferenceNoteName(maqamPitchClass)` to assign IPN reference based on musicological logic
   - **Lookup in Set**: Find pitch class with matching IPN reference
   - **If not found** → **INCOMPATIBLE**
   - **If found**, compare cents values:
     - Parse cents and normalize to same octave (modulo 1200)
     - Calculate difference with wrap-around handling
     - Check tolerance: If difference > tolerance → **INCOMPATIBLE**

#### Phase 2: Check Descending Sequence

Same process as ascending sequence, but for descending pitch classes.

**Important**: Both ascending AND descending sequences must match for compatibility.

### Tolerance Handling

#### Default Tolerance: 5 cents

The `centsTolerance` parameter (default: 5) allows for small differences in pitch class values. This accounts for:
- Floating-point precision differences
- Slight variations in tuning system calculations
- Rounding differences

#### Normalization to Same Octave

Cents values are normalized using modulo 1200 to compare pitch classes regardless of octave:

```typescript
const maqamCentsNormalized = maqamCents % 1200;
const setCentsNormalized = setCents % 1200;
```

**Example**:
- Set: A at 1200.00¢ → Normalized: 0.00¢
- Maqām: A at 2400.00¢ → Normalized: 0.00¢
- Difference: |0.00 - 0.00| = 0.00¢ ✅ (same pitch class, different octave)

#### Wrap-Around Handling

The algorithm handles wrap-around cases where the difference might be calculated incorrectly:

```typescript
const diff = Math.abs(maqamCentsNormalized - setCentsNormalized);
const diffWrapped = Math.min(diff, 1200 - diff); // Handle wrap-around
```

**Example**:
- Set: B at 1190.00¢ → Normalized: 1190.00¢
- Maqām: B at 10.00¢ → Normalized: 10.00¢
- Direct difference: |1190.00 - 10.00| = 1180.00¢ ❌ (too large!)
- Wrapped difference: min(1180, 1200 - 1180) = min(1180, 20) = 20.00¢ ✅ (correct)

### Example: Matching maqām ḥuzām to bayyāt shūrī Set

#### 12-Pitch-Class Set (from maqām bayyāt shūrī):

| IPN | Note Name | Cents | Normalized (mod 1200) |
|-----|-----------|-------|----------------------|
| D | dūgāh | 498.04 | 498.04 |
| D# | kurdī | 588.27 | 588.27 |
| E | segāh | 642.86 | 642.86 |
| F | chahārgāh | 792.18 | 792.18 |
| F# | ḥijāz | 905.87 | 905.87 |
| G | nawā | 996.09 | 996.09 |
| G# | ḥiṣār | 1095.04 | 1095.04 |
| A | ḥusaynī | 1200.00 | 0.00 |
| A# | ʿajam | 1290.22 | 90.22 |
| B | māhūr | 1403.91 | 203.91 |
| C | kurdān | 1494.13 | 294.13 |
| C# | shahnāz | 1607.82 | 407.82 |

#### Compatibility Check Process:

For each pitch class in the maqām transposition's ascending and descending sequences:

1. **Get IPN Reference**: `getIpnReferenceNoteName(maqamPitchClass)` assigns an IPN reference based on musicological logic
2. **Lookup in Set**: Find the pitch class with matching IPN reference in the set
3. **Normalize Cents**: Both values normalized to same octave (modulo 1200)
4. **Compare**: Calculate difference with wrap-around handling
5. **Check Tolerance**: If difference ≤ tolerance (default: 5¢) → ✅ Match

**Result**: ✅ **COMPATIBLE** - All pitch classes match within tolerance!

---

## Octave Selection & Ordering

The `create12PitchClassSet` function creates a complete 12-pitch-class set by merging maqām pitch classes with a tuning system's pitch classes. This process ensures chromatic ascending order and optimal octave selection.

### Five-Phase Process

#### Phase 1: Prepare Maqam Pitch Classes

1. **Detect Symmetrical Maqam**: Check if ascending and descending sequences are identical
2. **Apply Sequential Reference Note Logic**: Assign IPN reference note names based on musicological logic
3. **Collect All Maqam Pitch Classes**: Gather unique pitch classes from both sequences

#### Phase 2: Create Tuning System Base Set

1. **Determine Octave Range**: Based on maqām's pitch class octaves
2. **Get 12-Pitch-Class Base**: Select one pitch class per IPN reference from the tuning system
   - For each IPN reference (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
   - Select from preferred octave range
   - If multiple options, choose lowest cents value

#### Phase 3: Validate Compatibility

1. **Map Maqam Pitch Classes by IPN Reference**: Organize by IPN
2. **Check for Duplicate IPN References**: Ensure no conflicts (same IPN with different cents values)

#### Phase 4: Initial Merge

1. **Start with Tuning System Base**: Begin with the 12-pitch base from tuning system
2. **Build Ascending/Descending IPN Maps**: Map maqām pitch classes by IPN
3. **Replace Tuning System with Maqam Values**: Overwrite tuning system pitch classes with maqām values where they exist

#### Phase 5: Reorder and Select Optimal Octaves

**This is the critical phase that ensures chromatic ascending order.**

1. **Identify Tonic**: First pitch class from ascending sequence
2. **Reorder Chromatic Sequence from Tonic**: Rotate chromatic order to start from tonic
3. **Rebuild Set with Chromatic Ascending Order**:
   - Start from tonic cents value
   - For each subsequent IPN in chromatic order:
     - **Priority 1**: Try maqām candidates first (if they satisfy ascending order)
     - **Priority 2**: Fall back to tuning system candidates (if no maqām candidate works)
     - **Requirement**: Selected pitch class must have cents > previous cents
     - **Selection**: Choose the option with lowest cents value that satisfies the requirement

### Algorithm Update: Prioritizing Maqam Values

**Critical Update**: The algorithm now prioritizes maqām values over tuning system fillers when both satisfy the ascending order requirement. This ensures that maqām pitch classes are preserved in the final set whenever possible.

**Example** (Position 6, G#):
- **Priority 1: Try maqam candidates first**
  - maqam ḥiṣār (1095.04 cents, octave 1)
  - Filter: 1095.04 > 996.09 (previous cents) ✅
  - Selected: **G# (ḥiṣār)**: 1095.04 cents (maqām - prioritized!)

Even though tuning system ḥiṣār (1086.31¢) has a lower cents value, maqām ḥiṣār (1095.04¢) is selected because maqām values take priority when they satisfy the ascending order requirement.

### Result

- ✅ All 12 IPN references covered
- ✅ Chromatic ascending order from tonic
- ✅ Optimal octave selection
- ✅ Maqām pitch classes preserved whenever possible
- ✅ Suitable for MIDI keyboard tuning and Scala export

---

## startSetFromC Transformation

When `startSetFromC=true`, the API reorders the 12-pitch-class set to start from IPN "C" instead of the maqām's tonic. This is designed for **Scala (.scl) file export compatibility**, where degree 0 maps to middle C by default.

### Step-by-Step Process

#### Step 1: Get All Tuning System Pitch Classes

When `startSetFromC=true`, the API first retrieves ALL pitch classes from the tuning system (all octaves):

```typescript
const allTuningSystemPitchClasses = startSetFromC ? getTuningSystemPitchClasses(
  cairoTuningSystem,
  cairoStartingNote as any
) : null;
```

This provides access to pitch classes from different octaves for potential octave shifting.

#### Step 2: Identify Maqam Tonic Position

The algorithm identifies the maqām's tonic IPN reference and its position in chromatic order:

```typescript
const maqamTonicIpnRef = set.pitchClassSet.pitchClasses.entries().next().value?.[0] || 'C';
const chromaticOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const tonicIndex = chromaticOrder.indexOf(maqamTonicIpnRef);
```

**Example**: For maqām bayyāt shūrī, tonic is **D** (index 2 in chromatic order).

#### Step 3: Shift Octave 2 Notes Before Tonic to Octave 1

**Critical Logic**: If a pitch class is in octave 2 AND comes BEFORE the tonic in chromatic order, shift it to octave 1:

```typescript
if (startSetFromC && pc.octave === 2 && allTuningSystemPitchClasses) {
  const currentIndex = chromaticOrder.indexOf(ipnRef);
  // If this note comes before the tonic in chromatic order, get octave 1 equivalent
  if (currentIndex < tonicIndex) {
    const octave1Equivalent = allTuningSystemPitchClasses.find(
      tpc => tpc.referenceNoteName === ipnRef && tpc.octave === 1
    );
    if (octave1Equivalent) {
      pitchClassToUse = octave1Equivalent;
    }
  }
}
```

**Why?** When rotating to start from C, notes that come before the tonic (like C and C# when tonic is D) need to be from octave 1, not octave 2, to maintain proper ascending order.

**Example for maqām bayyāt shūrī (tonic D)**:
- **C** (index 0) < D (index 2) → Shift from octave 2 (kurdān: 1494.13¢) to octave 1 (rāst: 294.13¢)
- **C#** (index 1) < D (index 2) → Shift from octave 2 (shahnāz: 1607.82¢) to octave 1 (zīrgūleh: 407.82¢)
- **D** (index 2) = tonic → Keep as is (dūgāh: 498.04¢, octave 1)

#### Step 4: Rotate Array to Start from C

The pitch class array is rotated so that C becomes the first element:

```typescript
if (startSetFromC) {
  const cIndex = allPitchClasses.findIndex(item => item.ipnRef === 'C');
  if (cIndex !== -1 && cIndex > 0) {
    orderedPitchClasses = [
      ...allPitchClasses.slice(cIndex),  // Everything from C onwards
      ...allPitchClasses.slice(0, cIndex) // Everything before C
    ];
  }
}
```

**Before rotation** (from tonic D): `[D, D#, E, F, F#, G, G#, A, A#, B, C, C#]`
**After rotation** (from C): `[C, C#, D, D#, E, F, F#, G, G#, A, A#, B]`

#### Step 5: Recalculate Relative Cents

The reference point for relative cents changes from the tonic to C:

```typescript
// Reference is now the FIRST pitch class (C, not tonic)
const referenceCents = orderedPitchClasses.length > 0
  ? parseFloat(orderedPitchClasses[0].pitchClass.cents)
  : 0;

// Calculate relative cents
let relativeCents = cents - referenceCents;

// Handle octave wrap-around for Scala mode
// When pitch classes from lower octaves are rotated to come after C,
// add 1200 cents to make the relative cents positive
if (startSetFromC && relativeCents < 0) {
  relativeCents += 1200;
}
```

**Example**:
- **C (rāst)**: 294.13 - 294.13 = **0.00¢** (reference)
- **C# (zīrgūleh)**: 407.82 - 294.13 = **113.69¢**
- **D (dūgāh)**: 498.04 - 294.13 = **203.91¢**
- **E (segāh)**: 642.86 - 294.13 = **348.73¢**
- **F (chahārgāh)**: 792.18 - 294.13 = **498.04¢**
- **G (nawā)**: 996.09 - 294.13 = **701.96¢**
- **A (ḥusaynī)**: 1200.00 - 294.13 = **905.87¢**
- **B (māhūr)**: 1403.91 - 294.13 = **1109.78¢**

### Comparison: `startSetFromC=false` vs `startSetFromC=true`

#### `startSetFromC=false` (Default - Ordered from Tonic D)

| Pos | IPN | Note Name | Cents | Rel Cents | Octave |
|-----|-----|-----------|-------|-----------|--------|
| 0 | **D** | dūgāh | 498.04 | 0.00 | 1 |
| 1 | D# | kurdī | 588.27 | 90.22 | 1 |
| 2 | E | segāh | 642.86 | 144.82 | 1 |
| 3 | F | chahārgāh | 792.18 | 294.13 | 1 |
| 4 | F# | ḥijāz | 905.87 | 407.82 | 1 |
| 5 | G | nawā | 996.09 | 498.04 | 1 |
| 6 | G# | ḥiṣār | 1095.04 | 597.00 | 1 |
| 7 | A | ḥusaynī | 1200.00 | 701.96 | 2 |
| 8 | A# | ʿajam | 1290.22 | 792.18 | 2 |
| 9 | B | māhūr | 1403.91 | 905.87 | 2 |
| 10 | C | kurdān | 1494.13 | 996.09 | 2 |
| 11 | C# | shahnāz | 1607.82 | 1109.78 | 2 |

**Characteristics**:
- Starts from tonic D (position 0)
- Relative cents calculated from tonic (0.00¢)
- C and C# are in octave 2 (come after tonic)

#### `startSetFromC=true` (Scala Mode - Ordered from C)

| Pos | IPN | Note Name | Cents | Rel Cents | Octave |
|-----|-----|-----------|-------|-----------|--------|
| 0 | **C** | rāst | 294.13 | **0.00** | **1** |
| 1 | C# | zīrgūleh | 407.82 | 113.69 | **1** |
| 2 | D | dūgāh | 498.04 | 203.91 | 1 |
| 3 | D# | kurdī | 588.27 | 294.13 | 1 |
| 4 | E | segāh | 642.86 | 348.73 | 1 |
| 5 | F | chahārgāh | 792.18 | 498.04 | 1 |
| 6 | F# | ḥijāz | 905.87 | 611.73 | 1 |
| 7 | G | nawā | 996.09 | 701.96 | 1 |
| 8 | G# | ḥiṣār | 1095.04 | 800.91 | 1 |
| 9 | A | ḥusaynī | 1200.00 | 905.87 | 2 |
| 10 | A# | ʿajam | 1290.22 | 996.09 | 2 |
| 11 | B | māhūr | 1403.91 | 1109.78 | 2 |

**Characteristics**:
- Starts from C (position 0)
- Relative cents calculated from C (0.00¢)
- **C and C# shifted to octave 1** (were in octave 2, now in octave 1)
- Maqām tonic D is now at position 2 (not position 0)

### Key Differences

1. **Starting Point**:
   - `false`: Starts from maqām tonic (D)
   - `true`: Starts from C

2. **Octave Selection**:
   - `false`: C and C# in octave 2 (after tonic)
   - `true`: C and C# shifted to octave 1 (before tonic)

3. **Relative Cents Reference**:
   - `false`: Relative to tonic (D = 0.00¢)
   - `true`: Relative to C (C = 0.00¢)

4. **Ordering**:
   - `false`: `[D, D#, E, F, F#, G, G#, A, A#, B, C, C#]`
   - `true`: `[C, C#, D, D#, E, F, F#, G, G#, A, A#, B]`

5. **Scala Compatibility**:
   - `false`: Not directly compatible (degree 0 = tonic, not C)
   - `true`: Compatible (degree 0 = C, as Scala expects)

### Use Cases

#### `startSetFromC=false` (Default)
- **Use when**: Displaying maqām-centric information
- **Benefit**: Tonic is at position 0, making it easy to see maqām structure
- **Example**: UI showing maqām intervals from tonic

#### `startSetFromC=true` (Scala Mode)
- **Use when**: Exporting to Scala (.scl) files
- **Benefit**: Degree 0 maps to C (middle C), as Scala expects
- **Example**: Generating tuning files for MIDI keyboards or synthesizers

### Important Notes

1. **Octave Shifting**: The algorithm intelligently shifts octave 2 notes to octave 1 when they come before the tonic, ensuring proper ascending order when rotated.

2. **Maqam Tonic Tracking**: The `tonic` field in compatible maqāmāt still tracks the original tonic position (e.g., position 2 for D when `startSetFromC=true`).

3. **Absolute Cents Preserved**: The absolute cents values remain unchanged - only the ordering and relative cents calculation change.

4. **All 12 Pitch Classes**: Both modes contain all 12 IPN references, just in different orders.

### Implementation Reference

- **API Route**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts`
- **Octave selection**: Lines 228-243
- **Array rotation**: Lines 248-258
- **Relative cents wrap**: Lines 302-307

---

# Part 3: Detailed Examples

## Manual Calculation Walkthrough

This section provides a complete step-by-step manual calculation of a 12-pitch-class set to illustrate the algorithm in practice.

### Example: Maqām Bayyāt Shūrī (al-Farabi-(950g)) + al-Kindi-(874) on Ushayran

#### Input Data

**Maqam: maqām bayyāt shūrī (al-Farabi-(950g) on Ushayran)**

**Ascending Sequence:**
1. **dūgāh** (D): 498.04 cents, octave 1
2. **segāh** (E): 642.86 cents, octave 1
3. **chahārgāh** (F): 792.18 cents, octave 1
4. **nawā** (G): 996.09 cents, octave 1
5. **ḥiṣār** (G#): 1095.04 cents, octave 1
6. **māhūr** (B): 1403.91 cents, octave 2
7. **kurdān** (C): 1494.13 cents, octave 2

**Descending Sequence:** (Symmetrical - same notes in reverse)

**Octave Range:** 1-2

**al-Kindi-(874) Tuning System on Ushayran**

**Octave 1 (preferred range):**
- ʿushayrān (C): 0 cents
- ʿajam ʿushayrān (C#): 90.22 cents
- kawasht (D#): 203.91 cents
- rāst (E): 294.13 cents
- zīrgūleh (F#): 407.82 cents
- dūgāh (D): 498.04 cents
- kurdī (D#): 588.27 cents
- būselīk/ʿushshāq (F): 701.96 cents
- chahārgāh (F): 792.18 cents
- ḥijāz (F#): 905.87 cents
- nawā (G): 996.09 cents
- ḥiṣār (G#): 1086.31 cents

**Octave 2:**
- ḥusaynī (A): 1200 cents
- ʿajam (A#): 1290.22 cents
- māhūr (B): 1403.91 cents
- kurdān (C): 1494.13 cents
- shahnāz (C#): 1607.82 cents

#### Step-by-Step Process

### Phase 1: Prepare Maqam Pitch Classes

**Step 1.1: Detect Symmetrical Maqam**
- ✅ Ascending and descending sequences are symmetrical
- All pitch classes collected for consistent IPN reference assignment

**Step 1.2: Apply Sequential Reference Note Logic**
- Assigns IPN reference note names based on musicological logic
- Result: Each pitch class gets an IPN reference (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)

**Step 1.3: Collect All Maqam Pitch Classes**
- Ascending: 7 pitch classes
- Descending: 7 pitch classes (same values)
- Total: 7 unique pitch classes

### Phase 2: Create al-Kindi Base Set

**Step 2.1: Determine Octave Range**
- Maqam octave range: **1-2**
- Preferred range for al-Kindi selection: `{min: 1, max: 2}`

**Step 2.2: Get al-Kindi 12-Pitch-Class Base**
- For each IPN reference (C, C#, D, D#, E, F, F#, G, G#, A, A#, B):
  - Select pitch class from octaves 1-2 (preferring octave 1)
  - If multiple options, choose lowest cents value

**Result: al-Kindi Base Set (octave 1-2)**
```
A  → ʿushayrān (octave 1): 0 cents
A# → ʿajam ʿushayrān (octave 1): 90.22 cents
B  → kawasht (octave 1): 203.91 cents
C  → rāst (octave 1): 294.13 cents
C# → zīrgūleh (octave 1): 407.82 cents
D  → dūgāh (octave 1): 498.04 cents
D# → kurdī (octave 1): 588.27 cents
E  → būselīk/ʿushshāq (octave 1): 701.96 cents
F  → chahārgāh (octave 1): 792.18 cents
F# → ḥijāz (octave 1): 905.87 cents
G  → nawā (octave 1): 996.09 cents
G# → ḥiṣār (octave 1): 1086.31 cents
```

**Note:** In al-Kindi-(874) tuning system, ʿushayrān (the starting note) maps to IPN reference **A** (not C), as defined by its `englishName: "A2"`. This is the musicological mapping, not a mathematical one based on cents value.

### Phase 3: Validate Compatibility

**Step 3.1: Map Maqam Pitch Classes by IPN Reference**
- Each maqam pitch class is assigned an IPN reference based on musicological logic

**Step 3.2: Check for Duplicate IPN References**
- ✅ No duplicate IPN references with different cents values
- All instances of the same IPN reference have the same normalized cents value
- **Result: Compatible**

### Phase 4: Initial Merge

**Step 4.1: Start with al-Kindi Base**
```
newPitchClassMap = {
  A: alKindi_A (0 cents),        // ʿushayrān
  A#: alKindi_A# (90.22 cents),  // ʿajam ʿushayrān
  B: alKindi_B (203.91 cents),   // kawasht
  C: alKindi_C (294.13 cents),   // rāst
  C#: alKindi_C# (407.82 cents), // zīrgūleh
  D: alKindi_D (498.04 cents),   // dūgāh
  D#: alKindi_D# (588.27 cents),  // kurdī
  E: alKindi_E (701.96 cents),   // būselīk/ʿushshāq
  F: alKindi_F (792.18 cents),   // chahārgāh
  F#: alKindi_F# (905.87 cents),  // ḥijāz
  G: alKindi_G (996.09 cents),    // nawā
  G#: alKindi_G# (1086.31 cents)  // ḥiṣār
}
```

**Step 4.2: Build Ascending IPN Map**
- From maqam ascending sequence:
  - D (dūgāh): 498.04 cents → IPN: **D**
  - E (segāh): 642.86 cents → IPN: **E**
  - F (chahārgāh): 792.18 cents → IPN: **F**
  - G (nawā): 996.09 cents → IPN: **G**
  - G# (ḥiṣār): 1095.04 cents → IPN: **G#**
  - B (māhūr): 1403.91 cents → IPN: **B**
  - C (kurdān): 1494.13 cents → IPN: **C**

**Step 4.3: Build Descending IPN Map**
- Same as ascending (symmetrical maqam)
- No additional IPN references

**Step 4.4: Replace al-Kindi with Maqam Values**
- Replace matching IPN references:
  - **D**: alKindi_D (498.04) → maqam_D (498.04) ✅ Same value
  - **E**: alKindi_E (701.96) → maqam_E (642.86) ✅ Different value - replaced
  - **F**: alKindi_F (792.18) → maqam_F (792.18) ✅ Same value
  - **G**: alKindi_G (996.09) → maqam_G (996.09) ✅ Same value
  - **G#**: alKindi_G# (1086.31) → maqam_G# (1095.04) ✅ Different value - replaced (initial)
  - **B**: alKindi_B (203.91) → maqam_B (1403.91) ✅ Different value - replaced
  - **C**: alKindi_C (294.13) → maqam_C (1494.13) ✅ Different value - replaced

**Result after initial merge:**
```
A  → alKindi_A (0 cents) - filler (ʿushayrān)
A# → alKindi_A# (90.22 cents) - filler (ʿajam ʿushayrān)
B  → maqam_B (1403.91 cents) - from maqam (māhūr)
C  → maqam_C (1494.13 cents) - from maqam (kurdān)
C# → alKindi_C# (407.82 cents) - filler (zīrgūleh)
D  → maqam_D (498.04 cents) - from maqam (dūgāh)
D# → alKindi_D# (588.27 cents) - filler (kurdī)
E  → maqam_E (642.86 cents) - from maqam (segāh)
F  → maqam_F (792.18 cents) - from maqam (chahārgāh)
F# → alKindi_F# (905.87 cents) - filler (ḥijāz)
G  → maqam_G (996.09 cents) - from maqam (nawā)
G# → maqam_G# (1095.04 cents) - from maqam (initial replacement)
```

**Note:** Phase 5 will rebuild this set with optimal octave selection.

### Phase 5: Reorder and Select Optimal Octaves

**Step 5.1: Prepare Octave Options**
- Get all pitch classes from al-Kindi (all octaves) grouped by IPN
- Get all pitch classes from maqam grouped by IPN

**Step 5.2: Identify Tonic**
- Tonic = first pitch class from ascending sequence
- **Tonic IPN**: **D** (dūgāh)
- **Tonic Cents**: 498.04 cents

**Step 5.3: Reorder Chromatic Sequence from Tonic**
- Standard order: `[C, C#, D, D#, E, F, F#, G, G#, A, A#, B]`
- Tonic is **D** (index 2)
- **Reordered**: `[D, D#, E, F, F#, G, G#, A, A#, B, C, C#]`

**Step 5.4: Rebuild Set with Chromatic Ascending Order**

Starting from tonic D (498.04 cents):

**Position 0 (D - Tonic):**
- Use actual tonic: **D (dūgāh)**: 498.04 cents
- previousCents = 498.04

**Position 1 (D#):**
- Candidates: al-Kindi kurdī (588.27 cents, octave 1)
- Filter: 588.27 > 498.04 ✅
- Selected: **D# (kurdī)**: 588.27 cents
- previousCents = 588.27

**Position 2 (E):**
- Candidates: maqam segāh (642.86 cents, octave 1)
- Filter: 642.86 > 588.27 ✅
- Selected: **E (segāh)**: 642.86 cents
- previousCents = 642.86

**Position 3 (F):**
- Candidates: maqam chahārgāh (792.18 cents, octave 1)
- Filter: 792.18 > 642.86 ✅
- Selected: **F (chahārgāh)**: 792.18 cents
- previousCents = 792.18

**Position 4 (F#):**
- Candidates: al-Kindi ḥijāz (905.87 cents, octave 1)
- Filter: 905.87 > 792.18 ✅
- Selected: **F# (ḥijāz)**: 905.87 cents
- previousCents = 905.87

**Position 5 (G):**
- Candidates: maqam nawā (996.09 cents, octave 1)
- Filter: 996.09 > 905.87 ✅
- Selected: **G (nawā)**: 996.09 cents
- previousCents = 996.09

**Position 6 (G#):**
- **Priority 1: Try maqam candidates first**
  - maqam ḥiṣār (1095.04 cents, octave 1)
  - Filter: 1095.04 > 996.09 ✅
  - Selected: **G# (ḥiṣār)**: 1095.04 cents (maqam - prioritized!)
- previousCents = 1095.04

**✅ Algorithm Update**: The algorithm now prioritizes maqām values over al-Kindi fillers. Maqam ḥiṣār (1095.04) is selected even though al-Kindi ḥiṣār (1086.31) has a lower cents value, because maqām values take priority when they satisfy the ascending order requirement.

**Position 7 (A):**
- **Priority 1: Try maqam candidates first**
  - No maqam candidates for A
- **Priority 2: Fall back to al-Kindi**
  - al-Kindi ḥusaynī (1200 cents, octave 2)
  - Filter: 1200 > 1095.04 ✅
  - Selected: **A (ḥusaynī)**: 1200 cents (al-Kindi filler)
- previousCents = 1200

**Position 8 (A#):**
- Candidates: al-Kindi ʿajam (1290.22 cents, octave 2)
- Filter: 1290.22 > 1200 ✅
- Selected: **A# (ʿajam)**: 1290.22 cents
- previousCents = 1290.22

**Position 9 (B):**
- Candidates: maqam māhūr (1403.91 cents, octave 2)
- Filter: 1403.91 > 1290.22 ✅
- Selected: **B (māhūr)**: 1403.91 cents
- previousCents = 1403.91

**Position 10 (C):**
- Candidates: maqam kurdān (1494.13 cents, octave 2)
- Filter: 1494.13 > 1403.91 ✅
- Selected: **C (kurdān)**: 1494.13 cents
- previousCents = 1494.13

**Position 11 (C#):**
- Candidates: al-Kindi shahnāz (1607.82 cents, octave 2)
- Filter: 1607.82 > 1494.13 ✅
- Selected: **C# (shahnāz)**: 1607.82 cents
- previousCents = 1607.82

#### Final 12-Pitch-Class Set

**Ordered from tonic D (chromatic ascending):**

| Position | IPN Reference | Note Name | Cents | Relative Cents | Octave | Source |
|----------|---------------|-----------|-------|----------------|--------|--------|
| 0 | **D** | dūgāh | 498.04 | 0.00 | 1 | Maqam (tonic) |
| 1 | **D#** | kurdī | 588.27 | 90.22 | 1 | al-Kindi filler |
| 2 | **E** | segāh | 642.86 | 144.82 | 1 | Maqam |
| 3 | **F** | chahārgāh | 792.18 | 294.13 | 1 | Maqam |
| 4 | **F#** | ḥijāz | 905.87 | 407.82 | 1 | al-Kindi filler |
| 5 | **G** | nawā | 996.09 | 498.04 | 1 | Maqam |
| 6 | **G#** | ḥiṣār | 1095.04 | 597.00 | 1 | Maqam |
| 7 | **A** | ḥusaynī | 1200.00 | 701.96 | 2 | al-Kindi filler |
| 8 | **A#** | ʿajam | 1290.22 | 792.18 | 2 | al-Kindi filler |
| 9 | **B** | māhūr | 1403.91 | 905.87 | 2 | Maqam |
| 10 | **C** | kurdān | 1494.13 | 996.09 | 2 | Maqam |
| 11 | **C#** | shahnāz | 1607.82 | 1109.78 | 2 | al-Kindi filler |

**Relative Cents Calculation**: Relative cents are calculated from the tonic (D = 0.00¢). Each pitch class's relative cents = its absolute cents - tonic cents (498.04).

#### Summary

✅ **7 pitch classes from maqam** (D, E, F, G, G#, B, C)
✅ **5 pitch classes from al-Kindi** (D#, F#, A, A#, C#)
✅ **Chromatic ascending order** from tonic D
✅ **All 12 IPN references** covered (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
✅ **Optimal octave selection** ensures ascending cents values

This set is suitable for MIDI keyboard tuning and Scala (.scl) file export!

---

## Verification Results

All manual calculations have been verified against the actual API results. Both modes (`startSetFromC=false` and `startSetFromC=true`) match perfectly.

### `startSetFromC=false` (Default Mode)

#### Absolute Cents Values
✅ **All 12 pitch classes match exactly**

| Position | IPN | Note Name | Manual Cents | API Cents | Match |
|----------|-----|-----------|--------------|-----------|-------|
| 0 | D | dūgāh | 498.04 | 498.04 | ✅ |
| 1 | D# | kurdī | 588.27 | 588.27 | ✅ |
| 2 | E | segāh | 642.86 | 642.86 | ✅ |
| 3 | F | chahārgāh | 792.18 | 792.18 | ✅ |
| 4 | F# | ḥijāz | 905.87 | 905.87 | ✅ |
| 5 | G | nawā | 996.09 | 996.09 | ✅ |
| 6 | G# | ḥiṣār | 1095.04 | 1095.04 | ✅ |
| 7 | A | ḥusaynī | 1200.00 | 1200.00 | ✅ |
| 8 | A# | ʿajam | 1290.22 | 1290.22 | ✅ |
| 9 | B | māhūr | 1403.91 | 1403.91 | ✅ |
| 10 | C | kurdān | 1494.13 | 1494.13 | ✅ |
| 11 | C# | shahnāz | 1607.82 | 1607.82 | ✅ |

#### Relative Cents Values
✅ **All match within 0.01 cents (rounding tolerance)**

| Position | IPN | Manual Rel Cents | API Rel Cents | Difference |
|----------|-----|------------------|---------------|------------|
| 0 | D | 0.00 | 0.00 | 0.00 ✅ |
| 1 | D# | 90.22 | 90.22 | 0.00 ✅ |
| 2 | E | 144.82 | 144.82 | 0.00 ✅ |
| 3 | F | 294.13 | 294.13 | 0.00 ✅ |
| 4 | F# | 407.82 | 407.82 | 0.00 ✅ |
| 5 | G | 498.04 | 498.04 | 0.00 ✅ |
| 6 | G# | 597.00 | 597.00 | 0.00 ✅ |
| 7 | A | 701.96 | 701.96 | 0.00 ✅ |
| 8 | A# | 792.18 | 792.18 | 0.00 ✅ |
| 9 | B | 905.87 | 905.87 | 0.00 ✅ |
| 10 | C | 996.09 | 996.09 | 0.00 ✅ |
| 11 | C# | 1109.78 | 1109.78 | 0.00 ✅ |

**Note**: Minor differences (0.01-0.02 cents) are due to floating-point rounding and are within acceptable tolerance.

### `startSetFromC=true` (Scala Mode)

#### Absolute Cents Values
✅ **All 12 pitch classes match exactly**

| Position | IPN | Note Name | Manual Cents | API Cents | Match |
|----------|-----|-----------|--------------|-----------|-------|
| 0 | C | rāst | 294.13 | 294.13 | ✅ |
| 1 | C# | zīrgūleh | 407.82 | 407.82 | ✅ |
| 2 | D | dūgāh | 498.04 | 498.04 | ✅ |
| 3 | D# | kurdī | 588.27 | 588.27 | ✅ |
| 4 | E | segāh | 642.86 | 642.86 | ✅ |
| 5 | F | chahārgāh | 792.18 | 792.18 | ✅ |
| 6 | F# | ḥijāz | 905.87 | 905.87 | ✅ |
| 7 | G | nawā | 996.09 | 996.09 | ✅ |
| 8 | G# | ḥiṣār | 1095.04 | 1095.04 | ✅ |
| 9 | A | ḥusaynī | 1200.00 | 1200.00 | ✅ |
| 10 | A# | ʿajam | 1290.22 | 1290.22 | ✅ |
| 11 | B | māhūr | 1403.91 | 1403.91 | ✅ |

#### Relative Cents Values
✅ **All match within 0.01 cents (rounding tolerance)**

| Position | IPN | Manual Rel Cents | API Rel Cents | Difference |
|----------|-----|------------------|---------------|------------|
| 0 | C | 0.00 | 0.00 | 0.00 ✅ |
| 1 | C# | 113.69 | 113.69 | 0.00 ✅ |
| 2 | D | 203.91 | 203.91 | 0.00 ✅ |
| 3 | D# | 294.13 | 294.13 | 0.00 ✅ |
| 4 | E | 348.73 | 348.73 | 0.00 ✅ |
| 5 | F | 498.04 | 498.04 | 0.00 ✅ |
| 6 | F# | 611.73 | 611.73 | 0.00 ✅ |
| 7 | G | 701.96 | 701.96 | 0.00 ✅ |
| 8 | G# | 800.91 | 800.91 | 0.00 ✅ |
| 9 | A | 905.87 | 905.87 | 0.00 ✅ |
| 10 | A# | 996.09 | 996.09 | 0.00 ✅ |
| 11 | B | 1109.78 | 1109.78 | 0.00 ✅ |

#### Octave Shifting Verification
✅ **C and C# correctly shifted from octave 2 to octave 1**

- **C**: Changed from octave 2 (kurdān: 1494.13¢) → octave 1 (rāst: 294.13¢) ✅
- **C#**: Changed from octave 2 (shahnāz: 1607.82¢) → octave 1 (zīrgūleh: 407.82¢) ✅

### Key Verification Points

1. ✅ **Absolute cents values**: All match exactly
2. ✅ **Relative cents calculations**: All match within 0.01 cents tolerance
3. ✅ **Octave assignments**: All match correctly
4. ✅ **Pitch class selection**: Maqam values prioritized correctly (G# uses maqam ḥiṣār: 1095.04¢, not al-Kindi: 1086.31¢)
5. ✅ **Ordering**: Chromatic order maintained correctly in both modes
6. ✅ **startSetFromC rotation**: C correctly becomes position 0 in Scala mode
7. ✅ **Octave shifting**: C and C# correctly shifted to octave 1 when before tonic

### Conclusion

**All manual calculations match the API results perfectly.** The documentation accurately describes the algorithm's behavior, and the step-by-step process correctly reflects how the 12-pitch-class sets are created and formatted.

The minor rounding differences (0.01-0.02 cents) are expected due to:
- Floating-point arithmetic precision
- Display rounding in API responses
- Multiple decimal place calculations

These differences are well within acceptable tolerance for musical applications.

---

# Critical Rules & Best Practices

## Implementation Rules

1. **Never mix octaves incorrectly**: C and C# before the tonic MUST come from octave 1 when `startSetFromC=true`
2. **Preserve absolute cents**: Absolute cents values are unchanged between modes
3. **Maintain chromatic order**: The 12 pitch classes follow C, C#, D, D#, E, F, F#, G, G#, A, A#, B
4. **Track tonic position**: Always include tonic metadata in Scala mode
5. **Handle wrap-around**: Add 1200 cents to negative relative cents values
6. **Prioritize maqam values**: When both maqam and tuning system pitch classes satisfy ascending order, choose maqam
7. **Starting Note Name Pattern**: Always get starting note names from `tuningSystem.getNoteNameSets()` using `standardizeText()` comparison. Never convert from numeric indices or use abstract note name arrays directly. The pattern: find matching note name set where `standardizeText(set[0]) === standardizeText(noteName)`, then use `set[0]` which has proper diacritics.
8. **Capitalization Rules**: Use sentence case for labels (first letter capitalized, rest lowercase). Use lowercase for all maqām names and note names. Example: "Source maqām:" not "Source Maqām:", "Compatible maqāmāt" not "Compatible Maqāmāt".
9. **Reference Frequency Label**: Always use format "Scala file 1/1 (0 cents) reference frequency:" to clearly indicate this refers to the 1/1 ratio (0 cents) reference note.

## Testing Guidelines

### Verify Both Modes

```bash
# Default mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_hijaz_set'

# Scala mode
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?startSetFromC=true&setId=maqam_hijaz_set'

# Compare: D, D#, E, F, F#, G, G#, A, A#, B should have identical note names
# Only C and C# differ (rāst/zīrgūleh vs kurdān/shahnāz)
```

### Verify Note Names

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

### Parameter Validation

```bash
# Test invalid parameter
curl 'http://localhost:3000/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&pitchClassDataType=invalid'
# Should return 400 error with valid options list
```

---

# Quick Reference

## When to Use Each Mode

| Mode | Parameter | Use Case | Starting Point | Tonic Position |
|------|-----------|----------|----------------|----------------|
| **Analysis** | `startSetFromC=false` | Musicological analysis, UI display | Maqām tonic | Position 0 |
| **Scala Export** | `startSetFromC=true` | Scala .scl files, MIDI tuning | C (IPN) | Variable (e.g., 2 for D) |

## Common Parameter Combinations

```bash
# Minimal output for Scala export
?startSetFromC=true&pitchClassDataType=cents

# Full analysis data
?pitchClassDataType=all

# Scala export with all data
?startSetFromC=true&pitchClassDataType=all

# Specific set only
?setId=maqam_rast_set
```

## Algorithm Summary

1. **Create set from maqam** → 12 pitch classes (maqam + tuning system fillers)
2. **Check for duplicates** → Merge with existing set if identical
3. **Find compatible maqamat** → Match pitch classes within tolerance (default: 5¢)
4. **Apply startSetFromC** → Rotate to C and shift octaves if needed
5. **Format response** → Include tonic info for each compatible maqam

---

*Last Updated: 2025-11-18*
*Comprehensive guide combining API usage, algorithm deep dive, and verification examples*
