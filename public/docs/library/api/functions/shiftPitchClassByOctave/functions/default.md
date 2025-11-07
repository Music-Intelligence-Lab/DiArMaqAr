---
url: /docs/library/api/functions/shiftPitchClassByOctave/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/shiftPitchClassByOctave](../README.md) / default

# Function: default()

> **default**(`allPitchClasses`, `pitchClass`, `octaveShift`): [`default`](../../../models/PitchClass/interfaces/default.md)

Defined in: [functions/shiftPitchClassByOctave.ts:45](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/shiftPitchClassByOctave.ts#L45)

Shifts a pitch class by a specified number of octaves using array lookup.

This is the preferred method for shifting pitch classes as it uses the
pre-computed pitch class array for accuracy. It finds the target pitch
class in a different octave by calculating the appropriate array index.

## Parameters

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete array of all available pitch classes

### pitchClass

The pitch class to shift (can be undefined)

[`default`](../../../models/PitchClass/interfaces/default.md) | `undefined`

### octaveShift

`number`

Number of octaves to shift (positive = up, negative = down)

## Returns

[`default`](../../../models/PitchClass/interfaces/default.md)

The shifted pitch class, or empty pitch class if operation fails

## Examples

```ts
// Shift a pitch class up one octave
const shifted = shiftPitchClassByOctave(allPitches, originalPitch, 1);
```

```ts
// Shift a pitch class down two octaves  
const shifted = shiftPitchClassByOctave(allPitches, originalPitch, -2);
```
