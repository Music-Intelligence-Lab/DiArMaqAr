"""
Note name definitions and utilities for the Arabic maqam system.

This module provides the complete set of note names across different octaves
as used in Arabic music theory, along with utility functions for working
with note names and octave positions.
"""

from typing import Union, Optional, NamedTuple, List
from enum import Enum


class Cell(NamedTuple):
    """Represents a note's position with octave and index."""
    octave: int
    index: int


# Octave 0 note names (qarār range)
OCTAVE_ZERO_NOTE_NAMES = [
    "qarār yegāh",
    "qarār qarār nīm ḥiṣār",
    "qarār shūrī",
    "qarār qarār ḥiṣār",
    "qarār qarār tīk ḥiṣār/shūrī",
    "qarār nīm ʿushayrān",
    "qarār ʿushayrān",
    "qarār nīm ʿajam ʿushayrān",
    "qarār ʿajam ʿushayrān",
    "qarār nayrūz",
    "qarār tīk ʿajam ʿushayrān",
    "qarār ʿirāq",
    "qarār rahāwī",
    "qarār nīm kawasht/rahāwī",
    "qarār kawasht",
    "qarār tīk kawasht",
    "qarār rāst",
    "qarār tīk rāst",
    "qarār nīm zīrgūleh",
    "qarār zīrgūleh",
    "qarār tīk zīrgūleh",
    "qarār dūgāh",
    "qarār nīm kurdī/nahāwand",
    "qarār nahāwand",
    "qarār kurdī",
    "qarār tīk kūrdī",
    "qarār segāh",
    "qarār nīm būselīk",
    "qarār būselīk/ʿushshāq",
    "qarār tīk būselīk",
    "qarār chahārgāh",
    "qarār tīk chahārgāh",
    "qarār nīm ḥijāz",
    "qarār ṣabā",
    "qarār ḥijāz",
    "qarār tīk ḥijāz/ṣabā",
    "nīm yegāh",
]

# Octave 1 note names (main octave)
OCTAVE_ONE_NOTE_NAMES = [
    "yegāh",  # 0
    "qarār nīm ḥiṣār",  # 1
    "shūrī",
    "qarār ḥiṣār",  # 3
    "qarār tīk ḥiṣār/shūrī",  # 4
    "nīm ʿushayrān",
    "ʿushayrān",  # 6
    "nīm ʿajam ʿushayrān",  # 7
    "ʿajam ʿushayrān",  # 8
    "nayrūz",
    "tīk ʿajam ʿushayrān",
    "ʿirāq",  # 11
    "rahāwī",
    "nīm kawasht",  # 13
    "kawasht",  # 14
    "tīk kawasht",
    "rāst",  # 16
    "tīk rāst",
    "nīm zīrgūleh",  # 18
    "zīrgūleh",  # 19
    "tīk zīrgūleh",  # 20
    "dūgāh",  # 21
    "nīm kurdī/nahāwand",  # 22
    "nahāwand",
    "kurdī",  # 24
    "tīk kūrdī",
    "segāh",  # 26
    "nīm būselīk",  # 27
    "būselīk/ʿushshāq",  # 28
    "tīk būselīk",
    "chahārgāh",  # 30
    "tīk chahārgāh",
    "nīm ḥijāz",  # 32
    "ṣabā",
    "ḥijāz",  # 34
    "tīk ḥijāz/ṣabā",  # 35
    "nīm nawā",
]

# Octave 2 note names (jawāb range)
OCTAVE_TWO_NOTE_NAMES = [
    "nawā",
    "nīm ḥiṣār",
    "jawāb shūrī",
    "ḥiṣār",
    "tīk ḥiṣār",
    "nīm ḥusaynī",
    "ḥusaynī",
    "nīm ʿajam",
    "ʿajam",
    "jawāb nayrūz",
    "tīk ʿajam",
    "awj",
    "jawāb rahāwī",
    "nīm māhūr",
    "māhūr",
    "tīk māhūr",
    "kurdān",
    "tīk kurdān",
    "nīm shahnāz",
    "shahnāz",
    "jawāb tīk zīrgūleh",
    "muḥayyar",
    "nīm sunbuleh",
    "jawāb nahāwand",
    "sunbuleh/zawāl",
    "jawāb tīk kūrdī",
    "buzurk",
    "jawāb nīm būselīk",
    "jawāb būselīk",
    "jawāb tīk būselīk",
    "māhūrān",
    "tīk māhūrān",
    "jawāb nīm ḥijāz",
    "jawāb ṣabā",
    "jawāb ḥijāz",
    "jawāb tīk ḥijāz",
    "nīm saham/ramal tūtī",
]

# Octave 3 note names
OCTAVE_THREE_NOTE_NAMES = [
    "saham/ramal tūtī",
    "jawāb nīm ḥiṣār",
    "jawāb jawāb shūrī",
    "jawāb ḥiṣār",
    "jawāb tīk ḥiṣār",
    "jawāb nīm ḥusaynī",
    "jawāb ḥusaynī",
    "jawāb nīm ʿajam",
    "jawāb ʿajam",
    "jawāb jawāb nayrūz",
    "jawāb tīk ʿajam",
    "jawāb awj",
    "jawāb jawāb rahāwī",
    "jawāb nīm māhūr",
    "jawāb māhūr",
    "jawāb tīk māhūr",
    "jawāb kurdān",
    "jawāb tīk kurdān",
    "jawāb nīm shahnāz",
    "jawāb shahnāz",
    "jawāb jawāb tīk zīrgūleh",
    "jawāb muḥayyar",
    "jawāb nīm sunbuleh",
    "jawāb jawāb nahāwand",
    "jawāb sunbuleh/zawāl",
    "jawāb jawāb tīk kūrdī",
    "jawāb buzurk",
    "jawāb jawāb nīm būselīk",
    "jawāb jawāb būselīk",
    "jawāb jawāb tīk būselīk",
    "jawāb māhūrān",
    "jawāb tīk māhūrān",
    "jawāb jawāb nīm ḥijāz",
    "jawāb jawāb ṣabā",
    "jawāb jawāb ḥijāz",
    "jawāb jawāb tīk ḥijāz",
    "jawāb saham/ramal tūtī",
]

# Octave 4 note names
OCTAVE_FOUR_NOTE_NAMES = [
    "jawāb saham/ramal tūtī",
    "jawāb jawāb nīm ḥiṣār",
    "jawāb jawāb jawāb shūrī",
    "jawāb jawāb ḥiṣār",
    "jawāb jawāb tīk ḥiṣār",
    "jawāb jawāb nīm ḥusaynī",
    "jawāb jawāb ḥusaynī",
    "jawāb jawāb nīm ʿajam",
    "jawāb jawāb ʿajam",
    "jawāb jawāb jawāb nayrūz",
    "jawāb jawāb tīk ʿajam",
    "jawāb jawāb awj",
    "jawāb jawāb jawāb rahāwī",
    "jawāb jawāb nīm māhūr",
    "jawāb jawāb māhūr",
    "jawāb jawāb tīk māhūr",
    "jawāb jawāb kurdān",
    "jawāb jawāb nīm shahnāz",
    "jawāb jawāb shahnāz",
    "jawāb jawāb jawāb tīk zīrgūleh",
    "jawāb jawāb muḥayyar",
    "jawāb jawāb nīm sunbuleh",
    "jawāb jawāb jawāb nahāwand",
    "jawāb jawāb sunbuleh/zawāl",
    "jawāb jawāb jawāb tīk kūrdī",
    "jawāb jawāb buzurk",
    "jawāb jawāb jawāb nīm būselīk",
    "jawāb jawāb jawāb būselīk",
    "jawāb jawāb jawāb tīk būselīk",
    "jawāb jawāb māhūrān",
    "jawāb jawāb tīk māhūrān",
    "jawāb jawāb jawāb nīm ḥijāz",
    "jawāb jawāb jawāb ṣabā",
    "jawāb jawāb jawāb ḥijāz",
    "jawāb jawāb jawāb tīk ḥijāz",
    "jawāb jawāb saham/ramal tūtī",
]

# All unique note names combined
ALL_NOTES = list(set([
    *OCTAVE_ZERO_NOTE_NAMES,
    *OCTAVE_ONE_NOTE_NAMES,
    *OCTAVE_TWO_NOTE_NAMES,
    *OCTAVE_THREE_NOTE_NAMES,
    *OCTAVE_FOUR_NOTE_NAMES
]))

# Type alias for note names
NoteName = str  # In TypeScript this was a union type, in Python we'll use str with validation


def get_note_name_index(note_name: NoteName) -> int:
    """
    Get the global index of a note name in the ALL_NOTES list.
    
    Args:
        note_name: The note name to find
        
    Returns:
        The index of the note name in ALL_NOTES, or -1 if not found
    """
    try:
        return ALL_NOTES.index(note_name)
    except ValueError:
        return -1


def get_note_name_index_and_octave(note_name: NoteName) -> Cell:
    """
    Get the octave and index within that octave for a given note name.
    
    Args:
        note_name: The note name to analyze
        
    Returns:
        A Cell containing the octave number and index within that octave
    """
    if note_name in OCTAVE_ZERO_NOTE_NAMES:
        return Cell(octave=0, index=OCTAVE_ZERO_NOTE_NAMES.index(note_name))
    elif note_name in OCTAVE_ONE_NOTE_NAMES:
        return Cell(octave=1, index=OCTAVE_ONE_NOTE_NAMES.index(note_name))
    elif note_name in OCTAVE_TWO_NOTE_NAMES:
        return Cell(octave=2, index=OCTAVE_TWO_NOTE_NAMES.index(note_name))
    elif note_name in OCTAVE_THREE_NOTE_NAMES:
        return Cell(octave=3, index=OCTAVE_THREE_NOTE_NAMES.index(note_name))
    elif note_name in OCTAVE_FOUR_NOTE_NAMES:
        return Cell(octave=4, index=OCTAVE_FOUR_NOTE_NAMES.index(note_name))
    else:
        return Cell(index=-1, octave=-1)


def get_note_name_from_index_and_octave(cell: Cell) -> Optional[NoteName]:
    """
    Get the note name from an octave number and index within that octave.
    
    Args:
        cell: A Cell containing octave and index
        
    Returns:
        The note name, or None if the cell is invalid
    """
    octave, index = cell.octave, cell.index
    
    try:
        if octave == 0:
            return OCTAVE_ZERO_NOTE_NAMES[index]
        elif octave == 1:
            return OCTAVE_ONE_NOTE_NAMES[index]
        elif octave == 2:
            return OCTAVE_TWO_NOTE_NAMES[index]
        elif octave == 3:
            return OCTAVE_THREE_NOTE_NAMES[index]
        elif octave == 4:
            return OCTAVE_FOUR_NOTE_NAMES[index]
        else:
            return None
    except IndexError:
        return None


def shift_note_name(note_name: NoteName, shift: int) -> Optional[NoteName]:
    """
    Shift a note name by a specified number of octaves.
    
    Args:
        note_name: The original note name
        shift: Number of octaves to shift (positive for higher, negative for lower)
        
    Returns:
        The shifted note name, or None if the shift results in an invalid octave
    """
    cell = get_note_name_index_and_octave(note_name)
    if cell.octave == -1:
        return None
    
    new_cell = Cell(octave=cell.octave + shift, index=cell.index)
    return get_note_name_from_index_and_octave(new_cell)


def is_valid_note_name(note_name: str) -> bool:
    """
    Check if a string is a valid note name.
    
    Args:
        note_name: The string to validate
        
    Returns:
        True if the string is a valid note name, False otherwise
    """
    return note_name in ALL_NOTES


# Type aliases for specific octave note names (for type hints)
TransliteratedNoteNameOctaveZero = str
TransliteratedNoteNameOctaveOne = str
TransliteratedNoteNameOctaveTwo = str
TransliteratedNoteNameOctaveThree = str
TransliteratedNoteNameOctaveFour = str
