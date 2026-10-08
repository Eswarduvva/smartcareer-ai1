import { createFileRoute, Link } from "@tanstack/react-router";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { GROUPS, SKILLS } from "@/lib/skills";
import { PreviewBadge } from "@/components/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartCareer AI — Understand your skills, discover your career" },
      { name: "description", content: "Build your career profile, see your career match, find your skill gaps and get a step-by-step roadmap." },
      { property: "og:title", content: "SmartCareer AI — Understand your skills, discover your career" },
      { property: "og:description", content: "A student career intelligence platform: profile, skills, career match, skill gaps, roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

// Abstract hero: skill names only, uniform values — no student data implied.
const HERO_NODES = SKILLS.map((s, i) => ({ id: s.key, label: s.label, group: s.group, value: 0.35 + ((i * 37) % 50) / 100, weak: i % 6 === 4 }));

const FLOW = [
  ["01", "Profile", "Your degree, branch, CGPA and background — five short steps, about four minutes."],
  ["02", "Skills", "Rate 19 skills across technical, reasoning, communication and behaviour."],
  ["03", "Career match", "The career track your skills fit best, with a transparent match score."],
  ["04", "Skill gaps", "Which skills sit below the bar, and exactly how far each one is."],
  ["05", "Roadmap", "Ordered next steps: what to strengthen first, then what to build."],
] as const;

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4 md:px-12">
        <span className="font-mono text-sm font-semibold">SMARTCAREER<span className="text-primary"> AI</span></span>
        <div className="flex flex-wrap items-center gap-6">
          <PreviewBadge />
          <Link to="/me" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">My results</Link>
          <Link to="/build" className="font-mono text-xs uppercase tracking-wider hover:text-primary">Build my profile →</Link>
        </div>
      </header>

      <section className="grid min-h-[80vh] lg:grid-cols-[5fr_7fr]">
        <div className="flex flex-col justify-center gap-8 px-6 py-16 md:px-12">
          <p className="eyebrow">Student career intelligence</p>
          <h1 className="text-4xl font-medium leading-[1.08] md:text-[3.6rem]">
            Understand your skills.<br />
            <span className="text-primary">Discover</span> your career.<br />
            Build your <span className="text-strength">path</span>.
          </h1>
          <p className="max-w-md text-muted-foreground">
            Tell SmartCareer about your studies, skills, experience and goals. It shows which career fits you, what you are still missing, and the order to work on it.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/build" className="inline-block border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">
              Build my career profile
            </Link>
            <span className="text-xs text-muted-foreground">5 steps · no sign-in · saved on your device</span>
          </div>
        </div>
        <div className="relative min-h-[460px] border-t border-border lg:border-l lg:border-t-0">
          <div className="pointer-events-none absolute left-6 top-5 z-10 max-w-xs">
            <p className="eyebrow">Career intelligence space</p>
            <p className="mt-1 text-xs text-muted-foreground">You at the centre, your four skill families around you, your career destination ahead.</p>
          </div>
          <SkillSpaceLazy nodes={HERO_NODES} groups={GROUPS} destination="Career" variant="abstract" />
          <p className="pointer-events-none absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Move your cursor · hover a node</p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="flex items-baseline justify-between px-6 pt-8 md:px-12">
          <p className="eyebrow">How it works</p>
        </div>
        <ol className="grid md:grid-cols-5">
          {FLOW.map(([n, t, d], i) => (
            <li key={n} className="relative border-b border-border px-6 py-8 md:border-b-0 md:border-r md:last:border-r-0 md:first:pl-12">
              <p className="num text-xs text-muted-foreground">{n}</p>
              <p className="mt-6 font-mono text-lg">{t}{i < FLOW.length - 1 && <span className="ml-2 hidden text-muted-foreground md:inline">→</span>}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 border-t border-border px-6 py-12 md:grid-cols-[5fr_7fr] md:px-12">
        <p className="font-mono text-sm">Honest by design</p>
        <div className="grid gap-6 text-sm text-muted-foreground md:grid-cols-2">
          <p>Career matches for your own profile come from <span className="text-foreground">published, rule-based scoring</span> — each career track lists its five key skills and a target of 75. It is not AI, and the app says so.</p>
          <p>For students in the SmartCareer database, recommendations are read straight from their records and never recalculated. Mentors and admins get a directory and <Link to="/analytics" className="text-foreground underline-offset-4 hover:underline">platform analytics</Link>.</p>
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-border px-6 py-6 font-mono text-[11px] text-muted-foreground md:px-12">
        <span>SmartCareer AI · MVP</span>
        <span className="flex gap-6">
          <Link to="/students" className="hover:text-foreground">Student directory</Link>
          <Link to="/analytics" className="hover:text-foreground">Platform analytics</Link>
        </span>
      </footer>
    </div>
  );
}
