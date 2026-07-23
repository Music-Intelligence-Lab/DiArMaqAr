export type ResolveTuningSystemsResult =
  | { ok: true; ids: string[] }
  | { ok: false; error: string; message: string; hint: string };

/**
 * Resolve the `tuningSystems` compare-endpoint query param into concrete ids.
 *
 * - `all` (case-insensitive, trimmed) → every id in `allSystemIds`, in order.
 * - `all` is EXCLUSIVE: mixing it with explicit ids is a 400-shaped error, so
 *   the sentinel stays an unambiguous either/or (no dedup/ordering questions).
 * - otherwise → the comma list, trimmed, with empty tokens dropped. Existence
 *   validation stays in the caller (unchanged behaviour).
 *
 * Pure by design (plain string[] in, plain result out) so it is unit-testable
 * without constructing TuningSystem model objects.
 */
export function resolveTuningSystemsParam(
  rawParam: string,
  allSystemIds: string[]
): ResolveTuningSystemsResult {
  const tokens = rawParam.split(",").map((t) => t.trim()).filter(Boolean);
  const hasAll = tokens.some((t) => t.toLowerCase() === "all");

  if (hasAll) {
    if (tokens.length > 1) {
      return {
        ok: false,
        error: "Invalid parameter: tuningSystems",
        message: "tuningSystems=all is exclusive and cannot be combined with other IDs.",
        hint: "Use tuningSystems=all by itself, or list explicit IDs without 'all'.",
      };
    }
    return { ok: true, ids: [...allSystemIds] };
  }

  return { ok: true, ids: tokens };
}
