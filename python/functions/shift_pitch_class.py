"""
Pitch class shifting operations for octave transpositions.

This module provides functions to shift pitch classes by octaves while
maintaining all musical relationships and tuning data accuracy.
"""

import math
from typing import List, Optional
from ..models.pitch_class import PitchClass


def create_empty_pitch_class() -> PitchClass:
    """
    Create an empty pitch class object used as a fallback when shifting operations fail.
    
    Returns:
        Empty pitch class with safe default values
    """
    return PitchClass(
        note_name="",
        fraction="",
        cents="",
        decimal_ratio="",
        string_length="",
        frequency="",
        english_name="",
        original_value="",
        original_value_type="",
        index=-1,
        octave=-1,
        abjad_name="",
        fret_division="",
        midi_note_number=0,
        cents_deviation=0.0
    )


def shift_pitch_class(
    all_pitch_classes: List[PitchClass], 
    pitch_class: Optional[PitchClass], 
    octave_shift: int
) -> PitchClass:
    """
    Shifts a pitch class by a specified number of octaves using array lookup.
    
    This is the preferred method for shifting pitch classes as it uses the
    pre-computed pitch class array for accuracy. It finds the target pitch
    class in a different octave by calculating the appropriate array index.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        pitch_class: The pitch class to shift (can be None)
        octave_shift: Number of octaves to shift (positive = up, negative = down)
        
    Returns:
        The shifted pitch class, or empty pitch class if operation fails
        
    Examples:
        >>> # Shift a pitch class up one octave
        >>> shifted = shift_pitch_class(all_pitches, original_pitch, 1)
        
        >>> # Shift a pitch class down two octaves  
        >>> shifted = shift_pitch_class(all_pitches, original_pitch, -2)
    """
    # Validate input pitch class
    if (not pitch_class or 
        not isinstance(pitch_class.index, int) or 
        not isinstance(pitch_class.octave, int)):
        return create_empty_pitch_class()
    
    # Find the pitch class in the array using index and octave
    pitch_class_index = -1
    for i, pc in enumerate(all_pitch_classes):
        if pc.index == pitch_class.index and pc.octave == pitch_class.octave:
            pitch_class_index = i
            break
    
    if pitch_class_index == -1:
        return create_empty_pitch_class()
    
    # Calculate the new array index after octave shift
    # Assumes 4 octaves total, so number_of_pitch_classes = total length / 4
    number_of_pitch_classes = len(all_pitch_classes) // 4
    new_index = pitch_class_index + octave_shift * number_of_pitch_classes
    
    # Check if the new index is within bounds
    if new_index < 0 or new_index >= len(all_pitch_classes):
        # Fall back to calculation-based shifting if out of bounds
        return shift_pitch_class_without_all_pitch_classes(pitch_class, octave_shift)
    
    # Return the pitch class at the calculated index with updated octave
    shifted_pitch_class = all_pitch_classes[new_index]
    return PitchClass(
        note_name=shifted_pitch_class.note_name,
        fraction=shifted_pitch_class.fraction,
        cents=shifted_pitch_class.cents,
        decimal_ratio=shifted_pitch_class.decimal_ratio,
        string_length=shifted_pitch_class.string_length,
        frequency=shifted_pitch_class.frequency,
        english_name=shifted_pitch_class.english_name,
        original_value=shifted_pitch_class.original_value,
        original_value_type=shifted_pitch_class.original_value_type,
        index=shifted_pitch_class.index,
        octave=pitch_class.octave + octave_shift,
        abjad_name=shifted_pitch_class.abjad_name,
        fret_division=shifted_pitch_class.fret_division,
        midi_note_number=shifted_pitch_class.midi_note_number,
        cents_deviation=shifted_pitch_class.cents_deviation
    )


def shift_pitch_class_without_all_pitch_classes(
    pitch_class: PitchClass, 
    octaves: int
) -> PitchClass:
    """
    Shifts a given PitchClass by octaves using mathematical calculation.
    
    This function shifts pitch classes by recalculating their tuning data
    rather than using array lookup. It's used as a fallback when the
    array-based method isn't available or when the target is out of bounds.
    
    All pitch relationships are maintained:
    - Frequency multiplied/divided by 2^octaves
    - String length inversely related to frequency
    - Cents shifted by 1200 * octaves
    - MIDI note numbers shifted by 12 * octaves
    
    Args:
        pitch_class: The original PitchClass object to shift
        octaves: Number of octaves to shift (positive shifts upward, negative shifts downward)
        
    Returns:
        A new PitchClass with updated tuning data
        
    Examples:
        >>> # Calculate a pitch class two octaves higher
        >>> higher = shift_pitch_class_without_all_pitch_classes(original_pitch, 2)
        >>> # Frequency doubled twice, cents increased by 2400
    """
    # Calculate the octave multiplication factor
    # factor = 2^octaves (e.g., 1 octave up = 2x frequency)
    factor = math.pow(2, octaves)
    
    # Calculate new octave (clamped to valid range 0-4)
    new_octave = max(0, min(4, pitch_class.octave + octaves))
    
    # Calculate octave shift multiplier (each octave = 2x frequency)
    octave_multiplier = 2 ** octaves
    
    # Shift the original value 
    try:
        if pitch_class.original_value_type == "fraction":
            # For fractions, multiply by octave_multiplier
            parts = pitch_class.original_value.split('/')
            if len(parts) == 2:
                numerator = int(parts[0]) * octave_multiplier
                new_original_value = f"{numerator}/{parts[1]}"
            else:
                new_original_value = str(float(pitch_class.original_value) * octave_multiplier)
        else:
            # For other types, multiply by octave_multiplier
            new_original_value = str(float(pitch_class.original_value) * octave_multiplier)
    except:
        new_original_value = pitch_class.original_value
    
    # Shift the fraction representation
    try:
        parts = pitch_class.fraction.split('/')
        if len(parts) == 2:
            numerator = int(parts[0]) * octave_multiplier  
            new_fraction_value = f"{numerator}/{parts[1]}"
        else:
            new_fraction_value = str(float(pitch_class.fraction) * octave_multiplier)
    except:
        new_fraction_value = pitch_class.fraction
    
    # Create note name with octave indication
    note_name_prefix = ""
    if octaves > 0:
        note_name_prefix = "jawāb " * octaves
    elif octaves < 0:
        note_name_prefix = "qarār " * abs(octaves)
    
    return PitchClass(
        note_name=note_name_prefix + pitch_class.note_name,
        original_value=new_original_value,
        fraction=new_fraction_value,
        octave=new_octave,
        
        # Update frequency-related values
        frequency=str(float(pitch_class.frequency) * factor) if pitch_class.frequency else "",
        string_length=str(float(pitch_class.string_length) / factor) if pitch_class.string_length else "",
        
        # Update ratio and interval values
        decimal_ratio=str(float(pitch_class.decimal_ratio) * factor) if pitch_class.decimal_ratio else "",
        cents=str(float(pitch_class.cents) + octaves * 1200) if pitch_class.cents else "",
        midi_note_number=pitch_class.midi_note_number + octaves * 12,
        
        # Copy other fields
        english_name=pitch_class.english_name,
        original_value_type=pitch_class.original_value_type,
        index=pitch_class.index,
        abjad_name=pitch_class.abjad_name,
        fret_division=pitch_class.fret_division,
        cents_deviation=pitch_class.cents_deviation
    )


def shift_multiple_pitch_classes(
    all_pitch_classes: List[PitchClass],
    pitch_classes: List[PitchClass],
    octave_shift: int
) -> List[PitchClass]:
    """
    Shift multiple pitch classes by the same number of octaves.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        pitch_classes: List of pitch classes to shift
        octave_shift: Number of octaves to shift
        
    Returns:
        List of shifted pitch classes
    """
    return [
        shift_pitch_class(all_pitch_classes, pc, octave_shift)
        for pc in pitch_classes
    ]


def get_octave_range_for_pitch_class(
    all_pitch_classes: List[PitchClass],
    pitch_class: PitchClass
) -> tuple[int, int]:
    """
    Get the available octave range for a given pitch class.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        pitch_class: The pitch class to check range for
        
    Returns:
        Tuple of (min_octave, max_octave) available for this pitch class
    """
    matching_octaves = []
    
    for pc in all_pitch_classes:
        if pc.index == pitch_class.index:
            matching_octaves.append(pc.octave)
    
    if matching_octaves:
        return (min(matching_octaves), max(matching_octaves))
    else:
        return (0, 4)  # Default range


def can_shift_pitch_class(
    all_pitch_classes: List[PitchClass],
    pitch_class: PitchClass,
    octave_shift: int
) -> bool:
    """
    Check if a pitch class can be shifted by the specified number of octaves.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        pitch_class: The pitch class to check
        octave_shift: Number of octaves to shift
        
    Returns:
        True if the shift is possible within the available range
    """
    target_octave = pitch_class.octave + octave_shift
    min_octave, max_octave = get_octave_range_for_pitch_class(all_pitch_classes, pitch_class)
    
    return min_octave <= target_octave <= max_octave
