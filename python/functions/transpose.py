"""
Transposition algorithms for Arabic maqam music theory.

This module provides functions for transposing intervals, ajnas (melodic fragments),
and complete maqamat. It handles both pitch class and frequency-based transpositions.
"""

import math
from typing import List, Dict, Any, Union, Optional
from ..models.jins import Jins, JinsData
from ..models.maqam import Maqam, MaqamData
from ..models.pitch_class import PitchClass
from .convert_pitch_class import convert_pitch_class, decimal_to_cents
from .compute_fraction_interval import compute_fraction_interval


def transpose_interval(
    interval: Union[str, float, int],
    transposition: Union[str, float, int],
    result_format: str = "auto"
) -> Union[str, float, int]:
    """
    Transposes a musical interval by a given transposition amount.
    
    This function multiplies two intervals together, which is equivalent
    to transposing one interval by another in musical terms.
    
    Args:
        interval: The interval to transpose
        transposition: The transposition amount
        result_format: Output format ("auto", "fraction", "cents", "decimal", "midi")
        
    Returns:
        The transposed interval in the specified format
        
    Examples:
        >>> transpose_interval("3/2", "9/8")  # Perfect fifth up by major second
        "27/16"
        >>> transpose_interval(702.0, 204.0)  # Same in cents
        906.0
    """
    # Convert both to decimal ratios for calculation
    interval_decimal = convert_pitch_class(interval, "decimal")
    transposition_decimal = convert_pitch_class(transposition, "decimal")
    
    # Multiply the ratios (equivalent to adding intervals)
    result_decimal = interval_decimal * transposition_decimal
    
    # Determine output format
    if result_format == "auto":
        # Try to preserve the input format
        from .detect_pitch_class_type import detect_pitch_class_type
        result_format = detect_pitch_class_type(interval)
    
    # Convert to the desired format
    return convert_pitch_class(result_decimal, result_format)


def transpose_pitch_class_list(
    pitch_classes: List[Union[str, float, int]],
    transposition: Union[str, float, int],
    result_format: str = "auto"
) -> List[Union[str, float, int]]:
    """
    Transposes a list of pitch classes by a given amount.
    
    Args:
        pitch_classes: List of pitch classes to transpose
        transposition: The transposition amount
        result_format: Output format for all pitch classes
        
    Returns:
        List of transposed pitch classes
        
    Examples:
        >>> transpose_pitch_class_list(["1/1", "9/8", "5/4"], "9/8")
        ["9/8", "81/64", "45/32"]
    """
    transposed = []
    for pc in pitch_classes:
        transposed_pc = transpose_interval(pc, transposition, result_format)
        transposed.append(transposed_pc)
    
    return transposed


def transpose_jins(
    jins: Union[Jins, JinsData, Dict[str, Any]],
    transposition: Union[str, float, int],
    new_root: Optional[str] = None
) -> Union[Jins, Dict[str, Any]]:
    """
    Transposes a jins (melodic fragment) to a new pitch level.
    
    Args:
        jins: The jins to transpose (Jins object, JinsData, or dictionary)
        transposition: The transposition interval
        new_root: Optional new root note name
        
    Returns:
        New transposed jins object or dictionary
        
    Examples:
        >>> jins_data = {"intervals": ["1/1", "9/8", "5/4"], "root": "C"}
        >>> transposed = transpose_jins(jins_data, "9/8", "D")
        >>> transposed["intervals"]
        ["9/8", "81/64", "45/32"]
    """
    # Handle different input types
    if isinstance(jins, Jins):
        intervals = jins.intervals
        root = jins.root if hasattr(jins, 'root') else None
        name = jins.name if hasattr(jins, 'name') else "Transposed Jins"
        is_jins_object = True
    elif isinstance(jins, JinsData):
        intervals = jins.intervals
        root = getattr(jins, 'root', None)
        name = jins.name
        is_jins_object = False
    else:  # Dictionary
        intervals = jins.get("intervals", [])
        root = jins.get("root")
        name = jins.get("name", "Transposed Jins")
        is_jins_object = False
    
    # Transpose the intervals
    transposed_intervals = transpose_pitch_class_list(intervals, transposition)
    
    # Create the result
    if is_jins_object:
        # Return a new Jins object
        transposed_jins_data = JinsData(
            name=f"{name} (transposed)",
            intervals=transposed_intervals
        )
        return Jins(transposed_jins_data, new_root or root)
    else:
        # Return a dictionary
        result = {
            "name": f"{name} (transposed)",
            "intervals": transposed_intervals
        }
        if new_root or root:
            result["root"] = new_root or root
        return result


def transpose_maqam(
    maqam: Union[Maqam, MaqamData, Dict[str, Any]],
    transposition: Union[str, float, int],
    new_tonic: Optional[str] = None
) -> Union[Maqam, Dict[str, Any]]:
    """
    Transposes a complete maqam to a new pitch level.
    
    Args:
        maqam: The maqam to transpose
        transposition: The transposition interval
        new_tonic: Optional new tonic note name
        
    Returns:
        New transposed maqam object or dictionary
    """
    # Handle different input types
    if isinstance(maqam, Maqam):
        scale_intervals = maqam.scale_intervals
        tonic = maqam.tonic if hasattr(maqam, 'tonic') else None
        name = maqam.name if hasattr(maqam, 'name') else "Transposed Maqam"
        is_maqam_object = True
    elif isinstance(maqam, MaqamData):
        scale_intervals = maqam.scale_intervals
        tonic = getattr(maqam, 'tonic', None)
        name = maqam.name
        is_maqam_object = False
    else:  # Dictionary
        scale_intervals = maqam.get("scale_intervals", [])
        tonic = maqam.get("tonic")
        name = maqam.get("name", "Transposed Maqam")
        is_maqam_object = False
    
    # Transpose the scale intervals
    transposed_scale = transpose_pitch_class_list(scale_intervals, transposition)
    
    # Create the result
    if is_maqam_object:
        # Return a new Maqam object
        transposed_maqam_data = MaqamData(
            name=f"{name} (transposed)",
            scale_intervals=transposed_scale
        )
        return Maqam(transposed_maqam_data, new_tonic or tonic)
    else:
        # Return a dictionary
        result = {
            "name": f"{name} (transposed)",
            "scale_intervals": transposed_scale
        }
        if new_tonic or tonic:
            result["tonic"] = new_tonic or tonic
        return result


def calculate_transposition_interval(
    from_pitch: Union[str, float, int],
    to_pitch: Union[str, float, int],
    result_format: str = "fraction"
) -> Union[str, float, int]:
    """
    Calculates the interval needed to transpose from one pitch to another.
    
    Args:
        from_pitch: The starting pitch
        to_pitch: The target pitch
        result_format: Format for the result
        
    Returns:
        The transposition interval needed
        
    Examples:
        >>> calculate_transposition_interval("1/1", "3/2")
        "3/2"
        >>> calculate_transposition_interval("C", "G")  # If pitch names supported
        "3/2"
    """
    # Convert both to decimal ratios
    from_decimal = convert_pitch_class(from_pitch, "decimal")
    to_decimal = convert_pitch_class(to_pitch, "decimal")
    
    # Calculate the ratio
    interval_decimal = to_decimal / from_decimal
    
    # Convert to desired format
    return convert_pitch_class(interval_decimal, result_format)


def transpose_to_octave_range(
    pitch_class: Union[str, float, int],
    octave_ratio: Union[str, float, int] = "2/1",
    result_format: str = "auto"
) -> Union[str, float, int]:
    """
    Transposes a pitch class to fall within one octave (1:1 to 2:1 by default).
    
    This function reduces or expands intervals to their basic form within
    one octave by adding or subtracting octaves as needed.
    
    Args:
        pitch_class: The pitch class to normalize
        octave_ratio: The octave ratio (default: "2/1")
        result_format: Output format
        
    Returns:
        The pitch class reduced to one octave
        
    Examples:
        >>> transpose_to_octave_range("9/4")  # Ninth -> Second
        "9/8"
        >>> transpose_to_octave_range("1/4")  # Sub-octave -> within octave
        "1/2"
    """
    # Convert to decimal for calculation
    pc_decimal = convert_pitch_class(pitch_class, "decimal")
    octave_decimal = convert_pitch_class(octave_ratio, "decimal")
    
    # Reduce to octave range [1, octave_ratio)
    while pc_decimal >= octave_decimal:
        pc_decimal /= octave_decimal
    
    while pc_decimal < 1.0:
        pc_decimal *= octave_decimal
    
    # Determine output format
    if result_format == "auto":
        from .detect_pitch_class_type import detect_pitch_class_type
        result_format = detect_pitch_class_type(pitch_class)
    
    return convert_pitch_class(pc_decimal, result_format)


def create_transposition_matrix(
    intervals: List[Union[str, float, int]],
    transpositions: List[Union[str, float, int]]
) -> List[List[Union[str, float, int]]]:
    """
    Creates a matrix of all possible transpositions of given intervals.
    
    This is useful for analyzing all possible transpositions of a jins
    or scale across different pitch levels.
    
    Args:
        intervals: List of intervals to transpose
        transpositions: List of transposition amounts
        
    Returns:
        Matrix where each row represents one transposition level
        
    Examples:
        >>> intervals = ["1/1", "9/8", "5/4"]
        >>> transpositions = ["1/1", "9/8"]
        >>> matrix = create_transposition_matrix(intervals, transpositions)
        >>> matrix[1]  # Second row (transposed by 9/8)
        ["9/8", "81/64", "45/32"]
    """
    matrix = []
    
    for transposition in transpositions:
        transposed_row = transpose_pitch_class_list(intervals, transposition)
        matrix.append(transposed_row)
    
    return matrix


def find_common_transpositions(
    source_intervals: List[Union[str, float, int]],
    target_intervals: List[Union[str, float, int]],
    tolerance_cents: float = 10.0
) -> List[Dict[str, Any]]:
    """
    Finds transpositions that would make source intervals match target intervals.
    
    This function is useful for finding modulation possibilities between
    different ajnas or maqamat.
    
    Args:
        source_intervals: The source interval collection
        target_intervals: The target interval collection  
        tolerance_cents: Tolerance for matching intervals
        
    Returns:
        List of possible transpositions with match information
    """
    possible_transpositions = []
    
    # Try each source interval as a potential match for each target interval
    for i, source_interval in enumerate(source_intervals):
        for j, target_interval in enumerate(target_intervals):
            # Calculate the required transposition
            transposition = calculate_transposition_interval(
                source_interval, target_interval, "decimal"
            )
            
            # Test how many intervals would match with this transposition
            matches = 0
            total_tested = 0
            
            for k, src_int in enumerate(source_intervals):
                transposed = transpose_interval(src_int, transposition, "cents")
                
                # Check if this transposed interval matches any target interval
                for tgt_int in target_intervals:
                    tgt_cents = convert_pitch_class(tgt_int, "cents")
                    if abs(transposed - tgt_cents) <= tolerance_cents:
                        matches += 1
                        break
                
                total_tested += 1
            
            # Record this transposition if it has good matches
            match_percentage = (matches / total_tested) * 100 if total_tested > 0 else 0
            
            if matches > 0:  # Only record if there are some matches
                possible_transpositions.append({
                    'transposition': convert_pitch_class(transposition, "fraction"),
                    'transposition_cents': convert_pitch_class(transposition, "cents"),
                    'matches': matches,
                    'total_intervals': total_tested,
                    'match_percentage': match_percentage,
                    'source_index': i,
                    'target_index': j
                })
    
    # Sort by match percentage (best matches first)
    possible_transpositions.sort(key=lambda x: x['match_percentage'], reverse=True)
    
    return possible_transpositions


# Helper functions for transposition analysis

def get_pitch_class_intervals(pitch_classes: List[PitchClass]) -> List[Dict[str, float]]:
    """
    Calculate intervals between consecutive pitch classes.
    
    Args:
        pitch_classes: List of consecutive pitch classes
        
    Returns:
        List of interval dictionaries containing cents and decimal ratio
    """
    from ..models.pitch_class import calculate_interval
    
    intervals = []
    for i in range(1, len(pitch_classes)):
        interval = calculate_interval(pitch_classes[i-1], pitch_classes[i])
        intervals.append(interval)
    
    return intervals


def get_pitch_class_transpositions(
    input_pitch_classes: List[PitchClass],
    pitch_class_intervals: List[Dict[str, float]],
    ascending: bool,
    use_ratio: bool,
    cents_tolerance: float
) -> List[List[PitchClass]]:
    """
    Find all possible transpositions of an interval pattern within available pitch classes.
    
    Universal algorithm for both jins and maqam transposition analysis.
    
    Args:
        input_pitch_classes: Available pitch classes to search within
        pitch_class_intervals: Target interval pattern to match
        ascending: Search direction (True = ascending, False = descending)
        use_ratio: Matching mode (True = exact ratios, False = cents with tolerance)
        cents_tolerance: Tolerance in cents for fuzzy matching
        
    Returns:
        Array of pitch class sequences that match the interval pattern
    """
    from ..models.pitch_class import calculate_interval
    
    # Determine search direction
    all_pitch_classes = input_pitch_classes if ascending else list(reversed(input_pitch_classes))
    sequences = []
    
    def build_sequences(pitch_classes: List[PitchClass], cell_index: int, interval_index: int):
        """Recursive sequence builder - core algorithm."""
        # Base case: complete sequence found
        if interval_index == len(pitch_class_intervals):
            sequences.append(pitch_classes.copy())
            return
        
        last_cell = pitch_classes[-1]
        
        # Search for next matching pitch class
        for i in range(cell_index, len(all_pitch_classes)):
            candidate_cell = all_pitch_classes[i]
            cell_interval = pitch_class_intervals[interval_index]
            computed_interval = calculate_interval(last_cell, candidate_cell)
            
            if use_ratio:
                # Exact ratio matching
                comp = computed_interval['decimal_ratio']
                target = cell_interval['decimal_ratio']
                
                if comp == target:
                    build_sequences(pitch_classes + [candidate_cell], i + 1, interval_index + 1)
                    break
                elif (ascending and comp > target) or (not ascending and comp < target):
                    break
            else:
                # Fuzzy cents matching
                if abs(computed_interval['cents'] - cell_interval['cents']) <= cents_tolerance:
                    build_sequences(pitch_classes + [candidate_cell], i + 1, interval_index + 1)
                    break
                elif abs(cell_interval['cents']) + cents_tolerance < abs(computed_interval['cents']):
                    break
    
    # Try every pitch class as starting point
    for i in range(len(all_pitch_classes)):
        starting_cell = all_pitch_classes[i]
        build_sequences([starting_cell], i + 1, 0)
    
    # Filter by octave range (0-3)
    filtered_sequences = []
    for sequence in sequences:
        if ascending:
            oct = sequence[0].octave
        else:
            oct = sequence[-1].octave
        
        if 0 <= oct <= 3:
            filtered_sequences.append(sequence)
    
    return filtered_sequences


def merge_sequences(
    ascending_sequences: List[List[PitchClass]],
    descending_sequences: List[List[PitchClass]]
) -> List[Dict[str, List[PitchClass]]]:
    """
    Merge ascending and descending sequences for maqam transposition.
    
    Pairs ascending sequences (starting from tonic) with descending sequences
    (ending on tonic) that share the same note name.
    
    Args:
        ascending_sequences: Array of ascending maqam sequences
        descending_sequences: Array of descending maqam sequences
        
    Returns:
        Array of paired ascending/descending sequence combinations
    """
    filtered_sequences = []
    
    for asc_seq in ascending_sequences:
        asc_note_name = asc_seq[0].note_name
        
        # Find matching descending sequence
        desc_seq = None
        for desc in descending_sequences:
            desc_note_name = desc[-1].note_name
            if asc_note_name == desc_note_name:
                desc_seq = desc
                break
        
        if desc_seq:
            filtered_sequences.append({
                'ascending_sequence': asc_seq,
                'descending_sequence': desc_seq
            })
    
    return filtered_sequences


def matching_list_of_intervals(
    intervals_a: List[Dict[str, float]],
    intervals_b: List[Dict[str, float]],
    cents_tolerance: float
) -> bool:
    """
    Check if two interval lists match within tolerance.
    
    Args:
        intervals_a: First interval list
        intervals_b: Second interval list
        cents_tolerance: Tolerance for matching in cents
        
    Returns:
        True if intervals match within tolerance
    """
    if len(intervals_a) != len(intervals_b):
        return False
    
    for int_a, int_b in zip(intervals_a, intervals_b):
        if abs(int_a['cents'] - int_b['cents']) > cents_tolerance:
            return False
    
    return True


def get_maqam_transpositions(
    all_pitch_classes: List[PitchClass],
    all_ajnas: List[JinsData],
    maqam_data: Optional[MaqamData],
    with_tahlil: bool,
    cents_tolerance: float = 5.0,
    only_octave_one: bool = False
) -> List[Maqam]:
    """
    Find all possible transpositions of a maqam within available pitch classes.
    
    This function implements comprehensive maqam transposition analysis following
    traditional Arabic music theory principles. It analyzes both ascending and
    descending sequences and identifies constituent ajnas within each transposition.
    
    Args:
        all_pitch_classes: Complete tuning system to search within
        all_ajnas: All available jins data for pattern matching
        maqam_data: Source maqam data to find transpositions for
        with_tahlil: Include original analytical position in results
        cents_tolerance: Tolerance for interval matching (default: ±5 cents JND)
        only_octave_one: Restrict search to first octave only
        
    Returns:
        Array of all possible maqam transpositions with constituent ajnas
    """
    if not all_pitch_classes or not maqam_data:
        return []
    
    ascending_note_names = maqam_data.get_ascending_note_names()
    descending_note_names = maqam_data.get_descending_note_names()
    
    if len(ascending_note_names) < 2 or len(descending_note_names) < 2:
        return []
    
    # Filter pitch classes for maqam pattern
    ascending_maqam_cells = [pc for pc in all_pitch_classes 
                           if pc.note_name in ascending_note_names]
    descending_maqam_cells = [pc for pc in all_pitch_classes 
                            if pc.note_name in descending_note_names]
    descending_maqam_cells.reverse()
    
    if not ascending_maqam_cells or not descending_maqam_cells:
        return []
    
    # Determine value type for ratio/cents matching
    value_type = all_pitch_classes[0].original_value_type
    use_ratio = value_type in ["fraction", "decimalRatio"]
    
    # Get interval patterns
    ascending_interval_pattern = get_pitch_class_intervals(ascending_maqam_cells)
    descending_interval_pattern = get_pitch_class_intervals(descending_maqam_cells)
    
    # Find all transposition sequences
    ascending_sequences = get_pitch_class_transpositions(
        all_pitch_classes, ascending_interval_pattern, True, use_ratio, cents_tolerance
    )
    
    if only_octave_one:
        ascending_sequences = [seq for seq in ascending_sequences if seq[0].octave == 1]
    
    descending_sequences = get_pitch_class_transpositions(
        all_pitch_classes, descending_interval_pattern, False, use_ratio, cents_tolerance
    )
    
    # Prepare ajnas intervals for pattern matching
    ajnas_intervals = []
    for jins in all_ajnas:
        jins_cells = [pc for pc in all_pitch_classes 
                     if pc.note_name in jins.get_note_names()]
        if len(jins_cells) == len(jins.get_note_names()):
            jins_interval_pattern = get_pitch_class_intervals(jins_cells)
            ajnas_intervals.append({
                'jins': jins,
                'intervals': jins_interval_pattern
            })
    
    # Generate maqam transpositions
    maqam_transpositions = []
    sequence_pairs = merge_sequences(ascending_sequences, descending_sequences)
    
    for pair in sequence_pairs:
        ascending_pitch_classes = pair['ascending_sequence']
        
        # Calculate slice index for octave extension
        slice_index = 0
        if ascending_pitch_classes:
            last_ascending = ascending_pitch_classes[-1]
            for i, pc in enumerate(ascending_pitch_classes):
                if float(pc.frequency) * 2 < float(last_ascending.frequency):
                    slice_index = i + 1
        
        if slice_index == 0:
            slice_index = -1
        
        # Extended sequences for ajnas analysis
        from .shift_pitch_class import shift_pitch_class
        extended_ascending = ascending_pitch_classes.copy()
        if slice_index > -1:
            extended_ascending.extend([
                shift_pitch_class(all_pitch_classes, pc, 1)
                for pc in ascending_pitch_classes[slice_index + 1:]
            ])
        
        descending_pitch_classes = list(reversed(pair['descending_sequence']))
        extended_descending = descending_pitch_classes.copy()
        if slice_index > -1:
            extended_descending.extend([
                shift_pitch_class(all_pitch_classes, pc, 1)
                for pc in descending_pitch_classes[slice_index + 1:]
            ])
        
        # Analyze constituent ajnas
        ascending_maqam_ajnas = []
        descending_maqam_ajnas = []
        
        if all_ajnas:
            extended_ascending_intervals = get_pitch_class_intervals(extended_ascending)
            extended_descending_intervals = get_pitch_class_intervals(extended_descending)
            
            # Find ajnas in ascending sequence
            for i in range(len(extended_ascending_intervals)):
                found = False
                for jins_interval in ajnas_intervals:
                    length = len(jins_interval['intervals'])
                    if i + length <= len(extended_ascending_intervals):
                        if matching_list_of_intervals(
                            extended_ascending_intervals[i:i + length],
                            jins_interval['intervals'],
                            cents_tolerance
                        ):
                            jins = jins_interval['jins']
                            first_jins_note = jins.get_note_names()[0]
                            first_cell = extended_ascending[i]
                            
                            jins_transposition = Jins(
                                jins_id=jins.get_id(),
                                name=f"{jins.get_name()} al-{first_cell.note_name}",
                                transposition=first_jins_note != first_cell.note_name,
                                jins_pitch_classes=extended_ascending[i:i + length + 1],
                                jins_pitch_class_intervals=extended_ascending_intervals[i:i + length]
                            )
                            ascending_maqam_ajnas.append(jins_transposition)
                            found = True
                            break
                
                if not found:
                    ascending_maqam_ajnas.append(None)
                if len(ascending_maqam_ajnas) - 1 == len(get_pitch_class_intervals(ascending_pitch_classes)):
                    break
            
            # Find ajnas in descending sequence  
            for i in range(len(extended_descending_intervals)):
                found = False
                for jins_interval in ajnas_intervals:
                    length = len(jins_interval['intervals'])
                    if i + length <= len(extended_descending_intervals):
                        if matching_list_of_intervals(
                            extended_descending_intervals[i:i + length],
                            jins_interval['intervals'],
                            cents_tolerance
                        ):
                            jins = jins_interval['jins']
                            first_jins_note = jins.get_note_names()[0]
                            first_cell = extended_descending[i]
                            
                            jins_transposition = Jins(
                                jins_id=jins.get_id(),
                                name=f"{jins.get_name()} al-{first_cell.note_name}",
                                transposition=first_jins_note != first_cell.note_name,
                                jins_pitch_classes=extended_descending[i:i + length + 1],
                                jins_pitch_class_intervals=extended_descending_intervals[i:i + length]
                            )
                            descending_maqam_ajnas.append(jins_transposition)
                            found = True
                            break
                
                if not found:
                    descending_maqam_ajnas.append(None)
                if len(descending_maqam_ajnas) - 1 == len(get_pitch_class_intervals(descending_pitch_classes)):
                    break
        
        maqam_transposition = Maqam(
            maqam_id=maqam_data.get_id(),
            name=f"{maqam_data.get_name()} al-{ascending_pitch_classes[0].note_name}",
            transposition=True,
            ascending_pitch_classes=ascending_pitch_classes,
            ascending_pitch_class_intervals=get_pitch_class_intervals(ascending_pitch_classes),
            ascending_maqam_ajnas=ascending_maqam_ajnas,
            descending_pitch_classes=list(reversed(descending_pitch_classes)),
            descending_pitch_class_intervals=list(reversed(get_pitch_class_intervals(descending_pitch_classes))),
            descending_maqam_ajnas=list(reversed(descending_maqam_ajnas))
        )
        maqam_transpositions.append(maqam_transposition)
    
    # Handle tahlil transposition
    tahlil_transposition = None
    for trans in maqam_transpositions:
        if trans.ascending_pitch_classes[0].note_name == ascending_note_names[0]:
            tahlil_transposition = trans
            break
    
    maqam_transpositions_without_tahlil = [t for t in maqam_transpositions if t != tahlil_transposition]
    
    if with_tahlil and tahlil_transposition:
        tahlil_copy = Maqam(
            maqam_id=tahlil_transposition.maqam_id,
            name=tahlil_transposition.name,
            transposition=False,
            ascending_pitch_classes=tahlil_transposition.ascending_pitch_classes,
            ascending_pitch_class_intervals=tahlil_transposition.ascending_pitch_class_intervals,
            ascending_maqam_ajnas=tahlil_transposition.ascending_maqam_ajnas,
            descending_pitch_classes=tahlil_transposition.descending_pitch_classes,
            descending_pitch_class_intervals=tahlil_transposition.descending_pitch_class_intervals,
            descending_maqam_ajnas=tahlil_transposition.descending_maqam_ajnas
        )
        return [tahlil_copy] + maqam_transpositions_without_tahlil
    else:
        return maqam_transpositions_without_tahlil


def get_jins_transpositions(
    all_pitch_classes: List[PitchClass],
    jins_data: Optional[JinsData],
    with_tahlil: bool,
    cents_tolerance: float = 5.0,
    only_octave_one: bool = False
) -> List[Jins]:
    """
    Find all possible transpositions of a jins within available pitch classes.
    
    This function analyzes a jins interval pattern and systematically searches for
    all valid starting positions where the complete sequence can be realized within
    the tuning system, following traditional Arabic nomenclature.
    
    Args:
        all_pitch_classes: Complete tuning system to search within
        jins_data: Source jins data to find transpositions for
        with_tahlil: Include original analytical position in results
        cents_tolerance: Tolerance for interval matching (default: ±5 cents JND)
        only_octave_one: Restrict search to first octave only
        
    Returns:
        Array of all possible jins transpositions following traditional naming
    """
    if not all_pitch_classes or not jins_data:
        return []
    
    jins_note_names = jins_data.get_note_names()
    
    if len(jins_note_names) < 2:
        return []
    
    jins_cells = [pc for pc in all_pitch_classes 
                 if pc.note_name in jins_note_names]
    
    if not jins_cells:
        return []
    
    value_type = jins_cells[0].original_value_type
    use_ratio = value_type in ["fraction", "decimalRatio"]
    
    interval_pattern = get_pitch_class_intervals(jins_cells)
    
    # Find all transposition sequences
    sequences = get_pitch_class_transpositions(
        all_pitch_classes, interval_pattern, True, use_ratio, cents_tolerance
    )
    
    if only_octave_one:
        sequences = [seq for seq in sequences if seq[0].octave == 1]
    
    jins_transpositions = []
    for sequence in sequences:
        jins_transposition = Jins(
            jins_id=jins_data.get_id(),
            name=f"{jins_data.get_name()} al-{sequence[0].note_name}",
            transposition=True,
            jins_pitch_classes=sequence,
            jins_pitch_class_intervals=get_pitch_class_intervals(sequence)
        )
        jins_transpositions.append(jins_transposition)
    
    # Handle tahlil transposition
    tahlil_transposition = None
    for trans in jins_transpositions:
        if trans.jins_pitch_classes[0].note_name == jins_note_names[0]:
            tahlil_transposition = trans
            break
    
    jins_transpositions_without_tahlil = [t for t in jins_transpositions if t != tahlil_transposition]
    
    if with_tahlil and tahlil_transposition:
        tahlil_copy = Jins(
            jins_id=tahlil_transposition.jins_id,
            name=tahlil_transposition.name,
            transposition=False,
            jins_pitch_classes=tahlil_transposition.jins_pitch_classes,
            jins_pitch_class_intervals=tahlil_transposition.jins_pitch_class_intervals
        )
        return [tahlil_copy] + jins_transpositions_without_tahlil
    else:
        return jins_transpositions_without_tahlil
