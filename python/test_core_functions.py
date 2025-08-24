"""
Simple test suite for core Python functions without complex model dependencies.

This module tests the fundamental mathematical and conversion functions.
"""

import sys
import os
import math

# Direct imports to avoid circular import issues
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def test_core_functions():
    """Test core functions individually to avoid import issues."""
    print("🎵 Testing core Python functions for Arabic maqam analysis...")
    print("=" * 60)
    
    # Test GCD function
    print("Testing GCD function...")
    try:
        from python.functions.gcd import gcd
        
        # Test integer GCD
        assert gcd(12, 8) == 4, "GCD of 12 and 8 should be 4"
        assert gcd(15, 25) == 5, "GCD of 15 and 25 should be 5"
        assert gcd(7, 13) == 1, "GCD of 7 and 13 should be 1 (coprime)"
        
        # Test floating-point GCD
        result = gcd(1.5, 2.5)
        assert abs(result - 0.5) < 0.001, f"GCD of 1.5 and 2.5 should be ~0.5, got {result}"
        
        print("✅ GCD tests passed!")
    except Exception as e:
        print(f"❌ GCD test failed: {e}")
        return False
    
    # Test fraction calculations
    print("Testing fraction calculations...")
    try:
        from python.functions.compute_fraction_interval import (
            compute_fraction_interval, fraction_to_decimal, decimal_to_fraction, simplify_fraction
        )
        
        # Test basic interval computation
        interval = compute_fraction_interval("3/2", "4/3")
        assert interval == "8/9", f"Expected 8/9, got {interval}"
        
        # Test fraction to decimal conversion
        decimal = fraction_to_decimal("3/2")
        assert abs(decimal - 1.5) < 0.001, f"Expected 1.5, got {decimal}"
        
        # Test decimal to fraction conversion
        fraction = decimal_to_fraction(1.5)
        assert fraction == "3/2", f"Expected 3/2, got {fraction}"
        
        # Test fraction simplification
        simplified = simplify_fraction("6/9")
        assert simplified == "2/3", f"Expected 2/3, got {simplified}"
        
        print("✅ Fraction calculation tests passed!")
    except Exception as e:
        print(f"❌ Fraction calculation test failed: {e}")
        return False
    
    # Test pitch class detection
    print("Testing pitch class type detection...")
    try:
        from python.functions.detect_pitch_class_type import (
            detect_pitch_class_type, is_fraction_format, is_valid_cents_value, 
            is_valid_midi_note, is_valid_decimal_ratio
        )
        
        # Test fraction detection
        assert detect_pitch_class_type("3/2") == "fraction"
        assert detect_pitch_class_type("5/4") == "fraction"
        
        # Test cents detection
        assert detect_pitch_class_type(702.0) == "cents"
        assert detect_pitch_class_type(1200) == "cents"
        
        # Test decimal detection
        assert detect_pitch_class_type(1.5) == "decimal"
        assert detect_pitch_class_type(2.0) == "decimal"
        
        # Test MIDI detection
        assert detect_pitch_class_type(60) == "midi"
        assert detect_pitch_class_type(69) == "midi"
        
        # Test validation functions
        assert is_fraction_format("3/2") == True
        assert is_fraction_format("1.5") == False
        assert is_valid_cents_value(702.0) == True
        assert is_valid_midi_note(60) == True
        assert is_valid_decimal_ratio(1.5) == True
        
        print("✅ Pitch class detection tests passed!")
    except Exception as e:
        print(f"❌ Pitch class detection test failed: {e}")
        return False
    
    # Test pitch class conversion
    print("Testing pitch class conversions...")
    try:
        from python.functions.convert_pitch_class import (
            convert_pitch_class, fraction_to_cents, cents_to_fraction,
            decimal_to_cents, cents_to_decimal
        )
        
        # Test fraction to cents
        cents = fraction_to_cents("3/2")
        expected_cents = 1200 * math.log2(1.5)  # Should be ~701.955
        assert abs(cents - expected_cents) < 0.01, f"Expected ~{expected_cents}, got {cents}"
        
        # Test cents to fraction
        fraction = cents_to_fraction(702.0)
        assert fraction == "3/2", f"Expected 3/2, got {fraction}"
        
        # Test decimal to cents
        cents = decimal_to_cents(2.0)
        assert abs(cents - 1200.0) < 0.01, f"Expected 1200.0, got {cents}"
        
        # Test cents to decimal
        decimal = cents_to_decimal(1200.0)
        assert abs(decimal - 2.0) < 0.01, f"Expected 2.0, got {decimal}"
        
        # Test comprehensive conversion
        result = convert_pitch_class("3/2", "cents")
        assert abs(result - 701.955) < 0.01, f"Expected ~701.955, got {result}"
        
        result = convert_pitch_class(702.0, "fraction")
        assert result == "3/2", f"Expected 3/2, got {result}"
        
        print("✅ Pitch class conversion tests passed!")
    except Exception as e:
        print(f"❌ Pitch class conversion test failed: {e}")
        return False
    
    # Test cents deviation
    print("Testing cents deviation calculations...")
    try:
        from python.functions.calculate_cents_deviation import (
            calculate_cents_deviation, calculate_interval_deviation,
            get_just_intonation_deviations, is_microtonal
        )
        
        # Test perfect fifth deviation (3/2 is slightly sharp in 12-TET)
        deviation = calculate_cents_deviation("3/2")
        expected_deviation = 701.955 - 700  # Should be ~1.955 cents sharp
        assert abs(deviation - expected_deviation) < 0.01, f"Expected ~{expected_deviation}, got {deviation}"
        
        # Test major third deviation (5/4 is flat in 12-TET)
        deviation = calculate_cents_deviation("5/4")
        expected_deviation = 386.314 - 400  # Should be ~-13.686 cents flat
        assert abs(deviation - expected_deviation) < 0.01, f"Expected ~{expected_deviation}, got {deviation}"
        
        # Test interval deviation stats
        stats = calculate_interval_deviation("3/2")
        assert "deviation_cents" in stats
        assert "nearest_semitones" in stats
        assert stats["nearest_semitones"] == 7  # Perfect fifth is 7 semitones
        
        # Test just intonation deviations
        ji_deviations = get_just_intonation_deviations()
        assert "perfect_fifth" in ji_deviations
        assert "major_third" in ji_deviations
        
        # Test microtonal detection
        assert is_microtonal("3/2") == False  # Close to 12-TET
        assert is_microtonal("11/8") == True  # Clearly microtonal
        
        print("✅ Cents deviation tests passed!")
    except Exception as e:
        print(f"❌ Cents deviation test failed: {e}")
        return False
    
    # Test basic transposition (without model dependencies)
    print("Testing basic transposition functions...")
    try:
        from python.functions.transpose import (
            transpose_interval, transpose_pitch_class_list, calculate_transposition_interval,
            transpose_to_octave_range, create_transposition_matrix
        )
        
        # Test basic interval transposition
        result = transpose_interval("3/2", "9/8")  # Perfect fifth up by major second
        assert result == "27/16", f"Expected 27/16, got {result}"
        
        # Test pitch class list transposition
        original = ["1/1", "9/8", "5/4"]
        transposed = transpose_pitch_class_list(original, "9/8")
        expected = ["9/8", "81/64", "45/32"]
        assert transposed == expected, f"Expected {expected}, got {transposed}"
        
        # Test transposition interval calculation
        interval = calculate_transposition_interval("1/1", "3/2")
        assert interval == "3/2", f"Expected 3/2, got {interval}"
        
        # Test octave range reduction
        reduced = transpose_to_octave_range("9/4")  # Ninth -> Second
        assert reduced == "9/8", f"Expected 9/8, got {reduced}"
        
        # Test transposition matrix
        intervals = ["1/1", "9/8"]
        transpositions = ["1/1", "9/8"]
        matrix = create_transposition_matrix(intervals, transpositions)
        assert len(matrix) == 2, "Matrix should have 2 rows"
        assert len(matrix[0]) == 2, "Each row should have 2 elements"
        assert matrix[1][0] == "9/8", "Second row first element should be 9/8"
        
        print("✅ Basic transposition tests passed!")
    except Exception as e:
        print(f"❌ Basic transposition test failed: {e}")
        return False
    
    # Performance test
    print("Running performance test...")
    try:
        import time
        
        # Test conversion performance
        start_time = time.time()
        for i in range(1000):
            convert_pitch_class("3/2", "cents")
            convert_pitch_class("5/4", "decimal")
            calculate_cents_deviation("3/2")
        end_time = time.time()
        
        total_time = end_time - start_time
        operations_per_second = 3000 / total_time
        
        print(f"Performance: {operations_per_second:.0f} operations/second")
        print("✅ Performance test completed!")
    except Exception as e:
        print(f"⚠️  Performance test failed: {e}")
    
    # Integration test
    print("Running integration test...")
    try:
        # Test a complete workflow: analyze a just intonation scale
        just_major_scale = ["1/1", "9/8", "5/4", "4/3", "3/2", "5/3", "15/8", "2/1"]
        
        # Convert all to cents
        scale_in_cents = [convert_pitch_class(ratio, "cents") for ratio in just_major_scale]
        assert len(scale_in_cents) == 8, "Should have 8 notes in cents"
        
        # Calculate deviations for the whole scale
        from python.functions.calculate_cents_deviation import calculate_scale_deviations, analyze_tuning_system_deviations
        scale_deviations = calculate_scale_deviations(just_major_scale)
        assert len(scale_deviations) == 8, "Should have deviations for 8 notes"
        
        # Transpose the scale
        transposed_scale = transpose_pitch_class_list(just_major_scale, "9/8")
        assert len(transposed_scale) == 8, "Transposed scale should have 8 notes"
        
        # Analyze the system
        analysis = analyze_tuning_system_deviations(just_major_scale, "Just Major")
        assert analysis["system_name"] == "Just Major"
        assert analysis["num_notes"] == 8
        assert analysis["max_deviation"] > 0, "Should have some deviation from 12-TET"
        
        print("✅ Integration test passed!")
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False
    
    print("=" * 60)
    print("✅ All core function tests completed successfully! 🎉")
    print("The Python functions package is working correctly!")
    
    return True


if __name__ == "__main__":
    success = test_core_functions()
    sys.exit(0 if success else 1)
