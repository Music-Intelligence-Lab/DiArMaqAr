"""
Book source representation in the bibliography system.

This module provides the Book class that extends AbstractSource to handle
book-specific metadata including publisher information, publication places,
ISBN, and original publication dates.
"""

from typing import Dict, Any, List
from .abstract_source import AbstractSource, Contributor, SourceType


class Book(AbstractSource):
    """
    Represents a book source in the bibliography system.
    
    This class extends AbstractSource to provide book-specific metadata including
    publisher information, publication places, ISBN, and original publication dates
    (useful for reprints and editions). All book-specific fields support bilingual
    English/Arabic content to accommodate international Arabic music theory research.
    
    Books are commonly used to reference theoretical treatises, historical manuscripts,
    academic monographs, and reference works that document tuning systems, maqamat,
    and ajnas in Arabic music theory.
    """

    def __init__(
        self,
        id: str,
        title_english: str,
        title_arabic: str,
        contributors: List[Contributor],
        edition_english: str,
        edition_arabic: str,
        publication_date_english: str,
        publication_date_arabic: str,
        original_publication_date_english: str,
        original_publication_date_arabic: str,
        publisher_english: str,
        publisher_arabic: str,
        place_english: str,
        place_arabic: str,
        isbn: str,
        url: str,
        date_accessed: str
    ):
        """
        Creates a new Book instance with comprehensive bibliographic metadata.
        
        Args:
            id: Unique identifier for this book
            title_english: Book title in English
            title_arabic: Book title in Arabic
            contributors: List of contributors (authors, editors, translators, etc.)
            edition_english: Edition information in English
            edition_arabic: Edition information in Arabic
            publication_date_english: Publication date in English
            publication_date_arabic: Publication date in Arabic
            original_publication_date_english: Original publication date in English (for reprints)
            original_publication_date_arabic: Original publication date in Arabic (for reprints)
            publisher_english: Publisher name in English
            publisher_arabic: Publisher name in Arabic
            place_english: Publication place in English
            place_arabic: Publication place in Arabic
            isbn: International Standard Book Number
            url: URL for online access
            date_accessed: Date when the book was last accessed online
        """
        super().__init__(
            id,
            title_english,
            title_arabic,
            SourceType.BOOK,  # discriminator
            contributors,
            edition_english,
            edition_arabic,
            publication_date_english,
            publication_date_arabic,
            url,
            date_accessed
        )
        self._original_publication_date_english = original_publication_date_english
        self._original_publication_date_arabic = original_publication_date_arabic
        self._publisher_english = publisher_english
        self._publisher_arabic = publisher_arabic
        self._place_english = place_english
        self._place_arabic = place_arabic
        self._isbn = isbn

    # Getter methods
    def get_original_publication_date_english(self) -> str:
        """Get the original publication date in English."""
        return self._original_publication_date_english

    def get_original_publication_date_arabic(self) -> str:
        """Get the original publication date in Arabic."""
        return self._original_publication_date_arabic

    def get_publisher_english(self) -> str:
        """Get the publisher name in English."""
        return self._publisher_english

    def get_publisher_arabic(self) -> str:
        """Get the publisher name in Arabic."""
        return self._publisher_arabic

    def get_place_english(self) -> str:
        """Get the publication place in English."""
        return self._place_english

    def get_place_arabic(self) -> str:
        """Get the publication place in Arabic."""
        return self._place_arabic

    def get_isbn(self) -> str:
        """Get the International Standard Book Number."""
        return self._isbn

    # Setter methods
    def set_original_publication_date_english(self, date: str) -> None:
        """Set the original publication date in English."""
        self._original_publication_date_english = date

    def set_original_publication_date_arabic(self, date: str) -> None:
        """Set the original publication date in Arabic."""
        self._original_publication_date_arabic = date

    def set_publisher_english(self, publisher: str) -> None:
        """Set the publisher name in English."""
        self._publisher_english = publisher

    def set_publisher_arabic(self, publisher: str) -> None:
        """Set the publisher name in Arabic."""
        self._publisher_arabic = publisher

    def set_place_english(self, place: str) -> None:
        """Set the publication place in English."""
        self._place_english = place

    def set_place_arabic(self, place: str) -> None:
        """Set the publication place in Arabic."""
        self._place_arabic = place

    def set_isbn(self, isbn: str) -> None:
        """Set the International Standard Book Number."""
        self._isbn = isbn

    def convert_to_json(self) -> Dict[str, Any]:
        """
        Convert the Book to a JSON-serializable dictionary.
        
        Returns:
            Dictionary representation of the book with all metadata
        """
        return {
            "id": self.get_id(),
            "sourceType": self.get_source_type().value,
            "titleEnglish": self.get_title_english(),
            "titleArabic": self.get_title_arabic(),
            "contributors": [
                {
                    "type": c.type.value,
                    "firstNameEnglish": c.first_name_english,
                    "lastNameEnglish": c.last_name_english,
                    "firstNameArabic": c.first_name_arabic,
                    "lastNameArabic": c.last_name_arabic
                }
                for c in self.get_contributors()
            ],
            "editionEnglish": self.get_edition_english(),
            "editionArabic": self.get_edition_arabic(),
            "publicationDateEnglish": self.get_publication_date_english(),
            "publicationDateArabic": self.get_publication_date_arabic(),
            "originalPublicationDateEnglish": self._original_publication_date_english,
            "originalPublicationDateArabic": self._original_publication_date_arabic,
            "publisherEnglish": self._publisher_english,
            "publisherArabic": self._publisher_arabic,
            "placeEnglish": self._place_english,
            "placeArabic": self._place_arabic,
            "ISBN": self._isbn,
            "url": self.get_url(),
            "dateAccessed": self.get_date_accessed()
        }

    def generate_citation_english(self) -> str:
        """
        Generate a formatted citation in English following academic standards.
        
        Returns:
            Formatted citation string in English
        """
        authors = self.get_contributors_by_type(self.get_contributors()[0].type)
        author_str = ", ".join([f"{c.last_name_english}, {c.first_name_english}" for c in authors])
        
        citation = f"{author_str}. {self.get_title_english()}."
        
        if self.get_edition_english():
            citation += f" {self.get_edition_english()}."
        
        citation += f" {self._place_english}: {self._publisher_english}, {self.get_publication_date_english()}."
        
        if self.get_url():
            citation += f" {self.get_url()}."
            if self.get_date_accessed():
                citation += f" Accessed {self.get_date_accessed()}."
        
        return citation

    def generate_citation_arabic(self) -> str:
        """
        Generate a formatted citation in Arabic following academic standards.
        
        Returns:
            Formatted citation string in Arabic
        """
        authors = self.get_contributors_by_type(self.get_contributors()[0].type)
        author_str = "، ".join([f"{c.last_name_arabic}، {c.first_name_arabic}" for c in authors])
        
        citation = f"{author_str}. {self.get_title_arabic()}."
        
        if self.get_edition_arabic():
            citation += f" {self.get_edition_arabic()}."
        
        citation += f" {self._place_arabic}: {self._publisher_arabic}، {self.get_publication_date_arabic()}."
        
        if self.get_url():
            citation += f" {self.get_url()}."
            if self.get_date_accessed():
                citation += f" تم الوصول في {self.get_date_accessed()}."
        
        return citation
