---
url: /docs/library/api/functions/convertPitchClass/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/convertPitchClass](../README.md) / default

# Function: default()

> **default**(`inputValue`, `inputType`, `stringLength`, `referenceFrequency`): { `fraction`: `string`; `decimal`: `string`; `cents`: `string`; `stringLength`: `string`; `frequency`: `string`; } | `null`

Defined in: [functions/convertPitchClass.ts:89](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/convertPitchClass.ts#L89)

Converts pitch class values between different representation formats.

This is the core conversion function that enables the system to work with
different pitch notations (fractions, cents, decimal ratios, string lengths, fret divisions).
It converts any input format to all other formats, enabling seamless
interoperability between different musical tuning systems.

## Parameters

### inputValue

`string`

The input value as a string

### inputType

The format of the input value

`"fraction"` | `"fretDivision"` | `"decimalRatio"` | `"cents"` | `"stringLength"`

### stringLength

`number`

Reference string length for string length calculations

### referenceFrequency

`number`

Reference frequency for frequency calculations

## Returns

{ `fraction`: `string`; `decimal`: `string`; `cents`: `string`; `stringLength`: `string`; `frequency`: `string`; } | `null`

Object with all converted formats, or null if conversion fails

## Examples

```ts
// Convert a fraction to all formats
convertPitchClass("3/2", "fraction", 100, 440)
// Returns: { fraction: "3/2", decimal: "1.5", cents: "701.955", ... }
```

```ts
// Convert cents to all formats
convertPitchClass("200", "cents", 100, 440)
// Returns all equivalent representations of 200 cents
```

```ts
// Convert fret division to all formats
convertPitchClass("102", "fretDivision", 100, 440)
// Returns all equivalent representations relative to string length
```
