import { standardizeText } from "@/functions/export";
import {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames,
} from "@/models/NoteName";

export type SortBy = "alphabetical" | "tonic";

export const SORT_BY_VALUES: readonly SortBy[] = ["alphabetical", "tonic"] as const;

export class InvalidSortByError extends Error {
  constructor(public readonly received: string) {
    super(`Invalid sortBy value: '${received}'`);
    this.name = "InvalidSortByError";
  }
}

/**
 * Parses a raw `sortBy` query-param value into a SortBy union, or returns
 * `defaultValue` when the param is absent. Throws `InvalidSortByError` for
 * empty strings or any value not in `SORT_BY_VALUES` — route handlers should
 * catch and convert to HTTP 400.
 */
export function parseSortBy(raw: string | null, defaultValue: SortBy): SortBy {
  if (raw === null) return defaultValue;
  if (raw.trim() === "") throw new InvalidSortByError(raw);
  if ((SORT_BY_VALUES as readonly string[]).includes(raw)) return raw as SortBy;
  throw new InvalidSortByError(raw);
}

const NOTE_NAME_ORDER: readonly string[] = [
  ...octaveZeroNoteNames,
  ...octaveOneNoteNames,
  ...octaveTwoNoteNames,
  ...octaveThreeNoteNames,
  ...octaveFourNoteNames,
].map((name) => standardizeText(name));

const UNKNOWN_NOTE_PRIORITY = Number.MAX_SAFE_INTEGER;

/**
 * Returns the priority index of a tonic (already standardized) within the full
 * NoteName.ts octave-stratified order. Unknown notes get
 * Number.MAX_SAFE_INTEGER so they sort to the end.
 */
export function getNotePriority(standardizedTonic: string): number {
  const idx = NOTE_NAME_ORDER.indexOf(standardizedTonic);
  return idx === -1 ? UNKNOWN_NOTE_PRIORITY : idx;
}

/** Comparator for `sortBy=alphabetical` — standardized display name order. */
export function compareByDisplayName(aDisplayName: string, bDisplayName: string): number {
  return standardizeText(aDisplayName).localeCompare(standardizeText(bDisplayName));
}

/**
 * Comparator for `sortBy=tonic` — primary key NoteName.ts priority of the
 * tonic, tiebreak by `compareByDisplayName`. Mirrors `/maqamat`'s tiebreak
 * (locale-default, standardized) rather than `/tuning-systems/.../maqamat`'s
 * old `localeCompare(b, "ar")`.
 */
export function compareByTonicThenName(
  aTonicIdName: string,
  aDisplayName: string,
  bTonicIdName: string,
  bDisplayName: string
): number {
  const pa = getNotePriority(aTonicIdName);
  const pb = getNotePriority(bTonicIdName);
  if (pa !== pb) return pa - pb;
  return compareByDisplayName(aDisplayName, bDisplayName);
}

/**
 * Build the standard 400 response body for an invalid `sortBy` value.
 * Returned as a plain object so route handlers can wrap it with their own
 * NextResponse.json + addCorsHeaders pattern.
 */
export function buildInvalidSortByResponseBody(received: string): {
  error: string;
  message: string;
  hint: string;
} {
  return {
    error: "Invalid parameter: sortBy",
    message:
      received.trim() === ""
        ? "The 'sortBy' parameter cannot be empty. Either omit it or provide a valid value."
        : `The 'sortBy' parameter must be one of: ${SORT_BY_VALUES.join(", ")}.`,
    hint: `Use ?sortBy=alphabetical or ?sortBy=tonic, or omit for the default.`,
  };
}
