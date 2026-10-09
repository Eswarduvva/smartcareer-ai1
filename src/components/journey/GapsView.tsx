import { useState } from "react";
import { CheckCircle2, CircleDashed, Target } from "lucide-react";
import { EmptyState, PageHead } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecord } from "@/lib/use-record";
import { gapPriority } from "@/lib/recommend";
import { CAREER_TRACKS, SKILL_GUIDE, trackById, trackByRole } from "@/lib/careers";
import { fmt, GAP_THRESHOLD, GROUPS, SCORE_MAX, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";
import { cn } from "@/lib/utils";
import { Proficiency } from "./Proficiency";

export function GapsView() {
  const r = useRecord();
  const [career, setCareer] = useState<string | undefined>();
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("All skills");
  const track = trackById(career) ?? trackByRole(r.recommendation?.recommended_role) ?? CAREER_TRACKS[0];
  const all = scoredSkills(r.skills);
  if (!all.length) return <EmptyState title="No skill scores yet" body="Rate your skills in your profile to see your gaps." />;
  const skills = all.map((s) => ({ ...s, isKey: !!track?.skills.includes(s.key), priority: gapPriority(s.score, !!track?.skills.includes(s.key)) }));
  const strengths = skills.filter((s) => s.score >= STRONG_THRESHOLD);
  const gaps = skills.filter((s) => s.priority);
  const visible = skills.filter((s) => (category === "All" || s.group === category) && (view === "All skills" || (view === "Strengths" ? s.score >= STRONG_THRESHOLD : view === "Career skills" ? s.isKey : s.score < STRONG_THRESHOLD))).sort((a, b) => Number(b.isKey) - Number(a.isKey) || a.score - b.score);
  return <div className="animate-page-in">
    <PageHead eyebrow="Skill gap analysis" title="Build on your strengths" />
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div><p className="text-sm text-muted-foreground">Career focus</p><Select value={track?.id ?? ""} onValueChange={setCareer}><SelectTrigger className="mt-2 w-full min-w-60 max-w-full" aria-label="Career focus"><SelectValue /></SelectTrigger><SelectContent>{CAREER_TRACKS.map((t) => <SelectItem key={t.id} value={t.id}>{t.role}</SelectItem>)}</SelectContent></Select></div>
      <p className="text-xs text-muted-foreground">Skill target <span className="num text-foreground">{STRONG_THRESHOLD}/{SCORE_MAX}</span></p>
    </div>
    <div className="mb-7 grid grid-cols-3 divide-x divide-border border-y border-border py-5">
      {[{ label: "Strengths", count: strengths.length, tone: "text-strength", icon: CheckCircle2 }, { label: "To improve", count: gaps.length, tone: "text-gap", icon: CircleDashed }, { label: "Key skill gaps", count: gaps.filter((s) => s.isKey).length, tone: "text-primary", icon: Target }].map((s) => <div key={s.label} className="px-3 sm:px-5"><s.icon className={cn("mb-2 h-4 w-4", s.tone)} /><p className={cn("num text-3xl", s.tone)}>{s.count}</p><p className="mt-1 text-xs text-muted-foreground">{s.label}</p></div>)}
    </div>
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Skill categories">{["All", ...GROUPS].map((g) => <Button key={g} variant={category === g ? "secondary" : "ghost"} aria-pressed={category === g} onClick={() => setCategory(g)}>{g}</Button>)}</div>
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Skill status">{["All skills", "Career skills", "Strengths", "To improve"].map((v) => <Button key={v} size="sm" variant={view === v ? "outline" : "ghost"} aria-pressed={view === v} onClick={() => setView(v)}>{v}</Button>)}</div>
    <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">{visible.length} skills · {track?.role}</p>
    {!visible.length ? <EmptyState title="No skills in this selection" /> : <ul className="grid gap-4 md:grid-cols-2">{visible.map((s) => {
      const strong = s.score >= STRONG_THRESHOLD;
      const state = strong ? "Strong" : s.score < GAP_THRESHOLD ? "Building" : "Developing";
      return <li key={s.key} className={cn("rounded-lg border bg-card p-5", strong ? "border-strength/30" : "border-border")}>
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="eyebrow mb-2">{s.group}</p><h3 className="text-xl">{s.label}</h3></div><span className={cn("rounded-md px-2 py-1 text-xs", strong ? "bg-strength/10 text-strength" : "bg-gap/10 text-gap")}>{state}</span></div>
        <div className="mt-4 flex items-baseline justify-between gap-2 text-xs"><span className={cn("num text-xl", strong ? "text-strength" : "text-gap")}>{fmt(s.score)}<span className="text-xs text-muted-foreground"> / {SCORE_MAX}</span></span><span>{strong ? "Target met" : `${fmt(STRONG_THRESHOLD - s.score)} points to target`}</span></div>
        <Proficiency value={s.score} label={`${s.label} proficiency`} tone={strong ? "strength" : "gap"} />
        <p className="mt-4 text-xs font-medium text-primary">{s.isKey ? `Key skill for ${track?.role}` : `Supporting skill · not a key scoring skill for ${track?.role}`}{s.priority && ` · ${s.priority} priority`}</p>
        <p className="mt-2 text-sm leading-relaxed">{SKILL_GUIDE[s.key].why}</p>
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">{strong ? "Keep growing: " : "Next step: "}</span>{SKILL_GUIDE[s.key].action}</p>
      </li>;
    })}</ul>}
  </div>;
}
