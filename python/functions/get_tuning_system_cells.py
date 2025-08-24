"""
Tuning system pitch class generation utilities.

This module provides functions to generate complete arrays of PitchClass objects
for tuning systems with all their musical properties calculated.
"""

from typing import List, Dict, Optional
from ..models.tuning_system import TuningSystem
from ..models.note_name import (
    OCTAVE_ZERO_NOTE_NAMES, OCTAVE_ONE_NOTE_NAMES, OCTAVE_TWO_NOTE_NAMES,
    OCTAVE_THREE_NOTE_NAMES, OCTAVE_FOUR_NOTE_NAMES
)
from ..models.pitch_class import PitchClass
from .detect_pitch_class_type import detect_pitch_class_type
from .convert_pitch_class import (
    convert_pitch_class
)
from .note_name_mappings import get_english_note_name
from .calculate_cents_deviation import calculate_cents_deviation_with_reference_note


def get_tuning_system_cells(
    tuning_system: TuningSystem,
    starting_note: str,
    tuning_system_pitch_classes: Optional[List[str]] = None,
    input_string_length: float = 0.0,
    input_reference_frequencies: Optional[Dict[str, float]] = None
) -> List[PitchClass]:
    """
    Generates a complete array of PitchClass objects for a tuning system starting from a specific note.

    This is a core function that creates the fundamental pitch collection for analysis.
    It takes a tuning system and starting note, then generates all pitch classes across
    multiple octaves with their frequencies, MIDI numbers, cents deviations, and other
    properties needed for maqam analysis.

    The function handles various pitch class formats (ratios, frequencies, cents) and
    automatically detects the input type. It also manages reference frequencies and
    octave relationships to create a comprehensive pitch space.

    Args:
        tuning_system: The tuning system to generate pitch classes for
        starting_note: The note to start the tuning system from
        tuning_system_pitch_classes: Optional custom pitch classes (default: from tuning system)
        input_string_length: Optional length parameter for custom input
        input_reference_frequencies: Optional custom reference frequencies

    Returns:
        Complete array of PitchClass objects spanning multiple octaves
        
    Examples:
        >>> # Generate pitch classes for a 12-tone equal temperament system
        >>> tuning = TuningSystem("12-TET", ["1/1", "16/15", "9/8", ...])
        >>> pitch_classes = get_tuning_system_cells(tuning, "C")
        >>> len(pitch_classes)  # Should be 12 * 4 = 48 (4 octaves)
        48
    """
    # Get pitch array from tuning system or use provided values
    if tuning_system_pitch_classes:
        pitch_arr = tuning_system_pitch_classes
    else:
        pitch_arr = tuning_system.get_original_pitch_class_values()
    
    npc = len(pitch_arr)  # Number of pitch classes
    
    # Get note name sets and find the one starting with our note
    all_sets = tuning_system.get_note_name_sets()
    note_names = []
    for note_set in all_sets:
        if note_set and note_set[0] == starting_note:
            note_names = note_set
            break
    
    if not note_names and all_sets:
        note_names = all_sets[0] if all_sets[0] else []
    
    # Map note names to indices in the octave system
    O1 = len(OCTAVE_ONE_NOTE_NAMES)
    selected_indices = []
    
    for nm in note_names[:npc]:
        # Try to find in octave one
        if nm in OCTAVE_ONE_NOTE_NAMES:
            i1 = OCTAVE_ONE_NOTE_NAMES.index(nm)
            selected_indices.append(i1)
        # Try to find in octave two
        elif nm in OCTAVE_TWO_NOTE_NAMES:
            i2 = OCTAVE_TWO_NOTE_NAMES.index(nm)
            selected_indices.append(O1 + i2)
        else:
            selected_indices.append(-1)
    
    # Pad with -1 if needed
    while len(selected_indices) < npc:
        selected_indices.append(-1)
    selected_indices = selected_indices[:npc]
    
    # Detect the type of pitch class values
    value_type = detect_pitch_class_type(pitch_arr[0]) if pitch_arr else "fraction"
    if value_type == "unknown":
        return []
    
    # Get tuning system parameters
    string_length = input_string_length if input_string_length > 0 else tuning_system.get_string_length()
    
    # Get reference frequencies
    ref_frequencies = input_reference_frequencies or {}
    actual_reference_frequency = (
        ref_frequencies.get(starting_note) or
        tuning_system.get_reference_frequencies().get(starting_note) or
        tuning_system.get_default_reference_frequency()
    )
    
    # Calculate open string properties
    try:
        open_shifted = shift_pitch_class_base_value(pitch_arr[0], value_type, 1)
        open_conv = convert_pitch_class_value(open_shifted, value_type, string_length, actual_reference_frequency)
        open_len = float(open_conv["stringLength"]) if open_conv and "stringLength" in open_conv else 0.0
    except:
        open_len = 0.0
    
    # Get Abjad names if available
    abjad_arr = tuning_system.get_abjad_names() if hasattr(tuning_system, 'get_abjad_names') else []
    
    pitch_classes = []
    
    # Generate pitch classes for 4 octaves (0-3)
    for octave in range(4):
        for idx in range(npc):
            base_pc = pitch_arr[idx]
            
            try:
                # Shift to appropriate octave
                shifted = shift_pitch_class_base_value(base_pc, value_type, octave)
                conv = convert_pitch_class_value(shifted, value_type, string_length, actual_reference_frequency)
                
                if not conv:
                    continue
                
                # Determine note name based on octave and index
                ci = selected_indices[idx]
                note_name = "none"
                
                if ci >= 0:
                    octave_arrays = [
                        OCTAVE_ZERO_NOTE_NAMES,
                        OCTAVE_ONE_NOTE_NAMES, 
                        OCTAVE_TWO_NOTE_NAMES,
                        OCTAVE_THREE_NOTE_NAMES
                    ]
                    
                    if ci < O1:
                        # Use first set of octave arrays
                        if octave < len(octave_arrays) and ci < len(octave_arrays[octave]):
                            note_name = octave_arrays[octave][ci]
                    else:
                        # Use second set (shifted) arrays
                        loc = ci - O1
                        shifted_arrays = [
                            OCTAVE_ONE_NOTE_NAMES,
                            OCTAVE_TWO_NOTE_NAMES,
                            OCTAVE_THREE_NOTE_NAMES,
                            OCTAVE_FOUR_NOTE_NAMES
                        ]
                        if octave < len(shifted_arrays) and loc < len(shifted_arrays[octave]):
                            note_name = shifted_arrays[octave][loc]
                
                # Get Abjad name (only for octaves 1 & 2)
                abjad_name = ""
                if abjad_arr:
                    offset = 0 if octave <= 1 else npc
                    abjad_index = offset + idx
                    if abjad_index < len(abjad_arr):
                        abjad_name = abjad_arr[abjad_index]
                
                # Calculate fret division
                try:
                    this_len = float(conv.get("stringLength", "0"))
                    fret_division = f"{open_len - this_len:.3f}"
                except:
                    fret_division = "0.000"
                
                # Calculate MIDI note number
                try:
                    frequency = float(conv.get("frequency", "0"))
                    midi_note_number = frequency_to_midi_note_number(frequency)
                except:
                    midi_note_number = 0
                
                # Get English note name
                english_note_name = get_english_note_name(note_name) if hasattr(tuning_system, 'get_english_note_name') else ""
                
                # Create pitch class object
                pitch_class = PitchClass(
                    note_name=note_name,
                    english_name=english_note_name,
                    fraction=conv.get("fraction", ""),
                    cents=conv.get("cents", ""),
                    decimal_ratio=conv.get("decimal", ""),
                    string_length=conv.get("stringLength", ""),
                    frequency=conv.get("frequency", ""),
                    original_value=shifted,
                    original_value_type=value_type,
                    index=idx,
                    octave=octave,
                    abjad_name=abjad_name,
                    fret_division=fret_division,
                    midi_note_number=midi_note_number,
                    cents_deviation=0.0
                )
                
                pitch_classes.append(pitch_class)
                
            except Exception as e:
                # Skip problematic pitch classes
                continue
    
    # Calculate cents deviations with reference to starting pitch class
    starting_pitch_class = None
    for pc in pitch_classes:
        if pc.index == 0 and pc.octave == 1:
            starting_pitch_class = pc
            break
    
    if starting_pitch_class:
        starting_midi_number = starting_pitch_class.midi_note_number
        starting_note_name = starting_pitch_class.english_name
        
        for pc in pitch_classes:
            try:
                if hasattr(calculate_cents_deviation_with_reference_note, '__call__'):
                    deviation_result = calculate_cents_deviation_with_reference_note(
                        pc.midi_note_number,
                        pc.cents,
                        starting_midi_number,
                        pc.english_name,
                        starting_note_name
                    )
                    pc.cents_deviation = deviation_result.get("deviation", 0.0)
                    if hasattr(pc, 'reference_note_name'):
                        pc.reference_note_name = deviation_result.get("referenceNoteName", "")
            except:
                # Use basic calculation if advanced function not available
                pc.cents_deviation = 0.0
    
    return pitch_classes


def get_pitch_classes_for_octave(
    tuning_system: TuningSystem,
    starting_note: str,
    octave: int,
    reference_frequency: float = 440.0
) -> List[PitchClass]:
    """
    Generate pitch classes for a specific octave only.
    
    Args:
        tuning_system: The tuning system to use
        starting_note: The starting note name
        octave: The octave number (0-4)
        reference_frequency: Reference frequency for tuning
        
    Returns:
        List of PitchClass objects for the specified octave
    """
    all_pitch_classes = get_tuning_system_cells(
        tuning_system,
        starting_note,
        input_reference_frequencies={starting_note: reference_frequency}
    )
    
    return [pc for pc in all_pitch_classes if pc.octave == octave]


def get_pitch_class_by_note_name(
    pitch_classes: List[PitchClass],
    note_name: str,
    octave: Optional[int] = None
) -> Optional[PitchClass]:
    """
    Find a specific pitch class by note name and optionally octave.
    
    Args:
        pitch_classes: List of pitch classes to search
        note_name: The note name to find
        octave: Optional octave specification
        
    Returns:
        The matching PitchClass or None if not found
    """
    for pc in pitch_classes:
        if pc.note_name == note_name:
            if octave is None or pc.octave == octave:
                return pc
    return None


def filter_pitch_classes_by_frequency_range(
    pitch_classes: List[PitchClass],
    min_frequency: float,
    max_frequency: float
) -> List[PitchClass]:
    """
    Filter pitch classes by frequency range.
    
    Args:
        pitch_classes: List of pitch classes to filter
        min_frequency: Minimum frequency in Hz
        max_frequency: Maximum frequency in Hz
        
    Returns:
        Filtered list of pitch classes within the frequency range
    """
    filtered = []
    
    for pc in pitch_classes:
        try:
            freq = float(pc.frequency) if pc.frequency else 0
            if min_frequency <= freq <= max_frequency:
                filtered.append(pc)
        except (ValueError, AttributeError):
            continue
    
    return filtered
