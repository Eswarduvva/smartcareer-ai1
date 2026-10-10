import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Brain, Cloud, Code2, Database, ExternalLink, FlaskConical, Home, Menu, MessagesSquare, PlayCircle, Route as RouteIcon, Search, Terminal } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SiteFooter } from "@/components/PublicLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning Home — SmartCareer" },
      { name: "description", content: "Discover what to study next: browse topics, recommended lessons and learning paths matched to SmartCareer career tracks." },
      { property: "og:title", content: "Learning Home — SmartCareer" },
      { property: "og:description", content: "Browse topics, recommended lessons and learning paths for your career goal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearningHome,
});

const CATEGORIES = [
  { id: "python", label: "Python", icon: Terminal },
  { id: "sql", label: "SQL", icon: Database },
  { id: "analytics", label: "Data Analytics", icon: BarChart3 },
  { id: "datascience", label: "Data Science", icon: FlaskConical },
  { id: "ai", label: "AI & Machine Learning", icon: Brain },
  { id: "web", label: "Web Development", icon: Code2 },
  { id: "cloud", label: "Cloud Computing", icon: Cloud },
  { id: "interview", label: "Interview Preparation", icon: MessagesSquare },
] as const;
type CatId = (typeof CATEGORIES)[number]["id"];

/** Demonstration content: each card links to the provider's official learning page. No durations, views or ratings are shown because none were verified. */
const LESSONS: { title: string; provider: string; cat: CatId; url: string }[] = [
  { title: "The Python Tutorial", provider: "Python Software Foundation", cat: "python", url: "https://docs.python.org/3/tutorial/" },
  { title: "SQL Tutorial", provider: "W3Schools", cat: "sql", url: "https://www.w3schools.com/sql/" },
  { title: "Data Analysis with Python", provider: "freeCodeCamp", cat: "analytics", url: "https://www.freecodecamp.org/learn/data-analysis-with-python/" },
  { title: "Learn Data Science courses", provider: "Kaggle Learn", cat: "datascience", url: "https://www.kaggle.com/learn" },
  { title: "Machine Learning Crash Course", provider: "Google for Developers", cat: "ai", url: "https://developers.google.com/machine-learning/crash-course" },
  { title: "Learn Web Development", provider: "MDN Web Docs", cat: "web", url: "https://developer.mozilla.org/en-US/docs/Learn" },
  { title: "Azure Fundamentals learning path", provider: "Microsoft Learn", cat: "cloud", url: "https://learn.microsoft.com/en-us/training/azure/" },
  { title: "AWS Skill Builder", provider: "Amazon Web Services", cat: "cloud", url: "https://skillbuilder.aws/" },
  { title: "Interview preparation kit", provider: "HackerRank", cat: "interview", url: "https://www.hackerrank.com/interview/interview-preparation-kit" },
];

const PATHS = [
  { title: "Data Analyst", steps: ["SQL", "Data Analytics", "Python"] },
  { title: "Data Scientist", steps: ["Python", "Data Science", "AI & Machine Learning"] },
  { title: "Software Developer", steps: ["Web Development", "Python", "Interview Preparation"] },
  { title: "Cloud/DevOps Engineer", steps: ["Python", "Cloud Computing", "Interview Preparation"] },
];

function LearningHome() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CatId | null>(null);
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LESSONS.filter((l) => {
      const label = CATEGORIES.find((c) => c.id === l.cat)!.label.toLowerCase();
      return (!cat || l.cat === cat) && (!q || l.title.toLowerCase().includes(q) || l.provider.toLowerCase().includes(q) || label.includes(q));
    });
  }, [query, cat]);

  const pick = (id: CatId | null) => {
    setCat(id);
    setOpen(false);
    document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth" });
  };

  const nav = (
    <nav aria-label="Learning" className="flex flex-col gap-1 text-sm">
      <button onClick={() => pick(null)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/50", !cat && "bg-accent/50 text-foreground")}>
        <Home className="h-4 w-4 shrink-0" /> Learning home
      </button>
      <p className="eyebrow mt-4 mb-1 px-3">Topics</p>
      {CATEGORIES.map((c) => (
        <button key={c.id} onClick={() => pick(c.id)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-left text-muted-foreground hover:bg-muted/50 hover:text-foreground", cat === c.id && "bg-accent/50 text-foreground")}>
          <c.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{c.label}</span>
        </button>
      ))}
      <p className="eyebrow mt-4 mb-1 px-3">SmartCareer</p>
      <Link to="/me/roadmap" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"><RouteIcon className="h-4 w-4" /> My roadmap</Link>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
        <Link to="/" className="mb-8 block font-display text-xl tracking-tight">Smart<span className="text-gold-gradient italic">Career</span></Link>
        {nav}
      </aside>
      <div className="min-w-0">
        <header className="glass sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 !rounded-none !border-x-0 !border-t-0 px-4 py-3 md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger aria-label="Open topics" className="p-1 lg:hidden"><Menu className="h-5 w-5" /></SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto bg-sidebar p-5">
              <SheetTitle className="mb-6 font-display text-lg">Learning</SheetTitle>
              {nav}
            </SheetContent>
          </Sheet>
          <label className="relative mx-auto block w-full max-w-xl lg:col-start-2">
            <span className="sr-only">Search lessons</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth" })}
              placeholder="What do you want to learn today?"
              className="w-full rounded-full border border-input bg-background/70 py-2.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <ThemeSelector />
        </header>

        <main className="animate-page-in space-y-14 px-4 py-8 md:px-8">
          <section className="glass gradient-border relative overflow-hidden rounded-3xl p-8 md:p-12">
            <p className="eyebrow mb-3">Learning Home</p>
            <h1 className="max-w-2xl text-3xl md:text-5xl md:leading-[1.05]">Your Learning Journey Starts Here</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">Pick a topic, follow a path linked to your career goal, and strengthen the skills your SmartCareer roadmap highlights.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#paths" className="btn-gold rounded-full px-5 py-2.5 text-sm font-medium">Explore learning paths</a>
              <Link to="/me/gaps" className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted/50">See my skill gaps</Link>
            </div>
          </section>

          <section aria-labelledby="cats">
            <h2 id="cats" className="mb-5 text-2xl">Browse by topic</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => pick(c.id)} aria-pressed={cat === c.id}
                  className={cn("glass lift flex min-w-0 items-center gap-3 rounded-2xl p-4 text-left", cat === c.id && "ring-2 ring-primary")}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><c.icon className="h-5 w-5" /></span>
                  <span className="min-w-0 text-sm font-medium leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section id="recommended" aria-labelledby="rec" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="rec" className="text-2xl">Recommended {cat ? `· ${CATEGORIES.find((c) => c.id === cat)!.label}` : "lessons"}</h2>
              <span className="rounded-full border border-gap/50 bg-gap-soft/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider">Demonstration content · links to official provider pages</span>
            </div>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No lessons match “{query}”.{" "}
                <button className="text-primary hover:underline" onClick={() => { setQuery(""); setCat(null); }}>Clear search</button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((l) => {
                  const c = CATEGORIES.find((x) => x.id === l.cat)!;
                  return (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="group glass lift block overflow-hidden rounded-2xl">
                      <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-accent via-muted to-gold-soft">
                        <c.icon className="h-12 w-12 text-accent-foreground/70" />
                        <PlayCircle className="absolute h-14 w-14 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[11px]">{c.label}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-sans text-base font-semibold leading-snug">{l.title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">{l.provider} <ExternalLink className="h-3.5 w-3.5" /></p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>

          <section aria-labelledby="cont">
            <h2 id="cont" className="mb-5 text-2xl">Continue learning</h2>
            <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">Nothing in progress yet. Lessons you start will appear here once progress tracking is added.</p>
              <button onClick={() => pick(null)} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/50">Start a lesson</button>
            </div>
          </section>

          <section id="paths" aria-labelledby="lp" className="scroll-mt-24">
            <h2 id="lp" className="mb-5 text-2xl">Learning paths</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {PATHS.map((p) => (
                <div key={p.title} className="glass rounded-2xl p-6">
                  <p className="eyebrow mb-2">Career track</p>
                  <h3 className="text-xl">{p.title}</h3>
                  <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    {p.steps.map((s, i) => {
                      const c = CATEGORIES.find((x) => x.label === s)!;
                      return (
                        <li key={s} className="flex items-center gap-2">
                          <button onClick={() => pick(c.id)} className="rounded-full bg-accent px-3 py-1 text-accent-foreground hover:brightness-95">{i + 1}. {s}</button>
                          {i < p.steps.length - 1 && <span aria-hidden className="text-muted-foreground">→</span>}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
