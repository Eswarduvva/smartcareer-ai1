import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * First-admin bootstrap. Works only while no admin exists, and only for the signed-in
 * account whose confirmed email equals the owner-set FIRST_ADMIN_EMAIL secret.
 */
async function status(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const owner = (process.env["FIRST_ADMIN_EMAIL"] ?? "").trim().toLowerCase();
  const [{ count }, { data: u }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabaseAdmin.auth.admin.getUserById(userId),
  ]);
  const email = (u.user?.email ?? "").toLowerCase();
  return {
    supabaseAdmin,
    adminExists: (count ?? 0) > 0,
    ownerConfigured: owner.length > 0,
    emailConfirmed: Boolean(u.user?.email_confirmed_at),
    isOwner: owner.length > 0 && email === owner,
  };
}

export const getAdminSetupStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin: _a, ...s } = await status(context.userId);
    return s;
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = await status(context.userId);
    if (s.adminExists) return { ok: false, reason: "An administrator already exists." };
    if (!s.ownerConfigured) return { ok: false, reason: "The project owner email has not been set yet." };
    if (!s.isOwner) return { ok: false, reason: "This account is not the authorized project owner." };
    if (!s.emailConfirmed) return { ok: false, reason: "Confirm your email address first." };
    const { error } = await s.supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) return { ok: false, reason: "Could not assign the role. Try again." };
    return { ok: true, reason: "You are now the administrator." };
  });
