"""
Conversion utilities for pitch class data between different formats.

This module provides functions to convert pitch class data between various representations:
- Fractions (e.g., "3/2")
- Cents (e.g., 702.0)
- Decimal ratios (e.g., 1.5)
- MIDI note numbers (e.g., 60)
"""

import math
from typing import Union
from .detect_pitch_class_type import detect_pitch_class_type


def convert_pitch_class(value: Union[str, int, float], target_format: str) -> Union[str, float, int]:
    """
    Converts a pitch class value from its current format to the target format.
    
    This function automatically detects the input format and converts to the requested
    target format. It handles conversions between fractions, cents, decimal ratios,
    and MIDI note numbers.
    
    Args:
        value: The pitch class value to convert
        target_format: Target format ("fraction", "cents", "decimal", "midi")
        
    Returns:
        The converted value in the target format
        
    Examples:
        >>> convert_pitch_class("3/2", "cents")
        701.955
        >>> convert_pitch_class(702.0, "fraction")
        "3/2"
        >>> convert_pitch_class(1.5, "midi")
        67  # Assuming C4 as reference
    """
    # First detect the current format
    current_format = detect_pitch_class_type(value)
    
    # If already in target format, return as-is (with type conversion if needed)
    if current_format == target_format:
        if target_format == "fraction":
            return str(value)
        elif target_format == "midi":
            return int(float(value))
        else:
            return float(value)
    
    # Convert to decimal ratio as intermediate format
    decimal_ratio = _to_decimal_ratio(value, current_format)
    
    # Convert from decimal ratio to target format
    return _from_decimal_ratio(decimal_ratio, target_format)


def _to_decimal_ratio(value: Union[str, int, float], source_format: str) -> float:
    """
    Converts a value from any format to decimal ratio.
    
    Args:
        value: The value to convert
        source_format: The source format of the value
        
    Returns:
        The value as a decimal ratio
    """
    if source_format == "decimal":
        return float(value)
    
    elif source_format == "fraction":
        numerator, denominator = map(int, str(value).split("/"))
        return numerator / denominator
    
    elif source_format == "cents":
        # Convert cents to ratio: ratio = 2^(cents/1200)
        return pow(2, float(value) / 1200.0)
    
    elif source_format == "midi":
        # Convert MIDI to ratio relative to MIDI note 60 (middle C)
        # Each semitone is a ratio of 2^(1/12)
        midi_value = int(value)
        semitones_from_c4 = midi_value - 60
        return pow(2, semitones_from_c4 / 12.0)
    
    else:
        raise ValueError(f"Unknown source format: {source_format}")


def _from_decimal_ratio(decimal_ratio: float, target_format: str) -> Union[str, float, int]:
    """
    Converts a decimal ratio to the target format.
    
    Args:
        decimal_ratio: The decimal ratio to convert
        target_format: The target format
        
    Returns:
        The value in the target format
    """
    if target_format == "decimal":
        return decimal_ratio
    
    elif target_format == "fraction":
        return _decimal_to_fraction(decimal_ratio)
    
    elif target_format == "cents":
        # Convert ratio to cents: cents = 1200 * log2(ratio)
        if decimal_ratio <= 0:
            raise ValueError("Cannot convert non-positive ratio to cents")
        return 1200.0 * math.log2(decimal_ratio)
    
    elif target_format == "midi":
        # Convert ratio to MIDI note relative to middle C (60)
        if decimal_ratio <= 0:
            raise ValueError("Cannot convert non-positive ratio to MIDI")
        semitones_from_c4 = 12.0 * math.log2(decimal_ratio)
        return int(round(60 + semitones_from_c4))
    
    else:
        raise ValueError(f"Unknown target format: {target_format}")


def _decimal_to_fraction(decimal: float, max_denominator: int = 99) -> str:
    """
    Converts a decimal ratio to its closest fractional representation.
    
    Args:
        decimal: The decimal number to convert
        max_denominator: Maximum denominator to test
        
    Returns:
        String representation of the fraction
    """
    from .gcd import gcd
    
    best_numerator = 1
    best_denominator = 1
    min_error = abs(decimal - best_numerator / best_denominator)

    for d in range(1, max_denominator + 1):
        n = round(decimal * d)
        if n == 0:
            continue
        error = abs(decimal - n / d)

        if error < min_error:
            min_error = error
            best_numerator = n
            best_denominator = d

    # Simplify the fraction
    gcd_value = gcd(abs(best_numerator), best_denominator)
    return f"{int(best_numerator / gcd_value)}/{int(best_denominator / gcd_value)}"


def fraction_to_cents(fraction: str) -> float:
    """
    Converts a fraction to cents.
    
    Args:
        fraction: Fraction string (e.g., "3/2")
        
    Returns:
        The equivalent value in cents
        
    Examples:
        >>> fraction_to_cents("3/2")
        701.955
        >>> fraction_to_cents("2/1")
        1200.0
    """
    numerator, denominator = map(int, fraction.split("/"))
    ratio = numerator / denominator
    return 1200.0 * math.log2(ratio)


def cents_to_fraction(cents: float, max_denominator: int = 99) -> str:
    """
    Converts cents to the closest fraction representation.
    
    Args:
        cents: The cent value to convert
        max_denominator: Maximum denominator for the fraction
        
    Returns:
        The closest fraction as a string
        
    Examples:
        >>> cents_to_fraction(702.0)
        "3/2"
        >>> cents_to_fraction(1200.0)
        "2/1"
    """
    ratio = pow(2, cents / 1200.0)
    return _decimal_to_fraction(ratio, max_denominator)


def decimal_to_cents(decimal: float) -> float:
    """
    Converts a decimal ratio to cents.
    
    Args:
        decimal: The decimal ratio
        
    Returns:
        The equivalent value in cents
        
    Examples:
        >>> decimal_to_cents(1.5)
        701.955
        >>> decimal_to_cents(2.0)
        1200.0
    """
    if decimal <= 0:
        raise ValueError("Cannot convert non-positive ratio to cents")
    return 1200.0 * math.log2(decimal)


def cents_to_decimal(cents: float) -> float:
    """
    Converts cents to a decimal ratio.
    
    Args:
        cents: The cent value
        
    Returns:
        The equivalent decimal ratio
        
    Examples:
        >>> cents_to_decimal(702.0)
        1.4983070768766815
        >>> cents_to_decimal(1200.0)
        2.0
    """
    return pow(2, cents / 1200.0)


def midi_to_frequency(midi_note: int, a4_frequency: float = 440.0) -> float:
    """
    Converts a MIDI note number to its frequency in Hz.
    
    Args:
        midi_note: MIDI note number (0-127)
        a4_frequency: Frequency of A4 in Hz (default: 440.0)
        
    Returns:
        The frequency in Hz
        
    Examples:
        >>> midi_to_frequency(69)  # A4
        440.0
        >>> midi_to_frequency(60)  # C4
        261.626
    """
    return a4_frequency * pow(2, (midi_note - 69) / 12.0)


def frequency_to_midi(frequency: float, a4_frequency: float = 440.0) -> int:
    """
    Converts a frequency in Hz to the closest MIDI note number.
    
    Args:
        frequency: Frequency in Hz
        a4_frequency: Frequency of A4 in Hz (default: 440.0)
        
    Returns:
        The closest MIDI note number
        
    Examples:
        >>> frequency_to_midi(440.0)
        69  # A4
        >>> frequency_to_midi(261.626)
        60  # C4
    """
    if frequency <= 0:
        raise ValueError("Frequency must be positive")
    
    midi_float = 69 + 12 * math.log2(frequency / a4_frequency)
    return int(round(midi_float))
