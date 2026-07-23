---
title: API Endpoints Reference
description: Complete API endpoint documentation
---

# API Endpoints Reference

Complete documentation for all API endpoints. For quick start, see [API Documentation](./index). For examples, see [Representative Examples](./representative-examples).

---

# Quick Reference
## Base URL

- **Production**: `https://diarmaqar.net/api`
- **Development**: `http://localhost:3000/api`

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification:
- [openapi.json](/openapi.json)
- [openapi.yaml](/openapi.yaml)

## Authentication

The API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses are in JSON format. List endpoints return:

```json
{
  "count": <number>,
  "data": [<array>]
}
```

## Rate Limiting

Currently, there are no rate limits. Please use the API responsibly.

## Common Parameters

Most endpoints support these optional parameters:

- **`includeArabic`** (default: `"true"`): Include Arabic script alongside transliteration
  - `"true"`: Bilingual responses with `*Ar` suffixed fields (`displayNameAr`, `noteNameDisplayAr`, etc.)
  - `"false"`: English transliteration only

- **`includeSources`** (default: `"true"` for list endpoints, `"false"` for detail endpoints): Include bibliographic source references
  - `"true"`: Include `sources` array with `{sourceId, page}` objects
  - `"false"`: Omit source references for performance

---

# Endpoints

## Maqāmāt

Documented modal frameworks with historical source attribution.

### List all maqāmāt {#listMaqamat}

```
GET /maqamat
```

Retrieve all available maqāmāt with optional filtering and sorting.

**Returns:** All maqāmāt with their tuning system availability information. This endpoint does **not** include note names or pitch class data—only metadata about which tuning systems can realize each maqām.

Returns concise metadata including:
- URL-safe identifiers and display names for each maqām
- Maqām family and maqām tonic identifiers (both URL-safe and display formats)
- Availability counts across tuning systems with their valid starting note names (e.g., "ʿushayrān", "yegāh" etc...)
- Optional bibliographic source references (sourceId and page) when `includeSources=true`
- Filter values must be URL-safe; see parameter enums for complete list of valid options

**Note:** For detailed pitch class data, note names, and ajnās information, use the `/maqamat/{idName}` endpoint.


**Query Parameters:**
- `filterByFamily` (optional): Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive).
Use GET /maqamat/families to retrieve valid family values..
  Use GET /maqamat/families to retrieve valid family values.
 - Type: `string` - Valid values: `ajam`, `athar_kurd`, `awj_ara`, `bayyat`, `buselik`, ... (16 total)
  - Example: `rast`
- `filterByTonic` (optional): Filter by maqām tonic/first note (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string` - Valid values: `ajam_ushayran`, `chahargah`, `dugah`, `iraq`, `nawa`, `rast`, `segah`, `ushayran`, `yegah`
- `sortBy` (optional): Sort order for results.
  including empty string) return HTTP 400.
 - Type: `string` - Valid values: `alphabetical`, `tonic` - Default: `alphabetical`
  - Example: `alphabetical` - Sort alphabetically by display name (default)
  - Example: `tonic` - Sort by tonic note priority across the full NoteName.ts octave-stratified order, alphabetical tiebreak
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each maqām - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat?includeSources=true&includeArabic=true"
```

**Response:** List of maqāmāt retrieved successfully

**Example response — default:**

```json
{
  "count": 60,
  "data": [
    {
      "id": "29",
      "idName": "maqam_yegah",
      "displayName": "maqām yegāh",
      "version": "2025-10-18T19:41:17.132Z",
      "familyId": "no_jins",
      "familyDisplay": "no jins",
      "tonicId": "yegah",
      "tonicDisplay": "yegāh",
      "numberOfPitchClasses": 7,
      "isOctaveRepeating": true,
      "hasAsymmetricDescending": true,
      "hasSuyur": true,
      "availableInTuningSystems": 4,
      "tuningSystemsAvailability": [
        {
          "tuningSystemId": "alfarabi_950g",
          "tuningSystemStartingNoteNames": [
            "ʿushayrān"
          ]
        },
        {
          "tuningSystemId": "cairocongresstuningcommittee_1929",
          "tuningSystemStartingNoteNames": [
            "yegāh"
          ]
        },
        {
          "tuningSystemId": "alsabbagh_1954",
          "tuningSystemStartingNoteNames": [
            "rāst"
          ]
        },
        {
          "tuningSystemId": "allami_2025",
          "tuningSystemStartingNoteNames": [
            "rāst"
          ]
        }
      ],
      "maqamDetailsUrl": "/api/maqamat/maqam_yegah",
      "sources": [
        {
          "sourceId": "alshawwa_1946",
          "page": "49"
        }
      ]
    },
    {
      "id": "30",
      "idName": "maqam_farahfazza",
      "displayName": "maqām faraḥfazzā",
      "version": "2025-10-18T19:41:17.132Z",
      "familyId": "no_jins",
      "familyDisplay": "no jins",
      "tonicId": "yegah",
      "tonicDisplay": "yegāh",
      "numberOfPitchClasses": 7,
      "isOctaveRepeating": true,
      "hasAsymmetricDescending": true,
      "hasSuyur": true,
      "availableInTuningSystems": 35,
      "tuningSystemsAvailability": [
        {
          "tuningSystemId": "ronzevalle_1904",
          "tuningSystemStartingNoteNames": [
            "ʿushayrān",
            "yegāh"
          ]
        },
        {
          "tuningSystemId": "alfarabi_950g",
          "tuningSystemStartingNoteNames": [
            "ʿushayrān"
          ]
        }
      ],
      "maqamDetailsUrl": "/api/maqamat/maqam_farahfazza",
      "sources": [
        {
          "sourceId": "alshawwa_1946",
          "page": "50"
        }
      ]
    }
  ]
}
```


### List maqām families {#listMaqamFamilies}

```
GET /maqamat/families
```

Retrieve maqām families for maqāmāt available in the specified tuning system.
Families are classified by the first jins at scale degree 1. Use the `maqamat`
link to filter maqāmāt by family via GET /maqamat?filterByFamily={idName}.


**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., ibnsina_1037, alsabbagh_1954) - Type: `string`
  - Example: `ibnsina_1037`
- `startingNote` **(required)**: Starting note name (URL-safe, diacritics-insensitive) - Type: `string`
  - Example: `yegah`
- `includeArabic` (optional): Include Arabic display names in family objects - Type: `string` - Valid values: `true`, `false` - Default: `false`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/families?tuningSystem=ibnsina_1037&startingNote=yegah&includeArabic=false"
```

**Response:** Maqām families retrieved successfully

**Example response:**

```json
{
  "count": 16,
  "data": [
    {
      "family": {
        "idName": "rast",
        "displayName": "rāst"
      }
    },
    {
      "family": {
        "idName": "bayyat",
        "displayName": "bayyāt"
      }
    },
    {
      "family": {
        "idName": "hijaz",
        "displayName": "ḥijāz"
      }
    },
    {
      "family": {
        "idName": "ajam",
        "displayName": "ʿajam"
      }
    }
  ]
}
```


### Get detailed maqām data {#getMaqam}

```
GET /maqamat/{idName}
```

Retrieve comprehensive data for a specific maqām on its conventional or a transposed tonic, in a specific tuning system on a specific starting note name.

**Special Path Parameter Value:**
- The `{idName}` path parameter accepts the special value `"all"` to retrieve data for all maqāmāt in a specific tuning system and starting note
- When using `"all"`, both `tuningSystem` and `startingNote` query parameters are required

Returns:
- Comprehensive pitch class data in the requested tuning system and starting note name
- All ajnās present at each maqām degree in the ascending and descending maqām structure, organized by their maqām degree note names
- The maqām's primary, secondary, and (when defined) tertiary jins positions as transposed per-degree entries — each carrying the note name, maqām degree (roman numeral), and the resolved jins entity `{jinsId, jinsIdName, jinsDisplayName}`
- The maqām's ghammāz (modulation emphasis note) as a note-name + maqām-degree entry (no jins fields — the ghammāz is a melodic-emphasis note, not a jins)
- All four of `primaryJins`, `secondaryJins`, `tertiaryJins`, and `ghammaz` are transposed in sync with the selected transposition (e.g. when `transposeTo=nawa` is used, every entry reflects the new tonic and the new maqām-degree position of each note). They are returned as arrays of per-degree objects to accommodate alternatives, or `null` when a maqām has no entry for that slot (e.g. rāst has no tertiary).
- Optional includeIntervals data, transposition to different tonics, tuning-system-specific modulations (including lower octave), and suyūr

Parameter Discovery:
- Use options=true to discover valid values for all parameters including dynamically calculated transposition options
- Especially useful for finding valid tuning system starting notes and transposition tonics for a specific maqām

Important:
- When options=true, the endpoint returns parameter discovery metadata instead of maqām data
- This mode is mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, include suyūr, pitch class data type, includeIntervals)
- If data-returning parameters are provided with options=true, the API returns a 400 Bad Request error with details about conflicting parameters

Requirements:
- Tuning system is required for all requests; a starting note is required for data retrieval and optional in discovery mode (options=true), where omitting it returns the tuning system's valid starting notes
- These are fundamental to all pitch class calculations


**Path Parameters:**
- `idName`: URL-safe maqām identifier.

**Special value**: Use `"all"` to retrieve data for all maqāmāt in a specific tuning system and starting note. When using `"all"`, both `tuningSystem` and `startingNote` query parameters are required.
 (string) **(required)**
  - Example: `maqam_rast` - Maqām Rāst (representative example)
  - Example: `maqam_bayyat` - Maqām Bayyāt (representative example)
  - Example: `maqam_hijaz` - Maqām Ḥijāz (representative example)
  - Example: `all` - All maqāmāt (requires tuningSystem and startingNote query parameters)

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'ibnsina_1037', 'alfarabi_950g', 'meshshaqa_1899') - Type: `string`
  - Example: `ibnsina_1037` - Ibn Sīnā (1037) - 7-Fret Oud 17-Tone (representative example)
  - Example: `alfarabi_950g` - al-Fārābī (950g) - First Oud Tuning 27-Tone (representative example)
  - Example: `meshshaqa_1899` - Meshshāqa (1899) - Arabic Octave According to the Modernists (representative example)
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  - Different starting notes represent different theoretical frameworks within the same tuning system
  - Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `yegah` - yegāh (for IbnSina, Meshshaqa)
  - Example: `ushayran` - ʿushayrān (for al-Farabi, al-Kindi)
  - Example: `rast` - rāst (for CairoCongress, al-Sabbagh)
- `options` (optional): When true, returns available parameter options instead of maqām data.
  - Tuning system is required for all requests; a starting note is required for data retrieval and optional in discovery mode (options=true), where omitting it returns the tuning system's valid starting notes
  - These are fundamental to all pitch class calculations and calculate valid starting note options and transposition tonics
  - Mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, include suyūr, pitch class data type, includeIntervals)
  - Transposition options are dynamically calculated based on the specific maqām, tuning system, and starting note combination
  - Only tonics where the maqām can be validly transposed (preserving interval pattern) are included, not all possible pitch classes
  - If data-returning parameters are provided, returns 400 Bad Request error with details about conflicting parameters
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `pitchClassDataType` (optional): Specifies which pitch class data type to return for each pitch class.
  - When provided, returns the specified data type for all pitch classes in the maqām
  - In discovery mode (when options=true), this parameter is optional since the response returns parameter metadata instead of formatted data
  - Use 'all' for complete pitch class data across all available formats
  - `pitchClassIndex` and `scaleDegree` return the minimal field set explicitly
 - Type: `string` - Valid values: `all`, `abjadName`, `englishName`, `solfege`, `fraction`, ... (16 total)
  - Example: `cents`
- `transposeTo` (optional): Transpose the maqām to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  - To see all valid transposition options, request available parameter options instead of maqām data
 - Type: `string`
  - Example: `nawa`
- `includeIntervals` (optional): Include interval data between maqām degrees - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeModulations` (optional): Include modulation possibilities to other maqāmāt and ajnās - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeModulations8vb` (optional): Include available modulations an octave below - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeSuyur` (optional): Include suyūr (melodic paths) data - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&includeArabic=true"
```

**Response:** Maqām data retrieved successfully.

- When options is true, the response structure differs and returns available parameter options instead of maqām data
- In that case, transposition options contain only valid transposition tonics for this specific maqām, tuning system, and starting note combination


**Example response — basic:**

```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-12-10T17:03:34.565Z"
  },
  "family": {
    "idName": "rast",
    "displayName": "rāst"
  },
  "tonic": {
    "idName": "rast",
    "displayName": "rāst"
  },
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
  "availableTranspositions": [
    {
      "idName": "maqam_rast_al-qarar_chahargah",
      "displayName": "maqām rāst al-qarār chahārgāh",
      "tonic": {
        "idName": "qarar_chahargah",
        "displayName": "qarār chahārgāh"
      }
    },
    {
      "idName": "maqam_rast_al-chahargah",
      "displayName": "maqām rāst al-chahārgāh",
      "tonic": {
        "idName": "chahargah",
        "displayName": "chahārgāh"
      }
    },
    {
      "idName": "maqam_rast_al-mahuran",
      "displayName": "maqām rāst al-māhūrān",
      "tonic": {
        "idName": "mahuran",
        "displayName": "māhūrān"
      }
    }
  ],
  "comments": {
    "english": null,
    "arabic": null
  },
  "sources": [
    {
      "sourceId": "alshawwa_1946",
      "page": "42"
    }
  ],
  "parameters": {
    "pitchClassDataType": null,
    "includeIntervals": false,
    "includeModulations": false,
    "includeModulations8vb": false,
    "includeSuyur": false,
    "transposeTo": null
  },
  "context": {
    "tuningSystem": {
      "id": "ibnsina_1037",
      "idName": "ibnsina_1037",
      "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
      "version": "2025-11-09T00:44:40.275Z",
      "startingNotes": {
        "idNames": [
          "ushayran",
          "yegah"
        ],
        "displayNames": [
          "ʿushayrān",
          "yegāh"
        ]
      },
      "selectedStartingNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "pitchClassCounts": {
        "singleOctave": 17,
        "allOctaves": 68
      },
      "originalValueType": "fraction",
      "referenceFrequency": 97.999
    }
  },
  "links": {
    "self": "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah",
    "detail": "/api/maqamat/maqam_rast",
    "availability": "/api/maqamat/maqam_rast/availability",
    "compare": "/api/maqamat/maqam_rast/compare"
  },
  "pitchData": {
    "ascending": [
      {
        "pitchClassIndex": 7,
        "octave": 1,
        "scaleDegree": "I",
        "noteName": "rast",
        "noteNameDisplay": "rāst"
      },
      {
        "pitchClassIndex": 10,
        "octave": 1,
        "scaleDegree": "II",
        "noteName": "dugah",
        "noteNameDisplay": "dūgāh"
      },
      {
        "pitchClassIndex": 12,
        "octave": 1,
        "scaleDegree": "III",
        "noteName": "segah",
        "noteNameDisplay": "segāh"
      },
      {
        "pitchClassIndex": 14,
        "octave": 1,
        "scaleDegree": "IV",
        "noteName": "chahargah",
        "noteNameDisplay": "chahārgāh"
      },
      {
        "pitchClassIndex": 0,
        "octave": 2,
        "scaleDegree": "V",
        "noteName": "nawa",
        "noteNameDisplay": "nawā"
      },
      {
        "pitchClassIndex": 3,
        "octave": 2,
        "scaleDegree": "VI",
        "noteName": "husayni",
        "noteNameDisplay": "ḥusaynī"
      },
      {
        "pitchClassIndex": 5,
        "octave": 2,
        "scaleDegree": "VII",
        "noteName": "awj",
        "noteNameDisplay": "awj"
      }
    ],
    "descending": [
      {
        "pitchClassIndex": 4,
        "octave": 2,
        "scaleDegree": "VII",
        "noteName": "ajam",
        "noteNameDisplay": "ʿajam"
      },
      {
        "pitchClassIndex": 3,
        "octave": 2,
        "scaleDegree": "VI",
        "noteName": "husayni",
        "noteNameDisplay": "ḥusaynī"
      },
      {
        "pitchClassIndex": 0,
        "octave": 2,
        "scaleDegree": "V",
        "noteName": "nawa",
        "noteNameDisplay": "nawā"
      },
      {
        "pitchClassIndex": 14,
        "octave": 1,
        "scaleDegree": "IV",
        "noteName": "chahargah",
        "noteNameDisplay": "chahārgāh"
      },
      {
        "pitchClassIndex": 12,
        "octave": 1,
        "scaleDegree": "III",
        "noteName": "segah",
        "noteNameDisplay": "segāh"
      },
      {
        "pitchClassIndex": 10,
        "octave": 1,
        "scaleDegree": "II",
        "noteName": "dugah",
        "noteNameDisplay": "dūgāh"
      },
      {
        "pitchClassIndex": 7,
        "octave": 1,
        "scaleDegree": "I",
        "noteName": "rast",
        "noteNameDisplay": "rāst"
      }
    ]
  },
  "ajnas": {
    "ascending": {
      "rāst": {
        "id": "19",
        "idName": "jins_rast",
        "displayName": "jins rāst"
      },
      "dūgāh": {
        "id": "2",
        "idName": "jins_bayyat",
        "displayName": "jins bayyāt"
      },
      "segāh": {
        "id": "3",
        "idName": "jins_segah",
        "displayName": "jins segāh"
      },
      "chahārgāh": null,
      "nawā": {
        "id": "19",
        "idName": "jins_rast_al-nawa",
        "displayName": "jins rāst al-nawā"
      },
      "ḥusaynī": {
        "id": "2",
        "idName": "jins_bayyat_al-husayni",
        "displayName": "jins bayyāt al-ḥusaynī"
      },
      "awj": {
        "id": "3",
        "idName": "jins_segah_al-awj",
        "displayName": "jins segāh al-awj"
      }
    },
    "descending": {
      "ʿajam": null,
      "ḥusaynī": {
        "id": "7",
        "idName": "jins_kurd_al-husayni",
        "displayName": "jins kurd al-ḥusaynī"
      },
      "nawā": {
        "id": "6",
        "idName": "jins_nahawand_al-nawa",
        "displayName": "jins nahāwand al-nawā"
      },
      "chahārgāh": {
        "id": "5",
        "idName": "jins_ajam_ushayran_al-chahargah",
        "displayName": "jins ʿajam ʿushayrān al-chahārgāh"
      },
      "segāh": {
        "id": "3",
        "idName": "jins_segah",
        "displayName": "jins segāh"
      },
      "dūgāh": {
        "id": "2",
        "idName": "jins_bayyat",
        "displayName": "jins bayyāt"
      },
      "rāst": {
        "id": "19",
        "idName": "jins_rast",
        "displayName": "jins rāst"
      }
    }
  },
  "primaryJins": [
    {
      "noteName": "rast",
      "noteNameDisplay": "rāst",
      "maqamDegree": "I",
      "jinsId": "19",
      "jinsIdName": "jins_rast",
      "jinsDisplayName": "jins rāst"
    }
  ],
  "secondaryJins": [
    {
      "noteName": "nawa",
      "noteNameDisplay": "nawā",
      "maqamDegree": "V",
      "jinsId": "19",
      "jinsIdName": "jins_rast_al-nawa",
      "jinsDisplayName": "jins rāst al-nawā"
    }
  ],
  "tertiaryJins": null,
  "ghammaz": [
    {
      "noteName": "nawa",
      "noteNameDisplay": "nawā",
      "maqamDegree": "V"
    }
  ]
}
```


### Check maqām availability across tuning systems {#getMaqamAvailability}

```
GET /maqamat/{idName}/availability
```

Return tuning-system availability for a maqām.

- Shows which tuning systems on which starting note names can realize the specified maqām
- If `transpositionNoteName` is provided, filters results to show only tuning systems where the maqām can be transposed to that specific note
- Validity is computed against each tuning system's note name sets and the maqām's pitch class intervals
- Tuning system starting note names are returned as both display values (with diacritics) and URL-safe identifiers


**Path Parameters:**
- `idName`: URL-safe maqām identifier (string) **(required)**
  - Example: `maqam_bayyat`

**Query Parameters:**
- `transpositionNoteName` (optional): Filter results to show only tuning systems where the maqām can be transposed to this specific note (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_bayyat/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully

**Example response — withoutTransposition:**

```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "Maqam Rāst",
    "version": "2025-10-18T19:41:17.132Z"
  },
  "availability": {
    "count": 29,
    "tuningSystems": [
      {
        "tuningSystemId": "ibnsina_1037",
        "tuningSystemDisplayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
        "tuningSystemStartingNoteNames": [
          "ʿushayrān",
          "yegāh"
        ],
        "tuningSystemStartingNoteNamesIds": [
          "ushayran",
          "yegah"
        ]
      },
      {
        "tuningSystemId": "alfarabi_950g",
        "tuningSystemDisplayName": "al-Fārābī (950g) First Oud Tuning (Full First Octave)",
        "tuningSystemStartingNoteNames": [
          "ʿushayrān",
          "yegāh"
        ],
        "tuningSystemStartingNoteNamesIds": [
          "ushayran",
          "yegah"
        ]
      }
    ]
  }
}
```


### List transpositions for a maqām {#listMaqamTranspositions}

```
GET /maqamat/{idName}/transpositions
```

Lists distinct transpositions (taswīr) for a maqām within a specific tuning system and starting note.
The analytical form (tahlīl) is excluded. Octave/register variants of the same modal degree
(e.g. qarār dūgāh vs dūgāh vs muḥayyar) are not treated as distinct taswīr.

If there are no distinct taswīr for this tuning-system + starting-note combination, this endpoint returns `422`
with an `{ error, hint }` payload (it does not return a 200 with an empty list).


**Path Parameters:**
- `idName`: URL-safe maqām identifier (string) **(required)**
  - Example: `maqam_hijaz`

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'ibnsina_1037', 'alfarabi_950g', 'meshshaqa_1899') - Type: `string`
  - Example: `alsabbagh_1954`
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `rast`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_hijaz/transpositions?tuningSystem=alsabbagh_1954&startingNote=rast&includeArabic=true"
```

**Response:** Transpositions retrieved successfully

**Example response:**

```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-12-10T17:03:34.565Z"
  },
  "tuningSystem": {
    "id": "ibnsina_1037",
    "idName": "ibnsina_1037",
    "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
    "version": "2025-11-09T00:44:40.275Z",
    "numberOfPitchClassesSingleOctave": 17
  },
  "startingNote": {
    "idName": "yegah",
    "displayName": "yegāh"
  },
  "transpositions": {
    "total": 3,
    "options": {
      "idNames": [
        "qarar_chahargah",
        "chahargah",
        "mahuran"
      ],
      "displayNames": [
        "qarār chahārgāh",
        "chahārgāh",
        "māhūrān"
      ]
    },
    "detailed": [
      {
        "tonic": {
          "idName": "qarar_chahargah",
          "displayName": "qarār chahārgāh"
        },
        "pitchClass": {
          "pitchClassIndex": 14,
          "octave": 0
        },
        "primaryJins": [
          {
            "noteName": "qarar_chahargah",
            "noteNameDisplay": "qarār chahārgāh",
            "maqamDegree": "I",
            "jinsId": "19",
            "jinsIdName": "jins_rast_al-qarar_chahargah",
            "jinsDisplayName": "jins rāst al-qarār chahārgāh"
          }
        ],
        "secondaryJins": [
          {
            "noteName": "rast",
            "noteNameDisplay": "rāst",
            "maqamDegree": "V",
            "jinsId": "19",
            "jinsIdName": "jins_rast",
            "jinsDisplayName": "jins rāst"
          }
        ],
        "tertiaryJins": null,
        "ghammaz": [
          {
            "noteName": "rast",
            "noteNameDisplay": "rāst",
            "maqamDegree": "V"
          }
        ],
        "links": {
          "detail": "/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=qarar_chahargah"
        }
      },
      {
        "tonic": {
          "idName": "chahargah",
          "displayName": "chahārgāh"
        },
        "pitchClass": {
          "pitchClassIndex": 14,
          "octave": 1
        },
        "primaryJins": [
          {
            "noteName": "chahargah",
            "noteNameDisplay": "chahārgāh",
            "maqamDegree": "I",
            "jinsId": "19",
            "jinsIdName": "jins_rast_al-chahargah",
            "jinsDisplayName": "jins rāst al-chahārgāh"
          }
        ],
        "secondaryJins": [
          {
            "noteName": "kurdan",
            "noteNameDisplay": "kurdān",
            "maqamDegree": "V",
            "jinsId": "19",
            "jinsIdName": "jins_rast",
            "jinsDisplayName": "jins rāst"
          }
        ],
        "tertiaryJins": null,
        "ghammaz": [
          {
            "noteName": "kurdan",
            "noteNameDisplay": "kurdān",
            "maqamDegree": "V"
          }
        ],
        "links": {
          "detail": "/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=chahargah"
        }
      },
      {
        "tonic": {
          "idName": "mahuran",
          "displayName": "māhūrān"
        },
        "pitchClass": {
          "pitchClassIndex": 14,
          "octave": 2
        },
        "primaryJins": [
          {
            "noteName": "mahuran",
            "noteNameDisplay": "māhūrān",
            "maqamDegree": "I",
            "jinsId": "19",
            "jinsIdName": "jins_rast_al-mahuran",
            "jinsDisplayName": "jins rāst al-māhūrān"
          }
        ],
        "secondaryJins": [
          {
            "noteName": "jawab_kurdan",
            "noteNameDisplay": "jawāb kurdān",
            "maqamDegree": "V",
            "jinsId": "19",
            "jinsIdName": "jins_rast",
            "jinsDisplayName": "jins rāst"
          }
        ],
        "tertiaryJins": null,
        "ghammaz": [
          {
            "noteName": "jawab_kurdan",
            "noteNameDisplay": "jawāb kurdān",
            "maqamDegree": "V"
          }
        ],
        "links": {
          "detail": "/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=mahuran"
        }
      }
    ]
  },
  "links": {
    "self": "https://diarmaqar.net/api/maqamat/maqam_rast/transpositions?tuningSystem=ibnsina_1037&startingNote=yegah",
    "availability": "/api/maqamat/maqam_rast/availability",
    "detail": "/api/maqamat/maqam_rast"
  }
}
```


### Compare maqām data across multiple tuning systems and starting notes {#compareMaqam}

```
GET /maqamat/{idName}/compare
```

Compare comprehensive maqām data across multiple tuning systems **and** multiple starting
notes in a single request. Given `N` tuning systems and `M` starting notes, the response
contains the Cartesian product of `N × M` comparison cells in user-supplied order
(outer loop = `tuningSystems`, inner loop = `startingNotes`).

Each successful cell includes ascending/descending pitch class sequences, optional
interval data, ajnās mapping, family classification, and transposition details. When a
requested starting note is not available in a given tuning system the cell carries an
informational `note` field (not `error`) together with `validStartingNotes`. When a hard
failure occurs (tuning system not found, maqām not realizable in this configuration, or a
`transposeTo` target that is unreachable) the cell carries an `error` field. The overall
response is always HTTP 200 — per-cell outcomes do not affect the HTTP status.

The following invariant always holds:

```
successfulComparisons + unavailableStartingNotes + failedComparisons === totalComparisons
```

This endpoint is ideal for comparative musicological analysis across historical tuning
systems and/or multiple modal transpositions.


**Path Parameters:**
- `idName`: URL-safe maqām identifier (string) **(required)**
  - Example: `maqam_bayyat`

**Query Parameters:**
- `tuningSystems` **(required)**: Comma-separated list of tuning system IDs.
  product of these tuning systems with the requested `startingNotes` (outer loop =
  `tuningSystems`, inner loop = `startingNotes`). Use `all` to include every tuning
  system in the archive (cannot be combined with explicit IDs).
 - Type: `string`
  - Example: `alsabbagh_1954,ibnsina_1037`
- `startingNotes` **(required)**: Comma-separated list of starting note names (URL-safe, diacritics-insensitive).
  response contains `N × M` cells for `N` tuning systems × `M` starting notes, in
  user-supplied order. If a starting note is not available in a given tuning system
  that cell carries an informational `note` field (with a `validStartingNotes`
  namespace) rather than pitch data.
 - Type: `string`
  - Example: `rast,yegah,ushayran`
- `pitchClassDataType` (optional): Output format for pitch class data. Defaults to `all` when omitted. - Type: `string` - Valid values: `all`, `englishName`, `solfege`, `fraction`, `cents`, ... (14 total) - Default: `all`
  - Example: `cents`
- `includeIntervals` (optional): Whether to include interval data between adjacent pitch classes on each cell.
Defaults to `"false"` when omitted..
  Defaults to `"false"` when omitted.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `transposeTo` (optional): Transpose every successful cell to the given tonic note (applies to every cell in the
Cartesian product).
  Cartesian product). If the requested target is not reachable in a given cell the cell
  carries an `error` plus an `availableTranspositions` list.
 - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with `Ar` suffix (e.g., `displayNameAr`, `noteNameDisplayAr`)
  - Note names, maqām names, and jins names get Arabic versions in `*Ar` fields
  - Tuning system display names get Arabic versions in `displayNameAr` if available
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_bayyat/compare?tuningSystems=alsabbagh_1954,ibnsina_1037&startingNotes=rast,yegah,ushayran&includeArabic=true"
```

**Response:** Comparison data retrieved successfully. Note that the response is always HTTP 200
regardless of per-cell outcomes; individual failures (missing starting note, tuning
system not found, maqām not realizable, unreachable transposeTo) are reported on the
respective cell via `note` or `error` fields. The counters
`successfulComparisons + unavailableStartingNotes + failedComparisons` always equal
`totalComparisons`.


**Example response — twoTuningSystems:**

```json
{
  "maqam": {
    "id": "1",
    "idName": "maqam_rast",
    "displayName": "maqām rāst",
    "version": "2025-12-10T17:03:34.565Z"
  },
  "comparisons": {
    "count": 1,
    "totalComparisons": 1,
    "successfulComparisons": 1,
    "unavailableStartingNotes": 0,
    "failedComparisons": 0,
    "data": [
      {
        "tuningSystem": {
          "id": "alsabbagh_1954",
          "idName": "alsabbagh_1954",
          "displayName": "al-Ṣabbāgh (1954) Contemporary Arabic Tuning 24-Tone",
          "version": "2025-10-18T19:42:23.643Z"
        },
        "startingNote": {
          "idName": "rast",
          "displayName": "rāst"
        },
        "maqam": {
          "id": "1",
          "idName": "maqam_rast",
          "displayName": "maqām rāst",
          "version": "2025-12-10T17:03:34.565Z",
          "maqamFamilyId": "rast",
          "maqamFamilyDisplayName": "rāst"
        },
        "tonic": {
          "idName": "rast",
          "displayName": "rāst"
        },
        "stats": {
          "tuningSystem": {
            "numberOfPitchClassesSingleOctave": 24,
            "referenceFrequency": 130.665
          },
          "maqam": {
            "numberOfPitchClasses": 7,
            "isOctaveRepeating": true
          }
        },
        "availableTranspositions": [],
        "pitchData": {
          "ascending": [
            {
              "pitchClassIndex": 0,
              "octave": 1,
              "scaleDegree": "I",
              "noteName": "rast",
              "noteNameDisplay": "rāst",
              "cents": 0
            },
            {
              "pitchClassIndex": 4,
              "octave": 1,
              "scaleDegree": "II",
              "noteName": "dugah",
              "noteNameDisplay": "dūgāh",
              "cents": 203.91000173077484
            }
          ],
          "descending": [
            {
              "pitchClassIndex": 20,
              "octave": 1,
              "scaleDegree": "VII",
              "noteName": "ajam",
              "noteNameDisplay": "ʿajam",
              "cents": 1019.5580263750745
            },
            {
              "pitchClassIndex": 18,
              "octave": 1,
              "scaleDegree": "VI",
              "noteName": "husayni",
              "noteNameDisplay": "ḥusaynī",
              "cents": 905.8650025961623
            }
          ]
        },
        "ajnas": {
          "ascending": {
            "rāst": {
              "id": "19",
              "idName": "jins_rast",
              "displayName": "jins rāst"
            },
            "dūgāh": {
              "id": "2",
              "idName": "jins_bayyat",
              "displayName": "jins bayyāt"
            },
            "chahārgāh": null
          },
          "descending": {
            "ʿajam": null,
            "ḥusaynī": {
              "id": "30",
              "idName": "jins_kurd_ushayran",
              "displayName": "jins kurd ʿushayrān"
            }
          }
        },
        "intervals": {
          "ascending": [
            {
              "cents": 203.91000173077484
            },
            {
              "cents": 152.95309101871007
            }
          ],
          "descending": [
            {
              "cents": 113.69302377891222
            },
            {
              "cents": 203.91000173077487
            }
          ]
        },
        "parameters": {
          "pitchClassDataType": "cents",
          "includeIntervals": true,
          "transposeTo": null
        },
        "links": {
          "detail": "/api/maqamat/maqam_rast?tuningSystem=alsabbagh_1954&startingNote=r%C4%81st&pitchClassDataType=cents&includeIntervals=true",
          "availability": "/api/maqamat/maqam_rast/availability"
        }
      }
    ]
  },
  "parameters": {
    "tuningSystems": {
      "idNames": [
        "alsabbagh_1954"
      ],
      "displayNames": [
        "alsabbagh_1954"
      ]
    },
    "startingNotes": {
      "idNames": [
        "rast"
      ],
      "displayNames": [
        "rast"
      ]
    },
    "pitchClassDataType": "cents",
    "includeIntervals": true,
    "transposeTo": null
  },
  "links": {
    "self": "https://diarmaqar.net/api/maqamat/maqam_rast/compare?tuningSystems=alsabbagh_1954&startingNotes=rast&pitchClassDataType=cents",
    "detail": "/api/maqamat/maqam_rast",
    "availability": "/api/maqamat/maqam_rast/availability"
  }
}
```


### Classify maqāmāt by 12-pitch-class sets {#classifyMaqamat12PitchClassSets}

```
GET /maqamat/classification/12-pitch-class-sets
```

Groups maqāmāt according to sets of 12 pitch classes suitable for MIDI keyboard tuning
and Scala file export. Each set is created by merging pitch classes from the specified
tuning system with alkindi_874 filler pitch classes, based on matching IPN reference
note names.

**Critical Design Principles:**
- **Octave Alignment**: Both the maqām tuning system and alkindi_874 use the same
  `startingNote` to ensure octaves align correctly
- **Chromatic Order**: Each set contains exactly 12 pitch classes ordered chromatically
  starting from the maqām's tonic (e.g., C, C#, D, D#... for Rāst)
- **Arabic Musicological Logic**: IPN references respect Arabic maqām theory where
  microtonal modifiers indicate what the pitch is a variant OF, not mathematical proximity
  to 12-EDO semitones
- **Direct Tuning System Values**: All cent values come directly from tuning systems
  without post-processing or calculation

**The Algorithm:**
1. Loads pitch classes from both the specified tuning system and alkindi_874 using
   the same `startingNote`
2. For each maqām transposition:
   - Extracts IPN reference note names from ascending and descending sequences
   - Replaces matching pitch classes in al-Kindi base (ascending takes priority, then descending)
   - Selects pitch classes from correct octaves to ensure ascending chromatic order
   - Orders the 12 pitch classes chromatically starting from the maqām's tonic
3. Groups compatible maqāmāt together
4. Names each group after the source maqām (e.g., "maqām rāst set")

**Compatibility:**
- Maqāmāt with duplicate IPN references (same IPN appearing with different pitch values)
  are marked as incompatible and cannot form valid 12-pitch-class sets
- Compatible maqāmāt can be performed entirely within a single 12-pitch-class set

**Output Format:**
- Pitch classes ordered chromatically (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
- Starting from the maqām's tonic (default) OR from IPN "C" (if `startSetFromC=true`)
- Relative cents from 0 (reference note) to ~1050-1200 (octave)
- `maqamTonic` field indicates the actual maqām tonic position and note name
- Suitable for MIDI keyboard tuning and Scala (.scl) file generation

**Filtering Options:**
- Use `setId` to retrieve a specific set and its compatible maqāmāt
- Use `maqamId` to find all sets containing a specific maqām


**Query Parameters:**
- `tuningSystem` (optional): Tuning system ID for maqāmāt (default: cairocongresstuningcommittee_1929) - Type: `string` - Default: `cairocongresstuningcommittee_1929`
  - Example: `cairocongresstuningcommittee_1929`
- `startingNote` (optional): Starting note for both the maqām tuning system and alkindi_874 (default: yegah).
IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
correctly and pitch classes can be properly selected from matching octaves.
  IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
  correctly and pitch classes can be properly selected from matching octaves. Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string` - Default: `yegah`
  - Example: `yegah`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`
- `includeIncompatible` (optional): Include maqāmāt that cannot form valid 12-pitch-class sets - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `startSetFromC` (optional): Start pitch class set from IPN reference "C" (degree 0) instead of from the maqām's tonic.
When `true`, the set is reordered to start from C at 0.00 cents (relative), making it
directly compatible with Scala (.scl) file format which maps degree 0 to middle C by default.
  When `true`, the set is reordered to start from C at 0.00 cents (relative), making it
  directly compatible with Scala (.scl) file format which maps degree 0 to middle C by default. **Technical Implementation:**
  1. **Octave Selection**: For maqāmāt starting mid-octave (e.g., D), pitch classes before the tonic in chromatic order (C, C#) are taken from octave 1, while those at or after the tonic use their original octaves
  2. **Array Rotation**: The 12 pitch classes are rotated to place C first
  3. **Relative Cents**: Calculated from C (0.00 cents), with octave wrap-around handling (negative values + 1200)
  4. **Note Names**: Arabic note names follow the NoteName model's octave conventions (e.g., C octave 1 = rāst, C octave 2 = kurdān)
  5. **Tonic Tracking**: The `maqamTonic` field indicates the actual maqām tonic's IPN, note names, and position in the reordered set **Use Cases:**
  - `false` (default): For understanding maqām structure starting from its tonic
  - `true`: For Scala .scl export (no .kbm file needed) or MIDI keyboard mapping where C = degree 0 **Example:**
  - Maqām ḥijāz (tonic D/dūgāh at 702.13 cents): - Default mode: D at position 0 (0.00 cents relative) - Scala mode: C (rāst, 498.04 cents) at position 0 (0.00 cents relative), D at position 2 (204.08 cents relative)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `pitchClassDataType` (optional): Controls which pitch class data fields are returned in the response.
  - `all`: Returns all available pitch class data fields
  - `englishName`: English note name with octave (e.g., "D2", "E-b3")
  - `fraction`: Frequency ratio as a fraction string
  - `cents`: Absolute cents value from the tuning system
  - `decimalRatio`: Frequency ratio as decimal number
  - `stringLength`: String length for oud/qanun (if available)
  - `frequency`: Frequency in Hz
  - `abjadName`: Arabic abjad notation (if available)
  - `fretDivision`: Fret position for oud (if available)
  - `midiNoteNumber`: MIDI note number as decimal
  - `midiNoteDeviation`: MIDI note with cents deviation string
  - `centsDeviation`: Cents deviation from 12-EDO
  - `referenceNoteName`: IPN reference note name
  - `relativeCents`: Cents relative to the first pitch class (0.00 for tonic or C) **Default Behavior (parameter omitted):**
  - Returns minimal fields: `ipnReferenceNoteName`, `noteName`, `relativeCents`, `octave` **Example:**
  - `?pitchClassDataType=cents` returns only IPN, note name, and cents values
  - `?pitchClassDataType=all` returns all available data fields
 - Type: `string` - Valid values: `all`, `abjadName`, `englishName`, `solfege`, `fraction`, ... (15 total)
  - Example: `cents`
- `setId` (optional): Filter by specific set ID to retrieve that set and its compatible maqāmāt (e.g., 'maqam_rast_set') - Type: `string`
  - Example: `maqam_rast_set`
- `maqamId` (optional): Filter by maqām ID to find all sets containing that maqām (e.g., 'maqam_rast') - Type: `string`
  - Example: `maqam_rast`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/classification/12-pitch-class-sets?includeArabic=true"
```

**Response:** Classification results with sets and compatible maqāmāt

**Example response — default:**

```json
{
  "summary": [
    {
      "setIdName": "maqam_rast_set",
      "setDisplayName": "maqām rāst set",
      "compatibleMaqamat": [
        {
          "maqamIdName": "maqam_rast",
          "maqamDisplayName": "maqām rāst",
          "isTransposed": false
        }
      ]
    }
  ],
  "statistics": {
    "totalSets": 1,
    "sets": [
      {
        "setIdName": "maqam_rast_set",
        "setDisplayName": "maqām rāst set",
        "compatibleMaqamatCount": 1
      }
    ],
    "totalCompatibleMaqamat": 1,
    "incompatibleMaqamatCount": 0
  },
  "sets": [
    {
      "id": "maqam_rast_set",
      "setIdName": "maqam_rast_set",
      "setDisplayName": "maqām rāst set",
      "sourceMaqam": {
        "id": "1",
        "idName": "maqam_rast",
        "displayName": "maqām rāst"
      },
      "sourceTransposition": {
        "idName": "maqam_rast",
        "displayName": "maqām rāst",
        "isTransposed": false
      },
      "pitchClassSet": [
        {
          "ipnReferenceNoteName": "C",
          "noteName": "rāst",
          "cents": 0,
          "fraction": "1/1",
          "decimalRatio": 1,
          "frequency": 130.665,
          "octave": 1
        }
      ],
      "compatibleMaqamat": [
        {
          "maqamIdName": "maqam_rast",
          "maqamDisplayName": "maqām rāst",
          "isTransposed": false
        }
      ],
      "compatibleMaqamatCount": 1
    }
  ],
  "totalSets": 1,
  "totalCompatibleMaqamat": 1,
  "incompatibleMaqamat": [],
  "incompatibleMaqamatCount": 0,
  "parameters": {
    "tuningSystem": {
      "id": "cairocongresstuningcommittee_1929",
      "idName": "cairocongresstuningcommittee-1929",
      "displayName": "Cairo Congress Tuning Committee (1929)"
    },
    "startingNote": {
      "idName": "yegah",
      "displayName": "yegāh"
    },
    "alKindiTuningSystem": {
      "id": "alkindi_874",
      "idName": "al-kindi-874",
      "displayName": "al-Kindī (874)"
    },
    "alKindiStartingNote": {
      "idName": "ushayran",
      "displayName": "ʿushayrān"
    },
    "centsTolerance": 5,
    "startSetFromC": false
  }
}
```


### Classify maqāmāt by maqam-based pitch class sets {#classifyMaqamatByMaqamPitchClassSets}

```
GET /maqamat/classification/maqam-pitch-class-sets
```

Groups maqāmāt according to maqam-based pitch class sets. Each set contains all pitch
classes from a single source maqam (union of ascending and descending), and identifies
which other maqāmāt can be performed using only those pitch classes.

**Musicological Purpose:**
Answers the question: "Which maqāmāt can be performed using only the pitch classes of
maqām X?" For example, maqām rāst on rāst includes pitch classes that can perform maqām
bayyāt on dūgāh and maqām segāh on segāh.

**Key Differences from 12-Pitch-Class-Sets:**
- **No Chromatic Base**: Does not merge with alkindi_874 or chromatic filler pitch classes
- **Variable Set Sizes**: Sets can contain any number of pitch classes (7, 8, 10, etc.), not fixed at 12
- **Octave-Equivalent Matching**: Pitch classes in different octaves treated as equivalent (C in octave 1 = C in octave 2)
- **Single Tuning System**: Uses only the specified tuning system (simpler than 12-pitch-class-sets)
- **Subset Matching**: Compatible maqāmāt must use subset of source maqam's pitch classes

**Critical Design Principles:**
- **Octave Equivalence**: IPN references are compared octave-normalized (C at any octave = "C")
- **Union of Melodic Paths**: Includes all pitch classes from both ascending AND descending sequences
- **Exact Matching**: All pitch classes from a compatible maqām must exist in the source set (within tolerance)
- **Direct Values**: All cent values come directly from tuning system without calculation
- **Tahlil Priority**: Base (non-transposed) maqāmāt create canonical sets first, then transpositions

**The Algorithm:**
1. For each maqām transposition (tahlil first, then transpositions):
   - Extracts all unique pitch classes from ascending + descending sequences
   - Groups by IPN reference (octave-equivalent)
   - Validates no duplicate IPN references with different cents values
   - Creates a maqam-based pitch class set
2. For each set, finds compatible maqāmāt:
   - Checks if all pitch classes needed by candidate maqām exist in source set
   - Compares cents values within tolerance (octave-normalized)
   - Marks candidate as compatible if all pitch classes match
3. Groups compatible maqāmāt together
4. Names each group after the source maqām (e.g., "maqām rāst set")

**Compatibility:**
- Maqāmāt with duplicate IPN references (same IPN with different cents values when octave-normalized)
  are marked as incompatible
- Compatible maqāmāt can be performed entirely using the pitch classes of the source maqām
- **Minimum Set Size**: Only sets with 2 or more maqāmāt are returned (source + at least one compatible)
- Sets containing only the source maqām (no compatible maqāmāt) are filtered out

**Output Format:**
- Sets ordered by number of compatible maqāmāt (descending)
- Each set includes: source maqām, all pitch classes (in ascending cents order), compatible maqāmāt, pitch class count
- Pitch classes include: English name, note name, cents, frequency, fraction, etc.

**Filtering Options:**
- Use `setId` to retrieve a specific set and its compatible maqāmāt
- Use `maqamId` to find all sets containing a specific maqām


**Query Parameters:**
- `tuningSystem` (optional): Tuning system ID for all maqāmāt (default: cairocongresstuningcommittee_1929) - Type: `string` - Default: `cairocongresstuningcommittee_1929`
  - Example: `cairocongresstuningcommittee_1929`
- `startingNote` (optional): Starting note for the tuning system (default: yegah). - Type: `string` - Default: `yegah`
  - Example: `yegah`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`
- `includeIncompatible` (optional): Include maqāmāt that cannot form valid maqam-based pitch class sets - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includePitchClassData` (optional): Include pitch class data in the response (default: false).
  When false: Omits pitch class data, returning only set metadata and compatible maqamat
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `setId` (optional): Filter by specific set ID to retrieve that set and its compatible maqāmāt (e.g., 'maqam_rast_set') - Type: `string`
  - Example: `maqam_rast_set`
- `maqamId` (optional): Filter by maqām ID to find all sets containing that maqām (e.g., 'maqam_rast') - Type: `string`
  - Example: `maqam_rast`

**Example:**
```bash
curl "https://diarmaqar.net/api/maqamat/classification/maqam-pitch-class-sets?includeArabic=true"
```

**Response:** Classification results with maqam-based pitch class sets and compatible maqāmāt

**Example response — default:**

```json
{
  "statistics": {
    "totalSets": 1,
    "totalCompatibleMaqamat": 3,
    "incompatibleMaqamatCount": 0,
    "totalProcessed": 3
  },
  "sets": [
    {
      "setIdName": "maqam_rast_set",
      "setDisplayName": "maqām rāst set",
      "compatibleMaqamatCount": 3,
      "sourceMaqam": {
        "id": "1",
        "idName": "maqam_rast",
        "displayName": "maqām rāst"
      },
      "pitchClassSet": [
        {
          "englishName": "C3",
          "noteName": "rāst",
          "cents": 0,
          "fraction": "1/1",
          "decimalRatio": 1,
          "frequency": 130.665,
          "octave": 1
        },
        {
          "englishName": "D3",
          "noteName": "dūgāh",
          "cents": 203.91,
          "fraction": "9/8",
          "decimalRatio": 1.125,
          "frequency": 146.998,
          "octave": 1
        },
        {
          "englishName": "E3",
          "noteName": "segāh",
          "cents": 407.82,
          "fraction": "81/64",
          "decimalRatio": 1.266,
          "frequency": 165.361,
          "octave": 1
        }
      ],
      "pitchClassCount": 7,
      "compatibleMaqamat": [
        {
          "maqamIdName": "maqam_rast",
          "maqamDisplayName": "maqām rāst",
          "isTransposed": false,
          "tonic": {
            "ipnReferenceNoteName": "C",
            "noteNameIdName": "rast",
            "noteNameDisplayName": "rāst"
          }
        },
        {
          "maqamIdName": "maqam_bayyat_dugah",
          "maqamDisplayName": "maqām bayyāt (dūgāh)",
          "isTransposed": true,
          "tonic": {
            "ipnReferenceNoteName": "D",
            "noteNameIdName": "dugah",
            "noteNameDisplayName": "dūgāh"
          }
        },
        {
          "maqamIdName": "maqam_segah_segah",
          "maqamDisplayName": "maqām segāh (segāh)",
          "isTransposed": true,
          "tonic": {
            "ipnReferenceNoteName": "E",
            "noteNameIdName": "segah",
            "noteNameDisplayName": "segāh"
          }
        }
      ]
    }
  ],
  "parameters": {
    "tuningSystem": {
      "id": "cairocongresstuningcommittee_1929",
      "idName": "cairocongresstuningcommittee-1929",
      "displayName": "Cairo Congress Tuning Committee (1929)"
    },
    "startingNote": {
      "idName": "yegah",
      "displayName": "yegāh"
    },
    "centsTolerance": 5
  }
}
```


---

## Ajnās

Documented tri/tetra/penta-chords with historical source attribution.

### List all ajnās {#listAjnas}

```
GET /ajnas
```

Return all ajnās (singular: jins) with metadata.

- Includes URL-safe identifiers, display names, and structural information
- Structural information includes note sequences needed for maqām construction and analysis
- Optional bibliographic source references (sourceId and page) when `includeSources=true`


**Query Parameters:**
- `filterByTonic` (optional): Filter by jins tonic/first note (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string`
  - Example: `rast`
- `sortBy` (optional): Sort order for results.
  including empty string) return HTTP 400.
 - Type: `string` - Valid values: `alphabetical`, `tonic` - Default: `alphabetical`
  - Example: `alphabetical` - Sort alphabetically by display name (default)
  - Example: `tonic` - Sort by tonic note priority across the full NoteName.ts octave-stratified order, alphabetical tiebreak
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each jins - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/ajnas?includeSources=true&includeArabic=true"
```

**Response:** List of ajnās retrieved successfully

**Example response:**

```json
{
  "count": 29,
  "data": [
    {
      "jins": {
        "id": "5",
        "idName": "jins_ajam_ushayran",
        "displayName": "jins ʿajam ʿushayrān",
        "version": "2025-10-18T19:34:26.343Z"
      },
      "tonic": {
        "idName": "ajam_ushayran",
        "displayName": "ʿajam ʿushayrān"
      },
      "stats": {
        "numberOfPitchClasses": 4,
        "availableInTuningSystems": 35
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "ronzevalle_1904",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
              "version": "2025-11-26T10:19:38.569Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "alkindi_874",
              "idName": "alkindi_874",
              "displayName": "al-Kindī (874) 12-Tone",
              "version": "2025-11-17T13:16:34.754Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah",
                "rast"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh",
                "rāst"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "angloeuropean_1700",
              "idName": "angloeuropean_1700",
              "displayName": "Anglo-European (1700) 12-EDO",
              "version": "2025-11-18T11:53:58.428Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926a",
              "idName": "aldik_1926a",
              "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926b",
              "idName": "aldik_1926b",
              "displayName": "al-Dīk (1926b) Old Arabic Scale",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "…": "truncated — 30 more items"
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_ajam_ushayran"
      },
      "sources": []
    },
    {
      "jins": {
        "id": "11",
        "idName": "jins_athar_kurd",
        "displayName": "jins athar kurd",
        "version": "2025-10-18T19:34:45.799Z"
      },
      "tonic": {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      "stats": {
        "numberOfPitchClasses": 5,
        "availableInTuningSystems": 33
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "ronzevalle_1904",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
              "version": "2025-11-26T10:19:38.569Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "alkindi_874",
              "idName": "alkindi_874",
              "displayName": "al-Kindī (874) 12-Tone",
              "version": "2025-11-17T13:16:34.754Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah",
                "rast"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh",
                "rāst"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "angloeuropean_1700",
              "idName": "angloeuropean_1700",
              "displayName": "Anglo-European (1700) 12-EDO",
              "version": "2025-11-18T11:53:58.428Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926a",
              "idName": "aldik_1926a",
              "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926b",
              "idName": "aldik_1926b",
              "displayName": "al-Dīk (1926b) Old Arabic Scale",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "…": "truncated — 28 more items"
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_athar_kurd"
      },
      "sources": []
    },
    {
      "jins": {
        "id": "24",
        "idName": "jins_awj_ara",
        "displayName": "jins awj ʾārāʾ",
        "version": "2025-10-18T19:34:26.343Z"
      },
      "tonic": {
        "idName": "iraq",
        "displayName": "ʿirāq"
      },
      "stats": {
        "numberOfPitchClasses": 4,
        "availableInTuningSystems": 29
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "ronzevalle_1904",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
              "version": "2025-11-26T10:19:38.569Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926a",
              "idName": "aldik_1926a",
              "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926b",
              "idName": "aldik_1926b",
              "displayName": "al-Dīk (1926b) Old Arabic Scale",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932a",
              "idName": "cairocongresstuningcommittee_1932a",
              "displayName": "Cairo Congress Tuning Committee (1932a) Ancient Intervals",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932b",
              "idName": "cairocongresstuningcommittee_1932b",
              "displayName": "Cairo Congress Tuning Committee (1932b) Arab Intervals according to al-Dīk",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "…": "truncated — 24 more items"
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_awj_ara"
      },
      "sources": [
        {
          "sourceId": "alshawwa_1946",
          "page": "38"
        }
      ]
    },
    {
      "jins": {
        "id": "2",
        "idName": "jins_bayyat",
        "displayName": "jins bayyāt",
        "version": "2025-10-18T19:35:30.479Z"
      },
      "tonic": {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      "stats": {
        "numberOfPitchClasses": 4,
        "availableInTuningSystems": 31
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "ronzevalle_1904",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
              "version": "2025-11-26T10:19:38.569Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926a",
              "idName": "aldik_1926a",
              "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926b",
              "idName": "aldik_1926b",
              "displayName": "al-Dīk (1926b) Old Arabic Scale",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932a",
              "idName": "cairocongresstuningcommittee_1932a",
              "displayName": "Cairo Congress Tuning Committee (1932a) Ancient Intervals",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932b",
              "idName": "cairocongresstuningcommittee_1932b",
              "displayName": "Cairo Congress Tuning Committee (1932b) Arab Intervals according to al-Dīk",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "…": "truncated — 26 more items"
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_bayyat"
      },
      "sources": []
    },
    {
      "jins": {
        "id": "28",
        "idName": "jins_bayyat_ushayran",
        "displayName": "jins bayyāt ʿushayrān",
        "version": "2025-10-18T19:34:26.343Z"
      },
      "tonic": {
        "idName": "ushayran",
        "displayName": "ʿushayrān"
      },
      "stats": {
        "numberOfPitchClasses": 4,
        "availableInTuningSystems": 30
      },
      "availability": {
        "tuningSystems": [
          {
            "tuningSystem": {
              "id": "ronzevalle_1904",
              "idName": "ronzevalle_1904",
              "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
              "version": "2025-11-26T10:19:38.569Z"
            },
            "startingNotes": {
              "idNames": [
                "ushayran",
                "yegah"
              ],
              "displayNames": [
                "ʿushayrān",
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926a",
              "idName": "aldik_1926a",
              "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "aldik_1926b",
              "idName": "aldik_1926b",
              "displayName": "al-Dīk (1926b) Old Arabic Scale",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932a",
              "idName": "cairocongresstuningcommittee_1932a",
              "displayName": "Cairo Congress Tuning Committee (1932a) Ancient Intervals",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "tuningSystem": {
              "id": "cairocongresstuningcommittee_1932b",
              "idName": "cairocongresstuningcommittee_1932b",
              "displayName": "Cairo Congress Tuning Committee (1932b) Arab Intervals according to al-Dīk",
              "version": "2025-10-18T19:42:23.643Z"
            },
            "startingNotes": {
              "idNames": [
                "yegah"
              ],
              "displayNames": [
                "yegāh"
              ]
            }
          },
          {
            "…": "truncated — 25 more items"
          }
        ]
      },
      "links": {
        "detail": "/api/ajnas/jins_bayyat_ushayran"
      },
      "sources": []
    },
    {
      "…": "truncated — 24 more items"
    }
  ]
}
```


### Get detailed jins data {#getJins}

```
GET /ajnas/{idName}
```

Retrieve comprehensive data for a specific jins on its conventional or a transposed tonic, in a specific tuning system on a specific starting note name.

Returns:
- Comprehensive pitch class data in the requested tuning system and starting note name
- Optional includeIntervals data, transposition to different tonics, and tuning-system-specific modulations (including lower octave)

Parameter Discovery:
- Use options=true to discover valid values for all parameters including dynamically calculated transposition options
- Especially useful for finding valid tuning system starting notes and transposition tonics for a specific jins

Important:
- When options=true, the endpoint returns parameter discovery metadata instead of jins data
- This mode is mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, pitch class data type, includeIntervals)
- If data-returning parameters are provided with options=true, the API returns a 400 Bad Request error with details about conflicting parameters

Requirements:
- Tuning system is required for all requests; a starting note is required for data retrieval and optional in discovery mode (options=true), where omitting it returns the tuning system's valid starting notes
- These are fundamental to all pitch class calculations


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_rast` - Jins Rāst (representative example - with zalzalian intervals)
  - Example: `jins_kurd` - Jins Kurd (representative example - without zalzalian intervals)
  - Example: `jins_bayyat` - Jins Bayyāt (representative example - with zalzalian intervals)

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'ibnsina_1037', 'alfarabi_950g', 'meshshaqa_1899') - Type: `string`
  - Example: `ibnsina_1037` - Ibn Sīnā (1037) - 7-Fret Oud 17-Tone (representative example)
  - Example: `alfarabi_950g` - al-Fārābī (950g) - First Oud Tuning 27-Tone (representative example)
  - Example: `meshshaqa_1899` - Meshshāqa (1899) - Arabic Octave According to the Modernists (representative example)
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  - Different starting notes represent different theoretical frameworks within the same tuning system
  - Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `yegah` - yegāh (for IbnSina, Meshshaqa)
  - Example: `ushayran` - ʿushayrān (for al-Farabi, al-Kindi)
  - Example: `rast` - rāst (for CairoCongress, al-Sabbagh)
- `options` (optional): When true, returns available parameter options instead of jins data.
  - Tuning system is required for all requests; a starting note is required for data retrieval and optional in discovery mode (options=true), where omitting it returns the tuning system's valid starting notes
  - These are fundamental to all pitch class calculations and calculate valid starting note options and transposition tonics
  - Mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, pitch class data type, intervals)
  - Transposition options are dynamically calculated based on the specific jins, tuning system, and starting note combination
  - Only tonics where the jins can be validly transposed (preserving interval pattern) are included, not all possible pitch classes
  - If data-returning parameters are provided, returns 400 Bad Request error with details about conflicting parameters
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `pitchClassDataType` **(required)**: Specifies which pitch class data type to return for each pitch class.
  - When set to `all`, returns the full set of pitch class fields (englishName, solfege, abjadName, fraction, cents, decimalRatio, stringLength, frequency, fretDivision, midiNoteDecimal, midiNotePlusCentsDeviation, centsDeviation, ipnReferenceNoteName) plus the always-included identifiers (pitchClassIndex, octave, scaleDegree, noteName, noteNameDisplay, and noteNameDisplayAr if includeArabic is enabled).
  - When set to a specific format, returns only that field plus the always-included identifiers.
  - Empty string and unrecognised values return HTTP 400 with a hint listing valid options.
  - In discovery mode (when options=true), this parameter remains optional. Passing any value other than `cents` in discovery mode is treated as a conflict (400).
 - Type: `string` - Valid values: `all`, `abjadName`, `englishName`, `solfege`, `fraction`, ... (14 total) - Default: `all`
  - Example: `cents`
- `transposeTo` (optional): Transpose the jins to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  - To see all valid transposition options, request available parameter options instead of jins data
 - Type: `string`
  - Example: `nawa`
- `includeIntervals` (optional): Include interval data between jins degrees - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/ajnas/jins_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Jins data retrieved successfully.

- When options is true, the response structure differs and returns available parameter options instead of jins data
- In that case, transposition options contain only valid transposition tonics for this specific jins, tuning system, and starting note combination


**Example response — basic:**

```json
{
  "jins": {
    "id": "5",
    "idName": "jins_kurd",
    "displayName": "Jins Kurd",
    "version": "2025-10-18T19:41:17.132Z",
    "tonicId": "rast",
    "tonicName": "rāst",
    "transposition": false,
    "numberOfTranspositions": 17,
    "numberOfPitchClasses": 4,
    "commentsEnglish": null,
    "commentsArabic": null,
    "sources": [],
    "pitchClassDataType": "all",
    "includeIntervals": false
  },
  "context": {
    "tuningSystem": {
      "id": "ibnsina_1037",
      "displayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
      "version": "2025-10-18T19:41:17.132Z",
      "originalValueType": "fraction",
      "numberOfPitchClassesSingleOctave": 17,
      "numberOfPitchClassesAllOctaves": 68,
      "startingNoteName": "yegah",
      "referenceFrequency": 440
    }
  },
  "pitchData": [
    {
      "pitchClassIndex": 0,
      "octave": 1,
      "scaleDegree": "I",
      "noteName": "rast",
      "noteNameDisplay": "rāst",
      "englishName": "C3",
      "fraction": "1/1",
      "cents": 0,
      "decimalRatio": 1,
      "stringLength": 1000,
      "frequency": 440,
      "fretDivision": "0.000",
      "midiNoteDecimal": 48,
      "midiNotePlusCentsDeviation": "48 +0.0",
      "centsDeviation": 0,
      "ipnReferenceNoteName": "C"
    },
    {
      "pitchClassIndex": 1,
      "octave": 1,
      "scaleDegree": "II",
      "noteName": "dugah",
      "noteNameDisplay": "dūgāh",
      "englishName": "D3",
      "fraction": "204/182",
      "cents": 204,
      "decimalRatio": 1.12,
      "frequency": 492.8
    }
  ]
}
```


### Check jins availability across tuning systems {#getJinsAvailability}

```
GET /ajnas/{idName}/availability
```

Return tuning-system availability for a jins.

- Shows which tuning systems on which starting note names can realize the specified jins
- If `transpositionNoteName` is provided, filters results to show only tuning systems where the jins can be transposed to that specific note
- Validity is computed against each tuning system's note name sets and the jins's pitch class intervals
- Availability checking spans 3 octaves to correctly handle ajnās that may span multiple octaves


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_rast`

**Query Parameters:**
- `transpositionNoteName` (optional): Filter results to show only tuning systems where the jins can be transposed to this specific note (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/ajnas/jins_rast/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully

**Example response — withoutTransposition:**

```json
{
  "jins": {
    "id": "5",
    "idName": "jins_kurd",
    "displayName": "Jins Kurd",
    "version": "2025-10-18T19:41:17.132Z"
  },
  "availability": {
    "count": 29,
    "tuningSystems": [
      {
        "tuningSystemId": "ibnsina_1037",
        "tuningSystemDisplayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
        "tuningSystemStartingNoteNames": [
          "ʿushayrān",
          "yegāh"
        ],
        "tuningSystemStartingNoteNamesIds": [
          "ushayran",
          "yegah"
        ]
      },
      {
        "tuningSystemId": "alfarabi_950g",
        "tuningSystemDisplayName": "al-Fārābī (950g) First Oud Tuning (Full First Octave)",
        "tuningSystemStartingNoteNames": [
          "ʿushayrān",
          "yegāh"
        ],
        "tuningSystemStartingNoteNamesIds": [
          "ushayran",
          "yegah"
        ]
      }
    ]
  }
}
```


### List transpositions for a jins {#listJinsTranspositions}

```
GET /ajnas/{idName}/transpositions
```

Lists distinct transpositions (taswīr) for a jins within a specific tuning system and starting note.
The analytical form (tahlīl) is excluded. Octave/register variants of the same modal degree
(e.g. qarār dūgāh vs dūgāh vs muḥayyar) are not treated as distinct taswīr.

If there are no distinct taswīr for this tuning-system + starting-note combination, this endpoint returns `422`
with an `{ error, hint }` payload (it does not return a 200 with an empty list).


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_bayyat`

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'ibnsina_1037', 'alfarabi_950g', 'meshshaqa_1899') - Type: `string`
  - Example: `meshshaqa_1899`
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `yegah`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/ajnas/jins_bayyat/transpositions?tuningSystem=meshshaqa_1899&startingNote=yegah&includeArabic=true"
```

**Response:** Transpositions retrieved successfully

**Example response:**

```json
{
  "jins": {
    "id": "2",
    "idName": "jins_bayyat",
    "displayName": "jins bayyāt",
    "version": "2025-10-18T19:35:30.479Z"
  },
  "tuningSystem": {
    "id": "ibnsina_1037",
    "idName": "ibnsina_1037",
    "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
    "version": "2025-11-09T00:44:40.275Z",
    "numberOfPitchClassesSingleOctave": 17
  },
  "startingNote": {
    "idName": "yegah",
    "displayName": "yegāh"
  },
  "transpositions": {
    "total": 12,
    "options": {
      "idNames": [
        "qarar_yegah",
        "qarar_ushayran",
        "qarar_rast",
        "yegah",
        "ushayran",
        {
          "…": "truncated — 7 more items"
        }
      ],
      "displayNames": [
        "qarār yegāh",
        "qarār ʿushayrān",
        "qarār rāst",
        "yegāh",
        "ʿushayrān",
        {
          "…": "truncated — 7 more items"
        }
      ]
    },
    "detailed": [
      {
        "tonic": {
          "idName": "qarar_yegah",
          "displayName": "qarār yegāh"
        },
        "pitchClass": {
          "pitchClassIndex": 0,
          "octave": 0
        },
        "links": {
          "detail": "/api/ajnas/jins_bayyat?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=qarar_yegah"
        }
      },
      {
        "tonic": {
          "idName": "qarar_ushayran",
          "displayName": "qarār ʿushayrān"
        },
        "pitchClass": {
          "pitchClassIndex": 3,
          "octave": 0
        },
        "links": {
          "detail": "/api/ajnas/jins_bayyat?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=qarar_ushayran"
        }
      },
      {
        "tonic": {
          "idName": "qarar_rast",
          "displayName": "qarār rāst"
        },
        "pitchClass": {
          "pitchClassIndex": 7,
          "octave": 0
        },
        "links": {
          "detail": "/api/ajnas/jins_bayyat?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=qarar_rast"
        }
      },
      {
        "tonic": {
          "idName": "yegah",
          "displayName": "yegāh"
        },
        "pitchClass": {
          "pitchClassIndex": 0,
          "octave": 1
        },
        "links": {
          "detail": "/api/ajnas/jins_bayyat?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=yegah"
        }
      },
      {
        "tonic": {
          "idName": "ushayran",
          "displayName": "ʿushayrān"
        },
        "pitchClass": {
          "pitchClassIndex": 3,
          "octave": 1
        },
        "links": {
          "detail": "/api/ajnas/jins_bayyat?tuningSystem=ibnsina_1037&startingNote=yegah&transposeTo=ushayran"
        }
      },
      {
        "…": "truncated — 7 more items"
      }
    ]
  },
  "links": {
    "self": "https://diarmaqar.net/api/ajnas/jins_bayyat/transpositions?tuningSystem=ibnsina_1037&startingNote=yegah",
    "availability": "/api/ajnas/jins_bayyat/availability",
    "detail": "/api/ajnas/jins_bayyat"
  }
}
```


### Compare jins data across multiple tuning systems and starting notes {#compareJins}

```
GET /ajnas/{idName}/compare
```

Compare comprehensive jins data across multiple tuning systems **and** multiple starting
notes in a single request. Given `N` tuning systems and `M` starting notes, the response
contains the Cartesian product of `N × M` comparison cells in user-supplied order
(outer loop = `tuningSystems`, inner loop = `startingNotes`).

Each successful cell includes the (unidirectional) pitch class sequence, optional
interval data, and transposition details. When a requested starting note is not available
in a given tuning system the cell carries an informational `note` field (not `error`)
together with `validStartingNotes`. When a hard failure occurs (tuning system not found,
jins not realizable in this configuration, or an unreachable `transposeTo` target) the
cell carries an `error` field. The overall response is always HTTP 200 — per-cell
outcomes do not affect the HTTP status.

The following invariant always holds:

```
successfulComparisons + unavailableStartingNotes + failedComparisons === totalComparisons
```

This endpoint is ideal for comparative musicological analysis of melodic structures
across historical tuning systems and/or multiple modal transpositions.


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_bayyat`

**Query Parameters:**
- `tuningSystems` **(required)**: Comma-separated list of tuning system IDs.
  product of these tuning systems with the requested `startingNotes` (outer loop =
  `tuningSystems`, inner loop = `startingNotes`). Use `all` to include every tuning
  system in the archive (cannot be combined with explicit IDs).
 - Type: `string`
  - Example: `alsabbagh_1954,ibnsina_1037`
- `startingNotes` **(required)**: Comma-separated list of starting note names (URL-safe, diacritics-insensitive).
  response contains `N × M` cells for `N` tuning systems × `M` starting notes, in
  user-supplied order. If a starting note is not available in a given tuning system
  that cell carries an informational `note` field (with a `validStartingNotes`
  namespace) rather than pitch data.
 - Type: `string`
  - Example: `rast,yegah,ushayran`
- `pitchClassDataType` (optional): Output format for pitch class data. Defaults to `all` when omitted. - Type: `string` - Valid values: `all`, `englishName`, `solfege`, `fraction`, `cents`, ... (14 total) - Default: `all`
  - Example: `cents`
- `includeIntervals` (optional): Whether to include interval data between adjacent pitch classes on each cell.
Defaults to `"false"` when omitted..
  Defaults to `"false"` when omitted.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `transposeTo` (optional): Transpose every successful cell to the given tonic note (applies to every cell in the
Cartesian product).
  Cartesian product). If the requested target is not reachable in a given cell the cell
  carries an `error` plus an `availableTranspositions` list.
 - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with `Ar` suffix (e.g., `displayNameAr`, `noteNameDisplayAr`)
  - Note names and jins names get Arabic versions in `*Ar` fields
  - Tuning system display names get Arabic versions in `displayNameAr` if available
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/ajnas/jins_bayyat/compare?tuningSystems=alsabbagh_1954,ibnsina_1037&startingNotes=rast,yegah,ushayran&includeArabic=true"
```

**Response:** Comparison data retrieved successfully. Note that the response is always HTTP 200
regardless of per-cell outcomes; individual failures (missing starting note, tuning
system not found, jins not realizable, unreachable transposeTo) are reported on the
respective cell via `note` or `error` fields. The counters
`successfulComparisons + unavailableStartingNotes + failedComparisons` always equal
`totalComparisons`.


**Example response — twoTuningSystems:**

```json
{
  "jins": {
    "id": "19",
    "idName": "jins_rast",
    "displayName": "jins rāst",
    "version": "2025-10-18T19:34:26.343Z"
  },
  "comparisons": {
    "count": 1,
    "totalComparisons": 1,
    "successfulComparisons": 1,
    "unavailableStartingNotes": 0,
    "failedComparisons": 0,
    "data": [
      {
        "tuningSystem": {
          "id": "alsabbagh_1954",
          "idName": "alsabbagh_1954",
          "displayName": "al-Ṣabbāgh (1954) Contemporary Arabic Tuning 24-Tone",
          "version": "2025-10-18T19:42:23.643Z"
        },
        "startingNote": {
          "idName": "rast",
          "displayName": "rāst"
        },
        "jins": {
          "id": "19",
          "idName": "jins_rast",
          "displayName": "jins rāst",
          "version": "2025-10-18T19:34:26.343Z"
        },
        "tonic": {
          "idName": "rast",
          "displayName": "rāst"
        },
        "stats": {
          "tuningSystem": {
            "numberOfPitchClassesSingleOctave": 24,
            "referenceFrequency": 130.665
          },
          "jins": {
            "numberOfPitchClasses": 4
          }
        },
        "availableTranspositions": [],
        "pitchData": [
          {
            "pitchClassIndex": 0,
            "octave": 1,
            "scaleDegree": "I",
            "noteName": "rast",
            "noteNameDisplay": "rāst",
            "cents": 0
          },
          {
            "pitchClassIndex": 4,
            "octave": 1,
            "scaleDegree": "II",
            "noteName": "dugah",
            "noteNameDisplay": "dūgāh",
            "cents": 203.91000173077484
          },
          {
            "pitchClassIndex": 7,
            "octave": 1,
            "scaleDegree": "III",
            "noteName": "segah",
            "noteNameDisplay": "segāh",
            "cents": 356.8630927494849
          },
          {
            "pitchClassIndex": 10,
            "octave": 1,
            "scaleDegree": "IV",
            "noteName": "chahargah",
            "noteNameDisplay": "chahārgāh",
            "cents": 498.0449991346125
          }
        ],
        "parameters": {
          "pitchClassDataType": "cents",
          "includeIntervals": true,
          "transposeTo": null
        },
        "links": {
          "detail": "/api/ajnas/jins_rast?tuningSystem=alsabbagh_1954&startingNote=r%C4%81st&pitchClassDataType=cents&includeIntervals=true",
          "availability": "/api/ajnas/jins_rast/availability"
        },
        "intervals": [
          {
            "cents": 203.91000173077484
          },
          {
            "cents": 152.95309101871007
          },
          {
            "cents": 141.1819063851276
          }
        ]
      }
    ]
  },
  "parameters": {
    "tuningSystems": {
      "idNames": [
        "alsabbagh_1954"
      ],
      "displayNames": [
        "alsabbagh_1954"
      ]
    },
    "startingNotes": {
      "idNames": [
        "rast"
      ],
      "displayNames": [
        "rast"
      ]
    },
    "pitchClassDataType": "cents",
    "includeIntervals": true,
    "transposeTo": null
  },
  "links": {
    "self": "https://diarmaqar.net/api/ajnas/jins_rast/compare?tuningSystems=alsabbagh_1954&startingNotes=rast&pitchClassDataType=cents",
    "detail": "/api/ajnas/jins_rast",
    "availability": "/api/ajnas/jins_rast/availability"
  }
}
```


---

## Tuning Systems

Historical tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

### List all tuning systems {#listTuningSystems}

```
GET /tuning-systems
```

Retrieve metadata for all available tuning systems.

- Includes identifiers, display names, version information, primary value type, and pitch class counts per octave
- Responses include available starting note names for each tuning system
- Different starting notes represent different theoretical frameworks (e.g., ʿushayrān for oud tuning, yegāh for monochord measurements)
- Optional bibliographic source references (sourceId and page) when `includeSources=true`


**Query Parameters:**
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each tuning system - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/tuning-systems?includeSources=true&includeArabic=true"
```

**Response:** List of tuning systems

**Example response — english:**

```json
{
  "count": 35,
  "data": [
    {
      "tuningSystem": {
        "id": "ibnsina_1037",
        "idName": "ibnsina_1037",
        "displayName": "Ibn Sīnā (1037) 7-Fret Oud 17-Tone",
        "version": "2025-10-18T19:42:23.643Z",
        "year": "1037"
      },
      "startingNotes": {
        "idNames": [
          "ushayran",
          "yegah"
        ],
        "displayNames": [
          "ʿushayrān",
          "yegāh"
        ]
      },
      "stats": {
        "numberOfPitchClassesSingleOctave": 17
      },
      "sources": [
        {
          "sourceId": "alshawwa_1946",
          "page": "49"
        }
      ]
    },
    {
      "tuningSystem": {
        "id": "alfarabi_950g",
        "idName": "alfarabi_950g",
        "displayName": "al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone",
        "version": "2025-10-18T19:42:23.643Z",
        "year": "950g"
      },
      "startingNotes": {
        "idNames": [
          "ushayran",
          "yegah"
        ],
        "displayNames": [
          "ʿushayrān",
          "yegāh"
        ]
      },
      "stats": {
        "numberOfPitchClassesSingleOctave": 27
      },
      "sources": [
        {
          "sourceId": "alshawwa_1946",
          "page": "50"
        }
      ]
    }
  ]
}
```


### Get Tuning System Details {#getTuningSystemPitchClasses}

```
GET /tuning-systems/{id}/{startingNote}/pitch-classes
```

Get Tuning System Details - Returns all pitch classes for a specific tuning system and starting note.

This endpoint is essential for tuning system operations, providing comprehensive pitch class data
across all octaves with full formatting options.


**Path Parameters:**
- `id`: Tuning system identifier (string) **(required)**
  - Example: `cairocongresstuningcommittee_1929`
- `startingNote`: Tuning system starting note name (URL-safe, diacritics-insensitive). Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh (string) **(required)**
  - Example: `rast`

**Query Parameters:**
- `pitchClassDataType` (optional): Pitch class data format.
  - `all` returns all available fields including englishName, solfege, abjadName, fraction, cents, decimalRatio, stringLength, frequency, fretDivision, midiNoteDecimal, midiNotePlusCentsDeviation, centsDeviation, ipnReferenceNoteName
  - Use a specific value to return only that field plus minimal identifiers
 - Type: `string` - Valid values: `all`, `englishName`, `solfege`, `fraction`, `cents`, ... (14 total) - Default: `all`
  - Example: `all`
- `octave` (optional): Filter by octave number.
  Use a specific octave number (0, 1, 2, 3) to filter to that octave only.
 - Type: `string` - Valid values: `all`, `0`, `1`, `2`, `3` - Default: `all`
  - Example: `all`
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for the tuning system - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/tuning-systems/cairocongresstuningcommittee_1929/rast/pitch-classes?includeSources=true&includeArabic=true"
```

**Response:** Tuning system pitch classes retrieved successfully

**Example response:**

```json
{
  "tuningSystem": {
    "id": "ibnsina_1037",
    "idName": "ibnsina_1037",
    "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
    "version": "2025-11-09T00:44:40.275Z",
    "year": "1037",
    "numberOfPitchClassesSingleOctave": 17
  },
  "startingNotes": {
    "idNames": [
      "ushayran",
      "yegah"
    ],
    "displayNames": [
      "ʿushayrān",
      "yegāh"
    ]
  },
  "selectedStartingNote": {
    "idName": "yegah",
    "displayName": "yegāh"
  },
  "stats": {
    "totalPitchClasses": 17,
    "numberOfPitchClassesSingleOctave": 17,
    "referenceFrequency": 97.999,
    "octaves": [
      0,
      1,
      2,
      3
    ]
  },
  "pitchClasses": [
    {
      "pitchClassIndex": 0,
      "octave": 0,
      "noteName": "qarar_yegah",
      "noteNameDisplay": "qarār yegāh",
      "cents": -1200
    },
    {
      "pitchClassIndex": 1,
      "octave": 0,
      "noteName": "qarar_qarar_hisar",
      "noteNameDisplay": "qarār qarār ḥiṣār",
      "cents": -1088.691430896177
    },
    {
      "pitchClassIndex": 2,
      "octave": 0,
      "noteName": "qarar_qarar_tik_hisar/shuri",
      "noteNameDisplay": "qarār qarār tīk ḥiṣār/shūrī",
      "cents": -1061.427339096077
    },
    {
      "pitchClassIndex": 3,
      "octave": 0,
      "noteName": "qarar_ushayran",
      "noteNameDisplay": "qarār ʿushayrān",
      "cents": -996.0899982692251
    },
    {
      "pitchClassIndex": 4,
      "octave": 0,
      "noteName": "qarar_ajam_ushayran",
      "noteNameDisplay": "qarār ʿajam ʿushayrān",
      "cents": -905.8650025961624
    },
    {
      "…": "truncated — 63 more items"
    }
  ],
  "context": {
    "pitchClassDataType": "cents",
    "octave": "all"
  },
  "links": {
    "self": "https://diarmaqar.net/api/tuning-systems/ibnsina_1037/yegah/pitch-classes",
    "tuningSystem": "/api/tuning-systems/ibnsina_1037"
  },
  "sources": [
    {
      "sourceId": "farmer_1937",
      "page": "249"
    }
  ]
}
```


### List maqāmāt available in a tuning system {#listTuningSystemMaqamat}

```
GET /tuning-systems/{id}/{startingNote}/maqamat
```

Return all maqāmāt that can be realized in a given tuning system beginning on a specific starting note name.

- Feasibility is determined by comparing maqām pitch classes to the tuning system's note name sets (including adjacent octave context)


**Path Parameters:**
- `id`: Tuning system identifier (e.g., 'ibnsina_1037', 'alfarabi_950g', 'meshshaqa_1899') (string) **(required)**
  - Example: `alfarabi_950g`
- `startingNote`: Tuning system starting note name (URL-safe, diacritics-insensitive). Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh (string) **(required)**
  - Example: `ushayran`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeMaqamDegrees` (optional): When true, each maqām in data includes a `maqamDegrees` object with ascending and descending arrays
of PAO note name idNames (URL-safe identifiers for scale degrees)..
  of PAO note name idNames (URL-safe identifiers for scale degrees).
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeDegreeDetails` (optional): When true (and when includeMaqamDegrees=true), the endpoint returns `maqamDegrees.ascending` /
`maqamDegrees.descending` as arrays of objects `{ noteName, englishName, solfege }` instead of
note-name strings.
  `maqamDegrees.descending` as arrays of objects `{ noteName, englishName, solfege }` instead of
  note-name strings. The same transformation applies to `transpositions[].maqamDegrees`.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeTranspositions` (optional): When true, each maqām in data includes a `transpositions` array with the other transpositions
(excluding the base tonic).
  (excluding the base tonic). Each transposition has `tonic` and `maqamDegrees` with ascending/descending
  note name idNames for that transposed position.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `sortBy` (optional): Sort order for results.
  and `/ajnas`, which default to `alphabetical`) because the endpoint is intrinsically about
  a concrete pitch layout. Invalid values return HTTP 400.
 - Type: `string` - Valid values: `alphabetical`, `tonic` - Default: `tonic`
  - Example: `tonic` - Sort by tonic note priority across the full NoteName.ts octave-stratified order, alphabetical tiebreak
  - Example: `alphabetical` - Sort alphabetically by display name
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/tuning-systems/alfarabi_950g/ushayran/maqamat?includeArabic=true"
```

**Response:** Maqāmāt list retrieved successfully

**Example response:**

```json
{
  "tuningSystem": {
    "id": "ibnsina_1037",
    "idName": "ibnsina_1037",
    "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
    "version": "2025-11-09T00:44:40.275Z",
    "year": "1037",
    "numberOfPitchClassesSingleOctave": 17
  },
  "startingNotes": {
    "idNames": [
      "ushayran",
      "yegah"
    ],
    "displayNames": [
      "ʿushayrān",
      "yegāh"
    ]
  },
  "selectedStartingNote": {
    "idName": "yegah",
    "displayName": "yegāh"
  },
  "stats": {
    "totalMaqamatForStartingNote": 43,
    "totalMaqamatInLibrary": 63,
    "uniqueTonicCount": 9,
    "uniqueFamilyCount": 15,
    "referenceFrequency": 97.999
  },
  "data": [
    {
      "maqam": {
        "id": "34",
        "idName": "maqam_dilkeshidah",
        "displayName": "maqām dilkeshīdah",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "family": {
        "idName": "nahawand",
        "displayName": "nahāwand"
      },
      "tonic": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "stats": {
        "numberOfPitchClasses": 7
      },
      "characteristics": {
        "isOctaveRepeating": true,
        "hasAsymmetricDescending": true,
        "hasSuyur": true
      },
      "links": {
        "detail": "/api/maqamat/maqam_dilkeshidah"
      }
    },
    {
      "maqam": {
        "id": "30",
        "idName": "maqam_farahfazza",
        "displayName": "maqām faraḥfazzā",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "family": {
        "idName": "nahawand",
        "displayName": "nahāwand"
      },
      "tonic": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "stats": {
        "numberOfPitchClasses": 7
      },
      "characteristics": {
        "isOctaveRepeating": true,
        "hasAsymmetricDescending": true,
        "hasSuyur": true
      },
      "links": {
        "detail": "/api/maqamat/maqam_farahfazza"
      }
    },
    {
      "maqam": {
        "id": "53",
        "idName": "maqam_rast_yegah",
        "displayName": "maqām rāst yegāh",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "family": {
        "idName": "rast",
        "displayName": "rāst"
      },
      "tonic": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "stats": {
        "numberOfPitchClasses": 7
      },
      "characteristics": {
        "isOctaveRepeating": true,
        "hasAsymmetricDescending": true,
        "hasSuyur": false
      },
      "links": {
        "detail": "/api/maqamat/maqam_rast_yegah"
      }
    },
    {
      "maqam": {
        "id": "32",
        "idName": "maqam_sultani_yegah",
        "displayName": "maqām sulṭānī yegāh",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "family": {
        "idName": "nahawand",
        "displayName": "nahāwand"
      },
      "tonic": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "stats": {
        "numberOfPitchClasses": 7
      },
      "characteristics": {
        "isOctaveRepeating": true,
        "hasAsymmetricDescending": true,
        "hasSuyur": true
      },
      "links": {
        "detail": "/api/maqamat/maqam_sultani_yegah"
      }
    },
    {
      "maqam": {
        "id": "61",
        "idName": "maqam_zanjaran",
        "displayName": "maqām zanjarān",
        "version": "2025-12-11T23:34:00.303Z"
      },
      "family": {
        "idName": "hijaz",
        "displayName": "ḥijāz"
      },
      "tonic": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "stats": {
        "numberOfPitchClasses": 7
      },
      "characteristics": {
        "isOctaveRepeating": true,
        "hasAsymmetricDescending": true,
        "hasSuyur": false
      },
      "links": {
        "detail": "/api/maqamat/maqam_zanjaran"
      }
    },
    {
      "…": "truncated — 38 more items"
    }
  ],
  "links": {
    "self": "https://diarmaqar.net/api/tuning-systems/ibnsina_1037/yegah/maqamat",
    "tuningSystem": "/api/tuning-systems/ibnsina_1037",
    "collection": "/api/maqamat"
  }
}
```


---

## Modulations

### Find modulation routes between maqāmāt {#findModulationRoutes}

```
GET /modulation-routes
```

Calculate possible modulation routes between maqāmāt, similar to a navigation/maps application.

Uses al-Shawwā's 1946 modulation rules to find shortest paths between a source and target maqām,
with optional waypoints and return-to-start functionality.

**Key Features:**
- Finds shortest paths (fewest modulation steps) using BFS algorithm
- Supports waypoints for multi-stop journeys
- Optional return-to-start for round-trip routes (reflecting traditional maqām performance practice)
- `limitToShortestHops=true` returns only the shortest-length
  routes; default (`false`) pads the result with progressively
  longer routes up to `maxRoutes` / `maxHops`
- `allowOctaveJumps=true` lets BFS traverse register-shift
  (8va/8vb) edges between register-equivalent siblings; default
  (`false`) keeps routes strictly within al-Shawwā's
  scale-degree modulation rules
- `allowDownwardModulation=true` lets BFS traverse direct
  downward-modulation edges (`*OctaveBelow` categories, e.g.
  `sixthDegreeAscOctaveBelow` / `VI-8vb`). These are single-hop
  modulations to a different maqām whose tonic sits one octave
  below the ascending rule's target — common in Arabic practice
  (e.g. saba:dūgāh → ajam ushayrān:ajam ushayrān as one move).
  Default (`false`) ignores those edges
- Results cached per tuning system + starting note combination for performance
- `maxHops` is required and capped at 20 to prevent combinatorial explosion

**Graph Structure:**
- Nodes: Each (maqamId, tonic) pair is a unique node
- Edges: Modulation possibilities based on al-Shawwā's rules (scale degrees I, III, IV, V, VI)

**Performance Notes:**
- maxHops is required to prevent combinatorial explosion
- First request for a tuning system + starting note builds the graph (may take longer)
- Subsequent requests use cached graph data


**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'alfarabi_950g', 'ibnsina_1037') - Type: `string`
  - Example: `alfarabi_950g`
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
This is MANDATORY as it affects which maqāmāt are available and their modulation possibilities..
  This is MANDATORY as it affects which maqāmāt are available and their modulation possibilities.
 - Type: `string`
  - Example: `ushayran`
- `fromMaqam` **(required)**: Source maqam base ID (the starting point of the journey).
Use the base maqam identifier (e.g., "maqam_nahawand"), not the transposition display name.
Combine with `fromTonic` to specify a particular transposition..
  Use the base maqam identifier (e.g., "maqam_nahawand"), not the transposition display name.
  Combine with `fromTonic` to specify a particular transposition.
 - Type: `string`
  - Example: `maqam_rast`
- `fromTonic` (optional): Optional specific tonic for the source maqam (URL-safe).
If not specified, uses the canonical (taḥlīl) form..
  If not specified, uses the canonical (taḥlīl) form.
 - Type: `string`
  - Example: `rast`
- `toMaqam` **(required)**: Target maqam base ID (the destination of the journey).
Use the base maqam identifier (e.g., "maqam_nahawand"), not the transposition display name.
Combine with `toTonic` to specify a particular transposition..
  Use the base maqam identifier (e.g., "maqam_nahawand"), not the transposition display name.
  Combine with `toTonic` to specify a particular transposition.
 - Type: `string`
  - Example: `maqam_segah`
- `toTonic` (optional): Optional specific tonic for the target maqam (URL-safe).
If not specified, uses the canonical (taḥlīl) form..
  If not specified, uses the canonical (taḥlīl) form.
 - Type: `string`
  - Example: `nawa`
- `maxHops` **(required)**: Maximum number of modulation steps allowed (required safeguard).
Prevents combinatorial explosion in route calculation.
Most musical modulation sequences are 2-4 hops.
Maximum allowed value is 20..
  Prevents combinatorial explosion in route calculation.
  Most musical modulation sequences are 2-4 hops.
  Maximum allowed value is 20.
 - Type: `integer`
  - Example: `5`
- `waypoints` (optional): Optional comma-separated waypoints to pass through.
Format: maqamId:tonicId or just maqamId (uses canonical tonic).
Example: "maqam_bayyat:dugah,maqam_saba".
  Format: maqamId:tonicId or just maqamId (uses canonical tonic).
  Example: "maqam_bayyat:dugah,maqam_saba"
 - Type: `string`
  - Example: `maqam_bayyat:dugah`
- `returnToStartingMaqam` (optional): Whether to calculate the return path back to the source (starting) maqam.
Reflects traditional maqām performance practice where music returns to the starting mode.
When true, response includes both outbound and return routes..
  Reflects traditional maqām performance practice where music returns to the starting mode.
  When true, response includes both outbound and return routes.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `maxRoutes` (optional): Maximum number of routes to return - Type: `integer` - Default: `10`
  - Example: `10`
- `limitToShortestHops` (optional): When `true`, only routes at the minimum hop count are
returned — all routes in the response share the same `hops`
value.
  returned — all routes in the response share the same `hops`
  value. When `false` (default), the response is filled out
  with progressively longer simple paths (still capped by
  `maxHops` and `maxRoutes`, ordered shortest-first).
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `allowOctaveJumps` (optional): When `true`, BFS may traverse register-shift (`8va` / `8vb`)
edges between register-equivalent siblings of the same
maqām (e.g.
  edges between register-equivalent siblings of the same
  maqām (e.g. ḥijāz:muḥayyar → ḥijāz:dūgāh). These edges
  appear anywhere in a route — at the start, in the middle, or
  at the end — and let the algorithm reach register variants
  that aren't directly connected by scale-degree modulation.
  When `false` (default), those edges are ignored and every
  hop in every returned route must be a genuine al-Shawwā
  modulation (degrees I / III / IV / V / VI). Note: `allowOctaveJumps` controls PURE register shifts
  (same maqām, different octave). `allowDownwardModulation`
  controls DOWNWARD MODULATIONS (different maqām at a
  lower-octave tonic). They are independent flags.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `allowDownwardModulation` (optional): When `true`, BFS may traverse direct downward-modulation
edges (`*OctaveBelow` categories, e.g.
`sixthDegreeAscOctaveBelow` / `VI-8vb`).
  edges (`*OctaveBelow` categories, e.g.
  `sixthDegreeAscOctaveBelow` / `VI-8vb`). These represent a
  single-hop modulation to a different maqām whose tonic sits
  one octave below the corresponding ascending rule's target —
  common in Arabic practice (e.g. saba:dūgāh → ajam
  ushayrān:ajam ushayrān as one move rather than as VI↑ + 8vb).
  When `false` (default), those edges are ignored and such a
  move can only be reached via the equivalent two-hop
  ascending-modulation + register-shift combination.
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
Adds Arabic versions with "Ar" suffix (e.g., maqamDisplayNameAr, tonicDisplayAr).
  Adds Arabic versions with "Ar" suffix (e.g., maqamDisplayNameAr, tonicDisplayAr)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`

**Example:**
```bash
curl "https://diarmaqar.net/api/modulation-routes?tuningSystem=alfarabi_950g&startingNote=ushayran&fromMaqam=maqam_rast&toMaqam=maqam_segah&maxHops=5&includeArabic=true"
```

**Response:** Modulation routes calculated successfully

**Example response — routeFound:**

```json
{
  "totalPossibleRoutes": {
    "outboundRoutesCount": 1,
    "data": [
      {
        "routeNumber": 1,
        "outboundRoute": {
          "hops": 2,
          "steps": [
            {
              "from": {
                "maqamId": "1",
                "maqamIdName": "maqam_rast",
                "maqamDisplayName": "maqām rāst",
                "tonicId": "rast",
                "tonicDisplay": "rāst",
                "isTransposition": false
              },
              "to": {
                "maqamId": "2",
                "maqamIdName": "maqam_bayyat",
                "maqamDisplayName": "maqām bayyāt",
                "tonicId": "dugah",
                "tonicDisplay": "dūgāh",
                "isTransposition": false
              },
              "modulationDegree": "III",
              "modulationCategory": "thirdDegree"
            },
            {
              "from": {
                "maqamId": "2",
                "maqamIdName": "maqam_bayyat",
                "maqamDisplayName": "maqām bayyāt",
                "tonicId": "dugah",
                "tonicDisplay": "dūgāh",
                "isTransposition": false
              },
              "to": {
                "maqamId": "5",
                "maqamIdName": "maqam_hijaz",
                "maqamDisplayName": "maqām ḥijāz",
                "tonicId": "nawa",
                "tonicDisplay": "nawā",
                "isTransposition": false
              },
              "modulationDegree": "IV",
              "modulationCategory": "fourthDegree"
            }
          ]
        }
      }
    ]
  },
  "context": {
    "tuningSystem": {
      "id": "alfarabi_950g",
      "displayName": "al-Fārābī (950) غ"
    },
    "startingNote": {
      "idName": "ushayran",
      "displayName": "ʿushayrān"
    },
    "sourceNode": {
      "maqamId": "maqam_rast",
      "maqamDisplayName": "Maqam Rast",
      "tonicId": "rast",
      "tonicDisplay": "rāst",
      "isTransposition": false
    },
    "targetNode": {
      "maqamId": "maqam_hijaz",
      "maqamDisplayName": "Maqam Hijaz",
      "tonicId": "nawa",
      "tonicDisplay": "nawā",
      "isTransposition": false
    },
    "searchConstraints": {
      "maxHops": 5,
      "maxRoutes": 10,
      "returnToStartingMaqam": false,
      "limitToShortestHops": false,
      "allowOctaveJumps": false,
      "allowDownwardModulation": false
    }
  }
}
```


---

## Pitch Classes

### List all note names {#listNoteNames}

```
GET /pitch-classes/note-names
```

Returns all note names used in the app, bilingually, sortable by note name order or alphabetically.

Note names are sourced from all octave arrays in NoteName.ts (octaveZeroNoteNames, octaveOneNoteNames, 
octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames). Each note name includes:
- Canonical order (index within its octave array)
- Octave number (0-4)
- English IPN equivalent

Note names are unique per octave, so the same note name string in different octaves represents 
different pitch classes.

**Note**: Availability data is not included in this endpoint (it's expensive to calculate). 
Use the availability endpoint (`/api/pitch-classes/note-names/{noteName}/availability`) to get 
availability information for a specific note name.


**Query Parameters:**
- `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `order`, `alphabetical` - Default: `order`
  - Example: `order` - Sort by canonical note name order (from NoteName.ts arrays)
  - Example: `alphabetical` - Sort alphabetically by display name
- `filterByTuningSystem` (optional): Filter by tuning system ID to show only note names that exist in that system (URL-safe, case-insensitive, diacritics-insensitive). - Type: `string`
  - Example: `meshshaqa_1899`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/pitch-classes/note-names?includeArabic=true"
```

**Response:** List of note names retrieved successfully

**Example response:**

```json
{
  "count": 183,
  "data": [
    {
      "noteName": {
        "idName": "qarar_yegah",
        "displayName": "qarār yegāh"
      },
      "englishName": "G1",
      "order": 0,
      "octave": 0,
      "links": {
        "detail": "/api/pitch-classes/note-names/qarar_yegah",
        "availability": "/api/pitch-classes/note-names/qarar_yegah/availability"
      }
    },
    {
      "noteName": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "englishName": "G2",
      "order": 0,
      "octave": 1,
      "links": {
        "detail": "/api/pitch-classes/note-names/yegah",
        "availability": "/api/pitch-classes/note-names/yegah/availability"
      }
    },
    {
      "noteName": {
        "idName": "nawa",
        "displayName": "nawā"
      },
      "englishName": "G3",
      "order": 0,
      "octave": 2,
      "links": {
        "detail": "/api/pitch-classes/note-names/nawa",
        "availability": "/api/pitch-classes/note-names/nawa/availability"
      }
    },
    {
      "noteName": {
        "idName": "saham/ramal_tuti",
        "displayName": "saham/ramal tūtī"
      },
      "englishName": "G4",
      "order": 0,
      "octave": 3,
      "links": {
        "detail": "/api/pitch-classes/note-names/saham/ramal_tuti",
        "availability": "/api/pitch-classes/note-names/saham/ramal_tuti/availability"
      }
    },
    {
      "noteName": {
        "idName": "qarar_qarar_nim_hisar",
        "displayName": "qarār qarār nīm ḥiṣār"
      },
      "englishName": "Ab--1",
      "order": 1,
      "octave": 0,
      "links": {
        "detail": "/api/pitch-classes/note-names/qarar_qarar_nim_hisar",
        "availability": "/api/pitch-classes/note-names/qarar_qarar_nim_hisar/availability"
      }
    },
    {
      "…": "truncated — 178 more items"
    }
  ]
}
```


### Get pitch class details by note name {#getPitchClassByNoteName}

```
GET /pitch-classes/note-names/{noteName}
```

Get pitch class details for a note name, across all tuning systems or a specific one.

When querying by note name, the note name itself identifies the octave (note names are unique per octave).
The octave parameter is optional and can be used for validation.

Supports:
- Single tuning system with specific starting note
- Single tuning system with startingNote="all" (returns array for all starting notes)
- All tuning systems (returns array for all tuning systems and starting notes)


**Path Parameters:**
- `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  - Example: `rast`

**Query Parameters:**
- `tuningSystem` (optional): Tuning system ID. - Type: `string`
  - Example: `cairocongresstuningcommittee_1929`
- `startingNote` (optional): Starting note for the tuning system.
  - Use "all" to include all available starting notes for that tuning system (returns array of results, one per starting note) Note: Since note names are unique per octave, the note name itself identifies the octave. No octave parameter is needed. Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `rast`
- `pitchClassDataType` (optional): Pitch class data format (defaults to `all` when omitted, matching the handler) - Type: `string` - Valid values: `all`, `abjadName`, `englishName`, `solfege`, `fraction`, ... (14 total) - Default: `all`
  - Example: `cents`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/pitch-classes/note-names/rast?includeArabic=true"
```

**Response:** Pitch class data retrieved successfully

**Example response:**

```json
{
  "context": {
    "tuningSystem": {
      "id": "ibnsina_1037",
      "idName": "ibnsina_1037",
      "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
      "version": "2025-11-09T00:44:40.275Z"
    },
    "startingNote": {
      "idName": "yegah",
      "displayName": "yegāh"
    },
    "noteName": {
      "idName": "yegah",
      "displayName": "yegāh"
    },
    "referenceFrequency": 97.999,
    "pitchClassDataType": "cents"
  },
  "pitchClass": {
    "pitchClassIndex": 0,
    "octave": 1,
    "noteName": "yegah",
    "noteNameDisplay": "yegāh",
    "cents": 0
  },
  "links": {
    "self": "https://diarmaqar.net/api/pitch-classes/note-names/yegah?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents",
    "availability": "/api/pitch-classes/note-names/yegah/availability",
    "compare": "/api/pitch-classes/note-names/yegah/compare"
  }
}
```


### Check note name availability across tuning systems {#getNoteNameAvailability}

```
GET /pitch-classes/note-names/{noteName}/availability
```

Check which tuning systems support a specific note name and what pitch class index it has in each tuning system.

Returns for each tuning system:
- All starting notes where the note name exists
- The pitch class index for each starting note
- The octave where the note name was found


**Path Parameters:**
- `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  - Example: `rast`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/pitch-classes/note-names/rast/availability?includeArabic=true"
```

**Response:** Availability data retrieved successfully

**Example response:**

```json
{
  "noteName": {
    "idName": "yegah",
    "displayName": "yegāh"
  },
  "availability": {
    "count": 35,
    "data": [
      {
        "tuningSystem": {
          "id": "ronzevalle_1904",
          "idName": "ronzevalle_1904",
          "displayName": "Ronzevalle (1904) Modernist Arabic Tuning",
          "version": "2025-11-26T10:19:38.569Z"
        },
        "startingNotes": [
          {
            "startingNote": {
              "idName": "ushayran",
              "displayName": "ʿushayrān"
            },
            "pitchClassIndex": 20,
            "octave": 0
          },
          {
            "startingNote": {
              "idName": "yegah",
              "displayName": "yegāh"
            },
            "pitchClassIndex": 0,
            "octave": 1
          }
        ]
      },
      {
        "tuningSystem": {
          "id": "alkindi_874",
          "idName": "alkindi_874",
          "displayName": "al-Kindī (874) 12-Tone",
          "version": "2025-11-17T13:16:34.754Z"
        },
        "startingNotes": [
          {
            "startingNote": {
              "idName": "ushayran",
              "displayName": "ʿushayrān"
            },
            "pitchClassIndex": 10,
            "octave": 0
          },
          {
            "startingNote": {
              "idName": "yegah",
              "displayName": "yegāh"
            },
            "pitchClassIndex": 0,
            "octave": 1
          },
          {
            "startingNote": {
              "idName": "rast",
              "displayName": "rāst"
            },
            "pitchClassIndex": 7,
            "octave": 0
          }
        ]
      },
      {
        "tuningSystem": {
          "id": "angloeuropean_1700",
          "idName": "angloeuropean_1700",
          "displayName": "Anglo-European (1700) 12-EDO",
          "version": "2025-11-18T11:53:58.428Z"
        },
        "startingNotes": [
          {
            "startingNote": {
              "idName": "ushayran",
              "displayName": "ʿushayrān"
            },
            "pitchClassIndex": 10,
            "octave": 0
          },
          {
            "startingNote": {
              "idName": "yegah",
              "displayName": "yegāh"
            },
            "pitchClassIndex": 0,
            "octave": 1
          }
        ]
      },
      {
        "tuningSystem": {
          "id": "aldik_1926a",
          "idName": "aldik_1926a",
          "displayName": "al-Dīk (1926a) al-Sullam al-Fārsī or al-'Arabī (!!!)",
          "version": "2025-10-18T19:42:23.643Z"
        },
        "startingNotes": [
          {
            "startingNote": {
              "idName": "yegah",
              "displayName": "yegāh"
            },
            "pitchClassIndex": 0,
            "octave": 1
          }
        ]
      },
      {
        "tuningSystem": {
          "id": "aldik_1926b",
          "idName": "aldik_1926b",
          "displayName": "al-Dīk (1926b) Old Arabic Scale",
          "version": "2025-10-18T19:42:23.643Z"
        },
        "startingNotes": [
          {
            "startingNote": {
              "idName": "yegah",
              "displayName": "yegāh"
            },
            "pitchClassIndex": 0,
            "octave": 1
          }
        ]
      },
      {
        "…": "truncated — 30 more items"
      }
    ]
  },
  "links": {
    "self": "https://diarmaqar.net/api/pitch-classes/note-names/yegah/availability",
    "detail": "/api/pitch-classes/note-names/yegah",
    "compare": "/api/pitch-classes/note-names/yegah/compare"
  }
}
```


### Compare pitch class by note name across tuning systems {#comparePitchClassByNoteName}

```
GET /pitch-classes/note-names/{noteName}/compare
```

Compare a pitch class (by note name) across different tuning systems.

Returns comprehensive data for each tuning system including:
- Pitch class data in the requested format
- Context information (tuning system, starting note, reference frequency)


**Path Parameters:**
- `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  - Example: `rast`

**Query Parameters:**
- `tuningSystems` **(required)**: Comma-separated tuning system IDs, or `all` for every tuning system (cannot be combined with explicit IDs). - Type: `string`
  - Example: `meshshaqa_1899,cairocongresstuningcommittee_1929`
- `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  - Example: `yegah`
- `pitchClassDataType` (optional): Pitch class data format (defaults to `all` when omitted, matching the handler) - Type: `string` - Valid values: `all`, `abjadName`, `englishName`, `solfege`, `fraction`, ... (14 total) - Default: `all`
  - Example: `cents`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/pitch-classes/note-names/rast/compare?tuningSystems=meshshaqa_1899,cairocongresstuningcommittee_1929&startingNote=yegah&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

**Example response:**

```json
{
  "context": {
    "noteName": {
      "idName": "yegah",
      "displayName": "yegāh"
    }
  },
  "comparisons": [
    {
      "tuningSystem": {
        "id": "ibnsina_1037",
        "idName": "ibnsina_1037",
        "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
        "version": "2025-11-09T00:44:40.275Z"
      },
      "startingNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "pitchClass": {
        "pitchClassIndex": 0,
        "octave": 1,
        "noteName": "yegah",
        "noteNameDisplay": "yegāh",
        "cents": 0
      },
      "context": {
        "referenceFrequency": 97.999,
        "pitchClassDataType": "cents"
      }
    },
    {
      "tuningSystem": {
        "id": "alfarabi_950g",
        "idName": "alfarabi_950g",
        "displayName": "al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone",
        "version": "2025-10-18T19:42:23.643Z"
      },
      "startingNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "pitchClass": {
        "pitchClassIndex": 0,
        "octave": 1,
        "noteName": "yegah",
        "noteNameDisplay": "yegāh",
        "cents": 0
      },
      "context": {
        "referenceFrequency": 97.999,
        "pitchClassDataType": "cents"
      }
    }
  ],
  "meta": {
    "totalComparisons": 2,
    "successfulComparisons": 2,
    "failedComparisons": 0
  },
  "links": {
    "self": "https://diarmaqar.net/api/pitch-classes/note-names/yegah/compare?tuningSystems=ibnsina_1037%2Calfarabi_950g&pitchClassDataType=cents&startingNote=yegah",
    "detail": "/api/pitch-classes/note-names/yegah",
    "availability": "/api/pitch-classes/note-names/yegah/availability"
  }
}
```


---

## Intervals

### Calculate intervals by note names {#calculateIntervalsByNoteNames}

```
GET /intervals
```

Get interval calculations for 2 or more pitch classes by listing their note names.

Calculates intervals between consecutive note names: [0→1, 1→2, 2→3, ...]

Supports:
- Single tuning system with specific starting note
- Single tuning system with startingNote="all" (returns array for all starting notes)
- All tuning systems (returns array for all tuning systems and starting notes)

Note: When querying by note names, the pitchClassIndex field is excluded from interval responses 
as it is not meaningful in this context.


**Query Parameters:**
- `noteNames` **(required)**: Comma-separated note names (e.g., "rast,dugah,segah"). Note names can come from any octave. - Type: `string`
  - Example: `rast,dugah,segah`
- `tuningSystem` (optional): Tuning system ID. - Type: `string`
  - Example: `alsabbagh_1954`
- `startingNote` (optional): Starting note.
  - Use "all" to include all available starting notes for that tuning system (returns array of results, one per starting note) Note: Since note names are unique per octave, each note name already identifies its octave. No octave parameter is needed. Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `rast`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/intervals?noteNames=rast,dugah,segah&includeArabic=true"
```

**Response:** Interval calculations retrieved successfully

**Example response:**

```json
{
  "context": {
    "noteNames": [
      {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      {
        "idName": "segah",
        "displayName": "segāh"
      }
    ]
  },
  "intervals": [
    {
      "tuningSystemContext": {
        "tuningSystem": {
          "id": "ibnsina_1037",
          "idName": "ibnsina_1037",
          "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
          "version": "2025-11-09T00:44:40.275Z"
        },
        "startingNote": {
          "idName": "yegah",
          "displayName": "yegāh"
        },
        "referenceFrequency": 97.999
      },
      "fromNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "toNote": {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      "intervalData": {
        "fraction": "3/2",
        "cents": 701.9550008653874,
        "decimalRatio": 1.5,
        "stringLength": -333.33333333333337,
        "fretDivision": 333.333,
        "originalValue": "3/2",
        "originalValueType": "fraction"
      }
    },
    {
      "tuningSystemContext": {
        "tuningSystem": {
          "id": "ibnsina_1037",
          "idName": "ibnsina_1037",
          "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
          "version": "2025-11-09T00:44:40.275Z"
        },
        "startingNote": {
          "idName": "yegah",
          "displayName": "yegāh"
        },
        "referenceFrequency": 97.999
      },
      "fromNote": {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      "toNote": {
        "idName": "segah",
        "displayName": "segāh"
      },
      "intervalData": {
        "fraction": "13/12",
        "cents": 138.57266090392318,
        "decimalRatio": 1.0833333333333333,
        "stringLength": -51.28205128205127,
        "fretDivision": 51.28199999999998,
        "originalValue": "13/12",
        "originalValueType": "fraction"
      }
    }
  ],
  "links": {
    "self": "https://diarmaqar.net/api/intervals?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&noteNames=yegah%2Cdugah%2Csegah",
    "compare": "/api/intervals/compare?noteNames=yegah,dugah,segah"
  }
}
```


### Compare intervals across tuning systems {#compareIntervalsByNoteNames}

```
GET /intervals/compare
```

Compare interval calculations for 2+ pitch classes across different tuning systems by listing their note names.

Calculates intervals between consecutive note names: [0→1, 1→2, 2→3, ...]

Note: When querying by note names, the pitchClassIndex field is excluded from interval responses 
as it is not meaningful in this context.


**Query Parameters:**
- `noteNames` **(required)**: Comma-separated note names. Note names can come from any octave. - Type: `string`
  - Example: `rast,dugah,segah`
- `tuningSystems` **(required)**: Comma-separated tuning system IDs, or `all` for every tuning system (cannot be combined with explicit IDs). - Type: `string`
  - Example: `alfarabi_950g,cairocongresstuningcommittee_1929`
- `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  - Example: `ushayran`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/intervals/compare?noteNames=rast,dugah,segah&tuningSystems=alfarabi_950g,cairocongresstuningcommittee_1929&startingNote=ushayran&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

**Example response:**

```json
{
  "context": {
    "noteNames": [
      {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      {
        "idName": "dugah",
        "displayName": "dūgāh"
      },
      {
        "idName": "segah",
        "displayName": "segāh"
      }
    ]
  },
  "comparisons": [
    {
      "tuningSystem": {
        "id": "ibnsina_1037",
        "idName": "ibnsina_1037",
        "displayName": "Ibn Sīnā  (1037) 7-Fret Oud 17-Tone",
        "version": "2025-11-09T00:44:40.275Z"
      },
      "startingNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "intervals": [
        {
          "from": {
            "idName": "yegah",
            "displayName": "yegāh"
          },
          "to": {
            "idName": "dugah",
            "displayName": "dūgāh"
          },
          "interval": {
            "fraction": "3/2",
            "cents": 701.9550008653874,
            "decimalRatio": 1.5,
            "stringLength": -333.33333333333337,
            "fretDivision": 333.333,
            "originalValue": "3/2",
            "originalValueType": "fraction"
          }
        },
        {
          "from": {
            "idName": "dugah",
            "displayName": "dūgāh"
          },
          "to": {
            "idName": "segah",
            "displayName": "segāh"
          },
          "interval": {
            "fraction": "13/12",
            "cents": 138.57266090392318,
            "decimalRatio": 1.0833333333333333,
            "stringLength": -51.28205128205127,
            "fretDivision": 51.28199999999998,
            "originalValue": "13/12",
            "originalValueType": "fraction"
          }
        }
      ],
      "context": {
        "referenceFrequency": 97.999
      }
    },
    {
      "tuningSystem": {
        "id": "alfarabi_950g",
        "idName": "alfarabi_950g",
        "displayName": "al-Fārābī (950g) First Oud Tuning (Full First Octave) 27-Tone",
        "version": "2025-10-18T19:42:23.643Z"
      },
      "startingNote": {
        "idName": "yegah",
        "displayName": "yegāh"
      },
      "intervals": [
        {
          "from": {
            "idName": "yegah",
            "displayName": "yegāh"
          },
          "to": {
            "idName": "dugah",
            "displayName": "dūgāh"
          },
          "interval": {
            "fraction": "3/2",
            "cents": 701.9550008653874,
            "decimalRatio": 1.5,
            "stringLength": -333.33333333333337,
            "fretDivision": 333.333,
            "originalValue": "3/2",
            "originalValueType": "fraction"
          }
        },
        {
          "from": {
            "idName": "dugah",
            "displayName": "dūgāh"
          },
          "to": {
            "idName": "segah",
            "displayName": "segāh"
          },
          "interval": {
            "fraction": "12/11",
            "cents": 150.63705850063081,
            "decimalRatio": 1.0909090909090908,
            "stringLength": -55.55555555555554,
            "fretDivision": 55.55599999999998,
            "originalValue": "12/11",
            "originalValueType": "fraction"
          }
        }
      ],
      "context": {
        "referenceFrequency": 97.999
      }
    }
  ],
  "meta": {
    "totalComparisons": 2,
    "successfulComparisons": 2,
    "failedComparisons": 0
  },
  "links": {
    "self": "https://diarmaqar.net/api/intervals/compare?tuningSystems=ibnsina_1037%2Calfarabi_950g&startingNote=yegah&pitchClassDataType=cents&noteNames=yegah%2Cdugah%2Csegah",
    "intervals": "/api/intervals?noteNames=yegah,dugah,segah"
  }
}
```


### Calculate interval between two pitch classes {#calculateIntervalBetweenPitchClasses}

```
GET /intervals/calculate
```

Calculate the interval between two pitch classes in a specific tuning system.

Supports flexible pitch class identification:
- By note name (e.g., "rast", "dugah")
- By value in any format: fraction (e.g., "3/2"), cents (e.g., "701.955"), decimalRatio (e.g., "1.5"), stringLength, or fretDivision

Returns the interval in the requested unit format, plus all other unit formats for reference.


**Query Parameters:**
- `from` **(required)**: First pitch class identifier (note name or value) - Type: `string`
  - Example: `rast`
- `to` **(required)**: Second pitch class identifier (note name or value) - Type: `string`
  - Example: `dugah`
- `tuningSystem` **(required)**: Tuning system ID - Type: `string`
  - Example: `ibnsina_1037`
- `startingNote` **(required)**: Starting note for the tuning system - Type: `string`
  - Example: `yegah`
- `unit` **(required)**: Output unit format for the interval - Type: `string` - Valid values: `fraction`, `cents`, `centsFromZero`, `decimalRatio`, `stringLength`, `fretDivision`
  - Example: `cents`
- `fromType` (optional): Type of 'from' value if it's a value (not a note name).
Required if 'from' is a value and cannot be auto-detected..
  Required if 'from' is a value and cannot be auto-detected.
 - Type: `string` - Valid values: `fraction`, `cents`, `decimalRatio`, `stringLength`, `fretDivision`
  - Example: `fraction`
- `toType` (optional): Type of 'to' value if it's a value (not a note name).
Required if 'to' is a value and cannot be auto-detected..
  Required if 'to' is a value and cannot be auto-detected.
 - Type: `string` - Valid values: `fraction`, `cents`, `decimalRatio`, `stringLength`, `fretDivision`
  - Example: `fraction`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/intervals/calculate?from=rast&to=dugah&tuningSystem=ibnsina_1037&startingNote=yegah&unit=cents&includeArabic=true"
```

**Response:** Interval calculated successfully

**Example response — noteNames:**

```json
{
  "context": {
    "tuningSystem": {
      "id": "ibnsina_1037",
      "idName": "ibnsina_1037",
      "displayName": "Ibn Sīnā (1037)"
    },
    "startingNote": {
      "idName": "yegah",
      "displayName": "yegāh"
    },
    "referenceFrequency": 97.999
  },
  "from": {
    "pitchClass": {
      "pitchClassIndex": 0,
      "octave": 0,
      "noteName": "yegah",
      "noteNameDisplay": "yegāh",
      "englishName": "D",
      "solfege": "re",
      "abjadName": "د",
      "fraction": "1/1",
      "cents": 0,
      "decimalRatio": 1,
      "stringLength": 1000,
      "fretDivision": 0
    },
    "identifier": {
      "idName": "yegah",
      "displayName": "yegāh"
    }
  },
  "to": {
    "pitchClass": {
      "pitchClassIndex": 1,
      "octave": 0,
      "noteName": "dugah",
      "noteNameDisplay": "dūgāh",
      "englishName": "E",
      "solfege": "mi",
      "abjadName": "ه",
      "fraction": "9/8",
      "cents": 203.91,
      "decimalRatio": 1.125,
      "stringLength": 888.889,
      "fretDivision": 102
    },
    "identifier": {
      "idName": "dugah",
      "displayName": "dūgāh"
    }
  },
  "interval": {
    "value": 203.91,
    "unit": "cents",
    "allUnits": {
      "fraction": "9/8",
      "cents": 203.91,
      "decimalRatio": 1.125,
      "stringLength": 111.111,
      "fretDivision": 102
    }
  },
  "links": {
    "self": "/api/intervals/calculate?from=yegah&to=dugah&tuningSystem=ibnsina_1037&startingNote=yegah&unit=cents",
    "tuningSystem": "/api/tuning-systems/ibnsina_1037",
    "intervals": "/api/intervals?noteNames=yegah,dugah&tuningSystem=ibnsina_1037&startingNote=yegah"
  }
}
```


---

## Sources

### List all bibliographic sources {#listSources}

```
GET /sources
```

Return all bibliographic sources (books, articles, theses) with comprehensive metadata.

- Includes titles, contributors, publication information, and version timestamps
- Sources document the historical and scholarly foundation for the archive's musical data
- All sources include common fields (edition, publication date, URL, etc.)
- Type-specific fields are included based on sourceType:
  - Books: publisher, place, ISBN, original publication date
  - Articles: journal, volume, issue, page range, DOI
  - Theses: degree type, university, department, database information


**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/sources?includeArabic=true"
```

**Response:** List of sources retrieved successfully

**Example response — comprehensive:**

```json
{
  "count": 2,
  "data": [
    {
      "id": "al-Khulʿī-(1904/2011)",
      "displayName": "al-Khulʿī-(1904/2011)",
      "sourceType": "Book",
      "title": "Kitāb al-Mūsiqā al-Sharqī",
      "titleAr": "كتاب الموسيقى الشرقي",
      "contributors": [
        {
          "type": "Author",
          "firstName": "Mohammad Kāmil",
          "lastName": "al-Khulʿī",
          "firstNameAr": "محمد كامل",
          "lastNameAr": "الخلعي"
        }
      ],
      "edition": "",
      "editionAr": "",
      "publicationDate": "2011",
      "publicationDateAr": "٢٠١١",
      "url": "https://www.hindawi.org/books/46319638/",
      "dateAccessed": "21-05-2025",
      "version": "2025-10-18T19:50:31.664Z",
      "originalPublicationDate": "1904",
      "originalPublicationDateAr": "١٩٠٤",
      "publisher": "Hindawi Foundation for Education and Culture",
      "publisherAr": "مؤسسة هنداوي للتعليم والثقافة",
      "place": "Cairo",
      "placeAr": "القاهرة",
      "ISBN": "9789776416543"
    },
    {
      "id": "Farmer-(1937)",
      "displayName": "Farmer-(1937)",
      "sourceType": "Article",
      "title": "The Lute Scale of Avicenna",
      "titleAr": "سلم العود لإبن سينا",
      "contributors": [
        {
          "type": "Author",
          "firstName": "Henry George",
          "lastName": "Farmer",
          "firstNameAr": "هنري جورج",
          "lastNameAr": "فارمر"
        }
      ],
      "edition": "",
      "editionAr": "",
      "publicationDate": "1937",
      "publicationDateAr": "١٩٣٧",
      "url": "",
      "dateAccessed": "",
      "version": "2025-10-18T19:50:31.664Z",
      "journal": "The Journal of the Royal Asiatic Society of Great Britain and Ireland",
      "journalAr": "مجلة الجمعية الملكية الآسيوية في بريطانيا العظمى وأيرلندا",
      "volume": "2",
      "volumeAr": "٢",
      "issue": "",
      "issueAr": "",
      "pageRange": "245–257",
      "pageRangeAr": "٢٤٥-٢٥٧",
      "DOI": ""
    },
    {
      "id": "Allami-(2022)",
      "displayName": "Allami-(2022)",
      "sourceType": "Thesis",
      "title": "Échos-monde: Towards a hybrid repertoire of contemporary and experimental acoustic, electroacoustic and electronic Arabic music",
      "titleAr": "‎عالم الأصداء: نحو رصيدٍ هجينٍ للموسيقى العربية المعاصرة والتجريبية، صوتياً وكهروصوتياً وإلكترونياً",
      "contributors": [
        {
          "type": "Author",
          "firstName": "Khyam",
          "lastName": "Allami",
          "firstNameAr": "خيّام",
          "lastNameAr": "اللامي"
        }
      ],
      "edition": "",
      "editionAr": "",
      "publicationDate": "2022",
      "publicationDateAr": "",
      "url": "https://www.open-access.bcu.ac.uk/14036/",
      "dateAccessed": "16-10-2025",
      "version": "2025-10-23T22:32:56.276Z",
      "degreeType": "PhD Dissertation",
      "degreeTypeAr": "أطروحة دكتوراه",
      "university": "Birmingham City University",
      "universityAr": "جامعة برمنغهام سيتي",
      "department": "Royal Birmingham Conservatoire",
      "departmentAr": "معهد برمنغهام الملكي",
      "databaseIdentifier": "",
      "databaseName": ""
    }
  ],
  "meta": {
    "total": 17
  }
}
```


### Get a single bibliographic source {#getSource}

```
GET /sources/{id}
```

Return detailed information for a single bibliographic source by ID.

- Returns comprehensive bibliographic metadata for the specified source
- Includes all common fields (title, contributors, publication date, etc.)
- Includes type-specific fields based on sourceType:
  - Books: publisher, place, ISBN, original publication date
  - Articles: journal, volume, issue, page range, DOI
  - Theses: degree type, university, department, database information
- Supports bilingual responses (English/Arabic) via includeArabic parameter


**Path Parameters:**
- `id`: The unique identifier for the bibliographic source.

Examples:
- `al-Khuli-(2011)` - Book source ID (URL-safe, diacritics removed)
- `Farmer-(1937)` - Article source ID
- `Allami-(2022)` - Thesis source ID

**Note**: Source IDs use only the publication date (not original publication date)
and are URL-safe with diacritics removed for compatibility.

Use the `/api/sources` endpoint to retrieve all available source IDs.
 (string) **(required)**
  - Example: `Farmer-(1937)`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., titleAr, firstNameAr, lastNameAr)
  - Contributors get Arabic name versions in firstNameAr and lastNameAr fields
  - Type-specific fields get Arabic versions (e.g., publisherAr, journalAr, universityAr)
  - Display name gets Arabic version in displayNameAr field
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/sources/Farmer-(1937)?includeArabic=true"
```

**Response:** Source retrieved successfully

**Example response — book:**

```json
{
  "source": {
    "id": "al-Khuli-(2011)",
    "displayName": "al-Khuli-(2011)",
    "sourceType": "Book",
    "title": "Kitāb al-Mūsiqā al-Sharqī",
    "contributors": [
      {
        "type": "Author",
        "firstName": "Mohammad Kāmil",
        "lastName": "al-Khulʿī"
      }
    ],
    "edition": "",
    "publicationDate": "2011",
    "url": "https://www.hindawi.org/books/46319638/",
    "dateAccessed": "21-05-2025",
    "version": "2025-10-18T19:50:31.664Z",
    "originalPublicationDate": "1904",
    "publisher": "Hindawi Foundation for Education and Culture",
    "place": "Cairo",
    "ISBN": "9789776416543"
  }
}
```


### List tuning systems by source {#listTuningSystemsBySource}

```
GET /sources/{id}/tuning-systems
```

Returns all tuning systems that reference the specified source.

A tuning system is included if any of its sourcePageReferences match the source ID.
This endpoint provides an easy way to see which tuning systems have been derived from a specific source.


**Path Parameters:**
- `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
 (string) **(required)**
  - Example: `Farmer-(1937)`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/sources/Farmer-(1937)/tuning-systems?includeArabic=true"
```

**Response:** Tuning systems retrieved successfully

**Example response:**

```json
{
  "context": {
    "source": {
      "id": "alshawwa_1946",
      "idName": "alshawwa_1946",
      "displayName": "al-Qawaʿid al-Fannīya fī al-Mūsiqa al-Sharqīya wa al-Gharbīya"
    }
  },
  "count": 1,
  "data": [
    {
      "tuningSystem": {
        "id": "allami_2025",
        "idName": "allami_2025",
        "displayName": "Allami (2025) al-Ṣabbāgh with al-Shawwā's 28-Tones",
        "version": "2025-12-11T23:36:54.970Z",
        "year": "2025"
      },
      "sourceReferences": [
        {
          "page": "13"
        }
      ],
      "startingNotes": [
        "rast"
      ],
      "links": {
        "detail": "/api/tuning-systems/allami_2025",
        "source": "/api/sources/alshawwa_1946"
      }
    }
  ]
}
```


### List maqamat by source {#listMaqamatBySource}

```
GET /sources/{id}/maqamat
```

Returns all maqamat that reference the specified source.

A maqam is included if any of its sourcePageReferences match the source ID.
This endpoint provides an easy way to see which maqamat have been documented in a specific source.


**Path Parameters:**
- `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
 (string) **(required)**
  - Example: `Farmer-(1937)`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/sources/Farmer-(1937)/maqamat?includeArabic=true"
```

**Response:** Maqamat retrieved successfully

**Example response:**

```json
{
  "context": {
    "source": {
      "id": "alshawwa_1946",
      "idName": "alshawwa_1946",
      "displayName": "al-Qawaʿid al-Fannīya fī al-Mūsiqa al-Sharqīya wa al-Gharbīya"
    }
  },
  "count": 36,
  "data": [
    {
      "maqam": {
        "id": "1",
        "idName": "maqam_rast",
        "displayName": "maqām rāst",
        "version": "2025-12-10T17:03:34.565Z"
      },
      "sourceReferences": [
        {
          "page": "42"
        }
      ],
      "links": {
        "detail": "/api/maqamat/maqam_rast",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "maqam": {
        "id": "6",
        "idName": "maqam_nawa_athar",
        "displayName": "maqām nawā athar",
        "version": "2025-12-10T18:28:28.107Z"
      },
      "sourceReferences": [
        {
          "page": "52"
        }
      ],
      "links": {
        "detail": "/api/maqamat/maqam_nawa_athar",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "maqam": {
        "id": "10",
        "idName": "maqam_nahawand",
        "displayName": "maqām nahāwand",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "sourceReferences": [
        {
          "page": "49"
        }
      ],
      "links": {
        "detail": "/api/maqamat/maqam_nahawand",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "maqam": {
        "id": "11",
        "idName": "maqam_nahawand_kabir",
        "displayName": "maqām nahāwand kabīr",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "sourceReferences": [
        {
          "page": "50"
        }
      ],
      "links": {
        "detail": "/api/maqamat/maqam_nahawand_kabir",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "maqam": {
        "id": "17",
        "idName": "maqam_ajam_ushayran",
        "displayName": "maqām ʿajam ʿushayrān",
        "version": "2025-10-18T19:41:17.132Z"
      },
      "sourceReferences": [
        {
          "page": "30"
        }
      ],
      "links": {
        "detail": "/api/maqamat/maqam_ajam_ushayran",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "…": "truncated — 31 more items"
    }
  ]
}
```


### List ajnas by source {#listAjnasBySource}

```
GET /sources/{id}/ajnas
```

Returns all ajnas that reference the specified source.

A jins is included if any of its SourcePageReferences match the source ID.
This endpoint provides an easy way to see which ajnas have been documented in a specific source.


**Path Parameters:**
- `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
 (string) **(required)**
  - Example: `Farmer-(1937)`

**Query Parameters:**
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.net/api/sources/Farmer-(1937)/ajnas?includeArabic=true"
```

**Response:** Ajnas retrieved successfully

**Example response:**

```json
{
  "context": {
    "source": {
      "id": "alshawwa_1946",
      "idName": "alshawwa_1946",
      "displayName": "al-Qawaʿid al-Fannīya fī al-Mūsiqa al-Sharqīya wa al-Gharbīya"
    }
  },
  "count": 2,
  "data": [
    {
      "jins": {
        "id": "21",
        "idName": "jins_buselik_(al-shawwa)",
        "displayName": "jins būselīk (al-Shawwā)",
        "version": "2025-10-18T19:34:26.343Z"
      },
      "sourceReferences": [
        {
          "page": "70"
        }
      ],
      "links": {
        "detail": "/api/ajnas/jins_buselik_(al-shawwa)",
        "source": "/api/sources/alshawwa_1946"
      }
    },
    {
      "jins": {
        "id": "24",
        "idName": "jins_awj_ara",
        "displayName": "jins awj ʾārāʾ",
        "version": "2025-10-18T19:34:26.343Z"
      },
      "sourceReferences": [
        {
          "page": "38"
        }
      ],
      "links": {
        "detail": "/api/ajnas/jins_awj_ara",
        "source": "/api/sources/alshawwa_1946"
      }
    }
  ]
}
```


---

