---
title: Representative Examples
description: Recommended tuning systems, maqāmāt, and ajnās for proper API usage
---

# Representative Examples

These examples have been carefully selected to demonstrate the full capabilities of the API while respecting the cultural and historical significance of Arabic maqām theory. 

**Quick test URL:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents"
```

## Quick Access

Jump to specific example categories:

- **[Representative Tuning Systems](#representative-tuning-systems)** - Historical and contemporary tuning systems
  - [al-Kindī (874)](#al-kindi-874-alkindi-874) - 12-Tone
  - [al-Fārābī (950g)](#al-farabi-950g-alfarabi-950g) - First Oud Tuning 27-Tone
  - [Ibn Sīnā (1037)](#ibn-sina-1037-ibnsina-1037) - 7-Fret Oud 17-Tone
  - [Meshshāqa (1899)](#meshshaqa-1899-meshshaqa-1899) - Arabic Octave According to the Modernists
  - [Cairo Congress Tuning Committee (1929)](#cairo-congress-tuning-committee-1929-cairocongresstuningcommittee-1929) - Egyptian Tuning
  - [al-Ṣabbāgh (1954)](#al-sabbagh-1954-alsabbagh-1954) - Contemporary Arabic Tuning 24-Tone

- **[Representative Ajnās](#representative-ajnas)** - Tri/tetra/penta-chords
  - With zalzalian intervals: [jins rāst](#jins-rast-jins-rast), [jins bayyāt](#jins-bayyat-jins-bayyat), [jins segāh](#jins-segah-jins-segah), [jins ṣabā](#jins-saba-jins-saba)
  - Without zalzalian intervals: [jins nikrīz](#jins-nikriz-jins-nikriz), [jins kurd](#jins-kurd-jins-kurd), [jins nahāwand](#jins-nahawand-jins-nahawand), [jins ḥijāz](#jins-hijaz-jins-hijaz)

- **[Representative Maqāmāt](#representative-maqamat)** - Complete modal frameworks
  - Principle maqāmāt: [maqām rāst](#maqam-rast-maqam-rast), [maqām bayyāt](#maqam-bayyat-maqam-bayyat), [maqām ḥijāz](#maqam-hijaz-maqam-hijaz)
  - Complex and transposed: [rāḥat al-arwāḥ](#rahat-al-arwah-maqam-rahat-al-arwah), [maqām bestenegar](#maqam-bestenegar-maqam-bestenegar)
  - Without zalzalian intervals: [maqām kurd](#maqam-kurd-maqam-kurd), [maqām athar kurd](#maqam-athar-kurd-maqam-athar-kurd), [maqām dilkesh ḥūrān](#maqam-dilkesh-huran-maqam-dilkesh-huran)

---

## ⚠️ Critical Requirements

**REQUIRED Parameters for Detail Endpoints:**

All detail endpoints (`https://diarmaqar.net/api/maqamat/{id}`, `https://diarmaqar.net/api/ajnas/{id}`) **MUST** include these two parameters:

1. **`tuningSystem`** - ID of the tuning system (e.g., `ibnsina_1037`)
2. **`startingNote`** - Starting note in URL-safe format (e.g., `yegah`, `ushayran`, `rast`)

And should almost always include a third:

3. **`pitchClassDataType`** - Format for pitch class data (e.g., `cents`, `fraction`, `all`). When omitted, pitch classes contain only minimal note-name fields — include it to get actual pitch data.

**Why these are required:**
- Pitch class calculations depend on the tuning system and starting note
- The API needs to know which format to return the data in
- Without these parameters, the API cannot calculate or return pitch class data

**Not sure which combinations are valid?** Every maqām and jins has an availability endpoint that lists every valid `tuningSystem` + `startingNote` pair:

```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast/availability
GET https://diarmaqar.net/api/ajnas/jins_rast/availability
```

**Example - CORRECT:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

**Example - WRONG (missing parameters):**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast  # ❌ Missing required parameters
GET https://diarmaqar.net/api/maqamat/rast  # ❌ Wrong endpoint format AND missing parameters
```

---

## ❌ Common Mistakes to Avoid

### 1. Missing Required Parameters

**WRONG:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast
GET https://diarmaqar.net/api/ajnas/jins_rast
```

**CORRECT:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
GET https://diarmaqar.net/api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

### 2. Wrong Endpoint Format

**WRONG:**
```bash
GET https://diarmaqar.net/api/maqamat/rast  # Missing "maqam_" prefix
GET https://diarmaqar.net/api/ajnas/rast     # Missing "jins_" prefix
```

**CORRECT:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast  # Includes "maqam_" prefix
GET https://diarmaqar.net/api/ajnas/jins_rast     # Includes "jins_" prefix
```

### 3. Using Display Names Instead of URL-Safe IDs

**WRONG:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=Ibn Sīnā (1037)&startingNote=yegah
```

**CORRECT:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah
```

**Note:** Entity and tuning-system IDs must be exact URL-safe `idName` values (lowercase, no spaces or display formatting). Note-name parameters (`startingNote`, `transposeTo`) are matched diacritics-insensitively — `yegah` and `yegāh` both resolve — but the URL-safe form is canonical and recommended.

### 4. Parameter Discovery

If you need to discover available parameters, use `options=true`:

```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true
```

This returns available parameters instead of data, which is useful for programmatic discovery.

**Precondition:** discovery mode requires a valid `tuningSystem`. `startingNote` is optional — without it the response lists the tuning system's valid starting notes and returns `transposeTo.options: null` (transpositions depend on the starting note). If you don't have a valid tuning system yet, start with the availability endpoint instead:

```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast/availability
```

---

## 🤖 For LLMs and AI Assistants

**Explicit Instructions for AI Systems:**

1. **Always include required parameters** (`tuningSystem`, `startingNote`, `pitchClassDataType`) for detail endpoints
2. **Use Representative Examples** (this page) as the source of truth for correct API usage
3. **Reference the OpenAPI specification** at `/docs/openapi.json` for complete parameter documentation
4. **Use the availability endpoint first** (`https://diarmaqar.net/api/maqamat/{idName}/availability`, `https://diarmaqar.net/api/ajnas/{idName}/availability`) when you don't already have a known-valid `tuningSystem` + `startingNote` combination
5. **Use parameter discovery** (`options=true`) once you know a valid `tuningSystem` — `startingNote` is optional in discovery mode and the response lists the valid ones

**If a request fails with HTTP 400:** the response body contains `error`, `hint`, and `validOptions` fields explaining exactly what to fix — but many AI HTTP tools cannot read 4xx response bodies, so you may only see the status code. In that case do not guess: call the availability endpoint for the entity and rebuild the request from a listed combination.

**Example Parameter Discovery Request:**
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true
```

**Response includes:**
- Valid starting notes for the requested tuning system (as URL-safe idNames, ready to use as parameter values)
- Valid `pitchClassDataType` values
- Valid `transposeTo` tonics, calculated for the requested tuning system and starting note
- The boolean flags (`includeIntervals`, `includeModulations`, `includeModulations8vb`, `includeSuyur`)

**Example options=true response** (maqām rāst, ibnsina_1037, yegah):
```json
{
  "maqam": "maqām rāst",
  "tuningSystem": "ibnsina_1037",
  "availableParameters": {
    "tuningSystem": {
      "required": true,
      "description": "ID of tuning system (see /availability for options)"
    },
    "startingNote": {
      "options": [
        "ushayran",
        "yegah"
      ],
      "required": true,
      "description": "Theoretical framework for note naming. Required for data retrieval. Optional for discovery mode (options=true). Needed to calculate transposition options."
    },
    "pitchClassDataType": {
      "options": [
        "all",
        "englishName",
        "fraction",
        "cents",
        "decimalRatio",
        "stringLength",
        "frequency",
        "abjadName",
        "fretDivision",
        "midiNoteNumber",
        "midiNoteDeviation",
        "centsDeviation",
        "referenceNoteName"
      ],
      "required": false,
      "description": "Output format for pitch data. Optional — when omitted, pitch classes contain only minimal note-name fields. Use 'cents' for tuning analysis or 'all' for complete pitch class information."
    },
    "includeIntervals": {
      "type": "boolean",
      "default": false,
      "description": "Include interval data between pitch classes (?includeIntervals=true)"
    },
    "transposeTo": {
      "options": [
        "rast",
        "qarar_rast",
        "qarar_chahargah",
        "chahargah",
        "kurdan",
        "mahuran"
      ],
      "description": "Transpose to specific tonic (taṣwīr) - only valid transpositions shown. Calculated based on the provided tuningSystem and startingNote; null until a startingNote is provided."
    },
    "includeModulations": {
      "type": "boolean",
      "default": false,
      "description": "Include modulation analysis (maqāmāt and ajnās)"
    },
    "includeModulations8vb": {
      "type": "boolean",
      "default": false,
      "description": "Include available modulations an octave below"
    },
    "includeSuyur": {
      "type": "boolean",
      "default": false,
      "description": "Include documented performance practices (suyūr)"
    }
  },
  "notes": {
    "ajnasData": "Ajnās (constituent melodic structures) are always included in the response for maqām analysis",
    "formatOptions": "The 'pitchClassDataType' parameter controls which pitch class properties are returned. Use 'all' for comprehensive data or specific formats like 'cents', 'fraction', etc. for targeted data."
  },
  "examples": [
    "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&includeIntervals=true",
    "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&transposeTo=qarar_rast&includeModulations=true",
    "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=all&includeSuyur=true"
  ]
}
```

**Best Practice:**
- When users ask about a specific maqām, jins, or tuning system, use the Representative Examples to find the correct endpoint format
- Always include all three required parameters
- Use `cents` as the default `pitchClassDataType` for most use cases
- For users who don't know specific names, use `maqam_rast` with `ibnsina_1037` and `yegah` as safe defaults
- For valid `filterByFamily` values, use `GET https://diarmaqar.net/api/maqamat/families?tuningSystem=ibnsina_1037&startingNote=yegah`

---

## 📋 Actual Response Structure

API responses are complex nested structures, not simple arrays. A typical response includes:

**Key Response Fields:**
- `maqam` / `jins` - Entity metadata (`id`, `idName`, `displayName`, `version`)
- `family` / `tonic` - Entity references (`idName`, `displayName`)
- `stats` - Statistics (number of transpositions, pitch classes, modulations)
- `characteristics` - Musical characteristics (`isOctaveRepeating`, `hasAsymmetricDescending`, `hasSuyur`)
- `availableTranspositions` - Valid transposition targets for the requested tuning system and starting note
- `context` - Tuning system context: its valid starting notes (`idNames` + `displayNames`), the selected starting note, reference frequency
- `pitchData` - Pitch class data in ascending/descending arrays (each entry carries `pitchClassIndex`, `octave`, `scaleDegree`, `noteName`, `noteNameDisplay`, plus the requested data type fields)
- `ajnas`, `primaryJins`, `secondaryJins`, `tertiaryJins`, `ghammaz` - Constituent melodic structures per maqām degree
- `intervals` - Interval data (if `includeIntervals=true`)
- `sources` - Bibliographic source references
- `links` - Related API endpoint URLs

**Minimal Example Response** (abridged):
```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-12-10T17:03:34.565Z"
  },
  "family": { "idName": "rast", "displayName": "rāst" },
  "tonic": { "idName": "rast", "displayName": "rāst" },
  "stats": {
    "numberOfTranspositions": 3,
    "numberOfPitchClasses": 7,
    "numberOfMaqamModulations": 49,
    "numberOfAjnasModulations": 47
  },
  "characteristics": {
    "isOctaveRepeating": true,
    "hasAsymmetricDescending": true,
    "hasSuyur": true
  },
  "context": {
    "tuningSystem": {
      "id": "ibnsina_1037",
      "idName": "ibnsina_1037",
      "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
      "startingNotes": {
        "idNames": ["ushayran", "yegah"],
        "displayNames": ["ʿushayrān", "yegāh"]
      },
      "selectedStartingNote": { "idName": "yegah", "displayName": "yegāh" }
    }
  },
  "pitchData": {
    "ascending": [
      { "pitchClassIndex": 7, "octave": 1, "scaleDegree": "I", "noteName": "rast", "noteNameDisplay": "rāst", "cents": 498.0449991346125 },
      { "pitchClassIndex": 10, "octave": 1, "scaleDegree": "II", "noteName": "dugah", "noteNameDisplay": "dūgāh", "cents": 701.9550008653874 }
    ],
    "descending": [
      { "pitchClassIndex": 4, "octave": 2, "scaleDegree": "VII", "noteName": "ajam", "noteNameDisplay": "ʿajam", "cents": 1494.1349974038376 }
    ]
  },
  "sources": [{ "sourceId": "alshawwa_1946", "page": "42" }],
  "links": {
    "self": "…",
    "detail": "…",
    "availability": "…",
    "compare": "…"
  }
}
```

**For complete response schemas**, see the [OpenAPI Specification](../openapi.json).

---

## Representative Tuning Systems

### al-Kindī (874) - `alkindi_874`
**Title**: 12-Tone
**Starting Notes**: ʿushayrān - `ushayran`, yegāh - `yegah`, rāst - `rast`

**Description**: One of the oldest tuning systems documented in Arabic music theory. It is a 12-tone chromatic tuning system based on Greek theory and doesn't include the quintessential so-called Arabic "quarter tone" pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj, also referred to as zalzalian intervals. It can only render ajnās and maqāmāt that don't use those notes such as kurd, nahāwand, nikrīz and ʿajam ʿushayrān.

**Source**: [Farmer (1937:248)](../../bibliography?source=Farmer-(1937)), [Forster (2010:615)](../../bibliography?source=Forster-(2010))

**Required Parameters:**
- `tuningSystem`: `alkindi_874`
- `startingNote`: `ushayran`
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET https://diarmaqar.net/api/tuning-systems/alkindi_874/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Ajnās without zalzalian intervals: `jins_kurd`, `jins_nahawand`, `jins_nikriz`
- Maqāmāt without zalzalian intervals: `maqam_kurd`, `maqam_nahawand`

---

### al-Fārābī (950g) - `alfarabi_950g`
**Title**: First Oud Tuning (Full First Octave) 27-Tone
**Starting Notes**: ʿushayrān - `ushayran`, yegāh - `yegah`

**Description**: The first documentation of the wuṣtā zalzal interval, the so-called Arabic "quarter tone" using a frequency ratio of 27/22. It is a comprehensive 27-tone tuning system that allows for many ajnās and maqāmāt and their transpositions, therefore also modulations.

**Source**: [Farmer (1937:249)](../../bibliography?source=Farmer-(1937)), [Land (1885:134-137)](../../bibliography?source=Land-(1885)), [d'Erlanger (1930:165-185)](../../bibliography?source=d'Erlanger-(1930))

**Example**:
```
GET https://diarmaqar.net/api/tuning-systems/alfarabi_950g/ushayran/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Comprehensive ajnās and maqāmāt coverage
- Zalzalian intervals
- Historical comparison studies

---

### Ibn Sīnā (1037) - `ibnsina_1037`
**Title**: 7-Fret Oud 17-Tone
**Starting Notes**: ʿushayrān - `ushayran`, yegāh - `yegah`

**Description**: An excellent concise and precise 17-tone tuning that allows for a wide range of ajnās and maqāmāt and their transpositions. Includes the wuṣtā zalzal interval with the frequency ratio of 39/32.

**Source**: [Farmer (1937:249)](../../bibliography?source=Farmer-(1937))

**Example**:
```
GET https://diarmaqar.net/api/tuning-systems/ibnsina_1037/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- All primary maqāmāt: `maqam_rast`, `maqam_bayyat`, `maqam_hijaz`
- All primary ajnās: `jins_rast`, `jins_bayyat`, `jins_hijaz`
- Transpositions and modulations

---

### Meshshāqa (1899) - `meshshaqa_1899`
**Title**: Arabic Octave According to the Modernists
**Starting Notes**: yegāh - `yegah`

**Description**: The first documented tuning system that is based on literal quarter tones, 24 equal divisions of the octave. Defined by Meshshāqa as the "Arabic Octave According to the Modernists", meaning that it was already known before him but undocumented - though no one knows if it was really used. Because it is 24 equal divisions of the octave it allows for many ajnās and maqāmāt and their transpositions, therefore also modulations. Even though it allows the same number of maqāmāt as Ibn Sīnā's tuning system, it allows for more transpositions.

**Source**: [Meshshāqa (1899:18)](../../bibliography?source=Meshshāqa-(1899))

**Example**:
```
GET https://diarmaqar.net/api/tuning-systems/meshshaqa_1899/yegah/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Modern equal-division approach
- Comparison with historical unequal systems
- All maqāmāt and ajnās
- Extended transposition capabilities

---

### Cairo Congress Tuning Committee (1929) - `cairocongresstuningcommittee_1929`
**Title**: Egyptian Tuning
**Starting Notes**: yegāh - `yegah`, rāst - `rast`

**Description**: The tuning system researched, measured and prepared in preparation for the 1932 Cairo Congress of Arabic Music. It is referred to as an "Egyptian Tuning" and is an unequal 24-tone system. Also comprehensive in its maqām availability and was rendered based on the measurement and expertise of Egyptian musicians at the time.

**Source**: [Shawqi (1969:48-49)](../../bibliography?source=Shawqi-(1969)), [na. (1933:336)](../../bibliography?source=na.-(1933)), [Allāh-Wīrdī (1949:80)](../../bibliography?source=Allāh-Wīrdī-(1949))

**Example**:
```
GET https://diarmaqar.net/api/tuning-systems/cairocongresstuningcommittee_1929/rast/pitch-classes?pitchClassDataType=cents
```

**Good for testing**:
- Egyptian performance practice
- 20th-century documentation standards
- Unequal divisions vs. equal divisions

---

### al-Ṣabbāgh (1954) - `alsabbagh_1954`
**Title**: Contemporary Arabic Tuning 24-Tone
**Starting Notes**: rāst - `rast`

**Description**: The only documented theorisation of an Arabic tuning system that exclusively uses the "comma" (syntonic comma of 81/80) as a basis for its construction. It is an unequal 24-tone system and allows for many maqāmāt and ajnās but with limited transpositions.

**Source**: [al-Ṣabbāgh (1954:47)](../../bibliography?source=al-Ṣabbāgh-(1954))

**Example**:
```
GET https://diarmaqar.net/api/tuning-systems/alsabbagh_1954/rast/pitch-classes?pitchClassDataType=cents
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

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Required Parameters:**
- `tuningSystem`: `ibnsina_1037`, `alfarabi_950g`, `meshshaqa_1899`, or `cairocongresstuningcommittee_1929`
- `startingNote`: e.g. `yegah` (IbnSina, Meshshaqa), `ushayran` (al-Farabi), `rast` (CairoCongress) — several systems accept more than one starting note; `GET https://diarmaqar.net/api/ajnas/jins_rast/availability` lists every valid combination
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET https://diarmaqar.net/api/ajnas/jins_rast?tuningSystem=meshshaqa_1899&startingNote=yegah&pitchClassDataType=cents
```

---

### jins bayyāt - `jins_bayyat`

**Description**: Includes the zalzalian interval segāh.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_bayyat?tuningSystem=cairocongresstuningcommittee_1929&startingNote=rast&pitchClassDataType=cents
```

---

### jins segāh - `jins_segah`

**Description**: Its tonic is the zalzalian interval segāh.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_segah?tuningSystem=alsabbagh_1954&startingNote=rast&pitchClassDataType=cents
```

---

### jins ṣabā - `jins_saba`

**Description**: Includes the zalzalian interval segāh.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: [al-Khulʿī (2011:55)](../../bibliography?source=al-Khulʿī-(2011)), [al-Urmawī-al-Baghdādī (2017:23)](../../bibliography?source=al-Urmawī-al-Baghdādī-(2017))

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_saba?tuningSystem=meshshaqa_1899&startingNote=yegah&pitchClassDataType=cents
```

---

**Ajnās without zalzalian intervals:**

### jins nikrīz - `jins_nikriz`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `alkindi_874` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_nikriz?tuningSystem=alkindi_874&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins kurd - `jins_kurd`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `alkindi_874` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_kurd?tuningSystem=alkindi_874&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins kurd (binsir) - `jins_kurd_(binsir)`

**Description**: The same as jins kurd but starting on a different tonic, giving it slightly different intervals. Interesting for comparison and understanding why the maqām based on it (maqām ḥijāz kār kurd) is supposedly a transposition of maqām kurd with the same intervals, but in fact is not. Does not include a zalzalian interval.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `yegah`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `yegah` or `rast`. Not available in `alkindi_874`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_kurd_(binsir)?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

---

### jins nahāwand - `jins_nahawand`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `alkindi_874` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_nahawand?tuningSystem=alkindi_874&startingNote=ushayran&pitchClassDataType=cents
```

---

### jins ḥijāz - `jins_hijaz`

**Description**: Does not include a zalzalian interval.

**Tuning System**: `alkindi_874` on `ushayran` or `ibnsina_1037` on `yegah`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_hijaz?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

---

### jins ḥijāz (binsir) - `jins_hijaz_(binsir)`

**Description**: The same as jins ḥijāz but starting on a different tonic, giving it slightly different intervals. Interesting for comparison. Does not include a zalzalian interval.

**Tuning System**: `ibnsina_1037` on `yegah`. Not available in `alkindi_874`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/ajnas/jins_hijaz_(binsir)?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

---

## Representative Maqāmāt

**Principle maqāmāt** - fundamental and archetypal:

### maqām rāst - `maqam_rast`

**Description**: One of the principle and archetypal Arabic maqāmāt. Prominently used in Egypt across both popular and religious sufi musics. Includes the zalzalian intervals segāh and awj in its ascending form.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Required Parameters:**
- `tuningSystem`: `ibnsina_1037`, `alfarabi_950g`, `meshshaqa_1899`, or `cairocongresstuningcommittee_1929`
- `startingNote`: e.g. `yegah` (IbnSina, Meshshaqa), `ushayran` (al-Farabi), `rast` (CairoCongress) — several systems accept more than one starting note; `GET https://diarmaqar.net/api/maqamat/maqam_rast/availability` lists every valid combination
- `pitchClassDataType`: `cents` (or `fraction`, `all`, etc.)

**Example**:
```bash
GET https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=cairocongresstuningcommittee_1929&startingNote=rast&pitchClassDataType=cents
```

---

### maqām bayyāt - `maqam_bayyat`

**Description**: Also a principle and archetypal Arabic maqām, that is used widely in popular and rural musics across the Arabic speaking region and beyond. It is the base maqām for many variations in Arabic repertoire and beyond. Includes the zalzalian interval segāh and awj in its ascending form.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_bayyat?tuningSystem=meshshaqa_1899&startingNote=yegah&pitchClassDataType=cents
```

---

### maqām ḥijāz - `maqam_hijaz`

**Description**: A principle Arabic maqām, known primarily for its use in the adhān, the call to prayer. Includes the zalzalian interval awj in its ascending form.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_hijaz?tuningSystem=alsabbagh_1954&startingNote=rast&pitchClassDataType=cents
```

---

**Complex and transposed maqāmāt:**

### rāḥat al-arwāḥ - `maqam_rahat_al-arwah`

**Description**: A transposition of maqām huzām given its own name because of its character. Its darajat al-istiqrār (tonic) is the zalzalian interval ʿirāq.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_rahat_al-arwah?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

---

### maqām bestenegar - `maqam_bestenegar`

**Description**: Complex and rarely used non-octave repeating maqam. Its darajat al-istiqrār (tonic) is the zalzalian interval segāh.

**Tuning System**: `ibnsina_1037` on `yegah`, `alfarabi_950g` on `ushayran`, `meshshaqa_1899` on `yegah`, or `cairocongresstuningcommittee_1929` on `rast`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_bestenegar?tuningSystem=alfarabi_950g&startingNote=ushayran&pitchClassDataType=cents
```

---

**Maqāmāt without zalzalian intervals:**

### maqām kurd - `maqam_kurd`

**Description**: This maqām came to much prominence in 1960s and 70s Egyptian popular music, and is one of the most used in pop music across the region today. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Tuning System**: `alkindi_874` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_kurd?tuningSystem=alkindi_874&startingNote=ushayran&pitchClassDataType=cents
```

---

### maqām athar kurd - `maqam_athar_kurd`

**Description**: A rarely used maqām with a very specific character. It doesn't include the quintessential so-called Arabic "quarter tone", i.e. pitch classes ʿirāq, nīm zīrgūleh, segāh, nīm ḥijāz, or awj.

**Tuning System**: `alkindi_874` on `ushayran`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_athar_kurd?tuningSystem=alkindi_874&startingNote=ushayran&pitchClassDataType=cents
```

---

### maqām dilkesh ḥūrān - `maqam_dilkesh_huran`

**Description**: A complex non-octave repeating Ottoman maqām that is rarely used in Arabic music but was a part of early 20th century music theory.

**Tuning System**: `ibnsina_1037` on `yegah` or `meshshaqa_1899` on `yegah`.

**Source**: (No source references in data)

**Example**:
```
GET https://diarmaqar.net/api/maqamat/maqam_dilkesh_huran?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents
```

---

## Representative Usage Patterns

### Basic Detail Request
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents"
```

### With All Optional Parameters
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&includeArabic=true&includeIntervals=true&includeModulations=true&includeModulations8vb=true&includeSuyur=true"
```

### Parameter Discovery
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&options=true"
```

### Availability (valid tuningSystem + startingNote combinations)
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast/availability"
```

### Comparison Across Tuning Systems
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNotes=yegah&pitchClassDataType=cents"
```

### Transposition
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&transposeTo=chahargah"
```

Valid `transposeTo` tonics depend on the maqām, tuning system, and starting note — use `options=true` (above) to list them for a given combination.

---

## Testing Combinations

### Test Basic Coverage
- Tuning: `ibnsina_1037` on `yegah`
- Maqām: `maqam_rast`
- Jins: `jins_rast`
- Format: `cents`

### Test Zalzalian Intervals
- Tuning: `alfarabi_950g` on `ushayran`
- Ajnās: `jins_rast`, `jins_bayyat`, `jins_segah`, `jins_saba`

### Test Non-Zalzalian Systems
- Tuning: `alkindi_874` on `ushayran`
- Ajnās: `jins_kurd`, `jins_nahawand`, `jins_nikriz`

### Test Modern Equal Divisions
- Tuning: `meshshaqa_1899` on `yegah`
- Compare with: `ibnsina_1037` to see equal vs. unequal

### Test Complex Structures
- Maqām: `maqam_bestenegar` (non-octave-repeating)
- Maqām: `maqam_dilkesh_huran` (Ottoman complexity)

### Test Historical Documentation
- Tuning: `cairocongresstuningcommittee_1929` on `rast`
- Compare with: `alsabbagh_1954` on `rast`

---

## See Also

- [API Documentation](./index) - Main API overview
- [Interactive Playground](./playground) - Test these examples interactively
- [OpenAPI Specification](/openapi.yaml) - Complete parameter documentation

