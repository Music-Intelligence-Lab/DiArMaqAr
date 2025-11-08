---
title: Bibliographic Sources
description: Comprehensive source attribution and scholarly verification
---

# Bibliographic Sources

DiArMaqAr maintains rigorous bibliographic attribution across all data, enabling scholarly verification, academic citation, and further research. Every tuning system, jins, and maqām includes complete source references.

## Source Attribution System

### Integration Levels

**Tuning Systems:**
- Creator attribution (historical theorist or modern scholar)
- Publication year
- Source citation with page references
- Commentary providing theoretical context

**Ajnās:**
- Bibliographic references
- Source and page citations
- Historical context
- Cross-references to related sources

**Maqāmāt:**
- Complete bibliographic references
- Source and page citations
- Bilingual commentary (Arabic/English)
- Suyūr from original sources

## Historical Sources Database

The `sources.json` corpus maintains a comprehensive bibliographic database supporting all platform content with:

- **Complete academic citations** in both Arabic and English
- **Books and articles** with full publication details
- **Contributor information**
- **DOI links** where available
- **Access dates** for digital sources

### Source Types

**Historical Treatises (9th-13th centuries):**
- Al-Kindī (d. 847)
- Al-Fārābī (d. 950)
- Ibn Sīnā (d. ca. 1037)
- Al-Urmawī (13th century)

**Modern Scholarship (19th-20th centuries):**
- Meshshāqa (1899)
- Al-Khulʿī (1904/2011)
- Al-Shawwā (1946)
- Allāh Wīrdī (1949)
- Al-Ṣabbāgh (1954)
- Al-Ḥilū (1961)

**Contemporary Sources:**
- Beyhom (2010)
- Modern theoretical works
- Performance practice documentation

## Note Name Compilation

The Arab-Ottoman-Persian note naming convention is compiled from:

- Meshshāqa (1899:18)
- Al-Khulʿī (1904/2011:50-54 and 77-78)
- Al-Shawwā (1946:11-12)
- Allāh Wīrdī (1949:58, 153, 157, 177, 198, 203, 207)
- Al-Ṣabbāgh (1954:47)
- Al-Ḥilū (1961:69)

**Extended octaves** (qarār prefixes, jawāb prefixes) follow conventions documented in:
- Allāh Wīrdī (1949:203)
- Al-Ḥilū (1961:70)

## Source Selection Methodology

### Where Note Names Exist in Sources

Where Arab-Ottoman-Persian note name associations to pitch classes exist in bibliographic sources, they are **explicitly used**.

### Where Note Names Must Be Inferred

Where direct associations are not documented, note names are **inferred** based on:
- Compiled note names list
- Relationship to Al-Kindī's 9th century 12-tone chromatic tuning system
- Al-Fārābī's comprehensive 10th century tunings
- 20th century sources (Al-Ṣabbāgh 1954, Allah Wīrdī 1949)

## Commentary and Context

Each tuning system includes commentary by Dr. Khyam Allami providing:

- **Theoretical context**: How the system fits in historical development
- **Bibliographic analysis**: Discussion of source and its significance
- **Mathematical explanation**: How the system was calculated/rendered
- **Practical implications**: How the system affects maqāmic practice

### Example Commentary

From "Contemporary Arabic 19-Tone" system by Al-Ṣabbāgh (1950:173):

"This tuning system by Tawfīq Al-Ṣabbāgh is built on a theoretical 53-comma per octave division, resulting in 19-tones that are used in the maqāmāt he recounts in his book. Ṣabbāgh gives the comma a value of 1/81th of a string length of 10,000 = 123.4567901235 (1950:38), erroneously defined by Shawqī as 0,012346 (1969:147). This is a syntonic comma, also known as Didymus' comma, the meantone comma or the Ptolemaic comma, with a frequency ratio of 81/80..."

## Accessing Source Information

### Via REST API

```bash
# Get sources database
curl http://localhost:3000/api/sources

# Maqām responses include source references
curl "http://localhost:3000/api/maqamat/maqam_bayyat?tuningSystem=al-Farabi-(950g)&startingNote=ushayran&pitchClassDataType=cents"

# Response includes:
# - source references
# - page numbers
# - bibliographic citations
```

### Via TypeScript Library

```typescript
import { getSources } from '@/functions/import'

// Get all bibliographic sources
const sources = getSources()

// Each source includes:
// - Full citation (Arabic and English)
// - Publication details
// - Contributor information
// - DOI links (if available)
```

## Academic Citation

All data is ready for academic citation with:

- **Complete bibliographic references**: Full citations in Arabic and English
- **Page numbers**: Specific locations in sources
- **Transparent methodology**: How data was derived
- **Version tracking**: Platform version and data version

### Citation Format

Citations follow international scholarly standards:
- Library of Congress Arabic Romanization
- Standard academic citation formats
- Bilingual support (Arabic/English)
- DOI links where available

## Historical Context

### Manuscript Availability

**Challenge**: Many historical treatises exist only as copies in Anglo-European libraries due to colonial expatriation:
- Leyden, London, Oxford, Madrid, Paris, Berlin, Munich
- Initiated by Napoleon's 1798 invasion of Egypt
- Continuing through 2003 plunder of Iraq

**Response**: DiArMaqAr provides access to content from:
- Critical editions collating multiple manuscripts
- Scholarly publications with textual variants
- Documented commentary and annotations

### Theoretical Evolution

Sources span:
- **8th century**: Early theoretical works
- **9th-13th centuries**: Medieval polymath theorists
- **19th-20th centuries**: Modern systematization
- **Contemporary**: Recent scholarship

DiArMaqAr enables immediate access to over a thousand years of musical and mathematical scholarship.

## Verification and Validation

### Scholarly Verification

The transparent source attribution enables:
- **Verification**: Checking original sources
- **Validation**: Confirming theoretical accuracy
- **Replication**: Reproducing results
- **Extension**: Building upon existing work

### Critical Edition Approach

Following principles of critical editions:
- **Multiple sources**: Collated from various manuscripts
- **Reliable text**: Established through scholarly comparison
- **Documented variants**: Textual differences noted
- **Commentary**: Scholarly analysis included

## Research Applications

### Academic Research

- **Citation**: Ready-to-use bibliographic references
- **Verification**: Transparent data origin
- **Extension**: Building upon documented theory
- **Comparative study**: Multiple source comparison

### Musicological Analysis

- **Historical development**: Tracing theoretical evolution
- **Source comparison**: Analyzing different approaches
- **Validation**: Confirming theoretical claims
- **Contextualization**: Understanding historical setting

## Next Steps

- Explore [Research Applications](/guide/research-applications/)
- Learn about [Cultural Framework](/guide/cultural-framework/)
- Understand [Theoretical Framework](/guide/theoretical-framework/)

