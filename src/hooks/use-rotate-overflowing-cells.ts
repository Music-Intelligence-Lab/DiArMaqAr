"use client";

import { RefObject, useEffect } from "react";

/**
 * Data rows that participate in rotation. The numeric value rows (nowrap) are
 * the reliable overflow triggers; the text rows are included so a rotated
 * table rotates uniformly across all its data cells.
 */
const ROTATABLE_ROW_TYPES = [
  "fraction",
  "cents",
  "centsFromZero",
  "centsDeviation",
  "decimalRatio",
  "stringLength",
  "fretDivision",
  "frequency",
  "midiNote",
  "midiNoteDeviation",
  "pitchClass",
  "abjadName",
  "englishName",
  "solfege",
  "noteNames",
];

const CELL_SELECTOR = ROTATABLE_ROW_TYPES.map(
  (rowType) => `tr[data-row-type="${rowType}"] td[data-column-type]:not([data-column-type="empty"])`
).join(", ");

/** Class applied to overflowing cells; styled in _maqam-jins-shared-ui.scss */
export const VERTICAL_CELL_CLASS = "maqam-jins-transpositions-shared__cell--vertical";

/** Marker on the <table> whose cells are rotated, for dependent styling */
export const ROTATED_TABLE_CLASS = "maqam-jins-transpositions-shared__table--rotated";

/** Marker on ajnas rows containing a wrapped (multi-line) jins button label */
export const MULTILINE_AJNAS_ROW_CLASS = "maqam-jins-transpositions-shared__ajnas-row--multiline";

/**
 * Rotates overflowing numeric value cells vertically.
 *
 * After every render (coalesced to one pass per animation frame) and on window
 * resize, measures each fraction/cents/... value cell in the container and
 * toggles VERTICAL_CELL_CLASS on the ones whose content overflows its cell
 * horizontally. Cells that fit keep their normal horizontal text.
 */
export default function useRotateOverflowingCells(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      const cells = Array.from(container.querySelectorAll<HTMLTableCellElement>(CELL_SELECTOR));
      // Batch writes → reads → writes to avoid interleaved reflows
      cells.forEach((cell) => cell.classList.remove(VERTICAL_CELL_CLASS));
      container.querySelectorAll("table").forEach((table) => table.classList.remove(ROTATED_TABLE_CLASS));

      // Uniformity: if any value cell in a table overflows, rotate all of that
      // table's value cells together — mixed orientations look messy
      const cellsByTable = new Map<HTMLTableElement, HTMLTableCellElement[]>();
      cells.forEach((cell) => {
        const table = cell.closest("table");
        if (!table) return;
        const group = cellsByTable.get(table);
        if (group) group.push(cell);
        else cellsByTable.set(table, [cell]);
      });

      cellsByTable.forEach((tableCells, table) => {
        if (tableCells.some((cell) => cell.scrollWidth > cell.clientWidth + 1)) {
          table.classList.add(ROTATED_TABLE_CLASS);
          tableCells.forEach((cell) => cell.classList.add(VERTICAL_CELL_CLASS));
        }
      });

      // Ajnas rows: jins-button labels top-align only when some label in the
      // row wraps to multiple lines; single-line rows stay vertically centered.
      // The label spans are blockified flex items (always exactly one client
      // rect), so wrapping is detected by height exceeding one line
      const isMultiLine = (label: Element) => {
        const lineHeight = parseFloat(getComputedStyle(label).lineHeight) || 17;
        return label.getBoundingClientRect().height > lineHeight * 1.5;
      };
      const ajnasRows = Array.from(container.querySelectorAll<HTMLTableRowElement>('tr[data-row-type="ajnas"]'));
      ajnasRows.forEach((row) => row.classList.remove(MULTILINE_AJNAS_ROW_CLASS));
      const multilineRows = ajnasRows.filter((row) =>
        Array.from(row.querySelectorAll('[class*="__jins-button"] > span')).some(isMultiLine)
      );
      multilineRows.forEach((row) => row.classList.add(MULTILINE_AJNAS_ROW_CLASS));
    };

    // Coalesce the per-render invocations (this effect has no dependency array,
    // since React re-renders can reset the class) into one pass per frame
    const frame = requestAnimationFrame(apply);

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(apply);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
    };
  });
}
