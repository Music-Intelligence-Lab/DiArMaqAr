---
url: /docs/library/api/models/Jins/functions/shiftJinsByOctaves.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Jins](../README.md) / shiftJinsByOctaves

# Function: shiftJinsByOctaves()

> **shiftJinsByOctaves**(`allPitchClasses`, `jins`, `octaveShift`): [`Jins`](../interfaces/Jins.md) | `null`

Defined in: [models/Jins.ts:360](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L360)

Shifts a jins to a different octave while maintaining intervallic relationships.

## Parameters

### allPitchClasses

[`default`](../../PitchClass/interfaces/default.md)\[]

All available pitch classes in the tuning system

### jins

[`Jins`](../interfaces/Jins.md)

The jins to shift

### octaveShift

`number`

Number of octaves to shift (positive = up, negative = down)

## Returns

[`Jins`](../interfaces/Jins.md) | `null`

New Jins instance shifted by the specified number of octaves
