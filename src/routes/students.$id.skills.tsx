import { createFileRoute } from "@tanstack/react-router";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { EmptyState, Meter, PageHead, Tile } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, groupAverages, GROUPS, SCORE_MAX, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";

export const Route = createFileRoute("/students/$id/skills")({
  head: ({ params }) => ({
    meta: [
      { title: `Skill intelligence ${params.id} — SmartCareer AI` },
      { name: "description", content: "All 19 skill scores, grouped into technical, reasoning, communication and behavioural." },
      { property: "og:title", content: `Skill intelligence ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "All skill scores grouped and compared." },
    ],
  }),
  component: Skills,
});

function Skills() {
  const r = useRecord();
  const skills = scoredSkills(r.skills);
  if (!skills.length) return <EmptyState title="No skill scores on record for this student" />;
  const groups = groupAverages(skills);
  const radar = groups.map((g) => ({ group: g.group, value: g.value ?? 0 }));
  const tech = groups[0]?.value ?? 0;
  const soft = groups.slice(1).filter((g) => g.value != null);
  const softAvg = soft.reduce((a, b) => a + (b.value ?? 0), 0) / (soft.length || 1);

  return (
    <div>
      <PageHead eyebrow="Skill intelligence" title="Where the strengths are">
        <p className="max-w-xs text-xs text-muted-foreground">
          Raw scores from the database. Strong ≥ {STRONG_THRESHOLD}, gap &lt; {GAP_THRESHOLD}, out of {SCORE_MAX}.
        </p>
      </PageHead>
      <div className="grid gap-3 lg:grid-cols-6">
        <Tile className="lg:col-span-3" label="Group profile">
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar} outerRadius="75%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="group" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis domain={[0, SCORE_MAX]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Tile>
        <Tile className="lg:col-span-3" label="Technical vs soft">
          <div className="grid flex-1 grid-cols-2 items-end gap-6">
            <div>
              <p className="num text-6xl">{fmt(tech)}</p>
              <p className="eyebrow mt-2">Technical avg</p>
            </div>
            <div>
              <p className="num text-6xl text-muted-foreground">{fmt(softAvg)}</p>
              <p className="eyebrow mt-2">Reasoning, communication & behavioural avg</p>
            </div>
          </div>
          <p className="mt-6 border-t border-border pt-3 text-sm">
            {tech >= softAvg ? "Technical scores lead" : "Non-technical scores lead"} by <span className="num">{fmt(Math.abs(tech - softAvg))}</span> points.
          </p>
        </Tile>
        {GROUPS.map((g) => (
          <Tile key={g} className={g === "Technical" ? "lg:col-span-6" : "lg:col-span-2"} label={g} aside={<span className="num text-xs text-muted-foreground">avg {fmt(groups.find((x) => x.group === g)?.value)}</span>}>
            <ul className={g === "Technical" ? "grid gap-x-10 gap-y-4 md:grid-cols-2" : "space-y-4"}>
              {skills.filter((s) => s.group === g).map((s) => (
                <li key={s.key}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className={`num ${s.score < GAP_THRESHOLD ? "text-gap" : s.score >= STRONG_THRESHOLD ? "text-strength" : ""}`}>{fmt(s.score)}</span>
                  </div>
                  <Meter value={s.score} tone={s.score < GAP_THRESHOLD ? "gap" : "strength"} />
                </li>
              ))}
            </ul>
          </Tile>
        ))}
      </div>
    </div>
  );
}
