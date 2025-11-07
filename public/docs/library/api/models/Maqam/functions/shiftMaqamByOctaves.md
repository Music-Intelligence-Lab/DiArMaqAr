---
url: /docs/library/api/models/Maqam/functions/shiftMaqamByOctaves.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / shiftMaqamByOctaves

# Function: shiftMaqamByOctaves()

> **shiftMaqamByOctaves**(`allPitchClasses`, `maqam`, `octaveShift`): [`Maqam`](../interfaces/Maqam.md) | `null`

Defined in: [models/Maqam.ts:583](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L583)

Shifts a maqam to a different octave while maintaining intervallic relationships.

## Parameters

### allPitchClasses

[`default`](../../PitchClass/interfaces/default.md)\[]

All available pitch classes in the tuning system

### maqam

[`Maqam`](../interfaces/Maqam.md)

The maqam to shift

### octaveShift

`number`

Number of octaves to shift (positive = up, negative = down)

## Returns

[`Maqam`](../interfaces/Maqam.md) | `null`

New Maqam instance shifted by the specified number of octaves
