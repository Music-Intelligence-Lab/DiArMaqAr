# DiArMaqAr Project Essentials

**Digital Arabic Maqām Archive** - Computational modeling of Arabic maqām theory

**LOAD**: For most development tasks, especially when starting new features or needing project context.

---

## Project Description

The **Digital Arabic Maqām Archive** (DiArMaqAr) is a Open-source bilingual platform integrating historically documented Arabic maqām theory within a unified computational framework


**Live Application**: https://arabic-maqam-archive.netlify.app/

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

**Common systems:**
- **ʿushayrān-based**: Oud tuning traditions (perfect fourths)
- **yegāh-based**: Monochord/sonometer measurements
- **rāst-based**: Established theoretical frameworks

**Implications**: Affects mathematical relationships, available maqāmāt, and modulation possibilities.

**For detailed explanation**: See [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md#starting-note-name)

---

## Project Structure

```
/
├── .ai-agent-instructions/     # AI agent instruction documents
│   ├── core/                   # Always load
│   ├── essentials/             # Load for most tasks
│   ├── reference/              # Load on demand
│   └── glossary/               # Load when needed
├── data/                       # Ground-truth musical data (JSON)
│   ├── ajnas.json
│   ├── maqamat.json
│   ├── patterns.json
│   ├── sources.json
│   └── tuningSystems.json
├── docs/                       # Generated TypeDoc documentation
├── exports/                    # Export output directory
├── public/                     # Static assets and documentation
│   ├── data/                  # Analytics data
│   ├── docs/                  # Public API/export documentation
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
├── CLAUDE.md                   # Claude guidance (→ .ai-agent-instructions/)
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

**Key Innovation**: DiArMaqAr implements the first computational transposition of suyūr (melodic development pathways).

**Historical Context:**
- In historical sources (Meshshāqa 1899, Al-Shawwā 1946, Al-Ṣabbāgh 1950, Al-Ḥilū 1961), suyūr are always presented as prose text
- Suyūr are never represented for transpositions in historical literature
- This prevented systematic exploration of melodic pathways across pitch centers

**DiArMaqAr's Solution:**
- Automatically transposes suyūr along with maqām transpositions
- `transposeSayr()` function operates through three stages:
  1. Calculate transposition interval between original and target
  2. Apply intelligent note shifting with bounds checking
  3. Process different stop types appropriately
- Enables systematic exploration of melodic pathways across pitch centers

**Implementation:**
- Suyūr stops: notes, jins references, maqām references, directional instructions
- Bounds safety ensures transposed suyūr remain within practical limits
- Maintains structural identity for jins/maqām references
- Preserves bilingual support (Arabic/English)

### 5. Modulation Analysis
- First digital implementation of al-Shawwā algorithm (1946)
- Maqamat-to-maqamat modulations
- Ajnas-to-ajnas modulations
- Organized by maqām degree

### 6. Export System
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

**For full command reference**: See [reference/cli-commands-guide.md](../reference/cli-commands-guide.md)

### Quick Reference

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build production
npm run lint         # Run ESLint

# Documentation
npm run docs         # Generate TypeDoc
npm run docs:serve   # Generate and open

# Batch Export
node scripts/batch-export/batch-export.js --list-tuning-systems
```

---

## Development Workflow

1. **Read relevant instructions**: Check `.ai-agent-instructions/` for specific guidance
2. **Understand context**: Review existing code patterns
3. **Follow conventions**: Use established patterns (see architecture and development guides)
4. **Test thoroughly**: Use manual testing guide
5. **Document findings**: Update instructions with significant discoveries

---

## Repository Information

- **Repository**: Music-Intelligence-Lab/DiArMaqAr
- **Branch**: main
- **Live Site**: https://arabic-maqam-archive.netlify.app/

---

## Navigation

### Core Files (Always Load)
- [core/00-core-principles.md](../core/00-core-principles.md)

### Essential Files (Most Tasks)
- [essentials/02-architecture-essentials.md](02-architecture-essentials.md)
- [essentials/03-development-quick-ref.md](03-development-quick-ref.md)
- [essentials/04-musicology-essentials.md](04-musicology-essentials.md)
- [essentials/05-testing-essentials.md](05-testing-essentials.md)

### Reference Files (On Demand)
- [reference/api-design-patterns.md](../reference/api-design-patterns.md)
- [reference/cli-commands-guide.md](../reference/cli-commands-guide.md)
- [reference/mcp-servers-guide.md](../reference/mcp-servers-guide.md)

### Glossary (When Needed)
- [glossary/06-documentation-standards.md](../glossary/06-documentation-standards.md)
- [glossary/07-musicological-definitions.md](../glossary/07-musicological-definitions.md)
