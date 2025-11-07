---
url: /docs/library/api/models/Pattern/interfaces/PatternNote.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [models/Pattern](../README.md) / PatternNote

# Interface: PatternNote

Defined in: [models/Pattern.ts:121](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L121)

Represents a single note within a musical pattern.

Each PatternNote defines a musical event with its position in the scale,
rhythmic duration, emphasis level, and optional dynamic marking.

PatternNote

## Properties

### scaleDegree

> **scaleDegree**: `string`

Defined in: [models/Pattern.ts:126](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L126)

The scale degree of this note (e.g., "I", "II", "-III", "+V").
Corresponds to positions in the SCALE\_DEGREES array.

***

### noteDuration

> **noteDuration**: `string`

Defined in: [models/Pattern.ts:132](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L132)

Rhythmic duration of the note using standard musical notation.
Examples: "4n" = quarter note, "8d" = dotted eighth, "16t" = sixteenth triplet

***

### isTarget

> **isTarget**: `boolean`

Defined in: [models/Pattern.ts:138](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L138)

Whether this note should be emphasized or highlighted during playback.
Target notes are typically structurally important in the pattern.

***

### velocity?

> `optional` **velocity**: `number`

Defined in: [models/Pattern.ts:144](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/models/Pattern.ts#L144)

Optional MIDI velocity value (0-127) for dynamic expression.
Higher values result in louder playback.
