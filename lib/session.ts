import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import { generateSessionToken } from "@/lib/auth";
import { toAppImageUrl } from "@/lib/azureblob";

const SESSION_COOKIE_NAME = "sms_session";
const SESSION_TTL_DAYS = 7;

function isNextDynamicUsageError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

export async function createUserSession(userId: string) {
  await dbConnect();
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  await Session.create({
    userId,
    token,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await dbConnect();
    await Session.findOneAndUpdate(
      { token, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    await dbConnect();
    const session = await Session.findOne({
      token,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) return null;

    const user = await User.findById(session.userId).select("-passwordHash").lean();
    if (!user) return null;

    const mutableUser = user as typeof user & {
      profilePicture?: string;
      avatar?: string;
    };

    if (mutableUser.profilePicture) {
      mutableUser.profilePicture = toAppImageUrl(mutableUser.profilePicture);
    }
    if (mutableUser.avatar) {
      mutableUser.avatar = toAppImageUrl(mutableUser.avatar);
    }

    return user;
  } catch (error) {
    if (!isNextDynamicUsageError(error)) {
      console.error("AUTH_SESSION_ERROR:", error);
    }
    return null;
  }
}
