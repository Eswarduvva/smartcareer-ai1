import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoles, type AppRole } from "./auth";

/** Route beforeLoad guard. UI-only convenience — the database policies are the real enforcement. */
export function requireAnyRole(allowed: AppRole[]) {
  return async () => {
    const { data } = await supabase.auth.getUser();
    const roles = data.user ? await fetchRoles(data.user.id) : [];
    if (!roles.some((r) => allowed.includes(r))) throw redirect({ to: "/unauthorized" });
    return { userId: data.user!.id, roles };
  };
}
