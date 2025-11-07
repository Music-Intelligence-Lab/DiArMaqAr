---
url: /docs/library/api/functions/import/functions/getSources.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/import](../README.md) / getSources

# Function: getSources()

> **getSources**(): `Source`\[]

Defined in: [functions/import.ts:120](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/import.ts#L120)

Imports and instantiates source objects from JSON data.

Creates Source instances (Book, Article, or Thesis) from the raw JSON data.
Uses a factory pattern to create the appropriate subclass based on
the sourceType property in the data.

## Returns

`Source`\[]

Array of Source objects (Books, Articles, and Theses)

## Throws

Error if unknown sourceType is encountered
