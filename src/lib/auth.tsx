import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "mentor" | "admin";

/* Tables added by the pending account migration aren't in generated types yet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

/** undefined = still reading. Session is used only for UI; the database enforces access. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export async function fetchRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await db.from("user_roles").select("role").eq("user_id", userId);
  if (error) return [];
  return (data ?? []).map((r: { role: AppRole }) => r.role);
}

/** Roles for the signed-in user; [] when none or unavailable. */
export function useRoles() {
  const session = useSession();
  const [roles, setRoles] = useState<AppRole[] | undefined>(undefined);
  const uid = session?.user.id;
  useEffect(() => {
    if (session === undefined) return;
    if (!uid) { setRoles([]); return; }
    let live = true;
    fetchRoles(uid).then((r) => live && setRoles(r));
    return () => { live = false; };
  }, [uid, session]);
  return { session, roles };
}

export function homeFor(roles: AppRole[]): "/analytics" | "/students" | "/me" {
  if (roles.includes("admin")) return "/analytics";
  if (roles.includes("mentor")) return "/students";
  return "/me";
}
