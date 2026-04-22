import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdmissionSubmission from "@/models/AdmissionSubmission";
import { getAuthenticatedUser } from "@/lib/session";

async function getNextAdmissionStudentNumber() {
  const lastAllocated = await AdmissionSubmission.findOne({
    admissionStudentNumber: { $exists: true, $ne: null },
  })
    .sort({ admissionStudentNumber: -1 })
    .select("admissionStudentNumber")
    .lean();

  return Number(lastAllocated?.admissionStudentNumber || 0) + 1;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const fullName = String(body?.fullName || "").trim();
    const dateOfBirth = body?.dateOfBirth ? new Date(body.dateOfBirth) : null;
    const gender = String(body?.gender || "").trim();

    if (!fullName || !dateOfBirth || Number.isNaN(dateOfBirth.getTime()) || !gender) {
      return NextResponse.json(
        { message: "fullName, dateOfBirth and gender are required." },
        { status: 400 }
      );
    }

    const allowedGenders = ["male", "female", "other"];
    if (!allowedGenders.includes(gender)) {
      return NextResponse.json({ message: "Invalid gender." }, { status: 400 });
    }

    await dbConnect();
    const sessionId = body?.sessionId || null;

    const existingSubmission = await AdmissionSubmission.findOne({
      userId: user._id,
      sessionId,
    })
      .select("admissionStudentNumber")
      .lean();

    const admissionStudentNumber =
      existingSubmission?.admissionStudentNumber || (await getNextAdmissionStudentNumber());

    const payload = {
      userId: user._id,
      fullName,
      dateOfBirth,
      gender,
      phone: body?.phone ? String(body.phone).trim() : undefined,
      guardianIdCardNumber: body?.guardianIdCardNumber
        ? String(body.guardianIdCardNumber).trim()
        : undefined,
      guardianName: body?.guardianName ? String(body.guardianName).trim() : undefined,
      guardianPhone: body?.guardianPhone ? String(body.guardianPhone).trim() : undefined,
      address: body?.address ? String(body.address).trim() : undefined,
      academicCertificateImage: body?.academicCertificateImage
        ? String(body.academicCertificateImage).trim()
        : undefined,
      birthOrIdImage: body?.birthOrIdImage
        ? String(body.birthOrIdImage).trim()
        : undefined,
      previousSchool: body?.previousSchool ? String(body.previousSchool).trim() : undefined,
      desiredClassName: body?.desiredClassName
        ? String(body.desiredClassName).trim()
        : undefined,
      desiredClassId: body?.desiredClassId || undefined,
      desiredSectionId: body?.desiredSectionId || undefined,
      sessionId: body?.sessionId || undefined,
      applicationNote: body?.applicationNote
        ? String(body.applicationNote).trim()
        : undefined,
      dynamicFields:
        body?.dynamicFields && typeof body.dynamicFields === "object"
          ? body.dynamicFields
          : {},
      status: "submitted",
      admissionStudentNumber,
      isActive: true,
    };

    const submission = await AdmissionSubmission.findOneAndUpdate(
      { userId: user._id, sessionId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      message: "Admission submitted successfully.",
      submission,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to submit admission." },
      { status: 500 }
    );
  }
}
