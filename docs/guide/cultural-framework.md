---
title: Cultural Framework
description: Decolonial computing principles and culture-specific methodology
---

# Cultural Framework

DiArMaqAr implements a culture-specific methodology that centres Arabic theoretical frameworks and epistemological systems. By grounding every operation in the tradition's own scholarship, terminology, and analytical categories, the platform approaches Arabic maqām as an autonomous scholarly and musical tradition with its own intellectual history.

## Decolonial Computing Principles

### Foundational Philosophy

Computational approaches to musicology have historically reflected what Serra (2011) identified as a foundational epistemological problem: information technologies imposing the paradigms of market-driven western culture. In parallel, Irani et al.'s (2010) postcolonial computing framework articulated how digital technologies can either reinforce or challenge hierarchies of knowledge. Ali (2016) extended this analysis to encourage designing systems informed by cultural epistemologies to undermine global power asymmetries, rather than extending Anglo-European-centric frameworks to new domains — a perspective further developed by Abdilla et al. (2018) on decolonising digital technology as cultural practice. Together, these perspectives treat cultural assumptions as architectural decisions embedded in technical foundations, not merely as user-interface choices.

### DiArMaqAr's Approach

DiArMaqAr implements this perspective by:

1. **Grounding all operations in the Persian-Arab-Ottoman note naming convention**
   - PAO note names (rāst, dūgāh, segāh, chahārgāh, nawā…) serve as the platform's foundational data abstraction and primary pitch identifier.
   - Structuring all pitch-class representations through PAO enables tuning-system-sensitive rendering of every maqām, jins, and taṣwīr across compiled tanāghīm, without privileging any single theoretical framework.

2. **Implementing Arabic theoretical categories at the system level**
   - The data model is organised around the conceptual hierarchy of Arabic maqām theory: tanāghīm, ajnās, maqāmāt, suyūr, and intiqālāt.
   - Computational operations — rendering, transposition, modulation — are built directly from this hierarchy.
   - The interface presents Arabic concepts in their original terminology and categories.

3. **Treating Arabic maqām theory as an autonomous musical epistemology**
   - Arabic maqām theory is presented on its own terms: an independent scholarly and musical tradition with its own note-name system, tuning frameworks, and analytical categories.
   - Longstanding debates around tuning and intonation are addressed by providing direct access to the documented diversity of historical frameworks across more than a millennium of scholarship.

## Historical Authenticity

### Source-Based Implementation

- **Historical sources**: medieval treatises through modern scholarship
- **Bibliographic attribution**: complete source references for every tuning system, jins, maqām, and sayr
- **Scholarly verification**: enables academic citation and reproduction
- **Transparent provenance**: clear data origin with source and page citations

### Avoiding Standardisation Bias

Since the mid-20th century, Anglo-European standardisation pushed Arabic maqām theory toward a 24-tone system (not necessarily equally tempered), collapsing the diversity of historical systems from the 10th–14th centuries that utilised varying numbers of pitch classes — al-Fārābī's 27, 35 or 22 (Forster 2010:643), Ibn Sīnā's 17 (Farmer 1937:249), al-Urmawī's 17 (al-Urmawī, Khashaba 1986/2017), and al-Lādhiqī's 17 (Allāh Wīrdī 1949:163-164). Modern Arab theorists such as al-Ḥilū (1961:76) sought to simplify the system through Anglo-European logics, attributing its complexities to centuries of "neglect" rather than recognising them as inherent to the tradition.

DiArMaqAr:

- Preserves historical diversity across tuning systems
- Avoids forcing external frameworks or a single theoretical model
- Maintains multiple theoretical approaches side by side
- Respects interpretative flexibility

## Computational Representation

### Culture-Specific Formalisation

Following Serra (2017), DiArMaqAr approaches Arabic maqām as "a system of interconnected entities" that require "adequate digital traces" and "rigorous formalisation", grounded in culture-specific theoretical frameworks.

The platform's architecture operationalises this framework through:

- **A conceptual hierarchy drawn from the tradition itself**: tanāghīm, ajnās, maqāmāt, suyūr, and intiqālāt, with the Persian-Arab-Ottoman note naming convention functioning as the foundational data model.
- **Five curated JSON corpora** — tuning systems, ajnās, maqāmāt, sources, and patterns — preserving academic provenance and supporting every platform operation.
- **Faithful units of measurement**: each tanghīm's pitch class values are entered in the original unit used in its bibliographic source (fraction ratios, cents, string lengths, or fret divisions) and dynamically converted between representations while maintaining mathematical accuracy.
- **A practice-based perspective** combining rigorous academic research and computational precision, re-reading primary texts alongside secondary compilations to render the musical information unified, meaningful, true to its sources, and immediately accessible.

### Integration of Perspectives

As Srinivasamurthy et al. (2023) demonstrate for Indian art music, computational musicology requires:
- Integration of ethnomusicological perspectives alongside signal processing
- Making explicit what remains implicit in Anglo-European-centric approaches
- Recognising that every computational method carries embedded musicological assumptions

## Research Implications

DiArMaqAr addresses the core structural problem identified by Gedik and Bozkurt (2009) in the computational research of modal musics:
- Divergence between theory and practice
- Lack of reliable, computationally accessible theory
- Need for valid pitch-class definitions grounded in culturally specific frameworks

## Multilingual Support

- **Library of Congress Romanization**: international scholarly standards
- **Arabic script**: native language support
- **Reverse transliteration**: accurate conversion between Arabic script and romanised forms
- **Cultural accessibility**: local and international communities (Arabic, English, French)

## Next Steps

- Learn about [Theoretical Framework](/guide/theoretical-framework/)
- Explore [Bibliographic Sources](/guide/bibliographic-sources/)
- Understand [Research Applications](/guide/research-applications/)
