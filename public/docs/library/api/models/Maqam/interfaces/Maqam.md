---
url: /docs/library/api/models/Maqam/interfaces/Maqam.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / Maqam

# Interface: Maqam

Defined in: [models/Maqam.ts:471](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L471)

Represents a concrete, tuning-system-specific maqam with actual pitch classes.

This interface represents a maqam that has been "realized" within a specific
tuning system, containing actual pitch classes with frequencies and intervallic
relationships for both ascending and descending sequences. Unlike MaqamData
(which contains only abstract note names), a Maqam interface instance is
playable and can be used for audio synthesis and comprehensive analysis.

**Tahlil vs Taswir**:

* **Tahlil** (transposition: false): The original form of the maqam starting
  from its traditional root note (e.g., Maqam Farahfazza starting on yegah)
* **Taswir** (transposition: true): A transposition of the maqam starting
  from a different pitch class while preserving intervallic relationships and
  directional characteristics (e.g., Maqam Farahfazza al-Rast starting on rast)

**Advanced Features**:

* **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns
  within both ascending and descending sequences using cents tolerance matching
* **Automatic transposition**: Both sequences and embedded ajnas are systematically
  transposed while maintaining authentic intervallic structure
* **suyur integration**: Associated melodic development pathways are automatically
  transposed with note name conversion and jins/maqam reference adjustment

The transposition algorithm separately processes both sequences, ensuring all
required note names exist within the tuning system's four octaves before
generating a valid transposition.

## Properties

### maqamId

> **maqamId**: `string`

Defined in: [models/Maqam.ts:473](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L473)

ID of the original maqam this instance is based on

***

### name

> **name**: `string`

Defined in: [models/Maqam.ts:480](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L480)

Name of this maqam instance.
For tahlil: original name (e.g., "Maqam Farahfazza")
For taswir: includes transposition info (e.g., "Maqam Farahfazza al-Rast")

***

### transposition

> **transposition**: `boolean`

Defined in: [models/Maqam.ts:486](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L486)

Whether this is a transposition (taswir) or original form (tahlil).
false = tahlil (original), true = taswir (transposition)

***

### ascendingPitchClasses

> **ascendingPitchClasses**: [`default`](../../PitchClass/interfaces/default.md)\[]

Defined in: [models/Maqam.ts:492](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L492)

Array of actual pitch classes for the ascending sequence (ṣuʿūd).
These are the concrete, playable pitches within the tuning system.

***

### ascendingPitchClassIntervals

> **ascendingPitchClassIntervals**: [`PitchClassInterval`](../../PitchClass/interfaces/PitchClassInterval.md)\[]

Defined in: [models/Maqam.ts:498](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L498)

Intervallic relationships between consecutive pitch classes in ascending sequence.
These intervals remain consistent between tahlil and taswir forms.

***

### ascendingMaqamAjnas?

> `optional` **ascendingMaqamAjnas**: ([`Jins`](../../Jins/interfaces/Jins.md) | `null`)\[]

Defined in: [models/Maqam.ts:504](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L504)

Optional array of embedded ajnas found within the ascending sequence.
Generated through algorithmic pattern matching against known ajnās database.

***

### descendingPitchClasses

> **descendingPitchClasses**: [`default`](../../PitchClass/interfaces/default.md)\[]

Defined in: [models/Maqam.ts:510](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L510)

Array of actual pitch classes for the descending sequence (hubūṭ).
May differ from ascending sequence in asymmetric maqamat.

***

### descendingPitchClassIntervals

> **descendingPitchClassIntervals**: [`PitchClassInterval`](../../PitchClass/interfaces/PitchClassInterval.md)\[]

Defined in: [models/Maqam.ts:516](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L516)

Intervallic relationships between consecutive pitch classes in descending sequence.
These intervals remain consistent between tahlil and taswir forms.

***

### descendingMaqamAjnas?

> `optional` **descendingMaqamAjnas**: ([`Jins`](../../Jins/interfaces/Jins.md) | `null`)\[]

Defined in: [models/Maqam.ts:522](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L522)

Optional array of embedded ajnas found within the descending sequence.
Generated through algorithmic pattern matching against known ajnās database.

***

### modulations?

> `optional` **modulations**: [`AjnasModulations`](../../Jins/interfaces/AjnasModulations.md) | [`MaqamatModulations`](MaqamatModulations.md)

Defined in: [models/Maqam.ts:528](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L528)

Optional modulation possibilities to other maqamat or ajnas.
Defines possible transitions from this maqam to others.

***

### numberOfHops?

> `optional` **numberOfHops**: `number`

Defined in: [models/Maqam.ts:531](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L531)

Optional number of steps/hops for modulation analysis
