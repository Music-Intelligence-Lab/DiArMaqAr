---
url: >-
  /docs/library/api/functions/calculateCentsDeviation/functions/swapEnharmonicForReference.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/calculateCentsDeviation](../README.md) / swapEnharmonicForReference

# Function: swapEnharmonicForReference()

> **swapEnharmonicForReference**(`name`): `string` | `null`

Defined in: [functions/calculateCentsDeviation.ts:198](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/calculateCentsDeviation.ts#L198)

Swaps a reference note name to its enharmonic equivalent.
This is similar to swapEnharmonicSimple in noteNameMappings but
simplified for reference note names (which don't have octave numbers).

## Parameters

### name

`string`

The reference note name (e.g., "F#", "Gb", "C")

## Returns

`string` | `null`

The enharmonic equivalent, or null if no swap available
