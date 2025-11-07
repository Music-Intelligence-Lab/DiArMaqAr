---
url: /docs/library/api/functions/getFirstNoteName/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getFirstNoteName](../README.md) / default

# Function: default()

> **default**(`selectedIndices`): `string`

Defined in: [functions/getFirstNoteName.ts:13](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getFirstNoteName.ts#L13)

Retrieves the first note name from an array of selected pitch class indices.

This utility function is used in UI state management to determine the
starting note when pitch classes are selected. It maps the first selected
index to its corresponding note name from the octave one note names array.

## Parameters

### selectedIndices

`number`\[]

Array of selected pitch class indices

## Returns

`string`

The note name corresponding to the first index, or "none" if empty or invalid
