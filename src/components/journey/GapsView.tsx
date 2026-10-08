import { EmptyState, PageHead } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, SCORE_MAX, scoredSkills, STRONG_THRESHOLD } from "@/lib/skills";


const BANDS = [
  { id: "gap", label: "Priority gap", rule: `< ${GAP_THRESHOLD}`, tone: "text-gap", bar: "bg-gap" },
  { id: "dev", label: "Developing", rule: `${GAP_THRESHOLD}–${STRONG_THRESHOLD - 1}`, tone: "text-primary", bar: "bg-primary" },
  { id: "strong", label: "Strong", rule: `≥ ${STRONG_THRESHOLD}`, tone: "text-strength", bar: "bg-strength" },
] as const;

export function GapsView() {
  const r = useRecord();
  const all = scoredSkills(r.skills).sort((a, b) => a.score - b.score);
  const band = (s: number) => (s < GAP_THRESHOLD ? "gap" : s < STRONG_THRESHOLD ? "dev" : "strong");
  const gaps = all.filter((s) => s.score < GAP_THRESHOLD);
  const totalDistance = gaps.reduce((a, s) => a + (GAP_THRESHOLD - s.score), 0);

  return (
    <div>
      <PageHead eyebrow="Skill gaps" title={`${gaps.length} priority gap${gaps.length === 1 ? "" : "s"}`}>
        <p className="max-w-xs text-xs text-muted-foreground">
          Bands use application rules (gap &lt; {GAP_THRESHOLD}, strong ≥ {STRONG_THRESHOLD}, out of {SCORE_MAX}). Recorded gap score: <span className="num text-foreground">{fmt(r.recommendation?.skill_gap_score)}</span>.
        </p>
      </PageHead>
      {!all.length ? (
        <EmptyState title="No skill scores on record" />
      ) : (
        <>
          <div className="mb-10 grid grid-cols-3 border-y border-border">
            {BANDS.map((b) => {
              const n = all.filter((s) => band(s.score) === b.id).length;
              return (
                <div key={b.id} className="border-r border-border px-5 py-5 last:border-r-0">
                  <p className={`eyebrow ${b.tone}`}>{b.label}</p>
                  <p className={`num mt-2 text-5xl ${b.tone}`}>{n}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{b.rule}</p>
                </div>
              );
            })}
          </div>
          <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="mb-3 grid grid-cols-[150px_1fr_120px] gap-4 eyebrow">
                <span>Skill</span><span>Current → target</span><span className="text-right">Next improvement</span>
              </div>
              {BANDS.map((b) => {
                const xs = all.filter((s) => band(s.score) === b.id);
                if (!xs.length) return null;
                return (
                  <section key={b.id} className="mb-8">
                    <p className={`mb-2 border-b border-border pb-1 font-mono text-[11px] uppercase tracking-wider ${b.tone}`}>{b.label}</p>
                    <ul className="space-y-2.5">
                      {xs.map((s) => {
                        const pct = (s.score / SCORE_MAX) * 100;
                        const target = b.id === "gap" ? GAP_THRESHOLD : b.id === "dev" ? STRONG_THRESHOLD : null;
                        const tpct = target ? (target / SCORE_MAX) * 100 : null;
                        return (
                          <li key={s.key} className="group grid grid-cols-[150px_1fr_120px] items-center gap-4 text-sm">
                            <span>{s.label}</span>
                            <div className="relative h-2 bg-muted">
                              <div className={`absolute inset-y-0 left-0 ${b.bar} transition-[width] duration-700`} style={{ width: `${pct}%` }} />
                              {tpct != null && <div className="absolute inset-y-0 border border-dashed border-current opacity-50" style={{ left: `${pct}%`, width: `${tpct - pct}%` }} />}
                              {tpct != null && <div className="absolute -inset-y-1.5 w-px bg-foreground" style={{ left: `${tpct}%` }} />}
                            </div>
                            <span className="num text-right text-xs">
                              {target ? <><span className={b.tone}>+{fmt(target - s.score)}</span><span className="text-muted-foreground"> → {target}</span></> : <span className="text-muted-foreground">{fmt(s.score)} · hold</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
            <aside className="lg:border-l lg:border-border lg:pl-8">
              <p className="eyebrow">Points to close all gaps</p>
              <p className="num mt-2 text-7xl text-gap">{fmt(totalDistance, 0)}</p>
              <p className="mt-3 text-sm text-muted-foreground">Sum of the points each priority gap needs to reach {GAP_THRESHOLD}.</p>
              {gaps[0] && (
                <div className="mt-8 border-t border-border pt-4">
                  <p className="eyebrow">Start with</p>
                  <p className="mt-1 text-lg">{gaps[0].label} <span className="num text-gap">{fmt(gaps[0].score)}</span></p>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
