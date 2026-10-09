import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { PageHead, ScoreRing } from "@/components/kit";
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

interface Task { id: string; label: string; detail?: string }
interface Stage { id: string; title: string; objective: string; skills: string[]; tasks: Task[] }

export function buildRoadmap(r: StudentRecord): Stage[] {
  const track = trackByRole(r.recommendation?.recommended_role);
  const role = track?.role ?? "your target role";
  const all = scoredSkills(r.skills).sort((a, b) => a.score - b.score);
  const weakFund = all.filter((s) => s.score < GAP_THRESHOLD && !track?.skills.includes(s.key)).slice(0, 3);
  const keyMissing = all.filter((s) => track?.skills.includes(s.key) && s.score < STRONG_THRESHOLD).slice(0, 4);
  const e = r.experience;
  const fund = weakFund.length ? weakFund : all.filter((s) => s.score < STRONG_THRESHOLD).slice(0, 2);
  const label = (k: string) => all.find((s) => s.key === k)?.label ?? k;
  return [
    {
      id: "foundations",
      title: "Foundations",
      objective: fund.length ? "Lift your weakest general skills so they stop holding you back." : "Your fundamentals are solid — keep them sharp.",
      skills: fund.map((s) => s.label),
      tasks: fund.length
        ? fund.map((s) => ({ id: `f-${s.key}`, label: `Practise ${s.label}`, detail: `${SKILL_GUIDE[s.key].action} Current ${fmt(s.score)} → ${GAP_THRESHOLD}.` }))
        : [{ id: "f-revise", label: "Revise core subjects", detail: "Spend 30 minutes a week revising." }],
    },
    {
      id: "practical",
      title: "Practical Skills",
      objective: `Bring every key skill for ${role} up to ${STRONG_THRESHOLD}.`,
      skills: keyMissing.length ? keyMissing.map((s) => s.label) : (track?.skills ?? []).map(label),
      tasks: keyMissing.length
        ? keyMissing.map((s) => ({ id: `p-${s.key}`, label: `Complete a course in ${s.label}`, detail: `${SKILL_GUIDE[s.key].action} Current ${fmt(s.score)} → ${STRONG_THRESHOLD}.` }))
        : [{ id: "p-advanced", label: "Take an advanced course in your strongest key skill", detail: "All key skills are at target." }],
    },
    {
      id: "projects",
      title: "Projects and Experience",
      objective: `Prove your skills with portfolio work and real-world exposure for ${role}.`,
      skills: (track?.skills ?? []).slice(0, 3).map(label),
      tasks: [
        { id: "x-project", label: "Build a portfolio project", detail: `${PROJECTS[track?.id ?? ""] ?? "Build an end-to-end project and publish it on GitHub."} You have ${e?.project_count ?? 0} so far.` },
        { id: "x-readme", label: "Document it with a README and short demo video" },
        (e?.internship_count ?? 0) === 0
          ? { id: "x-intern", label: "Apply to five internships", detail: "No internships recorded yet." }
          : { id: "x-stretch", label: "Take on a stretch task in your internship", detail: `${e?.internship_count} internship(s) so far.` },
        { id: "x-oss", label: "Contribute one fix to an open-source project" },
      ],
    },
    {
      id: "career",
      title: "Career Preparation",
      objective: `Prepare to apply for ${role} roles with confidence.`,
      skills: ["Aptitude", "Problem Solving", "Communication"],
      tasks: [
        { id: "c-resume", label: "Polish resume, LinkedIn and portfolio", detail: "Lead with your best two projects." },
        { id: "c-mock", label: "Do two mock interviews", detail: "Plus one timed aptitude test each week." },
        { id: "c-list", label: "Shortlist ten companies", detail: "Note what each one asks for." },
      ],
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
  const allTasks = stages.flatMap((s) => s.tasks.map((t) => t.id));
  const doneCount = allTasks.filter((t) => done.includes(t)).length;
  const pct = Math.round((doneCount / allTasks.length) * 100);
  const stageDone = (s: Stage) => s.tasks.every((t) => done.includes(t.id));
  const nextStage = stages.find((s) => !stageDone(s));
  const [open, setOpen] = useState<string | null>(null);
  const [burst, setBurst] = useState<string | null>(null);
  const current = open ?? nextStage?.id ?? stages[0]!.id;

  const onToggle = (s: Stage, t: Task) => {
    const wasDone = done.includes(t.id);
    toggle(t.id);
    if (!wasDone && s.tasks.every((x) => x.id === t.id || done.includes(x.id))) {
      setBurst(s.id);
      window.setTimeout(() => setBurst(null), 1400);
      toast.success(`Milestone complete: ${s.title}`, { description: "Nice work — your progress is saved on this device." });
    }
  };

  return (
    <div>
      <PageHead eyebrow="Career roadmap · rule-based" title={dest ? `Your path to ${dest}` : "Your career roadmap"}>
        <div className="flex items-center gap-4">
          <ScoreRing value={pct} size={84} label="done" />
          <p className="text-xs text-muted-foreground"><span className="num text-foreground">{doneCount}</span> of {allTasks.length} tasks</p>
        </div>
      </PageHead>

      <ol className="relative max-w-4xl">
        <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-px bg-border sm:left-[27px]" />
        <span aria-hidden className="absolute left-[21px] top-6 w-px bg-gradient-to-b from-gold to-strength shadow-[0_0_12px_var(--color-gold)] transition-[height] duration-1000 sm:left-[27px]" style={{ height: `calc((100% - 3rem) * ${pct / 100})` }} />
        {stages.map((s, i) => {
          const isDone = stageDone(s);
          const isNext = nextStage?.id === s.id;
          const isOpen = current === s.id;
          const n = s.tasks.filter((t) => done.includes(t.id)).length;
          return (
            <li key={s.id} className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 sm:grid-cols-[56px_minmax(0,1fr)] sm:gap-6">
              <span
                className={cn(
                  "num relative z-10 flex h-11 w-11 items-center justify-center rounded-full border text-sm transition-all duration-500 sm:h-14 sm:w-14",
                  isDone ? "border-strength bg-strength text-background shadow-[0_0_24px_-4px_var(--color-strength)]" : isNext ? "border-gold bg-background text-gold shadow-[0_0_24px_-6px_var(--color-gold)]" : "border-border bg-background text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-5 w-5" /> : String(i + 1).padStart(2, "0")}
                {burst === s.id && <Burst />}
              </span>
              <div className={cn("glass mb-6 overflow-hidden rounded-2xl transition-all", isOpen && "border-gold/40")}>
                <button onClick={() => setOpen(isOpen ? "__none" : s.id)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left">
                  <span className="min-w-0">
                    <span className="block font-display text-xl">Stage {i + 1} — {s.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{s.objective}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={cn("font-mono text-[10px] uppercase tracking-wider", isDone ? "text-strength" : isNext ? "text-gold" : "text-muted-foreground")}>
                      {isDone ? "Completed" : isNext ? "Up next" : "Not started"} · {n}/{s.tasks.length}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-border p-5">
                      {s.skills.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1.5">{s.skills.map((k) => <span key={k} className="rounded-full border border-border px-2.5 py-0.5 text-xs">{k}</span>)}</div>
                      )}
                      <ul className="space-y-2">
                        {s.tasks.map((t) => {
                          const ok = done.includes(t.id);
                          return (
                            <li key={t.id}>
                              <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:border-border hover:bg-muted/40", ok && "opacity-70")}>
                                <input type="checkbox" checked={ok} onChange={() => onToggle(s, t)} className="peer sr-only" />
                                <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-ring", ok ? "scale-110 border-strength bg-strength text-background" : "border-muted-foreground/50")}>
                                  {ok && <Check className="h-3.5 w-3.5" />}
                                </span>
                                <span className="min-w-0">
                                  <span className={cn("block text-sm", ok && "line-through decoration-strength/60")}>{t.label}</span>
                                  {t.detail && <span className="block text-xs text-muted-foreground">{t.detail}</span>}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 max-w-2xl text-xs text-muted-foreground">Stages come from fixed rules applied to the skill scores and experience. Progress is saved on this device.</p>
    </div>
  );
}

function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="sc-spark absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold" style={{ ["--a" as string]: `${i * 36}deg` }} />
      ))}
      <span className="sc-ring absolute inset-0 rounded-full border-2 border-strength" />
    </span>
  );
}
