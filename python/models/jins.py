"""
Jins representation for Arabic maqam theory.

A jins is a melodic fragment typically consisting of three to five pitch classes
that serves as a fundamental building block for constructing maqāmāt.
"""

from typing import List, Dict, Any, Optional, Protocol
from dataclasses import dataclass
from .note_name import NoteName
from .pitch_class import PitchClass, PitchClassInterval
from .bibliography import SourcePageReference


@dataclass
class JinsDataInterface:
    """
    Interface for serializing JinsData to JSON format.
    Used for data persistence and API communication.
    """
    id: str
    name: str
    note_names: List[NoteName]
    comments_english: str
    comments_arabic: str
    source_page_references: List[SourcePageReference]
    number_of_transpositions: Optional[int] = None


class JinsData:
    """
    Represents the raw, tuning-system-independent definition of a jins.
    
    A jins is a melodic fragment typically consisting of three to five pitch classes
    that serves as a fundamental building block for constructing maqāmāt. JinsData
    contains only the abstract note names (dūgāh, kurdī, chahārgāh, etc.) without
    any connection to specific pitch classes or tuning systems.
    
    This class represents the "template" or "blueprint" of a jins as it would appear
    in theoretical texts or JSON data files. To create an actual playable jins with
    specific pitches, this data must be combined with a tuning system through the
    get_tahlil() method to produce a Jins interface instance.
    
    **Key Distinction**: JinsData contains only note names (cultural/theoretical
    identifiers), while the Jins interface contains actual pitch classes with
    frequencies and intervallic relationships within a specific tuning system.
    """

    def __init__(
        self,
        id: str,
        name: str,
        note_names: List[str],
        comments_english: str,
        comments_arabic: str,
        source_page_references: List[SourcePageReference]
    ):
        """
        Creates a new JinsData instance with abstract note names.
        
        Args:
            id: Unique identifier for this jins
            name: Name of the jins (e.g., "Jins Kurd")
            note_names: List of note name strings (not yet typed as NoteName)
            comments_english: English description or comments
            comments_arabic: Arabic description or comments
            source_page_references: References to source documents
        """
        self._id = id
        self._name = name
        self._note_names = note_names
        self._comments_english = comments_english
        self._comments_arabic = comments_arabic
        self._source_page_references = source_page_references

    def get_id(self) -> str:
        """Gets the unique identifier of this jins."""
        return self._id

    def get_name(self) -> str:
        """Gets the name of this jins."""
        return self._name

    def get_note_names(self) -> List[NoteName]:
        """
        Gets the array of note names that define this jins.
        
        These are abstract cultural identifiers without connection to specific
        pitch frequencies. To get actual playable pitches, use get_tahlil() with
        a specific tuning system.
        """
        return self._note_names.copy()

    def get_comments_english(self) -> str:
        """Gets the English-language comments for this jins."""
        return self._comments_english

    def get_comments_arabic(self) -> str:
        """Gets the Arabic-language comments for this jins."""
        return self._comments_arabic

    def get_source_page_references(self) -> List[SourcePageReference]:
        """Gets the source page references for this jins."""
        return self._source_page_references.copy()

    def set_name(self, name: str) -> None:
        """Set a new name for this jins."""
        self._name = name

    def set_comments_english(self, comments: str) -> None:
        """Set English comments."""
        self._comments_english = comments

    def set_comments_arabic(self, comments: str) -> None:
        """Set Arabic comments."""
        self._comments_arabic = comments

    def add_source_page_reference(self, reference: SourcePageReference) -> None:
        """Add a source page reference."""
        self._source_page_references.append(reference)

    def remove_source_page_reference(self, reference: SourcePageReference) -> bool:
        """Remove a source page reference. Returns True if removed, False if not found."""
        try:
            self._source_page_references.remove(reference)
            return True
        except ValueError:
            return False

    def is_jins_selectable(self, all_note_names: List[NoteName]) -> bool:
        """
        Checks if this jins can be constructed within a given tuning system.
        
        A jins is only selectable/constructible if ALL of its required note names
        exist within the tuning system's available pitch classes. The platform
        searches across all four octaves when determining compatibility.
        
        For example, in Al-Kindī's tuning system:
        - Jins Kurd (dūgāh, kurdī, chahārgāh, nawā) ✓ CAN be constructed
        - Jins Chahārgāh (chahārgāh, nawā, nīm ḥusaynī, ʿajam) ✗ CANNOT because
          Al-Kindī's system lacks "nīm ḥusaynī"
        
        Args:
            all_note_names: All note names available in the tuning system
            
        Returns:
            True if all required note names are available, false otherwise
        """
        return all(
            any(all_note_name == note_name for all_note_name in all_note_names)
            for note_name in self._note_names
        )

    def create_jins_with_new_source_page_references(
        self, 
        new_source_page_references: List[SourcePageReference]
    ) -> 'JinsData':
        """
        Creates a copy of this jins with new source page references.
        
        Args:
            new_source_page_references: New source page references to use
            
        Returns:
            New JinsData instance with updated references
        """
        return JinsData(
            self._id,
            self._name,
            self._note_names.copy(),
            self._comments_english,
            self._comments_arabic,
            new_source_page_references
        )

    def get_tahlil(self, all_pitch_classes: List[PitchClass]) -> 'Jins':
        """
        Converts this abstract jins into a concrete, playable tahlil (original form).
        
        This is the crucial method that bridges the gap between abstract note names
        and actual musical pitch classes. It takes the jins's note names and matches them
        with corresponding pitch classes from a specific tuning system, creating
        a Jins interface instance with:
        
        - Actual frequency values
        - Intervallic relationships between pitches
        - Playable musical content
        
        The resulting Jins represents the "tahlil" (original/root form) of the jins,
        as opposed to "taswir" (transpositions) which would start from different
        pitch classes but maintain the same intervallic patterns.
        
        Args:
            all_pitch_classes: All pitch classes available in the tuning system
            
        Returns:
            Jins interface instance with concrete pitches and intervals
        """
        pitch_classes = [
            pc for pc in all_pitch_classes 
            if pc.note_name in self._note_names
        ]
        
        # Import here to avoid circular imports
        from ..functions.transpose import get_pitch_class_intervals
        
        pitch_class_intervals = get_pitch_class_intervals(pitch_classes)
        
        return Jins(
            jins_id=self._id,
            name=self._name,
            transposition=False,
            jins_pitch_classes=pitch_classes,
            jins_pitch_class_intervals=pitch_class_intervals
        )

    def convert_to_object(self) -> JinsDataInterface:
        """
        Converts this JinsData to a plain object for JSON serialization.
        
        Returns:
            Plain object representation suitable for JSON storage
        """
        return JinsDataInterface(
            id=self._id,
            name=self._name,
            note_names=self._note_names.copy(),
            comments_english=self._comments_english,
            comments_arabic=self._comments_arabic,
            source_page_references=self._source_page_references.copy()
        )

    def convert_to_json(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        return {
            "id": self._id,
            "name": self._name,
            "noteNames": self._note_names.copy(),
            "commentsEnglish": self._comments_english,
            "commentsArabic": self._comments_arabic,
            "SourcePageReferences": [
                {"sourceId": ref.source_id, "page": ref.page}
                for ref in self._source_page_references
            ]
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> 'JinsData':
        """Create a JinsData instance from a JSON dictionary."""
        source_page_references = [
            SourcePageReference(source_id=ref["sourceId"], page=ref["page"])
            for ref in data.get("SourcePageReferences", [])
        ]
        
        return cls(
            id=data["id"],
            name=data["name"],
            note_names=data["noteNames"],
            comments_english=data["commentsEnglish"],
            comments_arabic=data["commentsArabic"],
            source_page_references=source_page_references
        )

    def __str__(self) -> str:
        """String representation of the jins."""
        return f"JinsData '{self._name}' ({len(self._note_names)} notes)"

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"JinsData(id='{self._id}', name='{self._name}')"


@dataclass
class Jins:
    """
    Represents a concrete, tuning-system-specific jins with actual pitch classes.
    
    This interface represents a jins that has been "realized" within a specific
    tuning system, containing actual pitch classes with frequencies and intervallic
    relationships. Unlike JinsData (which contains only abstract note names),
    a Jins interface instance is playable and can be used for audio synthesis.
    
    **Tahlil vs Taswir**:
    - **Tahlil** (transposition: False): The original form of the jins starting
      from its traditional root note (e.g., Jins Kurd starting on dūgāh)
    - **Taswir** (transposition: True): A transposition of the jins starting
      from a different pitch class while preserving intervallic relationships
      (e.g., Jins Kurd al-Muhayyar starting on muhayyar/octave of dūgāh)
    
    The transposition algorithm uses pattern matching to find all valid starting
    positions within the tuning system where the complete interval pattern can
    be realized, ensuring authentic intervallic structure is maintained.
    """
    jins_id: str                                    # ID of the original jins this instance is based on
    name: str                                       # Name of this jins instance
    transposition: bool                             # Whether this is a transposition or original form
    jins_pitch_classes: List[PitchClass]           # Array of actual pitch classes with frequencies
    jins_pitch_class_intervals: List[PitchClassInterval]  # Intervallic relationships between consecutive pitch classes

    def get_note_names(self) -> List[str]:
        """Get the note names from the pitch classes."""
        return [pc.note_name for pc in self.jins_pitch_classes]

    def get_frequencies(self) -> List[float]:
        """Get the frequencies from the pitch classes."""
        return [float(pc.frequency) for pc in self.jins_pitch_classes]

    def get_cents(self) -> List[float]:
        """Get the cents values from the pitch classes."""
        return [float(pc.cents) for pc in self.jins_pitch_classes]

    def to_json(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        return {
            "jinsId": self.jins_id,
            "name": self.name,
            "transposition": self.transposition,
            "jinsPitchClasses": [
                {
                    "noteName": pc.note_name,
                    "fraction": pc.fraction,
                    "cents": pc.cents,
                    "decimalRatio": pc.decimal_ratio,
                    "frequency": pc.frequency,
                    # Add other pitch class fields as needed
                }
                for pc in self.jins_pitch_classes
            ],
            "jinsPitchClassIntervals": [
                {
                    "fraction": interval.fraction,
                    "cents": interval.cents,
                    "decimalRatio": interval.decimal_ratio,
                    "originalValue": interval.original_value,
                    "originalValueType": interval.original_value_type
                }
                for interval in self.jins_pitch_class_intervals
            ]
        }


@dataclass
class AjnasModulations:
    """
    Represents possible modulations between different ajnās.
    
    In Arabic maqam theory, modulations occur when moving from one jins to another
    within a melodic progression. This interface categorizes modulations based on
    which scale degree they occur on and their directional characteristics.
    
    Each property contains a list of possible target ajnās that can be reached
    through modulation from a given starting maqam, organized by the scale degree
    where the modulation occurs and the melodic direction.
    """
    modulations_on_one: List[Jins]                 # Modulations that occur on the first scale degree
    modulations_on_three: List[Jins]               # Modulations that occur on the third scale degree
    modulations_on_three_2p: List[Jins]            # Modulations that occur on the third scale degree (second pattern)
    modulations_on_four: List[Jins]                # Modulations that occur on the fourth scale degree
    modulations_on_five: List[Jins]                # Modulations that occur on the fifth scale degree
    modulations_on_six_ascending: List[Jins]       # Ascending modulations that occur on the sixth scale degree
    modulations_on_six_descending: List[Jins]      # Descending modulations that occur on the sixth scale degree
    modulations_on_six_no_third: List[Jins]        # Modulations on the sixth scale degree without using the third
    note_name_2p: str                              # The note name of the second degree (plus variations)

    def get_all_modulations(self) -> List[Jins]:
        """Get all modulations as a single list."""
        return (
            self.modulations_on_one +
            self.modulations_on_three +
            self.modulations_on_three_2p +
            self.modulations_on_four +
            self.modulations_on_five +
            self.modulations_on_six_ascending +
            self.modulations_on_six_descending +
            self.modulations_on_six_no_third
        )

    def get_modulations_count(self) -> int:
        """Get the total count of all modulations."""
        return len(self.get_all_modulations())
