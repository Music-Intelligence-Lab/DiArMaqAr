---
url: /docs/library/api/models/Maqam/interfaces/MaqamatModulations.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / MaqamatModulations

# Interface: MaqamatModulations

Defined in: [models/Maqam.ts:546](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L546)

Represents possible modulations (transitions) between different maqamat.

In Arabic maqam theory, modulations occur when transitioning from one maqam to
another within a melodic progression. This interface categorizes modulations
based on which scale degree they occur on and their directional characteristics,
similar to ajnas modulations but operating at the complete modal framework level.

Each property contains an array of possible target maqamat that can be reached
through modulation from a given starting maqam, organized by the scale degree
where the modulation occurs and the melodic direction.

## Properties

### modulationsOnFirstDegree

> **modulationsOnFirstDegree**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:548](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L548)

Modulations that occur on the first scale degree

***

### modulationsOnThirdDegree

> **modulationsOnThirdDegree**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:551](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L551)

Modulations that occur on the third scale degree

***

### modulationsOnAltThirdDegree

> **modulationsOnAltThirdDegree**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:554](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L554)

Modulations that occur on the third scale degree (second pattern)

***

### modulationsOnFourthDegree

> **modulationsOnFourthDegree**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:557](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L557)

Modulations that occur on the fourth scale degree

***

### modulationsOnFifthDegree

> **modulationsOnFifthDegree**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:560](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L560)

Modulations that occur on the fifth scale degree

***

### modulationsOnSixthDegreeAsc

> **modulationsOnSixthDegreeAsc**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:563](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L563)

Ascending modulations that occur on the sixth scale degree

***

### modulationsOnSixthDegreeDesc

> **modulationsOnSixthDegreeDesc**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:566](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L566)

Descending modulations that occur on the sixth scale degree

***

### modulationsOnSixthDegreeIfNoThird

> **modulationsOnSixthDegreeIfNoThird**: [`Maqam`](Maqam.md)\[]

Defined in: [models/Maqam.ts:569](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L569)

Modulations on the sixth scale degree without using the third

***

### noteName2pBelowThird

> **noteName2pBelowThird**: `string`

Defined in: [models/Maqam.ts:572](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L572)

The note name of the second degree (plus variations)
