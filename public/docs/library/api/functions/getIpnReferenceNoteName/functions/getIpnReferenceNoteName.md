---
url: >-
  /docs/library/api/functions/getIpnReferenceNoteName/functions/getIpnReferenceNoteName.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/getIpnReferenceNoteName](../README.md) / getIpnReferenceNoteName

# Function: getIpnReferenceNoteName()

> **getIpnReferenceNoteName**(`pitchClass`): `string`

Defined in: [functions/getIpnReferenceNoteName.ts:27](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/getIpnReferenceNoteName.ts#L27)

Extracts the 12-EDO reference note name (without microtonal modifiers) from a pitch class.

This function respects Arabic musicological logic where microtonal modifiers indicate
what the pitch is a variant OF, not mathematical proximity to 12-EDO semitones.

**Examples:**

* E-b (E half-flat) → E (variant of E natural, not Eb)
* B-b (B half-flat) → B (variant of B natural, not Bb)
* Bb++ (Bb double-raising) → Bb (variant of Bb)

**Implementation:**
Uses the MIDI-based reference calculation from calculate12EdoReferenceMidiNote(),
which already encodes the correct musicological logic.

## Parameters

### pitchClass

`any`

Pitch class object with midiNoteDecimal and optional referenceNoteName

## Returns

`string`

12-EDO reference note name without octave number (e.g., "E", "Bb", "F#")

## Example

```typescript
const pc = { midiNoteDecimal: 51.366, englishName: "E-b3", ... };
const ref = get12EdoReferenceNoteName(pc); // Returns "E"
```
