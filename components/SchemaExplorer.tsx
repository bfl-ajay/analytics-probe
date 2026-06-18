"use client";

import { useState } from "react";
import { ChevronDown, Database, Columns, RefreshCw, AlertCircle } from "lucide-react";
import type { DatabaseTable } from "@/types";

interface SchemaExplorerProps {
  tables: DatabaseTable[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

export default function SchemaExplorer({
  tables,
  loading,
  error,
  onRefresh,
}: SchemaExplorerProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(
    new Set(tables.slice(0, 3).map((t) => t.name))
  );

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getColumnIcon = (type: string) => {
    if (type.includes("int")) return "🔢";
    if (type.includes("varchar") || type.includes("text")) return "📝";
    if (type.includes("date") || type.includes("time")) return "📅";
    if (type.includes("float") || type.includes("decimal")) return "💱";
    if (type.includes("boolean")) return "✓";
    return "📊";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Schema
          </h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Refresh schema"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border-b border-red-200 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading schema...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tables found in database</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tables.map((table) => (
              <div key={table.name} className="bg-white">
                <button
                  onClick={() => toggleTableExpansion(table.name)}
                  className="w-full p-3 hover:bg-gray-50 flex items-center gap-2 transition text-left"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition ${
                      expandedTables.has(table.name) ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {table.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {table.columns.length}
                  </span>
                </button>

                {expandedTables.has(table.name) && (
                  <div className="bg-gray-50 border-t border-gray-200 divide-y divide-gray-200">
                    {table.columns.map((column) => (
                      <div
                        key={`${table.name}-${column.name}`}
                        className="p-3 pl-10 hover:bg-gray-100 transition"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "copy";
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              table: table.name,
                              column: column.name,
                              type: column.type,
                            })
                          );
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getColumnIcon(column.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900">
                              {column.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {column.type}
                              {column.nullable ? " (nullable)" : " (required)"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
