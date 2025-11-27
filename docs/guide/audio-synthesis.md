---
title: Audio Synthesis
description: Real-time audio synthesis capabilities for auditioning maqāmāt and tuning systems
---

# Audio Synthesis

DiArMaqAr provides real-time audio synthesis capabilities that allow users to audition precise intonational relationships of maqāmāt and their ajnās across different tuning systems, hearing the theoretical data as actual sound.

## Overview

Real-time audio synthesis utilizes the Web Audio API through a dedicated SoundContext provider that manages oscillator nodes, envelope control, and MIDI integration. This enables immediate auditory feedback for theoretical concepts, making abstract relationships tangible through sound.

## Key Features

### Individual Note Playback
- Select any pitch class and hear its precise intonation
- Compare intervals between different notes
- Audition tuning system pitch classes independently of maqām structures

### Sequence Synthesis
- Play ascending sequences of maqāmāt or ajnās
- Play descending sequences
- Pattern playback with rhythmic variations
- Demonstrate modal character beyond abstract sequences

### Pattern Playback
- Pre-defined melodic patterns (patterns.json)
- Customizable tempo (BPM)
- Rhythmic cells and motifs
- Dynamic control (velocity specifications)

## Waveform Support

The audio system supports multiple periodic and aperiodic waveforms:

**Periodic Waveforms:**
- Sine
- Triangle
- Sawtooth
- Square

**Aperiodic Waveforms:**
- Multiple custom waveforms (as utilized in Scale Workshop)
- Rich harmonic content options
- Instrument-like timbres

### Envelope Control (ADSR)

Precise control over sound articulation:
- **Attack**: Initial rise time (default: 0.01s)
- **Decay**: Initial fall time (default: 0.20s)
- **Sustain**: Sustained level (default: 0.50)
- **Release**: Final fall time (default: 0.40s)

This allows for:
- Realistic musical articulation
- Expressive control
- Comparison between different tunings with consistent articulation

## Tuning System Fidelity

The audio synthesis maintains **mathematical precision** when rendering tuning systems:

- **Non-12-EDO intervals**: Accurately rendered without artifacts
- **Fractional ratios**: Precisely calculated frequencies
- **Historical tunings**: Authentic intonational relationships
- **No quantization**: Continuous pitch variation preserved

## Real-Time Processing

The implementation ensures:
- **Low latency**: Suitable for real-time interaction
- **Responsive interface**: No blocking during audio generation
- **Smooth playback**: Continuous sequences without gaps
- **Performance optimization**: Efficient Web Audio API usage

## Interactive Features

### Keyboard Input
- Computer keyboard mapping to pitch classes
- Real-time response to key presses
- Visual feedback on pitch class bar
- Immediate auditory feedback

### MIDI Integration
- External MIDI controller support
- Real-time input processing
- Low-latency response
- Both monophonic and polyphonic capabilities

See the [MIDI Integration Guide](/guide/midi-integration/) for detailed MIDI features.

## Research Applications

Real-time audio synthesis enables:

### Comparative Listening
- Compare same maqām across different tuning systems
- Hear how historical tunings affect modal character
- Understand theoretical differences through direct experience

### Educational Use
- Students can hear theoretical concepts
- Immediate feedback on learning materials
- Auditory reinforcement of visual/analytical work

### Compositional Exploration
- Composers can audition theoretical possibilities
- Discover new harmonic/melodic relationships
- Explore tuning systems before composition

## Technical Implementation

The audio system:
- Uses Web Audio API for browser-based synthesis
- Supports all major browsers (Chrome, Firefox, Safari, Edge)
- Implements graceful degradation for older platforms
- Manages oscillator nodes efficiently
- Handles precise frequency calculations for all intervals

## Limitations

Current implementation focuses on:
- Theoretical representation (not performance practice analysis)
- Synthetic waveforms (not sampled instruments)
- Browser-based synthesis (subject to browser audio limitations)

Future enhancements could include:
- Audio analysis capabilities for recorded performances
- Integration with digital audio workstations
- Mobile application support
- Expanded waveform library

## Next Steps

- Learn about [MIDI Integration](/guide/midi-integration/) for advanced control
- Explore [Data Export](/guide/data-export/) for external synthesis
- Understand how audio relates to [Tuning Systems](/guide/tuning-systems/)

