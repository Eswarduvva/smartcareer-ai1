import { createFileRoute, Link } from "@tanstack/react-router";
import { SkillSpaceLazy } from "@/components/space/SkillSpaceLazy";
import { GROUPS, SKILLS } from "@/lib/skills";
import { Meter } from "@/components/kit";
import { CAREER_TRACKS } from "@/lib/careers";
import { mockSampleProfileId } from "@/lib/mock";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useReveal } from "@/lib/theme";
import { useEffect, useRef } from "react";
import { UserRound, Sparkles, Target, TrendingUp, Route as RouteIcon, ArrowRight, Code2, BarChart3, GraduationCap, Rocket, Trophy } from "lucide-react";
import hero from "@/assets/hero-landscape.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartCareer — Your Potential. Your Direction. Your Future." },
      { name: "description", content: "Turn your skills, education, and ambitions into a personalized career journey." },
      { property: "og:title", content: "SmartCareer — Your Potential. Your Direction. Your Future." },
      { property: "og:description", content: "A student career intelligence platform: profile, skills, career match, skill gaps, roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

// Abstract hero: skill names only, uniform values — no student data implied.
const HERO_NODES = SKILLS.map((s, i) => ({ id: s.key, label: s.label, group: s.group, value: 0.35 + ((i * 37) % 50) / 100, weak: i % 6 === 4 }));

const FEATURES = [
  { icon: UserRound, t: "Profile", d: "Degree, branch, CGPA and background in five short steps.", to: "/build", cta: "Build profile" },
  { icon: Sparkles, t: "Skill Assessment", d: "Rate 19 skills across technical, reasoning, communication and behaviour.", to: "/me/skills", cta: "See skills" },
  { icon: Target, t: "Career Match", d: "The track your skills fit best, with a transparent score.", to: "/me/match", cta: "View matches" },
  { icon: TrendingUp, t: "Skill Gaps", d: "Every skill below the bar, how far it is and what to do.", to: "/me/gaps", cta: "Find gaps" },
  { icon: RouteIcon, t: "Roadmap", d: "Four stages of tasks you can tick off as you grow.", to: "/me/roadmap", cta: "Open roadmap" },
] as const;

const EXAMPLE_GAPS = [["Statistics", 58, "gap"], ["Python", 66, "primary"], ["Communication", 71, "primary"]] as const;

function Landing() {
  useReveal();
  const bg = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (bg.current) bg.current.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const lineRef = "h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent";
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <div ref={bg} className="absolute inset-0 -z-10 will-change-transform">
          <img src={hero} alt="" width={1920} height={1088} className="animate-drift h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mix-blend-screen">
          <div className="animate-blob absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--color-primary),transparent_65%)] opacity-30 blur-2xl" />
          <div className="animate-blob absolute right-0 top-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,var(--color-glow),transparent_65%)] opacity-25 blur-2xl" style={{ animationDelay: "-8s" }} />
        </div>
        <Particles />
        <FloatingIcons />

        <header className="flex items-center justify-between gap-4 px-6 py-5 md:px-12">
          <span className="font-display text-2xl tracking-tight text-foreground">Smart<span className="text-gold-gradient italic">Career</span></span>
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <Link to="/students" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline">For mentors</Link>
            <Link to="/me" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">My results</Link>
            <ThemeSelector />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 pb-24 pt-10 md:px-12">
          <p className="animate-rise eyebrow mb-6 flex items-center gap-3 text-gold" style={{ animationDelay: "100ms" }}>
            <span className="h-px w-10 bg-gold" /> Career intelligence
          </p>
          <h1 className="max-w-4xl text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl md:text-[5.5rem]">
            {["Your Potential.", "Your Direction.", "Your Future."].map((w, i) => (
              <span key={w} className="animate-rise block" style={{ animationDelay: `${250 + i * 220}ms` }}>
                {i === 2 ? <em className="text-gold-gradient">{w}</em> : w}
              </span>
            ))}
          </h1>
          <p className="animate-rise mt-8 max-w-lg text-lg text-muted-foreground" style={{ animationDelay: "950ms" }}>
            Turn your skills, education, and ambitions into a personalized career journey.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "1150ms" }}>
            <Link to="/build" className="btn-gold inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#paths" className="glass inline-flex items-center rounded-full px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-gold/50">
              Explore Careers
            </a>
          </div>
          <p className="animate-rise mt-6 text-xs text-muted-foreground" style={{ animationDelay: "1300ms" }}>5 steps · about 4 minutes · no sign-in · saved on your device</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-24 md:px-12">
        <div className="reveal mb-12 max-w-2xl">
          <p className="eyebrow mb-3 text-gold">The experience</p>
          <h2 className="text-4xl md:text-5xl">Five steps from where you are to where you're going.</h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" style={{ perspective: "1000px" }}>
          {FEATURES.map((f, i) => (
            <li key={f.t} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <TiltCard {...f} />
            </li>
          ))}
        </ul>
      </section>

      {/* JOURNEY TIMELINE */}
      <section className="px-6 py-20 md:px-12">
        <p className="reveal eyebrow mb-10 text-center text-gold">Your journey</p>
        <ol className="relative mx-auto grid max-w-5xl gap-10 md:grid-cols-5 md:gap-4">
          <svg className="pointer-events-none absolute left-0 right-0 top-5 hidden h-2 w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden>
            <line x1="10" y1="1" x2="90" y2="1" pathLength={1} stroke="var(--color-gold)" strokeWidth="0.4" strokeDasharray="1" className="journey-line" vectorEffect="non-scaling-stroke" />
          </svg>
          {FEATURES.map(({ t }, i) => (
            <li key={t} className="reveal relative flex flex-col items-center text-center" style={{ transitionDelay: `${200 + i * 150}ms` }}>
              <span className="num relative grid h-10 w-10 place-items-center rounded-full border border-gold/60 bg-background text-xs text-gold shadow-[0_0_24px_-4px_var(--color-gold)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 font-display text-lg">{t}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CAREER PATHS */}
      <section id="paths" className="scroll-mt-10 px-6 py-24 md:px-12">
        <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3 text-gold">Career paths</p>
            <h2 className="text-4xl md:text-5xl">Five tracks, scored openly.</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">Each track lists five key skills with a target of 75. Your match is how close you are to those targets.</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CAREER_TRACKS.map((t, i) => (
            <li key={t.id} className="reveal glass lift flex flex-col rounded-2xl p-6" style={{ transitionDelay: `${i * 70}ms` }}>
              <p className="eyebrow">{t.domain}</p>
              <p className="mt-3 font-display text-2xl">{t.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* SPACE + EXAMPLE */}
      <section className="grid gap-6 px-6 py-20 md:px-12 lg:grid-cols-[7fr_5fr]">
        <div className="reveal glass relative min-h-[440px] overflow-hidden rounded-3xl">
          <div className="pointer-events-none absolute left-6 top-5 z-10 max-w-xs">
            <p className="eyebrow text-gold">Career intelligence space</p>
            <p className="mt-1 text-xs text-muted-foreground">You at the centre, your four skill families around you, your career ahead.</p>
          </div>
          <SkillSpaceLazy nodes={HERO_NODES} groups={GROUPS} destination="Career" variant="abstract" />
        </div>
        <div className="reveal grid gap-6">
          <div className="glass rounded-3xl p-6">
            <p className="eyebrow">Example recommendation · illustration</p>
            <p className="mt-3 font-display text-2xl">Data Analyst</p>
            <p className="num mt-4 text-5xl text-gold">86<span className="text-lg text-muted-foreground">%</span></p>
            <div className="mt-3"><Meter value={86} max={100} tone="primary" /></div>
          </div>
          <div className="glass rounded-3xl p-6">
            <p className="eyebrow mb-4">Skill gaps, explained</p>
            <ul className="space-y-3">
              {EXAMPLE_GAPS.map(([l, v, tone]) => (
                <li key={l}>
                  <div className="mb-1 flex justify-between text-sm"><span>{l}</span><span className={`num ${tone === "gap" ? "text-gap" : "text-primary"}`}>{v} → 75</span></div>
                  <Meter value={v} tone={tone} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HONEST */}
      <section className="px-6 py-16 md:px-12">
        <div className="reveal mx-auto flex max-w-4xl items-center gap-6"><span className={lineRef} /><p className="eyebrow text-gold">Honest by design</p><span className={lineRef} /></div>
        <div className="reveal mx-auto mt-8 grid max-w-4xl gap-6 text-center text-sm text-muted-foreground md:grid-cols-2 md:text-left">
          <p>Recommendations come from <span className="text-foreground">published, rule-based scoring</span>. Every number can be traced back to your own answers.</p>
          <p>Mentors get a <Link to="/students" className="text-foreground underline-offset-4 hover:underline">student directory</Link> and <Link to="/analytics" className="text-foreground underline-offset-4 hover:underline">platform analytics</Link>, currently shown with demo data. Or <Link to="/students/$id" params={{ id: mockSampleProfileId }} className="text-foreground underline-offset-4 hover:underline">explore a demo student</Link>.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 md:px-12">
        <div className="reveal glass relative overflow-hidden rounded-3xl px-8 py-16 text-center">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
          <h2 className="relative text-4xl md:text-5xl">Ready to see where you stand?</h2>
          <Link to="/build" className="btn-gold relative mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
            Discover My Career <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="flex flex-wrap justify-between gap-4 border-t border-border px-6 py-8 text-xs text-muted-foreground md:px-12">
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

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 47) % 100,
  top: 30 + ((i * 29) % 65),
  size: 2 + (i % 3),
  delay: (i % 7) * 0.9,
  dur: 6 + (i % 5),
}));

function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full bg-gold"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, opacity: 0.6, boxShadow: "0 0 10px var(--color-gold)", animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </div>
  );
}

const FLOAT = [
  { Icon: Code2, x: "72%", y: "22%", d: 0, label: "Coding" },
  { Icon: BarChart3, x: "86%", y: "44%", d: 1.5, label: "Analytics" },
  { Icon: GraduationCap, x: "64%", y: "56%", d: 3, label: "Education" },
  { Icon: Rocket, x: "90%", y: "18%", d: 2.2, label: "Career growth" },
  { Icon: Trophy, x: "78%", y: "68%", d: 0.8, label: "Achievements" },
];

function FloatingIcons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
      {FLOAT.map(({ Icon, x, y, d, label }) => (
        <div key={label} className="animate-float absolute" style={{ left: x, top: y, animationDelay: `${d}s`, animationDuration: "9s" }}>
          <div className="glass grid h-14 w-14 place-items-center rounded-2xl text-gold">
            <Icon className="h-6 w-6" strokeWidth={1.4} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TiltCard({ icon: Icon, t, d, to, cta }: (typeof FEATURES)[number]) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    el.style.transform = `rotateX(${-py * 8}deg) rotateY(${px * 10}deg) translateY(-4px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <Link ref={ref} to={to} onPointerMove={move} onPointerLeave={leave}
      className="tilt-card glass gradient-border flex h-full flex-col rounded-2xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="tilt-icon grid h-11 w-11 place-items-center rounded-xl border border-gold/40 bg-gradient-to-br from-gold/20 to-primary/10 text-gold">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <span className="mt-6 font-display text-xl">{t}</span>
      <span className="mt-2 text-sm text-muted-foreground">{d}</span>
      <span className="tilt-more mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-gold">{cta} <ArrowRight className="h-3.5 w-3.5" /></span>
    </Link>
  );
}
