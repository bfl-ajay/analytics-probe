"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  LogOut,
  Settings,
  Download,
  Eye,
  BarChart3,
  Table as TableIcon,
  ArrowLeft,
} from "lucide-react";
import type {
  DatabaseConnection,
  DatabaseTable,
  ReportWidget,
  DataModel,
  QueryColumn,
  QueryFilter,
} from "@/types";
import DataModelBuilder from "./DataModelBuilder";
import QueryBuilder from "./QueryBuilder";
import SchemaExplorer from "./SchemaExplorer";
import ReportCanvas from "./ReportCanvas";

interface ReportBuilderProps {
  dbConnection: DatabaseConnection | null;
}

type BuilderStep = "select-model" | "build-model" | "build-query" | "create-report";

export default function ReportBuilder({ dbConnection }: ReportBuilderProps) {
  const [reportName, setReportName] = useState("Untitled Report");
  const [reportDescription, setReportDescription] = useState("");
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSchema, setShowSchema] = useState(true);
  const [editingReport, setEditingReport] = useState(false);

  // Data modeling state
  const [currentStep, setCurrentStep] = useState<BuilderStep>("build-model");
  const [dataModel, setDataModel] = useState<DataModel | null>(null);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);

  useEffect(() => {
    if (dbConnection) {
      loadSchema();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbConnection]);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/database/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbConnection),
      });

      if (!response.ok) {
        throw new Error("Failed to load database schema");
      }

      const data = await response.json();
      setTables(data.tables || []);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load schema"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModelCreate = (model: DataModel) => {
    setDataModel(model);
    setCurrentStep("build-query");
  };

  const handleQuerySave = (
    columns: QueryColumn[],
    filters: QueryFilter[],
    groupBy: string[]
  ) => {
    const query = {
      id: `query-${Date.now()}`,
      name: `Query ${savedQueries.length + 1}`,
      columns,
      filters,
      groupBy,
    };
    setSavedQueries([...savedQueries, query]);
    setCurrentStep("create-report");
  };

  const addWidget = (type: "chart" | "table" | "kpi") => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `${type === "chart" ? "Chart" : type === "table" ? "Table" : "KPI"} ${
        widgets.length + 1
      }`,
      config:
        type === "chart"
          ? {
              chartType: "bar",
              dimension: { table: "", column: "" },
              measure: { table: "", column: "", aggregation: "sum" },
            }
          : type === "kpi"
            ? {
                measure: { table: "", column: "", aggregation: "sum" },
              }
            : {
                columns: [],
              },
      position: widgets.length,
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<ReportWidget>) => {
    setWidgets(
      widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  // Step 1: Build Data Model
  if (currentStep === "build-model" && !dataModel) {
    return (
      <DataModelBuilder
        tables={tables}
        onModelCreate={handleModelCreate}
        onCancel={() => window.location.reload()}
      />
    );
  }

  // Step 2: Build Query
  if (currentStep === "build-query" && dataModel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-6">
            <button
              onClick={() => setCurrentStep("build-model")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Data Model
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Query Builder
            </h1>
            <p className="text-gray-600">
              {dataModel.name} • {dataModel.tables.length} table
              {dataModel.tables.length > 1 ? "s" : ""}
            </p>
          </div>

          <QueryBuilder
            dataModel={dataModel}
            tables={tables}
            dbConnection={dbConnection}
            onQuerySave={handleQuerySave}
          />
        </div>
      </div>
    );
  }

  // Step 3: Create Report
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {editingReport ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 w-full px-2 py-1 border border-gray-300 rounded"
                  />
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Add description..."
                    className="text-sm text-gray-600 w-full px-2 py-1 border border-gray-300 rounded resize-none"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {reportName}
                  </h1>
                  <p className="text-sm text-gray-600">{reportDescription}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Data Model: {dataModel?.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep("build-query")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Edit query"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setEditingReport(!editingReport)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Edit report info"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Preview report"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Export report"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
                title="Disconnect database"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Panel */}
        {showSchema && dataModel && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                Data Model Tables
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {dataModel.tables.join(", ")}
              </p>
            </div>
            <SchemaExplorer
              tables={tables.filter((t) => dataModel.tables.includes(t.name))}
              loading={false}
              error=""
              onRefresh={() => {}}
            />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => setShowSchema(!showSchema)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition border border-gray-200"
            >
              {showSchema ? "Hide" : "Show"} Model
            </button>

            <div className="flex-1 flex gap-2">
              <button
                onClick={() => addWidget("chart")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
              >
                <BarChart3 className="w-4 h-4" />
                Add Chart
              </button>
              <button
                onClick={() => addWidget("table")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition"
              >
                <TableIcon className="w-4 h-4" />
                Add Table
              </button>
              <button
                onClick={() => addWidget("kpi")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add KPI
              </button>
            </div>

            <div className="text-sm text-gray-600">
              {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Canvas */}
          <ReportCanvas
            widgets={widgets}
            tables={tables}
            onUpdateWidget={updateWidget}
            onRemoveWidget={removeWidget}
            dbConnection={dbConnection}
            dataModel={dataModel}
          />
        </div>
      </div>
    </div>
  );
}
