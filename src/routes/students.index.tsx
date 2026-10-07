import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { studentsQuery } from "@/lib/api/queries";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { fmt } from "@/lib/skills";

const search = z.object({
  q: z.string().optional(),
  minCgpa: z.number().optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/students/")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(studentsQuery({ ...deps, pageSize: 25 })),
  head: () => ({
    meta: [
      { title: "Students — SmartCareer AI" },
      { name: "description", content: "Search students by ID, branch, city and CGPA." },
      { property: "og:title", content: "Students — SmartCareer AI" },
      { property: "og:description", content: "Search students by ID, branch, city and CGPA." },
    ],
  }),
  pendingComponent: () => <LoadingState />,
  errorComponent: ({ error }) => <ErrorState error={error} />,
  component: StudentsPage,
});

function StudentsPage() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/students/" });
  const { data } = useSuspenseQuery(studentsQuery({ ...s, pageSize: 25 }));
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div>
      <PageHead eyebrow="Cohort" title="Students">
        <p className="num text-sm text-muted-foreground">{data.total} matching</p>
      </PageHead>

      <form
        className="mb-6 flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const q = String(f.get("q") || "") || undefined;
          const c = Number(f.get("minCgpa"));
          navigate({ search: { q, minCgpa: c > 0 ? c : undefined, page: undefined } });
        }}
      >
        <input name="q" defaultValue={s.q} placeholder="Student ID, branch, city…" className="min-w-64 flex-1 border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        <input name="minCgpa" type="number" step="0.1" min="0" max="10" defaultValue={s.minCgpa} placeholder="Min CGPA" className="w-32 border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        <button className="border border-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-foreground hover:text-background">Search</button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState title="No students match these filters" body="Try a broader search." />
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr className="eyebrow">
                {["ID", "Degree", "Branch", "Specialization", "City", "Grad", "CGPA"].map((h) => (
                  <th key={h} className="px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((st) => (
                <tr key={st.student_id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link to="/students/$id" params={{ id: st.student_id }} className="font-mono text-primary hover:underline">
                      {st.student_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{st.degree ?? "—"}</td>
                  <td className="px-4 py-3">{st.branch ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{st.specialization ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{st.city ?? "—"}</td>
                  <td className="num px-4 py-3">{st.graduation_year ?? "—"}</td>
                  <td className="num px-4 py-3 text-right">{fmt(st.cgpa, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center gap-4 font-mono text-xs">
          <button disabled={data.page <= 1} onClick={() => navigate({ search: (p) => ({ ...p, page: data.page - 1 }) })} className="disabled:opacity-30">← Prev</button>
          <span className="num">{data.page} / {pages}</span>
          <button disabled={data.page >= pages} onClick={() => navigate({ search: (p) => ({ ...p, page: data.page + 1 }) })} className="disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}
