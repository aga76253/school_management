"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AdmissionResponse = {
  submission?: {
    _id?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    phone?: string;
    guardianIdCardNumber?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
    academicCertificateImage?: string;
    birthOrIdImage?: string;
    previousSchool?: string;
    desiredClassName?: string;
    applicationNote?: string;
    status?: string;
    admissionStudentNumber?: number;
    createdAt?: string;
  } | null;
  notices?: { _id?: string; message?: string; createdAt?: string }[];
  message?: string;
};

type UploadResponse = {
  message?: string;
  path?: string;
};

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeClass(status: string) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (status === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (status === "submitted") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  return "bg-muted text-foreground border-border";
}

function formatDateLabel(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

export default function AdmissionFormPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [admissionStudentNumber, setAdmissionStudentNumber] = React.useState<
    number | null
  >(null);
  const [submissionId, setSubmissionId] = React.useState("");
  const [submittedAt, setSubmittedAt] = React.useState("");
  const [notices, setNotices] = React.useState<
    { _id?: string; message?: string; createdAt?: string }[]
  >([]);
  const adminNotices = React.useMemo(
    () =>
      notices
        .map((item) => String(item.message || "").trim())
        .filter(Boolean)
        .slice(0, 3),
    [notices]
  );

  const [fullName, setFullName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [gender, setGender] = React.useState<"male" | "female" | "other">(
    "male"
  );
  const [phone, setPhone] = React.useState("");
  const [guardianIdCardNumber, setGuardianIdCardNumber] = React.useState("");
  const [guardianName, setGuardianName] = React.useState("");
  const [guardianPhone, setGuardianPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [previousSchool, setPreviousSchool] = React.useState("");
  const [desiredClassName, setDesiredClassName] = React.useState("");
  const [applicationNote, setApplicationNote] = React.useState("");

  const [academicCertificateImage, setAcademicCertificateImage] =
    React.useState("");
  const [birthOrIdImage, setBirthOrIdImage] = React.useState("");

  const [academicCertificateFile, setAcademicCertificateFile] =
    React.useState<File | null>(null);
  const [birthOrIdFile, setBirthOrIdFile] = React.useState<File | null>(null);
  const [academicCertificatePreview, setAcademicCertificatePreview] =
    React.useState("");
  const [birthOrIdPreview, setBirthOrIdPreview] = React.useState("");
  const isUnderReview = status === "submitted" || status === "approved";

  React.useEffect(() => {
    async function loadSubmission() {
      try {
        const response = await fetch("/api/admission/me");
        const data = (await response.json()) as AdmissionResponse;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(data?.message || "Failed to load admission data.");
          return;
        }

        const submission = data?.submission;
        setNotices(Array.isArray(data?.notices) ? data.notices : []);
        if (submission) {
          setSubmissionId(submission._id || "");
          setFullName(submission.fullName || "");
          setDateOfBirth(
            submission.dateOfBirth
              ? new Date(submission.dateOfBirth).toISOString().slice(0, 10)
              : ""
          );
          setGender(submission.gender || "male");
          setPhone(submission.phone || "");
          setGuardianIdCardNumber(submission.guardianIdCardNumber || "");
          setGuardianName(submission.guardianName || "");
          setGuardianPhone(submission.guardianPhone || "");
          setAddress(submission.address || "");
          setAcademicCertificateImage(submission.academicCertificateImage || "");
          setBirthOrIdImage(submission.birthOrIdImage || "");
          setAcademicCertificatePreview(submission.academicCertificateImage || "");
          setBirthOrIdPreview(submission.birthOrIdImage || "");
          setPreviousSchool(submission.previousSchool || "");
          setDesiredClassName(submission.desiredClassName || "");
          setApplicationNote(submission.applicationNote || "");
          setStatus(submission.status || "");
          setSubmittedAt(submission.createdAt || "");
          setAdmissionStudentNumber(
            typeof submission.admissionStudentNumber === "number"
              ? submission.admissionStudentNumber
              : null
          );
        }
      } catch {
        setError("Network error while loading form.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [router]);

  React.useEffect(() => {
    if (!academicCertificateFile) {
      setAcademicCertificatePreview(academicCertificateImage || "");
      return;
    }

    const objectUrl = URL.createObjectURL(academicCertificateFile);
    setAcademicCertificatePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [academicCertificateFile, academicCertificateImage]);

  React.useEffect(() => {
    if (!birthOrIdFile) {
      setBirthOrIdPreview(birthOrIdImage || "");
      return;
    }

    const objectUrl = URL.createObjectURL(birthOrIdFile);
    setBirthOrIdPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [birthOrIdFile, birthOrIdImage]);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/admission", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadResponse;
    if (!response.ok || !data.path) {
      throw new Error(data?.message || "File upload failed.");
    }

    return data.path;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      let finalAcademicCertificateImage = academicCertificateImage;
      let finalBirthOrIdImage = birthOrIdImage;

      if (academicCertificateFile) {
        finalAcademicCertificateImage = await uploadImage(academicCertificateFile);
      }

      if (birthOrIdFile) {
        finalBirthOrIdImage = await uploadImage(birthOrIdFile);
      }

      const response = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          dateOfBirth,
          gender,
          phone,
          guardianIdCardNumber,
          guardianName,
          guardianPhone,
          address,
          academicCertificateImage: finalAcademicCertificateImage,
          birthOrIdImage: finalBirthOrIdImage,
          previousSchool,
          desiredClassName,
          applicationNote,
        }),
      });

      const data = (await response.json()) as AdmissionResponse;
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data?.message || "Submission failed.");
        return;
      }

      setAcademicCertificateImage(finalAcademicCertificateImage);
      setBirthOrIdImage(finalBirthOrIdImage);
      setAcademicCertificateFile(null);
      setBirthOrIdFile(null);
      setStatus("submitted");
      if (typeof data?.submission?.admissionStudentNumber === "number") {
        setAdmissionStudentNumber(data.submission.admissionStudentNumber);
      }
      setSubmissionId((prev) => data?.submission?._id || prev);
      setSubmittedAt((prev) => data?.submission?.createdAt || prev);
      setSuccess("Application submitted successfully.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Network error. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading form...</div>;
  }

  if (isUnderReview) {
    return (
      <div className="admit-print-shell min-h-screen bg-muted/30 p-6">
        <div className="admit-print-panel mx-auto max-w-2xl rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="admit-print-meta text-2xl font-semibold">Application Submitted</h1>
          <p className="admit-print-meta mt-2 text-sm text-muted-foreground">
            Application submission successful. Your admission request is submitted.
          </p>
          {status ? (
            <p className="admit-print-meta mt-3 text-xs font-medium uppercase tracking-wide">
              Current status:{" "}
              <span
                className={`rounded-md border px-2 py-1 ${getStatusBadgeClass(status)}`}
              >
                {formatStatusLabel(status)}
              </span>
            </p>
          ) : null}
          <p className="admit-print-meta mt-2 text-xs font-medium uppercase tracking-wide text-primary">
            Admission Student Number:{" "}
            {admissionStudentNumber ? admissionStudentNumber : "Pending approval"}
          </p>

          <div
            id="admit-card-element"
            className="admit-card mt-8 rounded-xl border-2 border-primary/20 bg-card p-0 shadow-lg relative overflow-hidden print:mt-0 print:border-gray-800 print:shadow-none"
          >
            {/* Watermark Logo/Text */}
            <div className="admit-watermark absolute inset-0 z-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-8xl font-black transform -rotate-45 whitespace-nowrap">
                BRIGHT FUTURE
              </span>
            </div>

            {/* Header */}
            <div className="admit-header relative z-10 flex flex-col items-center justify-center border-b-2 border-primary/20 bg-primary/5 py-6 px-4 print:border-gray-800 print:bg-transparent text-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground print:bg-black print:text-white">
                  <span className="text-xl font-bold">BF</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-wider text-primary print:text-black">
                    Bright Future School
                  </h1>
                  <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground print:text-gray-700">
                    ADMISSION ADMIT CARD 2026-27
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="admit-body relative z-10 p-6">
              <div className="admit-top-row flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Application No.</p>
                  <p className="font-mono text-lg font-bold">{admissionStudentNumber ? String(admissionStudentNumber).padStart(6, '0') : "PENDING"}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Form ID</p>
                  <p className="font-mono text-sm">{submissionId?.slice(-8).toUpperCase() || "N/A"}</p>
                </div>
              </div>

              <div className="admit-info-grid grid gap-x-8 gap-y-4 md:grid-cols-2 rounded-lg border p-4 bg-background/50 print:bg-transparent print:border-gray-300">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Applicant Name</p>
                  <p className="font-semibold text-lg border-b border-dashed pb-1 mt-1">{fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Desired Class</p>
                  <p className="font-semibold text-lg border-b border-dashed pb-1 mt-1">{desiredClassName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Date of Birth</p>
                  <p className="font-medium border-b border-dashed pb-1 mt-1">{formatDateLabel(dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Phone Number</p>
                  <p className="font-medium border-b border-dashed pb-1 mt-1">{phone || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Guardian Name</p>
                  <p className="font-medium border-b border-dashed pb-1 mt-1">{guardianName || "N/A"}</p>
                </div>
              </div>

              {/* Notice / Instruction Section */}
              <div className="admit-notice mt-6 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 p-4 print:border-l-black print:bg-transparent print:border-gray-200 print:border">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-800 print:text-black">
                  Admin Notice And Instructions
                </p>
                <div className="admit-notice-text mt-2 text-sm text-blue-900/80 print:text-gray-800 space-y-1">
                  {adminNotices.length > 0 ? (
                    adminNotices.map((notice, index) => (
                      <p key={`${submissionId || "notice"}-${index}`}>
                        - Notice {index + 1}: {notice}
                      </p>
                    ))
                  ) : (
                    <p>- No active admin notice right now.</p>
                  )}
                  <p>- Bring this admit card (printed copy) on the day of the exam.</p>
                  <p>- Arrive at least 30 minutes before the scheduled time.</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="admit-signatures mt-12 flex justify-between px-4 pt-4 border-t border-dashed">
                <div className="text-center">
                  <div className="w-32 border-b border-black mb-2"></div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Applicant Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-black mb-2"></div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Principal Signature</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Admit Card
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-md border bg-white px-6 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
        <style jsx global>{`
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          @media print {
            html,
            body {
              height: auto !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .admit-print-shell {
              min-height: auto !important;
              background: #fff !important;
              padding: 0 !important;
            }

            .admit-print-panel {
              max-width: none !important;
              border: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 0 !important;
            }

            .admit-print-meta {
              display: none !important;
            }

            .admit-card {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-top: 0 !important;
              width: 100% !important;
              max-width: 198mm !important;
              margin-left: auto !important;
              margin-right: auto !important;
              border-width: 1.6px !important;
              border-color: #1f2937 !important;
              border-radius: 12px !important;
            }

            .admit-watermark {
              opacity: 0.06 !important;
            }

            .admit-header {
              padding: 14px 14px !important;
            }

            .admit-body {
              padding: 14px !important;
              display: flex !important;
              flex-direction: column !important;
              min-height: 222mm !important;
            }

            .admit-top-row {
              margin-bottom: 12px !important;
            }

            .admit-info-grid {
              gap: 10px !important;
              padding: 12px !important;
            }

            .admit-notice {
              margin-top: 12px !important;
              padding: 10px !important;
            }

            .admit-notice-text {
              font-size: 13px !important;
              line-height: 1.45 !important;
              margin-top: 6px !important;
              font-family: "Nirmala UI", "Vrinda", "SolaimanLipi", sans-serif !important;
              max-height: 58mm !important;
              overflow: hidden !important;
            }

            .admit-signatures {
              margin-top: auto !important;
              padding-top: 12px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Admission Form</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in your details and submit for review.
          </p>
          {status ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-wide">
              Current status:{" "}
              <span
                className={`rounded-md border px-2 py-1 ${getStatusBadgeClass(status)}`}
              >
                {formatStatusLabel(status)}
              </span>
            </p>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Gender</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Guardian ID Card Number</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={guardianIdCardNumber}
                onChange={(e) => setGuardianIdCardNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Guardian Name</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Guardian Phone</label>
              <input
                type="tel"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Previous Educational Institution</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Desired Class for Admission</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="e.g. Class 6"
                value={desiredClassName}
                onChange={(e) => setDesiredClassName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Academic Certificate Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={(e) => setAcademicCertificateFile(e.target.files?.[0] || null)}
              />
              {academicCertificatePreview ? (
                <img
                  src={academicCertificatePreview}
                  alt="Academic certificate preview"
                  className="mt-2 h-36 w-full rounded-md border object-cover"
                />
              ) : null}
              {academicCertificateImage ? (
                <a
                  href={academicCertificateImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline"
                >
                  View uploaded file
                </a>
              ) : null}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Birth Registration / ID Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                onChange={(e) => setBirthOrIdFile(e.target.files?.[0] || null)}
              />
              {birthOrIdPreview ? (
                <img
                  src={birthOrIdPreview}
                  alt="Birth registration or ID preview"
                  className="mt-2 h-36 w-full rounded-md border object-cover"
                />
              ) : null}
              {birthOrIdImage ? (
                <a
                  href={birthOrIdImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline"
                >
                  View uploaded file
                </a>
              ) : null}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Application Note</label>
              <textarea
                className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Write anything you want to submit with this application..."
                value={applicationNote}
                onChange={(e) => setApplicationNote(e.target.value)}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Admission"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
