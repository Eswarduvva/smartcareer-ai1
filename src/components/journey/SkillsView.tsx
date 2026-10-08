import { Link } from "@tanstack/react-router";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { EmptyState, Meter, PageHead, Tile } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { SKILL_GUIDE } from "@/lib/careers";
import { fmt, GAP_THRESHOLD, groupAverages, GROUPS, SCORE_MAX, scoredSkills, sortDesc, STRONG_THRESHOLD } from "@/lib/skills";

export const skillState = (v: number) =>
  v < GAP_THRESHOLD
    ? { label: "Building", tone: "text-gap", meter: "gap" as const }
    : v < STRONG_THRESHOLD
      ? { label: "Developing", tone: "text-primary", meter: "primary" as const }
      : { label: "Strong", tone: "text-strength", meter: "strength" as const };

export function SkillsView() {
  const r = useRecord();
  const skills = scoredSkills(r.skills);
  if (!skills.length) return <EmptyState title="No skill scores yet" body="Rate your skills in step 2 of your profile to see this dashboard." />;
  const groups = groupAverages(skills);
  const radar = groups.map((g) => ({ group: g.group, value: g.value ?? 0 }));
  const overall = skills.reduce((a, s) => a + s.score, 0) / skills.length;
  const sorted = sortDesc(skills);
  const strong = sorted.filter((s) => s.score >= STRONG_THRESHOLD);
  const developing = sorted.filter((s) => s.score >= GAP_THRESHOLD && s.score < STRONG_THRESHOLD);
  const building = sorted.filter((s) => s.score < GAP_THRESHOLD);
  const focus = [...building, ...developing].sort((a, b) => a.score - b.score).slice(0, 3);
  const linkBase = r.student.student_id.startsWith("MY-") ? "/me" : null;

  return (
    <div>
      <PageHead eyebrow="Skill dashboard" title="Where your skills stand">
        <p className="max-w-xs text-xs text-muted-foreground">
          19 skills, scored out of {SCORE_MAX}. Building &lt; {GAP_THRESHOLD} · Developing {GAP_THRESHOLD}–{STRONG_THRESHOLD - 1} · Strong ≥ {STRONG_THRESHOLD}.
        </p>
      </PageHead>

      <div className="mb-10 grid grid-cols-2 border-y border-border md:grid-cols-4">
        <div className="col-span-2 border-b border-border py-6 pr-6 md:col-span-1 md:border-b-0 md:border-r">
          <p className="eyebrow">Overall skill readiness</p>
          <p className="num mt-2 text-5xl">{fmt(overall, 0)}<span className="text-lg text-muted-foreground">/{SCORE_MAX}</span></p>
          <div className="mt-3"><Meter value={overall} tone={skillState(overall).meter} /></div>
        </div>
        {([["Strong", strong.length, "text-strength"], ["Developing", developing.length, "text-primary"], ["Building", building.length, "text-gap"]] as const).map(([l, n, t]) => (
          <div key={l} className="border-r border-border px-5 py-6 last:border-r-0">
            <p className={`eyebrow ${t}`}>{l}</p>
            <p className={`num mt-2 text-4xl ${t}`}>{n}</p>
            <p className="text-[11px] text-muted-foreground">skills</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-6">
        <Tile className="lg:col-span-3" label="Skill categories">
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="group" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <PolarRadiusAxis domain={[0, SCORE_MAX]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            {groups.map((g) => (
              <li key={g.group} className="flex justify-between"><span className="text-muted-foreground">{g.group}</span><span className="num">{fmt(g.value, 0)}</span></li>
            ))}
          </ul>
        </Tile>
        <Tile className="lg:col-span-3" label="How to improve next">
          {focus.length ? (
            <ol className="divide-y divide-border">
              {focus.map((s, i) => (
                <li key={s.key} className="grid grid-cols-[24px_1fr] gap-3 py-3">
                  <span className="num text-sm text-primary">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm font-medium">
                      {s.label}<span className={`num text-xs ${skillState(s.score).tone}`}>{fmt(s.score)} → {s.score < GAP_THRESHOLD ? GAP_THRESHOLD : STRONG_THRESHOLD}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{SKILL_GUIDE[s.key].action}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Every skill is Strong. Keep them sharp with real projects.</p>
          )}
          {linkBase && <Link to="/me/gaps" className="mt-auto pt-4 font-mono text-xs uppercase tracking-wider text-primary hover:underline">See full gap analysis →</Link>}
        </Tile>

        {GROUPS.map((g) => (
          <Tile key={g} className={g === "Technical" ? "lg:col-span-6" : "lg:col-span-2"} label={g} aside={<span className="num text-xs text-muted-foreground">avg {fmt(groups.find((x) => x.group === g)?.value, 0)}</span>}>
            <ul className={g === "Technical" ? "grid gap-x-10 gap-y-4 md:grid-cols-2" : "space-y-4"}>
              {skills.filter((s) => s.group === g).map((s) => {
                const st = skillState(s.score);
                return (
                  <li key={s.key}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">{s.label}</span>
                      <span className="flex shrink-0 items-baseline gap-2">
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${st.tone}`}>{st.label}</span>
                        <span className={`num ${st.tone}`}>{fmt(s.score)}</span>
                      </span>
                    </div>
                    <Meter value={s.score} tone={st.meter} />
                  </li>
                );
              })}
            </ul>
          </Tile>
        ))}
      </div>
    </div>
  );
}
