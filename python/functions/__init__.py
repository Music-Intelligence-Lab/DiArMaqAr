"""
Python functions package for maqam network analysis.

This package contains mathematical and analytical functions for working with
Arabic maqam music theory, including interval calculations, transpositions,
modulations, and tuning system analysis.
"""

# Core mathematical functions
from .gcd import gcd
from .compute_fraction_interval import (
    compute_fraction_interval,
    fraction_to_decimal,
    decimal_to_fraction,
    simplify_fraction
)
from .detect_pitch_class_type import (
    detect_pitch_class_type,
    is_fraction_format,
    is_valid_cents_value,
    is_valid_midi_note,
    is_valid_decimal_ratio
)
from .convert_pitch_class import (
    convert_pitch_class,
    fraction_to_cents,
    cents_to_fraction,
    decimal_to_cents,
    cents_to_decimal,
    midi_to_frequency,
    frequency_to_midi
)
from .calculate_cents_deviation import (
    calculate_cents_deviation,
    calculate_interval_deviation,
    get_just_intonation_deviations,
    calculate_scale_deviations,
    is_microtonal,
    cents_to_ratio_string,
    analyze_tuning_system_deviations
)

# Transposition and modulation functions
from .transpose import (
    transpose_interval,
    transpose_pitch_class_list,
    transpose_jins,
    transpose_maqam,
    calculate_transposition_interval,
    transpose_to_octave_range,
    create_transposition_matrix,
    find_common_transpositions
)

# Advanced analysis functions
from .modulate import (
    shawwa_mapping,
    modulate,
    calculate_number_of_modulations,
    get_total_modulations_count,
    filter_modulations_by_category
)
from .calculate_number_of_modulations import (
    calculate_number_of_modulations,
    analyze_modulation_density,
    calculate_maqam_modulation_potential
)
from .shift_pitch_class import (
    shift_pitch_class,
    shift_pitch_class_without_all_pitch_classes,
    shift_multiple_pitch_classes,
    get_octave_range_for_pitch_class,
    can_shift_pitch_class
)
from .extend_selected_pitch_classes import (
    extend_selected_pitch_classes,
    get_octave_variants,
    extend_by_octave_doubling,
    filter_by_frequency_range,
    group_by_pitch_class_index,
    find_gaps_in_selection
)

# System and utility functions
from .get_tuning_system_cells import (
    get_tuning_system_cells,
    generate_octave_pitch_classes,
    calculate_pitch_class_frequencies
)
from .get_first_note_name import (
    get_first_note_name,
    extract_note_components,
    normalize_note_notation
)
from .get_note_names_used_in_tuning_system import (
    get_note_names_used_in_tuning_system,
    get_note_names_by_octave,
    analyze_note_name_patterns
)
from .roman_to_number import (
    roman_to_number,
    number_to_roman,
    validate_roman_numeral
)
from .note_name_mappings import (
    convert_note_name,
    create_note_frequency_mapping,
    normalize_note_names,
    get_enharmonic_equivalents,
    note_name_to_midi,
    midi_to_note_name,
    generate_chromatic_scale_names
)

# Export and import functions
from .export import (
    export_tuning_system,
    export_maqam_data,
    export_jins_data,
    export_to_json
)
from .scala_export import (
    export_tuning_system_to_scala,
    export_scale_intervals_to_scala,
    validate_scala_format
)
from .import_data import (
    get_tuning_systems,
    get_ajnas,
    get_maqamat,
    get_sources,
    get_patterns,
    load_all_data,
    import_json_data,
    import_tuning_systems_from_json,
    import_scala_file
)

# Analytics and generation functions
from .generate_analytics import (
    generate_tuning_system_analytics,
    generate_maqamat_analytics,
    generate_ajnas_analytics,
    generate_comprehensive_analytics
)

# Text processing functions
from .dynamic_arabic_converter import (
    DynamicArabicConverter,
    convert_arabic_text,
    normalize_maqam_name,
    normalize_jins_name
)

# Update and maintenance functions
from .update import (
    update_tuning_system,
    update_maqam_data,
    update_jins_data,
    recalculate_frequencies,
    merge_tuning_systems
)

# Export all functions for easy access
__all__ = [
    # Core mathematical functions
    'gcd',
    'compute_fraction_interval',
    'fraction_to_decimal', 
    'decimal_to_fraction',
    'simplify_fraction',
    'detect_pitch_class_type',
    'is_fraction_format',
    'is_valid_cents_value',
    'is_valid_midi_note',
    'is_valid_decimal_ratio',
    'convert_pitch_class',
    'fraction_to_cents',
    'cents_to_fraction',
    'decimal_to_cents',
    'cents_to_decimal',
    'midi_to_frequency',
    'frequency_to_midi',
    'calculate_cents_deviation',
    'calculate_interval_deviation',
    'get_just_intonation_deviations',
    'calculate_scale_deviations',
    'is_microtonal',
    'cents_to_ratio_string',
    'analyze_tuning_system_deviations',
    
    # Transposition functions
    'transpose_interval',
    'transpose_pitch_class_list', 
    'transpose_jins',
    'transpose_maqam',
    'calculate_transposition_interval',
    'transpose_to_octave_range',
    'create_transposition_matrix',
    'find_common_transpositions',
    
    # Advanced analysis functions
    'modulate_scale',
    'classify_modulation_type',
    'analyze_modulation_relationships',
    'calculate_number_of_modulations',
    'analyze_modulation_density',
    'calculate_maqam_modulation_potential',
    'shift_pitch_class',
    'shift_octave',
    'calculate_shifted_frequency',
    'extend_selected_pitch_classes',
    'extend_across_octaves',
    'filter_by_octave_range',
    
    # System and utility functions
    'get_tuning_system_cells',
    'generate_octave_pitch_classes',
    'calculate_pitch_class_frequencies',
    'get_first_note_name',
    'extract_note_components',
    'normalize_note_notation',
    'get_note_names_used_in_tuning_system',
    'get_note_names_by_octave',
    'analyze_note_name_patterns',
    'roman_to_number',
    'number_to_roman',
    'validate_roman_numeral',
    'convert_note_name',
    'create_note_frequency_mapping',
    'normalize_note_names',
    'get_enharmonic_equivalents',
    'note_name_to_midi',
    'midi_to_note_name',
    'generate_chromatic_scale_names',
    
    # Export and import functions
    'export_tuning_system',
    'export_maqam_data',
    'export_jins_data',
    'export_to_json',
    'export_tuning_system_to_scala',
    'export_scale_intervals_to_scala',
    'validate_scala_format',
    'get_tuning_systems',
    'get_ajnas',
    'get_maqamat', 
    'get_sources',
    'get_patterns',
    'load_all_data',
    'import_json_data',
    'import_tuning_systems_from_json',
    'import_scala_file',
    
    # Analytics and generation functions
    'generate_tuning_system_analytics',
    'generate_maqamat_analytics',
    'generate_ajnas_analytics',
    'generate_comprehensive_analytics',
    
    # Text processing functions
    'DynamicArabicConverter',
    'convert_arabic_text',
    'normalize_maqam_name',
    'normalize_jins_name',
    
    # Update and maintenance functions
    'update_tuning_system',
    'update_maqam_data',
    'update_jins_data',
    'recalculate_frequencies',
    'merge_tuning_systems'
]
