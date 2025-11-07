---
url: >-
  /docs/library/api/functions/export/interfaces/ExportMaqamFamilyClassification.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/export](../README.md) / ExportMaqamFamilyClassification

# Interface: ExportMaqamFamilyClassification

Defined in: [functions/export.ts:22](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L22)

Multi-method maqam family classification for research and analysis.
Each classification method provides a different perspective on how to group maqamat.
All methods are optional - only calculated methods will be present in exports.

Family names reference the maqamFamilyReference lookup for display names.

## Properties

### firstJins?

> `optional` **firstJins**: `object`

Defined in: [functions/export.ts:24](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L24)

Classification by first jins at scale degree 1

#### familyName

> **familyName**: `string`

Normalized family name (references maqamFamilyReference for display)
