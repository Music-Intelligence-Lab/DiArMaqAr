---
url: /docs/library/api/models/PitchClass/interfaces/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/PitchClass](../README.md) / default

# Interface: default

Defined in: [models/PitchClass.ts:13](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L13)

A Pitch class in oriental musicology is a fundamental abstraction that represents
a musical relation of a musical pitch. Rather than defining absolute properties
with frequencies, it uses relational measurements like cents, string length,
fraction ratio, and decimal ratio. When used within the context of a tuning system,
the pitch class will be linked to a note name and an audible frequency. This
relational approach enables systematic analysis of transpositions and modulations,
as interval relationships between the pitch classes are maintained regardless of
the reference frequency.

## Properties

### noteName

> **noteName**: `string`

Defined in: [models/PitchClass.ts:15](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L15)

The name of the note in the current tuning system

***

### fraction

> **fraction**: `string`

Defined in: [models/PitchClass.ts:18](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L18)

Frequency ratio expressed as a fraction (e.g., "3/2")

***

### cents

> **cents**: `string`

Defined in: [models/PitchClass.ts:21](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L21)

Pitch measurement in cents relative to a reference

***

### decimalRatio

> **decimalRatio**: `string`

Defined in: [models/PitchClass.ts:24](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L24)

Frequency ratio as a decimal number

***

### stringLength

> **stringLength**: `string`

Defined in: [models/PitchClass.ts:27](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L27)

Relative string length for string instruments

***

### fretDivision

> **fretDivision**: `string`

Defined in: [models/PitchClass.ts:30](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L30)

Fret position for fretted instruments

***

### frequency

> **frequency**: `string`

Defined in: [models/PitchClass.ts:33](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L33)

Absolute frequency in Hz

***

### midiNoteDecimal

> **midiNoteDecimal**: `number`

Defined in: [models/PitchClass.ts:36](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L36)

MIDI note as a decimal value with fractional precision (e.g., 51.366 for E-b3)

***

### ~~midiNoteCentsDeviation?~~

> `optional` **midiNoteCentsDeviation**: `number`

Defined in: [models/PitchClass.ts:39](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L39)

#### Deprecated

Legacy field - use midiNoteDeviation instead

***

### originalValue

> **originalValue**: `string`

Defined in: [models/PitchClass.ts:42](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L42)

The original input value used to create this pitch class

***

### originalValueType

> **originalValueType**: `string`

Defined in: [models/PitchClass.ts:45](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L45)

The type of the original value ("fraction", "fretDivision", "cents", "decimalRatio", "stringLength")

***

### englishName

> **englishName**: `string`

Defined in: [models/PitchClass.ts:48](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L48)

English name of the note

***

### abjadName

> **abjadName**: `string`

Defined in: [models/PitchClass.ts:51](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L51)

Arabic/Abjad name of the note

***

### pitchClassIndex

> **pitchClassIndex**: `number`

Defined in: [models/PitchClass.ts:59](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L59)

Pitch class index within the tuning system (0-based).
This identifies the pitch class position independent of octave,
allowing grouping of the same pitch class across all octaves.
Example: pitchClassIndex 5 in octave 0 = same pitch class type as pitchClassIndex 5 in octave 1

***

### octave

> **octave**: `number`

Defined in: [models/PitchClass.ts:62](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L62)

Octave number

***

### centsDeviation

> **centsDeviation**: `number`

Defined in: [models/PitchClass.ts:65](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L65)

Deviation in cents from the nearest equal-tempered pitch

***

### referenceNoteName?

> `optional` **referenceNoteName**: `string`

Defined in: [models/PitchClass.ts:68](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L68)

Optional reference note name for relative calculations

***

### midiNoteDeviation?

> `optional` **midiNoteDeviation**: `string`

Defined in: [models/PitchClass.ts:71](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L71)

MIDI Note Deviation: 12-EDO reference MIDI note + cents deviation (e.g., "52 -63.4")
