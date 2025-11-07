---
url: /docs/library/api/models/Maqam/interfaces/Sayr.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Maqam](../README.md) / Sayr

# Interface: Sayr

Defined in: [models/Maqam.ts:394](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L394)

Represents a structured melodic development pathway (sayr) within a maqam.

suyur (plural of sayr) represent traditional melodic development pathways that
define how a maqam unfolds in performance practice, going beyond basic ascending
and descending sequences to describe characteristic melodic progressions,
emphasis points, and developmental patterns. When a maqām is transposed, the
platform automatically transposes its associated sayr by converting note names
and adjusting jins and maqām references to their transposed equivalents.

## Properties

### id

> **id**: `string`

Defined in: [models/Maqam.ts:396](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L396)

Unique identifier for this sayr

***

### creatorEnglish

> **creatorEnglish**: `string`

Defined in: [models/Maqam.ts:399](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L399)

English name of the sayr's creator/documenter

***

### creatorArabic

> **creatorArabic**: `string`

Defined in: [models/Maqam.ts:402](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L402)

Arabic name of the sayr's creator/documenter

***

### sourceId

> **sourceId**: `string`

Defined in: [models/Maqam.ts:405](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L405)

ID of the source document where this sayr is documented

***

### page

> **page**: `string`

Defined in: [models/Maqam.ts:408](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L408)

Page reference within the source document

***

### commentsEnglish

> **commentsEnglish**: `string`

Defined in: [models/Maqam.ts:411](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L411)

English comments about this sayr

***

### commentsArabic

> **commentsArabic**: `string`

Defined in: [models/Maqam.ts:414](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L414)

Arabic comments about this sayr

***

### stops

> **stops**: [`SayrStop`](SayrStop.md)\[]

Defined in: [models/Maqam.ts:417](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L417)

Array of stops defining the melodic development pathway

***

### version?

> `optional` **version**: `string`

Defined in: [models/Maqam.ts:420](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Maqam.ts#L420)

ISO 8601 timestamp of last modification
