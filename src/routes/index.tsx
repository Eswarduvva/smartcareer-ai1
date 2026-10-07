import { createFileRoute, Link } from "@tanstack/react-router";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { GROUPS, SKILLS } from "@/lib/skills";
import { PreviewBadge } from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartCareer AI — Student Career Intelligence Platform" },
      { name: "description", content: "Where am I now, what career fits me, what am I missing, and what should I do next? Answered from real student data." },
      { property: "og:title", content: "SmartCareer AI — Student Career Intelligence Platform" },
      { property: "og:description", content: "Academic data, skills and experience turned into a clear career picture." },
    ],
  }),
  component: Landing,
});

// Abstract hero: skill names only, uniform values — no student data implied.
const HERO_NODES = SKILLS.map((s, i) => ({ id: s.key, label: s.label, group: s.group, value: 0.35 + ((i * 37) % 50) / 100, weak: i % 6 === 4 }));

const FLOW = [
  ["01", "Student", "Degree, branch, CGPA, backlogs — the academic baseline."],
  ["02", "Skills", "19 scores across technical, reasoning, communication and behaviour."],
  ["03", "Career", "The recommended domain and role, with its match score."],
  ["04", "Gap", "Which skills sit below the bar, and by how much."],
  ["05", "Roadmap", "Concrete next steps derived from the gaps and experience."],
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-12">
        <span className="font-mono text-sm font-semibold">SMARTCAREER<span className="text-primary"> AI</span></span>
        <div className="flex items-center gap-6">
          <PreviewBadge />
          <Link to="/analytics" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">Analytics</Link>
          <Link to="/students" className="font-mono text-xs uppercase tracking-wider hover:text-primary">Open app →</Link>
        </div>
      </header>

      <section className="grid min-h-[78vh] lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col justify-center gap-8 px-6 py-16 md:px-12">
          <p className="eyebrow">Student Career Intelligence Platform</p>
          <h1 className="text-4xl font-medium leading-[1.05] md:text-6xl">
            Where am I now<span className="text-muted-foreground">,</span><br />
            what fits me<span className="text-muted-foreground">,</span><br />
            what am I <span className="text-gap">missing</span><span className="text-muted-foreground">,</span><br />
            what's <span className="text-primary">next</span>?
          </h1>
          <p className="max-w-md text-muted-foreground">
            SmartCareer reads a student's academic record, skill scores and experience, and lays them out as one picture — strengths, gaps, and the career direction they point to.
          </p>
          <div>
            <Link to="/students" className="inline-block border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">
              Find a student
            </Link>
          </div>
        </div>
        <div className="relative min-h-[460px] border-t border-border lg:border-l lg:border-t-0">
          <SkillSpaceLazy nodes={HERO_NODES} groups={GROUPS} destination="Career" variant="abstract" />
          <p className="pointer-events-none absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Move your cursor · hover a node</p>
        </div>
      </section>

      <section className="border-t border-border">
        <ol className="grid md:grid-cols-5">
          {FLOW.map(([n, t, d]) => (
            <li key={n} className="border-b border-border p-6 md:border-b-0 md:border-r md:last:border-r-0">
              <p className="num text-xs text-muted-foreground">{n}</p>
              <p className="mt-6 font-mono text-lg">{t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-border px-6 py-6 font-mono text-[11px] text-muted-foreground md:px-12">
        <span>SmartCareer AI</span>
        <span>Data source: SmartCareer database (Lovable Cloud)</span>
      </footer>
    </div>
  );
}
