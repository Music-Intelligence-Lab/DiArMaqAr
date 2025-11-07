---
url: /docs/library/api/functions/romanToNumber/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/romanToNumber](../README.md) / default

# Function: default()

> **default**(`r`): `number`

Defined in: [functions/romanToNumber.ts:19](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/romanToNumber.ts#L19)

Converts Roman numerals to numbers for parsing pattern notes in playSequence.

When playing musical patterns, notes can be specified as Roman numerals (I, II, III, etc.)
representing scale degrees. This function converts them to numbers so we can find the
correct pitch in the scale. Supports + and - prefixes for octave shifts.

Used in sound-context.tsx playSequence function to parse pattern note degrees
like "V" → 5th scale degree, "+II" → 2nd degree in higher octave.

## Parameters

### r

`string`

Roman numeral (I-XII), optionally prefixed with + or -

## Returns

`number`

Number 1-12, or 0 if invalid

## Example

```ts
romanToNumber("V") // 5 (fifth scale degree)
romanToNumber("+IV") // 4 (fourth degree, higher octave)
romanToNumber("-II") // 2 (second degree, lower octave)
```
