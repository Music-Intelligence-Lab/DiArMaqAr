"""
Pitch class selection extension utilities.

This module provides functions to extend pitch class selections to include
related pitches across octaves based on harmonic relationships.
"""

from typing import List
from ..models.pitch_class import PitchClass


def extend_selected_pitch_classes(
    all_pitch_classes: List[PitchClass], 
    selected_pitch_classes: List[PitchClass]
) -> List[PitchClass]:
    """
    Extends a selection of pitch classes to include related pitches across octaves.

    This function analyzes the selected pitch classes and accurately extends
    the selection to include equivalent pitches in other octaves based on
    frequency relationships. It's used to create comprehensive pitch collections
    when working with scales that span multiple octaves.

    The algorithm determines a frequency cutoff point and then includes matching
    pitch class indices from appropriate octaves, maintaining the harmonic
    relationships while extending the available pitch range.

    Args:
        all_pitch_classes: Complete array of all available pitch classes
        selected_pitch_classes: Currently selected pitch classes to extend

    Returns:
        Extended array of pitch classes including related octave equivalents
        
    Examples:
        >>> # Extend a pentatonic scale across octaves
        >>> extended = extend_selected_pitch_classes(all_pitches, pentatonic_selection)
        >>> len(extended) > len(pentatonic_selection)  # Should include more octave variants
        True
    """
    extended_pitch_classes = []

    if not selected_pitch_classes:
        return extended_pitch_classes

    # Find the cutoff point for octave extension
    # This determines which pitches qualify for octave duplication
    slice_index = 0
    last_pitch_class = selected_pitch_classes[-1]

    # Calculate the slice index based on frequency doubling relationship
    # Pitches whose frequency doubled is still within the selection range
    # are candidates for extension
    for i, selected_pc in enumerate(selected_pitch_classes):
        try:
            current_freq = float(selected_pc.frequency) if selected_pc.frequency else 0
            last_freq = float(last_pitch_class.frequency) if last_pitch_class.frequency else 0

            # If doubling this frequency keeps it within the last pitch's frequency,
            # it's within the octave extension range
            if current_freq * 2 <= last_freq:
                slice_index = i + 1
        except (ValueError, AttributeError):
            # Skip if frequency data is invalid
            continue

    # Process each pitch class in the complete set
    for pitch_class in all_pitch_classes:
        current_index = pitch_class.index

        # Find all selected pitch classes that share the same index
        # (same pitch class, different octaves)
        filtered_pitch_class_indices = [
            pc for pc in selected_pitch_classes 
            if pc.index == current_index
        ]

        if filtered_pitch_class_indices:
            # Check if this exact pitch class (same index and octave) exists in selection
            direct_match = any(
                pc.octave == pitch_class.octave 
                for pc in filtered_pitch_class_indices
            )
            
            if direct_match:
                # Direct match - include this pitch class
                extended_pitch_classes.append(pitch_class)
            else:
                # No direct match - check if any matching index qualifies for extension
                for filtered_pitch_class in filtered_pitch_class_indices:
                    # Find index in selected pitch classes
                    index_in_selected = -1
                    for idx, selected_pc in enumerate(selected_pitch_classes):
                        if (selected_pc.index == filtered_pitch_class.index and 
                            selected_pc.octave == filtered_pitch_class.octave):
                            index_in_selected = idx
                            break

                    # If the matching pitch class is in the extension range (>= slice_index),
                    # include this octave equivalent
                    if index_in_selected >= slice_index:
                        extended_pitch_classes.append(pitch_class)
                        break  # Only need to add once per pitch class

    return extended_pitch_classes


def get_octave_variants(
    all_pitch_classes: List[PitchClass],
    target_pitch_class: PitchClass
) -> List[PitchClass]:
    """
    Get all octave variants of a specific pitch class.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        target_pitch_class: The pitch class to find octave variants for
        
    Returns:
        List of all pitch classes with the same index but different octaves
    """
    return [
        pc for pc in all_pitch_classes
        if pc.index == target_pitch_class.index
    ]


def extend_by_octave_doubling(
    all_pitch_classes: List[PitchClass],
    selected_pitch_classes: List[PitchClass],
    octave_limit: int = 2
) -> List[PitchClass]:
    """
    Extend selection by adding octave doublings up to a specified limit.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        selected_pitch_classes: Currently selected pitch classes
        octave_limit: Maximum number of octaves to extend (default: 2)
        
    Returns:
        Extended pitch class selection with octave doublings
    """
    extended = selected_pitch_classes.copy()
    
    for selected_pc in selected_pitch_classes:
        # Add higher octaves
        for octave_offset in range(1, octave_limit + 1):
            target_octave = selected_pc.octave + octave_offset
            for pc in all_pitch_classes:
                if pc.index == selected_pc.index and pc.octave == target_octave:
                    if pc not in extended:
                        extended.append(pc)
                    break
        
        # Add lower octaves
        for octave_offset in range(1, octave_limit + 1):
            target_octave = selected_pc.octave - octave_offset
            if target_octave >= 0:  # Don't go below octave 0
                for pc in all_pitch_classes:
                    if pc.index == selected_pc.index and pc.octave == target_octave:
                        if pc not in extended:
                            extended.append(pc)
                        break
    
    return extended


def filter_by_frequency_range(
    pitch_classes: List[PitchClass],
    min_frequency: float,
    max_frequency: float
) -> List[PitchClass]:
    """
    Filter pitch classes to only include those within a frequency range.
    
    Args:
        pitch_classes: List of pitch classes to filter
        min_frequency: Minimum frequency (Hz)
        max_frequency: Maximum frequency (Hz)
        
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
            # Skip pitch classes with invalid frequency data
            continue
    
    return filtered


def group_by_pitch_class_index(
    pitch_classes: List[PitchClass]
) -> dict[int, List[PitchClass]]:
    """
    Group pitch classes by their index (pitch class type).
    
    Args:
        pitch_classes: List of pitch classes to group
        
    Returns:
        Dictionary mapping pitch class indices to lists of pitch classes
    """
    groups = {}
    
    for pc in pitch_classes:
        if pc.index not in groups:
            groups[pc.index] = []
        groups[pc.index].append(pc)
    
    return groups


def find_gaps_in_selection(
    all_pitch_classes: List[PitchClass],
    selected_pitch_classes: List[PitchClass]
) -> List[PitchClass]:
    """
    Find pitch classes that could fill gaps in the current selection.
    
    This function identifies pitch classes that lie between selected pitches
    and could be used to create a more complete scale or collection.
    
    Args:
        all_pitch_classes: Complete array of all available pitch classes
        selected_pitch_classes: Currently selected pitch classes
        
    Returns:
        List of pitch classes that could fill gaps in the selection
    """
    if len(selected_pitch_classes) < 2:
        return []
    
    # Sort selected pitch classes by frequency
    sorted_selected = sorted(
        selected_pitch_classes,
        key=lambda pc: float(pc.frequency) if pc.frequency else 0
    )
    
    gaps = []
    
    for i in range(len(sorted_selected) - 1):
        current_pc = sorted_selected[i]
        next_pc = sorted_selected[i + 1]
        
        try:
            current_freq = float(current_pc.frequency) if current_pc.frequency else 0
            next_freq = float(next_pc.frequency) if next_pc.frequency else 0
            
            # Find pitch classes between current and next
            for pc in all_pitch_classes:
                pc_freq = float(pc.frequency) if pc.frequency else 0
                if current_freq < pc_freq < next_freq:
                    if pc not in selected_pitch_classes and pc not in gaps:
                        gaps.append(pc)
        
        except (ValueError, AttributeError):
            continue
    
    return gaps
