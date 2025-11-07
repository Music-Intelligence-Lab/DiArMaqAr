---
url: /docs/library/api/functions/modulate/functions/default.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/modulate](../README.md) / default

# Function: default()

> **default**(`allPitchClasses`, `allAjnas`, `allMaqamat`, `sourceMaqamTransposition`, `ajnasModulationsMode`, `centsTolerance`): [`AjnasModulations`](../../../models/Jins/interfaces/AjnasModulations.md) | [`MaqamatModulations`](../../../models/Maqam/interfaces/MaqamatModulations.md)

Defined in: [functions/modulate.ts:94](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/modulate.ts#L94)

Modulation Analysis Using Al-Shawwā's Technique

This function implements the modulation algorithm based on Sāmī Al-Shawwā's 1946 work
"Al-Qawāʿid al-Fannīya fī al-Mūsīqa al-Sharqīya wa al-Gharbīya" (The Artistic Principles
of Eastern and Western Music). Al-Shawwā, a Cairo-born Aleppine violinist, provided unique
guidelines for maqām modulation based on scale degree relationships within the
Arab-Ottoman-Persian note naming framework.

Modulation Rules Implemented:

1. Tonic Correspondence: Modulation between maqāmāt sharing the same tonic (qarār),
   provided the tonic is classified as an "original" note (aṣlīya)

2. Third-Degree Modulation: Transition where the third degree of the source maqām
   becomes the tonic of the target, valid only when the third degree is classified
   as an "original" note

3. Alternative Third-Degree Modulation: If the standard third degree is invalid,
   Al-Shawwā permits using a niṣf (half-note)/two-parts (2p) scale degree immediately
   below it, provided that:
   a) It is the sixth pitch class from the fundamental (qarār) scale degree of the
   source maqām according to the 24-tone list
   b) It maintains a distance of two pitch classes from the preceding scale degree
   within the source maqām

4. Fourth and Fifth-Degree Modulation: Transitions using the fourth or fifth scale
   degrees of the source maqām as the tonic of the target

5. Sixth-Degree Modulation (No Third): When both the third degree and its alternative
   are invalid, modulation may occur through the sixth scale degree, provided it is
   the sixteenth or seventeenth pitch class from the tonic of the source maqām and
   remains an "original" scale degree

6. Sixth-Degree Modulation (Between Naturals): The sixth scale degree may also be
   used when it lies between two "natural" scale degrees within the source maqām

## Parameters

### allPitchClasses

[`default`](../../../models/PitchClass/interfaces/default.md)\[]

Complete array of available pitch classes in the tuning system

### allAjnas

[`default`](../../../models/Jins/classes/default.md)\[]

Array of all available ajnas (jins data objects) for modulation analysis

### allMaqamat

[`default`](../../../models/Maqam/classes/default.md)\[]

Array of all available maqamat (maqam data objects) for modulation analysis

### sourceMaqamTransposition

[`Maqam`](../../../models/Maqam/interfaces/Maqam.md)

The source maqam transposition to analyze modulations from

### ajnasModulationsMode

`boolean`

If true, analyze ajnas modulations; if false, analyze maqamat modulations

### centsTolerance

`number` = `5`

Tolerance in cents for pitch matching (default: 5)

## Returns

[`AjnasModulations`](../../../models/Jins/interfaces/AjnasModulations.md) | [`MaqamatModulations`](../../../models/Maqam/interfaces/MaqamatModulations.md)

Object containing all possible modulations organized by scale degree according to Al-Shawwā's rules
