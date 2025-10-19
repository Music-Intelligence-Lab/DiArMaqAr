# Documentation Standards

**Cultural-linguistic accuracy and technical precision in documentation**

---

## Core Principle

Documentation must reflect **decolonial computing principles** by treating Arabic terminology as primary, not requiring Western translation for legitimacy, and avoiding Anglo-European-centric framing.

---

## Cultural-Linguistic Accuracy

### Eliminate Parenthetical English Definitions

**Pattern to Avoid**: Parenthetical explanations using Western music terminology after Arabic terms.

#### ❌ Incorrect Examples

```markdown
- "maqāmāt (scales), ajnās (melodic genera)"
- "Melodic genera (building blocks of maqāmāt)"
- "Total count of distinct maqāmāt (scales) in the database"
- "ṣuʿūd (ascending) and hubūṭ (descending)"
```

#### ✅ Correct Examples

```markdown
- "maqāmāt and ajnās"
- "Ajnās that form the basis of maqāmāt"
- "Total count of distinct maqāmāt in the database"
- "Ascending (ṣuʿūd) and descending (hubūṭ) sequences"
```

### Rationale

Parenthetical definitions frame Arabic terms as deviations from a Western default, requiring English translation for understanding. Removing them:
- Treats Arabic terminology as primary and self-contained
- Trusts readers to understand through context and fuller documentation sections
- Respects the independent theoretical framework of Arabic maqām theory

---

## Documentation Architecture

### Progressive Disclosure

Structure documentation for different reader needs:

**1. Quick Start (2-3 minutes)**
- Essential facts without detailed definitions
- What the system does
- How to navigate basic features

**2. Common Tasks (5-10 minutes)**
- Navigation patterns with concrete examples
- Step-by-step workflows
- Quick reference tables

**3. Detailed Reference (ongoing)**
- Property tables with comprehensive descriptions
- Technical specifications
- Implementation details

**4. Real Data Examples**
- Always use actual export data
- Never hypothetical or generic examples
- Verify against real files before documenting

---

## Property Documentation

### Use Property Reference Tables

**Preferred format** for documenting data structures:

```markdown
| Property | Type | Description |
|----------|------|-------------|
| `propertyName` | `string` | Clear, specific description referencing actual data structure |
| `optionalProperty?` | `number` | Description (present only for jins and maqam types) |
| ⭐ `coreProperty` | `object` | Core property needed for basic understanding |
```

**Guidelines:**
- Describe WHAT the property contains, not assumptions about usage
- Mark optional properties explicitly with conditions (when/where they appear)
- Use ⭐ marker for "core properties" essential for basic understanding
- Include examples showing actual values from real data
- For complex properties, reference dedicated sections rather than inline explanation

---

## Terminology Precision

### Replace Vague Language with Specifics

#### ❌ Vague Terms

```markdown
- "frequencies" → could mean Hz, ratios, string lengths
- "intervals" → which type? cents? ratios? pitch class distances?
- "scale" → implies Western music theory framework
- "melodic fragments" → generic description
```

#### ✅ Specific Terms

```markdown
- "fractions, cents, string lengths" (actual properties)
- "pitch class intervals arrays" (specific structure)
- "maqām" (proper terminology)
- "ajnās" (canonical term)
```

### Avoid Western Music Theory Framing

**Don't use without cultural context:**
- "major", "minor"
- "semitone", "tone"
- "mode" (unless specifically discussing Western modal theory)
- "scale degree" (use "scale degree" with Arabic context)
- "microtonal" (NEVER - see terminology standards)

**Don't compare intervals to 12-EDO** unless explicitly discussing compatibility:
- ❌ "9/8 = major tone"
- ✅ "9/8", "3/2" (neutral examples)

---

## Real Data Integration

### Verification Protocol

**All documentation examples MUST be from actual export files:**

1. **Locate Relevant Export**
   ```bash
   # Find export file
   ls exports/ | grep "IbnSina"
   # → IbnSina-(1037)_(ʿushayrān)_ajnās_maqāmāt.json
   ```

2. **Extract Exact Data**
   - Don't approximate or generalize
   - Use actual property names and values
   - Preserve JSON formatting

3. **Verify Order and Structure**
   - Ensure order matches export structure
   - Check nested object hierarchies
   - Validate all property names exist

4. **Document Source**
   - For complex examples, include file name and line numbers
   - Makes it easy for readers to find in their own exports

### Example Quality Standards

```json
// ✅ Good example - real data, proper structure
{
  "exportInfo": {
    "timestamp": "2025-10-19T14:23:45.123Z",
    "tuningSystem": "Ibn Sīnā (1037)",
    "startingNote": "ʿushayrān"
  },
  "tuningSystemData": {
    "name": {
      "en": "Ibn Sīnā (1037)",
      "ar": "ابن سينا (١٠٣٧)"
    },
    // ...
  }
}

// ✅ Use compression notation for large arrays
"pitchClasses": [
  { /* pitch class 1 */ },
  { /* pitch class 2 */ },
  // ... 45 more pitch classes
]

// ❌ Don't use fake/approximated data
{
  "exportInfo": {
    "timestamp": "some timestamp",  // ❌ vague
    "tuningSystem": "Example System"  // ❌ not real
  }
}
```

---

## Version Property Documentation

**Template for hierarchical version tracking:**

Documentation should explain version properties at all levels:

```markdown
### Version Tracking

Version properties track when data was last modified at each hierarchical level:

- **Level 1**: `exportInfo.timestamp` - When export was generated (ISO 8601 format)
- **Level 2**: `tuningSystemData.version` - When tuning system definition was last modified
- **Level 3**: `allAjnasData[jins].version` - When specific jins was last modified
- **Level 4**: `allMaqamatData[maqam].suyur[].version` - When specific sayr was last modified

This hierarchical versioning enables tracking changes at different granularities.
```

---

## Octave System Documentation

### Always Include Cultural Context

**Required elements:**

1. **Cultural Background**
   ```markdown
   Arabic maqām theory traditionally spans 2 octaves from qarār (low) to 
   jawāb (high). This system extends to 4 octaves for comprehensive analysis 
   and broader instrument compatibility.
   ```

2. **System Rationale**
   - Why 4 octaves (not 2)
   - Practical benefits
   - Relationship to traditional 2-octave span

3. **Reference Table**
   
   | Octave | Arabic Term | Prefix | Example |
   |--------|-------------|--------|---------|
   | 1 | qarār | None | dūgāh |
   | 2 | ʿushayrān | None | dūgāh |
   | 3 | jawāb | _j | dūgāh_j |
   | 4 | jawāb jawāb | _jj | dūgāh_jj |

4. **Arabic Terminology**
   - Use proper diacritics
   - Provide transliterations
   - Don't require English equivalents

---

## API Documentation Standards

### Swagger Documentation Required

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Brief one-line description
 *     description: |
 *       Detailed description including:
 *       - What the endpoint does
 *       - Cultural/musicological context if relevant
 *       - Default behavior
 *     parameters:
 *       - name: requiredParam
 *         required: true
 *         description: Clear description with valid examples
 *         schema:
 *           type: string
 *           example: "al-Farabi-(950g)"
 *     responses:
 *       200:
 *         description: Success response with example
 *       400:
 *         description: Bad request - explain validation
 *       404:
 *         description: Not found - explain what wasn't found
 */
```

### API Example Requirements

- **Verified IDs**: Use actual IDs from data files
- **Complete examples**: Show full request/response structure
- **Default behavior**: Explicitly document what happens when optional parameters omitted
- **Error cases**: Document common error scenarios

---

## Common Documentation Pitfalls

### ❌ Pitfalls to Avoid

1. **Assuming English definitions are helpful**
   - Arabic terms need context, not Western music equivalents

2. **Mixing theoretical frameworks**
   - Don't compare to 12-EDO unless explicitly discussing compatibility

3. **Vague property references**
   - Always reference actual data properties, not generic categories

4. **Incomplete optional field documentation**
   - Mark optional fields and state presence conditions

5. **Inconsistent example formatting**
   - Use Property Reference Tables throughout, not mixed inline+table

6. **Hallucinated data structure**
   - Verify every property description against actual export files

7. **Missing version documentation**
   - Document timestamps at all hierarchical levels

8. **Parenthetical translations**
   - Let Arabic terminology stand as primary

---

## JSDoc Standards for Code

### Function Documentation

```typescript
/**
 * Calculates all valid transpositions of a jins within a tuning system.
 * 
 * Uses pattern matching to find all starting positions where the jins
 * intervals can be constructed within the cents tolerance. This respects
 * the independence of Arabic maqām theory from Western tuning systems.
 * 
 * @param pitchClasses - Available pitch classes from the tuning system
 * @param jinsData - Abstract jins definition (tuning-system independent)
 * @param tolerance - Cents tolerance for pattern matching (default: 5)
 * @returns Array of Jins instances, one per valid transposition
 * 
 * @remarks
 * Transposition availability depends entirely on the tuning system's
 * pitch class inventory. The same jins may have different numbers of
 * valid transpositions across different historical tuning systems.
 * 
 * @example
 * ```typescript
 * const pitchClasses = getTuningSystemPitchClasses(
 *   tuningSystem, 
 *   "ʿushayrān", 
 *   440
 * );
 * const transpositions = calculateJinsTranspositions(
 *   pitchClasses,
 *   jinsRast,
 *   5
 * );
 * console.log(`Found ${transpositions.length} valid transpositions`);
 * ```
 */
function calculateJinsTranspositions(
  pitchClasses: PitchClass[],
  jinsData: JinsData,
  tolerance: number = 5
): Jins[] {
  // Implementation
}
```

### Model/Class Documentation

```typescript
/**
 * Represents a concrete realization of a jins (melodic fragment) within
 * a specific tuning system, starting from a specific pitch class.
 * 
 * Jins are the fundamental building blocks of Arabic maqām theory,
 * representing melodic fragments (typically 3-5 notes) with specific
 * intervallic relationships. This class represents the "taswir"
 * (transposed form) of an abstract jins definition.
 * 
 * @remarks
 * Unlike Western melodic patterns, ajnās (plural of jins) are defined
 * by their intervallic relationships rather than absolute pitches,
 * and can be realized differently in different historical tuning systems.
 */
class Jins {
  // Implementation
}
```

---

## Validation Checklist

Before publishing documentation:

- [ ] No parenthetical English definitions after Arabic terms
- [ ] All examples sourced from real export files (verified)
- [ ] All properties match actual data structure
- [ ] Optional fields clearly marked with presence conditions
- [ ] "Frequencies" replaced with specific properties (fractions/cents/string lengths)
- [ ] "Intervals" disambiguated with full property references
- [ ] Version timestamps documented at all hierarchical levels
- [ ] Table of contents links all validate
- [ ] Arabic terminology consistent and properly formatted (diacritics)
- [ ] No Western music theory defaults assumed
- [ ] Cultural context preserved in explanations
- [ ] No hallucinated properties or structures
- [ ] Property Reference Tables used consistently
- [ ] JSDoc comments complete for all public APIs
- [ ] Swagger documentation for all API endpoints

---

## Quarterly Review Protocol

**Documentation should be reviewed quarterly to ensure:**

1. Examples remain current with latest export format
2. Property descriptions match current codebase
3. Cultural framing remains respectful and accurate
4. New patterns discovered in development are documented
5. Deprecated features are removed
6. Links and cross-references are valid

---

## Examples of Well-Documented Sections

### ✅ Good Property Table

| Property | Type | Description |
|----------|------|-------------|
| ⭐ `name` | `object` | Bilingual name of the tuning system |
| ⭐ `name.en` | `string` | English name (e.g., "al-Fārābī (950g)") |
| ⭐ `name.ar` | `string` | Arabic name (e.g., "الفارابي (٩٥٠ غ)") |
| `version` | `string` | ISO 8601 timestamp of last modification |
| `pitchClassValues` | `string[]` | Array of pitch class values as ratio/cents/string length strings |
| `noteNameSets` | `object` | Maps each note name to its pitch class index |
| `referenceFrequencies` | `object` | Available reference frequencies for A4 (e.g., 440 Hz) |
| `defaultReferenceFrequency` | `number` | Default A4 frequency for this system |
| `sources` | `string[]` | Array of source IDs referencing `sources.json` |

### ✅ Good Cultural Context

```markdown
### Starting Note Significance

Different starting points represent fundamentally different theoretical 
approaches in Arabic maqām theory, not simple transpositions:

- **ʿushayrān**: Oud tuning traditions based on perfect fourths
- **yegāh**: Monochord/sonometer measurements (mathematical approach)
- **rāst**: Established theoretical frameworks (pedagogical approach)

These starting points affect:
- Mathematical interval relationships
- Available maqāmāt within the system
- Modulation possibilities
- Cultural and historical context
```

### ✅ Good Real Data Example

```json
// From: IbnSina-(1037)_(ʿushayrān)_ajnās_maqāmāt.json
// Lines 45-72

"jins_rast": {
  "name": {
    "en": "Jins Rast",
    "ar": "جنس راست"
  },
  "noteNames": ["rāst", "dūgāh", "sikāh", "jahārkāh"],
  "intervalRatios": ["1/1", "9/8", "81/64", "4/3"],
  "intervalCents": [0, 204, 408, 498],
  "pitchClasses": [
    {
      "noteName": "rāst",
      "frequency": 293.66,
      "cents": 0,
      "midi": 62.00
    },
    // ... 3 more pitch classes
  ],
  "type": "jins",
  "version": "2025-03-15T10:30:00.000Z"
}
```

---

*This documentation should evolve with the project, maintaining cultural sensitivity and technical precision.*
