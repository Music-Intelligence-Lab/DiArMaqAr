---
title: API Documentation
description: Programmatic access to Arabic maqāmāt, ajnās, and tuning systems data
---

# API Documentation

Digital Arabic Maqām Archive (DiArMaqAr) — programmatic access to historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

## Quick Start

**Try this first:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents"
```

**Base URL:** `https://diarmaqar.netlify.app/api`

## Documentation Resources

### For Humans
- **[Endpoints Reference](./endpoints-reference)** - Complete endpoint documentation with parameters and responses
- **[Interactive Playground](./playground)** - Test API calls live in your browser
- **[Representative Examples](./representative-examples)** - Recommended examples for proper API usage

### For LLMs
- **OpenAPI Specification:** [openapi.json](/docs/openapi.json) | [openapi.yaml](/docs/openapi.yaml)
- **LLM-optimized:** [llms.txt](/docs/llms.txt) | [llms-full.txt](/docs/llms-full.txt)

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
- `GET /maqamat/classification/12-pitch-class-sets` - Classify maqāmāt by 12-pitch-class sets → [Details](./endpoints-reference#classifyMaqamat12PitchClassSets)
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

**Endpoints (3):**
- `GET /tuning-systems` - List all tuning systems → [Details](./endpoints-reference#listTuningSystems)
- `GET /tuning-systems/{id}/{startingNote}/pitch-classes` - Get tuning system details (pitch classes) → [Details](./endpoints-reference#getTuningSystemPitchClasses)
- `GET /tuning-systems/{id}/{startingNote}/maqamat` - List maqāmāt available in a tuning system → [Details](./endpoints-reference#listTuningSystemMaqamat)

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

## Getting Started

All endpoints return JSON. No authentication required.

**Common parameters:**
- `includeArabic` (default: "true") - Include Arabic script alongside transliteration
- `includeSources` (default varies) - Include bibliographic source references

For complete parameter documentation, see the [Endpoints Reference](./endpoints-reference).

For recommended example values, see [Representative Examples](./representative-examples).
