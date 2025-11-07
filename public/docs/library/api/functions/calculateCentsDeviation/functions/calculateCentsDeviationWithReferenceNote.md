---
url: >-
  /docs/library/api/functions/calculateCentsDeviation/functions/calculateCentsDeviationWithReferenceNote.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/calculateCentsDeviation](../README.md) / calculateCentsDeviationWithReferenceNote

# Function: calculateCentsDeviationWithReferenceNote()

> **calculateCentsDeviationWithReferenceNote**(`currentMidiNumber`, `currentCents`, `startingMidiNumber`, `currentNoteName?`, `startingNoteName?`): `object`

Defined in: [functions/calculateCentsDeviation.ts:69](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/calculateCentsDeviation.ts#L69)

Calculates cents deviation with explicit reference note determination.

This function calculates how much a pitch deviates from equal temperament
by determining the exact reference note based on the English note name,
providing both the deviation value and the reference note name for clarity.

## Parameters

### currentMidiNumber

`number`

The current MIDI note number (can be fractional)

### currentCents

`string`

The current cents value as a string

### startingMidiNumber

`number`

The starting/reference MIDI note number

### currentNoteName?

`string`

Optional current note name for reference determination

### startingNoteName?

`string`

Optional starting note name (kept for API compatibility)

## Returns

`object`

Object with deviation value and reference note name

### deviation

> **deviation**: `number`

### referenceNoteName

> **referenceNoteName**: `string`
