import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { db } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/mentor/review/$id")({
  head: ({ params }) => ({ meta: [{ title: `Review ${params.id} — SmartCareer` }, { name: "description", content: "Skill assessment, career guidance and roadmap review for an assigned student." }, { property: "og:title", content: "Student review — SmartCareer" }, { property: "og:description", content: "Mentor feedback and roadmap review." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Review,
});

type Note = { id: string; mentor_id: string; category: string; note: string; created_at: string };
const CATS = [["skills", "Skill assessment"], ["career", "Career guidance"], ["roadmap", "Roadmap review"], ["general", "General"]] as const;

function Review() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [cat, setCat] = useState<string>("skills");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const key = ["mentor", "feedback", id];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      const [{ data: u }, s, f] = await Promise.all([
        db.auth.getUser(),
        db.from("students").select("student_id").eq("student_id", id).maybeSingle(),
        db.from("mentor_feedback").select("id, mentor_id, category, note, created_at").eq("student_id", id).order("created_at", { ascending: false }),
      ]);
      if (s.error) throw s.error;
      if (f.error) throw f.error;
      return { me: u.user.id as string, allowed: !!s.data, notes: f.data as Note[] };
    },
  });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  if (!q.data!.allowed) return <EmptyState title="Student not available" body="This student isn't assigned to you, or doesn't exist." />;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (v.length < 2 || v.length > 2000) { toast.error("Feedback must be 2–2000 characters."); return; }
    setBusy(true);
    const { error } = await db.from("mentor_feedback").insert({ student_id: id, category: cat, note: v });
    setBusy(false);
    if (error) { toast.error("Feedback was not saved. Please try again."); return; }
    setText(""); toast.success("Feedback saved."); qc.invalidateQueries({ queryKey: key });
  }
  async function remove(nid: string) {
    const { error } = await db.from("mentor_feedback").delete().eq("id", nid);
    error ? toast.error("Could not delete.") : qc.invalidateQueries({ queryKey: key });
  }

  const links = [["/students/$id/skills", "Skills"], ["/students/$id/match", "Career match"], ["/students/$id/gaps", "Skill gaps"], ["/students/$id/roadmap", "Roadmap"]] as const;
  return (
    <>
      <PageHead eyebrow="Mentor portal · review" title={id}>
        <Link to="/mentor" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">← Assigned students</Link>
      </PageHead>
      <div className="mb-10 flex flex-wrap gap-3">
        {links.map(([to, l]) => <Link key={to} to={to} params={{ id }} className="border border-border px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-foreground">{l}</Link>)}
      </div>
      <form onSubmit={add} className="mb-10 max-w-2xl space-y-3">
        <h2 className="text-lg">Add feedback</h2>
        <div className="flex flex-wrap gap-2">
          {CATS.map(([v, l]) => <button type="button" key={v} aria-pressed={cat === v} onClick={() => setCat(v)} className={`border px-3 py-1.5 text-xs ${cat === v ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{l}</button>)}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={2000} aria-label="Feedback" className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button disabled={busy} className="border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground disabled:opacity-50">Save feedback</button>
      </form>
      <h2 className="mb-4 text-lg">Feedback history</h2>
      {q.data!.notes.length === 0 ? <EmptyState title="No feedback yet" /> : (
        <ul className="max-w-2xl space-y-3">
          {q.data!.notes.map((n) => (
            <li key={n.id} className="border border-border p-4">
              <div className="mb-2 flex justify-between gap-4 text-xs text-muted-foreground">
                <span className="eyebrow">{CATS.find((c) => c[0] === n.category)?.[1]}</span>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{n.note}</p>
              {n.mentor_id === q.data!.me && <button onClick={() => remove(n.id)} className="mt-2 text-xs text-gap hover:underline">Delete</button>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
