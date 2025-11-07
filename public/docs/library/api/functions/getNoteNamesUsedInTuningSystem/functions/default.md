---
url: >-
  /docs/library/api/functions/getNoteNamesUsedInTuningSystem/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getNoteNamesUsedInTuningSystem](../README.md) / default

# Function: default()

> **default**(`indicesToSearch`): `string`\[]

Defined in: [functions/getNoteNamesUsedInTuningSystem.ts:17](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getNoteNamesUsedInTuningSystem.ts#L17)

Retrieves note names across multiple octaves for given pitch class indices.

This function maps pitch class note name indices to their corresponding note names
across four octaves (0-3). It's essential for creating comprehensive pitch
collections when working with tuning systems that span multiple octaves.

The function iterates through octaves 0-3 and maps each provided index
to its note name equivalent in that octave, building a complete list
of available note names for the tuning system.

## Parameters

### indicesToSearch

`number`\[] = `[]`

Array of pitch class indices to map to note names (default: \[])

## Returns

`string`\[]

Array of note names corresponding to the indices across all octaves
