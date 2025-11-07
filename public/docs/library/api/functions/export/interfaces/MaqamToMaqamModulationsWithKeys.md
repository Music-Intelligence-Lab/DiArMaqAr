---
url: >-
  /docs/library/api/functions/export/interfaces/MaqamToMaqamModulationsWithKeys.md
---
[**DiArMaqAr TypeScript Library v0.1.0**](../../../README.md)

***

[DiArMaqAr TypeScript Library](../../../modules.md) / [functions/export](../README.md) / MaqamToMaqamModulationsWithKeys

# Interface: MaqamToMaqamModulationsWithKeys

Defined in: [functions/export.ts:342](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L342)

Index-based modulations for Maqam-to-Maqam relationships using array indices instead of full objects
to reduce JSON export size

## Properties

### maqamToMaqamModulationsDegreesNoteNames

> **maqamToMaqamModulationsDegreesNoteNames**: [`ModulationDegreesNoteNames`](ModulationDegreesNoteNames.md)

Defined in: [functions/export.ts:344](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L344)

Maps each modulation degree to its corresponding note name

***

### maqamToMaqamModulationsLowerOctaveDegreesNoteNames?

> `optional` **maqamToMaqamModulationsLowerOctaveDegreesNoteNames**: [`ModulationDegrees8vbNoteNames`](ModulationDegrees8vbNoteNames.md)

Defined in: [functions/export.ts:347](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L347)

Maps each modulation degree to its corresponding octave-below note name (only when 8vb is requested)

***

### maqamToMaqamModulations

> **maqamToMaqamModulations**: [`MaqamToMaqamModulationsStructure`](MaqamToMaqamModulationsStructure.md)

Defined in: [functions/export.ts:350](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L350)

Standard modulations in normal octave positions

***

### maqamToMaqamModulationsLowerOctave?

> `optional` **maqamToMaqamModulationsLowerOctave**: [`MaqamToMaqamLowerOctaveModulationsStructure`](MaqamToMaqamLowerOctaveModulationsStructure.md)

Defined in: [functions/export.ts:353](https://github.com/Music-Intelligence-Lab/DiArMaqAr/blob/6f1c81e1c50000c844884af75834b700ae00e423/src/functions/export.ts#L353)

Optional lower octave modulations (only when requested via CLI flag)
