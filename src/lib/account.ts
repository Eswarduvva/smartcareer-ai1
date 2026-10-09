import { supabase } from "@/integrations/supabase/client";
import { db } from "./auth";

/**
 * Per-account storage for a signed-in student's self-entered profile and roadmap progress.
 * Row-level security limits every read/write to the caller's own row.
 * Returns null when not signed in or when account storage is unavailable.
 */
async function uid() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export async function loadAccount(): Promise<{ profile: unknown; complete: boolean; roadmap_done: string[] } | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await db.from("student_accounts").select("profile, complete, roadmap_done").eq("user_id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function saveAccount(patch: { profile?: unknown; complete?: boolean; roadmap_done?: string[] }): Promise<boolean> {
  const id = await uid();
  if (!id) return false;
  const { error } = await db.from("student_accounts").upsert({ user_id: id, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return !error;
}
