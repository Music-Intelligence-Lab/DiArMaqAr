"""
Pitch class representation for oriental musicology.

A Pitch class in oriental musicology is a fundamental abstraction that represents 
a musical relation of a musical pitch. Rather than defining absolute properties 
with frequencies, it uses relational measurements like cents, string length, 
fraction ratio, and decimal ratio.
"""

from typing import Protocol, Optional
from dataclasses import dataclass


class PitchClass(Protocol):
    """
    A Pitch class in oriental musicology is a fundamental abstraction that represents 
    a musical relation of a musical pitch. Rather than defining absolute properties 
    with frequencies, it uses relational measurements like cents, string length, 
    fraction ratio, and decimal ratio. When used within the context of a tuning system, 
    the pitch class will be linked to a note name and an audible frequency. This 
    relational approach enables systematic analysis of transpositions and modulations, 
    as interval relationships between the pitch classes are maintained regardless of 
    the reference frequency.
    """
    note_name: str                    # The name of the note in the current tuning system
    fraction: str                     # Frequency ratio expressed as a fraction (e.g., "3/2")
    cents: str                        # Pitch measurement in cents relative to a reference
    decimal_ratio: str                # Frequency ratio as a decimal number
    string_length: str                # Relative string length for string instruments
    fret_division: str                # Fret position for fretted instruments
    frequency: str                    # Absolute frequency in Hz
    midi_note_number: int             # MIDI note number representation
    original_value: str               # The original input value used to create this pitch class
    original_value_type: str          # The type of the original value
    english_name: str                 # English name of the note
    abjad_name: str                   # Arabic/Abjad name of the note
    index: int                        # Position index within the scale or tuning system
    octave: int                       # Octave number
    cents_deviation: float            # Deviation in cents from the nearest equal-tempered pitch
    reference_note_name: Optional[str] # Optional reference note name for relative calculations


@dataclass
class PitchClassInterval:
    """
    Represents the interval between two pitch classes, containing the difference 
    in various measurement systems. This enables comparison and analysis of 
    musical intervals across different representation formats.
    """
    fraction: str           # Interval as a frequency ratio fraction
    cents: float           # Interval in cents
    decimal_ratio: float   # Interval as a decimal ratio
    string_length: float   # String length difference
    fret_division: float   # Fret division difference
    index: int             # Index difference considering octaves
    original_value: str    # String representation of the interval in its original format
    original_value_type: str # Type of the original value representation


def convert_fraction_to_decimal(fraction: str) -> float:
    """
    Converts a fraction string to its decimal representation.
    
    Args:
        fraction: String representation of a fraction (e.g., "3/2")
        
    Returns:
        The decimal equivalent of the fraction
        
    Example:
        >>> convert_fraction_to_decimal("3/2")
        1.5
        >>> convert_fraction_to_decimal("4/3")
        1.3333333333333333
    """
    numerator, denominator = map(int, fraction.split("/"))
    return numerator / denominator


def calculate_interval(first_pitch_class: PitchClass, second_pitch_class: PitchClass) -> PitchClassInterval:
    """
    Calculates the interval between two pitch classes in all measurement systems.
    This function computes the difference between two pitch classes across multiple
    representation formats, enabling comprehensive interval analysis.
    
    Args:
        first_pitch_class: The starting pitch class
        second_pitch_class: The ending pitch class
        
    Returns:
        A PitchClassInterval object containing the interval measurements in all supported formats
        
    Example:
        >>> interval = calculate_interval(pitch_class1, pitch_class2)
        >>> print(f"Interval: {interval.cents} cents")
        >>> print(f"Fraction: {interval.fraction}")
        >>> print(f"Decimal ratio: {interval.decimal_ratio}")
    """
    # Import here to avoid circular imports
    from ..functions.compute_fraction_interval import compute_fraction_interval
    
    fraction = compute_fraction_interval(first_pitch_class.fraction, second_pitch_class.fraction)
    cents = float(second_pitch_class.cents) - float(first_pitch_class.cents)
    decimal_ratio = convert_fraction_to_decimal(fraction)
    string_length = float(second_pitch_class.string_length) - float(first_pitch_class.string_length)
    fret_division = float(second_pitch_class.fret_division) - float(first_pitch_class.fret_division)
    index = second_pitch_class.index * second_pitch_class.octave - first_pitch_class.index * first_pitch_class.octave

    original_value_type = second_pitch_class.original_value_type
    original_value = ""

    if original_value_type == "fraction":
        original_value = fraction
    elif original_value_type == "cents":
        original_value = f"{cents:.2f}"
    elif original_value_type == "decimalRatio":
        original_value = f"{decimal_ratio:.2f}"
    elif original_value_type == "stringLength":
        original_value = f"{string_length:.2f}"

    return PitchClassInterval(
        fraction=fraction,
        cents=cents,
        decimal_ratio=decimal_ratio,
        string_length=string_length,
        fret_division=fret_division,
        index=index,
        original_value=original_value,
        original_value_type=original_value_type,
    )


def matching_intervals(
    first_interval: PitchClassInterval, 
    second_interval: PitchClassInterval, 
    cents_tolerance: float = 5.0
) -> bool:
    """
    Determines if two intervals are equivalent within a specified tolerance.
    Uses different comparison methods based on the original value type:
    - For fraction and decimal ratio types: Exact string comparison
    - For other types: Cents comparison within tolerance
    
    Args:
        first_interval: First interval to compare
        second_interval: Second interval to compare
        cents_tolerance: Tolerance in cents for comparison (default: 5)
        
    Returns:
        True if the intervals match within the specified tolerance, False otherwise
    """
    original_value_type = first_interval.original_value_type

    if original_value_type in ("fraction", "decimalRatio"):
        return first_interval.fraction == second_interval.fraction
    else:
        return abs(first_interval.cents - second_interval.cents) <= cents_tolerance


def matching_list_of_intervals(
    first_intervals: list[PitchClassInterval], 
    second_intervals: list[PitchClassInterval], 
    cents_tolerance: float = 5.0
) -> bool:
    """
    Compares two arrays of intervals to determine if they represent the same sequence.
    This is useful for comparing interval patterns in scales, modes, or melodic sequences.
    
    Requirements:
    - Arrays must have the same length
    - Each corresponding pair of intervals must match according to matching_intervals
    
    Args:
        first_intervals: List of intervals to compare
        second_intervals: List of intervals to compare against
        cents_tolerance: Tolerance in cents for individual interval comparison (default: 5)
        
    Returns:
        True if all intervals in both arrays match in sequence, False otherwise
    """
    if len(first_intervals) != len(second_intervals):
        return False

    for first_interval, second_interval in zip(first_intervals, second_intervals):
        if not matching_intervals(first_interval, second_interval, cents_tolerance):
            return False

    return True
