---
url: >-
  /docs/library/api/functions/generate-analytics/functions/generateAndWriteAnalytics.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/generate-analytics](../README.md) / generateAndWriteAnalytics

# Function: generateAndWriteAnalytics()

> **generateAndWriteAnalytics**(`useTimestamp`, `showProgress`): `string`

Defined in: [functions/generate-analytics.ts:109](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/generate-analytics.ts#L109)

Generates comprehensive statistics for all tuning systems and writes the results to a JSON file.

This function computes statistics for every available tuning system, combining the results
into a single dataset that can be used for comparative analysis. The output is written
to 'public/data/statistics-\[timestamp].json' for use by the web application.

The statistics include metrics such as:

* Number of possible ajnas and maqamat per tuning system
* Transposition possibilities
* Modulation counts
* Total number of available suyur (melodic progressions)

## Parameters

### useTimestamp

`boolean` = `true`

Whether to include timestamp in filename (default: true)

### showProgress

`boolean` = `true`

Whether to show progress logging (default: true)

## Returns

`string`

The path of the created file
