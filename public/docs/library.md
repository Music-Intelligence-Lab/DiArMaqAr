---
url: /docs/library.md
description: Complete TypeScript/JavaScript library documentation
---

# TypeScript Library Documentation

The DiArMaqAr TypeScript library provides a comprehensive, type-safe interface for working with maqām data programmatically.

## Overview

The library is organized into several key modules:

* **Models**: Core data structures (Maqam, Jins, TuningSystem, PitchClass, NoteName)
* **Functions**: Utility functions for processing, transposition, modulation, and export
* **Interfaces**: Type definitions for data structures

## Installation

Import directly from the source code in your project.

## Basic Usage

```typescript
import { Maqam } from '@/models/Maqam'
import { TuningSystem } from '@/models/TuningSystem'
import { getTuningSystemPitchClasses } from '@/functions/getTuningSystemPitchClasses'

// Load data
const tuningSystem = new TuningSystem(tuningSystemData)
const maqam = new Maqam(maqamData)

// Work with pitch classes
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ushayran')
```

## Library Reference

The complete TypeScript library reference documentation is generated from JSDoc comments in the source code. The documentation is organized by modules:

* **[Complete Reference](./api/README.md)** - Overview and index of all documentation
* **[Modules Index](./api/modules.md)** - All available modules

### Models

* **[Maqam](./api/models/Maqam/README.md)** - Maqām data structure and methods
* **[Jins](./api/models/Jins/README.md)** - Jins (tetrachord) data structure
* **[TuningSystem](./api/models/TuningSystem/README.md)** - Tuning system definitions
* **[PitchClass](./api/models/PitchClass/README.md)** - Individual pitch class data
* **[NoteName](./api/models/NoteName/README.md)** - Note name handling and transliteration
* **[Pattern](./api/models/Pattern/README.md)** - Pattern data structures

### Functions

Browse all functions in the [modules documentation](./api/modules.md). Key function modules include:

* **[Export Functions](./api/functions/export/README.md)** - Data export utilities
* **[Transpose Functions](./api/functions/transpose/README.md)** - Transposition calculations
* **[Modulation Functions](./api/functions/modulate/README.md)** - Modulation analysis
* **[Import Functions](./api/functions/import/README.md)** - Data loading utilities

The documentation is automatically generated from TypeScript source files with JSDoc comments. Run `npm run docs:ts` to regenerate after code changes.
