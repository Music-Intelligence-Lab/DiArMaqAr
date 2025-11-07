---
url: >-
  /docs/library/api/functions/classifyMaqamFamily/functions/classifyMaqamFamily.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / classifyMaqamFamily

# Function: classifyMaqamFamily()

> **classifyMaqamFamily**(`maqam`): [`MaqamFamilyClassification`](../interfaces/MaqamFamilyClassification.md)

Defined in: [functions/classifyMaqamFamily.ts:170](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L170)

Classifies a maqam into its family based on the jins at the first scale degree.

This implements the "firstJins" classification method, which groups maqamat
by the jins appearing at the first scale degree.

**Classification Priority:**

1. Ascending ajnas at first degree (most common)
2. Descending ajnas at first degree (fallback)
3. "no jins" for maqamat with no identifiable jins

**Note:** This function should be called on the tahlil (original form, transposition: false)
to get accurate family classification. All transpositions inherit the same family.

## Parameters

### maqam

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md)

The maqam instance to classify (should be tahlil, not transposition)

## Returns

[`MaqamFamilyClassification`](../interfaces/MaqamFamilyClassification.md)

Classification object with family name and metadata

## Example

```ts
const tahlil = transpositions.find(t => !t.transposition);
const classification = classifyMaqamFamily(tahlil);
console.log(classification.method); // "firstJins"
console.log(classification.familyName); // "rast"
console.log(classification.source); // "ascending"
```
