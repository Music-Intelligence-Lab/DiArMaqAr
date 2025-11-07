---
url: /docs/library/api/functions/scala-export/functions/exportMaqamToScalaKeymap.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/scala-export](../README.md) / exportMaqamToScalaKeymap

# Function: exportMaqamToScalaKeymap()

> **exportMaqamToScalaKeymap**(`maqamInput`, `tuningSystem`, `startingNote?`, `useAscending?`, `referenceNote?`, `referenceFrequency?`, `mapSize?`): `string`

Defined in: [functions/scala-export.ts:319](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/scala-export.ts#L319)

Exports a maqam to Scala keymap (.kbm) format

## Parameters

### maqamInput

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md) | [`default`](../../../models/Maqam/classes/default.md)

### tuningSystem

[`default`](../../../models/TuningSystem/classes/default.md)

### startingNote?

`string`

### useAscending?

`boolean` = `true`

### referenceNote?

`string`

### referenceFrequency?

`number`

### mapSize?

`number`

## Returns

`string`
