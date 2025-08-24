"""
Musical pattern representation for the Arabic maqam system.

A Pattern is a sequence of musical notes with specific durations and scale degrees
that can be used to demonstrate or practice melodic phrases within a maqam.
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum


# Available rhythmic duration options for pattern notes
DURATION_OPTIONS = [
    "32n",  # Thirty-second note
    "32d",  # Dotted thirty-second note
    "32t",  # Thirty-second triplet
    "16n",  # Sixteenth note
    "16d",  # Dotted sixteenth note
    "16t",  # Sixteenth triplet
    "8n",   # Eighth note
    "8d",   # Dotted eighth note
    "8t",   # Eighth triplet
    "4n",   # Quarter note
    "4d",   # Dotted quarter note
    "4t",   # Quarter triplet
    "2n",   # Half note
    "2d",   # Dotted half note
    "2t",   # Half triplet
    "1n",   # Whole note
    "1d",   # Dotted whole note
    "1t",   # Whole triplet
]

# Type alias for note duration values
NoteDuration = str  # In practice, should be one of DURATION_OPTIONS


# Available scale degrees for pattern notes in Arabic maqam theory
SCALE_DEGREES = [
    "-I",   # One octave below tonic
    "-II",  # Major second below tonic
    "-III", # Major third below tonic
    "-IV",  # Perfect fourth below tonic
    "-V",   # Perfect fifth below tonic
    "-VI",  # Major sixth below tonic
    "-VII", # Major seventh below tonic
    "R",    # Root/Tonic note
    "I",    # Tonic (same as root in this context)
    "II",   # Major second above tonic
    "III",  # Major third above tonic
    "IV",   # Perfect fourth above tonic
    "V",    # Perfect fifth above tonic
    "VI",   # Major sixth above tonic
    "VII",  # Major seventh above tonic
    "+I",   # One octave above tonic
    "+II",  # Major second above octave
    "+III", # Major third above octave
    "+IV",  # Perfect fourth above octave
    "+V",   # Perfect fifth above octave
    "+VI",  # Major sixth above octave
    "+VII", # Major seventh above octave
]


@dataclass
class PatternNote:
    """
    Represents a single note within a musical pattern.
    
    Each PatternNote defines a musical event with its position in the scale,
    rhythmic duration, emphasis level, and optional dynamic marking.
    """
    scale_degree: str      # The scale degree of this note (e.g., "I", "II", "-III", "+V")
    note_duration: NoteDuration  # Rhythmic duration using standard musical notation
    is_target: bool        # Whether this note should be emphasized during playback
    velocity: Optional[int] = None  # Optional MIDI velocity value (0-127)

    def __post_init__(self):
        """Validate the pattern note after initialization."""
        if self.scale_degree not in SCALE_DEGREES:
            raise ValueError(f"Invalid scale degree: {self.scale_degree}")
        
        if self.note_duration not in DURATION_OPTIONS:
            raise ValueError(f"Invalid note duration: {self.note_duration}")
        
        if self.velocity is not None and not (0 <= self.velocity <= 127):
            raise ValueError(f"Velocity must be between 0 and 127, got: {self.velocity}")


class Pattern:
    """
    Represents a musical pattern in the Arabic maqam system.
    
    A Pattern is a sequence of musical notes with specific durations and scale degrees
    that can be used to demonstrate or practice melodic phrases within a maqam.
    Each pattern contains notes with scale degrees, rhythmic durations, and target
    emphasis information for educational and performance purposes.
    """

    def __init__(self, id: str, name: str, notes: List[PatternNote]):
        """
        Creates a new Pattern instance.
        
        Args:
            id: Unique identifier for this pattern
            name: Human-readable name for this pattern
            notes: List of PatternNote objects that define the melodic sequence
        """
        self._id = id
        self._name = name
        self._notes = notes.copy()

    def get_id(self) -> str:
        """
        Gets the unique identifier of this pattern.
        
        Returns:
            The pattern's ID
        """
        return self._id

    def get_name(self) -> str:
        """
        Gets the human-readable name of this pattern.
        
        Returns:
            The pattern's name
        """
        return self._name

    def get_notes(self) -> List[PatternNote]:
        """
        Gets the list of notes that make up this pattern.
        
        Returns:
            Copy of the list of PatternNote objects
        """
        return self._notes.copy()

    def set_name(self, name: str) -> None:
        """Set a new name for this pattern."""
        self._name = name

    def add_note(self, note: PatternNote) -> None:
        """Add a note to the end of the pattern."""
        self._notes.append(note)

    def insert_note(self, index: int, note: PatternNote) -> None:
        """Insert a note at a specific position in the pattern."""
        self._notes.insert(index, note)

    def remove_note(self, index: int) -> Optional[PatternNote]:
        """
        Remove a note at a specific index.
        
        Args:
            index: The index of the note to remove
            
        Returns:
            The removed note, or None if index is invalid
        """
        try:
            return self._notes.pop(index)
        except IndexError:
            return None

    def get_note_count(self) -> int:
        """Get the number of notes in the pattern."""
        return len(self._notes)

    def get_target_notes(self) -> List[PatternNote]:
        """Get all notes that are marked as targets."""
        return [note for note in self._notes if note.is_target]

    def get_duration_types(self) -> List[str]:
        """Get all unique duration types used in the pattern."""
        return list(set(note.note_duration for note in self._notes))

    def get_scale_degrees_used(self) -> List[str]:
        """Get all unique scale degrees used in the pattern."""
        return list(set(note.scale_degree for note in self._notes))

    def convert_to_json(self) -> Dict[str, Any]:
        """
        Converts the pattern to a JSON-serializable dictionary.
        
        This method is useful for saving patterns to files, sending them over
        network requests, or storing them in databases.
        
        Returns:
            A dictionary representation of the pattern
        """
        return {
            "id": self._id,
            "name": self._name,
            "notes": [
                {
                    "scaleDegree": note.scale_degree,
                    "noteDuration": note.note_duration,
                    "isTarget": note.is_target,
                    "velocity": note.velocity
                }
                for note in self._notes
            ]
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> 'Pattern':
        """
        Create a Pattern instance from a JSON dictionary.
        
        Args:
            data: Dictionary containing pattern data
            
        Returns:
            New Pattern instance
        """
        notes = [
            PatternNote(
                scale_degree=note_data["scaleDegree"],
                note_duration=note_data["noteDuration"],
                is_target=note_data["isTarget"],
                velocity=note_data.get("velocity")
            )
            for note_data in data["notes"]
        ]
        
        return cls(
            id=data["id"],
            name=data["name"],
            notes=notes
        )

    def reverse_pattern_notes(self) -> 'Pattern':
        """
        Creates a new pattern with reversed scale degrees.
        
        This function creates a retrograde version of a pattern where the scale degrees
        are reversed in order while preserving the original rhythmic structure and
        target note designations. This is useful for creating variations of existing
        patterns or for pedagogical exercises.
        
        Returns:
            New Pattern with reversed scale degrees but original rhythmic structure
        """
        if not self._notes:
            return Pattern(self._id + "_reversed", self._name + " (Reversed)", [])
        
        reversed_scale_degrees = [note.scale_degree for note in self._notes[::-1]]
        
        reversed_notes = [
            PatternNote(
                scale_degree=reversed_scale_degrees[i],
                note_duration=note.note_duration,
                is_target=note.is_target,
                velocity=note.velocity
            )
            for i, note in enumerate(self._notes)
        ]
        
        return Pattern(
            id=self._id + "_reversed",
            name=self._name + " (Reversed)",
            notes=reversed_notes
        )

    def __str__(self) -> str:
        """String representation of the pattern."""
        return f"Pattern '{self._name}' ({len(self._notes)} notes)"

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"Pattern(id='{self._id}', name='{self._name}', notes={len(self._notes)})"

    def __len__(self) -> int:
        """Return the number of notes in the pattern."""
        return len(self._notes)

    def __getitem__(self, index: int) -> PatternNote:
        """Allow indexing to access notes."""
        return self._notes[index]


def reverse_pattern_notes(notes: List[PatternNote]) -> List[PatternNote]:
    """
    Reverses the melodic direction of a pattern by inverting the scale degrees.
    
    This function creates a retrograde version of a pattern where the scale degrees
    are reversed in order while preserving the original rhythmic structure and
    target note designations.
    
    Args:
        notes: List of PatternNote objects to reverse
        
    Returns:
        New list with reversed scale degrees but original rhythmic structure
    """
    if not notes:
        return []
    
    reversed_scale_degrees = [note.scale_degree for note in notes[::-1]]
    
    return [
        PatternNote(
            scale_degree=reversed_scale_degrees[i],
            note_duration=note.note_duration,
            is_target=note.is_target,
            velocity=note.velocity
        )
        for i, note in enumerate(notes)
    ]


def is_valid_duration(duration: str) -> bool:
    """Check if a duration string is valid."""
    return duration in DURATION_OPTIONS


def is_valid_scale_degree(scale_degree: str) -> bool:
    """Check if a scale degree string is valid."""
    return scale_degree in SCALE_DEGREES
