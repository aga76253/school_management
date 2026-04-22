const staffWidgets = [
  { label: "Today Classes", value: "5" },
  { label: "Attendance Pending", value: "2 Sections" },
  { label: "Notices", value: "3 New" },
];

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage classes, attendance, and student updates.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {staffWidgets.map((item) => (
          <article key={item.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Today Schedule</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>08:30 AM - Class 6 (Mathematics)</li>
          <li>10:00 AM - Class 7 (Science)</li>
          <li>12:00 PM - Attendance submission review</li>
        </ul>
      </article>
    </div>
  );
}
