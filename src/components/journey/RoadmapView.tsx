import { loadAccount, saveAccount } from "@/lib/account";
import { MY_ID } from "@/lib/my-profile";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Flag, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { PageHead, ScoreRing } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Proficiency } from "./Proficiency";
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
  const [state, setState] = useState<{ key: string; done: string[]; available: boolean }>();
  useEffect(() => {
    const read = () => {
      try {
        const raw: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        const done = Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : [];
        setState({ key, done, available: true });
      } catch { setState({ key, done: [], available: false }); }
    };
    read();
    if (id === MY_ID) loadAccount().then((acc) => {
      if (acc && Array.isArray(acc.roadmap_done)) {
        try { localStorage.setItem(key, JSON.stringify(acc.roadmap_done)); } catch { /* cache only */ }
        setState({ key, done: acc.roadmap_done, available: true });
      }
    });
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) read(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const ready = state?.key === key;
  const done = ready ? state.done : [];
  const toggle = (task: string) => {
    if (!ready) return false;
    const next = done.includes(task) ? done.filter((v) => v !== task) : [...done, task];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setState({ key, done: next, available: true });
      if (id === MY_ID) void saveAccount({ roadmap_done: next });
      return true;
    } catch {
      setState({ key, done: next, available: false });
      toast.error("Progress could not be saved", { description: "Device storage is unavailable. This change lasts only while the page stays open." });
      return false;
    }
  };
  return { done, toggle, ready, available: state?.available ?? true };
}

export function RoadmapView() {
  const r = useRecord();
  const stages = buildRoadmap(r);
  const { done, toggle, ready, available } = useDone(r.student.student_id);
  const dest = r.recommendation?.recommended_role;
  const allTasks = stages.flatMap((s) => s.tasks.map((t) => t.id));
  const doneCount = allTasks.filter((t) => done.includes(t)).length;
  const pct = allTasks.length ? Math.round(doneCount / allTasks.length * 100) : 0;
  const stageDone = (s: Stage) => s.tasks.every((t) => done.includes(t.id));
  const nextStage = stages.find((s) => !stageDone(s));
  const [open, setOpen] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [burst, setBurst] = useState<string | null>(null);
  const current = open ?? nextStage?.id ?? stages[0]?.id;
  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(null), 1400);
    return () => window.clearTimeout(timer);
  }, [burst]);
  const onToggle = (s: Stage, t: Task) => {
    const wasDone = done.includes(t.id);
    const saved = toggle(t.id);
    if (!wasDone && s.tasks.every((x) => x.id === t.id || done.includes(x.id))) {
      setBurst(s.id);
      toast.success(`Milestone complete: ${s.title}`, { description: saved ? "Your progress is saved on this device." : "Keep this page open; device saving is unavailable." });
    }
  };
  return (
    <div className="animate-page-in">
      <PageHead eyebrow="Personalized roadmap · rule-based" title={dest ? `Your path to ${dest}` : "Your career roadmap"}>
        <div className="flex items-center gap-4"><ScoreRing value={pct} size={84} label="done" /><p className="text-sm text-muted-foreground" role="status">{doneCount} of {allTasks.length} tasks complete · {pct}%</p></div>
      </PageHead>
      <div className="mb-8 flex items-start gap-3 border-y border-border py-4 text-xs text-muted-foreground"><HardDrive className="h-4 w-4 shrink-0 text-primary" /><p>{available ? "Progress is saved on this device only, not to your account. It will not sync across devices and is removed if you clear browser storage." : "Device saving is unavailable. Progress will be lost when you leave or reload this page."}</p></div>
      <ol className="relative max-w-4xl">
        {stages.map((s, i) => {
          const isDone = stageDone(s);
          const isNext = nextStage?.id === s.id;
          const isOpen = current === s.id;
          const n = s.tasks.filter((t) => done.includes(t.id)).length;
          const stagePct = Math.round(n / s.tasks.length * 100);
          return <li key={s.id} className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-3 pb-8 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-6">
            {i < stages.length - 1 && <span aria-hidden className={cn("absolute bottom-0 left-[17px] top-10 w-px sm:left-[23px] sm:top-12", isDone ? "bg-strength" : "bg-border")} />}
            <span className={cn("num relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs sm:h-12 sm:w-12", isDone ? "border-strength bg-strength text-background" : isNext ? "border-primary bg-background text-primary" : "border-border bg-background text-muted-foreground")}>
              {isDone ? <Check className="h-4 w-4" aria-label="Stage complete" /> : String(i + 1).padStart(2, "0")}{burst === s.id && <Burst />}
            </span>
            <section className="min-w-0 border-b border-border pb-5">
              <Button variant="ghost" onClick={() => setOpen(isOpen ? "__none" : s.id)} aria-expanded={isOpen} aria-controls={`stage-${s.id}`} className="h-auto w-full items-start justify-between whitespace-normal p-0 text-left hover:bg-transparent">
                <span className="min-w-0"><span className="eyebrow mb-2 block">Stage {i + 1} · {isDone ? "Completed" : isNext ? "Up next" : n ? "In progress" : "Not started"}</span><span className="block font-display text-xl sm:text-2xl">{s.title}</span></span><ChevronDown className={cn("mt-5 transition-transform", isOpen && "rotate-180")} />
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">{s.objective}</p>
              <div className="mt-4 flex items-center gap-3"><div className="min-w-0 flex-1"><Proficiency target={false} value={stagePct} label={`${s.title} completion`} /></div><span className="num w-10 text-right text-xs">{stagePct}%</span></div>
              {isOpen && <div id={`stage-${s.id}`} className="animate-page-in pt-4">
                {!!s.skills.length && <div className="mb-4 flex flex-wrap gap-2">{s.skills.map((k) => <span key={k} className="rounded-md border border-border px-2 py-1 text-xs">{k}</span>)}</div>}
                <ul className="divide-y divide-border">{s.tasks.map((t) => {
                  const ok = done.includes(t.id);
                  const expanded = expandedTasks.includes(t.id);
                  return <li key={t.id} className="py-3">
                    <div className="flex items-start gap-3">
                      <Checkbox id={`task-${t.id}`} checked={ok} disabled={!ready} onCheckedChange={() => onToggle(s, t)} aria-label={`Complete: ${t.label}`} className="mt-1 h-5 w-5 data-[state=checked]:border-strength data-[state=checked]:bg-strength" />
                      <label htmlFor={`task-${t.id}`} className={cn("min-w-0 flex-1 cursor-pointer py-1 text-sm", ok && "text-muted-foreground line-through decoration-strength")}>{t.label}</label>
                      <Button size="icon" variant="ghost" title={`Learning details: ${t.label}`} aria-label={`Learning details: ${t.label}`} aria-expanded={expanded} aria-controls={`detail-${t.id}`} onClick={() => setExpandedTasks((cur) => expanded ? cur.filter((id) => id !== t.id) : [...cur, t.id])}><ChevronDown className={cn("transition-transform", expanded && "rotate-180")} /></Button>
                    </div>
                    {expanded && <p id={`detail-${t.id}`} className="animate-page-in ml-8 mt-2 text-xs leading-relaxed text-muted-foreground">{t.detail ?? (t.id === "x-readme" ? "Describe the problem, setup steps and results. Include a short demonstration of your finished work." : t.id === "x-oss" ? "Choose a beginner-friendly issue, submit a focused contribution and respond to the maintainer’s feedback." : "Complete the task and keep a short record of your work.")}</p>}
                  </li>;
                })}</ul>
                <div className={cn("mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs", isDone ? "text-strength" : "text-muted-foreground")}><Flag className="h-4 w-4 shrink-0" /><span>Milestone: {s.title} {isDone ? "complete" : `· ${n}/${s.tasks.length} tasks complete`}</span></div>
              </div>}
            </section>
          </li>;
        })}
      </ol>
    </div>
  );
}

function Burst() {
  return <span aria-hidden className="pointer-events-none absolute inset-0"><span className="sc-ring absolute inset-0 rounded-full border-2 border-strength" /></span>;
}
