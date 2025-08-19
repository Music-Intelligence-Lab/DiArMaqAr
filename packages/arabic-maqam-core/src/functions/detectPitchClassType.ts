/**
 * Automatically detects the format of pitch class data values from an array of string values.
 *
 * This function analyzes pitch class data values to determine its format, enabling automatic
 * parsing and conversion. It's essential for import workflows where the data format
 * might not be explicitly specified.
 *
 * The detection logic follows this priority:
 * 1. Fraction patterns (e.g., "3/2", "4:3")
 * 2. Cents values (ascending numbers < 1200)
 * 3. Decimal ratios (ascending numbers 1.0-2.0)
 * 4. String lengths (descending numbers)
 *
 * @param values - Array of pitch class values as strings
 * @returns The detected format type or "unknown" if indeterminate
 *
 * @example
 * detectPitchClassType(["1/1", "9/8", "5/4", "4/3"]) // Returns "fraction"
 *
 * @example
 * detectPitchClassType(["0", "204", "386", "498"]) // Returns "cents"
 *
 * @example
 * detectPitchClassType(["1.0", "1.125", "1.25", "1.333"]) // Returns "decimalRatio"
 *
 * @example
 * detectPitchClassType(["10000", "9600", "8700", "7000"]) // Returns "stringLength"
 */
export default function detectPitchClassValueType(values: string[]): "fraction" | "cents" | "decimalRatio" | "stringLength" | "unknown" {
  // Handle empty or invalid input
  if (!values.length) return "unknown";

  // Clean and filter the input values
  const cleaned = values.map((v) => v.trim()).filter((v) => v !== "");
  if (!cleaned.length) return "unknown";

  // Test for fraction patterns first (highest priority)
  // Matches patterns like "3/2", "4:3", "22/15"
  const fractionRegex = /^[1-9]\d*[/:][1-9]\d*$/;
  const allFractions = cleaned.every((val) => fractionRegex.test(val));

  if (allFractions) {
    // Verify fractions are in ascending order (expected for pitch scales)
    const fractionNumbers = cleaned.map((val) => {
      const [num, denom] = val.split(/[/:]/).map(Number);
      return num / denom;
    });

    // Check if values are in ascending order (required for valid scale)
    const isAscending = fractionNumbers.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
    if (!isAscending) return "unknown";

    return "fraction";
  }

  // Parse all values as numbers for further analysis
  const numericVals = cleaned.map(Number);
  if (numericVals.some(isNaN)) return "unknown"; // Contains non-numeric values

  // Check if values are in ascending or descending order
  const ascending = numericVals.every((val, i, arr) => (i === 0 ? true : val >= arr[i - 1]));
  const descending = numericVals.every((val, i, arr) => (i === 0 ? true : val <= arr[i - 1]));

  // Test for cents format (ascending values within 0-1200 range)
  if (ascending && numericVals.every((v) => v >= 0 && v < 1200)) {
    return "cents";
  }

  // Test for decimal ratio format (ascending values in typical ratio range)
  if (ascending && numericVals.every((v) => v >= 1.0 && v < 2.0)) {
    return "decimalRatio";
  }

  // Test for string length format (descending values)
  // String lengths typically decrease as pitch goes higher
  if (descending) {
    return "stringLength";
  }

  // Unable to determine format with confidence
  return "unknown";
}
