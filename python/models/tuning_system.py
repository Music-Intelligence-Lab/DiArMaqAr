"""
Tuning system representation for Arabic maqam music theory.

A tuning system is a comprehensive framework that defines the available pitch relationships
within an octave and their cultural context. Following historical precedents like Al-Kindī's
12-tone system from 874 CE, each tuning system contains pitch classes, note names, and
reference frequencies.
"""

from typing import List, Dict, Any, Optional
from .note_name import NoteName, shift_note_name
from .bibliography import SourcePageReference


class TuningSystem:
    """
    Represents a tuning system used in Arabic maqam music theory.
    
    A tuning system is a comprehensive framework that defines the available pitch relationships
    within an octave and their cultural context. Following historical precedents like Al-Kindī's
    12-tone system from 874 CE, each tuning system contains:
    
    1. **Pitch Classes**: Mathematical intervals defining available pitches (ratios or cents)
    2. **Note Names**: Cultural vocabulary for identifying each pitch (rāst, dūgāh, segāh, etc.)
    3. **Reference Frequency**: Converts mathematical ratios into actual frequencies for synthesis
    
    The system supports multiple octaves (below and above the primary octave) which is crucial
    for jins and maqam analysis. Since each pitch class has both relational and absolute values,
    all other representations can be derived through conversion formulas.
    """

    def __init__(
        self,
        title_english: str,
        title_arabic: str,
        year: str,
        source_english: str,
        source_arabic: str,
        source_page_references: List[SourcePageReference],
        creator_english: str,
        creator_arabic: str,
        comments_english: str,
        comments_arabic: str,
        original_pitch_class_values: List[str],
        note_name_sets: List[List[NoteName]],
        abjad_names: List[str],
        string_length: float,
        reference_frequencies: Dict[str, float],
        default_reference_frequency: float,
        saved: bool
    ):
        """
        Creates a new TuningSystem instance.
        
        Args:
            title_english: English title of the tuning system
            title_arabic: Arabic title of the tuning system
            year: Year the system was documented or created
            source_english: English name of the source document
            source_arabic: Arabic name of the source document
            source_page_references: List of page references within the source
            creator_english: English name of the creator/theorist
            creator_arabic: Arabic name of the creator/theorist
            comments_english: Additional English comments
            comments_arabic: Additional Arabic comments
            original_pitch_class_values: Raw input values (ratios, decimals, or cents as strings)
            note_name_sets: Lists of note names corresponding to pitch classes
            abjad_names: Traditional Arabic alphabetical names
            string_length: String length parameter for instruments
            reference_frequencies: Mapping of note names to reference frequencies
            default_reference_frequency: Default frequency anchor (e.g., 440 Hz)
            saved: Whether the system has been saved to storage
        """
        # Generate unique ID by combining creator, year, and title (sanitized)
        self._id = f"{creator_english}-({year})-{title_english}".replace(" ", "").replace("+", "")
        self._title_english = title_english
        self._title_arabic = title_arabic
        self._year = year
        self._source_english = source_english
        self._source_arabic = source_arabic
        self._source_page_references = source_page_references
        self._creator_english = creator_english
        self._creator_arabic = creator_arabic
        self._comments_english = comments_english
        self._comments_arabic = comments_arabic
        self._original_pitch_class_values = original_pitch_class_values
        self._note_name_sets = note_name_sets
        self._abjad_names = abjad_names
        self._string_length = string_length
        self._reference_frequencies = reference_frequencies
        self._default_reference_frequency = default_reference_frequency
        self._saved = saved

    # Getter methods
    def get_id(self) -> str:
        """Gets the unique identifier for this tuning system."""
        return self._id

    def get_title_english(self) -> str:
        """Gets the English title of the tuning system."""
        return self._title_english

    def get_title_arabic(self) -> str:
        """Gets the Arabic title of the tuning system."""
        return self._title_arabic

    def get_year(self) -> str:
        """Gets the year the tuning system was documented or created."""
        return self._year

    def get_source_english(self) -> str:
        """Gets the English name of the source document."""
        return self._source_english

    def get_source_arabic(self) -> str:
        """Gets the Arabic name of the source document."""
        return self._source_arabic

    def get_source_page_references(self) -> List[SourcePageReference]:
        """Gets the page references within the source document."""
        return self._source_page_references.copy()

    def get_creator_english(self) -> str:
        """Gets the English name of the tuning system's creator."""
        return self._creator_english

    def get_creator_arabic(self) -> str:
        """Gets the Arabic name of the tuning system's creator."""
        return self._creator_arabic

    def get_comments_english(self) -> str:
        """Gets additional English comments about the tuning system."""
        return self._comments_english

    def get_comments_arabic(self) -> str:
        """Gets additional Arabic comments about the tuning system."""
        return self._comments_arabic

    def get_original_pitch_class_values(self) -> List[str]:
        """
        Gets the original pitch class values as inputted by the user.
        
        These are raw string values representing mathematical intervals in their
        original format (e.g., "9/8" for fractional ratios, "1.125" for decimals,
        or "204.0" for cents). They are NOT PitchClass objects but preserve the
        exact format as entered, allowing the system to maintain mathematical
        precision and cultural authenticity of historical tuning descriptions.
        """
        return self._original_pitch_class_values.copy()

    def get_note_name_sets(self) -> List[List[NoteName]]:
        """Gets the sets of note names."""
        return [note_set.copy() for note_set in self._note_name_sets]

    def get_abjad_names(self) -> List[str]:
        """Gets the traditional abjad (Arabic alphabetical) names for pitch classes."""
        return self._abjad_names.copy()

    def get_string_length(self) -> float:
        """Gets the string length parameter for instruments (if applicable)."""
        return self._string_length

    def get_reference_frequencies(self) -> Dict[str, float]:
        """
        Gets the mapping of note names to their reference frequencies.
        
        This allows different notes within the system to serve as frequency
        anchors for tuning and synthesis purposes.
        """
        return self._reference_frequencies.copy()

    def get_default_reference_frequency(self) -> float:
        """
        Gets the default reference frequency for the tuning system.
        
        This is the primary frequency anchor (e.g., 440 Hz for A4 in Western music,
        or 220 Hz for ʿushayrān in Al-Kindī's system) used to convert mathematical
        ratios into actual audible frequencies.
        """
        return self._default_reference_frequency

    def is_saved(self) -> bool:
        """Checks whether this tuning system has been saved to persistent storage."""
        return self._saved

    # Setter methods
    def set_title_english(self, title: str) -> None:
        """Set the English title."""
        self._title_english = title

    def set_title_arabic(self, title: str) -> None:
        """Set the Arabic title."""
        self._title_arabic = title

    def set_year(self, year: str) -> None:
        """Set the year."""
        self._year = year

    def set_source_english(self, source: str) -> None:
        """Set the English source name."""
        self._source_english = source

    def set_source_arabic(self, source: str) -> None:
        """Set the Arabic source name."""
        self._source_arabic = source

    def set_creator_english(self, creator: str) -> None:
        """Set the English creator name."""
        self._creator_english = creator

    def set_creator_arabic(self, creator: str) -> None:
        """Set the Arabic creator name."""
        self._creator_arabic = creator

    def set_comments_english(self, comments: str) -> None:
        """Set English comments."""
        self._comments_english = comments

    def set_comments_arabic(self, comments: str) -> None:
        """Set Arabic comments."""
        self._comments_arabic = comments

    def set_default_reference_frequency(self, frequency: float) -> None:
        """Set the default reference frequency."""
        self._default_reference_frequency = frequency

    def set_saved(self, saved: bool) -> None:
        """Set the saved status."""
        self._saved = saved

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

    def add_note_name_set(self, note_set: List[NoteName]) -> None:
        """Add a new note name set."""
        self._note_name_sets.append(note_set.copy())

    def remove_note_name_set(self, index: int) -> Optional[List[NoteName]]:
        """Remove a note name set at the specified index."""
        try:
            return self._note_name_sets.pop(index)
        except IndexError:
            return None

    def update_reference_frequency(self, note_name: str, frequency: float) -> None:
        """Update or add a reference frequency for a note name."""
        self._reference_frequencies[note_name] = frequency

    def remove_reference_frequency(self, note_name: str) -> Optional[float]:
        """Remove a reference frequency. Returns the removed frequency or None."""
        return self._reference_frequencies.pop(note_name, None)

    def stringify(self) -> str:
        """
        Creates a string representation of the tuning system for display purposes.
        
        Format: "Creator (Year) Title" (e.g., "Al-Kindī (874) 12-tone System")
        """
        year_str = self._year if self._year else "NA"
        return f"{self._creator_english} ({year_str}) {self._title_english}"

    def get_note_name_sets_shifted_up_and_down(self) -> List[List[NoteName]]:
        """
        Gets note name sets expanded to include octaves above and below.
        
        This method is crucial for jins and maqam analysis as it provides access
        to pitch classes in multiple octaves. Each note name set is expanded to
        include the octave below (-1) and the octave above (+1) the primary octave,
        giving analysts access to a three-octave range for comprehensive modal analysis.
        """
        used_note_names = []
        for note_set in self._note_name_sets:
            shifted_down = [shift_note_name(note_name, -1) for note_name in note_set]
            shifted_up = [shift_note_name(note_name, 1) for note_name in note_set]
            
            # Filter out None values from invalid shifts
            shifted_down = [note for note in shifted_down if note is not None]
            shifted_up = [note for note in shifted_up if note is not None]
            
            expanded_set = shifted_down + note_set + shifted_up
            used_note_names.append(expanded_set)
        
        return used_note_names

    def copy_with_new_note_name_sets(self, new_note_names: List[List[NoteName]]) -> 'TuningSystem':
        """
        Creates a copy of this tuning system with new note name sets.
        
        Args:
            new_note_names: New note name sets to use in the copy
            
        Returns:
            New TuningSystem instance with updated note names
        """
        return TuningSystem(
            self._title_english,
            self._title_arabic,
            self._year,
            self._source_english,
            self._source_arabic,
            self._source_page_references.copy(),
            self._creator_english,
            self._creator_arabic,
            self._comments_english,
            self._comments_arabic,
            self._original_pitch_class_values.copy(),
            [note_set.copy() for note_set in new_note_names],
            self._abjad_names.copy(),
            self._string_length,
            self._reference_frequencies.copy(),
            self._default_reference_frequency,
            self._saved
        )

    def convert_to_json(self) -> Dict[str, Any]:
        """Convert the tuning system to a JSON-serializable dictionary."""
        return {
            "id": self._id,
            "titleEnglish": self._title_english,
            "titleArabic": self._title_arabic,
            "year": self._year,
            "sourceEnglish": self._source_english,
            "sourceArabic": self._source_arabic,
            "sourcePageReferences": [
                {"sourceId": ref.source_id, "page": ref.page}
                for ref in self._source_page_references
            ],
            "creatorEnglish": self._creator_english,
            "creatorArabic": self._creator_arabic,
            "commentsEnglish": self._comments_english,
            "commentsArabic": self._comments_arabic,
            "originalPitchClassValues": self._original_pitch_class_values.copy(),
            "noteNameSets": [note_set.copy() for note_set in self._note_name_sets],
            "abjadNames": self._abjad_names.copy(),
            "stringLength": self._string_length,
            "referenceFrequencies": self._reference_frequencies.copy(),
            "defaultReferenceFrequency": self._default_reference_frequency,
            "saved": self._saved
        }

    @classmethod
    def from_json(cls, data: Dict[str, Any]) -> 'TuningSystem':
        """Create a TuningSystem instance from a JSON dictionary."""
        source_page_references = [
            SourcePageReference(source_id=ref["sourceId"], page=ref["page"])
            for ref in data.get("sourcePageReferences", [])
        ]
        
        return cls(
            title_english=data["titleEnglish"],
            title_arabic=data["titleArabic"],
            year=data["year"],
            source_english=data["sourceEnglish"],
            source_arabic=data["sourceArabic"],
            source_page_references=source_page_references,
            creator_english=data["creatorEnglish"],
            creator_arabic=data["creatorArabic"],
            comments_english=data["commentsEnglish"],
            comments_arabic=data["commentsArabic"],
            original_pitch_class_values=data["originalPitchClassValues"],
            note_name_sets=data["noteNameSets"],
            abjad_names=data["abjadNames"],
            string_length=data["stringLength"],
            reference_frequencies=data["referenceFrequencies"],
            default_reference_frequency=data["defaultReferenceFrequency"],
            saved=data["saved"]
        )

    @classmethod
    def create_blank_tuning_system(cls) -> 'TuningSystem':
        """
        Creates a blank/default tuning system for initialization purposes.
        
        This factory method creates an empty tuning system with placeholder values
        in both English and Arabic. Useful for initializing the interface before
        users input their own tuning system data or when creating templates for
        new systems.
        """
        return cls(
            title_english="Untitled",
            title_arabic="غير مسمى",
            year="",
            source_english="Unknown Source",
            source_arabic="مصدر غير معروف",
            source_page_references=[],
            creator_english="Unknown Creator",
            creator_arabic="مؤلف غير معروف",
            comments_english="",
            comments_arabic="",
            original_pitch_class_values=[],
            note_name_sets=[],
            abjad_names=[],
            string_length=0.0,
            reference_frequencies={},
            default_reference_frequency=440.0,
            saved=False
        )

    def __str__(self) -> str:
        """String representation of the tuning system."""
        return self.stringify()

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"TuningSystem(id='{self._id}', title='{self._title_english}')"
