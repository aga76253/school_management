import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionNotice from "@/models/AdmissionNotice";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await dbConnect();
    const notices = await AdmissionNotice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ notices });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch admission notices." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const message = String(body?.message || "").trim();
    if (!message) {
      return NextResponse.json(
        { message: "Notice message is required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const notice = await AdmissionNotice.create({
      message,
      createdBy: user._id,
      isActive: true,
    });

    return NextResponse.json({
      message: "Notice published successfully.",
      notice,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to publish notice." },
      { status: 500 }
    );
  }
}
