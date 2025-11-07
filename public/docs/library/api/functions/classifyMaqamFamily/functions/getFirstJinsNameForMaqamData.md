---
url: >-
  /docs/library/api/functions/classifyMaqamFamily/functions/getFirstJinsNameForMaqamData.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / getFirstJinsNameForMaqamData

# Function: getFirstJinsNameForMaqamData()

> **getFirstJinsNameForMaqamData**(`maqamData`, `transpositionsMap`): `string` | `null`

Defined in: [functions/classifyMaqamFamily.ts:223](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L223)

Helper function to get first jins name for a MaqamData by looking up its tahlil
from a transpositions map.

This is a convenience wrapper for UI components that work with MaqamData and
have access to the TranspositionsContext.

## Parameters

### maqamData

[`default`](../../../models/Maqam/classes/default.md)

The MaqamData instance

### transpositionsMap

`Map`<`string`, [`Maqam`](../../../models/Maqam/interfaces/Maqam.md)\[]>

Map of maqam ID to array of transpositions (from TranspositionsContext)

## Returns

`string` | `null`

Full jins name or null if no jins found

## Example

```ts
const { allMaqamTranspositionsMap } = useTranspositionsContext();
const jinsName = getFirstJinsNameForMaqamData(maqamData, allMaqamTranspositionsMap);
```
