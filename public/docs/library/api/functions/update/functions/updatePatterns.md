---
url: /docs/library/api/functions/update/functions/updatePatterns.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/update](../README.md) / updatePatterns

# Function: updatePatterns()

> **updatePatterns**(`patterns`, `modifiedIds?`): `Promise`<`void`>

Defined in: [functions/update.ts:257](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/update.ts#L257)

Updates the patterns data by sending a PUT request to the API.

This function takes an array of Pattern objects, sorts them by ID,
and sends them to the backend API for persistent storage. Patterns
represent recurring musical structures and melodic formulas used
in maqam analysis.
Automatically updates the version timestamp only for modified patterns.

## Parameters

### patterns

[`default`](../../../models/Pattern/classes/default.md)\[]

Array of Pattern objects to update

### modifiedIds?

`string`\[]

Optional array of IDs that were actually modified (gets timestamp update)

## Returns

`Promise`<`void`>

## Throws

Error if the API request fails or returns a non-OK status
