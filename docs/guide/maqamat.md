---
title: Maqāmāt
description: Understanding maqāmāt as complete modal frameworks
---

# Maqāmāt

Maqām is a complete modal framework built from an ordered sequence of pitch classes (typically 7–13+ notes), ascending (ṣuʿūd) and descending (hubūṭ) sequences (which may differ), positioning of multiple ajnās at specific scale degrees, melodic development pathways (suyūr), and unique theoretical and aesthetic properties.

## What is a Maqām?

Maqām is a complete modal framework that differs from ajnās in its scope and structure, representing a complete modal framework rather than a building block component.

### Structure

Each maqām contains:

**Ascending Sequence (Ṣuʿūd):**
- Seven or more notes defining the upward melodic path
- Represents how the maqām develops when ascending

**Descending Sequence (Hubūṭ):**
- Seven or more notes defining the downward melodic path
- Can be identical to the ascending sequence or different

**Asymmetrical Structures:**
- Many maqāmāt employ different sequences in ascent and descent
- The platform visually distinguishes notes that appear only in descending sequence
- This asymmetry is a characteristic feature of Arabic maqām practice

## Construction and Compatibility

Similar to ajnās, maqāmāt are constructed based on constituent note names and are subject to tuning system compatibility.

**Requirements:**
- All note names in both ascending and descending sequences must exist within the selected tuning system
- If any required note name is missing, the maqām is not possible in that tuning system

**Example:** Maqām farahfazza in Al-Kindī's tuning system extends from yegāh to ḥusaynī, utilizing notes across this range.

## Ajnās Within Maqāmāt

As building blocks, ajnās combine to form maqāmāt. The platform automatically analyzes each maqām to identify:

- Which ajnās appear in the ascending sequence
- Which ajnās appear in the descending sequence
- Whether they are in their original form (tahlīl) or transposed (taswīr)
- Their precise intervallic structure within the maqām context

**Analysis Algorithm:**
- Searches every starting point within both sequences
- Compares subsequences of 3-5 consecutive notes
- Matches against known ajnās interval patterns
- Uses cents tolerance mechanism for performance practice variations

## Maqām Transpositions

Like ajnās, maqāmāt can be systematically transposed to begin from different pitch classes while preserving their essential intervallic relationships and directional characteristics.

### How It Works

The transposition algorithm:
1. **Separately processes** both ascending and descending sequences
2. **Ensures** all required note names exist within the tuning system
3. **Maintains** original intervallic relationships
4. **Recalculates** all embedded ajnās for each transposition
5. **Generates** transposed names following "maqām [name] al-[starting note]" convention

### Example

**Original:** Maqām farahfazza starting on yegāh

**Transposition:** Maqām farahfazza starting on rāst → **"maqām farahfazza al-rāst"**

Each transposition:
- Retains original intervallic relationships between consecutive notes
- Adapts to the new tonal center
- Automatically recalculates constituent ajnās
- Maintains ascending/descending sequence characteristics

## Maqām Suyūr

Suyūr (singular: sayr) represent traditional melodic development pathways that define how a maqam unfolds in performance practice. They go beyond basic ascending and descending sequences to describe:

- Characteristic melodic progressions
- Emphasis points
- Developmental patterns
- Traditional performance practices

**Structure:**
- Implemented as sequences of "stops"
- Each stop can be: a note, a jins, a maqām, or a directional instruction
- Automatically transposed when the maqām is transposed

See the [Suyūr Guide](/guide/suyur/) for detailed information.

## Using Maqāmāt

### Via REST API

```bash
# Get all maqāmāt
curl http://localhost:3000/api/maqamat

# Get specific maqām with full details
curl "http://localhost:3000/api/maqamat/maqam_bayyat?tuningSystem=al-Farabi-(950g)&startingNote=ushayran&pitchClassDataType=cents"

# Include transpositions
curl "http://localhost:3000/api/maqamat/maqam_bayyat?tuningSystem=al-Farabi-(950g)&startingNote=ushayran&includeTranspositions=true"

# Include modulation analysis
curl "http://localhost:3000/api/maqamat/maqam_bayyat?tuningSystem=al-Farabi-(950g)&startingNote=ushayran&includeModulations=true"
```

### Via TypeScript Library

```typescript
import { Maqam } from '@/models/Maqam'
import { getMaqamTranspositions } from '@/functions/transpose'

// Create maqam instance
const maqam = new Maqam(maqamData)

// Get all possible transpositions in a tuning system
const transpositions = getMaqamTranspositions(maqam, tuningSystem)

// Access ascending and descending sequences
console.log(maqam.ascendingSequence)
console.log(maqam.descendingSequence)

// Access embedded ajnās (automatically analyzed)
console.log(maqam.ajnas)
```

## Bibliographic Sources

Maqāmāt in DiArMaqAr are compiled from:
- Historical Arabic music theory treatises (9th-20th centuries)
- Modern scholarly works
- Performance practice documentation

Each maqām includes:
- Complete bibliographic references
- Source and page citations
- Bilingual commentary (Arabic/English)
- Suyūr from original sources
- Historical context

## Visual Analysis

The platform provides multiple visualization modes:
- **Tabular display**: Mathematical details for all pitch classes
- **Pitch class bar**: Visual representation with highlighting
- **Ascending/descending notation**: Clear distinction of sequences
- **Ajnās overlay**: Visual indication of constituent ajnās

## Next Steps

- Learn about [Suyūr](/guide/suyur/)
- Explore [Taṣwīr (Transposition)](/guide/taswir/) capabilities
- Discover [Intiqāl (Modulation)](/guide/intiqal/) networks
- Understand [Bibliographic Sources](/guide/bibliographic-sources/)

