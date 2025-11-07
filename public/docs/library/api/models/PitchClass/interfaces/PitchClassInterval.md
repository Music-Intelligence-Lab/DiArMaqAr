---
url: /docs/library/api/models/PitchClass/interfaces/PitchClassInterval.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/PitchClass](../README.md) / PitchClassInterval

# Interface: PitchClassInterval

Defined in: [models/PitchClass.ts:79](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L79)

Represents the interval between two pitch classes, containing the difference
in various measurement systems. This enables comparison and analysis of
musical intervals across different representation formats.

## Properties

### fraction

> **fraction**: `string`

Defined in: [models/PitchClass.ts:81](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L81)

Interval as a frequency ratio fraction

***

### cents

> **cents**: `number`

Defined in: [models/PitchClass.ts:84](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L84)

Interval in cents

***

### decimalRatio

> **decimalRatio**: `number`

Defined in: [models/PitchClass.ts:87](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L87)

Interval as a decimal ratio

***

### stringLength

> **stringLength**: `number`

Defined in: [models/PitchClass.ts:90](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L90)

String length difference

***

### fretDivision

> **fretDivision**: `number`

Defined in: [models/PitchClass.ts:93](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L93)

Fret division difference

***

### pitchClassIndex

> **pitchClassIndex**: `number`

Defined in: [models/PitchClass.ts:96](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L96)

Pitch class index difference considering octaves

***

### originalValue

> **originalValue**: `string`

Defined in: [models/PitchClass.ts:99](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L99)

String representation of the interval in its original format

***

### originalValueType

> **originalValueType**: `string`

Defined in: [models/PitchClass.ts:102](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/PitchClass.ts#L102)

Type of the original value representation
