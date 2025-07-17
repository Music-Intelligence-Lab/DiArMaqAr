# maqam-core

**Core music theory models, functions, and data for maqam analysis**

This package provides a comprehensive TypeScript library for working with Arabic maqam music theory, including models for pitch classes, tuning systems, jins (tetrachords), maqamat (scales), and a complete set of analysis utilities.

## Installation

```bash
npm install maqam-core
```

## Features

### 🎵 **Core Models**
- **PitchClass**: Comprehensive pitch class representation with fraction, cents, MIDI, and multiple notation systems
- **TuningSystem**: Support for various tuning systems and temperaments
- **Jins**: Tetrachord models with transposition and analysis capabilities  
- **Maqam**: Complete maqam (scale) models with ascending/descending patterns
- **NoteName**: Multi-language note name support (Arabic, English, Abjad)

### 🔧 **Analysis Functions**
- **Transposition**: Automatic transposition of jins and maqamat
- **Interval Calculation**: Precise interval computation in multiple formats
- **Modulation Detection**: Analysis of modulations between maqamat
- **Pattern Matching**: Advanced pattern recognition for musical analysis

### 📊 **Data**
- **1000+ Tuning Systems**: Historical and contemporary tuning systems
- **Complete Jins Database**: All standard and variant jins with metadata
- **Maqam Collection**: Comprehensive maqam database with sources
- **Pattern Library**: Common melodic and rhythmic patterns

## Usage

```typescript
import { 
  PitchClass, 
  TuningSystem, 
  getJinsTranspositions, 
  getMaqamTranspositions,
  computeFractionInterval,
  ajnasData,
  maqamatData,
  tuningSystemsData 
} from 'maqam-core';

// Work with pitch classes
const pitchClass: PitchClass = {
  noteName: "راست",
  fraction: "1/1", 
  cents: "0.00",
  englishName: "C",
  // ... other properties
};

// Calculate intervals
const interval = calculateInterval(pitchClass1, pitchClass2);

// Access curated data
console.log(`Loaded ${ajnasData.length} jins`);
console.log(`Loaded ${maqamatData.length} maqamat`);
console.log(`Loaded ${tuningSystemsData.length} tuning systems`);

// Perform transpositions
const jinsTranspositions = getJinsTranspositions(allPitchClasses, selectedJins);
const maqamTranspositions = getMaqamTranspositions(allPitchClasses, selectedMaqam);
```

## API Reference

### Models
- `PitchClass` - Core pitch class interface
- `TuningSystem` - Tuning system representation
- `Jins` - Tetrachord models
- `Maqam` - Scale/maqam models  
- `NoteName` - Multi-language note names

### Functions
- `calculateInterval()` - Compute intervals between pitch classes
- `getJinsTranspositions()` - Find all possible jins transpositions
- `getMaqamTranspositions()` - Find all possible maqam transpositions  
- `computeFractionInterval()` - Precise fractional interval math
- `modulate()` - Analyze modulations between maqamat
- `shiftPitchClass()` - Transpose pitch classes

### Data Exports
- `ajnasData` - Complete jins database (JSON)
- `maqamatData` - Complete maqam database (JSON)  
- `tuningSystemsData` - Tuning systems database (JSON)
- `patternsData` - Pattern library (JSON)
- `sourcesData` - Source bibliography (JSON)

## TypeScript Support

Full TypeScript support with comprehensive type definitions included.

## License

MIT - Music Intelligence Lab
