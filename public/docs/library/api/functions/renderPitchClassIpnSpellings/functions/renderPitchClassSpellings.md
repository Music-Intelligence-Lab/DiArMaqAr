---
url: >-
  /docs/library/api/functions/renderPitchClassIpnSpellings/functions/renderPitchClassSpellings.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/renderPitchClassIpnSpellings](../README.md) / renderPitchClassSpellings

# Function: renderPitchClassSpellings()

> **renderPitchClassSpellings**(`pitchClasses`, `ascending`): [`default`](../../../models/PitchClass/interfaces/default.md)\[]

Defined in: [functions/renderPitchClassIpnSpellings.ts:31](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/renderPitchClassIpnSpellings.ts#L31)

Renders pitch classes with sequential International Pitch Notation name spellings for melodic sequences.

This function ensures Western music notation convention where scales use consecutive
letters (D-E-F-G-A-B-C-D) by resolving enharmonic equivalents appropriately.

**Context-Specific Function:**

* Use this for jins and maqam melodic sequences
* NOT for general tuning system pitch classes (which may have letter collisions)

**Data Integrity:**

* Updates both `englishName` and `referenceNoteName` to use sequential spellings
* Ensures cents deviation and MIDI note deviation use correct reference notes
* Critical for display, export, and API endpoints

## Parameters

### pitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Array of pitch classes from a melodic sequence (jins or maqam)

### ascending

`boolean` = `true`

Direction of the sequence (true for ascending, false for descending). Defaults to true.

## Returns

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

New array of pitch classes with sequential English name spellings

## Example

```typescript
// For a maqam starting on D with intervallic pattern that includes Ab
const maqamPitchClasses = maqam.getPitchClasses();
const rendered = renderPitchClassSpellings(maqamPitchClasses);
// Result: D, Eb, F, G#, A, Bb, C#, D (sequential letters, not Ab)
```
