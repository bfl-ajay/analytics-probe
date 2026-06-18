"use client";

import { useState } from "react";
import DatabaseConnectionModal from "@/components/DatabaseConnectionModal";
import ReportBuilder from "@/components/ReportBuilder";
import type { DatabaseConnection } from "@/types";

export default function Home() {
  const [dbConnection, setDbConnection] = useState<DatabaseConnection | null>(
    null
  );

  const handleConnect = (connection: DatabaseConnection) => {
    setDbConnection(connection);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!dbConnection ? (
        <DatabaseConnectionModal onConnect={handleConnect} />
      ) : (
        <ReportBuilder dbConnection={dbConnection} />
      )}
    </main>
  );
}
