"use client";

import React, { useEffect, useState, useMemo } from "react";
import Footer from "@/components/footer";
import useMenuContext from "@/contexts/menu-context";
import "@/styles/statistics.scss";

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

// Extracts the first number and optional trailing letter inside parentheses, e.g. (950g) or (950)
function extractYearParts(label: string): { year: number; letter: string } {
  const match = label.match(/\((\d+)([a-zA-Z]?)\)/);
  if (match) {
    return { year: parseInt(match[1], 10), letter: match[2] || "" };
  }
  return { year: 0, letter: "" };
}

export default function StatisticsPage() {
  const { showAdminTabs } = useMenuContext();
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
      if (sortKey === "label") {
        const aParts = extractYearParts(a.label);
        const bParts = extractYearParts(b.label);
        if (aParts.year !== bParts.year) {
          return sortDir === "asc" ? aParts.year - bParts.year : bParts.year - aParts.year;
        }
        // If years are equal, compare the letter
        if (aParts.letter !== bParts.letter) {
          return sortDir === "asc" ? aParts.letter.localeCompare(bParts.letter) : bParts.letter.localeCompare(aParts.letter);
        }
        return 0;
      } else {
        const aVal: any = a[sortKey];
        const bVal: any = b[sortKey];
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
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

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  return (
    <div className="statistics">
      {showAdminTabs && (
        <div className="admin-controls">
          <button onClick={handleReRender} disabled={loading}>
            {loading ? "Re-Rendering..." : "Re-Render Analytics"}
          </button>
        </div>
      )}

      {error && <div className="status-message error">{error}</div>}
      {success && <div className="status-message success">{success}</div>}
      
      <div className="table-container">
        <table className="statistics-table">
          <thead>
            <tr>
              {renderSortableHeader("Tuning System", "label")}
              {renderSortableHeader("Possible Ajnās", "possibleAjnasCount")}
              {renderSortableHeader("Possible Ajnās Transpositions", "possibleAjnasTranspositionsCount")}
              {renderSortableHeader("Possible Maqāmāt", "possibleMaqamatCount")}
              {renderSortableHeader("Possible Maqāmāt Transpositions", "possibleMaqamatTranspositionsCount")}
              {renderSortableHeader("Total Suyūr", "totalSuyur")}
              {renderSortableHeader("Total Possible Ajnās Modulations", "totalAjnasModulations")}
              {renderSortableHeader("Total Possible Maqāmāt Modulations", "totalMaqamatModulations")}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                className={selectedRowId === row.id ? "selected-row" : ""}
                onClick={() => setSelectedRowId(selectedRowId === row.id ? null : row.id)}
              >
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
      <Footer />
    </div>
  );
}