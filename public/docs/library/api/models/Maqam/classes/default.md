---
url: /docs/library/api/models/Maqam/classes/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / default

# Class: default

Defined in: [models/Maqam.ts:54](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L54)

Represents the raw, tuning-system-independent definition of a maqam.

A maqam is a complete modal framework that differs from ajnas in its scope and
structure, representing a comprehensive melodic system rather than a building block
component. Each maqām contains both an ascending sequence (ṣuʿūd) and a descending
sequence (hubūṭ) of note names, both consisting of seven or more notes that can be
either identical (symmetric) or different (asymmetric).

MaqamData contains only abstract note names without connection to specific pitch
classes or tuning systems, serving as the "template" or "blueprint" of a maqam
as it would appear in theoretical texts or JSON data files. To create an actual
playable maqam with specific pitches, this data must be combined with a tuning
system through the getTahlil() method to produce a Maqam interface instance.

**Key Features**:

* **Bidirectional sequences**: Separate ascending (ṣuʿūd) and descending (hubūṭ) paths
* **Asymmetrical structure**: Platform visually distinguishes notes appearing only in
  descending sequences
* **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns within
  both sequences using cents tolerance matching
* **suyur integration**: Traditional melodic development pathways defining performance practice

**Key Distinction**: MaqamData contains only note names (cultural/theoretical
identifiers), while the Maqam interface contains actual pitch classes with
frequencies and intervallic relationships within a specific tuning system.

## Constructors

### Constructor

> **new default**(`id`, `name`, `ascendingNoteNames`, `descendingNoteNames`, `suyur`, `commentsEnglish`, `commentsArabic`, `sourcePageReferences`, `version?`): `MaqamData`

Defined in: [models/Maqam.ts:111](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L111)

Creates a new MaqamData instance with abstract note names.

#### Parameters

##### id

`string`

Unique identifier for this maqam

##### name

`string`

Name of the maqam (e.g., "Maqam Farahfazza")

##### ascendingNoteNames

`string`\[]

Ascending sequence (ṣuʿūd) of note names

##### descendingNoteNames

`string`\[]

Descending sequence (hubūṭ) of note names

##### suyur

[`Sayr`](../interfaces/Sayr.md)\[]

Traditional melodic development pathways

##### commentsEnglish

`string`

English description or comments

##### commentsArabic

`string`

Arabic description or comments

##### sourcePageReferences

`SourcePageReference`\[]

References to source documents

##### version?

`string`

ISO 8601 timestamp of last modification (defaults to current time)

#### Returns

`MaqamData`

## Methods

### getId()

> **getId**(): `string`

Defined in: [models/Maqam.ts:139](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L139)

Gets the unique identifier of this maqam.

#### Returns

`string`

The maqam ID

***

### getIdName()

> **getIdName**(): `string`

Defined in: [models/Maqam.ts:143](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L143)

#### Returns

`string`

***

### getName()

> **getName**(): `string`

Defined in: [models/Maqam.ts:152](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L152)

Gets the name of this maqam.

#### Returns

`string`

The maqam name

***

### getAscendingNoteNames()

> **getAscendingNoteNames**(): `string`\[]

Defined in: [models/Maqam.ts:165](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L165)

Gets the ascending sequence (ṣuʿūd) note names.

These are abstract cultural identifiers without connection to specific
pitch frequencies. To get actual playable pitches, use getTahlil() with
a specific tuning system.

#### Returns

`string`\[]

Array of ascending note names

***

### getDescendingNoteNames()

> **getDescendingNoteNames**(): `string`\[]

Defined in: [models/Maqam.ts:177](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L177)

Gets the descending sequence (hubūṭ) note names.

These may differ from ascending names in asymmetric maqamat, creating
distinctive directional characteristics that are essential to the maqam's identity.

#### Returns

`string`\[]

Array of descending note names

***

### getSuyur()

> **getSuyur**(): [`Sayr`](../interfaces/Sayr.md)\[]

Defined in: [models/Maqam.ts:190](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L190)

Gets the suyur (traditional melodic development pathways).

suyur define how the maqam unfolds in performance practice, going beyond
basic ascending/descending sequences to describe characteristic progressions,
emphasis points, and developmental patterns.

#### Returns

[`Sayr`](../interfaces/Sayr.md)\[]

Array of sayr objects

***

### getCommentsEnglish()

> **getCommentsEnglish**(): `string`

Defined in: [models/Maqam.ts:199](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L199)

Gets the English-language comments for this maqam.

#### Returns

`string`

English comments

***

### getCommentsArabic()

> **getCommentsArabic**(): `string`

Defined in: [models/Maqam.ts:208](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L208)

Gets the Arabic-language comments for this maqam.

#### Returns

`string`

Arabic comments

***

### getSourcePageReferences()

> **getSourcePageReferences**(): `SourcePageReference`\[]

Defined in: [models/Maqam.ts:217](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L217)

Gets the source page references for this maqam.

#### Returns

`SourcePageReference`\[]

Array of source page references

***

### getVersion()

> **getVersion**(): `string`

Defined in: [models/Maqam.ts:226](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L226)

Gets the version timestamp of this maqam.

#### Returns

`string`

ISO 8601 timestamp string

***

### setVersion()

> **setVersion**(`version`): `void`

Defined in: [models/Maqam.ts:235](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L235)

Sets the version timestamp of this maqam.

#### Parameters

##### version

`string`

ISO 8601 timestamp string

#### Returns

`void`

***

### isMaqamSymmetric()

> **isMaqamSymmetric**(): `boolean`

Defined in: [models/Maqam.ts:249](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L249)

Checks if this maqam has symmetric ascending and descending sequences.

A symmetric maqam has identical ascending and descending sequences when the
descending sequence is reversed. Asymmetric maqamat have different note patterns
for ascent and descent, creating distinctive directional characteristics that
are visually distinguished in the platform interface.

#### Returns

`boolean`

True if the maqam is symmetric, false if asymmetric

***

### isMaqamPossible()

> **isMaqamPossible**(`allNoteNames`): `boolean`

Defined in: [models/Maqam.ts:279](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L279)

Checks if this maqam can be constructed within a given tuning system.

A maqam is only selectable/constructible if ALL note names in BOTH its
ascending and descending sequences exist within the tuning system's available
pitch classes. The platform searches across all four octaves when determining
compatibility, similar to ajnas but with the additional requirement that both
directional sequences must be fully supported.

For example, in Al-Kindī's tuning system:

* Maqam Farahfazza (yegah → dūgāh ascending, dūgāh → yegah descending) ✓ CAN be constructed
* A hypothetical maqam requiring "nīm ḥusaynī" ✗ CANNOT because Al-Kindī's system lacks this note

#### Parameters

##### allNoteNames

`string`\[]

All note names available in the tuning system

#### Returns

`boolean`

True if all required note names are available in both sequences, false otherwise

***

### getTahlil()

> **getTahlil**(`allPitchClasses`): [`Maqam`](../interfaces/Maqam.md)

Defined in: [models/Maqam.ts:306](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L306)

Converts this abstract maqam into a concrete, playable tahlil (original form).

This is the crucial method that bridges the gap between abstract note names
and actual musical pitches. It processes both ascending and descending sequences
separately, matching note names with corresponding pitch classes from a specific
tuning system, creating a Maqam interface instance with:

* Actual frequency values for both sequences
* Intervallic relationships between consecutive pitches in both directions
* Playable musical content with directional characteristics
* Foundation for embedded ajnas analysis and suyur transposition

The resulting Maqam represents the "tahlil" (original/root form) of the maqam,
as opposed to "taswir" (transpositions) which would start from different
pitch classes but maintain the same intervallic patterns and directional structure.

#### Parameters

##### allPitchClasses

[`default`](../../PitchClass/interfaces/default.md)\[]

All pitch classes available in the tuning system

#### Returns

[`Maqam`](../interfaces/Maqam.md)

Maqam interface instance with concrete pitches and intervals

***

### createMaqamWithNewSuyur()

> **createMaqamWithNewSuyur**(`newsuyur`): `MaqamData`

Defined in: [models/Maqam.ts:332](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L332)

Creates a copy of this maqam with new suyur pathways.

This method preserves all other properties while allowing for suyur
modifications, useful for exploring different performance traditions
or creating variants with alternative melodic development patterns.

#### Parameters

##### newsuyur

[`Sayr`](../interfaces/Sayr.md)\[]

New suyur pathways to use in the copy

#### Returns

`MaqamData`

New MaqamData instance with updated suyur

***

### createMaqamWithNewSourcePageReferences()

> **createMaqamWithNewSourcePageReferences**(`newSourcePageReferences`): `MaqamData`

Defined in: [models/Maqam.ts:351](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L351)

Creates a copy of this maqam with new source page references.

#### Parameters

##### newSourcePageReferences

`SourcePageReference`\[]

New source page references to use

#### Returns

`MaqamData`

New MaqamData instance with updated references

***

### convertToObject()

> **convertToObject**(): [`MaqamDataInterface`](../interfaces/MaqamDataInterface.md)

Defined in: [models/Maqam.ts:369](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L369)

Converts this MaqamData to a plain object for JSON serialization.

#### Returns

[`MaqamDataInterface`](../interfaces/MaqamDataInterface.md)

Plain object representation suitable for JSON storage

## Properties

### ascendingPitchClasses

> **ascendingPitchClasses**: `any`

Defined in: [models/Maqam.ts:96](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L96)

Legacy property - consider removing in future refactoring
