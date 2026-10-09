import { createFileRoute, Link } from "@tanstack/react-router";
import { Big, Meter, Tile } from "@/components/kit";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { useRecord } from "@/lib/use-record";
import { fmt, GAP_THRESHOLD, GROUPS, SCORE_MAX, scoredSkills, sortDesc } from "@/lib/skills";

export const Route = createFileRoute("/students/$id/")({
  head: ({ params }) => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: `Student ${params.id} overview — SmartCareer` },
      { name: "description", content: "Academic standing, strengths, gaps and recommended career for one student." },
      { property: "og:title", content: `Student ${params.id} overview — SmartCareer` },
      { property: "og:description", content: "Academic standing, strengths, gaps and recommended career." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const r = useRecord();
  const s = r.student;
  const skills = sortDesc(scoredSkills(r.skills));
  const top = skills.slice(0, 3);
  const weak = skills.slice(-3).reverse();
  const rec = r.recommendation;
  const nodes = skills.map((k) => ({ id: k.key, label: k.label, group: k.group, value: k.score / SCORE_MAX, weak: k.score < GAP_THRESHOLD, display: k.score }));

  return (
    <div className="grid auto-rows-min gap-3 lg:grid-cols-6">
      {/* identity */}
      <Tile className="lg:col-span-2" label="Student">
        <h1 className="num text-3xl font-medium">{s.student_id}</h1>
        <p className="mt-2 text-sm">{[s.degree, s.branch].filter(Boolean).join(" · ")}</p>
        <p className="text-sm text-muted-foreground">{s.specialization}</p>
        <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="eyebrow">CGPA</p>
            <p className="num text-4xl">{fmt(s.cgpa, 2)}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{[s.city, s.state].filter(Boolean).join(", ")}</p>
            <p>Graduating {s.graduation_year ?? "—"}</p>
            <p>{s.backlogs ?? 0} backlog{s.backlogs === 1 ? "" : "s"}</p>
          </div>
        </div>
      </Tile>

      {/* space */}
      <Tile className="min-h-[420px] p-0 lg:col-span-4 lg:row-span-2" >
        <div className="absolute left-5 top-5 z-10">
          <p className="eyebrow">Career intelligence space</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Centre: you. Closer, solid nodes are stronger skills; hollow amber nodes score below {GAP_THRESHOLD}. The diamond is your recommended direction.
          </p>
        </div>
        <div className="absolute bottom-4 left-5 z-10 flex gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {GROUPS.map((g) => <span key={g}>{g}</span>)}
        </div>
        <div className="h-full min-h-[420px]">
          <SkillSpaceLazy nodes={nodes} groups={GROUPS} destination={rec?.recommended_role} variant="data" />
        </div>
      </Tile>

      {/* recommendation */}
      <Tile className="lg:col-span-2" label="Recommended direction">
        <p className="text-xl font-medium">{rec?.recommended_role ?? "No recommendation on record"}</p>
        <p className="text-sm text-muted-foreground">{rec?.recommended_career_domain}</p>
        <Link to="/students/$id/match" params={{ id: s.student_id }} className="mt-auto pt-4 font-mono text-xs uppercase tracking-wider text-primary hover:underline">
          Why this direction →
        </Link>
      </Tile>

      <Tile className="lg:col-span-2" label="Career match">
        <Big value={fmt(rec?.career_match_score)} unit="%" tone="primary" />
        <div className="mt-4"><Meter value={rec?.career_match_score ?? 0} max={100} tone="primary" /></div>
      </Tile>
      <Tile className="lg:col-span-2" label="Career readiness">
        <Big value={fmt(r.goals?.career_readiness_score)} tone="strength" />
        <div className="mt-4"><Meter value={r.goals?.career_readiness_score ?? 0} max={100} /></div>
      </Tile>
      <Tile className="lg:col-span-2" label="Skill gap">
        <Big value={fmt(rec?.skill_gap_score)} tone="gap" />
        <div className="mt-4"><Meter value={rec?.skill_gap_score ?? 0} max={100} tone="gap" /></div>
        <p className="mt-2 text-xs text-muted-foreground">Lower is better.</p>
      </Tile>

      <Tile className="lg:col-span-3" label="Strongest skills">
        <SkillList items={top} tone="strength" />
      </Tile>
      <Tile className="lg:col-span-3" label="Weakest skills" aside={<Link to="/students/$id/gaps" params={{ id: s.student_id }} className="font-mono text-[11px] text-primary hover:underline">All gaps →</Link>}>
        <SkillList items={weak} tone="gap" />
      </Tile>

      <Tile className="lg:col-span-6" label="Experience">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ["Projects", r.experience?.project_count],
            ["Internships", r.experience?.internship_count],
            ["Certifications", r.experience?.certification_count],
            ["Work months", r.experience?.work_experience_months],
          ].map(([l, v]) => (
            <div key={l as string} className="border-l border-border pl-4">
              <p className="num text-3xl">{v ?? "—"}</p>
              <p className="eyebrow mt-1">{l}</p>
            </div>
          ))}
        </div>
      </Tile>
    </div>
  );
}

function SkillList({ items, tone }: { items: { key: string; label: string; score: number }[]; tone: "strength" | "gap" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No skill scores on record.</p>;
  return (
    <ul className="space-y-4">
      {items.map((k) => (
        <li key={k.key}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{k.label}</span>
            <span className="num">{fmt(k.score)}</span>
          </div>
          <Meter value={k.score} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
