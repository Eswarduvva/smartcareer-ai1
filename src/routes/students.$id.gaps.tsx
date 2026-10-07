import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHead, Tile } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, SCORE_MAX, scoredSkills } from "@/lib/skills";

export const Route = createFileRoute("/students/$id/gaps")({
  head: ({ params }) => ({
    meta: [
      { title: `Skill gaps ${params.id} — SmartCareer AI` },
      { name: "description", content: "Skills below the gap threshold, ranked by distance to close." },
      { property: "og:title", content: `Skill gaps ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "Skills below the gap threshold, ranked." },
    ],
  }),
  component: Gaps,
});

function Gaps() {
  const r = useRecord();
  const all = scoredSkills(r.skills).sort((a, b) => a.score - b.score);
  const gaps = all.filter((s) => s.score < GAP_THRESHOLD);
  const totalDistance = gaps.reduce((a, s) => a + (GAP_THRESHOLD - s.score), 0);

  return (
    <div>
      <PageHead eyebrow="Skill gaps" title={`${gaps.length} skill${gaps.length === 1 ? "" : "s"} below ${GAP_THRESHOLD}`}>
        <p className="max-w-xs text-xs text-muted-foreground">
          Threshold {GAP_THRESHOLD}/{SCORE_MAX} is a display rule set in this app. Recorded gap score: <span className="num">{fmt(r.recommendation?.skill_gap_score)}</span>.
        </p>
      </PageHead>
      {!all.length ? (
        <EmptyState title="No skill scores on record" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          <Tile className="lg:col-span-2" label="Distance to threshold">
            <ul className="space-y-3">
              {all.map((s) => {
                const pct = (s.score / SCORE_MAX) * 100;
                const th = (GAP_THRESHOLD / SCORE_MAX) * 100;
                const below = s.score < GAP_THRESHOLD;
                return (
                  <li key={s.key} className="grid grid-cols-[140px_1fr_56px] items-center gap-4 text-sm">
                    <span className={below ? "" : "text-muted-foreground"}>{s.label}</span>
                    <div className="relative h-3 bg-muted">
                      <div className={`absolute inset-y-0 left-0 ${below ? "bg-gap" : "bg-strength-soft"}`} style={{ width: `${pct}%` }} />
                      {below && <div className="absolute inset-y-0 border border-dashed border-gap" style={{ left: `${pct}%`, width: `${th - pct}%` }} />}
                      <div className="absolute -inset-y-1 w-px bg-foreground" style={{ left: `${th}%` }} />
                    </div>
                    <span className={`num text-right ${below ? "text-gap" : "text-muted-foreground"}`}>{below ? `−${fmt(GAP_THRESHOLD - s.score)}` : fmt(s.score)}</span>
                  </li>
                );
              })}
            </ul>
          </Tile>
          <Tile label="Total points to close">
            <p className="num text-7xl text-gap">{fmt(totalDistance, 0)}</p>
            <p className="mt-3 text-sm text-muted-foreground">Sum of the points each gap skill needs to reach {GAP_THRESHOLD}.</p>
            {gaps[0] && (
              <div className="mt-auto border-t border-border pt-4">
                <p className="eyebrow">Largest gap</p>
                <p className="mt-1 text-lg">{gaps[0].label} <span className="num text-gap">{fmt(gaps[0].score)}</span></p>
              </div>
            )}
          </Tile>
        </div>
      )}
    </div>
  );
}
