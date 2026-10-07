import { Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PreviewBadge } from "./kit";

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

const linkCls = "block border-l-2 border-transparent py-1.5 pl-3 font-mono text-[12px] text-muted-foreground hover:text-foreground";
const activeCls = { className: "!border-primary !text-foreground" };

export function AppShell({ children }: { children: ReactNode }) {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id;
  const studentLinks = [
    { to: "/students/$id", label: "Overview", exact: true },
    { to: "/students/$id/profile", label: "Profile" },
    { to: "/students/$id/skills", label: "Skill Intelligence" },
    { to: "/students/$id/match", label: "Career Match" },
    { to: "/students/$id/gaps", label: "Skill Gaps" },
    { to: "/students/$id/roadmap", label: "Career Roadmap" },
  ] as const;

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-sidebar-border bg-sidebar md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col gap-8 p-5">
          <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
            SMARTCAREER<span className="text-primary"> AI</span>
          </Link>
          <nav className="flex flex-col gap-6 overflow-x-auto">
            <div>
              <p className="eyebrow mb-2">Cohort</p>
              <Link to="/students" className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
                Students
              </Link>
              <Link to="/analytics" className={linkCls} activeProps={activeCls}>
                Analytics
              </Link>
            </div>
            <div>
              <p className="eyebrow mb-2">{id ? `Student ${id}` : "Student"}</p>
              {id ? (
                studentLinks.map((l) => (
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
                ))
              ) : (
                <p className="pl-3 text-xs text-muted-foreground">Select a student from the list to see their career picture.</p>
              )}
            </div>
          </nav>
          <div className="mt-auto hidden flex-col gap-3 md:flex">
            <ThemeToggle />
            <p className="text-[11px] leading-relaxed text-muted-foreground">Sign-in and roles (student, mentor, admin) are not connected yet.</p>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="flex items-center justify-end gap-4 border-b border-border px-6 py-3 md:px-10">
          <PreviewBadge />
          <span className="md:hidden">
            <ThemeToggle />
          </span>
        </div>
        <div className="px-6 py-8 md:px-10">{children}</div>
      </main>
    </div>
  );
}
