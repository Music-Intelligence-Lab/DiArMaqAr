"""
Note name retrieval utilities.

This module provides functions to get note names from indices and
other note name operations for UI state management.
"""

from typing import List, Optional
from ..models.note_name import OCTAVE_ONE_NOTE_NAMES


def get_first_note_name(selected_indices: List[int]) -> str:
    """
    Retrieves the first note name from an array of selected pitch class indices.

    This utility function is used in UI state management to determine the
    starting note when pitch classes are selected. It maps the first selected
    index to its corresponding note name from the octave one note names array.

    Args:
        selected_indices: Array of selected pitch class indices

    Returns:
        The note name corresponding to the first index, or "none" if empty or invalid
        
    Examples:
        >>> get_first_note_name([5, 10, 15])
        # Returns the note name at index 5 in octave one
        
        >>> get_first_note_name([])
        "none"
    """
    # Handle empty array
    if not selected_indices:
        return "none"

    # Get the first index
    idx = selected_indices[0]

    # Validate index is non-negative and within bounds
    if idx < 0 or idx >= len(OCTAVE_ONE_NOTE_NAMES):
        return "none"

    # Return the corresponding note name from the octave one note names
    # This array contains the canonical note names for the first octave
    return OCTAVE_ONE_NOTE_NAMES[idx]


def get_note_names_from_indices(indices: List[int]) -> List[str]:
    """
    Get note names for a list of indices.
    
    Args:
        indices: List of pitch class indices
        
    Returns:
        List of corresponding note names
        
    Examples:
        >>> get_note_names_from_indices([0, 2, 4])
        ["first_note", "third_note", "fifth_note"]  # Actual note names depend on system
    """
    note_names = []
    
    for idx in indices:
        if 0 <= idx < len(OCTAVE_ONE_NOTE_NAMES):
            note_names.append(OCTAVE_ONE_NOTE_NAMES[idx])
        else:
            note_names.append("none")
    
    return note_names


def get_index_from_note_name(note_name: str) -> int:
    """
    Get the index of a note name in the octave one system.
    
    Args:
        note_name: The note name to find
        
    Returns:
        Index of the note name, or -1 if not found
        
    Examples:
        >>> get_index_from_note_name("some_note")
        5  # If "some_note" is at index 5
        >>> get_index_from_note_name("invalid")
        -1
    """
    try:
        return OCTAVE_ONE_NOTE_NAMES.index(note_name)
    except ValueError:
        return -1


def get_valid_note_indices() -> List[int]:
    """
    Get all valid note indices for octave one.
    
    Returns:
        List of all valid indices (0 to length of octave one notes)
    """
    return list(range(len(OCTAVE_ONE_NOTE_NAMES)))


def filter_valid_indices(indices: List[int]) -> List[int]:
    """
    Filter a list of indices to only include valid ones.
    
    Args:
        indices: List of indices to filter
        
    Returns:
        List containing only valid indices
        
    Examples:
        >>> filter_valid_indices([-1, 5, 100, 10])
        [5, 10]  # Assuming 5 and 10 are valid indices
    """
    valid_indices = []
    max_index = len(OCTAVE_ONE_NOTE_NAMES)
    
    for idx in indices:
        if 0 <= idx < max_index:
            valid_indices.append(idx)
    
    return valid_indices


def get_last_note_name(selected_indices: List[int]) -> str:
    """
    Get the note name corresponding to the last index in the selection.
    
    Args:
        selected_indices: Array of selected pitch class indices
        
    Returns:
        The note name corresponding to the last index, or "none" if empty or invalid
    """
    if not selected_indices:
        return "none"
    
    idx = selected_indices[-1]
    
    if idx < 0 or idx >= len(OCTAVE_ONE_NOTE_NAMES):
        return "none"
    
    return OCTAVE_ONE_NOTE_NAMES[idx]


def get_note_name_at_index(index: int) -> Optional[str]:
    """
    Get the note name at a specific index.
    
    Args:
        index: The index to look up
        
    Returns:
        The note name at that index, or None if invalid
        
    Examples:
        >>> get_note_name_at_index(0)
        "first_note_name"  # Whatever is at index 0
        >>> get_note_name_at_index(-1)
        None
    """
    if 0 <= index < len(OCTAVE_ONE_NOTE_NAMES):
        return OCTAVE_ONE_NOTE_NAMES[index]
    return None


def count_selected_notes(selected_indices: List[int]) -> int:
    """
    Count how many valid notes are selected.
    
    Args:
        selected_indices: List of selected indices
        
    Returns:
        Number of valid note selections
    """
    return len(filter_valid_indices(selected_indices))


def get_note_range_names(start_index: int, end_index: int) -> List[str]:
    """
    Get note names for a range of indices.
    
    Args:
        start_index: Starting index (inclusive)
        end_index: Ending index (inclusive)
        
    Returns:
        List of note names in the specified range
        
    Examples:
        >>> get_note_range_names(0, 2)
        ["note1", "note2", "note3"]  # Notes at indices 0, 1, 2
    """
    note_names = []
    
    for idx in range(start_index, end_index + 1):
        note_name = get_note_name_at_index(idx)
        if note_name:
            note_names.append(note_name)
    
    return note_names
