---
url: /docs/library/api/functions/extendSelectedPitchClasses/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/extendSelectedPitchClasses](../README.md) / default

# Function: default()

> **default**(`allPitchClasses`, `selectedPitchClasses`): [`default`](../../../models/PitchClass/interfaces/default.md)\[]

Defined in: [functions/extendSelectedPitchClasses.ts:19](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/extendSelectedPitchClasses.ts#L19)

Extends a selection of pitch classes to include related pitches across octaves.

This function analyzes the selected pitch classes and accurately extends
the selection to include equivalent pitches in other octaves based on
frequency relationships. It's used to create comprehensive pitch collections
when working with scales that span multiple octaves.

The algorithm determines a frequency cutoff point and then includes matching
pitch class indices from appropriate octaves, maintaining the harmonic
relationships while extending the available pitch range.

## Parameters

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete array of all available pitch classes

### selectedPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Currently selected pitch classes to extend

## Returns

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Extended array of pitch classes including related octave equivalents
