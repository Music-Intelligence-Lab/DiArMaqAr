# Musicological Principles of Arabic Maqām System

**Critical musicological insights for implementing Arabic maqām theory computationally**

---

## Overview

Arabic maqām theory is **not** a variant of Western music theory. It represents independent theoretical frameworks with their own logic, historical development, and epistemological foundations. This document outlines key musicological principles discovered through debugging and implementation that are essential for correct computational modeling.

---

## 0. Octave-Repeating vs Non-Octave-Repeating Structures

### Critical Distinction

Maqamat and ajnās fall into two categories based on their pitch class count:

**Octave-Repeating**: ≤7 pitch classes
- These structures repeat every octave
- Can be found entirely within a single octave
- Example: Maqām Rāst (7 pitch classes)

**Non-Octave-Repeating**: >7 pitch classes  
- These structures span **multiple octaves** before repeating
- **Cannot** be found entirely within a single octave
- Examples:
  - Maqām Bayyātī ʿUshayrān (11 pitch classes)
  - Maqām Sūzdāl (11 pitch classes)
  - Maqām Shawq Ṭarab (13 pitch classes)
  - Maqām Bestenegār (10 pitch classes)

### Critical Programming Implication

**When checking if a maqām or jins is available in a tuning system, you MUST check across 3 octaves** (octave below + current octave + octave above), not just a single octave.

**❌ WRONG - Only checks single octave:**
```typescript
const noteNameSets = tuningSystem.getNoteNameSets();
if (maqam.isMaqamPossible(noteNameSets[0])) {
  // This will fail for non-octave-repeating maqāmāt!
}
```

**✅ CORRECT - Checks 3 octaves:**
```typescript
const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
for (const noteNameSet of shiftedNoteNameSets) {
  if (maqam.isMaqamPossible(noteNameSet)) {
    // This works for both octave-repeating AND non-octave-repeating
    return true;
  }
}
```

### Why This Matters

Non-octave-repeating maqāmāt require notes that may not all appear within the same octave in a tuning system. For example, a 13-pitch-class maqām spans nearly two full octaves. The required notes might be split across:
- Some notes in octave 1 (e.g., qarār register)
- Other notes in octave 2 (e.g., muṭlaq register)  
- Final notes in octave 3 (e.g., jawāb register)

Single-octave checking would incorrectly report these maqāmāt as "unavailable" because no single octave contains all the required pitch classes.

### Where to Apply

**This pattern must be used in:**
- All API endpoints checking maqām availability
- All API endpoints checking jins availability
- All UI components checking if a maqām/jins is possible
- Any transposition or modulation calculations

**Reference Implementation**: See `/src/components/tuning-system-manager.tsx` line 42 for the established pattern used in the main UI.

### Test Verification

After implementing availability checks:
1. Query all maqāmāt: `GET /api/maqamat`
2. Verify **no maqām has zero availability** (every maqām should exist in at least one tuning system)
3. Test specific non-octave-repeating maqāmāt (>7 pitch classes) to ensure they show availability
4. If any maqām shows zero availability, check if you're using `getNoteNameSetsWithAdjacentOctaves()` correctly

**Historical Context**: This issue was discovered when 10 maqāmāt incorrectly showed zero availability. After applying the 3-octave pattern, all 60 maqāmāt correctly showed availability ranging from 4 to 35 tuning systems.

---

## 1. Asymmetric Melodic Paths (ṣuʿūd vs hubūṭ)

### Critical Insight

Maqamat can have **fundamentally different** ascending and descending sequences, not just reversed note orders.

### Example: Maqām Bestenegār (al-Fārābī 27-tone system)

**Ascending (ṣuʿūd)**: Ends on **muḥayyar**
- Ratio: 8/3 (decimal 2.667)
- International Pitch Notation: **D4**

**Descending (hubūṭ)**: Begins from **shahnāz**
- Ratio: 81/32 (decimal 2.531)
- International Pitch Notation: **C#4** (enharmonic Db4)

**These are different notes** with:
- Different Arabic names
- Different frequencies
- Different theoretical significance

The UI marks such pitch classes as "unique" when they differ between directions.

### Programming Implication

**NEVER assume** `descendingPitchClasses === ascendingPitchClasses.reverse()`

**Always handle as independent arrays:**
```typescript
interface Maqam {
  ascendingPitchClasses: PitchClass[];   // ṣuʿūd - independent array
  descendingPitchClasses: PitchClass[];  // hubūṭ - independent array (NOT reversed)
}
```

**UI Indicator**: Maqamat with asymmetric paths are marked with an asterisk (*) in the maqāmāt list.

---

## 2. Variable Pitch Class Counts

### Misconception

Maqamat are like Western diatonic scales (7 notes).

### Reality

Maqamat can contain **varying numbers of pitch classes** depending on:
- Theoretical context
- Melodic range
- Historical tradition

Some maqamat end on the octave equivalence of the first note (marked as "I+" in UI), while others end on a different pitch class.

### Examples

| Maqām | Pitch Classes | Ends on Octave |
|-------|---------------|----------------|
| Maqām Rāst | 7 | Yes (I+) |
| Maqām Nahāwand Kabīr | 7 | Yes (I+) |
| Maqām Bayyāt | 7 | Yes (I+) |
| Maqām Bestenegār | 10 | No (different note) |
| Maqām Dilkesh Ḥūrān | 10 | Yes (I+) - 9 unique + octave |

### Programming Implication

**The hardcoded `7` in modulo operations represents the 7-letter Western cycle** (A→B→C→D→E→F→G) used in International Pitch Notation, **NOT the number of pitch classes in a maqam**.

```typescript
// This represents the 7-letter cycle (A-G), not pitch class count
const letterIndex = ((startIndex + offset) % 7 + 7) % 7;
```

---

## 3. Sequential Letter Resolution for Enharmonic Spelling

### Principle

Melodic sequences must use **consecutive natural letters** with appropriate accidentals, following Western staff notation conventions for readability.

### Example: Maqām Bestenegār (Descending)

**✅ Correct:**
- **D**b4 → **C**4 → **B**b3 → **A**3 → **G**b3 → **F**3 → **E**-b3 → **D**3 → **C**3 → **B**-b2
- Letter sequence: D→C→B→A→G→F→E→D→C→B ✓

**❌ Wrong** (using default enharmonic spellings without context):
- C#4 → B#4 → A#3 → A3 → F#3 → E#3 → E-b3 → D3 → B#3 → B-b2
- Letter sequence: C→B→A→A→F→E→E→D→B→B ✗ (non-sequential, repeated letters)

### Algorithm Requirements

**Ascending sequences:**
- Calculate expected letters from **FIRST note** going up

**Descending sequences:**
- Calculate expected letters from **LAST note** (lowest pitch) going up
- Then **REVERSE** the letter sequence

**Rationale**: Descending pitch class arrays are stored high→low (already in descending order), so the lowest pitch is at the END of array.

### JavaScript Modulo Gotcha

```typescript
// ❌ JavaScript handles negative modulo incorrectly
-2 % 7 = -2  // JavaScript result
-2 % 7 = 5   // Expected musical result

// ✅ Solution: Double-modulo pattern
((startIndex + offset) % 7 + 7) % 7  // Always returns 0-6
```

### Array Direction Awareness

```typescript
// Descending arrays are stored high→low (already in descending order)
const descendingPitchClasses = [Db4, C4, Bb3, A3, ...];

// To calculate expected letters, work from LOWEST pitch (last element)
const lastLetter = defaultNames[defaultNames.length - 1][0].toUpperCase();
const ascendingFromLast = getExpectedLetterSequence(lastLetter, count, true);
const expectedLetters = ascendingFromLast.reverse();
```

---

## 4. Tuning System Independence

### Principle

The same maqam (or jins) can be realized in different tuning systems **only if all its required pitch classes are available** in that system within the cents tolerance.

### Key Points

- The maqam itself has a **fixed number of pitch classes**
- Different tuning systems may support different transpositions
- Different modulation possibilities depend on available pitch classes
- The intervals themselves may be realized slightly differently

### Examples of Historical Tuning Systems

| Tuning System | Year | Description | Tone Count |
|---------------|------|-------------|------------|
| **Al-Kindī (874)** | 9th century | 12-tone system | 12 |
| **Al-Fārābī (950g)** | 10th century | First Oud Tuning (Full First Octave) | 27 |
| **Ibn Sīnā (1037)** | 11th century | Different theoretical framework | 17 |
| **Meshshāqa (1899)** | 19th century | String length-based | Variable |
| **Cairo Congress (1932a)** | 20th century | Standardization attempt | 24 |

### Tuning System Starting Notes

**Critical Distinction**: Tuning system starting notes are **NOT** the same as maqām tonics.

#### Tuning System Starting Note
The **theoretical framework anchor** - the first note in each note name set of a tuning system. Represents different historical/theoretical traditions:

- **ʿushayrān**: Oud tuning tradition (instrument-based)
- **yegāh**: Monochord measurement tradition (scientific)
- **rāst**: Pedagogical/theoretical frameworks (didactic)

```typescript
// Example: Ibn Sīnā (1037) has two theoretical frameworks
tuningSystem.getNoteNameSets() = [
  ["ʿushayrān", "nawā", "dūgāh", ...],  // Oud tuning framework
  ["yegāh", "husaynī", "ʿirāq", ...]    // Monochord framework
]

// Starting notes are the FIRST element of each set
tuningSystemStartingNoteNames = ["ʿushayrān", "yegāh"]
```

#### Maqām Tonic
The **first note of the melodic scale** - defines the musical content of a specific maqām:

```typescript
// Maqām Rāst always starts on rāst (the note)
maqamRast.getAscendingNoteNames()[0] === "rāst"  // Tonic

// But can be played in different tuning systems
// each starting from different theoretical anchors
```

#### Why This Matters for APIs

**When returning tuning system availability**, you must indicate which theoretical frameworks (starting notes) support the maqām, because:

1. **Different frameworks may have different note availability** even within the same tuning system
2. **Musicians choose frameworks** based on their instrument or theoretical tradition
3. **3-octave checking** happens independently for each framework

```typescript
// ✅ CORRECT: Distinguish the concepts
interface TuningSystemAvailability {
  tuningSystemId: string;
  tuningSystemStartingNoteNames: string[];  // Theoretical framework anchors
}

interface MaqamMetadata {
  maqamTonic: string;                       // First note of scale
  tuningSystemsAvailability: TuningSystemAvailability[];
}

// ❌ WRONG: Conflating concepts
interface MaqamData {
  startingNote: string;  // Ambiguous - tuning system or maqām?
}
```

### Availability Implications

A maqam requiring 10 specific pitch classes will have 10 pitch classes in **any** tuning system where it's realizable—but that maqam may only exist in tuning systems that contain all 10 required intervals within the cents tolerance.

**Example:**
- **Maqām Athar Kurd** in Al-Kindī (874): 1/12 transpositions available
- **Maqām Athar Kurd** in Al-Fārābī (950g): 12/12 transpositions available
- **Maqām Bestenegār** in Al-Kindī (874): Likely 0/12 (needs 10 specific pitch classes)

### Programming Implication

**All maqam and jins analysis functions must accept `tuningSystem` and `pitchClasses` as parameters.**

```typescript
// ✅ Correct - tuning system dependent
function calculateJinsTranspositions(
  pitchClasses: PitchClass[],  // From specific tuning system
  jinsData: JinsData,
  tolerance: number = 5
): Jins[];

// ❌ Wrong - hardcoding assumptions
const intervals = [9/8, 5/4, 4/3]; // ❌ Only valid for specific systems
```

**Never hardcode:**
- Pitch values
- Interval assumptions
- Available transpositions

**Always validate** whether all required pitch classes exist before considering a transposition valid.

---

## 5. Enharmonic Context & Notation Semantics

### Terminology Standard

**NEVER use "microtonal"** - this Western-centric term implies deviation from 12-EDO as the norm.

**✅ Correct terms:**
- "unequal divisions"
- "non-12-EDO pitches"
- "pitches with fractional precision"
- Or describe the specific theoretical framework

### Enharmonic Equivalence Context

C#4 and Db4 are enharmonically equivalent pitches but represent **different melodic contexts**:

| Spelling | Context | Implication |
|----------|---------|-------------|
| **C#4** | Ascending | Raising C natural |
| **Db4** | Descending | Lowering D natural |

### Programming Implication

When resolving enharmonic spellings, **always consider:**
- Melodic direction (ascending vs descending)
- Letter sequence requirements (consecutive natural letters)
- Musical context (which spelling makes melodic sense)

### Example: Maqām Athar Kurd

Contains **G#3** (ḥiṣār) in the sequence:
- D3 → Eb3 → F3 → **G#3** → A3 → Bb3 → C#4 → D4

**Why G#3 and not Ab3?**
- Letter sequence: D→E→F→**G**→A→B→C→D ✓
- Ab3 would create: D→E→F→**A**→A→B→C→D ✗ (repeated A)

---

## 6. Starting Note Theoretical Significance

### Not Simple Transposition

Different starting points represent **fundamentally different theoretical approaches** in Arabic maqām theory:

| Starting Note | Theoretical Framework | Implications |
|---------------|----------------------|--------------|
| **ʿushayrān** | Oud tuning traditions (perfect fourths) | Practical instrument-based approach |
| **yegāh** | Monochord/sonometer measurements | Mathematical/scientific approach |
| **rāst** | Established theoretical frameworks | Traditional pedagogical approach |

### Effects on System

- **Mathematical relationships**: Different interval calculations
- **Available maqāmāt**: Not all maqāmāt available from all starting notes
- **Modulation possibilities**: Different modulation networks
- **Cultural significance**: Different historical/theoretical contexts

### Programming Implication

**Never treat starting note changes as simple transpositions.**

Changing the starting note requires:
- Recalculating all pitch classes
- Regenerating all transpositions
- Reanalyzing modulation possibilities
- Clearing dependent UI state

---

## 7. Modulation Analysis (Intiqālāt)

### Al-Shawwā Algorithm (1946)

The platform implements the **first systematic digital implementation** of historical modulation guidelines from 1946.

### Key Principles

**Maqamat vs Ajnas Modulations:**
- **Maqamat**: HAVE modulation data (can modulate FROM maqamat TO other maqamat)
- **Ajnas**: DO NOT have modulation data (we only modulate TO ajnas, never FROM ajnas)

**Scale Degree Organization:**
- First degree (I)
- Third degree (III)
- Fourth degree (IV)
- Fifth degree (V)
- Sixth degree (VI) - has ascending/descending variants

**Tuning System Dependent:**
- Different systems have different modulation possibilities
- Depends on available shared pitch classes
- Validated through pattern matching

### Export Implication

**Only maqamat exports include `modulationsLowerOctave`** (8vb data for sixth degree modulations).

Ajnas exports do not include this data because ajnas themselves don't have modulation data.

---

## 8. Common Programming Pitfalls

### JavaScript Modulo for Negative Numbers

```typescript
// ❌ JavaScript handles negative modulo incorrectly
-2 % 7 = -2  // JavaScript result
-2 % 7 = 5   // Expected result for cyclic letter sequence

// ✅ Solution: Double-modulo pattern
const correctModulo = ((value % 7) + 7) % 7;  // Always returns 0-6
```

### Array Direction Assumptions

```typescript
// ❌ Wrong assumption
const descending = ascending.reverse();  // Assumes symmetry

// ✅ Correct approach
interface Maqam {
  ascendingPitchClasses: PitchClass[];   // Independent
  descendingPitchClasses: PitchClass[];  // Independent - NOT reversed
}
```

### Type Discrimination at Runtime

```typescript
// ✅ Use runtime property checking for data differentiation
if ('ascendingPitchClasses' in object) {
  // This is a maqam (has directional sequences)
} else {
  // This is a jins (single sequence)
}

// ❌ Don't rely only on TypeScript types (erased at runtime)
if (object instanceof Maqam) { // May not work as expected
```

### Octave Equivalence Assumptions

```typescript
// ✅ Check explicitly for octave equivalence
const hasOctaveEquivalence = maqam.endsOnOctave();  // I+ marker

// ❌ Don't assume based on pitch class count
if (pitchClasses.length === 7) {  // ❌ Doesn't guarantee octave equivalence
```

---

## 9. Embedded Ajnas Analysis

### Principle

Maqamat are composed of **embedded ajnas patterns** that can be automatically identified through pattern matching.

### Algorithm

1. Take each maqam sequence (ascending and descending separately)
2. For each jins in the database:
   - Try to match jins intervals within the maqam sequence
   - Use cents tolerance for matching
   - Identify starting position and embedded notes
3. Categorize by scale degree position

### Performance Consideration

Embedded ajnas analysis is **computationally expensive**:
- Nested pattern matching across sequences
- Multiple cents tolerance comparisons
- Can take minutes for complex systems

**Make it optional** in transposition calculations.

---

## 10. Suyūr (Melodic Development Pathways)

### Definition

Traditional performance practice pathways that extend beyond basic maqam scales, showing how melodies develop and explore the modal space.

### Characteristics

- Belong to specific parent maqamat
- Automatically transposed along with parent maqam
- Require note name conversion when transposing
- May reference other jins/maqam patterns
- Preserve cultural performance practices

### Programming Implication

When transposing maqamat:
- Transpose all associated suyūr
- Convert note name references
- Adjust jins/maqam references to transposed versions
- Maintain melodic development relationships

---

## 11. Maqām Family Classification (Canonical Reference Requirement)

### Critical Insight

Maqām families are determined by analyzing the **first jins at scale degree 1** within a realized maqām. Since family classification depends on ajnās analysis, and ajnās analysis depends on pitch classes from a tuning system, **using different tuning systems for different maqāmāt produces inconsistent family classifications**.

### The Problem

Family classification requires:
1. A `Maqam` object (not `MaqamData`)
2. Which requires `calculateMaqamTranspositions()` to analyze ajnās
3. Which requires `getTuningSystemPitchClasses()` from a tuning system
4. Which requires selecting a tuning system + starting note

**If you use different tuning systems** for different maqāmāt, the same maqām could be classified into different families depending on which tuning system was chosen.

### The Solution: Canonical Reference Approach

**Always use al-Ṣabbāgh (1954) as the canonical tuning system reference** for ALL family classifications:

```typescript
// 1. Get the canonical reference (supports 59/60 maqāmāt)
const referenceTuningSystem = tuningSystems.find(
  ts => ts.getId() === "al-Sabbagh-(1954)"
);

// 2. For each maqām, use its OWN canonical starting note
const canonicalStartingNote = maqam.getAscendingNoteNames()[0];

// 3. Generate pitch classes from canonical system + starting note
const pitchClasses = getTuningSystemPitchClasses(
  referenceTuningSystem,
  canonicalStartingNote
);

// 4. Calculate transpositions (returns Maqam objects with ajnās)
const transpositions = calculateMaqamTranspositions(
  pitchClasses,
  ajnas,
  maqam,
  true,  // withTahlil = true
  5      // centsTolerance = 5
);

// 5. Find the non-transposed instance (tahlil)
const tahlil = transpositions.find(t => !t.transposition);

// 6. Classify the family
if (tahlil) {
  const classification = classifyMaqamFamily(tahlil);
  familyName = classification.familyName;
}
```

### Why al-Ṣabbāgh (1954)?

- **Comprehensive**: Supports 59 out of 60 maqāmāt in their canonical starting positions
- **Modern**: Represents mid-20th century standardization efforts
- **Consistent**: Using one reference ensures all maqāmāt are classified within the same theoretical framework

### Wrong Approaches

```typescript
// ❌ Using first available tuning system (inconsistent)
const firstAvailableSystem = availableTuningSystems[0];

// ❌ Iterating through noteNameSets checking availability
noteNameSets.forEach(noteNames => {
  if (isMaqamPossible(maqam, noteNames)) { /* ... */ }
});

// ❌ Hardcoding family logic
if (jinsName === "rāst") family = "rāst";
```

### Programming Implications

1. **One system for all**: Use al-Ṣabbāgh (1954) universally for classification
2. **Maqām's own starting note**: Use `maqam.getAscendingNoteNames()[0]`, not iterating noteNameSets
3. **No pre-checking needed**: Don't check `isMaqamPossible()` first - just generate and calculate
4. **Mirrors main application**: This is exactly how the UI/app performs classification

### Validated Results (October 2025)

- **60 maqāmāt** total in database
- **51 maqāmāt** successfully classified into **16 distinct families**
- **9 maqāmāt** with "no jins" classification (incomplete ajnās database - expected)
- **100% consistency** across all API calls and UI operations

### Musicological Significance

This principle highlights that **family classification is tuning-system-relative**: a maqām's family membership depends on the theoretical framework (tuning system) used to analyze it. By standardizing on al-Ṣabbāgh (1954), we ensure:
- **Consistency**: Same maqām always yields same family
- **Comparability**: All family relationships analyzed within one coherent system
- **Historical validity**: Using a recognized modern theoretical framework

---

## Summary of Key Principles

1. **Asymmetric Sequences**: Ascending ≠ Descending (reversed)
2. **Variable Counts**: Maqamat can have 7, 8, 9, 10+ pitch classes
3. **Sequential Letters**: Staff notation requires consecutive natural letters
4. **Tuning Independence**: Same maqam, different realizations across systems
5. **Enharmonic Context**: C# vs Db depends on melodic direction
6. **Starting Note Significance**: Not simple transposition, different frameworks
7. **Modulation Structure**: Maqamat modulate, ajnas don't (they're targets)
8. **JavaScript Gotchas**: Double-modulo for negative numbers
9. **Embedded Analysis**: Pattern matching finds ajnas within maqamat
10. **Computational Transposition of Suyūr**: DiArMaqAr implements the first computational transposition of suyūr, addressing a fundamental limitation in historical sources where suyūr were only documented for canonical forms (tahlīl) and never for transpositions (taṣwīr). The `transposeSayr()` function intelligently shifts note stops, maintains structural identity for jins/maqām references, and handles directional instructions, enabling systematic exploration of melodic pathways across all valid maqām transpositions.
11. **Family Classification**: Requires canonical tuning system reference (al-Ṣabbāgh 1954)
12. **Tuning System Starting Notes**: Theoretical framework anchors (ʿushayrān/yegāh/rāst) distinct from maqām tonics

These principles ensure computational implementations respect the independent theoretical logic of Arabic maqām theory rather than imposing Western musical frameworks.

---

*Last Updated: 2025-10-29 (Added tuning system starting notes: theoretical significance, distinction from maqām tonic, API implications)*
