import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const {
      dbConnection,
      table,
      columns,
      limit = 50,
    } = await request.json();

    if (!dbConnection || !table) {
      return NextResponse.json(
        { message: "Missing database connection or table name" },
        { status: 400 }
      );
    }

    const data = await executeQuery(
      dbConnection,
      table,
      columns || [],
      limit
    );

    return NextResponse.json({
      success: true,
      data,
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
