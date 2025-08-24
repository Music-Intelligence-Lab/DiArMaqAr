"""
Data Import Functions for Maqam Network

This module provides functions to import and instantiate data objects from JSON files.
It serves as the central data loading mechanism for the application, converting
raw JSON data into typed Python objects with full method support.
"""

import json
import os
from typing import Dict, List, Optional, Union, Any
from fractions import Fraction

from ..models.tuning_system import TuningSystem
from ..models.jins import JinsData
from ..models.maqam import MaqamData
from ..models.bibliography import Book, Article, Thesis
from ..models.pattern import Pattern, PatternNote
from ..models.sources import Sources


def _get_data_path() -> str:
    """Get the path to the data directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    python_dir = os.path.dirname(current_dir)
    data_dir = os.path.join(python_dir, 'data')
    return data_dir


def _load_json_file(filename: str) -> Any:
    """Load a JSON file from the data directory."""
    data_path = _get_data_path()
    file_path = os.path.join(data_path, filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        raise FileNotFoundError(f"JSON file not found: {file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format in {filename}: {e}")


def get_tuning_systems() -> List[TuningSystem]:
    """
    Imports and instantiates tuning system objects from JSON data.

    Creates TuningSystem instances with full functionality including data
    processing, calculations, and object methods. Each instance contains
    the mathematical data needed for the application's core functionality.

    Returns:
        Array of TuningSystem objects with complete functionality
    """
    tuning_systems_data = _load_json_file('tuningSystems.json')
    
    tuning_systems = []
    for d in tuning_systems_data:
        try:
            tuning_system = TuningSystem(
                id=d.get('id', ''),
                name=d.get('name', d.get('titleEnglish', 'Unknown')),
                reference_frequency=float(d.get('defaultReferenceFrequency', 440.0)),
                reference_pitch_value=d.get('referencePitchValue', '1/1'),
                reference_pitch_value_type=d.get('referencePitchValueType', 'fraction'),
                pitches=d.get('tuningSystemPitchClasses', []),
                source=d.get('sourceEnglish', '')
            )
            tuning_systems.append(tuning_system)
        except (KeyError, TypeError, ValueError) as e:
            print(f"Warning: Skipping invalid tuning system data: {e}")
            continue
    
    return tuning_systems


def get_ajnas() -> List[JinsData]:
    """
    Imports and instantiates jins objects from JSON data.

    Creates JinsData instances from the raw JSON data. Each jins object
    contains data properties and methods for working with the jins data.

    Returns:
        Array of JinsData objects
    """
    ajnas_data = _load_json_file('ajnas.json')
    
    ajnas = []
    for d in ajnas_data:
        try:
            jins = JinsData(
                id=d.get('id', ''),
                name=d.get('name', 'Unknown'),
                ascending_note_names=d.get('noteNames', d.get('ascendingNoteNames', [])),
                source=d.get('sourcePageReferences', '')
            )
            ajnas.append(jins)
        except (KeyError, TypeError) as e:
            print(f"Warning: Skipping invalid jins data: {e}")
            continue
    
    return ajnas


def get_maqamat() -> List[MaqamData]:
    """
    Imports and instantiates maqam objects from JSON data.

    Creates MaqamData instances from the raw JSON data, converting each
    data object into a fully functional MaqamData class instance.

    Returns:
        Array of MaqamData objects with complete functionality
    """
    maqamat_data = _load_json_file('maqamat.json')
    
    maqamat = []
    for d in maqamat_data:
        try:
            maqam = MaqamData(
                id=d.get('id', ''),
                name=d.get('name', 'Unknown'),
                ascending_note_names=d.get('ascendingNoteNames', []),
                descending_note_names=d.get('descendingNoteNames', []),
                source=d.get('sourcePageReferences', '')
            )
            maqamat.append(maqam)
        except (KeyError, TypeError) as e:
            print(f"Warning: Skipping invalid maqam data: {e}")
            continue
    
    return maqamat


def get_sources() -> List[Union[Book, Article, Thesis]]:
    """
    Imports and instantiates source objects from JSON data.

    Creates Source instances (Book, Article, or Thesis) from the raw JSON data.
    Uses a factory pattern to create the appropriate subclass based on
    the sourceType property in the data.

    Returns:
        Array of Source objects (Books, Articles, and Theses)
    Raises:
        Error if unknown sourceType is encountered
    """
    sources_data = _load_json_file('sources.json')
    
    sources = []
    for d in sources_data:
        try:
            source_type = d.get('sourceType', d.get('type', 'book')).lower()
            
            if source_type == 'book':
                source = Book(
                    title=d.get('title', 'Unknown Title'),
                    authors=d.get('authors', d.get('author', ['Unknown Author'])),
                    year=int(d.get('year', 0)),
                    publisher=d.get('publisher', ''),
                    isbn=d.get('isbn')
                )
            elif source_type == 'article':
                source = Article(
                    title=d.get('title', 'Unknown Title'),
                    authors=d.get('authors', d.get('author', ['Unknown Author'])),
                    journal=d.get('journal', 'Unknown Journal'),
                    year=int(d.get('year', 0)),
                    volume=d.get('volume'),
                    pages=d.get('pages')
                )
            elif source_type == 'thesis':
                source = Thesis(
                    title=d.get('title', 'Unknown Title'),
                    author=d.get('author', 'Unknown Author'),
                    year=int(d.get('year', 0)),
                    university=d.get('university', 'Unknown University'),
                    degree_type=d.get('degree_type', d.get('degreeType', 'PhD')),
                    advisor=d.get('advisor')
                )
            else:
                print(f"Warning: Unknown sourceType '{source_type}', defaulting to book")
                source = Book(
                    title=d.get('title', 'Unknown Title'),
                    authors=d.get('authors', d.get('author', ['Unknown Author'])),
                    year=int(d.get('year', 0)),
                    publisher=d.get('publisher', ''),
                    isbn=d.get('isbn')
                )
            
            sources.append(source)
            
        except (KeyError, TypeError, ValueError) as e:
            print(f"Warning: Skipping invalid source data: {e}")
            continue
    
    return sources


def get_patterns() -> List[Pattern]:
    """
    Imports and instantiates pattern objects from JSON data.

    Creates Pattern instances from the raw JSON data. Processes nested
    note data and transforms it into the proper object structure with
    type-safe properties.

    Returns:
        Array of Pattern objects
    """
    patterns_data = _load_json_file('patterns.json')
    
    patterns = []
    for data in patterns_data:
        try:
            # Convert note data to proper format
            notes = []
            for note in data.get('notes', []):
                pattern_note = PatternNote(
                    pitch=note.get('scaleDegree', note.get('pitch', 'C')),
                    duration=float(note.get('noteDuration', note.get('duration', 1.0))),
                    velocity=float(note.get('velocity', 1.0))
                )
                notes.append(pattern_note)
            
            pattern = Pattern(
                id=data.get('id', ''),
                name=data.get('name', 'Unknown Pattern'),
                notes=notes,
                time_signature=tuple(data.get('timeSignature', data.get('time_signature', (4, 4)))),
                tempo=int(data.get('tempo', 120))
            )
            patterns.append(pattern)
            
        except (KeyError, TypeError, ValueError) as e:
            print(f"Warning: Skipping invalid pattern data: {e}")
            continue
    
    return patterns


def load_all_data() -> Dict[str, List[Any]]:
    """
    Load all musical data from the local data directory.
    
    Returns:
        Dictionary containing all loaded data organized by type
    """
    try:
        return {
            'tuning_systems': get_tuning_systems(),
            'ajnas': get_ajnas(),
            'maqamat': get_maqamat(),
            'sources': get_sources(),
            'patterns': get_patterns()
        }
    except Exception as e:
        print(f"Error loading data: {e}")
        return {
            'tuning_systems': [],
            'ajnas': [],
            'maqamat': [],
            'sources': [],
            'patterns': []
        }


# Legacy import functions for backward compatibility

def import_json_data(file_path: str) -> Dict[str, Any]:
    """
    Import data from a JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dictionary containing the imported data
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        raise FileNotFoundError(f"JSON file not found: {file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {e}")


def import_tuning_systems_from_json(file_path: str) -> List[TuningSystem]:
    """
    Import tuning systems from a JSON file.
    
    Args:
        file_path: Path to the JSON file containing tuning systems
        
    Returns:
        List of TuningSystem objects
    """
    data = import_json_data(file_path)
    tuning_systems = []
    
    # Handle different JSON structures
    systems_data = data if isinstance(data, list) else data.get('tuningSystems', [])
    
    for system_data in systems_data:
        try:
            tuning_system = TuningSystem(
                id=system_data.get('id', ''),
                name=system_data.get('name', 'Unknown'),
                reference_frequency=float(system_data.get('reference_frequency', 440.0)),
                reference_pitch_value=system_data.get('reference_pitch_value', '1/1'),
                reference_pitch_value_type=system_data.get('reference_pitch_value_type', 'fraction'),
                pitches=system_data.get('pitches', []),
                source=system_data.get('source', '')
            )
            tuning_systems.append(tuning_system)
            
        except (KeyError, TypeError) as e:
            print(f"Warning: Skipping invalid tuning system data: {e}")
            continue
    
    return tuning_systems


def import_scala_file(file_path: str) -> Dict[str, Any]:
    """
    Import a Scala (.scl) tuning file.
    
    Args:
        file_path: Path to the Scala file
        
    Returns:
        Dictionary containing scale data
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
    except FileNotFoundError:
        raise FileNotFoundError(f"Scala file not found: {file_path}")
    
    # Parse Scala format
    scale_data = {
        'title': '',
        'description': '',
        'intervals': [],
        'num_notes': 0
    }
    
    # Extract title and description from comments
    comments = []
    for line in lines:
        line = line.strip()
        if line.startswith('!'):
            comment = line[1:].strip()
            if comment:
                comments.append(comment)
    
    if comments:
        scale_data['title'] = comments[0]
        if len(comments) > 1:
            scale_data['description'] = ' '.join(comments[1:])
    
    # Find number of notes
    num_notes_line = None
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.startswith('!') and line.isdigit():
            num_notes_line = i
            scale_data['num_notes'] = int(line)
            break
    
    if num_notes_line is None:
        raise ValueError("Could not find number of notes in Scala file")
    
    # Parse intervals
    for i in range(num_notes_line + 1, len(lines)):
        line = lines[i].strip()
        if not line or line.startswith('!'):
            continue
        
        if '/' in line:
            # Ratio format
            try:
                interval = Fraction(line)
                scale_data['intervals'].append(interval)
            except ValueError:
                continue
        else:
            # Cents format
            try:
                cents = float(line)
                # Convert cents to ratio: 2^(cents/1200)
                ratio = 2 ** (cents / 1200)
                interval = Fraction(ratio).limit_denominator(10000)
                scale_data['intervals'].append(interval)
            except ValueError:
                continue
    
    return scale_data
