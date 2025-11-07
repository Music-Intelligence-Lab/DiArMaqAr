---
url: /docs/library/api/models/Jins/interfaces/AjnasModulations.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Jins](../README.md) / AjnasModulations

# Interface: AjnasModulations

Defined in: [models/Jins.ts:323](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L323)

Represents possible modulations between different ajnās.

In Arabic maqam theory, modulations occur when moving from one jins to another
within a melodic progression. This interface categorizes modulations based on
which scale degree they occur on and their directional characteristics.

Each property contains an array of possible target ajnās that can be reached
through modulation from a given starting maqam, organized by the scale degree
where the modulation occurs and the melodic direction.

## Properties

### modulationsOnFirstDegree

> **modulationsOnFirstDegree**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:325](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L325)

Modulations that occur on the first scale degree

***

### modulationsOnThirdDegree

> **modulationsOnThirdDegree**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:328](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L328)

Modulations that occur on the third scale degree

***

### modulationsOnAltThirdDegree

> **modulationsOnAltThirdDegree**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:331](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L331)

Modulations that occur on the third scale degree (second pattern)

***

### modulationsOnFourthDegree

> **modulationsOnFourthDegree**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:334](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L334)

Modulations that occur on the fourth scale degree

***

### modulationsOnFifthDegree

> **modulationsOnFifthDegree**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:337](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L337)

Modulations that occur on the fifth scale degree

***

### modulationsOnSixthDegreeAsc

> **modulationsOnSixthDegreeAsc**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:340](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L340)

Ascending modulations that occur on the sixth scale degree

***

### modulationsOnSixthDegreeDesc

> **modulationsOnSixthDegreeDesc**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:343](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L343)

Descending modulations that occur on the sixth scale degree

***

### modulationsOnSixthDegreeIfNoThird

> **modulationsOnSixthDegreeIfNoThird**: [`Jins`](Jins.md)\[]

Defined in: [models/Jins.ts:346](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L346)

Modulations on the sixth scale degree without using the third

***

### noteName2pBelowThird

> **noteName2pBelowThird**: `string`

Defined in: [models/Jins.ts:349](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L349)

The note name of the second degree (plus variations)
