import { createFileRoute, Link } from "@tanstack/react-router";
import { Meter } from "@/components/kit";
import { AssessmentSummary } from '@/components/assessments/AssessmentSummary';
import { StudentKpis } from "@/components/dashboard/StudentKpis";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { buildSteps } from "@/components/journey/RoadmapView";
import { useRecord } from "@/lib/use-record";
import { CAREER_TRACKS } from "@/lib/recommend";
import { fmt, GAP_THRESHOLD, GROUPS, SCORE_MAX, scoredSkills, sortDesc, STRONG_THRESHOLD } from "@/lib/skills";

export const Route = createFileRoute("/_authenticated/me/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "My career intelligence — SmartCareer" },
      { name: "description", content: "Your career match, recommended role, strengths, skill gaps and next steps on one page." },
      { property: "og:title", content: "My career intelligence — SmartCareer" },
      { property: "og:description", content: "Career match, skill gaps and roadmap from your profile." },
    ],
  }),
  component: Intelligence,
});

function Intelligence() {
  const r = useRecord();
  const rec = r.recommendation;
  const skills = sortDesc(scoredSkills(r.skills));
  const track = CAREER_TRACKS.find((t) => t.role === rec?.recommended_role);
  const signals = skills.filter((s) => track?.skills.includes(s.key) && s.score >= GAP_THRESHOLD).slice(0, 4);
  const strong = skills.filter((s) => s.score >= STRONG_THRESHOLD);
  const developing = skills.filter((s) => s.score >= GAP_THRESHOLD && s.score < STRONG_THRESHOLD);
  const gaps = [...skills].reverse().filter((s) => s.score < GAP_THRESHOLD);
  const priority = [...skills].reverse().filter((s) => track?.skills.includes(s.key) && s.score < STRONG_THRESHOLD).slice(0, 3);
  const steps = buildSteps(r).slice(0, 4);
  const e = r.experience;
  const nodes = skills.map((k) => ({ id: k.key, label: k.label, group: k.group, value: k.score / SCORE_MAX, weak: k.score < GAP_THRESHOLD, display: k.score }));

  return (
    <div>
      <p className="eyebrow mb-3 flex items-center gap-3">
        <span className="h-px w-6 bg-primary" />
        Career intelligence
        <span className="border border-border px-1.5 py-0.5 text-[9px]">Rule-based recommendation · not AI</span>
      </p>

      <StudentKpis />
      <AssessmentSummary />

      {/* result */}
      <section className="grid border-y border-border lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col justify-between gap-8 py-8 lg:border-r lg:border-border lg:pr-10">
          <div>
            <p className="eyebrow">Your career match</p>
            <p className="num mt-3 text-8xl font-medium leading-none text-primary md:text-[8.5rem]">
              {fmt(rec?.career_match_score)}
              <span className="text-3xl text-muted-foreground">%</span>
            </p>
            <div className="mt-5 max-w-sm"><Meter value={rec?.career_match_score ?? 0} max={100} tone="primary" /></div>
          </div>
          <div>
            <p className="text-3xl font-medium tracking-tight">{rec?.recommended_role ?? "—"}</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{rec?.recommended_career_domain}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-border pt-5">
            <div>
              <p className="eyebrow">Skill gap</p>
              <p className="num mt-1 text-3xl text-gap">{fmt(rec?.skill_gap_score)}</p>
              <p className="text-[11px] text-muted-foreground">avg. points to target · lower is better</p>
            </div>
            <div>
              <p className="eyebrow">Career readiness</p>
              <p className="num mt-1 text-3xl">{fmt(r.goals?.career_readiness_score)}</p>
              <p className="text-[11px] text-muted-foreground">Rule-based: 70% skills + projects, internships, certifications.</p>
            </div>
          </div>
        </div>
        <div className="relative min-h-[460px] border-t border-border lg:border-t-0">
          <div className="pointer-events-none absolute left-5 top-5 z-10">
            <p className="eyebrow">Career intelligence space</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">You at the centre. Solid nodes are strengths, hollow amber nodes are gaps. The diamond is your recommended role.</p>
          </div>
          <div className="h-full min-h-[460px]">
            <SkillSpaceLazy nodes={nodes} groups={GROUPS} destination={rec?.recommended_role} variant="data" />
          </div>
        </div>
      </section>

      {/* why */}
      <section className="grid gap-10 border-b border-border py-10 md:grid-cols-3">
        <div>
          <p className="eyebrow mb-4">Why this direction</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {rec?.recommended_role} relies on {track?.skills.length ?? 5} key skills. These are your strongest signals among them:
          </p>
          <SkillRows items={signals} tone="text-strength" empty="None of the key skills reach 60 yet." />
        </div>
        <div>
          <p className="eyebrow mb-4">Priority skill gaps</p>
          <p className="mb-4 text-sm text-muted-foreground">Key skills for this role still under the {STRONG_THRESHOLD} target:</p>
          <SkillRows items={priority} tone="text-gap" empty="Every key skill is at target." />
        </div>
        <div>
          <p className="eyebrow mb-4">Your next steps</p>
          <ol className="space-y-4">
            {steps.length ? steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[28px_1fr] text-sm">
                <span className="num text-primary">{i + 1}.</span>
                <span>{s.title}<span className="block text-xs text-muted-foreground">{s.why}</span></span>
              </li>
            )) : <li className="text-sm text-muted-foreground">No urgent steps — keep building on your strengths.</li>}
          </ol>
          <Link to="/me/roadmap" className="mt-6 inline-block font-mono text-xs uppercase tracking-wider text-primary hover:underline">Full roadmap →</Link>
        </div>
      </section>

      {/* bands + experience */}
      <section className="grid border-b border-border md:grid-cols-3">
        {[
          ["Strong skills", `≥ ${STRONG_THRESHOLD}`, strong, "text-strength"],
          ["Developing", `${GAP_THRESHOLD}–${STRONG_THRESHOLD - 1}`, developing, "text-primary"],
          ["Below the bar", `< ${GAP_THRESHOLD}`, gaps, "text-gap"],
        ].map(([label, rule, xs, tone]) => (
          <div key={label as string} className="border-b border-border py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
            <p className={`eyebrow ${tone}`}>{label as string} <span className="text-muted-foreground">{rule as string}</span></p>
            <p className={`num mt-2 text-4xl ${tone}`}>{(xs as unknown[]).length}</p>
            <p className="mt-2 text-xs text-muted-foreground">{(xs as { label: string }[]).map((x) => x.label).join(", ") || "—"}</p>
          </div>
        ))}
      </section>

      <section className="py-8">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="eyebrow">Experience & interests</p>
          <Link to="/build" className="font-mono text-[11px] text-primary hover:underline">Edit profile →</Link>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {([
            ["Projects", e?.project_count],
            ["Internships", e?.internship_count],
            ["Certifications", e?.certification_count],
            ["Work months", e?.work_experience_months],
          ] as const).map(([l, v]) => (
            <div key={l} className="border-l border-border pl-4">
              <p className="num text-3xl">{v ?? "—"}</p>
              <p className="eyebrow mt-1">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
          <p><span className="eyebrow block">Primary interest</span>{r.preferences?.primary_interest ?? "—"}</p>
          <p><span className="eyebrow block">Preferred role</span>{r.preferences?.preferred_work_role ?? "—"}</p>
          <p><span className="eyebrow block">Work mode · industry</span>{[r.preferences?.preferred_work_mode, r.preferences?.preferred_industry].filter(Boolean).join(" · ") || "—"}</p>
        </div>
      </section>

      <nav className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 font-mono text-xs uppercase tracking-wider">
        <Link to="/me/skills" className="hover:text-primary">Skills →</Link>
        <Link to="/me/match" className="hover:text-primary">Career match →</Link>
        <Link to="/me/gaps" className="hover:text-primary">Skill gaps →</Link>
        <Link to="/me/roadmap" className="hover:text-primary">Roadmap →</Link>
        <Link to="/learning" className="hover:text-primary">Learning & Activities →</Link>
      </nav>
    </div>
  );
}

function SkillRows({ items, tone, empty }: { items: { key: string; label: string; score: number }[]; tone: string; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((s) => (
        <li key={s.key} className="flex justify-between py-2 text-sm">
          <span>{s.label}</span>
          <span className={`num ${tone}`}>{fmt(s.score)}</span>
        </li>
      ))}
    </ul>
  );
}
