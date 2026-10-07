import { createFileRoute } from "@tanstack/react-router";
import { Big, Meter, PageHead, Tile } from "@/components/kit";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, scoredSkills, sortDesc, STRONG_THRESHOLD } from "@/lib/skills";

export const Route = createFileRoute("/students/$id/match")({
  head: ({ params }) => ({
    meta: [
      { title: `Career match ${params.id} — SmartCareer AI` },
      { name: "description", content: "Recommended career domain and role, with the strengths and gaps behind it." },
      { property: "og:title", content: `Career match ${params.id} — SmartCareer AI` },
      { property: "og:description", content: "Recommended career, match score and skill gap." },
    ],
  }),
  component: Match,
});

function Match() {
  const r = useRecord();
  const rec = r.recommendation;
  const skills = sortDesc(scoredSkills(r.skills));
  const strengths = skills.filter((s) => s.score >= STRONG_THRESHOLD);
  const gaps = skills.filter((s) => s.score < GAP_THRESHOLD).reverse();
  const pref = r.preferences;
  const aligned = pref?.preferred_work_role && rec?.recommended_role && pref.preferred_work_role.toLowerCase() === rec.recommended_role.toLowerCase();

  return (
    <div>
      <PageHead eyebrow="Career match" title={rec?.recommended_role ?? "No recommendation on record"}>
        <p className="font-mono text-sm text-muted-foreground">{rec?.recommended_career_domain}</p>
      </PageHead>
      <div className="grid gap-3 lg:grid-cols-6">
        <Tile className="lg:col-span-4" label="Your match">
          <div className="num text-8xl font-medium leading-none text-primary md:text-9xl">
            {fmt(rec?.career_match_score)}<span className="text-3xl text-muted-foreground">%</span>
          </div>
          <div className="mt-6"><Meter value={rec?.career_match_score ?? 0} max={100} tone="primary" /></div>
        </Tile>
        <Tile className="lg:col-span-2" label="Skill gap score">
          <Big value={fmt(rec?.skill_gap_score)} tone="gap" />
          <p className="mt-auto pt-4 text-xs text-muted-foreground">Both scores are read directly from the recommendations table. How they are calculated is defined by your backend, not this app.</p>
        </Tile>

        <Tile className="lg:col-span-3" label={`Strengths (≥ ${STRONG_THRESHOLD})`}>
          {strengths.length ? (
            <ul className="divide-y divide-border">
              {strengths.map((s) => (
                <li key={s.key} className="flex justify-between py-2 text-sm"><span>{s.label}</span><span className="num text-strength">{fmt(s.score)}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No skills at or above {STRONG_THRESHOLD}.</p>}
        </Tile>
        <Tile className="lg:col-span-3" label={`Gaps (< ${GAP_THRESHOLD})`}>
          {gaps.length ? (
            <ul className="divide-y divide-border">
              {gaps.map((s) => (
                <li key={s.key} className="flex justify-between py-2 text-sm"><span>{s.label}</span><span className="num text-gap">{fmt(s.score)}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No skills below {GAP_THRESHOLD}.</p>}
        </Tile>

        <Tile className="lg:col-span-6" label="Relevant experience">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {([
              ["Projects", r.experience?.project_count],
              ["Internships", r.experience?.internship_count],
              ["Certifications", r.experience?.certification_count],
              ["Work months", r.experience?.work_experience_months],
            ] as const).map(([l, v]) => (
              <div key={l}><p className="num text-4xl">{v ?? "—"}</p><p className="eyebrow mt-1">{l}</p></div>
            ))}
          </div>
        </Tile>

        <Tile className="lg:col-span-6" label="Recommendation vs stated preference">
          <div className="grid gap-6 md:grid-cols-3">
            <div><p className="eyebrow">Recommended role</p><p className="mt-1">{rec?.recommended_role ?? "—"}</p></div>
            <div><p className="eyebrow">Preferred role</p><p className="mt-1">{pref?.preferred_work_role ?? "—"}</p></div>
            <div><p className="eyebrow">Career goal</p><p className="mt-1">{r.goals?.career_goal ?? "—"}</p></div>
          </div>
          <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
            {aligned ? "The recommendation matches the role this student said they prefer." : "The recommendation differs from, or cannot be compared with, the stated preference."}
          </p>
        </Tile>
      </div>
    </div>
  );
}
