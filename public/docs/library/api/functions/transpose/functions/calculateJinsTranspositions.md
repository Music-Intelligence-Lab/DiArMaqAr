---
url: /docs/library/api/functions/transpose/functions/calculateJinsTranspositions.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/transpose](../README.md) / calculateJinsTranspositions

# Function: calculateJinsTranspositions()

> **calculateJinsTranspositions**(`allPitchClasses`, `jinsData`, `withTahlil`, `centsTolerance`, `onlyOctaveOne`): [`Jins`](../../../models/Jins/interfaces/Jins.md)\[]

Defined in: [functions/transpose.ts:389](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/transpose.ts#L389)

Jins Transposition Analysis

Finds all possible transpositions of a jins within available pitch classes. This function
analyzes a jins interval pattern and systematically searches for all valid starting positions
where the complete sequence can be realized within the tuning system.

Algorithmic Operation:

1. **Pattern Extraction**: Extracts intervallic fingerprint from the source jins
2. **Systematic Search**: Tests all possible starting positions within tuning system
3. **Interval Matching**: Uses appropriate matching criteria (exact ratios vs fuzzy cents)
4. **Octave Filtering**: Ensures transpositions remain within valid octave bounds
5. **Tahlil Handling**: Optionally includes or excludes the original analytical position

Naming Conventions:
Follows traditional Arabic nomenclature: "\[jins name] al-\[starting note]"
Example: "jins kurd al-muhayyar" for kurd jins transposed to start on muhayyar

Unlike maqām transpositions, ajnās have only a single non-directional sequence,
so no bidirectional merging is required.

## Parameters

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete tuning system to search within

### jinsData

Source jins data to find transpositions for

[`default`](../../../models/Jins/classes/default.md) | `null`

### withTahlil

`boolean`

Include original analytical position in results

### centsTolerance

`number` = `5`

Tolerance for interval matching (default: ±5 cents JND)

### onlyOctaveOne

`boolean` = `false`

Restrict search to first octave only

## Returns

[`Jins`](../../../models/Jins/interfaces/Jins.md)\[]

Array of all possible jins transpositions following traditional naming
