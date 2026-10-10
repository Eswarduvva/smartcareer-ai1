import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState, PageHead, Tile } from "@/components/kit";
import { db } from "@/lib/auth";
import { fmt } from "@/lib/skills";

export const Route = createFileRoute("/_authenticated/mentor/")({
  head: () => ({ meta: [{ title: "Mentor dashboard — SmartCareer" }, { name: "description", content: "Your assigned students and their progress." }, { property: "og:title", content: "Mentor dashboard — SmartCareer" }, { property: "og:description", content: "Assigned students and progress." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MentorDashboard,
});

type Row = {
  student_id: string;
  students: {
    degree: string | null; branch: string | null; cgpa: number | null;
    career_goals: { career_readiness_score: number | null }[] | { career_readiness_score: number | null } | null;
    career_recommendations: { recommended_role: string | null; career_match_score: number | null; skill_gap_score: number | null }[] | { recommended_role: string | null; career_match_score: number | null; skill_gap_score: number | null } | null;
  } | null;
};
const one = <T,>(x: T | T[] | null | undefined) => (Array.isArray(x) ? x[0] ?? null : x ?? null);

function MentorDashboard() {
  const q = useQuery({
    queryKey: ["mentor", "assigned"],
    queryFn: async () => {
      const { data: u } = await db.auth.getUser();
      const { data, error } = await db
        .from("mentor_assignments")
        .select("student_id, students(degree, branch, cgpa, career_goals(career_readiness_score), career_recommendations(recommended_role, career_match_score, skill_gap_score))")
        .eq("mentor_id", u.user.id)
        .order("student_id");
      if (error) throw error;
      const ids = (data as Row[]).map((r) => r.student_id);
      const fb = ids.length ? await db.from("mentor_feedback").select("student_id").in("student_id", ids) : { data: [] };
      return { rows: data as Row[], feedback: (fb.data ?? []).length as number };
    },
  });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  const rows = q.data!.rows;
  const ready = rows.map((r) => one(r.students?.career_goals)?.career_readiness_score).filter((v): v is number => v != null).map(Number);
  const avg = ready.length ? ready.reduce((a, b) => a + b, 0) / ready.length : null;

  return (
    <>
      <PageHead eyebrow="Mentor portal" title="Mentor dashboard" />
      <div className="mb-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Tile label="Assigned students"><p className="num text-3xl">{rows.length}</p></Tile>
        <Tile label="Average readiness"><p className="num text-3xl">{avg == null ? "—" : fmt(avg)}</p></Tile>
        <Tile label="Feedback notes"><p className="num text-3xl">{q.data!.feedback}</p></Tile>
      </div>
      <h2 className="mb-4 text-xl">Assigned students · progress overview</h2>
      {rows.length === 0 ? (
        <EmptyState title="No students assigned yet" body="An administrator assigns students to you. They will appear here." />
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="eyebrow text-left"><tr className="border-b border-border">{["Student", "Degree · branch", "CGPA", "Readiness", "Match", "Role", ""].map((h) => <th key={h} className="p-3 font-normal">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => {
                const g = one(r.students?.career_goals); const rc = one(r.students?.career_recommendations);
                return (
                  <tr key={r.student_id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono">{r.student_id}</td>
                    <td className="p-3">{[r.students?.degree, r.students?.branch].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="num p-3">{r.students?.cgpa ?? "—"}</td>
                    <td className="num p-3">{g?.career_readiness_score ?? "—"}</td>
                    <td className="num p-3">{rc?.career_match_score ?? "—"}</td>
                    <td className="p-3">{rc?.recommended_role ?? "—"}</td>
                    <td className="p-3 text-right"><Link to="/mentor/review/$id" params={{ id: r.student_id }} className="font-mono text-xs uppercase tracking-wider text-primary hover:underline">Review →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
