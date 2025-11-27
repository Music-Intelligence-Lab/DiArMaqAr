---
title: Representative Examples
description: Recommended tuning systems, maqāmāt, and ajnās for proper API usage
---

# Representative Examples

These examples have been carefully selected to demonstrate the full capabilities of the API while respecting the cultural and historical significance of Arabic maqām theory. 

**Quick test URL:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
```

## Quick Access

Jump to specific example categories:

- **[Representative Tuning Systems](#representative-tuning-systems)** - Historical and contemporary tuning systems
  - [al-Kindī (874)](#al-kindī-874---al-kindi-874) - 12-Tone
  - [al-Fārābī (950g)](#al-fārābī-950g---al-farabi-950g) - First Oud Tuning 27-Tone
  - [Ibn Sīnā (1037)](#ibn-sīnā-1037---ibnsina-1037) - 7-Fret Oud 17-Tone
  - [Meshshāqa (1899)](#meshshāqa-1899---meshshaqa-1899) - Arabic Octave According to the Modernists
  - [Cairo Congress Tuning Committee (1929)](#cairo-congress-tuning-committee-1929---cairocongresstuningcommittee-1929) - Egyptian Tuning
  - [al-Ṣabbāgh (1954)](#al-ṣabbāgh-1954---al-sabbagh-1954) - Contemporary Arabic Tuning 24-Tone

- **[Representative Ajnās](#representative-ajnās)** - Tri/tetra/penta-chords
  - With zalzalian intervals: [jins rāst](#jins-rāst---jins_rast), [jins bayyāt](#jins-bayyāt---jins_bayyat), [jins segāh](#jins-segāh---jins_segah), [jins ṣabā](#jins-ṣabā---jins_saba)
  - Without zalzalian intervals: [jins nikrīz](#jins-nikrīz---jins_nikriz), [jins kurd](#jins-kurd---jins_kurd), [jins nahāwand](#jins-nahāwand---jins_nahawand), [jins ḥijāz](#jins-ḥijāz---jins_hijaz)

- **[Representative Maqāmāt](#representative-maqāmāt)** - Complete modal frameworks
  - Principle maqāmāt: [maqām rāst](#maqām-rāst---maqam_rast), [maqām bayyāt](#maqām-bayyāt---maqam_bayyat), [maqām ḥijāz](#maqām-ḥijāz---maqam_hijaz)
  - Complex and transposed: [rāḥat al-arwāḥ](#rāḥat-al-arwāḥ---maqam_rahat_al-arwah), [maqām bestenegar](#maqām-bestenegar---maqam_bestenegar)
  - Without zalzalian intervals: [maqām kurd](#maqām-kurd---maqam_kurd), [maqām āthār kurd](#maqām-āthār-kurd---maqam_athar-kurd), [maqām dilkesh ḥūrān](#maqām-dilkesh-ḥūrān---maqam_dilkesh-huran)

---

## ⚠️ Critical Requirements

**REQUIRED Parameters for Detail Endpoints:**

All detail endpoints (`/api/maqamat/{id}`, `/api/ajnas/{id}`) **MUST** include these three parameters:

1. **`tuningSystem`** - ID of the tuning system (e.g., `IbnSina-(1037)`)
2. **`startingNote`** - Starting note in URL-safe format (e.g., `yegah`, `ushayran`, `rast`)
3. **`pitchClassDataType`** - Format for pitch class data (e.g., `cents`, `fraction`, `all`)

**Why these are required:**
- Pitch class calculations depend on the tuning system and starting note
- The API needs to know which format to return the data in
- Without these parameters, the API cannot calculate or return pitch class data

**Example - CORRECT:**
```bash
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

**Example - WRONG (missing parameters):**
```bash
GET /api/maqamat/maqam_rast  # ❌ Missing required parameters
GET /api/maqamat/rast  # ❌ Wrong endpoint format AND missing parameters
```

---

## ❌ Common Mistakes to Avoid

### 1. Missing Required Parameters

**WRONG:**
```bash
GET /api/maqamat/maqam_rast
GET /api/ajnas/jins_rast
```

**CORRECT:**
```bash
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
GET /api/ajnas/jins_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

### 2. Wrong Endpoint Format

**WRONG:**
```bash
GET /api/maqamat/rast  # Missing "maqam_" prefix
GET /api/ajnas/rast     # Missing "jins_" prefix
```

**CORRECT:**
```bash
GET /api/maqamat/maqam_rast  # Includes "maqam_" prefix
GET /api/ajnas/jins_rast     # Includes "jins_" prefix
```

### 3. Using Display Names Instead of URL-Safe IDs

**WRONG:**
```bash
GET /api/maqamat/maqam_rast?tuningSystem=Ibn Sīnā (1037)&startingNote=yegāh
```

**CORRECT:**
```bash
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah
```

**Note:** All IDs and parameter values must be URL-safe (no spaces, diacritics, or special characters).

### 4. Parameter Discovery

If you need to discover available parameters, use `options=true`:

```bash
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&options=true
```

This returns available parameters instead of data, which is useful for programmatic discovery.

---

## 🤖 For LLMs and AI Assistants

**Explicit Instructions for AI Systems:**

1. **Always include required parameters** (`tuningSystem`, `startingNote`, `pitchClassDataType`) for detail endpoints
2. **Use Representative Examples** (this page) as the source of truth for correct API usage
3. **Reference the OpenAPI specification** at `/docs/openapi.json` for complete parameter documentation
4. **Use parameter discovery** (`options=true`) to programmatically discover available parameters

**Example Parameter Discovery Request:**
```bash
GET /api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&options=true
```

**Response includes:**
- Available tuning systems for this maqām
- Available starting notes for each tuning system
- Available pitch class data types
- All other optional parameters

**Best Practice:**
- When users ask about a specific maqām, jins, or tuning system, use the Representative Examples to find the correct endpoint format
- Always include all three required parameters
- Use `cents` as the default `pitchClassDataType` for most use cases
- For users who don't know specific names, use `maqam_rast` with `IbnSina-(1037)` and `yegah` as safe defaults

---

## 📋 Actual Response Structure

API responses are complex nested structures, not simple arrays. A typical response includes:

**Key Response Fields:**
- `maqam` / `jins` - Entity metadata (id, idName, displayName, version, etc.)
- `pitchData` - Pitch class data in ascending/descending arrays
- `intervals` - Interval data (if `includeIntervals=true`)
- `context` - Tuning system context, starting note info, reference frequencies
- `sources` - Bibliographic source references
- `links` - Related API endpoint URLs
- `stats` - Statistics (number of pitch classes, etc.)
- `characteristics` - Musical characteristics (isOctaveRepeating, hasAsymmetricDescending, etc.)

**Minimal Example Response:**
```json
{
  "maqam": {
    "id": "maqam_rast",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-10-18T19:42:23.643Z"
  },
  "pitchData": {
    "ascending": [
      { "cents": 0, "englishName": "yegāh", ... },
      { "cents": 204, "englishName": "ʿushayrān", ... },
      ...
    ],
    "descending": [...]
  },
  "context": {
    "tuningSystem": {
      "id": "IbnSina-(1037)",
      "displayName": "Ibn Sīnā (1037) - 7-Fret Oud 17-Tone",
      "selectedStartingNote": { "idName": "yegah", "displayName": "yegāh" },
      "referenceFrequency": 97.999
    },
    "pitchClassDataType": "cents"
  },
  "sources": [...],
  "links": {...}
}
```

**For complete response schemas**, see the [OpenAPI Specification](../openapi.json).

---

## Representative Tuning Systems

### al-Kindī (874) - `al-Kindi-(874)`
**Title**: 12-Tone
**Starting Note**: ʿushayrān - `ushayran`

**Description**: One of the oldest tuning systems documented in Arabic music theory. It is a 12-tone chromatic tuning system based on Greek theory and doesn't include the quintessential so-called Arabic "quarter tone" pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj, also referred to as zalzalian intervals. It can only render ajnās and maqāmāt that don't use those notes such as kurd, nahāwand, nikrīz and ʿajam ʿushayrān.

**Source**: [Farmer (1937:248)](../../bibliography?source=Farmer-(1937)), [Forster (2010:615)](../../bibliography?source=Forster-(2010))

**Required Parameters:**
- `tuningSystem`: `al-Kindi-(874)`
- `startingNote`: `ushayran`
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET /api/tuning-systems/al-Kindi-(874)/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Ajnās without zalzalian intervals: `jins_kurd`, `jins_nahawand`, `jins_nikriz`
- Maqāmāt without zalzalian intervals: `maqam_kurd`, `maqam_nahawand`

---

### al-Fārābī (950g) - `al-Farabi-(950g)`
**Title**: First Oud Tuning (Full First Octave) 27-Tone
**Starting Note**: ʿushayrān - `ushayran`

**Description**: The first documentation of the wuṣtā zalzal interval, the so-called Arabic "quarter tone" using a frequency ratio of 27/22. It is a comprehensive 27-tone tuning system that allows for many ajnās and maqāmāt and their transpositions, therefore also modulations.

**Source**: [Farmer (1937:249)](../../bibliography?source=Farmer-(1937)), [Land (1885:134-137)](../../bibliography?source=Land-(1885)), [d'Erlanger (1930:165-185)](../../bibliography?source=d'Erlanger-(1930))

**Example**:
```
GET /api/tuning-systems/al-Farabi-(950g)/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Comprehensive ajnās and maqāmāt coverage
- Zalzalian intervals
- Historical comparison studies

---

### Ibn Sīnā (1037) - `IbnSina-(1037)`
**Title**: 7-Fret Oud 17-Tone
**Starting Note**: yegāh - `yegah`

**Description**: An excellent concise and precise 17-tone tuning that allows for a wide range of ajnās and maqāmāt and their transpositions. Includes the wuṣtā zalzal interval with the frequency ratio of 39/32.

**Source**: [Farmer (1937:249)](../../bibliography?source=Farmer-(1937))

**Example**:
```
GET /api/tuning-systems/IbnSina-(1037)/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- All primary maqāmāt: `maqam_rast`, `maqam_bayyat`, `maqam_hijaz`
- All primary ajnās: `jins_rast`, `jins_bayyat`, `jins_hijaz`
- Transpositions and modulations

---

### Meshshāqa (1899) - `Meshshaqa-(1899)`
**Title**: Arabic Octave According to the Modernists
**Starting Note**: yegāh - `yegah`

**Description**: The first documented tuning system that is based on literal quarter tones, 24 equal divisions of the octave. Defined by Meshshāqa as the "Arabic Octave According to the Modernists", meaning that it was already known before him but undocumented - though no one knows if it was really used. Because it is 24 equal divisions of the octave it allows for many ajnās and maqāmāt and their transpositions, therefore also modulations. Even though it allows the same number of maqāmāt as Ibn Sīnā's tuning system, it allows for more transpositions.

**Source**: [Meshshāqa (1899:18)](../../bibliography?source=Meshshāqa-(1899))

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

### Cairo Congress Tuning Committee (1929) - `CairoCongressTuningCommittee-(1929)`
**Title**: Egyptian Tuning
**Starting Note**: rāst - `rast`

**Description**: The tuning system researched, measured and prepared in preparation for the 1932 Cairo Congress of Arabic Music. It is referred to as an "Egyptian Tuning" and is an unequal 24-tone system. Also comprehensive in its maqām availability and was rendered based on the measurement and expertise of Egyptian musicians at the time.

**Source**: [Shawqi (1969:48-49)](../../bibliography?source=Shawqi-(1969)), [na. (1933:336)](../../bibliography?source=na.-(1933)), [Allāh-Wīrdī (1949:80)](../../bibliography?source=Allāh-Wīrdī-(1949))

**Example**:
```
GET /api/tuning-systems/CairoCongressTuningCommittee-(1929)/rast/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Egyptian performance practice
- 20th-century documentation standards
- Unequal divisions vs. equal divisions

---

### al-Ṣabbāgh (1954) - `al-Sabbagh-(1954)`
**Title**: Contemporary Arabic Tuning 24-Tone
**Starting Note**: rāst - `rast`

**Description**: The only documented theorisation of an Arabic tuning system that exclusively uses the "comma" (syntonic comma of 81/80) as a basis for its construction. It is an unequal 24-tone system and allows for many maqāmāt and ajnās but with limited transpositions.

**Source**: [al-Ṣabbāgh (1954:47)](../../bibliography?source=al-Ṣabbāgh-(1954))

**Example**:
```
GET /api/tuning-systems/al-Sabbagh-(1954)/rast/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Acoustic purity approaches
- Limited transposition scenarios
- Theoretical vs. practical systems

---

## Representative Ajnās

**Ajnās with zalzalian intervals** (ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj):

### jins rāst - `jins_rast`

**Description**: Includes the zalzalian interval segāh.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Required Parameters:**
- `tuningSystem`: `IbnSina-(1037)`, `al-Farabi-(950g)`, `Meshshaqa-(1899)`, or `CairoCongressTuningCommittee-(1929)`
- `startingNote`: `yegah` (for IbnSina, Meshshaqa), `ushayran` (for al-Farabi), or `rast` (for CairoCongress)
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET /api/ajnas/jins_rast?tuningSystem=Meshshaqa-(1899)&startingNote=yegah&pitchClassDataType=cents
```

---

### jins bayyāt - `jins_bayyat`

**Description**: Includes the zalzalian interval segāh.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_bayyat?tuningSystem=CairoCongressTuningCommittee-(1929)&startingNote=rast&pitchClassDataType=cents
```

---

### jins segāh - `jins_segah`

**Description**: Its tonic is the zalzalian interval segāh.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_segah?tuningSystem=al-Sabbagh-(1954)&startingNote=rast&pitchClassDataType=cents
```

---

### jins ṣabā - `jins_saba`

**Description**: Includes the zalzalian interval segāh.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: [al-Khulʿī (2011:55)](../../bibliography?source=al-Khulʿī-(2011)), [al-Urmawī-al-Baghdādī (2017:23)](../../bibliography?source=al-Urmawī-al-Baghdādī-(2017))

**Example**:
```
GET /api/ajnas/jins_saba?tuningSystem=Meshshaqa-(1899)&startingNote=yegah&pitchClassDataType=cents
```

---

**Ajnās without zalzalian intervals:**

### jins nikrīz - `jins_nikriz`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_nikriz?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins kurd - `jins_kurd`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins kurd (binsir) - `jins_kurd_(binsir)`

**Description**: The same as jins kurd but starting on a different tonic, giving it slightly different intervals. Interesting for comparison and understanding why the maqām based on it (maqām ḥijāz kār kurd) is supposedly a transposition of maqām kurd with the same intervals, but in fact is not. Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_kurd_(binsir)?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins nahāwand - `jins_nahawand`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_nahawand?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins ḥijāz - `jins_hijaz`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran` or `IbnSina-(1037)` on `yegah`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_hijaz?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### jins ḥijāz (binsir) - `jins_hijaz_(binsir)`

**Description**: The same as jins ḥijāz but starting on a different tonic, giving it slightly different intervals. Interesting for comparison. Does not include a zalzalian interval.

**Tuning System**: `al-Kindi-(874)` on `ushayran` or `IbnSina-(1037)` on `yegah`.

**Source**: (No source references in data)

**Example**:
```
GET /api/ajnas/jins_hijaz_(binsir)?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

## Representative Maqāmāt

**Principle maqāmāt** - fundamental and archetypal:

### maqām rāst - `maqam_rast`

**Description**: One of the principle and archetypal Arabic maqāmāt. Prominently used in Egypt across both popular and religious sufi musics. Includes the zalzalian intervals segāh and awj in its ascending form.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Required Parameters:**
- `tuningSystem`: `IbnSina-(1037)`, `al-Farabi-(950g)`, `Meshshaqa-(1899)`, or `CairoCongressTuningCommittee-(1929)`
- `startingNote`: `yegah` (for IbnSina, Meshshaqa), `ushayran` (for al-Farabi), or `rast` (for CairoCongress)
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET /api/maqamat/maqam_rast?tuningSystem=CairoCongressTuningCommittee-(1929)&startingNote=rast&pitchClassDataType=cents
```

---

### maqām bayyāt - `maqam_bayyat`

**Description**: Also a principle and archetypal Arabic maqām, that is used widely in popular and rural musics across the Arabic speaking region and beyond. It is the base maqām for many variations in Arabic repertoire and beyond. Includes the zalzalian interval segāh and awj in its ascending form.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_bayyat?tuningSystem=Meshshaqa-(1899)&startingNote=yegah&pitchClassDataType=cents
```

---

### maqām ḥijāz - `maqam_hijaz`

**Description**: A principle Arabic maqām, known primarily for its use in the adhān, the call to prayer. Includes the zalzalian interval awj in its ascending form.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_hijaz?tuningSystem=al-Sabbagh-(1954)&startingNote=rast&pitchClassDataType=cents
```

---

**Complex and transposed maqāmāt:**

### rāḥat al-arwāḥ - `maqam_rahat_al-arwah`

**Description**: A transposition of maqām huzām given its own name because of its character. Its darajat al-istiqrār (tonic) is the zalzalian interval ʿirāq.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_rahat_al-arwah?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

### maqām bestenegar - `maqam_bestenegar`

**Description**: Complex and rarely used non-octave repeating maqam. Its darajat al-istiqrār (tonic) is the zalzalian interval segāh.

**Tuning System**: `IbnSina-(1037)` on `yegah`, `al-Farabi-(950g)` on `ushayran`, `Meshshaqa-(1899)` on `yegah`, or `CairoCongressTuningCommittee-(1929)` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_bestenegar?tuningSystem=al-Farabi-(950g)&startingNote=ushayran&pitchClassDataType=cents
```

---

**Maqāmāt without zalzalian intervals:**

### maqām kurd - `maqam_kurd`

**Description**: This maqām came to much prominence in 1960s and 70s Egyptian popular music, and is one of the most used in pop music across the region today. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### maqām āthār kurd - `maqam_athar-kurd`

**Description**: A rarely used maqām with a very specific character. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Tuning System**: `al-Kindi-(874)` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_athar-kurd?tuningSystem=al-Kindi-(874)&startingNote=ushayran&pitchClassDataType=cents
```

---

### maqām dilkesh ḥūrān - `maqam_dilkesh-huran`

**Description**: A complex non-octave repeating Ottoman maqām that is rarely used in Arabic music but was a part of early 20th century music theory.

**Tuning System**: `IbnSina-(1037)` on `yegah` or `Meshshaqa-(1899)` on `yegah`.

**Source**: (No source references in data)

**Example**:
```
GET /api/maqamat/maqam_dilkesh-huran?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents
```

---

## Representative Usage Patterns

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

