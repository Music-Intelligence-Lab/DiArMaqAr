# Musicological Definitions

**Terminology definitions grounded in Arabic maqām theory with clarifications on differences from Anglo-European concepts**

***

## Purpose

This document defines key musicological terms as they are used within the Digital Arabic Maqām Archive, grounded in Arabic maqām theory’s own internal logic. Each definition clarifies how the concept differs from Anglo-European music theory to prevent misunderstandings and Anglo-European-centric assumptions.

***

## Core Definitions

### Tuning System (Tanghīm, pl. Tanāghīm)

**Arabic maqām theory**: An ordered sequence of pitch classes within the range of a musical octave. A tuning system can have any number of pitch classes, with any size of musical interval between them. The intervals between pitch classes are defined using various mathematical representations (ratios, cents, string lengths) that reflect different theoretical traditions and measurement methods.

**Key characteristics:**
- Number of pitch classes varies (e.g., 13, 17, 22, 27 pitch classes)
- Intervals are **unequal** (not uniform divisions)
- Mathematical precision using ratios, cents, or string lengths
- Historical systems reflect different theoretical frameworks (al-Kindī, al-Fārābī, Ibn Sīnā, etc.)

**Anglo-European difference**: Anglo-European music theory typically assumes 12-tone equal temperament (12-EDO) as the default tuning system, where the octave is divided into 12 equal semitones. Arabic tuning systems do not default to equal divisions and represent independent theoretical frameworks, not "alternatives" to 12-EDO.

**⚠️ CRITICAL: Never Call Tuning Systems "Scales"**

Tuning systems (tanāghīm) are **NOT scales**. The term "scale" is an Anglo-European concept that implies a specific theoretical framework (typically a 7-note or 12-note ordered collection within equal temperament). Calling a tuning system a "scale" imposes Anglo-European categorical assumptions and erases the independent theoretical logic of Arabic maqām theory.

- ❌ **Never**: "This tuning system is a 17-note scale"
- ❌ **Never**: "The scale contains 22 pitch classes"
- ❌ **Never**: "Export the scale to Scala format"
- ✅ **Correct**: "This tuning system contains 17 pitch classes"
- ✅ **Correct**: "The tuning system has 22 pitch classes"
- ✅ **Correct**: "Export the tuning system to Scala format"

***

### Pitch Class (Naghma)

**Arabic maqām theory**: A specific pitch within a tuning system, defined by its interval representation. Each pitch class has:
- An interval representation (ratio, cents, or string length)—the defining property
- An Arabic note name (e.g., rāst, dūgāh, sīkāh)
- An International Pitch Notation equivalent (for cross-reference only)

**Key characteristics:**
- Defined by mathematical interval relationships
- Named according to Arabic theoretical tradition
- Independent of Anglo-European staff notation
- Can represent intervals that don’t exist in 12-EDO

**Anglo-European difference**: In Anglo-European theory, “pitch class” typically refers to one of 12 equivalence classes in equal temperament (C, C#, D, etc.), with all octave transpositions considered identical. Arabic pitch classes are mathematically defined independently of 12-EDO and may not correspond to any 12-EDO pitch.

***

### Taṣwīr (Transposition)

**Arabic maqām theory**: The process or operation of moving a collection of pitch classes up or down so they start on a different pitch class while maintaining the intervallic relationships between them. Transposition is considered **valid** when the interval pattern of the original group of pitch classes can be exactly matched starting from a new pitch class within the selected tuning system. For instance, if Jins Kurd (intervals 1/1 - 9/8 - 3/2) begins on rāst in a given tuning system, a valid transposition would move it to start on dūgāh only if the tuning system contains the exact interval pattern starting from dūgāh’s position.

**Key characteristics:**
- Tuning-system-dependent: Validity depends on which pitch classes exist in the specific tuning system
- Pattern matching mode determined by the interval representation type:
  - Fraction/decimal ratio sources: Exact fraction equality matching
  - String length/cents sources: Cents-based matching with tolerance (default ±5 cents)
- Not always possible: Certain ajnās or maqāmāt cannot be transposed to every other starting pitch class in a given tuning system
- Preserves intervallic relationships: The mathematical intervals between consecutive pitch classes must remain consistent

**Anglo-European difference**: Anglo-European theory typically assumes 12-EDO, allowing any melody to be transposed to any of the 12 starting pitches. Intervals are “constant” as they use fixed 12-EDO semitone units. Arabic maqām theory makes transposition validity contextual—a jins or maqām may be transposable to some starting notes but not others, depending on the existence of the required interval pattern within the tuning system.

***

### Jins (pl. Ajnās)

**Arabic maqām theory**: Jins is a unique sequence of 3, 4, or 5 notes (trichord, tetrachord, or pentachord), each defined by its characteristic interval pattern. The plural, ajnās, refers to multiple jins. Ajnās are the foundational building blocks of maqāmāt, and each has:
- A characteristic interval pattern that defines its identity
- A defined starting note for its canonical base form (darajat al-istiqrār [stabilizing degree]/al-rukūz [resting point])
- Transpositional variants (taṣwīr) to different starting notes, when valid
- Specific melodic character and theoretical function

**Key characteristics:**
- Abstract definition using Arabic theoretical note names (rāst, dūgāh, sīkāh)
- Tuning-system-independent: The abstract pattern can be realized in different tuning systems
- Variable transposability depending on the tuning system
- Combined to construct maqāmāt

**Anglo-European difference**: Anglo-European theory uses “tetrachord” or “trichord” concepts, generally within diatonic scales and equal temperament. Ajnās are not “tetrachords with microtones”—they are independent melodic structures, with interval content defined by specific Arabic tuning systems, not by deviation from Anglo-European intervals.

***

### Maqām (pl. Maqāmāt)

**Arabic maqām theory**: Maqām is a complete modal framework built from:
- An ordered sequence of pitch classes (typically 7–13+ notes)
- Ascending (ṣuʿūd) and descending (hubūṭ) sequences, which may differ
- Positioning of multiple ajnās at specific maqām degrees
- Melodic development pathways (suyūr)
- Unique theoretical and aesthetic properties

**Key characteristics:**
- Asymmetric melodic paths: Ascending and descending sequences may differ, not just reversed
- Variable pitch class counts (can be 7, 10, 11, 13, or more)
- Some maqāmāt are octave-repeating (≤7 pitch classes), others span two octaves (>7 pitch classes)
- Composite structure: Built by combining multiple ajnās positioned at specific degrees (ajnas commonly present on 4th or 5th degree)

**Anglo-European difference**: Anglo-European theory uses “mode” or “scale” for ordered pitch collections, usually in a 7-note diatonic framework related to major/minor scales. Maqāmāt are not scales—they are complex modal frameworks, with independent theoretical logic, variable note counts, different forms for ascending/descending motion, and a cultural/aesthetic depth beyond mere pitch organization.

Translation of maqām to “scale” erases these distinctions and imposes Anglo-European categorical assumptions.

***

### Taḥlīl (Analysis)

**Arabic maqām theory**: Taḥlīl is the analytical process of identifying intervallic relationships between pitch classes, which reveals the constituent ajnās within a maqām’s structure. Intervallic relationships form the foundation of maqām theory. In analysis, one first identifies the intervals, then recognizes which ajnās are formed, and how they are positioned at different structural points. Each jins or maqām has a canonical “base form” determined by its darajat al-istiqrār (stabilizing degree) or al-rukūz (resting point)—an Arabic note name mapped to a pitch class.

**Key characteristics:**
- Interval relationships identified first, as the defining element
- Ajnās identification through interval patterns
- Canonical base forms with defined darajat al-istiqrār/al-rukūz [Arabic term primary]
- Reveals relationships between melodic components
- Shows positioning of ajnās at different degrees

**Anglo-European difference**: Anglo-European theory focuses analysis primarily on harmonic function (Schenkerian, Roman numeral), while taḥlīl identifies melodic building blocks and their structural positions, emphasizing melodic-modal logic, not harmonic.

***

### Taṣwīr (Transposed Form)

**Arabic maqām theory**: A transposed form of a jins or maqām that preserves the interval pattern of the canonical base form, but starts on a different pitch class. Each valid transposition is assigned a specific name for the new starting position.

**Examples**:  
- Jins Kurd starting on dūgāh (canonical base form) → Jins Kurd al-Muḥayyar (transposed to muḥayyar)  
- Maqām Bayyāt starting on dūgāh (base form) → Maqām Bayyāt al-Nawā (transposed to nawā)

**Key characteristics:**
- Preserves interval pattern of the base form
- Assigned distinct naming for new darajat al-istiqrār or al-rukūz [Arabic term primary]
- Naming convention: [Original jins or maqām name] + al-[new tonic note name]
- Must be validated within the tuning system’s available pitch classes

**Anglo-European difference**: Anglo-European transpositions are named by key (e.g., “C major” vs “D major”). Arabic transpositions are named by the actual note name (rāst, dūgāh, etc.) which becomes the new darajat al-istiqrār/al-rukūz, retaining direct reference to the original melodic framework.

***

### Modulation (Intiqāl)

**Arabic maqām theory**: Intiqāl is the process of moving from one maqām to another during performance or composition. Modulation is only possible when the darajat al-istiqrār (stabilizing degree) or tonic of the target jins or maqām exists among the current maqām’s pitch classes. According to the Egyptian music theorist al-Shawwā, modulations generally occur to maqāmāt or ajnās whose tonic is on the 1st, 3rd, 4th, 5th, or 6th degree (ascending or descending), with allowance for using alternative third notes in some cases.

**Key characteristics:**
- Tonic requirement: Target tonic (darajat al-istiqrār/al-rukūz) must exist in the current pitch class set
- Permitted maqām degrees (al-Shawwā): 1st, 3rd, 4th, 5th, or 6th (and/or alternative third)
- Context-dependent, based on pitch class presence and theoretical relationships
- Specific maqāmāt prescribe allowable modulation pathways (suyūr)
- Maintains modal identity: The new maqām establishes its own structure

**Anglo-European difference**: Anglo-European modulation refers to key change within a harmonic system, often by pivoting through chords or chromaticism. Arabic intiqāl works by modal logic, not harmonic function—modulations occur only if the required melodic tonic exists structurally. “Key change” in the Anglo-European sense is not equivalent to modulation in Arabic maqām theory.

***

### Suyūr (Melodic Development Pathways)

**Arabic maqām theory**: Suyūr are conventional melodic pathways for developing or modulating within maqām frameworks. These are characteristic modal transformations or transitions, generally understood in performance practice but not always documented in theoretical literature.

**Key characteristics:**
- Conventional practice, not strictly prescriptive
- Pathways may include modulation and melodic transitions
- Documentation limited; many practical variants exist
- Specific to certain maqāmāt, not universal
- Guide improvisational and compositional choices

**Anglo-European difference**: Anglo-European theory uses harmonic devices (tonicization, secondary dominants) for temporary departures. Suyūr reflect characteristic melodic pathways and modal transformation possibilities, independent of harmonic function and often exceeding formal theoretical documentation.

***

### Ṣuʿūd (Ascending Sequence)

**Arabic maqām theory**: The ascending melodic path of a maqām, defined by upward movement through pitch classes. The ṣuʿūd may differ substantially from the descending sequence (hubūṭ), and is not merely a reversed version.

**Key characteristics:**
- Distinct melodic structure
- May use different pitch classes than hubūṭ
- Starting, ending pitches may differ from descending counterpart
- Focuses on the upward melodic identity

**Anglo-European difference**: Anglo-European scales are typically symmetrical or have minor bidirectional variations (e.g., melodic minor scale). Arabic maqāmāt may have fundamentally asymmetric ascending/descending paths.

***

### Hubūṭ (Descending Sequence)

**Arabic maqām theory**: Descending melodic path of a maqām, using a pitch class sequence moving downward. Hubūṭ may differ from ṣuʿūd in both structure and pitch classes.

**Key characteristics:**
- Distinct melodic structure from ṣuʿūd
- Initial, final pitches may differ from ascending sequence

**Anglo-European difference**: See ṣuʿūd. Anglo-European frameworks generally expect symmetrical ascending/descending scales; Arabic theory allows for fundamental asymmetry.

***

### Relative Pitch System

**Arabic maqām theory**: The system is based on relative pitch, i.e., intervallic relationships between pitch classes, not fixed frequency values. Identity is preserved by interval pattern, regardless of absolute pitch.

**Key characteristics:**
- Intervals define identity
- Theory independent of frequencies in Hz
- Transposability possible wherever interval pattern can be maintained
- Reference pitch is a contextual, performative choice

**Anglo-European difference**: While Anglo-European theory also recognizes relative pitch and transposition, it often emphasizes standard reference pitches (A=440Hz, key signatures). For Arabic maqām theory, interval pattern is primary, and there is no concept of an absolute concert pitch or "correct" frequency.

**⚠️ CRITICAL: Frequency Usage Restriction**

**NEVER use frequency (Hz) as a default, example, or primary reference for pitch class data** except for the specific context of Reference Frequency for Tuning System Starting Note Name.

**Why frequency should not be the default:**
- **Frequency is absolute/hardcoded**: Frequency values (Hz) represent fixed, absolute pitch measurements that lock pitch classes to specific values
- **Arabic maqām theory is relative**: The theoretical framework is based on intervallic relationships and relative measurements, not absolute pitch
- **Frequency introduces cultural bias**: Defaulting to Hz implies an absolute concert pitch standard, which contradicts the relative nature of Arabic maqām theory
- **Frequency limits transposability**: Absolute frequencies make it harder to understand that maqāmāt are transposable based on interval patterns

**When frequency IS appropriate:**
- ✅ **Reference Frequency for Tuning System Starting Note Name**: When documenting or displaying the reference frequency used for calculations (e.g., A4 = 440 Hz). This is metadata about the tuning system's computational context, not the primary data format.
- ✅ **Context/metadata fields**: Reference frequency can appear in response context to show what frequency was used for calculations

**What to use instead:**
- ✅ **Cents**: Relative measurements from a reference (0 cents = starting note). This is relative and maintains the theoretical framework.
- ✅ **Fraction**: Ratio-based representations (e.g., 9/8, 3/2) that express pure intervallic relationships
- ✅ **String length**: Relative string length measurements from monochord traditions
- ✅ **Any relative measurement**: Any format that preserves intervallic relationships without fixing absolute pitch

**API Design Implication:**
- Default values for `pitchClassDataType` should NEVER be "frequency"
- Examples and documentation should prioritize relative formats (cents, fraction, stringLength)
- Frequency should be available as an option but never presented as the primary or recommended format

***

### Tuning System Starting Note Name

**Arabic maqām theory**: The note name for the first pitch class from which all remaining pitch classes are ordered and calculated. This is always associated with the first pitch class in the tuning system (ratio 1/1, 0 cents, or open string length). Starting note names reflect different traditions and methodologies:
- ʿUshayrān-based: Related to theorisations based on defining frets/division of the oud strings where the open oud strings are tuned in perfect fourths. ʿUshayrān is the modern note name assigned to the fourth string of a standard 6-string oud, which is the lowest of the four strings that are tuned in fourths. 
- Yegāh-based: This is the first note name utilised in the modern Arabic music theory. It also represents tuning systems that were developed based on long necked lute family instruments (the Persian Tar or Sehtar) or the division of a single string using a monochord or sonometer.
- Rāst-based: The note name rāst is associated with the International Pitch Notation note name C. Tuning systems using rāst for their starting note name are mid-20th century onwards and represent a trend of modifying Anglo-European music theory standards to suit the Arabic maqām system. Most theoretical representations of Anglo-European scales or the 12-EDO tuning system start on the note  C, as opposed to A which is use to define the reference frequency (i.e. A4 = 440 Hz).

**Key characteristics:**
- Note name, not actual pitch class
- Always refers to first pitch class
- Frequency value independent; theoretical anchor for ordering
- Not arbitrary: determined by historical or practical tradition

**Theoretical implications:**

The choice of starting note name is not arbitrary—it represents a fundamental theoretical decision that affects the entire mathematical and practical framework of maqām analysis:

- **Availability of Ajnās and Maqāmāt**: Different starting points determine which maqāmāt and ajnās are available within a tuning system. The same tuning system with different starting notes (e.g., ʿushayrān vs. yegāh) may support different numbers of possible maqāmāt and ajnās.

- **Mathematical Relationships**: The starting note name determines how intervals are mathematically organized. Changing the starting note name affects the relative positions of all pitch classes and their intervallic relationships within the tuning system.

- **Modulation Pathways**: The networks of possible modulations between maqāmāt vary substantially depending on the starting note name of a tuning system. Some modulation pathways that are possible in one system may not be available in another due to the different pitch class organization.

- **Structural Accessibility**: Certain maqām structures may be accessible in a framework based on a certain starting note name but not another, even within the same underlying tuning system. This affects which structures can be constructed and analyzed.

- **Theoretical Framework Significance**: Starting note names signal theoretical, mathematical, or historical approaches (oud-based, monochord-based, or Anglo-European-influenced) rather than simple transpositions. This reflects different epistemological foundations and measurement traditions.

**Anglo-European difference**: Anglo-European starting notes are usually arbitrary transpositions; in Arabic theory, starting note names also signal theoretical, mathematical, or historical approaches rather than simple transpositions.

***

### Octave Structure 

**Arabic maqām theory**: Arabic tuning systems feature two principal octaves that share identical intervallic structure. Each pitch class has a unique Arabic note name in both octaves, with extended naming for registers below (qarār) or above (jawāb). This allows full representation for maqāmāt spanning more than one octave, with interval patterns repeating but nomenclature always unique.

**Key characteristics:**
- Two principal octaves with identical interval structure
- Each pitch class has a unique name (qarār for lower, jawāb for upper registers)
- Octave equivalence exists in intervals but not in naming or theoretical position
- Non-octave-repeating maqāmāt (>7 pitch classes) require this expanded system

**Anglo-European difference**: Anglo-European theory applies octave equivalence—pitches separated by octaves share the same letter name and are considered equivalents. Arabic theory does not use octave equivalence for naming or structural analysis.

***

### Cents 

**Arabic maqām theory**: Cents are an imported Anglo-European unit of measurement, devised by Alexander Ellis (19th century) to standardize interval comparison relative to 12-EDO. Historically, Arabic music measured intervals using ratios or string lengths, but cents are now widely used in modern computational contexts for practical reasons.

**Key characteristics:**
- 1 cent = 1/100 of a 12-EDO semitone
- Logarithmic scale
- Convenient for comparing interval sizes directly
- Default tolerance for matching in computational systems (e.g., ±5 cents in DiArMaqAr)
- Enables computational pattern matching with tolerance

**Cents versus Ratios:**
- Ratios express interval relationships as direct frequency relationships (e.g., 3:2 for a fifth, 9:8 for a major second)
- Cents use logarithmic divisions (formula: 1200 × log₂(ratio)), simplifying interval size comparison
- Cents do not show acoustic consonance; ratios do (smaller integers = greater consonance)
- Cents enable approximate matching with tolerance for digital systems; ratios require exact matches

**Anglo-European difference**: Cents are non-native to Arabic theory, designed for 12-EDO but applicable mathematically elsewhere. Ratios are indigenous to Arabic theory; cents are a practical convention adopted for computational tasks.

***

### String Length Ratio 

**Arabic maqām theory**: Pitch classes may be defined by string length ratios—the ratio of vibrating lengths on a monochord or similar instrument. This is inversely proportional to frequency.

**Key characteristics:**
- Historically tied to oud and monochord measurement
- Used in the tuning systems of al-Kindī, Meshshāqa, and Cairo Congress
- Reveals practical instrument layout

**Anglo-European difference**: Anglo-European acoustics recognize string length ratios, but interval measurement more commonly uses cents or frequency ratios. String length ratios are foundational in Arabic theory linked to practical and historical instrument construction.

***

### Fraction Frequency Ratio 

**Arabic maqām theory**: Frequency ratios (e.g., 9/8, 3/2, 27/16) are used to mathematically define intervals between pitch classes, continuing Pythagorean and ratio-based tuning traditions.

**Key characteristics:**
- High mathematical precision
- Forms the basis for historical Arabic tuning concepts

**Anglo-European difference**: Both use frequency ratios, but Anglo-European theory typically places them within “just intonation,” often subordinate to equal temperament. In Arabic maqām theory, ratios are primary, not alternatives to equal temperament.

***

### International Pitch Notation (IPN)

**Arabic maqām theory**: IPN translates Arabic pitch classes to Anglo-European staff notation (C, D, E, etc.) with octave numbers for reference. It is for cross-referencing and accessibility, not the primary theoretical system.

**Key characteristics:**
- Secondary reference only; primarily for users familiar with Anglo-European theory
- May require decisions regarding enharmonic spelling
- Does not represent melodic or theoretical significance of Arabic names
- Cannot encode microtonal intervals, modal context, or cultural layers

**Anglo-European difference**: In Anglo-European systems, IPN/staff notation is the default. For Arabic maqām theory, IPN is supplementary, maintaining the primacy of Arabic note names.

***

### Enharmonic Equivalence (Tasāwīy al-Aṣwāt)

**Arabic maqām theory**: When mapping Arabic pitch classes to IPN, enharmonic equivalence (e.g., G# vs Ab) arises only as a notational convenience; sequential letters are preferred for melodic clarity.

**Key characteristics:**
- Only relevant for IPN mapping
- Resolved algorithmically for contour preservation
- Does not alter the identity or naming in Arabic theory

**Anglo-European difference**: Enharmonic equivalence in Anglo-European music carries theoretical and harmonic significance; in Arabic maqām theory, it is simply a technical consideration for notation.

***

### Maqām Degree (Darajah)

**Arabic maqām theory**: Maqām degrees are positional indicators within a jins or maqām sequence, designated using Roman numerals (I, II, III...) and "I+" for octave equivalents. They never imply Anglo-European harmonic functions.

**Key characteristics:**
- Show structural position, not tonic/dominant relationships
- May range beyond VII for non-octave-repeating structures

**Anglo-European difference**: Anglo-European theory associates scale degrees with harmonic functions ("V" is dominant, "VII" is leading tone). Arabic maqām theory uses maqām degrees only for structural position, entirely separated from harmonic or functional meaning.

***

## Implementation Notes

### Why These Definitions Matter

1. **Prevents Anglo-European-centric assumptions**: Arabic maqām theory operates with its own logic.
2. **Guides computational implementation**: Ensures algorithms respect Arabic principles.
3. **Supports decolonial computing**: Arabic concepts are primary.
4. **Enables precise documentation**: Delivers accurate terms for code, UI, and APIs.

### Usage in Code

- Use these definitions as the reference point.
- Avoid parenthetical English definitions that subordinate Arabic terminology.
- Describe Arabic concepts on their own terms first.
- Use the "Anglo-European difference" section to clarify as needed.
- Avoid framing Arabic concepts as "like X but..." where X is an Anglo-European concept.
- Avoid terms like "microtonal" or other Anglo-European-centric deviation language.
- **Never call tuning systems "scales"** - Use "tuning system" or "tanghīm" (plural: tanāghīm).
- Never assume Anglo-European defaults (12-EDO, 7-note scales, harmonic function).

***

## Related Documents

- **[04-musicological-principles.md](./04-musicological-principles.md)**: Implementation-specific details and debugging insights.
- **[00-ai-agent-personality.md](./00-ai-agent-personality.md)**: Decolonial computing framework and cultural sensitivity standards.
- **[06-documentation-standards.md](./06-documentation-standards.md)**: Guidelines for documenting these concepts accurately.

***

**Last Updated**: 2025-10-31

***
