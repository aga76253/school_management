import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { createUserSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body?.fullName || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const password = String(body?.password || "");

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "fullName, email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 }
      );
    }

    const user = await User.create({
      fullName,
      email,
      phone: phone || undefined,
      role: "user",
      passwordHash: hashPassword(password),
    });

    await createUserSession(String(user._id));

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id: String(user._id),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to register user.";
    const maybeMongoError = error as { code?: number };

    if (maybeMongoError?.code === 11000) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 }
      );
    }

    console.error("REGISTER_API_ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to register user.",
        ...(process.env.NODE_ENV !== "production" ? { error: message } : {}),
      },
      { status: 500 }
    );
  }
}
