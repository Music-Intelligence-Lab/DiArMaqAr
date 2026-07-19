/**
 * The live height of the stuck stack above a transposition row: the
 * content-driven pitch-class bar, the bar→header gap, and the sticky
 * analysis header — plus one separator, so a scrolled-to row lands the
 * same distance under the stuck header that the transposition tables sit
 * apart from each other.
 *
 * Every term is measured from the DOM at scroll time, none mirrored as a
 * constant here: the bar and header auto-size (language, selection,
 * wrapped filter rows), and the two gaps are owned by the stylesheet —
 * the header's own margin-top and the tables' sibling margin-bottom. A
 * duplicated pixel value here would silently drift the landing every time
 * that spacing is amended. Fallbacks approximate today's stack for the
 * pre-mount moment.
 */
const readPx = (el: Element | null, property: string, fallback: number): number => {
  if (!el) return fallback;
  const value = parseFloat(window.getComputedStyle(el).getPropertyValue(property));
  return Number.isFinite(value) ? value : fallback;
};

export default function transpositionsScrollMargin(): number {
  if (typeof document === "undefined") return 210;

  const bar = document.querySelector<HTMLElement>(".pitch-class-bar");
  const sticky = document.querySelector<HTMLElement>('[class*="__sticky-header"]');
  // The separator between transposition tables — the gap the landing matches
  const table = document.querySelector<HTMLElement>('table[class*="__table"]');

  const barHeight = bar?.offsetHeight ?? 90;
  const stickyHeight = sticky?.offsetHeight ?? 90;
  const barToHeaderGap = readPx(sticky, "margin-top", 20);
  const separator = readPx(table, "margin-bottom", 10);

  return barHeight + barToHeaderGap + stickyHeight + separator;
}
