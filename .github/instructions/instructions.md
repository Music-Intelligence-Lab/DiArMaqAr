---
applyTo: '**'
lastUpdated: '2025-09-24'
---

# Digital Arabic Maqām Archive (DiArMaqAr) - Development Instructions

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Core Principles](#core-principles)
3. [Architecture Overview](#architecture-overview)
4. [Development Conventions](#development-conventions)
5. [Auto-Implementation Rules](#auto-implementation-rules)
6. [Component Patterns](#component-patterns)
7. [API Development](#api-development)
8. [Data Flow & Context](#data-flow--context)
9. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Communication Style
- **Concise responses** - No summaries unless requested
- **Direct implementation** - Use established patterns without asking
- **Minimal tokens** - Brief, focused responses
- **No markdown reports** - Make changes directly to code

### Auto-Implementation Triggers
| User Says | Auto-Implement |
|-----------|----------------|
| "search/filter" | FilterContext + useFilterContext |
| "play/audio" | SoundContext + client guards |
| "maqam/jins data" | TranspositionsContext + import functions |
| "new page" | Context providers + manager pattern |
| "API endpoint" | import.ts + validation + Swagger |
| "component" + domain | Follow manager pattern |

### Systematic Debugging Protocol
**When bugs involve multiple layers (UI + functions + exports):**

1. **Isolate the Layer** - Determine if issue is in UI state, core functions, or export logic
2. **Test Core Functions First** - Verify mathematical/computational functions work in isolation
3. **Check Data Flow** - Trace data from source → processing → display/export
4. **Validate Both Paths** - UI and export systems may use different code paths for same functionality
5. **Document Findings** - Complex bugs often reveal architectural insights worth preserving

**Red Flags That Indicate Multi-Layer Issues:**
- Inconsistent behavior between UI and exports
- Character encoding/normalization problems
- Type errors that seem to "work" but produce wrong output
- Progress/performance issues that seem unrelated to core logic

### Critical Defaults
- **Default cents tolerance**: 5 (always unless specified)
- **Path imports**: Use `@/*` alias exclusively
- **Language support**: Auto-implement bilingual via `useLanguageContext`
- **Client-side audio**: Always guard Web Audio with client checks
- **File safety**: Always search and verify locations before edits

---

## Core Principles

### Cultural Framework
- **Decolonial computing** - Prioritize Arabic theoretical frameworks
- **Historical authenticity** - Ground in Arab-Ottoman-Persian traditions
- **Scholarly methodology** - Systematic implementation with citations
- **Cultural specificity** - Avoid Anglo-European-centric approaches

### Starting Note Conventions
**Critical Understanding**: Different starting points represent fundamentally different theoretical approaches:

- **ʿushayrān-based**: Oud tuning traditions (perfect fourths)
- **yegāh-based**: Monochord/sonometer measurements
- **rāst-based**: Established theoretical frameworks

⚠️ **Not simple transposition** - affects mathematical relationships, available maqāmāt, and modulation possibilities.

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: SCSS with modular components
- **Audio**: Custom Web Audio API + VexFlow notation
- **Documentation**: TypeDoc for API generation

### Project Structure
```
src/
├── app/
│   ├── api/**        # Server endpoints (Next.js 15 app router)
│   ├── (pages)/      # Page components and layouts
│   └── globals.css   # Global styles
├── audio/           # Web Audio API utilities and synthesis
├── components/       # Reusable UI components
├── contexts/         # React context providers for state management
├── functions/        # Core computational musicology functions
├── models/           # TypeScript classes and data models
└── styles/          # SCSS modules and styling

data/                # Ground-truth musical data (JSON files)
public/
├── docs/            # Comprehensive documentation
└── images/          # Static assets
scripts/             # Utility scripts and tools
├── batch-export/    # CLI tool for batch data export
python/              # Python mirror for validation and testing
```

### Path Aliases
Always use `@/*` for imports (see `tsconfig.json`):
```typescript
import { getTuningSystems } from '@/functions/import';
import NoteName from '@/models/NoteName';
```

---

## Development Conventions

### Note Names & Pitch Classes
```typescript
// ✅ Use canonical transliterated names
import NoteName from '@/models/NoteName';
const note: NoteName = "rāst_5";

// ✅ Detect and convert pitch class formats
import { detectPitchClassType, convertPitchClass } from '@/functions/utilities';

// ✅ Default cents tolerance
const tolerance = 5; // Always default to 5 unless context requires different
```

### Tuning Systems
```typescript
// ✅ Never hardcode - always load dynamically
const tuningSystems = getTuningSystems();
const noteNameSets = tuningSystem.getNoteNameSets();

// ✅ Generate pitch space
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);
```

### Component Creation Checklist
```typescript
"use client"; // 1. If using hooks/state

// 2. Import context hooks
import { useAppContext } from '@/contexts/app-context';
import { useLanguageContext } from '@/contexts/language-context';

// 3. Implement FilterContext if handling lists
import { useFilterContext } from '@/contexts/filter-context';

// 4. Use bilingual support
const { t, language } = useLanguageContext();

// 5. Guard Web Audio
useEffect(() => {
  // Client-side audio code only
}, []);
```

---

## Auto-Implementation Rules

### Implementation Protocol
1. **Read Request** → Identify domain (maqam/jins/tuning/audio/UI)
2. **Auto-Apply Architecture** → Use established patterns
3. **Integrate by Default** → Assume integration with existing systems
4. **Validate Automatically** → Check against conventions
5. **Enhance Progressively** → Add bilingual/URL/performance features

### When to Auto-Implement (Don't Ask)
- **New features** → Integrate with context architecture
- **Data queries** → Use import functions, never direct JSON
- **API endpoints** → Include Swagger docs + validation
- **Types** → Use existing union types over any/unknown
- **Errors** → Follow established error patterns

### When to Ask
- **Truly ambiguous choices** or architectural decisions
- **Breaking changes** to existing patterns
- **New theoretical frameworks** not covered in data

---

## Component Patterns

### Manager Components
Follow pattern of `tuning-system-manager.tsx`:
```typescript
// Manager handles CRUD operations with admin/user modes
// Uses FilterContext for search
// Implements bilingual support
// Connects to proper data sources
```

### Context Integration
```typescript
// Context hierarchy
AppContext (global state)
└── SoundContext (audio)
    └── TranspositionsContext (performance optimization)
        └── FilterContext, MenuContext, LanguageContext (UI state)
```

### Performance Optimization
```typescript
// Use useMemo for expensive calculations
const expensiveData = useMemo(() =>
  computeComplexCalculation(), [dependencies]);

// Pre-compute transpositions in context
const { allTranspositions } = useTranspositionsContext();
```

---

## API Development

### Standard API Pattern
```typescript
// Route: src/app/api/[endpoint]/route.ts
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
- **Default behavior**: Always document what happens when optional parameters omitted
- **Tuning system IDs**: Verify exact IDs from data files (includes suffixes)

### Documentation Standards
- **Swagger docs** in route files
- **HTML documentation** in `public/docs/api/index.html`
- **Example requests** with verified IDs from actual data

---

## Data Flow & Context

### Core Data Flow
```typescript
// 1. Import JSON → Typed Models
const tuningSystems = getTuningSystems();
const ajnas = getAjnas();
const maqamat = getMaqamat();

// 2. Generate Pitch Space
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote);

// 3. Build Playable Structures
const jinsTranspositions = calculateJinsTranspositions(pitchClasses, jins);
const maqamTahlil = maqamData.getTahlil(pitchClasses);
```

### State Dependencies
```typescript
// Changes trigger cascading updates:
selectedTuningSystem → allPitchClasses → transpositions → UI selections

// Handle cleanup when tuning system changes
clearSelections(); // Full cleanup
clearJinsSelections(); // Partial cleanup
```

### URL State Synchronization
```typescript
// Enable deep-linking with descriptive parameters
handleUrlParams({
  maqam: 'maqam-rast-al-rast',
  tuningSystem: 'Al-Farabi-(950g)',
  startingNote: 'yegah_5'
});
```

---

## Troubleshooting

### Common Issues & Solutions

**File Edit Failures**
```typescript
// ✅ Always use Read tool before editing
// ✅ Verify exact file locations with grep/search
// ✅ Double-check content matches before edits
```

**Audio Issues**
```typescript
// ✅ Guard all Web Audio with client-side checks
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Audio code here
  }
}, []);
```

**Import/Path Issues**
```typescript
// ✅ Use @/* alias exclusively
// ❌ Don't reference packages/* (excluded from build)
import { function } from '@/functions/example';
```

**Tuning System Matching**
```typescript
// ✅ Use exact IDs from data files
const systemId = "Al-Farabi-(950g)"; // Note: includes suffix

// ✅ Check available systems
const systems = getTuningSystems();
console.log(systems.map(s => s.getId()));
```

### Debugging Complex Multi-Layer Issues

**Character Normalization Debugging Pattern**
```bash
# 1. Check current state
grep -c "ʾ" export.json  # Count problematic characters
grep -n "maqam_awj_.*ara.*" export.json  # Find specific examples

# 2. Test normalization function
node -e "console.log(standardizeText('ʾaraʾ'))"  # Test directly

# 3. Verify both UI and export systems
# UI: Check component state management
# Export: Check TypeScript function application
```

**Octave Shift Implementation Lessons**
- **UI vs Export Consistency**: Different approaches can diverge - UI may use state management while exports use pure functions
- **Type Discrimination**: Use runtime property checking (`'ascendingPitchClasses' in object`) rather than TypeScript types for data differentiation
- **Error Propagation**: `map().filter()` pattern to cleanly remove failed operations (`filter((x): x is T => x !== null)`)
- **Progress Tracking**: Always update progress during long operations with `setTimeout(resolve, 0)` for UI responsiveness

**Character Standardization Architecture**
- **Dual Standardization**: 
  - **Keys/IDs**: Apply `standardizeText()` for clean programming identifiers
  - **Display Names**: Preserve original diacritics for scholarly accuracy
- **Function Scope**: `standardizeText()` should be simple and focused - avoid over-engineering
- **Testing Strategy**: Test with actual data exports, not just unit tests

**Export System Complexity Management**
- **Filename vs Content**: Separate normalization for filenames (comprehensive) vs content (selective)
- **Timestamp Consistency**: Use local time for user-friendly filenames, UTC for internal timestamps
- **Progress Callbacks**: Essential for large exports - implement early, not as afterthought
- **Memory Efficiency**: Use streaming/chunking for large data sets

### Performance Considerations
- **Modulation calculations** can take minutes for complex systems
- **TranspositionsContext** pre-computes to avoid repeated calculations
- **Yield control** with setTimeout(resolve, 0) for UI updates
- **Memory management** for large data exports

### Context Availability
```typescript
// ✅ Always use custom hooks
const { selectedTuningSystem } = useAppContext();

// ✅ Include error boundaries
if (!selectedTuningSystem) {
  throw new Error('TuningSystem context not available');
}
```

---

## Development Workflows

### Setup & Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Production build
npm run lint        # Code linting
npm run docs        # Generate TypeDoc documentation
```

### Documentation Generation
```bash
npm run docs        # Outputs to public/docs/library
```

### Testing
```bash
# Python toolkit for validation
python python/test_core_functions.py
python python/test_functions.py
python python/test_models.py
```

---

## Data Structure Reference

### Key Models
- **TuningSystem**: Historical tuning systems with source citations
- **MaqamData/JinsData**: Abstract musical structures
- **PitchClass**: Concrete sound with frequency/cents/MIDI
- **NoteName**: Canonical transliterated note names

### Export Structure
```typescript
interface ExportedTuningSystem {
  exportInfo: { timestamp: string };
  tuningSystemData: TuningSystem;
  summaryStats: ComprehensiveStatistics;
  pitchClassReference: { [noteName: string]: PitchClass };
  allAjnasData?: { [name: string]: MergedJins };
  allMaqamatData?: { [name: string]: MergedMaqam };
}
```

### Modulation Analysis
- **Al-Shawwā Algorithm**: First systematic digital implementation
- **Historical Guidelines**: Based on 1946 modulation principles
- **Tuning System Dependent**: Different systems have different modulation possibilities
- **Maqamat vs Ajnas Modulations**:
  - **Maqamat**: Have modulation data (can modulate FROM maqamat TO other maqamat)
  - **Ajnas**: Do NOT have modulation data (we only modulate TO ajnas, never FROM ajnas)
  - **Export Implication**: Only maqamat exports include `modulationsLowerOctave` (8vb data)

---

*This document should be reviewed quarterly to ensure examples remain current and accurate.*