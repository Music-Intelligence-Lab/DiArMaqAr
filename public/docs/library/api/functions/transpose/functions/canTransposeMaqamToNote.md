---
url: /docs/library/api/functions/transpose/functions/canTransposeMaqamToNote.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/transpose](../README.md) / canTransposeMaqamToNote

# Function: canTransposeMaqamToNote()

> **canTransposeMaqamToNote**(`tuningSystem`, `startingNote`, `maqamData`, `targetFirstNote`, `centsTolerance`): `boolean`

Defined in: [functions/transpose.ts:444](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/transpose.ts#L444)

Determines whether a maqām can be successfully transposed to a specific target note.

This function validates transposition feasibility by analyzing the source maqām's interval
pattern and checking if the target tuning system contains the necessary pitch classes to
reconstruct the complete maqām sequence starting from the specified target note. It uses
recursive sequence building to ensure all required intervals can be matched within the
specified cents tolerance.

The algorithm extracts the source maqām's tahlīl (analysis), derives its interval pattern,
and attempts to rebuild the sequence starting from the target note. This validation is
essential for preventing incomplete or invalid transpositions in the user interface.

## Parameters

### tuningSystem

[`default`](../../../models/TuningSystem/classes/default.md)

The tuning system containing the available pitch classes

### startingNote

`string`

The original starting note of the maqām in its current position

### maqamData

[`default`](../../../models/Maqam/classes/default.md)

The maqām object containing the tahlīl and structural information

### targetFirstNote

`string`

The desired starting note for the transposed maqām

### centsTolerance

`number` = `5`

Maximum allowed deviation in cents for interval matching (default: 5)

## Returns

`boolean`

true if the maqām can be completely transposed to the target note, false otherwise
