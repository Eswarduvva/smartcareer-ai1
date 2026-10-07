import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
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
  /** abstract = landing hero: no labels until hover, slower drift */
  variant?: "data" | "abstract";
}

// three.js can't parse oklch; these hex values mirror the CSS tokens.
const PALETTE = {
  light: { ink: "#1b1f24", accent: "#1f6f6b", strong: "#2d5a3d", mid: "#5a8a5c", gap: "#c98a2b", line: "#b9b4a8" },
  dark: { ink: "#c9d3dc", accent: "#5fb3c4", strong: "#a0c49d", mid: "#5a8a5c", gap: "#d9a04a", line: "#3a4652" },
};

function useIsDark() {
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

function layout(nodes: SpaceNode[], groups: string[]) {
  const R = 3.1;
  return nodes.map((n) => {
    const gi = Math.max(0, groups.indexOf(n.group));
    const inGroup = nodes.filter((m) => m.group === n.group);
    const idx = inGroup.indexOf(n);
    const base = (gi / groups.length) * Math.PI * 2 + Math.PI / 4;
    const spread = Math.min(1.1, 0.22 * inGroup.length);
    const a = base + (inGroup.length > 1 ? (idx / (inGroup.length - 1) - 0.5) * spread : 0);
    // stronger skills sit closer to the student
    const r = R * (1.15 - n.value * 0.45) + (idx % 2) * 0.35;
    const y = ((idx % 3) - 1) * 0.55 + Math.sin(a * 2) * 0.3;
    return { ...n, pos: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r * 0.7) };
  });
}

function Rig({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!g.current) return;
    const tx = reduced ? 0 : state.pointer.y * -0.18;
    const ty = reduced ? 0 : state.pointer.x * 0.35;
    const k = 1 - Math.exp(-3 * dt);
    g.current.rotation.x += (tx - g.current.rotation.x) * k;
    g.current.rotation.y += (ty + (reduced ? 0 : state.clock.elapsedTime * 0.03) - g.current.rotation.y) * k;
    // fit the scene to the panel's shape: narrower panels pull the camera back
    const aspect = state.size.width / Math.max(1, state.size.height);
    const z = 8 / Math.min(1, Math.pow(aspect, 0.85));
    state.camera.position.x += ((reduced ? 0 : state.pointer.x * 0.6) - state.camera.position.x) * k;
    state.camera.position.z += (z - state.camera.position.z) * k;
    state.camera.lookAt(0, 0.5, 0);
  });
  return <group ref={g}>{children}</group>;
}

function Node({
  n,
  colors,
  showLabel,
  onHover,
  active,
}: {
  n: ReturnType<typeof layout>[number];
  colors: typeof PALETTE.light;
  showLabel: boolean;
  onHover: (id: string | null) => void;
  active: boolean;
}) {
  const m = useRef<THREE.Mesh>(null);
  const size = 0.11 + n.value * 0.17;
  const color = n.weak ? colors.gap : n.value > 0.72 ? colors.strong : colors.mid;
  useFrame((_, raw) => {
    if (!m.current) return;
    const t = active ? 1.35 : 1;
    const k = 1 - Math.exp(-10 * Math.min(raw, 0.05));
    m.current.scale.setScalar(m.current.scale.x + (t - m.current.scale.x) * k);
  });
  return (
    <group position={n.pos}>
      <mesh
        ref={m}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(n.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[size, 24, 24]} />
        {n.weak ? (
          <meshStandardMaterial color={color} wireframe />
        ) : (
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
        )}
      </mesh>
      {/* always mounted; visibility via opacity avoids React root unmount races */}
      {(
        <Html center distanceFactor={9} position={[0, size + 0.22, 0]} style={{ pointerEvents: "none", opacity: showLabel || active ? 1 : 0, transition: "opacity 200ms" }}>
          <div className="whitespace-nowrap font-mono text-[11px] text-foreground">
            {n.label}
            <span className="ml-1 text-muted-foreground" style={{ opacity: active ? 1 : 0 }}>{n.display ?? Math.round(n.value * 100)}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ nodes, groups, destination, variant, reduced }: SkillSpaceProps & { reduced: boolean }) {
  const dark = useIsDark();
  const c = dark ? PALETTE.dark : PALETTE.light;
  const placed = useMemo(() => layout(nodes, groups), [nodes, groups]);
  const [hover, setHover] = useState<string | null>(null);
  const dest = new THREE.Vector3(0, 2.4, -2.2);

  return (
    <Rig reduced={reduced}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <pointLight position={[-4, -2, 3]} intensity={0.6} color={c.accent} />

      {/* student */}
      <mesh>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color={c.ink} flatShading roughness={0.4} />
      </mesh>

      {/* orbit ring */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[2.2, 2.215, 96]} />
        <meshBasicMaterial color={c.line} side={THREE.DoubleSide} />
      </mesh>

      {placed.map((n) => (
        <Line
          key={`l-${n.id}`}
          points={[[0, 0, 0], n.pos.toArray()]}
          color={hover === n.id ? c.accent : c.line}
          lineWidth={hover === n.id ? 1.6 : 0.8}
          dashed={!!n.weak}
          dashSize={0.08}
          gapSize={0.08}
        />
      ))}
      {placed.map((n) => (
        <Node
          key={n.id}
          n={n}
          colors={c}
          showLabel={variant === "data"}
          onHover={setHover}
          active={hover === n.id}
        />
      ))}

      {destination && (
        <>
          <Line points={[[0, 0, 0], [0.8, 1.6, -1], dest.toArray()]} color={c.accent} lineWidth={1.2} dashed dashSize={0.12} gapSize={0.1} />
          <mesh position={dest}>
            <octahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color={c.accent} roughness={0.3} />
          </mesh>
          <Html center position={[dest.x, dest.y + 0.5, dest.z]} distanceFactor={9} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-primary">{destination}</div>
          </Html>
        </>
      )}
    </Rig>
  );
}

export default function SkillSpace(props: SkillSpaceProps) {
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);
  const nodes = mobile ? props.nodes.filter((_, i) => i % 2 === 0 || props.nodes.length < 10) : props.nodes;
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 1.6, 7.4], fov: 42 }}
      gl={{ antialias: !mobile, alpha: true }}
      frameloop={reduced ? "demand" : "always"}
    >
      <Scene {...props} nodes={nodes} reduced={reduced} />
    </Canvas>
  );
}
