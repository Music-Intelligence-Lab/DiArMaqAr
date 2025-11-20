---
title: API Endpoints Reference
description: Complete API endpoint documentation
---

# API Endpoints Reference

Complete documentation for all API endpoints. For quick start, see [API Documentation](./index). For examples, see [Representative Examples](./representative-examples).

---

# Quick Reference
## Base URL

- **Production**: `https://diarmaqar.netlify.app/api`
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
- `filterByFamily` (optional): Filter by maqām family name (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string` - Valid values: `ajam`, `athar_kurd`, `awj_ara`, `bayyat`, `buselik`, ... (16 total)
  - Example: `rast`
- `filterByTonic` (optional): Filter by maqām tonic/first note (URL-safe, case-insensitive, diacritics-insensitive) - Type: `string` - Valid values: `ajam_ushayran`, `chahargah`, `dugah`, `iraq`, `nawa`, `rast`, `segah`, `ushayran`, `yegah`
- `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `tonic`, `alphabetical` - Default: `alphabetical`
  - Example: `tonic` - Sort by tonic note priority (NoteName.ts order)
  - Example: `alphabetical` - Sort alphabetically by display name
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each maqām - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat?includeSources=true&includeArabic=true"
```

**Response:** List of maqāmāt retrieved successfully


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
- Optional includeIntervals data, transposition to different tonics, tuning-system-specific modulations (including lower octave), and suyūr

Parameter Discovery:
- Use options=true to discover valid values for all parameters including dynamically calculated transposition options
- Especially useful for finding valid tuning system starting notes and transposition tonics for a specific maqām

Important:
- When options=true, the endpoint returns parameter discovery metadata instead of maqām data
- This mode is mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, include suyūr, pitch class data type, includeIntervals)
- If data-returning parameters are provided with options=true, the API returns a 400 Bad Request error with details about conflicting parameters

Requirements:
- Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
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
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950g)', 'Meshshaqa-(1899)') - Type: `string`
  - Example: `IbnSina-(1037)` - Ibn Sīnā (1037) - 7-Fret Oud 17-Tone (representative example)
  - Example: `al-Farabi-(950g)` - al-Fārābī (950g) - First Oud Tuning 27-Tone (representative example)
  - Example: `Meshshaqa-(1899)` - Meshshāqa (1899) - Arabic Octave According to the Modernists (representative example)
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  - Different starting notes represent different theoretical frameworks within the same tuning system
  - Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `yegah` - yegāh (for IbnSina, Meshshaqa)
  - Example: `ushayran` - ʿushayrān (for al-Farabi, al-Kindi)
  - Example: `rast` - rāst (for CairoCongress, al-Sabbagh)
- `options` (optional): When true, returns available parameter options instead of maqām data.
  - Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
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
 - Type: `string` - Valid values: `all`, `frequency`, `cents`, `fraction`, `decimalRatio`, ... (13 total)
  - Example: `cents`
- `transposeTo` (optional): Transpose the maqām to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  - To see all valid transposition options, request available parameter options instead of maqām data
 - Type: `string`
  - Example: `nawa`
- `includeIntervals` (optional): Include interval data between maqām degrees - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeModulations` (optional): Include modulation possibilities to other maqāmāt and ajnās - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeModulations8vb` (optional): Include available modulations an octave below - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeSuyur` (optional): Include suyūr (melodic paths) data - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&includeArabic=true"
```

**Response:** Maqām data retrieved successfully.

- When options is true, the response structure differs and returns available parameter options instead of maqām data
- In that case, transposition options contain only valid transposition tonics for this specific maqām, tuning system, and starting note combination



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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_bayyat/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully


### List transpositions for a maqām {#listMaqamTranspositions}

```
GET /maqamat/{idName}/transpositions
```

List all available transposition options for a maqām within a specific tuning system and starting note.

Returns all tonic transpositions that are feasible under the tuning system across all octaves.


**Path Parameters:**
- `idName`: URL-safe maqām identifier (string) **(required)**
  - Example: `maqam_hijaz`

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950g)', 'Meshshaqa-(1899)') - Type: `string`
  - Example: `al-Sabbagh-(1954)`
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `rast`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_hijaz/transpositions?tuningSystem=al-Sabbagh-(1954)&startingNote=rast&includeArabic=true"
```

**Response:** Transpositions retrieved successfully


### Compare maqām data across multiple tuning systems {#compareMaqam}

```
GET /maqamat/{idName}/compare
```

Compare comprehensive maqām data across multiple tuning systems and starting note configurations in a single request.

Returns comprehensive data similar to `/maqamat/{idName}` but without modulations and suyur. Each comparison includes:
- Pitch class data (ascending and descending sequences)
- Optional interval data
- Ajnās (constituent melodic structures) mapping
- Maqām metadata (family classification, tonic, transposition status)
- Context information (tuning system, starting note, reference frequency)

This endpoint is ideal for comparative musicological analysis across different historical tuning systems.


**Path Parameters:**
- `idName`: URL-safe maqām identifier (string) **(required)**
  - Example: `maqam_bayyat`

**Query Parameters:**
- `tuningSystems` **(required)**: Comma-separated tuning system IDs. - Type: `string`
  - Example: `CairoCongressTuningCommittee-(1929),al-Sabbagh-(1954)`
- `startingNote` **(required)**: Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems. - Type: `string`
  - Example: `rast`
- `pitchClassDataType` **(required)**: Output format for pitch class data - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  - Example: `cents`
- `includeIntervals` (optional): Include interval data between pitch classes - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `transposeTo` (optional): Transpose to specific tonic note (applies to all tuning systems) - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/maqam_bayyat/compare?tuningSystems=CairoCongressTuningCommittee-(1929),al-Sabbagh-(1954)&startingNote=rast&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Comparison data retrieved successfully


### Classify maqāmāt by 12-pitch-class sets {#classifyMaqamat12PitchClassSets}

```
GET /maqamat/classification/12-pitch-class-sets
```

Groups maqāmāt according to sets of 12 pitch classes suitable for MIDI keyboard tuning
and Scala file export. Each set is created by merging pitch classes from the specified
tuning system with al-Kindi-(874) filler pitch classes, based on matching IPN reference
note names.

**Critical Design Principles:**
- **Octave Alignment**: Both the maqām tuning system and al-Kindi-(874) use the same
  `startingNote` to ensure octaves align correctly
- **Chromatic Order**: Each set contains exactly 12 pitch classes ordered chromatically
  starting from the maqām's tonic (e.g., C, C#, D, D#... for Rāst)
- **Arabic Musicological Logic**: IPN references respect Arabic maqām theory where
  microtonal modifiers indicate what the pitch is a variant OF, not mathematical proximity
  to 12-EDO semitones
- **Direct Tuning System Values**: All cent values come directly from tuning systems
  without post-processing or calculation

**The Algorithm:**
1. Loads pitch classes from both the specified tuning system and al-Kindi-(874) using
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
- `tuningSystem` (optional): Tuning system ID for maqāmāt (default: CairoCongressTuningCommittee-(1929)) - Type: `string` - Default: `CairoCongressTuningCommittee-(1929)`
  - Example: `CairoCongressTuningCommittee-(1929)`
- `startingNote` (optional): Starting note for both the maqām tuning system and al-Kindi-(874) (default: yegah).
IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
correctly and pitch classes can be properly selected from matching octaves.
  IMPORTANT: Both tuning systems must use the same starting note to ensure octaves align
  correctly and pitch classes can be properly selected from matching octaves. Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string` - Default: `yegah`
  - Example: `yegah`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`
- `includeIncompatible` (optional): Include maqāmāt that cannot form valid 12-pitch-class sets - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
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
  - Example: `false`
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
 - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (14 total)
  - Example: `cents`
- `setId` (optional): Filter by specific set ID to retrieve that set and its compatible maqāmāt (e.g., 'maqam_rast_set') - Type: `string`
  - Example: `maqam_rast_set`
- `maqamId` (optional): Filter by maqām ID to find all sets containing that maqām (e.g., 'maqam_rast') - Type: `string`
  - Example: `maqam_rast`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/classification/12-pitch-class-sets?includeArabic=true"
```

**Response:** Classification results with sets and compatible maqāmāt


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
- **No Chromatic Base**: Does not merge with al-Kindi-(874) or chromatic filler pitch classes
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
- `tuningSystem` (optional): Tuning system ID for all maqāmāt (default: CairoCongressTuningCommittee-(1929)) - Type: `string` - Default: `CairoCongressTuningCommittee-(1929)`
  - Example: `CairoCongressTuningCommittee-(1929)`
- `startingNote` (optional): Starting note for the tuning system (default: yegah). - Type: `string` - Default: `yegah`
  - Example: `yegah`
- `centsTolerance` (optional): Tolerance in cents for pitch class comparison (default: 5) - Type: `number` - Default: `5`
  - Example: `5`
- `includeIncompatible` (optional): Include maqāmāt that cannot form valid maqam-based pitch class sets - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`
- `includePitchClassData` (optional): Include pitch class data in the response (default: false).
  When false: Omits pitch class data, returning only set metadata and compatible maqamat
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `setId` (optional): Filter by specific set ID to retrieve that set and its compatible maqāmāt (e.g., 'maqam_rast_set') - Type: `string`
  - Example: `maqam_rast_set`
- `maqamId` (optional): Filter by maqām ID to find all sets containing that maqām (e.g., 'maqam_rast') - Type: `string`
  - Example: `maqam_rast`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/maqamat/classification/maqam-pitch-class-sets?includeArabic=true"
```

**Response:** Classification results with maqam-based pitch class sets and compatible maqāmāt


---

## Ajnās

Documented tetrachords (melodic fragments) with historical source attribution.

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
- `sortBy` (optional): Sort order for results - Type: `string` - Valid values: `tonic`, `alphabetical` - Default: `alphabetical`
  - Example: `tonic` - Sort by tonic note priority (NoteName.ts order)
  - Example: `alphabetical` - Sort alphabetically by display name
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each jins - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/ajnas?includeSources=true&includeArabic=true"
```

**Response:** List of ajnās retrieved successfully


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
- Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
- These are fundamental to all pitch class calculations


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_rast` - Jins Rāst (representative example - with zalzalian intervals)
  - Example: `jins_kurd` - Jins Kurd (representative example - without zalzalian intervals)
  - Example: `jins_bayyat` - Jins Bayyāt (representative example - with zalzalian intervals)

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950g)', 'Meshshaqa-(1899)') - Type: `string`
  - Example: `IbnSina-(1037)` - Ibn Sīnā (1037) - 7-Fret Oud 17-Tone (representative example)
  - Example: `al-Farabi-(950g)` - al-Fārābī (950g) - First Oud Tuning 27-Tone (representative example)
  - Example: `Meshshaqa-(1899)` - Meshshāqa (1899) - Arabic Octave According to the Modernists (representative example)
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive).
  - Different starting notes represent different theoretical frameworks within the same tuning system
  - Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `yegah` - yegāh (for IbnSina, Meshshaqa)
  - Example: `ushayran` - ʿushayrān (for al-Farabi, al-Kindi)
  - Example: `rast` - rāst (for CairoCongress, al-Sabbagh)
- `options` (optional): When true, returns available parameter options instead of jins data.
  - Tuning system and starting note are required for all requests (both data retrieval and discovery mode)
  - These are fundamental to all pitch class calculations and calculate valid starting note options and transposition tonics
  - Mutually exclusive with data-returning parameters (transpose to, include modulations, include lower octave modulations, pitch class data type, intervals)
  - Transposition options are dynamically calculated based on the specific jins, tuning system, and starting note combination
  - Only tonics where the jins can be validly transposed (preserving interval pattern) are included, not all possible pitch classes
  - If data-returning parameters are provided, returns 400 Bad Request error with details about conflicting parameters
 - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `true`
- `pitchClassDataType` (optional): Specifies which pitch class data type to return for each pitch class.
  - When provided, returns the specified data type for all pitch classes in the jins
  - In discovery mode (when options=true), this parameter is optional since the response returns parameter metadata instead of formatted data
  - Use 'all' for complete pitch class data across all available formats
 - Type: `string` - Valid values: `all`, `frequency`, `cents`, `fraction`, `decimalRatio`, ... (13 total)
  - Example: `cents`
- `transposeTo` (optional): Transpose the jins to a new tonic by preserving the interval patterns (URL-safe, diacritics-insensitive).
  - To see all valid transposition options, request available parameter options instead of jins data
 - Type: `string`
  - Example: `nawa`
- `includeIntervals` (optional): Include interval data between jins degrees - Type: `string` - Valid values: `true`, `false` - Default: `false`
  - Example: `false`
- `includeModulations` (optional): Include modulation possibilities to other ajnās - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeModulations8vb` (optional): Include available modulations an octave below - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast?tuningSystem=IbnSina-(1037)&startingNote=yegah&includeArabic=true"
```

**Response:** Jins data retrieved successfully.

- When options is true, the response structure differs and returns available parameter options instead of jins data
- In that case, transposition options contain only valid transposition tonics for this specific jins, tuning system, and starting note combination



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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_rast/availability?includeArabic=true"
```

**Response:** Availability information retrieved successfully


### List transpositions for a jins {#listJinsTranspositions}

```
GET /ajnas/{idName}/transpositions
```

List all available transposition options for a jins within a specific tuning system and starting note.

Returns all tonic transpositions that are feasible under the tuning system across all octaves.


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_bayyat`

**Query Parameters:**
- `tuningSystem` **(required)**: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950g)', 'Meshshaqa-(1899)') - Type: `string`
  - Example: `Meshshaqa-(1899)`
- `startingNote` **(required)**: Tuning system starting note name (URL-safe, diacritics-insensitive). - Type: `string`
  - Example: `yegah`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_bayyat/transpositions?tuningSystem=Meshshaqa-(1899)&startingNote=yegah&includeArabic=true"
```

**Response:** Transpositions retrieved successfully


### Compare jins data across multiple tuning systems {#compareJins}

```
GET /ajnas/{idName}/compare
```

Compare comprehensive jins data across multiple tuning systems and starting note configurations in a single request.

Returns comprehensive data similar to `/ajnas/{idName}` but without modulations. Each comparison includes:
- Pitch class data (single sequence, as ajnās are unidirectional)
- Optional interval data
- Jins metadata (tonic, transposition status)
- Context information (tuning system, starting note, reference frequency)

This endpoint is ideal for comparative musicological analysis of melodic structures across different historical tuning systems.


**Path Parameters:**
- `idName`: URL-safe jins identifier (string) **(required)**
  - Example: `jins_segah`

**Query Parameters:**
- `tuningSystems` **(required)**: Comma-separated tuning system IDs. - Type: `string`
  - Example: `al-Farabi-(950g),Meshshaqa-(1899)`
- `startingNote` **(required)**: Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems. - Type: `string`
  - Example: `ushayran`
- `pitchClassDataType` **(required)**: Output format for pitch class data - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  - Example: `cents`
- `includeIntervals` (optional): Include interval data between pitch classes - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `transposeTo` (optional): Transpose to specific tonic note (applies to all tuning systems) - Type: `string`
  - Example: `nawa`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/ajnas/jins_segah/compare?tuningSystems=al-Farabi-(950g),Meshshaqa-(1899)&startingNote=ushayran&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Comparison data retrieved successfully


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
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for each tuning system - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems?includeSources=true&includeArabic=true"
```

**Response:** List of tuning systems


### Get Tuning System Details {#getTuningSystemPitchClasses}

```
GET /tuning-systems/{id}/{startingNote}/pitch-classes
```

Get Tuning System Details - Returns all pitch classes for a specific tuning system and starting note.

This endpoint is essential for tuning system operations, providing comprehensive pitch class data
across all octaves with full formatting options.


**Path Parameters:**
- `id`: Tuning system identifier (string) **(required)**
  - Example: `CairoCongressTuningCommittee-(1929)`
- `startingNote`: Tuning system starting note name (URL-safe, diacritics-insensitive). Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh (string) **(required)**
  - Example: `rast`

**Query Parameters:**
- `pitchClassDataType` **(required)**: Pitch class data format (defaults to "cents") - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total)
  - Example: `cents`
- `octave` (optional): Filter by octave number.
  Use a specific octave number (0, 1, 2, 3) to filter to that octave only.
 - Type: `string` - Valid values: `all`, `0`, `1`, `2`, `3`
  - Example: `all`
- `includeSources` (optional): Include bibliographic source references (sourceId and page) for the tuning system - Type: `string` - Valid values: `true`, `false`
  - Example: `true`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/CairoCongressTuningCommittee-(1929)/rast/pitch-classes?pitchClassDataType=cents&includeSources=true&includeArabic=true"
```

**Response:** Tuning system pitch classes retrieved successfully


### List maqāmāt available in a tuning system {#listTuningSystemMaqamat}

```
GET /tuning-systems/{id}/{startingNote}/maqamat
```

Return all maqāmāt that can be realized in a given tuning system beginning on a specific starting note name.

- Feasibility is determined by comparing maqām pitch classes to the tuning system's note name sets (including adjacent octave context)


**Path Parameters:**
- `id`: Tuning system identifier (e.g., 'IbnSina-(1037)', 'al-Farabi-(950g)', 'Meshshaqa-(1899)') (string) **(required)**
  - Example: `al-Farabi-(950g)`
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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/tuning-systems/al-Farabi-(950g)/ushayran/maqamat?includeArabic=true"
```

**Response:** Maqāmāt list retrieved successfully


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
  - Example: `Meshshaqa-(1899)`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names?includeArabic=true"
```

**Response:** List of note names retrieved successfully


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
  - Example: `CairoCongressTuningCommittee-(1929)`
- `startingNote` (optional): Starting note for the tuning system.
  - Use "all" to include all available starting notes for that tuning system (returns array of results, one per starting note) Note: Since note names are unique per octave, the note name itself identifies the octave. No octave parameter is needed. Use `yegah` for IbnSina/Meshshaqa, `ushayran` for al-Farabi/al-Kindi, `rast` for CairoCongress/al-Sabbagh
 - Type: `string`
  - Example: `rast`
- `pitchClassDataType` **(required)**: Pitch class data format - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total) - Default: `cents`
  - Example: `cents`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast?pitchClassDataType=cents&includeArabic=true"
```

**Response:** Pitch class data retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast/availability?includeArabic=true"
```

**Response:** Availability data retrieved successfully


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
- `tuningSystems` **(required)**: Comma-separated tuning system IDs - Type: `string`
  - Example: `Meshshaqa-(1899),CairoCongressTuningCommittee-(1929)`
- `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  - Example: `yegah`
- `pitchClassDataType` **(required)**: Pitch class data format - Type: `string` - Valid values: `all`, `englishName`, `fraction`, `cents`, `decimalRatio`, ... (13 total) - Default: `cents`
  - Example: `cents`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/pitch-classes/note-names/rast/compare?tuningSystems=Meshshaqa-(1899),CairoCongressTuningCommittee-(1929)&startingNote=yegah&pitchClassDataType=cents&includeArabic=true"
```

**Response:** Comparison data retrieved successfully


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
  - Example: `al-Sabbagh-(1954)`
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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/intervals?noteNames=rast,dugah,segah&includeArabic=true"
```

**Response:** Interval calculations retrieved successfully


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
- `tuningSystems` **(required)**: Comma-separated tuning system IDs - Type: `string`
  - Example: `al-Farabi-(950g),CairoCongressTuningCommittee-(1929)`
- `startingNote` **(required)**: Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. - Type: `string`
  - Example: `ushayran`
- `includeArabic` (optional): Return bilingual responses with Arabic script when true.
  - All English/transliteration fields remain unchanged
  - Arabic versions are added with "Ar" suffix (e.g., displayNameAr, noteNameDisplayAr)
  - Note names, maqām names, and jins names get Arabic versions in *Ar fields
  - Comments get Arabic versions in commentsAr if available
  - Tuning system display names get Arabic versions in displayNameAr if available
  - Source metadata gets Arabic versions in *Ar fields (titleAr, firstNameAr, etc.)
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/intervals/compare?noteNames=rast,dugah,segah&tuningSystems=al-Farabi-(950g),CairoCongressTuningCommittee-(1929)&startingNote=ushayran&includeArabic=true"
```

**Response:** Comparison data retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false` - Default: `true`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/sources?includeArabic=true"
```

**Response:** List of sources retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)?includeArabic=true"
```

**Response:** Source retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/tuning-systems?includeArabic=true"
```

**Response:** Tuning systems retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/maqamat?includeArabic=true"
```

**Response:** Maqamat retrieved successfully


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
 - Type: `string` - Valid values: `true`, `false`
  - Example: `true`

**Example:**
```bash
curl "https://diarmaqar.netlify.app/api/sources/Farmer-(1937)/ajnas?includeArabic=true"
```

**Response:** Ajnas retrieved successfully


---

