import gcd from "./gcd";

/**
 * Computes the interval between two fractions and returns the result as a simplified fraction.
 *
 * This function calculates the ratio between two fractions, which is essential for
 * determining musical intervals in just intonation and other tuning systems.
 * The result is automatically simplified using the Greatest Common Divisor.
 *
 * Mathematical formula: (c/d) / (a/b) = (c * b) / (d * a)
 *
 * @param firstFraction - The first fraction in "numerator/denominator" format (e.g., "3/2")
 * @param secondFraction - The second fraction in "numerator/denominator" format (e.g., "4/3")
 * @returns The interval as a simplified fraction string
 *
 * @example
 * // Calculate interval from 3/2 to 4/3
 * computeFractionInterval("3/2", "4/3")
 * // Returns "8/9" (the simplified result of (4*2)/(3*3))
 *
 * @example
 * // Calculate interval from 5/4 to 6/5
 * computeFractionInterval("5/4", "6/5")
 * // Returns "24/25"
 */
export default function computeFractionInterval(firstFraction: string, secondFraction: string) {
  // Parse the first fraction (a/b)
  const [a, b] = firstFraction.split("/").map(Number);

  // Parse the second fraction (c/d)
  const [c, d] = secondFraction.split("/").map(Number);

  // Calculate the interval: (c/d) / (a/b) = (c * b) / (d * a)
  const num = c * b; // Numerator of result
  const den = d * a; // Denominator of result

  // Simplify the fraction using GCD
  const g = gcd(num, den);

  // Return the simplified fraction
  return `${num / g}/${den / g}`;
}
