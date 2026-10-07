import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { analyticsQuery } from "@/lib/api/queries";
import { fmt, skillLabel, GAP_THRESHOLD, STRONG_THRESHOLD } from "@/lib/skills";

const search = z.object({ degree: z.string().optional(), branch: z.string().optional() });

export const Route = createFileRoute("/analytics")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(analyticsQuery(deps)),
  head: () => ({
    meta: [
      { title: "Cohort analytics — SmartCareer AI" },
      { name: "description", content: "CGPA, readiness, career domains and average skills across all students." },
      { property: "og:title", content: "Cohort analytics — SmartCareer AI" },
      { property: "og:description", content: "Distributions across the whole student cohort." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: () => <AppShell><LoadingState /></AppShell>,
  errorComponent: ({ error }) => <AppShell><ErrorState error={error} /></AppShell>,
  component: () => <AppShell><Analytics /></AppShell>,
});

const axis = { fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono" };
const tip = {
  contentStyle: { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 2, fontSize: 12, fontFamily: "JetBrains Mono" },
  cursor: { fill: "var(--color-muted)", opacity: 0.5 },
};

function Select({ label, value, options, onChange }: { label: string; value?: string | undefined; options: string[]; onChange: (v?: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="min-w-44 border border-input bg-card px-3 py-2 font-mono text-xs outline-none focus:border-primary"
      >
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Analytics() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/analytics" });
  const { data: a } = useSuspenseQuery(analyticsQuery(s));
  const skills = [...a.avg_skills].sort((x, y) => y.value - x.value).map((k) => ({ name: skillLabel(k.key), value: Math.round(k.value * 10) / 10 }));
  const maxDomain = Math.max(1, ...a.domains.map((d) => d.count));

  return (
    <div>
      <PageHead eyebrow="Analytics" title="The cohort at a glance">
        <div className="flex flex-wrap gap-3">
          <Select label="Degree" value={s.degree} options={a.degrees ?? []} onChange={(degree) => navigate({ search: (p) => ({ ...p, degree }) })} />
          <Select label="Branch" value={s.branch} options={a.branches ?? []} onChange={(branch) => navigate({ search: (p) => ({ ...p, branch }) })} />
        </div>
      </PageHead>

      {a.student_count === 0 ? (
        <EmptyState title="No students in the database yet" body="Once the dataset is imported, cohort figures appear here automatically." />
      ) : (
        <>
          {/* headline strip */}
          <div className="mb-12 grid grid-cols-2 border-y border-border md:grid-cols-5">
            <div className="col-span-2 border-b border-border py-6 pr-6 md:col-span-1 md:border-b-0 md:border-r">
              <p className="eyebrow">Students</p>
              <p className="num mt-2 text-6xl font-medium">{a.student_count.toLocaleString()}</p>
            </div>
            {[
              ["Avg CGPA", fmt(a.avg_cgpa, 2), ""],
              ["Avg readiness", fmt(a.avg_readiness), "text-strength"],
              ["Avg match", `${fmt(a.avg_match)}%`, "text-primary"],
              ["Avg gap", fmt(a.avg_gap), "text-gap"],
            ].map(([l, v, c]) => (
              <div key={l} className="border-r border-border px-6 py-6 last:border-r-0">
                <p className="eyebrow">{l}</p>
                <p className={`num mt-2 text-3xl ${c}`}>{v}</p>
              </div>
            ))}
          </div>

          {/* primary chart */}
          <section className="mb-14 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="mb-1 text-lg font-medium">Average score per skill</h2>
              <p className="mb-6 text-sm text-muted-foreground">Green ≥ {STRONG_THRESHOLD}, amber &lt; {GAP_THRESHOLD} (application rules).</p>
              <div style={{ height: skills.length * 24 + 20 }}>
                <ResponsiveContainer>
                  <BarChart data={skills} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={130} />
                    <Tooltip {...tip} />
                    <Bar dataKey="value" barSize={9} radius={[0, 2, 2, 0]}>
                      {skills.map((k) => (
                        <Cell key={k.name} fill={k.value >= STRONG_THRESHOLD ? "var(--color-strength)" : k.value < GAP_THRESHOLD ? "var(--color-gap)" : "var(--color-chart-1)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <aside className="lg:border-l lg:border-border lg:pl-8">
              <h2 className="mb-5 text-lg font-medium">Recommended domains</h2>
              <ul className="space-y-3">
                {a.domains.map((d) => (
                  <li key={d.label} className="group">
                    <div className="mb-1 flex justify-between text-sm"><span>{d.label}</span><span className="num text-muted-foreground group-hover:text-foreground">{d.count}</span></div>
                    <div className="h-1 bg-muted"><div className="h-full bg-primary transition-[width] duration-700" style={{ width: `${(d.count / maxDomain) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            </aside>
          </section>

          {/* secondary charts */}
          <section className="grid gap-10 border-t border-border pt-10 md:grid-cols-2">
            {([
              ["CGPA distribution", a.cgpa_distribution, "var(--color-chart-1)"],
              ["Career readiness distribution", a.readiness_distribution, "var(--color-chart-2)"],
            ] as const).map(([t, d, col]) => (
              <div key={t}>
                <h3 className="eyebrow mb-4">{t}</h3>
                <div className="h-52">
                  <ResponsiveContainer>
                    <BarChart data={d}>
                      <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
                      <YAxis tick={axis} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                      <Tooltip {...tip} />
                      <Bar dataKey="count" fill={col} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
