import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState, PageHead, Tile } from "@/components/kit";
import { analyticsQuery } from "@/lib/api/queries";
import { fmt, skillLabel } from "@/lib/skills";

export const Route = createFileRoute("/analytics")({
  loader: ({ context }) => context.queryClient.ensureQueryData(analyticsQuery()),
  head: () => ({
    meta: [
      { title: "Cohort analytics — SmartCareer AI" },
      { name: "description", content: "CGPA, readiness, career domains and average skills across all students." },
      { property: "og:title", content: "Cohort analytics — SmartCareer AI" },
      { property: "og:description", content: "Distributions across the whole student cohort." },
    ],
  }),
  pendingComponent: () => <AppShell><LoadingState /></AppShell>,
  errorComponent: ({ error }) => <AppShell><ErrorState error={error} /></AppShell>,
  component: () => <AppShell><Analytics /></AppShell>,
});

const axis = { fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono" };
const tip = { contentStyle: { background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 2, fontSize: 12 }, cursor: { fill: "var(--color-muted)" } };

function Analytics() {
  const { data: a } = useSuspenseQuery(analyticsQuery());
  const skills = [...a.avg_skills].sort((x, y) => y.value - x.value).map((s) => ({ name: skillLabel(s.key), value: Math.round(s.value * 10) / 10 }));

  return (
    <div>
      <PageHead eyebrow="Analytics" title="The cohort at a glance" />
      <div className="grid gap-3 lg:grid-cols-6">
        <Tile className="lg:col-span-2" label="Students">
          <p className="num text-7xl font-medium">{a.student_count.toLocaleString()}</p>
        </Tile>
        {[
          ["Avg CGPA", fmt(a.avg_cgpa, 2), ""],
          ["Avg readiness", fmt(a.avg_readiness), "text-strength"],
          ["Avg match", `${fmt(a.avg_match)}%`, "text-primary"],
          ["Avg gap", fmt(a.avg_gap), "text-gap"],
        ].map(([l, v, c]) => (
          <Tile key={l} className="lg:col-span-1" label={l}>
            <p className={`num text-3xl ${c}`}>{v}</p>
          </Tile>
        ))}

        <Tile className="lg:col-span-3" label="CGPA distribution">
          <div className="h-56"><ResponsiveContainer><BarChart data={a.cgpa_distribution}><XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} width={28} allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="count" fill="var(--color-chart-1)" /></BarChart></ResponsiveContainer></div>
        </Tile>
        <Tile className="lg:col-span-3" label="Career readiness distribution">
          <div className="h-56"><ResponsiveContainer><BarChart data={a.readiness_distribution}><XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} width={28} allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="count" fill="var(--color-chart-2)" /></BarChart></ResponsiveContainer></div>
        </Tile>

        <Tile className="lg:col-span-2" label="Recommended domains">
          <ul className="divide-y divide-border">
            {a.domains.map((d) => (
              <li key={d.label} className="flex justify-between py-2 text-sm"><span>{d.label}</span><span className="num">{d.count}</span></li>
            ))}
          </ul>
        </Tile>
        <Tile className="lg:col-span-4" label="Average score per skill">
          <div style={{ height: skills.length * 22 + 20 }}>
            <ResponsiveContainer>
              <BarChart data={skills} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={120} />
                <Tooltip {...tip} />
                <Bar dataKey="value" fill="var(--color-chart-4)" barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tile>
      </div>
    </div>
  );
}
