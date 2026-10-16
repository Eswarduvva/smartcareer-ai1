import { useQuery } from "@tanstack/react-query";
import { db, useRoles } from "@/lib/auth";
import { skillLabel } from "@/lib/skills";
import type { SkillKey } from "@/lib/api/types";

type DQ = {
  total: number;
  skill_scale_max: number;
  cgpa_max: number;
  missing: { table: string; column: string; count: number }[];
  skill_out_of_range: { column: string; negative: number; above_max: number }[];
  cgpa_below_zero: number;
  cgpa_above_max: number;
  students_flagged: number;
};

/** Admin-only data-quality report. Flags values; never corrects them. */
export function DataQuality() {
  const { roles } = useRoles();
  const isAdmin = roles?.includes("admin") ?? false;
  const q = useQuery({
    queryKey: ["admin", "data-quality"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await db.rpc("get_data_quality");
      if (error) throw error;
      return data as DQ;
    },
  });
  if (!isAdmin) return null;
  if (q.isLoading) return <p className="mb-10 text-sm text-muted-foreground">Checking data quality…</p>;
  if (q.error || !q.data) return <p className="mb-10 text-sm text-gap">Data-quality check could not run.</p>;
  const d = q.data;
  const totalMissing = d.missing.reduce((a, m) => a + m.count, 0);
  const clean = d.students_flagged === 0 && totalMissing === 0;

  return (
    <section aria-labelledby="dq" className="mb-12 rounded-lg border border-border bg-card p-6">
      <p className="eyebrow">Admin · Data quality</p>
      <h2 id="dq" className="mt-1 text-lg font-medium">Dataset validation</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Checked against an assumed scale of 0–{d.skill_scale_max} for skills and 0–{d.cgpa_max} for CGPA. Values are flagged only — nothing has been changed until the real scale is confirmed. Scores and charts on this page still include flagged rows.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Students flagged", d.students_flagged, `of ${d.total.toLocaleString()}`],
          ["Missing values", totalMissing, `${d.missing.length} column${d.missing.length === 1 ? "" : "s"}`],
          ["CGPA below 0", d.cgpa_below_zero, "students"],
          [`CGPA above ${d.cgpa_max}`, d.cgpa_above_max, "students"],
        ].map(([l, v, sub]) => (
          <div key={l as string} className="rounded-md border border-border p-4">
            <p className="eyebrow">{l}</p>
            <p className={`num mt-1 text-2xl ${Number(v) > 0 ? "text-gap" : "text-strength"}`}>{Number(v).toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>
      {clean ? (
        <p className="mt-5 text-sm text-strength">No issues found.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">Skill scores out of range</h3>
            {d.skill_out_of_range.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] text-muted-foreground"><th className="py-1">Skill</th><th className="num">Below 0</th><th className="num">Above {d.skill_scale_max}</th></tr></thead>
                <tbody>
                  {d.skill_out_of_range.map((s) => (
                    <tr key={s.column} className="border-t border-border">
                      <td className="py-1">{skillLabel(s.column as SkillKey)}</td>
                      <td className="num text-gap">{s.negative}</td>
                      <td className="num text-gap">{s.above_max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Missing values by column</h3>
            {d.missing.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] text-muted-foreground"><th className="py-1">Column</th><th className="num">Missing</th></tr></thead>
                <tbody>
                  {d.missing.map((m) => (
                    <tr key={m.table + m.column} className="border-t border-border">
                      <td className="py-1 font-mono text-xs">{m.column}</td>
                      <td className="num text-gap">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
