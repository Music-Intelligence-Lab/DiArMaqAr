# Arabic Maqam Core

A comprehensive TypeScript library for Arabic maqam music theory, containing data models, utility functions, and JSON datasets for working with Arabic maqamat, ajnas, tuning systems, and more.

## Installation

```bash
npm install arabic-maqam-core
```

## Features

- **Complete Data Sets**: Pre-loaded JSON data for maqamat, ajnas, tuning systems, patterns, and sources
- **TypeScript Models**: Fully typed interfaces for all musical concepts
- **Utility Functions**: Comprehensive set of functions for music theory calculations
- **Modular Design**: Import only what you need with organized subpath exports
- **Tree-Shaking Friendly**: Only bundle what you actually use

## 🎯 Organized Import Paths

This package supports clean, organized imports using modern subpath exports:

### 📚 Models
```typescript
import { Maqam, Jins, TuningSystem, PitchClass, NoteName } from 'arabic-maqam-core/models';
```

### 🔧 Functions  
```typescript
import { transpose, modulate, calculateCentsDeviation } from 'arabic-maqam-core/functions';
```

### 📊 Data
```typescript
import { ajnasData, maqamatData, tuningSystemsData } from 'arabic-maqam-core/data';
```

### 🎼 Everything (Default Import)
```typescript
import arabicMaqamCore from 'arabic-maqam-core';

// Access organized modules
const { Maqam, Jins } = arabicMaqamCore.models;
const { transpose } = arabicMaqamCore.functions;
const { ajnasData } = arabicMaqamCore.data;
```

### Legacy Import (Still Supported)
```typescript
import { 
  ajnasData, 
  maqamatData, 
  tuningSystemsData,
  Maqam,
  Jins,
  TuningSystem,
  transpose,
  modulate 
} from 'arabic-maqam-core';
```

## 📦 Package Structure

```
arabic-maqam-core/
├── models/          # Core data structures
├── functions/       # Utility functions
├── data/           # Static JSON data
└── index           # Main entry point
```

## Usage Examples

### Data Access

```typescript
// Access pre-loaded data
console.log(maqamatData); // Array of maqam definitions
console.log(ajnasData);   // Array of jins definitions
console.log(tuningSystemsData); // Array of tuning system definitions
```

### Working with Models

```typescript
import { Maqam, Jins, PitchClass } from 'arabic-maqam-core/models';

// Create and work with maqam objects
const maqam = new Maqam(maqamData);
const intervals = maqam.getIntervals();
```

### Using Utility Functions

```typescript
import { 
  transpose, 
  modulate, 
  calculateCentsDeviation,
  convertPitchClass 
} from 'arabic-maqam-core/functions';

// Transpose musical elements
const transposedMaqam = transpose(/* parameters */);

// Find modulations
const modulations = modulate(/* parameters */);
```

## Available Exports

### Data
- `ajnasData` - JSON data for ajnas (plural of jins)
- `maqamatData` - JSON data for maqamat
- `patternsData` - JSON data for rhythmic patterns
- `sourcesData` - JSON data for bibliographic sources
- `tuningSystemsData` - JSON data for tuning systems

### Models
- `Jins` - Individual jins (melodic mode) class
- `Maqam` - Maqam (musical mode) class
- `NoteName` - Note name utilities and types
- `Pattern` - Rhythmic pattern class
- `PitchClass` - Pitch class representations
- `TuningSystem` - Tuning system class
- Bibliography models: `Source`, `Book`, `Article`, `AbstractSource`

### Functions
All utility functions from the original codebase including:
- `transpose` - Transposition utilities
- `modulate` - Modulation analysis
- `calculateCentsDeviation` - Tuning calculations
- `convertPitchClass` - Pitch conversions
- `getTuningSystemCells` - Tuning system analysis
- And many more...

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All models and functions are properly typed for excellent IDE support and type safety.

The package uses modern **subpath exports** in `package.json` to enable the organized import structure while maintaining full TypeScript support and autocomplete.

## Contributing

This package is extracted from the larger Maqam Network project. For contributions and issues, please visit the main repository.

## License

MIT License - see the main project for details.
