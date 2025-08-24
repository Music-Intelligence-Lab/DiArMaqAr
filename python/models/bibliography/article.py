"""
Article source representation in the bibliography system.

This module provides the Article class that extends AbstractSource to handle
article-specific metadata including journal information, volume and issue numbers,
page ranges, and DOI identifiers.
"""

from typing import Dict, Any, List
from .abstract_source import AbstractSource, Contributor, SourceType


class Article(AbstractSource):
    """
    Represents a journal article source in the bibliography system.
    
    This class extends AbstractSource to provide article-specific metadata including
    journal information, volume and issue numbers, page ranges, and DOI identifiers.
    All article-specific fields support bilingual English/Arabic content to accommodate
    international Arabic music theory research published in various academic journals.
    
    Articles are commonly used to reference research papers, scholarly studies,
    theoretical analyses, and academic discourse related to Arabic music theory,
    tuning systems, maqamat, and ajnas.
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
        journal_english: str,
        journal_arabic: str,
        volume_english: str,
        volume_arabic: str,
        issue_english: str,
        issue_arabic: str,
        page_range_english: str,
        page_range_arabic: str,
        doi: str,
        url: str,
        date_accessed: str
    ):
        """
        Creates a new Article instance with comprehensive journal metadata.
        
        Args:
            id: Unique identifier for this article
            title_english: Article title in English
            title_arabic: Article title in Arabic
            contributors: List of contributors (authors, editors, etc.)
            edition_english: Edition information in English (usually empty for articles)
            edition_arabic: Edition information in Arabic (usually empty for articles)
            publication_date_english: Publication date in English
            publication_date_arabic: Publication date in Arabic
            journal_english: Journal name in English
            journal_arabic: Journal name in Arabic
            volume_english: Volume number in English
            volume_arabic: Volume number in Arabic
            issue_english: Issue number in English
            issue_arabic: Issue number in Arabic
            page_range_english: Page range in English (e.g., "45-67")
            page_range_arabic: Page range in Arabic (e.g., "٤٥-٦٧")
            doi: Digital Object Identifier
            url: URL for online access
            date_accessed: Date when the article was last accessed online
        """
        super().__init__(
            id,
            title_english,
            title_arabic,
            SourceType.ARTICLE,  # discriminator
            contributors,
            edition_english,
            edition_arabic,
            publication_date_english,
            publication_date_arabic,
            url,
            date_accessed
        )
        self._journal_english = journal_english
        self._journal_arabic = journal_arabic
        self._volume_english = volume_english
        self._volume_arabic = volume_arabic
        self._issue_english = issue_english
        self._issue_arabic = issue_arabic
        self._page_range_english = page_range_english
        self._page_range_arabic = page_range_arabic
        self._doi = doi

    # Getter methods
    def get_journal_english(self) -> str:
        """Get the journal name in English."""
        return self._journal_english

    def get_journal_arabic(self) -> str:
        """Get the journal name in Arabic."""
        return self._journal_arabic

    def get_volume_english(self) -> str:
        """Get the volume number in English."""
        return self._volume_english

    def get_volume_arabic(self) -> str:
        """Get the volume number in Arabic."""
        return self._volume_arabic

    def get_issue_english(self) -> str:
        """Get the issue number in English."""
        return self._issue_english

    def get_issue_arabic(self) -> str:
        """Get the issue number in Arabic."""
        return self._issue_arabic

    def get_page_range_english(self) -> str:
        """Get the page range in English."""
        return self._page_range_english

    def get_page_range_arabic(self) -> str:
        """Get the page range in Arabic."""
        return self._page_range_arabic

    def get_doi(self) -> str:
        """Get the Digital Object Identifier."""
        return self._doi

    # Setter methods
    def set_journal_english(self, journal: str) -> None:
        """Set the journal name in English."""
        self._journal_english = journal

    def set_journal_arabic(self, journal: str) -> None:
        """Set the journal name in Arabic."""
        self._journal_arabic = journal

    def set_volume_english(self, volume: str) -> None:
        """Set the volume number in English."""
        self._volume_english = volume

    def set_volume_arabic(self, volume: str) -> None:
        """Set the volume number in Arabic."""
        self._volume_arabic = volume

    def set_issue_english(self, issue: str) -> None:
        """Set the issue number in English."""
        self._issue_english = issue

    def set_issue_arabic(self, issue: str) -> None:
        """Set the issue number in Arabic."""
        self._issue_arabic = issue

    def set_page_range_english(self, page_range: str) -> None:
        """Set the page range in English."""
        self._page_range_english = page_range

    def set_page_range_arabic(self, page_range: str) -> None:
        """Set the page range in Arabic."""
        self._page_range_arabic = page_range

    def set_doi(self, doi: str) -> None:
        """Set the Digital Object Identifier."""
        self._doi = doi

    def convert_to_json(self) -> Dict[str, Any]:
        """
        Convert the Article to a JSON-serializable dictionary.
        
        Returns:
            Dictionary representation of the article with all metadata
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
            "journalEnglish": self._journal_english,
            "journalArabic": self._journal_arabic,
            "volumeEnglish": self._volume_english,
            "volumeArabic": self._volume_arabic,
            "issueEnglish": self._issue_english,
            "issueArabic": self._issue_arabic,
            "pageRangeEnglish": self._page_range_english,
            "pageRangeArabic": self._page_range_arabic,
            "DOI": self._doi,
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
        
        citation = f"{author_str}. \"{self.get_title_english()}.\""
        citation += f" {self._journal_english}"
        
        if self._volume_english:
            citation += f" {self._volume_english}"
            if self._issue_english:
                citation += f", no. {self._issue_english}"
        
        citation += f" ({self.get_publication_date_english()})"
        
        if self._page_range_english:
            citation += f": {self._page_range_english}"
        
        citation += "."
        
        if self._doi:
            citation += f" DOI: {self._doi}."
        elif self.get_url():
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
        
        citation = f"{author_str}. \"{self.get_title_arabic()}.\""
        citation += f" {self._journal_arabic}"
        
        if self._volume_arabic:
            citation += f" {self._volume_arabic}"
            if self._issue_arabic:
                citation += f"، رقم {self._issue_arabic}"
        
        citation += f" ({self.get_publication_date_arabic()})"
        
        if self._page_range_arabic:
            citation += f": {self._page_range_arabic}"
        
        citation += "."
        
        if self._doi:
            citation += f" DOI: {self._doi}."
        elif self.get_url():
            citation += f" {self.get_url()}."
            if self.get_date_accessed():
                citation += f" تم الوصول في {self.get_date_accessed()}."
        
        return citation
