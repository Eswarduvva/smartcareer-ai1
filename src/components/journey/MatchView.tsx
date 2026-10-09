import { useState } from "react";
import { ArrowRightLeft, Check, ChevronDown, GraduationCap } from "lucide-react";
import { EmptyState, PageHead, ScoreRing } from "@/components/kit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRecommendationSource, useRecord } from "@/lib/use-record";
import { rankTracks, type RankedTrack } from "@/lib/recommend";
import { fmt, skillLabel, STRONG_THRESHOLD } from "@/lib/skills";
import { cn } from "@/lib/utils";
import { Proficiency } from "./Proficiency";

export function MatchView() {
  const r = useRecord();
  const source = useRecommendationSource();
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  if (!r.skills) return <EmptyState title="No skill scores yet" body="Complete your profile to compare career tracks." />;
  const ranked = rankTracks(r.skills, r.preferences?.primary_interest);
  const best = ranked[0];
  if (!best) return <EmptyState title="No career tracks available" />;
  const stored = r.recommendation;
  const recommended = ranked.find((t) => t.track.role === stored?.recommended_role) ?? best;
  const score = source === "database" ? stored?.career_match_score : recommended.match;
  const compare = ranked.filter((t) => selected.includes(t.track.id));
  const toggle = (id: string) => setSelected((cur) => cur.includes(id) ? cur.filter((k) => k !== id) : cur.length < 3 ? [...cur, id] : cur);
  const skills = (keys: RankedTrack["met"], matched: boolean) => keys.length ? <div className="flex flex-wrap gap-1.5">{keys.map((k) => <span key={k} className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs", matched ? "border-strength/40 bg-strength/10 text-strength" : "border-gap/40 bg-gap/10 text-gap")}>{matched && <Check className="h-3 w-3" />}{skillLabel(k)}</span>)}</div> : <p className="text-sm text-muted-foreground">{matched ? "No key skills at target yet." : "All key skills at target."}</p>;
  return (
    <div className="animate-page-in">
      <PageHead eyebrow="Rule-based career recommendation" title="Find your career fit" />
      <section className="mb-8 flex flex-wrap items-center gap-6 border-y border-border py-6">
        {typeof score === "number" && <ScoreRing value={score} size={112} label="match" />}
        <div className="min-w-0 flex-1 basis-56">
          <p className="eyebrow text-primary">{source === "database" ? "Recorded recommendation" : "Strongest match"}</p>
          <h2 className="mt-2 text-2xl md:text-3xl">{stored?.recommended_role ?? recommended.track.role}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{recommended.track.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">{source === "database" ? "Recorded score shown unchanged. Career comparisons below use your recorded skills and the existing rule-based calculation." : `Based on your skill scores. Each key skill has a target of ${STRONG_THRESHOLD}.`}</p>
        </div>
      </section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">{comparing ? "Career comparison" : "Recommended careers"}</h2>
        <Button variant={comparing ? "secondary" : "outline"} disabled={!comparing && selected.length < 2} onClick={() => setComparing(!comparing)}><ArrowRightLeft />{comparing ? "Back to careers" : `Compare (${selected.length}/3)`}</Button>
      </div>
      {comparing ? <section aria-label="Career comparison" className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[600px] table-fixed text-left text-sm">
          <caption className="sr-only">Side-by-side career comparison based on your recorded skills</caption>
          <thead><tr className="bg-muted/50"><th className="w-36 p-4">Your fit</th>{compare.map((t) => <th key={t.track.id} className="p-4 align-top font-medium">{t.track.role}</th>)}</tr></thead>
          <tbody>
            <tr className="border-t border-border"><th scope="row" className="p-4 font-medium">Skill match</th>{compare.map((t) => <td key={t.track.id} className="p-4"><span className="num text-xl text-primary">{fmt(t.match)}%</span></td>)}</tr>
            <tr className="border-t border-border"><th scope="row" className="p-4 font-medium">Description</th>{compare.map((t) => <td key={t.track.id} className="p-4 align-top">{t.track.description}</td>)}</tr>
            <tr className="border-t border-border"><th scope="row" className="p-4 font-medium">Matched skills</th>{compare.map((t) => <td key={t.track.id} className="p-4 align-top">{skills(t.met, true)}</td>)}</tr>
            <tr className="border-t border-border"><th scope="row" className="p-4 font-medium">Below target</th>{compare.map((t) => <td key={t.track.id} className="p-4 align-top">{skills(t.missing, false)}</td>)}</tr>
            <tr className="border-t border-border"><th scope="row" className="p-4 font-medium">Education pathways</th>{compare.map((t) => <td key={t.track.id} className="p-4 align-top text-muted-foreground">{t.track.education}</td>)}</tr>
          </tbody>
        </table>
      </section> : <ul className="grid items-start gap-5 lg:grid-cols-2">
        {ranked.map((t, i) => {
          const expanded = open.includes(t.track.id);
          return <li key={t.track.id} className={cn("glass lift rounded-lg p-5", i === 0 && "border-primary/40")}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="eyebrow mb-2">{i === 0 ? "Top skill match" : t.track.domain}</p><h3 className="text-xl">{t.track.role}</h3></div>
              <ScoreRing value={t.match} size={76} tone={i === 0 ? "gold" : "primary"} />
            </div>
            <p className="mb-5 text-sm text-muted-foreground">{t.track.description}</p>
            <div className="space-y-4"><div><p className="mb-2 text-xs font-medium text-strength">Matched skills · {t.met.length}/{t.track.skills.length}</p>{skills(t.met, true)}</div><div><p className="mb-2 text-xs font-medium text-gap">Below target · {t.missing.length}</p>{skills(t.missing, false)}</div></div>
            <div className="mt-5 border-t border-border pt-4"><p className="mb-2 flex items-center gap-2 text-sm font-medium"><GraduationCap className="h-4 w-4 text-primary" />Education pathways</p><p className="text-xs leading-relaxed text-muted-foreground">{t.track.education}</p><p className="mt-2 text-xs text-muted-foreground">Your education: {[r.student.degree, r.student.branch].filter(Boolean).join(" · ") || "Not recorded"}. Eligibility varies by employer.</p></div>
            <Button variant="ghost" className="mt-4 h-auto w-full justify-between whitespace-normal px-0 py-3 text-left" aria-expanded={expanded} aria-controls={`why-${t.track.id}`} onClick={() => setOpen((cur) => expanded ? cur.filter((id) => id !== t.track.id) : [...cur, t.track.id])}>Why this career matches you<ChevronDown className={cn("transition-transform", expanded && "rotate-180")} /></Button>
            {expanded && <div id={`why-${t.track.id}`} className="animate-page-in border-t border-border pt-4 text-sm">
              <p className="mb-4 text-muted-foreground">{t.met.length ? `You meet ${t.met.length} of ${t.track.skills.length} key skill targets. ${t.missing.length ? `Focus on ${t.missing.map(skillLabel).join(", ")} next.` : "Every key skill meets the target."}` : "Your key skills are below target. This is a potential direction, not a claim of job readiness."}</p>
              {t.track.skills.map((k) => { const value = r.skills?.[k]; return <div key={k} className="mb-4"><div className="flex justify-between gap-2 text-xs"><span>{skillLabel(k)}</span><span className="num">{fmt(value)} / {STRONG_THRESHOLD}</span></div>{typeof value === "number" ? <Proficiency label={skillLabel(k)} value={value} tone={value >= STRONG_THRESHOLD ? "strength" : "gap"} /> : <p className="text-xs text-muted-foreground">Not recorded; scoring treats missing values as zero.</p>}</div>; })}
              <p className="text-xs text-muted-foreground">Match: mean of each key skill’s score ÷ {STRONG_THRESHOLD}, capped at 100% per skill. Education does not change this score.</p>
              <p className="mt-3 text-xs text-muted-foreground">Day to day: {t.track.dayToDay.join(" · ")}</p>
            </div>}
            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 border-t border-border pt-3 text-sm"><Checkbox aria-label={`Compare ${t.track.role}`} checked={selected.includes(t.track.id)} disabled={!selected.includes(t.track.id) && selected.length >= 3} onCheckedChange={() => toggle(t.track.id)} />Compare {t.track.role}</label>
          </li>;
        })}
      </ul>}
      <p className="mt-5 text-xs text-muted-foreground">Education pathways are general guidance, not verified vacancy requirements.</p>
    </div>
  );
}
