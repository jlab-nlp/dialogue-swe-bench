import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";

const NUMERIC_KEYS = new Set(["resolved_pct", "avg_turns", "avg_steps", "avg_cost"]);

function SortIcon({ direction }) {
  if (!direction) return <span style={{ opacity: 0.25, marginLeft: 4 }}>⇅</span>;
  return (
    <span style={{ marginLeft: 4 }}>
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

function formatValue(key, value) {
  if (value === "" || value == null) return "";
  if (key === "resolved_pct") return `${parseFloat(value).toFixed(1)}%`;
  if (key === "avg_cost") return `$${parseFloat(value).toFixed(2)}`;
  if (key === "avg_turns" || key === "avg_steps") return parseFloat(value).toFixed(1);
  if (key === "open_weights") return value === "True" ? "✓" : "✗";
  return value;
}

export default function ResultsTable({ csvPath, columns }) {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  console.log("Starting CSV fetch for:", csvPath);
  if (!csvPath) return;
  setLoading(true);
  console.log("Fetching:", csvPath);
  fetch(csvPath)
    .then((res) => {
      console.log("Response status:", res.status, res.ok);
      if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`);
      return res.text();
    })
    .then((text) => {
      console.log("Raw CSV text (first 200 chars):", text.slice(0, 200));
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        transform: (val) => val.trim(),
      });
      console.log("Parsed rows:", result.data.length, result.meta.fields);
      setHeaders(result.meta.fields ?? []);
      setRows(result.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setError(err.message);
      setLoading(false);
    });
}, [csvPath]);

  // Use provided columns, or fall back to all CSV headers
  const displayCols = columns ?? headers.map((h) => ({ key: h, label: h }));

  const handleSort = useCallback(
    (key) => {
      if (sortCol === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(key);
        setSortDir("asc");
      }
    },
    [sortCol]
  );

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortCol) return 0;
    const av = a[sortCol] ?? "";
    const bv = b[sortCol] ?? "";
    const isNum = NUMERIC_KEYS.has(sortCol);
    const ap = isNum ? parseFloat(av) : av.toLowerCase();
    const bp = isNum ? parseFloat(bv) : bv.toLowerCase();
    if (ap < bp) return sortDir === "asc" ? -1 : 1;
    if (ap > bp) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div style={styles.wrapper}>
      {loading && <p style={styles.status}>Loading…</p>}
      {error && <p style={{ ...styles.status, color: "#c0392b" }}>{error}</p>}
      {!loading && !error && (
        <div style={styles.scrollContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {displayCols.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{
                      ...styles.th,
                      ...(sortCol === key ? styles.thActive : {}),
                    }}
                  >
                    {label}
                    <SortIcon direction={sortCol === key ? sortDir : null} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr key={i} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  {displayCols.map(({ key }) => (
                    <td key={key} style={styles.td}>
                      {formatValue(key, row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: "0.9rem",
    margin: "2rem 0",
  },
  status: {
    color: "#666",
    fontStyle: "italic",
  },
  scrollContainer: {
    overflowX: "auto",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 600,
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    color: "#374151",
  },
  thActive: {
    background: "#eef2ff",
    color: "#4338ca",
  },
  td: {
    padding: "9px 14px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    whiteSpace: "nowrap",
  },
  rowEven: {
    background: "#ffffff",
  },
  rowOdd: {
    background: "#f8fafc",
  },
};