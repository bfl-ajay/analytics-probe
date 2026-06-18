"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import type {
  DatabaseTable,
  DataModel,
  TableRelationship,
} from "@/types";

interface DataModelBuilderProps {
  tables: DatabaseTable[];
  onModelCreate: (model: DataModel) => void;
  onCancel: () => void;
}

export default function DataModelBuilder({
  tables,
  onModelCreate,
  onCancel,
}: DataModelBuilderProps) {
  const [modelName, setModelName] = useState("My Data Model");
  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    new Set()
  );
  const [relationships, setRelationships] = useState<TableRelationship[]>([]);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(
    new Set()
  );
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    fromTable: "",
    toTable: "",
    fromColumn: "",
    toColumn: "",
    type: "left" as const,
  });

  const toggleTableSelection = (tableName: string) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName);
      setRelationships(
        relationships.filter(
          (r) => r.fromTable !== tableName && r.toTable !== tableName
        )
      );
    } else {
      newSelected.add(tableName);
    }
    setSelectedTables(newSelected);
  };

  const addRelationship = () => {
    if (
      !newRelationship.fromTable ||
      !newRelationship.toTable ||
      !newRelationship.fromColumn ||
      !newRelationship.toColumn
    ) {
      return;
    }

    const relationship: TableRelationship = {
      id: `rel-${Date.now()}`,
      fromTable: newRelationship.fromTable,
      toTable: newRelationship.toTable,
      fromColumn: newRelationship.fromColumn,
      toColumn: newRelationship.toColumn,
      type: newRelationship.type,
    };

    setRelationships([...relationships, relationship]);
    setNewRelationship({
      fromTable: "",
      toTable: "",
      fromColumn: "",
      toColumn: "",
      type: "left",
    });
    setShowRelationshipForm(false);
  };

  const handleCreateModel = () => {
    if (selectedTables.size === 0) {
      alert("Select at least one table");
      return;
    }

    const model: DataModel = {
      id: `model-${Date.now()}`,
      name: modelName,
      tables: Array.from(selectedTables),
      relationships,
      createdAt: new Date(),
    };

    onModelCreate(model);
  };

  const fromTableData = tables.find(
    (t) => t.name === newRelationship.fromTable
  );
  const toTableData = tables.find((t) => t.name === newRelationship.toTable);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Build Your Data Model
          </h1>
          <p className="text-gray-600">
            Select tables and define relationships between them
          </p>
        </div>

        {/* Model Name */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Name
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Name your data model"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Tables Selection */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Tables
              </h2>
              <div className="space-y-3">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTables.has(table.name)}
                        onChange={() => toggleTableSelection(table.name)}
                        className="mt-1 w-4 h-4 rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedTables);
                            if (newExpanded.has(table.name)) {
                              newExpanded.delete(table.name);
                            } else {
                              newExpanded.add(table.name);
                            }
                            setExpandedTables(newExpanded);
                          }}
                          className="font-medium text-gray-900 flex items-center gap-2 hover:text-blue-600"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition ${
                              expandedTables.has(table.name)
                                ? ""
                                : "-rotate-90"
                            }`}
                          />
                          {table.name}
                          <span className="text-xs text-gray-500">
                            ({table.columns.length} columns)
                          </span>
                        </button>

                        {expandedTables.has(table.name) && (
                          <div className="mt-3 pl-6 space-y-2 text-sm">
                            {table.columns.map((col) => (
                              <div
                                key={col.name}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <span className="text-gray-400">•</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {col.name}
                                </span>
                                <span className="text-gray-500">
                                  {col.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tables Selected</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedTables.size}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relationships</p>
                  <p className="text-2xl font-bold text-green-600">
                    {relationships.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Table Relationships (JOINs)
            </h2>
            <button
              onClick={() => setShowRelationshipForm(!showRelationshipForm)}
              disabled={selectedTables.size < 2}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-4 h-4" />
              Add Relationship
            </button>
          </div>

          {selectedTables.size < 2 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Select at least 2 tables to define relationships
              </p>
            </div>
          )}

          {/* Relationship Form */}
          {showRelationshipForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="grid grid-cols-5 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    From Table
                  </label>
                  <select
                    value={newRelationship.fromTable}
                    onChange={(e) =>
                      setNewRelationship({
                        ...newRelationship,
                        fromTable: e.target.value,
                        fromColumn: "",
                      })
                    }
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select...</option>
                    {Array.from(selectedTables).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Column
                  </label>
                  <select
                    value={newRelationship.fromColumn}
                    onChange={(e) =>
                      setNewRelationship({
                        ...newRelationship,
                        fromColumn: e.target.value,
                      })
                    }
                    disabled={!fromTableData}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {fromTableData?.columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">
                    To Table
                  </label>
                  <select
                    value={newRelationship.toTable}
                    onChange={(e) =>
                      setNewRelationship({
                        ...newRelationship,
                        toTable: e.target.value,
                        toColumn: "",
                      })
                    }
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select...</option>
                    {Array.from(selectedTables).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Column
                  </label>
                  <select
                    value={newRelationship.toColumn}
                    onChange={(e) =>
                      setNewRelationship({
                        ...newRelationship,
                        toColumn: e.target.value,
                      })
                    }
                    disabled={!toTableData}
                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  >
                    <option value="">Select...</option>
                    {toTableData?.columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Join Type
                  </label>
                  <select
                    value={newRelationship.type}
                    onChange={(e) =>
                      setNewRelationship({
                        ...newRelationship,
                        type: e.target.value as any,
                      })
                    }
                    className="mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="inner">Inner Join</option>
                    <option value="left">Left Join</option>
                    <option value="right">Right Join</option>
                    <option value="full">Full Outer Join</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addRelationship}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowRelationshipForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Relationships List */}
          {relationships.length > 0 && (
            <div className="space-y-2">
              {relationships.map((rel) => (
                <div
                  key={rel.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-900">
                      {rel.fromTable}.{rel.fromColumn}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {rel.toTable}.{rel.toColumn}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                      {rel.type.toUpperCase()} JOIN
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setRelationships(
                        relationships.filter((r) => r.id !== rel.id)
                      )
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
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCreateModel}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium"
          >
            Create Data Model
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
