---
url: /docs/library/api/functions/update/functions/updateSources.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/update](../README.md) / updateSources

# Function: updateSources()

> **updateSources**(`sources`, `modifiedIds?`): `Promise`<`void`>

Defined in: [functions/update.ts:211](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/update.ts#L211)

Updates the sources (bibliographical references) data by sending a PUT request to the API.

This function takes an array of Source objects, sorts them by ID,
and sends them to the backend API for persistent storage. Sources include
books, articles, and other references used in maqam research.
Automatically updates the version timestamp only for modified sources.

## Parameters

### sources

`Source`\[]

Array of Source objects to update

### modifiedIds?

`string`\[]

Optional array of IDs that were actually modified (gets timestamp update)

## Returns

`Promise`<`void`>

## Throws

Error if the API request fails or returns a non-OK status
