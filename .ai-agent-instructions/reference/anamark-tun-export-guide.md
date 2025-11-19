# AnaMark .tun File Export Guide

**Purpose**: Complete guide for creating AnaMark tuning files (.tun) from DiArMaqAr tuning systems and maqāmāt.

---

## Table of Contents

- [Introduction](#introduction)
- [When to Use .tun vs Scala Files](#when-to-use-tun-vs-scala-files)
- [Understanding AnaMark .tun Format](#understanding-anamark-tun-format)
- [Export Types for DiArMaqAr](#export-types-for-diarmaqar)
- [Section A: Tuning System .tun Export](#section-a-tuning-system-tun-export)
- [Section B: Maqām .tun Export (12-Pitch-Class Set)](#section-b-maqām-tun-export-12-pitch-class-set)
- [Critical Musicological Considerations](#critical-musicological-considerations)
- [Implementation Reference](#implementation-reference)
- [Testing Checklist](#testing-checklist)

---

## Introduction

The **AnaMark tuning file format** (*.tun) is a widely-supported microtonal format used by many VSTi synthesizers and DAWs. It provides more flexibility than Scala files by combining tuning definition, keyboard mapping, and metadata in a single file.

### Key Advantages over Scala

- **Single file**: Combines scale definition and keyboard mapping (vs .scl + .kbm)
- **Rich metadata**: Extensive database fields (author, date, keywords, etc.)
- **Algorithmic scales**: Formula-based tuning generation via `[Functional Tuning]`
- **Multiple scales per file**: .MSF format allows channel-specific scales
- **Wide software support**: Used by AnaMark, VSTi synthesizers, and many DAWs

### DiArMaqAr Context

DiArMaqAr stores Arabic maqām tuning data as:
- **Cents values** (primary representation)
- **Frequency ratios** (fractions and decimals)
- **Frequencies in Hz** (reference-dependent)
- **Historical metadata** (sources, dating, geographic origin)

The .tun format can represent all these aspects while maintaining compatibility with AnaMark Version 2.00 specifications.

---

## When to Use .tun vs Scala Files

| Use Case | .tun File | Scala (.scl + .kbm) |
|----------|-----------|---------------------|
| **Single file simplicity** | ✅ Preferred | ❌ Requires 2 files |
| **VSTi synthesizer compatibility** | ✅ Widely supported | ⚠️ Varying support |
| **Rich metadata** | ✅ Extensive fields | ⚠️ Comments only |
| **Algorithmic/formula tuning** | ✅ `[Functional Tuning]` | ❌ Not supported |
| **Multiple scales (MIDI channels)** | ✅ .MSF format | ❌ Not supported |
| **Academic analysis** | ⚠️ Software-specific | ✅ Scala software |
| **Historical documentation** | ✅ Database fields | ⚠️ Limited |
| **Keyboard mapping control** | ✅ `[Mapping]` section | ✅ .kbm file |

**Recommendation**: Export **both formats** for maximum compatibility and use case coverage.

---

## Understanding AnaMark .tun Format

### File Structure

```
[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\www.mark-henning.de\eternity\tuningspecs.html"

[Info]
Name = "Scale name"
ID = "scale_id"
; ... metadata ...

[Exact Tuning]
BaseFreq = 8.175798915643707
note 0 = 0.00
note 1 = 90.22
; ... note tunings ...
note 127 = 12700.00

[Functional Tuning]
InitEqual = (69,440)
note 0 = ""
; ... formula definitions ...

[Mapping]
Keyboard 0 = 0
; ... keyboard mapping ...

[Scale End]
```

### Section Priority

**Tuning sections** (from highest to lowest priority):
1. **`[Functional Tuning]`** - Overwrites all other tuning sections
2. **`[Exact Tuning]`** - Overwrites `[Tuning]`
3. **`[Tuning]`** - Lowest priority (quantized cents, version 0 compatibility)

**For DiArMaqAr**: Use `[Exact Tuning]` for precise cents values from our tuning systems.

### Key Concepts

**Scale note vs MIDI note**:
- **Scale note**: Abstract note in the tuning definition (0-127)
- **MIDI note**: Physical MIDI keyboard key (0-127)
- **`[Mapping]`** section maps MIDI notes → scale notes

**BaseFreq**:
- Reference frequency in Hz for scale note 0
- Default: `8.175798915643707` Hz (corresponds to A=440 Hz, note 69 in 12-EDO)
- **For DiArMaqAr**: Calculate based on tuning system starting note frequency

**Auto-completion** (periodic scales):
- Define notes 0 to H (highest defined note)
- Define note H's cents value as period P
- All notes > H auto-filled: `f(i) = f(i-H) + P`
- **For DiArMaqAr**: Define one octave, let period = 1200 cents

---

## Export Types for DiArMaqAr

DiArMaqAr can export two types of .tun files:

### Type 1: Tuning System Export

**What**: Export entire tuning system pitch classes (e.g., al-Fārābī 27-tone, al-Kindī 12-tone)

**Use Cases**:
- Reference documentation
- Academic research
- Theoretical analysis
- Basis for manual maqām composition

**Mapping**: Direct 1:1 mapping (MIDI note N → scale note N)

**Example**: `al-Farabi-(950g)_yegah_octave1.tun`

---

### Type 2: Maqām 12-Pitch-Class Set Export

**What**: Export maqām's 12-pitch-class chromatic set (maqām notes + tuning system fillers)

**Use Cases**:
- MIDI keyboard composition
- DAW integration with chromatic access
- Full chromatic transposition
- VSTi synthesizer microtonal performance

**Mapping**: Chromatic mapping starting from C (matches Scala 12-pitch-class export)

**Example**: `maqam_bayyat_shuri_12-tone-chromatic-set_al-Farabi-(950g).tun`

---

## Section A: Tuning System .tun Export

### When to Use

Export a complete tuning system (e.g., al-Fārābī 27-tone, al-Kindī 12-tone) for reference, analysis, or as a basis for composition.

### Algorithm

#### Step 1: Get Tuning System Pitch Classes

```typescript
const tuningSystem = await TuningSystem.getById(tuningSystemId);
const pitchClasses = getTuningSystemPitchClasses(
  tuningSystem,
  startingNote,
  referenceFrequency
);
```

**CRITICAL**: Use `referenceFrequency` parameter (default from tuning system metadata).

#### Step 2: Build `[Scale Begin]` Section

```
[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\www.mark-henning.de\eternity\tuningspecs.html"
```

**Required for AnaMark Version 2.00 compatibility**.

#### Step 3: Build `[Info]` Section

```typescript
const header = `[Info]
Name = "${tuningSystem.getName()} (starting note: ${startingNoteName})"
ID = "${tuningSystemId}_${startingNoteIdName}_octave1"
Filename = "${tuningSystemId}_${startingNoteIdName}_octave1"
Author = "${getAuthorsFromSources(tuningSystem.getSources())}"
Date = "${getDateFromTuningSystem(tuningSystem)}"
Geography = "${getGeographyFromTuningSystem(tuningSystem)}"
Instrument = "Oud, Qanun, Nay"
Description = "Historical Arabic tuning system from the Digital Arabic Maqām Archive (DiArMaqAr). Starting note: ${startingNoteName} (${startingNoteIPN}${startingNoteOctave}). Reference frequency: ${startingNoteFrequency} Hz."
Keyword = "Arabic Music"
Keyword = "Maqam"
Keyword = "Microtonal"
Keyword = "Historical Tuning"
Keyword = "${tuningSystem.getId()}"
Comments = "Generated by the Digital Arabic Maqām Archive (DiArMaqAr)\\nMore information: https://diarmaqar.netlify.app"
`;
```

**Key Points**:
- **Name**: Human-readable tuning system name + starting note
- **ID**: URL-safe identifier (no spaces, special chars)
- **Filename**: Suggested filename without extension
- **Author**: Extract from `Source` metadata
- **Date**: ISO 8601 format (YYYY-MM-DD)
- **Geography**: Historical/cultural context
- **Keyword**: Multiple entries allowed (repeating key)
- **Comments**: Use `\n` for line breaks (C-style escaping)

#### Step 4: Build `[Exact Tuning]` Section

```typescript
// Calculate BaseFreq for scale note 0
const firstPitchClass = pitchClasses[0];
const baseFrequency = parseFloat(firstPitchClass.frequency);

let tuningSection = `[Exact Tuning]
BaseFreq = ${baseFrequency.toFixed(15)}
`;

// Add all pitch classes (0-127)
for (let midiNote = 0; midiNote <= 127; midiNote++) {
  const octaveOffset = Math.floor(midiNote / pitchClasses.length);
  const indexInScale = midiNote % pitchClasses.length;
  const pc = pitchClasses[indexInScale];

  const cents = parseFloat(pc.cents) + (octaveOffset * 1200);

  tuningSection += `note ${midiNote} = ${cents.toFixed(15)}\n`;
}
```

**Key Points**:
- **BaseFreq**: Starting note frequency (scale note 0)
- **Scientific notation**: Use `.toFixed(15)` for precision
- **Octave wrapping**: Use modulo to repeat scale across MIDI range
- **All 128 notes**: Define notes 0-127 (MIDI range)

**Auto-completion alternative** (periodic scales):
```typescript
// Define one octave only, let auto-completion handle the rest
let tuningSection = `[Exact Tuning]
BaseFreq = ${baseFrequency.toFixed(15)}
`;

for (let i = 0; i < pitchClasses.length; i++) {
  const pc = pitchClasses[i];
  const cents = parseFloat(pc.cents);
  tuningSection += `note ${i} = ${cents.toFixed(15)}\n`;
}

// Define period (octave)
const octaveCents = 1200.0;
tuningSection += `note ${pitchClasses.length} = ${octaveCents.toFixed(15)}\n`;
```

**Auto-completion** will fill notes > pitchClasses.length using the period.

#### Step 5: Build `[Mapping]` Section (Optional)

For tuning system exports, use **direct 1:1 mapping**:

```
[Mapping]
Keyboard 0 = 0
Keyboard 1 = 1
Keyboard 2 = 2
; ... continue for all 128 notes ...
Keyboard 127 = 127
```

**Or rely on default**: If `[Mapping]` section is omitted, default is 1:1 mapping.

#### Step 6: Close with `[Scale End]`

```
[Scale End]
```

### Example Output (al-Fārābī 27-Tone)

```
[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\www.mark-henning.de\eternity\tuningspecs.html"

[Info]
Name = "al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone (starting note: yegāh)"
ID = "al-Farabi-(950g)_yegah_octave1"
Filename = "al-Farabi-(950g)_yegah_octave1"
Author = "al-Fārābī (Abū Naṣr Muḥammad ibn Muḥammad al-Fārābī)"
Date = "0950-01-01"
Geography = "Baghdad, Iraq"
Instrument = "Oud"
Description = "Historical Arabic tuning system from al-Fārābī's Kitāb al-Mūsīqī al-Kabīr (Grand Book of Music). 27-tone tuning system based on oud fingerboard divisions. Starting note: yegāh (G2). Reference frequency: 97.998 Hz."
Keyword = "Arabic Music"
Keyword = "Maqam"
Keyword = "Microtonal"
Keyword = "Historical Tuning"
Keyword = "al-Farabi"
Keyword = "10th Century"
Comments = "Generated by the Digital Arabic Maqām Archive (DiArMaqAr)\nMore information: https://diarmaqar.netlify.app\nSource: Kitāb al-Mūsīqī al-Kabīr (Grand Book of Music), c. 950"

[Exact Tuning]
BaseFreq = 97.998585937500000
note 0 = 0.000000000000000
note 1 = 90.224914400000000
note 2 = 98.954681200000000
note 3 = 182.404400000000000
note 4 = 203.910000000000000
; ... continues for all 27 notes in octave 1 ...
note 26 = 1109.775000000000000
note 27 = 1200.000000000000000
note 28 = 1290.224914400000000
; ... auto-completion or explicit definition continues to note 127 ...
note 127 = 5690.224914400000000

[Scale End]
```

### File Naming

```
{tuningSystemId}_{startingNoteIdName}_octave1.tun
```

**Example**: `al-Farabi-(950g)_yegah_octave1.tun`

---

## Section B: Maqām .tun Export (12-Pitch-Class Set)

### When to Use

Export a maqām's 12-pitch-class chromatic set for full chromatic MIDI keyboard mapping and composition.

### Prerequisites

Get the 12-pitch-class set from the API or function:

```typescript
// Option 1: Use API
const response = await fetch(
  `/api/maqamat/classification/12-pitch-class-sets?setId=maqam_rast_set&startSetFromC=true&pitchClassDataType=all`
);
const data = await response.json();
const pitchClasses = data.sets[0].pitchClassSet.pitchClasses;
const compatibleMaqamat = data.sets[0].compatibleMaqamat;

// Option 2: Use function directly
const pitchClassSet = create12PitchClassSet(
  maqamTransposition,
  alKindiTuningSystem,
  alKindiStartingNote
);
// Then rotate to start from C (see 12-pitch-class-sets-api.md)
```

**CRITICAL**: Always use `startSetFromC=true` to get pitch classes starting from C (IPN reference).

### Algorithm

#### Step 1: Get 12-Pitch-Class Set Starting from C

The pitch classes must already be:
- ✅ Rotated to start from C (not maqām tonic)
- ✅ In chromatic ascending order (C, C#, D, ..., B)
- ✅ With octave-shifted values for notes before tonic

**Do NOT re-sort or re-order** - the API/function already provides correct ordering.

#### Step 2: Build `[Scale Begin]` Section

```
[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\www.mark-henning.de\eternity\tuningspecs.html"
```

#### Step 3: Build `[Info]` Section

```typescript
// Get first compatible maqām for source info
const sourceMaqam = compatibleMaqamat[0];
const tonicInfo = sourceMaqam.tonic;

const header = `[Info]
Name = "${maqamDisplayName} - 12-tone chromatic set (${tuningSystemName})"
ID = "${maqamIdName}_12_tone_chromatic_set_${tuningSystemId}"
Filename = "${maqamIdName}_12_tone_chromatic_set_${tuningSystemId}"
Author = "${getAuthorsFromMaqamSources(maqamData)}"
Date = "${getDateFromMaqam(maqamData)}"
Geography = "${getGeographyFromMaqam(maqamData)}"
Instrument = "Oud, Qanun, Nay, MIDI Keyboard"
Description = "12-pitch-class chromatic set for ${maqamDisplayName} from the Digital Arabic Maqām Archive (DiArMaqAr). Source maqām tonic: ${tonicInfo.noteNameDisplayName} (${tonicInfo.ipnReferenceNoteName}). Source tuning system: ${tuningSystemDescription}. Scala file 1/1 (0 cents) reference frequency: ${cReferenceFrequency} Hz (C${cOctave}). Compatible maqāmāt in this set: ${compatibleCount} total."
Keyword = "Arabic Music"
Keyword = "Maqam"
Keyword = "Microtonal"
Keyword = "${maqamIdName}"
Keyword = "12-Pitch-Class Set"
Keyword = "Chromatic"
Comments = "Generated by the Digital Arabic Maqām Archive (DiArMaqAr)\\nMore information: ${currentUrl}\\n\\nCompatible maqāmāt in this set (${compatibleCount} total):\\n${formatCompatibleMaqamat(compatibleMaqamat)}"
`;
```

**Formatting Rules**:
- **Capitalization**: Sentence case for labels, lowercase for maqām names and note names
- **Reference Frequency Label**: "Scala file 1/1 (0 cents) reference frequency:" to clarify this is for the 1/1 ratio
- **Comments**: Include compatible maqāmāt list with tonics and positions

#### Step 4: Build `[Exact Tuning]` Section

```typescript
// First pitch class (C) provides BaseFreq
const cPitchClass = pitchClasses[0]; // C
const baseFrequency = parseFloat(cPitchClass.frequency);

let tuningSection = `[Exact Tuning]
BaseFreq = ${baseFrequency.toFixed(15)}
`;

// Add all 12 chromatic pitch classes for one octave
for (let i = 0; i < pitchClasses.length; i++) {
  const pc = pitchClasses[i];
  const cents = parseFloat(pc.cents);

  // Cents relative to C (first pitch class)
  const relativeCents = cents - parseFloat(pitchClasses[0].cents);

  tuningSection += `note ${i} = ${relativeCents.toFixed(15)}\n`;
}

// Define octave period (1200 cents)
tuningSection += `note 12 = 1200.000000000000000\n`;
```

**Key Points**:
- **BaseFreq**: C's frequency (first pitch class)
- **Relative cents**: All pitch classes relative to C
- **Period**: Note 12 = 1200 cents (octave)
- **Auto-completion**: Notes 13-127 auto-filled using period

#### Step 5: Build `[Mapping]` Section (Optional)

For 12-pitch-class sets, mapping is **optional** because:
- All 12 chromatic positions are defined
- Default 1:1 mapping works correctly
- Period auto-completion handles octaves

**If explicit mapping desired**:
```
[Mapping]
LoopSize = 12
Keyboard 0 = 0
Keyboard 1 = 1
; ... continue for 12 notes ...
Keyboard 11 = 11
; Notes 12-127 auto-mapped using LoopSize
```

**Or omit entirely** and rely on defaults.

#### Step 6: Close with `[Scale End]`

```
[Scale End]
```

### Example Output (Maqām Bayyāt Shūrī)

```
[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\www.mark-henning.de\eternity\tuningspecs.html"

[Info]
Name = "maqām bayyāt shūrī - 12-tone chromatic set (al-Fārābī (950g) + al-Kindī (874))"
ID = "maqam_bayyat_shuri_12_tone_chromatic_set_al-Farabi-(950g)"
Filename = "maqam_bayyat_shuri_12_tone_chromatic_set_al-Farabi-(950g)"
Author = "Traditional Arabic Maqām"
Date = "1946-01-01"
Geography = "Middle East, North Africa"
Instrument = "Oud, Qanun, Nay, MIDI Keyboard"
Description = "12-pitch-class chromatic set for maqām bayyāt shūrī from the Digital Arabic Maqām Archive (DiArMaqAr). Source maqām tonic: dūgāh (D). Source tuning system: al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone + al-Kindī (874) 12-Tone (starting note: ʿushayrān, reference frequency: 110.00 Hz). Scala file 1/1 (0 cents) reference frequency: 130.37 Hz (C3). Compatible maqāmāt in this set: 13 total."
Keyword = "Arabic Music"
Keyword = "Maqam"
Keyword = "Microtonal"
Keyword = "maqam_bayyat_shuri"
Keyword = "12-Pitch-Class Set"
Keyword = "Chromatic"
Comments = "Generated by the Digital Arabic Maqām Archive (DiArMaqAr)\nMore information: https://diarmaqar.netlify.app/maqam/bayyat-shuri\n\nCompatible maqāmāt in this set (13 total):\n- maqām sūznāk (Tonic: C (rāst), position 0)\n- maqām bayyāt shūrī (Tonic: D (dūgāh), position 2)\n- maqām ḥusaynī (Tonic: E (segāh), position 4)\n..."

[Exact Tuning]
BaseFreq = 130.370000000000000
note 0 = 0.000000000000000
note 1 = 113.685000000000000
note 2 = 203.910000000000000
note 3 = 294.135000000000000
note 4 = 348.733000000000000
note 5 = 498.045000000000000
note 6 = 611.730000000000000
note 7 = 701.955000000000000
note 8 = 800.910000000000000
note 9 = 905.865000000000000
note 10 = 996.090000000000000
note 11 = 1109.775000000000000
note 12 = 1200.000000000000000

[Scale End]
```

### File Naming

```
{maqamIdName}_12_tone_chromatic_set_{tuningSystemId}.tun
```

**Example**: `maqam_bayyat_shuri_12_tone_chromatic_set_al-Farabi-(950g).tun`

---

## Critical Musicological Considerations

### 1. Octave-Repeating vs Non-Octave-Repeating

**Maqāmāt with >7 pitch classes span multiple octaves** and cannot be fully contained in a single octave.

**For .tun exports**:
- **Tuning System exports**: Already include multiple octaves (auto-completion)
- **12-Pitch-Class Set exports**: Designed to fit chromatic 12-tone keyboard (one octave)

**Non-octave-repeating maqāmāt** (e.g., Maqām Bayyātī ʿUshayrān with 11 pitch classes) are handled via:
- **12-pitch-class set algorithm**: Selects optimal octave for each pitch class
- **Period auto-completion**: Repeats the 12-tone pattern across octaves

### 2. Asymmetric Melodic Paths (ṣuʿūd vs hubūṭ)

Some maqāmāt have **different ascending and descending sequences**.

**For .tun exports**:
- **Static tuning format**: .tun files define pitch availability, NOT melodic direction
- **Export both directions**: Consider creating separate .tun files for ascending vs descending if they use fundamentally different pitch classes
- **Or use combined set**: Include all pitch classes from both directions

**Example**: Maqām Bestenegār
- **Ascending**: Ends on muḥayyar (D4)
- **Descending**: Begins from shahnāz (C#4)
- **Solution**: Include both D4 and C#4 in the tuning

### 3. Tuning System Starting Notes

**Different starting notes represent different theoretical frameworks**, NOT simple transposition.

**For .tun exports**:
- **Metadata clarity**: Always specify starting note in `Name`, `Description`, and `Filename`
- **BaseFreq calculation**: Must account for starting note frequency
- **Note name mapping**: Preserve note name associations from tuning system

### 4. Reference Frequency (BaseFreq) Calculation

**BaseFreq MUST match scale note 0's actual frequency**.

**For Tuning System exports**:
```typescript
// Scale note 0 = first pitch class
const baseFrequency = parseFloat(pitchClasses[0].frequency);
```

**For 12-Pitch-Class Set exports**:
```typescript
// Scale note 0 = C (first pitch class after rotation)
const cPitchClass = pitchClasses[0]; // Already rotated to start from C
const baseFrequency = parseFloat(cPitchClass.frequency);
```

**Why this matters**: AnaMark calculates all frequencies relative to BaseFreq using the formula:
```
f(x) = BaseFreq * 2^(cents(x) / 1200)
```

If BaseFreq is incorrect, ALL frequencies will be wrong.

### 5. Cents Precision

**Use high precision** (15 decimal places) for scientific notation to preserve microtonal accuracy:

```typescript
// ✅ Correct
note 5 = 498.044999134612500

// ❌ Wrong
note 5 = 498.04  // Lost precision
```

**Why**: Arabic maqām theory uses intervals that differ by fractions of cents. Rounding errors accumulate across octaves.

### 6. MIDI Note Range (0-127)

**All .tun files must define all 128 MIDI notes** (0-127).

**Options**:
1. **Explicit definition**: Define all 128 notes manually
2. **Auto-completion**: Define one period, let AnaMark auto-fill

**Recommended**: Use auto-completion for periodic scales (octave = 1200 cents).

### 7. Metadata Richness

**Leverage .tun's extensive metadata** to preserve cultural and historical context:

**Essential fields**:
- **Name**: Human-readable, includes context
- **ID**: URL-safe identifier
- **Author**: Historical attribution
- **Date**: ISO 8601 (YYYY-MM-DD)
- **Geography**: Cultural/geographic origin
- **Instrument**: Traditional instruments
- **Description**: Full context and reference
- **Keyword**: Multiple tags for categorization
- **Comments**: Additional notes, URLs, sources

**Why this matters**: Arabic maqām theory has rich historical and cultural context that should be preserved in exports.

---

## Implementation Reference

### Function Structure

```typescript
/**
 * Export tuning system to AnaMark .tun format
 */
export function exportTuningSystemToTun(
  tuningSystem: TuningSystem,
  startingNote: string,
  referenceFrequency?: number
): string {
  // 1. Get pitch classes
  const pitchClasses = getTuningSystemPitchClasses(
    tuningSystem,
    startingNote,
    referenceFrequency
  );

  // 2. Build sections
  const scaleBegin = buildScaleBeginSection();
  const info = buildInfoSection(tuningSystem, startingNote, pitchClasses);
  const exactTuning = buildExactTuningSection(pitchClasses);
  const scaleEnd = buildScaleEndSection();

  // 3. Combine
  return [scaleBegin, info, exactTuning, scaleEnd].join('\n\n');
}

/**
 * Export maqām 12-pitch-class set to AnaMark .tun format
 */
export function exportMaqamTo12ToneTun(
  maqamInput: Maqam | MaqamData,
  tuningSystem: TuningSystem,
  startingNote: string,
  alKindiTuningSystem: TuningSystem,
  alKindiStartingNote: string,
  currentUrl?: string
): string | null {
  // 1. Get 12-pitch-class set (uses same algorithm as API)
  const { pitchClasses, compatibleMaqamat } = get12PitchClassSet(
    maqamInput,
    tuningSystem,
    startingNote,
    alKindiTuningSystem,
    alKindiStartingNote,
    true // startSetFromC
  );

  if (!pitchClasses || pitchClasses.length !== 12) {
    return null; // Not a source for any 12-pitch-class set
  }

  // 2. Build sections
  const scaleBegin = buildScaleBeginSection();
  const info = buildMaqamInfoSection(
    maqamInput,
    tuningSystem,
    compatibleMaqamat,
    pitchClasses,
    currentUrl
  );
  const exactTuning = build12ToneExactTuningSection(pitchClasses);
  const scaleEnd = buildScaleEndSection();

  // 3. Combine
  return [scaleBegin, info, exactTuning, scaleEnd].join('\n\n');
}
```

### Helper Functions

```typescript
function buildScaleBeginSection(): string {
  return `[Scale Begin]
Format = "AnaMark-TUN"
FormatVersion = "200"
FormatSpecs = "http:\\\\www.mark-henning.de\\\\eternity\\\\tuningspecs.html"`;
}

function buildScaleEndSection(): string {
  return '[Scale End]';
}

function buildExactTuningSection(pitchClasses: PitchClass[]): string {
  const baseFrequency = parseFloat(pitchClasses[0].frequency);

  let section = `[Exact Tuning]
BaseFreq = ${baseFrequency.toFixed(15)}
`;

  // Define one octave
  for (let i = 0; i < pitchClasses.length; i++) {
    const pc = pitchClasses[i];
    const cents = parseFloat(pc.cents);
    section += `note ${i} = ${cents.toFixed(15)}\n`;
  }

  // Define period (octave)
  section += `note ${pitchClasses.length} = 1200.000000000000000\n`;

  return section;
}

function build12ToneExactTuningSection(pitchClasses: PitchClass[]): string {
  const baseFrequency = parseFloat(pitchClasses[0].frequency);
  const baseCents = parseFloat(pitchClasses[0].cents);

  let section = `[Exact Tuning]
BaseFreq = ${baseFrequency.toFixed(15)}
`;

  // Define 12 chromatic notes (relative to C)
  for (let i = 0; i < 12; i++) {
    const pc = pitchClasses[i];
    const cents = parseFloat(pc.cents);
    const relativeCents = cents - baseCents;

    section += `note ${i} = ${relativeCents.toFixed(15)}\n`;
  }

  // Define period (octave)
  section += `note 12 = 1200.000000000000000\n`;

  return section;
}

function escapeStringForTun(str: string): string {
  // C-style escape sequences
  return str
    .replace(/\\/g, '\\\\')  // Backslash
    .replace(/\n/g, '\\n')   // Newline
    .replace(/\t/g, '\\t')   // Tab
    .replace(/"/g, '\\"');   // Quote
}
```

### File Naming Utility

```typescript
function sanitizeTunFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '-')  // Replace invalid chars
    .replace(/\s+/g, '_')            // Replace spaces with underscores
    .replace(/-+/g, '-')             // Collapse multiple dashes
    .replace(/_+/g, '_')             // Collapse multiple underscores
    .substring(0, 255);              // Limit length
}
```

---

## Testing Checklist

When implementing or testing .tun exports:

### File Structure Validation
- [ ] All .tun files start with `[Scale Begin]` section
- [ ] All .tun files end with `[Scale End]` section
- [ ] `Format = "AnaMark-TUN"` present
- [ ] `FormatVersion = "200"` present
- [ ] `FormatSpecs` URL present

### Metadata Validation
- [ ] `[Info]` section present and populated
- [ ] `Name` field contains tuning/maqām name
- [ ] `ID` field is URL-safe (no spaces, special chars)
- [ ] `Filename` field matches actual filename (without .tun extension)
- [ ] `Author` field populated from sources
- [ ] `Date` field in ISO 8601 format (YYYY-MM-DD)
- [ ] `Description` field includes starting note and reference frequency
- [ ] `Keyword` fields include relevant tags
- [ ] `Comments` field uses `\n` for line breaks

### Tuning Data Validation
- [ ] `[Exact Tuning]` section present
- [ ] `BaseFreq` matches first pitch class frequency
- [ ] All cents values use high precision (15 decimals)
- [ ] Notes 0-127 defined (explicit or auto-completion)
- [ ] Period defined correctly for auto-completion
- [ ] Cents values in ascending order within octave

### 12-Pitch-Class Set Validation (if applicable)
- [ ] Pitch classes start from C (not maqām tonic)
- [ ] Exactly 12 pitch classes defined for one octave
- [ ] C pitch class at position 0
- [ ] Cents values relative to C
- [ ] Compatible maqāmāt listed in comments
- [ ] Tonic information for source maqām included

### Musicological Validation
- [ ] Starting note specified in metadata
- [ ] Reference frequency matches tuning system
- [ ] Note names preserved from tuning system
- [ ] Cultural/historical context included
- [ ] Geographic origin specified
- [ ] Traditional instruments listed

### Software Compatibility Testing
- [ ] Test import in AnaMark synthesizer
- [ ] Test import in common VSTi synthesizers
- [ ] Verify correct pitch playback
- [ ] Verify keyboard mapping (if applicable)
- [ ] Check for error messages or warnings

### Cross-Format Validation
- [ ] Compare .tun cents values with .scl exports
- [ ] Verify frequencies match across formats
- [ ] Check that 12-pitch-class sets match between .tun and .scl
- [ ] Validate metadata consistency

---

## Related Documentation

- [scala-export-overview.md](./scala-export-overview.md) - Scala export types and decision tree
- [scala-scl-export.md](./scala-scl-export.md) - Scala .scl file format guide
- [scala-kbm-export.md](./scala-kbm-export.md) - Scala .kbm keyboard mapping guide
- [12-pitch-class-sets-api.md](./12-pitch-class-sets-api.md) - API for 12-pitch-class sets
- [12-pitch-class-sets-algorithm.md](./12-pitch-class-sets-algorithm.md) - Algorithm details

## External Resources

- [AnaMark Tuning File Format Specification (PDF)](http://www.mark-henning.de/eternity/tuningspecs.html)
- [AnaMark TUN-Tools](http://www.mark-henning.de/eternity/tuningspecs.html) - Free conversion tools
- [C++ Source Code for Reading/Writing .tun Files](http://www.mark-henning.de/eternity/tuningspecs.html)

---

*Complete guide for creating AnaMark .tun files from DiArMaqAr tuning data*
