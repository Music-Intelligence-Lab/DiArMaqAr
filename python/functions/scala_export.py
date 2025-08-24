"""
Scala file export functionality for tuning systems.

Provides utilities to export tuning systems and scales to Scala (.scl) format,
which is widely used in microtonal music software and synthesizers.
"""

from typing import List, Optional, Dict
from fractions import Fraction
import math

from ..models.tuning_system import TuningSystem
from ..models.pitch_class import PitchClass
from .get_tuning_system_cells import get_tuning_system_cells
from .compute_fraction_interval import compute_fraction_interval


def export_tuning_system_to_scala(
    tuning_system: TuningSystem,
    starting_note: str = "C",
    octave: int = 4,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> str:
    """
    Export a tuning system to Scala (.scl) format.
    
    Args:
        tuning_system: The tuning system to export
        starting_note: Starting note for the scale
        octave: Octave number for the starting note
        title: Optional title for the scale file
        description: Optional description
        
    Returns:
        Scala format string
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    # Filter to single octave
    octave_pitches = [
        pc for pc in pitch_classes 
        if hasattr(pc, 'note') and pc.note and 
        str(octave) in pc.note
    ]
    
    if not octave_pitches:
        # Fallback: use first available octave
        octave_pitches = pitch_classes[:12] if len(pitch_classes) >= 12 else pitch_classes
    
    # Generate Scala content
    lines = []
    
    # Title line
    if title:
        lines.append(f"! {title}")
    else:
        system_name = getattr(tuning_system, 'name', 'Unknown')
        lines.append(f"! {system_name} - {starting_note}{octave}")
    
    # Description line
    if description:
        lines.append(f"! {description}")
    else:
        lines.append(f"! Generated from tuning system starting at {starting_note}{octave}")
    
    # Empty line
    lines.append("!")
    
    # Number of notes (excluding octave)
    num_notes = len(octave_pitches) - 1 if len(octave_pitches) > 1 else 0
    lines.append(str(num_notes))
    
    # Note specifications
    if len(octave_pitches) > 1:
        # Use first pitch as reference (1/1)
        reference_pitch = octave_pitches[0]
        reference_ratio = Fraction(1, 1)
        
        for i in range(1, len(octave_pitches)):
            pitch = octave_pitches[i]
            
            # Calculate interval from reference
            if hasattr(pitch, 'fraction') and pitch.fraction:
                try:
                    if isinstance(pitch.fraction, str):
                        interval = Fraction(pitch.fraction)
                    else:
                        interval = pitch.fraction
                    
                    # Format as ratio or cents
                    if interval.denominator <= 1000:  # Use ratio for simple fractions
                        lines.append(f"{interval.numerator}/{interval.denominator}")
                    else:  # Use cents for complex ratios
                        cents = 1200 * math.log2(float(interval))
                        lines.append(f"{cents:.3f}")
                        
                except (ValueError, TypeError, ZeroDivisionError):
                    # Fallback to cents calculation
                    if hasattr(pitch, 'frequency') and hasattr(reference_pitch, 'frequency'):
                        try:
                            freq_ratio = float(pitch.frequency) / float(reference_pitch.frequency)
                            cents = 1200 * math.log2(freq_ratio)
                            lines.append(f"{cents:.3f}")
                        except (ValueError, TypeError, ZeroDivisionError):
                            lines.append("100.000")  # Default semitone
                    else:
                        lines.append("100.000")  # Default semitone
            else:
                lines.append("100.000")  # Default semitone
    
    return "\n".join(lines)


def export_scale_intervals_to_scala(
    scale_intervals: List[Fraction],
    title: str = "Custom Scale",
    description: Optional[str] = None
) -> str:
    """
    Export a list of scale intervals to Scala format.
    
    Args:
        scale_intervals: List of intervals as fractions
        title: Title for the scale
        description: Optional description
        
    Returns:
        Scala format string
    """
    lines = []
    
    # Title and description
    lines.append(f"! {title}")
    if description:
        lines.append(f"! {description}")
    else:
        lines.append(f"! Scale with {len(scale_intervals)} intervals")
    lines.append("!")
    
    # Number of notes (excluding octave)
    lines.append(str(len(scale_intervals)))
    
    # Intervals
    for interval in scale_intervals:
        if isinstance(interval, Fraction):
            if interval.denominator <= 1000:
                lines.append(f"{interval.numerator}/{interval.denominator}")
            else:
                cents = 1200 * math.log2(float(interval))
                lines.append(f"{cents:.3f}")
        else:
            try:
                # Try to convert to fraction
                frac = Fraction(str(interval)).limit_denominator(1000)
                lines.append(f"{frac.numerator}/{frac.denominator}")
            except (ValueError, TypeError):
                lines.append("100.000")  # Default
    
    return "\n".join(lines)


def export_pitch_classes_to_scala(
    pitch_classes: List[PitchClass],
    title: str = "Pitch Class Scale",
    description: Optional[str] = None
) -> str:
    """
    Export pitch classes to Scala format.
    
    Args:
        pitch_classes: List of pitch classes
        title: Title for the scale
        description: Optional description
        
    Returns:
        Scala format string
    """
    if not pitch_classes:
        return export_scale_intervals_to_scala([], title, description)
    
    # Extract intervals from pitch classes
    intervals = []
    for pc in pitch_classes:
        if hasattr(pc, 'fraction') and pc.fraction:
            if isinstance(pc.fraction, str):
                try:
                    interval = Fraction(pc.fraction)
                    intervals.append(interval)
                except ValueError:
                    intervals.append(Fraction(1, 1))  # Default
            else:
                intervals.append(pc.fraction)
        else:
            intervals.append(Fraction(1, 1))  # Default
    
    return export_scale_intervals_to_scala(intervals, title, description)


def create_scala_keyboard_mapping(
    tuning_system: TuningSystem,
    starting_note: str = "C",
    octave_range: tuple = (4, 5)
) -> str:
    """
    Create a Scala keyboard mapping (.kbm) file content.
    
    Args:
        tuning_system: The tuning system
        starting_note: Starting note
        octave_range: Tuple of (start_octave, end_octave)
        
    Returns:
        Keyboard mapping string
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    lines = []
    lines.append("! Keyboard mapping for tuning system")
    lines.append("!")
    
    # Mapping size (number of keys to map)
    mapping_size = len(pitch_classes)
    lines.append(str(mapping_size))
    
    # First MIDI note to retune (middle C = 60)
    first_midi = 60  # C4
    lines.append(str(first_midi))
    
    # Last MIDI note to retune
    last_midi = first_midi + mapping_size - 1
    lines.append(str(last_midi))
    
    # Middle note (where scale degree 0 maps to)
    middle_note = 60  # C4
    lines.append(str(middle_note))
    
    # Reference note (for scale degree 0)
    lines.append("60")  # C4
    
    # Reference frequency (Hz)
    lines.append("440.000000")  # A4 = 440 Hz
    
    # Scale degree to scale degree mapping
    lines.append(str(mapping_size))
    
    # Mapping entries (which scale degree each MIDI note maps to)
    for i in range(mapping_size):
        lines.append(str(i))
    
    return "\n".join(lines)


def export_multiple_scales_to_scala_archive(
    scales_data: Dict[str, List[Fraction]],
    archive_title: str = "Scale Archive"
) -> Dict[str, str]:
    """
    Export multiple scales to a dictionary of Scala files.
    
    Args:
        scales_data: Dictionary mapping scale names to interval lists
        archive_title: Title for the archive
        
    Returns:
        Dictionary mapping filenames to Scala content
    """
    scala_files = {}
    
    for scale_name, intervals in scales_data.items():
        # Generate safe filename
        safe_name = "".join(c for c in scale_name if c.isalnum() or c in "._- ").strip()
        safe_name = safe_name.replace(" ", "_")
        filename = f"{safe_name}.scl"
        
        # Generate Scala content
        description = f"Part of {archive_title}"
        scala_content = export_scale_intervals_to_scala(intervals, scale_name, description)
        
        scala_files[filename] = scala_content
    
    return scala_files


def validate_scala_format(scala_content: str) -> Dict[str, any]:
    """
    Validate Scala format content.
    
    Args:
        scala_content: Scala format string to validate
        
    Returns:
        Dictionary with validation results
    """
    lines = scala_content.strip().split('\n')
    validation = {
        "valid": True,
        "errors": [],
        "warnings": [],
        "info": {}
    }
    
    if len(lines) < 3:
        validation["valid"] = False
        validation["errors"].append("File too short - missing required lines")
        return validation
    
    # Find the line with number of notes
    num_notes_line = None
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.startswith('!') and line.isdigit():
            num_notes_line = i
            break
    
    if num_notes_line is None:
        validation["valid"] = False
        validation["errors"].append("Could not find number of notes declaration")
        return validation
    
    try:
        num_notes = int(lines[num_notes_line].strip())
        validation["info"]["declared_notes"] = num_notes
        
        # Count actual note lines
        note_lines = []
        for i in range(num_notes_line + 1, len(lines)):
            line = lines[i].strip()
            if line and not line.startswith('!'):
                note_lines.append(line)
        
        validation["info"]["actual_notes"] = len(note_lines)
        
        if len(note_lines) != num_notes:
            validation["valid"] = False
            validation["errors"].append(
                f"Declared {num_notes} notes but found {len(note_lines)} note lines"
            )
        
        # Validate note formats
        for i, note_line in enumerate(note_lines):
            if '/' in note_line:
                # Ratio format
                try:
                    Fraction(note_line)
                except ValueError:
                    validation["warnings"].append(f"Invalid ratio format in line {i+1}: {note_line}")
            else:
                # Cents format
                try:
                    float(note_line)
                except ValueError:
                    validation["warnings"].append(f"Invalid cents format in line {i+1}: {note_line}")
        
    except ValueError:
        validation["valid"] = False
        validation["errors"].append("Number of notes is not a valid integer")
    
    return validation


def convert_scala_to_frequencies(
    scala_content: str,
    reference_frequency: float = 440.0
) -> List[float]:
    """
    Convert Scala format to list of frequencies.
    
    Args:
        scala_content: Scala format string
        reference_frequency: Reference frequency (default: A4 = 440 Hz)
        
    Returns:
        List of frequencies in Hz
    """
    lines = scala_content.strip().split('\n')
    frequencies = [reference_frequency]  # Start with reference (1/1)
    
    # Find number of notes line
    num_notes_line = None
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.startswith('!') and line.isdigit():
            num_notes_line = i
            break
    
    if num_notes_line is None:
        return frequencies
    
    try:
        num_notes = int(lines[num_notes_line].strip())
        
        # Process note lines
        for i in range(num_notes_line + 1, len(lines)):
            line = lines[i].strip()
            if not line or line.startswith('!'):
                continue
            
            if '/' in line:
                # Ratio format
                try:
                    ratio = Fraction(line)
                    frequency = reference_frequency * float(ratio)
                    frequencies.append(frequency)
                except ValueError:
                    continue
            else:
                # Cents format
                try:
                    cents = float(line)
                    ratio = 2 ** (cents / 1200)
                    frequency = reference_frequency * ratio
                    frequencies.append(frequency)
                except ValueError:
                    continue
        
    except ValueError:
        pass
    
    return frequencies


def generate_scala_metadata(
    tuning_system: TuningSystem,
    starting_note: str = "C"
) -> Dict[str, any]:
    """
    Generate metadata for Scala export.
    
    Args:
        tuning_system: The tuning system
        starting_note: Starting note
        
    Returns:
        Dictionary with metadata
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    metadata = {
        "system_name": getattr(tuning_system, 'name', 'Unknown Tuning System'),
        "starting_note": starting_note,
        "total_pitch_classes": len(pitch_classes),
        "octave_size": len(pitch_classes) // 4 if len(pitch_classes) >= 4 else len(pitch_classes),
        "export_timestamp": None,  # Could add timestamp
        "scala_version": "1.0"
    }
    
    # Analyze intervals
    intervals = []
    for pc in pitch_classes:
        if hasattr(pc, 'fraction') and pc.fraction:
            try:
                if isinstance(pc.fraction, str):
                    interval = Fraction(pc.fraction)
                else:
                    interval = pc.fraction
                intervals.append(float(interval))
            except (ValueError, TypeError):
                continue
    
    if intervals:
        metadata["interval_range"] = {
            "min": min(intervals),
            "max": max(intervals),
            "span": max(intervals) - min(intervals)
        }
        
        # Check for equal temperament
        if len(set(intervals)) == len(intervals):
            metadata["temperament_type"] = "unequal"
        else:
            metadata["temperament_type"] = "equal or near-equal"
    
    return metadata
