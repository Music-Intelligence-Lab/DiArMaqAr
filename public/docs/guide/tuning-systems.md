---
url: /docs/guide/tuning-systems.md
description: Understanding tuning systems and their role in Arabic maqām theory
---

# Tuning Systems (Tanāghīm)

Tuning systems are the foundational layer of Arabic maqām theory in DiArMaqAr. They provide the pitch framework upon which all other musical structures are built.

## What is a Tuning System?

A tuning system (tanjīh, plural: tanāghīm) is an ordered sequence of pitch classes (pitches/tones/notes) within an octave. These pitch classes can be expressed through various mathematical representations, all relative to the first pitch class.

### Mathematical Representations

**Frequency Ratios (Fractions):**

* Example: 1/1, 9/8, 4/3, 3/2, 16/9
* All ratios are relative to 1/1 (the reference pitch)

**Cents Values:**

* Example: 0, 203.9, 498.0, 702.0, 996.1
* All values are relative to 0 cents (the reference pitch)

**String Lengths / Fret Divisions:**

* Historical measurement approaches used in medieval treatises
* Converted to other formats for computational use

## Reference Frequency and Note Names

To render a tuning system sonically, two additional pieces of information are needed:

1. **Reference Frequency**: The absolute frequency (in Hz) for the first pitch class
   * Example: ʿushayrān = 220 Hz, or yegāh = 196 Hz

2. **Note Names**: Association with the Persian-Arab-Ottoman note naming convention
   * Example: 1/1 = 0 cents = ʿushayrān = 220 Hz

The reference frequency is not arbitrary—it relies on either theoretical standardization or performance practice as documented in historical sources.

## Historical Sources

DiArMaqAr integrates tuning systems from the medieval period through the modern era, including:

* **Al-Kindī (9th century)**: 12-tone system based on ratios
* **Al-Fārābī (10th century)**: Comprehensive tuning systems
* **Ibn Sīnā (11th century)**: Various tuning approaches
* **Al-Urmawī (13th century)**: Mathematical frameworks
* **Modern theorists**: Al-Ṣabbāgh (1950s), Al-Ḥilū (1960s), and others

Each tuning system includes:

* Complete source attribution
* Bibliographic references
* Commentary on theoretical context
* Original units of measurement

## Four-Octave System

In DiArMaqAr, each tuning system is expanded across **four octaves**:

* **Octave 0**: Extended lower octave (qarār qarār, qarār prefixes)
* **Octave 1**: Main octave (standard note names)
* **Octave 2**: Upper octave (standard note names)
* **Octave 3**: Extended upper octave (jawāb, jawāb jawāb prefixes)

This expansion is essential for:

* Jins and maqām analysis across full ranges
* Transposition calculations
* Modulation pathway exploration
* Authentic representation of Arabic theory

## Starting Note Conventions

Tuning systems in DiArMaqAr follow different starting note conventions based on their historical sources:

### Oud-Based Systems

* **Starting note**: ʿushayrān
* **Tradition**: Based on oud tuning in perfect fourths (4/3)
* **Examples**: Al-Kindī, Al-Fārābī, Ibn Sīnā (oud conventions)
* **Practical context**: Reflects how tuning is applied on the oud instrument

### Monochord/Sonometer Systems

* **Starting note**: yegāh or rāst
* **Tradition**: Based on theoretical measurement instruments
* **Examples**: Cairo Congress (1932) approaches, modern theoretical frameworks
* **Practical context**: Reflects abstract theoretical measurement

**Important**: The choice of starting note affects:

* Available maqāmāt and ajnās
* Transposition possibilities
* Modulation network characteristics
* Mathematical relationships between intervals

## Mathematical Conversion

Each pitch class can be represented in multiple formats simultaneously:

```
Pitch Class → Multiple Representations:
  - Frequency Ratio: 9/8
  - Cents: 203.9
  - Frequency (Hz): 247.5 (from 220 Hz reference)
  - MIDI (decimal): 60.36
  - String Length: (if applicable)
  - Deviation from 12-EDO: +3.9 cents
```

The platform automatically converts between all formats based on:

* The original representation in the source
* The selected reference frequency
* The mathematical relationships between formats

## Using Tuning Systems

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

// Get all pitch classes across four octaves
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ushayran')
```

## Bibliographic Attribution

Every tuning system includes:

* **Source citation**: Complete bibliographic reference
* **Page references**: Specific pages where the system appears
* **Creator attribution**: Historical theorist or modern scholar
* **Publication year**: Temporal context
* **Commentary**: Contextual notes by Dr. Khyam Allami

This transparent provenance enables:

* Scholarly verification
* Academic citation
* Further research
* Understanding of theoretical evolution

## Next Steps

* Learn how tuning systems relate to [Ajnās](/guide/ajnas/)
* Explore [Taṣwīr (Transposition)](/guide/taswir/) capabilities
* Understand [Starting Note Conventions](/guide/theoretical-framework/#starting-note-conventions)
