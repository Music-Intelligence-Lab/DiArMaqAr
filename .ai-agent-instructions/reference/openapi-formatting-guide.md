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

**The OpenAPI JSON file is served from `/docs/openapi.json` with strict no-cache headers.**

### Key Implementation Details

**1. Route Handler**: `src/app/docs/[[...slug]]/route.ts`
- Serves the JSON file from `public/docs/openapi.json` when requested as `/docs/openapi.json`
- Sets strict no-cache headers: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`
- Includes file modification time in ETag header
- Works for both static file serving and Next.js route handling

**2. VitePress Integration**: `docs/api/index.md`
- Uses `<OASpec :spec-url="openApiUrl" />` component with dynamic URL
- Generates URL with timestamp query parameter on mount: `/docs/openapi.json?v=<timestamp>`
- Uses Vue's `onMounted` hook to set URL once per page load

**3. Why This Approach:**
- Works with static file serving on Netlify (file exists at `public/docs/openapi.json`)
- Route handler provides no-cache headers when served through Next.js
- Timestamp query parameter prevents client-side JavaScript caching
- Works from VitePress base path `/docs/` because `/docs/openapi.json` is absolute
- No rebuild needed when spec changes - just regenerate JSON with `npm run docs:openapi`

**4. File Locations:**
- Source: `openapi.yaml`
- Generated: `public/docs/openapi.json` and `docs/openapi.json`
- Served from: `/docs/openapi.json` (accessible as static file or via Next.js route handler)

**Note**: On Netlify, the file is served as a static file from `public/docs/openapi.json`, which works correctly for the documentation pages.

**To verify**: `curl -I "http://localhost:3000/docs/openapi.json?v=test"`

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

## Summary

### Critical Rules

1. **Never document PUT endpoints** in OpenAPI
2. **Always use "pitch class"** not "pitch"
3. **URL-safe values only** in enums and examples
4. **Consistent parameter descriptions** across all endpoints
5. **Options parameter mutually exclusive** with data parameters
6. **Verify all examples** against actual data
7. **No default values** for required parameters in discovery mode

### Quick Checklist

When adding/modifying OpenAPI documentation:

- [ ] PUT endpoints not documented
- [ ] "pitch class" terminology used consistently
- [ ] All enums and examples URL-safe
- [ ] Parameter descriptions follow format standards
- [ ] Technical constraints in parentheses
- [ ] Examples verified against actual data
- [ ] Multi-line descriptions only when needed
- [ ] Boolean flags start with "Include" or "When"
- [ ] Options parameter properly implemented

**Apply these standards to maintain high-quality, consistent API documentation.**
