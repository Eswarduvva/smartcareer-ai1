import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isPreviewData } from "@/lib/api/client";
import { SCORE_MAX } from "@/lib/skills";

export function Tile({
  className,
  children,
  label,
  aside,
}: {
  className?: string | undefined;
  children: ReactNode;
  label?: string | undefined;
  aside?: ReactNode;
}) {
  return (
    <section className={cn("relative flex flex-col border border-border bg-card p-5", className)}>
      {(label || aside) && (
        <header className="mb-4 flex items-baseline justify-between gap-4">
          {label && <h2 className="eyebrow">{label}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Big({ value, unit, tone }: { value: string; unit?: string; tone?: "strength" | "gap" | "primary" }) {
  return (
    <div
      className={cn(
        "num text-5xl font-medium leading-none md:text-6xl",
        tone === "strength" && "text-strength",
        tone === "gap" && "text-gap",
        tone === "primary" && "text-primary",
      )}
    >
      {value}
      {unit && <span className="ml-1 text-xl text-muted-foreground">{unit}</span>}
    </div>
  );
}

export function Meter({ value, tone = "strength", max = SCORE_MAX }: { value: number; tone?: "strength" | "gap" | "primary"; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1 w-full bg-muted">
      <div
        className={cn("h-full transition-[width] duration-700", tone === "strength" && "bg-strength", tone === "gap" && "bg-gap", tone === "primary" && "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PreviewBadge() {
  if (!isPreviewData) return null;
  return (
    <span
      title="VITE_API_BASE_URL is not set, so illustrative preview records are shown instead of your database."
      className="inline-flex items-center gap-2 border border-gap/50 bg-gap-soft/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gap" />
      Preview data — API not connected
    </span>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-2xl font-medium md:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid gap-3 p-8 md:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-32 animate-pulse border border-border bg-muted/60" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const router = useRouter();
  const msg = error instanceof Error ? error.message : "Something went wrong.";
  return (
    <div role="alert" className="mx-auto max-w-lg border border-destructive/40 p-8">
      <p className="eyebrow mb-2 text-destructive">Data unavailable</p>
      <p className="mb-1 text-lg">{msg}</p>
      <p className="mb-6 text-sm text-muted-foreground">Check that the SmartCareer API is running and allows requests from this site.</p>
      <button onClick={() => router.invalidate()} className="border border-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-foreground hover:text-background">
        Retry
      </button>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="border border-dashed border-border p-10 text-center">
      <p className="font-mono text-sm">{title}</p>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}

export function StudentNotFound() {
  return (
    <div className="p-10">
      <EmptyState title="No student with that ID" body="The record may not exist in the database." />
      <div className="mt-6 text-center">
        <Link to="/students" className="font-mono text-xs uppercase tracking-wider text-primary underline-offset-4 hover:underline">
          Back to students
        </Link>
      </div>
    </div>
  );
}
