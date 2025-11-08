---
url: /docs/api/endpoints-reference.md
description: Complete API endpoint documentation
---

# API Endpoints Reference

Complete documentation for all API endpoints. For quick start, see [API Documentation](./index). For examples, see [Canonical Examples](./canonical-examples).

***

# Quick Reference

## Base URL

* **Production**: `https://diarmaqar.netlify.app/api`
* **Development**: `http://localhost:3000/api`

## OpenAPI Specification

Machine-readable OpenAPI 3.1.0 specification:

* [openapi.json](/openapi.json)
* [openapi.yaml](/openapi.yaml)

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

* **`includeArabic`** (default: `"true"`): Include Arabic script alongside transliteration
  * `"true"`: Bilingual responses with `*Ar` suffixed fields (`displayNameAr`, `noteNameDisplayAr`, etc.)
  * `"false"`: English transliteration only

* **`includeSources`** (default: `"true"` for list endpoints, `"false"` for detail endpoints): Include bibliographic source references
  * `"true"`: Include `sources` array with `{sourceId, page}` objects
  * `"false"`: Omit source references for performance

***

# Endpoints

## Maqāmāt

Documented modal frameworks with historical source attribution.

#### List all maqāmāt {#listMaqamat}

```
GET /maqamat
```

Retrieve all available maqāmāt with optional filtering and sorting.

Returns concise metadata (no pitch class data) including:

* URL-safe identifiers and display names for each maqām
* Maqām family and maqām tonic identifiers (both URL-safe and display formats)
* Availability counts across tuning systems with their valid starting note names (e.g., "ʿushayrān", "yegāh" etc...)
* Optional bibliographic source references (sourceId and page) when `includeSources=true`
* Filter values must be URL-safe; see parameter enums for complete list of valid options

**Query Parameters:**

* `filterByFamily` (optional): Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string` - Valid values: `ajam`, `athar_kurd`, `awj_ara`, `bayyat`, `buselik`, ... (16 total)
  * Example: `rast`
* `filterByTonic` (optional): Filter by maqām tonic/first note (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string` - Valid values: `ajam_ushayran`, `chahargah`, `dugah`, `iraq`, `nawa`, `rast`, `segah`, `ushayran`, `yegah`
* `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `tonic`, `alphabetical` - Default: `alphabetical`
  * Example: `tonic` - Sort by tonic note priority (NoteName.ts order)
  * Example: `alphabetical` - Sort alphabetically by display name
* `includeSources` (optional): Include bibliographic source references (sourceId and page) for each maqām - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  * All English/transliteration fields remain unchanged
  * Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  * Note names, maqām names, and jins names get Arabic versions in \*Ar fields
  * Comments get Arabic versions in commentsAr if available
  * Tuning system display names get Arabic versions in displayNameAr if available
  * Source metadata gets Arabic versions in \*Ar fields (titleAr, firstNameAr, etc.)
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat?includeSources=true&includeArabic=true"
```

**Response:** List of maqāmāt retrieved successfully

#### Get detailed maqām data {#getMaqam}

```
GET /maqamat/{idName}
```

Retrieve comprehensive data for a specific maqām on its conventional or a transposed tonic, in a specific tuning system on a specific starting note name.

Returns:

* Comprehensive pitch class data in the requested tuning system and starting note name
* All ajnās present at each maqām degree in the ascending and descending maqām structure, organized by their maqām degree note names
* Optional includeIntervals data, transposition to different tonics, tuning-system-specific modulations (including lower octave), and suyūr

Parameter Discovery:

* Use options=true to discover valid values for all parameters including dynamically calculated transposition options
* Especially useful for finding valid tuning system starting notes and transposition tonics for a specific maqām

Important:

* When options=true, the endpoint returns parameter discovery metadata instead of maqām data
* This mode is mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, include suyūr, pitch class data type, includeIntervals)
* If data-returning parameters are provided with options=true, the API returns a 400 Bad Request error with details about conflicting parameters

Requirements:

* Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
* These are fundamental to all pitch class calculations

**Path Parameters:**

* `idName`: URL-safe maqām identifier (string) **(required)**
  * Example: `maqam_rast` - Maqām Rāst
  * Example: `maqam_hijaz` - Maqām Ḥijāz

**Query Parameters:**

* `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)') - Type: `string`
  * Example: `IbnSina-(1037)` - Ibn Sīnā 17-tone system
  * Example: `al-Farabi-(950i)` - al-Fārābī tuning system
  * Example: `Anglo-European-(1700)` - 12-tone equal temperament
* `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  * Different starting notes represent different theoretical frameworks within the same tuning system
  * Examples: ʿushayrān for oud tuning, yegāh for monochord measurements
* Type: `string`
* Example: `ushayran` - ʿushayrān
* Example: `rast` - rāst
* Example: `dugah` - dūgāh
* `options` (optional): When true, returns available parameter options instead of maqām data.
  * Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
  * These are fundamental to all pitch class calculations and calculate valid starting note options and transposition tonics
  * Mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, include suyūr, pitch class data type, includeIntervals)
  * Transposition options are dynamically calculated based on the specific maqām, tuning system, and starting note combination
  * Only tonics where the maqām can be validly transposed (preserving interval pattern) are included, not all possible pitch classes
  * If data-returning parameters are provided, returns 400 Bad Request error with details about conflicting parameters
* Type: `string` - Valid values: `true`, `false` - Default: `false`
* Example: `true`
* `pitchClassDataType` **(required)**: Specifies which pitch class data type to return for each pitch class.
  * Optional for discovery mode (when options=true) since discovery returns parameter metadata, not formatted data
  * Use 'all' for complete pitch class data across all available formats
  * Each option returns the specified data type for all pitch classes in the maqām
* Type: `string` - Valid values: `all`, `frequency`, `cents`, `fraction`, `decimalRatio`, ... (13 total)
* Example: `cents`
* `transposeTo` (optional): Transpose the maqām to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  * To see all valid transposition options, request available parameter options instead of maqām data
* Type: `string`
* Example: `nawa`
* `includeIntervals` (optional): Include interval data between maqām degrees - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeModulations` (optional): Include modulation possibilities to other maqāmāt and ajnās - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeModulations8vb` (optional): Include available modulations an octave below - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeSuyur` (optional): Include suyūr (melodic paths) data - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=ushayran&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Maqām data retrieved successfully.

* When options is true, the response structure differs and returns available parameter options instead of maqām data
* In that case, transposition options contain only valid transposition tonics for this specific maqām, tuning system, and starting note combination

#### Check maqām availability across tuning systems {#getMaqamAvailability}

```
GET /maqamat/{idName}/availability
```

Return tuning-system availability for a maqām.

* Shows which tuning systems on which starting note names can realize the specified maqām
* If `transpositionNoteName` is provided, filters results to show only tuning systems where the maqām can be transposed to that specific note
* Validity is computed against each tuning system's note name sets and the maqām's pitch class intervals
* Tuning system starting note names are returned as both display values (with diacritics) and URL-safe identifiers

**Path Parameters:**

* `idName`: URL-safe maqām identifier (string) **(required)**
  * Example: `maqam_rast`

**Query Parameters:**

* `transpositionNoteName` (optional): Filter results to show only tuning systems where the maqām can be transposed to this specific note (URL-safe, diacritics-insensitive). - Type: `string`
  * Example: `nawa`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully

#### List transpositions for a maqām {#listMaqamTranspositions}

```
GET /maqamat/{idName}/transpositions
```

List all available transposition options for a maqām within a specific tuning system and starting note.

Returns all tonic transpositions that are feasible under the tuning system across all octaves.

**Path Parameters:**

* `idName`: URL-safe maqām identifier (string) **(required)**
  * Example: `maqam_rast`

**Query Parameters:**

* `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)') - Type: `string`
  * Example: `IbnSina-(1037)`
* `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive) - Type: `string`
  * Example: `yegah`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/transpositions?tuningSystem=IbnSina-(1037)&startingNote=yegah&includeArabic=true"
```

**Response:** Transpositions retrieved successfully

#### Compare maqām data across multiple tuning systems {#compareMaqam}

```
GET /maqamat/{idName}/compare
```

Compare comprehensive maqām data across multiple tuning systems and starting note configurations in a single request.

Returns comprehensive data similar to `/maqamat/{idName}` but without modulations and suyur. Each comparison includes:

* Pitch class data (ascending and descending sequences)
* Optional interval data
* Ajnās (constituent melodic structures) mapping
* Maqām metadata (family classification, tonic, transposition status)
* Context information (tuning system, starting note, reference frequency)

This endpoint is ideal for comparative musicological analysis across different historical tuning systems.

**Path Parameters:**

* `idName`: URL-safe maqām identifier (string) **(required)**
  * Example: `maqam_rast`

**Query Parameters:**

* `tuningSystems` **(required)**: Comma-separated tuning system IDs. - Type: `string`
  * Example: `IbnSina-(1037),al-Farabi-(950g)`
* `startingNote` **(required)**: Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems - Type: `string`
  * Example: `yegah`
* `pitchClassDataType` **(required)**: Output format for pitch class data - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  * Example: `cents`
* `includeIntervals` (optional): Include interval data between pitch classes - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `transposeTo` (optional): Transpose to specific tonic note (applies to all tuning systems) - Type: `string`
  * Example: `nawa`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast/compare?tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

***

## Ajnās

Documented tetrachords (melodic fragments) with historical source attribution.

#### List all ajnās {#listAjnas}

```
GET /ajnas
```

Return all ajnās (singular: jins) with metadata.

* Includes URL-safe identifiers, display names, and structural information
* Structural information includes note sequences needed for maqām construction and analysis
* Optional bibliographic source references (sourceId and page) when `includeSources=true`

**Query Parameters:**

* `filterByTonic` (optional): Filter by jins tonic/first note (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string`
  * Example: `rast`
* `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `tonic`, `alphabetical` - Default: `alphabetical`
  * Example: `tonic` - Sort by tonic note priority (NoteName.ts order)
  * Example: `alphabetical` - Sort alphabetically by display name
* `includeSources` (optional): Include bibliographic source references (sourceId and page) for each jins - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas?includeSources=true&includeArabic=true"
```

**Response:** List of ajnās retrieved successfully

#### Get detailed jins data {#getJins}

```
GET /ajnas/{idName}
```

Retrieve comprehensive data for a specific jins on its conventional or a transposed tonic, in a specific tuning system on a specific starting note name.

Returns:

* Comprehensive pitch class data in the requested tuning system and starting note name
* Optional includeIntervals data, transposition to different tonics, and tuning-system-specific modulations (including lower octave)

Parameter Discovery:

* Use options=true to discover valid values for all parameters including dynamically calculated transposition options
* Especially useful for finding valid tuning system starting notes and transposition tonics for a specific jins

Important:

* When options=true, the endpoint returns parameter discovery metadata instead of jins data
* This mode is mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, pitch class data type, includeIntervals)
* If data-returning parameters are provided with options=true, the API returns a 400 Bad Request error with details about conflicting parameters

Requirements:

* Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
* These are fundamental to all pitch class calculations

**Path Parameters:**

* `idName`: URL-safe jins identifier (string) **(required)**
  * Example: `jins_kurd` - Jins Kurd
  * Example: `jins_rast` - Jins Rāst

**Query Parameters:**

* `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)') - Type: `string`
  * Example: `IbnSina-(1037)` - Ibn Sīnā 17-tone system
  * Example: `al-Farabi-(950i)` - al-Fārābī tuning system
  * Example: `Anglo-European-(1700)` - 12-tone equal temperament
* `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  * Different starting notes represent different theoretical frameworks within the same tuning system
  * Examples: ʿushayrān for oud tuning, yegāh for monochord measurements
* Type: `string`
* Example: `ushayran` - ʿushayrān
* Example: `rast` - rāst
* Example: `yegah` - yegāh
* `options` (optional): When true, returns available parameter options instead of jins data.
  * Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
  * These are fundamental to all pitch class calculations and calculate valid starting note options and transposition tonics
  * Mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, pitch class data type, intervals)
  * Transposition options are dynamically calculated based on the specific jins, tuning system, and starting note combination
  * Only tonics where the jins can be validly transposed (preserving interval pattern) are included, not all possible pitch classes
  * If data-returning parameters are provided, returns 400 Bad Request error with details about conflicting parameters
* Type: `string` - Valid values: `true`, `false` - Default: `false`
* Example: `true`
* `pitchClassDataType` (optional): Specifies which pitch class data type to return for each pitch class.
  * Optional for discovery mode (when options=true) since discovery returns parameter metadata, not formatted data
  * Use 'all' for complete pitch class data across all available formats
  * Each option returns the specified data type for all pitch classes in the jins
* Type: `string` - Valid values: `all`, `frequency`, `cents`, `fraction`, `decimalRatio`, ... (13 total)
* Example: `cents`
* `transposeTo` (optional): Transpose the jins to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  * To see all valid transposition options, request available parameter options instead of jins data
* Type: `string`
* Example: `nawa`
* `includeIntervals` (optional): Include interval data between jins degrees - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeModulations` (optional): Include modulation possibilities to other ajnās - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeModulations8vb` (optional): Include available modulations an octave below - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_kurd?tuningSystem=IbnSina-(1037)&startingNote=ushayran&includeArabic=true"
```

**Response:** Jins data retrieved successfully.

* When options is true, the response structure differs and returns available parameter options instead of jins data
* In that case, transposition options contain only valid transposition tonics for this specific jins, tuning system, and starting note combination

#### Check jins availability across tuning systems {#getJinsAvailability}

```
GET /ajnas/{idName}/availability
```

Return tuning-system availability for a jins.

* Shows which tuning systems on which starting note names can realize the specified jins
* If `transpositionNoteName` is provided, filters results to show only tuning systems where the jins can be transposed to that specific note
* Validity is computed against each tuning system's note name sets and the jins's pitch class intervals
* Availability checking spans 3 octaves to correctly handle ajnās that may span multiple octaves

**Path Parameters:**

* `idName`: URL-safe jins identifier (string) **(required)**
  * Example: `jins_kurd`

**Query Parameters:**

* `transpositionNoteName` (optional): Filter results to show only tuning systems where the jins can be transposed to this specific note (URL-safe, diacritics-insensitive). - Type: `string`
  * Example: `nawa`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_kurd/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully

#### List transpositions for a jins {#listJinsTranspositions}

```
GET /ajnas/{idName}/transpositions
```

List all available transposition options for a jins within a specific tuning system and starting note.

Returns all tonic transpositions that are feasible under the tuning system across all octaves.

**Path Parameters:**

* `idName`: URL-safe jins identifier (string) **(required)**
  * Example: `jins_kurd`

**Query Parameters:**

* `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)') - Type: `string`
  * Example: `IbnSina-(1037)`
* `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive) - Type: `string`
  * Example: `yegah`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_kurd/transpositions?tuningSystem=IbnSina-(1037)&startingNote=yegah&includeArabic=true"
```

**Response:** Transpositions retrieved successfully

#### Compare jins data across multiple tuning systems {#compareJins}

```
GET /ajnas/{idName}/compare
```

Compare comprehensive jins data across multiple tuning systems and starting note configurations in a single request.

Returns comprehensive data similar to `/ajnas/{idName}` but without modulations. Each comparison includes:

* Pitch class data (single sequence, as ajnās are unidirectional)
* Optional interval data
* Jins metadata (tonic, transposition status)
* Context information (tuning system, starting note, reference frequency)

This endpoint is ideal for comparative musicological analysis of melodic structures across different historical tuning systems.

**Path Parameters:**

* `idName`: URL-safe jins identifier (string) **(required)**
  * Example: `jins_kurd`

**Query Parameters:**

* `tuningSystems` **(required)**: Comma-separated tuning system IDs. - Type: `string`
  * Example: `IbnSina-(1037),al-Farabi-(950g)`
* `startingNote` **(required)**: Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems - Type: `string`
  * Example: `yegah`
* `pitchClassDataType` **(required)**: Output format for pitch class data - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  * Example: `cents`
* `includeIntervals` (optional): Include interval data between pitch classes - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `transposeTo` (optional): Transpose to specific tonic note (applies to all tuning systems) - Type: `string`
  * Example: `nawa`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_kurd/compare?tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

***

## Tuning Systems

Historical tuning systems spanning from al-Kindī (874 CE) to contemporary approaches.

#### List all tuning systems {#listTuningSystems}

```
GET /tuning-systems
```

Retrieve metadata for all available tuning systems.

* Includes identifiers, display names, version information, primary value type, and pitch class counts per octave
* Responses include available starting note names for each tuning system
* Different starting notes represent different theoretical frameworks (e.g., ʿushayrān for oud tuning, yegāh for monochord measurements)
* Optional bibliographic source references (sourceId and page) when `includeSources=true`

**Query Parameters:**

* `includeSources` (optional): Include bibliographic source references (sourceId and page) for each tuning system - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`
* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems?includeSources=true&includeArabic=true"
```

**Response:** List of tuning systems

#### Get Tuning System Details {#getTuningSystemPitchClasses}

```
GET /tuning-systems/{id}/{startingNote}/pitch-classes
```

Get Tuning System Details - Returns all pitch classes for a specific tuning system and starting note.

This endpoint is essential for tuning system operations, providing comprehensive pitch class data
across all octaves with full formatting options.

**Path Parameters:**

* `id`: Tuning system identifier (string) **(required)**
  * Example: `IbnSina-(1037)`
* `startingNote`: Tuning system starting note name (URL-safe, diacritics-insensitive) (string) **(required)**
  * Example: `yegah`

**Query Parameters:**

* `pitchClassDataType` (optional): Pitch class data format (optional, defaults to "all") - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  * Example: `cents`
* `octave` (optional): Filter by octave number.
  Use a specific octave number (0, 1, 2, 3) to filter to that octave only.
* Type: `string` - Valid values: `all`, `0`, `1`, `2`, `3`
* Example: `all`
* `includeSources` (optional): Include bibliographic source references (sourceId and page) for the tuning system - Type: `string` - Valid values: `true`, `false`
  * Example: `true`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/IbnSina-(1037)/yegah/pitch-classes?includeSources=true&includeArabic=true"
```

**Response:** Tuning system pitch classes retrieved successfully

#### List maqāmāt available in a tuning system {#listTuningSystemMaqamat}

```
GET /tuning-systems/{id}/{startingNote}/maqamat
```

Return all maqāmāt that can be realized in a given tuning system beginning on a specific starting note name.

* Feasibility is determined by comparing maqām pitch classes to the tuning system's note name sets (including adjacent octave context)

**Path Parameters:**

* `id`: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950i)', 'Anglo-European-(1700)') (string) **(required)**
  * Example: `IbnSina-(1037)`
* `startingNote`: Tuning system starting note name (URL-safe, diacritics-insensitive) (string) **(required)**
  * Example: `yegah`

**Query Parameters:**

* `includeArabic` (optional): Return response data in Arabic script when true.
  * Note names, maqām names, and jins names are converted to Arabic script
  * Comments return Arabic versions if available
  * Tuning system display names use Arabic creator/title if available
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/IbnSina-(1037)/yegah/maqamat?includeArabic=true"
```

**Response:** Maqāmāt list retrieved successfully

***

## Pitch Classes

#### List all note names {#listNoteNames}

```
GET /pitch-classes/note-names
```

Returns all note names used in the app, bilingually, sortable by note name order or alphabetically.

Note names are sourced from all octave arrays in NoteName.ts (octaveZeroNoteNames, octaveOneNoteNames,
octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames). Each note name includes:

* Canonical order (index within its octave array)
* Octave number (0-4)
* English IPN equivalent

Note names are unique per octave, so the same note name string in different octaves represents
different pitch classes.

**Note**: Availability data is not included in this endpoint (it's expensive to calculate).
Use the availability endpoint (`/api/pitch-classes/note-names/{noteName}/availability`) to get
availability information for a specific note name.

**Query Parameters:**

* `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `order`, `alphabetical` - Default: `order`
  * Example: `order` - Sort by canonical note name order (from NoteName.ts arrays)
  * Example: `alphabetical` - Sort alphabetically by display name
* `filterByTuningSystem` (optional): Filter by tuning system ID to show only note names that exist in that system (URL-safe, case-insensitive). - Type: `string`
  * Example: `IbnSina-(1037)`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names?includeArabic=true"
```

**Response:** List of note names retrieved successfully

#### Get pitch class details by note name {#getPitchClassByNoteName}

```
GET /pitch-classes/note-names/{noteName}
```

Get pitch class details for a note name, across all tuning systems or a specific one.

When querying by note name, the note name itself identifies the octave (note names are unique per octave).
The octave parameter is optional and can be used for validation.

Supports:

* Single tuning system with specific starting note
* Single tuning system with startingNote="all" (returns array for all starting notes)
* All tuning systems (returns array for all tuning systems and starting notes)

**Path Parameters:**

* `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  * Example: `rast`

**Query Parameters:**

* `tuningSystem` (optional): Tuning system ID. - Type: `string`
  * Example: `IbnSina-(1037)`
* `startingNote` (optional): Starting note for the tuning system.
  * Use "all" to include all available starting notes for that tuning system (returns array of results, one per starting note) Note: Since note names are unique per octave, the note name itself identifies the octave. No octave parameter is needed.
* Type: `string`
* Example: `yegah`
* `pitchClassDataType` (optional): Pitch class data format - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total) - Default: `all`
  * Example: `all`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast?includeArabic=true"
```

**Response:** Pitch class data retrieved successfully

#### Check note name availability across tuning systems {#getNoteNameAvailability}

```
GET /pitch-classes/note-names/{noteName}/availability
```

Check which tuning systems support a specific note name and what pitch class index it has in each tuning system.

Returns for each tuning system:

* All starting notes where the note name exists
* The pitch class index for each starting note
* The octave where the note name was found

**Path Parameters:**

* `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  * Example: `rast`

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast/availability?includeArabic=true"
```

**Response:** Availability data retrieved successfully

#### Compare pitch class by note name across tuning systems {#comparePitchClassByNoteName}

```
GET /pitch-classes/note-names/{noteName}/compare
```

Compare a pitch class (by note name) across different tuning systems.

Returns comprehensive data for each tuning system including:

* Pitch class data in the requested format
* Context information (tuning system, starting note, reference frequency)

**Path Parameters:**

* `noteName`: URL-safe note name (e.g., "rast", "dugah", "nawa") (string) **(required)**
  * Example: `rast`

**Query Parameters:**

* `tuningSystems` **(required)**: Comma-separated tuning system IDs - Type: `string`
  * Example: `IbnSina-(1037),al-Farabi-(950g)`
* `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  * Example: `yegah`
* `pitchClassDataType` (optional): Pitch class data format - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total) - Default: `all`
  * Example: `all`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast/compare?tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

***

## Intervals

#### Calculate intervals by note names {#calculateIntervalsByNoteNames}

```
GET /intervals
```

Get interval calculations for 2 or more pitch classes by listing their note names.

Calculates intervals between consecutive note names: \[0→1, 1→2, 2→3, ...]

Supports:

* Single tuning system with specific starting note
* Single tuning system with startingNote="all" (returns array for all starting notes)
* All tuning systems (returns array for all tuning systems and starting notes)

Note: When querying by note names, the pitchClassIndex field is excluded from interval responses
as it is not meaningful in this context.

**Query Parameters:**

* `noteNames` **(required)**: Comma-separated note names (e.g., "rast,dugah,segah"). Note names can come from any octave. - Type: `string`
  * Example: `rast,dugah,segah`
* `tuningSystem` (optional): Tuning system ID. - Type: `string`
  * Example: `IbnSina-(1037)`
* `startingNote` (optional): Starting note.
  * Use "all" to include all available starting notes for that tuning system (returns array of results, one per starting note) Note: Since note names are unique per octave, each note name already identifies its octave. No octave parameter is needed.
* Type: `string`
* Example: `yegah`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/intervals?noteNames=rast,dugah,segah&includeArabic=true"
```

**Response:** Interval calculations retrieved successfully

#### Compare intervals across tuning systems {#compareIntervalsByNoteNames}

```
GET /intervals/compare
```

Compare interval calculations for 2+ pitch classes across different tuning systems by listing their note names.

Calculates intervals between consecutive note names: \[0→1, 1→2, 2→3, ...]

Note: When querying by note names, the pitchClassIndex field is excluded from interval responses
as it is not meaningful in this context.

**Query Parameters:**

* `noteNames` **(required)**: Comma-separated note names. Note names can come from any octave. - Type: `string`
  * Example: `rast,dugah,segah`
* `tuningSystems` **(required)**: Comma-separated tuning system IDs - Type: `string`
  * Example: `IbnSina-(1037),al-Farabi-(950g)`
* `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  * Example: `yegah`
* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/intervals/compare?noteNames=rast,dugah,segah&tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&includeArabic=true"
```

**Response:** Comparison data retrieved successfully

***

## Sources

#### List all bibliographic sources {#listSources}

```
GET /sources
```

Return all bibliographic sources (books, articles, theses) with comprehensive metadata.

* Includes titles, contributors, publication information, and version timestamps
* Sources document the historical and scholarly foundation for the archive's musical data
* All sources include common fields (edition, publication date, URL, etc.)
* Type-specific fields are included based on sourceType:
  * Books: publisher, place, ISBN, original publication date
  * Articles: journal, volume, issue, page range, DOI
  * Theses: degree type, university, department, database information

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  * All English/transliteration fields remain unchanged
  * Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  * Note names, maqām names, and jins names get Arabic versions in \*Ar fields
  * Comments get Arabic versions in commentsAr if available
  * Tuning system display names get Arabic versions in displayNameAr if available
  * Source metadata gets Arabic versions in \*Ar fields (titleAr, firstNameAr, etc.)
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources?includeArabic=true"
```

**Response:** List of sources retrieved successfully

#### Get a single bibliographic source {#getSource}

```
GET /sources/{id}
```

Return detailed information for a single bibliographic source by ID.

* Returns comprehensive bibliographic metadata for the specified source
* Includes all common fields (title, contributors, publication date, etc.)
* Includes type-specific fields based on sourceType:
  * Books: publisher, place, ISBN, original publication date
  * Articles: journal, volume, issue, page range, DOI
  * Theses: degree type, university, department, database information
* Supports bilingual responses (English/Arabic) via includeArabic parameter

**Path Parameters:**

* `id`: The unique identifier for the bibliographic source.

Examples:

* `al-Khuli-(2011)` - Book source ID (URL-safe, diacritics removed)
* `Farmer-(1937)` - Article source ID
* `Allami-(2022)` - Thesis source ID

**Note**: Source IDs use only the publication date (not original publication date)
and are URL-safe with diacritics removed for compatibility.

Use the `/api/sources` endpoint to retrieve all available source IDs.
(string) **(required)**

* Example: `Farmer-(1937)`

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  * All English/transliteration fields remain unchanged
  * Arabic versions are added with "Ar" suffix (e.g., titleAr, firstNameAr, lastNameAr)
  * Contributors get Arabic name versions in firstNameAr and lastNameAr fields
  * Type-specific fields get Arabic versions (e.g., publisherAr, journalAr, universityAr)
  * Display name gets Arabic version in displayNameAr field
* Type: `string` - Valid values: `true`, `false` - Default: `true`
* Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)?includeArabic=true"
```

**Response:** Source retrieved successfully

#### List tuning systems by source {#listTuningSystemsBySource}

```
GET /sources/{id}/tuning-systems
```

Returns all tuning systems that reference the specified source.

A tuning system is included if any of its sourcePageReferences match the source ID.
This endpoint provides an easy way to see which tuning systems have been derived from a specific source.

**Path Parameters:**

* `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
(string) **(required)**

* Example: `Farmer-(1937)`

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/tuning-systems?includeArabic=true"
```

**Response:** Tuning systems retrieved successfully

#### List maqamat by source {#listMaqamatBySource}

```
GET /sources/{id}/maqamat
```

Returns all maqamat that reference the specified source.

A maqam is included if any of its sourcePageReferences match the source ID.
This endpoint provides an easy way to see which maqamat have been documented in a specific source.

**Path Parameters:**

* `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
(string) **(required)**

* Example: `Farmer-(1937)`

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/maqamat?includeArabic=true"
```

**Response:** Maqamat retrieved successfully

#### List ajnas by source {#listAjnasBySource}

```
GET /sources/{id}/ajnas
```

Returns all ajnas that reference the specified source.

A jins is included if any of its SourcePageReferences match the source ID.
This endpoint provides an easy way to see which ajnas have been documented in a specific source.

**Path Parameters:**

* `id`: The unique identifier for the bibliographic source.

Use the `/api/sources` endpoint to retrieve all available source IDs.
(string) **(required)**

* Example: `Farmer-(1937)`

**Query Parameters:**

* `includeArabic` (optional): Return bilingual responses with Arabic script when true. - Type: `string` - Valid values: `true`, `false` - Default: `true`
  * Example: `true`

**Example:**

```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/ajnas?includeArabic=true"
```

**Response:** Ajnas retrieved successfully

***
