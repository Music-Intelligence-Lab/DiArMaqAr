# Naming Conventions: Semantic Clarity Deep Dive

**PURPOSE**: Comprehensive guide to semantic naming principles, patterns, and rationale for DiArMaqAr APIs and code.

**LOAD**: When designing new APIs, naming parameters, or reviewing naming consistency.

---

## Philosophy

**Field names must be self-documenting and semantically precise.**

In a complex domain like Arabic music theory, ambiguous names cause confusion, integration errors, and misinterpretation. Verbose, explicit names are better than concise, ambiguous ones.

---

## Entity ID Naming Patterns

### Overview

This section documents the **critical patterns** for entity IDs across the codebase. Incorrect ID formatting is a common source of bugs when building API endpoints.

### The `standardizeText()` Function

**Location**: `src/functions/export.ts`

This is the **core transformation** that converts display names to URL-safe IDs:

```typescript
import { standardizeText } from '@/functions/export';

// Transformations applied:
// 1. NFD normalization (decompose combined characters)
// 2. Remove diacritics (combining marks \u0300-\u036f)
// 3. Remove apostrophes (')
// 4. Remove Arabic ayn (ʿ)
// 5. Remove Arabic hamza (ʾ)
// 6. Replace spaces with underscores (_)
// 7. Convert to lowercase
```

**Transformation examples:**

| Display Name | After `standardizeText()` |
|-------------|---------------------------|
| `maqām rāst` | `maqam_rast` |
| `jins ṣabā` | `jins_saba` |
| `ʿajam ʿushayrān` | `ajam_ushayran` |
| `dūgāh` | `dugah` |
| `nīm ḥiṣār` | `nim_hisar` |
| `būselīk/ʿushshāq` | `buselik/ushshaq` |

### Tuning Systems

**Data file**: `data/tuningSystems.json`
**Model**: `src/models/TuningSystem.ts`

| Field | Format | Example |
|-------|--------|---------|
| `id` | `Creator-(Year)` | `"IbnSina-(1037)"`, `"Ronzevalle-(1904)"` |
| Display | `stringify()` method | `"Ibn Sīnā (1037) ..."` |

**ID generation** (line 136 in TuningSystem.ts):
```typescript
this.id = standardizeText(`${creatorEnglish}-(${year})`.replaceAll(" ", "").replaceAll("+", ""));
```

**API usage**:
- Route: `/api/tuning-systems/[id]/...`
- Query param: `?tuningSystem=IbnSina-(1037)`
- **Note**: Parentheses are URL-safe but may need encoding in some contexts

### Maqamat

**Data file**: `data/maqamat.json`
**Model**: `src/models/Maqam.ts`

| Field | Format | Example |
|-------|--------|---------|
| `id` | Numeric string | `"1"`, `"2"`, `"3"` |
| `idName` | `maqam_<name>` | `"maqam_rast"`, `"maqam_hijaz"` |
| `name` | Display with diacritics | `"maqām rāst"`, `"maqām ḥijāz"` |

**ID generation** (line 123 in Maqam.ts):
```typescript
this.idName = standardizeText(name);
```

**API route matching** (in route.ts):
```typescript
// Route parameters accept EITHER numeric id OR idName
const maqam = maqamatData.find(
  (m) => m.getId() === maqamId || standardizeText(m.getName()) === standardizeText(maqamId)
);
```

**Examples**:
- `/api/maqamat/1` ✅ (numeric id)
- `/api/maqamat/maqam_rast` ✅ (idName)
- `/api/maqamat/maqām rāst` ❌ (display name - won't match)

### Transposed Maqamat Naming (Taṣwīr)

**CRITICAL**: When a maqām is transposed to a different tonic, it receives a suffixed display name while maintaining a stable base identifier for lookups.

#### Two ID Fields for Transpositions

| Field | Purpose | Stability | Example |
|-------|---------|-----------|---------|
| `baseMaqamIdName` | Lookup/query identifier | **Stable** across all transpositions | `maqam_nahawand` |
| `maqamIdName` | Display identifier | **Changes** with transposition | `maqam_nahawand_al-kurdan` |

#### Transposition Naming Pattern

**Original form (taḥlīl)**: Uses base name only
```
maqām nahāwand → maqam_nahawand (on rāst)
```

**Transposed form (taṣwīr)**: Adds `_al-{tonic}` suffix
```
maqām nahāwand al-kurdān → maqam_nahawand_al-kurdan (on kurdān)
maqām nahāwand al-nawā → maqam_nahawand_al-nawa (on nawā)
```

#### API Query Pattern

**To find a specific transposition**, use base maqam ID + tonic:

```bash
# Find maqām nahāwand on kurdān
?toMaqam=maqam_nahawand&toTonic=kurdan

# NOT the display name format
?toMaqam=maqam_nahawand_al-kurdan  # ❌ Will not work for queries
```

#### Why Two Fields?

**Problem solved**: Graph nodes keyed by display name (`maqam_nahawand_al-kurdan:kurdan`) caused "not found" errors when queried with base name + tonic (`maqam_nahawand:kurdan`).

**Solution**: The `baseMaqamIdName` field provides a stable identifier for:
- Graph node lookups
- Route finding queries
- Cross-transposition matching
- API parameter validation

#### Implementation Details

**Location**: `src/models/ModulationRoute.ts`

```typescript
export interface MaqamNode {
  maqamId: string;           // Numeric ID: "10"
  baseMaqamIdName: string;   // Stable: "maqam_nahawand" (for lookups)
  maqamIdName: string;       // Display: "maqam_nahawand_al-kurdan"
  maqamDisplayName: string;  // "maqām nahāwand al-kurdān"
  tonicId: string;           // "kurdan"
  tonicDisplay: string;      // "kurdān"
  isTransposition: boolean;  // true for taṣwīr, false for taḥlīl
}
```

**Graph node key format**: `{baseMaqamIdName}:{tonicId}`
```typescript
// Correct: Uses base ID for consistent lookups
const nodeKey = createNodeKey(node.baseMaqamIdName, node.tonicId);
// Result: "maqam_nahawand:kurdan"
```

#### API Response Example

```json
{
  "from": {
    "maqamId": "1",
    "baseMaqamIdName": "maqam_rast",
    "maqamIdName": "maqam_rast",
    "maqamDisplayName": "maqām rāst",
    "tonicId": "rast",
    "tonicDisplay": "rāst",
    "isTransposition": false
  },
  "to": {
    "maqamId": "10",
    "baseMaqamIdName": "maqam_nahawand",
    "maqamIdName": "maqam_nahawand_al-kurdan",
    "maqamDisplayName": "maqām nahāwand al-kurdān",
    "tonicId": "kurdan",
    "tonicDisplay": "kurdān",
    "isTransposition": true
  }
}
```

#### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `maqamIdName` for graph keys | Transpositions have different keys than base form | Use `baseMaqamIdName` for graph operations |
| Querying with display-style ID | `maqam_nahawand_al-kurdan` won't match query params | Use `baseMaqamIdName` + `tonic` params |
| Assuming all maqamat have same base/display ID | Only untransposed maqamat have matching IDs | Always check `isTransposition` flag |
| Not including `baseMaqamIdName` in API responses | Clients can't distinguish transpositions | Always return both ID fields |

### Ajnas

**Data file**: `data/ajnas.json`
**Model**: `src/models/Jins.ts`

| Field | Format | Example |
|-------|--------|---------|
| `id` | Numeric string | `"2"`, `"3"`, `"4"` |
| `idName` | `jins_<name>` | `"jins_bayyat"`, `"jins_saba"` |
| `name` | Display with diacritics | `"jins bayyāt"`, `"jins ṣabā"` |

**ID generation** (lines 90-91 in Jins.ts):
```typescript
const cleanName = name.trim();
this.idName = standardizeText(cleanName);
```

**API route matching** (same pattern as maqamat):
```typescript
const jins = ajnasData.find(
  (j) => j.getId() === jinsId || standardizeText(j.getName()) === standardizeText(jinsId)
);
```

### Note Names

**Model**: `src/models/NoteName.ts`

Note names are **typed string literals** from predefined arrays. They always have diacritics in canonical form.

| Context | Format | Example |
|---------|--------|---------|
| API param `noteName` | `standardizeText(name)` | `"dugah"`, `"rast"` |
| Display `noteNameDisplay` | Original with diacritics | `"dūgāh"`, `"rāst"` |
| Arabic `noteNameDisplayAr` | Arabic script | Via `getNoteNameDisplayAr()` |

**Octave prefixes**:

| Octave | Prefix | Example |
|--------|--------|---------|
| 0 (qarār) | `qarār` | `"qarār yegāh"`, `"qarār dūgāh"` |
| 1 (base) | none | `"yegāh"`, `"dūgāh"`, `"rāst"` |
| 2 (jawāb) | `jawāb` | `"jawāb shūrī"` (or special: `"nawā"`) |
| 3-4 | `jawāb jawāb...` | `"jawāb jawāb ḥusaynī"` |

**API parameter usage**:
```
?startingNote=ushayran   ✅ (matches "ʿushayrān")
?startingNote=yegah      ✅ (matches "yegāh")
?startingNote=ʿushayrān  ❌ (display name - use standardized)
```

### Sources (Bibliography)

**Data file**: `data/sources.json`
**Model**: `src/models/bibliography/Source.ts`

| Field | Format | Example |
|-------|--------|---------|
| `id` | `LastName-(Year)` or `LastName-(OrigYear/PubYear)` | `"Forster-(2010)"`, `"al-Urmawi-al-Baghdadi-(1986/2017)"` |
| Display | `titleEnglish` or `titleArabic` | Full title |

### API Response: Entity Object Pattern

**Location**: `src/app/api/response-shapes.ts`

All entities in API responses follow this structure:

```typescript
interface EntityNamespace {
  id: string;           // Original ID from data
  idName: string;       // URL-safe standardized name
  displayName: string;  // Human-readable with diacritics
  version?: string;     // ISO 8601 timestamp
  displayNameAr?: string; // Arabic script (if inArabic=true)
}
```

**Example API response**:
```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-10-18T19:41:17.132Z",
    "displayNameAr": "مقام راست"
  },
  "tonic": {
    "idName": "rast",
    "displayName": "rāst",
    "displayNameAr": "راست"
  }
}
```

### Common ID Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using display name in URL | Contains diacritics, spaces | Use `idName` or `standardizeText()` |
| Assuming all IDs are numeric | Tuning systems use `Creator-(Year)` | Check entity type |
| Not handling both id/idName | Route only matches one format | Use OR logic in `.find()` |
| Hardcoding IDs | IDs can change | Use `standardizeText(name)` |
| Forgetting `maqam_`/`jins_` prefix | idName includes entity prefix | Include full idName |

### Quick Reference

**When building API endpoints**:

1. **Route params**: Accept both `id` and `idName` for maqamat/ajnas
2. **Query params**: Use URL-safe format (output of `standardizeText()`)
3. **Response bodies**: Always include `{id, idName, displayName}` triplet
4. **Matching logic**: Use `standardizeText()` for comparison
5. **Tuning system IDs**: Use directly (already URL-safe with parentheses)

---

## Type Qualifiers Pattern

### Principle

**When a field contains values that could be confused with objects of a different type, include a type qualifier.**

### Example

```typescript
// ✅ GOOD: Clear that these are string values (names)
tuningSystemStartingNoteNames: string[]          // Name values like "ʿushayrān"
numberOfTuningSystemStartingNoteNames: number

// ❌ AVOID: Ambiguous - could be note objects with pitch data
tuningSystemStartingNotes: string[]              // Unclear if names or objects
```

### Rationale

In a music theory API, `note` could mean:
- A string name ("rāst")
- An object with pitch data (`{ name: "rāst", frequency: 293.66, cents: 0 }`)
- An object with interval relationships

Adding "Names" clarifies we're returning the string identifiers, not complex objects.

### When to Apply

- Field represents string names/identifiers, not objects
- Domain concepts are overloaded (e.g., "note" in music)
- Type ambiguity could confuse API consumers

---

## Context Qualifiers Pattern

### Principle

**Follow existing patterns like `numberOfPitchClassesSingleOctave` - include scope/context qualifiers.**

### Examples

```typescript
// ✅ GOOD: Complete semantic context
numberOfPitchClassesSingleOctave       // Clarifies scope (single octave vs. multi-octave)
tuningSystemStartingNoteNames          // Clarifies domain (tuning system vs. maqām)
numberOfTuningSystemStartingNoteNames  // Combined pattern

// ❌ AVOID: Ambiguous scope
numberOfPitchClasses                   // Single octave? Multiple?
startingNotes                          // From what? For what?
```

### When to Apply

- Concept exists in multiple scopes (single vs. multi-octave)
- Multiple domains use similar concepts (tuning system vs. maqām)
- Field could be interpreted in different contexts

---

## Avoid Generic Parameter Names

### Principle

**Generic names like "format", "type", or "mode" are anti-patterns. Parameter names must describe WHAT is being specified.**

### Examples

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

### Rationale

"format" could mean:
- Data format (JSON vs XML)
- Display format (table vs grid)
- Pitch data representation (frequency vs cents)
- File format (CSV vs JSON)
- Number format (decimal vs fraction)

"pitchClassDataType" is precise: it specifies the data type for pitch class objects in the response.

### Test by Removal

If you remove everything before the parameter, would you know what it specifies?
- ❌ `format=cents` - Format of what?
- ✅ `pitchClassDataType=cents` - Clear on its own

---

## ⚠️ CRITICAL: Frequency Usage in API Defaults

### Rule

**NEVER use "frequency" (Hz) as a default value, example, or primary reference for pitch class data parameters** except for Reference Frequency for Tuning System Starting Note Name.

### Rationale

**Frequency is absolute/hardcoded:**
- Frequency values (Hz) represent fixed, absolute pitch measurements
- Locks pitch classes to specific values
- Contradicts the relative nature of Arabic maqām theory

**Arabic maqām theory is relative:**
- Theoretical framework based on intervallic relationships
- Uses relative measurements, not absolute pitch
- Different tuning systems have different absolute frequencies for the same relative pitches

**Default reflects theoretical priority:**
- Default values communicate what the system considers primary
- Defaulting to frequency implies absolute pitch is fundamental
- Contradicts the project's decolonial computing principles

### Rules

1. **Default values**: Any `pitchClassDataType` or similar parameter must default to a relative format (preferably "cents" or "fraction"), NEVER "frequency"
2. **Examples in documentation**: Always prioritize relative formats (cents, fraction, stringLength) in examples
3. **Exception - Reference Frequency**: Frequency is appropriate ONLY for `referenceFrequency` context fields

### Examples

```typescript
// ❌ WRONG: Default to absolute frequency
pitchClassDataType: "frequency" | "cents" | "fraction"  // default: "frequency"
example: "frequency"

// ✅ CORRECT: Default to relative measurement
pitchClassDataType: "frequency" | "cents" | "fraction"  // default: "cents"
example: "cents"
description: "Returns pitch class data in cents (relative measurements from starting note)"

// ✅ CORRECT: Reference frequency as metadata
context: {
  referenceFrequency: 440  // This is metadata, not pitch class data
}
```

### Implementation Checklist

- [ ] No API endpoint defaults `pitchClassDataType` to "frequency"
- [ ] Documentation examples prioritize relative formats
- [ ] Code comments don't suggest frequency as the primary format
- [ ] Error messages and hints don't default to frequency examples

**For complete theoretical rationale**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md) section "Relative Pitch System"

---

## Domain-Specific Distinctions

### Principle

**Distinguish theoretically different concepts even when they seem similar.**

### Example

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

### Why This Matters

In Arabic music theory:
- **Tuning system starting note** = theoretical framework anchor (e.g., ʿushayrān for oud tuning)
- **Maqām tonic** = first note of the melodic scale (e.g., rāst for maqām rāst)

These are fundamentally different concepts that happen to be represented as strings. Conflating them creates theoretical confusion.

### When to Apply

- Concepts have different theoretical meanings in domain
- Similar data types represent different abstractions
- Clarity prevents musicological misinterpretation

---

## Array Field Naming

### Rule

**Always use plural nouns for array fields**, even in compound names.

### Examples

```typescript
// ✅ CORRECT
tuningSystemStartingNoteNames: string[]  // Plural "Names"
maqamSuyur: Sayr[]                       // Plural "Suyur"
pitchClasses: PitchClass[]               // Plural "Classes"

// ❌ INCORRECT
tuningSystemStartingNoteName: string[]   // Singular with array type
maqamSayr: Sayr[]                       // Singular with array type
```

### Why

- Immediately signals array type without looking at type annotation
- Follows TypeScript/JavaScript conventions
- Reduces cognitive load when reading code

---

## Consistency Checking Protocol

### Workflow

**Before finalizing any API field name:**

1. **Search for similar fields** in the codebase
2. **Extract the naming pattern** (qualifiers, structure, conventions)
3. **Apply the pattern consistently** to your new field
4. **Document the rationale** if establishing a new pattern

### Example

```bash
# Example: Checking naming patterns
grep -r "numberOfPitchClasses" src/
# Found: numberOfPitchClassesSingleOctave
# Pattern: number + Of + Concept + ScopeQualifier
# Apply: numberOfTuningSystemStartingNoteNames
```

### Benefits

- Maintains API consistency
- Discovers established patterns
- Prevents divergent naming styles
- Documents reasoning for future developers

---

## Field Name Construction Guidelines

### Pattern Structure

```
[Context][Domain][Concept][TypeQualifier][ScopeQualifier]
```

### Examples

| Field Name | Context | Domain | Concept | Type | Scope |
|------------|---------|--------|---------|------|-------|
| `tuningSystemStartingNoteNames` | tuningSystem | - | startingNote | Names | - |
| `numberOfPitchClassesSingleOctave` | - | - | pitchClasses | - | SingleOctave |
| `maqamAscendingPitchClasses` | maqam | - | pitchClasses | - | Ascending |

### Guidelines

**Context (optional):**
- Which entity/system this belongs to
- Examples: `tuningSystem`, `maqam`, `jins`

**Domain (optional):**
- Specific domain within context
- Examples: `melodic`, `rhythmic`, `theoretical`

**Concept (required):**
- Core concept being represented
- Examples: `pitchClasses`, `startingNote`, `intervals`

**Type Qualifier (when needed):**
- Clarifies data type vs. object type
- Examples: `Names` (strings), `Ids` (identifiers), `Counts` (numbers)

**Scope Qualifier (when needed):**
- Limits scope or context
- Examples: `SingleOctave`, `Ascending`, `Canonical`

---

## Common Naming Pitfalls

### Pitfall 1: Overly Concise Names

```typescript
// ❌ BAD
notes: string[]
start: string
count: number

// ✅ GOOD
tuningSystemStartingNoteNames: string[]
maqamTonicNoteName: string
numberOfPitchClassesSingleOctave: number
```

### Pitfall 2: Inconsistent Patterns

```typescript
// ❌ BAD: Mixing patterns
tuningSystemNoteNames: string[]    // Pattern A
maqam_tonic_name: string          // Pattern B (snake_case)
PitchClassCount: number           // Pattern C (PascalCase)

// ✅ GOOD: Consistent camelCase
tuningSystemStartingNoteNames: string[]
maqamTonicNoteName: string
numberOfPitchClasses: number
```

### Pitfall 3: Ambiguous Abbreviations

```typescript
// ❌ BAD
tsNames: string[]     // "ts" = tuning system? time series? TypeScript?
pcCount: number       // "pc" = pitch class? personal computer?

// ✅ GOOD
tuningSystemStartingNoteNames: string[]
numberOfPitchClasses: number
```

---

## API Testing Before Completion

### Rule

**ALWAYS test API requests and verify responses before marking tasks complete.**

### Testing Checklist

1. **Test the actual endpoint** with changes:
   ```bash
   # Test success case
   curl -s "http://localhost:3000/api/endpoint?param=value" | jq .

   # Test error cases
   curl -s "http://localhost:3000/api/endpoint?invalidParam=test" | jq '.error'
   ```

2. **Verify response structure** matches:
   - API conventions (entity objects, naming patterns)
   - OpenAPI specification
   - Expected behavior documented in task

3. **Check error responses** (if applicable):
   - Error messages are clear and actionable
   - Status codes are appropriate (400, 404, etc.)
   - Error format matches conventions

4. **Verify against conventions**:
   - Transposition naming (if applicable)
   - Entity object structure (`{id, idName, displayName}`)
   - Parameter validation order
   - Response format consistency

### Why This Matters

- API changes affect external users
- Undiscovered issues cause integration failures
- Testing ensures implementation matches requirements
- Verification catches documentation inconsistencies early

### Never Mark Complete Without

- [ ] Testing actual HTTP requests
- [ ] Verifying response structure matches conventions
- [ ] Checking error responses work correctly
- [ ] Confirming documentation matches implementation

---

## Testing Strategy for Naming Changes

### Shell Scripts with jq

**Fast validation without full integration test overhead:**

```bash
#!/bin/bash
# Fast validation for field naming

echo "Test: Field exists and is array"
response=$(curl -s "http://localhost:3000/api/tuning-systems")
field=$(echo "$response" | jq -r '.tuningSystems[0].tuningSystemStartingNoteNames')

if [ "$field" != "null" ] && [ ! -z "$field" ]; then
  echo "✓ PASS: Field exists"
else
  echo "✗ FAIL: Field missing or null"
fi

echo "Test: Field contains expected values"
count=$(echo "$field" | jq 'length')
if [ "$count" -gt 0 ]; then
  echo "✓ PASS: Field has values"
else
  echo "✗ FAIL: Field is empty"
fi
```

### When to Use

- ✅ API response structure validation
- ✅ Field presence/absence checks
- ✅ Data type verification
- ✅ Quick regression testing
- ❌ Complex business logic (use unit tests)
- ❌ Async operations (use integration tests)

---

## Summary

### Core Principles

1. **Self-documenting**: Field names should explain themselves
2. **Precise**: Avoid ambiguity, even if verbose
3. **Consistent**: Follow established patterns
4. **Domain-aware**: Respect theoretical distinctions
5. **Type-clear**: Distinguish strings from objects

### Key Patterns

- Type qualifiers: `...Names` for string arrays
- Context qualifiers: `tuningSystem...`, `maqam...`
- Scope qualifiers: `...SingleOctave`, `...Ascending`
- Avoid generics: Not `format`, use `pitchClassDataType`
- Arrays plural: `pitchClasses`, not `pitchClass`

### Critical Rules

- Never default to frequency for pitch class data
- Always test API endpoints before completion
- Check consistency with existing naming
- Document rationale for new patterns

**Apply these principles to create self-documenting, culturally-aware, semantically precise APIs.**
