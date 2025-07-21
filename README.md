# 🎶 Arabic Maqām Network

An innovative open-access online platform for the study and exploration of the Arabic maqām system, built with Next.js and TypeScript.

## 🌟 Overview

The **Arabic Maqām Network** is a comprehensive, interactive web application dedicated to preserving, analyzing, and exploring the rich musical heritage of the Arabic-speaking region. Developed by **Dr. Khyam Allami** and **Ibrahim El Khansa** at the **Music Intelligence Lab** at the **American University of Beirut**, this platform serves as an invaluable resource for students, musicians, composers, musicologists, educators, researchers, and anyone interested in Arabic music theory.

## ✨ Features

- **Interactive Tuning Systems**: Explore various historical and contemporary Arabic tuning systems
- **Comprehensive Maqām Database**: Detailed catalog of maqāmāt with their ascending/descending forms
- **Ajnās Library**: Collection of melodic fragments that form the building blocks of maqāmāt
- **Suyūr Analysis**: Study melodic pathways and performance practices
- **Real-time Audio Synthesis**: Play and hear scales using computer keyboard or MIDI
- **Modulation Analysis**: Explore intiqālāt (modulations) between different maqāmāt
- **Academic References**: Scholarly sources and citations for all musical data
- **Export Capabilities**: Export scales to various formats including Scala (.scl)
- **Staff Notation**: Visual representation using VexFlow
- **Transposition Tools**: Analyze scales across different starting pitches

## 🏗️ Architecture

### Core Technologies

- **Frontend**: Next.js 15+ with React 19+
- **Language**: TypeScript for type safety and better development experience
- **Styling**: SCSS for modular styling
- **UI Components**: Material-UI (MUI) for consistent design
- **Audio**: Custom synthesis engine with WebMIDI support
- **Music Notation**: VexFlow for staff notation rendering
- **Build System**: Modern Next.js build pipeline with ESLint

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
├── contexts/              # React Context providers
├── functions/             # Core business logic
├── models/                # TypeScript data models
├── audio/                 # Audio synthesis and utilities
└── styles/               # SCSS stylesheets

data/                      # JSON data files
├── ajnas.json            # Jins definitions
├── maqamat.json          # Maqam definitions
├── tuningSystems.json    # Tuning system data
├── sources.json          # Academic references
└── patterns.json         # Musical patterns
```

## 🎼 Core Musical Concepts

### Tuning System (Tanghīm)
The foundation of the platform, defining pitch classes and their frequencies. Each tuning system includes:
- Metadata (title, creator, year, sources)
- Pitch classes (fractions, cents, or decimal ratios)
- Reference frequencies for accurate synthesis
- Traditional Arabic note names (Abjad notation)
- String length properties for instrument simulation

### Jins Details & Jins
- **Jins Details**: The theoretical definition of a melodic fragment (3-5 notes)
- **Jins**: The practical implementation within a specific tuning system
- Building blocks that combine to form complete maqāmāt
- Each jins includes note names, sources, and theoretical comments

### Maqam Details & Maqam
- **Maqam Details**: The theoretical definition of a complete musical mode
- **Maqam**: The practical implementation within a tuning system
- Contains ascending and descending note sequences
- Includes multiple suyūr (melodic pathways) for performance

### Sayr (Melodic Pathways)
Performance routes through a maqam, defining:
- Starting and ending points
- Emphasis notes and pauses
- Directional movements (ascending/descending)
- Integration with specific ajnās

## 🔧 Key Components

### Data Models

#### `TuningSystem`
Central class managing pitch definitions and frequency mappings
- Supports multiple pitch representation formats
- Handles note name transliterations across 5 octaves
- Provides synthesis-ready frequency calculations

#### `JinsDetails` / `Jins`
- Details: Abstract definition with note names and sources
- Instance: Concrete implementation with pitch classes and intervals
- Validation against tuning system compatibility

#### `MaqamDetails` / `Maqam`
- Details: Abstract definition with ascending/descending sequences
- Instance: Concrete implementation with pitch analysis
- Support for asymmetric scales (different ascending/descending patterns)

#### `PitchClass`
Individual pitch representation including:
- Note name, octave, and cents value
- Multiple ratio representations (fraction, decimal, string length)
- Synthesis frequency calculation

### Core Functions

#### Analysis & Computation
- **Transposition Engine**: Generate all valid transpositions of maqāmāt and ajnās
- **Modulation Analysis**: Calculate possible transitions between scales
- **Interval Computation**: Precise microtonal interval calculations
- **Scale Validation**: Ensure theoretical consistency with tuning systems

#### Import/Export
- **Data Import**: Load musical data from JSON files with validation
- **Scala Export**: Generate industry-standard .scl files
- **Audio Export**: Synthesize scales for audio analysis
- **Academic Export**: Include scholarly references and metadata

#### User Interface
- **Context Management**: Global state management for musical selections
- **Real-time Updates**: Dynamic recalculation of dependent properties
- **Interactive Controls**: Keyboard and MIDI input handling
- **Visual Feedback**: Staff notation and pitch class visualization

## 🎵 Audio System

### Synthesis Engine
- Custom audio synthesis using Web Audio API
- Multiple timbre support (sine, sawtooth, etc.)
- Configurable attack/decay envelopes
- Real-time frequency modulation

### MIDI Integration
- WebMIDI API support for external controllers
- Note mapping to Arabic microtonal pitches
- Velocity and timing preservation
- Multi-device compatibility

### Playback Features
- Scale playback (ascending/descending)
- Individual note triggering
- Arpeggio and chord modes
- Real-time transposition

## 📊 Data Management

### JSON Data Structure
All musical data is stored in structured JSON files:
- **Validation**: TypeScript interfaces ensure data integrity
- **Versioning**: Academic sources track historical accuracy
- **Modularity**: Separate files for different musical concepts
- **Scalability**: Easy addition of new tuning systems and scales

### Academic Integrity
- **Source Tracking**: Every musical element links to academic references
- **Page Citations**: Specific page numbers for detailed research
- **Multi-language Support**: English and Arabic metadata
- **Historical Context**: Publication dates and scholarly attribution

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Music-Intelligence-Lab/maqam-network.git

# Navigate to project directory
cd maqam-network

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint checks
```

## 🎯 Usage Examples

### Basic Scale Exploration
1. Select a tuning system from the dropdown
2. Choose a starting note (pitch class)
3. Browse available maqāmāt or ajnās
4. Play scales using keyboard or MIDI
5. Export to Scala format for external use

### Advanced Analysis
1. Compare transpositions of the same maqam
2. Analyze modulation possibilities between scales
3. Study interval structures and microtonal relationships
4. Export detailed analytical data with academic references

### Educational Applications
1. Demonstrate historical tuning variations
2. Compare theoretical vs. practical implementations
3. Explore regional variations in maqam definitions
4. Generate exercises for ear training and analysis

## 🔬 Technical Details

### Performance Optimization
- **Lazy Loading**: Components load on demand
- **Memoization**: Expensive calculations are cached
- **Virtual Scrolling**: Efficient handling of large datasets
- **Code Splitting**: Reduced bundle sizes for faster loading

### Browser Compatibility
- Modern browsers with Web Audio API support
- WebMIDI support where available
- Progressive enhancement for missing features
- Responsive design for various screen sizes

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Configurable font sizes and colors

## 📈 Future Development

### Planned Features
- **Comparative Analysis**: Side-by-side tuning system comparison
- **Multiple Suyūr**: Enhanced support for various melodic pathways
- **Machine Learning**: Pattern recognition in maqam structures
- **Collaboration Tools**: Shared workspaces for researchers
- **Mobile App**: Native mobile application development

### Research Applications
- **Computational Musicology**: Large-scale analysis of Arabic music theory
- **Historical Studies**: Evolution of tuning systems over time
- **Cross-cultural Analysis**: Comparison with other modal systems
- **Performance Practice**: Integration of recorded musical examples

## 🤝 Contributing

We welcome contributions from the global community! Please see our contributing guidelines for:
- Code style and standards
- Data validation requirements
- Academic source verification
- Testing procedures
- Documentation standards

## 📄 License

This project is open-source and available under the appropriate license. Please refer to the LICENSE file for detailed terms.

## 🙏 Acknowledgments

- **Dr. Khyam Allami**: Research and development leadership
- **Ibrahim El Khansa**: Technical implementation and design
- **Music Intelligence Lab**: Research support and academic guidance
- **American University of Beirut**: Institutional support
- **Arabic Music Community**: Historical preservation and knowledge sharing

## 📞 Contact

For research collaborations, technical questions, or general inquiries:
- **Music Intelligence Lab**: [Contact Information]
- **GitHub Issues**: For bug reports and feature requests
- **Academic Inquiries**: For research and educational partnerships

---

**Arabic Maqām Network** - Preserving and exploring the musical heritage of the Arabic-speaking world through innovative technology and rigorous scholarship.
