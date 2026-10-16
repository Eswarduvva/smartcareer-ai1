import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ErrorState, LoadingState, PageHead } from "@/components/kit";
import { claimFirstAdmin, getAdminSetupStatus } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/_authenticated/setup-admin")({
  head: () => ({
    meta: [
      { title: "First admin setup — SmartCareer" },
      { name: "description", content: "One-time setup for the SmartCareer project owner." },
      { property: "og:title", content: "First admin setup — SmartCareer" },
      { property: "og:description", content: "One-time administrator setup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell><Setup /></AppShell>,
});

function Step({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 py-2">
      <span aria-hidden className={done ? "text-strength" : "text-muted-foreground"}>{done ? "✓" : "○"}</span>
      <span className={done ? "text-muted-foreground" : ""}>{children}</span>
    </li>
  );
}

function Setup() {
  const fetchStatus = useServerFn(getAdminSetupStatus);
  const claim = useServerFn(claimFirstAdmin);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["admin-setup"], queryFn: () => fetchStatus() });
  if (q.isLoading) return <LoadingState />;
  if (q.error || !q.data) return <ErrorState error={q.error} />;
  const s = q.data;

  async function go() {
    setBusy(true);
    const r = await claim();
    setBusy(false);
    if (!r.ok) { toast.error(r.reason); q.refetch(); return; }
    toast.success(r.reason);
    qc.clear();
    navigate({ to: "/admin" });
  }

  return (
    <div className="max-w-2xl">
      <PageHead eyebrow="One-time setup" title="Create the first administrator" />
      {s.adminExists ? (
        <p className="rounded-lg border border-border bg-card p-6 text-sm">
          An administrator already exists, so this setup is closed. Ask an admin to invite you from Users &amp; roles.
        </p>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Only the project owner can do this, and only once. Everyone else stays a student.
          </p>
          <ol className="mt-4 text-sm">
            <Step done={s.ownerConfigured}>The project owner's email is saved in the project's backend settings.</Step>
            <Step done={s.isOwner}>You're signed in with that exact email.</Step>
            <Step done={s.emailConfirmed}>You've confirmed that email address from the sign-up message.</Step>
          </ol>
          <button
            onClick={go}
            disabled={busy || !(s.ownerConfigured && s.isOwner && s.emailConfirmed)}
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Assigning…" : "Make me the administrator"}
          </button>
        </div>
      )}
    </div>
  );
}
