---
url: /docs/library/api/functions/update/functions/updateMaqamat.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/update](../README.md) / updateMaqamat

# Function: updateMaqamat()

> **updateMaqamat**(`newMaqamat`, `modifiedIds?`): `Promise`<`void`>

Defined in: [functions/update.ts:157](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/update.ts#L157)

Updates the maqamat data by sending a PUT request to the API.

This function takes an array of MaqamData objects, sorts them by ID,
and sends them to the backend API for persistent storage. It handles
the serialization of complex maqam structures including their constituent
ajnas and melodic progressions (suyur).
Automatically updates the version timestamp only for modified maqamat.

## Parameters

### newMaqamat

[`default`](../../../models/Maqam/classes/default.md)\[]

Array of MaqamData objects to update

### modifiedIds?

`string`\[]

Optional array of IDs that were actually modified (gets timestamp update)

## Returns

`Promise`<`void`>

## Throws

Error if the API request fails or returns a non-OK status
