import {
  CalendarCheck2,
  ClipboardList,
  GraduationCap,
  Wallet,
} from "lucide-react";

const studentStats = [
  { label: "Attendance", value: "92%", icon: CalendarCheck2 },
  { label: "Pending Fees", value: "BDT 3,500", icon: Wallet },
  { label: "Average Grade", value: "A-", icon: GraduationCap },
];

export default function StudentsDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here is your academic overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {studentStats.map((item) => (
          <article key={item.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border bg-card p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ClipboardList className="h-5 w-5" />
          Upcoming Tasks
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Math assignment submission: Thursday</li>
          <li>Science quiz: Sunday</li>
          <li>Fee payment deadline: 25th of this month</li>
        </ul>
      </article>
    </div>
  );
}
