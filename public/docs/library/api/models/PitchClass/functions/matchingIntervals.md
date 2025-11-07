---
url: /docs/library/api/models/PitchClass/functions/matchingIntervals.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/PitchClass](../README.md) / matchingIntervals

# Function: matchingIntervals()

> **matchingIntervals**(`firstInterval`, `secondInterval`, `centsTolerance`): `boolean`

Defined in: [models/PitchClass.ts:169](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L169)

Determines if two intervals are equivalent within a specified tolerance.
Uses different comparison methods based on the original value type:

* For fraction and decimal ratio types: Exact string comparison
* For other types: Cents comparison within tolerance

## Parameters

### firstInterval

[`PitchClassInterval`](../interfaces/PitchClassInterval.md)

First interval to compare

### secondInterval

[`PitchClassInterval`](../interfaces/PitchClassInterval.md)

Second interval to compare

### centsTolerance

`number` = `5`

Tolerance in cents for comparison (default: 5)

## Returns

`boolean`

true if the intervals match within the specified tolerance, false otherwise
