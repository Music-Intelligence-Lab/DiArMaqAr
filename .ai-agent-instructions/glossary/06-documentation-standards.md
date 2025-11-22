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

### Arabic Terms as Primary (Not Parenthetical)

**CRITICAL**: When introducing Arabic terminology, make the Arabic term the primary subject, not a parenthetical clarification.

**⚠️ MOST CRITICAL: Check ALL prominent locations**

The Arabic-as-primary principle must be applied to **ALL** locations, especially the most visible ones:

1. **Frontmatter `title:`** - Page metadata shown in browser tabs, search results
2. **H1 headers (`#`)** - Main page title
3. **H2/H3 section headers (`##`, `###`)** - All section titles
4. **Opening sentences** - First sentences of sections
5. **Prose throughout** - All body text

**Common oversight**: Fixing prose content but missing frontmatter and headers!

#### ❌ Incorrect - English as Primary

```markdown
---
title: Tuning Systems (Tanāghīm)
---

# Tuning Systems (Tanāghīm)

## What is a Tuning System?

A tuning system (tanghīm, plural: tanāghīm) is an ordered sequence...
Tuning systems are the foundational layer...
The maqam (Arabic: maqām) is a modal framework...
```

These patterns frame English as primary and Arabic as supplementary translation.

#### ✅ Correct - Arabic as Primary

```markdown
---
title: Tanāghīm (Tuning Systems)
description: Understanding tanāghīm (tuning systems)...
---

# Tanāghīm (Tuning Systems)

## What is a Tanghīm?

A tanghīm (tuning system, plural: tanāghīm) is an ordered sequence...
Tanāghīm (tuning systems) are the foundational layer...
The maqām (مقام) is a modal framework...
```

**Pattern**: `[Arabic term] ([English equivalent if needed])` NOT `[English term] ([Arabic term])`

**Rationale**:
- Establishes Arabic terminology as the authoritative framework
- Treats English as the translation/approximation, not the standard
- Aligns with decolonial computing principles of epistemic delinking
- Respects the theoretical integrity of Arabic maqām theory

**Exception**: In contexts where the audience is explicitly English-speaking and unfamiliar with Arabic terminology, you may introduce both: "The tanāghīm (tuning systems) provide..." But even here, Arabic comes first.

### Introduce Once, Then Use Arabic Only

**CRITICAL PATTERN**: Eliminate redundancy by introducing terms completely once, then using only Arabic thereafter.

**The Pattern:**

1. **Header with English**: `# Tanāghīm (Tuning Systems)`
2. **First complete introduction**: `A tanghīm (tuning system; plural: tanāghīm, tuning systems) is...`
   - Includes singular Arabic + singular English + plural Arabic + plural English
   - Format: `singular_arabic (singular_english; plural: plural_arabic, plural_english)`
3. **All subsequent uses**: ONLY Arabic - "tanghīm" or "tanāghīm"
   - NO more "(tuning system)" or "(tuning systems)"

**Why this matters:**
- Avoids repetitive English translations
- Reinforces Arabic terminology as primary
- Makes documentation more concise and readable
- Trusts readers to learn and remember Arabic terms

#### ❌ Incorrect - Redundant English Throughout

```markdown
# Tanāghīm (Tuning Systems)

A tanghīm (tuning system, plural: tanāghīm) is an ordered sequence...
     ❌ WRONG - missing plural English translation

DiArMaqAr integrates tuning systems from the medieval period...

Each tuning system includes complete source attribution...

In DiArMaqAr, tuning systems are expanded across multiple registers...

## Using Tuning Systems

Every tuning system includes bibliographic references...
```

**Problem**: English "tuning system(s)" repeated unnecessarily after the first complete introduction.

#### ✅ Correct - Introduce Once, Then Arabic Only

```markdown
# Tanāghīm (Tuning Systems)

A tanghīm (tuning system; plural: tanāghīm, tuning systems) is an ordered sequence...
     ✅ CORRECT - shows both singular and plural with English for each

DiArMaqAr integrates tanāghīm from the medieval period...

Each tanghīm includes complete source attribution...

In DiArMaqAr, tanāghīm are expanded across multiple registers...

## Using Tanāghīm

Every tanghīm includes bibliographic references...
```

**Correct**: After the complete introduction at line 3, all subsequent uses are Arabic only.

**Scope of "introduction":**
- The complete introduction (singular + English + plural) happens ONCE per document
- Not once per section - ONCE for the entire document
- After that, Arabic only throughout the rest of the document

### Headings and Titles

**CRITICAL**: Do not use parenthetical English definitions in headings, section titles, or page titles.

#### ❌ Incorrect Heading Examples

```markdown
### 2. Ajnās (Tetrachords/Tri-chords)
### 3. Maqāmāt (Melodic Modes)
### 4. Suyūr (Melodic Performance Pathways)
title: Ajnās (Tetrachords)
title: Maqāmāt (Melodic Modes)
```

#### ✅ Correct Heading Examples

```markdown
### 2. Ajnās
### 3. Maqāmāt
### 4. Suyūr
title: Ajnās
title: Maqāmāt
```

**Note**: The description/metadata can include explanatory text, but headings should use Arabic terminology alone. Definitions belong in the body text using the precise language from `07-musicological-definitions.md`.

### Using Musicological Definitions

**ALWAYS** reference `07-musicological-definitions.md` when writing about Arabic music theory terms. Use the exact definitions provided there rather than creating approximations.

**For Ajnās specifically:**
- ❌ "A jins is a melodic fragment typically consisting of three to five pitch classes..."
- ✅ "A jins is a unique sequence of 3, 4, or 5 notes (trichord, tetrachord, or pentachord), each defined by its characteristic interval pattern. The plural, ajnās, refers to multiple jins. Ajnās are the foundational building blocks of maqāmāt."

**Pattern**: When documenting Arabic theoretical concepts, copy the precise definition from `07-musicological-definitions.md` rather than paraphrasing.

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
- "scale degree" (always use "maqām degree" instead)
- "microtonal" (NEVER - see terminology standards)
- **"scale" for tuning systems** (NEVER - tuning systems are not scales; "scale" is an Anglo-European concept that imposes a different theoretical framework)

**Don't compare intervals to 12-EDO** unless explicitly discussing compatibility:
- ❌ "9/8 = major tone"
- ✅ "9/8", "3/2" (neutral examples)

---

## Plural Form Consistency

**CRITICAL**: User-facing text must use proper plural forms with diacritics.

### Arabic Term Plurals

**User-facing text (UI, documentation, export information):**
- ✅ "maqāmāt" (plural of maqām) - with proper diacritics
- ✅ "taṣāwīr" (plural of taṣwīr) - with proper diacritics
- ✅ "ajnās" (plural of jins) - already correct
- ✅ "tanāghīm" (plural of tanghīm) - already correct

**Code identifiers and filenames:**
- Can remain without diacritics for technical consistency (e.g., `maqamat`, `taswir`)
- URL-safe identifiers should use standardized text without diacritics

**Pattern:**
```typescript
// ✅ CORRECT - User-facing text
<span>Exporting maqāmāt</span>
parts.push("all compatible maqāmāt with their sequences");

// ✅ CORRECT - Code identifiers
const maqamatData = getMaqamat();
const filename = `maqamat_${id}.json`;
```

**When to apply:**
- All UI labels and descriptions
- Export information text
- Documentation prose
- Error messages shown to users
- API response descriptions (not the data itself)

**See also**: [07-musicological-definitions.md](../glossary/07-musicological-definitions.md) for complete term definitions

## Capitalization and Formatting Standards

### Arabic Music Terminology

**Maqām/maqām**:
- **Always lowercase "maqām"** for both specific names and general concepts: "maqām rāst", "maqām bayyāt", "maqām bestenegār"
- **Lowercase for theory and generic references**: "maqām theory", "a maqām is...", "all maqāmāt share..."
- **Plural**: Always lowercase "maqāmāt" except at sentence start

**Examples**:
```markdown
✅ "maqām rāst is an octave-repeating maqām"
✅ "The study of maqām theory reveals..."
✅ "Multiple maqāmāt share this characteristic"
❌ "The Maqām Theory shows..." (unnecessary capital)
❌ "Maqām Rāst" (incorrect capitalization - use lowercase)
❌ "maqam Rast" (missing diacriticals)
```

**Note Names**:
- **Lowercase** in transliteration: "rāst", "dūgāh", "ʿushayrān", "yegāh"
- **Exception**: Uppercase when part of proper system name: "ʿUshayrān-based tuning system", "Yegāh-based framework"
- **Recommendation**: Prefer lowercase in general prose unless specifically naming a system/framework

**Examples**:
```markdown
✅ "The note rāst serves as the tonic"
✅ "The ʿUshayrān-based system includes seven notes"
✅ "Starting from dūgāh, the jins ascends"
❌ "The note Rast" (unnecessary capital in prose)
❌ "the Ushayran system" (missing diacriticals)
```

**Jins/Ajnās**:
- **Always lowercase "jins"** for both specific names and general concepts: "jins rāst", "jins kurd", "jins ḥijāz"
- **Lowercase for theory and generic references**: "a jins consists of...", "each jins has..."
- **Plural**: Always lowercase "ajnās" except at sentence start

**Examples**:
```markdown
✅ "jins rāst appears in many maqāmāt"
✅ "A jins is a melodic building block"
✅ "The ajnās combine to form complete maqāmāt"
❌ "Jins Rāst" (incorrect capitalization - use lowercase)
❌ "Ajnas are..." (missing diacriticals)
```

**Compound Technical Terms**:
- **Hyphenate** when used as compound adjective before noun: "octave-repeating maqām", "non-octave-repeating structure", "ʿushayrān-based system"
- **No hyphen** in predicate position: "The maqām is octave repeating", "This system is ʿushayrān based"
- **Always hyphenate** file-related and technical compounds: "12-pitch-class sets", "scala-export", "pitch-class"

**Examples**:
```markdown
✅ "This is an octave-repeating maqām"
✅ "The maqām is octave repeating"
✅ "The 12-pitch-class set contains all pitches"
✅ "An ʿushayrān-based tuning system"
❌ "This is an octave repeating Maqam" (need hyphen, wrong caps)
❌ "The 12 pitch class set" (need hyphens)
```

**System and Framework Names**:
- **Follow source capitalization**: "al-Fārābī (950)", "Ibn Sīnā (1037)", "al-Urmawī (1294)"
- **Lowercase "al-" prefix** unless at sentence start
- **Preserve diacriticals** in all contexts
- **Dates in parentheses** for historical clarity

**Examples**:
```markdown
✅ "According to al-Fārābī (950), the system includes..."
✅ "Al-Fārābī (950) documented seven modal forms" (sentence start)
✅ "Ibn Sīnā (1037) and al-Urmawī (1294) both describe..."
❌ "Al-Farabi's system" (should be lowercase "al-", missing diacriticals)
❌ "ibn Sina" (missing capitalization and diacriticals)
```

### Complete Examples

**Section Header in Documentation**:
```markdown
## maqām bayyāt: Octave-Repeating Structure

maqām bayyāt is an octave-repeating maqām found in multiple historical sources.
The maqām uses the ʿushayrān-based tuning system as documented by al-Fārābī (950).
Its lower jins is jins bayyāt, which consists of four notes starting from dūgāh.
```

**API Parameter Description**:
```markdown
**`maqamName`** (string): The name of the maqām to retrieve. Valid values include
"rāst", "bayyāt", "nahāwand". All maqāmāt in the system are octave-repeating
unless explicitly noted otherwise. Note names use lowercase transliteration
with proper diacriticals.
```

**Code Comment**:
```typescript
/**
 * Retrieves maqām rāst from the ʿUshayrān-based tuning system.
 * This maqām is octave-repeating with jins rāst as its foundational jins.
 * The starting note is rāst, with the jins ascending through four notes.
 *
 * @param systemName - Either "ʿushayrān" or "yegāh"
 * @returns Complete maqām object with all ajnās
 */
```

### Style Guide Summary Table

| Term Type | Specific Name | General Concept | Plural | Example |
|-----------|---------------|-----------------|--------|---------|
| Maqām | Lowercase | Lowercase | Lowercase | maqām rāst / maqām theory / maqāmāt |
| Jins | Lowercase | Lowercase | Lowercase | jins rāst / a jins / ajnās |
| Note names | Lowercase* | Lowercase | Lowercase | rāst, dūgāh, ʿushayrān |
| Scholars | Title case | N/A | N/A | al-Fārābī (950), Ibn Sīnā (1037) |
| Compounds | Hyphenate (adj) | Varies | Varies | octave-repeating, 12-pitch-class |

*Exception: Uppercase when part of system name (e.g., "ʿUshayrān-based system")

### Common Mistakes to Avoid

❌ **Wrong**: "The Maqam Rast uses the Ushayran system"
✅ **Correct**: "maqām rāst uses the ʿushayrān-based system"

❌ **Wrong**: "This is an Octave-Repeating maqam"
✅ **Correct**: "This is an octave-repeating maqām"

❌ **Wrong**: "Maqām Rāst" or "Jins Rāst" (incorrect capitalization)
✅ **Correct**: "maqām rāst" and "jins rāst"

❌ **Wrong**: "According to Al-Farabi, the mode includes..."
✅ **Correct**: "According to al-Fārābī (950), the maqām includes..."

❌ **Wrong**: "The 12 pitch class set uses Maqamat"
✅ **Correct**: "The 12 pitch class set uses Maqāmāt"
✅ **Correct**: "The 12-pitch-class set uses maqāmāt"

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

### ⚠️ CRITICAL: Parameter Description Formatting Ruleset

**Principle**: Always prefer bullets and conciseness, but not at the expense of accuracy. Use natural language, not parameter names.

**Rule 1: Format Selection (Prefer Bullets)**

- **Single-line**: For simple parameters (one sentence, ~80-100 chars)
- **Bullet points**: For 2+ distinct points, requirements, or behaviors (PREFERRED)
- **Paragraphs**: Only for continuous narrative that cannot be broken into discrete points

**Rule 2: Natural Language (Not Parameter Names)**

- ✅ Use natural language that describes functionality: "Transpose the maqām to a different tonic"
- ❌ Never reference parameter names unless clarifying relationships: "Use the `transposeTo` parameter"
- ✅ Exception: Can reference parameter names when clarifying relationships between parameters
- ✅ Reason: Parameter names are visible in UI; descriptions should explain purpose/behavior

**Rule 3: Bullet Point Format**

```yaml
description: |
  Main purpose statement.
  
  - First requirement or behavior
  - Second requirement or behavior
  - Third requirement or behavior
```

**Rule 4: Line Break Rules**

**Never break:**
- Mid-phrase ("tuning system" → keep together)
- Between article and noun ("the tuning" → keep together)
- In compound terms ("pitch class" → keep together)
- Between word and modifier ("the same tuning" → keep together)

**Always break:**
- At sentence endings (periods)
- After commas (when appropriate)
- At natural pause points
- Before bullet points (blank line before list)

**Rule 5: Parameter Type Patterns**

**Boolean Flags:**
```yaml
description: Include [feature description]
```

**Identifiers:**
```yaml
description: [Entity] identifier (format constraints, e.g., 'example-id')
```

**Format/Type Selectors:**
```yaml
description: |
  Specifies which [format/type] to return.
  - Option 1: [description]
  - Option 2: [description]
  Use 'all' for complete data.
```

**Complex Parameters:**
```yaml
description: |
  Main purpose statement.
  
  - Requirement 1: [description]
  - Requirement 2: [description]
  - Behavior: [description]
```

**Rule 6: Examples**

- Inline: `(e.g., 'example1', 'example2')`
- Don't duplicate schema `examples` field
- Use actual IDs from data, never hypothetical examples

**Check Before Committing:**
1. ✅ Prefer bullets over paragraphs for multiple points
2. ✅ Use natural language, not parameter names
3. ✅ Verify line breaks are at natural points
4. ✅ Test rendering in Swagger UI
5. ✅ Ensure compound terms stay together

### API Example Requirements

- **Verified IDs**: Use actual IDs from data files - ALWAYS verify against API responses (`curl` the endpoint) or data files before using examples
- **Parameter descriptions**: All examples in parameter descriptions MUST use real IDs from the data
- **Complete examples**: Show full request/response structure
- **Default behavior**: Explicitly document what happens when optional parameters omitted
- **Error cases**: Document common error scenarios
- **❌ NEVER**: Use display names (e.g., '12-EDO') when you need IDs (e.g., 'Anglo-European-(1700)')
- **✅ ALWAYS**: Query the API or check data files to get actual IDs before documenting examples
- **Representative examples**: For recommended tuning systems, maqāmāt, and ajnās for testing and documentation, see [`docs/api/representative-examples.md`](../../docs/api/representative-examples.md)

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

9. **Using specific quantities in prose**
   - ❌ Avoid: "35 historical tuning systems from al-Kindī (874 CE) to contemporary approaches"
   - ❌ Avoid: "29 documented melodic fragments with historical source attribution"
   - ❌ Avoid: "60 historically documented maqāmāt"
   - ✅ Prefer: "Historical tuning systems from al-Kindī (874 CE) to contemporary approaches"
   - ✅ Prefer: "Documented melodic fragments with historical source attribution"
   - ✅ Prefer: "Historically documented maqāmāt"
   - **Rationale**: Quantities change as data evolves. Focus on describing what the system contains rather than specific counts that may become outdated.

10. **Using vague filler language instead of concrete examples**
   - ❌ Avoid: "Comprehensive tanāghīm", "Various tuning approaches", "Mathematical frameworks", "and others"
   - ❌ Avoid: Making up historical details you don't have access to
   - ❌ Avoid: Suggesting to add information not grounded in verifiable data
   - ✅ Prefer: List actual examples from the database showing historical breadth
   - ✅ Prefer: Query data files (e.g., `data/tuningSystems.json`) to get real system names
   - ✅ Prefer: Use concrete, verifiable examples organized by period
   - **Example Pattern**:
     ```markdown
     **Medieval Period:**
     - al-Mawṣilī (850)
     - al-Kindī (874)
     - al-Fārābī (950a-j) - multiple documented systems

     **Modern Period:**
     - Cairo Congress Tuning Committee (1929, 1932a, 1932b)
     - al-Ṣabbāgh (1950, 1954)
     ```
   - **Rationale**: Vague descriptors provide no value and can mislead. Real examples from the database are verifiable, informative, and demonstrate actual system capabilities. Never hallucinate or suggest adding information you don't have access to—always ground documentation in verifiable facts from the codebase.

---

## Code Examples and String Literals

**CRITICAL: Code examples and string literals must use plain ASCII without diacritics**

### Rationale

While documentation prose should use proper Arabic transliteration with diacritics (ʿushayrān, maqām, etc.), **code examples must use plain ASCII** for:
- **Technical compatibility**: Special characters can cause encoding issues
- **Developer workflow**: Easier to type and copy-paste
- **API consistency**: Actual API parameters use ASCII identifiers
- **Searchability**: Plain ASCII is easier to grep and search

### ✅ Correct Code Examples

```typescript
// ✅ CORRECT - Plain ASCII in code
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ushayran')
const maqam = getMaqam('rast', 'al-Farabi-(950)')
```

```bash
# ✅ CORRECT - Plain ASCII in API calls
curl "http://localhost:3000/api/tuning-systems/al-Farabi-(950g)"
```

```json
{
  "startingNote": "ushayran",
  "maqamName": "rast"
}
```

### ❌ Incorrect Code Examples

```typescript
// ❌ WRONG - Diacritics in code
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ʿushayrān')
const maqam = getMaqam('rāst', 'al-Fārābī-(950)')
```

### Documentation Prose vs Code

**In prose/documentation text**: Use proper diacritics
- "The ʿushayrān-based tuning system..."
- "maqām rāst is an octave-repeating maqām"

**In code examples**: Use plain ASCII
- `getTuningSystemPitchClasses(tuningSystem, 'ushayran')`
- `const maqamName = 'rast'`

**Pattern**:
```markdown
The function accepts the starting note name as a parameter. For example, to get
pitch classes for the ʿushayrān-based system:

\`\`\`typescript
const pitchClasses = getTuningSystemPitchClasses(tuningSystem, 'ushayran')
\`\`\`
```

Notice: Prose uses "ʿushayrān" with diacritics, code uses `'ushayran'` without.

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
 *   "ushayran",
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

**⚠️ CRITICAL - Check These First:**
- [ ] **Frontmatter title** - Arabic as primary: `title: Tanāghīm (Tuning Systems)` NOT `title: Tuning Systems (Tanāghīm)`
- [ ] **H1 header** - Arabic as primary: `# Tanāghīm (Tuning Systems)` NOT `# Tuning Systems (Tanāghīm)`
- [ ] **All section headers (H2, H3, etc.)** - Arabic as primary: `## What is a Tanghīm?` NOT `## What is a Tuning System?`
- [ ] **Opening sentences** - Arabic as primary: "Tanāghīm (tuning systems) are..." NOT "Tuning systems (tanāghīm) are..."

**Cultural Accuracy:**
- [ ] No parenthetical English definitions after Arabic terms
- [ ] Arabic terms are primary throughout (not parenthetical)
- [ ] **Terms introduced once completely, then Arabic only** - After first introduction (e.g., "tanghīm (tuning system, plural: tanāghīm)"), all subsequent uses are Arabic only ("tanghīm"/"tanāghīm")
- [ ] Code examples use plain ASCII without diacritics (e.g., 'ushayran' NOT 'ʿushayrān')
- [ ] All examples sourced from real export files (verified)
- [ ] All properties match actual data structure
- [ ] Optional fields clearly marked with presence conditions
- [ ] "Frequencies" replaced with specific properties (fractions/cents/string lengths)
- [ ] No API defaults use "frequency" for pitch class data (see Frequency Usage Restriction in 07-musicological-definitions.md)
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
