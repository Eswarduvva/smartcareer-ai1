import { PALETTE, useIsDark } from "./SkillSpace";

export function Legend({ groups, hasDestination }: { groups: string[]; hasDestination: boolean }) {
  const dark = useIsDark();
  const c = dark ? PALETTE.dark : PALETTE.light;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-4 gap-y-1.5 bg-background/75 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur-[2px]">
      {groups.map((g, i) => (
        <span key={g} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: c.groups[i % c.groups.length] }} />
          {g}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border" style={{ borderColor: c.gap }} /> Gap
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.ink }} /> Larger = stronger
      </span>
      {hasDestination && (
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rotate-45" style={{ background: c.accent }} /> Career destination
        </span>
      )}
    </div>
  );
}
