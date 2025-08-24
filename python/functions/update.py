"""
Update functionality for maintaining and modifying musical data structures.

Provides utilities to update tuning systems, maqamat, ajnas, and other
musical data while preserving data integrity and relationships.
"""

from typing import Dict, List, Optional, Any, Union
from fractions import Fraction
from copy import deepcopy

from ..models.tuning_system import TuningSystem
from ..models.pitch_class import PitchClass
from ..models.jins import JinsData, Jins
from ..models.maqam import MaqamData, Maqam
from ..models.pattern import Pattern, PatternNote
from ..models.sources import Source
from .compute_fraction_interval import compute_fraction_interval
from .transpose import get_jins_transpositions, get_maqam_transpositions


def update_tuning_system(
    tuning_system: TuningSystem,
    updates: Dict[str, Any]
) -> TuningSystem:
    """
    Update a tuning system with new data.
    
    Args:
        tuning_system: Original tuning system
        updates: Dictionary of fields to update
        
    Returns:
        Updated TuningSystem object
    """
    # Create a deep copy to avoid modifying the original
    updated_system = deepcopy(tuning_system)
    
    # Update basic fields
    if 'name' in updates:
        updated_system.name = updates['name']
    
    # Update pitch classes
    if 'pitch_classes' in updates:
        new_pitch_classes = []
        for pc_data in updates['pitch_classes']:
            if isinstance(pc_data, PitchClass):
                new_pitch_classes.append(pc_data)
            elif isinstance(pc_data, dict):
                pitch_class = PitchClass(
                    note=pc_data.get('note', ''),
                    frequency=pc_data.get('frequency', ''),
                    fraction=pc_data.get('fraction', ''),
                    decimal_ratio=pc_data.get('decimal_ratio', ''),
                    cents_deviation=pc_data.get('cents_deviation', 0)
                )
                new_pitch_classes.append(pitch_class)
        
        updated_system.pitch_classes = new_pitch_classes
    
    return updated_system


def update_pitch_class(
    pitch_class: PitchClass,
    updates: Dict[str, Any]
) -> PitchClass:
    """
    Update a pitch class with new data.
    
    Args:
        pitch_class: Original pitch class
        updates: Dictionary of fields to update
        
    Returns:
        Updated PitchClass object
    """
    updated_pc = PitchClass(
        note=updates.get('note', pitch_class.note),
        frequency=updates.get('frequency', pitch_class.frequency),
        fraction=updates.get('fraction', pitch_class.fraction),
        decimal_ratio=updates.get('decimal_ratio', pitch_class.decimal_ratio),
        cents_deviation=updates.get('cents_deviation', pitch_class.cents_deviation)
    )
    
    return updated_pc


def update_maqam_data(
    maqam_data: MaqamData,
    updates: Dict[str, Any]
) -> MaqamData:
    """
    Update maqam data with new information.
    
    Args:
        maqam_data: Original maqam data
        updates: Dictionary of fields to update
        
    Returns:
        Updated MaqamData object
    """
    # Convert scale intervals if provided
    scale_intervals = maqam_data.scale_intervals
    if 'scale_intervals' in updates:
        scale_intervals = []
        for interval in updates['scale_intervals']:
            if isinstance(interval, Fraction):
                scale_intervals.append(interval)
            elif isinstance(interval, str):
                try:
                    scale_intervals.append(Fraction(interval))
                except ValueError:
                    scale_intervals.append(Fraction(1, 1))
            else:
                scale_intervals.append(Fraction(interval).limit_denominator())
    
    updated_maqam = MaqamData(
        name=updates.get('name', maqam_data.name),
        scale_intervals=scale_intervals,
        starting_note=updates.get('starting_note', maqam_data.starting_note),
        family=updates.get('family', maqam_data.family),
        description=updates.get('description', maqam_data.description)
    )
    
    return updated_maqam


def update_jins_data(
    jins_data: JinsData,
    updates: Dict[str, Any]
) -> JinsData:
    """
    Update jins data with new information.
    
    Args:
        jins_data: Original jins data
        updates: Dictionary of fields to update
        
    Returns:
        Updated JinsData object
    """
    # Convert intervals if provided
    intervals = jins_data.intervals
    if 'intervals' in updates:
        intervals = []
        for interval in updates['intervals']:
            if isinstance(interval, Fraction):
                intervals.append(interval)
            elif isinstance(interval, str):
                try:
                    intervals.append(Fraction(interval))
                except ValueError:
                    intervals.append(Fraction(1, 1))
            else:
                intervals.append(Fraction(interval).limit_denominator())
    
    updated_jins = JinsData(
        name=updates.get('name', jins_data.name),
        intervals=intervals,
        starting_note=updates.get('starting_note', jins_data.starting_note),
        family=updates.get('family', jins_data.family),
        description=updates.get('description', jins_data.description)
    )
    
    return updated_jins


def update_pattern(
    pattern: Pattern,
    updates: Dict[str, Any]
) -> Pattern:
    """
    Update a pattern with new information.
    
    Args:
        pattern: Original pattern
        updates: Dictionary of fields to update
        
    Returns:
        Updated Pattern object
    """
    # Update notes if provided
    notes = pattern.notes
    if 'notes' in updates:
        notes = []
        for note_data in updates['notes']:
            if isinstance(note_data, PatternNote):
                notes.append(note_data)
            elif isinstance(note_data, dict):
                pattern_note = PatternNote(
                    frequency=note_data.get('frequency', 0.0),
                    duration=note_data.get('duration', 1.0),
                    pitch_class=note_data.get('pitch_class', ''),
                    dynamic=note_data.get('dynamic', 'mf')
                )
                notes.append(pattern_note)
    
    updated_pattern = Pattern(
        name=updates.get('name', pattern.name),
        notes=notes,
        tempo=updates.get('tempo', pattern.tempo),
        time_signature=updates.get('time_signature', pattern.time_signature),
        description=updates.get('description', pattern.description)
    )
    
    return updated_pattern


def update_source(
    source: Source,
    updates: Dict[str, Any]
) -> Source:
    """
    Update a source with new information.
    
    Args:
        source: Original source
        updates: Dictionary of fields to update
        
    Returns:
        Updated Source object
    """
    updated_source = deepcopy(source)
    updated_source.update_from_dict(updates)
    return updated_source


def batch_update_pitch_classes(
    pitch_classes: List[PitchClass],
    update_function: callable,
    filter_function: Optional[callable] = None
) -> List[PitchClass]:
    """
    Apply updates to multiple pitch classes.
    
    Args:
        pitch_classes: List of pitch classes to update
        update_function: Function that takes a PitchClass and returns updates dict
        filter_function: Optional function to filter which pitch classes to update
        
    Returns:
        List of updated pitch classes
    """
    updated_pitch_classes = []
    
    for pc in pitch_classes:
        if filter_function is None or filter_function(pc):
            updates = update_function(pc)
            updated_pc = update_pitch_class(pc, updates)
            updated_pitch_classes.append(updated_pc)
        else:
            updated_pitch_classes.append(pc)
    
    return updated_pitch_classes


def recalculate_frequencies(
    tuning_system: TuningSystem,
    reference_frequency: float = 440.0,
    reference_note: str = "A4"
) -> TuningSystem:
    """
    Recalculate frequencies in a tuning system based on new reference.
    
    Args:
        tuning_system: Tuning system to update
        reference_frequency: New reference frequency
        reference_note: Reference note name
        
    Returns:
        Updated tuning system with recalculated frequencies
    """
    def update_frequency(pc: PitchClass) -> Dict[str, Any]:
        """Calculate new frequency for a pitch class."""
        if pc.fraction:
            try:
                if isinstance(pc.fraction, str):
                    ratio = Fraction(pc.fraction)
                else:
                    ratio = pc.fraction
                
                # Calculate frequency relative to reference
                new_frequency = reference_frequency * float(ratio)
                
                return {
                    'frequency': str(new_frequency),
                    'decimal_ratio': str(float(ratio))
                }
            except (ValueError, TypeError):
                return {}
        
        return {}
    
    updated_pitch_classes = batch_update_pitch_classes(
        tuning_system.pitch_classes,
        update_frequency
    )
    
    return update_tuning_system(tuning_system, {
        'pitch_classes': updated_pitch_classes
    })


def normalize_intervals(
    intervals: List[Union[Fraction, str, float]]
) -> List[Fraction]:
    """
    Normalize a list of intervals to Fraction objects.
    
    Args:
        intervals: List of intervals in various formats
        
    Returns:
        List of normalized Fraction intervals
    """
    normalized = []
    
    for interval in intervals:
        if isinstance(interval, Fraction):
            normalized.append(interval)
        elif isinstance(interval, str):
            try:
                normalized.append(Fraction(interval))
            except ValueError:
                normalized.append(Fraction(1, 1))  # Default to unison
        elif isinstance(interval, (int, float)):
            normalized.append(Fraction(interval).limit_denominator())
        else:
            normalized.append(Fraction(1, 1))  # Default to unison
    
    return normalized


def validate_scale_intervals(
    intervals: List[Fraction],
    max_ratio: float = 10.0
) -> Dict[str, Any]:
    """
    Validate scale intervals for musical reasonableness.
    
    Args:
        intervals: List of intervals to validate
        max_ratio: Maximum allowable ratio
        
    Returns:
        Dictionary with validation results
    """
    validation = {
        'valid': True,
        'warnings': [],
        'errors': []
    }
    
    for i, interval in enumerate(intervals):
        ratio = float(interval)
        
        # Check for reasonable ranges
        if ratio < 0.5:
            validation['warnings'].append(f"Interval {i} unusually low: {interval}")
        
        if ratio > max_ratio:
            validation['warnings'].append(f"Interval {i} unusually high: {interval}")
        
        # Check for zero or negative values
        if ratio <= 0:
            validation['valid'] = False
            validation['errors'].append(f"Interval {i} is zero or negative: {interval}")
    
    # Check for ascending order (optional warning)
    for i in range(1, len(intervals)):
        if float(intervals[i]) < float(intervals[i-1]):
            validation['warnings'].append(f"Intervals not in ascending order at position {i}")
    
    return validation


def merge_tuning_systems(
    system1: TuningSystem,
    system2: TuningSystem,
    merge_strategy: str = "union"
) -> TuningSystem:
    """
    Merge two tuning systems using specified strategy.
    
    Args:
        system1: First tuning system
        system2: Second tuning system
        merge_strategy: Strategy - "union", "intersection", or "replace"
        
    Returns:
        Merged tuning system
    """
    if merge_strategy == "replace":
        return deepcopy(system2)
    
    merged_name = f"{system1.name} + {system2.name}"
    merged_pitch_classes = []
    
    if merge_strategy == "union":
        # Add all pitch classes from both systems
        merged_pitch_classes.extend(system1.pitch_classes)
        
        # Add pitch classes from system2 that aren't already present
        existing_notes = {pc.note for pc in system1.pitch_classes}
        for pc in system2.pitch_classes:
            if pc.note not in existing_notes:
                merged_pitch_classes.append(pc)
    
    elif merge_strategy == "intersection":
        # Only include pitch classes that exist in both systems
        notes1 = {pc.note: pc for pc in system1.pitch_classes}
        notes2 = {pc.note: pc for pc in system2.pitch_classes}
        
        common_notes = set(notes1.keys()) & set(notes2.keys())
        for note in common_notes:
            # Use pitch class from system1 by default
            merged_pitch_classes.append(notes1[note])
    
    return TuningSystem(name=merged_name, pitch_classes=merged_pitch_classes)


def update_maqam_family_classification(
    maqamat: List[MaqamData],
    classification_rules: Dict[str, callable]
) -> List[MaqamData]:
    """
    Update family classifications for maqamat based on rules.
    
    Args:
        maqamat: List of maqamat to classify
        classification_rules: Dictionary mapping family names to classification functions
        
    Returns:
        List of maqamat with updated family classifications
    """
    updated_maqamat = []
    
    for maqam in maqamat:
        new_family = maqam.family  # Default to existing family
        
        # Apply classification rules
        for family_name, rule_function in classification_rules.items():
            if rule_function(maqam):
                new_family = family_name
                break
        
        updated_maqam = update_maqam_data(maqam, {'family': new_family})
        updated_maqamat.append(updated_maqam)
    
    return updated_maqamat


def synchronize_pitch_class_data(
    pitch_class: PitchClass,
    reference_frequency: float = 440.0
) -> PitchClass:
    """
    Synchronize all data fields in a pitch class for consistency.
    
    Args:
        pitch_class: Pitch class to synchronize
        reference_frequency: Reference frequency for calculations
        
    Returns:
        Synchronized pitch class
    """
    updates = {}
    
    # If we have a fraction, calculate other fields
    if pitch_class.fraction:
        try:
            if isinstance(pitch_class.fraction, str):
                fraction = Fraction(pitch_class.fraction)
            else:
                fraction = pitch_class.fraction
            
            # Calculate frequency
            frequency = reference_frequency * float(fraction)
            updates['frequency'] = str(frequency)
            
            # Calculate decimal ratio
            updates['decimal_ratio'] = str(float(fraction))
            
            # Calculate cents deviation from equal temperament
            # This is a simplified calculation - could be more sophisticated
            semitones = 12 * (float(fraction).bit_length() - 1)  # Rough estimate
            equal_temp_ratio = 2 ** (semitones / 12)
            cents_deviation = 1200 * (float(fraction) / equal_temp_ratio - 1)
            updates['cents_deviation'] = cents_deviation
            
        except (ValueError, TypeError):
            pass
    
    return update_pitch_class(pitch_class, updates)


def version_control_update(
    original_data: Any,
    updated_data: Any,
    version_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a version-controlled update record.
    
    Args:
        original_data: Original data object
        updated_data: Updated data object
        version_info: Version information (timestamp, user, etc.)
        
    Returns:
        Dictionary containing version control information
    """
    return {
        'original_data': deepcopy(original_data),
        'updated_data': deepcopy(updated_data),
        'version_info': version_info,
        'timestamp': version_info.get('timestamp'),
        'changes': compare_data_changes(original_data, updated_data)
    }


def compare_data_changes(
    original: Any,
    updated: Any
) -> List[Dict[str, Any]]:
    """
    Compare two data objects and return list of changes.
    
    Args:
        original: Original data object
        updated: Updated data object
        
    Returns:
        List of change descriptions
    """
    changes = []
    
    # This is a simplified implementation
    # In practice, you might want more sophisticated comparison
    if hasattr(original, '__dict__') and hasattr(updated, '__dict__'):
        original_dict = original.__dict__
        updated_dict = updated.__dict__
        
        for key in set(original_dict.keys()) | set(updated_dict.keys()):
            original_value = original_dict.get(key)
            updated_value = updated_dict.get(key)
            
            if original_value != updated_value:
                changes.append({
                    'field': key,
                    'original_value': original_value,
                    'updated_value': updated_value,
                    'change_type': 'modified' if key in original_dict else 'added'
                })
    
    return changes
