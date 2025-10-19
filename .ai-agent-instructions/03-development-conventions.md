# Development Conventions & Best Practices

Coding standards and conventions for the Digital Arabic Maqām Archive

---

## Quick Reference

### Critical Defaults

- **Default cents tolerance**: 5 (always unless specified otherwise)
- **Path imports**: Use `@/*` alias exclusively
- **Language support**: Auto-implement bilingual via `useLanguageContext`
- **Client-side audio**: Always guard Web Audio with client checks
- **File safety**: Always search and verify locations before edits

### Auto-Implementation Triggers

| User Says | Auto-Implement |
|-----------|----------------|
| "search/filter" | FilterContext + useFilterContext |
| "play/audio" | SoundContext + client guards |
| "maqam/jins data" | TranspositionsContext + import functions |
| "new page" | Context providers + manager pattern |
| "API endpoint" | import.ts + validation + Swagger |
| "component" + domain | Follow manager pattern |

---

## Terminology Standards

### Arabic Maqām Theory Terms

**NEVER use "microtonal"**: This Western-centric term implies deviation from equal temperament as the norm.

**✅ Use instead:**
- "unequal divisions"
- "non-12-EDO pitches"
- "pitches with fractional precision"
- "pitches with decimal/fractional MIDI values"
- Or describe the specific theoretical framework

**Applies to ALL:**
- Code comments
- Documentation
- Variable names
- Function names
- Export data comments
- User-facing text

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

---

## Component Creation Checklist

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
  if (typeof window !== 'undefined') {
    // Client-side audio code only
  }
}, []);
```

### Component Structure Template

```typescript
"use client";

import { useAppContext } from '@/contexts/app-context';
import { useLanguageContext } from '@/contexts/language-context';
import { useFilterContext } from '@/contexts/filter-context';
import styles from '@/styles/component-name.module.scss';

export default function ComponentName() {
  const { 
    selectedTuningSystem, 
    allPitchClasses 
  } = useAppContext();
  
  const { t, language } = useLanguageContext();
  const { searchTerm, setSearchTerm } = useFilterContext();

  // Component logic
  
  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
}
```

---

## Import & Data Loading

### Always Use Import Functions

```typescript
// ✅ Correct - use import functions
import { getTuningSystems, getAjnas, getMaqamat } from '@/functions/import';

const tuningSystems = getTuningSystems();
const ajnas = getAjnas();
const maqamat = getMaqamat();

// ❌ Wrong - never load JSON directly
import tuningSystems from '@/data/tuningSystems.json';
```

### Tuning System Pattern

```typescript
// ✅ Never hardcode - always load dynamically
const tuningSystems = getTuningSystems();
const noteNameSets = tuningSystem.getNoteNameSets();

// ✅ Generate pitch space
import { getTuningSystemPitchClasses } from '@/functions/import';

const pitchClasses = getTuningSystemPitchClasses(
  tuningSystem,
  startingNote,
  referenceFrequency
);
```

---

## API Development Standards

### Route Structure

```typescript
// src/app/api/[endpoint]/route.ts
import { NextResponse } from 'next/server';
import { getTuningSystems } from '@/functions/import';

/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Brief description
 *     description: Detailed description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requiredParam
 *             properties:
 *               requiredParam:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 *       400:
 *         description: Bad request
 */
export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const { requiredParam } = body;
    
    if (!requiredParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: requiredParam' },
        { status: 400 }
      );
    }

    // 2. Load data via import functions
    const data = getTuningSystems();

    // 3. Compute with src/functions/**
    const result = processData(data, body);

    // 4. Return typed JSON
    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### API Documentation Requirements

- **Swagger docs** in route files
- **HTML documentation** in `public/docs/api/index.html`
- **Example requests** with verified IDs from actual data
- **Default behavior** explicitly documented

---

## TypeScript Conventions

### Type Safety

```typescript
// ✅ Use existing union types
import NoteName from '@/models/NoteName';
const note: NoteName = "dūgāh";

// ✅ Use proper interfaces
interface MaqamProps {
  maqamData: MaqamData;
  pitchClasses: PitchClass[];
  tolerance?: number;
}

// ❌ Avoid any/unknown unless absolutely necessary
const data: any; // ❌
const data: unknown; // ❌ (unless for external data)
```

### Null Safety

```typescript
// ✅ Always check for null/undefined
if (!selectedTuningSystem) {
  throw new Error('TuningSystem context not available');
}

// ✅ Use optional chaining
const name = tuningSystem?.getName(language);

// ✅ Use nullish coalescing
const tolerance = userTolerance ?? 5;
```

---

## Performance Optimization

### Memoization

```typescript
import { useMemo } from 'react';

// ✅ Memoize expensive calculations
const transpositions = useMemo(() => {
  return calculateJinsTranspositions(
    pitchClasses,
    jinsData,
    tolerance
  );
}, [pitchClasses, jinsData, tolerance]);
```

### Context Pre-computation

```typescript
// ✅ Use TranspositionsContext for expensive operations
const { allTranspositions } = useTranspositionsContext();

// ❌ Don't recalculate on every render
const transpositions = calculateJinsTranspositions(...); // ❌
```

### Long Operations

```typescript
// ✅ Yield control to UI during long operations
for (let i = 0; i < items.length; i++) {
  // Process item
  
  // Yield control every 100 items
  if (i % 100 === 0) {
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Update progress
    updateProgress((i / items.length) * 100);
  }
}
```

---

## Error Handling

### Standard Error Pattern

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  } else {
    console.error('Unexpected error:', error);
    // Fallback handling
  }
}
```

### User-Facing Errors

```typescript
// ✅ Helpful error messages
throw new Error(`Maqām "${id}" not found in tuning system "${systemId}"`);

// ❌ Vague error messages
throw new Error('Not found'); // ❌
```

---

## State Management

### Context Usage

```typescript
// ✅ Always use custom hooks
const { selectedTuningSystem } = useAppContext();

// ❌ Don't use context directly
import { AppContext } from '@/contexts/app-context';
const context = useContext(AppContext); // ❌
```

### State Updates

```typescript
// ✅ Clear related state when dependencies change
const handleTuningSystemChange = (system: TuningSystem) => {
  setSelectedTuningSystem(system);
  clearSelections(); // Clear dependent selections
};

// ✅ Batch state updates
setSelectedJins(jins);
setSelectedMaqam(null); // Clear conflicting state
```

---

## Styling Conventions

### SCSS Modules

```typescript
// ✅ Use SCSS modules
import styles from '@/styles/component-name.module.scss';

<div className={styles.container}>
  <h1 className={styles.title}>{title}</h1>
</div>

// ❌ Don't use global styles in components
<div className="container"> // ❌
```

### Class Naming

```scss
// component-name.module.scss

.container {
  // Container styles
}

.title {
  // Title styles
}

.itemList {
  // List styles
}

.item {
  // Item styles
  
  &--selected {
    // Selected variant
  }
  
  &--disabled {
    // Disabled variant
  }
}
```

---

## Bilingual Support

### Language Context

```typescript
import { useLanguageContext } from '@/contexts/language-context';

const { t, language } = useLanguageContext();

// ✅ Use t() for static strings
<h1>{t('welcomeMessage')}</h1>

// ✅ Access language-specific properties
<p>{tuningSystem.getName(language)}</p>
```

### Translations Pattern

```typescript
// Define translations in component or context
const translations = {
  en: {
    welcomeMessage: 'Welcome',
    selectSystem: 'Select Tuning System'
  },
  ar: {
    welcomeMessage: 'مرحبا',
    selectSystem: 'اختر نظام التوتير'
  }
};
```

---

## File Organization

### Import Order

```typescript
// 1. External dependencies
import { useState, useEffect, useMemo } from 'react';
import { NextResponse } from 'next/server';

// 2. Models
import TuningSystem from '@/models/TuningSystem';
import NoteName from '@/models/NoteName';

// 3. Functions
import { getTuningSystems } from '@/functions/import';
import { calculateJinsTranspositions } from '@/functions/transpose';

// 4. Contexts
import { useAppContext } from '@/contexts/app-context';
import { useLanguageContext } from '@/contexts/language-context';

// 5. Components
import NavigationMenu from '@/components/navigation/navigation-menu';

// 6. Styles
import styles from '@/styles/component.module.scss';

// 7. Types (if separate file)
import type { ComponentProps } from './types';
```

---

## Testing Approach

### Manual Testing

**See**: `.ai-agent-instructions/05-testing-guide.md`

**Key areas:**
- Availability testing across tuning systems
- Asymmetric maqāmāt handling
- Enharmonic spelling algorithm
- Transposition calculations
- Modulation analysis

### Python Tests

```bash
cd python
python test_models.py         # Model tests
python test_functions.py      # Function tests
python test_import.py          # Data loading tests
```

---

## Documentation Standards

### Code Comments

```typescript
// ✅ Explain WHY, not WHAT
// Arabic maqām theory uses independent ascending/descending sequences
// These are NOT simply reversed - fundamentally different melodic paths
const ascendingPitchClasses = [...];
const descendingPitchClasses = [...]; // Independent array

// ❌ Don't state the obvious
// Set the variable to 5
const tolerance = 5; // ❌
```

### JSDoc Comments

```typescript
/**
 * Calculates all valid transpositions of a jins within a tuning system.
 * 
 * @param pitchClasses - Available pitch classes from the tuning system
 * @param jinsData - Abstract jins definition
 * @param tolerance - Cents tolerance for pattern matching (default: 5)
 * @returns Array of Jins instances, one per valid transposition
 * 
 * @remarks
 * Uses pattern matching to find all starting positions where the jins
 * intervals can be constructed within the cents tolerance.
 */
function calculateJinsTranspositions(
  pitchClasses: PitchClass[],
  jinsData: JinsData,
  tolerance: number = 5
): Jins[] {
  // Implementation
}
```

---

## Git Workflow

### Commit Messages

```bash
# ✅ Clear, descriptive commits
git commit -m "Fix enharmonic spelling for descending asymmetric maqāmāt"
git commit -m "Add batch export progress tracking"
git commit -m "Update documentation for octave system"

# ❌ Vague commits
git commit -m "Fix bug" # ❌
git commit -m "Update" # ❌
```

### Branch Strategy

- **Main branch**: `main`
- Feature branches as needed
- PR to main after testing

---

## Common Pitfalls

### File Edit Failures

```typescript
// ✅ Always verify file locations first
// Use grep_search or file_search before editing

// ✅ Read file content before editing
// Use read_file to verify exact content

// ✅ Include sufficient context in edits
// Include 3-5 lines before/after for replace_string_in_file
```

### Import Issues

```typescript
// ✅ Use @/* alias exclusively
import { function } from '@/functions/example';

// ❌ Don't reference packages/* (excluded from build)
import { function } from '@/packages/example'; // ❌

// ❌ Don't use relative paths
import { function } from '../../../functions/example'; // ❌
```

### Audio Issues

```typescript
// ✅ Guard all Web Audio with client-side checks
"use client";

useEffect(() => {
  if (typeof window !== 'undefined') {
    // Audio code here
  }
}, []);

// ❌ Don't use Web Audio in server components
const audioContext = new AudioContext(); // ❌ Will fail in SSR
```

---

## Knowledge Preservation Protocol

**After completing any task successfully:**

1. **Review the completed work** for unique insights
2. **Document significant findings** in appropriate instruction files
3. **Include specific examples** from the implementation
4. **Explain implications** for future development

**What qualifies as documentation-worthy:**
- Musicological principles discovered
- Algorithmic patterns specific to Arabic maqām theory
- Common pitfalls and solutions
- Data structure insights
- Integration patterns
- Terminology clarifications

**Update these files:**
- This file (`03-development-conventions.md`) for coding patterns
- `04-musicological-principles.md` for music theory insights
- `05-testing-guide.md` for new test scenarios
- `06-documentation-standards.md` for doc patterns
