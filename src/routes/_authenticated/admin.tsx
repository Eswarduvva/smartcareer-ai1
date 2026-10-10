import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireAnyRole } from "@/lib/role-guard";

const TABS = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Users & roles"],
  ["/admin/messages", "Feedback & support"],
  ["/analytics", "Platform analytics"],
] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: requireAnyRole(["admin"]),
  component: () => (
    <AppShell>
      <nav aria-label="Admin" className="mb-8 flex flex-wrap gap-2">
        {TABS.map(([to, l]) => (
          <Link key={to} to={to} activeOptions={{ exact: true }} activeProps={{ className: "!border-primary text-foreground" }} className="border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">{l}</Link>
        ))}
      </nav>
      <Outlet />
    </AppShell>
  ),
});
