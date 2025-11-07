---
url: /docs/library/api/functions/detectPitchClassType/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/detectPitchClassType](../README.md) / default

# Function: default()

> **default**(`values`): `"fraction"` | `"fretDivision"` | `"decimalRatio"` | `"cents"` | `"stringLength"` | `"unknown"`

Defined in: [functions/detectPitchClassType.ts:33](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/detectPitchClassType.ts#L33)

Automatically detects the format of pitch class data values from an array of string values.

This function analyzes pitch class data values to determine its format, enabling automatic
parsing and conversion. It's essential for import workflows where the data format
might not be explicitly specified.

The detection logic follows this priority:

1. Fraction patterns (e.g., "3/2", "4:3")
2. Fret division values (ascending numbers ending at 1000 or > 1200)
3. Decimal ratios (ascending numbers 1.0-2.0) - checked before cents since it's more specific
4. Cents values (ascending numbers >= 0 and < 1200, excluding decimal ratio range)
5. String lengths (descending numbers)

## Parameters

### values

`string`\[]

Array of pitch class values as strings

## Returns

`"fraction"` | `"fretDivision"` | `"decimalRatio"` | `"cents"` | `"stringLength"` | `"unknown"`

The detected format type or "unknown" if indeterminate

## Examples

```ts
detectPitchClassType(["1/1", "9/8", "5/4", "4/3"]) // Returns "fraction"
```

```ts
detectPitchClassType(["0", "102", "201", "298", "1000"]) // Returns "fretDivision"
```

```ts
detectPitchClassType(["0", "204", "386", "498"]) // Returns "cents"
```

```ts
detectPitchClassType(["1.0", "1.125", "1.25", "1.333"]) // Returns "decimalRatio"
```

```ts
detectPitchClassType(["10000", "9600", "8700", "7000"]) // Returns "stringLength"
```
