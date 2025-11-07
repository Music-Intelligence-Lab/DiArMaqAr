---
url: /docs/api.md
description: Complete REST API documentation for the Digital Arabic Maqām Archive
---

# API Reference

The DiArMaqAr API provides programmatic access to historically documented maqāmāt, ajnās, and tuning systems with comprehensive bibliographic attribution.

## Base URL

* **Production**: `https://diarmaqar.netlify.app/api`
* **Development**: `http://localhost:3000/api`

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

## Common Parameters

Most endpoints support these optional parameters:

* **`includeArabic`** (default: `"true"`): Include Arabic script alongside transliteration
  * `"true"`: Bilingual responses with `*Ar` suffixed fields (`displayNameAr`, `noteNameDisplayAr`, etc.)
  * `"false"`: English transliteration only

* **`includeSources`** (default: `"true"` for list endpoints, `"false"` for detail endpoints): Include bibliographic source references
  * `"true"`: Include `sources` array with `{sourceId, page}` objects
  * `"false"`: Omit source references for performance

## Rate Limiting

Currently, there are no rate limits. Please use the API responsibly.

***

## Endpoints

### Maqāmāt

60 documented modal frameworks with historical source attribution.

#### List All Maqāmāt

```
GET /api/maqamat
```

**Query Parameters:**

* `filterByFamily` (optional): Filter by maqām family (`rast`, `bayyat`, `hijaz`, `kurd`, `nahawand`, `saba`, `segah`, etc.)
* `filterByTonic` (optional): Filter by maqām tonic/first note (`rast`, `dugah`, `segah`, `chahargah`, `nawa`, etc.)
* `sortBy` (optional, default: `alphabetical`): Sort order (`alphabetical` or `tonic`)
* `includeSources` (optional, default: `"true"`): Include bibliographic references
* `includeArabic` (optional, default: `"true"`): Include Arabic script

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat"
curl "https://diarmaqar.netlify.app/api/maqamat?filterByFamily=rast&sortBy=tonic"
```

**Response:** List of maqāmāt with metadata, availability stats, and tuning system compatibility.

#### Get Maqām Details

```
GET /api/maqamat/{idName}
```

**Path Parameters:**

* `idName`: URL-safe maqām identifier (e.g., `maqam_rast`, `maqam_bayyat`)

**Query Parameters (all required for detail endpoints):**

* `tuningSystem`: Tuning system ID (e.g., `IbnSina-(1037)`, `al-Sabbagh-(1950)`)
* `startingNote`: Starting note name (e.g., `ushayran`, `yegah`, `rast`)

**Optional Parameters:**

* `pitchClassDataType` (default: `cents`): Data format for pitch classes (`all`, `cents`, `frequency`, `fraction`, `midiNoteNumber`, etc.)
* `includeIntervals` (default: `"false"`): Include interval data
* `includeModulations` (default: `"false"`): Include modulation analysis
* `includeTranspositions` (default: `"false"`): Include all valid transpositions
* `includeArabic` (optional, default: `"true"`): Include Arabic script

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

#### Check Maqām Availability

```
GET /api/maqamat/{idName}/availability
```

**Query Parameters (optional):**

* `targetNote`: Filter to specific transposition target note

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/availability"
```

**Response:** Lists which tuning systems can realize this maqām and from which starting notes.

#### List Maqām Transpositions

```
GET /api/maqamat/{idName}/transpositions
```

**Query Parameters (required):**

* `tuningSystem`: Tuning system ID
* `startingNote`: Starting note name

**Optional Parameters:**

* `includeArabic` (optional, default: `"true"`): Include Arabic script

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/transpositions?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

**Response:** All valid transpositions within the specified tuning system.

#### Compare Maqām Across Tuning Systems

```
GET /api/maqamat/{idName}/compare
```

**Query Parameters:**

* `tuningSystems` (required): Comma-separated tuning system IDs (max 5)
* `startingNotes` (required): Comma-separated starting notes (must match number of tuning systems)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/compare?tuningSystems=IbnSina-(1037),al-Sabbagh-(1950)&startingNotes=ushayran,rast"
```

**Response:** Side-by-side comparison of maqām realization across multiple tuning systems.

***

### Ajnās

29 documented tetrachords (melodic fragments) with historical source attribution.

#### List All Ajnās

```
GET /api/ajnas
```

**Query Parameters:**

* `filterByTonic` (optional): Filter by jins tonic/first note
* `sortBy` (optional, default: `alphabetical`): Sort order
* `includeSources` (optional, default: `"true"`): Include bibliographic references
* `includeArabic` (optional, default: `"true"`): Include Arabic script

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas"
```

#### Get Jins Details

```
GET /api/ajnas/{idName}
```

**Path Parameters:**

* `idName`: URL-safe jins identifier (e.g., `jins_rast`, `jins_bayyat`)

**Query Parameters (required):**

* `tuningSystem`: Tuning system ID
* `startingNote`: Starting note name

**Optional Parameters:**

* `pitchClassDataType` (default: `cents`)
* `includeIntervals` (default: `"false"`)
* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

#### Check Jins Availability

```
GET /api/ajnas/{idName}/availability
```

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast/availability"
```

#### List Jins Transpositions

```
GET /api/ajnas/{idName}/transpositions
```

**Query Parameters (required):**

* `tuningSystem`: Tuning system ID
* `startingNote`: Starting note name

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast/transpositions?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

#### Compare Jins Across Tuning Systems

```
GET /api/ajnas/{idName}/compare
```

**Query Parameters:**

* `tuningSystems` (required): Comma-separated tuning system IDs (max 5)
* `startingNotes` (required): Comma-separated starting notes

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast/compare?tuningSystems=IbnSina-(1037),al-Sabbagh-(1950)&startingNotes=ushayran,rast"
```

***

### Tuning Systems

35 historical tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

#### List All Tuning Systems

```
GET /api/tuning-systems
```

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`): Include Arabic script

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems"
```

**Response:** List of all tuning systems with metadata, starting notes, pitch class counts, and source references.

#### Get Tuning System Pitch Classes

```
GET /api/tuning-systems/{id}/{startingNote}/pitch-classes
```

**Path Parameters:**

* `id`: Tuning system ID (e.g., `IbnSina-(1037)`)
* `startingNote`: Starting note name (e.g., `ushayran`, `yegah`)

**Query Parameters:**

* `octave` (optional, default: `all`): Filter by octave number (`all`, `0`, `1`, `2`, `3`)
* `pitchClassDataType` (optional, default: `cents`): Data format
* `includeIntervals` (optional, default: `"false"`)
* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/IbnSina-(1037)/ushayran/pitch-classes"
curl "https://diarmaqar.netlify.app/api/tuning-systems/IbnSina-(1037)/ushayran/pitch-classes?octave=1&pitchClassDataType=frequency"
```

#### List Maqāmāt in Tuning System

```
GET /api/tuning-systems/{id}/maqamat
```

**Path Parameters:**

* `id`: Tuning system ID

**Query Parameters:**

* `startingNote` (required): Starting note name
* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/IbnSina-(1037)/maqamat?startingNote=ushayran"
```

**Response:** List of all maqāmāt realizable within this tuning system configuration.

***

### Pitch Classes (by Note Names)

Query pitch class data by note name across tuning systems.

#### List Note Names

```
GET /api/pitch-classes
```

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes"
```

**Response:** List of all available note names in the system.

#### Get Pitch Class by Note Name

```
GET /api/pitch-classes/{noteName}
```

**Path Parameters:**

* `noteName`: URL-safe note name (e.g., `rast`, `dugah`, `segah`)

**Query Parameters (required):**

* `tuningSystem`: Tuning system ID
* `startingNote`: Starting note name

**Optional Parameters:**

* `octave` (optional, default: `all`)
* `pitchClassDataType` (optional, default: `cents`)
* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran"
```

#### Check Note Name Availability

```
GET /api/pitch-classes/{noteName}/availability
```

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/rast/availability"
```

#### Compare Pitch Class Across Systems

```
GET /api/pitch-classes/{noteName}/compare
```

**Query Parameters:**

* `tuningSystems` (required): Comma-separated tuning system IDs (max 5)
* `startingNotes` (required): Comma-separated starting notes

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/rast/compare?tuningSystems=IbnSina-(1037),al-Sabbagh-(1950)&startingNotes=ushayran,rast"
```

***

### Intervals

Calculate intervals between note names across tuning systems.

#### Calculate Intervals by Note Names

```
GET /api/intervals
```

**Query Parameters (required):**

* `tuningSystem`: Tuning system ID
* `startingNote`: Starting note name
* `fromNote`: Starting note name for interval
* `toNote`: Ending note name for interval

**Optional Parameters:**

* `dataType` (optional, default: `cents`): Format (`cents`, `frequency`, `fraction`, `decimalRatio`)
* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/intervals?tuningSystem=IbnSina-(1037)&startingNote=ushayran&fromNote=rast&toNote=dugah"
```

#### Compare Intervals Across Tuning Systems

```
GET /api/intervals/compare
```

**Query Parameters:**

* `tuningSystems` (required): Comma-separated tuning system IDs (max 5)
* `startingNotes` (required): Comma-separated starting notes
* `fromNote` (required): Starting note for interval
* `toNote` (required): Ending note for interval

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/intervals/compare?tuningSystems=IbnSina-(1037),al-Sabbagh-(1950)&startingNotes=ushayran,rast&fromNote=rast&toNote=dugah"
```

***

### Sources

Bibliographic references for tuning systems, maqāmāt, and ajnās.

#### List All Sources

```
GET /api/sources
```

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources"
```

**Response:** Complete bibliography with author names, titles, publication details, and page references.

#### Get Source Details

```
GET /api/sources/{id}
```

**Path Parameters:**

* `id`: Source ID (e.g., `al-Shawwa-(1946)`, `IbnSina-(1037)`)

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/al-Shawwa-(1946)"
```

#### List Tuning Systems by Source

```
GET /api/sources/{id}/tuning-systems
```

**Path Parameters:**

* `id`: Source ID

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/IbnSina-(1037)/tuning-systems"
```

**Response:** All tuning systems documented in this source with page references.

#### List Maqāmāt by Source

```
GET /api/sources/{id}/maqamat
```

**Path Parameters:**

* `id`: Source ID

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/al-Shawwa-(1946)/maqamat"
```

**Response:** All maqāmāt documented in this source with page references.

#### List Ajnās by Source

```
GET /api/sources/{id}/ajnas
```

**Path Parameters:**

* `id`: Source ID

**Query Parameters:**

* `includeArabic` (optional, default: `"true"`)

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/al-Shawwa-(1946)/ajnas"
```

**Response:** All ajnās documented in this source with page references.

***

## Pitch Class Data Formats

The `pitchClassDataType` parameter supports these formats:

| Format | Description |
|--------|-------------|
| `all` | Complete pitch class data with all formats |
| `pitchClassIndex` | Index in tuning system (0-based) |
| `englishName` | English note names (C, D, E, etc.) |
| `fraction` | Interval fractions (9/8, 5/4, etc.) |
| `cents` | Cent values (0-1200) |
| `decimalRatio` | Decimal ratios (1.125, 1.25, etc.) |
| `stringLength` | String lengths for monochord |
| `frequency` | Frequencies in Hz |
| `abjadName` | Abjad notation names |
| `fretDivision` | Fret divisions for oud |
| `midiNoteNumber` | MIDI note numbers |
| `midiNoteDeviation` | MIDI + cents deviation |
| `centsDeviation` | Cents deviation from 12-EDO |
| `referenceNoteName` | IPN reference names |

***

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification: [openapi.json](/docs/openapi.json)

***

## Interactive API Playground

Test endpoints interactively: [API Playground](https://arabic-maqam-archive.netlify.app/api-playground) (when running locally: http://localhost:3000/api-playground)
