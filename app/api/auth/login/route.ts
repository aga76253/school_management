import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import { createUserSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "email and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createUserSession(String(user._id));

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ message: "Failed to login." }, { status: 500 });
  }
}
