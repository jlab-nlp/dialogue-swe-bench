import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const NUMERIC_KEYS = new Set(["resolved_pct", "avg_turns", "avg_steps", "avg_cost"]);

function formatValue(key, value) {
  if (value === "" || value == null) return "";
  if (key === "resolved_pct") return `${parseFloat(value).toFixed(1)}%`;
  if (key === "avg_cost") return `$${parseFloat(value).toFixed(2)}`;
  if (key === "avg_turns" || key === "avg_steps") return parseFloat(value).toFixed(1);
  if (key === "open_weights") return value === "True" ? "✓" : "✗";
  return value;
}

export default function ResultsTable({ csvPath, additionalCsvPath, columns: columnDefs }) {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    if (!csvPath) return;
    setLoading(true);

    const fetchCsv = (path) =>
      fetch(path)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`);
          return res.text();
        })
        .then((text) =>
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            transform: (val) => val.trim(),
          })
        );

    const fetches = [fetchCsv(csvPath)];
    if (additionalCsvPath) fetches.push(fetchCsv(additionalCsvPath));

    Promise.all(fetches)
      .then(([main, extra]) => {
        setHeaders(main.meta.fields ?? []);
        main.data.forEach(row => {
          row.agent_name = row.agent_name + "^";
        });
        const combined = [
          ...main.data,
          ...(extra?.data ?? []),
        ];
        setRows(combined);
        console.log(combined);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [csvPath, additionalCsvPath]);

  const displayCols = columnDefs ?? headers.map((h) => ({ key: h, label: h }));

  const columns = useMemo(
    () =>
      displayCols.map(({ key, label }) => ({
        accessorKey: key,
        header: label,
        cell: (info) => formatValue(key, info.getValue()),
        sortingFn: NUMERIC_KEYS.has(key) ? "basic" : "alphanumeric",
      })),
    [displayCols.map((c) => c.key).join(",")]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={s.wrapper}>
      {loading && <p style={s.status}>Loading…</p>}
      {error && <p style={{ ...s.status, color: "#b91c1c" }}>{error}</p>}
      {!loading && !error && (
        <div style={s.scroll}>
          <table style={s.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={s.th}
                      >
                        <span style={s.thInner}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span style={s.sortIcon}>
                            {sorted === "asc" ? " ▲" : sorted === "desc" ? " ▼" : " ⇅"}
                          </span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={i % 2 === 0 ? s.rowEven : s.rowOdd}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      i % 2 === 0 ? s.rowEven.background : s.rowOdd.background)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={s.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

const s = {
  wrapper: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: "0.9rem",
    margin: "2rem 0",
  },
  status: {
    color: "#888",
    fontStyle: "italic",
  },
  scroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 500,
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    background: "#d1d5db",
    fontWeight: 700,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    color: "#111827",
    borderBottom: "2px solid #9ca3af",
  },
  thInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  sortIcon: {
    opacity: 0.6,
    fontSize: "0.75rem",
  },
  td: {
    padding: "11px 16px",
    borderBottom: "1px solid #e5e7eb",
    color: "#1f2937",
    whiteSpace: "nowrap",
  },
  rowEven: {
    background: "#ffffff",
    transition: "background 0.1s",
  },
  rowOdd: {
    background: "#f9fafb",
    transition: "background 0.1s",
  },
};