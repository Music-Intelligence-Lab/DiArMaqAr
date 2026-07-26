"use client";

import { RefObject, useEffect } from "react";

/**
 * Numeric value rows — the only rows whose overflow may TRIGGER rotation.
 *
 * Nothing here is `white-space: nowrap`; every cell inherits `normal` and so
 * wraps at spaces (base td/th set no white-space, and neither type-data-value
 * nor type-table-label sets it). What makes these rows the triggers is that a
 * numeric value is one unbreakable token — "16384/10935" has no space or
 * `<wbr>` to wrap at, so under `table-layout: fixed` it can only overflow.
 *
 * The interval columns are the usual culprit: a "fraction-interval" holds a
 * ratio of the two values it sits between, so its digits multiply out to
 * something like "(6400:5859)" — longer than either neighbour and, with no
 * break opportunity at the colon, unwrappable at any column width.
 *
 * Text rows are excluded because they wrap on their own — a note name like
 * "jawāb jawāb tīk zīrgūleh" breaks at its spaces (and noteNameWithBreaks
 * adds a `<wbr>` after each slash), so it should take another line rather
 * than report an overflow the wrap has already resolved.
 */
const TRIGGER_ROW_TYPES = [
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
];

/**
 * Rows that rotate once some trigger row has overflowed. A superset of the
 * triggers: mixed orientations within one table look messy, so when the table
 * rotates, every data cell rotates with it.
 *
 * `noteNames` is deliberately NOT here. A note name is multi-word and wraps,
 * so it reads fine on two or three lines at full column width; rotating it
 * only because a fraction-interval elsewhere in the table could not wrap turns
 * the most-read row in the table sideways for no gain. The remaining text rows
 * (abjad, English, solfege) are short single tokens that rotate cleanly.
 */
const ROTATABLE_ROW_TYPES = [
  ...TRIGGER_ROW_TYPES,
  "pitchClass",
  "abjadName",
  "englishName",
  "solfege",
];

const cellSelectorFor = (rowTypes: string[]) =>
  rowTypes
    .map((rowType) => `tr[data-row-type="${rowType}"] td[data-column-type]:not([data-column-type="empty"])`)
    .join(", ");

const CELL_SELECTOR = cellSelectorFor(ROTATABLE_ROW_TYPES);
const TRIGGER_CELL_SELECTOR = cellSelectorFor(TRIGGER_ROW_TYPES);

// Strip wider than we add. React only rewrites className when the JSX value
// changes, so a class added imperatively outlives re-renders — meaning any row
// type that LEAVES the rotatable set would keep a stale rotation forever
// (noteNames is exactly that case). Cleaning every row type that could ever
// have been rotated keeps this from recurring the next time a type moves.
const CLEANUP_SELECTOR = cellSelectorFor([...ROTATABLE_ROW_TYPES, "noteNames"]);

/** Class applied to overflowing cells; styled in _maqam-jins-shared-ui.scss */
export const VERTICAL_CELL_CLASS = "maqam-jins-transpositions-shared__cell--vertical";

/** Marker on the <table> whose cells are rotated, for dependent styling */
export const ROTATED_TABLE_CLASS = "maqam-jins-transpositions-shared__table--rotated";

/** Marker on ajnas rows containing a wrapped (multi-line) jins button label */
export const MULTILINE_AJNAS_ROW_CLASS = "maqam-jins-transpositions-shared__ajnas-row--multiline";

/**
 * Rotates a table's data cells vertically when its numeric values no longer fit.
 *
 * After every render (coalesced to one pass per animation frame) and on window
 * resize, measures the numeric value cells (TRIGGER_ROW_TYPES) in the container.
 * If any of them overflows its column, that table gets ROTATED_TABLE_CLASS and
 * every one of its data cells (ROTATABLE_ROW_TYPES) gets VERTICAL_CELL_CLASS.
 * Tables whose numbers fit keep their normal horizontal text throughout — text
 * rows such as note names wrap onto extra lines instead of forcing rotation.
 */
export default function useRotateOverflowingCells(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      const cells = Array.from(container.querySelectorAll<HTMLTableCellElement>(CELL_SELECTOR));
      // Batch writes → reads → writes to avoid interleaved reflows
      container
        .querySelectorAll<HTMLTableCellElement>(CLEANUP_SELECTOR)
        .forEach((cell) => cell.classList.remove(VERTICAL_CELL_CLASS));
      container.querySelectorAll("table").forEach((table) => table.classList.remove(ROTATED_TABLE_CLASS));

      // Group by table twice over: the trigger cells decide WHETHER a table
      // rotates, the rotatable set decides WHAT rotates with it. Measuring only
      // the triggers is what keeps a wrappable row out of the decision — the
      // classes are stripped above, so scrollWidth is read in the wrapped
      // state and a name that fits on two lines never reports overflow.
      const groupByTable = (group: HTMLTableCellElement[]) => {
        const byTable = new Map<HTMLTableElement, HTMLTableCellElement[]>();
        group.forEach((cell) => {
          const table = cell.closest("table");
          if (!table) return;
          const existing = byTable.get(table);
          if (existing) existing.push(cell);
          else byTable.set(table, [cell]);
        });
        return byTable;
      };

      const rotatableByTable = groupByTable(cells);
      const triggersByTable = groupByTable(
        Array.from(container.querySelectorAll<HTMLTableCellElement>(TRIGGER_CELL_SELECTOR))
      );

      // Uniformity: if any trigger cell in a table overflows, rotate all of
      // that table's data cells together — mixed orientations look messy
      triggersByTable.forEach((triggerCells, table) => {
        if (!triggerCells.some((cell) => cell.scrollWidth > cell.clientWidth + 1)) return;
        table.classList.add(ROTATED_TABLE_CLASS);
        rotatableByTable.get(table)?.forEach((cell) => cell.classList.add(VERTICAL_CELL_CLASS));
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
