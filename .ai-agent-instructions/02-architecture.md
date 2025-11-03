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

**7. Maqam → Family Classification**
```typescript
// Function: classifyMaqamFamily()
const classification = classifyMaqamFamily(maqam);
// Returns: { method, familyName, fullJinsName, scaleDegree, source }
```

**CRITICAL**: Family classification requires a `Maqam` object (not `MaqamData`), which means it needs ajnās analysis. For consistent classification across all maqāmāt, always use **al-Ṣabbāgh (1954)** as the canonical tuning system reference with each maqām's own canonical starting note. See `03-development-conventions.md` → "Family Classification Pattern" for implementation details.

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

## API Design Patterns

### Progressive Disclosure Pattern

**Pattern**: Users discover → check availability → commit to data retrieval

```
1. LIST      → Browse all maqāmāt/ajnās (metadata only)
2. AVAILABLE → Check compatibility with tuning systems
3. DATA      → Get full data with flexible formatting
```

**Benefits:**
- Reduced bandwidth for exploratory queries
- Clear separation of concerns
- Supports both casual exploration and deep analysis

**Example Implementation:**
```typescript
// Step 1: List all maqāmāt (metadata only, no pitch data)
GET /api/maqamat
→ Returns: id, name, family, availability count

// Step 2: Check availability for specific maqām
GET /api/maqamat/{id}/availability
→ Returns: which (tuningSystem, startingNote) combinations support this maqām

// Step 3: Get full maqām data (commits to full data retrieval)
GET /api/maqamat/{id}?tuningSystem=X&startingNote=Y&format=all
→ Returns: complete pitch classes, intervals, embedded ajnās, modulations
```

### Format Negotiation Pattern

**Pattern**: Single endpoint, multiple representations

**Available Formats:**
- `format=cents` - Western notation (default visualization)
- `format=frequency` - Synthesis/audio applications
- `format=fraction` - Theoretical analysis (ratios)
- `format=midi` - MIDI controllers
- `format=stringLength` - Lute/oud instruments
- `format=all` - All representations

**Benefits:**
- Single endpoint serves multiple use cases
- Reduces API complexity
- Clear separation of data vs presentation

**Implementation:**
```typescript
GET /api/maqamat/{id}?tuningSystem=X&startingNote=Y&format=cents
→ Returns only cents values

GET /api/maqamat/{id}?tuningSystem=X&startingNote=Y&format=all
→ Returns all format representations
```

### Diacritics Insensitivity Pattern

**Pattern**: All text matching uses `standardizeText()` utility function

**Purpose**: Reduce API friction for non-Arabic keyboards

**Examples:**
- "yegah" matches "yegāh"
- "rast" matches "rāst"
- "Sabbagh" matches "Ṣabbāgh"

**Implementation:**
```typescript
import { standardizeText } from '@/functions/utilities';

// Matching
if (standardizeText(family) === standardizeText(maqam.family)) { ... }

// Sorting
families.sort((a, b) =>
  standardizeText(a).localeCompare(standardizeText(b))
);
```

---

## API Route Implementation

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

---

## API Design Principles & Lessons Learned

### Entity Object Pattern (CRITICAL)

**Rule**: Always return complete entity objects with `{id, idName, displayName}` structure. Never return flat string arrays or bare IDs for entity references.

**Why**:
- Prevents additional API calls to retrieve display information
- Enables proper rendering of Arabic diacritics in UI without lookups
- Follows "Always include both display and URL-safe IDs" architectural principle
- Provides complete semantic information in single response

**Bad Example** ❌:
```typescript
ajnas: {
  ascending: ["jins_bayyat", "jins_segah"]
}
```

**Good Example** ✅:
```typescript
ajnas: {
  ascending: [
    { id: "2", idName: "jins_bayyat", displayName: "jins bayyāt" },
    { id: "3", idName: "jins_segah", displayName: "jins segāh" }
  ]
}
```

**Implementation Pattern**:
```typescript
// Create entity lookup Maps
const jinsIdToEntity = new Map<string, any>();
for (const jins of ajnas) {
  jinsIdToEntity.set(jins.getId(), {
    id: jins.getId(),
    idName: jins.getIdName(),
    displayName: jins.getName()
  });
}

// Map to full objects with filter for null safety
responseData.ajnas = {
  ascending: transposition.ascendingMaqamAjnas
    .map(jins => jinsIdToEntity.get(jins.jinsId))
    .filter(Boolean) || []
};
```

### Context Object Nesting

**Rule**: Related configuration data should be nested logically within parent objects, not spread across the root level.

**Bad Example** ❌:
```json
{
  "context": {
    "tuningSystem": {...},
    "startingNote": "ushayran",
    "referenceFrequency": 97.999
  }
}
```

**Good Example** ✅:
```json
{
  "context": {
    "tuningSystem": {
      "id": "IbnSina-(1037)",
      "displayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
      "startingNoteName": "ushayran",
      "referenceFrequency": 97.999
    }
  }
}
```

### Metadata Fields in Formatted Data

**Rule**: When returning formatted pitch/interval data, always include positioning metadata regardless of requested format.

**Required Metadata**:
```typescript
{
  pitchClassIndex: number,      // Position in tuning system
  scaleDegree: string,          // Roman numeral (I, II, III)
  noteName: string,             // URL-safe identifier
  noteNameDisplay: string,      // With diacritics
  // ... then format-specific fields
}
```

### Field Naming Consistency

**Patterns to follow**:
- Use `[field]Name` suffix when referring to name strings: `startingNoteName`, `displayName`, `idName`
- Consistent entity structure: `{id, idName, displayName}`
- Boolean fields: `includeIntervals`, `isDescending`
- Never abbreviate unless established convention exists

### Legacy Alias Policy

**Rule**: Do not maintain legacy aliases "for backward compatibility" without proper API versioning.

**Why**: Creates confusion, increases test burden, bloats documentation.

**Action**: Clean removal is better than indefinite maintenance. If backward compatibility is required, implement proper API versioning (v1, v2).

### API-UI Synchronization Checklist

When adding/removing/changing API format options, update ALL components:

1. ✅ API route handler (`formatPitchData()` case statements)
2. ✅ UI dropdown options (Material-UI `MenuItem` components)
3. ✅ Test suite (add/remove test cases)
4. ✅ OpenAPI specification (parameter descriptions)
5. ✅ Documentation (README, API guides)
6. ✅ TypeScript types/interfaces (if applicable)

**Why**: Prevents UI-API drift that causes user confusion and failed requests.

### Response Verification Workflow

**Rule**: After API structural changes, verify responses with actual HTTP requests.

**Tools & Commands**:
```bash
# Check entity object structure
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.ajnas.ascending[0:2]'

# Verify context nesting
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.context'

# Check modulations
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.modulations.maqamat.onFirstDegree[0:3]'
```

**What to verify**:
- ✅ Arabic diacritics render correctly (`maqām ḥijāz`)
- ✅ Entity objects contain all three fields
- ✅ Context structure is properly nested
- ✅ No `null`/`undefined` in arrays
- ✅ Field names match documentation

### UI Label Formatting

**Rule**: Dropdown labels should be clean and user-friendly.

**Bad** ❌: `<MenuItem value="stringLength">stringLength - String lengths</MenuItem>`

**Good** ✅: `<MenuItem value="stringLength">String Lengths</MenuItem>`

**Why**: Field name already exists as value attribute; reduces visual clutter.

### Current API Format Count

**Total**: 15 pitch class data types

1. `all` - Complete pitch class data
2. `pitchClassIndex` - Index in tuning system
3. `scaleDegree` - Roman numeral position
4. `englishName` - English note names
5. `fraction` - Interval fractions
6. `cents` - Cent values
7. `decimalRatio` - Decimal ratios
8. `stringLength` - String lengths
9. `frequency` - Frequencies in Hz
10. `abjadName` - Abjad notation names
11. `fretDivision` - Fret divisions
12. `midiNoteNumber` - MIDI note numbers
13. `midiNoteDeviation` - MIDI + cents deviation
14. `centsDeviation` - Cents deviation from ET
15. `referenceNoteName` - IPN reference names

**Legacy aliases removed**: 5 (frequencies, fractions, ratios, midi, stringLengths)

---

## Additional Resources

**For detailed API implementation notes**, see:
- `src/app/api/playground/SESSION_SUMMARY.md` - Comprehensive v2 API development session notes including:
  - Progressive disclosure pattern implementation
  - Validation patterns and error handling
  - 27 automated test cases
  - API playground UX design decisions
  - Real-world examples of all endpoints
  - Testing framework and quality metrics

---

*Last Updated: 2025-10-29*
