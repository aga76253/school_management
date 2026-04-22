import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarClock, Mail, Phone, ShieldCheck } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/session";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((item) => item[0]?.toUpperCase()).join("");
}

function formatDate(value: unknown) {
  if (!value) return "Not available";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

type UserWithOptionalImage = {
  profilePicture?: string;
  avatar?: string;
};

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const role = String(user.role ?? "user");
  const fullName = String(user.fullName ?? "User");
  const email = String(user.email ?? "Not available");
  const phone = user.phone ? String(user.phone) : "Not set";
  const initials = getInitials(fullName) || "U";
  const joinedOn = formatDate(user.createdAt);
  const accountStatus = user.isActive ? "Active account" : "Inactive account";
  const userWithImage = user as UserWithOptionalImage;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border bg-card p-6">
          <ProfileImageUpload 
            initialImage={userWithImage.profilePicture || userWithImage.avatar} 
            initials={initials} 
          />
          <div className="mt-4 text-center">
            <h1 className="text-xl font-semibold">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{formatRole(role)}</p>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {email}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {phone}
            </p>
          </div>

          <div className="mt-6 rounded-xl border bg-muted/40 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {accountStatus}
            </p>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              Joined: {joinedOn}
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Profile Overview</p>
            <h2 className="mt-1 text-2xl font-semibold">Personal Information</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</p>
                <p className="mt-1 text-base font-medium">{fullName}</p>
              </article>
              <article className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-1 break-all text-base font-medium">{email}</p>
              </article>
              <article className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                <p className="mt-1 text-base font-medium">{formatRole(role)}</p>
              </article>
              <article className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="mt-1 text-base font-medium">{phone}</p>
              </article>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border bg-card p-5">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <BadgeCheck className="h-5 w-5" />
                Admission Form
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Submit or update your admission information from your profile.
              </p>
              <Link
                href="/profile/admission-form"
                className="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Open Admission Form
              </Link>
            </article>

            <article className="rounded-2xl border bg-card p-5">
              <h3 className="text-lg font-semibold">Session Data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Inspect your current authenticated session details.
              </p>
              <Link
                href="/api/auth/me"
                className="mt-4 inline-block rounded-md border px-3 py-2 text-sm font-medium"
              >
                View Session Info
              </Link>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
