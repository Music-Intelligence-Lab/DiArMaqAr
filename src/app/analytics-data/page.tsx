
"use client";

import React, { useEffect, useState, useMemo } from "react";

interface AnalyticsRow {
  id: string;
  label: string;
  possibleAjnasCount: number;
  possibleAjnasTranspositionsCount: number;
  totalAjnas: number;
  possibleMaqamatCount: number;
  possibleMaqamatTranspositionsCount: number;
  totalMaqamat: number;
  totalSuyur: number;
  totalAjnasModulations: number;
  totalMaqamatModulations: number;
}

const ANALYTICS_PATH = "/data/analytics.json";

function extractYear(label: string): number {
  // Extracts a 4-digit year from the label, or returns 0 if not found
  const match = label.match(/(19|20)\d{2}/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [sortKey, setSortKey] = useState<keyof AnalyticsRow>("label");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch analytics data from JSON file
  const fetchAnalytics = async () => {
    setError(null);
    try {
      const res = await fetch(`${ANALYTICS_PATH}?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load analytics data");
      const data = await res.json();
      setRows(data);
    } catch (e: any) {
      setError(e.message || "Error loading analytics data");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle re-generation
  const handleReRender = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/generate-analytics", { method: "POST" });
      if (!res.ok) throw new Error("Failed to re-generate analytics");
      await fetchAnalytics();
      setSuccess("Analytics re-generated successfully!");
      setTimeout(() => setSuccess(null), 30000);
    } catch (e: any) {
      setError(e.message || "Error re-generating analytics");
    } finally {
      setLoading(false);
    }
  };

  // Sorting logic
  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (sortKey === "label") {
        aVal = extractYear(a.label);
        bVal = extractYear(b.label);
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, sortKey, sortDir]);

  function renderSortableHeader(label: string, key: keyof AnalyticsRow) {
    return (
      <th
        key={key}
        onClick={() => {
          if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
          } else {
            setSortKey(key);
            setSortDir("asc");
          }
        }}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </th>
    );
  }

  return (
    <div className="analytics-page">
      
        <button onClick={handleReRender} disabled={loading} style={{ marginBottom: 16 }}>
          {loading ? "Re-Rendering..." : "Re-Render Analytics"}
        </button>
      
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <table>
        <thead>
          <tr>
            {renderSortableHeader("Tuning Systems", "label")}
            {renderSortableHeader("Possible Ajnas", "possibleAjnasCount")}
            {renderSortableHeader("Possible Ajnas Transpositions", "possibleAjnasTranspositionsCount")}
            {renderSortableHeader("Possible Maqamat", "possibleMaqamatCount")}
            {renderSortableHeader("Possible Maqamat Transpositions", "possibleMaqamatTranspositionsCount")}
            {renderSortableHeader("Total Suyur", "totalSuyur")}
            {renderSortableHeader("Total Possible Ajnas Modulations", "totalAjnasModulations")}
            {renderSortableHeader("Total Possible Maqamat Modulations", "totalMaqamatModulations")}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{`${row.possibleAjnasCount}/${row.totalAjnas}`}</td>
              <td>{row.possibleAjnasTranspositionsCount}</td>
              <td>{`${row.possibleMaqamatCount}/${row.totalMaqamat}`}</td>
              <td>{row.possibleMaqamatTranspositionsCount}</td>
              <td>{row.totalSuyur}</td>
              <td>{row.totalAjnasModulations}</td>
              <td>{row.totalMaqamatModulations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
