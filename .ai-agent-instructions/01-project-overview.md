# DiArMaqAr Project Overview

**Digital Arabic Maqām Archive** - Computational modeling of Arabic maqām theory

---

## Project Description

The **Digital Arabic Maqām Archive** (DiArMaqAr) is a comprehensive web-based platform for interactive exploration of Arabic maqām theory through computational modeling. The system integrates historical tuning systems (tanāghīm), melodic fragments (ajnās), complete modal frameworks (maqāmāt), and modulation practices within a unified digital framework.

**Live Application**: https://arabic-maqam-archive.netlify.app/

---

## Cultural Framework

### Decolonial Computing Principles

- **Prioritize Arabic theoretical frameworks**: Ground all implementations in Arab-Ottoman-Persian traditions
- **Avoid Western-centrism**: Arabic maqām theory is not a deviation from Western tuning—it represents independent theoretical frameworks
- **Historical authenticity**: Base implementations on historical sources and scholarly literature
- **Cultural specificity**: Avoid Anglo-European-centric approaches and terminology

### Critical Terminology Standards

**NEVER use "microtonal"**: This Western-centric term implies deviation from equal temperament as the norm.

**Use culturally appropriate alternatives:**
- "unequal divisions"
- "non-12-EDO pitches"
- "pitches with fractional precision"
- "pitches with decimal/fractional MIDI values"
- Or describe the specific theoretical framework (e.g., "following Arabic maqām theory")

**This applies to ALL:**
- Code comments
- Documentation
- Variable names
- Function descriptions
- Export data
- User-facing text

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: SCSS with modular components
- **Audio**: Custom Web Audio API implementation
- **Notation**: VexFlow for staff notation rendering
- **Documentation**: TypeDoc for API generation

### Backend/Processing
- **Node.js**: CLI tools, batch export utilities

---

## High-Level Architecture

### Three-Layer Abstraction

**1. Data Layer (Abstract)**
- JSON files in `data/` directory
- Tuning-system-independent definitions
- Cultural knowledge represented as abstract structures

**Files:**
- `tuningSystems.json` - Historical tuning systems with pitch class values
- `ajnas.json` - Melodic fragments (abstract note names)
- `maqamat.json` - Complete modal frameworks
- `sources.json` - Bibliography and source references
- `patterns.json` - Melodic patterns for analysis

**2. Model Layer (TypeScript)**
- Classes bridge abstract data with concrete implementations
- Convert mathematical intervals to playable frequencies
- Transform abstract note names into concrete pitch classes

**Key Models:**
- `TuningSystem` - Converts intervals to frequencies
- `JinsData → Jins` - Abstract → concrete melodic fragments
- `MaqamData → Maqam` - Abstract → concrete modal frameworks
- `PitchClass` - Unified pitch representation (frequency, cents, MIDI, ratios)
- `NoteName` - Canonical transliterated Arabic note names

**3. Application Layer (React)**
- Context providers manage global state
- Transposition algorithms find valid starting positions
- Modulation analysis identifies modal transitions
- Audio synthesis and playback
- Staff notation rendering and visualization

---

## Core Conceptual Model

### Tahlil vs Taswir

**Tahlil (Original Form)**:
- Original form starting from traditional root note
- Example: Jins Kurd on dūgāh

**Taswir (Transposition)**:
- Transposed form preserving intervallic relationships
- Example: Jins Kurd al-Muhayyar
- Platform systematically generates ALL valid transpositions within each tuning system

### Pattern Matching with Cents Tolerance

- Transposition uses configurable cents tolerance (default: 5 cents)
- Matches abstract interval patterns against tuning system pitch classes
- Enables cross-system compatibility analysis

### Bidirectional Sequences (Maqamat)

- **Separate** ascending (ṣuʿūd) and descending (hubūṭ) note sequences
- **Asymmetric maqamat**: Different ascending/descending paths (marked with *)
- Both sequences analyzed independently for embedded ajnas patterns

### Starting Note Conventions

**Critical**: Different starting points represent fundamentally different theoretical approaches, NOT simple transposition.

- **ʿushayrān-based**: Oud tuning traditions (perfect fourths)
- **yegāh-based**: Monochord/sonometer measurements
- **rāst-based**: Established theoretical frameworks

**Implications**: Affects mathematical relationships, available maqāmāt, and modulation possibilities.

---

## Project Structure

```
/
├── .ai-agent-instructions/     # AI agent instruction documents
├── .github/instructions/       # Legacy instructions (being deprecated)
├── data/                       # Ground-truth musical data (JSON)
│   ├── ajnas.json
│   ├── maqamat.json
│   ├── patterns.json
│   ├── sources.json
│   └── tuningSystems.json
├── docs/                       # Generated TypeDoc documentation
├── exports/                    # Export output directory
├── packages/                   # Package experiments (excluded from build)
├── public/                     # Static assets and public documentation
│   ├── data/                  # Analytics data
│   ├── docs/                  # Public API and export documentation
│   └── fonts/
├── scripts/                    # Utility scripts
│   └── batch-export/          # CLI batch export tool
├── src/                        # Main TypeScript source
│   ├── app/                   # Next.js 15 App Router
│   │   ├── api/              # Server endpoints
│   │   └── (pages)/          # Page components
│   ├── audio/                 # Web Audio API utilities
│   ├── components/            # React UI components
│   ├── contexts/              # React context providers
│   ├── functions/             # Core computational functions
│   ├── models/                # TypeScript data models
│   └── styles/                # SCSS modules
├── CLAUDE.md                   # Claude-specific guidance (points to .ai-agent-instructions/)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Key Features

### 1. Historical Tuning Systems
- Multiple historical systems (al-Kindī 874, al-Fārābī 950, Ibn Sīnā 1037, etc.)
- Different formats: ratios, cents, string lengths
- Configurable reference frequencies
- Cultural note name mappings

### 2. Ajnas (Melodic Fragments)
- Abstract definitions in JSON
- Automatic transposition to all valid starting positions
- Pattern matching within tuning systems
- Embedded analysis within maqamat

### 3. Maqamat (Modal Frameworks)
- Complete ascending/descending sequences
- Asymmetric maqamat support
- Suyūr (melodic development pathways)
- Embedded ajnas identification

### 4. Computational Transposition of Suyūr
**Key Innovation**: DiArMaqAr implements the first computational transposition of suyūr (melodic development pathways), addressing a fundamental limitation in historical Arabic music theory sources.

**Historical Context:**
- In historical sources (Meshshāqa 1899, Al-Shawwā 1946, Al-Ṣabbāgh 1950, Al-Ḥilū 1961), suyūr are always presented as prose text
- Suyūr are never represented for transpositions of any given maqām in historical literature
- This limitation prevented systematic exploration of melodic pathways across different pitch centers

**DiArMaqAr's Solution:**
- Automatically transposes suyūr along with maqām transpositions
- The `transposeSayr()` function operates through three stages:
  1. **Calculate Transposition Interval**: Compares first notes of original and target maqāmāt
  2. **Apply Intelligent Note Shifting**: Shifts note stops by calculated interval with bounds checking
  3. **Process Different Stop Types**: Handles notes, jins, maqām, and directional instructions appropriately
- Enables systematic exploration of all possible melodic pathways across pitch centers
- Supports comparative analysis and theoretical investigation of suyūr relationships

**Implementation Details:**
- Suyūr stops can be: notes, jins references, maqām references, or directional instructions
- Bounds safety mechanism ensures transposed suyūr remain within practical tuning system limits
- Maintains structural identity for jins/maqām references while transposing starting notes
- Preserves bilingual support (Arabic/English) in transposed forms

### 5. Modulation Analysis
- First digital implementation of al-Shawwā algorithm (1946)
- Maqamat-to-maqamat modulations
- Ajnas-to-ajnas modulations
- Organized by scale degree

### 5. Export System
- Web UI export modal
- CLI batch export tool
- JSON format with comprehensive metadata
- Progress tracking for large exports

### 7. Audio Synthesis
- Web Audio API implementation
- Multiple timbres
- Individual pitch class playback
- Sequence playback

### 8. Staff Notation
- VexFlow rendering
- Enharmonic spelling algorithm
- Sequential letter resolution
- Support for non-12-EDO pitches

---

## Common Commands

### Development
```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Build production application
npm start            # Start production server
npm run lint         # Run ESLint
```

### Documentation
```bash
npm run docs         # Generate TypeDoc documentation
npm run docs:serve   # Generate and open in browser
npm run docs:watch   # Watch mode for docs
```


### Batch Export CLI
```bash
# List all tuning systems
node scripts/batch-export/batch-export.js --list-tuning-systems

# Export specific system with full data
node scripts/batch-export/batch-export.js \
  --tuning-system "Al-Farabi-(950g)" \
  --starting-note "yegāh" \
  --include-ajnas-details \
  --include-maqamat-details \
  --include-maqamat-modulations \
  --include-ajnas-modulations

# Batch export all systems (generates many GB of data)
node scripts/batch-export/batch-export.js \
  --tuning-system "all" \
  --starting-note "all" \
  --output-dir "./exports"
```

---

## Development Workflow

1. **Read relevant instructions**: Check `.ai-agent-instructions/` for specific guidance
2. **Understand context**: Review existing code patterns before implementing
3. **Follow conventions**: Use established patterns (see `02-architecture.md`, `03-development-conventions.md`)
4. **Test thoroughly**: Use manual testing guide (`05-testing-guide.md`)
5. **Document findings**: Update instructions with significant discoveries

---

## Repository Information

- **Repository**: Music-Intelligence-Lab/DiArMaqAr
- **Branch**: main
- **License**: (check repository)
- **Live Site**: https://arabic-maqam-archive.netlify.app/

---

## Key Resources

- **Architecture Details**: `.ai-agent-instructions/02-architecture.md`
- **Development Conventions**: `.ai-agent-instructions/03-development-conventions.md`
- **Musicological Principles**: `.ai-agent-instructions/04-musicological-principles.md`
- **Testing Guide**: `.ai-agent-instructions/05-testing-guide.md`
- **Documentation Standards**: `.ai-agent-instructions/06-documentation-standards.md`
- **API Specification**: `openapi.yaml`
- **API Playground**: `src/app/api/playground/page.tsx`
- **Export Documentation**: `public/docs/README DiArMaqAr Tuning System JSON Data Export.md`
- **TypeDoc**: `docs/library/index.html` (generated)
