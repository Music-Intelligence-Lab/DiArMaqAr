---
url: /docs/library/api/functions/getTuningSystemPitchClasses/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getTuningSystemPitchClasses](../README.md) / default

# Function: default()

> **default**(`tuningSystem`, `startingNote`, `tuningSystemPitchClasses`, `inputStringLength`, `inputReferenceFrequencies`): [`default`](../../../models/PitchClass/interfaces/default.md)\[]

Defined in: [functions/getTuningSystemPitchClasses.ts:42](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getTuningSystemPitchClasses.ts#L42)

Generates a complete array of PitchClass objects for a tuning system starting from a specific note.

## Parameters

### tuningSystem

[`default`](../../../models/TuningSystem/classes/default.md)

The tuning system to generate pitch classes for

### startingNote

`string`

The note to start the tuning system from

### tuningSystemPitchClasses

`string`\[] = `[]`

Optional custom pitch classes (default: from tuning system)

### inputStringLength

`number` = `0`

Optional length parameter for custom input

### inputReferenceFrequencies

Optional custom reference frequencies

## Returns

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete array of PitchClass objects spanning multiple octaves

## Remarks

This is the most important function in the system because it is a generative function that creates the pitch classes
that we work with throughout the application (view, select, play, highlight).

This is a core function that creates the fundamental pitch collection for analysis.
It takes a tuning system and starting note, then generates all pitch classes across
multiple octaves with their frequencies, MIDI numbers, cents deviations, and other
properties needed for maqam analysis.

The function handles various pitch class formats (ratios, frequencies, cents) and
automatically detects the input type. It also manages reference frequencies and
octave relationships to create a comprehensive pitch space.
