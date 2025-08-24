"""
Maqam representation for Arabic maqam music theory.

A maqam is a complete modal framework that differs from ajnas in its scope and
structure, representing a comprehensive melodic system rather than a building block
component.
"""

from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from .note_name import NoteName
from .pitch_class import PitchClass, PitchClassInterval
from .bibliography import SourcePageReference
from .jins import Jins, AjnasModulations


@dataclass
class MaqamDataInterface:
    """
    Interface for serializing MaqamData to JSON format.
    Used for data persistence and API communication.
    """
    id: str
    name: str
    ascending_note_names: List[NoteName]
    descending_note_names: List[NoteName]
    suyur: List['Sayr']
    comments_english: str
    comments_arabic: str
    source_page_references: List[SourcePageReference]
    number_of_transpositions: Optional[int] = None


@dataclass
class SayrStop:
    """
    Represents a single stop within a sayr (melodic development pathway).
    
    Each stop can represent different types of musical elements that guide
    performance practice and melodic development within the maqam.
    """
    type: str  # "note" | "jins" | "maqam" | "direction"
    value: str  # The value/identifier for this stop
    starting_note: Optional[NoteName] = None  # Optional starting note for jins or maqam references
    direction: Optional[str] = None  # Optional directional instruction ("ascending" | "descending")

    def __post_init__(self):
        """Validate the sayr stop after initialization."""
        valid_types = ["note", "jins", "maqam", "direction"]
        if self.type not in valid_types:
            raise ValueError(f"Invalid stop type: {self.type}. Must be one of {valid_types}")
        
        if self.direction is not None:
            valid_directions = ["ascending", "descending"]
            if self.direction not in valid_directions:
                raise ValueError(f"Invalid direction: {self.direction}. Must be one of {valid_directions}")


@dataclass
class Sayr:
    """
    Represents a structured melodic development pathway (sayr) within a maqam.
    
    Suyūr (plural of sayr) represent traditional melodic development pathways that
    define how a maqam unfolds in performance practice, going beyond basic ascending
    and descending sequences to describe characteristic melodic progressions,
    emphasis points, and developmental patterns. When a maqām is transposed, the
    platform automatically transposes its associated sayr by converting note names
    and adjusting jins and maqām references to their transposed equivalents.
    """
    id: str                    # Unique identifier for this sayr
    creator_english: str       # English name of the sayr's creator/documenter
    creator_arabic: str        # Arabic name of the sayr's creator/documenter
    source_id: str            # ID of the source document where this sayr is documented
    page: str                 # Page reference within the source document
    comments_english: str     # English comments about this sayr
    comments_arabic: str      # Arabic comments about this sayr
    stops: List[SayrStop]     # Array of stops defining the melodic development pathway

    def get_note_stops(self) -> List[SayrStop]:
        """Get all stops that are of type 'note'."""
        return [stop for stop in self.stops if stop.type == "note"]

    def get_jins_stops(self) -> List[SayrStop]:
        """Get all stops that are of type 'jins'."""
        return [stop for stop in self.stops if stop.type == "jins"]

    def get_maqam_stops(self) -> List[SayrStop]:
        """Get all stops that are of type 'maqam'."""
        return [stop for stop in self.stops if stop.type == "maqam"]

    def get_direction_stops(self) -> List[SayrStop]:
        """Get all stops that are of type 'direction'."""
        return [stop for stop in self.stops if stop.type == "direction"]


class MaqamData:
    """
    Represents the raw, tuning-system-independent definition of a maqam.
    
    A maqam is a complete modal framework that differs from ajnas in its scope and
    structure, representing a comprehensive melodic system rather than a building block
    component. Each maqām contains both an ascending sequence (ṣuʿūd) and a descending
    sequence (hubūṭ) of note names, both consisting of seven or more notes that can be
    either identical (symmetric) or different (asymmetric).
    
    MaqamData contains only abstract note names without connection to specific pitch
    classes or tuning systems, serving as the "template" or "blueprint" of a maqam
    as it would appear in theoretical texts or JSON data files. To create an actual
    playable maqam with specific pitches, this data must be combined with a tuning
    system through the get_tahlil() method to produce a Maqam interface instance.
    
    **Key Features**:
    - **Bidirectional sequences**: Separate ascending (ṣuʿūd) and descending (hubūṭ) paths
    - **Asymmetrical structure**: Platform visually distinguishes notes appearing only in
      descending sequences
    - **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns within
      both sequences using cents tolerance matching
    - **Suyūr integration**: Traditional melodic development pathways defining performance practice
    
    **Key Distinction**: MaqamData contains only note names (cultural/theoretical
    identifiers), while the Maqam interface contains actual pitch classes with
    frequencies and intervallic relationships within a specific tuning system.
    """

    def __init__(
        self,
        id: str,
        name: str,
        ascending_note_names: List[NoteName],
        descending_note_names: List[NoteName],
        suyur: List[Sayr],
        comments_english: str,
        comments_arabic: str,
        source_page_references: List[SourcePageReference]
    ):
        """
        Creates a new MaqamData instance with abstract note names.
        
        Args:
            id: Unique identifier for this maqam
            name: Name of the maqam (e.g., "Maqam Farahfazza")
            ascending_note_names: Ascending sequence (ṣuʿūd) of note names
            descending_note_names: Descending sequence (hubūṭ) of note names
            suyur: Traditional melodic development pathways
            comments_english: English description or comments
            comments_arabic: Arabic description or comments
            source_page_references: References to source documents
        """
        self._id = id
        self._name = name
        self._ascending_note_names = ascending_note_names
        self._descending_note_names = descending_note_names
        self._suyur = suyur
        self._comments_english = comments_english
        self._comments_arabic = comments_arabic
        self._source_page_references = source_page_references

    # Getter methods
    def get_id(self) -> str:
        """Gets the unique identifier of this maqam."""
        return self._id

    def get_name(self) -> str:
        """Gets the name of this maqam."""
        return self._name

    def get_ascending_note_names(self) -> List[NoteName]:
        """
        Gets the ascending sequence (ṣuʿūd) note names.
        
        These are abstract cultural identifiers without connection to specific
        pitch frequencies. To get actual playable pitches, use get_tahlil() with
        a specific tuning system.
        """
        return self._ascending_note_names.copy()

    def get_descending_note_names(self) -> List[NoteName]:
        """
        Gets the descending sequence (hubūṭ) note names.
        
        These may differ from ascending names in asymmetric maqamat, creating
        distinctive directional characteristics that are essential to the maqam's identity.
        """
        return self._descending_note_names.copy()

    def get_suyur(self) -> List[Sayr]:
        """
        Gets the suyūr (traditional melodic development pathways).
        
        Suyūr define how the maqam unfolds in performance practice, going beyond
        basic ascending/descending sequences to describe characteristic progressions,
        emphasis points, and developmental patterns.
        """
        return self._suyur.copy()

    def get_comments_english(self) -> str:
        """Gets the English-language comments for this maqam."""
        return self._comments_english

    def get_comments_arabic(self) -> str:
        """Gets the Arabic-language comments for this maqam."""
        return self._comments_arabic

    def get_source_page_references(self) -> List[SourcePageReference]:
        """Gets the source page references for this maqam."""
        return self._source_page_references.copy()

    # Setter methods
    def set_name(self, name: str) -> None:
        """Set a new name for this maqam."""
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

    def add_sayr(self, sayr: Sayr) -> None:
        """Add a sayr to the maqam."""
        self._suyur.append(sayr)

    def remove_sayr(self, sayr_id: str) -> bool:
        """Remove a sayr by ID. Returns True if removed, False if not found."""
        for i, sayr in enumerate(self._suyur):
            if sayr.id == sayr_id:
                self._suyur.pop(i)
                return True
        return False

    def is_maqam_symmetric(self) -> bool:
        """
        Checks if this maqam has symmetric ascending and descending sequences.
        
        A symmetric maqam has identical ascending and descending sequences when the
        descending sequence is reversed. Asymmetric maqamat have different note patterns
        for ascent and descent, creating distinctive directional characteristics that
        are visually distinguished in the platform interface.
        """
        if len(self._ascending_note_names) != len(self._descending_note_names):
            return False

        for i in range(len(self._ascending_note_names)):
            if self._ascending_note_names[i] != self._descending_note_names[-(i + 1)]:
                return False

        return True

    def is_maqam_selectable(self, all_note_names: List[NoteName]) -> bool:
        """
        Checks if this maqam can be constructed within a given tuning system.
        
        A maqam is only selectable/constructible if ALL note names in BOTH its
        ascending and descending sequences exist within the tuning system's available
        pitch classes. The platform searches across all four octaves when determining
        compatibility, similar to ajnas but with the additional requirement that both
        directional sequences must be fully supported.
        
        For example, in Al-Kindī's tuning system:
        - Maqam Farahfazza (yegah → dūgāh ascending, dūgāh → yegah descending) ✓ CAN be constructed
        - A hypothetical maqam requiring "nīm ḥusaynī" ✗ CANNOT because Al-Kindī's system lacks this note
        
        Args:
            all_note_names: All note names available in the tuning system
            
        Returns:
            True if all required note names are available in both sequences, false otherwise
        """
        return (
            all(note_name in all_note_names for note_name in self._ascending_note_names) and
            all(note_name in all_note_names for note_name in self._descending_note_names)
        )

    def get_tahlil(self, all_pitch_classes: List[PitchClass]) -> 'Maqam':
        """
        Converts this abstract maqam into a concrete, playable tahlil (original form).
        
        This is the crucial method that bridges the gap between abstract note names
        and actual musical pitches. It processes both ascending and descending sequences
        separately, matching note names with corresponding pitch classes from a specific
        tuning system, creating a Maqam interface instance with:
        
        - Actual frequency values for both sequences
        - Intervallic relationships between consecutive pitches in both directions
        - Playable musical content with directional characteristics
        - Foundation for embedded ajnas analysis and suyūr transposition
        
        The resulting Maqam represents the "tahlil" (original/root form) of the maqam,
        as opposed to "taswir" (transpositions) which would start from different
        pitch classes but maintain the same intervallic patterns and directional structure.
        
        Args:
            all_pitch_classes: All pitch classes available in the tuning system
            
        Returns:
            Maqam interface instance with concrete pitches and intervals
        """
        ascending_pitch_classes = [
            pc for pc in all_pitch_classes 
            if pc.note_name in self._ascending_note_names
        ]
        descending_pitch_classes = [
            pc for pc in all_pitch_classes 
            if pc.note_name in self._descending_note_names
        ]
        # Reverse the descending pitch classes to match the sequence order
        descending_pitch_classes.reverse()
        
        # Import here to avoid circular imports
        from ..functions.transpose import get_pitch_class_intervals
        
        ascending_pitch_class_intervals = get_pitch_class_intervals(ascending_pitch_classes)
        descending_pitch_class_intervals = get_pitch_class_intervals(descending_pitch_classes)
        
        return Maqam(
            maqam_id=self._id,
            name=self._name,
            transposition=False,
            ascending_pitch_classes=ascending_pitch_classes,
            ascending_pitch_class_intervals=ascending_pitch_class_intervals,
            descending_pitch_classes=descending_pitch_classes,
            descending_pitch_class_intervals=descending_pitch_class_intervals
        )

    def create_maqam_with_new_suyur(self, new_suyur: List[Sayr]) -> 'MaqamData':
        """
        Creates a copy of this maqam with new suyūr pathways.
        
        This method preserves all other properties while allowing for suyūr
        modifications, useful for exploring different performance traditions
        or creating variants with alternative melodic development patterns.
        
        Args:
            new_suyur: New suyūr pathways to use in the copy
            
        Returns:
            New MaqamData instance with updated suyūr
        """
        return MaqamData(
            self._id,
            self._name,
            self._ascending_note_names.copy(),
            self._descending_note_names.copy(),
            new_suyur,
            self._comments_english,
            self._comments_arabic,
            self._source_page_references.copy()
        )

    def create_maqam_with_new_source_page_references(
        self, 
        new_source_page_references: List[SourcePageReference]
    ) -> 'MaqamData':
        """
        Creates a copy of this maqam with new source page references.
        
        Args:
            new_source_page_references: New source page references to use
            
        Returns:
            New MaqamData instance with updated references
        """
        return MaqamData(
            self._id,
            self._name,
            self._ascending_note_names.copy(),
            self._descending_note_names.copy(),
            self._suyur.copy(),
            self._comments_english,
            self._comments_arabic,
            new_source_page_references
        )

    def convert_to_object(self) -> MaqamDataInterface:
        """
        Converts this MaqamData to a plain object for JSON serialization.
        
        Returns:
            Plain object representation suitable for JSON storage
        """
        return MaqamDataInterface(
            id=self._id,
            name=self._name,
            ascending_note_names=self._ascending_note_names.copy(),
            descending_note_names=self._descending_note_names.copy(),
            suyur=self._suyur.copy(),
            comments_english=self._comments_english,
            comments_arabic=self._comments_arabic,
            source_page_references=self._source_page_references.copy()
        )

    def convert_to_json(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        return {
            "id": self._id,
            "name": self._name,
            "ascendingNoteNames": self._ascending_note_names.copy(),
            "descendingNoteNames": self._descending_note_names.copy(),
            "suyūr": [
                {
                    "id": sayr.id,
                    "creatorEnglish": sayr.creator_english,
                    "creatorArabic": sayr.creator_arabic,
                    "sourceId": sayr.source_id,
                    "page": sayr.page,
                    "commentsEnglish": sayr.comments_english,
                    "commentsArabic": sayr.comments_arabic,
                    "stops": [
                        {
                            "type": stop.type,
                            "value": stop.value,
                            "startingNote": stop.starting_note,
                            "direction": stop.direction
                        }
                        for stop in sayr.stops
                    ]
                }
                for sayr in self._suyur
            ],
            "commentsEnglish": self._comments_english,
            "commentsArabic": self._comments_arabic,
            "sourcePageReferences": [
                {"sourceId": ref.source_id, "page": ref.page}
                for ref in self._source_page_references
            ]
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> 'MaqamData':
        """Create a MaqamData instance from a JSON dictionary."""
        source_page_references = [
            SourcePageReference(source_id=ref["sourceId"], page=ref["page"])
            for ref in data.get("sourcePageReferences", [])
        ]
        
        suyur = []
        for sayr_data in data.get("suyūr", []):
            stops = [
                SayrStop(
                    type=stop_data["type"],
                    value=stop_data["value"],
                    starting_note=stop_data.get("startingNote"),
                    direction=stop_data.get("direction")
                )
                for stop_data in sayr_data["stops"]
            ]
            
            sayr = Sayr(
                id=sayr_data["id"],
                creator_english=sayr_data["creatorEnglish"],
                creator_arabic=sayr_data["creatorArabic"],
                source_id=sayr_data["sourceId"],
                page=sayr_data["page"],
                comments_english=sayr_data["commentsEnglish"],
                comments_arabic=sayr_data["commentsArabic"],
                stops=stops
            )
            suyur.append(sayr)
        
        return cls(
            id=data["id"],
            name=data["name"],
            ascending_note_names=data["ascendingNoteNames"],
            descending_note_names=data["descendingNoteNames"],
            suyur=suyur,
            comments_english=data["commentsEnglish"],
            comments_arabic=data["commentsArabic"],
            source_page_references=source_page_references
        )

    def __str__(self) -> str:
        """String representation of the maqam."""
        return f"MaqamData '{self._name}' (A:{len(self._ascending_note_names)}, D:{len(self._descending_note_names)})"

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"MaqamData(id='{self._id}', name='{self._name}')"


@dataclass
class Maqam:
    """
    Represents a concrete, tuning-system-specific maqam with actual pitch classes.
    
    This interface represents a maqam that has been "realized" within a specific
    tuning system, containing actual pitch classes with frequencies and intervallic
    relationships for both ascending and descending sequences. Unlike MaqamData
    (which contains only abstract note names), a Maqam interface instance is
    playable and can be used for audio synthesis and comprehensive analysis.
    
    **Tahlil vs Taswir**:
    - **Tahlil** (transposition: False): The original form of the maqam starting
      from its traditional root note (e.g., Maqam Farahfazza starting on yegah)
    - **Taswir** (transposition: True): A transposition of the maqam starting
      from a different pitch class while preserving intervallic relationships and
      directional characteristics (e.g., Maqam Farahfazza al-Rast starting on rast)
    
    **Advanced Features**:
    - **Embedded ajnas analysis**: Algorithm identifies all possible ajnās patterns
      within both ascending and descending sequences using cents tolerance matching
    - **Automatic transposition**: Both sequences and embedded ajnas are systematically
      transposed while maintaining authentic intervallic structure
    - **Suyūr integration**: Associated melodic development pathways are automatically
      transposed with note name conversion and jins/maqam reference adjustment
    
    The transposition algorithm separately processes both sequences, ensuring all
    required note names exist within the tuning system's four octaves before
    generating a valid transposition.
    """
    maqam_id: str                                         # ID of the original maqam this instance is based on
    name: str                                             # Name of this maqam instance
    transposition: bool                                   # Whether this is a transposition or original form
    ascending_pitch_classes: List[PitchClass]            # Array of actual pitch classes for the ascending sequence
    ascending_pitch_class_intervals: List[PitchClassInterval]  # Intervallic relationships in ascending sequence
    descending_pitch_classes: List[PitchClass]           # Array of actual pitch classes for the descending sequence  
    descending_pitch_class_intervals: List[PitchClassInterval]  # Intervallic relationships in descending sequence
    ascending_maqam_ajnas: Optional[List[Optional[Jins]]] = None   # Optional embedded ajnas in ascending sequence
    descending_maqam_ajnas: Optional[List[Optional[Jins]]] = None  # Optional embedded ajnas in descending sequence
    modulations: Optional[Union['MaqamatModulations', AjnasModulations]] = None  # Optional modulation possibilities
    number_of_hops: Optional[int] = None                  # Optional number of steps/hops for modulation analysis

    def get_ascending_note_names(self) -> List[str]:
        """Get the ascending note names from the pitch classes."""
        return [pc.note_name for pc in self.ascending_pitch_classes]

    def get_descending_note_names(self) -> List[str]:
        """Get the descending note names from the pitch classes."""
        return [pc.note_name for pc in self.descending_pitch_classes]

    def get_ascending_frequencies(self) -> List[float]:
        """Get the ascending frequencies from the pitch classes."""
        return [float(pc.frequency) for pc in self.ascending_pitch_classes]

    def get_descending_frequencies(self) -> List[float]:
        """Get the descending frequencies from the pitch classes."""
        return [float(pc.frequency) for pc in self.descending_pitch_classes]

    def is_symmetric(self) -> bool:
        """Check if the maqam has symmetric ascending and descending sequences."""
        if len(self.ascending_pitch_classes) != len(self.descending_pitch_classes):
            return False
        
        ascending_notes = self.get_ascending_note_names()
        descending_notes = self.get_descending_note_names()
        
        return ascending_notes == descending_notes[::-1]

    def to_json(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dictionary."""
        return {
            "maqamId": self.maqam_id,
            "name": self.name,
            "transposition": self.transposition,
            "ascendingPitchClasses": [
                {
                    "noteName": pc.note_name,
                    "fraction": pc.fraction,
                    "cents": pc.cents,
                    "decimalRatio": pc.decimal_ratio,
                    "frequency": pc.frequency,
                    # Add other pitch class fields as needed
                }
                for pc in self.ascending_pitch_classes
            ],
            "ascendingPitchClassIntervals": [
                {
                    "fraction": interval.fraction,
                    "cents": interval.cents,
                    "decimalRatio": interval.decimal_ratio,
                    "originalValue": interval.original_value,
                    "originalValueType": interval.original_value_type
                }
                for interval in self.ascending_pitch_class_intervals
            ],
            "descendingPitchClasses": [
                {
                    "noteName": pc.note_name,
                    "fraction": pc.fraction,
                    "cents": pc.cents,
                    "decimalRatio": pc.decimal_ratio,
                    "frequency": pc.frequency,
                    # Add other pitch class fields as needed
                }
                for pc in self.descending_pitch_classes
            ],
            "descendingPitchClassIntervals": [
                {
                    "fraction": interval.fraction,
                    "cents": interval.cents,
                    "decimalRatio": interval.decimal_ratio,
                    "originalValue": interval.original_value,
                    "originalValueType": interval.original_value_type
                }
                for interval in self.descending_pitch_class_intervals
            ]
        }


@dataclass
class MaqamatModulations:
    """
    Represents possible modulations (transitions) between different maqamat.
    
    In Arabic maqam theory, modulations occur when transitioning from one maqam to
    another within a melodic progression. This interface categorizes modulations
    based on which scale degree they occur on and their directional characteristics,
    similar to ajnas modulations but operating at the complete modal framework level.
    
    Each property contains a list of possible target maqamat that can be reached
    through modulation from a given starting maqam, organized by the scale degree
    where the modulation occurs and the melodic direction.
    """
    modulations_on_one: List[Maqam]                # Modulations that occur on the first scale degree
    modulations_on_three: List[Maqam]              # Modulations that occur on the third scale degree
    modulations_on_three_2p: List[Maqam]           # Modulations that occur on the third scale degree (second pattern)
    modulations_on_four: List[Maqam]               # Modulations that occur on the fourth scale degree
    modulations_on_five: List[Maqam]               # Modulations that occur on the fifth scale degree
    modulations_on_six_ascending: List[Maqam]      # Ascending modulations that occur on the sixth scale degree
    modulations_on_six_descending: List[Maqam]     # Descending modulations that occur on the sixth scale degree
    modulations_on_six_no_third: List[Maqam]       # Modulations on the sixth scale degree without using the third
    note_name_2p: str                              # The note name of the second degree (plus variations)

    def get_all_modulations(self) -> List[Maqam]:
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
