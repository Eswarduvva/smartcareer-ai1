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
      title="Preview mode: illustrative records only. They are never mixed with real data."
      className="inline-flex items-center gap-2 border border-gap/50 bg-gap-soft/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gap" />
      Preview data — Supabase not connected
    </span>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 pb-2">
      <div>
        <p className="eyebrow mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-primary" />
          {eyebrow}
        </p>
        <h1 className="text-3xl font-medium tracking-tight md:text-[2.6rem] md:leading-[1.05]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="p-2" aria-busy="true">
      <div className="mb-10 space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-9 w-72" />
      </div>
      <div className="grid gap-px border border-border bg-border md:grid-cols-3">
        <div className="skeleton-cell h-72 md:col-span-2" />
        <div className="skeleton-cell h-72" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-cell h-36" />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const router = useRouter();
  const notFound = error instanceof Error && /404|not found/i.test(error.message);
  return (
    <div role="alert" className="mx-auto mt-10 max-w-xl border-l-2 border-gap pl-8 py-4">
      <p className="eyebrow mb-4 text-gap">Connection</p>
      <h2 className="mb-3 text-2xl font-medium tracking-tight">
        {notFound ? "This data could not be found" : "Unable to connect to SmartCareer data"}
      </h2>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        The student database didn't respond. Nothing has been replaced with sample data — try again in a moment.
      </p>
      <button
        onClick={() => router.invalidate()}
        className="group inline-flex items-center gap-3 border border-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
      >
        <span className="inline-block transition-transform group-hover:rotate-180">↻</span> Retry
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
