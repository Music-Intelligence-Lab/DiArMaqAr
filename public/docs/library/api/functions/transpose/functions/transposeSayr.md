---
url: /docs/library/api/functions/transpose/functions/transposeSayr.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/transpose](../README.md) / transposeSayr

# Function: transposeSayr()

> **transposeSayr**(`sayr`, `allPitchClasses`, `maqamData`, `maqam`): `object`

Defined in: [functions/transpose.ts:530](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/transpose.ts#L530)

Transposes a sayr by shifting its note names.

Calculates the shift amount by comparing the first note of the source maqām data
with the first note of the target maqām, then applies this shift to all note
references in the sayr. Handles different stop types appropriately and flags
when transposed notes fall outside the available tuning system range.

## Parameters

### sayr

[`Sayr`](../../../models/Maqam/interfaces/Sayr.md)

The sayr structure to transpose

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Available pitch classes in the tuning system

### maqamData

[`default`](../../../models/Maqam/classes/default.md)

Source maqām data for calculating shift amount

### maqam

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md)

Target maqām for calculating shift amount

## Returns

`object`

Object containing the transposed sayr and out-of-bounds flag

### transposedSayr

> **transposedSayr**: [`Sayr`](../../../models/Maqam/interfaces/Sayr.md)

### hasOutOfBoundsNotes

> **hasOutOfBoundsNotes**: `boolean`
