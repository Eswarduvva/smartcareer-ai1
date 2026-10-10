import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PageHead } from "@/components/kit";
import { supabase } from "@/integrations/supabase/client";
import { db, useRoles } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account settings — SmartCareer" }, { name: "description", content: "Manage your SmartCareer name and password." }, { property: "og:title", content: "Account settings — SmartCareer" }, { property: "og:description", content: "Manage your SmartCareer account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AccountPage,
});

const field = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const btn = "border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground disabled:opacity-50";

function AccountPage() {
  const { session, roles } = useRoles();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const uid = session?.user.id;

  useEffect(() => {
    if (!uid) return;
    db.from("profiles").select("full_name").eq("id", uid).maybeSingle().then(({ data }: { data: { full_name: string | null } | null }) => setName(data?.full_name ?? ""));
  }, [uid]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const v = name.trim();
    if (!v || v.length > 120) { toast.error("Name must be 1–120 characters."); return; }
    setBusy(true);
    const { error } = await db.from("profiles").update({ full_name: v, updated_at: new Date().toISOString() }).eq("id", uid);
    setBusy(false);
    error ? toast.error("Could not save your name. Please try again.") : toast.success("Name saved.");
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const current = String(f.get("current") ?? "");
    const a = String(f.get("a") ?? "");
    const b = String(f.get("b") ?? "");
    if (a.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (a !== b) { toast.error("Passwords don't match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: a, current_password: current } as never);
    setBusy(false);
    if (error) { toast.error(error.message || "Password not changed."); return; }
    (e.target as HTMLFormElement).reset();
    toast.success("Password changed.");
  }

  const role = roles?.includes("admin") ? "Admin" : roles?.includes("mentor") ? "Mentor" : "Student";
  return (
    <AppShell>
      <PageHead eyebrow="Account" title="Account settings" />
      <div className="grid max-w-3xl gap-10">
        <section className="space-y-2 text-sm">
          <p><span className="eyebrow mr-3">Email</span>{session?.user.email}</p>
          <p><span className="eyebrow mr-3">Role</span>{roles ? role : "…"} <span className="text-muted-foreground">· roles are assigned by an administrator</span></p>
        </section>
        <form onSubmit={saveName} className="space-y-3">
          <h2 className="text-lg">Display name</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={field} aria-label="Display name" />
          <button disabled={busy} className={btn}>Save name</button>
        </form>
        <form onSubmit={changePassword} className="space-y-3">
          <h2 className="text-lg">Change password</h2>
          <input name="current" type="password" placeholder="Current password" autoComplete="current-password" className={field} />
          <input name="a" type="password" placeholder="New password (min 8)" autoComplete="new-password" className={field} />
          <input name="b" type="password" placeholder="Repeat new password" autoComplete="new-password" className={field} />
          <button disabled={busy} className={btn}>Change password</button>
        </form>
      </div>
    </AppShell>
  );
}
