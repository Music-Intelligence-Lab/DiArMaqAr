---
url: /docs/library/api/models/Pattern/classes/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Pattern](../README.md) / default

# Class: default

Defined in: [models/Pattern.ts:22](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L22)

Represents a musical pattern in the Arabic maqam system.

A Pattern is a sequence of musical notes with specific durations and scale degrees
that can be used to demonstrate or practice melodic phrases within a maqam.
Each pattern contains notes with scale degrees, rhythmic durations, and target
emphasis information for educational and performance purposes.

## Example

```typescript
const pattern = new Pattern(
  "ascending-basic",
  "Basic Ascending Pattern",
  [
    { scaleDegree: "I", noteDuration: "4n", isTarget: true },
    { scaleDegree: "II", noteDuration: "4n", isTarget: false },
    { scaleDegree: "III", noteDuration: "4n", isTarget: true }
  ]
);
```

## Constructors

### Constructor

> **new default**(`id`, `name`, `notes`, `version?`): `Pattern`

Defined in: [models/Pattern.ts:43](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L43)

Creates a new Pattern instance.

#### Parameters

##### id

`string`

Unique identifier for this pattern

##### name

`string`

Human-readable name for this pattern

##### notes

[`PatternNote`](../interfaces/PatternNote.md)\[]

Array of PatternNote objects that define the melodic sequence

##### version?

`string`

ISO 8601 timestamp of last modification (defaults to current time)

#### Returns

`Pattern`

## Methods

### getId()

> **getId**(): `string`

Defined in: [models/Pattern.ts:55](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L55)

Gets the unique identifier of this pattern.

#### Returns

`string`

The pattern's ID

***

### getName()

> **getName**(): `string`

Defined in: [models/Pattern.ts:64](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L64)

Gets the human-readable name of this pattern.

#### Returns

`string`

The pattern's name

***

### getNotes()

> **getNotes**(): [`PatternNote`](../interfaces/PatternNote.md)\[]

Defined in: [models/Pattern.ts:73](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L73)

Gets the array of notes that make up this pattern.

#### Returns

[`PatternNote`](../interfaces/PatternNote.md)\[]

Array of PatternNote objects

***

### getVersion()

> **getVersion**(): `string`

Defined in: [models/Pattern.ts:82](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L82)

Gets the version timestamp of this pattern.

#### Returns

`string`

ISO 8601 timestamp string

***

### setVersion()

> **setVersion**(`version`): `void`

Defined in: [models/Pattern.ts:91](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L91)

Sets the version timestamp of this pattern.

#### Parameters

##### version

`string`

ISO 8601 timestamp string

#### Returns

`void`

***

### convertToJSON()

> **convertToJSON**(): `object`

Defined in: [models/Pattern.ts:103](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L103)

Converts the pattern to a JSON-serializable object.

This method is useful for saving patterns to files, sending them over
network requests, or storing them in databases.

#### Returns

`object`

A plain object representation of the pattern

##### id

> **id**: `string`

##### name

> **name**: `string`

##### notes

> **notes**: [`PatternNote`](../interfaces/PatternNote.md)\[]

##### version

> **version**: `string`
