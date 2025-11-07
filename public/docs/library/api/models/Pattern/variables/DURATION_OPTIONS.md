---
url: /docs/library/api/models/Pattern/variables/DURATION_OPTIONS.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Pattern](../README.md) / DURATION\_OPTIONS

# Variable: DURATION\_OPTIONS

> `const` `readonly` **DURATION\_OPTIONS**: `string`\[]

Defined in: [models/Pattern.ts:160](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L160)

Available rhythmic duration options for pattern notes.

Uses standard music notation with the following suffixes:

* 'n' = normal (e.g., "4n" = quarter note)
* 'd' = dotted (adds 50% to duration, e.g., "4d" = dotted quarter)
* 't' = triplet (2/3 of normal duration, e.g., "4t" = quarter triplet)

Duration hierarchy from shortest to longest:
32nd notes → 16th notes → 8th notes → quarter notes → half notes → whole notes
