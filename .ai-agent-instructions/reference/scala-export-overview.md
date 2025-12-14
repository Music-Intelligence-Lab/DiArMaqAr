# Scala Export Overview - Quick Reference

**Purpose**: Help AI agents quickly understand Scala export options and choose the right approach.

---

## What Are Scala Files?

**Scala** is a powerful system for musical tuning, including microtonal scales. DiArMaqAr exports tuning data in two Scala file formats:

### .scl Files (Scale Files)
Define pitch classes and their tuning (cents or ratios) within one octave.

### .kbm Files (Keyboard Mapping Files)
Map MIDI keyboard keys to scale degrees, specifying which keys play which pitches.

---

## Export Types: Decision Tree

DiArMaqAr supports different export strategies depending on your use case:

```
┌─ Do you want to export just the tuning system?
│  └─ YES → Simple .scl Export (Section A)
│           - Exports tuning system pitch classes as-is
│           - No keyboard mapping needed for basic use
│           - File: scala-scl-export.md (Section A)
│
└─ Do you want to play a maqām on a MIDI keyboard?
   │
   ├─ Just the actual maqām pitch classes (sparse mapping)?
   │  └─ YES → Simple .scl + Simple .kbm Export
   │           - .scl: Tuning system pitch classes
   │           - .kbm: Maps only actual maqām/jins notes (rest unmapped 'x')
   │           - Files: scala-scl-export.md (Section A) + scala-kbm-export.md (Section A)
   │
   └─ Full chromatic keyboard (all 12 semitones mapped)?
      └─ YES → 12-Pitch-Class Set Export
                - .scl: 12 chromatic pitch classes (maqām + tuning system fillers)
                - .kbm: Maps all 12 chromatic positions
                - Files: scala-scl-export.md (Section B) + scala-kbm-export.md (Section B)
                - API: 12-pitch-class-sets-api.md
                - Algorithm: 12-pitch-class-sets-algorithm.md
```

---

## Quick Reference Matrix

| Export Type | .scl Content | .kbm Mapping | When to Use | Documentation |
|-------------|-------------|--------------|-------------|---------------|
| **Simple Tuning System** | Tuning system pitch classes | Not needed | Export tuning for analysis, reference | [scala-scl-export.md](./scala-scl-export.md) (Section A) |
| **Simple Maqām** | Tuning system pitch classes | Only maqām notes (sparse) | Play specific maqām, preserve exact pitches | [scala-scl-export.md](./scala-scl-export.md) (Section A)<br/>[scala-kbm-export.md](./scala-kbm-export.md) (Section A) |
| **12-Pitch-Class Set** | 12 chromatic pitch classes | All 12 positions | Full chromatic keyboard, MIDI composition | [scala-scl-export.md](./scala-scl-export.md) (Section B)<br/>[scala-kbm-export.md](./scala-kbm-export.md) (Section B)<br/>[12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) |

---

## Common Use Cases

### Use Case 1: Export al-Fārābī Tuning System
**Goal**: Create a .scl file with all 27 pitch classes from al-Fārābī's tuning system.

**Approach**: Simple .scl Export (Section A)
- ✅ No .kbm file needed
- ✅ All tuning system pitch classes included
- ✅ Can be used for reference or in Scala software

**See**: [scala-scl-export.md](./scala-scl-export.md) - Section A

---

### Use Case 2: Play maqām rāst on MIDI Keyboard
**Goal**: Map only the actual notes of maqām rāst to a MIDI keyboard.

**Approach**: Simple .scl + Simple .kbm Export
- ✅ .scl: Tuning system pitch classes (e.g., al-Kindī 12-tone)
- ✅ .kbm: Maps only maqām rāst notes (7 notes), rest unmapped ('x')
- ✅ Sparse mapping preserves exact maqām structure

**Example Mapping** (maqām rāst on D):
```
Position 0 (D):  degree 0   ← Tonic
Position 1 (D#): x
Position 2 (E):  degree 2   ← segāh
Position 3 (F):  x
Position 4 (F#): degree 4   ← chahārgāh
Position 5 (G):  degree 5   ← nawā
...
```

**See**:
- [scala-scl-export.md](./scala-scl-export.md) - Section A
- [scala-kbm-export.md](./scala-kbm-export.md) - Section A

---

### Use Case 3: Full Chromatic MIDI Composition
**Goal**: Play any note on a MIDI keyboard with chromatic coverage for composition.

**Approach**: 12-Pitch-Class Set Export
- ✅ .scl: 12 chromatic pitch classes (maqām notes + tuning system fillers)
- ✅ .kbm: All 12 chromatic positions mapped
- ✅ Suitable for MIDI sequencers, DAWs, and composition tools

**How It Works**:
1. API creates 12-pitch-class set from maqām + tuning system fillers
2. Export .scl file with all 12 pitch classes starting from C
3. Export .kbm file (optional) for explicit keyboard mapping

**See**:
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - How to use the API
- [scala-scl-export.md](./scala-scl-export.md) - Section B (export from API data)
- [scala-kbm-export.md](./scala-kbm-export.md) - Section B (full chromatic mapping)
- [12-pitch-class-sets-algorithm.md](./12-pitch-class-sets-algorithm.md) - Deep dive into algorithm

---

## Critical Principles (All Export Types)

### 1. Degrees in Ascending Order
**All .kbm files** must have degrees in ascending order starting from 0 (the lowest degree).

**Correct**: `[0, 1, x, x, 10, 11, x, 16, ...]`
**Incorrect**: `[16, x, 20, 22, x, 0, 1, ...]`

### 2. Reference Note = Tonic
**All .kbm files** must use the maqām/jins tonic as the reference note (gets reference frequency).

**Why**: The tonic is always present in the maqām and has accurate frequency data.

### 3. Middle Note with Octave Shift
**All .kbm files** must set the middle note to the lowest degree's MIDI note.

**Critical**: If lowest degree MIDI > tonic MIDI, shift middle note down by 12 (one octave).

```typescript
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote = lowestDegreeMapped.midiNote - 12; // Shift down one octave
}
```

### 4. Use midiNoteDeviation Field
**Always** extract MIDI note numbers from the `midiNoteDeviation` field in pitch class data.

```typescript
// Correct
if (pc.midiNoteDeviation) {
  const parts = pc.midiNoteDeviation.split(' ');
  midiNote = parseInt(parts[0], 10);
}

// Incorrect
midiNote = englishNameToMidiNote(pc.englishName); // Missing microtonal info
```

---

## File Naming Conventions

### .scl Files
```
{tuningSystemId}_{startingNote}_octave1.scl
```
**Example**: `al-Farabi-(950g)_yegah_octave1.scl`

### .kbm Files (Simple Maqām)
```
{maqamOrJinsName}_{tuningSystemId}_{startingNote}.kbm
```
**Example**: `maqam_rast_al-Farabi-(950g)_yegah.kbm`

### .scl Files (12-Pitch-Class Sets)
```
{maqamName}_12-tone-chromatic-set_{tuningSystemId}.scl
```
**Example**: `maqam_rast_12-tone-chromatic-set_al-Kindi-(874).scl`

---

## Documentation Map

### For Quick Tasks
- **This file** - Choose export type
- [scala-scl-export.md](./scala-scl-export.md) - How to create .scl files (both simple and 12-pitch-class)
- [scala-kbm-export.md](./scala-kbm-export.md) - How to create .kbm files (both simple and 12-pitch-class)

### For 12-Pitch-Class Sets
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API usage and parameters
- [12-pitch-class-sets-algorithm.md](./12-pitch-class-sets-algorithm.md) - Algorithm details and verification

### For Historical Context
- [scala-export-fixes-archive.md](./scala-export-fixes-archive.md) - Why certain implementation choices were made

---

## Implementation Files

- **Scala export functions**: `src/functions/scala-export.ts`
  - `exportMaqamToScala()` - Simple maqām .scl export (uses relative cents from tonic)
  - `exportJinsToScala()` - Simple jins .scl export (uses relative cents from tonic)
  - `exportMaqamTo12ToneScala()` - 12-pitch-class set .scl export
  - `exportMaqamToScalaKeymap()` - Simple maqām .kbm export
  - `exportJinsToScalaKeymap()` - Simple jins .kbm export
  - `exportMaqamTo12ToneScalaKeymap()` - 12-pitch-class set .kbm export
- **12-pitch-class set creation**: `src/functions/create12PitchClassSet.ts`
- **Classification algorithm**: `src/functions/classifyMaqamat12PitchClassSets.ts`
- **API endpoints**:
  - `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts` - Returns tahlil versions first
  - `src/app/api/maqamat/classification/maqam-pitch-class-sets/route.ts` - Returns tahlil versions first
- **Pitch class model**: `src/models/PitchClass.ts`

---

## External Resources

- [Scala .scl Format Specification](https://www.huygens-fokker.org/scala/scl_format.html)
- [Scala .kbm Format Specification](https://www.huygens-fokker.org/scala/help.htm#mappings)
- [Scala Software](https://www.huygens-fokker.org/scala/)

---

*Quick reference for AI agents working with Scala exports in DiArMaqAr*
