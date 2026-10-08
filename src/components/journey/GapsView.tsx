import { EmptyState, PageHead } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { gapPriority, type GapPriority } from "@/lib/recommend";
import { SKILL_GUIDE, trackByRole } from "@/lib/careers";
import { fmt, GAP_THRESHOLD, SCORE_MAX, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";

const LEVELS: { id: GapPriority; tone: string; bar: string; rule: string }[] = [
  { id: "High", tone: "text-gap", bar: "bg-gap", rule: `Key skill for your career, below ${GAP_THRESHOLD}` },
  { id: "Medium", tone: "text-primary", bar: "bg-primary", rule: `Key skill ${GAP_THRESHOLD}–${STRONG_THRESHOLD - 1}, or other skill below ${GAP_THRESHOLD}` },
  { id: "Low", tone: "text-muted-foreground", bar: "bg-muted-foreground", rule: `Other skill ${GAP_THRESHOLD}–${STRONG_THRESHOLD - 1}` },
];

export function GapsView() {
  const r = useRecord();
  const track = trackByRole(r.recommendation?.recommended_role);
  const all = scoredSkills(r.skills);
  if (!all.length) return <EmptyState title="No skill scores yet" body="Rate your skills in your profile to see your gaps." />;
  const gaps = all
    .map((s) => ({ ...s, isKey: !!track?.skills.includes(s.key), priority: gapPriority(s.score, !!track?.skills.includes(s.key)) }))
    .filter((s): s is typeof s & { priority: GapPriority } => s.priority !== null)
    .sort((a, b) => a.score - b.score);
  const high = gaps.filter((g) => g.priority === "High");

  return (
    <div>
      <PageHead eyebrow="Skill gap analysis" title={gaps.length ? `${gaps.length} skill${gaps.length === 1 ? "" : "s"} below target` : "No skill gaps"}>
        <p className="max-w-xs text-xs text-muted-foreground">
          Target is {STRONG_THRESHOLD}/{SCORE_MAX} for every skill. Priority depends on whether the skill is key for {track?.role ?? "your recommended career"}.
        </p>
      </PageHead>

      <div className="mb-10 grid grid-cols-3 border-y border-border">
        {LEVELS.map((l) => (
          <div key={l.id} className="border-r border-border px-3 py-5 last:border-r-0 sm:px-5">
            <p className={`eyebrow ${l.tone}`}>{l.id} priority</p>
            <p className={`num mt-2 text-4xl sm:text-5xl ${l.tone}`}>{gaps.filter((g) => g.priority === l.id).length}</p>
            <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">{l.rule}</p>
          </div>
        ))}
      </div>

      {!gaps.length ? (
        <EmptyState title="Every skill is at target" body="Nothing to close — focus on projects and experience in your roadmap." />
      ) : (
        <>
          <section className="mb-12">
            <p className="eyebrow mb-4">Current vs target</p>
            <ul className="space-y-2">
              {gaps.map((g) => {
                const pct = (g.score / SCORE_MAX) * 100;
                const tpct = (STRONG_THRESHOLD / SCORE_MAX) * 100;
                const lvl = LEVELS.find((l) => l.id === g.priority)!;
                return (
                  <li key={g.key} className="grid grid-cols-[110px_minmax(0,1fr)_56px] items-center gap-3 text-sm sm:grid-cols-[160px_minmax(0,1fr)_80px]">
                    <span className="truncate">{g.label}</span>
                    <div className="relative h-2.5 bg-muted">
                      <div className={`absolute inset-y-0 left-0 ${lvl.bar} transition-[width] duration-700`} style={{ width: `${pct}%` }} />
                      <div className="absolute inset-y-0 border border-dashed border-foreground/30" style={{ left: `${pct}%`, width: `${tpct - pct}%` }} />
                      <div className="absolute -inset-y-1 w-px bg-foreground" style={{ left: `${tpct}%` }} />
                    </div>
                    <span className={`num text-right text-xs ${lvl.tone}`}>−{fmt(STRONG_THRESHOLD - g.score)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">Bar = current score · dashed = distance to target · line = target {STRONG_THRESHOLD}.</p>
          </section>

          {LEVELS.map((l) => {
            const xs = gaps.filter((g) => g.priority === l.id);
            if (!xs.length) return null;
            return (
              <section key={l.id} className="mb-10">
                <h2 className={`mb-3 border-b border-border pb-2 font-mono text-xs uppercase tracking-wider ${l.tone}`}>{l.id} priority · {xs.length}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {xs.map((g) => (
                    <article key={g.key} className="border border-border bg-card p-5">
                      <header className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-medium">{g.label}</h3>
                        {g.isKey && <span className="font-mono text-[10px] uppercase tracking-wider text-primary">Key for {track?.role}</span>}
                      </header>
                      <dl className="mt-3 grid grid-cols-3 gap-3 border-y border-border py-3 text-center">
                        <div><dt className="eyebrow">Current</dt><dd className={`num mt-1 text-xl ${l.tone}`}>{fmt(g.score)}</dd></div>
                        <div><dt className="eyebrow">Target</dt><dd className="num mt-1 text-xl">{STRONG_THRESHOLD}</dd></div>
                        <div><dt className="eyebrow">Gap</dt><dd className="num mt-1 text-xl">{fmt(((STRONG_THRESHOLD - g.score) / STRONG_THRESHOLD) * 100, 0)}%</dd></div>
                      </dl>
                      <p className="mt-3 text-sm"><span className="eyebrow mr-2">Why it matters</span>{SKILL_GUIDE[g.key].why}</p>
                      <p className="mt-2 text-sm text-muted-foreground"><span className="eyebrow mr-2 text-foreground">Action</span>{SKILL_GUIDE[g.key].action}</p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
          {high[0] && <p className="text-sm">Start with <span className="font-medium">{high[0].label}</span> — it is your largest gap in a key skill.</p>}
        </>
      )}
    </div>
  );
}
