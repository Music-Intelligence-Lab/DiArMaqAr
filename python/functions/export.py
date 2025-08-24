"""
Export utilities for tuning systems, ajnas, and maqamat.

This module provides functions to export musical data structures
in various formats for analysis, sharing, and documentation.
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import asdict
import json

from ..models.tuning_system import TuningSystem
from ..models.jins import Jins, JinsData
from ..models.maqam import Maqam, MaqamData
from ..models.pitch_class import PitchClass
from .get_tuning_system_cells import get_tuning_system_cells
from .transpose import get_jins_transpositions, get_maqam_transpositions
from .modulate import modulate, calculate_number_of_modulations


class ExportOptions:
    """Configuration options for data export."""
    
    def __init__(
        self,
        include_tuning_system_details: bool = True,
        include_pitch_classes: bool = True,
        include_ajnas_details: bool = True,
        include_maqamat_details: bool = True,
        include_modulations: bool = False,
        modulation_type: str = "maqamat"
    ):
        self.include_tuning_system_details = include_tuning_system_details
        self.include_pitch_classes = include_pitch_classes
        self.include_ajnas_details = include_ajnas_details
        self.include_maqamat_details = include_maqamat_details
        self.include_modulations = include_modulations
        self.modulation_type = modulation_type


def export_tuning_system(
    tuning_system: TuningSystem,
    starting_note: str,
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData],
    options: ExportOptions
) -> Dict[str, Any]:
    """
    Export a complete tuning system with optional additional data.
    
    Args:
        tuning_system: The tuning system to export
        starting_note: Starting note for the tuning system
        all_ajnas: Available ajnas for analysis
        all_maqamat: Available maqamat for analysis
        options: Export configuration options
        
    Returns:
        Dictionary containing exported tuning system data
    """
    export_data: Dict[str, Any] = {}
    
    # Basic tuning system information
    if options.include_tuning_system_details:
        export_data["tuning_system"] = {
            "name": tuning_system.name if hasattr(tuning_system, 'name') else "Unknown",
            "starting_note": starting_note,
            "pitch_class_values": tuning_system.get_original_pitch_class_values(),
            "string_length": tuning_system.get_string_length(),
            "reference_frequencies": tuning_system.get_reference_frequencies(),
            "default_reference_frequency": tuning_system.get_default_reference_frequency()
        }
    
    # Generate pitch classes
    if options.include_pitch_classes:
        pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
        export_data["pitch_classes"] = [
            _pitch_class_to_dict(pc) for pc in pitch_classes
        ]
        export_data["number_of_pitch_classes"] = len(pitch_classes)
    else:
        pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    # Analyze possible ajnas
    if options.include_ajnas_details:
        possible_ajnas = []
        for jins_data in all_ajnas:
            transpositions = get_jins_transpositions(pitch_classes, jins_data)
            possible_ajnas.extend(transpositions)
        
        export_data["ajnas"] = {
            "number_of_possible_ajnas": len(possible_ajnas),
            "number_of_ajnas_types": len(all_ajnas),
            "possible_ajnas_overview": [asdict(jins_data) for jins_data in all_ajnas],
            "possible_ajnas": [_jins_to_dict(jins) for jins in possible_ajnas]
        }
    
    # Analyze possible maqamat
    if options.include_maqamat_details:
        possible_maqamat = []
        for maqam_data in all_maqamat:
            transpositions = get_maqam_transpositions(pitch_classes, maqam_data)
            possible_maqamat.extend(transpositions)
        
        export_data["maqamat"] = {
            "number_of_possible_maqamat": len(possible_maqamat),
            "number_of_maqamat_types": len(all_maqamat),
            "possible_maqamat_overview": [asdict(maqam_data) for maqam_data in all_maqamat],
            "possible_maqamat": [_maqam_to_dict(maqam) for maqam in possible_maqamat]
        }
    
    return export_data


def export_jins(
    jins: Jins,
    tuning_system: TuningSystem,
    all_pitch_classes: List[PitchClass],
    include_transpositions: bool = True
) -> Dict[str, Any]:
    """
    Export a specific jins with its details and transpositions.
    
    Args:
        jins: The jins to export
        tuning_system: Associated tuning system
        all_pitch_classes: All available pitch classes
        include_transpositions: Whether to include all possible transpositions
        
    Returns:
        Dictionary containing exported jins data
    """
    export_data = {
        "jins": _jins_to_dict(jins),
        "tuning_system": {
            "name": tuning_system.name if hasattr(tuning_system, 'name') else "Unknown"
        }
    }
    
    if include_transpositions:
        jins_data = jins.jins_data if hasattr(jins, 'jins_data') else None
        if jins_data:
            transpositions = get_jins_transpositions(all_pitch_classes, jins_data)
            export_data["transpositions"] = [
                _jins_to_dict(transposition) for transposition in transpositions
            ]
            export_data["number_of_transpositions"] = len(transpositions)
    
    return export_data


def export_maqam(
    maqam: Maqam,
    tuning_system: TuningSystem,
    all_pitch_classes: List[PitchClass],
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData],
    include_transpositions: bool = True,
    include_modulations: bool = False,
    modulation_type: str = "maqamat"
) -> Dict[str, Any]:
    """
    Export a specific maqam with its details, transpositions, and modulations.
    
    Args:
        maqam: The maqam to export
        tuning_system: Associated tuning system
        all_pitch_classes: All available pitch classes
        all_ajnas: Available ajnas for modulation analysis
        all_maqamat: Available maqamat for modulation analysis
        include_transpositions: Whether to include all possible transpositions
        include_modulations: Whether to include modulation analysis
        modulation_type: Type of modulations to analyze ("maqamat" or "ajnas")
        
    Returns:
        Dictionary containing exported maqam data
    """
    export_data = {
        "maqam": _maqam_to_dict(maqam),
        "tuning_system": {
            "name": tuning_system.name if hasattr(tuning_system, 'name') else "Unknown"
        }
    }
    
    if include_transpositions:
        maqam_data = maqam.maqam_data if hasattr(maqam, 'maqam_data') else None
        if maqam_data:
            transpositions = get_maqam_transpositions(all_pitch_classes, maqam_data)
            export_data["transpositions"] = [
                _maqam_to_dict(transposition) for transposition in transpositions
            ]
            export_data["number_of_transpositions"] = len(transpositions)
    
    if include_modulations:
        ajnas_mode = modulation_type == "ajnas"
        modulations = modulate(
            all_pitch_classes,
            all_ajnas,
            all_maqamat,
            maqam,
            ajnas_mode
        )
        
        export_data["modulations"] = {
            "type": modulation_type,
            "modulation_counts": calculate_number_of_modulations(modulations),
            "modulations_by_degree": _modulations_to_dict(modulations)
        }
    
    return export_data


def export_to_json(data: Dict[str, Any], indent: int = 2) -> str:
    """
    Export data structure to JSON string.
    
    Args:
        data: Data to export
        indent: JSON indentation level
        
    Returns:
        JSON string representation
    """
    return json.dumps(data, indent=indent, ensure_ascii=False)


def export_to_csv_pitch_classes(pitch_classes: List[PitchClass]) -> str:
    """
    Export pitch classes to CSV format.
    
    Args:
        pitch_classes: List of pitch classes to export
        
    Returns:
        CSV string representation
    """
    if not pitch_classes:
        return ""
    
    # CSV header
    header = "note_name,english_name,fraction,cents,decimal_ratio,frequency,octave,index,midi_note_number,cents_deviation"
    lines = [header]
    
    # CSV data rows
    for pc in pitch_classes:
        row = f'"{pc.note_name}","{pc.english_name}","{pc.fraction}","{pc.cents}","{pc.decimal_ratio}","{pc.frequency}",{pc.octave},{pc.index},{pc.midi_note_number},{pc.cents_deviation}'
        lines.append(row)
    
    return "\n".join(lines)


def _pitch_class_to_dict(pitch_class: PitchClass) -> Dict[str, Any]:
    """Convert PitchClass to dictionary for export."""
    return {
        "note_name": pitch_class.note_name,
        "english_name": pitch_class.english_name,
        "fraction": pitch_class.fraction,
        "cents": pitch_class.cents,
        "decimal_ratio": pitch_class.decimal_ratio,
        "string_length": pitch_class.string_length,
        "frequency": pitch_class.frequency,
        "original_value": pitch_class.original_value,
        "original_value_type": pitch_class.original_value_type,
        "index": pitch_class.index,
        "octave": pitch_class.octave,
        "abjad_name": pitch_class.abjad_name,
        "fret_division": pitch_class.fret_division,
        "midi_note_number": pitch_class.midi_note_number,
        "cents_deviation": pitch_class.cents_deviation
    }


def _jins_to_dict(jins: Jins) -> Dict[str, Any]:
    """Convert Jins to dictionary for export."""
    return {
        "name": jins.name if hasattr(jins, 'name') else "Unknown",
        "root": jins.root if hasattr(jins, 'root') else "Unknown",
        "intervals": jins.intervals if hasattr(jins, 'intervals') else [],
        "scale_intervals": jins.scale_intervals if hasattr(jins, 'scale_intervals') else []
    }


def _maqam_to_dict(maqam: Maqam) -> Dict[str, Any]:
    """Convert Maqam to dictionary for export."""
    return {
        "name": maqam.name if hasattr(maqam, 'name') else "Unknown",
        "tonic": maqam.tonic if hasattr(maqam, 'tonic') else "Unknown",
        "scale_intervals": maqam.scale_intervals if hasattr(maqam, 'scale_intervals') else []
    }


def _modulations_to_dict(modulations: Dict[str, List[Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Convert modulations structure to dictionary format."""
    result = {}
    
    for category, modulation_list in modulations.items():
        result[category] = []
        for modulation in modulation_list:
            if hasattr(modulation, '__dict__'):
                if isinstance(modulation, Jins):
                    result[category].append(_jins_to_dict(modulation))
                elif isinstance(modulation, Maqam):
                    result[category].append(_maqam_to_dict(modulation))
                else:
                    result[category].append(str(modulation))
            else:
                result[category].append(str(modulation))
    
    return result


def create_analysis_summary(
    tuning_system: TuningSystem,
    starting_note: str,
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData]
) -> Dict[str, Any]:
    """
    Create a high-level analysis summary.
    
    Args:
        tuning_system: The tuning system to analyze
        starting_note: Starting note
        all_ajnas: Available ajnas
        all_maqamat: Available maqamat
        
    Returns:
        Summary analysis dictionary
    """
    pitch_classes = get_tuning_system_cells(tuning_system, starting_note)
    
    # Count possible ajnas
    total_ajnas = 0
    for jins_data in all_ajnas:
        transpositions = get_jins_transpositions(pitch_classes, jins_data)
        total_ajnas += len(transpositions)
    
    # Count possible maqamat
    total_maqamat = 0
    for maqam_data in all_maqamat:
        transpositions = get_maqam_transpositions(pitch_classes, maqam_data)
        total_maqamat += len(transpositions)
    
    return {
        "tuning_system_name": tuning_system.name if hasattr(tuning_system, 'name') else "Unknown",
        "starting_note": starting_note,
        "total_pitch_classes": len(pitch_classes),
        "pitch_classes_per_octave": len(pitch_classes) // 4,
        "total_ajnas_types": len(all_ajnas),
        "total_possible_ajnas": total_ajnas,
        "total_maqamat_types": len(all_maqamat),
        "total_possible_maqamat": total_maqamat
    }
