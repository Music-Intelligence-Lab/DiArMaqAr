"""
Calculate cent deviations from equal temperament for musical analysis.

This module provides functions to calculate how much a pitch or interval
deviates from 12-tone equal temperament (12-TET) in cents. This is useful
for analyzing microtonal music and just intonation systems.
"""

import math
from typing import Union, Dict
from .convert_pitch_class import convert_pitch_class


def calculate_cents_deviation(
    pitch_value: Union[str, int, float],
    reference_system: str = "12tet"
) -> float:
    """
    Calculates the deviation in cents from a reference tuning system.
    
    This function determines how many cents a given pitch deviates from
    the nearest note in the reference tuning system (typically 12-TET).
    
    Args:
        pitch_value: The pitch to analyze (fraction, cents, decimal, or MIDI)
        reference_system: Reference tuning system ("12tet" for 12-tone equal temperament)
        
    Returns:
        Deviation in cents (positive = sharp, negative = flat)
        
    Examples:
        >>> calculate_cents_deviation("3/2")  # Perfect fifth
        1.955  # Slightly sharp compared to 12-TET fifth (700 cents)
        
        >>> calculate_cents_deviation("5/4")  # Major third
        -13.686  # Flat compared to 12-TET major third (400 cents)
    """
    # Convert the input to cents
    cents_value = convert_pitch_class(pitch_value, "cents")
    
    if reference_system == "12tet":
        return _calculate_12tet_deviation(cents_value)
    else:
        raise ValueError(f"Unsupported reference system: {reference_system}")


def _calculate_12tet_deviation(cents: float) -> float:
    """
    Calculates deviation from 12-tone equal temperament.
    
    Args:
        cents: The pitch value in cents
        
    Returns:
        Deviation in cents from the nearest 12-TET semitone
    """
    # In 12-TET, each semitone is exactly 100 cents
    # Find the nearest semitone
    nearest_semitone = round(cents / 100.0)
    nearest_semitone_cents = nearest_semitone * 100.0
    
    # Calculate deviation
    deviation = cents - nearest_semitone_cents
    
    # Normalize to range [-50, +50] cents
    if deviation > 50:
        deviation -= 100
    elif deviation < -50:
        deviation += 100
    
    return deviation


def calculate_interval_deviation(
    interval_value: Union[str, int, float],
    reference_system: str = "12tet"
) -> Dict[str, float]:
    """
    Calculates deviation statistics for a musical interval.
    
    Args:
        interval_value: The interval to analyze
        reference_system: Reference tuning system
        
    Returns:
        Dictionary with deviation statistics:
        - 'deviation_cents': Raw deviation in cents
        - 'deviation_percentage': Deviation as percentage of semitone
        - 'nearest_semitones': Number of semitones to nearest 12-TET interval
        
    Examples:
        >>> calculate_interval_deviation("3/2")
        {'deviation_cents': 1.955, 'deviation_percentage': 1.955, 'nearest_semitones': 7}
    """
    deviation_cents = calculate_cents_deviation(interval_value, reference_system)
    cents_value = convert_pitch_class(interval_value, "cents")
    
    if reference_system == "12tet":
        nearest_semitones = round(cents_value / 100.0)
        deviation_percentage = deviation_cents  # Since 1 cent = 1% of semitone in this context
        
        return {
            'deviation_cents': deviation_cents,
            'deviation_percentage': deviation_percentage,
            'nearest_semitones': nearest_semitones
        }
    else:
        raise ValueError(f"Unsupported reference system: {reference_system}")


def get_just_intonation_deviations() -> Dict[str, float]:
    """
    Returns the cent deviations of common just intonation intervals from 12-TET.
    
    This provides a reference table of how much common just intonation ratios
    deviate from their nearest 12-TET equivalents.
    
    Returns:
        Dictionary mapping interval names to their deviations in cents
        
    Examples:
        >>> deviations = get_just_intonation_deviations()
        >>> deviations['perfect_fifth']  # 3/2
        1.955
        >>> deviations['major_third']  # 5/4
        -13.686
    """
    just_intervals = {
        'unison': '1/1',
        'minor_second': '16/15',
        'major_second': '9/8',
        'minor_third': '6/5',
        'major_third': '5/4',
        'perfect_fourth': '4/3',
        'tritone': '45/32',  # One of several possible tritones
        'perfect_fifth': '3/2',
        'minor_sixth': '8/5',
        'major_sixth': '5/3',
        'minor_seventh': '16/9',
        'major_seventh': '15/8',
        'octave': '2/1'
    }
    
    deviations = {}
    for name, ratio in just_intervals.items():
        deviations[name] = calculate_cents_deviation(ratio)
    
    return deviations


def calculate_scale_deviations(
    scale_ratios: list,
    reference_system: str = "12tet"
) -> Dict[int, Dict[str, float]]:
    """
    Calculates deviations for all notes in a scale.
    
    Args:
        scale_ratios: List of ratios representing the scale degrees
        reference_system: Reference tuning system
        
    Returns:
        Dictionary mapping scale degree (0-based) to deviation statistics
        
    Examples:
        >>> just_major = ['1/1', '9/8', '5/4', '4/3', '3/2', '5/3', '15/8', '2/1']
        >>> deviations = calculate_scale_deviations(just_major)
        >>> deviations[2]['deviation_cents']  # Major third
        -13.686
    """
    deviations = {}
    
    for i, ratio in enumerate(scale_ratios):
        deviation_stats = calculate_interval_deviation(ratio, reference_system)
        deviations[i] = {
            'ratio': ratio,
            'cents': convert_pitch_class(ratio, "cents"),
            **deviation_stats
        }
    
    return deviations


def is_microtonal(
    pitch_value: Union[str, int, float],
    tolerance_cents: float = 10.0
) -> bool:
    """
    Determines if a pitch is microtonal (significantly deviates from 12-TET).
    
    Args:
        pitch_value: The pitch to analyze
        tolerance_cents: Tolerance in cents for considering a pitch "microtonal"
        
    Returns:
        True if the pitch deviates more than the tolerance from 12-TET
        
    Examples:
        >>> is_microtonal("3/2")  # Perfect fifth, close to 12-TET
        False
        >>> is_microtonal("11/8")  # 11th harmonic, quite microtonal
        True
    """
    deviation = abs(calculate_cents_deviation(pitch_value))
    return deviation > tolerance_cents


def cents_to_ratio_string(cents: float, max_denominator: int = 99) -> str:
    """
    Converts a cent value to its closest simple ratio representation.
    
    This is useful for expressing microtonal intervals in ratio form
    for better understanding and notation.
    
    Args:
        cents: The cent value to convert
        max_denominator: Maximum denominator for the resulting fraction
        
    Returns:
        String representation of the closest simple ratio
        
    Examples:
        >>> cents_to_ratio_string(702.0)
        "3/2"
        >>> cents_to_ratio_string(386.3)
        "5/4"
    """
    return convert_pitch_class(cents, "fraction")


def analyze_tuning_system_deviations(
    tuning_ratios: list,
    system_name: str = "Custom"
) -> Dict[str, Union[str, float, Dict]]:
    """
    Provides a comprehensive analysis of a tuning system's deviations from 12-TET.
    
    Args:
        tuning_ratios: List of ratios defining the tuning system
        system_name: Name of the tuning system for the report
        
    Returns:
        Comprehensive analysis dictionary with statistics and per-note details
        
    Examples:
        >>> ratios = ['1/1', '9/8', '5/4', '4/3', '3/2', '5/3', '15/8', '2/1']
        >>> analysis = analyze_tuning_system_deviations(ratios, "Just Major")
        >>> analysis['max_deviation']
        13.686
    """
    scale_deviations = calculate_scale_deviations(tuning_ratios)
    
    # Calculate statistics
    all_deviations = [abs(info['deviation_cents']) for info in scale_deviations.values()]
    
    analysis = {
        'system_name': system_name,
        'num_notes': len(tuning_ratios),
        'max_deviation': max(all_deviations) if all_deviations else 0,
        'average_deviation': sum(all_deviations) / len(all_deviations) if all_deviations else 0,
        'microtonal_notes': sum(1 for dev in all_deviations if dev > 10.0),
        'scale_deviations': scale_deviations
    }
    
    return analysis
