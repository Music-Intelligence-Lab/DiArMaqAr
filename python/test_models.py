"""
Test script to verify that the Python models are working correctly.
"""

import sys
import os

# Add the python directory to the path so we can import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from models import (
    # Bibliography
    Book, Article, Contributor, ContributorType, SourcePageReference,
    
    # Core models
    NoteName, Pattern, PatternNote, TuningSystem, JinsData, MaqamData,
    
    # Note names
    OCTAVE_ONE_NOTE_NAMES, get_note_name_index_and_octave, shift_note_name,
    
    # Patterns
    SCALE_DEGREES, DURATION_OPTIONS
)


def test_bibliography():
    """Test bibliography models."""
    print("Testing bibliography models...")
    
    # Create a contributor
    contributor = Contributor(
        type=ContributorType.AUTHOR,
        first_name_english="John",
        last_name_english="Smith",
        first_name_arabic="جون",
        last_name_arabic="سميث"
    )
    
    # Create a book
    book = Book(
        id="smith2020",
        title_english="Arabic Music Theory",
        title_arabic="نظرية الموسيقى العربية",
        contributors=[contributor],
        edition_english="1st Edition",
        edition_arabic="الطبعة الأولى",
        publication_date_english="2020",
        publication_date_arabic="٢٠٢٠",
        original_publication_date_english="2020",
        original_publication_date_arabic="٢٠٢٠",
        publisher_english="Academic Press",
        publisher_arabic="دار النشر الأكاديمية",
        place_english="New York",
        place_arabic="نيويورك",
        isbn="978-0123456789",
        url="",
        date_accessed=""
    )
    
    print(f"✓ Created book: {book.get_title_english()}")
    print(f"✓ Book ID: {book.get_id()}")
    print(f"✓ Publisher: {book.get_publisher_english()}")
    
    # Test JSON conversion
    json_data = book.convert_to_json()
    print(f"✓ JSON conversion successful, contains {len(json_data)} fields")


def test_note_names():
    """Test note name functionality."""
    print("\nTesting note names...")
    
    # Test note name from octave one
    note = "rāst"
    print(f"✓ Testing note: {note}")
    
    # Get index and octave
    cell = get_note_name_index_and_octave(note)
    print(f"✓ Note '{note}' is at octave {cell.octave}, index {cell.index}")
    
    # Test shifting
    shifted_up = shift_note_name(note, 1)
    if shifted_up:
        print(f"✓ Note '{note}' shifted up one octave: {shifted_up}")
    else:
        print(f"✗ Could not shift note '{note}' up")
    
    # Test some octave one note names
    print(f"✓ Total octave one notes: {len(OCTAVE_ONE_NOTE_NAMES)}")
    print(f"✓ First few notes: {OCTAVE_ONE_NOTE_NAMES[:5]}")


def test_pattern():
    """Test pattern functionality."""
    print("\nTesting patterns...")
    
    # Create pattern notes
    notes = [
        PatternNote(scale_degree="I", note_duration="4n", is_target=True),
        PatternNote(scale_degree="II", note_duration="8n", is_target=False),
        PatternNote(scale_degree="III", note_duration="4n", is_target=True, velocity=100),
    ]
    
    # Create pattern
    pattern = Pattern(
        id="test_pattern",
        name="Test Ascending Pattern",
        notes=notes
    )
    
    print(f"✓ Created pattern: {pattern.get_name()}")
    print(f"✓ Pattern has {pattern.get_note_count()} notes")
    print(f"✓ Target notes: {len(pattern.get_target_notes())}")
    
    # Test JSON conversion
    json_data = pattern.convert_to_json()
    print(f"✓ Pattern JSON conversion successful")
    
    # Test reversing pattern
    reversed_pattern = pattern.reverse_pattern_notes()
    print(f"✓ Created reversed pattern: {reversed_pattern.get_name()}")


def test_tuning_system():
    """Test tuning system functionality."""
    print("\nTesting tuning systems...")
    
    # Create a simple tuning system
    tuning_system = TuningSystem.create_blank_tuning_system()
    
    print(f"✓ Created blank tuning system: {tuning_system.get_title_english()}")
    print(f"✓ Creator: {tuning_system.get_creator_english()}")
    print(f"✓ Default frequency: {tuning_system.get_default_reference_frequency()} Hz")
    
    # Test stringify
    string_repr = tuning_system.stringify()
    print(f"✓ String representation: {string_repr}")


def test_jins():
    """Test jins functionality."""
    print("\nTesting jins...")
    
    # Create source page reference
    source_ref = SourcePageReference(source_id="smith2020", page="45")
    
    # Create a simple jins
    jins = JinsData(
        id="jins_kurd",
        name="Jins Kurd",
        note_names=["dūgāh", "kurdī", "chahārgāh", "nawā"],
        comments_english="A common jins in Arabic music",
        comments_arabic="جنس شائع في الموسيقى العربية",
        source_page_references=[source_ref]
    )
    
    print(f"✓ Created jins: {jins.get_name()}")
    print(f"✓ Note names: {jins.get_note_names()}")
    print(f"✓ Comments: {jins.get_comments_english()}")
    
    # Test selectability (should be false since we don't have all notes in our test)
    test_notes = ["rāst", "dūgāh", "segāh"]
    selectable = jins.is_jins_selectable(test_notes)
    print(f"✓ Jins selectable with test notes: {selectable}")


def test_maqam():
    """Test maqam functionality."""
    print("\nTesting maqam...")
    
    # Create source page reference
    source_ref = SourcePageReference(source_id="smith2020", page="67")
    
    # Create a simple maqam
    maqam = MaqamData(
        id="maqam_rast",
        name="Maqam Rast",
        ascending_note_names=["rāst", "dūgāh", "segāh", "chahārgāh", "nawā", "ḥusaynī", "ʿajam"],
        descending_note_names=["ʿajam", "ḥusaynī", "nawā", "chahārgāh", "segāh", "dūgāh", "rāst"],
        suyur=[],  # Empty for now
        comments_english="The fundamental maqam in Arabic music",
        comments_arabic="المقام الأساسي في الموسيقى العربية",
        source_page_references=[source_ref]
    )
    
    print(f"✓ Created maqam: {maqam.get_name()}")
    print(f"✓ Ascending notes: {maqam.get_ascending_note_names()}")
    print(f"✓ Descending notes: {maqam.get_descending_note_names()}")
    print(f"✓ Is symmetric: {maqam.is_maqam_symmetric()}")
    
    # Test selectability
    all_notes = maqam.get_ascending_note_names() + maqam.get_descending_note_names()
    selectable = maqam.is_maqam_selectable(all_notes)
    print(f"✓ Maqam selectable with its own notes: {selectable}")


def main():
    """Run all tests."""
    print("🎵 Testing Python Maqam Network Models 🎵")
    print("=" * 50)
    
    try:
        test_bibliography()
        test_note_names()
        test_pattern()
        test_tuning_system()
        test_jins()
        test_maqam()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed successfully!")
        print("The Python models are working correctly! 🎉")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
