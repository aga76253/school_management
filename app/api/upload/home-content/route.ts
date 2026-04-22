import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { isHomeImageSlot, saveHomeImageSlot } from "@/lib/home-images";
import { toAppImageUrl, uploadBufferToAzureBlob } from "@/lib/azureblob";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const WEBP_QUALITY = 78;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

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
    // Using require at runtime keeps this route working even when sharp is not installed.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("sharp");
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

async function optimizeHomeContentImage(input: Buffer) {
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

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const slotRaw = String(formData.get("slot") || "").trim();

    if (!isHomeImageSlot(slotRaw)) {
      return NextResponse.json(
        { message: "Invalid image slot." },
        { status: 400 }
      );
    }

    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }

    const uploadedFile = file as File;

    if (!uploadedFile.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed." },
        { status: 400 }
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File is too large. Max size is 5MB." },
        { status: 400 }
      );
    }

    const bytes = await uploadedFile.arrayBuffer();
    const originalBuffer = Buffer.from(bytes);
    const optimized = await optimizeHomeContentImage(originalBuffer);
    const outputBuffer = optimized?.buffer ?? originalBuffer;
    const outputContentType =
      optimized?.contentType || uploadedFile.type || "application/octet-stream";

    const safeOriginalName = sanitizeFileName(uploadedFile.name || "image");
    const baseName = removeExtension(safeOriginalName);
    const fallbackExt =
      getExtensionFromName(safeOriginalName) ||
      uploadedFile.type.replace("image/", "").toLowerCase() ||
      "bin";
    const extension = optimized?.extension || fallbackExt;
    const fileName = `${Date.now()}-${randomUUID()}-${baseName}.${extension}`;
    const blobPath = `uploads/home-content/${fileName}`;
    const imageUrl = await uploadBufferToAzureBlob({
      buffer: outputBuffer,
      blobName: blobPath,
      contentType: outputContentType,
    });
    await saveHomeImageSlot(slotRaw, imageUrl);

    return NextResponse.json({
      message: "File uploaded.",
      slot: slotRaw,
      path: toAppImageUrl(imageUrl),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { message: "Failed to upload file." },
      { status: 500 }
    );
  }
}
