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

| Rule | Why |
|------|-----|
| ✅ Test BEFORE committing | User should never discover bugs |
| ✅ Use `getNoteNameSetsWithAdjacentOctaves()` | Handles non-octave-repeating maqāmāt |
| ✅ Never use "microtonal" | Western-centric, culturally insensitive |
| ✅ Always validate empty strings | `param === ""` returns silent errors |
| ✅ Check if dev server is running | Never start/restart without checking first |
| ✅ Force user choices in UI | No defaults for critical parameters |
| ✅ Required params are universal | Required in ALL cases, not conditionally |
| ✅ No defaults for required params | Users must explicitly provide values |
| ❌ Never skip consistency checks | Check similar code for patterns |

### Auto-Implementation Triggers

| User Says | Implement |
|-----------|-----------|
| "search/filter" | FilterContext + useFilterContext |
| "play/audio" | SoundContext + client guards |
| "API endpoint" | Validation + error handling + tests |
| "new component" | Follow manager pattern + bilingual |

### API Development Checklist

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

**Step 1: RED (Write Failing Test)**
```typescript
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

### Quick Usage

- **Context7** (Library Docs): "Show me VexFlow examples for non-Western notation"
- **Playwright** (Browser Testing): "Test the maqām selection workflow on localhost"

**For detailed MCP usage**: See [reference/mcp-servers-guide.md](../reference/mcp-servers-guide.md)

---

## ⚠️ Common Pitfalls

### Empty String Validation

```typescript
// ✅ CORRECT - Check for empty string explicitly
if (param !== null && param.trim() === "") {
  return error("Invalid parameter");
}

// ❌ WRONG - Empty string passes this check
if (!param) { ... }  // "" is falsy but should error
```

### Octave-Repeating Assumptions

```typescript
// ❌ WRONG - Assumes octave-repeating
const noteNames = tuningSystem.getNoteNameSets()[0];

// ✅ CORRECT - Handles all maqām types
const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
```

### Legacy Aliases

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
