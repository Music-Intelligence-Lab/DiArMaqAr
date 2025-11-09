---
title: API Documentation
description: Programmatic access to Arabic maqāmāt, ajnās, and tuning systems data
---

# API Documentation

Digital Arabic Maqām Archive (DiArMaqAr) — programmatic access to historically documented maqāmāt, ajnās, and tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

## Quick Start

**Try this first:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&pitchClassDataType=cents"
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

### Maqāmāt
Documented modal frameworks with historical source attribution.

**Endpoints:**
- `GET /maqamat` - List all maqāmāt → [Details](./endpoints-reference#listMaqamat)
- `GET /maqamat/{id}` - Get maqām details → [Details](./endpoints-reference#getMaqam)
- `GET /maqamat/{id}/availability` - Check availability → [Details](./endpoints-reference#getMaqamAvailability)
- `GET /maqamat/{id}/transpositions` - List transpositions → [Details](./endpoints-reference#listMaqamTranspositions)
- `GET /maqamat/{id}/compare` - Compare across systems → [Details](./endpoints-reference#compareMaqam)

### Ajnās
Documented melodic fragments with historical source attribution.

**Endpoints:**
- `GET /ajnas` - List all ajnās → [Details](./endpoints-reference#listAjnas)
- `GET /ajnas/{id}` - Get jins details → [Details](./endpoints-reference#getJins)
- `GET /ajnas/{id}/availability` - Check availability → [Details](./endpoints-reference#getJinsAvailability)
- `GET /ajnas/{id}/transpositions` - List transpositions → [Details](./endpoints-reference#listJinsTranspositions)
- `GET /ajnas/{id}/compare` - Compare across systems → [Details](./endpoints-reference#compareJins)

### Tuning Systems
Historical tuning systems from al-Kindī (874 CE) to contemporary approaches.

**Endpoints:**
- `GET /tuning-systems` - List all tuning systems → [Details](./endpoints-reference#listTuningSystems)
- `GET /tuning-systems/{id}/{startingNote}/pitch-classes` - Get pitch classes → [Details](./endpoints-reference#getTuningSystemPitchClasses)
- `GET /tuning-systems/{id}/{startingNote}/maqamat` - List maqāmāt in system → [Details](./endpoints-reference#listTuningSystemMaqamat)

### Pitch Classes (by Note Names)
Query pitch class data by note name across tuning systems.

**Endpoints:**
- `GET /pitch-classes/note-names` - List all note names → [Details](./endpoints-reference#listNoteNames)
- `GET /pitch-classes/note-names/{noteName}` - Get pitch class by note name → [Details](./endpoints-reference#getPitchClassByNoteName)
- `GET /pitch-classes/note-names/{noteName}/availability` - Check availability → [Details](./endpoints-reference#getNoteNameAvailability)
- `GET /pitch-classes/note-names/{noteName}/compare` - Compare across systems → [Details](./endpoints-reference#comparePitchClassByNoteName)

### Intervals
Calculate intervals between note names.

**Endpoints:**
- `GET /intervals` - Calculate intervals by note names → [Details](./endpoints-reference#calculateIntervalsByNoteNames)
- `GET /intervals/compare` - Compare intervals across systems → [Details](./endpoints-reference#compareIntervalsByNoteNames)

### Sources
Bibliographic references for all documented content.

**Endpoints:**
- `GET /sources` - List all sources → [Details](./endpoints-reference#listSources)
- `GET /sources/{id}` - Get source details → [Details](./endpoints-reference#getSource)
- `GET /sources/{id}/tuning-systems` - List tuning systems by source → [Details](./endpoints-reference#listTuningSystemsBySource)
- `GET /sources/{id}/maqamat` - List maqāmāt by source → [Details](./endpoints-reference#listMaqamatBySource)
- `GET /sources/{id}/ajnas` - List ajnās by source → [Details](./endpoints-reference#listAjnasBySource)

---

## Getting Started

All endpoints return JSON. No authentication required.

**Common parameters:**
- `includeArabic` (default: "true") - Include Arabic script alongside transliteration
- `includeSources` (default varies) - Include bibliographic source references

For complete parameter documentation, see the [Endpoints Reference](./endpoints-reference).

For recommended example values, see [Representative Examples](./representative-examples).
