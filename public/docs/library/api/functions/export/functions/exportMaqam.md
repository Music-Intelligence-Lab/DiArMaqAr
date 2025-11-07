---
url: /docs/library/api/functions/export/functions/exportMaqam.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/export](../README.md) / exportMaqam

# Function: exportMaqam()

> **exportMaqam**(`maqamInput`, `tuningSystem`, `startingNote`, `options`, `centsTolerance`): `Promise`<`ExportedMaqam`>

Defined in: [functions/export.ts:1590](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L1590)

Exports comprehensive data for a specific maqam.

This function generates a detailed export of a maqam including its basic properties,
constituent ajnas, all possible transpositions within a given tuning system, and
optionally its modulation possibilities and suyur (melodic progressions). The maqam
can be provided as either a Maqam instance or MaqamData object.

**Note**: This function uses the original modulation format (full objects) for
better compatibility with individual maqam analysis. For large-scale exports,
use exportTuningSystem() which implements index-based optimization.

## Parameters

### maqamInput

The maqam to export (either Maqam instance or MaqamData)

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md) | [`default`](../../../models/Maqam/classes/default.md)

### tuningSystem

[`default`](../../../models/TuningSystem/classes/default.md)

The tuning system context for analysis

### startingNote

`string`

The starting note for the tuning system

### options

[`MaqamExportOptions`](../interfaces/MaqamExportOptions.md)

Export configuration options for maqam-specific data

### centsTolerance

`number` = `5`

Tolerance in cents for matching cents values (default: 5)

## Returns

`Promise`<`ExportedMaqam`>

Comprehensive export object containing all requested maqam data
