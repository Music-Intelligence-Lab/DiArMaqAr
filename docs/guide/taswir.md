---
title: Taṣwīr (Transposition)
description: Understanding tuning-system-sensitive transposition capabilities
---

# Taṣwīr (Transposition)

Transposition is one of DiArMaqAr's most sophisticated features, enabling systematic analysis of how any jins or maqām can be shifted to different starting pitches while maintaining essential intervallic relationships.

## Overview

In written Arabic maqām theory, transposition is recognised as a fundamental feature of maqāmic practice, but transpositions are rarely explicitly rendered in full. DiArMaqAr's transposition capabilities represent a significant computational advancement, revealing theoretical possibilities that would require extensive manual calculation to discover.

## How Transposition Works

Transposition is **not** simply moving pitches up or down by a fixed amount. Instead, it involves:

1. **Extracting the interval pattern** from the original structure
2. **Systematically applying** the pattern to all possible starting points
3. **Pattern matching** against the tuning system's available pitch classes
4. **Preserving intervallic relationships** while adapting to new tonal centers

### Interval Pattern Extraction

The algorithm:
- Cross-references maqām/jins note name sequences to the tuning system
- Extracts the sequence of intervals between consecutive notes
- Uses these intervals (not fixed pitches) as the pattern to match

### Matching Process

**For systems using fractional ratios:**
- Requires exact fractional ratio matches
- Mathematical precision is preserved

**For systems using any other original input data type (decimal ratios, string lengths, fret divisions or cents):**
- Uses cents values for matching
- Applies user-definable ±cents tolerance (default: ±5 cents, Just Noticeable Difference JND) to allow for performance practice variations.

## Jins Transposition

A jins transposition systematically shifts a jins to begin from a different pitch class while preserving its intervallic relationships.

### Example: Jins Kurd

**Original (Tahlīl):** Jins kurd starting on dūgāh
- Pattern: dūgāh → kurdī → chahārgāh → nawā
- Intervals: [specific cents pattern]

**Transposition (Taswīr):** Jins kurd starting on muḥayyar
- Pattern: muhayyar → [notes maintaining same intervals]
- Name: "jins kurd al-muḥayyar"

### Algorithm Characteristics

- **Recursive search**: Finds all valid starting points
- **Early termination**: Optimizes performance
- **Automatic generation**: All possible transpositions are calculated
- **Naming convention**: Follows Arabic maqām theory ("jins [name] al-[starting note]")

## Maqām Transposition

Maqām transposition handles both ascending and descending sequences separately, accounting for the fact that many maqāmāt employ different sequences in their ascent and descent.

### Algorithm Details

1. **Separate Processing**: Ascending and descending sequences analyzed independently
2. **Validation**: Ensures all required note names exist in the tuning system
3. **Interval Preservation**: Maintains original intervallic relationships
4. **Automatic Recalculation**: All embedded ajnās recalculated for each transposition
5. **Suyūr Transposition**: Associated suyūr automatically transposed

### Example: Maqām Faraḥfazza

**Original:** Starting on yegāh
- Ascending: yegāh → rāst → dūgāh → ...
- Descending: [possibly different sequence]

**Transposition:** Starting on rāst → "maqām faraḥfazza al-rāst"
- Ascending: rāst → [transposed maintaining intervals] → ...
- Descending: [transposed maintaining intervals]
- All ajnās recalculated
- All suyūr transposed

## Computational Complexity

The implementation employs:
- **Recursive sequence building** with early termination
- **O(n×m×k) complexity** where:
  - n = available pitch classes
  - m = pattern length
  - k = tolerance width

This efficiency enables:
- Real-time transposition generation
- Comprehensive dataset export (all transpositions for all maqāmāt)
- Large-scale comparative analysis

## Using Transposition

### Via REST API

```bash
# Get maqām with all transpositions (example: transposed maqām with zalzalian tonic)
curl "http://localhost:3000/api/maqamat/maqam_rahat_al-arwah?tuningSystem=IbnSina-(1037)&startingNote=yegah&includeTranspositions=true&pitchClassDataType=cents"

# Response includes array of transpositions with:
# - Transposed name
# - Ascending/descending sequences
# - Recalculated ajnās
# - Transposed suyūr
```

### Via TypeScript Library

```typescript
import { getJinsTranspositions, getMaqamTranspositions } from '@/functions/transpose'

// Get all jins transpositions
const jinsTranspositions = getJinsTranspositions(jins, tuningSystem)

// Get all maqām transpositions
const maqamTranspositions = getMaqamTranspositions(maqam, tuningSystem)

// Each transposition includes:
// - Name (following Arabic convention)
// - Starting note
// - All pitch classes with mathematical values
// - Constituent ajnās (for maqāmāt)
// - Transposed suyūr (for maqāmāt)
```

## Research Applications

Transposition capabilities enable:

- **Systematic exploration**: All mathematically valid possibilities
- **Comparative analysis**: How transposition possibilities vary across tuning systems
- **Theoretical investigation**: Relationships between tuning systems and modal availability
- **Dataset generation**: Complete mappings for machine learning applications

### Example Research Questions

- Which tuning systems support the most transpositions for a given maqām?
- How do starting note conventions affect transposition possibilities?
- What is the relationship between tuning system complexity and transposition availability?

## Next Steps

- Learn about [Intiqāl (Modulation)](/guide/intiqal/) (related but distinct)
- Explore [Tuning Systems](/guide/tuning-systems/) and their impact on transposition
- Understand how transposition relates to [Ajnās](/guide/ajnas/)

