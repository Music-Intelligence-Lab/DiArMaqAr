"""
Generate analytics data for maqam and tuning system analysis.

This module provides functions to generate comprehensive analytics
about tuning systems, maqamat, and ajnas for statistical analysis.
"""

from typing import Dict, List, Any, Optional
from collections import Counter
import statistics

from ..models.tuning_system import TuningSystem
from ..models.jins import JinsData
from ..models.maqam import MaqamData
from ..models.pitch_class import PitchClass
from .get_tuning_system_cells import get_tuning_system_cells
from .transpose import get_jins_transpositions, get_maqam_transpositions
from .calculate_cents_deviation import calculate_scale_deviations, is_microtonal


def generate_tuning_system_analytics(
    tuning_system: TuningSystem,
    starting_note: str
) -> Dict[str, Any]:
    """
    Generate comprehensive analytics for a tuning system.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note for analysis
        
    Returns:
        Dictionary containing detailed analytics
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    # Basic statistics
    analytics = {
        "tuning_system_name": tuning_system.name if hasattr(tuning_system, 'name') else "Unknown",
        "starting_note": starting_note,
        "total_pitch_classes": len(pitch_classes),
        "octaves": 4,
        "pitch_classes_per_octave": len(pitch_classes) // 4 if pitch_classes else 0
    }
    
    # Frequency analysis
    frequencies = []
    for pc in pitch_classes:
        try:
            freq = float(pc.frequency) if pc.frequency else 0
            if freq > 0:
                frequencies.append(freq)
        except (ValueError, AttributeError):
            continue
    
    if frequencies:
        analytics["frequency_statistics"] = {
            "min_frequency": min(frequencies),
            "max_frequency": max(frequencies),
            "mean_frequency": statistics.mean(frequencies),
            "median_frequency": statistics.median(frequencies),
            "frequency_range": max(frequencies) - min(frequencies)
        }
    
    # Interval analysis
    intervals = []
    for pc in pitch_classes:
        if pc.decimal_ratio:
            try:
                ratio = float(pc.decimal_ratio)
                intervals.append(ratio)
            except (ValueError, AttributeError):
                continue
    
    if intervals:
        analytics["interval_statistics"] = {
            "min_ratio": min(intervals),
            "max_ratio": max(intervals),
            "mean_ratio": statistics.mean(intervals),
            "median_ratio": statistics.median(intervals)
        }
    
    # Cents deviation analysis
    deviations = []
    microtonal_count = 0
    
    for pc in pitch_classes:
        try:
            deviation = float(pc.cents_deviation) if hasattr(pc, 'cents_deviation') else 0
            deviations.append(abs(deviation))
            
            if pc.fraction and is_microtonal(pc.fraction):
                microtonal_count += 1
        except (ValueError, AttributeError):
            continue
    
    if deviations:
        analytics["cents_deviation_statistics"] = {
            "max_deviation": max(deviations),
            "mean_deviation": statistics.mean(deviations),
            "median_deviation": statistics.median(deviations),
            "microtonal_pitch_classes": microtonal_count,
            "microtonal_percentage": (microtonal_count / len(pitch_classes)) * 100 if pitch_classes else 0
        }
    
    return analytics


def generate_maqamat_analytics(
    all_maqamat: List[MaqamData],
    pitch_classes: List[PitchClass]
) -> Dict[str, Any]:
    """
    Generate analytics for all maqamat in a tuning system.
    
    Args:
        all_maqamat: List of all maqam definitions
        pitch_classes: Available pitch classes
        
    Returns:
        Dictionary containing maqamat analytics
    """
    analytics = {
        "total_maqam_types": len(all_maqamat),
        "maqam_names": [maqam.name for maqam in all_maqamat]
    }
    
    # Count total possible transpositions
    total_transpositions = 0
    transpositions_per_maqam = {}
    
    for maqam_data in all_maqamat:
        transpositions = get_maqam_transpositions(pitch_classes, maqam_data)
        count = len(transpositions)
        total_transpositions += count
        transpositions_per_maqam[maqam_data.name] = count
    
    analytics["total_possible_maqamat"] = total_transpositions
    analytics["average_transpositions_per_maqam"] = total_transpositions / len(all_maqamat) if all_maqamat else 0
    analytics["transpositions_per_maqam"] = transpositions_per_maqam
    
    # Analyze scale intervals
    scale_lengths = [len(maqam.scale_intervals) for maqam in all_maqamat]
    if scale_lengths:
        analytics["scale_length_statistics"] = {
            "min_scale_length": min(scale_lengths),
            "max_scale_length": max(scale_lengths),
            "mean_scale_length": statistics.mean(scale_lengths),
            "median_scale_length": statistics.median(scale_lengths)
        }
    
    # Most common scale lengths
    length_counts = Counter(scale_lengths)
    analytics["common_scale_lengths"] = dict(length_counts.most_common(5))
    
    return analytics


def generate_ajnas_analytics(
    all_ajnas: List[JinsData],
    pitch_classes: List[PitchClass]
) -> Dict[str, Any]:
    """
    Generate analytics for all ajnas in a tuning system.
    
    Args:
        all_ajnas: List of all jins definitions
        pitch_classes: Available pitch classes
        
    Returns:
        Dictionary containing ajnas analytics
    """
    analytics = {
        "total_jins_types": len(all_ajnas),
        "jins_names": [jins.name for jins in all_ajnas]
    }
    
    # Count total possible transpositions
    total_transpositions = 0
    transpositions_per_jins = {}
    
    for jins_data in all_ajnas:
        transpositions = get_jins_transpositions(pitch_classes, jins_data)
        count = len(transpositions)
        total_transpositions += count
        transpositions_per_jins[jins_data.name] = count
    
    analytics["total_possible_ajnas"] = total_transpositions
    analytics["average_transpositions_per_jins"] = total_transpositions / len(all_ajnas) if all_ajnas else 0
    analytics["transpositions_per_jins"] = transpositions_per_jins
    
    # Analyze interval patterns
    interval_lengths = [len(jins.intervals) for jins in all_ajnas]
    if interval_lengths:
        analytics["interval_length_statistics"] = {
            "min_interval_length": min(interval_lengths),
            "max_interval_length": max(interval_lengths),
            "mean_interval_length": statistics.mean(interval_lengths),
            "median_interval_length": statistics.median(interval_lengths)
        }
    
    # Most common interval lengths
    length_counts = Counter(interval_lengths)
    analytics["common_interval_lengths"] = dict(length_counts.most_common(5))
    
    return analytics


def generate_comprehensive_analytics(
    tuning_system: TuningSystem,
    starting_note: str,
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData]
) -> Dict[str, Any]:
    """
    Generate comprehensive analytics combining all aspects.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note
        all_ajnas: Available ajnas
        all_maqamat: Available maqamat
        
    Returns:
        Comprehensive analytics dictionary
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    analytics = {
        "timestamp": None,  # Could add timestamp if needed
        "tuning_system": generate_tuning_system_analytics(tuning_system, starting_note),
        "maqamat": generate_maqamat_analytics(all_maqamat, pitch_classes),
        "ajnas": generate_ajnas_analytics(all_ajnas, pitch_classes)
    }
    
    # Cross-analysis
    analytics["cross_analysis"] = {
        "maqamat_to_ajnas_ratio": (
            analytics["maqamat"]["total_possible_maqamat"] / 
            analytics["ajnas"]["total_possible_ajnas"]
        ) if analytics["ajnas"]["total_possible_ajnas"] > 0 else 0,
        
        "average_maqam_complexity": (
            analytics["maqamat"]["scale_length_statistics"]["mean_scale_length"]
            if "scale_length_statistics" in analytics["maqamat"] else 0
        ),
        
        "average_jins_complexity": (
            analytics["ajnas"]["interval_length_statistics"]["mean_interval_length"]
            if "interval_length_statistics" in analytics["ajnas"] else 0
        )
    }
    
    return analytics


def generate_pitch_class_usage_analytics(
    pitch_classes: List[PitchClass],
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData]
) -> Dict[str, Any]:
    """
    Analyze how frequently each pitch class is used across maqamat and ajnas.
    
    Args:
        pitch_classes: Available pitch classes
        all_ajnas: Available ajnas
        all_maqamat: Available maqamat
        
    Returns:
        Pitch class usage analytics
    """
    # Count usage in ajnas
    jins_usage = Counter()
    for jins_data in all_ajnas:
        transpositions = get_jins_transpositions(pitch_classes, jins_data)
        for jins in transpositions:
            if hasattr(jins, 'scale_intervals'):
                for interval in jins.scale_intervals:
                    jins_usage[interval] += 1
    
    # Count usage in maqamat
    maqam_usage = Counter()
    for maqam_data in all_maqamat:
        transpositions = get_maqam_transpositions(pitch_classes, maqam_data)
        for maqam in transpositions:
            if hasattr(maqam, 'scale_intervals'):
                for interval in maqam.scale_intervals:
                    maqam_usage[interval] += 1
    
    return {
        "most_used_in_ajnas": dict(jins_usage.most_common(10)),
        "most_used_in_maqamat": dict(maqam_usage.most_common(10)),
        "total_unique_intervals_in_ajnas": len(jins_usage),
        "total_unique_intervals_in_maqamat": len(maqam_usage)
    }


def export_analytics_summary(analytics: Dict[str, Any]) -> str:
    """
    Export analytics as a formatted summary string.
    
    Args:
        analytics: Analytics dictionary
        
    Returns:
        Formatted summary string
    """
    summary_lines = [
        "=== Maqam Network Analytics Summary ===",
        "",
        f"Tuning System: {analytics.get('tuning_system', {}).get('tuning_system_name', 'Unknown')}",
        f"Starting Note: {analytics.get('tuning_system', {}).get('starting_note', 'Unknown')}",
        f"Total Pitch Classes: {analytics.get('tuning_system', {}).get('total_pitch_classes', 0)}",
        "",
        "=== Maqamat Statistics ===",
        f"Types: {analytics.get('maqamat', {}).get('total_maqam_types', 0)}",
        f"Total Possible: {analytics.get('maqamat', {}).get('total_possible_maqamat', 0)}",
        f"Average per Type: {analytics.get('maqamat', {}).get('average_transpositions_per_maqam', 0):.1f}",
        "",
        "=== Ajnas Statistics ===",
        f"Types: {analytics.get('ajnas', {}).get('total_jins_types', 0)}",
        f"Total Possible: {analytics.get('ajnas', {}).get('total_possible_ajnas', 0)}",
        f"Average per Type: {analytics.get('ajnas', {}).get('average_transpositions_per_jins', 0):.1f}",
        ""
    ]
    
    # Add frequency statistics if available
    freq_stats = analytics.get('tuning_system', {}).get('frequency_statistics')
    if freq_stats:
        summary_lines.extend([
            "=== Frequency Range ===",
            f"Range: {freq_stats['min_frequency']:.1f} - {freq_stats['max_frequency']:.1f} Hz",
            f"Mean: {freq_stats['mean_frequency']:.1f} Hz",
            ""
        ])
    
    # Add microtonal analysis if available
    cents_stats = analytics.get('tuning_system', {}).get('cents_deviation_statistics')
    if cents_stats:
        summary_lines.extend([
            "=== Microtonal Analysis ===",
            f"Max Deviation: {cents_stats['max_deviation']:.1f} cents",
            f"Microtonal Percentage: {cents_stats['microtonal_percentage']:.1f}%",
            ""
        ])
    
    return "\n".join(summary_lines)
