"use client";

import React, { useMemo, useState } from "react";
import type { TuningSystemStatistics } from "@/functions/archiveStatistics";

type Column = {
  key: string;
  label: string;
  value: (row: TuningSystemStatistics) => number;
  /** Shown as "value/total" */
  total?: (row: TuningSystemStatistics) => number;
};

type ColumnGroup = { label: string; columns: Column[] };

/** Modulations from the base forms and the transpositions. Octave renderings are left out. */
const headline = (row: TuningSystemStatistics, kind: "maqamat" | "ajnas") =>
  row.modulations.fromBaseForms[kind] + row.modulations.fromTranspositions[kind];

const modulationColumns = (kind: "maqamat" | "ajnas"): Column[] => [
  { key: `${kind}FromBaseForms`, label: "From base forms", value: (row) => row.modulations.fromBaseForms[kind] },
  { key: `${kind}FromTranspositions`, label: "From transpositions", value: (row) => row.modulations.fromTranspositions[kind] },
  { key: `${kind}Modulations`, label: "Total", value: (row) => headline(row, kind) },
];

const groups: ColumnGroup[] = [
  {
    label: "Ajnās",
    columns: [
      { key: "ajnasPossible", label: "Possible", value: (row) => row.ajnas.possible, total: (row) => row.ajnas.total },
      { key: "ajnasTranspositions", label: "Transpositions", value: (row) => row.ajnas.transpositions },
    ],
  },
  {
    label: "Maqāmāt",
    columns: [
      { key: "maqamatPossible", label: "Possible", value: (row) => row.maqamat.possible, total: (row) => row.maqamat.total },
      { key: "maqamatTranspositions", label: "Transpositions", value: (row) => row.maqamat.transpositions },
      { key: "suyur", label: "Suyūr", value: (row) => row.maqamat.suyur },
    ],
  },
  { label: "Modulations to maqāmāt", columns: modulationColumns("maqamat") },
  { label: "Modulations to ajnās", columns: modulationColumns("ajnas") },
];

const columns = groups.flatMap((group) => group.columns);
const format = (value: number) => value.toLocaleString("en-US");
const yearOf = (row: TuningSystemStatistics) => parseInt(row.tuningSystem.year, 10) || 0;

export default function StatisticsTable({ rows }: { rows: TuningSystemStatistics[] }) {
  // null sorts by tuning system: by year, then in archive order
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    const indexed = rows.map((row, index) => ({ row, index }));
    indexed.sort((a, b) => {
      const difference = column ? column.value(a.row) - column.value(b.row) : yearOf(a.row) - yearOf(b.row) || a.index - b.index;
      return sortDir === "asc" ? difference : -difference;
    });
    return indexed.map(({ row }) => row);
  }, [rows, sortKey, sortDir]);

  const sortBy = (key: string | null) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === null ? "asc" : "desc");
    }
  };
  const arrow = (key: string | null) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "");

  // A tuning system's name is shown once over its consecutive rows (its
  // starting notes), which is every row of it when sorted by tuning system
  const nameSpans = sortedRows.map((row, index) => {
    const sameAs = (other?: TuningSystemStatistics) => other?.tuningSystem.id === row.tuningSystem.id;
    if (sameAs(sortedRows[index - 1])) return 0;
    let span = 1;
    while (sameAs(sortedRows[index + span])) span++;
    return span;
  });

  return (
    <table className="statistics-table">
      <thead>
        <tr>
          <th rowSpan={2} onClick={() => sortBy(null)}>
            Tuning system{arrow(null)}
          </th>
          <th rowSpan={2} className="statistics-table__group">
            Starting note
          </th>
          {groups.map((group) => (
            <th key={group.label} colSpan={group.columns.length} className="statistics-table__group">
              {group.label}
            </th>
          ))}
        </tr>
        <tr>
          {columns.map((column) => (
            <th key={column.key} onClick={() => sortBy(column.key)}>
              {column.label}
              {arrow(column.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, index) => (
          <tr key={`${row.tuningSystem.id}/${row.startingNote.idName}`}>
            {nameSpans[index] > 0 && (
              <td data-column-type="label" rowSpan={nameSpans[index]}>
                {row.tuningSystem.displayName}
              </td>
            )}
            <td data-column-type="note">{row.startingNote.displayName}</td>
            {columns.map((column) => (
              <td key={column.key} data-column-type="value">
                {format(column.value(row))}
                {column.total && `/${format(column.total(row))}`}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
