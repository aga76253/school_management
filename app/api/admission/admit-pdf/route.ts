import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import dbConnect from "@/lib/db";
import AdmissionSubmission from "@/models/AdmissionSubmission";
import AdmissionNotice from "@/models/AdmissionNotice";
import { getAuthenticatedUser } from "@/lib/session";

export const runtime = "nodejs";
let banglaFontBase64Cache: string | null = null;

function formatDate(value?: Date | string | null) {
  if (!value) return "N/A";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(parsed);
}

async function getBanglaFontBase64() {
  if (banglaFontBase64Cache) return banglaFontBase64Cache;
  const fontPath = join(process.cwd(), "public", "fonts", "TonnyBanglaMJ-Regular.ttf");
  const fontBytes = await readFile(fontPath);
  banglaFontBase64Cache = Buffer.from(fontBytes).toString("base64");
  return banglaFontBase64Cache;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await dbConnect();
    const submission = await AdmissionSubmission.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
    const notices = await AdmissionNotice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("message")
      .lean();

    if (!submission) {
      return NextResponse.json({ message: "No admission submission found." }, { status: 404 });
    }

    const status = String(submission.status || "");
    if (status !== "submitted" && status !== "approved") {
      return NextResponse.json(
        { message: "Admit card can be downloaded after submission." },
        { status: 400 }
      );
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    let hasBanglaFont = false;
    try {
      const banglaFontBase64 = await getBanglaFontBase64();
      doc.addFileToVFS("TonnyBanglaMJ-Regular.ttf", banglaFontBase64);
      doc.addFont("TonnyBanglaMJ-Regular.ttf", "TonnyBanglaMJ", "normal");
      hasBanglaFont = true;
    } catch {
      hasBanglaFont = false;
    }

    const admissionNumber = submission.admissionStudentNumber
      ? String(submission.admissionStudentNumber).padStart(6, "0")
      : "PENDING";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BRIGHT FUTURE SCHOOL", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("ADMISSION ADMIT CARD 2026-27", 105, 28, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(15, 33, 195, 33);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Application No: ${admissionNumber}`, 20, 45);
    doc.text(`Form ID: ${String(submission._id || "").slice(-8).toUpperCase() || "N/A"}`, 20, 53);
    doc.text(`Applicant Name: ${submission.fullName || "N/A"}`, 20, 61);
    doc.text(`Desired Class: ${submission.desiredClassName || "N/A"}`, 20, 69);
    doc.text(`Date of Birth: ${formatDate(submission.dateOfBirth)}`, 20, 77);
    doc.text(`Phone Number: ${submission.phone || "N/A"}`, 20, 85);
    doc.text(`Guardian Name: ${submission.guardianName || "N/A"}`, 20, 93);
    doc.text(`Submission Date: ${formatDate(submission.createdAt)}`, 20, 101);
    doc.text(
      `Current Status: ${status.charAt(0).toUpperCase()}${status.slice(1) || "N/A"}`,
      20,
      109
    );

    doc.setFont("helvetica", "bold");
    doc.text("Admin Notice And Instructions:", 20, 124);
    doc.setFont(hasBanglaFont ? "TonnyBanglaMJ" : "helvetica", "normal");
    doc.setFontSize(11);
    const adminMessages = notices
      .map((item) => String(item.message || "").trim())
      .filter(Boolean);
    const notice1 = adminMessages[0] || "No active admin notice right now.";
    const notice2 = adminMessages[1] || "Bring this admit card (printed copy) on exam day.";
    const notice3 = adminMessages[2] || "Arrive at least 30 minutes before reporting time.";

    let noticeY = 132;
    const noticeLines = [`1. ${notice1}`, `2. ${notice2}`, `3. ${notice3}`];
    for (const line of noticeLines) {
      const wrapped = doc.splitTextToSize(line, 165) as string[];
      doc.text(wrapped, 25, noticeY);
      noticeY += wrapped.length * 6 + 2;
    }

    doc.setFont("helvetica", "normal");
    doc.line(20, 250, 80, 250);
    doc.line(130, 250, 190, 250);
    doc.setFontSize(10);
    doc.text("Applicant Signature", 35, 256);
    doc.text("Principal Signature", 146, 256);

    const fileName = `Admit_Card_${submission.admissionStudentNumber || "Pending"}.pdf`;
    const pdfBytes = doc.output("arraybuffer");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Failed to generate admit PDF." }, { status: 500 });
  }
}
