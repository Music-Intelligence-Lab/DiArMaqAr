---
url: >-
  /docs/library/api/functions/calculateIpnReferenceMidiNote/functions/calculateIpnReferenceMidiNote.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/calculateIpnReferenceMidiNote](../README.md) / calculateIpnReferenceMidiNote

# Function: calculateIpnReferenceMidiNote()

> **calculateIpnReferenceMidiNote**(`pitchClass`): `number`

Defined in: [functions/calculateIpnReferenceMidiNote.ts:25](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/calculateIpnReferenceMidiNote.ts#L25)

Calculates the International Pitch Notation reference MIDI note for a microtonal pitch.

**Purpose**: Given a microtonal pitch (like E-b3), finds the nearest standard International Pitch Notation MIDI note
that the pitch theoretically relates to for cents deviation calculations.

**Simple Logic**:

1. Parse the reference note name (e.g., "E-b" → base note "E", modifier "-b")
2. Extract just the 12-EDO part (e.g., "E" without microtonal modifiers)
3. Convert to chromatic position (C=0, C#/Db=1, D=2, ... B=11)
4. Find which octave the microtonal pitch is in
5. Check 3 candidate MIDI notes: same octave, one below, one above
6. Pick the closest one by MIDI distance

**Example**:

* Input: E-b3 (MIDI 51.366)
* Base note: "E" (chromatic position 4)
* Candidates: E3 (40), E4 (52), E5 (64)
* Closest: E4 (52)
* Deviation: 51.366 - 52 = -0.634 semitones = -63.4 cents

## Parameters

### pitchClass

`any`

Pitch class object with referenceNoteName and midiNoteDecimal

## Returns

`number`

The 12-EDO reference MIDI note number
