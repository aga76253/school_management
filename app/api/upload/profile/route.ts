import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAuthenticatedUser } from "@/lib/session";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { toAppImageUrl, uploadBufferToAzureBlob } from "@/lib/azureblob";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 78;

function getExtensionFromName(name: string) {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === name.length - 1) return "";
  return name.slice(lastDot + 1).toLowerCase();
}

function removeExtension(name: string) {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0) return name;
  return name.slice(0, lastDot);
}

async function loadSharpModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("sharp");
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

async function optimizeImage(input: Buffer) {
  const sharp = await loadSharpModule();
  if (!sharp) return null;

  const output = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer();

  return {
    buffer: output,
    contentType: "image/webp",
    extension: "webp",
  };
}

export async function POST(req: NextRequest) {
  try {
    const userSession = await getAuthenticatedUser();
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Max size is 5MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);
    const optimized = await optimizeImage(originalBuffer);
    const outputBuffer = optimized?.buffer ?? originalBuffer;
    const outputContentType =
      optimized?.contentType || file.type || "application/octet-stream";
    const userId = String((userSession as { _id: unknown })._id);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const baseName = removeExtension(safeName);
    const fallbackExt =
      getExtensionFromName(safeName) ||
      file.type.replace("image/", "").toLowerCase() ||
      "bin";
    const extension = optimized?.extension || fallbackExt;
    const fileName = `profile_${userId}_${Date.now()}_${randomUUID()}_${baseName}.${extension}`;
    const imageUrl = await uploadBufferToAzureBlob({
      buffer: outputBuffer,
      blobName: `uploads/profiles/${fileName}`,
      contentType: outputContentType,
    });

    // Update user profile in database
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: imageUrl } },
      { new: true, strict: false } // strict: false allows saving even if schema is cached
    );

    console.log("Updated user profile picture:", updatedUser?.profilePicture);

    revalidatePath("/profile");
    revalidatePath("/");

    return NextResponse.json({ success: true, imageUrl: toAppImageUrl(imageUrl) });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
