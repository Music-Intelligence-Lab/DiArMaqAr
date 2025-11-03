---
title: MIDI Integration
description: MIDI input/output capabilities including MPE support for microtonal playback
---

# MIDI Integration

DiArMaqAr implements sophisticated MIDI integration allowing users to interact with any tuning system, or the subsequences of ajnās or maqāmāt, through both computer keyboard and MIDI controller input, with precise microtonal output capabilities.

## Overview

The platform supports comprehensive MIDI functionality:
- **Input**: Computer keyboard and MIDI controllers
- **Output**: Monophonic and MPE (MIDI Polyphonic Expression)
- **Precision**: 14-bit pitch bend for accurate microtonal intervals
- **Real-time**: Low-latency response for live exploration

## MIDI Input

### Computer Keyboard
- QWERTY keyboard mapping to pitch classes
- Visual feedback on interface
- Immediate response
- No additional hardware required

### MIDI Controllers
- External MIDI device support
- Real-time input processing
- Low-latency response
- Works with any MIDI-compatible controller

**Setup:**
1. Connect MIDI controller to computer
2. Browser will detect available MIDI devices
3. Select device from interface
4. Start playing

## MIDI Output

### Monophonic Output
- Standard MIDI protocol
- Single channel output
- Wide accessibility
- Compatible with most software and hardware

### MPE (MIDI Polyphonic Expression)

**What is MPE?**
MIDI Polyphonic Expression enables accurate tuning of polyphonic software and hardware synthesizers without tuning artifacts. Traditional MIDI uses pitch bend on a single channel for all voices, causing conflicts when playing microtonal harmonies.

**How MPE Works:**
- Each voice gets its own MIDI channel
- Individual pitch bend per channel
- No conflicts between simultaneous pitches
- Precise microtonal intervals preserved

**MPE Precision:**
- **14-bit pitch bend**: High resolution control messages
- **Accurate conversion**: Fractional ratios and cents converted to precise MIDI values
- **No artifacts**: Pitch relationships remain accurate in digital audio workstations
- **Polyphonic harmony**: Multiple microtonal pitches simultaneously

## Pitch Bend Calculation

The system uses 14-bit pitch bend calculations to achieve precise microtonal intervals:

**Process:**
1. Converts fractional ratios/cents to target frequency
2. Calculates deviation from 12-EDO equivalent
3. Generates 14-bit pitch bend value
4. Sends on appropriate MIDI channel (MPE) or channel 1 (monophonic)

**Precision:**
- Maintains mathematical accuracy
- Preserves pitch relationships essential to traditional practice
- Enables authentic microtonal playback in external systems

## Use Cases

### Live Performance
- Perform maqāmāt using MIDI controllers
- Real-time exploration of tuning systems
- Integration with external synthesizers

### Composition
- Export MIDI data to DAWs
- Use MPE-capable instruments
- Create compositions with authentic tunings

### Research
- Audition theoretical data through external systems
- Compare different synthesizers/samplers
- Test tuning system compatibility

### Education
- Interactive learning with MIDI keyboards
- Hands-on exploration of maqāmic relationships
- Integration with music education tools

## Technical Details

### Voice Distribution (MPE)
The system manages voice distribution across multiple MIDI channels:
- Automatic channel assignment
- Voice allocation and release
- Conflict prevention
- Efficient channel management

### Latency
- **Low-latency processing**: Real-time input handling
- **Optimized routing**: Direct MIDI I/O
- **Browser compatibility**: Works with Web MIDI API

### Compatibility
- **Hardware**: Any MIDI-compatible controller
- **Software**: DAWs supporting MIDI and MPE
- **Browsers**: Chrome, Edge, Opera (Web MIDI API support)

## Integration with DAWs

DiArMaqAr MIDI output can be used with:
- **Ableton Live**: MPE support for microtonal playback
- **Logic Pro**: MIDI and MPE compatibility
- **Bitwig Studio**: Native MPE support
- **Reaper**: MIDI routing capabilities
- **Any DAW**: Basic MIDI output (monophonic mode)

## Limitations

- **Browser support**: Web MIDI API not available in all browsers
- **MPE requirement**: External systems must support MPE for polyphonic microtonal playback
- **Latency**: Browser audio processing may introduce slight latency

## Next Steps

- Learn about [Audio Synthesis](/guide/audio-synthesis/) capabilities
- Explore [Data Export](/guide/data-export/) including Scala formats
- Understand [Tuning Systems](/guide/tuning-systems/) for MIDI applications

