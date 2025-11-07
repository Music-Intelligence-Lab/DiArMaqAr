---
url: /docs/library/api/models/PitchClass/functions/calculateInterval.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/PitchClass](../README.md) / calculateInterval

# Function: calculateInterval()

> **calculateInterval**(`firstPitchClass`, `secondPitchClass`): [`PitchClassInterval`](../interfaces/PitchClassInterval.md)

Defined in: [models/PitchClass.ts:129](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L129)

Calculates the interval between two pitch classes in all measurement systems.
This function computes the difference between two pitch classes across multiple
representation formats, enabling comprehensive interval analysis.

## Parameters

### firstPitchClass

[`default`](../interfaces/default.md)

The starting pitch class

### secondPitchClass

[`default`](../interfaces/default.md)

The ending pitch class

## Returns

[`PitchClassInterval`](../interfaces/PitchClassInterval.md)

A PitchClassInterval object containing the interval measurements in all supported formats
