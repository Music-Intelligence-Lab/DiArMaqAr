---
title: Ajnās
description: Understanding ajnās as the building blocks of maqāmāt
---

# Ajnās

A jins is a unique sequence of 3, 4, or 5 notes (trichord, tetrachord, or pentachord), each defined by its characteristic interval pattern. The plural, ajnās, refers to multiple jins. Ajnās are the foundational building blocks of maqāmāt. Understanding ajnās is essential for comprehending how maqāmāt are structured.

## What is a Jins?

A jins is a unique sequence of 3, 4, or 5 notes, each defined by its characteristic interval pattern that defines its identity. Unlike maqāmāt, ajnās are components that combine to form complete modal frameworks.

### Key Characteristics

- **Size**: Typically 3-5 pitch classes
- **Structure**: Defined by intervallic relationships between consecutive notes
- **Note name-based**: Constructed using Arab-Ottoman-Persian note names
- **Compatibility**: Dependent on tuning system (not all ajnās work in all tuning systems)

## Construction and Compatibility

Ajnās are constructed based on their constituent note names. For a jins to be possible in a given tuning system, **all required note names must exist within the system's four octaves**.

### Example: Jins Kurd

**Note sequence**: dūgāh → kurdī → chahārgāh → nawā

**Compatibility Check:**
- ✅ **Al-Kindī system**: All note names exist → Jins kurd is possible
- ❌ **Some systems**: Missing one or more note names → Jins kurd is not possible

The platform automatically searches across all four octaves when determining ajnās compatibility.

## Jins Transpositions

A jins transposition is the systematic shifting of a jins to begin from a different pitch class while **preserving its intervallic relationships**. This is not simply moving pitches up or down by a fixed amount—instead, it involves pattern matching the original sequence of intervals against all possible starting positions within the tuning system.

### Naming Convention

Transpositions follow Arabic music theory naming:
- **Tahlīl**: The original jins (e.g., "jins kurd" starting on dūgāh)
- **Taswīr**: A transposition (e.g., "jins kurd al-muhayyar" starting on muhayyar)

**Example:**
- Original: Jins kurd starting on dūgāh → **jins kurd**
- Transposition: Same interval pattern starting on muhayyar → **jins kurd al-muhayyar**

### How Transposition Works

The transposition algorithm:
1. Extracts the interval pattern from the original jins
2. Systematically searches through the tuning system
3. Finds all valid starting points where the complete interval pattern can be realized
4. Generates transposition objects with appropriate naming

**Algorithm Details:**
- Uses recursive sequence building with early termination
- Matches interval patterns (not fixed pitches)
- Considers cents tolerance for fuzzy matching (±5 cents default)
- Handles both exact fractional ratios and approximate matches

## Ajnās Within Maqāmāt

One of the platform's most significant analytical capabilities is identifying which ajnās exist within each maqām across different tuning systems and transpositions.

### Automatic Detection

When you select a maqām, the platform automatically:
1. Searches both ascending and descending sequences
2. Compares subsequences against known ajnās interval patterns
3. Identifies matches using configurable cents tolerance
4. Generates jins entries with:
   - Transposed name (following "jins [name] al-[starting note]" convention)
   - Specification of ascending or descending appearance
   - Precise intervallic structure within the maqām context

### Example Analysis

When analyzing **maqām rāst** transposed to begin on nawā, the algorithm might identify:
- jins rāst al-nawā (in ascending sequence)
- jins bayāt al-ḥusaynī (in ascending sequence)
- jins segāh al-awj (in descending sequence)
- jins rāst al-muḥayyar (in ascending sequence)

This comprehensive analysis reveals the primary structural ajnās that define the maqām's character.

## Using Ajnās

### Via REST API

```bash
# Get all ajnās
curl http://localhost:3000/api/ajnas

# Get ajnās for a specific maqām (included in maqām response)
curl "http://localhost:3000/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

### Via TypeScript Library

```typescript
import { Jins } from '@/models/Jins'
import { getJinsTranspositions } from '@/functions/transpose'

// Create jins instance
const jins = new Jins(jinsData)

// Get all possible transpositions in a tuning system
const transpositions = getJinsTranspositions(jins, tuningSystem)
```

## Bibliographic Sources

Ajnās in DiArMaqAr are compiled from:
- Historical Arabic music theory treatises
- Modern scholarly works (Al-Shawwā 1946, Al-Ḥilū 1961, etc.)
- Performance practice documentation

Each jins includes:
- Complete bibliographic references
- Source and page citations
- Historical context

## Next Steps

- Learn about [Maqāmāt](/guide/maqamat/) that combine ajnās
- Explore [Transposition](/guide/transposition/) in depth
- Understand how ajnās relate to [Modulation](/guide/modulation/)

