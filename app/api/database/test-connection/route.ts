import { NextRequest, NextResponse } from "next/server";
import { testDatabaseConnection } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const dbConfig = await request.json();

    // Validate required fields
    if (!dbConfig.host || !dbConfig.username || !dbConfig.database) {
      return NextResponse.json(
        { message: "Missing required database configuration" },
        { status: 400 }
      );
    }

    await testDatabaseConnection(dbConfig);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
