---
url: /docs/api.md
description: 'Programmatic access to Arabic maqāmāt, ajnās, and tuning systems data'
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

* **[Endpoints Reference](./endpoints-reference)** - Complete endpoint documentation with parameters and responses
* **[Interactive Playground](./playground)** - Test API calls live in your browser
* **[Representative Examples](./representative-examples)** - Recommended examples for consistent documentation

### For LLMs

* **OpenAPI Specification:** [openapi.json](/docs/openapi.json) | [openapi.yaml](/docs/openapi.yaml)
* **LLM-optimized:** [llms.txt](/docs/llms.txt) | [llms-full.txt](/docs/llms-full.txt)

***

## API Endpoints

### Maqāmāt

Documented modal frameworks with historical source attribution.

**Endpoints:**

* `GET /maqamat` - List all maqāmāt → [Details](./endpoints-reference#list-all-maqamat)
* `GET /maqamat/{id}` - Get maqām details → [Details](./endpoints-reference#get-maqam-details)
* `GET /maqamat/{id}/availability` - Check availability → [Details](./endpoints-reference#check-maqam-availability)
* `GET /maqamat/{id}/transpositions` - List transpositions → [Details](./endpoints-reference#list-maqam-transpositions)
* `GET /maqamat/{id}/compare` - Compare across systems → [Details](./endpoints-reference#compare-maqam-across-tuning-systems)

### Ajnās

Documented melodic fragments with historical source attribution.

**Endpoints:**

* `GET /ajnas` - List all ajnās → [Details](./endpoints-reference#list-all-ajnas)
* `GET /ajnas/{id}` - Get jins details → [Details](./endpoints-reference#get-jins-details)
* `GET /ajnas/{id}/availability` - Check availability → [Details](./endpoints-reference#check-jins-availability)
* `GET /ajnas/{id}/transpositions` - List transpositions → [Details](./endpoints-reference#list-jins-transpositions)
* `GET /ajnas/{id}/compare` - Compare across systems → [Details](./endpoints-reference#compare-jins-across-tuning-systems)

### Tuning Systems

Historical tuning systems from al-Kindī (874 CE) to contemporary approaches.

**Endpoints:**

* `GET /tuning-systems` - List all tuning systems → [Details](./endpoints-reference#list-all-tuning-systems)
* `GET /tuning-systems/{id}/{startingNote}/pitch-classes` - Get pitch classes → [Details](./endpoints-reference#get-tuning-system-pitch-classes)
* `GET /tuning-systems/{id}/{startingNote}/maqamat` - List maqāmāt in system → [Details](./endpoints-reference#list-maqamat-in-tuning-system)

### Pitch Classes (by Note Names)

Query pitch class data by note name across tuning systems.

**Endpoints:**

* `GET /pitch-classes/note-names` - List all note names → [Details](./endpoints-reference#list-note-names)
* `GET /pitch-classes/note-names/{noteName}` - Get pitch class by note name → [Details](./endpoints-reference#get-pitch-class-by-note-name)
* `GET /pitch-classes/note-names/{noteName}/availability` - Check availability → [Details](./endpoints-reference#check-note-name-availability)
* `GET /pitch-classes/note-names/{noteName}/compare` - Compare across systems → [Details](./endpoints-reference#compare-pitch-class-across-systems)

### Intervals

Calculate intervals between note names.

**Endpoints:**

* `GET /intervals` - Calculate intervals by note names → [Details](./endpoints-reference#calculate-intervals-by-note-names)
* `GET /intervals/compare` - Compare intervals across systems → [Details](./endpoints-reference#compare-intervals-across-tuning-systems)

### Sources

Bibliographic references for all documented content.

**Endpoints:**

* `GET /sources` - List all sources → [Details](./endpoints-reference#list-all-sources)
* `GET /sources/{id}` - Get source details → [Details](./endpoints-reference#get-source-details)
* `GET /sources/{id}/tuning-systems` - List tuning systems by source → [Details](./endpoints-reference#list-tuning-systems-by-source)
* `GET /sources/{id}/maqamat` - List maqāmāt by source → [Details](./endpoints-reference#list-maqamat-by-source)
* `GET /sources/{id}/ajnas` - List ajnās by source → [Details](./endpoints-reference#list-ajnas-by-source)

***

## Getting Started

All endpoints return JSON. No authentication required.

**Common parameters:**

* `includeArabic` (default: "true") - Include Arabic script alongside transliteration
* `includeSources` (default varies) - Include bibliographic source references

For complete parameter documentation, see the [Endpoints Reference](./endpoints-reference).

For recommended example values, see [Representative Examples](./representative-examples).
