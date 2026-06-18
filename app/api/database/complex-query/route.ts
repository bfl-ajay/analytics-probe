import { NextRequest, NextResponse } from "next/server";
import { executeComplexQuery } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const {
      dbConnection,
      dataModel,
      columns,
      filters,
      groupBy,
      limit = 1000,
    } = await request.json();

    if (!dbConnection || !dataModel || !columns) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const data = await executeComplexQuery(
      dbConnection,
      dataModel,
      columns,
      filters || [],
      groupBy || [],
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
