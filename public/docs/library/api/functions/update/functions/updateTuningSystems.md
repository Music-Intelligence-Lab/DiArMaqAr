---
url: /docs/library/api/functions/update/functions/updateTuningSystems.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/update](../README.md) / updateTuningSystems

# Function: updateTuningSystems()

> **updateTuningSystems**(`newSystems`, `modifiedIds?`): `Promise`<`void`>

Defined in: [functions/update.ts:33](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/update.ts#L33)

Updates the tuning systems data by sending a PUT request to the API.

This function takes an array of TuningSystem objects, sorts them by ID,
serializes them to JSON format, and sends them to the backend API
for persistent storage. It handles the conversion of TuningSystem
instances to plain objects suitable for JSON serialization.
Automatically updates the version timestamp only for modified tuning systems.

## Parameters

### newSystems

[`default`](../../../models/TuningSystem/classes/default.md)\[]

Array of TuningSystem objects to update

### modifiedIds?

`string`\[]

Optional array of IDs that were actually modified (gets timestamp update)

## Returns

`Promise`<`void`>

## Throws

Error if the API request fails or returns a non-OK status
