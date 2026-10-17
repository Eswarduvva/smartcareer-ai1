import { Link, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/lib/auth";
import { clearProfile } from "@/lib/my-profile";
import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PreviewBadge } from "./kit";
import { ThemeSelector } from "./ThemeSelector";
import { useMyProfile } from "@/lib/my-profile";

const linkCls =
  "group flex items-center gap-3 whitespace-nowrap rounded-r-lg border-l-2 border-transparent py-2 pl-3 transition-colors hover:bg-muted/40 font-mono text-[12px] text-muted-foreground hover:text-foreground";
const activeCls = { className: "!border-gold !text-foreground bg-accent/40" };

const JOURNEY = [
  { to: "/build", label: "My Profile", exact: false },
  { to: "/me/skills", label: "Skills", exact: false },
  { to: "/me/match", label: "Career Match", exact: false },
  { to: "/me/gaps", label: "Skill Gaps", exact: false },
  { to: "/me/roadmap", label: "Roadmap", exact: false },
  { to: "/learning", label: "Learning & Activities", exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="hidden border-sidebar-border bg-sidebar backdrop-blur-xl md:block md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col gap-8 p-5">
          <Link to="/" className="font-display text-xl tracking-tight">
            Smart<span className="text-gold-gradient italic">Career</span>
          </Link>
          <NavLinks />
          <div className="mt-auto hidden flex-col gap-3 md:flex">
            <Account />
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="glass sticky top-0 z-30 flex items-center justify-between gap-4 !rounded-none !border-x-0 !border-t-0 px-4 py-3 md:justify-end md:px-10">
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger aria-label="Open menu" className="p-1"><Menu className="h-5 w-5" /></SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto bg-sidebar p-5">
                <SheetTitle className="mb-8 font-mono text-sm font-semibold">SMART<span className="text-primary">CAREER</span></SheetTitle>
                <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
                  <NavLinks />
                </div>
                <div className="mt-8"><Account /></div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-mono text-sm font-semibold">SMART<span className="text-primary">CAREER</span></Link>
          </div>
          <div className="flex items-center gap-3"><PreviewBadge /><ThemeSelector /></div>
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
  const { roles } = useRoles();
  const staff = !!roles && (roles.includes("mentor") || roles.includes("admin"));
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
              <Link to="/account" className={linkCls} activeProps={activeCls}>
                <span className="num w-4 text-[10px] opacity-60">⚙</span>Account settings
              </Link>
            </div>
            {staff && <div>
              <p className="eyebrow mb-2">{roles?.includes("admin") ? "Admin" : "Mentor"}</p>
              <Link to="/mentor" className={linkCls} activeProps={activeCls}>
                Mentor portal
              </Link>
              <Link to="/mentor/learning" className={linkCls} activeProps={activeCls}>Learning reviews</Link>
              {roles?.includes("admin") && (
                <Link to="/admin" className={linkCls} activeProps={activeCls}>
                  Admin portal
                </Link>
              )}
              <Link to="/students" className={linkCls} activeProps={activeCls} activeOptions={{ exact: true }}>
                Student Directory
              </Link>
              {roles?.includes("admin") && <Link to="/admin/learning" className={linkCls} activeProps={activeCls}>Learning management</Link>}
              <Link to="/students" className="hidden" aria-hidden="true" tabIndex={-1}>
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
            </div>}
          </nav>
  );
}

function Account() {
  const { session, roles } = useRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  if (!session) return null;
  const role = roles?.includes("admin") ? "Admin" : roles?.includes("mentor") ? "Mentor" : "Student";
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    clearProfile({ keepAccount: true });
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="space-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
      <p className="truncate text-foreground" title={session.user.email}>{session.user.email}</p>
      <p className="eyebrow">{role} account</p>
      <button onClick={signOut} className="inline-flex items-center gap-2 rounded-lg py-1 hover:text-foreground"><LogOut className="h-3.5 w-3.5" />Sign out</button>
    </div>
  );
}
