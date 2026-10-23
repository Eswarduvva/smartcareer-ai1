import { useQuery } from "@tanstack/react-query";
import { useRecord, useRecommendationSource } from "@/lib/use-record";
import { useSession } from "@/lib/auth";
import { DASHBOARD_SKILLS, myCohortQuery } from "@/lib/api/dashboards";
import { scoredSkills, skillLabel, sortDesc, STRONG_THRESHOLD, GAP_THRESHOLD } from "@/lib/skills";
import { ChartCard, ColumnChart, KpiCard, f2 } from "./Charts";

/** Personal KPIs and charts; cohort benchmark shown only for an approved cohort link. */
export function StudentKpis() {
  const r = useRecord();
  const source = useRecommendationSource();
  const session = useSession();
  const cohort = useQuery(myCohortQuery(session?.user.id));
  const bench = cohort.data?.linked ? cohort.data.benchmark : null;
  const rec = r.recommendation;
  const readiness = r.goals?.career_readiness_score ?? null;
  const skills = DASHBOARD_SKILLS.map((k) => ({ label: skillLabel(k), value: Number(r.skills?.[k] ?? 0) }));
  const all = sortDesc(scoredSkills(r.skills));
  const strengths = all.filter((s) => s.score >= STRONG_THRESHOLD).slice(0, 5);
  const dev = [...all].reverse().filter((s) => s.score < GAP_THRESHOLD).slice(0, 5);
  const compare = bench ? [
    { label: "Readiness", you: Number(readiness ?? 0), cohort: bench.avg_readiness ?? 0 },
    { label: "Career match", you: Number(rec?.career_match_score ?? 0), cohort: bench.avg_match ?? 0 },
    { label: "Skill gap", you: Number(rec?.skill_gap_score ?? 0), cohort: bench.avg_gap ?? 0 },
  ] : null;

  return (
    <section aria-label="My dashboard" className="mb-10">
      <p className="mb-3 text-xs text-muted-foreground">{source === "database" ? "From your approved SmartCareer student record." : "From your self-entered profile."}</p>
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Career readiness" value={f2(readiness)} tone="strength" {...(bench ? { hint: `Cohort avg ${f2(bench.avg_readiness)}` } : {})} />
        <KpiCard label="Career match" value={`${f2(rec?.career_match_score)}%`} />
        <KpiCard label="Skill gap" value={f2(rec?.skill_gap_score)} tone="gap" {...(bench ? { hint: `Cohort avg ${f2(bench.avg_gap)}` } : {})} />
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="eyebrow">Recommended</p>
          <p className="mt-2 font-medium">{rec?.recommended_role ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{rec?.recommended_career_domain ?? ""}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Personal skill performance" desc="Your scores (0–100) for five core skills.">
          <ColumnChart data={skills} bars={[{ key: "value", name: "Your score", color: "var(--color-chart-1)" }]} domain={[0, 100]} />
        </ChartCard>
        {compare ? (
          <ChartCard title="You vs cohort benchmark" desc="Cohort averages are aggregate figures only.">
            <ColumnChart data={compare} bars={[{ key: "you", name: "You", color: "var(--color-chart-1)" }, { key: "cohort", name: "Cohort avg", color: "var(--color-chart-4)" }]} domain={[0, 100]} />
          </ChartCard>
        ) : (
          <ChartCard title="Strengths and development areas" desc={`Strong ≥ ${STRONG_THRESHOLD}, development area < ${GAP_THRESHOLD}.`}>
            <SkillLists strengths={strengths} dev={dev} />
          </ChartCard>
        )}
        {compare && (
          <div className="lg:col-span-2">
            <ChartCard title="Strengths and development areas" desc={`Strong ≥ ${STRONG_THRESHOLD}, development area < ${GAP_THRESHOLD}.`}>
              <SkillLists strengths={strengths} dev={dev} />
            </ChartCard>
          </div>
        )}
      </div>
    </section>
  );
}

function SkillLists({ strengths, dev }: { strengths: { key: string; label: string; score: number }[]; dev: { key: string; label: string; score: number }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {([["Strengths", strengths, "text-strength"], ["Development areas", dev, "text-gap"]] as const).map(([t, xs, c]) => (
        <div key={t}>
          <h3 className={`eyebrow mb-2 ${c}`}>{t}</h3>
          {xs.length ? <ul className="space-y-1 text-sm">{xs.map((s) => <li key={s.key} className="flex justify-between"><span>{s.label}</span><span className="num">{f2(s.score)}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">None yet.</p>}
        </div>
      ))}
    </div>
  );
}
