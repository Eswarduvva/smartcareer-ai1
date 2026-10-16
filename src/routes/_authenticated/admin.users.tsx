import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { db } from "@/lib/auth";
import { AdminInvites } from "@/components/admin/AdminInvites";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users & roles — SmartCareer" }, { name: "description", content: "Grant roles and assign students to mentors." }, { property: "og:title", content: "Users & roles — SmartCareer" }, { property: "og:description", content: "User and role management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Users,
});

type U = { id: string; email: string; full_name: string | null; roles: string[]; created_at: string };
type A = { mentor_id: string; student_id: string };
const ROLES = ["student", "mentor", "admin"] as const;

function Users() {
  const qc = useQueryClient();
  const [mentor, setMentor] = useState("");
  const [student, setStudent] = useState("");
  const q = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [u, a, me] = await Promise.all([db.rpc("admin_list_users"), db.from("mentor_assignments").select("mentor_id, student_id").order("student_id"), db.auth.getUser()]);
      if (u.error) throw u.error;
      if (a.error) throw a.error;
      return { users: u.data as U[], assigns: a.data as A[], me: me.data.user.id as string };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  const { users, assigns, me } = q.data!;
  const mentors = users.filter((u) => u.roles.includes("mentor"));
  const label = (id: string) => { const u = users.find((x) => x.id === id); return u ? u.full_name || u.email : id; };

  async function toggle(u: U, role: string) {
    const has = u.roles.includes(role);
    if (has && u.id === me && role === "admin") { toast.error("You can't remove your own admin role."); return; }
    const { error } = has
      ? await db.from("user_roles").delete().eq("user_id", u.id).eq("role", role)
      : await db.from("user_roles").insert({ user_id: u.id, role });
    if (error) { toast.error("Role change failed."); return; }
    toast.success(`${has ? "Removed" : "Granted"} ${role}.`); refresh();
  }
  async function assign(e: React.FormEvent) {
    e.preventDefault();
    const sid = student.trim();
    if (!mentor || !sid) { toast.error("Choose a mentor and enter a student ID."); return; }
    const { error } = await db.from("mentor_assignments").insert({ mentor_id: mentor, student_id: sid });
    if (error) { toast.error(error.code === "23503" ? "No student with that ID in the dataset." : error.code === "23505" ? "Already assigned." : "Assignment failed."); return; }
    setStudent(""); toast.success("Student assigned."); refresh();
  }
  async function unassign(a: A) {
    const { error } = await db.from("mentor_assignments").delete().eq("mentor_id", a.mentor_id).eq("student_id", a.student_id);
    error ? toast.error("Could not remove.") : refresh();
  }

  return (
    <>
      <PageHead eyebrow="Admin portal" title="Users & roles" />
      <div className="mb-12 overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="eyebrow text-left"><tr className="border-b border-border"><th className="p-3 font-normal">User</th><th className="p-3 font-normal">Joined</th>{ROLES.map((r) => <th key={r} className="p-3 font-normal capitalize">{r}</th>)}</tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3"><p>{u.full_name || "—"}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                {ROLES.map((r) => (
                  <td key={r} className="p-3">
                    <input type="checkbox" aria-label={`${r} role for ${u.email}`} checked={u.roles.includes(r)} disabled={u.id === me && r === "admin"} onChange={() => toggle(u, r)} className="h-4 w-4 accent-[var(--color-primary)]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-xl">Mentor assignments</h2>
      {mentors.length === 0 ? <EmptyState title="No mentors yet" body="Grant the mentor role to a user above first." /> : (
        <form onSubmit={assign} className="mb-6 flex max-w-2xl flex-wrap gap-3">
          <select value={mentor} onChange={(e) => setMentor(e.target.value)} aria-label="Mentor" className="border border-border bg-background px-3 py-2 text-sm">
            <option value="">Choose mentor…</option>
            {mentors.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
          </select>
          <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Student ID" aria-label="Student ID" maxLength={40} className="border border-border bg-background px-3 py-2 text-sm" />
          <button className="border border-foreground bg-foreground px-5 py-2 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground">Assign</button>
        </form>
      )}
      {assigns.length === 0 ? <p className="text-sm text-muted-foreground">No assignments yet.</p> : (
        <ul className="max-w-2xl divide-y divide-border border border-border text-sm">
          {assigns.map((a) => (
            <li key={a.mentor_id + a.student_id} className="flex items-center justify-between gap-4 px-4 py-2">
              <span><span className="font-mono">{a.student_id}</span> → {label(a.mentor_id)}</span>
              <button onClick={() => unassign(a)} className="text-xs text-gap hover:underline">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <AdminInvites />
    </>
  );
}
