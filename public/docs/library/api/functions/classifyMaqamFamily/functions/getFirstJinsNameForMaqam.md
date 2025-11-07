---
url: >-
  /docs/library/api/functions/classifyMaqamFamily/functions/getFirstJinsNameForMaqam.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / getFirstJinsNameForMaqam

# Function: getFirstJinsNameForMaqam()

> **getFirstJinsNameForMaqam**(`maqam`): `string` | `null`

Defined in: [functions/classifyMaqamFamily.ts:124](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L124)

Gets the first jins name for a maqam from its ajnas analysis.

Checks ascending ajnas first (most common case), then descending ajnas
at the first scale degree. The descending ajnas array is in reverse order,
so the first scale degree jins is at the END of the array.

## Parameters

### maqam

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md)

The maqam instance (tahlil) to analyze

## Returns

`string` | `null`

Full jins name or null if no jins found

## Example

```ts
const tahlil = getMaqamTahlil(...);
const jinsName = getFirstJinsNameForMaqam(tahlil);
// Returns: "Jins Rast al-rast" or null
```
