import { useState } from "react";
import { EmptyState, Meter, PageHead, ScoreRing } from "@/components/kit";
import { useRecommendationSource, useRecord } from "@/lib/use-record";
import { rankTracks } from "@/lib/recommend";
import { fmt, skillLabel, STRONG_THRESHOLD } from "@/lib/skills";
import { cn } from "@/lib/utils";

export function MatchView() {
  const r = useRecord();
  const source = useRecommendationSource();
  const [open, setOpen] = useState<string | null>(null);
  if (!r.skills) return <EmptyState title="No skill scores yet" body="Complete your profile to compare career tracks." />;
  const ranked = rankTracks(r.skills, r.preferences?.primary_interest);
  const rec = r.recommendation;
  const current = open ?? ranked[0]!.track.id;

  return (
    <div>
      <PageHead eyebrow="Career match · rule-based recommendation" title={rec?.recommended_role ? `Best fit: ${rec.recommended_role}` : "Career tracks"}>
        <p className="max-w-xs text-xs text-muted-foreground">
          Each career lists five key skills with a target of {STRONG_THRESHOLD}. Match = how close you are to those targets. Transparent rules, not AI.
          {source === "database" && " The headline recommendation is read from this student's record."}
        </p>
      </PageHead>

      <section className="glass gradient-border animate-page-in relative mb-8 overflow-hidden rounded-3xl p-6 md:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-8">
          <ScoreRing value={ranked[0]!.match} size={150} label="match" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-gold">Strongest match · {ranked[0]!.track.domain}</p>
            <p className="mt-2 font-display text-3xl md:text-4xl">{ranked[0]!.track.role}</p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{ranked[0]!.track.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ranked[0]!.track.skills.map((k) => {
                const ok = (r.skills?.[k] ?? 0) >= STRONG_THRESHOLD;
                return (
                  <span key={k} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs", ok ? "border-strength/60 text-strength" : "border-dashed border-gap/60 text-gap")}>
                    <span aria-hidden>{ok ? "✓" : "○"}</span>{skillLabel(k)}<span className="sr-only">{ok ? " (met)" : " (missing)"}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <ul className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ranked.slice(1).map((t) => (
          <li key={t.track.id}>
            <button onClick={() => setOpen(t.track.id)} className="glass lift flex w-full items-center gap-4 rounded-2xl p-4 text-left">
              <ScoreRing value={t.match} size={64} tone="primary" />
              <span className="min-w-0"><span className="block truncate font-medium">{t.track.role}</span><span className="block text-xs text-muted-foreground">{t.met.length}/{t.track.skills.length} key skills met</span></span>
            </button>
          </li>
        ))}
      </ul>

      <ol className="glass overflow-hidden rounded-2xl">
        {ranked.map((t, i) => {
          const isOpen = current === t.track.id;
          return (
            <li key={t.track.id} className={cn("border-b border-border transition-colors last:border-b-0 hover:bg-muted/30", isOpen && "bg-accent/20")}>
              <button
                onClick={() => setOpen(isOpen ? "__none" : t.track.id)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-4 px-2 py-5 text-left sm:grid-cols-[40px_minmax(0,1fr)_200px_auto] sm:px-4"
              >
                <span className="num text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-medium">{t.track.role}</span>
                  <span className="block truncate font-mono text-[11px] text-muted-foreground">{t.track.domain}{i === 0 && " · best match"}</span>
                </span>
                <span className="hidden sm:block"><Meter value={t.match} max={100} tone={i === 0 ? "primary" : "strength"} /></span>
                <span className={cn("num text-2xl sm:text-3xl", i === 0 ? "text-primary" : "")}>{fmt(t.match, 0)}<span className="text-sm text-muted-foreground">%</span></span>
              </button>
              {isOpen && (
                <div className="animate-page-in grid gap-8 px-2 pb-8 sm:px-4 md:grid-cols-3 md:pl-[72px]">
                  <div>
                    <p className="eyebrow mb-2">About this career</p>
                    <p className="text-sm">{t.track.description}</p>
                    <p className="eyebrow mb-2 mt-5">Day to day</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">{t.track.dayToDay.map((d) => <li key={d}>— {d}</li>)}</ul>
                    <p className="eyebrow mb-2 mt-5">Career outlook</p>
                    <p className="text-sm text-muted-foreground">{t.track.outlook}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-3">Required skills · your level</p>
                    <ul className="space-y-3">
                      {t.track.skills.map((k) => {
                        const v = r.skills?.[k] ?? 0;
                        const ok = v >= STRONG_THRESHOLD;
                        return (
                          <li key={k}>
                            <div className="mb-1 flex justify-between text-sm"><span>{skillLabel(k)}</span><span className={cn("num", ok ? "text-strength" : "text-gap")}>{fmt(v)} / {STRONG_THRESHOLD}</span></div>
                            <Meter value={v} tone={ok ? "strength" : "gap"} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Why this career matches you</p>
                    <p className="text-sm text-muted-foreground">
                      {t.met.length
                        ? <>You already meet the target in <span className="text-foreground">{t.met.map(skillLabel).join(", ")}</span>.</>
                        : "None of the key skills reach the target yet, so this track needs the most groundwork."}
                    </p>
                    <p className="eyebrow mb-2 mt-5">Missing skills</p>
                    {t.missing.length ? (
                      <div className="flex flex-wrap gap-2">
                        {t.missing.map((k) => <span key={k} className="border border-dashed border-gap/60 px-2 py-0.5 text-xs">{skillLabel(k)} <span className="num text-gap">+{fmt(STRONG_THRESHOLD - (r.skills?.[k] ?? 0))}</span></span>)}
                      </div>
                    ) : <p className="text-sm text-strength">All key skills at target.</p>}
                    <p className="mt-5 font-mono text-[11px] text-muted-foreground">Average points still missing: <span className="num text-gap">{fmt(t.gap)}</span></p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Tap a career to view its details.</p>
    </div>
  );
}
