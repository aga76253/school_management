"use client";

import * as React from "react";

type AdmissionItem = {
  _id: string;
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  previousSchool?: string;
  desiredClassName?: string;
  academicCertificateImage?: string;
  birthOrIdImage?: string;
  applicationNote?: string;
  status?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt?: string;
  admissionStudentNumber?: number;
  userId?:
    | string
    | {
        _id?: string;
        fullName?: string;
        email?: string;
        role?: string;
      };
};

type AdmissionsResponse = {
  admissions?: AdmissionItem[];
  message?: string;
};

type NoticeItem = {
  _id: string;
  message?: string;
  createdAt?: string;
};

type AdmissionNoticesResponse = {
  notices?: NoticeItem[];
  message?: string;
};

const statusOptions = ["approved", "rejected"] as const;

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

function formatStatus(value?: string) {
  const status = String(value || "submitted");
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getApplicantInfo(userId: AdmissionItem["userId"]) {
  if (!userId || typeof userId === "string") {
    return { name: "Unknown User", email: "N/A", role: "N/A" };
  }
  return {
    name: userId.fullName || "Unknown User",
    email: userId.email || "N/A",
    role: userId.role || "N/A",
  };
}

export default function PrincipalAdmissionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [admissions, setAdmissions] = React.useState<AdmissionItem[]>([]);
  const [notices, setNotices] = React.useState<NoticeItem[]>([]);
  const [noticeMessage, setNoticeMessage] = React.useState("");
  const [publishingNotice, setPublishingNotice] = React.useState(false);
  const [activeStatus, setActiveStatus] = React.useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = React.useState<Record<string, string>>(
    {}
  );
  const [updatingIds, setUpdatingIds] = React.useState<Record<string, boolean>>({});

  const admissionsCount = admissions.length;
  const pendingCount = admissions.filter((item) => String(item.status) === "submitted").length;
  const approvedCount = admissions.filter((item) => item.status === "approved").length;

  React.useEffect(() => {
    void loadAdmissions();
  }, []);

  async function loadAdmissions() {
    setLoading(true);
    setError("");

    try {
      const [admissionResponse, noticeResponse] = await Promise.all([
        fetch("/api/principal/admissions", { cache: "no-store" }),
        fetch("/api/principal/admission-notices", { cache: "no-store" }),
      ]);
      const data = (await admissionResponse.json()) as AdmissionsResponse;
      const noticeData = (await noticeResponse.json()) as AdmissionNoticesResponse;

      if (!admissionResponse.ok) {
        if (admissionResponse.status === 403) {
          throw new Error("You do not have permission to manage admissions.");
        }
        throw new Error(data?.message || "Failed to load submissions.");
      }
      if (!noticeResponse.ok) {
        throw new Error(noticeData?.message || "Failed to load notices.");
      }

      const list = data.admissions || [];
      setAdmissions(list);
      setNotices(noticeData.notices || []);

      const nextStatus: Record<string, string> = {};
      const nextReasons: Record<string, string> = {};

      for (const item of list) {
        const id = String(item._id);
        nextStatus[id] = String(item.status || "submitted");
        nextReasons[id] = String(item.rejectionReason || "");
      }

      setActiveStatus(nextStatus);
      setRejectionReasons(nextReasons);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load submissions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    const nextStatus = activeStatus[id];
    if (!nextStatus) return;

    setUpdatingIds((prev) => ({ ...prev, [id]: true }));
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/principal/admissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
          rejectionReason: rejectionReasons[id] || "",
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        admission?: AdmissionItem;
      };
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status.");
      }

      setAdmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: nextStatus,
                rejectionReason:
                  nextStatus === "rejected" ? rejectionReasons[id] || "" : "",
                reviewedAt: new Date().toISOString(),
                admissionStudentNumber:
                  typeof data?.admission?.admissionStudentNumber === "number"
                    ? data.admission.admissionStudentNumber
                    : item.admissionStudentNumber,
              }
            : item
        )
      );
      setMessage("Admission status updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      setError(msg);
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function handlePublishNotice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = noticeMessage.trim();
    if (!trimmed) {
      setError("Please write a notice message first.");
      return;
    }

    setPublishingNotice(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/principal/admission-notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as {
        message?: string;
        notice?: NoticeItem;
      };

      if (!response.ok || !data.notice) {
        throw new Error(data?.message || "Failed to publish notice.");
      }

      const createdNotice = data.notice;
      setNoticeMessage("");
      setNotices((prev) => [createdNotice, ...prev].slice(0, 10));
      setMessage("Notice published successfully.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to publish notice.";
      setError(msg);
    } finally {
      setPublishingNotice(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading admissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admission Management</h1>
        <p className="text-muted-foreground">
          Review applications and update admission status from here.
        </p>
      </div>

      <article className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Principal Notice</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Published notices will be visible to applicants below their submission status.
        </p>

        <form className="mt-3 space-y-3" onSubmit={handlePublishNotice}>
          <textarea
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Example: Admission exam will be held on 30 April at 10:00 AM."
            value={noticeMessage}
            onChange={(event) => setNoticeMessage(event.target.value)}
          />
          <button
            type="submit"
            disabled={publishingNotice}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {publishingNotice ? "Publishing..." : "Publish Notice"}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {notices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notices published yet.</p>
          ) : (
            notices.map((notice) => (
              <div key={notice._id} className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm">{notice.message || ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Published: {formatDate(notice.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Submissions</p>
          <p className="mt-2 text-2xl font-semibold">{admissionsCount}</p>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved Admissions</p>
          <p className="mt-2 text-2xl font-semibold">{approvedCount}</p>
        </article>
      </div>

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {admissions.length === 0 ? (
        <article className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No admission applications found yet.
        </article>
      ) : (
        <div className="space-y-4">
          {admissions.map((item) => {
            const id = String(item._id);
            const applicant = getApplicantInfo(item.userId);
            const selectedStatus = activeStatus[id] || String(item.status || "submitted");
            const isUpdating = Boolean(updatingIds[id]);

            return (
              <article key={id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{item.fullName || "Unknown Name"}</h2>
                    <p className="text-sm text-muted-foreground">
                      Applicant: {applicant.name} ({applicant.email})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Admission Student Number:{" "}
                      {item.admissionStudentNumber ? item.admissionStudentNumber : "Not assigned"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {formatDate(item.createdAt)} | Last review:{" "}
                      {formatDate(item.reviewedAt)}
                    </p>
                  </div>
                  <p className="rounded-md border px-2 py-1 text-xs font-medium">
                    {formatStatus(item.status)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <p>
                    <span className="font-medium">Phone:</span> {item.phone || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {formatStatus(item.gender || "N/A")}
                  </p>
                  <p>
                    <span className="font-medium">Date of Birth:</span>{" "}
                    {formatDate(item.dateOfBirth)}
                  </p>
                  <p>
                    <span className="font-medium">Desired Class:</span>{" "}
                    {item.desiredClassName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Guardian:</span>{" "}
                    {item.guardianName || "N/A"} ({item.guardianPhone || "N/A"})
                  </p>
                  <p>
                    <span className="font-medium">Previous School:</span>{" "}
                    {item.previousSchool || "N/A"}
                  </p>
                  <p className="md:col-span-2">
                    <span className="font-medium">Note:</span>{" "}
                    {item.applicationNote || "No note provided"}
                  </p>
                  <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border p-2">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Academic Certificate
                      </p>
                      {item.academicCertificateImage ? (
                        <>
                          <img
                            src={item.academicCertificateImage}
                            alt="Academic certificate"
                            className="h-40 w-full rounded-md border object-cover"
                          />
                          <a
                            href={item.academicCertificateImage}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs underline"
                          >
                            Open full image
                          </a>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No image uploaded</p>
                      )}
                    </div>

                    <div className="rounded-md border p-2">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Birth/ID Image
                      </p>
                      {item.birthOrIdImage ? (
                        <>
                          <img
                            src={item.birthOrIdImage}
                            alt="Birth or ID document"
                            className="h-40 w-full rounded-md border object-cover"
                          />
                          <a
                            href={item.birthOrIdImage}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs underline"
                          >
                            Open full image
                          </a>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">No image uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
                  <select
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={selectedStatus}
                    onChange={(event) =>
                      setActiveStatus((prev) => ({
                        ...prev,
                        [id]: event.target.value,
                      }))
                    }
                  >
                    <option value="submitted">Submitted</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Rejection reason (required only for rejected)"
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={rejectionReasons[id] || ""}
                    onChange={(event) =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [id]: event.target.value,
                      }))
                    }
                  />

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdate(id)}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
