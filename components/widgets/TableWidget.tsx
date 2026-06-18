"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import type {
  DatabaseConnection,
  DatabaseTable,
  ReportWidget,
  TableConfig,
} from "@/types";

interface TableWidgetProps {
  widget: ReportWidget;
  tables: DatabaseTable[];
  dbConnection: DatabaseConnection | null;
}

export default function TableWidget({
  widget,
  tables,
  dbConnection,
}: TableWidgetProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = widget.config as TableConfig;
  const selectedTable = tables.find((t) => t.name === config.table);
  const displayColumns =
    config.columns && config.columns.length > 0
      ? config.columns
      : selectedTable?.columns.map((c) => c.name) || [];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbConnection,
          table: config.table,
          columns: displayColumns,
          limit: config.limit || 50,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load data");
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.table && dbConnection) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table, config.columns, config.limit, dbConnection]);

  if (!config.table) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Configure table: select a table and columns to display
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading table data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-600">No data available</p>
      </div>
    );
  }

  const columns =
    displayColumns && displayColumns.length > 0
      ? displayColumns
      : Object.keys(data[0] || {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-200 border-b-2 border-gray-300">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2 text-left font-semibold text-gray-900"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 hover:bg-gray-100 transition"
            >
              {columns.map((col) => (
                <td key={`${idx}-${col}`} className="px-4 py-2 text-gray-700">
                  {row[col] !== null && row[col] !== undefined
                    ? String(row[col]).substring(0, 50)
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 20 && (
        <div className="p-4 text-center text-xs text-gray-600 bg-gray-100">
          Showing 20 of {data.length} rows
        </div>
      )}
    </div>
  );
}
