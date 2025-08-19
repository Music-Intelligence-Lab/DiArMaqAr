/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 *
 * This function is essential for simplifying fractions throughout the maqam analysis system.
 * It uses the Euclidean algorithm with floating-point precision handling to ensure
 * accurate results even with small decimal numbers.
 *
 * The Euclidean algorithm works by repeatedly replacing the larger number with the
 * remainder of the division until one number becomes effectively zero.
 *
 * @param a - First number (will be converted to absolute value)
 * @param b - Second number (will be converted to absolute value)
 * @returns The Greatest Common Divisor of a and b
 *
 * @example
 * gcd(12, 8) // Returns 4
 *
 * @example
 * gcd(15, 25) // Returns 5
 *
 * @example
 * gcd(17, 13) // Returns 1 (coprime numbers)
 */
export default function gcd(a: number, b: number): number {
  // Convert to absolute values to handle negative numbers
  a = Math.abs(a);
  b = Math.abs(b);

  // Epsilon for floating-point comparison - handles precision issues
  const EPS = 1e-10;

  // Apply Euclidean algorithm
  // Continue until b becomes effectively zero (within epsilon tolerance)
  while (b > EPS) {
    const t = a % b; // Calculate remainder
    a = b; // Replace a with b
    b = t; // Replace b with remainder
  }

  // Return the GCD (stored in a)
  return a;
}
