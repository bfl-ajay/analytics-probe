"use client";

import { useState } from "react";
import {
  Database,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  CheckCircle,
} from "lucide-react";
import type { DatabaseConnection } from "@/types";

interface DatabaseConnectionModalProps {
  onConnect: (connection: DatabaseConnection) => void;
}

type ConnectionMethod = "form" | "string";

export default function DatabaseConnectionModal({
  onConnect,
}: DatabaseConnectionModalProps) {
  const [method, setMethod] = useState<ConnectionMethod>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form method state
  const [formData, setFormData] = useState({
    host: "",
    port: 3306,
    username: "",
    password: "",
    database: "",
  });

  // Connection string method state
  const [connectionString, setConnectionString] = useState("");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "port" ? parseInt(value) : value,
    }));
    setError("");
  };

  const parseConnectionString = (connStr: string): DatabaseConnection | null => {
    try {
      const match = connStr.match(
        /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/
      );
      if (!match) {
        throw new Error(
          "Invalid connection string format. Use: mysql://user:pass@host:port/database"
        );
      }
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
      };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse connection string"
      );
      return null;
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let connection: DatabaseConnection;

      if (method === "form") {
        if (
          !formData.host ||
          !formData.username ||
          !formData.password ||
          !formData.database
        ) {
          throw new Error("Please fill in all required fields");
        }
        connection = formData;
      } else {
        if (!connectionString.trim()) {
          throw new Error("Please enter a connection string");
        }
        const parsed = parseConnectionString(connectionString);
        if (!parsed) throw new Error("Failed to parse connection string");
        connection = parsed;
      }

      // Test connection
      const response = await fetch("/api/database/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connection),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to connect to database");
      }

      setSuccess(true);
      setTimeout(() => {
        onConnect(connection);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during connection"
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Report Builder
          </h1>
          <p className="text-gray-600">
            Connect your MySQL database to get started
          </p>
        </div>

        {/* Connection Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setMethod("form");
                setError("");
              }}
              className={`pb-3 px-4 font-medium text-sm transition-colors ${
                method === "form"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Connection Form
            </button>
            <button
              onClick={() => {
                setMethod("string");
                setError("");
              }}
              className={`pb-3 px-4 font-medium text-sm transition-colors ${
                method === "string"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Connection String
            </button>
          </div>

          <form onSubmit={handleConnect}>
            {method === "form" ? (
              // Form Method
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={formData.host}
                    onChange={handleFormChange}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port
                    </label>
                    <input
                      type="number"
                      name="port"
                      value={formData.port}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database
                    </label>
                    <input
                      type="text"
                      name="database"
                      value={formData.database}
                      onChange={handleFormChange}
                      placeholder="mydb"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    placeholder="root"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Connection String Method
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection String
                </label>
                <textarea
                  value={connectionString}
                  onChange={(e) => {
                    setConnectionString(e.target.value);
                    setError("");
                  }}
                  placeholder="mysql://user:password@localhost:3306/database"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Format: mysql://user:password@host:port/database
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Connection successful! Redirecting...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2.5 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? "Testing Connection..." : "Connect Database"}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>Tip:</strong> Make sure your database is accessible. For
              local testing, ensure MySQL is running. We never store your
              credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
