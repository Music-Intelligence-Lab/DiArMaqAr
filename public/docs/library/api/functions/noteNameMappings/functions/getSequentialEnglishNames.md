---
url: >-
  /docs/library/api/functions/noteNameMappings/functions/getSequentialEnglishNames.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/noteNameMappings](../README.md) / getSequentialEnglishNames

# Function: getSequentialEnglishNames()

> **getSequentialEnglishNames**(`arabicNames`, `ascending`): `string`\[]

Defined in: [functions/noteNameMappings.ts:512](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/noteNameMappings.ts#L512)

Resolves enharmonic spellings for a sequence of notes to ensure sequential natural letters.
This follows Western music notation convention where scales use consecutive letters (D-E-F-G-A-B-C-D).

The algorithm:

1. Determines the expected letter sequence from the first note
2. For each note, finds the enharmonic spelling that matches the expected letter
3. Falls back to the default mapping if no suitable enharmonic exists

## Parameters

### arabicNames

`string`\[]

Array of Arabic note names to convert

### ascending

`boolean` = `true`

Direction of the sequence (true for ascending, false for descending). Defaults to true.

## Returns

`string`\[]

Array of English note names with sequential natural letters
