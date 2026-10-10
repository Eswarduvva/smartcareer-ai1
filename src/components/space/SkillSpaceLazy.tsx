import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import type { SkillSpaceProps } from "./SkillSpace";
import { Legend } from "./Legend";
import { DetailPanel } from "./DetailPanel";
import { Fallback2D } from "./Fallback2D";

const SkillSpace = lazy(() => import("./SkillSpace"));

function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex h-full w-full items-center justify-center skeleton-cell">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Loading skill map…</span>
    </div>
  );
}

/** If the 3D scene fails to load or render, fall back to the 2D map instead of a broken panel. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Client-only, lazily loaded 3D skill space with legend, detail panel, empty state and 2D fallback. */
export function SkillSpaceLazy(props: Omit<SkillSpaceProps, "selected" | "onSelect" | "mobile" | "reduced">) {
  const [env, setEnv] = useState<{ gl: boolean; mobile: boolean; reduced: boolean } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    setEnv({
      gl: hasWebGL(),
      mobile: window.matchMedia("(max-width: 768px)").matches,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);
  const node = props.nodes.find((n) => n.id === selected) ?? null;
  const showChrome = props.variant === "data";

  if (!props.nodes.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm font-medium">No skill scores to map yet</p>
        <p className="max-w-xs text-xs text-muted-foreground">Add skill ratings to the profile to see the career intelligence map.</p>
      </div>
    );
  }

  const flat = <Fallback2D {...props} selected={selected} onSelect={setSelected} />;
  return (
    <div className="relative h-full w-full">
      {!env ? (
        <Loading />
      ) : !env.gl ? (
        flat
      ) : (
        <SceneBoundary fallback={flat}>
          <Suspense fallback={<Loading />}>
            <SkillSpace {...props} mobile={env.mobile} reduced={env.reduced} selected={selected} onSelect={setSelected} />
          </Suspense>
        </SceneBoundary>
      )}
      {showChrome && <Legend groups={props.groups} hasDestination={!!props.destination} />}
      {showChrome && node && <DetailPanel node={node} onClose={() => setSelected(null)} />}
      {showChrome && !node && env?.gl && (
        <p className="pointer-events-none absolute right-4 top-4 hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:block">
          Hover to inspect · click to select
        </p>
      )}
    </div>
  );
}
