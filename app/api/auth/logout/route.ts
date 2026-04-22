import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/session";

export async function POST() {
  try {
    await clearUserSession();
    return NextResponse.json({ message: "Logged out." });
  } catch {
    return NextResponse.json({ message: "Failed to logout." }, { status: 500 });
  }
}
