# Testing Guide: Tuning Systems and Maqāmāt

**Comprehensive manual testing protocols for the Digital Arabic Maqām Archive**

---

## Representative Examples

For recommended tuning systems, maqāmāt, and ajnās for testing and documentation, see [`docs/api/representative-examples.md`](../../docs/api/representative-examples.md). These examples have been carefully selected to demonstrate the full capabilities of the API while respecting the cultural and historical significance of Arabic maqām theory.

---

## Quick Reference

### Tuning System Categories

| Tuning System | Format | Availability | Best For Testing |
|---------------|--------|--------------|------------------|
| **al-Kindī (874)** | Fractions | Limited (13/29 ajnās, 15/60 maqāmāt) | Unavailable maqāmāt, transposition limits |
| **al-Fārābī (950g)** | Fractions | Comprehensive (27-tone) | Full maqām testing, complete modulations |
| **Ibn Sīnā (1037)** | Fractions | Comprehensive (17-tone) | Alternative historical system |
| **Mashrafa and Mukhtār (1944)** | Cents | Good (22-tone) | Cents-based calculations, modern notation |
| **Meshshāqa (1899)** | String Length | Comprehensive | String length format, lute/oud theory |
| **Cairo Congress (1932a)** | String Length | Good | Historical standardization |

---

## Priority Maqāmāt for Testing

### Maqām Characteristics

All maqāmāt are marked with one of these patterns:
- **No asterisk** (e.g., `maqām athar kurd`): Same ascending and descending sequence
- **Asterisk*** (e.g., `maqām bayyāt*`): Different ascending and descending sequences (asymmetric)

### 1. Maqām Bayyāt*

**Characteristics:**
- 7 pitch classes
- Octave repeating (ends on I+)
- **Different ascending and descending sequences** (marked with *)
- No suyūr (melodic development pathways)
- **Asymmetric**: Tests the critical algorithm fix for directional enharmonic spelling

**Test Cases:**
- [ ] Verify asterisk appears in maqāmāt list
- [ ] Check ascending sequence ends on octave equivalence (I+)
- [ ] Verify descending sequence uses different pitch classes
- [ ] Confirm sequential letter resolution works in both directions
- [ ] Test on al-Fārābī (950g) for full availability
- [ ] Test on al-Kindī (874) to verify limited/no transpositions

**Known Embedded Ajnās:**
- Varies by transposition; check taḥlīl analysis

---

### 2. Maqām Athar Kurd

**Characteristics:**
- 7 pitch classes
- Octave repeating (ends on I+)
- **Same ascending and descending sequence** (no *)
- **Unusual intervals**: Contains G#3 (ḥiṣār) - excellent for enharmonic equivalent testing
- No suyūr
- Available in al-Kindī (874) with only 1/12 transpositions

**Test Cases:**
- [ ] Verify no asterisk in maqāmāt list
- [ ] Check ascending = descending (reversed)
- [ ] Test enharmonic spelling with unusual intervals (G#3 vs Ab3)
- [ ] Verify letter sequence maintains G#3 (not Ab3) based on melodic context
- [ ] Test limited transposition availability (1/12 in al-Kindī)

**Known Embedded Ajnās (in al-Kindī, dūgāh/D3):**
- jins athar kurd (I-II-IV)
- jins ḥijāz al-ḥusaynī (V-VI-VII)
- jins athar kurd al-muḥayyar (I+-repeat)

**Intervals (D3-based):**
- D3 → Eb3 → F3 → G#3 → A3 → Bb3 → C#4 → D4
- Note the augmented intervals: F3→G#3 (augmented second), Bb3→C#4

---

### 3. Maqām Bestenegār*

**Characteristics:**
- **10 pitch classes** (NOT octave repeating)
- **Different ascending and descending sequences** (marked with *)
- Has suyūr (melodic development pathways)
- **Critical test case**: Used in enharmonic spelling bug fix

**Test Cases:**
- [ ] Verify asterisk appears in maqāmāt list
- [ ] Confirm 10 unique pitch classes (no I+ octave marker)
- [ ] Test ascending ends on muḥayyar (8/3 = decimal ratio 2.667 → D4)
- [ ] Test descending begins from shahnāz (81/32 = decimal ratio 2.531 → Db4)
- [ ] Verify UI marks "unique" pitch classes that differ between directions
- [ ] Check sequential letter resolution for 10-note sequences
- [ ] Test descending: Db4 → C4 → Bb3 → A3 → Gb3 → F3 → E-b3 → D3 → C3 → B-b2
- [ ] Verify letter sequence: D→C→B→A→G→F→E→D→C→B ✓
- [ ] Access and test available suyūr

**Tuning Systems:**
- **al-Fārābī (950g)**: Full availability
- **al-Kindī (874)**: Check if available (likely limited/unavailable due to 10 pitch classes)

---

### 4. Maqām Dilkesh Ḥūrān

**Characteristics:**
- **10 pitch classes**
- **Octave repeating** (ends on I+ despite having 10 notes - meaning 9 unique + octave)
- **Same ascending and descending sequence** (no *)
- Has suyūr

**Test Cases:**
- [ ] Verify no asterisk in maqāmāt list
- [ ] Confirm 10 pitch classes but ends on I+ (octave equivalence)
- [ ] Test ascending = descending (reversed)
- [ ] Count unique pitch classes (should be 9 + octave = 10 total)
- [ ] Verify sequential letter resolution for 10-note sequences
- [ ] Access and test available suyūr

**Special Note:**
- Demonstrates that pitch class count ≠ lack of octave equivalence
- Has 10 notes total but the last is the octave of the first

---

## Testing Protocols

### 1. Availability Testing

**Objective:** Verify maqām/jins availability across tuning systems

**Steps:**
1. Select tuning system (e.g., al-Kindī 874)
2. Click "Maqāmāt" button
3. Check counter: "Maqāmāt (X/60)" where X = available count
4. Scan list for target maqām
5. Note transposition count (e.g., "Transpositions: 1/12")
6. Gray/disabled maqāmāt show no transposition count

**Expected Results:**
- **al-Kindī (874)**: Limited availability (15/60 maqāmāt)
- **al-Fārābī (950g)**: Comprehensive availability (most/all maqāmāt)
- **Ibn Sīnā (1037)**: Good availability
- Unavailable maqāmāt appear grayed out without transposition counts

---

### 2. Asymmetric Maqām Testing

**Objective:** Verify correct handling of different ascending/descending sequences

**Steps:**
1. Select tuning system
2. Navigate to maqām with asterisk (e.g., maqām bayyāt*, maqām bestenegār*)
3. Expand transposition details
4. Check ascending sequence
5. Check descending sequence
6. Verify pitch classes differ between directions
7. Check for "unique" markers in UI

**Expected Results:**
- Ascending and descending pitch class arrays are independent
- UI shows "unique" markers for pitch classes that differ
- Sequential letter resolution works correctly in both directions
- No assumption that `descendingPitchClasses === ascendingPitchClasses.reverse()`

---

### 3. Enharmonic Spelling Testing

**Objective:** Verify sequential letter resolution algorithm

**Steps:**
1. Select maqām with unusual intervals (e.g., maqām athar kurd)
2. View ascending sequence
3. Verify letter sequence follows natural progression (A→B→C→D→E→F→G)
4. Check that accidentals are applied correctly (#, b, +, -)
5. View descending sequence
6. Verify descending letter sequence is proper (reverse of ascending for symmetric maqāmāt)
7. For asymmetric maqāmāt, verify descending calculated from LAST note upward, then reversed

**Expected Results:**
- **Ascending**: Expected letters calculated from FIRST note going up
- **Descending**: Expected letters calculated from LAST note going up, then REVERSED
- No repeated letters (e.g., "E→E" is wrong, should be "E→F" or "E→D")
- Proper enharmonic choices: F3 (not E#3), Gb3 (not F#3 in descending context)

**Test Cases:**
- **maqām athar kurd**: G#3 (not Ab3) based on ascending context from D
- **maqām bestenegār descending**: Db4 (not C#4) for descending melodic context
- Letter sequence D→C→B→A→G→F→E→D→C→B ✓

---

### 4. Octave Equivalence Testing

**Objective:** Verify correct pitch class counting and I+ marking

**Steps:**
1. Select maqām
2. View maqām degree row in analysis table
3. Check if last degree is marked "I+" (octave equivalence)
4. Count unique pitch classes (excluding octave repeat)

**Expected Results:**
- **maqām rāst**: 7 pitch classes, ends on I+
- **maqām nahāwand kabīr**: 7 pitch classes, ends on I+
- **maqām bayyāt**: 7 pitch classes, ends on I+
- **maqām bestenegār**: 10 pitch classes, NO I+ (ends on different note)
- **maqām dilkesh ḥūrān**: 10 pitch classes (9 unique + I+)

---

### 5. Tuning System Format Testing

**Objective:** Verify correct handling of different pitch class value formats

#### Test with Fractions (al-Kindī, al-Fārābī, Ibn Sīnā)
- [ ] Check fraction display (e.g., 9/8, 81/64)
- [ ] Verify interval calculations
- [ ] Check GCD reduction in fractions

#### Test with Cents (Mashrafa and Mukhtār)
- [ ] Verify cents values display
- [ ] Check cents tolerance matching (default: 5 cents)
- [ ] Verify transposition algorithm with cents

#### Test with String Lengths (Meshshāqa, Cairo Congress 1932a)
- [ ] Check string length display
- [ ] Verify lute/oud theory applications
- [ ] Check inverse relationship to frequency

---

### 6. Suyūr (Melodic Development Pathways) Testing

**Objective:** Verify suyūr availability and functionality

**Steps:**
1. Select maqām with suyūr (e.g., maqām bestenegār*, maqām dilkesh ḥūrān)
2. Click "Suyūr" button
3. Check suyūr count: "Suyūr (X)"
4. Navigate through available suyūr
5. Verify suyūr transpose with parent maqām
6. Check note name conversions in suyūr

**Expected Results:**
- **maqām bayyāt**: No suyūr (0)
- **maqām athar kurd**: No suyūr (0)
- **maqām bestenegār**: Has suyūr (count > 0)
- **maqām dilkesh ḥūrān**: Has suyūr (count > 0)
- Suyūr button enabled only when suyūr available

---

### 7. Modulation (Intiqālāt) Testing

**Objective:** Verify modulation analysis algorithm

**Steps:**
1. Select maqām
2. Click "Intiqālāt" button
3. Check available modulations
4. Verify categorization by maqām degree (I, III, IV, V, VI)
5. Test both maqāmāt and ajnās modulation modes
6. Check ascending/descending variants for sixth degree

**Expected Results:**
- Modulations organized by maqām degree
- Shared pitch classes identified correctly
- Al-Shawwā algorithm rules applied
- Only maqāmāt have modulation data (ajnās do not modulate FROM, only TO)

---

### 8. Cross-System Comparison Testing

**Objective:** Verify same maqām behaves correctly across different tuning systems

**Steps:**
1. Select tuning system A (e.g., al-Fārābī 950g)
2. Select maqām (e.g., maqām rāst)
3. Note pitch class values, intervals, transposition count
4. Switch to tuning system B (e.g., Ibn Sīnā)
5. Select same maqām
6. Compare pitch class values, intervals, transposition count
7. Play both versions audibly

**Expected Results:**
- Same maqām has consistent structure (same Arabic note names, maqām degrees)
- Pitch class values differ according to tuning system
- Transposition counts may differ (depends on available pitch classes)
- Interval ratios may differ slightly
- Cents tolerance accounts for small discrepancies

---

## Recommended Testing Combinations

### Basic Functionality Testing

| Tuning System | Maqām | Purpose |
|---------------|-------|---------|
| al-Fārābī (950g) | maqām rāst* | Baseline symmetric 7-note maqām |
| al-Fārābī (950g) | maqām bayyāt* | Asymmetric 7-note with octave |
| al-Fārābī (950g) | maqām bestenegār* | Asymmetric 10-note, no octave |
| al-Fārābī (950g) | maqām athar kurd | Symmetric 7-note, unusual intervals |

### Availability & Transposition Testing

| Tuning System | Maqām | Expected Availability |
|---------------|-------|-----------------------|
| al-Kindī (874) | maqām athar kurd | Limited (1/12 transpositions) |
| al-Kindī (874) | maqām bayyāt* | Check if unavailable (greyed out) |
| al-Kindī (874) | maqām bestenegār* | Likely unavailable (10 pitch classes) |
| al-Fārābī (950g) | maqām bayyāt* | Full availability |
| Ibn Sīnā (1037) | maqām dilkesh ḥūrān | Good availability |

### Format-Specific Testing

| Format | Tuning System | Maqām | Focus |
|--------|---------------|-------|-------|
| Fractions | al-Fārābī (950g) | maqām bestenegār* | Fractional ratios, GCD reduction |
| Cents | Mashrafa and Mukhtār (1944) | maqām bayyāt* | Cents tolerance, modern notation |
| String Length | Meshshāqa (1899) | maqām rāst* | String length calculations |
| String Length | Cairo Congress (1932a) | maqām athar kurd | Historical standardization |

### Enharmonic Spelling Testing

| Maqām | Tuning System | Focus |
|-------|---------------|-------|
| maqām athar kurd | al-Kindī (874) | G#3 vs Ab3 resolution |
| maqām bestenegār* | al-Fārābī (950g) | 10-note descending sequence |
| maqām bayyāt* | al-Fārābī (950g) | Asymmetric directional spelling |

### Suyūr & Modulation Testing

| Maqām | Feature | Tuning System |
|-------|---------|---------------|
| maqām bestenegār* | Suyūr + Modulations | al-Fārābī (950g) |
| maqām dilkesh ḥūrān | Suyūr + 10 notes | al-Fārābī (950g) |
| maqām athar kurd | Modulations only | al-Kindī (874) |

---

## Direct URLs for Testing

### URL Parameter Structure

`?tuningSystem=SYSTEM_ID&startingNoteName=NOTE&maqām=MAQAM_ID`

### Example URLs

```
# al-Kindī with maqām athar kurd
http://localhost:3000/app?tuningSystem=al-Kindi-(874)&startingNoteName=ʿushayrān&maqām=maqām-athar-kurd

# al-Fārābī (950g) with maqām bestenegār
http://localhost:3000/app?tuningSystem=al-Farabi-(950g)&startingNoteName=ʿushayrān&maqām=maqām-bestenegār

# al-Fārābī (950g) with maqām bayyāt
http://localhost:3000/app?tuningSystem=al-Farabi-(950g)&startingNoteName=ʿushayrān&maqām=maqām-bayyāt

# Mashrafa and Mukhtār with maqām rāst
http://localhost:3000/app?tuningSystem=Mashrafa-and-Mukhtar-(1944)&startingNoteName=ʿushayrān&maqām=maqām-rāst
```

---

## UI Indicators Reference

| Indicator | Meaning |
|-----------|---------|
| **Asterisk (*)** | Different ascending/descending sequences |
| **No asterisk** | Same ascending/descending (symmetric) |
| **"Transpositions: X/Y"** | Available transpositions in current tuning system |
| **Greyed out** | Maqām unavailable in current tuning system |
| **"I+"** | Octave equivalence marker |
| **"Unique"** | Pitch class differs between ascending/descending |
| **"(X/Y)"** | Availability counter (X available out of Y total) |

---

## Regression Testing Checklist

After any changes to enharmonic spelling, transposition, or maqām analysis:

- [ ] Test maqām athar kurd enharmonic spellings (G#3 maintained)
- [ ] Test maqām bestenegār descending sequence (10 notes, proper letters)
- [ ] Verify asymmetric maqāmāt marked with asterisk
- [ ] Check octave equivalence (I+) marking
- [ ] Verify transposition counts match availability
- [ ] Test across multiple tuning systems (fractions, cents, string lengths)
- [ ] Verify suyūr availability and transposition
- [ ] Check modulation analysis completeness
- [ ] Test URL deep-linking functionality
- [ ] Verify bilingual support (English/Arabic)
- [ ] Test audio playback
- [ ] Check staff notation rendering

---

## Debugging Protocols

### Multi-Layer Issue Debugging

**When bugs involve multiple layers (UI + functions + exports):**

1. **Isolate the Layer** - Determine if issue is in UI state, core functions, or export logic
2. **Test Core Functions First** - Verify mathematical/computational functions work in isolation
3. **Check Data Flow** - Trace data from source → processing → display/export
4. **Validate Both Paths** - UI and export systems may use different code paths for same functionality
5. **Document Findings** - Complex bugs often reveal architectural insights worth preserving

**Red Flags Indicating Multi-Layer Issues:**
- Inconsistent behavior between UI and exports
- Character encoding/normalization problems
- Type errors that seem to "work" but produce wrong output
- Progress/performance issues that seem unrelated to core logic

### Character Normalization Debugging

```bash
# 1. Check current state
grep -c "ʾ" export.json  # Count problematic characters
grep -n "maqam_awj_.*ara.*" export.json  # Find specific examples

# 2. Test normalization function
node -e "console.log(standardizeText('ʾaraʾ'))"  # Test directly

# 3. Verify both UI and export systems
# UI: Check component state management
# Export: Check TypeScript function application
```

---

## Performance Testing & Auditing

### API Cost Audit

**Automated performance audit tool** for comprehensive API endpoint testing.

**Location**: `scripts/api-cost-audit.ts`

**When to use**:
- Before major releases
- After adding new endpoints
- When optimizing API performance
- To compare local vs production performance

**What it tests**:
- All API endpoints from OpenAPI spec
- All parameter combinations (with intelligent limits)
- Response time (10 runs per combination for statistical accuracy)
- Response size (bytes)
- Local vs external API comparison

**Output**:
- CSV file with detailed metrics for all tests
- Markdown analysis report with:
  - Slowest endpoints identification
  - Largest responses identification
  - External API performance comparison
  - Efficiency recommendations (caching, pagination, etc.)

**Usage**:
```bash
# Start dev server
npm run dev

# Run audit (in another terminal)
tsx scripts/api-cost-audit.ts
```

**See**: [`reference/cli-commands-guide.md`](../reference/cli-commands-guide.md) for detailed documentation.

---

*Last Updated: Based on October 2025 debugging sessions and enharmonic spelling algorithm fixes*
