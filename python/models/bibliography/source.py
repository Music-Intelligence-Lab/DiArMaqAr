"""
Union type definition for bibliographic sources and page reference interface.

This module provides the core type definitions for the bibliography system,
including the Source union type that encompasses all possible bibliographic
source types (Books and Articles) and the SourcePageReference interface
for linking musical content to specific pages in sources.

Used throughout the maqam network for academic citations and source attribution.
"""

from typing import Union
from dataclasses import dataclass
from .book import Book
from .article import Article


# Union type representing all possible bibliographic source types
Source = Union[Book, Article]


@dataclass
class SourcePageReference:
    """
    Interface for referencing specific pages within a bibliographic source.
    
    Used to create precise citations that link musical content (maqamat, ajnas,
    tuning systems, etc.) to their specific locations within academic sources.
    The page field supports various formats including single pages, page ranges,
    and Arabic page numbering.
    """
    source_id: str  # Unique identifier of the source being referenced
    page: str      # Page number or range (supports various formats including Arabic)

    def __str__(self) -> str:
        """String representation of the page reference."""
        return f"{self.source_id}, p. {self.page}"

    def __repr__(self) -> str:
        """Detailed string representation for debugging."""
        return f"SourcePageReference(source_id='{self.source_id}', page='{self.page}')"
