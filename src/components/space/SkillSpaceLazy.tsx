import { lazy, Suspense, useEffect, useState } from "react";
import type { SkillSpaceProps } from "./SkillSpace";

const SkillSpace = lazy(() => import("./SkillSpace"));

function Fallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="eyebrow animate-pulse">Rendering space…</span>
    </div>
  );
}

/** Client-only, lazily loaded 3D skill space. */
export function SkillSpaceLazy(props: SkillSpaceProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Fallback />;
  return (
    <Suspense fallback={<Fallback />}>
      <SkillSpace {...props} />
    </Suspense>
  );
}
