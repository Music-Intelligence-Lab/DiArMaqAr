# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **Digital Arabic Maqām Archive** (DiArMaqAr) is a comprehensive web-based platform for interactive exploration of Arabic maqām theory through computational modeling. The system integrates historical tuning systems (tanāghīm), melodic fragments (ajnās), complete modal frameworks (maqāmāt), and modulation practices within a unified digital framework. The project prioritizes culturally specific Arabic theoretical frameworks and epistemological systems.

**Live Application**: https://arabic-maqam-network.vercel.app/

## Common Commands

### Development
```bash
npm run dev          # Start Next.js development server on http://localhost:3000
npm run build        # Build production Next.js application
npm start           # Start production server
npm run lint        # Run ESLint
```

### Documentation
```bash
npm run docs        # Generate TypeDoc documentation
npm run docs:serve  # Generate and open docs in browser
npm run docs:watch  # Watch mode for docs generation
```

### Python Environment
```bash
# Python scripts and tests are in the python/ directory
# Used for data processing and batch export utilities
cd python
python test_models.py         # Test data models
python test_functions.py      # Test core functions
python test_import.py         # Test data import
```

### Batch Export CLI
```bash
# List all available tuning systems
node scripts/batch-export/batch-export.js --list-tuning-systems

# Export a specific tuning system with full data
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations

# Batch export all systems (generates many GB of data)
node scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --output-dir "./exports"
```

## High-Level Architecture

### Core Conceptual Model

The platform implements a **three-layer abstraction** that separates cultural knowledge from tuning-specific implementations:

1. **Data Layer (Abstract)**: JSON files in `data/` contain tuning-system-independent definitions
   - `tuningSystems.json`: Historical tuning systems with pitch class values as ratios/cents
   - `ajnas.json`: Melodic fragments defined by abstract note names (dūgāh, kurdī, etc.)
   - `maqamat.json`: Complete modal frameworks with ascending/descending sequences
   - `sources.json`: Bibliography and source references
   - `patterns.json`: Melodic patterns for analysis

2. **Model Layer (TypeScript/Python)**: Classes bridge abstract data with tuning systems
   - **TuningSystem**: Converts mathematical intervals to playable frequencies
   - **JinsData → Jins**: Abstract note names → concrete pitch classes
   - **MaqamData → Maqam**: Abstract sequences → concrete, playable modal frameworks
   - **PitchClass**: Unified representation of pitch (frequency, cents, MIDI, ratios)

3. **Application Layer**: React components with complex state management
   - Context providers manage global state for tuning systems, ajnas, maqamat
   - Transposition algorithms find all valid starting positions within tuning systems
   - Modulation analysis identifies possible transitions between modal frameworks

### Key Architectural Patterns

**Tahlil (Original Form) vs Taswir (Transposition)**:
- Tahlil: Original form starting from traditional root note (e.g., Jins Kurd on dūgāh)
- Taswir: Transposed form preserving intervallic relationships (e.g., Jins Kurd al-Muhayyar)
- The platform systematically generates all valid transpositions within each tuning system

**Pattern Matching with Cents Tolerance**:
- Transposition algorithm uses configurable cents tolerance (default: 5 cents)
- Matches abstract interval patterns against tuning system pitch classes
- Enables cross-system compatibility analysis (e.g., which ajnas work in Al-Kindī's 874 CE system)

**Bidirectional Sequences (Maqamat)**:
- Separate ascending (ṣuʿūd) and descending (hubūṭ) note sequences
- Asymmetric maqamat have different ascending/descending paths
- Both sequences analyzed independently for embedded ajnas patterns

**Embedded Ajnas Analysis**:
- Algorithm identifies all ajnas patterns within maqam sequences
- Uses same pattern matching with cents tolerance
- Results displayed in maqam visualizations

**Suyūr (Melodic Development Pathways)**:
- Traditional performance practice pathways beyond basic scales
- Automatically transposed along with parent maqam
- Note name conversion and jins/maqam reference adjustment

### Technology Stack & File Organization

**Frontend (TypeScript/React/Next.js)**:
- `src/app/`: Next.js 15 App Router pages and layouts
- `src/components/`: React components for UI (managers, transpositions, visualizations)
- `src/contexts/`: Context providers (AppContext, SoundContext, TranspositionsContext, etc.)
- `src/models/`: TypeScript model classes (TuningSystem, Jins, Maqam, PitchClass, NoteName)
- `src/functions/`: Pure functions (transposition, modulation, conversion, import)
- `src/audio/`: Web Audio API synthesis and playback
- `src/app/globals.scss`: Global SCSS styling

**Backend/Data Processing (Python)**:
- `python/models/`: Python equivalents of TypeScript models
- `python/functions/`: Data processing, export, analytics generation
- `python/test_*.py`: Test suites for models and functions

**Scripts**:
- `scripts/batch-export/`: CLI tool for batch exporting tuning system data in JSON
  - Supports complete exports with modulations (can generate GB of data)
  - Progress tracking, memory optimization, filename sanitization
  - See `scripts/batch-export/README.md` for full documentation

**Data & Configuration**:
- `data/*.json`: Master data files (tuningSystems, ajnas, maqamat, sources, patterns)
- `public/data/`: Public data files (analytics)
- `typedoc.json`: TypeDoc configuration
- `tsconfig.json`: TypeScript configuration
- `next.config.ts`: Next.js configuration

## Critical Implementation Details

### Context Provider Hierarchy

The root layout (`src/app/layout.tsx`) establishes context provider nesting that must be maintained:
```
LanguageContextProvider
  └─ AppContextProvider (core state: tuning systems, ajnas, maqamat)
      └─ SoundContextProvider (Web Audio API)
          └─ TranspositionsContextProvider
              └─ MenuContextProvider
                  └─ FilterContextProvider
```

**AppContext** (`src/contexts/app-context.tsx`) is the central state manager:
- Loads all data on mount: `getTuningSystems()`, `getAjnas()`, `getMaqamat()`, `getSources()`, `getPatterns()`
- Manages selected tuning system, jins, and maqam state
- Provides `handleClickJins()`, `handleClickMaqam()` for selection logic
- Provides `getModulations()` for modulation analysis
- Handles URL parameter routing via `handleUrlParams()`
- Manages pitch class selection, indices mapping, and reference frequencies

### Note Name System

**Critical Distinction**: Note names (e.g., "dūgāh", "kurdī", "chahārgāh") are cultural identifiers, NOT pitch classes. The same note name can have different frequencies in different tuning systems.

**NoteName type** (`src/models/NoteName.ts`):
- Defines all valid transliterated Arabic note names
- Split across two octaves: `octaveOneNoteNames`, `octaveTwoNoteNames`
- System supports 4 octaves for comprehensive analysis
- `shiftNoteName()` function shifts note names up/down octaves

### Transposition Algorithms

**Jins Transposition** (`src/functions/transpose.ts`):
- `calculateJinsTranspositions()`: Finds all valid starting positions for a jins within a tuning system
- Pattern matches interval sequences within cents tolerance
- Returns array of `Jins` instances with concrete pitch classes

**Maqam Transposition**:
- `calculateMaqamTranspositions()`: Separately processes ascending and descending sequences
- Both sequences must be fully constructible within the tuning system
- Embedded ajnas analysis optional (computationally expensive)

### Modulation Analysis

**Modulation Types**:
- **Maqamat Modulations**: Transitions between complete modal frameworks
- **Ajnas Modulations**: Transitions between melodic fragments
- Both organized by scale degree (first, third, fourth, fifth, sixth)
- Sixth degree has ascending/descending variants

**Implementation** (`src/functions/modulate.ts`):
- Pattern matching identifies shared pitch classes between source and target
- Scale degree analysis determines modulation category
- Configurable mode toggles between maqamat/ajnas modulation display

### Pitch Class Conversion

**PitchClass** (`src/models/PitchClass.ts`) unifies multiple representations:
- Frequency (Hz)
- Cents (logarithmic interval measure)
- Decimal ratio
- Fractional ratio (preserved from source)
- MIDI note number
- Cents deviation from 12-TET

**Conversion Functions** (`src/functions/convertPitchClass.ts`, `src/functions/detectPitchClassType.ts`):
- Automatic detection of input type (ratio, decimal, cents)
- Bidirectional conversion between all representations
- Fraction GCD reduction for display

### Export System

**Web Export Modal** (accessible in UI):
- Exports selected tuning system configuration as JSON
- Optional: include ajnas details, maqamat details, modulations
- Same data structure as batch export CLI

**Batch Export CLI** (`scripts/batch-export/batch-export.js`):
- Built with `tsx` for TypeScript execution
- Memory optimization for large exports (auto-sets 4GB limit)
- Filename sanitization for cross-platform compatibility
- Timestamped batch folders for organization
- Full documentation in `scripts/batch-export/README.md`

**Export Data Structure**:
```json
{
  "exportInfo": { "timestamp": "...", "metadata": "..." },
  "tuningSystemData": { "name": "...", "pitchClassValues": [...] },
  "summaryStats": { "pitchClasses": 48, "ajnas": 156, "maqamat": 41 },
  "pitchClassReference": [...],
  "allAjnasData": [...],
  "allMaqamatData": [...]
}
```

## Model Relationships

**TuningSystem** → generates → **PitchClass[]** (via `getTuningSystemPitchClasses()`)

**JinsData** + **PitchClass[]** → realizes → **Jins** (via `getTahlil()`)

**MaqamData** + **PitchClass[]** → realizes → **Maqam** (via `getTahlil()`)

**JinsData** + **PitchClass[]** → transposes → **Jins[]** (via `calculateJinsTranspositions()`)

**MaqamData** + **PitchClass[]** → transposes → **Maqam[]** (via `calculateMaqamTranspositions()`)

**Maqam** + **PitchClass[]** + **JinsData[]** + **MaqamData[]** → modulates → **MaqamatModulations | AjnasModulations** (via `modulate()`)

## Working with Data

### Adding a New Tuning System
1. Add entry to `data/tuningSystems.json`
2. Provide: title (EN/AR), creator (EN/AR), year, source references
3. Define `originalPitchClassValues` as ratios/decimals/cents strings
4. Define `noteNameSets` mapping pitch classes to cultural note names
5. Set `referenceFrequencies` and `defaultReferenceFrequency`
6. Set `saved: true` to make it appear in UI

### Adding a New Jins
1. Add entry to `data/ajnas.json`
2. Provide: id, name, note names array, comments (EN/AR), source references
3. Note names must match those available in tuning systems
4. System automatically finds all valid transpositions

### Adding a New Maqam
1. Add entry to `data/maqamat.json`
2. Provide: id, name, ascending/descending note name sequences, comments (EN/AR)
3. Optional: define suyūr (melodic development pathways)
4. System automatically finds all valid transpositions and analyzes embedded ajnas

### Python-TypeScript Parity
- Python models in `python/models/` mirror TypeScript models in `src/models/`
- Python functions in `python/functions/` mirror TypeScript functions in `src/functions/`
- Both implementations share same data files from `data/`
- Python primarily used for batch processing and analytics generation

## Audio Synthesis

**SoundContext** (`src/contexts/sound-context.tsx`):
- Web Audio API abstraction
- Manages audio context, synth configuration, playback state
- Supports different timbres (defined in `src/audio/timbres.json`)
- Plays individual pitch classes or sequences

**Audio Functions** (`src/audio/utils.ts`, `src/audio/waves.ts`):
- Frequency-to-MIDI conversion
- Waveform generation
- Custom synthesis using `sw-synth` library

## UI Components

**Manager Components** (centralized editing):
- `TuningSystemManager`: Create/edit tuning systems
- `JinsManager`: Browse and select ajnas
- `MaqamManager`: Browse and select maqamat
- `SayrManager`: View/edit melodic development pathways
- `SourcesManager`: Bibliography management

**Transposition Components** (display all valid transpositions):
- `JinsTranspositions`: All valid jins starting positions
- `MaqamTranspositions`: All valid maqam starting positions
- `SelectedPitchClassesTranspositions`: Transpositions of custom pitch class selections

**Visualization Components**:
- `StaffNotation`: VexFlow rendering of staff notation
- `PitchClassBar`: Visual representation of pitch classes
- `Modulations`: Display modulation analysis results

**Navigation**:
- `Navbar`: Main navigation (hidden on non-app pages)
- `NavbarGuard`: Conditionally renders navbar based on route
- `NavigationMenu`: Secondary navigation within app

## Important Considerations

### Performance
- Transposition calculation is computationally expensive (pattern matching across 4 octaves)
- Modulation analysis even more expensive (nested transposition calls)
- Use cents tolerance carefully (lower = more accurate but slower)
- Batch exports with full modulations can take minutes per tuning system

### Data Integrity
- All note names must be valid entries from `NoteName` type
- Tuning system pitch classes must be ascending within octave
- Maqam ascending/descending sequences must have 7+ notes
- Source references link to entries in `sources.json`

### URL Parameters
- App supports deep linking via URL params: `?tuningSystemId=...&maqamDataId=...&sayrId=...`
- `handleUrlParams()` in AppContext processes URL state
- Useful for sharing specific configurations

### Bilingual Support
- All data models include English and Arabic fields
- LanguageContext manages active language
- UI strings use conditional rendering based on language state

### TypeDoc Documentation
- Comprehensive JSDoc comments on all models and core functions
- Generated documentation in `docs/` directory
- Keep JSDoc comments up-to-date when modifying models

## Testing

Python tests are comprehensive:
- `python/test_models.py`: Model instantiation and methods
- `python/test_functions.py`: Core function behavior
- `python/test_core_functions.py`: Additional core utilities
- `python/test_import.py`: Data loading verification

TypeScript currently lacks formal test suite - contributions welcome.

## Git Workflow

Recent commits show focus on:
- Export system refinements (batch export script, maqam family references)
- Cross-platform compatibility (Windows/Mac path handling)
- Documentation improvements

Main branch: `main` (use this for PRs)
