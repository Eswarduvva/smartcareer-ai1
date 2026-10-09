import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoles } from "@/lib/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/students")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const roles = data.user ? await fetchRoles(data.user.id) : [];
    if (!roles.includes("admin") && !roles.includes("mentor")) throw redirect({ to: "/me" });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
