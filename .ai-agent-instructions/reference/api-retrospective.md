# API Design Principles & Lessons Learned

**PURPOSE**: Comprehensive retrospective of API design decisions, patterns discovered, and lessons learned during DiArMaqAr development.

**LOAD**: When working on API endpoints, reviewing API design decisions, or learning from past architectural choices.

---

## Entity Object Pattern (CRITICAL)

### Rule

**Always return complete entity objects with `{id, idName, displayName}` structure. Never return flat string arrays or bare IDs for entity references.**

### Why

- Prevents additional API calls to retrieve display information
- Enables proper rendering of Arabic diacritics in UI without lookups
- Follows "Always include both display and URL-safe IDs" architectural principle
- Provides complete semantic information in single response

### Bad Example ❌

```typescript
ajnas: {
  ascending: ["jins_bayyat", "jins_segah"]
}
```

**Problems:**
- Client must make additional API calls to get display names
- No Arabic diacritics available
- Unclear what these strings represent (IDs? Names? Both?)

### Good Example ✅

```typescript
ajnas: {
  ascending: [
    { id: "2", idName: "jins_bayyat", displayName: "jins bayyāt" },
    { id: "3", idName: "jins_segah", displayName: "jins segāh" }
  ]
}
```

**Benefits:**
- Complete information in single response
- Arabic diacritics ready for display
- Clear semantic structure
- Type-safe and self-documenting

---

## Namespaced Response Envelope

### Rule

Always wrap primary entities, related identifiers, statistics, availability, and hyperlinks inside explicit namespaces (`jins`, `maqam`, `tonic`, `family`, `stats`, `availability`, `links`, etc.). Root-level payloads should be minimal and descriptive (`data`, `meta`, `parameters`).

### Why

- Keeps responses self-documenting and easier to diff/test
- Prevents accidental field collisions at the top level
- Makes bilingual extensions (`displayNameAr`) predictable—Arabic variants stay next to their transliterated counterparts
- Aligns API, documentation, and clients with the shared serializer helpers (`buildEntityNamespace`, `buildIdentifierNamespace`, `buildStringArrayNamespace`, `buildLinksNamespace`)

### List Response Structure (CRITICAL)

**All list endpoints MUST use consistent structure:**

```json
{
  "count": 29,
  "data": [
```

**Never use nested `meta` object:**
```json
// ❌ WRONG - Do not use this structure
{
  "meta": { "count": 29 },
  "data": [...]
}

// ❌ WRONG - Do not use this structure  
{
  "meta": { "total": 29 },
  "data": [...]
}
```

**Why:**
- Consistency across all endpoints (`/maqamat`, `/ajnas`, `/tuning-systems`, `/sources`)
- Simpler client-side access (`response.count` vs `response.meta.count`)
- `buildListResponse()` helper automatically provides this structure
- Custom meta fields (like `filteredByTransposition`, `totalComparisons`) are flattened to top level alongside `count`

**Implementation:**
- Use `buildListResponse(items)` for standard list responses
- Custom meta fields are added at top level: `buildListResponse(items, { meta: { customField: value } })` → `{ count, customField, data }`

### Example

```json
{
  "count": 29,
  "data": [
    {
      "jins": {
        "id": "5",
        "idName": "jins_ajam_ushayran",
        "displayName": "jins ʿajam ʿushayrān",
        "version": "2025-10-18T19:34:26.343Z",
        "displayNameAr": "جنس عَجَم عُشَيران"
      },
      "tonic": {
        "idName": "ajam_ushayran",
        "displayName": "ʿajam ʿushayrān",
        "displayNameAr": "عَجَم عُشَيران"
      },
      "stats": {
        "numberOfPitchClasses": 4,
        "availableInTuningSystems": 35
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "Ronzevalle-(1904)",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) 24-tone"
            },
            "startingNotes": {
              "idNames": ["ushayran", "yegah"],
              "displayNames": ["ʿushayrān", "yegāh"],
              "displayNamesAr": ["عُشَيران", "يكاه"]
            }
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_ajam_ushayran",
        "availability": "/api/ajnas/jins_ajam_ushayran/availability"
      }
    }
  ]
}
```

### Implementation Notes

- All list/detail routes should rely on the shared serializers. If you need a new namespace, extend the helper before hand-rolling JSON.
- String collections use `idNames`, `displayNames`, and (optionally) `displayNamesAr` to keep parity between transliterated and Arabic values.
- `links` objects consolidate every URL and make test scripts trivial: assert `links.detail` rather than searching the payload.
- Error payloads keep the existing `{ error, message, hint, validOptions, availabilityUrl }` contract; only success responses are namespaced.

### Implementation Pattern

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

---

## Context Object Nesting

### Rule

**Related configuration data should be nested logically within parent objects, not spread across the root level.**

### Why

- Improves API discoverability
- Reduces namespace pollution at root level
- Creates clear semantic groupings
- Makes JSON responses easier to understand

### Bad Example ❌

```json
{
  "context": {
    "tuningSystem": {...},
    "startingNote": "ushayran",
    "referenceFrequency": 97.999
  }
}
```

**Problems:**
- `startingNote` and `referenceFrequency` are orphaned at context level
- Unclear that they belong to the tuning system
- Harder to maintain as context grows

### Good Example ✅

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

**Benefits:**
- Clear ownership: starting note and reference frequency belong to tuning system
- Better encapsulation
- Self-documenting structure
- Easier to extend

---

## Context-First Response Ordering

### Rule

**When returning calculated or derived data, structure responses with configuration context first, then identifiers, then calculated results. Use semantically descriptive field names that indicate purpose.**

### General Principle

**Information hierarchy for calculated data:**
1. **Configuration Context** (first) - All parameters/settings that produced the result
2. **Entity Identifiers** (second) - The entities being compared/calculated
3. **Calculated Data** (third) - The derived measurements or results

### Why

- **Context-first reading**: Users understand the theoretical framework before interpreting calculations
- **Self-documenting structure**: Field order tells a story (what was configured → what was measured → what was calculated)
- **Logical grouping**: All configuration that affects the result belongs together
- **Progressive disclosure**: Follows natural information hierarchy from general to specific
- **Reduced cognitive load**: Context establishes mental model before processing data

### Bad Example ❌

```json
{
  "results": [
    {
      "value": 203.91,
      "from": { "id": "rast" },
      "to": { "id": "dugah" },
      "config": {
        "system": {...},
        "version": "2025-10-18",
        "reference": 110
      }
    }
  ]
}
```

**Problems:**
- Configuration appears last, after results
- Generic field names (`value`, `from`, `to`, `config`) lack semantic clarity
- Unclear what configuration produced which result
- No clear information hierarchy

### Good Example ✅

```json
{
  "results": [
    {
      "systemContext": {
        "system": {
          "id": "IbnSina-(1037)",
          "displayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
          "version": "2025-10-18T19:42:23.643Z"
        },
        "startingNote": {
          "idName": "ushayran",
          "displayName": "ʿushayrān"
        },
        "referenceFrequency": 110
      },
      "fromEntity": {
        "idName": "rast",
        "displayName": "rāst"
      },
      "toEntity": {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      "calculatedData": {
        "fraction": "9/8",
        "cents": 203.91,
        "decimalRatio": 1.125
      }
    }
  ]
}
```

**Benefits:**
- Configuration context appears first, establishing framework
- Semantic field names (`systemContext`, `fromEntity`, `toEntity`, `calculatedData`) are self-documenting
- Clear information hierarchy: context → identifiers → data
- Each result object is self-contained with complete context

### Generalizable Patterns

**1. Context Grouping Pattern**
- Group all configuration that affects the calculation in a single namespace
- Use `[Entity]Context` suffix (e.g., `tuningSystemContext`, `calculationContext`, `queryContext`)
- Include version, parameters, and reference values together

**2. Identifier Naming Pattern**
- Use `[Direction/Type]Entity` pattern for relationship endpoints (e.g., `fromEntity`, `toEntity`, `sourceEntity`, `targetEntity`)
- Use `[Type]Note` for note-specific endpoints (e.g., `fromNote`, `toNote`, `startingNote`)
- Be specific about what the identifier represents

**3. Data Naming Pattern**
- Use `[Type]Data` suffix for calculated/derived data (e.g., `intervalData`, `pitchData`, `calculationData`)
- Use `[Type]Result` for comparison/analysis results (e.g., `comparisonResult`, `analysisResult`)
- Distinguish between raw data and processed results

### Implementation Pattern

```typescript
// Build context helper - groups all configuration together
function buildCalculationContext(
  system: System,
  parameters: Parameters,
  reference: Reference
) {
  return {
    system: buildEntityNamespace(/* ... */),
    parameters: { /* ... */ },
    reference: reference
  };
}

// Structure response with context first
results.push({
  calculationContext: buildCalculationContext(/* ... */),
  fromEntity: buildIdentifierNamespace(/* ... */),
  toEntity: buildIdentifierNamespace(/* ... */),
  calculatedData: formatCalculationData(result)
});
```

### When to Apply

- **Calculated relationships**: Endpoints returning intervals, distances, comparisons
- **Derived measurements**: Results that depend on configuration parameters
- **Context-dependent data**: Any response where configuration affects interpretation
- **Multi-system comparisons**: When same calculation appears across different contexts
- **Progressive disclosure endpoints**: Where users need context to understand results

### Key Insight

**The order of fields in a response should mirror the order of understanding**: First establish what framework/system produced the result, then identify what entities were involved, then present the calculated outcome. This creates self-documenting responses that reduce cognitive load.

---

## Metadata Fields in Formatted Data

### Rule

**When returning formatted pitch/interval data, always include positioning metadata regardless of requested format.**

### Required Metadata

**For Maqamat and Ajnās:**
```typescript
{
  pitchClassIndex: number,      // Position in tuning system
  scaleDegree: string,          // Roman numeral (I, II, III)
  noteName: string,             // URL-safe identifier
  noteNameDisplay: string,      // With diacritics
  // ... then format-specific fields
}
```

**For Pitch Classes (fundamental building blocks):**
```typescript
{
  pitchClassIndex: number,      // Position in tuning system
  octave: number,               // Octave number (0, 1, 2, 3)
  noteName: string,             // URL-safe identifier
  noteNameDisplay: string,      // With diacritics
  // ... then format-specific fields
  // NOTE: scaleDegree is NOT included - pitch classes are fundamental building blocks, not scale degrees
}
```

### Why

- Clients always need positioning information for display/analysis
- Avoids forcing clients to request `format=all` just for metadata
- Provides complete semantic context for each pitch
- Enables proper UI rendering without additional lookups
- **Pitch classes are fundamental building blocks** - they don't have scale degrees (that's a maqam/jins concept)

### Example: Maqam Response

```json
{
  "pitchClasses": [
    {
      "pitchClassIndex": 0,
      "scaleDegree": "I",
      "noteName": "yegah",
      "noteNameDisplay": "yegāh",
      "cents": 0,
      "frequency": 97.999
    }
  ]
}
```

### Example: Pitch Class Response

```json
{
  "pitchClasses": [
    {
      "pitchClassIndex": 0,
      "octave": 1,
      "noteName": "yegah",
      "noteNameDisplay": "yegāh",
      "cents": 0,
      "frequency": 97.999
    }
  ]
}
```

---

## Standard Endpoint Pattern (List, Detail, Availability, Compare)

### Rule

**Most entities follow a consistent four-endpoint pattern for comprehensive API coverage.**

### Standard Pattern

1. **LIST** - `GET /api/{entities}` - Browse all entities with metadata and availability stats
2. **DETAIL** - `GET /api/{entities}/{id}` - Get full entity data (requires `tuningSystem` and `startingNote` for context-dependent entities)
3. **AVAILABILITY** - `GET /api/{entities}/{id}/availability` - Check which tuning systems support this entity
4. **COMPARE** - `GET /api/{entities}/{id}/compare` - Compare entity across multiple tuning systems

### Entities Following This Pattern

- ✅ **Maqāmāt**: `/api/maqamat`, `/api/maqamat/{id}`, `/api/maqamat/{id}/availability`, `/api/maqamat/{id}/compare`
- ✅ **Ajnās**: `/api/ajnas`, `/api/ajnas/{id}`, `/api/ajnas/{id}/availability`, `/api/ajnas/{id}/compare`
- ✅ **Pitch Classes**: `/api/pitch-classes`, `/api/pitch-classes/{id}`, `/api/pitch-classes/{id}/availability`, `/api/pitch-classes/{id}/compare`

### Special Endpoints

**Transpositions** (maqamat/ajnas only):
- `GET /api/{entities}/{id}/transpositions` - List available transpositions

**Tuning System Details**:
- `GET /api/tuning-systems/{id}/{startingNote}/pitch-classes` - Get all pitch classes for a tuning system (essential for tuning system operations)

### Key Differences: Pitch Classes vs Maqamat/Ajnās

| Feature | Maqamat/Ajnās | Pitch Classes |
|---------|---------------|---------------|
| Transpositions | ✅ Supported | ❌ Not applicable (fundamental building blocks) |
| Scale Degree | ✅ Included in response | ❌ Not included (not relevant) |
| Octave Filter | ❌ Not applicable | ✅ Supports `octave=all` (default) or specific octave (0, 1, 2, 3) |
| Required Params | `tuningSystem`, `startingNote` | `tuningSystem`, `startingNote` (for detail endpoint) |

### Why This Pattern

- **Progressive Disclosure**: Users can browse → check compatibility → get full data → compare across systems
- **Consistency**: Same pattern across all entities reduces cognitive load
- **Completeness**: Covers all common use cases (browsing, details, compatibility, comparison)
- **Discoverability**: Clear endpoint structure makes API self-documenting

### Implementation Checklist

When creating new entity endpoints:
- [ ] Create list endpoint with availability stats
- [ ] Create detail endpoint (require `tuningSystem` and `startingNote` if context-dependent)
- [ ] Create availability endpoint
- [ ] Create compare endpoint
- [ ] Add endpoints to sidebar in `docs/.vitepress/config.mts`
- [ ] Update OpenAPI specification
- [ ] Follow namespaced response pattern
- [ ] For pitch class endpoints: Support `octave=all` (default) to return all octaves, or specific octave numbers

---

## Source-Based Query Endpoints

### Pattern

**Query entities by their bibliographic source relationship.**

### Endpoints

Three endpoints allow users to discover which tuning systems, maqamat, and ajnas are documented in a specific source:

1. **Tuning Systems by Source** - `GET /api/sources/{id}/tuning-systems`
2. **Maqamat by Source** - `GET /api/sources/{id}/maqamat`
3. **Ajnās by Source** - `GET /api/sources/{id}/ajnas`

### Purpose

These endpoints provide an easy way to access which information in the data has been taken from a specific source. This is essential for:
- **Scholarly verification**: Researchers can see which sources contributed which data
- **Source attribution**: Understanding the provenance of musical data
- **Bibliographic research**: Finding all content from a particular historical source

### Implementation Pattern

**Filtering Logic:**
- Tuning systems: Match if any `sourcePageReferences` contain the source ID
- Maqamat: Match if any `sourcePageReferences` contain the source ID
- Ajnās: Match if any `SourcePageReferences` contain the source ID

**Response Structure:**
```json
{
  "context": {
    "source": {
      "id": "Farmer-(1937)",
      "idName": "Farmer-(1937)",
      "displayName": "The Lute Scale of Avicenna"
    }
  },
  "data": [
    {
      "tuningSystem": { /* EntityRef */ },
      "sourceReferences": [
        { "page": "245" }
      ],
      "startingNotes": ["ushayran", "yegah"],
      "links": { /* Links */ }
    }
  ],
  "count": 5
}
```

### Key Features

1. **Source Context**: Always include the source entity in the `context` namespace
2. **Relevant References**: Only include page references for the queried source (filter `sourcePageReferences` by `sourceId`)
3. **Complete Entity Data**: Return full entity objects (not just IDs) for immediate use
4. **Links**: Include links to both the entity detail endpoint and the source detail endpoint

### Implementation Checklist

When creating source-based query endpoints:
- [ ] Validate source exists (return 404 if not found)
- [ ] Filter entities by matching `sourceId` in their `sourcePageReferences`
- [ ] Include only relevant page references (filter by source ID)
- [ ] Return source context in response
- [ ] Use `buildListResponse()` helper for consistent structure (returns `{count, data}` not `{meta: {count}, data}`)
- [ ] Include links to entity detail and source detail endpoints
- [ ] Support `inArabic` parameter (defaults to "true")
- [ ] Add to sidebar in `docs/.vitepress/config.mts`
- [ ] Update OpenAPI specification

### Example: Tuning Systems by Source

```typescript
// Filter tuning systems that reference this source
const matchingTuningSystems = tuningSystems.filter(ts => {
  const sourcePageReferences = ts.getSourcePageReferences();
  return sourcePageReferences.some(ref => ref.sourceId === id);
});

// Build response with only relevant page references
const tuningSystemsData = matchingTuningSystems.map(ts => {
  const sourcePageReferences = ts.getSourcePageReferences();
  const relevantRefs = sourcePageReferences.filter(ref => ref.sourceId === id);
  
  return {
    tuningSystem: buildEntityNamespace(/* ... */),
    sourceReferences: relevantRefs.map(ref => ({ page: ref.page })),
    // ... other fields
  };
});
```

### Why This Pattern

- **Discoverability**: Easy to find all content from a specific source
- **Academic Integrity**: Clear source attribution for scholarly use
- **Data Provenance**: Users can trace where information came from
- **Bibliographic Research**: Supports research workflows that start from sources

---

## Field Naming Consistency

### Patterns to Follow

**Name String Suffixes:**
- Use `[field]Name` suffix when referring to name strings
- Examples: `startingNoteName`, `displayName`, `idName`

**Entity Structure:**
- Consistent: `{id, idName, displayName}`
- Never: `{id, name}` or `{identifier, label}`

**Boolean Fields:**
- `includeIntervals`, `isDescending`, `hasModulations`
- Never abbreviate: `inclIntvls` ❌

**Array/Collection Naming:**
- Plural form: `pitchClasses`, `modulations`, `transpositions`
- Never singular with "List" suffix: `pitchClassList` ❌

### Why

- Reduces cognitive load
- Makes API self-consistent
- Easier to remember and discover
- Better IDE autocomplete

---

## Legacy Alias Policy

### Rule

**Do not maintain legacy aliases "for backward compatibility" without proper API versioning.**

### Why

- Creates confusion for new users
- Increases test burden (must test all aliases)
- Bloats documentation
- Makes refactoring harder
- No clear deprecation path

### Action

**Clean removal is better than indefinite maintenance.**

If backward compatibility is required, implement proper API versioning (v1, v2) instead of maintaining aliases.

### Example: DiArMaqAr Legacy Cleanup

**Removed 5 legacy aliases:**
- `frequencies` → standardized to `frequency`
- `fractions` → standardized to `fraction`
- `ratios` → standardized to `decimalRatio`
- `midi` → standardized to `midiNoteNumber`
- `stringLengths` → standardized to `stringLength`

**Result:**
- API surface reduced from 20 to 15 pitch class formats
- Documentation became clearer
- UI dropdowns simplified
- No user complaints (proper communication)

---

## API-UI Synchronization Checklist

### Rule

**When adding/removing/changing API format options, update ALL components.**

### Required Updates

1. ✅ API route handler (`formatPitchData()` case statements)
2. ✅ UI dropdown options (Material-UI `MenuItem` components)
3. ✅ Test suite (add/remove test cases)
4. ✅ OpenAPI specification (parameter descriptions)
5. ✅ Documentation (README, API guides)
6. ✅ TypeScript types/interfaces (if applicable)

### Why

Prevents UI-API drift that causes:
- User confusion (option shown but doesn't work)
- Failed requests (undocumented parameters)
- Test failures (outdated expectations)
- Documentation lies

### Example Workflow

**Adding new format `format=abjad`:**

1. Add case to API route:
   ```typescript
   case 'abjad':
     return { abjadName: pitchClass.getAbjadName() };
   ```

2. Add UI dropdown option:
   ```typescript
   <MenuItem value="abjad">Abjad Names</MenuItem>
   ```

3. Add test case:
   ```bash
   curl -s "localhost:3000/api/maqamat/maqam_rast?format=abjad"
   ```

4. Update OpenAPI:
   ```yaml
   - abjad
   ```

5. Update README

6. Update TypeScript interface if needed

---

## Response Verification Workflow

### Rule

**After API structural changes, verify responses with actual HTTP requests.**

### Tools & Commands

```bash
# Check entity object structure
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.ajnas.ascending[0:2]'

# Verify context nesting
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.context'

# Check modulations
curl -s "http://localhost:3000/api/maqamat/maqam_bayyat?..." | jq '.modulations.maqamat.onFirstDegree[0:3]'
```

### What to Verify

- ✅ Arabic diacritics render correctly (`maqām ḥijāz`)
- ✅ Entity objects contain all three fields
- ✅ Context structure is properly nested
- ✅ No `null`/`undefined` in arrays
- ✅ Field names match documentation
- ✅ Metadata present in all formatted responses

### Why

- Type checking doesn't catch structural issues
- Documentation can drift from implementation
- UI rendering issues often only visible in actual responses
- Catches issues before users do

---

## UI Label Formatting

### Rule

**Dropdown labels should be clean and user-friendly.**

### Bad ❌

```typescript
<MenuItem value="stringLength">stringLength - String lengths</MenuItem>
```

**Problems:**
- Redundant (value already contains field name)
- Visual clutter
- Not user-friendly (camelCase in UI)

### Good ✅

```typescript
<MenuItem value="stringLength">String Lengths</MenuItem>
```

**Benefits:**
- Clean, readable
- Field name exists as value attribute
- User sees friendly label
- Reduces cognitive load

### Why

Field name already exists as value attribute; displaying it again in the label creates unnecessary redundancy.

---

## Current API Format Count

### Total: 15 Pitch Class Data Types

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

### Legacy Aliases Removed: 5

- `frequencies` (→ `frequency`)
- `fractions` (→ `fraction`)
- `ratios` (→ `decimalRatio`)
- `midi` (→ `midiNoteNumber`)
- `stringLengths` (→ `stringLength`)

---

## Progressive Disclosure Pattern Lessons

### Discovery

**Original Problem**: API returned everything by default, overwhelming users exploring the system.

**Solution**: Three-tier progressive disclosure:
1. LIST - Browse (metadata only)
2. AVAILABLE - Check compatibility
3. DATA - Get full data

### Benefits Realized

- **Bandwidth**: 90% reduction for exploratory queries
- **User experience**: Clear path from discovery to deep analysis
- **API clarity**: Each endpoint has focused purpose
- **Performance**: Users only pay cost for data they need

### Implementation Insight

**Key realization**: Most users browsing the catalog don't need full pitch class data. They're exploring what's available.

Separating "what exists" from "what's compatible" from "give me the data" created natural user flow.

---

## Validation Pattern Lessons

### Required Parameters

**Return 400 if missing:**
```typescript
if (!tuningSystem || !startingNote) {
  return NextResponse.json(
    { error: 'Missing required parameters: tuningSystem, startingNote' },
    { status: 400 }
  );
}
```

### Invalid IDs

**Return 404 with helpful message:**
```typescript
if (!maqam) {
  return NextResponse.json(
    {
      error: `Maqām '${id}' not found`,
      suggestion: 'Use GET /api/maqamat to list all available maqāmāt'
    },
    { status: 404 }
  );
}
```

### Tuning System ID Precision

**Critical lesson**: Tuning system IDs include suffixes like `-(950g)`.

Common mistake:
```typescript
// ❌ Wrong
tuningSystem: "Al-Farabi"

// ✅ Correct
tuningSystem: "Al-Farabi-(950g)"
```

**Solution**: Validate against actual data file IDs, provide clear error messages.

---

## Diacritics Handling Lessons

### Problem

Non-Arabic keyboards struggle with diacritics:
- `yegāh` vs `yegah`
- `Ṣabbāgh` vs `Sabbagh`
- `rāst` vs `rast`

### Solution

`standardizeText()` utility for all matching:

```typescript
export function standardizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
```

### Lesson Learned

**Always normalize for matching, never for display.**

- ✅ Matching: `standardizeText(userInput) === standardizeText(dbValue)`
- ❌ Display: Always use original with diacritics

This single function eliminated 80% of user input issues.

---

## Response Regression Testing (NEW)

### Rule

Use the shared `scripts/test-api-responses.sh` (or equivalent) to exercise every endpoint’s happy-path and error-path responses after structural changes. The script should:

- Hit list, detail, compare, availability, and transposition routes for both ajnās and maqāmāt
- Validate required namespaces and bilingual fields via `jq`
- Confirm error payloads still expose `{ error, message, hint }` and any expected metadata (`validOptions`, `availabilityUrl`)

### Why

- Namespaced responses are easy to regress accidentally; automated assertions catch missing `displayNameAr` or renamed keys immediately
- Keeps OpenAPI, implementation, and docs in sync
- Provides a fast local sanity check before running longer integration suites

### Best Practices

- Parameterize the base URL (`API_BASE_URL=${API_BASE_URL:-http://localhost:3000}`) so the script works in local, staging, or CI contexts
- Fail fast on the first broken response (`set -euo pipefail`) but capture detailed diff output for triage
- Pair the script with a `npm run test:api-responses` entry so it’s discoverable by all contributors

---

## Dual-Mode API Parameters (Export Compatibility)

### Rule

**For APIs that serve both musicological analysis AND export/tooling integration, provide mode-switching parameters that preserve data integrity while adapting presentation.**

### Pattern: `startSetFromC` + `pitchClassDataType` in 12-Pitch-Class Sets API

**Problem 1**: Maqāmāt analysis starts from the maqām tonic, but Scala (.scl) format and MIDI keyboards expect degree 0 = middle C.

**Problem 2**: Different use cases need different data fields, and full responses can be unnecessarily large for simple exports.

**Solution**: Two complementary parameters:

#### 1. Mode Switching (`startSetFromC`)

```typescript
// Default mode (startSetFromC=false): Musicological analysis
{
  pitchClassSet: [
    { ipnReferenceNoteName: "D", noteName: "dūgāh", relativeCents: 0.00, ... },  // Tonic
    { ipnReferenceNoteName: "D#", noteName: "kurdī", relativeCents: 90.05, ... },
    ...
  ],
  compatibleMaqamat: [
    {
      maqamDisplayName: "maqām ḥijāz",
      tonic: { ipnReferenceNoteName: "D", noteNameDisplayName: "dūgāh", positionInSet: 0 }
    },
    ...
  ]
}

// Scala mode (startSetFromC=true): Export compatibility
{
  pitchClassSet: [
    { ipnReferenceNoteName: "C", noteName: "rāst", relativeCents: 0.00, ... },  // Degree 0
    { ipnReferenceNoteName: "C#", noteName: "zīrgūleh", relativeCents: 92.21, ... },
    { ipnReferenceNoteName: "D", noteName: "dūgāh", relativeCents: 204.08, ... }, // Tonic
    ...
  ],
  compatibleMaqamat: [
    {
      maqamDisplayName: "maqām ḥijāz",
      tonic: { ipnReferenceNoteName: "D", noteNameDisplayName: "dūgāh", positionInSet: 2 }
    },
    ...
  ]
}
```

**Key Design Decision**: Tonic information is **inside each `compatibleMaqamat` object**, not at top level, because different maqāmāt in the same set can have different tonics (transpositions).

#### 2. Data Field Filtering (`pitchClassDataType`)

Controls which pitch class fields are returned:

```typescript
// Default (no parameter): Minimal fields
{ ipnReferenceNoteName: "C", noteName: "rāst", relativeCents: 0, octave: 1 }

// pitchClassDataType=cents: Only cents
{ ipnReferenceNoteName: "C", noteName: "rāst", cents: 498.04 }

// pitchClassDataType=all: All 15 fields
{ ipnReferenceNoteName: "C", noteName: "rāst", cents: 498.04, relativeCents: 0,
  fraction: "1/1", decimalRatio: 1, frequency: 264, octave: 1, englishName: "C2",
  stringLength: "66.000", fretDivision: "0.000", midiNoteDecimal: 60.04,
  midiNoteDeviation: "60 +4.5", centsDeviation: 4.5, referenceNoteName: "C" }
```

**Valid options**: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, `stringLength`, `frequency`, `abjadName`, `fretDivision`, `midiNoteNumber`, `midiNoteDeviation`, `centsDeviation`, `referenceNoteName`, `relativeCents`

### Critical Requirements

1. **Preserve absolute values**: Absolute cents, frequencies, ratios unchanged between modes
2. **Maintain cultural accuracy**: Note names follow NoteName model's octave conventions
3. **Track original context**: Each compatible maqām includes its tonic position in the set
4. **Handle edge cases**: Selective octave shifting for pitch classes before the tonic
5. **Per-maqam tonic tracking**: Tonic information belongs to individual maqāmāt, not top-level
6. **Octave equivalent matching**: Match tonics by IPN reference (pitch class) not exact Arabic note name, ensuring qarār dūgāh and muḥayyar correctly map to D
7. **Flexible data filtering**: Allow clients to request only needed fields for efficiency
8. **Validation**: Validate `pitchClassDataType` values and return helpful error messages
9. **Document clearly**: Explain which mode and which data type serves which use case

### Why This Works

- **Separation of concerns**: Analysis vs export are distinct use cases, data field needs vary
- **Data integrity**: Same underlying pitch data, different presentation and filtering
- **User choice**: Explicit parameters make intent clear
- **No breaking changes**: Default mode preserves existing behavior
- **Complete information**: Per-maqam tonic tracking allows understanding of all compatible maqāmāt
- **Efficiency**: Data filtering reduces payload size for simple use cases
- **Composability**: Parameters work independently and together

### Implementation Notes

**File**: `src/app/api/maqamat/classification/12-pitch-class-sets/route.ts`

**Key steps**:
1. **Parameter validation** (lines 115-144): Validate `pitchClassDataType` with helpful errors
2. **Octave selection** (lines 228-243): Selectively shift octave 2 notes before tonic to octave 1
3. **Array rotation** (lines 248-258): Rotate to start from C while preserving order
4. **Relative cents** (lines 279-281): Recalculate from new reference with wrap-around
5. **Data formatting** (lines 24-95): `formatPitchClassData` helper filters fields based on parameter
6. **Per-maqam tonic** (lines 309-359): Extract tonic for each compatible maqām individually

**Helper function pattern**: Follows same `formatPitchClassData` approach as `/maqamat/{idName}` endpoint for consistency

### When to Use This Pattern

**Mode switching (`startSetFromC`)**:
- ✅ API serves both analysis AND export use cases
- ✅ Different starting points/orderings needed for different contexts
- ✅ Cultural/musicological accuracy must be preserved
- ✅ Export format has rigid requirements (like Scala .scl)
- ❌ Don't use for simple formatting differences (use format parameter instead)
- ❌ Don't use if modes would have different data schemas

**Data field filtering (`pitchClassDataType`)**:
- ✅ API returns complex objects with many fields
- ✅ Different use cases need different subsets of data
- ✅ Payload size optimization is important
- ✅ Same pattern used across multiple endpoints (consistency)
- ❌ Don't use if all fields are always needed
- ❌ Don't use if response is already minimal

**Per-object metadata (`tonic` in `compatibleMaqamat`)**:
- ✅ Collection items can have different values for the same property
- ✅ Property is intrinsic to each item, not to the collection
- ✅ Clients need to understand each item's relationship to the collection
- ❌ Don't use if all items share the same value (use top-level instead)

### Testing Requirements

For dual-mode parameters, always verify:

1. **Note name consistency**: Pitch classes at/after tonic should have identical note names in both modes
2. **Absolute value preservation**: Cents, frequencies, ratios must match exactly
3. **Per-maqam tonic accuracy**: Each compatible maqām has correct tonic position in both modes
4. **Edge cases**: Test maqāmāt starting at different chromatic positions (C, D, E, F#, etc.)
5. **Octave boundaries**: Verify correct octave selection per NoteName model
6. **Transposition handling**: Verify different maqāmāt in same set have correct tonics
7. **Octave equivalents**: Verify maqāmāt in different octaves (qarār, muḥayyar) correctly map to same IPN and position

For data filtering parameters, always verify:

1. **Minimal fields**: Default (no parameter) returns essential fields only
2. **Individual types**: Each data type option returns correct fields
3. **All fields**: `all` option returns complete data
4. **Validation**: Invalid values return 400 error with helpful messages
5. **Composability**: Works correctly with other parameters (e.g., `startSetFromC`)

**Reference**: See `.ai-agent-instructions/reference/12-pitch-class-sets-scala-export.md` for full implementation details.

---

## Additional Resources

**For comprehensive API development session notes**: See `src/app/api/playground/SESSION_SUMMARY.md`

Includes:
- Progressive disclosure implementation details
- 27 automated test cases
- API playground UX design decisions
- Real-world examples of all endpoints
- Testing framework and quality metrics

---

## Summary

These lessons represent cumulative learning from:
- Multiple API iterations
- User feedback
- Cross-cultural API design challenges
- Performance optimization
- Documentation maintenance

**Key Takeaway**: API design for cultural knowledge systems requires extra attention to:
- Entity completeness (diacritics, IDs, names)
- Progressive disclosure (bandwidth considerations)
- Naming consistency (reduces confusion)
- Validation clarity (helpful error messages)
- Clean evolution (avoid legacy baggage)

Apply these patterns to maintain API quality and user experience.
