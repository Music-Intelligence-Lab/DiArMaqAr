---
url: /docs/library/api/models/Maqam/interfaces/SayrStop.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / SayrStop

# Interface: SayrStop

Defined in: [models/Maqam.ts:429](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L429)

Represents a single stop within a sayr (melodic development pathway).

Each stop can represent different types of musical elements that guide
performance practice and melodic development within the maqam.

## Properties

### type

> **type**: `"note"` | `"jins"` | `"maqam"` | `"direction"`

Defined in: [models/Maqam.ts:431](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L431)

Type of stop: specific note, jins fragment, maqam reference, or directional instruction

***

### value

> **value**: `string`

Defined in: [models/Maqam.ts:434](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L434)

The value/identifier for this stop (note name, jins name, maqam name, or direction)

***

### startingNote?

> `optional` **startingNote**: `string`

Defined in: [models/Maqam.ts:437](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L437)

Optional starting note for jins or maqam references

***

### direction?

> `optional` **direction**: `"ascending"` | `"descending"`

Defined in: [models/Maqam.ts:440](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L440)

Optional directional instruction for melodic movement
