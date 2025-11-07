---
url: /docs/guide.md
description: Introduction to the Digital Arabic Maqām Archive (DiArMaqAr)
---

# Getting Started

Welcome to the Digital Arabic Maqām Archive (DiArMaqAr) documentation!

## What is DiArMaqAr?

The Digital Arabic Maqām Archive (DiArMaqAr) is an open-source, bilingual browser-based application and repository designed for musicians, composers, developers, and scholars engaged with Arabic maqām theory.

The application integrates an archive of historically documented **tanāghīm**, **ajnās**, **maqāmāt**, **suyūr**, and **intiqālāt** within a unified digital framework, establishing verified reference data for education, performance, composition, software development, machine learning applications, and instrument design.

### Key Features

* **Bilingual Interface**: Arabic/English with Library of Congress Romanization standards
* **Comprehensive Tuning Systems**: Access to historical and modern tuning systems from the 9th century to present with historical source attributions
* **Maqāmāt and Ajnās Data**: Complete database with historical source attributions
* **Tuning-System-Sensitive Transposition**: Systematic computation of all mathematically valid transpositions
* **Al-Shawwā Modulation Algorithm**: First algorithmic implementation of Sāmī al-Shawwā's 1946 modulation guidelines
* **Real-Time Audio Synthesis**: Hear precise intonational relationships with Web Audio API
* **MIDI Integration**: Support for MIDI controllers and MPE (MIDI Polyphonic Expression) output
* **Data Export**: JSON, CSV, and Scala (.scl/.kbm) formats for research and composition
* **REST API**: Programmatic access to all data
* **TypeScript Library**: Complete JavaScript/TypeScript library with full type safety

### Cultural Framework

All functionality is rooted in the **theoretical framework of Arabic maqām theory** and its epistemological traditions. The system uses the historical Arab-Ottoman-Persian note naming conventions (rāst, dugāh, segāh, etc.) and supports tuning-system-aware transposition, ensuring precise intervallic relationships are preserved across all maqāmāt and ajnās.

## Quick Start

### Using the REST API

The easiest way to get started is using the REST API:

```bash
# Get all maqāmāt
curl http://localhost:3000/api/maqamat

# Get specific maqām data with full details
curl "http://localhost:3000/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran&pitchClassDataType=all"

# Include transpositions and modulations
curl "http://localhost:3000/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran&includeTranspositions=true&includeModulations=true"
```

### Using the TypeScript Library

First, install the library in your project (or clone the repository for direct development access). Then import the required modules:

```typescript
import { Maqam, Jins, TuningSystem } from '@/models'
import { getMaqamTranspositions } from '@/functions/transpose'
import { modulate } from '@/functions/modulate'

// Create instances
const tuningSystem = new TuningSystem(tuningSystemData)
const maqam = new Maqam(maqamData)

// Get transpositions
const transpositions = getMaqamTranspositions(maqam, tuningSystem)

// Analyze modulations
const modulations = modulate(maqam, allMaqamat, tuningSystem)
```

## Documentation Guide

### Core Concepts

1. **[Theoretical Framework](/guide/theoretical-framework/)** - Understanding the conceptual hierarchy: Tanāghīm → Ajnās → Maqāmāt → Suyūr → Intiqālāt

2. **[Tuning Systems](/guide/tuning-systems/)** - Learn about tanāghīm, mathematical representations, and historical sources

3. **[Ajnās](/guide/ajnas/)** - Understanding tetrachords as building blocks of maqāmāt

4. **[Maqāmāt](/guide/maqamat/)** - Complete modal frameworks with ascending/descending sequences

5. **[Suyūr](/guide/suyur/)** - Traditional melodic performance pathways

### Advanced Features

6. **[Transposition](/guide/transposition/)** - Tuning-system-sensitive transposition of ajnās and maqāmāt

7. **[Modulation](/guide/modulation/)** - Al-Shawwā's modulation algorithm and network analysis

8. **[Audio Synthesis](/guide/audio-synthesis/)** - Real-time audio playback using Web Audio API

9. **[MIDI Integration](/guide/midi-integration/)** - MIDI input/output with MPE support for microtonal playback

10. **[Data Export](/guide/data-export/)** - Export capabilities: JSON, CSV, Scala formats

### Research and Methodology

11. **[Research Applications](/guide/research-applications/)** - Use cases for computational musicology, ML/AI, and academic research

12. **[Cultural Framework](/guide/cultural-framework/)** - Decolonial computing principles and culturally-specific methodology

13. **[Bibliographic Sources](/guide/bibliographic-sources/)** - Complete source attribution system and scholarly verification

## Next Steps

* Start with [Quick Start Guide](/guide/quick-start/) for immediate hands-on experience
* Explore [Theoretical Framework](/guide/theoretical-framework/) to understand core concepts
* Visit the [API Reference](/api/) for complete endpoint documentation
* Check out the [TypeScript Library Documentation](/library/) for programmatic usage
* Visit the [Interactive API Playground](http://localhost:3000/api-playground) to test endpoints interactively

## Resources

* [Source Code](https://github.com/Music-Intelligence-Lab/DiArMaqAr) - View on GitHub
* [Music Intelligence Lab](https://music-intelligence-lab.org) - Research lab website
* [Live Application](https://arabic-maqam-archive.netlify.app/) - Interactive web interface
