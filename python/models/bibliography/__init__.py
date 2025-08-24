"""
Bibliography module initialization.

Exports all bibliography-related classes and types for easy importing.
"""

from .abstract_source import AbstractSource, SourceType, ContributorType, Contributor
from .book import Book
from .article import Article
from .source import Source, SourcePageReference

__all__ = [
    'AbstractSource',
    'SourceType', 
    'ContributorType',
    'Contributor',
    'Book',
    'Article', 
    'Source',
    'SourcePageReference'
]
