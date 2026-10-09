import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field, inputCls, primaryBtn } from "@/components/auth/AuthLayout";
import { fetchRoles, homeFor } from "@/lib/auth";
import { cn } from "@/lib/utils";

const search = z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional(), redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in or create an account — SmartCareer" },
      { name: "description", content: "Sign in to SmartCareer to save your career profile, matches and roadmap to your account." },
      { property: "og:title", content: "Sign in — SmartCareer" },
      { property: "og:description", content: "Understand your skills, discover your career and build your future." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const email = z.string().trim().email("Enter a valid email address").max(255);
const strongPw = z.string().min(8, "Use at least 8 characters").max(72)
  .regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number");

function safePath(p?: string) {
  return p && p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/auth") ? p : undefined;
}

function AuthPage() {
  const { mode = "signin", redirect } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user && mode !== "forgot") goHome(data.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function goHome(uid: string) {
    const roles = await fetchRoles(uid);
    navigate({ to: safePath(redirect) ?? homeFor(roles), replace: true });
  }
  const setMode = (m: "signin" | "signup" | "forgot") => navigate({ to: "/auth", search: { mode: m, redirect }, replace: true });

  return (
    <AuthLayout>
      {mode !== "forgot" && (
        <div role="tablist" aria-label="Account" className="mb-7 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              className={cn("rounded-lg py-2 font-medium transition", mode === m ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
      )}
      <div key={mode} className="animate-page-in">
        {mode === "signin" && <SignIn onDone={goHome} onForgot={() => setMode("forgot")} />}
        {mode === "signup" && <SignUp onSignIn={() => setMode("signin")} />}
        {mode === "forgot" && <Forgot onBack={() => setMode("signin")} />}
      </div>
    </AuthLayout>
  );
}

function Password({ id, value, onChange, error, autoComplete, hint }: { id: string; value: string; onChange: (v: string) => void; error?: string | undefined; autoComplete: string; hint?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(inputCls, "pr-12")} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {hint}
    </div>
  );
}

function FormError({ msg }: { msg: string | null }) {
  return msg ? <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{msg}</p> : null;
}

function SignIn({ onDone, onForgot }: { onDone: (uid: string) => void; onForgot: () => void }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = z.object({ email, password: z.string().min(1, "Enter your password") }).safeParse(f);
    if (!r.success) { setErrs(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrs({}); setMsg(null); setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword(r.data);
    setBusy(false);
    if (error || !data.user) {
      // Neutral wording: never reveal whether the email has an account.
      setMsg(/confirm/i.test(error?.message ?? "") ? "Please confirm your email address first — check your inbox for the link." : "Those details didn't match. Check your email and password and try again.");
      return;
    }
    onDone(data.user.id);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your career journey.</p>
      </div>
      <FormError msg={msg} />
      <Field id="si-email" label="Email address" error={errs["email"]}>
        <input id="si-email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!errs["email"]} className={inputCls} />
      </Field>
      <Field id="si-pw" label="Password" error={errs["password"]}>
        <Password id="si-pw" autoComplete="current-password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errs["password"]} />
      </Field>
      <div className="flex justify-end">
        <button type="button" onClick={onForgot} className="text-sm text-primary underline-offset-4 hover:underline">Forgot password?</button>
      </div>
      <button disabled={busy} className={primaryBtn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
    </form>
  );
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function SignUp({ onSignIn }: { onSignIn: () => void }) {
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", consent: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const s = strength(f.password);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = z.object({
      name: z.string().trim().min(2, "Enter your full name").max(120),
      email, password: strongPw, confirm: z.string(),
      consent: z.literal(true, { message: "Please accept the terms and privacy notice" }),
    }).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" }).safeParse(f);
    if (!r.success) { setErrs(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrs({}); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: r.data.email, password: r.data.password,
      options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: r.data.name } },
    });
    setBusy(false);
    if (error) {
      setMsg(/password/i.test(error.message) ? error.message : "We couldn't create the account right now. Please try again in a moment.");
      return;
    }
    // Same message whether or not the email was already registered.
    setSent(true);
  }

  if (sent)
    return (
      <div className="space-y-4 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-gold" />
        <h1 className="font-display text-2xl">Check your email</h1>
        <p className="text-sm text-muted-foreground">If this address can be registered, we've sent a confirmation link to <b>{f.email}</b>. Open it to activate your account, then sign in.</p>
        <button onClick={onSignIn} className="text-sm text-primary underline-offset-4 hover:underline">Back to sign in</button>
      </div>
    );

  const bar = ["bg-destructive", "bg-destructive", "bg-gap", "bg-gap", "bg-strength", "bg-strength"][s];
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">New accounts start as Student accounts.</p>
      </div>
      <FormError msg={msg} />
      <Field id="su-name" label="Full name" error={errs["name"]}>
        <input id="su-name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!errs["name"]} className={inputCls} />
      </Field>
      <Field id="su-email" label="Email address" error={errs["email"]}>
        <input id="su-email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!errs["email"]} className={inputCls} />
      </Field>
      <Field id="su-pw" label="Password" error={errs["password"]}
        hint={<p className="text-xs text-muted-foreground">At least 8 characters with a letter and a number. Longer with symbols is stronger.</p>}>
        <Password id="su-pw" autoComplete="new-password" value={f.password} onChange={(v) => setF({ ...f, password: v })} error={errs["password"]} />
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden><div className={cn("h-full transition-all", bar)} style={{ width: `${(s / 5) * 100}%` }} /></div>
        <p className="sr-only" aria-live="polite">Password strength {s} of 5</p>
      </Field>
      <Field id="su-confirm" label="Confirm password" error={errs["confirm"]}>
        <Password id="su-confirm" autoComplete="new-password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} error={errs["confirm"]} />
      </Field>
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
          <span>I agree to the SmartCareer terms of use and privacy notice.</span>
        </label>
        {errs["consent"] && <p className="mt-1 text-xs text-destructive">{errs["consent"]}</p>}
      </div>
      <button disabled={busy} className={primaryBtn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Create account</button>
    </form>
  );
}

function Forgot({ onBack }: { onBack: () => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = email.safeParse(v);
    if (!r.success) { setErr(r.error.issues[0]?.message); return; }
    setErr(undefined); setBusy(true); setFail(false);
    const { error } = await supabase.auth.resetPasswordForEmail(r.data, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    // Rate limits / outages are real failures; never pretend the email went out.
    if (error && /rate|network|fetch|disabled/i.test(error.message)) { setFail(true); return; }
    setSent(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send a secure reset link.</p>
      </div>
      {sent ? (
        <p role="status" className="rounded-xl border border-strength/40 bg-strength/10 px-4 py-3 text-sm">If an account exists for that address, a password-reset link is on its way. It may take a few minutes.</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <FormError msg={fail ? "We couldn't send the reset email right now. Please try again later." : null} />
          <Field id="fp-email" label="Email address" error={err}>
            <input id="fp-email" type="email" autoComplete="email" value={v} onChange={(e) => setV(e.target.value)} aria-invalid={!!err} className={inputCls} />
          </Field>
          <button disabled={busy} className={primaryBtn}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send reset link</button>
        </form>
      )}
      <button onClick={onBack} className="text-sm text-primary underline-offset-4 hover:underline">Back to sign in</button>
      <p className="text-xs text-muted-foreground">Need an account? <Link to="/auth" search={{ mode: "signup" }} className="text-primary hover:underline">Create one</Link></p>
    </div>
  );
}
