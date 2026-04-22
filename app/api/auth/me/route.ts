import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch user." },
      { status: 500 }
    );
  }
}
