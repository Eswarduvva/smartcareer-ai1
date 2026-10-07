import type { SpaceNode } from "./SkillSpace";
import { GAP_THRESHOLD, STRONG_THRESHOLD } from "@/lib/skills";

export function bandOf(score: number) {
  if (score >= STRONG_THRESHOLD) return { label: "Strength", cls: "text-strength" };
  if (score < GAP_THRESHOLD) return { label: "Priority gap", cls: "text-gap" };
  return { label: "Developing", cls: "text-primary" };
}

export function DetailPanel({ node, onClose }: { node: SpaceNode; onClose: () => void }) {
  const score = node.display ?? Math.round(node.value * 100);
  const band = bandOf(score);
  return (
    <aside className="animate-in fade-in slide-in-from-right-2 absolute right-3 top-3 w-60 border border-border bg-background/95 p-4 duration-200">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="eyebrow">{node.group}</p>
        <button onClick={onClose} aria-label="Close" className="font-mono text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <p className="mb-1 text-lg font-medium leading-tight">{node.label}</p>
      <p className="num text-4xl font-medium">{score}</p>
      <div className="my-3 h-px bg-border" />
      <p className={`font-mono text-xs uppercase tracking-wider ${band.cls}`}>{band.label}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Bands are application rules: strength ≥ {STRONG_THRESHOLD}, gap &lt; {GAP_THRESHOLD}.
      </p>
    </aside>
  );
}
