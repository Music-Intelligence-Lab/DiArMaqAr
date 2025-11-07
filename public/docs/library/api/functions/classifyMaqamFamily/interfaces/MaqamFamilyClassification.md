---
url: >-
  /docs/library/api/functions/classifyMaqamFamily/interfaces/MaqamFamilyClassification.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / MaqamFamilyClassification

# Interface: MaqamFamilyClassification

Defined in: [functions/classifyMaqamFamily.ts:12](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L12)

Classification result for a maqam's family based on jins analysis

## Properties

### method

> **method**: `"firstJins"`

Defined in: [functions/classifyMaqamFamily.ts:14](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L14)

Classification method used

***

### familyName

> **familyName**: `string`

Defined in: [functions/classifyMaqamFamily.ts:17](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L17)

The base jins family name (e.g., "rast", "bayyāt", "nahāwand"). Returns "no jins" if no jins found.

***

### fullJinsName

> **fullJinsName**: `string` | `null`

Defined in: [functions/classifyMaqamFamily.ts:20](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L20)

Full jins name with transposition info (e.g., "Jins Rast al-rast"). Returns null if no jins found.

***

### scaleDegree

> **scaleDegree**: `string`

Defined in: [functions/classifyMaqamFamily.ts:23](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L23)

The scale degree where this jins appears (typically "1" for first degree)

***

### source

> **source**: `"ascending"` | `"descending"` | `"none"`

Defined in: [functions/classifyMaqamFamily.ts:26](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L26)

Whether this came from ascending or descending ajnas analysis. Returns "none" if no jins found.
