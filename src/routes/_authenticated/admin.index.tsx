import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ErrorState, LoadingState, PageHead, Tile } from "@/components/kit";
import { CohortDashboard } from "@/components/dashboard/CohortDashboard";
import { db } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/")({
  validateSearch: z.object({ degree: z.string().optional(), branch: z.string().optional() }),
  head: () => ({ meta: [{ title: "Admin dashboard — SmartCareer" }, { name: "description", content: "Platform overview, accounts and student dataset status." }, { property: "og:title", content: "Admin dashboard — SmartCareer" }, { property: "og:description", content: "Platform overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AdminDashboard,
});

const TABLES = ["students", "student_skill_scores", "student_experience", "career_preferences", "career_goals", "career_recommendations", "mentor_assignments"] as const;

async function count(t: string, f?: (q: any) => any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let q = db.from(t).select("*", { count: "exact", head: true });
  if (f) q = f(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function AdminDashboard() {
  const q = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const users = await db.rpc("admin_list_users");
      if (users.error) throw users.error;
      const tables = await Promise.all(TABLES.map(async (t) => [t, await count(t)] as const));
      const open = await count("support_messages", (x) => x.neq("status", "resolved"));
      const list = users.data as { roles: string[] }[];
      return {
        users: list.length,
        mentors: list.filter((u) => u.roles.includes("mentor")).length,
        admins: list.filter((u) => u.roles.includes("admin")).length,
        open, tables,
      };
    },
  });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  const d = q.data!;
  return (
    <>
      <PageHead eyebrow="Admin portal" title="Admin dashboard" />
      <div className="mb-12 grid gap-px border border-border bg-border sm:grid-cols-4">
        <Tile label="Accounts"><p className="num text-3xl">{d.users}</p></Tile>
        <Tile label="Mentors"><p className="num text-3xl">{d.mentors}</p></Tile>
        <Tile label="Admins"><p className="num text-3xl">{d.admins}</p></Tile>
        <Tile label="Open messages"><p className="num text-3xl">{d.open}</p></Tile>
      </div>
      <h2 className="mb-2 text-xl">Student dataset</h2>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Record counts in the cohort tables. The cleaned dataset hasn't been imported yet. Imports are run by the SmartCareer team, not from the browser, so student records can't be edited or overwritten by accident.
      </p>
      <div className="max-w-xl border border-border">
        {d.tables.map(([t, c]) => (
          <div key={t} className="flex justify-between border-b border-border px-4 py-2 text-sm last:border-0">
            <span className="font-mono">{t}</span><span className="num">{c}</span>
          </div>
        ))}
      </div>
    </>
  );
}
