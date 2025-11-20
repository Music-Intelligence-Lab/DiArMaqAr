---
title: Theoretical Framework
description: Understanding the conceptual hierarchy and foundations of Arabic maqām theory in DiArMaqAr
---

# Theoretical Framework

DiArMaqAr's architecture reflects the traditional conceptual hierarchy of maqām theory as documented in historical and contemporary sources. Understanding this framework is essential for effectively using the platform.

## Conceptual Hierarchy

The system organizes content according to five hierarchical levels:

### 1. Tanāghīm (Tuning Systems)

Tuning systems provide the fundamental pitch framework for all operations. A tuning system is an ordered sequence of pitch classes (pitches/tones/notes) that can be expressed through various mathematical representations:

- **Frequency ratios** (fractions such as 1/1, 9/8, 4/3, 3/2)
- **Cents values** (relative to a reference, such as 0, 203.9, 498.0, 702.0)
- **String lengths** or **fret divisions** (historical measurement approaches)

For a tuning system to be rendered sonically, a reference frequency associated with its first pitch class needs to be defined. Additionally, all pitch classes are assigned a note name from the Persian-Arab-Ottoman naming convention to allow for conventional forms of ajnās, maqāmāt and suyūr to be represented across different tuning systems.

**Key Characteristics:**
- Tuning systems contain various amounts of pitch classes
- They use different mathematical approaches based on historical sources
- All values are relative to the first pitch class (1/1 or 0 cents)
- Reference frequency is variable, based on theoretical standardization or performance practice

### 2. Ajnās

A jins (plural, ajnās) is a unique sequence of 3, 4, or 5 notes (trichord, tetrachord, or pentachord), each defined by its characteristic interval pattern. Ajnās are the foundational building blocks of maqāmāt. 

**Key Characteristics:**
- Ajnās are constructed based on their constituent note names
- Not all ajnās are compatible with every tuning system
- The platform searches across the tuning system when determining ajnās compatibility
- Each jins has a specific intervallic pattern that defines its character

**Example:** In Al-Kindī's tuning system, jins kurd (dūgāh, kurdī, chahārgāh, nawā) can be constructed because all these note names exist within the system.

### 3. Maqāmāt

A maqām is a a complete modal framework built from an ordered sequence of pitch classes that form the contituent ajnās from which the maqāmāt are constructed. Each maqām contains:

- **Ascending sequence (ṣuʿūd)**: Seven or more notes defining the upward melodic path
- **Descending sequence (hubūṭ)**: Seven or more notes defining the downward melodic path

The ascending and descending sequences can either be identical or different, creating asymmetrical modal structures.

**Key Characteristics:**
- In DiArMaqAr, the Maqāmāt are constructed based on their constituent note names as defined in bibliographic sources
- The base form of each maqām is subject to tuning system compatibility (all its note names must exist in the selected tuning system)
- All maqāmāt are automatically analyzed for constituent ajnās
- Transpositions are tuning system sensitive, meaning that not all maqāmāt nor all their transpositions are available in every tuning system.

### 4. Suyūr

Suyūr are conventional melodic pathways for developing or modulating within maqām frameworks. These are characteristic modal transformations or transitions, generally understood in performance practice but not always documented in theoretical literature.

**Key Characteristics:**
- Conventional practice, not strictly prescriptive
- Pathways may include modulation and melodic transitions
- Documentation limited; many practical variants exist
- Specific to certain maqāmāt, not universal
- Guide improvisational and compositional choices

**Implementation:**
- Suyūr are implemented as structured sequences of "stops"
- Each stop represents either:
  - A specific note (from the Persian-Arab-Ottoman naming convention)
  - A jins (maintains structural identity while allowing transposition)
  - A maqām (allows description of modulatory pathways)
  - A directional instruction (ascending/descending)
  - A standalone directional instruction

**Historical Context:** In historical sources (Meshshāqa 1899, Al-Shawwā 1946, Al-Ṣabbāgh 1950, Al-Ḥilū 1961), suyūr are always presented as prose text and are never represented for transpositions of any given maqām. DiArMaqAr addresses this limitation through computational transposition of suyūr.

### 5. Intiqālāt

Intiqāl is the process of moving from one maqām to another during performance or composition. Modulation is only possible when the darajat al-istiqrār (stabilizing degree) or tonic of the target jins or maqām exists among the current maqām's pitch classes. DiArMaqAr implements the first algorithmic interpretation of Sāmī al-Shawwā's (1946) modulation guidelines, making explicit the networked relationships underlying maqām modulation theory.

**Key Characteristics:**
- Tonic requirement: Target tonic (darajat al-istiqrār/al-rukūz) must exist in the current pitch class set
- Permitted scale degrees (al-Shawwā): 1st, 3rd, 4th, 5th, or 6th (and/or alternative third)
- Context-dependent, based on pitch class presence and theoretical relationships
- Specific maqāmāt prescribe allowable modulation pathways (suyūr)
- Maintains modal identity: The new maqām establishes its own structure

## Note Naming Convention

The application's data model is fundamentally grounded in the **historical Persian-Arab-Ottoman note naming convention**. This naming system serves as the primary reference framework for all operations:

**Standard Note Names:**
- yegāh, qarār ḥiṣār, ʿushayrān, ʿirāq, rāst, dūgāh, segāh, chahārgāh, nawā, ḥusaynī, awj, etc.

**Extended Ranges:**
- **Lower register**: qarār qarār or qarār prefixes
- **Main register**: Standard note names
- **Upper register**: Standard note names (higher range)
- **Extended upper register**: jawāb or jawāb jawāb prefixes

**Theoretical Significance:**

Using Persian-Arab-Ottoman note names is the only approach that enables exploring multiple tuning systems based on Arabic maqām theory conventions, which regularly analyze maqāmāt using note names rather than historical or mathematical pitch class definitions. This methodology:

- **Grounds analysis in Arabic theoretical frameworks**: Maqām theory developed using these specific note names as the primary organizational system
- **Enables cross-tuning-system analysis**: The same note names (e.g., rāst, dūgāh, segāh) allow comparison across different historical tanāghīm
- **Preserves historical analytical methods**: Reflects how Arabic music theorists have analyzed and documented maqāmāt for centuries
- **Avoids Anglo-European-centric impositions**: Does not force International Pitch Notation (C, D, E) or solfege (do, re, mi)—approaches that became common practice in Arabic music theory only since the mid-20th century
- **Maintains theoretical independence**: Arabic maqām analysis operates within its own conceptual framework without requiring Western reference systems

## Tuning System Starting Note Name

The note name for the first pitch class from which all remaining pitch classes are ordered and calculated is the tuning system's starting note name. This is always associated with the first pitch class in the tuning system (ratio 1/1, 0 cents, or open string length). Starting note names reflect different traditions and methodologies:

- **ʿUshayrān-based**: Related to theorisations based on defining frets/division of the oud strings where the open oud strings are tuned in perfect fourths. ʿUshayrān is the modern note name assigned to the fourth string of a standard 6-string oud, which is the lowest (in pitch) of the four strings that are tuned in fourths.

- **Yegāh-based**: This is the first note name utilised in modern Arabic music theory. It also represents tuning systems that were developed based on long necked lute family instruments (the Persian Tar or Sehtar) or the division of a single string using a monochord or sonometer.

- **Rāst-based**: Tuning systems using rāst for their starting note name are mid-20th century onwards and represent a trend of modifying Anglo-European music theory standards to suit the Arabic maqām system. The note name rāst is associated with the International Pitch Notation note name C. Most theoretical representations of Anglo-European scales or the 12-EDO tuning system start on the note C, as opposed to A which is used to define the reference frequency (i.e. A4 = 440 Hz), hence the modern usage of rāst.

**Key Characteristics:**
- Note name, not actual pitch class
- Always refers to first pitch class
- Frequency value independent; theoretical anchor for ordering
- Not arbitrary: determined by historical or practical tradition

**Theoretical Implications:**

The choice of starting note name is not arbitrary—it represents a fundamental theoretical decision that affects the entire mathematical and practical framework of maqām analysis:

- **Availability of Ajnās and Maqāmāt**: Different tuning system starting note names determine which maqāmāt and ajnās are available within a tuning system. The same tuning system with different starting notes (e.g., ʿushayrān vs. yegāh) may support different numbers of possible maqāmāt and ajnās due to the unequal divisions used in the tuning system itself.

- **Mathematical Relationships**: The starting note name determines how intervals are mathematically organized. Changing the starting note name affects the relative positions of all pitch classes and their intervallic relationships within the tuning system.

- **Intiqālāt (modulations)**: The networks of possible modulations between maqāmāt vary substantially depending on the starting note name of a tuning system. Some modulation pathways that are possible in one system may not be available in another due to the different pitch class organization.

- **Structural Accessibility**: Certain maqām structures may be accessible in a framework based on a certain starting note name but not another, even within the same underlying tuning system. This affects which structures can be constructed and analyzed.

- **Theoretical Framework Significance**: Starting note names signal theoretical, mathematical, or historical approaches (oud-based, monochord-based, or Anglo-European-influenced) rather than simple transpositions. This reflects different epistemological foundations and measurement traditions.

## Mathematical Calculations

The core TuningSystem class implements mathematical conversion between different pitch representation formats, maintaining mathematical accuracy while supporting diverse representations:

- Frequency ratios (fractions)
- Cents values
- String lengths
- Fret divisions
- Deviation from 12-EDO in ±cents
- Frequencies in Hz
- MIDI note numbers in decimal format

All calculations are based on the original unit of measurement in the relevant bibliographic source, ensuring historical accuracy.

## Next Steps

- Learn about [Tuning Systems](/guide/tuning-systems/)
- Explore [Ajnās](/guide/ajnas/)
- Understand [Maqāmāt](/guide/maqamat/)
- Discover [Intiqāl (Modulation)](/guide/intiqal/)

