---
url: >-
  /docs/library/api/functions/convertPitchClass/functions/frequencyToMidiNoteNumber.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/convertPitchClass](../README.md) / frequencyToMidiNoteNumber

# Function: frequencyToMidiNoteNumber()

> **frequencyToMidiNoteNumber**(`frequency`): `number`

Defined in: [functions/convertPitchClass.ts:54](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/convertPitchClass.ts#L54)

Converts a frequency value to its equivalent MIDI note number.

Uses the standard MIDI tuning where A4 = 440 Hz = MIDI note 69.
This conversion is essential for interfacing with MIDI systems and
calculating pitch relationships.

## Parameters

### frequency

`number`

The frequency in Hz

## Returns

`number`

The equivalent MIDI note number (can be fractional)

## Example

```ts
frequencyToMidiNoteNumber(440) // Returns 69 (A4)
frequencyToMidiNoteNumber(523.25) // Returns ~72 (C5)
```
