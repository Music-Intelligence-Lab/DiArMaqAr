---
title: Tanāghīm (Tuning Systems)
description: Understanding tanāghīm (tuning systems) and their role in Arabic maqām theory
---

# Tanāghīm (Tuning Systems)

Tanāghīm (tuning systems, singular: tanghīm) are the foundational layer of Arabic maqām theory in DiArMaqAr. They provide the pitch framework upon which all other musical structures are built.

## What is a tanghīm?

A tanghīm is an ordered sequence of pitch classes within an octave. These pitch classes can be expressed through various mathematical representations, all relative to the first pitch class.

### Mathematical Representations

**Frequency Ratios (Fractions):**
- Example: 1/1, 9/8, 4/3, 3/2, 16/9
- All ratios are relative to 1/1 (the reference pitch)

**Cents Values:**
- Example: 0, 203.9, 498.0, 702.0, 996.1
- All values are relative to 0 cents (the reference pitch)

**String Lengths / Fret Divisions:**
- Historical measurement approaches used in medieval treatises
- Converted to other formats for computational use

## Reference Frequency and Note Names

To render a tanghīm sonically, two additional pieces of information are needed:

1. **Reference Frequency**: The absolute frequency (in Hz) assigned to the first pitch class
2. **Note Names**: Mapping to the Persian-Arab-Ottoman note naming convention

These associations are documented in historical sources and reflect either theoretical standardization or performance practice traditions.

## Historical Sources

DiArMaqAr integrates tanāghīm spanning over 1,000 years of documented theory and practice, from medieval theorists like al-Kindī (874), al-Fārābī (950), and Ibn Sīnā (1037), through modern sources including the Cairo Congress Tuning Committee (1932) and al-Ṣabbāgh (1950), to contemporary approaches (Allami 2022-2025).

Each tanghīm includes complete bibliographic attribution with source references and page numbers where applicable.

## Extended Range System

In DiArMaqAr, tanāghīm are expanded across multiple registers to support comprehensive musical analysis:

- **Lower register**: qarār qarār or qarār prefixes
- **Main register**: Standard note names
- **Upper register**: Standard note names (higher range)
- **Extended upper register**: jawāb or jawāb jawāb prefixes

This expansion is essential for:
- Jins and maqām analysis across full ranges
- Transposition calculations
- Modulation pathway exploration
- Authentic representation of Arabic theory

## Starting Note Conventions

Tanāghīm follow different starting note conventions based on their historical sources:

**Oud-based systems** start on ʿushayrān, reflecting oud tuning in perfect fourths (e.g., al-Kindī, al-Fārābī, Ibn Sīnā).

**Monochord/sonometer systems** start on yegāh or rāst, reflecting theoretical measurement approaches (e.g., Cairo Congress 1932).

The starting note affects available maqāmāt, transposition possibilities, and modulation characteristics.

## Mathematical Conversion

Each pitch class is automatically converted to multiple formats including frequency ratios, cents, absolute frequencies, MIDI values, string lengths, and cents deviations from 12-EDO reference notes.

## Tanāghīm Whose Octaves Are Not Exact

In most tanāghīm each octave repeats the first exactly, so the pitch classes of the second octave are the first octave's pitch classes doubled. Some historical tanāghīm do not work this way. In the tuning of Ibn Sīnā (1037), every string of the ʿūd carries the same frets while the strings are tuned a fourth apart, so a pitch class of the first dīwān does not always have an exact double in the second. For example, the exact double of 273/256 would be 273/128, but the nearest pitch class of the second dīwān is 512/243, about 21.08 cents lower.

For such tanāghīm, DiArMaqAr stores the values of dīwān 0, 2 and 3 as the source gives them (or as its ʿūd produces them), instead of halving and doubling the first dīwān. The tables mark every value that is not an exact double or half of a value in the neighbouring dīwān.

Note names in these dawāwīn follow one rule. A pitch class that is an exact double or half of a named pitch class, or within 3 cents of one, takes that note's name in the higher or lower register. Any other pitch class takes the name of the nearest named pitch class with tīk when it lies above it, or nīm when it lies below it. When that tīk name already belongs to another pitch class, a pitch class between a note and its tīk is named nīm tīk. The note names tīk yegāh, tīk ʿushayrān, tīk dūgāh and nīm tīk ḥiṣār were added for this rule.

## Viewing a Tanghīm: Jadāwel and Awtār

A tanghīm can be viewed in two ways, chosen under **View**.

**Jadāwel (tables)** shows each dīwān as a table of its pitch classes, with their note names and their values in every unit (ratios, cents, decimal ratios, string lengths, frequencies, MIDI and more). The row in the unit the source uses is marked as the source values.

**Awtār (strings)** shows the same pitch classes on the strings of an ʿūd, from the anf (nut) to half the string length, with every pitch class at its exact position on each string. The labels above and below each string can show the note names (PAO), IPN names, solfège, ratios, cents or fret divisions.

**Dūzān/Taswīya** sets how the open strings are tuned:

- **Source ʿūd**: for a tanghīm whose source describes its ʿūd, such as Ibn Sīnā (1037), the strings, their tuning and the frets are drawn exactly as the source gives them, with the source's own string and fret names. This is the default for those tanāghīm. Each fret's name sits above the strings, at its exact position.
- **Custom**: choose the number of strings and the open note of each string.
- **Presets**: two strings (a fourth apart or a fifth apart), four strings tuned in fourths, and five- and six-string ʿūds named by their lowest and highest open strings.

Positions on a string that are not an exact octave of a value in the neighbouring dīwān are marked, with a legend under the strings. For a tanghīm with a source ʿūd, a note on how the strings represent the source is shown above the commentary.

The view and the dūzān are part of the page address, so a shared link opens the same view: `view=tables` or `view=strings`, and `duzan=` with the preset (for example `duzan=source`), or `duzan=custom&openStrings=yegah,dugah,kurdan` for a custom tuning.

## Using Tanāghīm

### Via REST API

```bash
# Get all available tuning systems (full metadata per tanghīm)
curl https://diarmaqar.net/api/tuning-systems

# There is no GET /api/tuning-systems/{id}; use list + idName, or pitch classes / maqāmāt in context:
curl "https://diarmaqar.net/api/tuning-systems/alfarabi_950g/ushayran/pitch-classes?pitchClassDataType=cents"
```

## Bibliographic Attribution

Every tanghīm includes:
- **Source citation**: Complete bibliographic reference
- **Page references**: Specific pages where the system appears
- **Creator attribution**: Historical theorist or modern scholar
- **Publication year**: Temporal context
- **Commentary**: Contextual notes by Dr. Khyam Allami

This transparent provenance enables:
- Scholarly verification
- Academic citation
- Further research
- Understanding of theoretical evolution

## Next Steps

- Learn how tanāghīm relate to [Ajnās](/guide/ajnas/)
- Explore [Taṣwīr (Transposition)](/guide/taswir/) capabilities
- Understand [Starting Note Conventions](/guide/theoretical-framework/#starting-note-conventions)

