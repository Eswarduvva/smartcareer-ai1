import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { studentsQuery } from "@/lib/api/queries";
import { EmptyState, ErrorState, LoadingState, Meter, PageHead } from "@/components/kit";
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
      { title: "Students — SmartCareer" },
      { name: "description", content: "Mentor view: search students and see readiness, career match and skill gaps." },
      { property: "og:title", content: "Students — SmartCareer" },
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
      <PageHead eyebrow="Mentor / Admin · Student directory" title="Students">
        <div>
        <p className="num text-sm text-muted-foreground">{data.total} matching</p></div>
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
        <input name="q" defaultValue={s.q} placeholder="Name, ID, branch, city or role…" aria-label="Search students" className="min-w-0 flex-1 basis-56 border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        <input name="minCgpa" type="number" step="0.1" min="0" max="10" defaultValue={s.minCgpa} placeholder="Min CGPA" className="w-32 border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        <button className="border border-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-foreground hover:text-background">Search</button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState title="No students match these filters" body="Try a broader search." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((st) => (
            <li key={st.student_id}>
              <Link to="/students/$id" params={{ id: st.student_id }} className="group flex h-full flex-col border border-border bg-card p-5 transition-colors hover:border-primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium group-hover:text-primary">{st.full_name ?? st.student_id}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{st.student_id} · {st.degree} {st.branch}</p>
                  </div>
                  <span className="num shrink-0 text-2xl text-primary">{fmt(st.match, 0)}<span className="text-xs text-muted-foreground">%</span></span>
                </div>
                <p className="mt-3 text-sm">{st.role ?? "—"}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Readiness</span><span className="num">{fmt(st.readiness, 0)}</span></div>
                  <Meter value={st.readiness ?? 0} max={100} tone="strength" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {st.top_skills.map((t) => <span key={t} className="border border-strength/40 px-2 py-0.5 text-[11px]">{t}</span>)}
                </div>
                <p className="mt-auto pt-4 text-[11px] text-muted-foreground">
                  <span className="text-gap num">{st.gap_count ?? "—"}</span> skill gap{st.gap_count === 1 ? "" : "s"} · CGPA <span className="num">{fmt(st.cgpa, 2)}</span> · {st.city}
                </p>
              </Link>
            </li>
          ))}
        </ul>
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
