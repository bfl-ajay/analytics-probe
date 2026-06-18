"use client";

import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DatabaseTable, ReportWidget } from "@/types";

interface WidgetConfigPanelProps {
  widget: ReportWidget;
  tables: DatabaseTable[];
  onClose: () => void;
  onUpdate: (updates: Partial<ReportWidget>) => void;
}

export default function WidgetConfigPanel({
  widget,
  tables,
  onClose,
  onUpdate,
}: WidgetConfigPanelProps) {
  const [title, setTitle] = useState(widget.title);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["general"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const selectedTable = tables.find((t) => t.name === widget.config.table);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Widget Config</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* General Settings */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("general")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <span className="font-medium text-gray-900">General</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedSections.has("general") ? "" : "-rotate-90"
              }`}
            />
          </button>

          {expandedSections.has("general") && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Widget Type
                </label>
                <p className="text-sm text-gray-600 capitalize">
                  {widget.type === "chart" ? "Chart" : "Table"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Data Source */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("data")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <span className="font-medium text-gray-900">Data Source</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedSections.has("data") ? "" : "-rotate-90"
              }`}
            />
          </button>

          {expandedSections.has("data") && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Table
                </label>
                <select
                  value={widget.config.table}
                  onChange={(e) => {
                    onUpdate({
                      config: {
                        ...widget.config,
                        table: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select table...</option>
                  {tables.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTable && widget.type === "chart" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      X-Axis Column
                    </label>
                    <select
                      value={(widget.config as any).xAxis || ""}
                      onChange={(e) => {
                        onUpdate({
                          config: {
                            ...widget.config,
                            xAxis: e.target.value,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select column...</option>
                      {selectedTable.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Y-Axis Column
                    </label>
                    <select
                      value={(widget.config as any).yAxis || ""}
                      onChange={(e) => {
                        onUpdate({
                          config: {
                            ...widget.config,
                            yAxis: e.target.value,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select column...</option>
                      {selectedTable.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Chart Type
                    </label>
                    <select
                      value={(widget.config as any).chartType || "bar"}
                      onChange={(e) => {
                        onUpdate({
                          config: {
                            ...widget.config,
                            chartType: e.target.value as any,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="area">Area Chart</option>
                    </select>
                  </div>
                </>
              )}

              {selectedTable && widget.type === "table" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Columns to Display
                  </label>
                  <div className="space-y-2">
                    {selectedTable.columns.map((c) => (
                      <label
                        key={c.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(
                            (widget.config as any).columns || []
                          ).includes(c.name)}
                          onChange={(e) => {
                            const current = (widget.config as any).columns || [];
                            const updated = e.target.checked
                              ? [...current, c.name]
                              : current.filter((col: string) => col !== c.name);
                            onUpdate({
                              config: {
                                ...widget.config,
                                columns: updated,
                              },
                            });
                          }}
                          className="rounded"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Styling */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("style")}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
          >
            <span className="font-medium text-gray-900">Styling</span>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedSections.has("style") ? "" : "-rotate-90"
              }`}
            />
          </button>

          {expandedSections.has("style") && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-gray-500">
                Styling options coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
