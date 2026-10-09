import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, inputCls, primaryBtn } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — SmartCareer" },
      { name: "description", content: "Set a new password for your SmartCareer account." },
      { property: "og:title", content: "Reset password — SmartCareer" },
      { property: "og:description", content: "Securely choose a new SmartCareer password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [pw, setPw] = useState({ a: "", b: "" });
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The provider validates the link token and creates a recovery session.
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "PASSWORD_RECOVERY") setStatus("ready"); });
    const hasToken = /type=recovery|access_token|code=/.test(window.location.hash + window.location.search);
    const t = window.setTimeout(async () => {
      const { data: s } = await supabase.auth.getSession();
      setStatus((cur) => (cur === "checking" ? (s.session && hasToken ? "ready" : "invalid") : cur));
    }, 1500);
    return () => { data.subscription.unsubscribe(); window.clearTimeout(t); };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number").safeParse(pw.a);
    if (!r.success) return setErr(r.error.issues[0]?.message);
    if (pw.a !== pw.b) return setErr("Passwords don't match");
    setErr(undefined); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    setBusy(false);
    if (error) return setErr(error.message.includes("same") ? "Choose a password different from your old one." : "The password couldn't be updated. Your link may have expired — request a new one.");
    setStatus("done");
    await supabase.auth.signOut();
  }

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl tracking-tight">Choose a new password</h1>
      <div className="mt-6">
        {status === "checking" && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking your reset link…</p>}
        {status === "invalid" && (
          <div className="space-y-4">
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">This reset link is invalid or has expired.</p>
            <Link to="/auth" search={{ mode: "forgot" }} className="text-sm text-primary hover:underline">Request a new link</Link>
          </div>
        )}
        {status === "done" && (
          <div className="space-y-4">
            <p role="status" className="rounded-xl border border-strength/40 bg-strength/10 px-4 py-3 text-sm">Your password has been updated. Please sign in with your new password.</p>
            <button onClick={() => navigate({ to: "/auth", replace: true })} className={primaryBtn}>Go to sign in</button>
          </div>
        )}
        {status === "ready" && (
          <form onSubmit={submit} noValidate className="space-y-5">
            <Field id="rp-a" label="New password" error={err}>
              <input id="rp-a" type="password" autoComplete="new-password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} className={inputCls} />
            </Field>
            <Field id="rp-b" label="Confirm new password">
              <input id="rp-b" type="password" autoComplete="new-password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} className={inputCls} />
            </Field>
            <button disabled={busy} className={primaryBtn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Update password</button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
