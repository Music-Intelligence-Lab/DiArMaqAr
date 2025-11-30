# OpenAPI Formatting & Documentation Standards

**PURPOSE**: Comprehensive guide for OpenAPI specification formatting, parameter documentation, and API documentation standards.

**LOAD**: When working on OpenAPI specification (`openapi.yaml`), documenting APIs, or creating API endpoints.

---

## ⚠️ CRITICAL: PUT Endpoints Policy

**PUT endpoints must NEVER be documented in OpenAPI specification.**

- PUT endpoints exist for internal administrative use only
- They are not part of the public API contract
- Do not add PUT endpoints to `openapi.yaml` or any API documentation
- If you see PUT endpoints in documentation, remove them immediately
- This policy applies permanently - never add them back

**Rationale**: PUT endpoints are used internally for database management and should not be exposed in public-facing API documentation to prevent misuse and maintain API security boundaries.

---

## OpenAPI JSON Caching Solution

**The OpenAPI JSON file is served from `/api/openapi.json` with strict no-cache headers.**

### Key Implementation Details

**1. API Route**: `src/app/api/openapi.json/route.ts`
- Serves the JSON file from `public/docs/openapi.json`
- Sets strict no-cache headers: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`
- Includes file modification time in ETag header
- Accepts optional `?v=<timestamp>` query parameter for cache-busting
- Returns the query parameter value in `X-OpenAPI-Version` response header
- Works reliably on Netlify as a Next.js API route

**2. VitePress Integration**: `docs/api/index.md`
- Uses `<OASpec :spec-url="openApiUrl" />` component with dynamic URL
- Generates URL with timestamp query parameter on mount: `/api/openapi.json?v=<timestamp>`
- Uses Vue's `onMounted` hook to set URL once per page load

**3. Why This Approach:**
- API route has server-side no-cache headers (prevents HTTP caching)
- Timestamp query parameter prevents client-side JavaScript caching
- Works from VitePress base path `/docs/` because `/api/openapi.json` is absolute
- Next.js API routes work reliably on Netlify with `@netlify/plugin-nextjs`
- No rebuild needed when spec changes - just regenerate JSON with `npm run docs:openapi`

**4. File Locations:**
- Source: `openapi.yaml`
- Generated: `public/docs/openapi.json` and `docs/openapi.json`
- Served from: `/api/openapi.json` (Next.js API route with no-cache headers)

**Note**: The API route is preferred over static file serving because it provides consistent no-cache headers and works reliably across different deployment scenarios.

**To verify**: `curl -I "http://localhost:3000/api/openapi.json?v=test"`

---

## ⚠️ CRITICAL: YAML is Source of Truth

**ALWAYS edit `openapi.yaml` - NEVER edit `openapi.json` directly.**

### The Problem

The JSON file is auto-generated from YAML. If you edit `openapi.json` directly:
- Changes will be lost on next regeneration
- JSON and YAML will be out of sync
- Other developers may not see your changes

### Correct Workflow

1. **Edit**: `openapi.yaml` (project root)
2. **Regenerate**: `npm run docs:openapi` → Creates JSON files
3. **Rebuild docs**: `npm run docs:build` → Updates playground and static docs
4. **Verify**: Check the OpenAPI playground reflects your changes

### File Locations

| File | Purpose | Edit? |
|------|---------|-------|
| `openapi.yaml` | Source of truth | ✅ YES |
| `public/docs/openapi.json` | Generated for API route | ❌ NO |
| `docs/public/openapi.json` | Generated for VitePress | ❌ NO |
| `docs/openapi.json` | Generated for build | ❌ NO |

### Regeneration Commands

```bash
# Regenerate JSON from YAML
npm run docs:openapi

# Full rebuild (includes JSON regeneration)
npm run docs:build
```

---

## ⚠️ CRITICAL: Enum Ordering Consistency

**`pitchClassDataType` enum order MUST match the UI filter order.**

### Why This Matters

- OpenAPI playground dropdown shows options in enum order
- Users expect consistency between UI and API
- Reduces confusion when switching between app and API

### Correct Order (Matches UI Filter)

```yaml
# Standard endpoints (14 options)
enum: [all, abjadName, englishName, solfege, fraction, cents, centsDeviation, decimalRatio, stringLength, fretDivision, midiNoteNumber, midiNoteDeviation, frequency, referenceNoteName]

# 12-pitch-class-sets endpoint (15 options - includes relativeCents)
enum:
  - all
  - abjadName
  - englishName
  - solfege
  - fraction
  - cents
  - centsDeviation
  - decimalRatio
  - stringLength
  - fretDivision
  - midiNoteNumber
  - midiNoteDeviation
  - frequency
  - referenceNoteName
  - relativeCents
```

### UI Filter Reference

The order comes from the filter menu in components like `jins-transpositions.tsx`:

```typescript
// Filter order matches table row appearance order
{[
  "abjadName",
  "englishName",
  "solfege",
  "fraction",
  "cents",
  "centsFromZero",  // UI-only (calculated client-side)
  "centsDeviation",
  "decimalRatio",
  "stringLength",
  "fretDivision",
  "midiNote",       // → midiNoteNumber in API
  "midiNoteDeviation",
  "frequency",
]}
```

### When Adding New Pitch Class Data Types

1. Add to UI filter array first (in `jins-transpositions.tsx`, `maqam-transpositions.tsx`)
2. Add to `FilterSettings` interface in `filter-context.tsx`
3. Add to ALL `pitchClassDataType` enums in `openapi.yaml` in the same position
4. Add to `validPitchClassDataTypes` arrays in API route files
5. Regenerate docs: `npm run docs:build`

---

## ⚠️ CRITICAL: Terminology Consistency

**ALWAYS use "pitch class" (never just "pitch") when referring to pitch-related data.**

- ✅ CORRECT: "pitch class data", "pitch class calculations", "pitch class data formats"
- ❌ WRONG: "pitch data", "pitch calculations", "pitch-data formats"

**Rationale**: "pitch class" is the precise musicological term used throughout the codebase and scholarly literature. Using "pitch" alone is ambiguous.

**Applies to:**
- All endpoint descriptions
- All parameter descriptions
- All schema property descriptions
- All error messages
- All documentation text

---

## ⚠️ CRITICAL: URL-Safe Values Only

**ALL enum values, examples, and valid value lists in OpenAPI specification MUST use URL-safe format.**

### Rules

**Never use display values** (with diacritics, spaces, or special characters) in:
- Parameter `enum` lists
- Parameter `example` values
- Response example values that represent IDs or identifiers
- Any value that appears in API playground dropdowns

**Always use URL-safe values:**
- Remove diacritics (ʿ, ʾ, ā, ū, ī, etc.)
- Replace spaces with underscores (`_`)
- Use lowercase
- Match the format returned by `standardizeText()` function

### Rationale

- API uses `standardizeText()` internally to convert filter values
- Users must send URL-safe values in query parameters and path segments
- Playground/dropdowns must show what users should actually send
- Prevents confusion between display values (reading) and API values (sending)

### Examples

```yaml
# ❌ WRONG - Display value with diacritics
enum:
  - rāst
  - dūgāh
  - ʿushayrān
example: rāst

# ✅ CORRECT - URL-safe value
enum:
  - rast
  - dugah
  - ushayran
example: rast
```

### How to Get URL-Safe Values

- Query the API endpoint to get actual `familyId` and `tonicId` values
- Use `curl` and `jq` to extract unique values:
  ```bash
  curl -s http://localhost:3000/api/maqamat | jq '[.data[].familyId] | unique'
  ```
- Match what the API endpoint actually accepts, not what it displays

---

## API Documentation Description Standards

### 1. Use Natural Language

- ✅ GOOD: "Transpose the maqām to a different tonic"
- ❌ BAD: "Use the `transposeTo` parameter to transpose"

### 2. Be Comprehensive

- Include what data is returned, options available, and why things matter
- Explain musicological context when relevant
- Example: Starting notes represent different theoretical frameworks

### 3. Avoid Unnecessary Parameter References

- Endpoint descriptions should NOT reference parameter names unless necessary
- Parameter descriptions CAN reference parameter names for clarity
- Use natural language describing functionality, not syntax

### 4. Terminology

- Always use "pitch class" not "pitch"
- Use precise musical terms consistently
- Clarify URL-safe vs display values when relevant

### 5. Recent Parameter Name Changes

- `transpose` → `transposeTo` (more explicit)
- `includeLowerOctaveModulations` → `includeModulations8vb` (standard musical notation)
- Path parameter `{id}` → `{idName}` (reflects URL-safe identifier used)

### 6. Consistency

- All descriptions follow same style and detail level
- Maintain consistent tone throughout

### 7. Semantic Clarity

- Avoid ambiguous phrases like "listed by their tonics" (whose tonics?)
- Be explicit: "organized by maqām degree note names"
- Clearly state what keys/indexes represent
- **Always use "maqām degree" not "scale degree"** - aligns with Arabic music theory

---

## ⚠️ CRITICAL: Parameter Description Standards

**ALL parameter descriptions must follow these consistency rules:**

### 1. Parameter Name References

- ❌ NEVER include parameter name in backticks (e.g., `` `idName` ``)
- ✅ Exception: Only reference when clarifying relationships between parameters
- ✅ Reason: Names visible in UI; descriptions explain purpose, not syntax

**Example:**
- ❌ WRONG: "URL-safe maqām identifier (`` `idName` ``)"
- ✅ CORRECT: "URL-safe maqām identifier"

### 2. Technical Constraints Format

- ✅ ALWAYS use consistent format: `(URL-safe, diacritics-insensitive)` in parentheses at end
- ✅ Include ALL applicable constraints
- ✅ Apply consistently across all similar parameters

**Format Pattern**: `[Description text] (constraint1, constraint2, constraint3)`

**Examples:**
- ✅ CORRECT: "Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive)"
- ✅ CORRECT: "Tuning system starting note name (URL-safe, diacritics-insensitive)"
- ❌ WRONG: "URL-safe maqām identifier" (constraints should be in parentheses)

### 3. Description Structure (Voice)

- ✅ Query parameters: Use action-oriented descriptions
- ✅ Path parameters: Noun phrase format acceptable

**Pattern**: `[Verb/Action] [object/what] [optional: constraints in parentheses]`

**Examples:**
- ✅ CORRECT: "Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive)"
- ✅ CORRECT: "Transpose the maqām to a specific tonic note (URL-safe, diacritics-insensitive)"
- ✅ CORRECT: "URL-safe maqām identifier" (path parameter - noun phrase OK)
- ❌ WRONG: "Maqām family filter" (should be action-oriented for query params)

### 4. Detail Level Guidelines

**DEFAULT**: Single-line descriptions for simple parameters

**Multi-line ONLY when:**
- Parameter critical to understanding (explain why it matters)
- Parameter name doesn't fully convey purpose
- Parameter has non-obvious behavior

**Examples:**
- ✅ Single-line: "Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive)"
- ✅ Multi-line needed: `startingNote` - explains theoretical frameworks significance
- ✅ Multi-line needed: `pitchClassDataType` - explains format options and defaults

### 5. Context Explanation

**Explain context when:**
- Parameter has theoretical/cultural significance
- Multiple valid values exist for non-obvious reasons
- Parameter affects fundamental behavior

**Keep brief unless context adds significant value**

**Examples:**
- ✅ `tuningSystem`: "Identifies the historical tuning system (e.g., 'IbnSina-(1037)', '12-EDO')"
- ✅ `startingNote`: Multi-line justified - explains theoretical significance

### 6. Boolean Flag Parameters

**Consistent format**: Start with "Include" or "When true/When false" pattern

**Examples:**
- ✅ CORRECT: "Include interval data between maqām degrees"
- ✅ CORRECT: "Include modulation possibilities to other maqāmāt and ajnās"
- ✅ CORRECT: "When true, returns available parameter options instead of maqām data"

### 7. Identifier Parameters

- ✅ Always mention "identifier" clearly
- ✅ Include technical constraints if applicable
- ✅ Add examples or context when format isn't obvious
- ✅ **CRITICAL: All examples MUST use actual IDs from data** - verify against API or data files
- ✅ **NEVER use hypothetical examples** - check what exists first

**Examples:**
- ✅ CORRECT: "Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)')"
- ❌ WRONG: "Tuning system identifier (e.g., 'IbnSina-(1037)', '12-EDO')" - '12-EDO' is display name, not ID
- ✅ CORRECT: "URL-safe maqām identifier" (path parameter)

### Parameter Description Checklist

- [ ] No parameter name in backticks (unless clarifying relationships)
- [ ] Technical constraints in parentheses at end (if applicable)
- [ ] All applicable constraints listed
- [ ] Action-oriented for query params, noun phrase OK for path params
- [ ] Appropriate detail level (single-line default, multi-line only if needed)
- [ ] Context explained when parameter has theoretical/cultural significance
- [ ] Consistent with similar parameters across all endpoints

---

## ⚠️ CRITICAL: Options Parameter Pattern

**The `options` parameter enables parameter discovery and should be used where it provides value.**

### When to Use

- ✅ Endpoints with context-dependent valid values
- ✅ Endpoints with dynamically calculated options
- ✅ Endpoints with many parameters
- ✅ Endpoints where starting values matter

### Mutually Exclusive Pattern (REST Best Practice)

When `options=true` changes endpoint's purpose (metadata discovery vs data retrieval), it should be **mutually exclusive** with data-returning parameters:

- ✅ **Require contextual parameters** (`tuningSystem`, `startingNote`) - fundamental to all calculations
- ❌ **Return 400 error for data-returning parameters** (`transposeTo`, `includeModulations`, etc.)
- ❌ **Return 400 if required parameters missing**
- ❌ **NO default values for required parameters** in discovery responses

### Implementation Pattern

```typescript
if (showOptions) {
  // Check for conflicting data-returning parameters
  const conflictingParams: string[] = [];
  if (transposeToNote) conflictingParams.push("transposeTo");
  if (includeModulations) conflictingParams.push("includeModulations");

  // Return 400 error for conflicts (REST best practice)
  if (conflictingParams.length > 0) {
    return NextResponse.json(
      {
        error: "Conflicting parameters with options=true",
        message: `Cannot use with options=true: ${conflictingParams.join(", ")}`,
        hint: "Remove data-returning parameters for discovery mode, or remove options=true for data",
        conflictingParameters: conflictingParams,
        contextualParametersAllowed: ["tuningSystem", "startingNote"]
      },
      { status: 400 }
    );
  }

  // Require contextual parameters (required in ALL cases)
  if (!tuningSystemId) {
    return NextResponse.json(
      {
        error: "tuningSystem parameter is required",
        message: "Required for all requests (both data retrieval and discovery mode)",
        hint: `Add &tuningSystem=IbnSina-(1037)`,
        availabilityUrl: `/api/maqamat/${maqamId}/availability`
      },
      { status: 400 }
    );
  }

  // Calculate and return discovery options
  return NextResponse.json({
    availableParameters: {
      tuningSystem: { required: true, description: "..." },
      startingNote: {
        options: startingNoteOptions,
        required: true,
        description: "Required for all requests"
      },
      transposeTo: {
        options: transposeOptions,
        description: "Calculated based on tuningSystem and startingNote"
      }
      // NO defaults for required parameters
    }
  });
}
```

### Rationale

- Discovery mode = metadata about parameters
- Data mode = actual entity data
- Fundamentally different responses shouldn't mix
- **400 error is REST best practice** - warnings might not be seen
- Errors provide immediate feedback and prevent silent failures

---

## Static API Documentation Generation

**The API documentation is generated in two formats: interactive (playground) and static (index) for LLM consumption.**

### Dual Documentation System

**1. Interactive Documentation** (`docs/api/playground.md`):
- Uses `<OASpec>` Vue component to dynamically render OpenAPI spec
- Provides interactive testing interface
- Loads spec from `/openapi.json` at runtime
- Best for human users exploring the API

**2. Static Documentation** (`docs/api/index.md`):
- Generated as static markdown from OpenAPI spec
- Perfect for LLM consumption (no JavaScript required)
- Contains all endpoint details, parameters, examples
- Automatically generated from `openapi.yaml`

### Generation Script

**Location**: `scripts/generate-api-docs.js`

**Purpose**: Converts OpenAPI YAML specification into comprehensive static markdown documentation.

**What it generates**:
- Complete endpoint documentation with descriptions
- All parameters (path and query) with types, defaults, examples
- Example curl commands for each endpoint
- Response descriptions
- Organized by resource type (Maqāmāt, Ajnās, Tuning Systems, etc.)

**How it works**:
1. Reads `openapi.yaml` from project root
2. Parses OpenAPI 3.1.0 specification
3. Groups endpoints by tags
4. Generates markdown for each endpoint with:
   - HTTP method and path
   - Description (preserves multi-line formatting)
   - Path parameters with examples
   - Query parameters with types, enums, defaults
   - Example curl commands (includes required params + key optional params)
   - Response descriptions

**Key Features**:
- Handles multi-line parameter descriptions intelligently
- Truncates long enum lists (shows first 5, indicates total count)
- Generates realistic example URLs with actual parameter values
- Preserves all formatting and structure from OpenAPI spec
- Maintains consistency with playground.md content

### Build Integration

**Scripts**:
```bash
# Generate static API documentation
npm run docs:api

# Full documentation build (includes API docs)
npm run docs:build
# → Runs: docs:openapi → docs:api → vitepress build
```

**Automatic generation**:
- Runs automatically in `docs:dev` and `docs:build` scripts
- Ensures `index.md` stays in sync with `openapi.yaml`
- No manual editing of `index.md` needed

**File locations**:
- Source: `openapi.yaml` (project root)
- Generated: `docs/api/index.md`
- Interactive: `docs/api/playground.md` (uses OASpec component)

### Synchronization

**Both documentation formats stay in sync because**:
- Both are generated from the same source (`openapi.yaml`)
- Changes to OpenAPI spec automatically reflected in both
- Static markdown preserves all content from interactive version
- Same endpoint descriptions, parameters, examples

**When to regenerate**:
- After modifying `openapi.yaml`
- After adding new endpoints
- After changing parameter descriptions
- Before committing OpenAPI changes

**Workflow**:
1. Edit `openapi.yaml`
2. Run `npm run docs:openapi` (generates JSON)
3. Run `npm run docs:api` (generates static markdown)
4. Both `index.md` and `playground.md` now reflect changes

### LLM Optimization

**Why static markdown for LLMs**:
- ✅ No JavaScript execution required
- ✅ Complete content in single file
- ✅ Easy to parse and index
- ✅ All endpoint details preserved
- ✅ Example commands included

**vitepress-plugin-llms integration**:
- Plugin processes `index.md` during build
- Generates `llms.txt` and `llms-full.txt` files
- Provides additional LLM-optimized formats
- Configured to ignore `playground.md` (interactive only)

**Result**: LLMs can access API documentation in multiple formats:
1. Direct markdown: `/docs/api/` (static `index.md`)
2. LLM-optimized text: `/docs/llms.txt` and `/docs/llms-full.txt`
3. Interactive playground: `/docs/api/playground` (for humans)

### Maintenance Guidelines

**When modifying the generation script**:
- Preserve existing markdown structure
- Maintain consistency with playground.md output
- Test with full OpenAPI spec to ensure all endpoints included
- Verify example URLs are valid and realistic

**When updating OpenAPI spec**:
- Always regenerate documentation after changes
- Verify both `index.md` and `playground.md` reflect updates
- Check that example values match actual API responses
- Ensure parameter descriptions follow formatting standards

**Troubleshooting**:
- If `index.md` is out of sync: Run `npm run docs:api`
- If examples are wrong: Check `openapi.yaml` examples match actual data
- If formatting is broken: Check script handles multi-line descriptions correctly

---

## Summary

### Critical Rules

1. **Edit YAML, not JSON** - `openapi.yaml` is source of truth; JSON is auto-generated
2. **Enum order matches UI** - `pitchClassDataType` enums follow UI filter order
3. **Never document PUT endpoints** in OpenAPI
4. **Always use "pitch class"** not "pitch"
5. **URL-safe values only** in enums and examples
6. **Consistent parameter descriptions** across all endpoints
7. **Options parameter mutually exclusive** with data parameters
8. **Verify all examples** against actual data
9. **No default values** for required parameters in discovery mode
10. **Regenerate after changes** - Run `npm run docs:openapi` then `npm run docs:build`

### Quick Checklist

When adding/modifying OpenAPI documentation:

- [ ] Editing `openapi.yaml` (NOT JSON files)
- [ ] `pitchClassDataType` enum order matches UI filter order
- [ ] PUT endpoints not documented
- [ ] "pitch class" terminology used consistently
- [ ] All enums and examples URL-safe
- [ ] Parameter descriptions follow format standards
- [ ] Technical constraints in parentheses
- [ ] Examples verified against actual data
- [ ] Multi-line descriptions only when needed
- [ ] Boolean flags start with "Include" or "When"
- [ ] Options parameter properly implemented
- [ ] Regenerated JSON: `npm run docs:openapi`
- [ ] Rebuilt docs: `npm run docs:build`

**Apply these standards to maintain high-quality, consistent API documentation.**
