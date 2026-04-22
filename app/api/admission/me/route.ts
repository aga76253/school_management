import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionSubmission from "@/models/AdmissionSubmission";
import AdmissionNotice from "@/models/AdmissionNotice";
import { getAuthenticatedUser } from "@/lib/session";
import { toAppImageUrl } from "@/lib/azureblob";

async function getNextAdmissionStudentNumber() {
  const lastAllocated = await AdmissionSubmission.findOne({
    admissionStudentNumber: { $exists: true, $ne: null },
  })
    .sort({ admissionStudentNumber: -1 })
    .select("admissionStudentNumber")
    .lean();

  return Number(lastAllocated?.admissionStudentNumber || 0) + 1;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    await dbConnect();
    let submission = await AdmissionSubmission.findOne({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (submission && !submission.admissionStudentNumber) {
      const nextNumber = await getNextAdmissionStudentNumber();
      const updated = await AdmissionSubmission.findOneAndUpdate(
        {
          _id: submission._id,
          $or: [
            { admissionStudentNumber: { $exists: false } },
            { admissionStudentNumber: null },
          ],
        },
        { admissionStudentNumber: nextNumber },
        { new: true }
      ).lean();
      submission = updated || submission;
    }

    if (submission) {
      const row = submission as {
        academicCertificateImage?: string;
        birthOrIdImage?: string;
      };
      if (row.academicCertificateImage) {
        row.academicCertificateImage = toAppImageUrl(row.academicCertificateImage);
      }
      if (row.birthOrIdImage) {
        row.birthOrIdImage = toAppImageUrl(row.birthOrIdImage);
      }
    }

    const notices = await AdmissionNotice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ submission, notices });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch admission submission." },
      { status: 500 }
    );
  }
}
