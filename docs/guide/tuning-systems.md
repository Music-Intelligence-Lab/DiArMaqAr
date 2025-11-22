---
title: Tanāghīm (Tuning Systems)
description: Understanding tanāghīm (tuning systems) and their role in Arabic maqām theory
---

# Tanāghīm (Tuning Systems)

Tanāghīm (tuning systems, singular: tanghīm) are the foundational layer of Arabic maqām theory in DiArMaqAr. They provide the pitch framework upon which all other musical structures are built.

## What is a tanghīm?

A tanghīm is an ordered sequence of pitch classes within an octave. These pitch classes can be expressed through various mathematical representations, all relative to the first pitch class.

### Mathematical Representations

**Frequency Ratios (Fractions):**
- Example: 1/1, 9/8, 4/3, 3/2, 16/9
- All ratios are relative to 1/1 (the reference pitch)

**Cents Values:**
- Example: 0, 203.9, 498.0, 702.0, 996.1
- All values are relative to 0 cents (the reference pitch)

**String Lengths / Fret Divisions:**
- Historical measurement approaches used in medieval treatises
- Converted to other formats for computational use

## Reference Frequency and Note Names

To render a tanghīm sonically, two additional pieces of information are needed:

1. **Reference Frequency**: The absolute frequency (in Hz) assigned to the first pitch class
2. **Note Names**: Mapping to the Persian-Arab-Ottoman note naming convention

These associations are documented in historical sources and reflect either theoretical standardization or performance practice traditions.

## Historical Sources

DiArMaqAr integrates tanāghīm spanning over 1,000 years of documented theory and practice, from medieval theorists like al-Kindī (874), al-Fārābī (950), and Ibn Sīnā (1037), through modern sources including the Cairo Congress Tuning Committee (1932) and al-Ṣabbāgh (1950), to contemporary approaches (Allami 2022-2025).

Each tanghīm includes complete bibliographic attribution with source references and page numbers where applicable.

## Extended Range System

In DiArMaqAr, tanāghīm are expanded across multiple registers to support comprehensive musical analysis:

- **Lower register**: qarār qarār or qarār prefixes
- **Main register**: Standard note names
- **Upper register**: Standard note names (higher range)
- **Extended upper register**: jawāb or jawāb jawāb prefixes

This expansion is essential for:
- Jins and maqām analysis across full ranges
- Transposition calculations
- Modulation pathway exploration
- Authentic representation of Arabic theory

## Starting Note Conventions

Tanāghīm follow different starting note conventions based on their historical sources:

**Oud-based systems** start on ʿushayrān, reflecting oud tuning in perfect fourths (e.g., al-Kindī, al-Fārābī, Ibn Sīnā).

**Monochord/sonometer systems** start on yegāh or rāst, reflecting theoretical measurement approaches (e.g., Cairo Congress 1932).

The starting note affects available maqāmāt, transposition possibilities, and modulation characteristics.

## Mathematical Conversion

Each pitch class is automatically converted to multiple formats including frequency ratios, cents, absolute frequencies, MIDI values, string lengths, and cents deviations from 12-EDO reference notes.

## Using Tanāghīm

### Via REST API

```bash
# Get all available tuning systems
curl http://localhost:3000/api/tuning-systems

# Get specific tuning system data
curl "http://localhost:3000/api/tuning-systems/al-Farabi-(950g)"
```

### Via TypeScript Library

```typescript
import { TuningSystem } from '@/models/TuningSystem'
import { getTuningSystemPitchClasses } from '@/functions/getTuningSystemPitchClasses'

// Create tuning system instance
const tuningSystem = new TuningSystem(tuningSystemData)

// Get all pitch classes
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ushayran')
```

## Bibliographic Attribution

Every tanghīm includes:
- **Source citation**: Complete bibliographic reference
- **Page references**: Specific pages where the system appears
- **Creator attribution**: Historical theorist or modern scholar
- **Publication year**: Temporal context
- **Commentary**: Contextual notes by Dr. Khyam Allami

This transparent provenance enables:
- Scholarly verification
- Academic citation
- Further research
- Understanding of theoretical evolution

## Next Steps

- Learn how tanāghīm relate to [Ajnās](/guide/ajnas/)
- Explore [Taṣwīr (Transposition)](/guide/taswir/) capabilities
- Understand [Starting Note Conventions](/guide/theoretical-framework/#starting-note-conventions)

