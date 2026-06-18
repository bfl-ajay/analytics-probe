import { NextRequest, NextResponse } from "next/server";
import { getDatabaseSchema } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const dbConfig = await request.json();

    if (!dbConfig.host || !dbConfig.username || !dbConfig.database) {
      return NextResponse.json(
        { message: "Missing required database configuration" },
        { status: 400 }
      );
    }

    const schema = await getDatabaseSchema(dbConfig);

    return NextResponse.json({
      success: true,
      tables: schema,
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
