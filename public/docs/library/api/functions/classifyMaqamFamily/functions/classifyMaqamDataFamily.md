---
url: >-
  /docs/library/api/functions/classifyMaqamFamily/functions/classifyMaqamDataFamily.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / classifyMaqamDataFamily

# Function: classifyMaqamDataFamily()

> **classifyMaqamDataFamily**(`maqamData`, `transpositionsMap`): [`MaqamFamilyClassification`](../interfaces/MaqamFamilyClassification.md) | `null`

Defined in: [functions/classifyMaqamFamily.ts:252](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L252)

Helper function to classify a MaqamData by looking up its tahlil
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

[`MaqamFamilyClassification`](../interfaces/MaqamFamilyClassification.md) | `null`

Classification object or null if no transpositions found

## Example

```ts
const { allMaqamTranspositionsMap } = useTranspositionsContext();
const classification = classifyMaqamDataFamily(maqamData, allMaqamTranspositionsMap);
```
