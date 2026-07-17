/**
 * The live height of the stuck stack above a transposition row: the
 * content-driven pitch-class bar, one $space-block gap, and the sticky
 * analysis header — plus one more $space-block of breathing, so a
 * scrolled-to row lands exactly a block-gap under the stuck header.
 *
 * Measured from the DOM at scroll time because both the bar and the
 * header auto-size (language, selection, wrapped filter rows); no
 * constant can track them. Fallbacks approximate today's typical stack
 * for the pre-mount moment.
 */
const SPACE_BLOCK = 20; // mirrors $space-block in variables.scss

export default function transpositionsScrollMargin(): number {
  if (typeof document === "undefined") return 220;
  const bar = document.querySelector<HTMLElement>(".pitch-class-bar");
  const sticky = document.querySelector<HTMLElement>('[class*="__sticky-header"]');
  return (bar?.offsetHeight ?? 90) + SPACE_BLOCK + (sticky?.offsetHeight ?? 90) + SPACE_BLOCK;
}
