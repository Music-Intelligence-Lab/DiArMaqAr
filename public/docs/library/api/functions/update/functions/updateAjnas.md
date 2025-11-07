---
url: /docs/library/api/functions/update/functions/updateAjnas.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/update](../README.md) / updateAjnas

# Function: updateAjnas()

> **updateAjnas**(`newAjnas`, `modifiedIds?`): `Promise`<`void`>

Defined in: [functions/update.ts:104](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/update.ts#L104)

Updates the ajnas data by sending a PUT request to the API.

This function takes an array of JinsData objects, sorts them by ID,
and sends them to the backend API for persistent storage. It converts
JinsData instances to the appropriate JSON format for database storage.
Automatically updates the version timestamp only for modified ajnas.

## Parameters

### newAjnas

[`default`](../../../models/Jins/classes/default.md)\[]

Array of JinsData objects to update

### modifiedIds?

`string`\[]

Optional array of IDs that were actually modified (gets timestamp update)

## Returns

`Promise`<`void`>

## Throws

Error if the API request fails or returns a non-OK status
