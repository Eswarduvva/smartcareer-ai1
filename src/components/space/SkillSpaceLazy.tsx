import { lazy, Suspense, useEffect, useState } from "react";
import type { SkillSpaceProps } from "./SkillSpace";
import { Legend } from "./Legend";
import { DetailPanel } from "./DetailPanel";
import { Fallback2D } from "./Fallback2D";

const SkillSpace = lazy(() => import("./SkillSpace"));

function Loading() {
  return (
    <div aria-hidden className="h-full w-full skeleton-cell opacity-40" />
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Client-only, lazily loaded 3D skill space with legend, detail panel and 2D fallback. */
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

  return (
    <div className="relative h-full w-full">
      {!env ? (
        <Loading />
      ) : !env.gl ? (
        <Fallback2D {...props} selected={selected} onSelect={setSelected} />
      ) : (
        <Suspense fallback={<Loading />}>
          <SkillSpace {...props} mobile={env.mobile} reduced={env.reduced} selected={selected} onSelect={setSelected} />
        </Suspense>
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
