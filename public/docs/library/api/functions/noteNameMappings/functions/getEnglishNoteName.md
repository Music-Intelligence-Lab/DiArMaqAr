---
url: /docs/library/api/functions/noteNameMappings/functions/getEnglishNoteName.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/noteNameMappings](../README.md) / getEnglishNoteName

# Function: getEnglishNoteName()

> **getEnglishNoteName**(`arabicName`, `opts?`): `string`

Defined in: [functions/noteNameMappings.ts:384](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/noteNameMappings.ts#L384)

Converts an Arabic note name to its International Pitch Notation equivalent.

Provides bidirectional cultural translation between Arabic maqām nomenclature
(e.g., rāst, dūgāh, segāh) and Western International Pitch Notation (e.g., G3, A3, B-b3).

Optionally avoids repeating diatonic letters when provided with the previous note,
following Western notation conventions for melodic sequences. For example, if the
previous note was "C3" and the mapping returns "C#3", it will swap to "Db3" to
avoid consecutive C letters.

## Parameters

### arabicName

`string`

The Arabic note name to convert (from NoteName model)

### opts?

[`EnglishNameOptions`](../type-aliases/EnglishNameOptions.md)

Optional conversion options

## Returns

`string`

The International Pitch Notation equivalent, or "--" if not found

## Example

```typescript
getEnglishNoteName("rāst");           // "G3"
getEnglishNoteName("dūgāh");          // "A3"
getEnglishNoteName("segāh-b");        // "Bb3"

// Avoiding letter repetition:
getEnglishNoteName("rāst-#", { prevEnglish: "G3" });  // "Ab3" instead of "G#3"
```
