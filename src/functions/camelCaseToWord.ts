/**
 * Converts camelCase strings to readable words with proper spacing and capitalization.
 * 
 * This utility function is used throughout the UI to convert programmatic camelCase
 * identifiers into user-friendly display text. It adds spaces before capital letters
 * and ensures the first letter is capitalized.
 * 
 * @param input - The camelCase string to convert
 * @returns A properly formatted string with spaces and title case
 * 
 * @example
 * camelCaseToWord("numberOfMaqamat") // Returns "Number Of Maqamat"
 * 
 * @example
 * camelCaseToWord("ascendingPitchClasses") // Returns "Ascending Pitch Classes"
 * 
 * @example
 * camelCaseToWord("myVariableName") // Returns "My Variable Name"
 */
export default function camelCaseToWord(input: string): string {
  return input
    // Add space before each capital letter (but not at the beginning)
    .replace(/([A-Z])/g, " $1")
    // Capitalize the first letter of the resulting string
    .replace(/^./, (str) => str.toUpperCase())
    // Remove any leading/trailing whitespace
    .trim();
}
