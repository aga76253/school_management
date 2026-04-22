import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();

  try {
    await dbConnect();

    return NextResponse.json(
      {
        status: "ok",
        service: "up",
        database: "up",
        timestamp: now,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "up",
        database: "down",
        timestamp: now,
      },
      { status: 503 }
    );
  }
}
