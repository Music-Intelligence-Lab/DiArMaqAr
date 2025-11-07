---
url: >-
  /docs/library/api/functions/convertPitchClass/functions/shiftPitchClassBaseValue.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/convertPitchClass](../README.md) / shiftPitchClassBaseValue

# Function: shiftPitchClassBaseValue()

> **shiftPitchClassBaseValue**(`baseValue`, `inputType`, `targetOctave`): `string`

Defined in: [functions/convertPitchClass.ts:207](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/convertPitchClass.ts#L207)

Shifts a pitch class base value to a different octave.

This function transposes a pitch class value by octaves, handling the conversion
appropriately for different input formats. It's used when generating pitch classes
across multiple octaves from a single octave template.

## Parameters

### baseValue

`string`

The original pitch class value as a string

### inputType

The format of the input value

`"fraction"` | `"fretDivision"` | `"decimalRatio"` | `"cents"` | `"stringLength"`

### targetOctave

The target octave (0, 1, 2, 3, or 4)

`0` | `1` | `2` | `3` | `4`

## Returns

`string`

The shifted value in the same format as the input

## Examples

```ts
// Shift a fraction up one octave
shiftPitchClassBaseValue("3/2", "fraction", 2) // Returns "3/1" (doubled)
```

```ts
// Shift cents up one octave
shiftPitchClassBaseValue("701.955", "cents", 2) // Returns "1901.955" (+1200 cents)
```

```ts
// Shift fret division up one octave
shiftPitchClassBaseValue("102", "fretDivision", 2) // Adjusts fret position for higher octave
```
