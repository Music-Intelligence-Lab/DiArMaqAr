"""
Roman numeral to number conversion utilities.

This module provides functions to convert Roman numerals to numbers,
primarily used for parsing scale degrees in musical patterns.
"""

from typing import Dict


def roman_to_number(roman: str) -> int:
    """
    Converts Roman numerals to numbers for parsing pattern notes in playSequence.

    When playing musical patterns, notes can be specified as Roman numerals (I, II, III, etc.)
    representing scale degrees. This function converts them to numbers so we can find the
    correct pitch in the scale. Supports + and - prefixes for octave shifts.

    Used in sound processing functions to parse pattern note degrees
    like "V" → 5th scale degree, "+II" → 2nd degree in higher octave.

    Args:
        roman: Roman numeral (I-XII), optionally prefixed with + or -

    Returns:
        Number 1-12, or 0 if invalid

    Examples:
        >>> roman_to_number("V")
        5  # Fifth scale degree
        >>> roman_to_number("+IV")
        4  # Fourth degree, higher octave
        >>> roman_to_number("-II")
        2  # Second degree, lower octave
    """
    # Mapping from Roman numerals to Arabic numbers
    # Covers the common range used in music theory (I-XII)
    roman_map: Dict[str, int] = {
        "I": 1,     # First degree (tonic)
        "II": 2,    # Second degree (supertonic)
        "III": 3,   # Third degree (mediant)
        "IV": 4,    # Fourth degree (subdominant)
        "V": 5,     # Fifth degree (dominant)
        "VI": 6,    # Sixth degree (submediant)
        "VII": 7,   # Seventh degree (leading tone)
        "VIII": 8,  # Octave
        "IX": 9,    # Ninth
        "X": 10,    # Tenth
        "XI": 11,   # Eleventh
        "XII": 12,  # Twelfth
    }

    # Handle prefixed signs (+ for raised, - for lowered degrees)
    # The sign indicates chromatic alteration but we return the base degree number
    if roman.startswith(("+", "-")):
        base_roman = roman[1:]  # Remove the prefix
        return roman_map.get(base_roman, 0)  # Return the base degree number

    # Handle unprefixed Roman numerals
    return roman_map.get(roman, 0)  # Return 0 if not found in mapping


def number_to_roman(number: int) -> str:
    """
    Converts numbers to Roman numerals for scale degrees.
    
    Args:
        number: Number 1-12 representing scale degree
        
    Returns:
        Roman numeral representation, or empty string if invalid
        
    Examples:
        >>> number_to_roman(5)
        "V"
        >>> number_to_roman(12)
        "XII"
    """
    number_map: Dict[int, str] = {
        1: "I",
        2: "II", 
        3: "III",
        4: "IV",
        5: "V",
        6: "VI",
        7: "VII",
        8: "VIII",
        9: "IX",
        10: "X",
        11: "XI",
        12: "XII"
    }
    
    return number_map.get(number, "")


def parse_scale_degree(degree_str: str) -> Dict[str, any]:
    """
    Parse a scale degree string with optional octave modifiers.
    
    Args:
        degree_str: Scale degree like "V", "+II", "-VII"
        
    Returns:
        Dictionary with 'degree' (int), 'octave_modifier' (str), and 'is_valid' (bool)
        
    Examples:
        >>> parse_scale_degree("+IV")
        {'degree': 4, 'octave_modifier': '+', 'is_valid': True}
        >>> parse_scale_degree("VII")
        {'degree': 7, 'octave_modifier': '', 'is_valid': True}
    """
    octave_modifier = ""
    base_degree = degree_str
    
    if degree_str.startswith(("+", "-")):
        octave_modifier = degree_str[0]
        base_degree = degree_str[1:]
    
    degree_number = roman_to_number(base_degree)
    
    return {
        'degree': degree_number,
        'octave_modifier': octave_modifier,
        'is_valid': degree_number > 0
    }


def validate_roman_numeral(roman: str) -> bool:
    """
    Check if a string is a valid Roman numeral for scale degrees.
    
    Args:
        roman: String to validate
        
    Returns:
        True if valid Roman numeral (with or without prefix)
        
    Examples:
        >>> validate_roman_numeral("V")
        True
        >>> validate_roman_numeral("+III")
        True
        >>> validate_roman_numeral("invalid")
        False
    """
    return roman_to_number(roman) > 0


def get_all_scale_degrees() -> list[str]:
    """
    Get all valid scale degree Roman numerals.
    
    Returns:
        List of all valid Roman numerals I-XII
    """
    return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]


def scale_degree_to_zero_indexed(degree: int) -> int:
    """
    Convert 1-based scale degree to 0-based index.
    
    Args:
        degree: Scale degree (1-12)
        
    Returns:
        Zero-based index (0-11), or -1 if invalid
        
    Examples:
        >>> scale_degree_to_zero_indexed(1)
        0  # Tonic = index 0
        >>> scale_degree_to_zero_indexed(5)
        4  # Dominant = index 4
    """
    if 1 <= degree <= 12:
        return degree - 1
    return -1


def zero_indexed_to_scale_degree(index: int) -> int:
    """
    Convert 0-based index to 1-based scale degree.
    
    Args:
        index: Zero-based index (0-11)
        
    Returns:
        Scale degree (1-12), or 0 if invalid
        
    Examples:
        >>> zero_indexed_to_scale_degree(0)
        1  # Index 0 = tonic (degree 1)
        >>> zero_indexed_to_scale_degree(4)
        5  # Index 4 = dominant (degree 5)
    """
    if 0 <= index <= 11:
        return index + 1
    return 0
