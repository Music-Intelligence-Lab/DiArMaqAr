# Development Conventions & Best Practices

**Coding standards, TDD workflow, and patterns for DiArMaqAr**

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
| ✅ Force user choices in UI | No defaults for critical parameters - conscious decision-making |
| ❌ Never skip consistency checks | Check similar code for patterns |
| ❌ Avoid `sleep` with curl | Only use when absolutely necessary for server startup |

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
| ✅ Include metadata | Always add `pitchClassIndex`, `scaleDegree`, `noteName` fields |
| ✅ Verify with curl | Test actual HTTP responses with jq |
| ✅ Check diacritics | Ensure Arabic characters render properly |
| ✅ Filter null values | Use `.filter(Boolean)` after Map lookups |
| ❌ Never keep legacy aliases | Remove immediately unless API is versioned |

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

**4. Add to Test Suite**
```bash
# Add to scripts/test-api-errors.sh
echo "Test: Empty family parameter" >> test-log.txt
./scripts/test-api-endpoint.sh >> test-log.txt
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

See `05-testing-guide.md` for manual testing protocols.

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

### Terminology Standards
```typescript
// ✅ Culturally appropriate
"unequal divisions"
"non-12-EDO pitches"
"pitches with fractional precision"

// ❌ Western-centric (NEVER USE)
"microtonal"  // Implies deviation from equal temperament
```

---

## 🌐 API Development Standards

### Standard Route Pattern
```typescript
import { NextResponse } from 'next/server';
import { getMaqamat } from '@/functions/import';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Parse parameters
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const param = searchParams.get("param");

    // 2. Validate (in order user encounters them)
    if (!id || id.trim() === "") {
      return NextResponse.json({
        error: "Invalid path parameter: id",
        hint: "Provide valid ID in URL"
      }, { status: 400 });
    }

    if (param !== null && param.trim() === "") {
      return NextResponse.json({
        error: "Invalid parameter: param",
        hint: "Remove '?param=' or provide value"
      }, { status: 400 });
    }

    // 3. Load data
    const data = getMaqamat();

    // 4. Process
    const result = processData(data);

    // 5. Return
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 500 }
    );
  }
}
```

### Validation Rules (MANDATORY)

**Three-Step Validation Pattern:**

For every parameter, validate in this exact order:

```typescript
// Step 1: Check if required parameter is missing (null)
if (param === null) {
  return NextResponse.json({
    error: "Missing required parameter: param",
    hint: "Include '?param=value' in the URL"
  }, { status: 400 });
}

// Step 2: Check if parameter is empty string
if (param.trim() === "") {
  return NextResponse.json({
    error: "Invalid parameter: param",
    message: "Parameter cannot be empty",
    hint: "Remove '?param=' or provide value like '?param=example'"
  }, { status: 400 });
}

// Step 3: Validate the actual value
const validOptions = ["option1", "option2", "option3"];
if (!validOptions.includes(param)) {
  return NextResponse.json({
    error: "Invalid parameter value: param",
    message: `'${param}' is not a valid option`,
    hint: "Use one of the valid options",
    validOptions
  }, { status: 400 });
}
```

**Order of Validation Across Parameters:**

Validate in the order users encounter problems:

```typescript
// 1. Path parameters (closest to user's initial choice)
if (!maqamId) { return 404; }

// 2. Required query params (in dependency order)
if (!tuningSystem) { return 400; }
if (!startingNote) { return 400; }  // Depends on tuningSystem

// 3. Optional params (only if provided)
if (format !== null && format.trim() === "") { return 400; }
```

**Why This Order Matters:**
- Users select path first (maqām ID), then tuning system, then starting note
- Validating in this order provides the most helpful error messages
- Dependency order ensures users fix foundational parameters first

### Error Response Format
```json
{
  "error": "Brief identifier (sentence case, no period)",
  "message": "Optional human-readable explanation",
  "hint": "Actionable suggestion with real examples",
  "validOptions": ["array", "of", "options"]
}
```

### Response Requirements

**Identity Fields:**
```typescript
// ✅ Always include both display and URL-safe IDs
{
  id: maqam.getId(),
  idName: maqam.getIdName(),  // URL-safe
  name: maqam.getName()        // Display with diacritics
}
```

**Starting Note Information (Tuning Systems):**
```typescript
// ✅ Include starting note arrays for tuning system calculations
{
  tuningSystemId: "IbnSina-(1037)",
  startingNotes: ["yegāh", "ʿushayrān", "rāst"],
  numberOfStartingNotes: 3
}
```

**Availability Information:**
```typescript
// ✅ Split by (tuningSystem, startingNote) pairs, not bundled
// ❌ WRONG: Single entry per tuning system
{
  tuningSystemId: "IbnSina-(1037)",
  startingNotes: ["yegāh", "ʿushayrān"]  // Bundled - hard to use
}

// ✅ CORRECT: Separate entries per combination
[
  {
    tuningSystemId: "IbnSina-(1037)",
    startingNote: "yegāh",
    transpositionsInOctave: 12,
    modulationsAvailable: 25
  },
  {
    tuningSystemId: "IbnSina-(1037)",
    startingNote: "ʿushayrān",
    transpositionsInOctave: 10,
    modulationsAvailable: 27
  }
]
```

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

See `05-testing-guide.md` for comprehensive testing protocols.

---

## 🛠️ Tools & MCP Servers

### Context7 (Library Docs)
```bash
# Use when you need current library documentation
"Show me VexFlow examples for non-Western notation"
"What are Next.js 15 App Router patterns?"
```

### Playwright (Browser Testing)
```bash
# Use for automated UI testing
"Test the maqām selection workflow on localhost"
"Verify responsive design on mobile viewport"
```

**Best Practice:** Use MCPs to enhance, not replace, your core knowledge. Apply decolonial lens to external docs.

---

## 📝 Documentation Standards

### Code Comments
```typescript
// ✅ Explain WHY, not WHAT
// Arabic maqām theory uses independent ascending/descending sequences
// NOT simply reversed - fundamentally different melodic paths
const ascendingPitchClasses = [...];

// ❌ Don't state the obvious
const tolerance = 5; // Set tolerance to 5
```

### JSDoc
```typescript
/**
 * Brief description of what function does
 *
 * @param pitchClasses - Description
 * @param tolerance - Description (default: 5)
 * @returns Description of return value
 *
 * @remarks
 * Important implementation notes or cultural context
 */
```

See `06-documentation-standards.md` for comprehensive docs standards.

---

## 🎯 API Design Principles

### Semantic Clarity in Naming

**Field names must be self-documenting and semantically precise.**

#### Type Qualifiers Pattern
When a field contains values that could be confused with objects of a different type, include a type qualifier:

```typescript
// ✅ GOOD: Clear that these are string values (names)
tuningSystemStartingNoteNames: string[]          // Name values like "ʿushayrān"
numberOfTuningSystemStartingNoteNames: number

// ❌ AVOID: Ambiguous - could be note objects with pitch data
tuningSystemStartingNotes: string[]              // Unclear if names or objects
```

**Rationale**: In a music theory API, `note` could mean:
- A string name ("rāst")
- An object with pitch data (`{ name: "rāst", frequency: 293.66, cents: 0 }`)
- An object with interval relationships

Adding "Names" clarifies we're returning the string identifiers, not complex objects.

#### Context Qualifiers Pattern
Follow existing patterns like `numberOfPitchClassesSingleOctave`:

```typescript
// ✅ GOOD: Complete semantic context
numberOfPitchClassesSingleOctave       // Clarifies scope (single octave vs. multi-octave)
tuningSystemStartingNoteNames          // Clarifies domain (tuning system vs. maqām)
numberOfTuningSystemStartingNoteNames  // Combined pattern

// ❌ AVOID: Ambiguous scope
numberOfPitchClasses                   // Single octave? Multiple?
startingNotes                          // From what? For what?
```

#### Avoid Generic Parameter Names

**Generic names like "format", "type", or "mode" are anti-patterns.** Parameter names must describe WHAT is being specified:

```typescript
// ✅ GOOD: Describes what is being specified
pitchClassDataType: "frequency" | "cents" | "fraction"  // Clear: data type for pitch classes
responseEncoding: "json" | "xml"                        // Clear: encoding of response
tuningSystemScale: "equal" | "pythagorean"              // Clear: scale type for tuning

// ❌ AVOID: Generic, ambiguous names
format: "frequency" | "cents"           // Format of what? Pitch? Response? File?
type: "equal" | "pythagorean"          // Type of what? Tuning? Scale? Output?
mode: "json" | "xml"                   // Mode of what? Display? Encoding?
```

**Rationale**: "format" could mean:
- Data format (JSON vs XML)
- Display format (table vs grid)
- Pitch data representation (frequency vs cents)
- File format (CSV vs JSON)
- Number format (decimal vs fraction)

"pitchClassDataType" is precise: it specifies the data type for pitch class objects in the response.

**Test by removal**: If you remove everything before the parameter, would you know what it specifies?
- ❌ `format=cents` - Format of what?
- ✅ `pitchClassDataType=cents` - Clear on its own

#### Domain-Specific Distinctions

**Critical**: Distinguish theoretically different concepts even when they seem similar:

```typescript
// ✅ GOOD: Clear distinction
interface MaqamData {
  tuningSystemStartingNoteNames: string[];  // Where tuning system begins (theoretical anchor)
  maqamTonic: string;                       // First note of maqām scale (musical content)
}

// ❌ AVOID: Conflating different concepts
interface MaqamData {
  startingNotes: string[];  // Starting what? Tuning system or maqām?
  firstNote: string;        // Ambiguous
}
```

**Why this matters**: In Arabic music theory:
- **Tuning system starting note** = theoretical framework anchor (e.g., ʿushayrān for oud tuning)
- **Maqām tonic** = first note of the melodic scale (e.g., rāst for Maqām Rāst)

These are fundamentally different concepts that happen to be represented as strings.

### Array Field Naming

**Always use plural nouns for array fields**, even in compound names:

```typescript
// ✅ CORRECT
tuningSystemStartingNoteNames: string[]  // Plural "Names"
maqamSuyur: Sayr[]                       // Plural "Suyur"

// ❌ INCORRECT
tuningSystemStartingNoteName: string[]   // Singular with array type
```

### Consistency Checking Protocol

**Before finalizing any API field name:**

1. **Search for similar fields** in the codebase
2. **Extract the naming pattern** (qualifiers, structure, conventions)
3. **Apply the pattern consistently** to your new field
4. **Document the rationale** if establishing a new pattern

```bash
# Example: Checking naming patterns
grep -r "numberOfPitchClasses" src/
# Found: numberOfPitchClassesSingleOctave
# Pattern: number + Of + Concept + ScopeQualifier
# Apply: numberOfTuningSystemStartingNoteNames
```

### Testing Strategy for API Changes

**Shell scripts with jq provide fast, focused validation:**

```bash
#!/bin/bash
# Fast validation without full integration test overhead

echo "Test: Field exists and is array"
response=$(curl -s "http://localhost:3000/api/tuning-systems")
field=$(echo "$response" | jq -r '.tuningSystems[0].tuningSystemStartingNoteNames')

if [ "$field" != "null" ] && [ ! -z "$field" ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
fi
```

**When to use:**
- ✅ API response structure validation
- ✅ Field presence/absence checks
- ✅ Data type verification
- ✅ Quick regression testing
- ❌ Complex business logic (use unit tests)
- ❌ Async operations (use integration tests)

---

## ⚠️ Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Using `getNoteNameSets()` | Use `getNoteNameSetsWithAdjacentOctaves()` |
| JavaScript negative modulo | Use `((n % 7) + 7) % 7` |
| Assuming symmetric sequences | Check for asterisk, handle independently |
| Hardcoding intervals | Always load from tuning system |
| Skipping empty string validation | Check `param.trim() === ""` |
| Web Audio in SSR | Guard with `typeof window !== 'undefined'` |
| Relative imports | Always use `@/*` |
| Starting dev server without checking | Check if server is already running on port before starting |
| Using `sleep` unnecessarily with curl | Only use when absolutely necessary; prefer direct testing |
| Pre-selecting critical UI parameters | Force conscious decisions; use empty defaults with placeholders |

---

## 🖥️ Development Server Guidelines

### Check Before Starting
**ALWAYS check if the dev server is already running before starting/restarting:**

```bash
# ❌ DON'T: Blindly start server
npm run dev

# ✅ DO: Check for running process first
lsof -i :3000  # Check if port is in use
# or
ps aux | grep "next dev"  # Check for Next.js process
```

**Why this matters:**
- Avoids port conflicts and error messages
- Prevents disrupting active development sessions
- Saves time waiting for unnecessary restarts
- Professional development practice

### Testing with curl
**Avoid unnecessary `sleep` delays:**

```bash
# ❌ AVOID: Unnecessary delay
sleep 3 && curl http://localhost:3000/api/endpoint

# ✅ PREFER: Direct request (server should be stable)
curl http://localhost:3000/api/endpoint

# ✅ ACCEPTABLE: Only when testing fresh server startup
npm run dev & sleep 2 && curl http://localhost:3000/api/health
```

**When `sleep` is justified:**
- Testing immediately after starting a new server process
- Waiting for database connections to initialize
- Testing time-dependent behavior

**When `sleep` is NOT needed:**
- Server is already running (most common case)
- Making multiple sequential requests
- Testing stable endpoints

---

## 🎨 UX Design Principles

### Conscious Decision-Making
**Force user choices for critical parameters rather than providing defaults:**

```tsx
// ❌ AVOID: Pre-selected defaults for important choices
const [pitchClassDataType, setPitchClassDataType] = useState("frequency");

// ✅ GOOD: Empty state requiring explicit selection
const [pitchClassDataType, setPitchClassDataType] = useState("");

// With placeholder in UI:
<MenuItem value="">
  <em>Select a data format...</em>
</MenuItem>
```

**Why this matters:**
- **Prevents autopilot behavior**: Users must think about what they need
- **Reduces errors**: No silent defaults that might be wrong for their use case
- **Better UX**: Users understand what choices are available
- **Documentation through UI**: Placeholder text educates users

**When to force choices:**
- ✅ Data format selection (frequency, cents, fractions, etc.)
- ✅ Tuning system selection
- ✅ Critical calculation parameters
- ❌ UI preferences (theme, layout)
- ❌ Optional features (advanced mode)

**Pattern:**
1. Initialize state with empty string: `useState("")`
2. Add placeholder as first option: `<MenuItem value=""><em>Select...</em></MenuItem>`
3. Check for selection before processing: `if (value) { ... }`
4. Provide clear error messages if required but not selected

---

## 🔍 Knowledge Preservation

**After completing tasks:**
1. Review for unique insights
2. Document in appropriate file
3. Include specific examples
4. Explain implications

**Document-worthy findings:**
- Musicological principles
- Algorithmic patterns
- Common pitfalls & solutions
- Data structure insights
- Integration patterns

---

## 📚 Cross-References

- **Architecture**: `02-architecture.md` - Technical stack, context providers, data models
- **Musicological Principles**: `04-musicological-principles.md` - Arabic maqām theory essentials
- **Testing Guide**: `05-testing-guide.md` - Manual testing protocols
- **Documentation Standards**: `06-documentation-standards.md` - JSDoc and property documentation
- **API Implementation Details**: `src/app/api/playground/SESSION_SUMMARY.md` - Comprehensive API development notes, validation patterns, testing framework, design decisions

**For API Development**: The SESSION_SUMMARY.md contains detailed notes on:
- All 6 maqāmāt API endpoints with examples
- 27 automated test cases
- Error handling standardization
- Progressive disclosure implementation
- API playground UX patterns
- Real-world validation scenarios
- Semantic naming conventions and rationale

---

*Last Updated: 2025-01-27 (Added: Development server guidelines, conscious decision-making UX pattern, avoid unnecessary sleep with curl)*
