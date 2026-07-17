/**
 * Scrolls a manager carousel (jins/maqam/tuning-system) by one "page" of
 * whole columns.
 *
 * The scroll unit is the column pitch — item width plus the grid gap —
 * measured live from the carousel's own DOM, so the chevrons stay in step
 * with the content-driven column widths (which change with language,
 * filter group, and data). The target is aligned to a column boundary, so
 * clicks always land with a full item at the leading edge, even after the
 * user hand-drags the scrollbar to an arbitrary offset.
 */
export default function scrollCarouselByColumns(list: Element | null, direction: 1 | -1, isRTL: boolean): void {
  if (!(list instanceof HTMLElement)) return;
  const grid = list.firstElementChild;
  const item = grid?.firstElementChild;
  if (!(grid instanceof HTMLElement) || !(item instanceof HTMLElement)) return;

  const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
  const step = item.getBoundingClientRect().width + gap;
  if (step <= 0) return;

  const columnsPerPage = Math.max(1, Math.floor(list.clientWidth / step));
  // |scrollLeft|: RTL scroll positions run negative; the sign is restored on the target
  const currentColumn = Math.round(Math.abs(list.scrollLeft) / step);
  const target = Math.max(0, (currentColumn + direction * columnsPerPage) * step);
  list.scrollTo({ left: (isRTL ? -1 : 1) * target, behavior: "smooth" });
}
