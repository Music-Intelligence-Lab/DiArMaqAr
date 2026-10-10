---
title: API Documentation
description: Programmatic access to Arabic maqāmāt, ajnās, and tuning systems data
---

# API Documentation

Digital Arabic Maqām Archive (DiArMaqAr) — programmatic access to historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

## Quick Start

**Try this first:**
```bash
curl "https://diarmaqar.net/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents"
```

**Base URL:** `https://diarmaqar.net/api`

## Documentation Resources

### For Humans
- **[Endpoints Reference](./endpoints-reference)** - Complete endpoint documentation with parameters and responses
- **[Interactive Playground](./playground)** - Test API calls live in your browser
- **[Representative Examples](./representative-examples)** - Recommended examples for proper API usage

### For LLMs
- **OpenAPI Specification:** [openapi.json](/openapi.json) | [openapi.yaml](/openapi.yaml)
- **LLM-optimized:** [llms.txt](/llms.txt) | [llms-full.txt](/llms-full.txt)

---

## API Endpoints

All API endpoints are organized by resource type. Each endpoint includes a link to detailed documentation with parameters, examples, and response formats.

**Total: 27 endpoints** across 7 resource categories.

### Maqāmāt
Documented modal frameworks with historical source attribution.

**Endpoints (8):**
- `GET /maqamat` - List all maqāmāt → [Details](./endpoints-reference#listMaqamat)
- `GET /maqamat/families` - List maqām families → [Details](./endpoints-reference#listMaqamFamilies)
- `GET /maqamat/{idName}` - Get detailed maqām data → [Details](./endpoints-reference#getMaqam)
- `GET /maqamat/{idName}/availability` - Check maqām availability across tuning systems → [Details](./endpoints-reference#getMaqamAvailability)
- `GET /maqamat/{idName}/transpositions` - List transpositions for a maqām → [Details](./endpoints-reference#listMaqamTranspositions)
- `GET /maqamat/{idName}/compare` - Compare maqām data across multiple tuning systems → [Details](./endpoints-reference#compareMaqam)
- `GET /maqamat/classification/12-pitch-class-sets` - Classify maqāmāt by 12-pitch-class sets → [Details](./endpoints-reference#classifyMaqamat12PitchClassSets) · [Transpositions that do not fit](#transpositions-that-do-not-fit-a-12-pitch-class-set)
- `GET /maqamat/classification/maqam-pitch-class-sets` - Classify maqāmāt by maqam-based pitch class sets → [Details](./endpoints-reference#classifyMaqamatByMaqamPitchClassSets)

### Ajnās
Documented tri/tetra/penta-chords with historical source attribution.

**Endpoints (5):**
- `GET /ajnas` - List all ajnās → [Details](./endpoints-reference#listAjnas)
- `GET /ajnas/{idName}` - Get detailed jins data → [Details](./endpoints-reference#getJins)
- `GET /ajnas/{idName}/availability` - Check jins availability across tuning systems → [Details](./endpoints-reference#getJinsAvailability)
- `GET /ajnas/{idName}/transpositions` - List transpositions for a jins → [Details](./endpoints-reference#listJinsTranspositions)
- `GET /ajnas/{idName}/compare` - Compare jins data across multiple tuning systems → [Details](./endpoints-reference#compareJins)

### Tuning Systems
Historical tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

**Endpoints (4):**
- `GET /tuning-systems` - List all tuning systems → [Details](./endpoints-reference#listTuningSystems)
- `GET /tuning-systems/{id}/{startingNote}/pitch-classes` - Get tuning system details (pitch classes) → [Details](./endpoints-reference#getTuningSystemPitchClasses)
- `GET /tuning-systems/{id}/{startingNote}/maqamat` - List maqāmāt available in a tuning system → [Details](./endpoints-reference#listTuningSystemMaqamat)
- `GET /tuning-systems/{id}/{startingNote}/ajnas` - List ajnās available in a tuning system → [Details](./endpoints-reference#listTuningSystemAjnas)

### Pitch Classes
Note names and pitch class data across all tuning systems.

**Endpoints (4):**
- `GET /pitch-classes/note-names` - List all note names → [Details](./endpoints-reference#listNoteNames)
- `GET /pitch-classes/note-names/{noteName}` - Get pitch class details by note name → [Details](./endpoints-reference#getPitchClassByNoteName)
- `GET /pitch-classes/note-names/{noteName}/availability` - Check note name availability across tuning systems → [Details](./endpoints-reference#getNoteNameAvailability)
- `GET /pitch-classes/note-names/{noteName}/compare` - Compare pitch class by note name across tuning systems → [Details](./endpoints-reference#comparePitchClassByNoteName)

### Intervals
Calculate intervals between note names.

**Endpoints (2):**
- `GET /intervals` - Calculate intervals by note names → [Details](./endpoints-reference#calculateIntervalsByNoteNames)
- `GET /intervals/compare` - Compare intervals across tuning systems → [Details](./endpoints-reference#compareIntervalsByNoteNames)

### Sources
Bibliographic sources documenting the historical foundation of the archive's musical data.

**Endpoints (5):**
- `GET /sources` - List all bibliographic sources → [Details](./endpoints-reference#listSources)
- `GET /sources/{id}` - Get a single bibliographic source → [Details](./endpoints-reference#getSource)
- `GET /sources/{id}/tuning-systems` - List tuning systems by source → [Details](./endpoints-reference#listTuningSystemsBySource)
- `GET /sources/{id}/maqamat` - List maqamat by source → [Details](./endpoints-reference#listMaqamatBySource)
- `GET /sources/{id}/ajnas` - List ajnas by source → [Details](./endpoints-reference#listAjnasBySource)

### Modulations
Modulation routes between maqāmāt using al-Shawwā's 1946 modulation guidelines.

**Endpoints (1):**
- `GET /modulation-routes` - Find modulation routes between maqāmāt → [Details](./endpoints-reference#findModulationRoutes)

---

## Transpositions that do not fit a 12-pitch-class set {#transpositions-that-do-not-fit-a-12-pitch-class-set}

`GET /maqamat/classification/12-pitch-class-sets` groups maqām transpositions into 12-pitch-class sets. A few transpositions cannot form one. For what that means, see [Maqāmāt that cannot form a 12-pitch-class set](/guide/data-export#maqamat-that-cannot-form-a-12-pitch-class-set). The endpoint never skips these transpositions silently. It reports each one, with the key and the pitch classes that need it.

### Counts and lists

- Every response includes `statistics.incompatibleMaqamatCount`, the number of transpositions in this tuning system, from this starting note, that do not fit.
- `includeIncompatible=true` adds the full list in `incompatibleMaqamat`, with its count in `incompatibleMaqamatCount`.

### Each transposition that does not fit

| Field | Description |
|-------|-------------|
| `compatible` | Always `false` |
| `reason` | Always `"shared_key"`: two or more pitch classes need the same key, and the keys next to it are taken. This replaces the former `"duplicate_ipn_reference"`. |
| `explanation` | One plain sentence, e.g. `"ʿirāq (B-b2) and nīm kawasht (B-2) both need the B key, and the keys next to it are taken."` |
| `clashes` | One entry for each key that more than one pitch class needs |
| `clashes[].key` | The key, e.g. `"B"` |
| `clashes[].notes` | The notes that need that key. Each note has `noteName` (URL-safe), `displayName`, `englishName`, `cents` and `centsInOctave`. With `includeArabic=true`, each note also has `displayNameAr`. |

`centsInOctave` is the note's position above the transposition's tonic, with the octave ignored. It is the value the 12-pitch-class set compares. Two notes in the same clash with different `centsInOctave` values are different pitch classes competing for one key.

### Filtering by maqām (`maqamId`)

- **Some transpositions fit:** the response has `compatible: true` and returns their sets as before. It adds `incompatibleTranspositions`, listing the transpositions that do not fit.
- **No transposition fits:** the response is still `200`. It has `compatible: false`, `sets: []`, `incompatibleTranspositions`, and an `explanation` of the form `"No transposition of maqām X fits a 12-pitch-class set in <tuning system> from <starting note>."`
- **The maqām cannot be built in this tuning system from this starting note** (the tuning system lacks some of its notes): the response is still `200`, with `compatible: false`, `sets: []`, an empty `incompatibleTranspositions` and an `explanation` saying so.
- **The maqām does not exist:** the response is `404`.

`maqamId` accepts a maqām's idName, its numeric id, or the idName of one of its transpositions. It matches exactly: `maqam_hijaz` does not also match `maqam_hijaz_kar`.

### Example

In al-Ṣabbāgh (1954) from rāst, maqām faraḥnāk (al-Ḥilū) on qarār segāh does not fit. ʿirāq (B-b2) and nīm kawasht (B-2) are 29.5 cents apart, and both need the B key. The keys next to it are taken: nīm ʿajam is on Bb and rāst is on C.

```bash
curl "https://diarmaqar.net/api/maqamat/classification/12-pitch-class-sets?tuningSystem=alsabbagh_1954&startingNote=rast&maqamId=maqam_farahnak_alhilu"
```

The entry for that transposition in `incompatibleTranspositions`:

```json
{
  "maqam": {
    "id": "145",
    "idName": "maqam_farahnak_alhilu",
    "displayName": "maqām faraḥnāk (al-Ḥilū)"
  },
  "transposition": {
    "idName": "maqam_farahnak_alhilu_alqarar_segah",
    "displayName": "maqām faraḥnāk (al-Ḥilū) al-qarār segāh",
    "isTransposed": true,
    "isBaseForm": false
  },
  "compatible": false,
  "reason": "shared_key",
  "explanation": "ʿirāq (B-b2) and nīm kawasht (B-2) both need the B key, and the keys next to it are taken.",
  "clashes": [
    {
      "key": "B",
      "notes": [
        { "noteName": "iraq", "displayName": "ʿirāq", "englishName": "B-b2", "cents": -141.2, "centsInOctave": 701.9 },
        { "noteName": "nim_kawasht", "displayName": "nīm kawasht", "englishName": "B-2", "cents": -111.7, "centsInOctave": 731.4 }
      ]
    }
  ]
}
```

The two `centsInOctave` values, 701.9 and 731.4, differ by 29.5 cents. They are two pitch classes, and both need the B key.

---

## Getting Started

All endpoints return JSON. No authentication required.

**Common parameters:**
- `includeArabic` (default: "true") - Include Arabic script alongside transliteration
- `includeSources` (default varies) - Include bibliographic source references

For complete parameter documentation, see the [Endpoints Reference](./endpoints-reference).

For recommended example values, see [Representative Examples](./representative-examples).
