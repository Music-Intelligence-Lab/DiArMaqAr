---
url: /docs/library/api/functions/classifyMaqamFamily/functions/getBaseJinsName.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/classifyMaqamFamily](../README.md) / getBaseJinsName

# Function: getBaseJinsName()

> **getBaseJinsName**(`jinsName`): `string`

Defined in: [functions/classifyMaqamFamily.ts:50](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/classifyMaqamFamily.ts#L50)

Extracts base jins name from full jins name.

Removes transposition suffixes (e.g., " al-rast") and "Jins " prefix,
then applies special case logic for compound jins names.

Special Cases:

* "ṣabā zamzam" kept separate from "ṣabā"
* "athar kurd" kept separate from "athar"
* "awj ʾārāʾ" kept separate from "awj"

For all other jins, groups by first word.

## Parameters

### jinsName

`string`

Full jins name (e.g., "Jins Rast al-rast")

## Returns

`string`

Base family name (e.g., "rast")

## Example

```ts
getBaseJinsName("Jins Rast al-rast") // returns "rast"
getBaseJinsName("Jins ṣabā zamzam al-dūkāh") // returns "ṣabā zamzam"
getBaseJinsName("Jins Bayyāt al-dūkāh") // returns "bayyāt"
```
