"""
Calculate the number of modulations in a scale or melodic sequence.

Based on the theoretical framework for analyzing modulation density
in Arabic maqam music, providing quantitative measures of tonal movement.
"""

from typing import List, Dict, Tuple, Optional, Set
from fractions import Fraction

from ..models.pitch_class import PitchClass
from ..models.jins import JinsData
from ..models.maqam import MaqamData
from .modulate import modulate
from .transpose import get_jins_transpositions, get_maqam_transpositions
from .compute_fraction_interval import compute_fraction_interval


def calculate_number_of_modulations(
    scale_intervals: List[Fraction],
    reference_scale: List[Fraction],
    threshold_cents: float = 50.0
) -> int:
    """
    Calculate the number of modulations between two scales.
    
    A modulation is detected when the interval relationship between
    corresponding degrees differs by more than the threshold.
    
    Args:
        scale_intervals: The scale to analyze for modulations
        reference_scale: The reference scale to compare against
        threshold_cents: Minimum difference to consider a modulation (default: 50 cents)
        
    Returns:
        Number of detected modulations
    """
    if not scale_intervals or not reference_scale:
        return 0
    
    modulation_count = 0
    min_length = min(len(scale_intervals), len(reference_scale))
    
    for i in range(min_length):
        try:
            # Calculate the interval between corresponding degrees
            scale_interval = scale_intervals[i]
            ref_interval = reference_scale[i]
            
            # Compute the difference in cents
            ratio_difference = scale_interval / ref_interval
            cents_difference = abs(1200 * (ratio_difference.numerator / ratio_difference.denominator - 1))
            
            # Check if difference exceeds threshold
            if cents_difference > threshold_cents:
                modulation_count += 1
                
        except (ZeroDivisionError, AttributeError, TypeError):
            # Skip problematic intervals
            continue
    
    return modulation_count


def calculate_chromatic_modulations(
    scale_intervals: List[Fraction],
    chromatic_intervals: List[Fraction]
) -> int:
    """
    Calculate modulations specifically to chromatic alterations.
    
    Args:
        scale_intervals: The scale to analyze
        chromatic_intervals: Set of chromatic intervals in the tuning system
        
    Returns:
        Number of chromatic modulations
    """
    if not scale_intervals or not chromatic_intervals:
        return 0
    
    chromatic_count = 0
    chromatic_set = set(chromatic_intervals)
    
    for interval in scale_intervals:
        if interval in chromatic_set:
            chromatic_count += 1
    
    return chromatic_count


def calculate_sequential_modulations(
    sequence: List[Fraction],
    stability_threshold: float = 100.0
) -> Tuple[int, List[int]]:
    """
    Calculate modulations in a sequential melodic line.
    
    Analyzes the melodic sequence for tonal stability and identifies
    points where the tonal center shifts significantly.
    
    Args:
        sequence: Sequential intervals representing a melody
        stability_threshold: Cents threshold for tonal stability
        
    Returns:
        Tuple of (total_modulations, modulation_positions)
    """
    if len(sequence) < 2:
        return 0, []
    
    modulations = 0
    modulation_positions = []
    current_center = Fraction(1, 1)  # Start at unison
    
    for i in range(1, len(sequence)):
        prev_interval = sequence[i - 1]
        curr_interval = sequence[i]
        
        try:
            # Calculate intervallic change
            intervallic_change = curr_interval / prev_interval
            cents_change = abs(1200 * (float(intervallic_change) - 1))
            
            # Detect significant tonal shifts
            if cents_change > stability_threshold:
                modulations += 1
                modulation_positions.append(i)
                current_center = curr_interval
                
        except (ZeroDivisionError, TypeError):
            continue
    
    return modulations, modulation_positions


def analyze_modulation_density(
    scale_intervals: List[Fraction],
    all_ajnas: List[JinsData],
    pitch_classes: List[PitchClass]
) -> Dict[str, float]:
    """
    Analyze the modulation density of a scale relative to available ajnas.
    
    Args:
        scale_intervals: The scale to analyze
        all_ajnas: Available ajnas for comparison
        pitch_classes: Available pitch classes
        
    Returns:
        Dictionary with modulation density metrics
    """
    if not scale_intervals or not all_ajnas:
        return {
            "total_modulations": 0.0,
            "modulation_density": 0.0,
            "chromatic_density": 0.0,
            "avg_modulations_per_jins": 0.0
        }
    
    total_modulations = 0
    total_comparisons = 0
    chromatic_modulations = 0
    
    # Analyze against each available jins
    for jins_data in all_ajnas:
        jins_transpositions = get_jins_transpositions(pitch_classes, jins_data)
        
        for jins in jins_transpositions:
            if hasattr(jins, 'intervals') and jins.intervals:
                # Convert jins intervals to fractions if needed
                jins_intervals = []
                for interval in jins.intervals:
                    if isinstance(interval, Fraction):
                        jins_intervals.append(interval)
                    elif isinstance(interval, str):
                        try:
                            jins_intervals.append(Fraction(interval))
                        except ValueError:
                            continue
                
                if jins_intervals:
                    modulations = calculate_number_of_modulations(
                        scale_intervals, jins_intervals
                    )
                    total_modulations += modulations
                    total_comparisons += 1
    
    # Calculate chromatic modulations (intervals with complex ratios)
    for interval in scale_intervals:
        if interval.denominator > 16 or interval.numerator > 16:
            chromatic_modulations += 1
    
    # Calculate metrics
    modulation_density = total_modulations / len(scale_intervals) if scale_intervals else 0
    chromatic_density = chromatic_modulations / len(scale_intervals) if scale_intervals else 0
    avg_modulations_per_jins = total_modulations / total_comparisons if total_comparisons > 0 else 0
    
    return {
        "total_modulations": float(total_modulations),
        "modulation_density": modulation_density,
        "chromatic_density": chromatic_density,
        "avg_modulations_per_jins": avg_modulations_per_jins,
        "total_comparisons": total_comparisons
    }


def calculate_maqam_modulation_potential(
    maqam_data: MaqamData,
    all_maqamat: List[MaqamData],
    pitch_classes: List[PitchClass]
) -> Dict[str, any]:
    """
    Calculate the modulation potential of a maqam relative to others.
    
    Args:
        maqam_data: The maqam to analyze
        all_maqamat: All available maqamat
        pitch_classes: Available pitch classes
        
    Returns:
        Dictionary with modulation potential metrics
    """
    if not maqam_data.scale_intervals:
        return {
            "modulation_potential": 0.0,
            "compatible_maqamat": [],
            "difficult_modulations": [],
            "easy_modulations": []
        }
    
    maqam_intervals = [Fraction(interval) if isinstance(interval, str) else interval 
                      for interval in maqam_data.scale_intervals]
    
    compatible_maqamat = []
    difficult_modulations = []
    easy_modulations = []
    total_modulation_count = 0
    
    # Analyze against all other maqamat
    for other_maqam_data in all_maqamat:
        if other_maqam_data.name == maqam_data.name:
            continue
            
        if not other_maqam_data.scale_intervals:
            continue
            
        other_intervals = [Fraction(interval) if isinstance(interval, str) else interval 
                          for interval in other_maqam_data.scale_intervals]
        
        modulations = calculate_number_of_modulations(maqam_intervals, other_intervals)
        total_modulation_count += modulations
        
        # Categorize based on modulation difficulty
        if modulations == 0:
            compatible_maqamat.append(other_maqam_data.name)
        elif modulations <= 2:
            easy_modulations.append({
                "maqam": other_maqam_data.name,
                "modulations": modulations
            })
        else:
            difficult_modulations.append({
                "maqam": other_maqam_data.name,
                "modulations": modulations
            })
    
    # Calculate overall modulation potential
    total_maqamat = len(all_maqamat) - 1  # Exclude self
    modulation_potential = total_modulation_count / total_maqamat if total_maqamat > 0 else 0
    
    return {
        "modulation_potential": modulation_potential,
        "compatible_maqamat": compatible_maqamat,
        "easy_modulations": sorted(easy_modulations, key=lambda x: x["modulations"]),
        "difficult_modulations": sorted(difficult_modulations, key=lambda x: x["modulations"], reverse=True),
        "total_modulation_count": total_modulation_count
    }


def analyze_pivot_tones(
    source_scale: List[Fraction],
    target_scale: List[Fraction]
) -> List[Tuple[int, Fraction]]:
    """
    Analyze pivot tones that can facilitate modulation between scales.
    
    Args:
        source_scale: The starting scale
        target_scale: The target scale for modulation
        
    Returns:
        List of (position, interval) tuples representing pivot tones
    """
    if not source_scale or not target_scale:
        return []
    
    pivot_tones = []
    source_set = set(source_scale)
    
    for i, target_interval in enumerate(target_scale):
        if target_interval in source_set:
            pivot_tones.append((i, target_interval))
    
    return pivot_tones


def calculate_modulation_complexity(
    modulation_path: List[List[Fraction]]
) -> Dict[str, float]:
    """
    Calculate the complexity of a modulation path through multiple scales.
    
    Args:
        modulation_path: List of scales representing the modulation path
        
    Returns:
        Dictionary with complexity metrics
    """
    if len(modulation_path) < 2:
        return {
            "total_complexity": 0.0,
            "average_step_complexity": 0.0,
            "max_step_complexity": 0.0,
            "path_length": len(modulation_path)
        }
    
    step_complexities = []
    
    for i in range(len(modulation_path) - 1):
        current_scale = modulation_path[i]
        next_scale = modulation_path[i + 1]
        
        modulations = calculate_number_of_modulations(current_scale, next_scale)
        step_complexities.append(modulations)
    
    total_complexity = sum(step_complexities)
    average_complexity = total_complexity / len(step_complexities) if step_complexities else 0
    max_complexity = max(step_complexities) if step_complexities else 0
    
    return {
        "total_complexity": float(total_complexity),
        "average_step_complexity": average_complexity,
        "max_step_complexity": float(max_complexity),
        "path_length": len(modulation_path),
        "step_complexities": step_complexities
    }
