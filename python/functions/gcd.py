"""
Greatest Common Divisor calculation using the Euclidean algorithm.

This function is essential for simplifying fractions throughout the maqam analysis system.
"""

import math


def gcd(a: float, b: float) -> float:
    """
    Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.

    This function is essential for simplifying fractions throughout the maqam analysis system.
    It uses the Euclidean algorithm with floating-point precision handling to ensure
    accurate results even with small decimal numbers.

    The Euclidean algorithm works by repeatedly replacing the larger number with the
    remainder of the division until one number becomes effectively zero.

    Args:
        a: First number (will be converted to absolute value)
        b: Second number (will be converted to absolute value)

    Returns:
        The Greatest Common Divisor of a and b

    Examples:
        >>> gcd(12, 8)
        4.0
        
        >>> gcd(15, 25)
        5.0
        
        >>> gcd(17, 13)
        1.0
    """
    # Convert to absolute values to handle negative numbers
    a = abs(a)
    b = abs(b)

    # Epsilon for floating-point comparison - handles precision issues
    EPS = 1e-10

    # Apply Euclidean algorithm
    # Continue until b becomes effectively zero (within epsilon tolerance)
    while b > EPS:
        t = a % b  # Calculate remainder
        a = b      # Replace a with b
        b = t      # Replace b with remainder

    # Return the GCD (stored in a)
    return a


# For convenience, also provide the standard library version for integer inputs
def gcd_int(a: int, b: int) -> int:
    """
    Integer version of GCD using Python's built-in math.gcd.
    
    Args:
        a: First integer
        b: Second integer
        
    Returns:
        The Greatest Common Divisor of a and b as an integer
    """
    return math.gcd(a, b)
