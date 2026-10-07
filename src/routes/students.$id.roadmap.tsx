import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";
import type { StudentRecord } from "@/lib/api/types";

export const Route = createFileRoute("/students/$id/roadmap")({
  head: ({ params }) => ({
    meta: [
      { title: `Career roadmap ${params.id} — SmartCareer AI` },
      { name: "description", content: "Rule-based next steps from the student's weakest skills and experience." },
      { property: "og:title", content: `Career roadmap ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "Rule-based next steps toward the recommended career." },
    ],
  }),
  component: Roadmap,
});

interface Step { title: string; why: string }

/** Transparent rules — no model involved. */
function buildSteps(r: StudentRecord): Step[] {
  const steps: Step[] = [];
  const gaps = scoredSkills(r.skills).filter((s) => s.score < GAP_THRESHOLD).sort((a, b) => a.score - b.score);
  gaps.slice(0, 3).forEach((g) =>
    steps.push({ title: `Raise ${g.label}`, why: `Scored ${fmt(g.score)}, ${fmt(GAP_THRESHOLD - g.score)} points below ${GAP_THRESHOLD}.` }),
  );
  const e = r.experience;
  if (e && (e.project_count ?? 0) < 2) steps.push({ title: "Build another project", why: `${e.project_count ?? 0} project(s) on record.` });
  if (e && (e.internship_count ?? 0) === 0) steps.push({ title: "Pursue an internship", why: "No internships on record." });
  if (e && (e.certification_count ?? 0) < 1) steps.push({ title: "Earn a relevant certification", why: "No certifications on record." });
  if ((r.student.backlogs ?? 0) > 0) steps.push({ title: "Clear academic backlogs", why: `${r.student.backlogs} backlog(s) on record.` });
  return steps;
}

function Stage({ n, label, tone, children, last }: { n: string; label: string; tone: string; children: React.ReactNode; last?: boolean }) {
  return (
    <li className="relative grid grid-cols-[48px_1fr] gap-6 md:grid-cols-[64px_200px_1fr]">
      {!last && <span className="absolute left-[23px] top-10 bottom-0 w-px bg-border md:left-[31px]" />}
      <span className={`num relative z-10 flex h-12 w-12 items-center justify-center border bg-background text-sm md:h-16 md:w-16 ${tone}`}>{n}</span>
      <p className="eyebrow pt-2 md:pt-5">{label}</p>
      <div className="col-start-2 pb-12 md:col-start-3 md:pt-4">{children}</div>
    </li>
  );
}

function Roadmap() {
  const r = useRecord();
  const steps = buildSteps(r);
  const dest = r.recommendation?.recommended_role;
  const all = scoredSkills(r.skills).sort((a, b) => b.score - a.score);
  const strengths = all.filter((s) => s.score >= STRONG_THRESHOLD).slice(0, 4);
  const gaps = all.filter((s) => s.score < GAP_THRESHOLD).reverse().slice(0, 4);

  return (
    <div>
      <PageHead eyebrow="Career roadmap" title={dest ? `Toward ${dest}` : "Next steps"}>
        <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rule-based roadmap · not AI generated</span>
      </PageHead>
      <ol className="max-w-4xl">
        <Stage n="01" label="Current profile" tone="border-foreground">
          <p className="text-lg">{r.student.degree} · {r.student.branch}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            CGPA <span className="num text-foreground">{fmt(r.student.cgpa, 2)}</span> · Readiness <span className="num text-foreground">{fmt(r.goals?.career_readiness_score)}</span> · Match <span className="num text-foreground">{fmt(r.recommendation?.career_match_score)}%</span>
          </p>
        </Stage>
        <Stage n="02" label="Strengths" tone="border-strength text-strength">
          {strengths.length ? (
            <div className="flex flex-wrap gap-2">{strengths.map((s) => <span key={s.key} className="border border-strength/40 px-2.5 py-1 text-sm">{s.label} <span className="num text-strength">{fmt(s.score)}</span></span>)}</div>
          ) : <p className="text-sm text-muted-foreground">No skills at or above {STRONG_THRESHOLD}.</p>}
        </Stage>
        <Stage n="03" label="Priority gaps" tone="border-gap text-gap">
          {gaps.length ? (
            <div className="flex flex-wrap gap-2">{gaps.map((s) => <span key={s.key} className="border border-dashed border-gap/60 px-2.5 py-1 text-sm">{s.label} <span className="num text-gap">{fmt(s.score)}</span></span>)}</div>
          ) : <p className="text-sm text-muted-foreground">No skills below {GAP_THRESHOLD}.</p>}
        </Stage>
        <Stage n="04" label="Skill development" tone="border-primary text-primary">
          {steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rule-triggered actions.</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[32px_1fr] gap-3 py-3">
                  <span className="num pt-0.5 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <div><p className="font-medium">{s.title}</p><p className="text-sm text-muted-foreground">{s.why}</p></div>
                </li>
              ))}
            </ul>
          )}
        </Stage>
        <Stage n="05" label="Career target" tone="border-primary bg-primary text-primary-foreground" last>
          <p className="text-2xl font-medium text-primary">{dest ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{r.recommendation?.recommended_career_domain}</p>
        </Stage>
      </ol>
      <p className="mt-2 max-w-2xl text-xs text-muted-foreground">Each step comes from a fixed rule applied to this student's recorded scores and experience. Thresholds are application rules.</p>
    </div>
  );
}
