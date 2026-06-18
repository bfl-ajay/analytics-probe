"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  Filter as FilterIcon,
  Play,
  AlertCircle,
  Loader,
  AlertTriangle,
} from "lucide-react";
import type {
  DatabaseTable,
  DataModel,
  QueryColumn,
  QueryFilter,
  DatabaseConnection,
} from "@/types";

interface QueryBuilderProps {
  dataModel: DataModel;
  tables: DatabaseTable[];
  dbConnection: DatabaseConnection | null;
  onQuerySave: (
    columns: QueryColumn[],
    filters: QueryFilter[],
    groupBy: string[]
  ) => void;
}

export default function QueryBuilder({
  dataModel,
  tables,
  dbConnection,
  onQuerySave,
}: QueryBuilderProps) {
  const [selectedColumns, setSelectedColumns] = useState<QueryColumn[]>([]);
  const [filters, setFilters] = useState<QueryFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(
    new Set(dataModel.tables.slice(0, 2))
  );
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [newFilter, setNewFilter] = useState({
    table: dataModel.tables[0] || "",
    column: "",
    operator: "=" as "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "between",
    value: "",
  });

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const addColumn = (table: string, column: string) => {
    const newColumn: QueryColumn = {
      table,
      column,
      aggregation: "none",
    };
    setSelectedColumns([...selectedColumns, newColumn]);
  };

  const updateColumn = (
    index: number,
    updates: Partial<QueryColumn>
  ) => {
    const updated = [...selectedColumns];
    updated[index] = { ...updated[index], ...updates };
    setSelectedColumns(updated);
  };

  const removeColumn = (index: number) => {
    setSelectedColumns(selectedColumns.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    if (!newFilter.column || !newFilter.value) return;
    const filter: QueryFilter = {
      table: newFilter.table,
      column: newFilter.column,
      operator: newFilter.operator,
      value:
        newFilter.operator === "between"
          ? newFilter.value.split(",").map((v) => v.trim())
          : newFilter.value,
    };
    setFilters([...filters, filter]);
    setNewFilter({
      table: dataModel.tables[0] || "",
      column: "",
      operator: "=" as "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN" | "between",
      value: "",
    });
    setShowFilterForm(false);
  };

  const toggleGroupBy = (columnId: string) => {
    const newGroupBy = new Set(groupBy);
    if (newGroupBy.has(columnId)) {
      newGroupBy.delete(columnId);
    } else {
      newGroupBy.add(columnId);
    }
    setGroupBy(Array.from(newGroupBy));
  };

  const selectedTable = tables.find(
    (t) => t.name === newFilter.table
  );

  // Validation logic
  const getValidationIssues = (): string[] => {
    const issues: string[] = [];
    if (selectedColumns.length === 0) {
      issues.push("Select at least one column");
    }
    if (dataModel.relationships.length > 1 && selectedColumns.length < 2) {
      issues.push(
        "Multiple relationships detected - consider selecting columns from different tables"
      );
    }
    return issues;
  };

  const validationIssues = getValidationIssues();
  const isValid = validationIssues.length === 0;

  // Run preview of the query
  const runPreview = async () => {
    if (!isValid || !dbConnection) {
      setPreviewError("Fix validation issues before running preview");
      return;
    }

    try {
      setPreviewLoading(true);
      setPreviewError("");

      const response = await fetch("/api/database/complex-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dbConnection,
          dataModel: {
            ...dataModel,
            createdAt: new Date(),
          },
          columns: selectedColumns,
          filters,
          groupBy: groupBy.length > 0 ? groupBy : undefined,
          limit: 10, // Preview shows first 10 rows
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to load preview");
      }

      const result = await response.json();
      setPreviewData(result.data || []);
      setShowPreview(true);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Failed to load preview");
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Available Tables */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Available Tables</h3>
          <div className="space-y-2">
            {dataModel.tables.map((tableName) => {
              const tableData = tables.find((t) => t.name === tableName);
              return (
                <div key={tableName} className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleTableExpansion(tableName)}
                    className="w-full p-3 hover:bg-gray-50 flex items-center gap-2 text-left transition"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition ${
                        expandedTables.has(tableName) ? "" : "-rotate-90"
                      }`}
                    />
                    <span className="font-medium text-gray-900">
                      {tableName}
                    </span>
                  </button>

                  {expandedTables.has(tableName) && tableData && (
                    <div className="bg-gray-50 border-t border-gray-200 divide-y divide-gray-200">
                      {tableData.columns.map((col) => (
                        <button
                          key={`${tableName}-${col.name}`}
                          onClick={() => addColumn(tableName, col.name)}
                          className="w-full p-3 text-left text-sm hover:bg-blue-50 transition flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {col.name}
                            </p>
                            <p className="text-xs text-gray-500">{col.type}</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Columns & Configuration */}
        <div className="col-span-2 space-y-6">
          {/* Columns */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Selected Columns ({selectedColumns.length})
            </h3>
            {selectedColumns.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-600">
                <p>Select columns from the left panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedColumns.map((col, idx) => (
                  <div
                    key={`${col.table}-${col.column}-${idx}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {col.table}.{col.column}
                      </p>
                      <p className="text-xs text-gray-500">
                        {col.alias ? `Alias: ${col.alias}` : "No alias"}
                      </p>
                    </div>

                    <select
                      value={col.aggregation || "none"}
                      onChange={(e) =>
                        updateColumn(idx, {
                          aggregation: e.target.value as any,
                        })
                      }
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="none">No Aggregation</option>
                      <option value="sum">SUM</option>
                      <option value="avg">AVG</option>
                      <option value="count">COUNT</option>
                      <option value="min">MIN</option>
                      <option value="max">MAX</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Alias (optional)"
                      value={col.alias || ""}
                      onChange={(e) => updateColumn(idx, { alias: e.target.value })}
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none w-32"
                    />

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={groupBy.includes(
                          `${col.table}.${col.column}`
                        )}
                        onChange={() =>
                          toggleGroupBy(`${col.table}.${col.column}`)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-600">Group</span>
                    </label>

                    <button
                      onClick={() => removeColumn(idx)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FilterIcon className="w-4 h-4" />
                Filters ({filters.length})
              </h3>
              <button
                onClick={() => setShowFilterForm(!showFilterForm)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                + Add Filter
              </button>
            </div>

            {showFilterForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <select
                    value={newFilter.table}
                    onChange={(e) =>
                      setNewFilter({ ...newFilter, table: e.target.value, column: "" })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {dataModel.tables.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newFilter.column}
                    onChange={(e) =>
                      setNewFilter({ ...newFilter, column: e.target.value })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select column...</option>
                    {selectedTable?.columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newFilter.operator}
                    onChange={(e) =>
                      setNewFilter({
                        ...newFilter,
                        operator: e.target.value as any,
                      })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value={">"}>{`>`}</option>
                    <option value={"<"}>{`<`}</option>
                    <option value=">=">{`>=`}</option>
                    <option value="<=">{`<=`}</option>
                    <option value="LIKE">LIKE</option>
                    <option value="IN">IN</option>
                    <option value="between">BETWEEN</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Value"
                    value={newFilter.value}
                    onChange={(e) =>
                      setNewFilter({ ...newFilter, value: e.target.value })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addFilter}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowFilterForm(false)}
                    className="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {filters.length > 0 && (
              <div className="space-y-2">
                {filters.map((filter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded"
                  >
                    <span className="text-sm text-gray-800">
                      <span className="font-medium">{filter.table}.{filter.column}</span>
                      {" "}
                      <span className="text-gray-600">{filter.operator}</span>
                      {" "}
                      <span className="font-medium">
                        {Array.isArray(filter.value)
                          ? filter.value.join(", ")
                          : filter.value}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        setFilters(filters.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Validation Messages */}
            {validationIssues.length > 0 && (
              <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 mb-1">
                    Query Issues:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {validationIssues.map((issue, idx) => (
                      <li key={idx}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={runPreview}
                disabled={!isValid || !dbConnection || previewLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
              >
                {previewLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Preview
                  </>
                )}
              </button>
              <button
                onClick={() => onQuerySave(selectedColumns, filters, groupBy)}
                disabled={!isValid}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Use This Query for Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              Data Preview (First 10 Rows)
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Hide Preview
            </button>
          </div>

          {previewError && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Preview Error:</p>
                <p className="text-sm text-red-800">{previewError}</p>
              </div>
            </div>
          )}

          {previewLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {!previewLoading && previewData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    {Object.keys(previewData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left font-semibold text-gray-900"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      {Object.entries(row).map(([key, value]) => (
                        <td
                          key={`${idx}-${key}`}
                          className="px-4 py-2 text-gray-700"
                        >
                          {value !== null && value !== undefined
                            ? String(value).substring(0, 100)
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-xs text-gray-600">
                Showing {previewData.length} rows
              </div>
            </div>
          )}

          {!previewLoading && previewData.length === 0 && !previewError && (
            <div className="text-center py-8 text-gray-600">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p>No data returned for this query</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
