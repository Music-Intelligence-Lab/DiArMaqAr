---
url: /docs/library/api/models/TuningSystem/classes/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/TuningSystem](../README.md) / default

# Class: default

Defined in: [models/TuningSystem.ts:20](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L20)

Represents a tuning system used in Arabic maqam music theory.

A tuning system is a comprehensive framework that defines the available pitch relationships
within an octave and their cultural context. Following historical precedents like Al-Kindī's
12-tone system from 874 CE, each tuning system contains:

1. **Pitch Classes**: Mathematical intervals defining available pitches (ratios or cents)
2. **Note Names**: Cultural vocabulary for identifying each pitch (rāst, dūgāh, segāh, etc.)
3. **Reference Frequency**: Converts mathematical ratios into actual frequencies for synthesis

The system supports multiple octaves (below and above the primary octave) which is crucial
for jins and maqam analysis. Since each pitch class has both relational and absolute values,
all other representations can be derived through conversion formulas.

## Constructors

### Constructor

> **new default**(`titleEnglish`, `titleArabic`, `year`, `sourceEnglish`, `sourceArabic`, `SourcePageReferences`, `creatorEnglish`, `creatorArabic`, `commentsEnglish`, `commentsArabic`, `originalPitchClassValues`, `noteNameSets`, `abjadNames`, `stringLength`, `referenceFrequencies`, `defaultReferenceFrequency`, `saved`, `version?`): `TuningSystem`

Defined in: [models/TuningSystem.ts:115](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L115)

Creates a new TuningSystem instance.

#### Parameters

##### titleEnglish

`string`

English title of the tuning system

##### titleArabic

`string`

Arabic title of the tuning system

##### year

`string`

Year the system was documented or created

##### sourceEnglish

`string`

English name of the source document

##### sourceArabic

`string`

Arabic name of the source document

##### SourcePageReferences

`SourcePageReference`\[]

Array of page references within the source

##### creatorEnglish

`string`

English name of the creator/theorist

##### creatorArabic

`string`

Arabic name of the creator/theorist

##### commentsEnglish

`string`

Additional English comments

##### commentsArabic

`string`

Additional Arabic comments

##### originalPitchClassValues

`string`\[]

Raw input values (ratios, decimals, or cents as strings)

##### noteNameSets

`string`\[]\[]

Arrays of note names corresponding to pitch classes

##### abjadNames

`string`\[]

Traditional Arabic alphabetical names

##### stringLength

`number`

String length parameter for instruments

##### referenceFrequencies

Mapping of note names to reference frequencies

##### defaultReferenceFrequency

`number`

Default frequency anchor (e.g., 440 Hz)

##### saved

`boolean`

Whether the system has been saved to storage

##### version?

`string`

ISO 8601 timestamp of last modification (defaults to current time)

#### Returns

`TuningSystem`

## Methods

### getId()

> **getId**(): `string`

Defined in: [models/TuningSystem.ts:162](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L162)

Gets the unique identifier for this tuning system.

#### Returns

`string`

Unique ID string generated from creator, year, and title

***

### getTitleEnglish()

> **getTitleEnglish**(): `string`

Defined in: [models/TuningSystem.ts:171](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L171)

Gets the English title of the tuning system.

#### Returns

`string`

English title

***

### getTitleArabic()

> **getTitleArabic**(): `string`

Defined in: [models/TuningSystem.ts:180](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L180)

Gets the Arabic title of the tuning system.

#### Returns

`string`

Arabic title

***

### getYear()

> **getYear**(): `string`

Defined in: [models/TuningSystem.ts:189](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L189)

Gets the year the tuning system was documented or created.

#### Returns

`string`

Year as string

***

### getSourceEnglish()

> **getSourceEnglish**(): `string`

Defined in: [models/TuningSystem.ts:198](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L198)

Gets the English name of the source document.

#### Returns

`string`

English source name

***

### getSourceArabic()

> **getSourceArabic**(): `string`

Defined in: [models/TuningSystem.ts:207](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L207)

Gets the Arabic name of the source document.

#### Returns

`string`

Arabic source name

***

### getSourcePageReferences()

> **getSourcePageReferences**(): `SourcePageReference`\[]

Defined in: [models/TuningSystem.ts:216](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L216)

Gets the page references within the source document.

#### Returns

`SourcePageReference`\[]

Array of page references

***

### getCreatorEnglish()

> **getCreatorEnglish**(): `string`

Defined in: [models/TuningSystem.ts:225](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L225)

Gets the English name of the tuning system's creator.

#### Returns

`string`

Creator's English name

***

### getCreatorArabic()

> **getCreatorArabic**(): `string`

Defined in: [models/TuningSystem.ts:234](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L234)

Gets the Arabic name of the tuning system's creator.

#### Returns

`string`

Creator's Arabic name

***

### getCommentsEnglish()

> **getCommentsEnglish**(): `string`

Defined in: [models/TuningSystem.ts:243](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L243)

Gets additional English comments about the tuning system.

#### Returns

`string`

English comments

***

### getCommentsArabic()

> **getCommentsArabic**(): `string`

Defined in: [models/TuningSystem.ts:252](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L252)

Gets additional Arabic comments about the tuning system.

#### Returns

`string`

Arabic comments

***

### getOriginalPitchClassValues()

> **getOriginalPitchClassValues**(): `string`\[]

Defined in: [models/TuningSystem.ts:267](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L267)

Gets the original pitch class values as inputted by the user.

These are raw string values representing mathematical intervals in their
original format (e.g., "9/8" for fractional ratios, "1.125" for decimals,
or "204.0" for cents). They are NOT PitchClass objects but preserve the
exact format as entered, allowing the system to maintain mathematical
precision and cultural authenticity of historical tuning descriptions.

#### Returns

`string`\[]

Array of original pitch class values as strings

***

### getNoteNameSets()

> **getNoteNameSets**(): `string`\[]\[]

Defined in: [models/TuningSystem.ts:276](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L276)

Gets the sets of note names.

#### Returns

`string`\[]\[]

Array of note name sets

***

### getAbjadNames()

> **getAbjadNames**(): `string`\[]

Defined in: [models/TuningSystem.ts:285](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L285)

Gets the traditional abjad (Arabic alphabetical) names for pitch classes.

#### Returns

`string`\[]

Array of abjad names

***

### getStringLength()

> **getStringLength**(): `number`

Defined in: [models/TuningSystem.ts:294](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L294)

Gets the string length parameter for instruments (if applicable).

#### Returns

`number`

String length value

***

### getReferenceFrequencies()

> **getReferenceFrequencies**(): `object`

Defined in: [models/TuningSystem.ts:306](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L306)

Gets the mapping of note names to their reference frequencies.

This allows different notes within the system to serve as frequency
anchors for tuning and synthesis purposes.

#### Returns

`object`

Object mapping note names to frequencies in Hz

***

### getDefaultReferenceFrequency()

> **getDefaultReferenceFrequency**(): `number`

Defined in: [models/TuningSystem.ts:319](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L319)

Gets the default reference frequency for the tuning system.

This is the primary frequency anchor (e.g., 440 Hz for A4 in Western music,
or 110 Hz for ʿushayrān in Al-Kindī's system) used to convert mathematical
ratios into actual audible frequencies.

#### Returns

`number`

Default reference frequency in Hz

***

### isSaved()

> **isSaved**(): `boolean`

Defined in: [models/TuningSystem.ts:328](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L328)

Checks whether this tuning system has been saved to persistent storage.

#### Returns

`boolean`

True if saved, false otherwise

***

### getVersion()

> **getVersion**(): `string`

Defined in: [models/TuningSystem.ts:337](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L337)

Gets the version timestamp of this tuning system.

#### Returns

`string`

ISO 8601 timestamp string

***

### setVersion()

> **setVersion**(`version`): `void`

Defined in: [models/TuningSystem.ts:346](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L346)

Sets the version timestamp of this tuning system.

#### Parameters

##### version

`string`

ISO 8601 timestamp string

#### Returns

`void`

***

### stringify()

> **stringify**(): `string`

Defined in: [models/TuningSystem.ts:357](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L357)

Creates a string representation of the tuning system for display purposes.

Format: "Creator (Year) Title" (e.g., "Al-Kindī (874) 12-tone System")

#### Returns

`string`

Formatted string representation

***

### getNoteNameSetsWithAdjacentOctaves()

> **getNoteNameSetsWithAdjacentOctaves**(): `string`\[]\[]

Defined in: [models/TuningSystem.ts:371](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L371)

Gets note name sets expanded to include octaves above and below.

This method is crucial for jins and maqam analysis as it provides access
to pitch classes in multiple octaves. Each note name set is expanded to
include the octave below (-1) and the octave above (+1) the primary octave,
giving analysts access to a three-octave range for comprehensive modal analysis.

#### Returns

`string`\[]\[]

Expanded note name sets with three octaves of coverage

***

### copyWithNewNoteNameSets()

> **copyWithNewNoteNameSets**(`newNoteNames`): `TuningSystem`

Defined in: [models/TuningSystem.ts:385](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L385)

Creates a copy of this tuning system with new note name sets.

#### Parameters

##### newNoteNames

`string`\[]\[]

New note name sets to use in the copy

#### Returns

`TuningSystem`

New TuningSystem instance with updated note names

***

### createBlankTuningSystem()

> `static` **createBlankTuningSystem**(): `TuningSystem`

Defined in: [models/TuningSystem.ts:417](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/TuningSystem.ts#L417)

Creates a blank/default tuning system for initialization purposes.

This factory method creates an empty tuning system with placeholder values
in both English and Arabic. Useful for initializing the interface before
users input their own tuning system data or when creating templates for
new systems.

#### Returns

`TuningSystem`

A new TuningSystem instance with default placeholder values
