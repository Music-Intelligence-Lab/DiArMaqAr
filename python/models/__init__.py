"""
Models module initialization.

Exports all model classes and types for easy importing.
"""

from .bibliography import (
    AbstractSource, SourceType, ContributorType, Contributor,
    Book, Article, Source, SourcePageReference
)
from .sources import (
    Source as SourceModel, create_book_source, create_article_source,
    create_recording_source, create_manuscript_source,
    sort_sources_by_author, sort_sources_by_year, filter_sources_by_type
)
from .note_name import (
    NoteName, Cell, 
    OCTAVE_ZERO_NOTE_NAMES, OCTAVE_ONE_NOTE_NAMES, OCTAVE_TWO_NOTE_NAMES,
    OCTAVE_THREE_NOTE_NAMES, OCTAVE_FOUR_NOTE_NAMES, ALL_NOTES,
    get_note_name_index, get_note_name_index_and_octave,
    get_note_name_from_index_and_octave, shift_note_name, is_valid_note_name
)
from .pitch_class import (
    PitchClass, PitchClassInterval,
    convert_fraction_to_decimal, calculate_interval,
    matching_intervals, matching_list_of_intervals
)
from .pattern import (
    Pattern, PatternNote, NoteDuration,
    DURATION_OPTIONS, SCALE_DEGREES,
    reverse_pattern_notes, is_valid_duration, is_valid_scale_degree
)
from .tuning_system import TuningSystem
from .jins import JinsData, Jins, JinsDataInterface, AjnasModulations
from .maqam import (
    MaqamData, Maqam, MaqamDataInterface, 
    Sayr, SayrStop, MaqamatModulations
)

__all__ = [
    # Bibliography (original)
    'AbstractSource', 'SourceType', 'ContributorType', 'Contributor',
    'Book', 'Article', 'Source', 'SourcePageReference',
    
    # Sources (new)
    'SourceModel', 'create_book_source', 'create_article_source',
    'create_recording_source', 'create_manuscript_source',
    'sort_sources_by_author', 'sort_sources_by_year', 'filter_sources_by_type',
    
    # Note Names
    'NoteName', 'Cell',
    'OCTAVE_ZERO_NOTE_NAMES', 'OCTAVE_ONE_NOTE_NAMES', 'OCTAVE_TWO_NOTE_NAMES',
    'OCTAVE_THREE_NOTE_NAMES', 'OCTAVE_FOUR_NOTE_NAMES', 'ALL_NOTES',
    'get_note_name_index', 'get_note_name_index_and_octave',
    'get_note_name_from_index_and_octave', 'shift_note_name', 'is_valid_note_name',
    
    # Pitch Classes
    'PitchClass', 'PitchClassInterval',
    'convert_fraction_to_decimal', 'calculate_interval',
    'matching_intervals', 'matching_list_of_intervals',
    
    # Patterns
    'Pattern', 'PatternNote', 'NoteDuration',
    'DURATION_OPTIONS', 'SCALE_DEGREES',
    'reverse_pattern_notes', 'is_valid_duration', 'is_valid_scale_degree',
    
    # Tuning Systems
    'TuningSystem',
    
    # Jins
    'JinsData', 'Jins', 'JinsDataInterface', 'AjnasModulations',
    
    # Maqam
    'MaqamData', 'Maqam', 'MaqamDataInterface',
    'Sayr', 'SayrStop', 'MaqamatModulations'
]
