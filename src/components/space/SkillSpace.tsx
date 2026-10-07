import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface SpaceNode {
  id: string;
  label: string;
  group: string;
  /** 0..1 normalized strength */
  value: number;
  weak?: boolean;
  /** raw score shown on hover */
  display?: number;
}

export interface SkillSpaceProps {
  nodes: SpaceNode[];
  groups: string[];
  destination?: string | null | undefined;
  /** abstract = landing hero: fewer labels, slower drift */
  variant?: "data" | "abstract";
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  mobile?: boolean;
  reduced?: boolean;
}

// three.js can't parse oklch; these hex values mirror the CSS tokens.
export const PALETTE = {
  light: {
    bg: "#f5f3ee", ink: "#1b1f24", accent: "#1f6f6b", strong: "#2d5a3d", gap: "#c98a2b", line: "#a9a497", muted: "#8b877c",
    groups: ["#1f6f6b", "#3d5a80", "#8a6a3b", "#4f6b4a"],
  },
  dark: {
    bg: "#0e1216", ink: "#c9d3dc", accent: "#5fb3c4", strong: "#a0c49d", gap: "#d9a04a", line: "#3a4652", muted: "#6b7884",
    groups: ["#5fb3c4", "#8aa4d6", "#c9b48a", "#a0c49d"],
  },
};
export type Colors = typeof PALETTE.light;

export function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/** Cluster centres sit at different depths so the scene reads front → back. */
const CLUSTERS: [number, number, number][] = [
  [-2.6, 0.2, 1.1], // front-left
  [2.5, 0.9, -0.6], // mid-right
  [-1.6, 1.5, -2.4], // back-left
  [2.0, -1.0, 1.6], // front-right
];
const DEST = new THREE.Vector3(0.4, 2.7, -3.6);

type Placed = SpaceNode & { pos: THREE.Vector3; gi: number; size: number };

function layout(nodes: SpaceNode[], groups: string[]): { placed: Placed[]; hubs: THREE.Vector3[] } {
  const hubs = groups.map((_, i) => new THREE.Vector3(...CLUSTERS[i % CLUSTERS.length]!));
  const placed = nodes.map((n) => {
    const gi = Math.max(0, groups.indexOf(n.group));
    const peers = nodes.filter((m) => m.group === n.group);
    const idx = peers.indexOf(n);
    // golden-angle spiral around the hub; spacing grows with cluster size so nodes don't collide
    const ga = idx * 2.39996;
    const r = 0.55 + Math.sqrt(idx) * 0.42;
    const hub = hubs[gi]!;
    const pos = new THREE.Vector3(
      hub.x + Math.cos(ga) * r,
      hub.y + Math.sin(ga) * r * 0.75,
      hub.z + Math.sin(ga * 0.7) * 0.5,
    );
    return { ...n, gi, pos, size: 0.1 + n.value * 0.14 };
  });
  return { placed, hubs };
}

function curve(a: THREE.Vector3, b: THREE.Vector3, lift = 0.8) {
  const mid = a.clone().lerp(b, 0.5);
  mid.y += lift;
  return new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(24);
}

function Rig({ children, reduced, focus }: { children: React.ReactNode; reduced: boolean; focus: THREE.Vector3 | null }) {
  const g = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3(0, 0.6, 0));
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!g.current) return;
    const k = 1 - Math.exp(-2.5 * dt);
    const px = reduced ? 0 : state.pointer.x;
    const py = reduced ? 0 : state.pointer.y;
    g.current.rotation.x += (py * -0.07 - g.current.rotation.x) * k;
    g.current.rotation.y += (px * 0.14 - g.current.rotation.y) * k;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const baseZ = 10.5 / Math.min(1, Math.pow(aspect, 0.8));
    const z = focus ? baseZ * 0.82 : baseZ;
    const cam = state.camera.position;
    const kk = reduced ? 1 : k;
    cam.x += (px * 0.7 + (focus ? focus.x * 0.25 : 0) - cam.x) * kk;
    cam.y += (1.6 + py * 0.35 - cam.y) * kk;
    cam.z += (z - cam.z) * kk;
    const target = focus ? focus.clone().multiplyScalar(0.45).setY(focus.y * 0.4 + 0.4) : new THREE.Vector3(0, 0.6, -0.4);
    look.current.lerp(target, kk);
    state.camera.lookAt(look.current);
  });
  return <group ref={g}>{children}</group>;
}

const Label = ({ children, tone = "text-foreground", strong = false }: { children: React.ReactNode; tone?: string; strong?: boolean }) => (
  <div
    className={`whitespace-nowrap border border-border bg-background/90 px-1.5 py-0.5 font-mono text-[11px] leading-tight ${tone} ${strong ? "shadow-sm" : ""}`}
  >
    {children}
  </div>
);

const SkillNode = memo(function SkillNode({
  n, c, state, onHover, onClick,
}: {
  n: Placed;
  c: Colors;
  state: "idle" | "hover" | "selected" | "dim";
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const tone = c.groups[n.gi % c.groups.length]!;
  useFrame((_, raw) => {
    const k = 1 - Math.exp(-9 * Math.min(raw, 0.05));
    if (g.current) {
      const s = state === "selected" ? 1.45 : state === "hover" ? 1.3 : 1;
      g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
      const tz = state === "selected" ? n.pos.z + 0.8 : n.pos.z;
      g.current.position.z += (tz - g.current.position.z) * k;
    }
    if (mat.current) {
      const o = state === "dim" ? 0.22 : 1;
      mat.current.opacity += (o - mat.current.opacity) * k;
    }
  });
  const showLabel = state === "hover" || state === "selected";
  return (
    <group ref={g} position={n.pos}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(n.id); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = ""; }}
        onClick={(e) => { e.stopPropagation(); onClick(n.id); }}
      >
        <sphereGeometry args={[n.size, 28, 28]} />
        <meshStandardMaterial ref={mat} color={tone} roughness={0.5} metalness={0.05} transparent opacity={1} />
      </mesh>
      {n.weak && (
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[n.size * 1.65, 0.012, 8, 48]} />
          <meshBasicMaterial color={c.gap} transparent opacity={state === "dim" ? 0.25 : 0.95} />
        </mesh>
      )}
      <Html center position={[0, n.size + 0.3, 0]} style={{ pointerEvents: "none", opacity: showLabel ? 1 : 0, transition: "opacity 180ms" }} zIndexRange={[20, 0]}>
        <Label strong>
          {n.label}
          <span className={`ml-2 ${n.weak ? "text-gap" : "text-strength"}`}>{n.display ?? Math.round(n.value * 100)}</span>
        </Label>
      </Html>
    </group>
  );
});

function Scene({ nodes, groups, destination, variant, reduced = false, selected = null, onSelect, mobile }: SkillSpaceProps) {
  const dark = useIsDark();
  const c = dark ? PALETTE.dark : PALETTE.light;
  const { placed, hubs } = useMemo(() => layout(nodes, groups), [nodes, groups]);
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? selected;
  const activeNode = placed.find((p) => p.id === active) ?? null;
  const focusNode = placed.find((p) => p.id === selected) ?? null;
  const top = useMemo(() => [...placed].sort((a, b) => b.value - a.value).slice(0, 3).map((p) => p.id), [placed]);
  const destPaths = useMemo(() => placed.filter((p) => top.includes(p.id)).map((p) => ({ id: p.id, pts: curve(p.pos, DEST, 1.1) })), [placed, top]);

  const nodeState = (p: Placed) => {
    if (p.id === selected) return "selected" as const;
    if (p.id === hover) return "hover" as const;
    if (activeNode && p.gi !== activeNode.gi) return "dim" as const;
    return "idle" as const;
  };

  return (
    <>
      {!mobile && <fog attach="fog" args={[c.bg, 17, 36]} />}
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 6]} intensity={1.3} />
      <directionalLight position={[-6, 2, -6]} intensity={0.5} color={c.accent} />
      <Rig reduced={reduced} focus={focusNode?.pos ?? null}>
        {/* student anchor */}
        <group>
          <mesh>
            <icosahedronGeometry args={[0.46, 1]} />
            <meshStandardMaterial color={c.ink} flatShading roughness={0.35} />
          </mesh>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.78, 0.006, 6, 96]} />
            <meshBasicMaterial color={c.ink} transparent opacity={0.5} />
          </mesh>
          <Html center position={[0, -0.85, 0]} style={{ pointerEvents: "none" }}>
            <span className="eyebrow whitespace-nowrap text-foreground">Student</span>
          </Html>
        </group>

        {/* ground plane grid for depth */}
        <gridHelper args={[22, 22, c.line, c.line]} position={[0, -2.4, -1]} material-transparent material-opacity={dark ? 0.35 : 0.45} />

        {/* student → cluster hubs */}
        {hubs.map((h, i) => (
          <group key={`hub-${i}`}>
            <Line points={curve(new THREE.Vector3(), h, 0.3)} color={c.groups[i]!} lineWidth={1} transparent opacity={activeNode && activeNode.gi !== i ? 0.15 : 0.55} />
            {variant === "data" && !mobile && (
              <Html center position={[h.x, h.y - 1.35, h.z]} style={{ pointerEvents: "none", opacity: activeNode && activeNode.gi !== i ? 0.3 : 1, transition: "opacity 200ms" }}>
                <span className="eyebrow whitespace-nowrap" style={{ color: c.groups[i] }}>{groups[i]}</span>
              </Html>
            )}
          </group>
        ))}

        {/* hub → skill */}
        {placed.map((p) => (
          <Line
            key={`l-${p.id}`}
            points={[hubs[p.gi]!.toArray(), p.pos.toArray()]}
            color={p.id === active ? c.accent : c.line}
            lineWidth={p.id === active ? 1.6 : 0.7}
            transparent
            opacity={activeNode && p.gi !== activeNode.gi ? 0.15 : 0.8}
            dashed={!!p.weak}
            dashSize={0.07}
            gapSize={0.07}
          />
        ))}

        {placed.map((p) => (
          <SkillNode key={p.id} n={p} c={c} state={nodeState(p)} onHover={setHover} onClick={(id) => onSelect?.(id === selected ? null : id)} />
        ))}

        {destination && (
          <group>
            {destPaths.map((d) => (
              <Line key={`d-${d.id}`} points={d.pts} color={c.accent} lineWidth={d.id === active ? 2 : 1.1} transparent opacity={activeNode && d.id !== active ? 0.2 : 0.75} dashed dashSize={0.14} gapSize={0.1} />
            ))}
            <mesh position={DEST}>
              <octahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial color={c.accent} roughness={0.25} metalness={0.2} flatShading />
            </mesh>
            <mesh position={DEST} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.65, 0.008, 6, 64]} />
              <meshBasicMaterial color={c.accent} />
            </mesh>
            <Html center position={[DEST.x, DEST.y + 0.75, DEST.z]} style={{ pointerEvents: "none" }}>
              <div className="text-center">
                <p className="eyebrow mb-1" style={{ color: c.accent }}>Destination</p>
                <Label tone="text-primary">{destination}</Label>
              </div>
            </Html>
          </group>
        )}
      </Rig>
    </>
  );
}

export default function SkillSpace(props: SkillSpaceProps) {
  const nodes = props.mobile && props.nodes.length > 10 ? props.nodes.filter((_, i) => i % 2 === 0) : props.nodes;
  return (
    <Canvas
      dpr={props.mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 1.6, 10.5], fov: 40 }}
      gl={{ antialias: !props.mobile, alpha: true, powerPreference: "high-performance" }}
      frameloop={props.reduced ? "demand" : "always"}
      onPointerMissed={() => props.onSelect?.(null)}
    >
      <Scene {...props} nodes={nodes} />
    </Canvas>
  );
}
