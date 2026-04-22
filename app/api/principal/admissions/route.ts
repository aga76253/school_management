import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionSubmission from "@/models/AdmissionSubmission";
import { getAuthenticatedUser } from "@/lib/session";
import { toAppImageUrl } from "@/lib/azureblob";

const MANAGEABLE_STATUSES = new Set([
  "submitted",
  "approved",
  "rejected",
]);

async function getNextAdmissionStudentNumber() {
  const lastAllocated = await AdmissionSubmission.findOne({
    admissionStudentNumber: { $exists: true, $ne: null },
  })
    .sort({ admissionStudentNumber: -1 })
    .select("admissionStudentNumber")
    .lean();

  return Number(lastAllocated?.admissionStudentNumber || 0) + 1;
}

async function backfillAdmissionStudentNumbers() {
  const missing = await AdmissionSubmission.find({
    $or: [
      { admissionStudentNumber: { $exists: false } },
      { admissionStudentNumber: null },
    ],
  })
    .sort({ createdAt: 1 })
    .select("_id")
    .lean();

  if (missing.length === 0) return;

  let nextNumber = await getNextAdmissionStudentNumber();
  for (const row of missing) {
    await AdmissionSubmission.findOneAndUpdate(
      {
        _id: row._id,
        $or: [
          { admissionStudentNumber: { $exists: false } },
          { admissionStudentNumber: null },
        ],
      },
      { admissionStudentNumber: nextNumber }
    );
    nextNumber += 1;
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await dbConnect();
    await backfillAdmissionStudentNumbers();
    const admissions = await AdmissionSubmission.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email role")
      .lean();

    const normalizedAdmissions = admissions.map((item) => {
      const row = item as {
        academicCertificateImage?: string;
        birthOrIdImage?: string;
      };

      return {
        ...item,
        academicCertificateImage: row.academicCertificateImage
          ? toAppImageUrl(row.academicCertificateImage)
          : row.academicCertificateImage,
        birthOrIdImage: row.birthOrIdImage
          ? toAppImageUrl(row.birthOrIdImage)
          : row.birthOrIdImage,
      };
    });

    return NextResponse.json({ admissions: normalizedAdmissions });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch admission submissions." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const id = String(body?.id || "").trim();
    const status = String(body?.status || "").trim();
    const rejectionReasonRaw = String(body?.rejectionReason || "").trim();

    if (!id || !status) {
      return NextResponse.json(
        { message: "id and status are required." },
        { status: 400 }
      );
    }

    if (!MANAGEABLE_STATUSES.has(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    if (status === "rejected" && !rejectionReasonRaw) {
      return NextResponse.json(
        { message: "Rejection reason is required for rejected status." },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await AdmissionSubmission.findById(id).select("_id").lean();

    if (!existing) {
      return NextResponse.json(
        { message: "Admission submission not found." },
        { status: 404 }
      );
    }

    const updatePayload = {
      status,
      reviewedBy: user._id,
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? rejectionReasonRaw : "",
    };

    const admission = await AdmissionSubmission.findByIdAndUpdate(id, updatePayload, {
      new: true,
    }).lean();

    return NextResponse.json({
      message: "Admission status updated successfully.",
      admission,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update admission status." },
      { status: 500 }
    );
  }
}
