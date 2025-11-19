# 12-Pitch-Class Sets Algorithm Deep Dive

**Purpose**: Comprehensive explanation of how 12-pitch-class sets are created, classified, and transformed.

---

## Table of Contents

1. [Set Creation Algorithm](#set-creation-algorithm)
2. [Compatibility Matching Process](#compatibility-matching-process)
3. [Octave Selection & Ordering](#octave-selection--ordering)
4. [startSetFromC Transformation](#startsetfromc-transformation)
5. [Manual Calculation Walkthrough](#manual-calculation-walkthrough)
6. [Verification Results](#verification-results)

---

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

### Implementation Reference

- **API Route**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts`
- **Octave selection**: Lines 228-243
- **Array rotation**: Lines 248-258
- **Relative cents wrap**: Lines 302-307

---

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
- ʿushayrān (A): 0 cents
- ʿajam ʿushayrān (A#): 90.22 cents
- kawasht (B): 203.91 cents
- rāst (C): 294.13 cents
- zīrgūleh (C#): 407.82 cents
- dūgāh (D): 498.04 cents
- kurdī (D#): 588.27 cents
- būselīk/ʿushshāq (E): 701.96 cents
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

**Note**: In al-Kindi-(874) tuning system, ʿushayrān (the starting note) maps to IPN reference **A** (not C), as defined by its `englishName: "A2"`. This is the musicological mapping.

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
  A: alKindi_A (0 cents),
  A#: alKindi_A# (90.22 cents),
  B: alKindi_B (203.91 cents),
  C: alKindi_C (294.13 cents),
  C#: alKindi_C# (407.82 cents),
  D: alKindi_D (498.04 cents),
  D#: alKindi_D# (588.27 cents),
  E: alKindi_E (701.96 cents),
  F: alKindi_F (792.18 cents),
  F#: alKindi_F# (905.87 cents),
  G: alKindi_G (996.09 cents),
  G#: alKindi_G# (1086.31 cents)
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
  - **G#**: alKindi_G# (1086.31) → maqam_G# (1095.04) ✅ Different value - replaced
  - **B**: alKindi_B (203.91) → maqam_B (1403.91) ✅ Different value - replaced
  - **C**: alKindi_C (294.13) → maqam_C (1494.13) ✅ Different value - replaced

**Result after initial merge:**
```
A  → alKindi_A (0 cents) - filler
A# → alKindi_A# (90.22 cents) - filler
B  → maqam_B (1403.91 cents) - from maqam (māhūr)
C  → maqam_C (1494.13 cents) - from maqam (kurdān)
C# → alKindi_C# (407.82 cents) - filler
D  → maqam_D (498.04 cents) - from maqam (dūgāh, tonic)
D# → alKindi_D# (588.27 cents) - filler
E  → maqam_E (642.86 cents) - from maqam (segāh)
F  → maqam_F (792.18 cents) - from maqam (chahārgāh)
F# → alKindi_F# (905.87 cents) - filler
G  → maqam_G (996.09 cents) - from maqam (nawā)
G# → maqam_G# (1095.04 cents) - from maqam
```

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

**✅ Algorithm Update**: Maqam ḥiṣār (1095.04) is selected even though al-Kindi ḥiṣār (1086.31) has a lower cents value, because maqām values take priority.

**Position 7 (A):**
- **Priority 1: Try maqam candidates first**
  - No maqam candidates for A
- **Priority 2: Fall back to al-Kindi**
  - al-Kindi ḥusaynī (1200 cents, octave 2)
  - Filter: 1200 > 1095.04 ✅
  - Selected: **A (ḥusaynī)**: 1200 cents
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

| Position | IPN | Note Name | Cents | Relative Cents | Octave | Source |
|----------|-----|-----------|-------|----------------|--------|--------|
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

**Summary**:
- ✅ 7 pitch classes from maqam
- ✅ 5 pitch classes from al-Kindi
- ✅ Chromatic ascending order from tonic D
- ✅ All 12 IPN references covered
- ✅ Optimal octave selection

---

## Verification Results

All manual calculations have been verified against the actual API results. Both modes (`startSetFromC=false` and `startSetFromC=true`) match perfectly with differences within 0.01 cents (rounding tolerance).

**Key Verification Points**:

1. ✅ **Absolute cents values**: All match exactly
2. ✅ **Relative cents calculations**: All match within 0.01 cents tolerance
3. ✅ **Octave assignments**: All match correctly
4. ✅ **Pitch class selection**: Maqam values prioritized correctly
5. ✅ **Ordering**: Chromatic order maintained correctly in both modes
6. ✅ **startSetFromC rotation**: C correctly becomes position 0 in Scala mode
7. ✅ **Octave shifting**: C and C# correctly shifted to octave 1 when before tonic

**Conclusion**: All manual calculations match the API results perfectly. The minor rounding differences (0.01-0.02 cents) are expected due to floating-point arithmetic precision and are well within acceptable tolerance for musical applications.

---

## Related Documentation

- [scala-export-overview.md](./scala-export-overview.md) - Choose export type
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API usage
- [scala-scl-export.md](./scala-scl-export.md) - Creating .scl files
- [scala-kbm-export.md](./scala-kbm-export.md) - Creating .kbm files

---

*Deep dive into the 12-pitch-class set creation and classification algorithm*
