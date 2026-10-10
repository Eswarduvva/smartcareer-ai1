import { useState } from "react";
import { z } from "zod";
import { db } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000, "Message is too long (max 2000)"),
  rating: z.number().int().min(1).max(5).optional(),
});

const field = "w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function SupportForm({ kind }: { kind: "contact" | "feedback" }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rating, setRating] = useState<number | undefined>();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = schema.safeParse({
      name: f.get("name"),
      email: f.get("email"),
      subject: (f.get("subject") as string) || undefined,
      message: f.get("message"),
      rating: kind === "feedback" ? rating : undefined,
    });
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setState("sending");
    const { data } = await supabase.auth.getSession();
    const { error } = await db.from("support_messages").insert({ kind, ...r.data, user_id: data.session?.user.id ?? null });
    if (error) { console.error(error); setState("failed"); return; }
    (e.target as HTMLFormElement).reset();
    setRating(undefined);
    setState("sent");
  }

  if (state === "sent")
    return (
      <div role="status" className="border-l-2 border-strength py-3 pl-6">
        <p className="font-medium text-foreground">Thank you — your {kind === "contact" ? "message" : "feedback"} was received.</p>
        <p className="mt-1 text-muted-foreground">It is stored for the SmartCareer team to review. No email confirmation is sent yet.</p>
        <button className="mt-4 font-mono text-xs uppercase tracking-wider text-primary hover:underline" onClick={() => setState("idle")}>Send another</button>
      </div>
    );

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-gap">{errors[k]}</p>;
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="eyebrow mb-1 block">Name</span><input name="name" maxLength={100} className={field} />{err("name")}</label>
        <label className="block"><span className="eyebrow mb-1 block">Email</span><input name="email" type="email" maxLength={255} className={field} />{err("email")}</label>
      </div>
      {kind === "contact" && <label className="block"><span className="eyebrow mb-1 block">Subject (optional)</span><input name="subject" maxLength={150} className={field} /></label>}
      {kind === "feedback" && (
        <fieldset>
          <legend className="eyebrow mb-1">Rating (optional)</legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} aria-pressed={rating === n} onClick={() => setRating(rating === n ? undefined : n)}
                className={`h-9 w-9 border font-mono text-sm ${rating === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{n}</button>
            ))}
          </div>
        </fieldset>
      )}
      <label className="block"><span className="eyebrow mb-1 block">{kind === "contact" ? "Message" : "Your feedback"}</span><textarea name="message" rows={6} maxLength={2000} className={field} />{err("message")}</label>
      {state === "failed" && <p role="alert" className="text-sm text-gap">Your message could not be sent. Nothing was saved — please try again.</p>}
      <button disabled={state === "sending"} className="border border-foreground bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-wider text-background hover:bg-transparent hover:text-foreground disabled:opacity-50">
        {state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
