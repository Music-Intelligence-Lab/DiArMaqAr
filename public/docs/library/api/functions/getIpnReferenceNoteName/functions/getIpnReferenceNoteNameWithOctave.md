---
url: >-
  /docs/library/api/functions/getIpnReferenceNoteName/functions/getIpnReferenceNoteNameWithOctave.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getIpnReferenceNoteName](../README.md) / getIpnReferenceNoteNameWithOctave

# Function: getIpnReferenceNoteNameWithOctave()

> **getIpnReferenceNoteNameWithOctave**(`pitchClass`): `string`

Defined in: [functions/getIpnReferenceNoteName.ts:45](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getIpnReferenceNoteName.ts#L45)

Extracts the 12-EDO reference note name with octave number from a pitch class.

## Parameters

### pitchClass

`any`

Pitch class object with midiNoteDecimal

## Returns

`string`

12-EDO reference note name with octave number (e.g., "E3", "Bb4", "F#2")

## Example

```typescript
const pc = { midiNoteDecimal: 51.366, englishName: "E-b3", ... };
const ref = get12EdoReferenceNoteNameWithOctave(pc); // Returns "E3"
```
