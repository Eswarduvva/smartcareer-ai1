import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { requireAnyRole } from "@/lib/role-guard";

export const Route = createFileRoute("/_authenticated/mentor")({
  beforeLoad: requireAnyRole(["mentor", "admin"]),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
