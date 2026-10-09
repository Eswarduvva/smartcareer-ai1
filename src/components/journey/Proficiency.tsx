import { useEffect, useState } from "react";
import { SCORE_MAX, STRONG_THRESHOLD } from "@/lib/skills";
import { cn } from "@/lib/utils";

export function Proficiency({ value, label, tone = "primary", target = true }: { value: number; label: string; tone?: "primary" | "strength" | "gap"; target?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const pct = Math.max(0, Math.min(100, value / SCORE_MAX * 100));
  return (
    <div className="relative my-2 h-2.5 rounded-full bg-muted" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={SCORE_MAX} aria-valuenow={value} aria-valuetext={`${value} of ${SCORE_MAX}${target ? `; target ${STRONG_THRESHOLD}` : ""}`}>
      <div className={cn("h-full rounded-full transition-[width] duration-1000 motion-reduce:transition-none", tone === "strength" ? "bg-strength" : tone === "gap" ? "bg-gap" : "bg-primary")} style={{ width: `${ready ? pct : 0}%` }} />
      {target && <span aria-hidden className="absolute -top-1 h-4.5 w-px bg-foreground/60" style={{ left: `${STRONG_THRESHOLD / SCORE_MAX * 100}%` }} />}
    </div>
  );
}