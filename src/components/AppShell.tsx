import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PreviewBadge } from "./kit";
import { useMyProfile } from "@/lib/my-profile";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sc-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);
  return (
    <button
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("sc-theme", next ? "dark" : "light");
      }}
      className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
    >
      {dark ? "Light" : "Dark"} mode
    </button>
  );
}

const linkCls =
  "group flex items-center gap-3 whitespace-nowrap border-l-2 border-transparent py-1.5 pl-3 font-mono text-[12px] text-muted-foreground hover:text-foreground";
const activeCls = { className: "!border-primary !text-foreground" };

const JOURNEY = [
  { to: "/build", label: "My Profile", exact: false },
  { to: "/me/skills", label: "Skills", exact: false },
  { to: "/me/match", label: "Career Match", exact: false },
  { to: "/me/gaps", label: "Skill Gaps", exact: false },
  { to: "/me/roadmap", label: "Roadmap", exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="hidden border-sidebar-border bg-sidebar md:block md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col gap-8 p-5">
          <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
            SMART<span className="text-primary">CAREER</span>
          </Link>
          <NavLinks />
          <div className="mt-auto hidden flex-col gap-3 md:flex">
            <ThemeToggle />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Your profile is saved privately on this device.
            </p>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:justify-end md:px-10">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger aria-label="Open menu" className="p-1"><Menu className="h-5 w-5" /></SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto bg-sidebar p-5">
                <SheetTitle className="mb-8 font-mono text-sm font-semibold">SMART<span className="text-primary">CAREER</span></SheetTitle>
                <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
                  <NavLinks />
                </div>
                <div className="mt-8"><ThemeToggle /></div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-mono text-sm font-semibold">SMART<span className="text-primary">CAREER</span></Link>
          </div>
          <PreviewBadge />
        </div>
        <div key={pathname} className="animate-page-in px-4 py-8 sm:px-6 md:px-10">{children}</div>
      </main>
    </div>
  );
}

function NavLinks() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id;
  const mine = useMyProfile();
  const done = !!mine?.complete;
  const studentLinks = [
    { to: "/students/$id", label: "Overview", exact: true },
    { to: "/students/$id/profile", label: "Profile" },
    { to: "/students/$id/skills", label: "Skills" },
    { to: "/students/$id/match", label: "Career Match" },
    { to: "/students/$id/gaps", label: "Skill Gaps" },
    { to: "/students/$id/roadmap", label: "Roadmap" },
  ] as const;

  return (
          <nav className="flex flex-col gap-7">
            <div>
              <p className="eyebrow mb-2">Your career</p>
              <Link to="/" className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
                <span className="num w-4 text-[10px] opacity-60">—</span>Home
              </Link>
              <Link to="/me" className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
                <span className="num w-4 text-[10px] text-primary">◆</span>Career Intelligence
              </Link>
              {JOURNEY.map((l, i) => (
                <Link key={l.to} to={l.to} className={linkCls} activeProps={activeCls}>
                  <span className={`num w-4 text-[10px] ${done ? "text-strength" : "opacity-60"}`}>{done && i === 0 ? "✓" : `0${i + 1}`}</span>
                  {l.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="eyebrow mb-2">Mentor / Admin</p>
              <Link to="/students" className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
                Student Directory
              </Link>
              <Link to="/analytics" className={linkCls} activeProps={activeCls}>
                Platform Analytics
              </Link>
              {id && (
                <div className="mt-3 border-l border-border pl-2">
                  <p className="eyebrow mb-1 pl-3 normal-case">{id}</p>
                  {studentLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      params={{ id }}
                      className={linkCls}
                      activeProps={activeCls}
                      activeOptions={{ exact: "exact" in l }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
  );
}
