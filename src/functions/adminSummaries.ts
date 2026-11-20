import { STORABLE_OCTAVES, StoredOctaves } from "@/models/TuningSystem";

/**
 * The one-line summaries an admin section shows while folded, worked out from
 * the form's own state so they always say what is in the section.
 */

/** Paragraphs in a comment: blocks of text separated by blank lines. */
export function paragraphCount(text: string): number {
  return text.split(/\n\s*\n/).filter((block) => block.trim().length > 0).length;
}

/**
 * How many values each octave 0, 1, 2 and 3 holds: a stored octave its own
 * count, an octave worked out from octave 1 octave 1's count.
 */
export function octaveCounts(octaveOne: string[], stored: StoredOctaves | null): [number, number, number, number] {
  const count = (octave: number) =>
    (STORABLE_OCTAVES as readonly number[]).includes(octave)
      ? (stored?.pitchClassValues[octave as (typeof STORABLE_OCTAVES)[number]]?.length ?? octaveOne.length)
      : octaveOne.length;
  return [count(0), count(1), count(2), count(3)];
}

/** "Creator (year) · references", leaving out whatever is still empty. */
export function detailsSummary(creator: string, year: string, references: string): string {
  const name = creator.trim();
  const when = year.trim() ? `(${year.trim()})` : "";
  const who = [name, when].filter(Boolean).join(" ");
  return [who, references].filter(Boolean).join(" · ");
}
