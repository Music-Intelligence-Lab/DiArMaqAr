"""
Detection utilities for determining the type/format of pitch class data.

This module provides functions to automatically detect whether pitch class data
is represented as fractions, cents, decimal ratios, or MIDI numbers.
"""

import re
from typing import Union


def detect_pitch_class_type(value: Union[str, int, float]) -> str:
    """
    Automatically detects the format type of a pitch class value.
    
    This function analyzes the input and determines whether it represents:
    - "fraction": Ratio notation like "3/2" or "5/4"
    - "cents": Cent values, typically between 0-1200
    - "decimal": Decimal ratio like 1.5 or 1.25
    - "midi": MIDI note numbers (integers 0-127)
    
    Args:
        value: The pitch class value to analyze
        
    Returns:
        String indicating the detected type: "fraction", "cents", "decimal", or "midi"
        
    Examples:
        >>> detect_pitch_class_type("3/2")
        "fraction"
        >>> detect_pitch_class_type(702.0)
        "cents"
        >>> detect_pitch_class_type(1.5)
        "decimal"
        >>> detect_pitch_class_type(60)
        "midi"
    """
    # Handle string inputs
    if isinstance(value, str):
        # Check if it's a fraction (contains '/')
        if "/" in value and re.match(r"^\d+/\d+$", value.strip()):
            return "fraction"
        
        # Try to convert to float for further analysis
        try:
            float_value = float(value)
        except ValueError:
            # If can't convert to number, assume it's some other string format
            return "fraction"  # Default assumption for strings
            
        # Continue analysis with the converted float
        value = float_value
    
    # Handle numeric inputs (int or float)
    if isinstance(value, (int, float)):
        # MIDI note numbers are typically integers between 0 and 127
        if isinstance(value, int) and 0 <= value <= 127:
            return "midi"
        
        # Cents are typically in the range 0-1200 (one octave)
        # But can be negative or larger for multiple octaves
        if isinstance(value, (int, float)) and -2400 <= value <= 2400:
            # Additional check: if it's a "round" decimal like 1.5, 2.0, etc.
            # it's more likely to be a decimal ratio than cents
            if isinstance(value, float) and 0.5 <= value <= 8.0:
                # Check if it's close to common musical ratios
                common_ratios = [1.0, 1.125, 1.2, 1.25, 1.333, 1.5, 1.6, 1.667, 1.8, 2.0]
                tolerance = 0.01
                
                for ratio in common_ratios:
                    if abs(value - ratio) < tolerance:
                        return "decimal"
            
            # If the value looks like typical cent values (often has decimal places)
            # or is in a range that's clearly cents
            if value > 8.0 or value < 0.5:
                return "cents"
        
        # For values clearly outside cent range but positive
        if value > 2400:
            return "cents" if value < 10000 else "decimal"
        
        # For small positive ratios
        if 0.5 <= value <= 8.0:
            return "decimal"
        
        # Default case for other numeric values
        return "cents"
    
    # Fallback for any other type
    return "fraction"


def is_fraction_format(value: str) -> bool:
    """
    Checks if a string is in fraction format (e.g., "3/2", "5/4").
    
    Args:
        value: String to check
        
    Returns:
        True if the string matches fraction format, False otherwise
        
    Examples:
        >>> is_fraction_format("3/2")
        True
        >>> is_fraction_format("1.5")
        False
        >>> is_fraction_format("702")
        False
    """
    if not isinstance(value, str):
        return False
    
    return bool(re.match(r"^\d+/\d+$", value.strip()))


def is_valid_cents_value(value: Union[str, int, float]) -> bool:
    """
    Checks if a value represents a valid cents measurement.
    
    Cents typically range from 0 to 1200 for one octave, but can extend
    beyond this range for multiple octaves or negative intervals.
    
    Args:
        value: Value to check
        
    Returns:
        True if the value appears to be a valid cents measurement
        
    Examples:
        >>> is_valid_cents_value(702.0)
        True
        >>> is_valid_cents_value(1200)
        True
        >>> is_valid_cents_value(0.5)
        False
    """
    try:
        numeric_value = float(value)
        # Allow a wide range for cents, including negative values and multiple octaves
        return -4800 <= numeric_value <= 4800
    except (ValueError, TypeError):
        return False


def is_valid_midi_note(value: Union[str, int, float]) -> bool:
    """
    Checks if a value represents a valid MIDI note number.
    
    MIDI notes range from 0 to 127, where 60 is middle C.
    
    Args:
        value: Value to check
        
    Returns:
        True if the value is a valid MIDI note number
        
    Examples:
        >>> is_valid_midi_note(60)
        True
        >>> is_valid_midi_note(128)
        False
        >>> is_valid_midi_note("60")
        True
    """
    try:
        numeric_value = int(float(value))
        return 0 <= numeric_value <= 127 and numeric_value == float(value)
    except (ValueError, TypeError):
        return False


def is_valid_decimal_ratio(value: Union[str, int, float]) -> bool:
    """
    Checks if a value represents a valid decimal ratio for musical intervals.
    
    Musical ratios are typically positive numbers, often between 0.5 and 8.0
    for common intervals within a few octaves.
    
    Args:
        value: Value to check
        
    Returns:
        True if the value appears to be a valid decimal ratio
        
    Examples:
        >>> is_valid_decimal_ratio(1.5)
        True
        >>> is_valid_decimal_ratio(2.0)
        True
        >>> is_valid_decimal_ratio(-1.0)
        False
    """
    try:
        numeric_value = float(value)
        return 0.25 <= numeric_value <= 16.0 and numeric_value > 0
    except (ValueError, TypeError):
        return False
