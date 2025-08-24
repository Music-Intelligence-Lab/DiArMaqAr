"""
Note name mappings between Arabic, English, and Abjad notation systems.

This module provides mappings and conversion functions between different
note naming systems used in Arabic maqam music theory.
"""

from typing import Dict, List, Optional, Union
from ..models.note_name import (
    OCTAVE_ZERO_NOTE_NAMES, OCTAVE_ONE_NOTE_NAMES, OCTAVE_TWO_NOTE_NAMES, 
    OCTAVE_THREE_NOTE_NAMES, OCTAVE_FOUR_NOTE_NAMES
)

# English note name mappings for each octave
english_octave_zero = [
    "G", "G-#", "Ab-", "Ab", "A-b", "A-", "A", "A-#", "Bb", "Bb+", "Bb++", "B-b", "B--", "B-", "B",
    "C-b", "C", "C+", "C-#", "C#", "D-b", "D", "D-#", "Eb-", "Eb", "Eb+", "E-b", "E-", "E",
    "F-b", "F", "F+", "F-#", "F#-", "F#", "G-b", "G-"
]

english_octave_one = [
    "G", "G-#", "Ab-", "Ab", "A-b", "A-", "A", "A-#", "Bb", "Bb+", "Bb++", "B-b", "B--", "B-", "B",
    "C-b", "C", "C+", "C-#", "C#", "D-b", "D", "D-#", "Eb-", "Eb", "Eb+", "E-b", "E-", "E",
    "F-b", "F", "F+", "F-#", "F#-", "F#", "G-b", "G-"
]

english_octave_two = [
    "g", "g-#", "ab-", "ab", "a-b", "a-", "a", "a-#", "bb", "bb+", "bb++", "b-b", "b--", "b-", "b",
    "c-b", "c", "c+", "c-#", "c#", "d-b", "d", "d-#", "eb-", "eb", "eb+", "e-b", "e-", "e",
    "f-b", "f", "f+", "f-#", "f#-", "f#", "g-b", "g-"
]

english_octave_three = [
    "g'", "g'-#", "ab'-", "ab'", "a'-b", "a'-", "a'", "a'-#", "bb'", "bb'+", "bb'++", "b'-b", "b'--", "b'-", "b'",
    "c'-b", "c'", "c'+", "c'-#", "c'#", "d'-b", "d'", "d'-#", "eb'-", "eb'", "eb'+", "e'-b", "e'-", "e'",
    "f'-b", "f'", "f'+", "f'-#", "f'#-", "f'#", "g'-b", "g'-"
]

english_octave_four = [
    "g''", "g''-#", "ab''-", "ab''", "a''-b", "a''-", "a''", "a''-#", "bb''", "bb''+", "bb''++", "b''-b", "b''--", "b''-", "b''",
    "c''-b", "c''", "c''+", "c''-#", "c''#", "d''-b", "d''", "d''-#", "eb''-", "eb''", "eb''+", "e''-b", "e''-", "e''",
    "f''-b", "f''", "f''+", "f''-#", "f''#-", "f''#", "g''-b", "g''-"
]

# Abjad note names (Arabic alphabetical system)
abjad_names = [
    "آ", "ب", "ج", "د", "ه", "و", "ز", "ح", "ط", "ي", "ك", "ل", "م", "ن", "س", "ع", "ف", "ص", "ق", "ر",
    "ش", "ت", "ث", "خ", "ذ", "ض", "ظ", "غ", "يا", "يب", "يج", "يد", "يه", "يو", "يز", "يح", "يط",
    "كا", "كب", "كج", "كد", "كه", "كو", "كز", "كح", "كط", "لا", "لب", "لج", "لد", "له", "لو", "لز", "لح", "لط"
]

# Create comprehensive mapping dictionaries
def create_note_name_mappings() -> Dict[str, Dict[str, List[str]]]:
    """
    Creates comprehensive mappings between different note naming systems.
    
    Returns:
        Dictionary containing mappings for each octave and naming system
    """
    return {
        "arabic_to_english": {
            "octave_0": dict(zip(OCTAVE_ZERO_NOTE_NAMES, english_octave_zero)),
            "octave_1": dict(zip(OCTAVE_ONE_NOTE_NAMES, english_octave_one)),
            "octave_2": dict(zip(OCTAVE_TWO_NOTE_NAMES, english_octave_two)),
            "octave_3": dict(zip(OCTAVE_THREE_NOTE_NAMES, english_octave_three)),
            "octave_4": dict(zip(OCTAVE_FOUR_NOTE_NAMES, english_octave_four)),
        },
        "english_to_arabic": {
            "octave_0": dict(zip(english_octave_zero, OCTAVE_ZERO_NOTE_NAMES)),
            "octave_1": dict(zip(english_octave_one, OCTAVE_ONE_NOTE_NAMES)),
            "octave_2": dict(zip(english_octave_two, OCTAVE_TWO_NOTE_NAMES)),
            "octave_3": dict(zip(english_octave_three, OCTAVE_THREE_NOTE_NAMES)),
            "octave_4": dict(zip(english_octave_four, OCTAVE_FOUR_NOTE_NAMES)),
        },
        "arabic_to_abjad": {
            # Map Arabic note names to Abjad (limited to available Abjad names)
            "all_octaves": dict(zip(
                OCTAVE_ZERO_NOTE_NAMES + OCTAVE_ONE_NOTE_NAMES,
                abjad_names[:len(OCTAVE_ZERO_NOTE_NAMES + OCTAVE_ONE_NOTE_NAMES)]
            ))
        },
        "abjad_to_arabic": {
            # Reverse mapping from Abjad to Arabic
            "all_octaves": dict(zip(
                abjad_names[:len(OCTAVE_ZERO_NOTE_NAMES + OCTAVE_ONE_NOTE_NAMES)],
                OCTAVE_ZERO_NOTE_NAMES + OCTAVE_ONE_NOTE_NAMES
            ))
        }
    }


def convert_note_name(
    note_name: str,
    from_system: str,
    to_system: str,
    octave: Optional[int] = None
) -> Optional[str]:
    """
    Converts a note name from one naming system to another.
    
    Args:
        note_name: The note name to convert
        from_system: Source naming system ("arabic", "english", "abjad")
        to_system: Target naming system ("arabic", "english", "abjad")
        octave: Octave number (0-4) for arabic/english systems
        
    Returns:
        Converted note name, or None if conversion not possible
        
    Examples:
        >>> convert_note_name("دو", "arabic", "english", 2)
        "c"
        >>> convert_note_name("C", "english", "arabic", 1)
        "دو"
    """
    mappings = create_note_name_mappings()
    
    # Handle abjad system (doesn't use octaves)
    if from_system == "abjad" or to_system == "abjad":
        if from_system == "abjad" and to_system == "arabic":
            return mappings["abjad_to_arabic"]["all_octaves"].get(note_name)
        elif from_system == "arabic" and to_system == "abjad":
            return mappings["arabic_to_abjad"]["all_octaves"].get(note_name)
        else:
            return None  # Direct english-abjad conversion not supported
    
    # Handle arabic-english conversions
    if octave is None:
        return None  # Octave required for arabic/english systems
    
    octave_key = f"octave_{octave}"
    
    if from_system == "arabic" and to_system == "english":
        if octave_key in mappings["arabic_to_english"]:
            return mappings["arabic_to_english"][octave_key].get(note_name)
    elif from_system == "english" and to_system == "arabic":
        if octave_key in mappings["english_to_arabic"]:
            return mappings["english_to_arabic"][octave_key].get(note_name)
    
    return None


def find_note_in_system(
    note_name: str,
    target_system: str = "arabic"
) -> List[Dict[str, Union[str, int]]]:
    """
    Finds all occurrences of a note name across different octaves in the target system.
    
    Args:
        note_name: The note name to search for
        target_system: The system to search in ("arabic", "english", "abjad")
        
    Returns:
        List of dictionaries with note information including octave and system
        
    Examples:
        >>> find_note_in_system("C")
        [{"note": "دو", "octave": 0, "system": "arabic"}, 
         {"note": "دو", "octave": 1, "system": "arabic"}]
    """
    results = []
    mappings = create_note_name_mappings()
    
    if target_system == "abjad":
        # Search in abjad system
        abjad_to_arabic = mappings["abjad_to_arabic"]["all_octaves"]
        for abjad_note, arabic_note in abjad_to_arabic.items():
            if note_name == abjad_note:
                results.append({
                    "note": arabic_note,
                    "abjad": abjad_note,
                    "system": "abjad"
                })
    else:
        # Search across octaves
        for octave in range(5):  # 0-4
            octave_key = f"octave_{octave}"
            
            if target_system == "arabic":
                # Search in English and convert to Arabic
                english_to_arabic = mappings["english_to_arabic"].get(octave_key, {})
                if note_name in english_to_arabic:
                    results.append({
                        "note": english_to_arabic[note_name],
                        "octave": octave,
                        "system": "arabic",
                        "original": note_name
                    })
                
                # Also search directly in Arabic
                arabic_to_english = mappings["arabic_to_english"].get(octave_key, {})
                if note_name in arabic_to_english:
                    results.append({
                        "note": note_name,
                        "octave": octave,
                        "system": "arabic",
                        "english": arabic_to_english[note_name]
                    })
            
            elif target_system == "english":
                # Search in Arabic and convert to English
                arabic_to_english = mappings["arabic_to_english"].get(octave_key, {})
                if note_name in arabic_to_english:
                    results.append({
                        "note": arabic_to_english[note_name],
                        "octave": octave,
                        "system": "english",
                        "original": note_name
                    })
                
                # Also search directly in English
                english_to_arabic = mappings["english_to_arabic"].get(octave_key, {})
                if note_name in english_to_arabic:
                    results.append({
                        "note": note_name,
                        "octave": octave,
                        "system": "english",
                        "arabic": english_to_arabic[note_name]
                    })
    
    return results


def get_all_note_names_for_octave(octave: int, system: str = "arabic") -> List[str]:
    """
    Gets all note names for a specific octave in the specified system.
    
    Args:
        octave: Octave number (0-4)
        system: Naming system ("arabic" or "english")
        
    Returns:
        List of all note names in that octave
        
    Examples:
        >>> get_all_note_names_for_octave(2, "english")[:5]
        ["g", "g-#", "ab-", "ab", "a-b"]
    """
    if system == "arabic":
        octave_arrays = [
            OCTAVE_ZERO_NOTE_NAMES,
            OCTAVE_ONE_NOTE_NAMES,
            OCTAVE_TWO_NOTE_NAMES,
            OCTAVE_THREE_NOTE_NAMES,
            OCTAVE_FOUR_NOTE_NAMES
        ]
    elif system == "english":
        octave_arrays = [
            english_octave_zero,
            english_octave_one,
            english_octave_two,
            english_octave_three,
            english_octave_four
        ]
    else:
        raise ValueError(f"Unsupported system: {system}")
    
    if 0 <= octave < len(octave_arrays):
        return octave_arrays[octave].copy()
    else:
        raise ValueError(f"Octave {octave} not available for system {system}")


def validate_note_name(note_name: str, system: str = "arabic", octave: Optional[int] = None) -> bool:
    """
    Validates whether a note name exists in the specified system and octave.
    
    Args:
        note_name: The note name to validate
        system: The naming system ("arabic", "english", "abjad")
        octave: Octave number (required for arabic/english, ignored for abjad)
        
    Returns:
        True if the note name is valid in the specified system
        
    Examples:
        >>> validate_note_name("دو", "arabic", 2)
        True
        >>> validate_note_name("X", "english", 1)
        False
    """
    if system == "abjad":
        return note_name in abjad_names
    
    if octave is None:
        return False
    
    try:
        valid_names = get_all_note_names_for_octave(octave, system)
        return note_name in valid_names
    except ValueError:
        return False


def get_abjad_sequence(length: int) -> List[str]:
    """
    Gets a sequence of Abjad note names of specified length.
    
    Args:
        length: Number of Abjad names to return
        
    Returns:
        List of Abjad note names
        
    Examples:
        >>> get_abjad_sequence(5)
        ["آ", "ب", "ج", "د", "ه"]
    """
    return abjad_names[:min(length, len(abjad_names))]
