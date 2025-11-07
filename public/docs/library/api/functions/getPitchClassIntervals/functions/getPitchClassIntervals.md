---
url: >-
  /docs/library/api/functions/getPitchClassIntervals/functions/getPitchClassIntervals.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getPitchClassIntervals](../README.md) / getPitchClassIntervals

# Function: getPitchClassIntervals()

> **getPitchClassIntervals**(`pitchClasses`): [`PitchClassInterval`](../../../models/PitchClass/interfaces/PitchClassInterval.md)\[]

Defined in: [functions/getPitchClassIntervals.ts:12](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getPitchClassIntervals.ts#L12)

Calculates intervals between consecutive pitch classes.

Fundamental utility for extracting intervallic patterns from pitch sequences,
forming the basis for all transposition analysis.

## Parameters

### pitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Array of pitch classes to calculate intervals for

## Returns

[`PitchClassInterval`](../../../models/PitchClass/interfaces/PitchClassInterval.md)\[]

Array of intervals between consecutive pitch classes
