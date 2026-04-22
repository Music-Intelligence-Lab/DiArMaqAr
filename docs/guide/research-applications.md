---
title: Research Applications
description: Research use cases and academic applications of DiArMaqAr
---

# Research Applications

DiArMaqAr provides unprecedented tools for systematic investigation of maqāmic relationships while maintaining connection to conventional frameworks. This guide outlines key research applications and use cases.

## Comparative Tuning System Analysis

The platform's integration of historical tuning systems enables comparative analysis of Arabic theoretical frameworks through consistent Persian-Arab-Ottoman note naming.

### Research Questions

- How does the same maqām manifest across different temperaments?
- What are the consistencies and variations in theoretical approaches?
- How do historical tuning systems compare to modern frameworks?
- What are the practical implications of theoretical choices?

### Methodology

1. Select a maqām (e.g., Maqām Rāst)
2. Compare across multiple tuning systems:
   - Al-Kindī (9th century ratios)
   - Al-Fārābī (10th century tunings)
   - Ibn Sīnā (11th century approaches)
   - Al-Ṣabbāgh (20th century comma-based system)
3. Analyze:
   - Pitch class values
   - Interval relationships
   - Available transpositions
   - Modulation possibilities

### Example: Theoretical Evolution

Comparing Al-Fārābī's 10th-century ratios with Al-Ṣabbāgh's 20th-century comma-based system demonstrates:
- Theoretical evolution over time
- Maintenance of essential intervallic relationships
- Impact of measurement approaches on modal availability

## Starting Note Convention Analysis

A crucial analytical capability lies in systematic comparison of tuning systems based on different starting note conventions. DiArMaqAr supports three starting note names: **ʿushayrān**, **yegāh**, and **rāst**.

### Research Framework

**Oud-Based Systems (ʿushayrān):**
- Reflect the conventional tuning of the oud in perfect fourths (4/3)
- ʿushayrān marks the 1/1, corresponding to the lowest of the four strings tuned in perfect fourths — the two or more strings lower in pitch remain tuning-independent
- Examples: al-Kindī, al-Fārābī (oud conventions), al-Urmawī

**Longnecked-Lute and Monochord/Sonometer Systems (yegāh/rāst):**
- Derived from the fret divisions of longnecked lutes (Arabic tanbūr, Persian tar/sehtar, Turkish tanbur) or from monochord/sonometer measurements
- Follow a theoretical framework rather than a fixed instrument tuning
- Examples: al-Fārābī's Tanbūr al-Baghdādī and Tanbūr al-Khorasānī, through to the Tuning Committee of the 1932 Cairo Congress for Arabic Music

Al-Fārābī appears in both categories because he described multiple tuning systems derived from different instruments. When a tuning system begins from ʿushayrān versus yegāh (which are a 9/8 whole-tone apart), the resulting intervallic relationships, the availability of specific maqāmāt and ajnās, and the modulation pathways can vary substantially.

### Research Applications

1. **Availability Analysis:**
   - Compare number of available maqāmāt
   - Compare number of available ajnās
   - Analyze transposition possibilities

2. **Modulation Networks:**
   - Compare modulation capabilities
   - Identify differences in pathway structures
   - Analyze theoretical accessibility

3. **Historical Instrument Practice:**
   - Understand how instrumental traditions affect theory
   - Reveal connections between practice and theory
   - Examine theoretical evolution

## Quantitative Analysis

The platform's analytics capabilities provide quantitative insights into maqāmic relationships.

### Dataset Generation

Export comprehensive datasets for:
- All maqāmāt in selected tuning systems
- All possible transpositions
- Complete modulation networks
- Ajnās compatibility matrices

### Statistical Analysis

**Correlation Studies:**
- Relationship between tuning system characteristics and transposition possibilities
- Correlation between transposition availability and modulation networks
- Impact of starting note conventions on modal accessibility

**Pattern Recognition:**
- Systematic modulation structures
- Transposition frequency patterns
- Ajnās distribution analysis

### Example Research

Analyse relationships between:
- Number of pitch classes and available maqāmāt
- Starting note convention and transposition possibilities
- Tuning system complexity and modulation network density

**Concrete example (al-Shawwā modulation algorithm):** For maqām bayyāt on its conventional tonic of dūgāh in al-Ṣabbāgh's 24-tone comma-based tuning system (1954), the al-Shawwā modulation algorithm identifies **41 valid modulation pathways**, whereas al-Ṣabbāgh's book provides only **8 fixed modulation targets** for the same maqām. See §6.3 of the accompanying article for the full analysis.

## Musicological Research

The platform enables systematic analysis of the documented maqām tradition that would be extremely laborious through manual cross-referencing of dispersed, multilingual sources.

### Repertoire Analysis (Forthcoming)

The platform's current scope is theoretical rather than practice-based. Integration with audio analysis for recorded performances is an active research direction, alongside the forthcoming downstream projects described in the accompanying article (§8):

- **Arabic Maqām Identification (MIR)**: automatic maqām identification from audio recordings, using DiArMaqAr's JSON exports as verified theoretical reference data
- **Arabic Maqām Networks**: web-based visualisation and exploration of maqām construction and modulation networks across tuning systems
- **Comparison between documented theory and performance practice**, once audio-analysis capabilities are integrated

### Maqām Naming and Classification

**Theoretical Investigation:**
- Analyse comma-based systems (e.g. al-Ṣabbāgh 1954)
- Understand the relationship between transposition and naming
- Investigate why certain maqām transpositions are given unique names even when sayr is not the differentiating factor

### Arabic Music Pedagogy

**Tuning and Intonation Analysis:**
- Ground pedagogical discussions in historically documented Arabic tuning systems rather than 24-EDO by default
- Provide reference implementations that can support works which engage this subject critically (e.g. Farraj & Shumays 2019, chapter 11)
- Replace unreferenced assertions about Arabic intonation with source-backed pitch-class data
- Enable nuanced discussions beyond binary "quarter-tone vs. not quarter-tone" debates

## Machine Learning and AI Applications

### Training Data

- **Ground truth labels**: Validated, computationally accessible reference data
- **Structured datasets**: Ready for ML model training
- **Provenance**: Transparent source attribution
- **Comprehensive coverage**: Multiple tuning systems and historical frameworks

### Model Development

- **Maqām detection**: Training data with verified labels
- **Modulation prediction**: Network data for sequence modeling
- **Transposition analysis**: Pattern recognition datasets
- **Classification**: Features based on theoretical structures

### Dataset Construction

Address limitations in existing research:
- Documented ground truth methodology
- Multiple performer/reciter data
- Historical framework validation
- Culturally specific feature engineering

## Computational Musicology

### Systematic Analysis

- **Network analysis**: Modulation pathway structures
- **Graph theory**: Relationships between maqāmāt
- **Pattern recognition**: Recurring intervallic structures
- **Comparative studies**: Cross-cultural modal analysis

### Infrastructure for Research

Address gaps identified by Gedik and Bozkurt (2009):
- Valid pitch-class definitions grounded in culturally specific frameworks
- Computationally accessible theory
- Verified reference data
- Transparent methodology

## Instrument Design

### Tuning System Analysis

- **Mathematical precision**: Exact pitch class values
- **Historical frameworks**: Authentic reference data
- **Hardware integration**: Scala export for synthesizers
- **Software instruments**: Accurate implementation of all intervals

### Design Applications

- Digital instrument interfaces
- Software synthesizer design
- Hardware controller mapping
- Pedagogical instrument development

## Pedagogical Research

### Educational Applications

- **Interactive learning**: Real-time exploration of theory
- **Comparative study**: Multiple frameworks simultaneously
- **Visual-auditory integration**: See and hear relationships
- **Systematic exploration**: Comprehensive coverage

### Learning Outcomes

- Understand theoretical evolution
- Compare historical approaches
- Hear mathematical relationships
- Explore beyond simplified models

## Academic Citation

All data exports include:
- **Complete bibliographic references**: Ready for academic citation
- **Source and page numbers**: Precise attribution
- **Historical context**: Temporal framework
- **Scholarly verification**: Enables replication

## Next Steps

- Explore [Bibliographic Sources](/guide/bibliographic-sources/) for citations
- Learn about [Data Export](/guide/data-export/) capabilities
- Understand [Cultural Framework](/guide/cultural-framework/) methodology

