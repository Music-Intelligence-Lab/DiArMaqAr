---
title: Canonical Examples
description: Recommended tuning systems, maqāmāt, and ajnās for testing and documentation
---

# Canonical Examples

**PURPOSE**: Use these canonical examples consistently across all documentation, API examples, and user-facing content.

These examples have been carefully selected to demonstrate the full capabilities of the API while respecting the cultural and historical significance of Arabic maqām theory.

## Critical Rule

**⚠️ NEVER use the following for examples, tests, or documentation:**
- `Anglo-European-(1700)`
- `Anglo-European-(1800)`
- `Ronzevalle-(1904)`

These tuning systems are included in the archive for historical completeness, but they are not appropriate as primary examples because they reflect colonial-era attempts to force Arabic maqām theory into Western equal-tempered frameworks.

## Primary Canonical Values

**Most Common Examples** (use in primary documentation):

- **Tuning System**: `IbnSina-(1037)` with starting note `yegah`
- **Maqām**: `maqam_rast`
- **Jins**: `jins_rast`
- **Pitch Class Data Type**: `cents`

**Quick test URL:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
```

---

## Canonical Tuning Systems

### al-Kindi-(874)
**Starting Note**: `ushayran`

**Description**: 12-tone chromatic tuning system based on Greek theory. Does not include zalzalian intervals. Can only render ajnās and maqāmāt that don't use zalzalian notes (kurd, nahāwand, nikrīz, ʿajam ʿushayrān).

**Historical Context**: Al-Kindī's tuning represents the earliest systematic documentation of Arabic music theory, drawing on Hellenistic sources while adapting them to Arabic musical practice.

**Example**:
```
GET /api/tuning-systems/al-Kindi-(874)/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Ajnās without zalzalian intervals: `jins_kurd`, `jins_nahawand`, `jins_nikriz`
- Maqāmāt without zalzalian intervals: `maqam_kurd`, `maqam_nahawand`

---

### al-Farabi-(950g)
**Starting Note**: `ushayran`

**Description**: First documentation of the wuṣtā zalzal interval. Comprehensive 27-tone tuning system that allows for many ajnās and maqāmāt and their transpositions.

**Historical Context**: Al-Fārābī's "Great Book of Music" (Kitāb al-Mūsīqī al-Kabīr) represents a milestone in Arabic music theory, introducing the zalzalian intervals that are characteristic of Arabic maqām practice.

**Example**:
```
GET /api/tuning-systems/al-Farabi-(950g)/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Comprehensive ajnās and maqāmāt coverage
- Zalzalian intervals
- Historical comparison studies

---

### IbnSina-(1037) ⭐ (Most Common)
**Starting Note**: `yegah`

**Description**: Excellent concise and precise 17-tone tuning that allows for a wide range of ajnās and maqāmāt and their transpositions. Includes the wuṣtā zalzal interval.

**Historical Context**: Ibn Sīnā (Avicenna) refined earlier theories into an elegant and practical system that balances theoretical precision with musical usability.

**Why use this as primary example**:
- Comprehensive coverage of most maqāmāt and ajnās
- Historically significant and well-documented
- Balanced between complexity and usability
- Includes zalzalian intervals

**Example**:
```
GET /api/tuning-systems/IbnSina-(1037)/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- All primary maqāmāt: `maqam_rast`, `maqam_bayyat`, `maqam_hijaz`
- All primary ajnās: `jins_rast`, `jins_bayyat`, `jins_hijaz`
- Transpositions and modulations

---

### Meshshaqa-(1899)
**Starting Note**: `yegah`

**Description**: First documented tuning system based on literal quarter tones (24 equal divisions of the octave). Allows for many ajnās and maqāmāt and their transpositions.

**Historical Context**: Mikhāʾīl Mishāqah's tuning represents a modernization of Arabic music theory, introducing equal divisions while maintaining the essential character of Arabic maqāmāt.

**Example**:
```
GET /api/tuning-systems/Meshshaqa-(1899)/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Modern equal-division approach
- Comparison with historical unequal systems
- All maqāmāt and ajnās

---

### CairoCongressTuningCommittee-(1929)
**Starting Note**: `rast`

**Description**: Egyptian tuning system researched and prepared for the 1932 Cairo Congress of Arabic Music. Unequal 24-tone system.

**Historical Context**: The 1932 Cairo Congress brought together musicians, theorists, and scholars to document and standardize Arabic music theory. This tuning reflects Egyptian musical practice.

**Example**:
```
GET /api/tuning-systems/CairoCongressTuningCommittee-(1929)/rast/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Egyptian performance practice
- 20th-century documentation standards
- Unequal divisions vs. equal divisions

---

### al-Sabbagh-(1954)
**Starting Note**: `rast`

**Description**: Only Arabic tuning system that exclusively uses the syntonic comma (81/80) as a basis. Unequal 24-tone system with limited transpositions.

**Historical Context**: Ṭūbiyā al-Ṣabbāgh's system represents a unique theoretical approach focusing on pure acoustic ratios.

**Example**:
```
GET /api/tuning-systems/al-Sabbagh-(1954)/rast/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Acoustic purity approaches
- Limited transposition scenarios
- Theoretical vs. practical systems

---

## Canonical Ajnās

### With Zalzalian Intervals

#### jins_rast ⭐ (Most Common)
**Description**: Includes zalzalian interval segāh. The most fundamental jins in Arabic music.

**Example**:
```
GET /api/ajnas/jins_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Structure**: Ascending tetrachord with a neutral third (segāh) above the tonic.

---

#### jins_bayyat
**Description**: Includes zalzalian interval segāh. Forms the basis of Maqām Bayyātī.

**Example**:
```
GET /api/ajnas/jins_bayyat?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: More melancholic than Rāst, with a distinctive expressive quality.

---

#### jins_segah
**Description**: Tonic is the zalzalian interval segāh. Begins on a neutral note.

**Example**:
```
GET /api/ajnas/jins_segah?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Usage**: Common in modulations and as an upper jins.

---

#### jins_saba
**Description**: Includes zalzalian interval segāh. Known for its distinctive augmented second.

**Example**:
```
GET /api/ajnas/jins_saba?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: Intense and expressive, often used for emotional climaxes.

---

### Without Zalzalian Intervals

#### jins_nikriz
**Description**: Does not include zalzalian intervals. Built from tones and semitones only.

**Example**:
```
GET /api/ajnas/jins_nikriz?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

**Good for testing**: Tuning systems without zalzalian intervals (like al-Kindī).

---

#### jins_kurd
**Description**: Does not include zalzalian intervals. Similar to Western Phrygian mode.

**Example**:
```
GET /api/ajnas/jins_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

**Character**: Minor quality with a lowered second degree.

---

#### jins_nahawand
**Description**: Does not include zalzalian intervals. Similar to Western natural minor.

**Example**:
```
GET /api/ajnas/jins_nahawand?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

**Usage**: Very common in modern Arabic music, especially Egyptian popular music.

---

#### jins_hijaz
**Description**: Does not include zalzalian intervals. Known for its distinctive augmented second.

**Example**:
```
GET /api/ajnas/jins_hijaz?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: Instantly recognizable "Middle Eastern" sound, commonly used in adhān (call to prayer).

---

## Canonical Maqāmāt

### Principle Maqāmāt

#### maqam_rast ⭐ (Most Common)
**Description**: Principle and archetypal Arabic maqām. Includes zalzalian intervals segāh and awj.

**Example**:
```
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: Majestic, balanced, grounding. Often called the "father of maqāmāt."

**Why use this**: Most fundamental maqām, demonstrates all essential features of the API.

**Structure**: Built from two Jins Rāst tetrachords, one on the tonic and one on the fifth.

---

#### maqam_bayyat
**Description**: Principle and archetypal Arabic maqām. Includes zalzalian intervals segāh and awj.

**Example**:
```
GET /api/maqamat/maqam_bayyat?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: Earthy, emotional, introspective. Very common in improvisation.

**Structure**: Built from Jins Bayyātī on the tonic.

---

#### maqam_hijaz
**Description**: Principle Arabic maqām, known for use in the adhān. Includes zalzalian interval awj.

**Example**:
```
GET /api/maqamat/maqam_hijaz?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Character**: Mystical, tense, spiritual. Immediately recognizable.

**Usage**: Extremely common in religious contexts and classical compositions.

---

### Complex/Transposed Maqāmāt

#### rahat-al-arwah
**Description**: Transposition of maqām huzām. Tonic is zalzalian interval ʿirāq.

**Example**:
```
GET /api/maqamat/rahat-al-arwah?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Good for testing**: Transposition logic, non-standard tonics.

---

#### maqam_bestenegar
**Description**: Complex non-octave repeating maqam. Tonic is zalzalian interval segāh.

**Example**:
```
GET /api/maqamat/maqam_bestenegar?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Good for testing**: Non-octave-repeating sequences, complex structures, asymmetric melodic paths.

**Character**: Ottoman-era maqām with elaborate melodic patterns.

---

### Non-Zalzalian Maqāmāt

#### maqam_kurd
**Description**: Prominent in 1960s-70s Egyptian popular music. Does not include zalzalian intervals.

**Example**:
```
GET /api/maqamat/maqam_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

**Good for testing**: Tuning systems without zalzalian intervals.

**Character**: Minor quality, melancholic but accessible.

---

#### maqam_athar-kurd
**Description**: Rarely used maqām. Does not include zalzalian intervals.

**Example**:
```
GET /api/maqamat/maqam_athar-kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

**Good for testing**: Edge cases, availability checking.

---

#### maqam_dilkesh-huran
**Description**: Complex non-octave repeating Ottoman maqām.

**Example**:
```
GET /api/maqamat/maqam_dilkesh-huran?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Good for testing**: Ottoman repertoire, complex non-octave-repeating structures.

---

## Canonical Usage Patterns

### Basic Detail Request
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
```

### With All Optional Parameters
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents&includeArabic=true&includeIntervals=true&includeModulations=true&includeModulations8vb=true&includeSuyur=true"
```

### Parameter Discovery
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&options=true"
```

### Comparison Across Tuning Systems
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/compare?tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&pitchClassDataType=cents"
```

### Transposition
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents&transposeTo=nawa"
```

---

## Testing Combinations

### Test Basic Coverage
- Tuning: `IbnSina-(1037)` on `yegah`
- Maqām: `maqam_rast`
- Jins: `jins_rast`
- Format: `cents`

### Test Zalzalian Intervals
- Tuning: `al-Farabi-(950g)` on `ushayran`
- Ajnās: `jins_rast`, `jins_bayyat`, `jins_segah`, `jins_saba`

### Test Non-Zalzalian Systems
- Tuning: `al-Kindi-(874)` on `ushayran`
- Ajnās: `jins_kurd`, `jins_nahawand`, `jins_nikriz`

### Test Modern Equal Divisions
- Tuning: `Meshshaqa-(1899)` on `yegah`
- Compare with: `IbnSina-(1037)` to see equal vs. unequal

### Test Complex Structures
- Maqām: `maqam_bestenegar` (non-octave-repeating)
- Maqām: `maqam_dilkesh-huran` (Ottoman complexity)

### Test Historical Documentation
- Tuning: `CairoCongressTuningCommittee-(1929)` on `rast`
- Compare with: `al-Sabbagh-(1954)` on `rast`

---

## See Also

- [API Documentation](./index) - Main API overview
- [Interactive Playground](./playground) - Test these examples interactively
- [OpenAPI Specification](/docs/openapi.yaml) - Complete parameter documentation
