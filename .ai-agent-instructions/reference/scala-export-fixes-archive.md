# Scala Export Fixes Archive

**Purpose**: Historical reference documenting why certain Scala export implementation decisions were made.

**IMPORTANT**: This is an **ARCHIVE** containing historical context and resolved issues. The information here explains the reasoning behind implementation decisions but may not reflect current code structure.

**For current implementation guidance, see**:
- [scala-export-overview.md](./scala-export-overview.md) - Quick reference and decision tree
- [scala-kbm-export.md](./scala-kbm-export.md) - Current .kbm implementation guide
- [scala-scl-export.md](./scala-scl-export.md) - Current .scl implementation guide
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API reference

**What this archive contains**:
- Root cause analysis of historical bugs
- Explanation of why certain approaches were taken
- Evolution of the implementation over time
- Lessons learned from past issues

---

## Table of Contents

1. [General Scala Export Fix Summary](#general-scala-export-fix-summary)
2. [Critical Octave Shift Fix](#critical-octave-shift-fix)

---

## General Scala Export Fix Summary

### Issue

Scala keyboard mapping (.kbm) exports were causing octave jumping issues where notes would play at incorrect octaves on MIDI keyboards.

### Root Cause

The implementation violated three critical Scala format requirements:

1. **Mapping degrees were not in ascending order** - They started from the tonic instead of the lowest degree
2. **Middle note was set to tonic** - Should be set to the lowest degree's MIDI note
3. **Manual octave corrections were applied** - These created out-of-range degree numbers

### Solution

#### Core Principle

**Degrees must ALWAYS be in ascending order starting from 0.**

For Maqām Bayyāt Shūrī with these pitch classes:
- G (degree 0) ← Lowest
- G# (degree 1)
- B (degree 10)
- C (degree 11)
- D (degree 16) ← Tonic
- E-b (degree 20)
- F (degree 22)

**Correct mapping**:
```
Position 0 (G):  degree 0   ← Start here (lowest degree)
Position 1 (G#): degree 1
Position 2 (A):  x
Position 3 (A#): x
Position 4 (B):  degree 10
Position 5 (C):  degree 11
Position 6 (C#): x
Position 7 (D):  degree 16  ← Tonic
Position 8 (D#): x
Position 9 (E):  degree 20
Position 10 (F): degree 22
Position 11 (F#): x
```

**Middle note**: MIDI note of G (position 0, lowest degree)
**Reference note**: MIDI note of D (tonic, always mapped)
**Reference frequency**: D's frequency from tuning system

### Implementation Changes

#### 1. Use `midiNoteDeviation` for MIDI Notes

**Before** (incorrect):
```typescript
const midiNote = englishNameToMidiNote(pc.englishName);
```

**After** (correct):
```typescript
// midiNoteDeviation format: "MIDI_NOTE CENTS_DEVIATION" (e.g., "50 -2.0")
let midiNote: number;
if (pc.midiNoteDeviation) {
  const parts = pc.midiNoteDeviation.split(' ');
  midiNote = parseInt(parts[0], 10);
} else {
  midiNote = englishNameToMidiNote(pc.englishName);
}
```

**Why**: `midiNoteDeviation` accounts for:
- Non-standard tuning system starting frequencies
- Microtonal intervals
- Accurate octave positioning

#### 2. Sort by Degree and Find Lowest

**New logic**:
```typescript
// Map all pitch classes to degrees
mappedPitchClasses.push({ pitchClass, ipnRef, degree, midiNote });

// Sort by degree (ascending)
mappedPitchClasses.sort((a, b) => a.degree - b.degree);

// Position 0 = lowest degree
const lowestDegreeMapped = mappedPitchClasses[0];
```

#### 3. Set Middle Note to Lowest Degree

**Before** (incorrect):
```typescript
const middleNote = tonicMidiNote; // Tonic
```

**After** (correct):
```typescript
const middleNote = lowestDegreeMapped.midiNote; // Lowest degree
```

**Note**: This was later refined - see [Critical Octave Shift Fix](#critical-octave-shift-fix) below for the complete solution.

#### 4. Build Mapping from Lowest Degree

**Before** (incorrect):
```typescript
// Rotated from tonic position
const rotatedIndex = (tonicPosition + i) % 12;
```

**After** (correct):
```typescript
// Rotated from lowest degree position
const lowestDegreePosition = chromaticOrder.indexOf(lowestDegreeIpn);
const rotatedIndex = (lowestDegreePosition + i) % 12;
```

#### 5. Remove Manual Octave Corrections

**Removed**:
```typescript
// REMOVED: This created out-of-range degrees
if (pcCents >= 1200) {
  degree = matchIndex + scaleSize; // Don't do this!
}
```

**Now**: All degrees stay in valid range (0-26), Scala handles octave transposition automatically.

### File Header Improvements

Enhanced .kbm file headers now include comprehensive tuning system metadata:

**First line format**:
```
! maqām bayyāt shūrī (tonic: D) - Mapped to al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone
```
Uses `tuningSystem.stringify()` for the full, properly formatted tuning system name.

**Maqam details**:
```
! === MAQAM DETAILS ===
! Maqam: maqām bayyāt shūrī
! Tonic: dūgāh
! Tonic IPN: D
! Tonic degree in tuning system: 16
```
Tonic shown as just the note name (without English name/octave).

**Tuning system details**:
```
! === TUNING SYSTEM DETAILS ===
! Tuning system: al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone
! Starting note name: yegāh
! Starting note MIDI note number: 43
! Starting note IPN and octave: G2
! Starting note frequency (1/1 at 0 cents): 97.998... Hz
! Total Scale degrees in .scl file: 27
! Formal octave (2/1 1200 cents): degree 27
```
Now includes starting note MIDI number and IPN/octave for complete reference.

**Keyboard mapping reference settings**:
```
! === KEYBOARD MAPPING (.kbm) REFERENCE SETTINGS ===
! Middle note (where position 0 maps to): MIDI 55
!   - Position 0 pitch: nawā (G3)
!   - Position 0 degree: 0
! Reference note (gets reference frequency): MIDI 50
!   - Reference pitch: dūgāh (D3)
!   - Reference frequency: 146.998... Hz
```
Includes octave shift note when applicable.

### Files Modified

- `src/functions/scala-export.ts`:
  - `buildTuningSystemKeymapContent()` - Complete rewrite
  - Added comprehensive comments explaining each step
  - Uses `midiDeviation` for MIDI note calculations
  - Sorts pitch classes by degree
  - Builds mapping from lowest degree

### Testing

Test cases verified:
- ✅ Maqām Bayyāt Shūrī with al-Fārābī (950g), yegāh starting note
- ✅ Maqām Bayyāt Shūrī with al-Fārābī (950g), ʿushayrān starting note
- ✅ Degrees in ascending order (0, 1, ..., 27)
- ✅ Middle note = lowest degree's MIDI note
- ✅ Reference note = tonic's MIDI note
- ✅ No octave jumping when playing across keyboard range

---

## Critical Octave Shift Fix

### The Problem

The initial fix (described above) set the middle note to the lowest degree's MIDI note. However, this caused a new problem when the lowest degree had a **higher MIDI note** than the tonic.

**Scala format requires**: Middle note ≤ Reference note for correct playback.

### Example Case: Maqām Bayyāt Shūrī on D3 with al-Fārābī (950g) ʿushayrān

**Maqam pitch classes** (tuning system degrees): 11, 14, 17, 22, 24, 5, 6

**Sorted by degree**: 5, 6, 11, 14, 17, 22, 24

**Key pitches**:
- **Lowest degree**: 5 (māhūr, B3, MIDI 59)
- **Tonic (reference)**: degree 11 (dūgāh, D3, MIDI 50)

**The Problem**: B3 (MIDI 59) > D3 (MIDI 50)!

If we set middle note = 59 (B3), it would be higher than reference note 50 (D3), causing incorrect Scala playback.

### The Solution

#### Core Rule

**IF** the lowest degree's MIDI note is **higher than** the tonic's MIDI note,
**THEN** shift the middle note **down by 12 semitones (one octave)**

#### Implementation

```typescript
// Step 1: Find lowest degree (after sorting by degree)
const lowestDegreeMapped = mappedPitchClasses[0];

// Step 2: Get tonic's MIDI note (reference note)
const referenceNoteMidi = tonicMapped.midiNote;

// Step 3: Calculate middle note with octave shift if needed
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote = lowestDegreeMapped.midiNote - 12; // Shift down one octave
}
```

#### Result for the Example

- Original lowest degree MIDI: 59 (B3)
- Reference note MIDI: 50 (D3)
- Since 59 > 50: **middleNote = 59 - 12 = 47 (B2)**

This ensures:
1. Position 0 maps to B2 (MIDI 47) - octave-shifted down
2. Reference D3 (MIDI 50) remains mapped and gets its correct frequency (146.67 Hz)
3. Mapping degrees ascend correctly: `5, 6, x, 11, x, 14, 17, x, 22, 24, x, x`

### Why This Works

#### Scala .kbm Format Requirements

1. **Position 0** starts at the lowest tuning system degree
2. **Degrees must ascend** from that position: 5, 6, 11, 14, 17, 22, 24...
3. **Middle note** (MIDI note where position 0 maps to) anchors the entire mapping
4. **Reference note** (tonic) must be mapped and receive its frequency
5. **Critical constraint**: Middle note ≤ Reference note (for correct transposition)

#### Chromatic MIDI Keyboard Mapping

The 12 chromatic positions starting from the lowest degree (B):
```
Position 0 (B):  degree 5   ← Maps to MIDI 47 (B2, octave-shifted)
Position 1 (C):  degree 6
Position 2 (C#): x
Position 3 (D):  degree 11  ← Tonic at MIDI 50 (D3), gets reference frequency
Position 4 (D#): x
Position 5 (E):  degree 14
Position 6 (F):  degree 17
Position 7 (F#): x
Position 8 (G):  degree 22
Position 9 (G#): degree 24
Position 10 (A): x
Position 11 (A#): x
```

This pattern repeats across all MIDI octaves. The tonic D3 (MIDI 50) correctly receives its frequency (146.67 Hz), and all intervals play correctly relative to the octave-shifted starting position.

### Generalisability

This solution is **completely generalisable** to all maqamat and tuning systems:

1. ✅ Always sort pitch classes by tuning system degree
2. ✅ Always use the lowest degree for position 0
3. ✅ Always use the tonic as the reference note
4. ✅ **Always check: if lowest degree MIDI > tonic MIDI, subtract 12 from middle note**
5. ✅ Always extract MIDI notes from `midiNoteDeviation` field

The octave shift only applies when needed (when the lowest degree happens to be higher than the tonic), making it work correctly for all cases.

### Updated .kbm Header

When octave shift is applied, the header includes a note:

```
! === KEYBOARD MAPPING (.kbm) REFERENCE SETTINGS ===
! Middle note (where position 0 maps to): MIDI 47
!   - Position 0 pitch: māhūr (B2)
!   - Position 0 degree: 5
!   - NOTE: Octave shifted down from MIDI 59 to 47
! Reference note (gets reference frequency): MIDI 50
!   - Reference pitch: dūgāh (D3)
!   - Reference frequency: 146.67 Hz
```

### Files Modified

- `src/functions/scala-export.ts` - Updated `buildTuningSystemKeymapContent()` function with octave shift logic
- `.ai-agent-instructions/reference/scala-export-guide.md` - Updated with octave shift logic (now superseded by new structure)
- `.ai-agent-instructions/reference/scala-export-fix-summary.md` - Added octave shift section (now archived here)

### Testing

Test cases to verify:
- ✅ Maqām Bayyāt Shūrī with al-Fārābī (950g), yegāh starting note (no shift needed)
- ✅ Maqām Bayyāt Shūrī with al-Fārābī (950g), ʿushayrān starting note (shift needed)
- ✅ Degrees always in ascending order
- ✅ Middle note ≤ reference note in all cases
- ✅ Reference frequency correctly assigned to tonic
- ✅ No octave jumping during playback in Scala software

---

## Summary of Key Lessons

### 1. Always Use Accurate Data

**Lesson**: Always extract MIDI note numbers from `midiNoteDeviation` field, not from manual calculations.

**Why**: DiArMaqAr's pitch class data accounts for non-standard starting frequencies and microtonal intervals.

### 2. Degrees in Ascending Order

**Lesson**: Mapping degrees must ALWAYS be in ascending order starting from the lowest degree (not the tonic).

**Why**: Scala format requires ascending degrees for correct playback across octaves.

### 3. Middle Note Constraint

**Lesson**: Middle note must be ≤ reference note. Apply octave shift when needed.

**Why**: Scala uses the middle note to anchor the mapping and requires it to be at or below the reference note.

### 4. No Manual Octave Corrections

**Lesson**: Never manually add octave corrections to degrees (e.g., `degree + scaleSize`).

**Why**: Scala automatically handles octave transposition based on the mapping pattern.

### 5. Comprehensive Metadata

**Lesson**: Include detailed metadata in .kbm headers for debugging and verification.

**Why**: Makes it easy to verify correct implementation and troubleshoot issues.

---

## Related Documentation

**Current Implementation Guides**:
- [scala-export-overview.md](./scala-export-overview.md) - Choose export type
- [scala-scl-export.md](./scala-scl-export.md) - How to create .scl files
- [scala-kbm-export.md](./scala-kbm-export.md) - How to create .kbm files (includes octave shift logic)
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API reference
- [12-pitch-class-sets-algorithm.md](./12-pitch-class-sets-algorithm.md) - Algorithm details

**External Resources**:
- [Scala .scl Format](https://www.huygens-fokker.org/scala/scl_format.html)
- [Scala Keyboard Mappings](https://www.huygens-fokker.org/scala/help.htm#mappings)

---

*Archive of Scala export implementation fixes and lessons learned*
