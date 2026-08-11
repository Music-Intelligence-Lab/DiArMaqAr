"use client";

import { RefObject, useCallback, useEffect, useRef } from "react";

const STORAGE_KEY_PREFIX = "diarmaqar:carousel-scroll:";

/**
 * Remembers how far a manager carousel is scrolled, across both tab switches
 * and reloads.
 *
 * The three managers are mounted conditionally — switching to the ajnās tab
 * unmounts the maqāmāt one — so the carousel's `scrollLeft` dies with the DOM
 * node and every visit started back at the first column.
 *
 * sessionStorage, not localStorage: a scroll offset should outlive a reload of
 * the tab it belongs to and nothing more. (Admin mode is deliberately
 * localStorage — see menu-context — because that setting is meant to persist
 * across sessions. The divergence is the point.)
 *
 * @param key - Identifies the carousel; one per manager.
 * @param isRTL - Scroll offsets run negative in RTL, so only the magnitude is
 *   stored and the sign is re-applied on restore, as scrollCarouselByColumns does.
 * @returns A ref to attach to the scrolling element, and the `onScroll` handler
 *   that records its position.
 */
export default function useRememberedCarouselScroll(
  key: string,
  isRTL: boolean
): { listRef: RefObject<HTMLDivElement | null>; onScroll: () => void } {
  const listRef = useRef<HTMLDivElement | null>(null);

  // The offset this mount is trying to reach, and whether it got there. Until
  // it does, the carousel's own scroll events are ignored: a carousel whose
  // items have not rendered yet has nothing to scroll, so the browser clamps
  // the restore to 0 and fires a scroll event saying so. Persisting that would
  // erase the stored offset with the very value we are trying to replace —
  // the same write-before-read race menu-context documents for admin mode.
  const targetRef = useRef(0);
  const restoredRef = useRef(false);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY_PREFIX + key);
    const parsed = stored === null ? 0 : Number(stored);
    targetRef.current = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    restoredRef.current = targetRef.current === 0;

    const list = listRef.current;
    if (!list || restoredRef.current) return;

    // Attempt the restore, and report whether it actually landed. On a reload
    // the manager mounts before its data does, so for the first few attempts
    // the grid is empty and the offset is unreachable.
    const attemptRestore = () => {
      const maxScroll = list.scrollWidth - list.clientWidth;
      if (maxScroll <= 0) return;
      const target = Math.min(targetRef.current, maxScroll);
      list.scrollTo({ left: (isRTL ? -1 : 1) * target, behavior: "auto" });
      if (Math.abs(Math.abs(list.scrollLeft) - target) <= 1) restoredRef.current = true;
    };

    attemptRestore();
    if (restoredRef.current) return;

    // Retry whenever the grid resizes: the items arriving, Readex Pro
    // swapping in and re-measuring the content-driven column widths, or a
    // viewport change. Observing the grid rather than depending on the item
    // count keeps the hook indifferent to what each manager renders.
    const grid = list.firstElementChild;
    if (!(grid instanceof HTMLElement)) return;
    const observer = new ResizeObserver(() => {
      if (restoredRef.current) {
        observer.disconnect();
        return;
      }
      attemptRestore();
      if (restoredRef.current) observer.disconnect();
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [key, isRTL]);

  const onScroll = useCallback(() => {
    const list = listRef.current;
    if (!list || !restoredRef.current) return;
    window.sessionStorage.setItem(STORAGE_KEY_PREFIX + key, String(Math.round(Math.abs(list.scrollLeft))));
  }, [key]);

  return { listRef, onScroll };
}
