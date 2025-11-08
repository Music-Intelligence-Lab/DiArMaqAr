---
title: Canonical Examples
description: Recommended tuning systems, maqāmāt, and ajnās for testing and documentation
---

# Canonical Examples

These examples have been carefully selected to demonstrate the full capabilities of the API while respecting the cultural and historical significance of Arabic maqām theory. 

**Quick test URL:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
```

---

## Canonical Tuning Systems

### `al-Kindi-(874)` - al-Kindī (874)
**Starting Note**: `ushayran` - ʿushayrān

**Description**: One of the oldest tuning systems documented in Arabic music theory. It is a 12-tone chromatic tuning system based on Greek theory and doesn't include the quintessential so-called Arabic "quarter tone" pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj, also referred to as zalzalian intervals. It can only render ajnās and maqāmāt that don't use those notes such as kurd, nahāwand, nikrīz and ʿajam ʿushayrān.

**Historical Context**: Al-Kindī's tuning represents the earliest systematic documentation of Arabic music theory, drawing on Hellenistic sources while adapting them to Arabic musical practice.

**Example**:
```
GET /api/tuning-systems/al-Kindi-(874)/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Ajnās without zalzalian intervals: `jins_kurd`, `jins_nahawand`, `jins_nikriz`
- Maqāmāt without zalzalian intervals: `maqam_kurd`, `maqam_nahawand`

---

### `al-Farabi-(950g)` - al-Fārābī (950g)
**Starting Note**: `ushayran` - ʿushayrān

**Description**: The first documentation of the wuṣtā zalzal interval, the so-called Arabic "quarter tone" using a frequency ratio of 27/22. It is a comprehensive 27-tone tuning system that allows for many ajnās and maqāmāt and their transpositions, therefore also modulations.

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

### `IbnSina-(1037)` - Ibn Sīnā (1037) ⭐ (Most Common)
**Starting Note**: `yegah` - yegāh

**Description**: An excellent concise and precise 17-tone tuning that allows for a wide range of ajnās and maqāmāt and their transpositions. Includes the wuṣtā zalzal interval with the frequency ratio of 39/32.

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

### `Meshshaqa-(1899)` - Mishāqah (1899)
**Starting Note**: `yegah` - yegāh

**Description**: The first documented tuning system that is based on literal quarter tones, 24 equal divisions of the octave. Defined by Mishāqah as the "Arabic Octave According to the Modernists", meaning that it was already known before him but undocumented - though no one knows if it was really used. Because it is 24 equal divisions of the octave it allows for many ajnās and maqāmāt and their transpositions, therefore also modulations. Even though it allows the same number of maqāmāt as Ibn Sīnā's tuning system, it allows for more transpositions.

**Historical Context**: Mikhāʾīl Mishāqah's tuning represents a modernization of Arabic music theory, introducing equal divisions while maintaining the essential character of Arabic maqāmāt.

**Example**:
```
GET /api/tuning-systems/Meshshaqa-(1899)/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Modern equal-division approach
- Comparison with historical unequal systems
- All maqāmāt and ajnās
- Extended transposition capabilities

---

### `CairoCongressTuningCommittee-(1929)` - Cairo Congress Tuning Committee (1929)
**Starting Note**: `rast` - rāst

**Description**: The tuning system researched, measured and prepared in preparation for the 1932 Cairo Congress of Arabic Music. It is referred to as an "Egyptian Tuning" and is an unequal 24-tone system. Also comprehensive in its maqām availability and was rendered based on the measurement and expertise of Egyptian musicians at the time.

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

### `al-Sabbagh-(1954)` - al-Ṣabbāgh (1954)
**Starting Note**: `rast` - rāst

**Description**: The only Arabic tuning system that exclusively uses the "comma" (syntonic comma of 81/80) as a basis for its construction. It is an unequal 24-tone system and allows for many maqāmāt and ajnās but with limited transpositions.

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

**Ajnās with zalzalian intervals** (ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj):

### `jins_rast` - jins rāst ⭐ (Most Common)

**Description**: Includes the zalzalian interval segāh. The most fundamental jins in Arabic music.

**Structure**: Ascending tetrachord with a neutral third (segāh) above the tonic.

**Example**:
```
GET /api/ajnas/jins_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `jins_bayyat` - jins bayyāt

**Description**: Includes the zalzalian interval segāh. Forms the basis of Maqām Bayyātī.

**Character**: More melancholic than Rāst, with a distinctive expressive quality.

**Example**:
```
GET /api/ajnas/jins_bayyat?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `jins_segah` - jins segāh

**Description**: Its tonic is the zalzalian interval segāh. Begins on a neutral note.

**Usage**: Common in modulations and as an upper jins.

**Example**:
```
GET /api/ajnas/jins_segah?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `jins_saba` - jins ṣabā

**Description**: Includes the zalzalian interval segāh. Known for its distinctive augmented second.

**Character**: Intense and expressive, often used for emotional climaxes.

**Example**:
```
GET /api/ajnas/jins_saba?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

**Ajnās without zalzalian intervals:**

### `jins_nikriz` - jins nikrīz

**Description**: Does not include a zalzalian interval. Built from tones and semitones only.

**Good for testing**: Tuning systems without zalzalian intervals (like al-Kindī).

**Example**:
```
GET /api/ajnas/jins_nikriz?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `jins_kurd` - jins kurd

**Description**: Does not include a zalzalian interval. Similar to Western Phrygian mode.

**Character**: Minor quality with a lowered second degree.

**Example**:
```
GET /api/ajnas/jins_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `jins_kurd_(binsir)` - jins kurd (binsir)

**Description**: The same as jins kurd but starting on a different tonic, giving it slightly different intervals. Interesting for comparison and understanding why the maqām based on it (maqām ḥijāz kār kurd) is supposedly a transposition of maqām kurd with the same intervals, but in fact is not. Does not include a zalzalian interval.

**Good for testing**: Transposition analysis, interval pattern comparison.

**Example**:
```
GET /api/ajnas/jins_kurd_(binsir)?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `jins_nahawand` - jins nahāwand

**Description**: Does not include a zalzalian interval. Similar to Western natural minor.

**Usage**: Very common in modern Arabic music, especially Egyptian popular music.

**Example**:
```
GET /api/ajnas/jins_nahawand?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `jins_hijaz` - jins ḥijāz

**Description**: Does not include a zalzalian interval. Known for its distinctive augmented second.

**Character**: Instantly recognizable "Middle Eastern" sound, commonly used in adhān (call to prayer).

**Example**:
```
GET /api/ajnas/jins_hijaz?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `jins_hijaz_(binsir)` - jins ḥijāz (binsir)

**Description**: The same as jins ḥijāz but starting on a different tonic, giving it slightly different intervals. Interesting for comparison. Does not include a zalzalian interval.

**Good for testing**: Interval pattern comparison, transposition analysis.

**Example**:
```
GET /api/ajnas/jins_hijaz_(binsir)?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

## Canonical Maqāmāt

**Principle maqāmāt** - fundamental and archetypal:

### `maqam_rast` - maqām rāst ⭐ (Most Common)

**Description**: One of the principle and archetypal Arabic maqāmāt. Prominently used in Egypt across both popular and religious sufi musics. Includes the zalzalian intervals segāh and awj in its ascending form.

**Character**: Majestic, balanced, grounding. Often called the "father of maqāmāt."

**Structure**: Built from two Jins Rāst tetrachords, one on the tonic and one on the fifth.

**Why use this**: Most fundamental maqām, demonstrates all essential features of the API.

**Example**:
```
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `maqam_bayyat` - maqām bayyāt

**Description**: Also a principle and archetypal Arabic maqām, that is used widely in popular and rural musics across the Arabic speaking region and beyond. It is the base maqām for many variations in Arabic repertoire and beyond. Includes the zalzalian interval segāh and awj in its ascending form.

**Character**: Earthy, emotional, introspective. Very common in improvisation.

**Structure**: Built from Jins Bayyātī on the tonic.

**Example**:
```
GET /api/maqamat/maqam_bayyat?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `maqam_hijaz` - maqām ḥijāz

**Description**: A principle Arabic maqām, known primarily for its use in the adhān, the call to prayer. Includes the zalzalian interval awj in its ascending form.

**Character**: Mystical, tense, spiritual. Immediately recognizable.

**Usage**: Extremely common in religious contexts and classical compositions.

**Example**:
```
GET /api/maqamat/maqam_hijaz?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

**Complex and transposed maqāmāt:**

### `maqam_rahat_al-arwah` - rāḥat al-arwāḥ

**Description**: A transposition of maqām huzām given its own name because of its character. Its darajat al-istiqrār (tonic) is the zalzalian interval ʿirāq.

**Good for testing**: Transposition logic, non-standard tonics, zalzalian tonics.

**Example**:
```
GET /api/maqamat/maqam_rahat_al-arwah?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### `maqam_bestenegar` - maqām bestenegar

**Description**: Complex and rarely used non-octave repeating maqam. Its darajat al-istiqrār (tonic) is the zalzalian interval segāh.

**Character**: Ottoman-era maqām with elaborate melodic patterns.

**Good for testing**: Non-octave-repeating sequences, complex structures, asymmetric melodic paths, zalzalian tonics.

**Example**:
```
GET /api/maqamat/maqam_bestenegar?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

**Maqāmāt without zalzalian intervals:**

### `maqam_kurd` - maqām kurd

**Description**: This maqām came to much prominence in 1960s and 70s Egyptian popular music, and is one of the most used in pop music across the region today. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Character**: Minor quality, melancholic but accessible.

**Good for testing**: Tuning systems without zalzalian intervals, modern popular music contexts.

**Example**:
```
GET /api/maqamat/maqam_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `maqam_athar-kurd` - maqām āthār kurd

**Description**: A rarely used maqām with a very specific character. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Good for testing**: Edge cases, availability checking, rare maqāmāt.

**Example**:
```
GET /api/maqamat/maqam_athar-kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### `maqam_dilkesh-huran` - maqām dilkesh ḥūrān

**Description**: A complex non-octave repeating Ottoman maqām that is rarely used in Arabic music but was a part of early 20th century music theory.

**Good for testing**: Ottoman repertoire, complex non-octave-repeating structures, early 20th century theory.

**Example**:
```
GET /api/maqamat/maqam_dilkesh-huran?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

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
