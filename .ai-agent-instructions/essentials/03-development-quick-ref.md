# Development Quick Reference

**PURPOSE**: Essential coding standards, TDD workflow, and common patterns for DiArMaqAr development.

**LOAD**: For most development tasks, especially when writing code, creating components, or working on APIs.

---

## 🚀 Quick Reference

### Must-Know Defaults

```typescript
const DEFAULTS = {
  centsTolerance: 5,              // Always use 5 unless specified
  pathImports: '@/*',             // Never use relative paths
  testingMode: 'red-green-refactor', // TDD cycle
  validate: 'before-commit'       // Run tests before committing
};
```

### Critical Rules

<!-- @critical: development-rules -->

**Severity Legend:** `[CRITICAL]` = Breaking/data corruption, must fix immediately | `[REQUIRED]` = Project standard, fix before commit | `[RECOMMENDED]` = Best practice

| Rule | Severity | Why |
|------|----------|-----|
| ✅ Use `getNoteNameSetsWithAdjacentOctaves()` | `[CRITICAL]` | Fails for non-octave-repeating maqāmāt |
| ✅ Never use "microtonal" | `[CRITICAL]` | Culturally insensitive terminology |
| ✅ Always validate empty strings | `[CRITICAL]` | `param === ""` returns silent errors |
| ✅ **Write test FIRST** (TDD) | `[REQUIRED]` | Tests define expected behavior |
| ✅ Test BEFORE committing | `[REQUIRED]` | User should never discover bugs |
| ✅ Force user choices in UI | `[REQUIRED]` | No defaults for critical parameters |
| ✅ Required params are universal | `[REQUIRED]` | Required in ALL cases, not conditionally |
| ✅ No defaults for required params | `[REQUIRED]` | Users must explicitly provide values |
| ✅ Use Python3 for utility scripts | `[REQUIRED]` | Faster for data manipulation and large files |
| ✅ Check if dev server is running | `[RECOMMENDED]` | Never start/restart without checking |
| ❌ Never skip consistency checks | `[RECOMMENDED]` | Check similar code for patterns |

### [CRITICAL] Rules with Examples

<!-- @critical: rules-with-examples -->

**Every `[CRITICAL]` rule above has a paired negative example:**

**1. Octave-Repeating Check** (`getNoteNameSetsWithAdjacentOctaves`)
```typescript
// ❌ WRONG - Will fail for maqām mustaʿār, maqām awj ārā, etc.
const noteNameSets = tuningSystem.getNoteNameSets();
if (maqam.isMaqamPossible(noteNameSets[0])) { ... }

// ✅ CORRECT - Works for ALL maqāmāt including non-octave-repeating
const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
for (const noteNameSet of shiftedSets) {
  if (maqam.isMaqamPossible(noteNameSet)) return true;
}
```

**2. Terminology** (Never "microtonal")
```typescript
// ❌ WRONG - Culturally insensitive
"For microtonal music software"
"microtonal scales"
"quarter-tone deviations"

// ✅ CORRECT - Culturally appropriate
"For music software supporting custom tunings"
"unequal divisions"
"non-12-EDO pitches"
```

**3. Empty String Validation**
```typescript
// ❌ WRONG - Empty string passes this check silently
if (!param) { ... }  // "" is falsy but should be an error

// ✅ CORRECT - Explicitly check for empty string
if (param !== null && param.trim() === "") {
  return NextResponse.json({ error: "Invalid parameter" }, { status: 400 });
}
```

---

### [REQUIRED] Python3 for Utility Scripts

<!-- @required: python-utility-scripts -->

**When creating utility scripts for local tasks, ALWAYS use Python3 instead of TypeScript.**

**Why Python3:**
- Faster development cycle (no compilation step)
- Superior JSON/data manipulation libraries
- Better handling of large files and batch operations
- Simpler file I/O operations
- Rich ecosystem for data processing (pandas, json, csv, etc.)

**Use Python3 for:**
```bash
# ✅ Data transformation scripts
python3 scripts/transform-maqamat-data.py

# ✅ Batch file processing
python3 scripts/generate-all-modulations.py

# ✅ JSON manipulation and validation
python3 scripts/validate-tuning-systems.py

# ✅ One-off data analysis
python3 scripts/analyze-interval-patterns.py
```

**Use TypeScript for:**
```typescript
// ✅ Application code (models, components, API routes)
// ✅ Shared business logic that runs in the app
// ✅ Type definitions and interfaces
```

**If unsure, ASK** - when the boundary is unclear (e.g., a script that might become part of the app), ask the user which language to use.

---

### Entity ID Formats (CRITICAL for API Development)

<!-- @pattern: entity-id-formats -->

| Entity | `id` Field | `idName` Field | Display Name |
|--------|------------|----------------|--------------|
| **TuningSystem** | `Creator-(Year)` | N/A (use id) | `stringify()` method |
| **Maqam** | Numeric `"1"` | `maqam_rast` | `maqām rāst` |
| **Jins** | Numeric `"2"` | `jins_bayyat` | `jins bayyāt` |
| **NoteName** | N/A | `standardizeText()` | Original with diacritics |
| **Source** | `LastName-(Year)` | Same as id | `titleEnglish` |

**Route parameters accept BOTH `id` and `idName`** for maqamat/ajnas.

**The `standardizeText()` function** (from `@/functions/export`):
```typescript
// Transforms display names → URL-safe IDs
standardizeText("maqām rāst")     // → "maqam_rast"
standardizeText("jins ṣabā")       // → "jins_saba"
standardizeText("ʿajam ʿushayrān") // → "ajam_ushayran"
```

**For detailed ID patterns**: See [reference/naming-conventions-deep-dive.md](../reference/naming-conventions-deep-dive.md#entity-id-naming-patterns)

### Auto-Implementation Triggers

| User Says | Implement |
|-----------|-----------|
| "new function/utility" | **TDD cycle**: Write test in `tmp/` first → implement → refactor |
| "bug fix" | **TDD cycle**: Write failing test reproducing bug → fix → verify |
| "search/filter" | FilterContext + useFilterContext + **TDD** |
| "play/audio" | SoundContext + client guards |
| "API endpoint" | Validation + error handling + **TDD** |
| "new component" | Follow manager pattern + bilingual |
| "script for data/files" | **Python3** - NOT TypeScript. Ask if unsure. |

### API Development Checklist

<!-- @pattern: api-development -->

| Action | Requirement |
|--------|-------------|
| ✅ Add format option | Update API handler, UI dropdown, tests, docs, OpenAPI spec |
| ✅ Return entity references | Use `{id, idName, displayName}` objects, never string arrays |
| ✅ Nest context data | Group related fields in parent objects |
| ✅ Include metadata | Always add `pitchClassIndex`, `noteName` fields. Include `scaleDegree` for maqāmāt/ajnās, but NOT for pitch classes (they're fundamental building blocks) |
| ✅ Include source references | Add `sources` array with `{sourceId, page}` when `includeSources=true` (optional parameter, defaults to false for performance) |
| ✅ Use consistent list structure | Always use `{count, data}` format, never `{meta: {count/total}, data}` |
| ✅ Verify with curl | Test actual HTTP responses with jq |
| ✅ Check diacritics | Ensure Arabic characters render properly |
| ✅ Filter null values | Use `.filter(Boolean)` after Map lookups |
| ✅ Add to sidebar | Update `docs/.vitepress/config.mts` when adding new API endpoints |
| ❌ Never keep legacy aliases | Remove immediately unless API is versioned |
| ❌ **NEVER document PUT endpoints** | PUT endpoints are internal only, never in OpenAPI |
| ❌ Never nest count in meta | Use `count` at top level, not `meta.count` or `meta.total` |

**For detailed API standards**: See [reference/openapi-formatting-guide.md](../reference/openapi-formatting-guide.md)

**For API design patterns**: See [reference/api-retrospective.md](../reference/api-retrospective.md)

**For naming conventions**: See [reference/naming-conventions-deep-dive.md](../reference/naming-conventions-deep-dive.md)

---

## 🔴🟢🔵 Test-Driven Development (TDD)

> **⚠️ MANDATORY**: TDD is REQUIRED for all new functions, utilities, API endpoints, and bug fixes. Write the test FIRST in `tmp/`, then implement. No exceptions.

### The TDD Cycle

```
┌─────────────────────────────────────────────┐
│  1. RED: Write failing test                 │
│     ↓                                        │
│  2. GREEN: Write minimal code to pass       │
│     ↓                                        │
│  3. REFACTOR: Clean up code                 │
│     ↓                                        │
│  4. COMMIT: Only when all tests pass        │
└─────────────────────────────────────────────┘
```

### TDD Workflow

**Step 1: RED (Write Failing Test in `tmp/`)**
```typescript
// tmp/test-calculate-maqam-transpositions.ts
// 1. Define expected behavior FIRST
describe('calculateMaqamTranspositions', () => {
  it('should return empty array for unavailable maqam', () => {
    const pitchClasses = getTuningSystemPitchClasses(alKindi874, 'yegah');
    const result = calculateMaqamTranspositions(
      pitchClasses,
      ajnas,
      maqamBestenegarData,
      true,
      5
    );
    expect(result).toEqual([]);
  });
});

// Run: npm test
// ✗ Expected: [] Received: undefined
```

**Step 2: GREEN (Minimal Implementation)**
```typescript
// 2. Write ONLY enough code to pass
export function calculateMaqamTranspositions(
  pitchClasses: PitchClass[],
  ajnas: JinsData[],
  maqamData: MaqamData,
  withTahlil: boolean,
  tolerance: number
): Maqam[] {
  // Minimal implementation
  if (!maqamData.isMaqamPossible(pitchClasses)) {
    return [];
  }
  // ... rest of implementation
}

// Run: npm test
// ✓ Test passes
```

**Step 3: REFACTOR (Clean & Optimize)**
```typescript
// 3. Improve code quality while tests stay green
export function calculateMaqamTranspositions(
  pitchClasses: PitchClass[],
  ajnas: JinsData[],
  maqamData: MaqamData,
  withTahlil: boolean = true,
  tolerance: number = 5
): Maqam[] {
  // Check availability with proper method
  const shiftedSets = getNoteNameSetsWithAdjacentOctaves(pitchClasses);
  const isAvailable = shiftedSets.some(set =>
    maqamData.isMaqamPossible(set)
  );

  if (!isAvailable) return [];

  // ... rest with better structure
}

// Run: npm test
// ✓ All tests still pass
```

**Step 4: COMMIT (When All Green)**
```bash
# Only commit when all tests pass
npm test && git add . && git commit -m "Add maqam availability check"
```

### TDD for API Development

**1. Write API Test First**
```bash
# Create test file first
cat > scripts/test-api-endpoint.sh << 'EOF'
#!/bin/bash
# Test: GET /api/maqamat with empty family parameter

response=$(curl -s "http://localhost:3000/api/maqamat?family=")
error=$(echo "$response" | jq -r '.error')

if [ "$error" = "Invalid parameter: family" ]; then
  echo "✓ Test passed"
  exit 0
else
  echo "✗ Test failed: $response"
  exit 1
fi
EOF

chmod +x scripts/test-api-endpoint.sh
./scripts/test-api-endpoint.sh
# ✗ Test failed (endpoint doesn't exist yet)
```

**2. Implement API Endpoint**
```typescript
// src/app/api/maqamat/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const family = searchParams.get("family");

  // Validate empty string
  if (family !== null && family.trim() === "") {
    return NextResponse.json(
      { error: "Invalid parameter: family" },
      { status: 400 }
    );
  }

  // ... rest of implementation
}
```

**3. Run Test**
```bash
npm run dev &  # Start server
sleep 2
./scripts/test-api-endpoint.sh
# ✓ Test passed
```

### TDD Best Practices

**Do:**
- ✅ Write test before implementation
- ✅ Start with simplest test case
- ✅ Test one behavior at a time
- ✅ Keep tests fast (< 1 second each)
- ✅ Use descriptive test names
- ✅ Test edge cases (empty, null, invalid)
- ✅ Run full test suite before committing

**Don't:**
- ❌ Write multiple features before testing
- ❌ Skip tests for "simple" code
- ❌ Commit failing tests
- ❌ Test implementation details (test behavior)
- ❌ Make tests depend on each other

### Integration with Manual Testing

**When to use each:**
- **TDD/Automated**: API endpoints, utility functions, data models
- **Manual Testing**: UI interactions, visual elements, musicological accuracy

**For comprehensive testing protocols**: See [05-testing-essentials.md](05-testing-essentials.md)

---

## 📁 Test File Conventions

### Location

**All test files go in the `tmp/` folder** at the project root.

```
tmp/
├── test-maqam-transpositions.ts    # Unit tests for functions
├── test-api-endpoint.sh            # API endpoint tests
├── test-export-logic.ts            # Export functionality tests
└── test-*.ts                       # Any other test files
```

### Naming Convention

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Function tests | `test-{function-name}.ts` | `test-calculate-intervals.ts` |
| API tests | `test-api-{endpoint}.sh` | `test-api-maqamat.sh` |
| Component tests | `test-{component-name}.ts` | `test-maqam-selector.ts` |
| Bug reproduction | `test-bug-{issue}.ts` | `test-bug-enharmonic-spelling.ts` |

### Test File Structure

```typescript
// tmp/test-example.ts
import { describe, it, expect } from 'vitest';  // or jest
import { functionToTest } from '@/functions/target';

describe('functionToTest', () => {
  it('should handle normal case', () => {
    const result = functionToTest(normalInput);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle edge case: empty input', () => {
    const result = functionToTest('');
    expect(result).toEqual([]);
  });

  it('should handle edge case: invalid input', () => {
    expect(() => functionToTest(null)).toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests in tmp/
npm test

# Run specific test file
npx vitest tmp/test-maqam-transpositions.ts

# Run tests in watch mode
npx vitest --watch
```

---

## 📋 Component Creation Checklist

```typescript
"use client";  // 1. Add if using hooks/state

// 2. Import contexts (in this order)
import { useAppContext } from '@/contexts/app-context';
import { useLanguageContext } from '@/contexts/language-context';
import { useFilterContext } from '@/contexts/filter-context';
import styles from '@/styles/component.module.scss';

export default function ComponentName() {
  // 3. Extract context values
  const { selectedTuningSystem } = useAppContext();
  const { t, language } = useLanguageContext();
  const { searchTerm } = useFilterContext();

  // 4. Guard Web Audio (if needed)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Client-only code
    }
  }, []);

  // 5. Return JSX with bilingual support
  return (
    <div className={styles.container}>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

---

## 🔧 Core Conventions

### Import Patterns

```typescript
// ✅ Always use @/* imports
import { getTuningSystems } from '@/functions/import';
import NoteName from '@/models/NoteName';

// ❌ Never use relative paths
import { getTuningSystems } from '../../../functions/import';
```

### Data Loading

```typescript
// ✅ Use import functions
const tuningSystems = getTuningSystems();
const ajnas = getAjnas();
const maqamat = getMaqamat();

// ❌ Never import JSON directly
import maqamat from '@/data/maqamat.json';
```

### Octave-Repeating Availability (CRITICAL)

<!-- @critical: octave-repeating -->

```typescript
// ✅ CORRECT - Checks 3 octaves for all maqām types
const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
for (const noteNameSet of shiftedSets) {
  if (maqam.isMaqamPossible(noteNameSet)) {
    return true;
  }
}

// ❌ WRONG - Fails for non-octave-repeating (>7 pitch classes)
const noteNameSets = tuningSystem.getNoteNameSets();
if (maqam.isMaqamPossible(noteNameSets[0])) { ... }
```

**For musicological explanation**: See [04-musicology-essentials.md](04-musicology-essentials.md)

### Terminology Standards

<!-- @terminology: culturally-appropriate -->

```typescript
// ✅ Culturally appropriate
"unequal divisions"
"non-12-EDO pitches"
"pitches with fractional precision"

// ❌ Western-centric (NEVER USE)
"microtonal"  // Implies deviation from equal temperament
```

**For complete terminology guide**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md)

---

## 🎯 Common Patterns (Quick Reference)

### Family Classification

```typescript
// Use al-Ṣabbāgh (1954) as canonical reference for ALL maqāmāt
const referenceTuningSystem = tuningSystems.find(
  ts => ts.getId() === "al-Sabbagh-(1954)"
);
const canonicalStartingNote = maqam.getAscendingNoteNames()[0];
const pitchClasses = getTuningSystemPitchClasses(
  referenceTuningSystem,
  canonicalStartingNote
);
const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);
const tahlil = transpositions.find(t => !t.transposition);
if (tahlil) {
  const classification = classifyMaqamFamily(tahlil);
}
```

### Sorting by Data Type

| Data Type | Default Sort | Why |
|-----------|-------------|-----|
| **Note names** | NoteName.ts order | Theoretical pitch sequence |
| **Families** | Alphabetical | Categorical data |
| **Maqām names** | Alphabetical | Categorical data |
| **Tuning systems** | By date | Chronological |

```typescript
// Note names: Use NoteName order
import { octaveZeroNoteNames, octaveOneNoteNames } from '@/models/NoteName';
import { standardizeText } from '@/functions/export';

const noteNameOrder = [
  ...octaveZeroNoteNames,
  ...octaveOneNoteNames,
  // ... more octaves
].map(name => standardizeText(name));

const getNotePriority = (name: string) =>
  noteNameOrder.indexOf(standardizeText(name));

pitchClasses.sort((a, b) =>
  getNotePriority(a.noteName) - getNotePriority(b.noteName)
);

// Everything else: Alphabetical
families.sort((a, b) =>
  standardizeText(a).localeCompare(standardizeText(b))
);
```

### Export Modal UI Patterns

**Format Descriptions Consistency:**
```typescript
// ✅ CORRECT - Single source of truth for format descriptions
const formatDescriptions: Record<ExportFormat, string> = {
  json: "JSON format — Structured, machine-readable data with complete relationships",
  txt: "Text format — Human-readable text file",
  pdf: "PDF format — Formatted document",
  scala: "Musical tuning files for compatible software and hardware"
};

// Use same object for both UI display and export info generation
parts.push(formatDescriptions[exportOptions.format]);
```

**Option Positioning Logic:**
- Position options in logical dependency order (e.g., modulations before separate files export)
- Use `export-modal__inline-options` for consistent styling across similar options
- Avoid redundant information in labels (e.g., don't show count when label already implies multiple)

**Export Information Generation:**
```typescript
// ✅ CORRECT - Use stringified tuning system names
const tuningSystemName = selectedTuningSystem?.stringify() || "tuning system";
parts.push(`Exporting ${tuningSystemName}`);

// ✅ CORRECT - Format-specific information
if (exportOptions.format === "scala") {
  parts.push("• Scala file (.scl) — Tuning system pitch classes in cents...");
} else {
  // Non-Scala format details
}
```

**Filename Generation:**
```typescript
// ❌ WRONG - Redundant information
if (opts.exportSeparateFilesPerStartingNote) {
  parts.push("all-starting-notes"); // Each file already includes starting note
}

// ✅ CORRECT - Skip redundant terms
// Note: exportSeparateFilesPerStartingNote doesn't add to filename
// because each file already includes the starting note name
```

**Terminology Consistency:**
- Always use proper plural forms with diacritics in user-facing text: "maqāmāt" (not "maqamat"), "taṣāwīr" (not "taṣwīr")
- Code identifiers and filenames can remain without diacritics for technical consistency
- Export information should use stringified entity names (e.g., `tuningSystem.stringify()`)

### State Management

```typescript
// ✅ Use custom hooks
const { selectedTuningSystem } = useAppContext();

// ✅ Clear related state on dependency changes
const handleTuningSystemChange = (system: TuningSystem) => {
  setSelectedTuningSystem(system);
  clearSelections(); // Clear dependents
};
```

### Performance Optimization

```typescript
// ✅ Memoize expensive calculations
const transpositions = useMemo(() =>
  calculateJinsTranspositions(pitchClasses, jinsData, tolerance),
  [pitchClasses, jinsData, tolerance]
);

// ✅ Use pre-computed context
const { allTranspositions } = useTranspositionsContext();

// ✅ Yield control during long operations
for (let i = 0; i < items.length; i++) {
  if (i % 100 === 0) {
    await new Promise(resolve => setTimeout(resolve, 0));
    updateProgress((i / items.length) * 100);
  }
}
```

### Adding New Pitch Class Data Types

**Complete workflow for adding a new pitch class data type (e.g., solfege, englishName):**

**Step 1: Model Layer**
```typescript
// src/models/PitchClass.ts - Add property to interface
export default interface PitchClass {
  // ... existing properties
  solfege?: string;  // Add new property (optional if derived)
}
```

**Step 2: Data Generation Function**
```typescript
// src/functions/getTuningSystemPitchClasses.ts
// Add calculation/mapping for the new data type
const solfege = getSolfegeFromEnglishName(englishNoteName);

pitchClasses.push({
  // ... existing properties
  solfege,  // Add to pitch class object
});
```

**Step 3: Mapping Function (if needed)**
```typescript
// src/functions/noteNameMappings.ts
// Add mapping function for derived values
export function getSolfegeFromEnglishName(englishName: string): string {
  const baseNote = englishName.charAt(0).toUpperCase();
  const solfegeMap: Record<string, string> = {
    'A': 'La', 'B': 'Si', 'C': 'Do', 'D': 'Re',
    'E': 'Mi', 'F': 'Fa', 'G': 'Sol'
  };
  return solfegeMap[baseNote] || englishName;
}
```

**Step 4: Filter Context**
```typescript
// src/contexts/filter-context.tsx
export interface FilterSettings {
  solfege: boolean;  // Add to interface
  // ... other filters
}

const defaultFilters: FilterSettings = {
  solfege: false,  // Set default visibility
  // ... other defaults
};
```

**Step 5: UI Components (filter menu + table rows)**
```typescript
// src/components/jins-transpositions.tsx (and maqam-transpositions.tsx)
// Add to filter menu array (ORDER MATTERS - matches table row order)
{[
  "abjadName",
  "englishName",
  "solfege",      // ← Add in correct position
  "fraction",
  // ...
]}

// Add table row rendering
if (filters["solfege"]) {
  const solfegeRow = [t("jins.solfege")];
  pitchClasses.forEach((pc, i) => {
    solfegeRow.push(pc.solfege || "--");
    if (i < pitchClasses.length - 1) solfegeRow.push('');
  });
  rows.push(solfegeRow);
}
```

**Step 6: API Routes**
```typescript
// All relevant route.ts files (ajnas/[id], maqamat/[id], etc.)
// Add to validPitchClassDataTypes array
const validPitchClassDataTypes = [
  "all",
  "abjadName",
  "englishName",
  "solfege",  // ← Add in same order as UI
  // ...
];

// Add to "all" case response
case "all":
  return { ...existingFields, solfege: pc.solfege };

// Add specific case
case "solfege":
  return { ...baseFields, solfege: pc.solfege };
```

**Step 7: OpenAPI Spec (YAML only!)**
```yaml
# openapi.yaml - Add to ALL pitchClassDataType enums
# ⚠️ CRITICAL: Order must match UI filter order
enum: [all, abjadName, englishName, solfege, fraction, ...]
```

**Step 8: Regenerate & Rebuild**
```bash
npm run docs:openapi  # Regenerate JSON from YAML
npm run docs:build    # Rebuild docs
```

**Step 9: Translations (if user-facing)**
```json
// public/locales/en/translation.json
{
  "jins": {
    "solfege": "Solfege"
  }
}
```

**Key Files Checklist:**
- [ ] `src/models/PitchClass.ts` - Interface property
- [ ] `src/functions/getTuningSystemPitchClasses.ts` - Generation
- [ ] `src/functions/noteNameMappings.ts` - Mapping (if derived)
- [ ] `src/contexts/filter-context.tsx` - FilterSettings
- [ ] `src/components/jins-transpositions.tsx` - Filter menu + table
- [ ] `src/components/maqam-transpositions.tsx` - Filter menu + table
- [ ] `src/components/tuning-system-octave-tables.tsx` - Table (if applicable)
- [ ] `src/app/api/*/route.ts` - All relevant API routes
- [ ] `openapi.yaml` - All pitchClassDataType enums
- [ ] `public/locales/*/translation.json` - Translations

---

## 📱 UI/UX Patterns

### Form Progressive Disclosure

**Two-level pattern:**
1. **Level 1**: Show/hide field groups by primary context (endpoint)
2. **Level 2**: Within groups, show all fields but disable until dependencies met

```tsx
{/* Level 1: Show group for relevant endpoints only */}
{(endpoint === "data" || endpoint === "tuning-system") && (
  <>
    {/* Always visible within this context */}
    <select value={tuningSystem} onChange={...}>
      <option value="">Select tuning system...</option>
    </select>

    {/* Level 2: Always visible, but disabled until parent selected */}
    <select
      value={startingNote}
      disabled={!tuningSystem}
      className={styles.fieldIndented}
    >
      <option value="">
        {!tuningSystem
          ? "Select tuning system first..."
          : "Select starting note..."}
      </option>
    </select>
  </>
)}
```

**Visual styling:**
```scss
select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.fieldIndented {
  padding-left: 1.5rem;
  &::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    border-left: 2px dashed #d0d0d0;
  }
}
```

### URL Generation (API Playground)

**CRITICAL: Always generate URLs, never show guidance messages**

```typescript
// ✅ CORRECT - Always build URL
const maqamPart = selectedMaqam || "{id}";
newUrl = `/api/maqamat/${maqamPart}?tuningSystem=${tuningSystem || ""}`;

// ❌ WRONG - Don't use guidance as URL
if (!selectedMaqam) {
  newUrl = "Select a maqām above";  // NEVER DO THIS
}
```

---

## 🧪 Testing Requirements

### Before Committing

```bash
# 1. Run automated tests
npm test

# 2. Test API endpoints (if changed)
bash scripts/test-api-errors.sh

# 3. Manual smoke test
npm run dev
# - Test affected endpoints in browser
# - Verify UI changes
# - Check console for errors

# 4. Commit only when all pass
git add . && git commit -m "message"
```

### What to Test

| Change Type | Test Required |
|-------------|---------------|
| API endpoint | Automated + manual API playground |
| UI component | Manual browser testing |
| Core function | Automated unit tests |
| Data model | TypeScript tests |
| Export logic | Generate export, validate structure |

**For comprehensive testing protocols**: See [05-testing-essentials.md](05-testing-essentials.md)

---

## 🛠️ Tools & MCP Servers

### Code API Pattern (REQUIRED)

**AI agents MUST use the `servers/` directory** for MCP tool discovery. This reduces context overhead by ~98.7%.

```
servers/
├── index.ts              ← START HERE: Lists all servers & quick reference
├── mcpClient.ts          ← Core MCP utility
├── context7/             ← Library documentation
│   ├── index.ts
│   ├── resolveLibraryId.ts
│   └── getLibraryDocs.ts
└── playwright/           ← Browser automation
    ├── index.ts
    ├── navigate.ts
    ├── click.ts
    ├── screenshot.ts
    └── evaluate.ts
```

### MCP Discovery Workflow

1. **Read `servers/index.ts`** to see available servers and quick reference
2. **Navigate to server directory** (e.g., `servers/context7/`)
3. **Read tool files** for typed interfaces and project-specific examples
4. **Call via Claude's MCP integration** using documented tool names

### When to Use MCP Servers

| Scenario | Server | Example |
|----------|--------|---------|
| Need library docs beyond training data | Context7 | "VexFlow custom accidentals" |
| Check framework updates | Context7 | "Next.js 15 app router i18n" |
| Test UI workflows | Playwright | Navigate, click, verify |
| Capture screenshots for docs | Playwright | `screenshot({ fullPage: true })` |
| Extract data from pages | Playwright | `evaluate({ script: "..." })` |
| Verify Arabic text rendering | Playwright | Check RTL layout, fonts |

### Quick Reference

| Server | Tool | MCP Tool Name |
|--------|------|---------------|
| Context7 | Resolve Library | `mcp__context7__resolve-library-id` |
| Context7 | Get Docs | `mcp__context7__get-library-docs` |
| Playwright | Navigate | `mcp__playwright__browser_navigate` |
| Playwright | Screenshot | `mcp__playwright__browser_screenshot` |
| Playwright | Click | `mcp__playwright__browser_click` |
| Playwright | Evaluate | `mcp__playwright__browser_evaluate` |

### Example: Getting Library Documentation

```typescript
// 1. Read servers/context7/resolveLibraryId.ts for interface
// 2. Call MCP tool:
mcp__context7__resolve-library-id({ libraryName: "tone.js" })
// → Returns: { libraries: [{ libraryId: "/Tonejs/Tone.js", ... }] }

// 3. Read servers/context7/getLibraryDocs.ts for interface
// 4. Call MCP tool:
mcp__context7__get-library-docs({
  libraryId: "/Tonejs/Tone.js",
  topic: "custom tuning microtonal"  // Check for non-12-EDO support
})
```

### Example: Testing UI with Playwright

```typescript
// 1. Navigate to app
mcp__playwright__browser_navigate({ url: "http://localhost:3000/maqamat" })

// 2. Test maqām selection
mcp__playwright__browser_click({ selector: "[data-testid='maqam-rast']" })

// 3. Verify Arabic text renders
mcp__playwright__browser_evaluate({
  script: "document.fonts.check('16px \"Noto Naskh Arabic\"')"
})

// 4. Capture for documentation
mcp__playwright__browser_screenshot({ fullPage: true })
```

**For detailed MCP usage**: See [reference/mcp-servers-guide.md](../reference/mcp-servers-guide.md)

---

## ⚠️ Common Pitfalls

<!-- @pitfall: common-pitfalls -->

### Empty String Validation

<!-- @pitfall: empty-string-validation -->

```typescript
// ✅ CORRECT - Check for empty string explicitly
if (param !== null && param.trim() === "") {
  return error("Invalid parameter");
}

// ❌ WRONG - Empty string passes this check
if (!param) { ... }  // "" is falsy but should error
```

### Octave-Repeating Assumptions

<!-- @pitfall: octave-repeating-assumption -->

```typescript
// ❌ WRONG - Assumes octave-repeating
const noteNames = tuningSystem.getNoteNameSets()[0];

// ✅ CORRECT - Handles all maqām types
const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
```

### Legacy Aliases

<!-- @pitfall: legacy-aliases -->

```typescript
// ❌ WRONG - Maintaining legacy for "compatibility"
if (format === "frequencies" || format === "frequency") { ... }

// ✅ CORRECT - Clean removal with clear error
if (format === "frequencies") {
  return error("Use 'frequency' instead of 'frequencies'");
}
```

---

## 📚 Cross-References

### Detailed Guides

- **API Design Patterns**: [reference/api-retrospective.md](../reference/api-retrospective.md)
- **OpenAPI Standards**: [reference/openapi-formatting-guide.md](../reference/openapi-formatting-guide.md)
- **Naming Conventions**: [reference/naming-conventions-deep-dive.md](../reference/naming-conventions-deep-dive.md)
- **MCP Servers**: [reference/mcp-servers-guide.md](../reference/mcp-servers-guide.md)
- **CLI Commands**: [reference/cli-commands-guide.md](../reference/cli-commands-guide.md)

### Architecture & Theory

- **Architecture Patterns**: [02-architecture-essentials.md](02-architecture-essentials.md)
- **Musicology Principles**: [04-musicology-essentials.md](04-musicology-essentials.md)
- **Testing Protocols**: [05-testing-essentials.md](05-testing-essentials.md)

### Glossary

- **Documentation Standards**: [glossary/06-documentation-standards.md](../glossary/06-documentation-standards.md)
- **Musicological Definitions**: [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md)

---

**This file provides quick access to essential patterns. For deep dives, consult the reference and glossary sections.**
