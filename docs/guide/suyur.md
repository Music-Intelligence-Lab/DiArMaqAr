---
title: Suyūr
description: Understanding suyūr as traditional melodic development pathways
---

# Suyūr

Suyūr are conventional melodic pathways for developing or modulating within maqām frameworks. These are characteristic modal transformations or transitions, generally understood in performance practice. They go beyond the basic ascending and descending sequences to describe characteristic melodic progressions, emphasis points, and developmental patterns.

## What are Suyūr?

Suyūr are structured descriptions of how maqāmāt are traditionally developed in performance. While the ascending and descending sequences define the basic structure, suyūr describe the actual melodic pathways musicians follow.

### Historical Documentation

Suyūr documentation appears in important Arabic music theory sources:
- Meshshāqa (1899)
- Al-Shawwā (1946)
- Al-Ṣabbāgh (1950)
- Al-Ḥilū (1961)

**Important Note:** In these historical sources, suyūr are always presented as prose text and are never represented for transpositions of any given maqām. DiArMaqAr addresses this limitation through computational transposition of suyūr.

## Structure: "Stops"

Suyūr are implemented as structured sequences of "stops," where each stop represents:

**Note Stops:**
- A specific note from the Persian-Arab-Ottoman naming convention
- Example: "dūgāh" or "ḥusaynī"

**Jins Stops:**
- A reference to a jins
- Maintains structural identity while allowing transposition

**Maqām Stops:**
- A reference to another maqām
- Allows description of modulatory pathways

**Directional Instructions:**
- Standalone instructions like "ascending" or "descending"
- Indicate melodic direction

**Combined Instructions:**
- Direction combined with note/jins/maqām
- Example: "ascending to nawā"

Jins stops do more than record structural identity: the sources naming a jins at a note is exactly the evidence used to [decide which jins leads when a maqām degree matches several](/guide/maqamat/#multiple-ajnas-on-one-degree).

## Transposition of Suyūr

One of the platform's innovative features is the **automatic transposition of suyūr** to any possible maqām transposition.

### How It Works

The `transposeSayr()` function operates through three stages:

1. **Calculate Transposition Interval**
   - Compares the first notes of original and target maqāmāt
   - Determines the interval shift required

2. **Apply Intelligent Note Shifting**
   - Shifts note stops by the calculated interval
   - Includes bounds checking to prevent invalid transpositions
   - Maintains musical logic

3. **Process Different Stop Types**
   - **Note stops**: Direct pitch transposition
   - **Jins stops**: Maintain structural identity while transposing starting note
   - **Maqām stops**: Transpose to equivalent maqām transposition
   - **Directional instructions**: Remain unchanged

### Example

**Original Sayr for Maqām Rāst (starting on dūgāh):**
```
dūgāh → ascending → segāh → jins bayāt al-segāh → nawā
```

**Transposed Sayr for Maqām Rāst (starting on nawā):**
```
nawā → ascending → kurdān → jins bayāt al-kurdān → muḥayyar
```

## Which Suyūr Can Be Played

A sayr is shown, returned by the API and counted in the [statistics](/api/#statistics) only where it can be played: in the tuning system and on the starting note selected, on the maqām form being shown. On a taṣwīr or an octave rendering, the sayr is first moved onto that form's tonic, then judged.

Every stop must be playable:

- **Note stops**: the tuning system has the note, and moving the sayr does not push it past either end of the tuning system's range.
- **Jins and maqām stops**: the tuning system lists that jins or maqām on that note as one of its forms (its base form, a taṣwīr or an octave rendering), with the same intervals within the cents tolerance. Having the notes is not enough.
- **Directional instructions**: always playable.

For example, Cairo Congress (1929) on yegāh has the notes nawā, ḥusaynī, awj and kurdān. But between them the steps are 200, 149 and 149 cents, while jins rāst is 204, 149 and 159 cents. The last step differs by 10 cents, beyond the 5-cent tolerance, so this tuning system has no jins rāst on nawā, and a sayr that moves to jins rāst on nawā is not playable there. In al-Kindī's tuning system (874), the sayr of maqām nikrīz that descends to ʿirāq is not playable, because the tuning system has no ʿirāq.

A jins or maqām stop that names no starting note sits on that jins's or maqām's own first note, and moves with the rest of the sayr.

## Multilingual Support

Suyūr are preserved in their original Arabic form with translations:
- Original Arabic prose from historical sources
- English (and French, where applicable) translations maintaining scholarly accuracy
- Library of Congress Arabic Romanization standard

## Using Suyūr

### Via REST API

Suyūr are included in maqām responses:

```bash
# Get maqām with suyūr
curl "https://diarmaqar.net/api/maqamat/maqam_bayyat?tuningSystem=alfarabi_950g&startingNote=ushayran&includeSuyur=true"

# Transpositions are listed via the transpositions endpoint (combine with the detail response as needed)
curl "https://diarmaqar.net/api/maqamat/maqam_bayyat/transpositions?tuningSystem=alfarabi_950g&startingNote=ushayran"
```

## Research Applications

The computational transposition of suyūr enables:

- **Systematic exploration**: All possible melodic pathways across pitch centers
- **Comparative analysis**: How suyūr vary across transpositions
- **Theoretical investigation**: Relationships between structure and performance practice
- **Pedagogical use**: Learning traditional pathways in different keys

## Historical Significance

Suyūr represent one of the most detailed aspects of Arabic maqām theory that has rarely been systematically documented in computational form. By making these pathways accessible and transposable, DiArMaqAr provides unprecedented tools for:

- Understanding traditional performance practices
- Comparing theoretical frameworks
- Exploring melodic development patterns
- Supporting contemporary composition informed by tradition

## Next Steps

- Learn about [Maqāmāt](/guide/maqamat/) structure
- Explore [Taṣwīr (Transposition)](/guide/taswir/) capabilities
- Understand [Intiqāl (Modulation)](/guide/intiqal/) practices
- Review [Bibliographic Sources](/guide/bibliographic-sources/)

