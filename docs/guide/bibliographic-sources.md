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
- Multilingual commentary (Arabic/English/French)
- Suyūr from original sources

## Historical Sources Database

The `sources.json` corpus maintains a comprehensive bibliographic database supporting all platform content with:

- **Complete academic citations** in Arabic, English, and French
- **Books and articles** with full publication details
- **Contributor information**
- **DOI links** where available
- **Access dates** for digital sources

### Source Types

**Historical Treatises (9th–16th centuries):**
- Al-Kindī — 9th c. (e.g. twelve-tone ratios dated 847 CE via Farmer 1937:248)
- Al-Fārābī — d. 950 (multiple tuning systems of 27, 35, or 22 pitch classes per Forster 2010:643)
- Ibn Sīnā — d. ca. 1037 (17-tone system per Farmer 1937:249)
- Al-Urmawī — 13th c. (17-tone system, *Kitāb al-Adwār* 1252, ed. Khashaba 1986/2017)
- Al-Lādhiqī — late 15th – early 16th c. (17-tone system per Allāh Wīrdī 1949:163-164)

**Modern Scholarship (19th–20th centuries):**
- Meshshāqa (1899)
- Al-Khulʿī (1904/2011)
- Ronzevalle (1904) — Modernist Arabic 24-tone tuning
- Cairo Congress for Arabic Music (1932)
- Al-Shawwā (1946) — including the modulation guidelines formalised in DiArMaqAr
- Allāh Wīrdī (1949)
- Al-Ṣabbāgh (1950, 1954) — 19-tone and 24-tone comma-based systems
- Al-Ḥilū (1957/1961)
- Abbās (1986) — extended maqām transpositions

**Secondary Compilations and Contemporary Sources:**
- d'Erlanger (6 vols., 1930–1959)
- Farmer (1937)
- Shawqī (1969)
- Maalouf (2002)
- Al-Rejab (2002)
- Forster (2010)
- Beyhom (2010)
- Farraj & Shumays (2019)

## Note Name Compilation

The Persian-Arab-Ottoman note naming convention compiled in DiArMaqAr totals **36 note names per octave** across **four octaves** (Octave 0 through Octave 3). In most bibliographic sources the range spans two octaves (Octaves 1–2, from yegāh to saham/ramal tūtī/jawāb al-nawā); DiArMaqAr extends this downward with qarār / qarār qarār prefixes (Octave 0) and upward with jawāb / jawāb jawāb prefixes (Octave 3) in accordance with maqām theory convention.

The compiled note names are drawn from:

- Meshshāqa (1899:18)
- Al-Khulʿī (1904/2011:50-54 and 77-78)
- Al-Shawwā (1946:11-12)
- Allāh Wīrdī (1949:58, 153, 157, 177, 198, 203, 207)
- Al-Ṣabbāgh (1954:47)
- Al-Ḥilū (1961:69)
- Al-Rejab (2002:79-80)

**Extended ranges** (qarār/qarār qarār prefixes for the lower register, jawāb/jawāb jawāb prefixes for the upper register) follow conventions documented in:
- Allāh Wīrdī (1949:203)
- Al-Ḥilū (1961:70)
- Arel (1968:1) — extended four-octave Turkish makam equivalents

## Source Selection Methodology

### Where Note Names Exist in Sources

Where Persian-Arab-Ottoman note name associations to pitch classes exist in bibliographic sources, they are **explicitly used**.

### Where Note Names Must Be Inferred

Where direct associations are not documented, note names are **inferred** based on:
- Compiled note names list
- Relationship to al-Kindī's 9th-century 12-tone chromatic tuning system
- Al-Fārābī's comprehensive 10th-century tunings
- 20th-century sources (al-Ṣabbāgh 1954, Allāh Wīrdī 1949)

## Commentary and Context

Each tuning system includes editorial commentary providing:

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
curl "http://localhost:3000/api/maqamat/maqam_bayyat?tuningSystem=alfarabi_950g&startingNote=ushayran&pitchClassDataType=cents"

# Response includes:
# - source references
# - page numbers
# - bibliographic citations
```

## Academic Citation

All data is ready for academic citation with:

- **Complete bibliographic references**: Full citations in Arabic, English, and French
- **Page numbers**: Specific locations in sources
- **Transparent methodology**: How data was derived
- **Version tracking**: Platform version and data version

### Citation Format

Citations follow international scholarly standards:
- Library of Congress Arabic Romanization
- Standard academic citation formats
- Multilingual support (Arabic/English/French)
- DOI links where available

## Historical Context

### Compilation Methodology

Many of DiArMaqAr's tuning systems are reconstructed by re-reading primary Arabic, English, and French texts alongside secondary compilations (d'Erlanger 1930–1959, Farmer 1937, Allāh Wīrdī 1949, Shawqī 1969, Maalouf 2002, Forster 2010, Beyhom 2010). Where these works render musical information reductively, use interchangeable units of measurement, or rely on Anglo-European / International Pitch Notation and staff notation, DiArMaqAr re-interprets the material and renders it through:

- Critical editions collating multiple manuscripts
- Scholarly publications with textual variants
- Documented commentary and annotations

### Theoretical Evolution

Sources span from the 9th century to the present:
- **9th–13th centuries**: Medieval polymath theorists (al-Kindī, al-Fārābī, Ibn Sīnā, al-Urmawī)
- **14th–16th centuries**: al-Shīrāzī and al-Irbilī (first attested uses of Persian-Arab-Ottoman note names), al-Lādhiqī
- **19th–20th centuries**: Modern systematisation (Meshshāqa, al-Khulʿī, Ronzevalle, al-Shawwā, Allāh Wīrdī, al-Ṣabbāgh, al-Ḥilū); Cairo Congress (1932)
- **Late 20th century – contemporary**: Abbās (1986), al-Rejab (2002), Beyhom (2010), Farraj & Shumays (2019)

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

