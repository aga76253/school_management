const principalStats = [
  { label: "Total Students", value: "1,240" },
  { label: "Total Staff", value: "86" },
  { label: "Collection This Month", value: "৳ 12,45,000" },
];

export default function PrincipalDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Principal Dashboard</h1>
        <p className="text-muted-foreground">Monitor school performance and operations at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {principalStats.map((item) => (
          <article key={item.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Administrative Highlights</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>Class attendance trend is up by 4% this week.</li>
          <li>Mid-term exam routine is pending final approval.</li>
          <li>Staff salary batch is due for release on the 28th.</li>
        </ul>
      </article>
    </div>
  );
}
