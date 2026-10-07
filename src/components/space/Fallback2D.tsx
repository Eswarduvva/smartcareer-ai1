import type { SkillSpaceProps } from "./SkillSpace";
import { PALETTE, useIsDark } from "./SkillSpace";

/** Polished 2D radial view used when WebGL is unavailable. */
export function Fallback2D({ nodes, groups, destination, selected, onSelect }: SkillSpaceProps) {
  const dark = useIsDark();
  const c = dark ? PALETTE.dark : PALETTE.light;
  const cx = 200, cy = 200;
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Skill map">
      <circle cx={cx} cy={cy} r={150} fill="none" stroke={c.line} strokeDasharray="2 4" />
      {nodes.map((n, i) => {
        const gi = Math.max(0, groups.indexOf(n.group));
        const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const r = 160 - n.value * 90;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        const s = 4 + n.value * 7;
        return (
          <g key={n.id} onClick={() => onSelect?.(n.id === selected ? null : n.id)} className="cursor-pointer">
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={c.line} strokeWidth={0.6} />
            <circle cx={x} cy={y} r={s} fill={c.groups[gi % c.groups.length]} opacity={selected && selected !== n.id ? 0.35 : 1} />
            {n.weak && <circle cx={x} cy={y} r={s + 4} fill="none" stroke={c.gap} />}
            <title>{`${n.label}: ${n.display ?? Math.round(n.value * 100)}`}</title>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={12} fill={c.ink} />
      {destination && (
        <text x={cx} y={30} textAnchor="middle" className="font-mono" fontSize={11} fill={c.accent}>
          → {destination}
        </text>
      )}
    </svg>
  );
}
