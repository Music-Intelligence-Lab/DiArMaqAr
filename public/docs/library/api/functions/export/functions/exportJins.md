---
url: /docs/library/api/functions/export/functions/exportJins.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/export](../README.md) / exportJins

# Function: exportJins()

> **exportJins**(`jinsInput`, `tuningSystem`, `startingNote`, `options`, `centsTolerance`): `Promise`<`ExportedJins`>

Defined in: [functions/export.ts:1365](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L1365)

Exports comprehensive data for a specific jins.

This function generates a detailed export of a jins including its basic properties,
all possible transpositions within a given tuning system, and optionally its
modulation possibilities. The jins can be provided as either a Jins instance
or JinsData object.

## Parameters

### jinsInput

The jins to export (either Jins instance or JinsData)

[`Jins`](../../../models/Jins/interfaces/Jins.md) | [`default`](../../../models/Jins/classes/default.md)

### tuningSystem

[`default`](../../../models/TuningSystem/classes/default.md)

The tuning system context for analysis

### startingNote

`string`

The starting note for the tuning system

### options

[`JinsExportOptions`](../interfaces/JinsExportOptions.md)

Export configuration options for jins-specific data

### centsTolerance

`number` = `5`

Tolerance in cents for matching cents values (default: 5)

## Returns

`Promise`<`ExportedJins`>

Comprehensive export object containing all requested jins data
