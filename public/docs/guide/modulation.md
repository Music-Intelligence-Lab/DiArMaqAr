---
url: /docs/guide/modulation.md
description: Understanding Al-Shawwā's modulation algorithm and modulation networks
---

# Modulation (Intiqālāt)

DiArMaqAr implements the **first algorithmic interpretation** of Sāmī al-Shawwā's (1946) modulation guidelines, enabling systematic exploration of intiqālāt (modulation practices) networks that were previously documented only in prose.

## Overview

Unlike Anglo-European modulation theory, Turkish makam theory, or contemporary Arabic theoretical approaches, Al-Shawwā's method employs specific conditions based on scale degree relationships within the Arab-Ottoman-Persian note naming framework.

### Historical Context

Sāmī Al-Shawwā, a revered Cairo-born, Aleppine violinist, provided unique guidelines for maqām modulation in his 1946 work *Al-Qawāʿid al-Fannīya fī al-Mūsīqa al-Sharqīya wa al-Gharbīya* (The Artistic Principles of Eastern and Western Music).

**Key Principle:** Modulation should occur through specific scale degree relationships while maintaining "good disposition" (ḥusn al-taṣarruf) and avoiding abrupt transitions that would be "hard on the ear" (ṣaʿb ʿalā al-udhun).

This approach emphasizes **melodic connection** rather than harmonic compatibility, reflecting the fundamentally melodic nature of maqāmic practice.

## Theoretical Foundation

### The 24-Tone Classification System

Al-Shawwā classified a 24-tone system into three categories based on the Arab-Ottoman-Persian note naming framework:

1. **Aṣlīya or Ṭabīʿīya** (Original/Natural): Represented as "n"
   * These are stable, consonant scale degrees that form the foundation of maqām structure which are whole tones and three-fourths tones.

2. **Anṣāf** (Half-notes, sing. niṣf): Represented as "2p" (two parts)
   * These represent the half-tones

3. **Arbāʿ** (One-fourth notes, sing. rubʿ): Represented as "1p" (one part)
   * These represent one-fourth tones, reflecting our understanding of Arabic maqām theory dividing a whole tone into four unequal parts (not equal divisions)

### The Shawwā Function

Implemented as: *sh(n): N → {"n", "1p", "2p", "/"}*

This function evaluates the validity of proposed modulations based on the specific classification of individual note names within the 24-tone system. The function returns "n" for natural/original notes, "2p" for half-notes (anṣāf), "1p" for quarter-notes (arbāʿ), and "/" for notes outside Al-Shawwā's theoretical framework.

## Modulation Rules

The algorithm evaluates multiple cases for valid transitions:

### 1. Tonic Correspondence

Modulation between maqāmāt sharing the same tonic (qarār), provided the tonic is classified as an "original" note (aṣlīya/ṭabīʿīya, represented as "n").

### 2. Third-Degree Modulation

Transition where the third degree of the source maqām becomes the tonic of the target, valid only when:

* The third degree is classified as an "original" note (aṣlīya/ṭabīʿīya, represented as "n")

### 3. Alternative Third-Degree Modulation

If the standard third degree is invalid, Al-Shawwā permits using an anṣāf (half-note, represented as "2p") scale degree immediately below it, provided:

* It is the sixth pitch class from the fundamental (qarār) scale degree of the source maqām according to the 24-tone list
* It maintains a distance of two pitch classes from the preceding scale degree within the source maqām

### 4. Fourth and Fifth-Degree Modulation

Transitions using the fourth or fifth scale degrees of the source maqām as the tonic of the target.

### 5. Sixth-Degree Modulation (No Third)

When both the third degree and its alternative are invalid, modulation may occur through the sixth scale degree, provided:

* It is the sixteenth or seventeenth pitch class from the tonic of the source maqām
* It remains an "original" scale degree (aṣlīya/ṭabīʿīya, represented as "n")

### 6. Sixth-Degree Modulation (Between Naturals)

The sixth scale degree may also be used when it lies between two "natural" scale degrees within the source maqām.

## Algorithmic Implementation

The `modulate.ts` function implements these rules using Al-Shawwā's specific 24-tone classification system as the reference framework.

**Process:**

1. Evaluates source maqām's scale degrees according to Al-Shawwā's classification
2. Tests each modulation rule against potential target maqāmāt
3. Generates list of valid modulation pathways
4. Creates interactive networks showing relationships

## Using Modulation Analysis

### Via REST API

```bash
# Get modulation analysis for a maqām
curl "http://localhost:3000/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran&includeModulations=true"

# Response includes:
# - Valid modulation targets
# - Modulation type (third-degree, fourth-degree, etc.)
# - Network relationships
```

### Via TypeScript Library

```typescript
import { modulate } from '@/functions/modulate'

// Get valid modulations from source maqām
const modulations = modulate(sourceMaqam, allMaqamat, tuningSystem)

// Each modulation includes:
// - Target maqām
// - Modulation type
// - Scale degree relationship
// - Classification validation
```

## Research Applications

The implementation of the Shawwā algorithm enables:

### Modulation Network Analysis

* **Interactive lists**: All valid modulation pathways from any maqām
* **Network visualization**: Structural relationships between maqāmāt
* **Hub identification**: Central maqāmāt serving as modulation hubs
* **Cluster analysis**: Groups of closely related modes

### Quantitative Analysis

* **Pattern recognition**: Systematic modulation structures
* **Comparative studies**: How modulation possibilities vary across tuning systems
* **Theoretical investigation**: Validation against historical practices

### Compositional Applications

* **Systematic exploration**: Discover modulation pathways
* **Traditional frameworks**: Informed by historical theory
* **Creative practice**: Contemporary composition grounded in tradition

## Limitations and Context

The modulation algorithm:

* Represents **one theoretical perspective** (Al-Shawwā 1946)
* Is historically accurate to documented approach
* Could benefit from incorporating additional frameworks
* May be supplemented by audio analysis of recorded performances

Future enhancements could integrate:

* Modulation analysis from audio recordings
* Additional theoretical frameworks
* Performance practice documentation
* Contemporary compositional approaches

## Next Steps

* Explore [Transposition](/guide/transposition/) capabilities
* Learn about [Maqāmāt](/guide/maqamat/) structure
* Understand [Bibliographic Sources](/guide/bibliographic-sources/)
* Review [Research Applications](/guide/research-applications/)
