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
} from "lucide-react";
import type { DatabaseConnection, DatabaseTable, ReportWidget } from "@/types";
import SchemaExplorer from "./SchemaExplorer";
import ReportCanvas from "./ReportCanvas";

interface ReportBuilderProps {
  dbConnection: DatabaseConnection | null;
}

export default function ReportBuilder({ dbConnection }: ReportBuilderProps) {
  const [reportName, setReportName] = useState("Untitled Report");
  const [reportDescription, setReportDescription] = useState("");
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSchema, setShowSchema] = useState(true);
  const [activeTab, setActiveTab] = useState<"design" | "preview">("design");
  const [editingReport, setEditingReport] = useState(false);

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

  useEffect(() => {
    if (dbConnection) {
      loadSchema();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbConnection]);

  const addWidget = (type: "chart" | "table") => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `${type === "chart" ? "Chart" : "Table"} ${widgets.length + 1}`,
      config:
        type === "chart"
          ? {
              chartType: "bar",
              table: tables[0]?.name || "",
              xAxis: "",
              yAxis: "",
            }
          : {
              table: tables[0]?.name || "",
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
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
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
        {showSchema && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
            <SchemaExplorer
              tables={tables}
              loading={loading}
              error={error}
              onRefresh={loadSchema}
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
              {showSchema ? "Hide" : "Show"} Schema
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
          />
        </div>
      </div>
    </div>
  );
}
