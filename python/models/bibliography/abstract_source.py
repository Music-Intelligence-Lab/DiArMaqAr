"""
Abstract base class and supporting types for bibliographic sources.

This module provides the foundation for the bibliography system used throughout
the maqam network.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Dict, Any
from dataclasses import dataclass


class SourceType(Enum):
    """
    Enumeration of possible bibliographic source types.
    
    Used to categorize sources in the bibliography system and enable
    type-specific processing and formatting.
    """
    BOOK = "Book"
    ARTICLE = "Article"


class ContributorType(Enum):
    """
    Enumeration of contributor roles in academic publications.
    
    Supports various roles found in Middle Eastern musicology publications,
    including traditional Western academic roles and roles specific to
    Arabic manuscript traditions.
    """
    AUTHOR = "Author"
    EDITOR = "Editor"
    TRANSLATOR = "Translator"
    REVIEWER = "Reviewer"
    INVESTIGATOR = "Investigator"


@dataclass
class Contributor:
    """
    Interface representing a contributor to a bibliographic source.
    
    Supports bilingual contributor information with separate fields for
    English and Arabic names, accommodating the multilingual nature of
    Middle Eastern musicology research.
    """
    type: ContributorType
    first_name_english: str
    last_name_english: str
    first_name_arabic: str
    last_name_arabic: str

    def get_full_name_english(self) -> str:
        """Get the full name in English format."""
        return f"{self.first_name_english} {self.last_name_english}"

    def get_full_name_arabic(self) -> str:
        """Get the full name in Arabic format."""
        return f"{self.first_name_arabic} {self.last_name_arabic}"


class AbstractSource(ABC):
    """
    Abstract base class for all bibliographic sources in the maqam network.
    
    Provides common functionality for Books, Articles, and other academic sources
    used in Middle Eastern musicology research. Implements bilingual metadata
    support (English/Arabic) and standardized fields for academic citation.
    
    Uses the Template Method pattern - concrete subclasses override specific
    behavior while inheriting common source management functionality.
    """

    def __init__(
        self,
        id: str,
        title_english: str,
        title_arabic: str,
        source_type: SourceType,
        contributors: List[Contributor],
        edition_english: str,
        edition_arabic: str,
        publication_date_english: str,
        publication_date_arabic: str,
        url: str,
        date_accessed: str
    ):
        """
        Creates a new AbstractSource instance.
        
        Base constructor for all bibliographic sources, establishing common
        fields required for academic citation and source management.
        """
        self._id = id
        self._title_english = title_english
        self._title_arabic = title_arabic
        self._source_type = source_type
        self._contributors = contributors
        self._edition_english = edition_english
        self._edition_arabic = edition_arabic
        self._publication_date_english = publication_date_english
        self._publication_date_arabic = publication_date_arabic
        self._url = url
        self._date_accessed = date_accessed

    # Getter methods
    def get_id(self) -> str:
        """Get the unique identifier for this source."""
        return self._id

    def get_title_english(self) -> str:
        """Get the source title in English."""
        return self._title_english

    def get_title_arabic(self) -> str:
        """Get the source title in Arabic."""
        return self._title_arabic

    def get_source_type(self) -> SourceType:
        """Get the source type discriminator."""
        return self._source_type

    def get_contributors(self) -> List[Contributor]:
        """Get the list of contributors."""
        return self._contributors.copy()

    def get_edition_english(self) -> str:
        """Get edition information in English."""
        return self._edition_english

    def get_edition_arabic(self) -> str:
        """Get edition information in Arabic."""
        return self._edition_arabic

    def get_publication_date_english(self) -> str:
        """Get publication date in English format."""
        return self._publication_date_english

    def get_publication_date_arabic(self) -> str:
        """Get publication date in Arabic format."""
        return self._publication_date_arabic

    def get_url(self) -> str:
        """Get URL for online sources."""
        return self._url

    def get_date_accessed(self) -> str:
        """Get date when online source was accessed."""
        return self._date_accessed

    # Setter methods
    def set_title_english(self, title: str) -> None:
        """Set the source title in English."""
        self._title_english = title

    def set_title_arabic(self, title: str) -> None:
        """Set the source title in Arabic."""
        self._title_arabic = title

    def set_edition_english(self, edition: str) -> None:
        """Set edition information in English."""
        self._edition_english = edition

    def set_edition_arabic(self, edition: str) -> None:
        """Set edition information in Arabic."""
        self._edition_arabic = edition

    def set_publication_date_english(self, date: str) -> None:
        """Set publication date in English format."""
        self._publication_date_english = date

    def set_publication_date_arabic(self, date: str) -> None:
        """Set publication date in Arabic format."""
        self._publication_date_arabic = date

    def set_url(self, url: str) -> None:
        """Set URL for online sources."""
        self._url = url

    def set_date_accessed(self, date: str) -> None:
        """Set date when online source was accessed."""
        self._date_accessed = date

    def add_contributor(self, contributor: Contributor) -> None:
        """Add a contributor to the source."""
        self._contributors.append(contributor)

    def remove_contributor(self, contributor: Contributor) -> bool:
        """Remove a contributor from the source. Returns True if removed, False if not found."""
        try:
            self._contributors.remove(contributor)
            return True
        except ValueError:
            return False

    def get_contributors_by_type(self, contributor_type: ContributorType) -> List[Contributor]:
        """Get all contributors of a specific type."""
        return [c for c in self._contributors if c.type == contributor_type]

    @abstractmethod
    def convert_to_json(self) -> Dict[str, Any]:
        """
        Convert the source to a JSON-serializable dictionary.
        Must be implemented by concrete subclasses.
        """
        pass

    @abstractmethod
    def generate_citation_english(self) -> str:
        """
        Generate a formatted citation in English.
        Must be implemented by concrete subclasses.
        """
        pass

    @abstractmethod
    def generate_citation_arabic(self) -> str:
        """
        Generate a formatted citation in Arabic.
        Must be implemented by concrete subclasses.
        """
        pass

    def __str__(self) -> str:
        """String representation of the source."""
        return f"{self._source_type.value}: {self._title_english}"

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"{self.__class__.__name__}(id='{self._id}', title='{self._title_english}')"
