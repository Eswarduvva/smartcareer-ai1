import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { analyticsQuery } from "@/lib/api/queries";
import { fmt, skillLabel, GAP_THRESHOLD, STRONG_THRESHOLD } from "@/lib/skills";

const search = z.object({ degree: z.string().optional(), branch: z.string().optional() });

export const Route = createFileRoute("/_authenticated/analytics")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(analyticsQuery(deps)),
  head: () => ({
    meta: [
      { title: "Cohort analytics — SmartCareer" },
      { name: "description", content: "CGPA, readiness, career domains and average skills across all students." },
      { property: "og:title", content: "Cohort analytics — SmartCareer" },
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
      <PageHead eyebrow="Mentor / Admin · Platform analytics" title="The cohort at a glance">
        <div className="flex flex-wrap gap-3">
          <Select label="Degree" value={s.degree} options={a.degrees ?? []} onChange={(degree) => navigate({ search: (p) => ({ ...p, degree }) })} />
          <Select label="Branch" value={s.branch} options={a.branches ?? []} onChange={(branch) => navigate({ search: (p) => ({ ...p, branch }) })} />
        </div>
      </PageHead>

      {a.student_count === 0 ? (
        <EmptyState title="No students match these filters" body="Try clearing the degree or branch filter." />
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
              <h2 className="mb-5 text-lg font-medium">Career distribution</h2>
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

          <section className="mb-14 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
            {([["Most common career interests", a.interests ?? [], "bg-primary"], ["Most common skill gaps", a.common_gaps ?? [], "bg-gap"]] as const).map(([t, xs, bar]) => {
              const max = Math.max(1, ...xs.map((x) => x.count));
              return (
                <div key={t}>
                  <h3 className="eyebrow mb-4">{t}</h3>
                  {xs.length ? (
                    <ul className="space-y-3">
                      {xs.map((d) => (
                        <li key={d.label}>
                          <div className="mb-1 flex justify-between text-sm"><span className="truncate">{d.label}</span><span className="num text-muted-foreground">{d.count}</span></div>
                          <div className="h-1 bg-muted"><div className={`h-full ${bar}`} style={{ width: `${(d.count / max) * 100}%` }} /></div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No data for this selection.</p>}
                </div>
              );
            })}
            <div>
              <h3 className="eyebrow mb-4">Recent student activity</h3>
              {a.activity?.length ? (
                <ul className="divide-y divide-border border-y border-border">
                  {a.activity.slice(0, 7).map((x, i) => (
                    <li key={i} className="py-2.5 text-sm">
                      <Link to="/students/$id" params={{ id: x.student_id }} className="font-medium hover:text-primary">{x.name}</Link>{" "}
                      <span className="text-muted-foreground">{x.action}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground">{x.when}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </div>
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
