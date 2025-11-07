---
url: /docs/library/api/models/Jins/interfaces/Jins.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Jins](../README.md) / Jins

# Interface: Jins

Defined in: [models/Jins.ts:282](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L282)

Represents a concrete, tuning-system-specific jins with actual pitch classes.

This interface represents a jins that has been "realized" within a specific
tuning system, containing actual pitch classes with frequencies and intervallic
relationships. Unlike JinsData (which contains only abstract note names),
a Jins interface instance is playable and can be used for audio synthesis.

**Tahlil vs Taswir**:

* **Tahlil** (transposition: false): The original form of the jins starting
  from its traditional root note (e.g., Jins Kurd starting on dūgāh)
* **Taswir** (transposition: true): A transposition of the jins starting
  from a different pitch class while preserving intervallic relationships
  (e.g., Jins Kurd al-Muhayyar starting on muhayyar/octave of dūgāh)

The transposition algorithm uses pattern matching to find all valid starting
positions within the tuning system where the complete interval pattern can
be realized, ensuring authentic intervallic structure is maintained.

## Properties

### jinsId

> **jinsId**: `string`

Defined in: [models/Jins.ts:284](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L284)

ID of the original jins this instance is based on

***

### name

> **name**: `string`

Defined in: [models/Jins.ts:291](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L291)

Name of this jins instance.
For tahlil: original name (e.g., "Jins Kurd")
For taswir: includes transposition info (e.g., "Jins Kurd al-Muhayyar")

***

### transposition

> **transposition**: `boolean`

Defined in: [models/Jins.ts:297](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L297)

Whether this is a transposition (taswir) or original form (tahlil).
false = tahlil (original), true = taswir (transposition)

***

### jinsPitchClasses

> **jinsPitchClasses**: [`default`](../../PitchClass/interfaces/default.md)\[]

Defined in: [models/Jins.ts:303](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L303)

Array of actual pitch classes with frequencies and note names.
These are the concrete, playable pitches within the tuning system.

***

### jinsPitchClassIntervals

> **jinsPitchClassIntervals**: [`PitchClassInterval`](../../PitchClass/interfaces/PitchClassInterval.md)\[]

Defined in: [models/Jins.ts:309](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L309)

Intervallic relationships between consecutive pitch classes.
These intervals remain consistent between tahlil and taswir forms.
