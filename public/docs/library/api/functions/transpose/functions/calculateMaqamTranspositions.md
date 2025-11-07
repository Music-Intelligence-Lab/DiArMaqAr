---
url: >-
  /docs/library/api/functions/transpose/functions/calculateMaqamTranspositions.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/transpose](../README.md) / calculateMaqamTranspositions

# Function: calculateMaqamTranspositions()

> **calculateMaqamTranspositions**(`allPitchClasses`, `allAjnas`, `maqamData`, `withTahlil`, `centsTolerance`, `onlyOctaveOne`): [`Maqam`](../../../models/Maqam/interfaces/Maqam.md)\[]

Defined in: [functions/transpose.ts:201](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/transpose.ts#L201)

Maqām Transposition Analysis

Comprehensive Maqām Analysis:

1. **Bidirectional Processing**: Analyzes ascending and descending sequences separately,
   accounting for maqāmāt that employ different intervallic patterns in each direction

2. **Embedded Jins Recognition**: Automatically identifies and transposes all constituent
   ajnās within each maqām transposition, creating complete analytical structures

3. **Octave Extension**: Accurately extends sequences across octave boundaries to
   ensure complete jins recognition and proper intervallic analysis

4. **Tahlil vs Taswir**: Distinguishes between analytical (tahlil) and transposed (taswir)
   positions, following traditional Arabic music theory terminology

Algorithmic Precision:

* **Pattern Matching**: Extracts intervallic fingerprints from original maqām structure
* **Systematic Search**: Tests all possible starting positions within tuning system
* **Tolerance Handling**: Uses appropriate matching criteria (exact ratios vs fuzzy cents)
* **Bounds Checking**: Ensures transpositions remain within practical octave limits

Naming Conventions:
Follows traditional Arabic nomenclature: "maqām \[name] al-\[starting note]"
Example: "maqām bayyātī al-nawā" for bayyātī transposed to start on nawā

## Parameters

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete tuning system pitch classes to search within

### allAjnas

[`default`](../../../models/Jins/classes/default.md)\[]

Available ajnās for embedded jins recognition

### maqamData

Source maqām to find transpositions for

[`default`](../../../models/Maqam/classes/default.md) | `null`

### withTahlil

`boolean`

Include analytical (original) position in results

### centsTolerance

`number` = `5`

Tolerance for fuzzy matching (default: ±5 cents JND)

### onlyOctaveOne

`boolean` = `false`

Restrict search to first octave only

## Returns

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md)\[]

Array of all possible maqām transpositions with embedded jins analysis
