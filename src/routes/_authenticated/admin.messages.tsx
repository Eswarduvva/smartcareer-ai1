import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState, PageHead } from "@/components/kit";
import { db } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => ({ meta: [{ title: "Feedback & support — SmartCareer" }, { name: "description", content: "Contact messages and feedback from users." }, { property: "og:title", content: "Feedback & support — SmartCareer" }, { property: "og:description", content: "Support inbox." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Messages,
});

type M = { id: string; kind: string; name: string; email: string; subject: string | null; message: string; rating: number | null; status: string; created_at: string };
const STATUSES = ["new", "in_progress", "resolved"] as const;

function Messages() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("open");
  const q = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await db.from("support_messages").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data as M[];
    },
  });
  if (q.isLoading) return <LoadingState />;
  if (q.error) return <ErrorState error={q.error} />;
  const list = q.data!.filter((m) => filter === "all" || (filter === "open" ? m.status !== "resolved" : m.status === "resolved"));

  async function setStatus(m: M, status: string) {
    const { error } = await db.from("support_messages").update({ status }).eq("id", m.id);
    error ? toast.error("Status not updated.") : qc.invalidateQueries({ queryKey: ["admin"] });
  }

  return (
    <>
      <PageHead eyebrow="Admin portal" title="Feedback & support">
        <div className="flex gap-2">
          {["open", "resolved", "all"].map((f) => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`border px-3 py-1.5 font-mono text-xs uppercase ${filter === f ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}>{f}</button>)}
        </div>
      </PageHead>
      {list.length === 0 ? <EmptyState title="No messages" body="Contact and feedback submissions appear here." /> : (
        <ul className="max-w-3xl space-y-3">
          {list.map((m) => (
            <li key={m.id} className="border border-border p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span><span className="eyebrow mr-2">{m.kind}</span>{m.name} · <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>{m.rating ? ` · rating ${m.rating}/5` : ""}</span>
                <span>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              {m.subject && <p className="mb-1 font-medium">{m.subject}</p>}
              <p className="whitespace-pre-wrap text-sm">{m.message}</p>
              <select value={m.status} onChange={(e) => setStatus(m, e.target.value)} aria-label="Status" className="mt-3 border border-border bg-background px-2 py-1 text-xs">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
