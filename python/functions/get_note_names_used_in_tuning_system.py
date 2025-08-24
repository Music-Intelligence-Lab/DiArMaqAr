"""
Get note names used in a tuning system for analysis and display.

Provides utilities to extract and analyze the note names that appear
across different octaves in a tuning system configuration.
"""

from typing import List, Set, Dict, Optional, Tuple
from collections import Counter

from ..models.tuning_system import TuningSystem
from ..models.note_name import NoteName
from ..models.pitch_class import PitchClass
from .get_tuning_system_cells import get_tuning_system_cells


def get_note_names_used_in_tuning_system(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> List[str]:
    """
    Get all unique note names used in a tuning system.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        List of unique note names used
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    note_names = set()
    
    for pc in pitch_classes:
        if hasattr(pc, 'note') and pc.note:
            # Extract the base note name (without octave)
            base_note = extract_base_note_name(pc.note)
            if base_note:
                note_names.add(base_note)
    
    return sorted(list(note_names))


def extract_base_note_name(note_name: str) -> Optional[str]:
    """
    Extract the base note name without octave number.
    
    Args:
        note_name: Full note name (e.g., "C4", "F#5", "Bb3")
        
    Returns:
        Base note name (e.g., "C", "F#", "Bb") or None if invalid
    """
    if not note_name:
        return None
    
    # Remove octave numbers and whitespace
    import re
    base_note = re.sub(r'\d+', '', note_name).strip()
    
    # Handle common flat/sharp notation
    base_note = base_note.replace('♭', 'b').replace('♯', '#')
    
    return base_note if base_note else None


def get_note_names_by_octave(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> Dict[int, List[str]]:
    """
    Get note names organized by octave.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        Dictionary mapping octave numbers to lists of note names
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    notes_by_octave = {}
    
    for pc in pitch_classes:
        if hasattr(pc, 'note') and pc.note:
            octave = extract_octave_number(pc.note)
            base_note = extract_base_note_name(pc.note)
            
            if octave is not None and base_note:
                if octave not in notes_by_octave:
                    notes_by_octave[octave] = []
                
                if base_note not in notes_by_octave[octave]:
                    notes_by_octave[octave].append(base_note)
    
    # Sort notes within each octave
    for octave in notes_by_octave:
        notes_by_octave[octave] = sorted(notes_by_octave[octave])
    
    return notes_by_octave


def extract_octave_number(note_name: str) -> Optional[int]:
    """
    Extract the octave number from a note name.
    
    Args:
        note_name: Full note name (e.g., "C4", "F#5")
        
    Returns:
        Octave number or None if not found
    """
    if not note_name:
        return None
    
    import re
    octave_match = re.search(r'\d+', note_name)
    if octave_match:
        try:
            return int(octave_match.group())
        except ValueError:
            return None
    
    return None


def get_note_name_frequency_analysis(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> Dict[str, Dict[str, any]]:
    """
    Analyze the frequency of note names across the tuning system.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        Dictionary with frequency analysis for each note name
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    note_counter = Counter()
    note_frequencies = {}
    note_octaves = {}
    
    for pc in pitch_classes:
        if hasattr(pc, 'note') and pc.note:
            base_note = extract_base_note_name(pc.note)
            octave = extract_octave_number(pc.note)
            
            if base_note:
                note_counter[base_note] += 1
                
                # Track frequencies for this note
                if base_note not in note_frequencies:
                    note_frequencies[base_note] = []
                
                if hasattr(pc, 'frequency') and pc.frequency:
                    try:
                        freq = float(pc.frequency)
                        note_frequencies[base_note].append(freq)
                    except (ValueError, TypeError):
                        pass
                
                # Track octaves for this note
                if base_note not in note_octaves:
                    note_octaves[base_note] = set()
                
                if octave is not None:
                    note_octaves[base_note].add(octave)
    
    # Compile analysis
    analysis = {}
    for note in note_counter:
        frequencies = note_frequencies.get(note, [])
        octaves = sorted(list(note_octaves.get(note, set())))
        
        analysis[note] = {
            "count": note_counter[note],
            "octaves": octaves,
            "octave_span": len(octaves),
            "frequencies": frequencies,
            "frequency_range": {
                "min": min(frequencies) if frequencies else None,
                "max": max(frequencies) if frequencies else None,
                "count": len(frequencies)
            }
        }
    
    return analysis


def get_chromatic_note_names() -> List[str]:
    """
    Get the standard chromatic note names.
    
    Returns:
        List of chromatic note names
    """
    return [
        "C", "C#", "D", "D#", "E", "F", 
        "F#", "G", "G#", "A", "A#", "B"
    ]


def get_enharmonic_equivalents(note_name: str) -> List[str]:
    """
    Get enharmonic equivalents for a note name.
    
    Args:
        note_name: Base note name
        
    Returns:
        List of enharmonic equivalents
    """
    enharmonic_map = {
        "C#": ["Db"],
        "Db": ["C#"],
        "D#": ["Eb"],
        "Eb": ["D#"],
        "F#": ["Gb"],
        "Gb": ["F#"],
        "G#": ["Ab"],
        "Ab": ["G#"],
        "A#": ["Bb"],
        "Bb": ["A#"]
    }
    
    return enharmonic_map.get(note_name, [])


def normalize_note_name(note_name: str, prefer_sharps: bool = True) -> str:
    """
    Normalize a note name to standard format.
    
    Args:
        note_name: Note name to normalize
        prefer_sharps: Whether to prefer sharps over flats
        
    Returns:
        Normalized note name
    """
    if not note_name:
        return ""
    
    base_note = extract_base_note_name(note_name)
    if not base_note:
        return note_name
    
    # Normalize accidentals
    normalized = base_note.replace('♭', 'b').replace('♯', '#')
    
    # Apply preference for sharps vs flats
    if not prefer_sharps:
        sharp_to_flat = {
            "C#": "Db", "D#": "Eb", "F#": "Gb", 
            "G#": "Ab", "A#": "Bb"
        }
        normalized = sharp_to_flat.get(normalized, normalized)
    
    return normalized


def get_missing_chromatic_notes(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> List[str]:
    """
    Find chromatic notes that are missing from the tuning system.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        List of missing chromatic note names
    """
    used_notes = set(get_note_names_used_in_tuning_system(tuning_system, starting_note))
    chromatic_notes = set(get_chromatic_note_names())
    
    # Normalize used notes
    normalized_used = set()
    for note in used_notes:
        normalized = normalize_note_name(note, prefer_sharps=True)
        normalized_used.add(normalized)
        # Also add enharmonic equivalents
        for equiv in get_enharmonic_equivalents(normalized):
            normalized_used.add(equiv)
    
    missing_notes = chromatic_notes - normalized_used
    return sorted(list(missing_notes))


def get_microtonal_note_names(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> List[str]:
    """
    Get note names that represent microtonal intervals.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        List of microtonal note names
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    microtonal_notes = []
    chromatic_notes = set(get_chromatic_note_names())
    
    for pc in pitch_classes:
        if hasattr(pc, 'note') and pc.note:
            base_note = extract_base_note_name(pc.note)
            if base_note and base_note not in chromatic_notes:
                # Check if it's not just an enharmonic equivalent
                is_enharmonic = any(
                    base_note in get_enharmonic_equivalents(chromatic_note)
                    for chromatic_note in chromatic_notes
                )
                
                if not is_enharmonic:
                    microtonal_notes.append(base_note)
    
    return sorted(list(set(microtonal_notes)))


def analyze_note_name_patterns(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> Dict[str, any]:
    """
    Analyze patterns in note naming within the tuning system.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        Dictionary with pattern analysis
    """
    used_notes = get_note_names_used_in_tuning_system(tuning_system, starting_note)
    frequency_analysis = get_note_name_frequency_analysis(tuning_system, starting_note)
    notes_by_octave = get_note_names_by_octave(tuning_system, starting_note)
    
    # Count accidentals
    sharp_count = sum(1 for note in used_notes if '#' in note)
    flat_count = sum(1 for note in used_notes if 'b' in note)
    natural_count = len(used_notes) - sharp_count - flat_count
    
    # Analyze octave distribution
    octave_counts = {octave: len(notes) for octave, notes in notes_by_octave.items()}
    
    return {
        "total_unique_notes": len(used_notes),
        "chromatic_coverage": len(used_notes) / 12 * 100,  # Percentage of chromatic scale covered
        "accidental_distribution": {
            "naturals": natural_count,
            "sharps": sharp_count,
            "flats": flat_count
        },
        "octave_distribution": octave_counts,
        "most_frequent_notes": [
            note for note, data in frequency_analysis.items()
            if data["count"] == max(data["count"] for data in frequency_analysis.values())
        ],
        "microtonal_notes": get_microtonal_note_names(tuning_system, starting_note),
        "missing_chromatic_notes": get_missing_chromatic_notes(tuning_system, starting_note)
    }


def get_note_name_mappings(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> Dict[str, List[Tuple[str, float]]]:
    """
    Get mappings from note names to their frequencies.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for the system
        
    Returns:
        Dictionary mapping note names to (full_name, frequency) tuples
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    mappings = {}
    
    for pc in pitch_classes:
        if hasattr(pc, 'note') and pc.note and hasattr(pc, 'frequency') and pc.frequency:
            base_note = extract_base_note_name(pc.note)
            
            if base_note:
                if base_note not in mappings:
                    mappings[base_note] = []
                
                try:
                    frequency = float(pc.frequency)
                    mappings[base_note].append((pc.note, frequency))
                except (ValueError, TypeError):
                    continue
    
    # Sort by frequency within each note group
    for note in mappings:
        mappings[note].sort(key=lambda x: x[1])  # Sort by frequency
    
    return mappings
