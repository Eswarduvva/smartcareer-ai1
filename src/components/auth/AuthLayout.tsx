import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import art from "@/assets/auth-growth.jpg";
import { ThemeSelector } from "@/components/ThemeSelector";

export const TAGLINE = "Understand Your Skills. Discover Your Career. Build Your Future.";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={art} alt="A student climbing glowing steps toward a bright city" width={1024} height={1408} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <Link to="/" className="font-display text-3xl tracking-tight">Smart<span className="text-gold-gradient italic">Career</span></Link>
          <p className="mt-4 max-w-md font-display text-2xl leading-snug text-foreground/90">{TAGLINE}</p>
        </div>
      </aside>
      <main className="relative flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-tight lg:invisible">Smart<span className="text-gold-gradient italic">Career</span></Link>
          <ThemeSelector />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <p className="mb-8 text-sm text-muted-foreground lg:hidden">{TAGLINE}</p>
          <div className="glass animate-page-in rounded-2xl p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string | undefined; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} className="text-xs text-destructive">{error}</p> : hint}
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 aria-[invalid=true]:border-destructive";
export const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60";
