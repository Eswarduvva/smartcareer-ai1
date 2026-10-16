import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/auth";

type Invite = { email: string; created_at: string; claimed_at: string | null };

/** Admin invites: the role is granted only after the invited address confirms its email. */
export function AdminInvites() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const q = useQuery({
    queryKey: ["admin", "invites"],
    queryFn: async () => {
      const { data, error } = await db.from("admin_invites").select("email, created_at, claimed_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Invite[];
    },
  });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast.error("Enter a valid email."); return; }
    const me = (await db.auth.getUser()).data.user?.id;
    const { error } = await db.from("admin_invites").insert({ email: v, invited_by: me });
    if (error) { toast.error("Invite failed (it may already exist)."); return; }
    toast.success("Invite saved. Admin access starts once they confirm their email.");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["admin", "invites"] });
  }
  async function remove(v: string) {
    const { error } = await db.from("admin_invites").delete().eq("email", v);
    if (error) { toast.error("Could not remove invite."); return; }
    qc.invalidateQueries({ queryKey: ["admin", "invites"] });
  }
  return (
    <section className="mt-10 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-medium">Invite an admin</h2>
      <p className="mt-1 text-sm text-muted-foreground">New sign-ups are always students. An invited email becomes admin only after its owner signs up and confirms the address. Existing users: grant the role in the table above.</p>
      <form onSubmit={add} className="mt-4 flex flex-wrap gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" aria-label="Admin email" className="min-w-0 flex-1 basis-56 rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save invite</button>
      </form>
      {q.data && q.data.length > 0 && (
        <ul className="mt-4 divide-y divide-border text-sm">
          {q.data.map((i) => (
            <li key={i.email} className="flex items-center justify-between py-2">
              <span>{i.email} <span className="text-xs text-muted-foreground">· {i.claimed_at ? "claimed" : "pending"}</span></span>
              {!i.claimed_at && <button onClick={() => remove(i.email)} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
