---
url: /docs/library/api/models/PitchClass/functions/matchingListOfIntervals.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/PitchClass](../README.md) / matchingListOfIntervals

# Function: matchingListOfIntervals()

> **matchingListOfIntervals**(`firstIntervals`, `secondIntervals`, `centsTolerance`): `boolean`

Defined in: [models/PitchClass.ts:190](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L190)

Compares two arrays of intervals to determine if they represent the same sequence.
This is useful for comparing interval patterns in scales, modes, or melodic sequences.

Requirements:

* Arrays must have the same length
* Each corresponding pair of intervals must match according to matchingIntervals

## Parameters

### firstIntervals

[`PitchClassInterval`](../interfaces/PitchClassInterval.md)\[]

Array of intervals to compare

### secondIntervals

[`PitchClassInterval`](../interfaces/PitchClassInterval.md)\[]

Array of intervals to compare against

### centsTolerance

`number` = `5`

Tolerance in cents for individual interval comparison (default: 5)

## Returns

`boolean`

true if all intervals in both arrays match in sequence, false otherwise
