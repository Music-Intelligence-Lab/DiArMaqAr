/**
 * Reads a true/false query parameter. The one rule for every boolean flag of
 * the API: absent means false; "true" or "false" (any letter case) is the
 * value; anything else, the empty string included, is an error. A flag never
 * silently reads "yes" or "1" as false.
 */
export function parseBooleanFlag(value: string | null, fieldName: string): boolean {
  if (value === null) return false;

  const trimmed = value.trim();
  if (trimmed === "") {
    throw new Error(`Invalid parameter: ${fieldName} cannot be empty. Use 'true' or 'false'.`);
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error(`Invalid parameter: ${fieldName} must be 'true' or 'false', got '${value}'`);
}
