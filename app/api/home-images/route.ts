import { NextResponse } from "next/server";
import {
  clearHomeImageSlot,
  getHomeImages,
  isHomeImageSlot,
} from "@/lib/home-images";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET() {
  try {
    const images = await getHomeImages();
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json(
      { message: "Failed to load home images." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const slot = String(body?.imageKey || "").trim();
    if (!isHomeImageSlot(slot)) {
      return NextResponse.json({ message: "Invalid image slot." }, { status: 400 });
    }

    await clearHomeImageSlot(slot);

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Error deleting home content image" },
      { status: 500 }
    );
  }
}
