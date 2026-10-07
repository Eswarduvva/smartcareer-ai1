import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, scoredSkills } from "@/lib/skills";
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

function Roadmap() {
  const r = useRecord();
  const steps = buildSteps(r);
  const dest = r.recommendation?.recommended_role;

  return (
    <div>
      <PageHead eyebrow="Career roadmap" title={dest ? `Toward ${dest}` : "Next steps"}>
        <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rule-based · not AI generated</span>
      </PageHead>
      <ol className="relative ml-3 max-w-2xl border-l border-border">
        <li className="mb-10 pl-8">
          <span className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full bg-foreground" />
          <p className="eyebrow">Now</p>
          <p className="mt-1">Readiness <span className="num">{fmt(r.goals?.career_readiness_score)}</span> · Match <span className="num">{fmt(r.recommendation?.career_match_score)}%</span></p>
        </li>
        {steps.length === 0 && <li className="mb-10 pl-8 text-sm text-muted-foreground">No rule-triggered actions — all skills are at or above {GAP_THRESHOLD} and experience is on record.</li>}
        {steps.map((s, i) => (
          <li key={s.title} className="mb-10 pl-8">
            <span className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-gap bg-background" />
            <p className="eyebrow">Step {String(i + 1).padStart(2, "0")}</p>
            <p className="mt-1 text-lg font-medium">{s.title}</p>
            <p className="text-sm text-muted-foreground">{s.why}</p>
          </li>
        ))}
        <li className="pl-8">
          <span className="absolute -left-[8px] mt-1 h-4 w-4 rotate-45 bg-primary" />
          <p className="eyebrow">Destination</p>
          <p className="mt-1 text-lg font-medium text-primary">{dest ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{r.recommendation?.recommended_career_domain}</p>
        </li>
      </ol>
    </div>
  );
}
