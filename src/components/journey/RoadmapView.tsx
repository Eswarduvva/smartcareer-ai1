import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PageHead } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { SKILL_GUIDE, trackByRole } from "@/lib/careers";
import { fmt, GAP_THRESHOLD, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";
import type { StudentRecord } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface Step { title: string; why: string }

/** Short next-step list (used on the results page). Transparent rules — no model involved. */
export function buildSteps(r: StudentRecord): Step[] {
  const steps: Step[] = [];
  const gaps = scoredSkills(r.skills).filter((s) => s.score < GAP_THRESHOLD).sort((a, b) => a.score - b.score);
  gaps.slice(0, 3).forEach((g) =>
    steps.push({ title: `Raise ${g.label}`, why: `Scored ${fmt(g.score)}, ${fmt(GAP_THRESHOLD - g.score)} points below ${GAP_THRESHOLD}.` }),
  );
  const e = r.experience;
  if (e && (e.project_count ?? 0) < 2) steps.push({ title: "Build another project", why: `${e.project_count ?? 0} project(s) so far.` });
  if (e && (e.internship_count ?? 0) === 0) steps.push({ title: "Pursue an internship", why: "No internships yet." });
  if (e && (e.certification_count ?? 0) < 1) steps.push({ title: "Earn a relevant certification", why: "No certifications yet." });
  if ((r.student.backlogs ?? 0) > 0) steps.push({ title: "Clear academic backlogs", why: `${r.student.backlogs} backlog(s) pending.` });
  return steps;
}

interface Stage { id: string; title: string; objective: string; skills: string[]; project: string; activity: string; next: string }

export function buildRoadmap(r: StudentRecord): Stage[] {
  const track = trackByRole(r.recommendation?.recommended_role);
  const role = track?.role ?? "your target role";
  const all = scoredSkills(r.skills).sort((a, b) => a.score - b.score);
  const weakFund = all.filter((s) => s.score < GAP_THRESHOLD && !track?.skills.includes(s.key)).slice(0, 3);
  const keyMissing = all.filter((s) => track?.skills.includes(s.key) && s.score < STRONG_THRESHOLD);
  const e = r.experience;
  const fund = weakFund.length ? weakFund : all.filter((s) => s.score < STRONG_THRESHOLD).slice(0, 2);
  return [
    {
      id: "fundamentals",
      title: "Strengthen fundamentals",
      objective: fund.length ? "Lift your weakest general skills so they stop holding you back." : "Your fundamentals are solid — keep them sharp.",
      skills: fund.map((s) => s.label),
      project: "Short daily practice sets instead of one big project.",
      activity: fund[0] ? SKILL_GUIDE[fund[0].key].action : "Spend 30 minutes a week revising core subjects.",
      next: fund[0] ? `Practise ${fund[0].label} three times this week.` : "Move on to role skills.",
    },
    {
      id: "role-skills",
      title: "Build required skills",
      objective: `Bring every key skill for ${role} up to ${STRONG_THRESHOLD}.`,
      skills: keyMissing.length ? keyMissing.map((s) => s.label) : (track?.skills ?? []).map((k) => all.find((s) => s.key === k)?.label ?? k),
      project: "Follow one structured course per missing skill.",
      activity: keyMissing[0] ? SKILL_GUIDE[keyMissing[0].key].action : "Take an advanced course in your strongest key skill.",
      next: keyMissing[0] ? `Start a course in ${keyMissing[0].label}.` : "All key skills at target — go deeper.",
    },
    {
      id: "projects",
      title: "Complete projects",
      objective: `Prove your skills with ${Math.max(2, 3 - (e?.project_count ?? 0))} portfolio project${(e?.project_count ?? 0) >= 2 ? "" : "s"} relevant to ${role}.`,
      skills: (track?.skills ?? []).slice(0, 3).map((k) => all.find((s) => s.key === k)?.label ?? k),
      project: PROJECTS[track?.id ?? ""] ?? "Build an end-to-end project and publish it on GitHub.",
      activity: "Write a clear README and a short demo video for each project.",
      next: `You have ${e?.project_count ?? 0} project(s). Pick your next idea this week.`,
    },
    {
      id: "experience",
      title: "Gain experience",
      objective: "Get real-world exposure through internships, freelancing or open source.",
      skills: ["Teamwork", "Communication"],
      project: "Contribute one fix or feature to an open-source repository.",
      activity: (e?.internship_count ?? 0) === 0 ? "Apply to five internships this month." : "Ask for a stretch task in your current internship.",
      next: `${e?.internship_count ?? 0} internship(s) and ${e?.certification_count ?? 0} certification(s) so far.`,
    },
    {
      id: "job-ready",
      title: "Become job ready",
      objective: `Prepare to apply for ${role} roles with confidence.`,
      skills: ["Aptitude", "Problem Solving", "Communication"],
      project: "Polish your resume, LinkedIn and portfolio around your best two projects.",
      activity: "Do two mock interviews and one timed aptitude test every week.",
      next: "Shortlist ten companies and note what each one asks for.",
    },
  ];
}

const PROJECTS: Record<string, string> = {
  "software-developer": "A full-stack task manager with sign-in, database and deployment.",
  "data-analyst": "A sales dashboard built from a public dataset with SQL and charts.",
  "data-scientist": "A prediction model with a written evaluation and a small demo app.",
  "ui-ux-designer": "A case study redesigning a real app, from research to tested prototype.",
  "cloud-devops": "Deploy an app with CI/CD, containers and monitoring on a free cloud tier.",
};

function useDone(id: string) {
  const key = `sc-roadmap-${id}`;
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { setDone([]); }
  }, [key]);
  const toggle = (s: string) =>
    setDone((cur) => {
      const next = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  return [done, toggle] as const;
}

export function RoadmapView() {
  const r = useRecord();
  const stages = buildRoadmap(r);
  const [done, toggle] = useDone(r.student.student_id);
  const dest = r.recommendation?.recommended_role;
  const pct = Math.round((done.filter((d) => stages.some((s) => s.id === d)).length / stages.length) * 100);
  const nextStage = stages.find((s) => !done.includes(s.id));

  return (
    <div>
      <PageHead eyebrow="Career roadmap · rule-based" title={dest ? `Your path to ${dest}` : "Your career roadmap"}>
        <div className="w-full max-w-56">
          <p className="eyebrow mb-2 flex justify-between"><span>Progress</span><span className="num text-foreground">{pct}%</span></p>
          <div className="h-1.5 bg-muted"><div className="h-full bg-strength transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
        </div>
      </PageHead>

      <ol className="max-w-4xl">
        {stages.map((s, i) => {
          const isDone = done.includes(s.id);
          const isNext = nextStage?.id === s.id;
          return (
            <li key={s.id} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-6">
              {i < stages.length - 1 && <span className={cn("absolute bottom-0 left-[21px] top-12 w-px sm:left-[27px]", isDone ? "bg-strength" : "bg-border")} />}
              <button
                onClick={() => toggle(s.id)}
                aria-pressed={isDone}
                aria-label={isDone ? `Mark step ${i + 1} as not done` : `Mark step ${i + 1} as done`}
                className={cn(
                  "num relative z-10 flex h-11 w-11 items-center justify-center border text-sm transition-colors sm:h-14 sm:w-14",
                  isDone ? "border-strength bg-strength text-background" : isNext ? "border-primary bg-background text-primary" : "border-border bg-background text-muted-foreground hover:border-foreground",
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : String(i + 1).padStart(2, "0")}
              </button>
              <div className={cn("mb-6 border border-border bg-card p-5 transition-opacity", isDone && "opacity-70")}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-medium">Step {i + 1} — {s.title}</h2>
                  <span className={cn("font-mono text-[10px] uppercase tracking-wider", isDone ? "text-strength" : isNext ? "text-primary" : "text-muted-foreground")}>
                    {isDone ? "Completed" : isNext ? "Up next" : "Not started"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.objective}</p>
                <dl className="mt-4 grid gap-4 border-t border-border pt-4 text-sm md:grid-cols-3">
                  <div>
                    <dt className="eyebrow mb-1.5">Skills to learn</dt>
                    <dd className="flex flex-wrap gap-1.5">{s.skills.length ? s.skills.map((k) => <span key={k} className="border border-border px-2 py-0.5 text-xs">{k}</span>) : <span className="text-muted-foreground">—</span>}</dd>
                  </div>
                  <div><dt className="eyebrow mb-1.5">Suggested project</dt><dd>{s.project}</dd></div>
                  <div><dt className="eyebrow mb-1.5">Suggested activity</dt><dd>{s.activity}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <p className="text-sm"><span className="eyebrow mr-2">Next action</span>{s.next}</p>
                  <button onClick={() => toggle(s.id)} className="font-mono text-[11px] uppercase tracking-wider text-primary hover:underline">
                    {isDone ? "Undo" : "Mark complete"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 max-w-2xl text-xs text-muted-foreground">Steps come from fixed rules applied to the skill scores and experience. Progress is saved on this device.</p>
    </div>
  );
}
