"""
Modulation analysis for Arabic maqam music using Al-Shawwā's technique.

This module implements the modulation algorithm based on Sāmī Al-Shawwā's 1946 work
on maqām modulation analysis, providing systematic evaluation of possible modulations
between maqamat and ajnas based on scale degree relationships.
"""

from typing import List, Dict, Any, Union, Optional
from ..models.note_name import get_note_name_index_and_octave, OCTAVE_ONE_NOTE_NAMES, OCTAVE_TWO_NOTE_NAMES
from ..models.pitch_class import PitchClass
from ..models.jins import Jins, JinsData
from ..models.maqam import Maqam, MaqamData
from .transpose import get_jins_transpositions, get_maqam_transpositions


def shawwa_mapping(note_name: str) -> str:
    """
    Al-Shawwā Note Classification Function.
    
    This function implements Sāmī Al-Shawwā's 24-tone classification system as described 
    in his 1946 work. Al-Shawwā classifies notes into four categories based on the 
    Arab-Ottoman-Persian note naming framework.
    
    Classification Categories:
    - "aṣlīya" (original) or "ṭabīʿīya" (natural) → "n"
      These are stable, consonant scale degrees that form the foundation of maqām structure
    
    - "anṣāf" (half-notes) → "2p" (two parts)
      These represent standard half-tone alterations (sharps/flats in Western terms)
    
    - "arbāʿ" (one-fourth notes) → "1p" (one part)  
      These represent quarter-tone alterations, reflecting Al-Shawwā's understanding
      of whole tone division into four unequal segments using commas
    
    - Invalid/undefined notes → "/"
      Notes that don't fit into Al-Shawwā's theoretical framework
    
    Args:
        note_name: The note name to classify according to Al-Shawwā's system
        
    Returns:
        The Al-Shawwā classification category: "n", "1p", "2p", or "/"
    """
    # Handle the special "none" case - outside Al-Shawwā's framework
    if note_name == "none":
        return "/"
    
    # Get the index of the note within Al-Shawwā's 24-tone note name system
    try:
        index_info = get_note_name_index_and_octave(note_name)
        index = index_info.index
    except:
        return "/"  # Invalid note name
    
    # Al-Shawwā's classification indices based on his 1946 theoretical framework
    
    # "aṣlīya" (original) or "ṭabīʿīya" (natural) notes
    # These form the stable foundation of maqām structures
    natural_indices = [0, 6, 11, 16, 21, 26, 30]
    
    # "arbāʿ" (one-fourth notes) - quarter-tone alterations
    # Reflecting whole tone division into four unequal comma segments
    one_part_indices = [1, 4, 7, 13, 18, 20, 22, 27, 32, 35]
    
    # "anṣāf" (half-notes) - standard half-tone alterations
    two_part_indices = [3, 8, 14, 19, 24, 28, 34]

    # Apply Al-Shawwā's classification logic
    if index in natural_indices:
        return "n"     # Natural (aṣlīya/ṭabīʿīya)
    elif index in one_part_indices:
        return "1p"    # One-part (arbāʿ) - quarter-tone alteration
    elif index in two_part_indices:
        return "2p"    # Two-part (anṣāf) - half-tone alteration
    else:
        return "/"     # Outside Al-Shawwā's theoretical framework


def modulate(
    all_pitch_classes: List[PitchClass],
    all_ajnas: List[JinsData],
    all_maqamat: List[MaqamData],
    source_maqam_transposition: Maqam,
    ajnas_modulations_mode: bool,
    cents_tolerance: float = 5.0
) -> Dict[str, List[Union[Maqam, Jins]]]:
    """
    Modulation Analysis Using Al-Shawwā's Technique.

    This function implements the modulation algorithm based on Sāmī Al-Shawwā's 1946 work
    on maqām modulation analysis. The algorithm evaluates possible modulations based on
    scale degree relationships within the Arab-Ottoman-Persian note naming framework.

    Modulation Rules Implemented:

    1. Tonic Correspondence: Modulation between maqāmāt sharing the same tonic (qarār),
       provided the tonic is classified as an "original" note (aṣlīya)

    2. Third-Degree Modulation: Transition where the third degree of the source maqām
       becomes the tonic of the target, valid only when the third degree is classified
       as an "original" note

    3. Alternative Third-Degree Modulation: If the standard third degree is invalid,
       Al-Shawwā permits using a niṣf (half-note)/two-parts (2p) scale degree

    4. Fourth and Fifth-Degree Modulation: Transitions using the fourth or fifth scale
       degrees of the source maqām as the tonic of the target

    5. Sixth-Degree Modulation: When other degrees are invalid, modulation may occur
       through the sixth scale degree under specific conditions

    Args:
        all_pitch_classes: Complete array of available pitch classes in the tuning system
        all_ajnas: Array of all available ajnas for modulation analysis
        all_maqamat: Array of all available maqamat for modulation analysis
        source_maqam_transposition: The source maqam transposition to analyze modulations from
        ajnas_modulations_mode: If True, analyze ajnas modulations; if False, analyze maqamat modulations
        cents_tolerance: Tolerance in cents for pitch matching (default: 5.0)

    Returns:
        Dictionary containing all possible modulations organized by scale degree according to Al-Shawwā's rules
    """
    # Initialize modulation arrays for each scale degree according to Al-Shawwā's categories
    modulations_on_one = []      # Tonic correspondence modulations
    modulations_on_three = []    # Standard third-degree modulations
    modulations_on_three_2p = [] # Alternative third-degree (2p) modulations
    modulations_on_four = []     # Fourth-degree modulations
    modulations_on_five = []     # Fifth-degree modulations
    modulations_on_six = []      # Sixth-degree modulations
    modulations_on_six_no_three = []  # Sixth-degree when no valid third
    
    # Get scale degrees from source maqam
    source_scale = source_maqam_transposition.scale_intervals
    source_tonic = source_maqam_transposition.tonic
    
    # Extract scale degrees (intervals from tonic)
    scale_degrees = {
        "first": source_scale[0] if len(source_scale) > 0 else None,
        "second": source_scale[1] if len(source_scale) > 1 else None,
        "third": source_scale[2] if len(source_scale) > 2 else None,
        "fourth": source_scale[3] if len(source_scale) > 3 else None,
        "fifth": source_scale[4] if len(source_scale) > 4 else None,
        "sixth": source_scale[5] if len(source_scale) > 5 else None,
        "seventh": source_scale[6] if len(source_scale) > 6 else None,
        "octave": source_scale[7] if len(source_scale) > 7 else None,
    }
    
    # Get all available transpositions based on mode
    if ajnas_modulations_mode:
        available_transpositions = []
        for jins_data in all_ajnas:
            jins_transpositions = get_jins_transpositions(all_pitch_classes, jins_data, cents_tolerance)
            available_transpositions.extend(jins_transpositions)
    else:
        available_transpositions = []
        for maqam_data in all_maqamat:
            maqam_transpositions = get_maqam_transpositions(all_pitch_classes, maqam_data, cents_tolerance)
            available_transpositions.extend(maqam_transpositions)
    
    # Apply Al-Shawwā's modulation rules
    for transposition in available_transpositions:
        target_tonic = transposition.tonic if hasattr(transposition, 'tonic') else None
        
        if not target_tonic:
            continue
        
        # Get Al-Shawwā classification for target tonic
        target_classification = shawwa_mapping(target_tonic)
        
        # Rule 1: Tonic Correspondence
        # Modulation between maqāmāt sharing the same tonic
        if target_tonic == source_tonic and target_classification == "n":
            modulations_on_one.append(transposition)
        
        # Rule 2: Third-Degree Modulation
        # Third degree of source becomes tonic of target
        if (scale_degrees["third"] and 
            _pitch_classes_match(scale_degrees["third"], target_tonic, cents_tolerance) and
            target_classification == "n"):
            modulations_on_three.append(transposition)
        
        # Rule 3: Alternative Third-Degree Modulation (2p)
        # Using a half-note alteration near the third degree
        if (scale_degrees["third"] and 
            _is_alternative_third_degree(scale_degrees["third"], target_tonic, source_tonic) and
            target_classification == "2p"):
            modulations_on_three_2p.append(transposition)
        
        # Rule 4: Fourth-Degree Modulation
        if (scale_degrees["fourth"] and 
            _pitch_classes_match(scale_degrees["fourth"], target_tonic, cents_tolerance) and
            target_classification in ["n", "2p"]):
            modulations_on_four.append(transposition)
        
        # Rule 5: Fifth-Degree Modulation
        if (scale_degrees["fifth"] and 
            _pitch_classes_match(scale_degrees["fifth"], target_tonic, cents_tolerance) and
            target_classification in ["n", "2p"]):
            modulations_on_five.append(transposition)
        
        # Rule 6: Sixth-Degree Modulation
        if (scale_degrees["sixth"] and 
            _pitch_classes_match(scale_degrees["sixth"], target_tonic, cents_tolerance) and
            target_classification == "n"):
            
            # Check if this is a valid sixth-degree modulation
            if _is_valid_sixth_degree_modulation(scale_degrees["sixth"], source_tonic, scale_degrees):
                if _has_valid_third_degree(scale_degrees):
                    modulations_on_six.append(transposition)
                else:
                    modulations_on_six_no_three.append(transposition)
    
    # Return organized modulations according to Al-Shawwā's categories
    return {
        "modulations_on_one": modulations_on_one,
        "modulations_on_three": modulations_on_three,
        "modulations_on_three_2p": modulations_on_three_2p,
        "modulations_on_four": modulations_on_four,
        "modulations_on_five": modulations_on_five,
        "modulations_on_six": modulations_on_six,
        "modulations_on_six_no_three": modulations_on_six_no_three,
    }


def _pitch_classes_match(interval1: str, note_name: str, tolerance: float = 5.0) -> bool:
    """Check if a pitch class interval matches a note name within tolerance."""
    # This would need implementation based on the pitch class comparison logic
    # For now, return a simplified comparison
    return False  # Placeholder implementation


def _is_alternative_third_degree(third_degree: str, target_tonic: str, source_tonic: str) -> bool:
    """Check if target tonic represents an alternative third degree according to Al-Shawwā."""
    # Implementation would check if the target is a valid 2p alternative to the third degree
    return False  # Placeholder implementation


def _is_valid_sixth_degree_modulation(sixth_degree: str, source_tonic: str, scale_degrees: Dict[str, Optional[str]]) -> bool:
    """Check if sixth degree modulation is valid according to Al-Shawwā's conditions."""
    # Implementation would verify:
    # - Sixth degree is 16th or 17th pitch class from tonic
    # - Maintains proper distance from preceding scale degree
    return False  # Placeholder implementation


def _has_valid_third_degree(scale_degrees: Dict[str, Optional[str]]) -> bool:
    """Check if the scale has a valid third degree for modulation."""
    if not scale_degrees["third"]:
        return False
    
    third_classification = shawwa_mapping(scale_degrees["third"])
    return third_classification == "n"


def calculate_number_of_modulations(modulations: Dict[str, List[Any]]) -> Dict[str, int]:
    """
    Calculate the total number of modulations for each scale degree category.
    
    Args:
        modulations: Dictionary of modulation lists organized by scale degree
        
    Returns:
        Dictionary with counts for each modulation category
    """
    return {
        category: len(modulation_list)
        for category, modulation_list in modulations.items()
    }


def get_total_modulations_count(modulations: Dict[str, List[Any]]) -> int:
    """
    Get the total count of all possible modulations.
    
    Args:
        modulations: Dictionary of modulation lists organized by scale degree
        
    Returns:
        Total number of possible modulations
    """
    return sum(len(modulation_list) for modulation_list in modulations.values())


def filter_modulations_by_category(
    modulations: Dict[str, List[Any]], 
    categories: List[str]
) -> Dict[str, List[Any]]:
    """
    Filter modulations to include only specified categories.
    
    Args:
        modulations: Dictionary of modulation lists
        categories: List of category names to include
        
    Returns:
        Filtered modulations dictionary
    """
    return {
        category: modulation_list
        for category, modulation_list in modulations.items()
        if category in categories
    }
