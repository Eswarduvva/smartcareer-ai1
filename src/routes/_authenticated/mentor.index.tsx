import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { ChartCard, ColumnChart, KpiCard, f2 } from "@/components/dashboard/Charts";
import { DASHBOARD_SKILLS } from "@/lib/api/dashboards";
import { db } from "@/lib/auth";
import { skillLabel } from "@/lib/skills";

export const Route = createFileRoute("/_authenticated/mentor/")({
  head: () => ({ meta: [{ title: "Mentor dashboard — SmartCareer" }, { name: "description", content: "Your assigned students and their progress." }, { property: "og:title", content: "Mentor dashboard — SmartCareer" }, { property: "og:description", content: "Assigned students and progress." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MentorDashboard,
});

type Rec = { recommended_role: string | null; recommended_career_domain: string | null; career_match_score: number | null; skill_gap_score: number | null };
type Row = {
  student_id: string;
  students: {
    degree: string | null; branch: string | null; cgpa: number | null;
    career_goals: { career_readiness_score: number | null } | { career_readiness_score: number | null }[] | null;
    career_recommendations: Rec | Rec[] | null;
    student_skill_scores: Record<string, number | null> | Record<string, number | null>[] | null;
  } | null;
};
const one = <T,>(x: T | T[] | null | undefined) => (Array.isArray(x) ? x[0] ?? null : x ?? null);
const nn = (v: unknown) => (v == null ? null : Number(v));
const avg = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null && !Number.isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

function MentorDashboard() {
  const q = useQuery({
    queryKey: ["mentor", "assigned"],
    queryFn: async () => {
      const { data: u } = await db.auth.getUser();
      // Only this mentor's own assignments; the database also limits rows to assigned students.
      const { data, error } = await db
        .from("mentor_assignments")
        .select(`student_id, students(degree, branch, cgpa, career_goals(career_readiness_score), career_recommendations(recommended_role, recommended_career_domain, career_match_score, skill_gap_score), student_skill_scores(${DASHBOARD_SKILLS.join(", ")}))`)
        .eq("mentor_id", u.user.id)
        .order("student_id");
      if (error) throw error;
      const ids = (data as Row[]).map((r) => r.student_id);
      const fb = ids.length ? await db.from("mentor_feedback").select("student_id").eq("mentor_id", u.user.id).in("student_id", ids) : { data: [] };
      const rows = (data as Row[]).map((r) => {
        const s = r.students; const g = one(s?.career_goals); const rc = one(s?.career_recommendations); const sk = one(s?.student_skill_scores);
        return {
          id: r.student_id, degree: s?.degree ?? null, branch: s?.branch ?? null, cgpa: nn(s?.cgpa),
          readiness: nn(g?.career_readiness_score), match: nn(rc?.career_match_score), gap: nn(rc?.skill_gap_score),
          role: rc?.recommended_role ?? null, domain: rc?.recommended_career_domain ?? null,
          skills: Object.fromEntries(DASHBOARD_SKILLS.map((k) => [k, nn(sk?.[k])])) as Record<string, number | null>,
        };
      });
      return { rows, feedback: (fb.data ?? []).length as number };
    },
  });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  const rows = q.data!.rows;

  const byDegree = [...new Set(rows.map((r) => r.degree).filter(Boolean) as string[])].sort().map((d) => ({ label: d, value: Number((avg(rows.filter((r) => r.degree === d).map((r) => r.readiness)) ?? 0).toFixed(2)) }));
  const skills = DASHBOARD_SKILLS.map((k) => ({ label: skillLabel(k), value: Number((avg(rows.map((r) => r.skills[k] ?? null)) ?? 0).toFixed(2)) }));
  const compare = rows.slice(0, 20).map((r) => ({ label: r.id, readiness: r.readiness ?? 0, match: r.match ?? 0, gap: r.gap ?? 0 }));

  return (
    <>
      <PageHead eyebrow="Mentor portal" title="Mentor dashboard" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Assigned students" value={String(rows.length)} tone="neutral" hint={`${q.data!.feedback} feedback notes`} />
        <KpiCard label="Avg career readiness" value={f2(avg(rows.map((r) => r.readiness)))} tone="strength" />
        <KpiCard label="Average skill gap" value={f2(avg(rows.map((r) => r.gap)))} tone="gap" />
        <KpiCard label="Average CGPA" value={f2(avg(rows.map((r) => r.cgpa)))} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No students assigned yet" body="An administrator assigns students to you. Their analytics will appear here." />
      ) : (
        <>
          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Career readiness by degree" desc="Assigned students only (0–100).">
              <ColumnChart data={byDegree} bars={[{ key: "value", name: "Avg readiness", color: "var(--color-chart-1)" }]} domain={[0, 100]} />
            </ChartCard>
            <ChartCard title="Skill performance analysis" desc="Average of assigned students (0–100).">
              <ColumnChart data={skills} bars={[{ key: "value", name: "Avg score", color: "var(--color-chart-3)" }]} domain={[0, 100]} />
            </ChartCard>
            <div className="lg:col-span-2">
              <ChartCard title="Student performance comparison" desc={`Readiness, match and skill gap per student${rows.length > 20 ? " (first 20)" : ""}.`}>
                <ColumnChart data={compare} bars={[{ key: "readiness", name: "Readiness", color: "var(--color-chart-1)" }, { key: "match", name: "Match %", color: "var(--color-chart-2)" }, { key: "gap", name: "Skill gap", color: "var(--color-gap)" }]} domain={[0, 100]} />
              </ChartCard>
            </div>
          </div>
          <h2 className="mb-4 text-xl">Assigned students · career recommendations</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="eyebrow text-left"><tr className="border-b border-border">{["Student", "Degree · branch", "CGPA", "Readiness", "Match", "Gap", "Recommendation", ""].map((h) => <th key={h} className="p-3 font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono">{r.id}</td>
                    <td className="p-3">{[r.degree, r.branch].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="num p-3">{f2(r.cgpa)}</td>
                    <td className="num p-3">{f2(r.readiness)}</td>
                    <td className="num p-3">{f2(r.match)}</td>
                    <td className="num p-3">{f2(r.gap)}</td>
                    <td className="p-3">{r.role ?? "—"}<span className="block text-xs text-muted-foreground">{r.domain}</span></td>
                    <td className="p-3 text-right"><Link to="/mentor/review/$id" params={{ id: r.id }} className="font-mono text-xs uppercase tracking-wider text-primary hover:underline">Review →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
