---
url: >-
  /docs/library/api/functions/export/interfaces/MaqamToJinsModulationsWithKeys.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/export](../README.md) / MaqamToJinsModulationsWithKeys

# Interface: MaqamToJinsModulationsWithKeys

Defined in: [functions/export.ts:360](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L360)

Index-based modulations for Maqam-to-Jins relationships using array indices instead of full objects
to reduce JSON export size

## Properties

### maqamToJinsModulationDegreesNoteNames

> **maqamToJinsModulationDegreesNoteNames**: [`JinsModulationDegreesNoteNames`](JinsModulationDegreesNoteNames.md)

Defined in: [functions/export.ts:362](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L362)

Maps each modulation degree to its corresponding note name

***

### maqamToJinsModulationsLowerOctaveDegreesNoteNames?

> `optional` **maqamToJinsModulationsLowerOctaveDegreesNoteNames**: [`JinsModulationDegrees8vbNoteNames`](JinsModulationDegrees8vbNoteNames.md)

Defined in: [functions/export.ts:365](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L365)

Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested)

***

### maqamToJinsModulations

> **maqamToJinsModulations**: [`MaqamToJinsModulationsStructure`](MaqamToJinsModulationsStructure.md)

Defined in: [functions/export.ts:368](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L368)

Standard modulations in normal octave positions

***

### maqamToJinsModulationsLowerOctave?

> `optional` **maqamToJinsModulationsLowerOctave**: [`MaqamToJinsLowerOctaveModulationsStructure`](MaqamToJinsLowerOctaveModulationsStructure.md)

Defined in: [functions/export.ts:371](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L371)

Optional lower octave modulations (only when requested via CLI flag)
