---
url: /docs/library/api/models/Pattern/functions/reversePatternNotes.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Pattern](../README.md) / reversePatternNotes

# Function: reversePatternNotes()

> **reversePatternNotes**(`notes`): [`PatternNote`](../interfaces/PatternNote.md)\[]

Defined in: [models/Pattern.ts:255](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L255)

Reverses the melodic direction of a pattern by inverting the scale degrees.

This function creates a retrograde version of a pattern where the scale degrees
are reversed in order while preserving the original rhythmic structure and
target note designations. This is useful for creating variations of existing
patterns or for pedagogical exercises.

The function maintains the same note durations, target designations, and velocity
values in their original positions, but assigns the scale degrees in reverse order.

## Parameters

### notes

[`PatternNote`](../interfaces/PatternNote.md)\[]

Array of PatternNote objects to reverse

## Returns

[`PatternNote`](../interfaces/PatternNote.md)\[]

New array with reversed scale degrees but original rhythmic structure

## Example

```typescript
const original = [
  { scaleDegree: "I", noteDuration: "4n", isTarget: true },
  { scaleDegree: "II", noteDuration: "8n", isTarget: false },
  { scaleDegree: "III", noteDuration: "4n", isTarget: true }
];

const reversed = reversePatternNotes(original);
// Result: [
//   { scaleDegree: "III", noteDuration: "4n", isTarget: true },
//   { scaleDegree: "II", noteDuration: "8n", isTarget: false },
//   { scaleDegree: "I", noteDuration: "4n", isTarget: true }
// ]
```
