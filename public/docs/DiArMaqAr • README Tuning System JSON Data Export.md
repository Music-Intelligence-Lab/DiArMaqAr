# Digital Arabic Maqām Archive (DiArMaqAr)

## README • Tuning System Export Data Format

##  Overview

This document describes the structure and contents of comprehensive tuning system export files from the Maqām Network.

These JSON exports contain complete musical data for a specific historical tuning system, including all available maqāmāt, ajnās, their transpositions, and modulation relationships.

## File Structure

### Export Tree Diagram

```
tuning-system-export.json
├── exportInfo
│   └── timestamp
├── tuningSystemData
│   ├── id
│   ├── titleEnglish
│   ├── titleArabic
│   ├── year
│   ├── sourceEnglish
│   ├── sourceArabic
│   ├── sourcePageReferences []
│   ├── creatorEnglish
│   ├── creatorArabic
│   ├── commentsEnglish
│   ├── commentsArabic
│   ├── startingNote
│   ├── originalPitchClassValues []
│   ├── originalPitchClassNoteNames [[]]
│   └── abjadNames []
├── tuningSystemPitchClasses []
├── summaryStats
│   ├── totalAjnasInDatabase
│   ├── totalMaqamatInDatabase
│   ├── tuningPitchClassesInSingleOctave
│   ├── tuningPitchClassesInAllOctaves
│   ├── ajnasAvailableInTuning
│   ├── maqamatAvailableInTuning
│   ├── totalAjnasTranspositions
│   ├── totalMaqamatTranspositions
│   ├── totalMaqamModulations
│   └── totalAjnasModulations
├── pitchClassReference
│   ├── qarar_yegah {}
│   ├── ... (all pitch classes across 4 octaves)
│   └── jawab_jawab_hijaz {}
├── allAjnasData
│   ├── jins_rast_(mutlaq)_al-nawa
│   │   ├── jinsId
│   │   ├── name
│   │   ├── jinsPitchClasses []
│   │   ├── jinsPitchClassIntervals []
│   │   ├── transposition
│   │   ├── commentsEnglish
│   │   ├── commentsArabic
│   │   └── SourcePageReferences []
│   └── ... (additional ajnās following same structure)
└── allMaqamatData
├── maqam_rast_(binsir)_al-rast
│   ├── maqamId
│   ├── name
│   ├── ascendingPitchClasses []
│   ├── descendingPitchClasses []
│   ├── ascendingPitchClassIntervals []
│   ├── descendingPitchClassIntervals []
│   ├── ascendingMaqamAjnas {}
│   ├── descendingMaqamAjnas {}
│   ├── transposition
│   ├── commentsEnglish
│   ├── commentsArabic
│   ├── SourcePageReferences []
│   ├── maqamatModulations
│   │   ├── modulationDegreesNoteNames {}
│   │   ├── modulationsLowerOctaveDegreesNoteNames {}
│   │   ├── modulations {}
│   │   └── modulationsLowerOctave {}
│   └── ajnasModulations
│       ├── modulationDegreesNoteNames {}
│       ├── modulationsLowerOctaveDegreesNoteNames {}
│       ├── modulations {}
│       └── modulationsLowerOctave {}
└── ... (additional maqāmāt following same structure)
```

### **Legend:** 

\- {} \= Object containing multiple properties 

\- \[\] \= Array of values 

\- \[\[\]\] \= Array of arrays 

\- No symbol \= Single value (string, number, boolean)

### Export Metadata

```json
{
"exportInfo": {
"timestamp": "2025-09-17T13:16:33.149Z"
}
}
```

### Tuning System Information

```json
{
"tuningSystemData": {
"id": "IbnSīnā-(1037)", // Property: Unique identifier for the tuning system
"titleEnglish": "7-Fret Oud 17-Tone", // Property: English title/description
"titleArabic": "7 نغمات 17 دستان على العود", // Property: Arabic title/description
"year": "1037", // Property: Historical year of origin
"sourceEnglish": "", // Property: Primary source title in English
"sourceArabic": "", // Property: Primary source title in Arabic
"sourcePageReferences": [], // Property: Array of page references from the primary source
"creatorEnglish": "Ibn Sīnā ", // Property: Creator name in English
"creatorArabic": "إبن سينا", // Property: Creator name in Arabic
"commentsEnglish": "Historical context and references", // Property: Additional context in English
"commentsArabic": "", // Property: Additional context in Arabic
"startingNote": "ʿūshayrān", // Property: Reference pitch class note name for this tuning system
"originalPitchClassValues": [ // Property: Array of pitch class values (as fractions or decimals) defining the tuning system, as per bibliographic source
"1/1", "273/256", "13/12", "9/8", "32/27", "39/32",
"81/64", "4/3", "91/64", "13/9", "3/2", "128/81",
"13/8", "27/16", "16/9", "91/48", "52/27"
],
"originalPitchClassNoteNames": [ // Property: Array of arab-ottoman-persian note names assigned to the originalPitchClassValues, as per bibliographic source
"ʿūshayrān", "ʿājam ʿūshayrān", "ʿīrāq", "kawasht", "rāst", etc...
],
"abjadNames": [ // Property: Array of traditional abjad notation assigned to the originalPitchClassValues (may be empty if not used in this tuning system)
"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
],
"stringLength": 1000, // Property: Reference string length for fret division calculations
"referenceFrequencies": { // Property: Reference frequencies (Hz) for specific note names, as per bibliographic source
"yegāh": 195.998, // Property: Reference frequency for yegāh in Hz
"ʿushayrān": 220   // Property: Reference frequency for ʿushayrān in Hz
},
"defaultReferenceFrequency": 195.998, // Property: Default reference frequency (Hz) if referenceFrequencies are not defined
"saved": true // Property: Database save status flag
}
}
```

### Tuning System Pitch Classes

```json
{
"tuningSystemPitchClasses": [ // Property: Array of all available pitch class names in this tuning system across all octaves
"qarar_ushayran", // Property: Pitch class name usable as key in pitchClassReference
"qarar_ajam_ushayran", // Property: Pitch class name usable as key in pitchClassReference
"qarar_iraq", // Property: Pitch class name usable as key in pitchClassReference
// ... (continues for all pitch classes across 4 octaves)
"jawab_jawab_tik_hisar" // Property: Pitch class name usable as key in pitchClassReference
]
}
```

### Summary Statistics

```json
{
"summaryStats": {
"totalAjnasInDatabase": 32, // Property: Total count of ajnās in the core database
"totalMaqamatInDatabase": 60, // Property: Total count of maqāmāt in the core database
"tuningPitchClassesInSingleOctave": 17, // Property: Number of distinct pitch classes in one octave of this tuning
"tuningPitchClassesInAllOctaves": 68, // Property: Total pitch classes across all four octaves
"ajnasAvailableInTuning": 25, // Property: Count of ajnās that can be realized in this tuning system
"maqamatAvailableInTuning": 39, // Property: Count of maqāmāt that can be realized in this tuning system
"totalAjnasTranspositions": 244, // Property: Total count of all ajnās transpositions across all starting notes
"totalMaqamatTranspositions": 198, // Property: Total count of all maqāmāt transpositions across all starting notes
"totalMaqamModulations": 4799, // Property: Total count of all possible maqām-to-maqām modulations
"totalAjnasModulations": 5490 // Property: Total count of all possible ajnās-to-ajnās modulations
}
}
```

## Pitch Class Reference

The pitchClassReference section contains detailed information for each pitch class across all octaves. Whereever a pitch class is referenced in the export, you can retrieve it's data from this section:

```json
{
"pitchClassReference": {
"ushayran": { // Reference Key: Arab-ottoman-persian note name without diacritics or spaces
"noteName": "ʿūshayrān", // Property: Arab-ottoman-persian note name to be used for display (includes diacritics and spaces)
"englishName": "A", // Property: English note name equivalent
"fraction": "1/1", // Property: Frequency ratio as fraction relative to the fundamental reference pitch class (0 cents or 1/1 frequency ratio)
"cents": "0", // Property: Cents value relative to the fundamental reference pitch class (0 cents or 1/1 frequency ratio)
"decimalRatio": "1", // Property: Frequency ratio as decimal relative to the fundamental reference pitch class (0 cents or 1/1 frequency ratio)
"stringLength": "1000", // Property: String length relative to tuning system string length
"frequency": "110", // Property: Frequency in Hz based on reference frequency of starting note
"originalValue": "1/1", // Property: Original input value from tuning system definition as per bibliographic source
"originalValueType": "fraction", // Property: Format type of original input value as per bibliographic source
"index": 0, // Property: Sequential position in tuning system (0-based)
"octave": 1, // Property: Octave number (0=qarār, 1=normal, 2=jawāb, 3=jawāb jawāb)
"abjadName": "", // Property: Arabic abjad delineation (if applicable)
"fretDivision": "0", // Property: Fret position calculation relative to stringLength
"midiNoteNumber": 57, // Property: MIDI note number with decimal precision for unequal divisions
"centsDeviation": 0, // Property: Deviation in cents from closest 12-tone equal temperament note specified in referenceNoteName
"referenceNoteName": "A" // Property: Closest Western note name in 12-tone equal temperament (12-TET) for reference
}
}
}
```

## Ajnās Data

The allAjnasData section contains all ajnās available in the tuning system. Whereever a jins is referenced in the export, you can retrieve it's data from this section:

```json
{
"allAjnasData": {
"jins_bayyat_al-dugah": { // Object Key: Unique identifier for this jins transposition
"jinsId": "2", // Property: Core database jins ID linking to the original jins definition
"name": "jins bayyāt al-dūgāh", // Property: Full display name including the jins's starting note name (its tonic/root/qarār)
"jinsPitchClasses": ["dugah", "segah", "chahargah", "nawa"], // Property: Array of pitch class names in ascending order, used as keys to reference pitchClassReference objects
"jinsPitchClassIntervals": [ // Property: Array of interval objects between consecutive pitches
{
"fraction": "13/12", // Property: Interval value as frequency ratio
"cents": 138.57266090392324, // Property: Interval value in cents
"decimalRatio": 1.0833333333333333, // Property: Interval value as decimal ratio
"originalValue": "13/12", // Property: Interval value calculated from the original tuning system definition
"originalValueType": "fraction" // Property: Format type of original input value (e.g., "fraction", "decimal", "cents")
}
],
"transposition": false, // Property: Boolean indicating if this is base form (false) or transposed (true)
"commentsEnglish": "", // Property: Additional context in English
"commentsArabic": "", // Property: Additional context in Arabic
"SourcePageReferences": [] // Property: Array of academic source citations
}
}
}
```

## Maqāmāt Data

The allMaqamatData section contains complete maqām information. Whereever a maqām is referenced in the export, you can retrieve it's data from this section:

```json
{
"allMaqamatData": {
"maqam_rast": { // Object Key: Unique identifier for this maqām transposition
"maqamId": "1", // Property: Core database maqām ID linking to the original maqām definition
"name": "maqām rāst", // Property: Full display name with starting note
"ascendingPitchClasses": ["rast", "dugah", "segah", "chahargah", "nawa", "husayni", "awj"], // Property: Array of pitch class names for ascending melodic motion
"descendingPitchClasses": ["ajam", "husayni", "nawa", "chahargah", "segah", "dugah", "rast"], // Property: Array of pitch class names for descending melodic motion
"ascendingPitchClassIntervals": [...], // Property: Array of interval objects for ascending motion
"descendingPitchClassIntervals": [...], // Property: Array of interval objects for descending motion
"ascendingMaqamAjnas": { // Property: Object mapping pitch class names to jins references for ascending motion
"rāst": "jins_rast", // Property: Reference to jins used on this pitch class
"dūgāh": "jins_bayyat_al-dugah", // Property: Reference to jins used on this pitch class
"segāh": null, // Property: No jins assigned to this pitch class
"chahārgāh": null, // Property: No jins assigned to this pitch class
"nawā": "jins_rast_al-nawa", // Property: Reference to jins used on this pitch class
"ḥusaynī": null, // Property: No jins assigned to this pitch class
"awj": null // Property: No jins assigned to this pitch class
},
"descendingMaqamAjnas": {...}, // Property: Object mapping pitch class names to jins references for descending motion
"transposition": false, // Property: Boolean indicating if this is base form (false) or transposed (true)
"commentsEnglish": "", // Property: Additional context in English
"commentsArabic": "", // Property: Additional context in Arabic
"SourcePageReferences": [], // Property: Array of academic source citations  
`"maqamatModulations": { // Property: Object containing all possible maqām modulations from this maqām`
`"modulationDegreesNoteNames": { // Property: Object mapping modulation categories to their note names`
`"modulationsOnFirstDegree": "rast", // Property: Note name for first degree modulations`
`"modulationsOnThirdDegree": "segah", // Property: Note name for third degree modulations`
`"modulationsOnAltThirdDegree": "kurdi", // Property: Note name for alternative third degree modulations`
`"modulationsOnFourthDegree": "chahargah", // Property: Note name for fourth degree modulations`
`"modulationsOnFifthDegree": "nawa", // Property: Note name for fifth degree modulations`
`"modulationsOnSixthDegreeAsc": "husayni", // Property: Note name for sixth degree ascending modulations`
`"modulationsOnSixthDegreeDesc": "husayni", // Property: Note name for sixth degree descending modulations`
`"modulationsOnSixthDegreeIfNoThird": "husayni" // Property: Note name for sixth degree modulations when no third`
`},`
`"modulationsLowerOctaveDegreesNoteNames": { // Property: Object mapping 8vb modulation categories to their note names`
`"modulationsOnFirstDegree8vb": "qarar_rast", // Property: Note name for first degree 8vb modulations`
`"modulationsOnThirdDegree8vb": "qarar_segah", // Property: Note name for third degree 8vb modulations`
`"modulationsOnAltThirdDegree8vb": "qarar_kurdi", // Property: Note name for alternative third degree 8vb modulations`
`"modulationsOnFourthDegree8vb": "qarar_chahargah", // Property: Note name for fourth degree 8vb modulations`
`"modulationsOnFifthDegree8vb": "yegah", // Property: Note name for fifth degree 8vb modulations`
`"modulationsOnSixthDegreeAsc8vb": "ushayran", // Property: Note name for sixth degree ascending 8vb modulations`
`"modulationsOnSixthDegreeDesc8vb": "ushayran", // Property: Note name for sixth degree descending 8vb modulations`
`"modulationsOnSixthDegreeIfNoThird8vb": "ushayran" // Property: Note name for sixth degree 8vb modulations when no third`
`},`
`"modulations": { // Property: Object containing arrays of maqām references for each modulation category`
`"modulationsOnFirstDegree": ["maqam_hijaz_kar_kurd", "maqam_nikriz", ...], // Property: Array of maqām references for modulations from first degree`
`"modulationsOnThirdDegree": ["maqam_segah", "maqam_huzam", ...], // Property: Array of maqām references for modulations from third degree`
`"modulationsOnAltThirdDegree": [...], // Property: Array of maqām references for modulations from alternative third degree`
`"modulationsOnFourthDegree": [...], // Property: Array of maqām references for modulations from fourth degree`
`"modulationsOnFifthDegree": [...], // Property: Array of maqām references for modulations from fifth degree`
`"modulationsOnSixthDegreeAsc": [...], // Property: Array of maqām references for modulations from sixth degree ascending`
`"modulationsOnSixthDegreeDesc": [...], // Property: Array of maqām references for modulations from sixth degree descending`
`"modulationsOnSixthDegreeIfNoThird": [...], // Property: Array of maqām references for modulations from sixth degree without third`
`"noteName2pBelowThird": "kurdī" // Property: Alternative note name below third degree (if applicable)`
`},`
`"modulationsLowerOctave": { // Property: Object containing arrays of maqām references for each 8vb modulation category`
`"modulationsOnFirstDegree8vb": ["maqam_hijaz_kar_kurd_al-qarar_rast", ...], // Property: Array of maqām references for 8vb modulations from first degree`
`"modulationsOnThirdDegree8vb": [...], // Property: Array of maqām references for 8vb modulations from third degree`
`"modulationsOnAltThirdDegree8vb": [...], // Property: Array of maqām references for 8vb modulations from alternative third degree`
`"modulationsOnFourthDegree8vb": [...], // Property: Array of maqām references for 8vb modulations from fourth degree`
`"modulationsOnFifthDegree8vb": [...], // Property: Array of maqām references for 8vb modulations from fifth degree`
`"modulationsOnSixthDegreeAsc8vb": [...], // Property: Array of maqām references for 8vb modulations from sixth degree ascending`
`"modulationsOnSixthDegreeDesc8vb": [...], // Property: Array of maqām references for 8vb modulations from sixth degree descending`
`"modulationsOnSixthDegreeIfNoThird8vb": [...], // Property: Array of maqām references for 8vb modulations from sixth degree without third`
`"noteName2pBelowThird8vb": "kurdī" // Property: Alternative note name below third degree for 8vb modulations (if applicable)`
`}`
`},`

`"ajnasModulations": { // Property: Object containing all possible jins modulations from this maqām`
`"modulationDegreesNoteNames": { // Property: Object mapping modulation categories to their note names`
`"modulationsOnFirstDegree": "rast", // Property: Note name for first degree modulations`
`"modulationsOnThirdDegree": "segah", // Property: Note name for third degree modulations`
`"modulationsOnAltThirdDegree": "kurdi", // Property: Note name for alternative third degree modulations`
`"modulationsOnFourthDegree": "chahargah", // Property: Note name for fourth degree modulations`
`"modulationsOnFifthDegree": "nawa", // Property: Note name for fifth degree modulations`
`"modulationsOnSixthDegreeAsc": "husayni", // Property: Note name for sixth degree ascending modulations`
`"modulationsOnSixthDegreeDesc": "husayni", // Property: Note name for sixth degree descending modulations`
`"modulationsOnSixthDegreeIfNoThird": "husayni" // Property: Note name for sixth degree modulations when no third`
`},`
`"modulationsLowerOctaveDegreesNoteNames": { // Property: Object mapping 8vb modulation categories to their note names`
`"modulationsOnFirstDegree8vb": "qarar_rast", // Property: Note name for first degree 8vb modulations`
`"modulationsOnThirdDegree8vb": "qarar_segah", // Property: Note name for third degree 8vb modulations`
`"modulationsOnAltThirdDegree8vb": "qarar_kurdi", // Property: Note name for alternative third degree 8vb modulations`
`"modulationsOnFourthDegree8vb": "qarar_chahargah", // Property: Note name for fourth degree 8vb modulations`
`"modulationsOnFifthDegree8vb": "yegah", // Property: Note name for fifth degree 8vb modulations`
`"modulationsOnSixthDegreeAsc8vb": "ushayran", // Property: Note name for sixth degree ascending 8vb modulations`
`"modulationsOnSixthDegreeDesc8vb": "ushayran", // Property: Note name for sixth degree descending 8vb modulations`
`"modulationsOnSixthDegreeIfNoThird8vb": "ushayran" // Property: Note name for sixth degree 8vb modulations when no third`
`},`
`"modulations": { // Property: Object containing arrays of jins references for each modulation category`
`"modulationsOnFirstDegree": ["jins_hijaz", "jins_nikriz", ...], // Property: Array of jins references for modulations from first degree`
`"modulationsOnThirdDegree": ["jins_segah", "jins_huzam", ...], // Property: Array of jins references for modulations from third degree`
`"modulationsOnAltThirdDegree": [...], // Property: Array of jins references for modulations from alternative third degree`
`"modulationsOnFourthDegree": [...], // Property: Array of jins references for modulations from fourth degree`
`"modulationsOnFifthDegree": [...], // Property: Array of jins references for modulations from fifth degree`
`"modulationsOnSixthDegreeAsc": [...], // Property: Array of jins references for modulations from sixth degree ascending`
`"modulationsOnSixthDegreeDesc": [...], // Property: Array of jins references for modulations from sixth degree descending`
`"modulationsOnSixthDegreeIfNoThird": [...], // Property: Array of jins references for modulations from sixth degree without third`
`"noteName2pBelowThird": "kurdī" // Property: Alternative note name below third degree (if applicable)`
`},`
`"modulationsLowerOctave": { // Property: Object containing arrays of jins references for each 8vb modulation category`
`"modulationsOnFirstDegree8vb": ["jins_hijaz_al-qarar_rast", ...], // Property: Array of jins references for 8vb modulations from first degree`
`"modulationsOnThirdDegree8vb": [...], // Property: Array of jins references for 8vb modulations from third degree`
`"modulationsOnAltThirdDegree8vb": [...], // Property: Array of jins references for 8vb modulations from alternative third degree`
`"modulationsOnFourthDegree8vb": [...], // Property: Array of jins references for 8vb modulations from fourth degree`
`"modulationsOnFifthDegree8vb": [...], // Property: Array of jins references for 8vb modulations from fifth degree`
`"modulationsOnSixthDegreeAsc8vb": [...], // Property: Array of jins references for 8vb modulations from sixth degree ascending`
`"modulationsOnSixthDegreeDesc8vb": [...], // Property: Array of jins references for 8vb modulations from sixth degree descending`
`"modulationsOnSixthDegreeIfNoThird8vb": [...], // Property: Array of jins references for 8vb modulations from sixth degree without third`
`"noteName2pBelowThird8vb": "kurdī" // Property: Alternative note name below third degree for 8vb modulations (if applicable)`
`}`
},

}
}
}
```

## JSON Structure Elements

Understanding the different types of elements in the export format:

### Keys vs Objects vs References

#### *Object Keys*

These are string identifiers that serve as keys in JSON objects:

```json
{
"allMaqamatData": { // Main Section: Collection of all maqām data
"maqam_rast": {  // ← Object Key: Identifies this specific maqām
"maqamId": "1",                 // ← Property: Links to core database
"name": "maqām rāst" // ← Property: Display name
}
}
}
```

#### *Reference Values*

String values that point to other objects in the data structure:

```json
{
"ascendingMaqamAjnas": { // Property: Maps degrees to jins references
"rāst": "jins_rast",    // ← Reference Value: Points to allAjnasData object
"dūgāh": "jins_bayyat_al-dugah"         // ← Reference Value: Points to allAjnasData object
}
}
```

#### *Data Objects*

Complete objects containing structured information:

```json
{
"ushayran": {               // ← Object Key: Identifies this pitch class
"noteName": "ʿūshayrān",   // ← Property: Display name
"englishName": "A",          // ← Property: Western equivalent
"fraction": "1/1",           // ← Property: Mathematical ratio
"cents": "0"             // ← Property: Logarithmic measurement
// ... more properties
}
}
```

#### *Arrays*

Ordered lists of elements:

```json
{
"ascendingPitchClasses": ["rast", "dugah", "segah"],  // ← Array: Ordered sequence of pitch class names
"modulationsOnFirstDegree": [                                 // ← Array: List of references to other maqāmāt
"maqam_nahawand",        // ← Reference Value: Points to allMaqamatData object
"maqam_hijaz"                 // ← Reference Value: Points to allMaqamatData object
]
}
```

## Data Navigation

### Finding Specific Content

1. **Browse by type**: Use allAjnasData to access all ajnās and allMaqamatData for all maqāmāt. Each entry is keyed by a unique identifier and contains detailed properties and references.

2. **Check availability**: Refer to the summaryStats section for the total number of ajnās and maqāmāt in the database, as well as how many are available in the current tuning system. This helps determine the scope of musical material supported by the export.

3. **Explore relationships**: Use modulation arrays (such as modulationsOnOne, modulationsOnThree, etc.) within each maqām or jins object to find all possible modulations and related structures. These arrays provide references to other maqāmāt or ajnās that can be reached from specific degrees.

4. **Access pitch details**: Reference the pitchClassReference section for comprehensive information about each pitch class, including note names, frequency ratios, cents, decimal values, abjad notation, and more. Use the pitch class names found in ajnās and maqāmāt arrays as keys to look up their detailed definitions here.

5. **Trace structure composition**: For each maqām, examine the ascendingMaqamAjnas and descendingMaqamAjnas objects to see which ajnās are used on each degree in both directions. This reveals the internal structure and building blocks of each maqām.

6. **Locate bibliographic context**: Use the SourcePageReferences arrays in ajnās and maqāmāt objects to find academic or historical sources for each structure, supporting further research or verification.

### Working with Transpositions

* All structures marked with "transposition": true are transposed forms derived from a base (untransposed) structure. These represent the same pattern starting on different notes.

* Base forms have "transposition": false and serve as the canonical version of each jins or maqām.

* Modulation arrays within maqāmāt and ajnās may include both base forms and transpositions, reflecting all possible pathways in the system.

* To analyze all possible realizations of a jins or maqām, enumerate both the base form and all its transpositions as listed in the export.

* When comparing structures across tuning systems, always check the transposition property to distinguish between original and derived forms.