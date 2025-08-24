"""
Source model for bibliographic references and citations.

Represents bibliographic sources used in the maqam network for
academic references, historical documentation, and source attribution.
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any


@dataclass
class Source:
    """
    Represents a bibliographic source or reference.
    
    Used for citing academic works, historical sources, recordings,
    and other materials referenced in the maqam network.
    """
    
    # Required fields
    id: str  # Unique identifier for the source
    title: str  # Title of the work
    author: str  # Primary author or composer
    
    # Publication details
    year: int = 0  # Publication year
    publisher: str = ""  # Publisher or record label
    location: str = ""  # Publication location
    
    # Digital references
    url: str = ""  # URL for online sources
    doi: str = ""  # Digital Object Identifier
    
    # Additional metadata
    description: str = ""  # Description or abstract
    type: str = "book"  # Type: book, article, recording, manuscript, etc.
    language: str = "en"  # Language code (ISO 639-1)
    
    # Extended fields
    subtitle: str = ""  # Subtitle if applicable
    edition: str = ""  # Edition information
    volume: str = ""  # Volume number
    pages: str = ""  # Page range or total pages
    isbn: str = ""  # ISBN for books
    issn: str = ""  # ISSN for periodicals
    
    # Multiple authors support
    additional_authors: List[str] = None  # Additional authors
    editors: List[str] = None  # Editors
    translators: List[str] = None  # Translators
    
    # Source-specific metadata
    journal: str = ""  # Journal name for articles
    conference: str = ""  # Conference name for proceedings
    institution: str = ""  # Institution for theses/reports
    degree: str = ""  # Degree type for theses
    
    # Media-specific fields
    duration: str = ""  # Duration for recordings
    format: str = ""  # Format: CD, LP, digital, etc.
    catalog_number: str = ""  # Catalog or matrix number
    
    # Manuscript fields
    manuscript_location: str = ""  # Archive or library location
    manuscript_collection: str = ""  # Collection name
    folio_pages: str = ""  # Folio or manuscript page numbers
    
    # Tags and categorization
    tags: List[str] = None  # Subject tags
    keywords: List[str] = None  # Keywords for searching
    subjects: List[str] = None  # Subject classification
    
    # Quality and reliability
    reliability_score: float = 1.0  # Reliability rating (0.0-1.0)
    verification_status: str = "unverified"  # verified, unverified, disputed
    notes: str = ""  # Additional notes or comments
    
    def __post_init__(self):
        """Initialize mutable default values."""
        if self.additional_authors is None:
            self.additional_authors = []
        if self.editors is None:
            self.editors = []
        if self.translators is None:
            self.translators = []
        if self.tags is None:
            self.tags = []
        if self.keywords is None:
            self.keywords = []
        if self.subjects is None:
            self.subjects = []
    
    @property
    def all_authors(self) -> List[str]:
        """Get all authors including primary and additional authors."""
        authors = [self.author] if self.author else []
        authors.extend(self.additional_authors)
        return authors
    
    @property
    def full_citation(self) -> str:
        """Generate a full citation string."""
        citation_parts = []
        
        # Authors
        if self.author:
            if self.additional_authors:
                if len(self.additional_authors) == 1:
                    citation_parts.append(f"{self.author} and {self.additional_authors[0]}")
                elif len(self.additional_authors) <= 3:
                    all_authors = [self.author] + self.additional_authors
                    citation_parts.append(", ".join(all_authors[:-1]) + f", and {all_authors[-1]}")
                else:
                    citation_parts.append(f"{self.author} et al.")
            else:
                citation_parts.append(self.author)
        
        # Year
        if self.year > 0:
            citation_parts.append(f"({self.year})")
        
        # Title
        if self.title:
            if self.type in ["book", "thesis", "manuscript"]:
                citation_parts.append(f"*{self.title}*")
            else:
                citation_parts.append(f'"{self.title}"')
        
        # Publication details
        if self.type == "article" and self.journal:
            citation_parts.append(f"*{self.journal}*")
            if self.volume:
                citation_parts.append(f"Vol. {self.volume}")
        elif self.type == "book" and self.publisher:
            citation_parts.append(f"{self.publisher}")
            if self.location:
                citation_parts.append(f"({self.location})")
        
        # Pages
        if self.pages:
            citation_parts.append(f"pp. {self.pages}")
        
        return ". ".join(citation_parts) + "."
    
    @property
    def short_citation(self) -> str:
        """Generate a short citation string."""
        author_part = self.author if self.author else "Unknown"
        year_part = str(self.year) if self.year > 0 else "n.d."
        return f"{author_part} ({year_part})"
    
    def matches_search(self, query: str) -> bool:
        """Check if source matches a search query."""
        query_lower = query.lower()
        
        # Search in main fields
        searchable_fields = [
            self.title, self.author, self.description,
            self.publisher, self.journal, " ".join(self.all_authors)
        ]
        
        # Search in list fields
        searchable_fields.extend(self.tags)
        searchable_fields.extend(self.keywords)
        searchable_fields.extend(self.subjects)
        
        for field in searchable_fields:
            if field and query_lower in field.lower():
                return True
        
        return False
    
    def to_bibtex(self) -> str:
        """Convert source to BibTeX format."""
        entry_type = {
            "book": "book",
            "article": "article",
            "thesis": "phdthesis",
            "conference": "inproceedings",
            "manuscript": "misc",
            "recording": "misc"
        }.get(self.type, "misc")
        
        # Generate citation key
        citation_key = self.id or f"{self.author.replace(' ', '')}_{self.year}"
        
        bibtex_lines = [f"@{entry_type}{{{citation_key},"]
        
        # Add fields
        if self.title:
            bibtex_lines.append(f'  title = "{self.title}",')
        if self.author:
            bibtex_lines.append(f'  author = "{self.author}",')
        if self.year > 0:
            bibtex_lines.append(f'  year = "{self.year}",')
        if self.publisher:
            bibtex_lines.append(f'  publisher = "{self.publisher}",')
        if self.journal:
            bibtex_lines.append(f'  journal = "{self.journal}",')
        if self.volume:
            bibtex_lines.append(f'  volume = "{self.volume}",')
        if self.pages:
            bibtex_lines.append(f'  pages = "{self.pages}",')
        if self.url:
            bibtex_lines.append(f'  url = "{self.url}",')
        if self.doi:
            bibtex_lines.append(f'  doi = "{self.doi}",')
        
        bibtex_lines.append("}")
        return "\n".join(bibtex_lines)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert source to dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "year": self.year,
            "publisher": self.publisher,
            "location": self.location,
            "url": self.url,
            "doi": self.doi,
            "description": self.description,
            "type": self.type,
            "language": self.language,
            "subtitle": self.subtitle,
            "edition": self.edition,
            "volume": self.volume,
            "pages": self.pages,
            "isbn": self.isbn,
            "issn": self.issn,
            "additional_authors": self.additional_authors,
            "editors": self.editors,
            "translators": self.translators,
            "journal": self.journal,
            "conference": self.conference,
            "institution": self.institution,
            "degree": self.degree,
            "duration": self.duration,
            "format": self.format,
            "catalog_number": self.catalog_number,
            "manuscript_location": self.manuscript_location,
            "manuscript_collection": self.manuscript_collection,
            "folio_pages": self.folio_pages,
            "tags": self.tags,
            "keywords": self.keywords,
            "subjects": self.subjects,
            "reliability_score": self.reliability_score,
            "verification_status": self.verification_status,
            "notes": self.notes
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Source':
        """Create Source from dictionary representation."""
        return cls(**data)
    
    def is_valid(self) -> bool:
        """Check if source has minimum required information."""
        return bool(self.id and self.title and self.author)
    
    def get_validation_errors(self) -> List[str]:
        """Get list of validation errors."""
        errors = []
        
        if not self.id:
            errors.append("Source ID is required")
        if not self.title:
            errors.append("Title is required")
        if not self.author:
            errors.append("Author is required")
        
        if self.year < 0:
            errors.append("Year cannot be negative")
        
        if self.reliability_score < 0.0 or self.reliability_score > 1.0:
            errors.append("Reliability score must be between 0.0 and 1.0")
        
        if self.verification_status not in ["verified", "unverified", "disputed"]:
            errors.append("Invalid verification status")
        
        return errors
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update source fields from dictionary."""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)


# Utility functions for working with sources

def create_book_source(
    id: str,
    title: str,
    author: str,
    year: int,
    publisher: str,
    location: str = "",
    **kwargs
) -> Source:
    """Create a book source with standard fields."""
    return Source(
        id=id,
        title=title,
        author=author,
        year=year,
        publisher=publisher,
        location=location,
        type="book",
        **kwargs
    )


def create_article_source(
    id: str,
    title: str,
    author: str,
    journal: str,
    year: int,
    volume: str = "",
    pages: str = "",
    **kwargs
) -> Source:
    """Create an article source with standard fields."""
    return Source(
        id=id,
        title=title,
        author=author,
        year=year,
        journal=journal,
        volume=volume,
        pages=pages,
        type="article",
        **kwargs
    )


def create_recording_source(
    id: str,
    title: str,
    artist: str,
    year: int,
    label: str = "",
    catalog_number: str = "",
    duration: str = "",
    **kwargs
) -> Source:
    """Create a recording source with standard fields."""
    return Source(
        id=id,
        title=title,
        author=artist,  # Use artist as author for recordings
        year=year,
        publisher=label,  # Use label as publisher
        catalog_number=catalog_number,
        duration=duration,
        type="recording",
        **kwargs
    )


def create_manuscript_source(
    id: str,
    title: str,
    author: str,
    manuscript_location: str,
    manuscript_collection: str = "",
    folio_pages: str = "",
    **kwargs
) -> Source:
    """Create a manuscript source with standard fields."""
    return Source(
        id=id,
        title=title,
        author=author,
        manuscript_location=manuscript_location,
        manuscript_collection=manuscript_collection,
        folio_pages=folio_pages,
        type="manuscript",
        **kwargs
    )


def sort_sources_by_author(sources: List[Source]) -> List[Source]:
    """Sort sources alphabetically by author."""
    return sorted(sources, key=lambda s: s.author.lower())


def sort_sources_by_year(sources: List[Source]) -> List[Source]:
    """Sort sources chronologically by year."""
    return sorted(sources, key=lambda s: s.year)


def filter_sources_by_type(sources: List[Source], source_type: str) -> List[Source]:
    """Filter sources by type."""
    return [s for s in sources if s.type == source_type]


def search_sources(sources: List[Source], query: str) -> List[Source]:
    """Search sources by query string."""
    return [s for s in sources if s.matches_search(query)]
