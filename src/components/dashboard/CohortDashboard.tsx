import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState } from "@/components/kit";
import { DASHBOARD_SKILLS, dashboardQuery } from "@/lib/api/dashboards";
import { skillLabel } from "@/lib/skills";
import { ChartCard, ColumnChart, FilterSelect, HBarChart, KpiCard, f2 } from "./Charts";

/** Admin cohort analytics. Filtering runs in the database; rows are scoped by existing policies. */
export function CohortDashboard({ degree, branch, onFilter }: { degree?: string | undefined; branch?: string | undefined; onFilter: (f: { degree?: string | undefined; branch?: string | undefined }) => void }) {
  const q = useQuery(dashboardQuery({ degree, branch }));
  return (
    <section aria-labelledby="cohort-h" className="mb-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="cohort-h" className="text-xl">Cohort analytics</h2>
          <p className="text-sm text-muted-foreground">Live from the student database. Filters apply to every card and chart.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterSelect label="Degree" value={degree} options={q.data?.degrees ?? []} onChange={(d) => onFilter({ degree: d, branch: undefined })} />
          <FilterSelect label="Branch" value={branch} options={q.data?.branches ?? []} onChange={(b) => onFilter({ degree, branch: b })} />
        </div>
      </div>
      {q.isLoading ? <LoadingState /> : q.error ? <ErrorState error={q.error} /> : !q.data || q.data.student_count === 0 ? (
        <EmptyState title="No students match these filters" body="Clear the degree or branch filter to see the whole cohort." />
      ) : (() => {
        const a = q.data;
        const skills = DASHBOARD_SKILLS.map((k) => ({ label: skillLabel(k), value: a.skills[k] ?? 0 }));
        return (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard label="Total students" value={a.student_count.toLocaleString()} tone="neutral" />
              <KpiCard label="Average CGPA" value={f2(a.avg_cgpa)} hint="Scale 0–10" />
              <KpiCard label="Avg career readiness" value={f2(a.avg_readiness)} tone="strength" hint="Scale 0–100" />
              <KpiCard label="Average skill gap" value={f2(a.avg_gap)} tone="gap" hint="Lower is better" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Career goal distribution" desc="Students per stated career goal.">
                <HBarChart data={a.goals} />
              </ChartCard>
              <ChartCard title="Recommended career domains" desc="Students per recommended domain.">
                <HBarChart data={a.domains} color="var(--color-chart-2)" />
              </ChartCard>
              <ChartCard title="Average career readiness by degree" desc="Mean readiness score (0–100).">
                <ColumnChart data={a.readiness_by_degree} bars={[{ key: "value", name: "Avg readiness", color: "var(--color-chart-1)" }]} domain={[0, 100]} />
              </ChartCard>
              <ChartCard title="Average student skill performance" desc="Mean score (0–100) for five core skills.">
                <ColumnChart data={skills} bars={[{ key: "value", name: "Avg score", color: "var(--color-chart-3)" }]} domain={[0, 100]} />
              </ChartCard>
            </div>
          </>
        );
      })()}
    </section>
  );
}
