import { NextResponse } from "next/server";
import { downloadBlobByName } from "@/lib/azureblob";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blob = String(searchParams.get("blob") || "").trim();

    if (!blob || blob.includes("..")) {
      return NextResponse.json({ message: "Invalid blob path." }, { status: 400 });
    }

    const downloaded = await downloadBlobByName(blob);
    const readable = downloaded.readableStreamBody;
    if (!readable) {
      return NextResponse.json({ message: "Blob stream missing." }, { status: 404 });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": downloaded.contentType || "application/octet-stream",
        "cache-control":
          downloaded.cacheControl || "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ message: "Failed to read blob." }, { status: 404 });
  }
}
