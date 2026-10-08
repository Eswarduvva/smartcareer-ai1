import { createFileRoute, Link } from "@tanstack/react-router";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { GROUPS, SKILLS } from "@/lib/skills";
import { Meter } from "@/components/kit";
import { CAREER_TRACKS } from "@/lib/careers";
import { mockSampleProfileId } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartCareer — Understand your skills, discover your career" },
      { name: "description", content: "Build your career profile, see your career match, find your skill gaps and get a step-by-step roadmap." },
      { property: "og:title", content: "SmartCareer — Understand your skills, discover your career" },
      { property: "og:description", content: "A student career intelligence platform: profile, skills, career match, skill gaps, roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

// Abstract hero: skill names only, uniform values — no student data implied.
const HERO_NODES = SKILLS.map((s, i) => ({ id: s.key, label: s.label, group: s.group, value: 0.35 + ((i * 37) % 50) / 100, weak: i % 6 === 4 }));

const BENEFITS = [
  ["See your real position", "One clear readiness score and a breakdown of all 19 skills — strong, developing or still building."],
  ["Know which career fits", "Compare five career tracks side by side and see exactly why one fits you best."],
  ["Act on a plan", "Prioritised skill gaps and a five-step roadmap with projects and activities."],
] as const;

const EXAMPLE_GAPS = [["Statistics", 58, "gap"], ["Python", 66, "primary"], ["Communication", 71, "primary"]] as const;

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
        <span className="font-mono text-sm font-semibold">SMART<span className="text-primary">CAREER</span></span>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/students" className="hidden font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground sm:inline">For mentors</Link>
          <Link to="/me" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">My results</Link>
          <Link to="/build" className="hidden font-mono text-xs uppercase tracking-wider hover:text-primary sm:inline">Build my profile →</Link>
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
            <Link to="/students/$id" params={{ id: mockSampleProfileId }} className="font-mono text-xs uppercase tracking-wider text-foreground underline-offset-4 hover:text-primary hover:underline">
              Explore a demo student →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">5 steps · about 4 minutes · no sign-in · saved on your device</p>
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

      <section className="grid gap-px border-t border-border bg-border md:grid-cols-3">
        {BENEFITS.map(([t, d]) => (
          <div key={t} className="bg-background px-6 py-10 md:px-12">
            <p className="font-mono text-sm">{t}</p>
            <p className="mt-3 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-border px-6 py-14 md:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Career categories</p>
            <h2 className="mt-2 text-2xl font-medium md:text-3xl">Five career tracks, scored openly</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">Each track lists five key skills with a target of 75. Your match is how close you are to those targets.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CAREER_TRACKS.map((t) => (
            <li key={t.id} className="flex flex-col border border-border bg-card p-5">
              <p className="font-mono text-[11px] text-muted-foreground">{t.domain}</p>
              <p className="mt-1 text-lg font-medium">{t.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-10 border-t border-border px-6 py-14 md:px-12 lg:grid-cols-3">
        <div>
          <p className="eyebrow mb-3">Example recommendation</p>
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-[11px] text-muted-foreground">Data Analytics</p>
            <p className="mt-1 text-xl font-medium">Data Analyst</p>
            <p className="num mt-4 text-5xl text-primary">86<span className="text-lg text-muted-foreground">%</span></p>
            <div className="mt-3"><Meter value={86} max={100} tone="primary" /></div>
            <p className="mt-3 text-xs text-muted-foreground">Illustration — strong SQL and analysis, statistics still developing.</p>
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Skill gaps, explained</p>
          <ul className="space-y-3">
            {EXAMPLE_GAPS.map(([l, v, tone]) => (
              <li key={l}>
                <div className="mb-1 flex justify-between text-sm"><span>{l}</span><span className={`num ${tone === "gap" ? "text-gap" : "text-primary"}`}>{v} → 75</span></div>
                <Meter value={v} tone={tone} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">Every skill below 75 becomes a gap with a priority, why it matters, and one concrete action.</p>
        </div>
        <div>
          <p className="eyebrow mb-3">A roadmap you can tick off</p>
          <ol className="space-y-2 text-sm">
            {["Strengthen fundamentals", "Build required skills", "Complete projects", "Gain experience", "Become job ready"].map((t, i) => (
              <li key={t} className="flex items-center gap-3 border-b border-border pb-2"><span className="num w-6 text-primary">{String(i + 1).padStart(2, "0")}</span>{t}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">Mark steps complete as you go — your progress is saved on your device.</p>
        </div>
      </section>

      <section className="grid gap-8 border-t border-border px-6 py-12 md:grid-cols-[5fr_7fr] md:px-12">
        <p className="font-mono text-sm">Honest by design</p>
        <div className="grid gap-6 text-sm text-muted-foreground md:grid-cols-2">
          <p>Recommendations come from <span className="text-foreground">published, rule-based scoring</span>, not AI. Every number on your results page can be traced back to your own answers.</p>
          <p>Mentors and admins get a <Link to="/students" className="text-foreground underline-offset-4 hover:underline">student directory</Link> and <Link to="/analytics" className="text-foreground underline-offset-4 hover:underline">platform analytics</Link>, currently shown with demo data.</p>
        </div>
      </section>

      <section className="flex flex-col items-start gap-6 border-t border-border px-6 py-14 md:flex-row md:items-center md:justify-between md:px-12">
        <h2 className="text-2xl font-medium md:text-3xl">Ready to see where you stand?</h2>
        <Link to="/build" className="inline-block border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">Build my career profile</Link>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-border px-6 py-6 font-mono text-[11px] text-muted-foreground md:px-12">
        <span>© 2026 SmartCareer · Rule-based career recommendation</span>
        <span className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/build" className="hover:text-foreground">Build profile</Link>
          <Link to="/me" className="hover:text-foreground">My results</Link>
          <Link to="/students" className="hover:text-foreground">Student directory</Link>
          <Link to="/analytics" className="hover:text-foreground">Platform analytics</Link>
        </span>
      </footer>
    </div>
  );
}
