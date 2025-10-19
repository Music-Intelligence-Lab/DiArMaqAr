# Architecture & Technical Stack

Complete technical architecture for the Digital Arabic Maqām Archive

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: SCSS modules
- **Audio**: Web Audio API (custom implementation)
- **Notation**: VexFlow
- **Documentation**: TypeDoc

### Backend/Processing
- **Runtime**: Node.js (for CLI tools and SSR)
- **Data Processing**: Python (mirror implementation)
- **Data Format**: JSON

---

## Directory Structure

```
src/
├── app/                        # Next.js 15 App Router
│   ├── api/                   # Server-side API endpoints
│   │   └── [endpoint]/route.ts
│   ├── (pages)/               # Page routes with layouts
│   │   ├── layout.tsx        # Root layout (context providers)
│   │   ├── page.tsx          # Home page
│   │   └── app/              # Main application
│   └── globals.css           # Global styles
│
├── audio/                     # Web Audio API
│   ├── utils.ts              # Audio utilities
│   ├── waves.ts              # Waveform generation
│   └── timbres.json          # Synth configurations
│
├── components/                # React components
│   ├── managers/             # CRUD components
│   │   ├── tuning-system-manager.tsx
│   │   ├── jins-manager.tsx
│   │   └── maqam-manager.tsx
│   ├── transpositions/       # Transposition displays
│   │   ├── jins-transpositions.tsx
│   │   └── maqam-transpositions.tsx
│   ├── visualizations/       # Display components
│   │   ├── staff-notation.tsx
│   │   ├── pitch-class-bar.tsx
│   │   └── modulations.tsx
│   └── navigation/           # Navigation components
│       ├── navbar.tsx
│       └── navigation-menu.tsx
│
├── contexts/                  # React Context providers
│   ├── app-context.tsx       # Core state management
│   ├── sound-context.tsx     # Audio synthesis
│   ├── transpositions-context.tsx
│   ├── language-context.tsx  # Bilingual support
│   ├── filter-context.tsx    # Search/filter
│   └── menu-context.tsx      # UI state
│
├── functions/                 # Pure computational functions
│   ├── import.ts             # Data loading
│   ├── transpose.ts          # Transposition algorithms
│   ├── modulate.ts           # Modulation analysis
│   ├── convertPitchClass.ts  # Format conversions
│   ├── detectPitchClassType.ts
│   └── utilities.ts          # Helper functions
│
├── models/                    # TypeScript classes
│   ├── TuningSystem.ts       # Tuning system model
│   ├── JinsData.ts           # Abstract jins
│   ├── Jins.ts               # Concrete jins
│   ├── MaqamData.ts          # Abstract maqam
│   ├── Maqam.ts              # Concrete maqam
│   ├── PitchClass.ts         # Pitch representation
│   ├── NoteName.ts           # Note name type
│   └── Source.ts             # Bibliography
│
└── styles/                    # SCSS modules
    └── [component].module.scss

data/                          # Ground-truth JSON data
├── ajnas.json                # Melodic fragments
├── maqamat.json              # Modal frameworks
├── patterns.json             # Melodic patterns
├── sources.json              # Bibliography
└── tuningSystems.json        # Historical tuning systems

python/                        # Python mirror implementation
├── models/                   # Python equivalents
├── functions/                # Python processing
└── test_*.py                 # Test suites

scripts/                       # Utility scripts
└── batch-export/             # CLI batch export tool
    ├── batch-export.js       # Main CLI script
    └── README.md             # Export documentation
```

---

## Core Architecture Patterns

### Context Provider Hierarchy

**Critical**: The root layout establishes context nesting that MUST be maintained:

```typescript
// src/app/layout.tsx
LanguageContextProvider
  └─ AppContextProvider              // Core state
      └─ SoundContextProvider        // Audio
          └─ TranspositionsContextProvider
              └─ MenuContextProvider
                  └─ FilterContextProvider
```

**Why this order matters:**
- `LanguageContext` - Needed by all other contexts for bilingual support
- `AppContext` - Loads all data, manages selections, provides core state
- `SoundContext` - Depends on AppContext for pitch classes
- `TranspositionsContext` - Pre-computes expensive transpositions
- `MenuContext` - UI state
- `FilterContext` - Search/filter state

### AppContext (Central State Manager)

**Location**: `src/contexts/app-context.tsx`

**Responsibilities:**
- Load all data on mount: tuning systems, ajnas, maqamat, sources, patterns
- Manage selected tuning system, jins, maqam state
- Provide selection handlers: `handleClickJins()`, `handleClickMaqam()`
- Generate pitch classes from selected tuning system
- Handle URL parameter routing
- Manage pitch class selection and reference frequencies
- Provide modulation analysis

**Key State:**
```typescript
{
  tuningSystems: TuningSystem[];
  ajnas: JinsData[];
  maqamat: MaqamData[];
  sources: Source[];
  patterns: Pattern[];
  selectedTuningSystem: TuningSystem | null;
  selectedJins: JinsData | null;
  selectedMaqam: MaqamData | null;
  allPitchClasses: PitchClass[];
  selectedPitchClasses: PitchClass[];
  // ... more state
}
```

### SoundContext (Audio Management)

**Location**: `src/contexts/sound-context.tsx`

**Responsibilities:**
- Abstract Web Audio API
- Manage audio context and synth configuration
- Support different timbres
- Play individual pitch classes or sequences

**Client-side guards required:**
```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Web Audio API code here
  }
}, []);
```

### TranspositionsContext (Performance Optimization)

**Location**: `src/contexts/transpositions-context.tsx`

**Responsibilities:**
- Pre-compute expensive transposition calculations
- Cache results to avoid repeated calculations
- Provide transpositions to multiple components

**Why needed**: Modulation calculations can take minutes for complex systems.

---

## Data Model Relationships

### Model Hierarchy

```
TuningSystem
  └─ generates → PitchClass[]
                    ↓
      ┌─────────────┴─────────────┐
      ↓                           ↓
JinsData + PitchClass[]      MaqamData + PitchClass[]
      ↓                           ↓
   realizes → Jins            realizes → Maqam
      ↓                           ↓
   transposes → Jins[]        transposes → Maqam[]
                                  ↓
                      modulates → MaqamatModulations
                                  AjnasModulations
```

### Key Transformations

**1. Tuning System → Pitch Classes**
```typescript
// Function: getTuningSystemPitchClasses()
const pitchClasses = getTuningSystemPitchClasses(
  tuningSystem,
  startingNote,
  referenceFrequency
);
```

**2. JinsData + Pitch Classes → Jins (Tahlil)**
```typescript
// Method: JinsData.getTahlil()
const jins = jinsData.getTahlil(pitchClasses, tolerance);
```

**3. JinsData + Pitch Classes → Jins[] (Taswir)**
```typescript
// Function: calculateJinsTranspositions()
const jinsTranspositions = calculateJinsTranspositions(
  pitchClasses,
  jinsData,
  tolerance
);
```

**4. MaqamData + Pitch Classes → Maqam (Tahlil)**
```typescript
// Method: MaqamData.getTahlil()
const maqam = maqamData.getTahlil(pitchClasses, tolerance);
```

**5. MaqamData + Pitch Classes → Maqam[] (Taswir)**
```typescript
// Function: calculateMaqamTranspositions()
const maqamTranspositions = calculateMaqamTranspositions(
  pitchClasses,
  maqamData,
  tolerance,
  includeEmbeddedAjnas
);
```

**6. Maqam → Modulations**
```typescript
// Function: modulate()
const modulations = modulate(
  maqam,
  pitchClasses,
  allJinsData,
  allMaqamData,
  mode, // 'maqamat' or 'ajnas'
  tolerance
);
```

---

## Note Name System

### NoteName Type

**Location**: `src/models/NoteName.ts`

**Purpose**: Defines all valid transliterated Arabic note names.

**Structure**:
- `octaveOneNoteNames` - First octave names
- `octaveTwoNoteNames` - Second octave names
- System extends to 4 octaves for comprehensive analysis

**Critical Understanding**: Note names are **cultural identifiers**, NOT pitch classes. The same note name can have different frequencies in different tuning systems.

### Octave System

| Octave | Arabic Term | Prefix | Example |
|--------|-------------|--------|---------|
| 1 | qarār | None | dūgāh |
| 2 | ʿushayrān | None | dūgāh |
| 3 | jawāb | _j | dūgāh_j |
| 4 | jawāb jawāb | _jj | dūgāh_jj |

**Functions:**
- `shiftNoteName(name, octaves)` - Shift note names up/down octaves
- `getNoteNameOctave(name)` - Get octave number from note name

---

## Path Aliases

**Always use** `@/*` for imports (configured in `tsconfig.json`):

```typescript
// ✅ Correct
import { getTuningSystems } from '@/functions/import';
import NoteName from '@/models/NoteName';
import { useAppContext } from '@/contexts/app-context';

// ❌ Wrong
import { getTuningSystems } from '../../../functions/import';
```

---

## API Pattern

### Standard API Route Structure

**Location**: `src/app/api/[endpoint]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getTuningSystems } from '@/functions/import';

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    
    // 2. Load data via import functions
    const data = getTuningSystems();
    
    // 3. Compute with src/functions/**
    const result = processData(data, body);
    
    // 4. Return typed JSON
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### Validation Requirements

- **Required parameters**: Return 400 if missing
- **Invalid IDs**: Return 404 with helpful message
- **Default behavior**: Document what happens when optional parameters omitted
- **Tuning system IDs**: Verify exact IDs from data files (includes suffixes like `-(950g)`)

---

## Component Patterns

### Manager Components

**Pattern**: Follow `tuning-system-manager.tsx` structure

**Characteristics:**
- Handle CRUD operations
- Support admin/user modes
- Use FilterContext for search
- Implement bilingual support
- Connect to proper data sources

### Transposition Components

**Pattern**: Follow `jins-transpositions.tsx` structure

**Characteristics:**
- Display all valid transpositions
- Pre-compute using TranspositionsContext
- Support filtering and search
- Show availability counts
- Enable selection/playback

### Visualization Components

**Pattern**: Follow `staff-notation.tsx` structure

**Characteristics:**
- Render musical notation or analysis
- Use VexFlow for staff notation
- Support both ascending/descending sequences
- Handle enharmonic spelling
- Provide interactive features

---

## Performance Considerations

### Expensive Operations

**Transposition Calculations:**
- Pattern matching across 4 octaves
- Can take seconds for complex systems
- Pre-compute in TranspositionsContext

**Modulation Analysis:**
- Nested transposition calls
- Can take minutes per tuning system
- Show progress indicators
- Use `setTimeout(resolve, 0)` for UI responsiveness

**Large Exports:**
- Full system exports can be GB of data
- Memory optimization: Auto-set 4GB Node limit
- Progress tracking essential
- Filename sanitization for cross-platform compatibility

### Optimization Strategies

```typescript
// Use useMemo for expensive calculations
const expensiveData = useMemo(() => 
  computeComplexCalculation(), 
  [dependencies]
);

// Pre-compute in context
const { allTranspositions } = useTranspositionsContext();

// Yield control during long operations
await new Promise(resolve => setTimeout(resolve, 0));

// Stream large data exports
// (See scripts/batch-export/batch-export.js)
```

---

## Client-Side vs Server-Side

### Client-Side Only

**Web Audio API:**
```typescript
"use client"; // Required directive

useEffect(() => {
  if (typeof window !== 'undefined') {
    // Web Audio code here
  }
}, []);
```

**React State & Hooks:**
- All context providers
- Components using useState, useEffect, etc.
- Event handlers

### Server-Side

**API Routes:**
- Data loading and processing
- Heavy computations
- File system access

**Static Generation:**
- Documentation pages
- Static assets

---

## State Management Flow

### Cascading Updates

```
User changes tuning system
  → AppContext updates selectedTuningSystem
    → AppContext recalculates allPitchClasses
      → TranspositionsContext recalculates transpositions
        → UI components re-render with new data
          → SoundContext updates playable pitch classes
```

### State Cleanup

**When tuning system changes:**
```typescript
// Full cleanup
clearSelections();

// Partial cleanup
clearJinsSelections();
clearMaqamSelections();
```

### URL State Synchronization

```typescript
// Enable deep-linking
handleUrlParams({
  maqam: 'maqam-rast-al-rast',
  tuningSystem: 'Al-Farabi-(950g)',
  startingNote: 'yegah_5'
});
```

---

## Python-TypeScript Parity

### Parallel Implementations

**Purpose**: Validation, testing, batch processing

**Structure**:
- `python/models/` ↔ `src/models/`
- `python/functions/` ↔ `src/functions/`
- Both share `data/*.json`

**Use Cases:**
- Data processing and analytics generation
- Batch exports
- Validation testing
- Cross-platform verification

---

## Export System Architecture

### Web UI Export Modal

**Location**: Component in main app

**Features:**
- Export selected tuning system configuration
- Optional: ajnas details, maqamat details, modulations
- Same data structure as batch CLI

### CLI Batch Export

**Location**: `scripts/batch-export/batch-export.js`

**Features:**
- Built with `tsx` for TypeScript execution
- Memory optimization (4GB Node limit)
- Filename sanitization (cross-platform)
- Timestamped batch folders
- Progress tracking

**Export Data Structure:**
```typescript
{
  exportInfo: {
    timestamp: string;
    tuningSystem: string;
    startingNote: string;
    // ... metadata
  };
  tuningSystemData: TuningSystem;
  summaryStats: {
    pitchClasses: number;
    ajnas: number;
    maqamat: number;
  };
  pitchClassReference: PitchClass[];
  allAjnasData?: { [name: string]: MergedJins };
  allMaqamatData?: { [name: string]: MergedMaqam };
}
```

---

## Integration Checklist

When adding new features:

- [ ] Use `@/*` path imports exclusively
- [ ] Integrate with AppContext for core state
- [ ] Use appropriate context (Sound, Transpositions, Language, etc.)
- [ ] Guard Web Audio with client-side checks
- [ ] Implement bilingual support via LanguageContext
- [ ] Use FilterContext for search/filter features
- [ ] Follow established component patterns
- [ ] Consider performance (memoization, pre-computation)
- [ ] Update TypeDoc comments
- [ ] Test across multiple tuning systems
- [ ] Verify URL parameter integration
- [ ] Document significant patterns discovered
