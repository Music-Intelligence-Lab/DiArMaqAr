---
url: /docs/library/api/functions/calculateNumberOfModulations/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/calculateNumberOfModulations](../README.md) / default

# Function: default()

> **default**(`modulations`, `type`): `number`

Defined in: [functions/calculateNumberOfModulations.ts:13](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/calculateNumberOfModulations.ts#L13)

Calculates the total number of modulations in a modulations object.

## Parameters

### modulations

The modulations object containing arrays of possible modulations

[`AjnasModulations`](../../../models/Jins/interfaces/AjnasModulations.md) | [`MaqamatModulations`](../../../models/Maqam/interfaces/MaqamatModulations.md)

### type

`ModulationType` = `"all"`

Filter type: 'all' (default) counts everything, 'ajnas' only counts jins modulations, 'maqamat' only counts maqam modulations

## Returns

`number`

The total count of modulations matching the specified type
