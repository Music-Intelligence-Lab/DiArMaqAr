---
url: /docs/library/api/models/Jins/classes/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Jins](../README.md) / default

# Class: default

Defined in: [models/Jins.ts:41](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L41)

Represents the raw, tuning-system-independent definition of a jins.

A jins is a melodic fragment typically consisting of three to five pitch classes
that serves as a fundamental building block for constructing maqāmāt. JinsData
contains only the abstract note names (dūgāh, kurdī, chahārgāh, etc.) without
any connection to specific pitch classes or tuning systems.

This class represents the "template" or "blueprint" of a jins as it would appear
in theoretical texts or JSON data files. To create an actual playable jins with
specific pitches, this data must be combined with a tuning system through the
getTahlil() method to produce a Jins interface instance.

**Key Distinction**: JinsData contains only note names (cultural/theoretical
identifiers), while the Jins interface contains actual pitch classes with
frequencies and intervallic relationships within a specific tuning system.

## Constructors

### Constructor

> **new default**(`id`, `name`, `noteNames`, `commentsEnglish`, `commentsArabic`, `SourcePageReferences`, `version?`): `JinsData`

Defined in: [models/Jins.ts:80](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L80)

Creates a new JinsData instance with abstract note names.

#### Parameters

##### id

`string`

Unique identifier for this jins

##### name

`string`

Name of the jins (e.g., "Jins Kurd")

##### noteNames

`string`\[]

Array of note name strings (not yet typed as NoteName)

##### commentsEnglish

`string`

English description or comments

##### commentsArabic

`string`

Arabic description or comments

##### SourcePageReferences

`SourcePageReference`\[]

References to source documents

##### version?

`string`

ISO 8601 timestamp of last modification (defaults to current time)

#### Returns

`JinsData`

## Methods

### getId()

> **getId**(): `string`

Defined in: [models/Jins.ts:104](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L104)

Gets the unique identifier of this jins.

#### Returns

`string`

The jins ID

***

### getIdName()

> **getIdName**(): `string`

Defined in: [models/Jins.ts:113](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L113)

Gets the standardized ID name of this jins.

#### Returns

`string`

The jins ID name

***

### getName()

> **getName**(): `string`

Defined in: [models/Jins.ts:122](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L122)

Gets the name of this jins.

#### Returns

`string`

The jins name

***

### getNoteNames()

> **getNoteNames**(): `string`\[]

Defined in: [models/Jins.ts:135](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L135)

Gets the array of note names that define this jins.

These are abstract cultural identifiers without connection to specific
pitch frequencies. To get actual playable pitches, use getTahlil() with
a specific tuning system.

#### Returns

`string`\[]

Array of note names

***

### getCommentsEnglish()

> **getCommentsEnglish**(): `string`

Defined in: [models/Jins.ts:144](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L144)

Gets the English-language comments for this jins.

#### Returns

`string`

English comments

***

### getCommentsArabic()

> **getCommentsArabic**(): `string`

Defined in: [models/Jins.ts:153](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L153)

Gets the Arabic-language comments for this jins.

#### Returns

`string`

Arabic comments

***

### getSourcePageReferences()

> **getSourcePageReferences**(): `SourcePageReference`\[]

Defined in: [models/Jins.ts:162](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L162)

Gets the source page references for this jins.

#### Returns

`SourcePageReference`\[]

Array of source page references

***

### getVersion()

> **getVersion**(): `string`

Defined in: [models/Jins.ts:171](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L171)

Gets the version timestamp of this jins.

#### Returns

`string`

ISO 8601 timestamp string

***

### setVersion()

> **setVersion**(`version`): `void`

Defined in: [models/Jins.ts:180](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L180)

Sets the version timestamp of this jins.

#### Parameters

##### version

`string`

ISO 8601 timestamp string

#### Returns

`void`

***

### isJinsPossible()

> **isJinsPossible**(`allNoteNames`): `boolean`

Defined in: [models/Jins.ts:199](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L199)

Checks if this jins can be constructed within a given tuning system.

A jins is only selectable/constructible if ALL of its required note names
exist within the tuning system's available pitch classes. The platform
searches across all four octaves when determining compatibility.

For example, in Al-Kindī's tuning system:

* Jins Kurd (dūgāh, kurdī, chahārgāh, nawā) ✓ CAN be constructed
* Jins Chahārgāh (chahārgāh, nawā, nīm ḥusaynī, ʿajam) ✗ CANNOT because
  Al-Kindī's system lacks "nīm ḥusaynī"

#### Parameters

##### allNoteNames

`string`\[]

All note names available in the tuning system

#### Returns

`boolean`

True if all required note names are available, false otherwise

***

### createJinsWithNewSourcePageReferences()

> **createJinsWithNewSourcePageReferences**(`newSourcePageReferences`): `JinsData`

Defined in: [models/Jins.ts:209](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L209)

Creates a copy of this jins with new source page references.

#### Parameters

##### newSourcePageReferences

`SourcePageReference`\[]

New source page references to use

#### Returns

`JinsData`

New JinsData instance with updated references

***

### getTahlil()

> **getTahlil**(`allPitchClasses`): [`Jins`](../interfaces/Jins.md)

Defined in: [models/Jins.ts:232](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L232)

Converts this abstract jins into a concrete, playable tahlil (original form).

This is the crucial method that bridges the gap between abstract note names
and actual musical pitch classes. It takes the jins's note names and matches them
with corresponding pitch classes from a specific tuning system, creating
a Jins interface instance with:

* Actual frequency values
* Intervallic relationships between pitches
* Playable musical content

The resulting Jins represents the "tahlil" (original/root form) of the jins,
as opposed to "taswir" (transpositions) which would start from different
pitch classes but maintain the same intervallic patterns.

#### Parameters

##### allPitchClasses

[`default`](../../PitchClass/interfaces/default.md)\[]

All pitch classes available in the tuning system

#### Returns

[`Jins`](../interfaces/Jins.md)

Jins interface instance with concrete pitches and intervals

***

### convertToObject()

> **convertToObject**(): [`JinsDataInterface`](../interfaces/JinsDataInterface.md)

Defined in: [models/Jins.ts:249](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Jins.ts#L249)

Converts this JinsData to a plain object for JSON serialization.

#### Returns

[`JinsDataInterface`](../interfaces/JinsDataInterface.md)

Plain object representation suitable for JSON storage
