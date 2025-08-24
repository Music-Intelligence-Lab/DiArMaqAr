"""
Computes the interval between two fractions and returns the result as a simplified fraction.

This function calculates the ratio between two fractions, which is essential for
determining musical intervals in just intonation and other tuning systems.
"""

from .gcd import gcd


def compute_fraction_interval(first_fraction: str, second_fraction: str) -> str:
    """
    Computes the interval between two fractions and returns the result as a simplified fraction.

    This function calculates the ratio between two fractions, which is essential for
    determining musical intervals in just intonation and other tuning systems.
    The result is automatically simplified using the Greatest Common Divisor.

    Mathematical formula: (c/d) / (a/b) = (c * b) / (d * a)

    Args:
        first_fraction: The first fraction in "numerator/denominator" format (e.g., "3/2")
        second_fraction: The second fraction in "numerator/denominator" format (e.g., "4/3")

    Returns:
        The interval as a simplified fraction string

    Examples:
        >>> compute_fraction_interval("3/2", "4/3")
        "8/9"
        
        >>> compute_fraction_interval("5/4", "6/5")
        "24/25"
    """
    # Parse the first fraction (a/b)
    a, b = map(int, first_fraction.split("/"))

    # Parse the second fraction (c/d)
    c, d = map(int, second_fraction.split("/"))

    # Calculate the interval: (c/d) / (a/b) = (c * b) / (d * a)
    num = c * b  # Numerator of result
    den = d * a  # Denominator of result

    # Simplify the fraction using GCD
    g = gcd(num, den)

    # Return the simplified fraction
    return f"{int(num / g)}/{int(den / g)}"


def fraction_to_decimal(fraction: str) -> float:
    """
    Converts a fraction string to its decimal representation.
    
    Args:
        fraction: String representation of a fraction (e.g., "3/2")
        
    Returns:
        The decimal equivalent of the fraction
        
    Examples:
        >>> fraction_to_decimal("3/2")
        1.5
        >>> fraction_to_decimal("4/3")
        1.3333333333333333
    """
    numerator, denominator = map(int, fraction.split("/"))
    return numerator / denominator


def decimal_to_fraction(decimal: float, max_denominator: int = 99) -> str:
    """
    Converts a decimal number to its closest fractional representation.

    This function finds the best fractional approximation of a decimal number
    by testing denominators up to max_denominator and selecting the fraction with minimal error.
    This is crucial for representing pitch ratios in just intonation systems.

    Args:
        decimal: The decimal number to convert to a fraction
        max_denominator: Maximum denominator to test (default: 99)

    Returns:
        String representation of the simplified fraction

    Examples:
        >>> decimal_to_fraction(1.5)
        "3/2"
        >>> decimal_to_fraction(1.25)
        "5/4"
    """
    best_numerator = 1
    best_denominator = 1
    min_error = abs(decimal - best_numerator / best_denominator)

    # Test denominators from 1 to max_denominator to find the best approximation
    for d in range(1, max_denominator + 1):
        n = round(decimal * d)
        error = abs(decimal - n / d)

        # If this fraction is more accurate, use it
        if error < min_error:
            min_error = error
            best_numerator = n
            best_denominator = d

    # Simplify the fraction using GCD
    gcd_value = gcd(best_numerator, best_denominator)
    return f"{int(best_numerator / gcd_value)}/{int(best_denominator / gcd_value)}"


def simplify_fraction(fraction: str) -> str:
    """
    Simplifies a fraction to its lowest terms.
    
    Args:
        fraction: String representation of a fraction (e.g., "6/9")
        
    Returns:
        The simplified fraction string (e.g., "2/3")
        
    Examples:
        >>> simplify_fraction("6/9")
        "2/3"
        >>> simplify_fraction("10/15")
        "2/3"
    """
    numerator, denominator = map(int, fraction.split("/"))
    gcd_value = gcd(numerator, denominator)
    return f"{int(numerator / gcd_value)}/{int(denominator / gcd_value)}"
