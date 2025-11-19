# Scala .kbm File Export Guide

**Purpose**: How to create Scala keyboard mapping (.kbm) files that map MIDI keys to scale degrees.

---

## Table of Contents

- [Section A: Simple .kbm Export (Actual Maqām Pitch Classes Only)](#section-a-simple-kbm-export-actual-maqām-pitch-classes-only)
- [Section B: 12-Pitch-Class Set .kbm Export](#section-b-12-pitch-class-set-kbm-export)
- [.kbm File Format Specification](#kbm-file-format-specification)
- [Critical Octave Shift Logic (Applies to Both Sections)](#critical-octave-shift-logic-applies-to-both-sections)
- [Common Issues and Solutions](#common-issues-and-solutions)

---

## Universal Principles (All .kbm Exports)

Before diving into specific export types, understand these **critical principles** that apply to **ALL** .kbm exports:

### 1. Degrees in Ascending Order Starting from 0
Mapping degrees **MUST** always be in ascending order, starting from 0 (the lowest degree).

**Correct**: `[0, 1, x, x, 10, 11, x, 16, ...]`
**Incorrect**: `[16, x, 20, 22, x, 0, 1, ...]` (starts from tonic, not lowest degree)

### 2. Reference Note = Maqām/Jins Tonic (Always)
The reference note (which gets the reference frequency) **MUST ALWAYS** be the maqām or jins tonic.

**Why**:
- The tonic is guaranteed to be in every maqām/jins
- The tonic has accurate frequency data from DiArMaqAr
- The reference note must be mapped (cannot be 'x')

### 3. Middle Note = Lowest Degree's MIDI Note
The middle note (where position 0 maps to) **MUST** be the MIDI note of the pitch class with the **lowest tuning system degree**.

**Why**: Position 0 starts at the lowest degree, and the chromatic mapping rotates from there.

### 4. Critical: Octave Shift for Middle Note
**IF** the lowest degree's MIDI note is **higher than** the tonic's (reference) MIDI note,
**THEN** shift the middle note **down by 12 semitones (one octave)**.

```typescript
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote = lowestDegreeMapped.midiNote - 12; // Shift down one octave
}
```

**Why**: Scala requires middle note ≤ reference note for correct playback.

See [Critical Octave Shift Logic](#critical-octave-shift-logic-applies-to-both-sections) for detailed explanation.

### 5. Always Use midiNoteDeviation Field
**ALWAYS** extract MIDI note numbers from the `midiNoteDeviation` field.

```typescript
// Correct
let midiNote: number;
if (pc.midiNoteDeviation) {
  const parts = pc.midiNoteDeviation.split(' ');
  midiNote = parseInt(parts[0], 10);
} else {
  midiNote = englishNameToMidiNote(pc.englishName); // Fallback only
}

// Incorrect
midiNote = englishNameToMidiNote(pc.englishName); // Missing microtonal info
```

**Why**: `midiNoteDeviation` accounts for non-standard starting frequencies and microtonal intervals.

---

## Section A: Simple .kbm Export (Actual Maqām Pitch Classes Only)

### When to Use

Map only the **actual pitch classes** from a maqām or jins to a MIDI keyboard, leaving other keys unmapped.

**Use Cases**:
- Play only the specific notes of a maqām
- Preserve exact maqām structure with sparse keyboard mapping
- Educational tools showing which keys belong to the maqām

### What Gets Exported

- **Map size**: 12 (chromatic octave pattern)
- **Mapped positions**: Only actual maqām/jins pitch classes
- **Unmapped positions**: 'x' (unmapped)
- **Reference note**: Maqām/jins tonic (gets reference frequency)
- **Middle note**: Lowest degree's MIDI note (with octave shift if needed)

### Algorithm

#### Step 1: Map Pitch Classes to Tuning System Degrees

```typescript
const mappedPitchClasses = [];

for (const pc of maqamOrJinsPitchClasses) {
  const ipnRef = getIpnReferenceNoteName(pc);
  const normalizedIpn = normalizeIpnToSharps(ipnRef);
  const centsInOctave = parseFloat(pc.cents) % 1200;

  // Find matching degree in tuning system (within tolerance)
  const degree = tuningSystemPitchClasses.findIndex(tspc => {
    const diff = Math.abs(centsInOctave - parseFloat(tspc.cents));
    return diff < 5; // 5 cents tolerance
  });

  // Extract MIDI note from midiNoteDeviation
  let midiNote: number;
  if (pc.midiNoteDeviation) {
    const parts = pc.midiNoteDeviation.split(' ');
    midiNote = parseInt(parts[0], 10);
  } else {
    midiNote = englishNameToMidiNote(pc.englishName);
  }

  mappedPitchClasses.push({
    pitchClass: pc,
    ipnRef: normalizedIpn,
    degree,
    midiNote
  });
}
```

#### Step 2: Sort by Degree (Ascending)

```typescript
mappedPitchClasses.sort((a, b) => a.degree - b.degree);
```

**Critical**: This ensures degrees are in ascending order starting from the lowest.

#### Step 3: Identify Reference Points

```typescript
// Position 0 = lowest degree (first after sorting)
const lowestDegreeMapped = mappedPitchClasses[0];

// Reference = tonic (always first in original maqam pitch class array)
const tonicMapped = mappedPitchClasses.find(mpc =>
  mpc.pitchClass === tonicPc
);
const referenceNote = tonicMapped.midiNote;
const referenceFreq = parseFloat(tonicPc.frequency);

// Middle note with octave shift if needed (CRITICAL!)
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNote) {
  middleNote = lowestDegreeMapped.midiNote - 12; // Shift down one octave
}
```

#### Step 4: Build Chromatic Mapping from Lowest Degree

```typescript
const chromaticOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const lowestDegreeIpn = lowestDegreeMapped.ipnRef;
const lowestDegreePosition = chromaticOrder.indexOf(lowestDegreeIpn);

// Create IPN-to-degree map for quick lookup
const ipnToDegreeMap = new Map();
for (const mpc of mappedPitchClasses) {
  ipnToDegreeMap.set(mpc.ipnRef, mpc.degree);
}

// Build 12-position chromatic mapping starting from lowest degree
const mapping = [];
for (let i = 0; i < 12; i++) {
  const rotatedIndex = (lowestDegreePosition + i) % 12;
  const ipn = chromaticOrder[rotatedIndex];

  if (ipnToDegreeMap.has(ipn)) {
    mapping.push(ipnToDegreeMap.get(ipn));
  } else {
    mapping.push('x'); // Unmapped
  }
}
```

**Important**:
- Start chromatic rotation from **lowest degree**, not from tonic
- This ensures degrees are in ascending order: `[0, 1, x, x, 10, 11, ...]`

#### Step 5: Build .kbm File Content

```typescript
const formalOctave = tuningSystemPitchClasses.length; // e.g., 27 for 27-tone system

const kbmContent = `! ${maqamOrJinsName} (tonic: ${tonicIPN}) - Mapped to ${tuningSystemName}
! Generated by the Digital Arabic Maqām Archive (DiArMaqAr)
!
! === ASSOCIATED SCALA FILE ===
! This keyboard mapping uses the following .scl file:
! ${sclFileName}
!
! === MAQAM DETAILS ===
! Maqam: ${maqamName}
! Tonic: ${tonicNoteName}
! Tonic IPN: ${tonicIPN}
! Tonic degree in tuning system: ${tonicDegree}
!
! === TUNING SYSTEM DETAILS ===
! Tuning system: ${tuningSystemName}
! Starting note name: ${startingNoteName}
! Starting note MIDI note number: ${startingNoteMidi}
! Starting note IPN and octave: ${startingNoteIPN}${startingNoteOctave}
! Starting note frequency (1/1 at 0 cents): ${startingNoteFrequency} Hz
! Total Scale degrees in .scl file: ${formalOctave}
! Formal octave (2/1 1200 cents): degree ${formalOctave}
!
! === KEYBOARD MAPPING (.kbm) REFERENCE SETTINGS ===
! Middle note (where position 0 maps to): MIDI ${middleNote}
!   - Position 0 pitch: ${lowestDegreeNoteName} (${lowestDegreeIPN}${lowestDegreeOctave})
!   - Position 0 degree: ${lowestDegreeMapped.degree}
${middleNote !== lowestDegreeMapped.midiNote ? `!   - NOTE: Octave shifted down from MIDI ${lowestDegreeMapped.midiNote} to ${middleNote}` : ''}
! Reference note (gets reference frequency): MIDI ${referenceNote}
!   - Reference pitch: ${tonicNoteName} (${tonicIPN}${tonicOctave})
!   - Reference frequency: ${referenceFreq} Hz
!
12
0
127
${middleNote}
${referenceNote}
${referenceFreq}
${formalOctave}
${mapping.join('\n')}
`;
```

### Example: Maqām Bayyāt Shūrī on D

**Maqam pitch classes** (al-Fārābī 950g, starting note: yegāh):
- D (dūgāh, degree 16, MIDI 50) ← Tonic
- E (segāh, degree 19, MIDI 52)
- F (chahārgāh, degree 21, MIDI 53)
- G (nawā, degree 0, MIDI 55) ← **Lowest degree**
- G# (ḥiṣār, degree 1, MIDI 56)
- B (māhūr, degree 10, MIDI 59)
- C (kurdān, degree 11, MIDI 60)

**After sorting by degree**:
- G (nawā, degree 0, MIDI 55) ← Lowest
- G# (ḥiṣār, degree 1)
- B (māhūr, degree 10)
- C (kurdān, degree 11)
- D (dūgāh, degree 16) ← Tonic
- E (segāh, degree 19)
- F (chahārgāh, degree 21)

**Chromatic mapping from G** (lowest degree):
```
Position 0 (G):  degree 0   ← Lowest degree
Position 1 (G#): degree 1
Position 2 (A):  x          ← Unmapped
Position 3 (A#): x          ← Unmapped
Position 4 (B):  degree 10
Position 5 (C):  degree 11
Position 6 (C#): x          ← Unmapped
Position 7 (D):  degree 16  ← Tonic
Position 8 (D#): x          ← Unmapped
Position 9 (E):  degree 19
Position 10 (F): degree 21
Position 11 (F#): x         ← Unmapped
```

**Reference settings**:
- Middle note: MIDI 55 (G3) - no octave shift needed (55 < 50 is false, wait... let me recalculate)

Actually, in this example:
- Lowest degree MIDI: 55 (G3)
- Tonic MIDI: 50 (D3)
- Since 55 > 50: **No shift needed** because... wait, that's backwards. Let me reread the logic.

Actually, I need to fix this. The octave shift check should be:
```typescript
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote = lowestDegreeMapped.midiNote - 12;
}
```

In this example:
- Lowest degree MIDI: 55 (G3)
- Tonic MIDI: 50 (D3)
- Since 55 > 50: middleNote = 55 - 12 = **43 (G2)** ✅ Octave shift applied!

Let me correct the example:

**Reference settings**:
- Middle note: MIDI **43 (G2)** ← Octave-shifted down from 55
- Reference note: MIDI 50 (D3)
- Reference frequency: 146.67 Hz (dūgāh)

### File Naming

```
{maqamOrJinsName}_{tuningSystemId}_{startingNote}.kbm
```

**Example**: `maqam_bayyat_shuri_al-Farabi-(950g)_yegah.kbm`

---

## Section B: 12-Pitch-Class Set .kbm Export

### When to Use

Map all 12 chromatic positions for full keyboard coverage with a maqām's 12-pitch-class set.

**Use Cases**:
- Full chromatic MIDI composition
- DAW integration with complete chromatic access
- Chromatic transposition capability

**Note**: For 12-pitch-class sets, a .kbm file is **optional** - the .scl file alone is often sufficient since all 12 positions are mapped.

### What Gets Exported

- **Map size**: 12 (chromatic octave pattern)
- **Mapped positions**: All 12 chromatic positions (no 'x')
- **Reference note**: Maqām tonic (gets reference frequency)
- **Middle note**: Always C's MIDI note (since .scl starts from C)

### Algorithm

#### Step 1: Get 12-Pitch-Class Set from API

```typescript
const response = await fetch(
  `/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&startSetFromC=true&pitchClassDataType=all`
);
const data = await response.json();
const pitchClasses = data.sets[0].pitchClassSet.pitchClasses;
const compatibleMaqamat = data.sets[0].compatibleMaqamat;
```

**Important**: Use `startSetFromC=true` so pitch classes start from C.

#### Step 2: Build Chromatic Mapping from C

Since the pitch classes are already in chromatic order starting from C:

```typescript
const chromaticOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const mapping = [];

for (const ipn of chromaticOrder) {
  const pc = pitchClasses.find(p => p.ipnReferenceNoteName === ipn);
  if (pc) {
    mapping.push(pc.degreeInTuningSystem); // All positions mapped
  }
}
```

**Simplified**: Since all 12 are present, mapping is just the degrees in order.

#### Step 3: Reference Points

```typescript
// For 12-pitch-class sets:
const middleNote = cPitchClass.midiNote; // C's MIDI note
const referenceNote = tonicPitchClass.midiNote; // Tonic's MIDI note
const referenceFreq = parseFloat(tonicPitchClass.frequency);
```

**Important**: No octave shift needed for 12-pitch-class sets when using `startSetFromC=true`, because C is always position 0 and is already in the correct octave.

#### Step 4: Build .kbm File Content

Similar to Section A, but with all 12 positions mapped.

### Example: Maqām Rāst 12-Pitch-Class Set

**Chromatic mapping from C**:
```
Position 0 (C):  degree 0   ← C (rāst)
Position 1 (C#): degree 1   ← C# (zīrgūleh)
Position 2 (D):  degree 2   ← D (dūgāh) ← Tonic for maqām rāst
Position 3 (D#): degree 3   ← D# (kurdī)
Position 4 (E):  degree 4   ← E (segāh)
...all 12 positions mapped
```

**Reference settings**:
- Middle note: MIDI 60 (C4) ← C's MIDI note
- Reference note: MIDI 62 (D4) ← Tonic (D)'s MIDI note
- Reference frequency: 293.66 Hz (dūgāh for maqām rāst)

---

## .kbm File Format Specification

### Structure

```
! Comment lines (metadata)
Map size (12)
First MIDI note (0)
Last MIDI note (127)
Middle note (MIDI note where position 0 maps to)
Reference note (MIDI note that gets reference frequency)
Reference frequency (Hz)
Formal octave (number of degrees in .scl file, e.g., 27)
Mapping entry 0
Mapping entry 1
...
Mapping entry 11
```

### Parameters Explained

#### 1. Map Size: 12
The number of mapping entries (chromatic octave pattern that repeats).

**Always 12** for chromatic keyboard mapping.

#### 2. First MIDI Note: 0
Start of MIDI range (lowest MIDI note).

**Always 0** (covers entire MIDI range).

#### 3. Last MIDI Note: 127
End of MIDI range (highest MIDI note).

**Always 127** (covers entire MIDI range).

#### 4. Middle Note
The MIDI note where position 0 maps to.

**Section A (Simple)**: Lowest degree's MIDI note (with octave shift if needed)
**Section B (12-Pitch-Class)**: C's MIDI note

#### 5. Reference Note
The MIDI note that receives the reference frequency.

**Always**: Maqām/jins tonic's MIDI note

#### 6. Reference Frequency
The frequency in Hz for the reference note.

**Always**: Tonic's frequency from pitch class data

#### 7. Formal Octave
The number of degrees representing one octave in the .scl file.

**Example**: 27 for al-Fārābī 27-tone tuning system

#### 8. Mapping Entries
12 values (degrees or 'x' for unmapped).

**Section A**: Degrees for mapped positions, 'x' for unmapped
**Section B**: All degrees (no 'x')

---

## Critical Octave Shift Logic (Applies to Both Sections)

### The Problem

When the lowest degree has a higher MIDI note than the tonic, Scala requires the middle note to be lower than or equal to the reference note for correct MIDI playback.

### Example: Maqām Bayyāt Shūrī on D3 with al-Fārābī ʿushayrān

**Maqam pitch classes** (tuning system degrees): 11, 14, 17, 22, 24, 5, 6

**Sorted by degree**: 5, 6, 11, 14, 17, 22, 24

**Key pitches**:
- **Lowest degree**: 5 (māhūr, B3, MIDI 59)
- **Tonic (reference)**: degree 11 (dūgāh, D3, MIDI 50)

**The Problem**: B3 (MIDI 59) > D3 (MIDI 50)!

If we set middle note = 59 (B3), it would be higher than reference note 50 (D3), causing incorrect Scala playback.

### The Solution

```typescript
// Step 1: Find lowest degree (after sorting)
const lowestDegreeMapped = mappedPitchClasses[0];

// Step 2: Get tonic's MIDI note (reference note)
const referenceNoteMidi = tonicMapped.midiNote;

// Step 3: Calculate middle note with octave shift if needed
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote = lowestDegreeMapped.midiNote - 12; // Shift down one octave
}
```

**Result for the example**:
- Original lowest degree MIDI: 59 (B3)
- Reference note MIDI: 50 (D3)
- Since 59 > 50: **middleNote = 59 - 12 = 47 (B2)** ✅

### Why This Works

1. **Position 0** starts at the lowest tuning system degree (5)
2. **Degrees ascend** from that position: 5, 6, 11, 14, 17, 22, 24...
3. **Middle note** (MIDI 47 = B2) anchors the entire mapping
4. **Reference note** (MIDI 50 = D3, degree 11) remains mapped and gets its frequency
5. **Scala constraint satisfied**: Middle note (47) < Reference note (50) ✅

### Chromatic Mapping Example

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
4. ✅ Always check: if lowest degree MIDI > tonic MIDI, subtract 12 from middle note
5. ✅ Always extract MIDI notes from `midiNoteDeviation` field

The octave shift only applies when needed, making it work correctly for all cases.

---

## Common Issues and Solutions

### Issue 1: Degrees Not in Ascending Order

**Problem**: Mapping starts from tonic instead of lowest degree.

**Solution**: Sort by degree first, then use lowest degree as position 0.

```typescript
// Correct
mappedPitchClasses.sort((a, b) => a.degree - b.degree);
const lowestDegreeMapped = mappedPitchClasses[0];

// Incorrect
const lowestDegreeMapped = tonicMapped; // Don't use tonic for position 0
```

### Issue 2: Middle Note Higher Than Reference Note

**Problem**: Octave shift not applied when needed.

**Solution**: Always check and apply octave shift.

```typescript
// Correct
let middleNote = lowestDegreeMapped.midiNote;
if (lowestDegreeMapped.midiNote > referenceNoteMidi) {
  middleNote -= 12;
}

// Incorrect
const middleNote = lowestDegreeMapped.midiNote; // Missing octave shift check
```

### Issue 3: Wrong MIDI Note Numbers

**Problem**: Using manual calculation instead of `midiNoteDeviation`.

**Solution**: Always extract from `midiNoteDeviation` field.

```typescript
// Correct
if (pc.midiNoteDeviation) {
  const parts = pc.midiNoteDeviation.split(' ');
  midiNote = parseInt(parts[0], 10);
}

// Incorrect
midiNote = englishNameToMidiNote(pc.englishName); // Missing microtonal info
```

### Issue 4: Reference Note Not in Mapping

**Problem**: Tonic is not included in the chromatic mapping.

**Solution**: Always use tonic as reference note - it's guaranteed to be in the maqām.

```typescript
// Correct
const referenceNote = tonicMapped.midiNote; // Tonic always present

// Incorrect
const referenceNote = tuningSystemStartingNoteMidi; // Might not be in maqām
```

### Issue 5: Manual Octave Corrections

**Problem**: Manually adding octave corrections to degrees.

**Solution**: Let Scala handle octave transposition automatically.

```typescript
// Correct
degree = matchIndex; // Always use base degree (0-26)

// Incorrect
if (pcCents >= 1200) {
  degree = matchIndex + scaleSize; // Don't do this!
}
```

---

## Testing Checklist

When implementing or modifying .kbm exports:

- [ ] Mapping degrees are in ascending order starting from 0
- [ ] Reference note is the maqām/jins tonic
- [ ] Middle note is the lowest degree's MIDI note (or octave-shifted if needed)
- [ ] Octave shift: If lowest degree MIDI > tonic MIDI, middle note = lowest - 12
- [ ] All MIDI notes use `midiNoteDeviation` field
- [ ] .kbm file includes all tuning system metadata
- [ ] .kbm file includes tuning system starting note name and frequency
- [ ] Test with both yegāh and ʿushayrān starting notes
- [ ] Test maqamat where lowest degree > tonic (e.g., Bayyāt Shūrī on ʿushayrān)
- [ ] Verify in Scala software that notes play at correct pitches
- [ ] Check that octaves don't jump unexpectedly

---

## Related Documentation

- [scala-export-overview.md](./scala-export-overview.md) - Choose export type
- [scala-scl-export.md](./scala-scl-export.md) - Scale files
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API for 12-pitch-class sets
- [scala-export-fixes-archive.md](./scala-export-fixes-archive.md) - Historical context

## External Resources

- [Official Scala Keyboard Mapping Specification](https://www.huygens-fokker.org/scala/help.htm#mappings)

---

*Complete guide for creating Scala .kbm keyboard mapping files*
