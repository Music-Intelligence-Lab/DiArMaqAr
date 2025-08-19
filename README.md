# Arabic Maqām Network

A comprehensive web-based application for the interactive exploration of Arabic maqām theory through computational modeling and visualization. The platform integrates historical tanāghīm (tuning systems), ajnās (tetrachords), maqāmāt (melodic modes), suyūr (melodic performance pathways), and intiqālāt (modulation practices) within a unified digital framework.

## Overview

The Arabic Maqām Network represents a significant advancement in computational musicology, providing the first comprehensive platform for interactive maqām analysis and exploration. Developed by **Dr. Khyam Allami** and **Ibrahim El Khansa** at the **Music Intelligence Lab** at the **American University of Beirut**, this application employs a culturally specific approach that prioritizes Arabic theoretical frameworks and epistemological systems.

Unlike existing resources that focus primarily on educational approaches or automatic classification, our platform provides dynamic representation and user-centered exploration of maqāmic concepts. The system serves as both an analytical tool and a repository of ground truth data that supports creative, educational, and research applications.

## Key Features

### Core Functionality
- **Mathematical Modeling of Historical Tuning Systems**: Precise implementation of Arabic tuning systems
- **Tuning-System-Sensitive Transposition**: Advanced algorithms that preserve intervallic relationships across different tonal centers
- **Real-time Audio Synthesis**: Web Audio API integration enabling immediate auditory feedback
- **Algorithmic Modulation Analysis**: First implementation of Sāmī Al-Shawwā's 1946 modulation guidelines
- **Comprehensive Data Export**: Export capabilities to Scala (.scl), JSON, and custom formats

### Interactive Exploration
- **Dynamic Visualization**: Interactive representation of maqām hierarchies and relationships
- **Staff Notation Rendering**: VexFlow integration for Western notation display
- **MIDI Integration**: Support for external MIDI controllers and keyboard input
- **Bilingual Interface**: Full Arabic and English language support
- **Academic Source Integration**: Proper attribution and scholarly references throughout

### Developer Resources
- **NPM Package**: `arabic-maqam-core` library providing comprehensive maqām modeling
- **TypeScript API**: Fully typed interfaces for all musical concepts
- **Documentation**: Complete API documentation generated with TypeDoc
- **Modular Architecture**: Tree-shakeable exports for selective functionality

## Theoretical Framework

The application's architecture reflects the traditional conceptual hierarchy of maqām theory as documented in historical sources:

### 1. Pitch Classes
Individual pitch representations using relational measurements (cents, ratios) rather than absolute frequencies, enabling systematic analysis of transpositions and modulations.

### 2. Tanāghīm (Tuning Systems)
Mathematical frameworks providing fundamental pitch relationships with assigned note names following the historical Arab-Ottoman-Persian convention (yegāh, ʿushayrān, rāst, dūgāh, etc.).

### 3. Ajnās (Tetrachords)
Melodic fragments of 3-5 pitch classes serving as building blocks for maqāmāt. The platform automatically determines compatibility with tuning systems and generates all possible transpositions.

### 4. Maqāmāt (Modal Structures)
Complete modal frameworks with ascending (ṣuʿūd) and descending (hubūṭ) sequences, analyzed for constituent ajnās and modulation possibilities.

### 5. Suyūr (Melodic Pathways)
Traditional performance practices and characteristic progressions that define how maqāmāt unfold in practice.

### 6. Intiqālāt (Modulations)
Systematic analysis of transitions between maqāmāt based on historical theoretical frameworks.

## Technical Architecture

### Core Technologies
- **Frontend**: Next.js 15+ with React 19+
- **Language**: TypeScript for comprehensive type safety
- **Styling**: SCSS with modular component architecture
- **UI Framework**: Material-UI (MUI) for consistent design
- **Audio Engine**: Custom Web Audio API implementation
- **Music Notation**: VexFlow for staff notation rendering
- **Documentation**: TypeDoc for API documentation generation

### Project Structure
```
src/
├── app/                    # Next.js app router pages
├── components/             # Interactive UI components
├── contexts/              # React Context providers
├── functions/             # Core computational logic
├── models/                # TypeScript data models
├── audio/                 # Audio synthesis and utilities
└── styles/               # SCSS stylesheets

packages/
└── arabic-maqam-core/     # NPM package for external use
    ├── src/
    │   ├── models/        # Core data structures
    │   ├── functions/     # Utility functions
    │   └── data/          # Static JSON datasets
    └── dist/              # Compiled library

data/                      # JSON data files
├── ajnas.json            # Jins definitions
├── maqamat.json          # Maqam definitions
├── tuningSystems.json    # Tuning system data
└── sources.json          # Academic references
```

## Arabic Maqam Core Library

The platform includes a standalone NPM package `arabic-maqam-core` that provides comprehensive maqām modeling for developers and researchers:

```bash
npm install arabic-maqam-core
```

### Key Features
- **Complete Data Sets**: Pre-loaded JSON data for maqāmāt, ajnās, tuning systems, and academic sources
- **TypeScript Models**: Fully typed interfaces for all musical concepts
- **Utility Functions**: Comprehensive set of functions for music theory calculations
- **Modular Design**: Import only what you need with organized subpath exports
- **Tree-Shaking Friendly**: Only bundle what you actually use

### Usage Examples

```typescript
// Import specific modules
import { Maqam, Jins, TuningSystem } from 'arabic-maqam-core/models';
import { transpose, modulate } from 'arabic-maqam-core/functions';
import { maqamatData, ajnasData } from 'arabic-maqam-core/data';

// Work with maqām data
const maqam = new Maqam(maqamatData[0]);
const transpositions = transpose(maqam, tuningSystem);
```

## Core Algorithms

### Transposition System
The platform implements sophisticated transposition algorithms that:
- Search through tuning systems recursively to find valid starting points
- Preserve intervallic relationships while adapting to different tonal centers
- Generate systematic naming conventions (e.g., "jins kurd al-muhayyar")
- Maintain authenticity through pattern matching rather than fixed interval shifts

### Modulation Analysis
Implementation of Al-Shawwā's 1946 modulation guidelines through:
- Algorithmic analysis of shared pitch classes between maqāmāt
- Identification of common ajnās serving as modulation pivots
- Systematic generation of possible transition pathways
- Historical validation against traditional performance practices

### Compatibility Detection
Advanced algorithms determine:
- Which ajnās can be constructed within specific tuning systems
- Valid maqām transpositions across different tonal centers
- Optimal starting points for melodic development
- Relationships between different theoretical frameworks

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Development Setup
```bash
# Clone the repository
git clone https://github.com/Music-Intelligence-Lab/maqam-network.git
cd maqam-network

# Install dependencies
npm install

# Start development server
npm run dev

# Generate documentation
npm run docs
```

### Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Research Applications

The platform serves multiple research purposes:

### Music Information Retrieval
- Ground truth datasets for algorithm training and validation
- Standardized representations of microtonal musical structures
- Comprehensive metadata for cross-cultural music analysis

### Computational Musicology
- Algorithmic implementation of historical theoretical frameworks
- Digital preservation of endangered musical knowledge
- Comparative analysis across different maqām traditions

### Educational Technology
- Interactive learning tools for complex musical concepts
- Visualization of abstract theoretical relationships
- Multilingual access to specialized musical knowledge

## Academic Context

This work contributes to the growing field of culture-specific computational musicology, addressing the need for approaches that consider sociocultural specifics rather than imposing Anglo-European frameworks on global musical practices. The platform follows methodologies advocated by Serra et al. (2017) and addresses limitations identified in existing music information retrieval applications.

## Links

- **Live Application**: [https://arabic-maqam-network.vercel.app/](https://arabic-maqam-network.vercel.app/)
- **NPM Package**: [https://www.npmjs.com/package/arabic-maqam-core](https://www.npmjs.com/package/arabic-maqam-core)
