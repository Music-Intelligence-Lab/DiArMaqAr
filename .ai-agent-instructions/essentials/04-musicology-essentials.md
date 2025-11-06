# Musicological Principles Essentials

**PURPOSE**: Critical musicological insights for implementing Arabic maqām theory computationally.

**LOAD**: For development tasks involving maqām theory, transposition, modulation, or musicological accuracy.

---

## Overview

Arabic maqām theory is **not** a variant of Western music theory. It represents independent theoretical frameworks with their own logic, historical development, and epistemological foundations. This document outlines key musicological principles essential for correct computational modeling.

**For complete definitions**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md)

---

## 0. Octave-Repeating vs Non-Octave-Repeating (CRITICAL)

### Distinction

Maqamat and ajnās fall into two categories based on their pitch class count:

**Octave-Repeating**: ≤7 pitch classes
- Repeat every octave
- Can be found entirely within a single octave
- Example: Maqām Rāst (7 pitch classes)

**Non-Octave-Repeating**: >7 pitch classes
- Span **multiple octaves** before repeating
- **Cannot** be found entirely within a single octave
- Examples: Maqām Bayyātī ʿUshayrān (11), Maqām Sūzd āl (11), Maqām Shawq Ṭarab (13)

### Programming Implication (CRITICAL)

**When checking availability, you MUST check across 3 octaves**, not just a single octave.

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
    // Works for both octave-repeating AND non-octave-repeating
    return true;
  }
}
```

### Why This Matters

Non-octave-repeating maqāmāt require notes split across multiple octaves:
- Some notes in octave 1 (qarār register)
- Other notes in octave 2 (muṭlaq register)
- Final notes in octave 3 (jawāb register)

Single-octave checking incorrectly reports these as "unavailable".

### Where to Apply

**This pattern is required in:**
- All API endpoints checking maqām/jins availability
- All UI components checking if maqām/jins is possible
- Any transposition or modulation calculations

**Reference**: [src/components/tuning-system-manager.tsx:42](../../src/components/tuning-system-manager.tsx#L42)

### Test Verification

1. Query all maqāmāt: `GET /api/maqamat`
2. Verify **no maqām has zero availability**
3. Test specific non-octave-repeating maqāmāt (>7 pitch classes)
4. If any shows zero availability, check if you're using `getNoteNameSetsWithAdjacentOctaves()`

**Historical Context**: This fixed 10 maqāmāt incorrectly showing zero availability. After applying 3-octave pattern, all 60 maqāmāt correctly showed availability (4-35 tuning systems).

---

## 1. Asymmetric Melodic Paths (ṣuʿūd vs hubūṭ)

### Critical Insight

Maqamat can have **fundamentally different** ascending and descending sequences, not just reversed note orders.

### Example: Maqām Bestenegār

**Ascending (ṣuʿūd)**: Ends on **muḥayyar**
- Ratio: 8/3
- IPN: **D4**

**Descending (hubūṭ)**: Begins from **shahnāz**
- Ratio: 81/32
- IPN: **C#4**

**These are different notes** with different frequencies and theoretical significance.

### Programming Implication

**NEVER assume** `descendingPitchClasses === ascendingPitchClasses.reverse()`

**Always handle as independent arrays:**
```typescript
interface Maqam {
  ascendingPitchClasses: PitchClass[];   // ṣuʿūd - independent
  descendingPitchClasses: PitchClass[];  // hubūṭ - independent (NOT reversed)
}
```

**UI Indicator**: Maqamat with asymmetric paths are marked with asterisk (*).

---

## 2. Variable Pitch Class Counts

### Reality

Maqamat contain **varying numbers of pitch classes** depending on theoretical context, melodic range, and historical tradition.

Some maqamat end on the octave equivalence of the first note (marked "I+"), others on different pitch classes.

### Examples

| Maqām | Pitch Classes | Ends on Octave |
|-------|---------------|----------------|
| Rāst | 7 | Yes (I+) |
| Nahāwand Kabīr | 7 | Yes (I+) |
| Bestenegār | 10 | No (different note) |
| Dilkesh Ḥūrān | 10 | Yes (I+) - 9 unique + octave |

### Programming Implication

**The hardcoded `7` in modulo operations represents the 7-letter Western cycle** (A-G) used in IPN, **NOT the number of pitch classes in a maqam**.

```typescript
// This represents the 7-letter cycle (A-G), not pitch class count
const letterIndex = ((startIndex + offset) % 7 + 7) % 7;
```

---

## 3. Sequential Letter Resolution for Enharmonic Spelling

### Principle

Melodic sequences must use **consecutive natural letters** with appropriate accidentals for staff notation readability.

### Example: Maqām Bestenegār (Descending)

**✅ Correct:**
- **D**b4 → **C**4 → **B**b3 → **A**3 → **G**b3 → **F**3 → **E**-b3 → **D**3 → **C**3 → **B**-b2
- Letter sequence: D→C→B→A→G→F→E→D→C→B ✓

**❌ Wrong** (using default enharmonic spellings):
- C#4 → B#4 → A#3 → A3 → F#3 → E#3 → E-b3 → D3 → B#3 → B-b2
- Letter sequence: C→B→A→A→F→E→E→D→B→B ✗ (non-sequential, repeated)

### Algorithm Requirements

**Ascending sequences:**
- Calculate expected letters from **FIRST note** going up

**Descending sequences:**
- Calculate expected letters from **LAST note** (lowest pitch) going up
- Then **REVERSE** the letter sequence

**Rationale**: Descending pitch class arrays stored high→low, so lowest pitch is at END of array.

### JavaScript Modulo Gotcha

```typescript
// ❌ JavaScript handles negative modulo incorrectly
-2 % 7 = -2  // JavaScript result
-2 % 7 = 5   // Expected musical result

// ✅ Solution: Double-modulo pattern
((startIndex + offset) % 7 + 7) % 7  // Always returns 0-6
```

---

## 4. Tuning System Independence

### Principle

The same maqam (or jins) can be realized in different tuning systems **only if all required pitch classes are available** within cents tolerance.

### Key Points

- Maqam has **fixed number of pitch classes**
- Different tuning systems may support different transpositions
- Different modulation possibilities depend on available pitch classes
- Intervals may be realized slightly differently

### Tuning System Starting Notes

**Critical Distinction**: Tuning system starting notes are **NOT** the same as maqām tonics.

**Tuning System Starting Note** = Theoretical framework anchor
- **ʿushayrān**: Oud tuning tradition (instrument-based)
- **yegāh**: Monochord measurement tradition (scientific)
- **rāst**: Pedagogical/theoretical frameworks (didactic)

**Maqām Tonic** = First note of the melodic scale

**For complete explanation**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md#starting-note-name)

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
const intervals = [9/8, 5/4, 4/3]; // Only valid for specific systems
```

**Never hardcode:**
- Pitch values
- Interval assumptions
- Available transpositions

**Always validate** whether all required pitch classes exist before considering a transposition valid.

---

## 5. Enharmonic Context & Notation Semantics

### Enharmonic Equivalence Context

C#4 and Db4 are enharmonically equivalent pitches but represent **different melodic contexts**:

| Spelling | Context | Implication |
|----------|---------|-------------|
| **C#4** | Ascending | Raising C natural |
| **Db4** | Descending | Lowering D natural |

The `renderPitchClassSpellings()` function determines correct spelling based on melodic direction and sequential letter requirements.

---

## 6. Starting Note Significance

**Different starting notes represent fundamentally different theoretical approaches**, NOT simple transposition.

**For complete explanation**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md#starting-note-name)

---

## 7. Modulation Structure

### Key Insight

- **Maqamat modulate** (change from one modal framework to another)
- **Ajnās don't modulate** (they're the targets of modulation)

### Implementation Pattern

Modulation analysis identifies:
- Which maqāmāt are possible at each maqām degree
- Which ajnās are present at each maqām degree
- Common modulation paths (al-Shawwā 1946 algorithm)

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
// ✅ Use runtime property checking
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
// ✅ Check explicitly
const hasOctaveEquivalence = maqam.endsOnOctave();  // I+ marker

// ❌ Don't assume based on count
if (pitchClasses.length === 7) {  // Doesn't guarantee octave equivalence
```

---

## 9. Embedded Ajnas Analysis

### Principle

Maqamat are composed of **embedded ajnas patterns** that can be automatically identified through pattern matching.

### Algorithm

1. Take each maqam sequence (ascending and descending separately)
2. For each jins in database:
   - Try to match jins intervals within maqam sequence
   - Use cents tolerance for matching
   - Identify starting position and embedded notes
3. Categorize by maqām degree position

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

### Innovation

**DiArMaqAr implements the first computational transposition of suyūr**, addressing a fundamental limitation in historical sources where suyūr were only documented for canonical forms (tahlīl) and never for transpositions (taṣwīr).

The `transposeSayr()` function intelligently shifts note stops, maintains structural identity for jins/maqām references, and handles directional instructions.

**For project overview**: See [01-project-essentials.md](01-project-essentials.md#computational-transposition-of-suyur)

---

## 11. Maqām Family Classification (Canonical Reference)

### Critical Insight

Maqām families are determined by analyzing the **first jins at maqām degree 1**. Since family classification depends on ajnās analysis, and ajnās analysis depends on tuning system pitch classes, **using different tuning systems produces inconsistent family classifications**.

### Solution: Canonical Reference Approach

**Always use al-Ṣabbāgh (1954) as canonical tuning system reference** for ALL family classifications:

```typescript
// 1. Get canonical reference (supports 59/60 maqāmāt)
const referenceTuningSystem = tuningSystems.find(
  ts => ts.getId() === "al-Sabbagh-(1954)"
);

// 2. For each maqām, use its OWN canonical starting note
const canonicalStartingNote = maqam.getAscendingNoteNames()[0];

// 3. Generate pitch classes
const pitchClasses = getTuningSystemPitchClasses(
  referenceTuningSystem,
  canonicalStartingNote
);

// 4. Calculate transpositions
const transpositions = calculateMaqamTranspositions(
  pitchClasses,
  ajnas,
  maqam,
  true,  // withTahlil
  5      // centsTolerance
);

// 5. Find non-transposed instance (tahlil)
const tahlil = transpositions.find(t => !t.transposition);

// 6. Classify
if (tahlil) {
  const classification = classifyMaqamFamily(tahlil);
}
```

### Why al-Ṣabbāgh (1954)?

- **Comprehensive**: Supports 59/60 maqāmāt in canonical starting positions
- **Modern**: Represents mid-20th century standardization
- **Consistent**: Using one reference ensures all maqāmāt classified within same framework

### Validated Results (October 2025)

- **60 maqāmāt** total in database
- **51 maqāmāt** successfully classified into **16 distinct families**
- **9 maqāmāt** with "no jins" classification (incomplete ajnās database - expected)
- **100% consistency** across all API calls and UI operations

### Musicological Significance

This highlights that **family classification is tuning-system-relative**: a maqām's family membership depends on the theoretical framework used to analyze it. By standardizing on al-Ṣabbāgh (1954), we ensure consistency, comparability, and historical validity.

---

## Summary of Key Principles

1. **Octave-Repeating**: Use 3-octave checking for availability (CRITICAL)
2. **Asymmetric Sequences**: Ascending ≠ Descending (reversed)
3. **Variable Counts**: Maqamat can have 7, 8, 9, 10+ pitch classes
4. **Sequential Letters**: Staff notation requires consecutive natural letters
5. **Tuning Independence**: Same maqam, different realizations across systems
6. **Enharmonic Context**: C# vs Db depends on melodic direction
7. **Starting Note Significance**: Not simple transposition, different frameworks
8. **Modulation Structure**: Maqamat modulate, ajnas don't (they're targets)
9. **JavaScript Gotchas**: Double-modulo for negative numbers
10. **Embedded Analysis**: Pattern matching finds ajnas within maqamat
11. **Computational Transposition of Suyūr**: First implementation enabling systematic exploration of melodic pathways
12. **Family Classification**: Requires canonical tuning system reference (al-Ṣabbāgh 1954)

These principles ensure computational implementations respect the independent theoretical logic of Arabic maqām theory rather than imposing Western musical frameworks.

---

**For complete musicological definitions**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md)

**For cultural framework**: See [core/00-core-principles.md](../core/00-core-principles.md#culturally-sensitive-computational-musicology)
